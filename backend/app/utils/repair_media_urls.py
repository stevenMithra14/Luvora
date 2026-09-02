import json
from sqlalchemy.orm import Session
from app.database import engine
from app.models.gift import Gift, GiftPhoto, GiftGoodie, GiftInteractive

def repair_database_media_urls():
    """
    Audits and repairs database records by removing or fixing invalid temporary blob: URLs
    in gift_photos, gift_goodies, and gift_interactives (photo_memories).
    """
    print("Starting Luvora Database Media Persistence Audit & Repair...", flush=True)
    repaired_photos = 0
    repaired_goodies = 0
    repaired_interactives = 0

    with Session(engine) as db:
        # 1. Audit GiftPhoto table
        photos = db.query(GiftPhoto).all()
        for photo in photos:
            if photo.file_url and photo.file_url.startswith("blob:"):
                print(f"Warning: Found blob URL in GiftPhoto ID={photo.id}, gift_id={photo.gift_id}: {photo.file_url}", flush=True)
                db.delete(photo)
                repaired_photos += 1

        # 2. Audit GiftGoodie table
        goodies = db.query(GiftGoodie).all()
        for goodie in goodies:
            modified = False
            if goodie.media_url and goodie.media_url.startswith("blob:"):
                print(f"Warning: Found blob URL in GiftGoodie ID={goodie.id}: {goodie.media_url}", flush=True)
                goodie.media_url = None
                modified = True

            config = goodie.configuration_json or {}
            for key in ["photoUrl", "videoUrl", "audioUrl", "mediaUrl", "drawingDataUrl"]:
                val = config.get(key)
                if val and isinstance(val, str) and val.startswith("blob:"):
                    print(f"Warning: Found blob URL in GiftGoodie config ID={goodie.id}, key={key}: {val}", flush=True)
                    config[key] = ""
                    modified = True

            if modified:
                goodie.configuration_json = dict(config)
                repaired_goodies += 1

        # 3. Audit GiftInteractive (photo_memories) table
        interactives = db.query(GiftInteractive).filter(GiftInteractive.interactive_type == "photo_memories").all()
        for inter in interactives:
            config = inter.configuration_json or {}
            memories = config.get("memories", [])
            if isinstance(memories, list) and memories:
                new_memories = []
                modified = False
                for mem in memories:
                    if isinstance(mem, dict):
                        file_url = mem.get("fileUrl") or mem.get("videoUrl") or ""
                        if file_url and isinstance(file_url, str) and file_url.startswith("blob:"):
                            print(f"Warning: Found blob URL in Memory item ID={mem.get('id')}: {file_url}", flush=True)
                            modified = True
                            continue
                    new_memories.append(mem)

                if modified:
                    config["memories"] = new_memories
                    inter.configuration_json = dict(config)
                    repaired_interactives += 1

        db.commit()

    print("Database Audit & Repair Complete:", flush=True)
    print(f" - Repaired GiftPhotos: {repaired_photos}", flush=True)
    print(f" - Repaired GiftGoodies: {repaired_goodies}", flush=True)
    print(f" - Repaired GiftInteractives: {repaired_interactives}", flush=True)

if __name__ == "__main__":
    repair_database_media_urls()
