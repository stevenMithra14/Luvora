import hmac
import logging
import secrets
import time
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db, sanitize_database_error
from app.models.gift import Gift, GiftPhoto, GiftSection, GiftInteractive, GiftGoodie, GiftTheme
from app.schemas.gift import (
    GiftCreate,
    GiftUpdate,
    PublicGiftResponse,
    EditGiftResponse,
    VerifyPasswordRequest,
    GiftGoodieCreate,
    GiftGoodieUpdate,
    GiftGoodieResponse,
    GiftGoodieReorderItem
)
from app.utils.security import (
    hash_password,
    verify_password,
    generate_edit_token,
    generate_access_token,
    verify_access_token
)

logger = logging.getLogger("luvora.gifts")

router = APIRouter(tags=["Gifts"])

# Rate limiter tracking failed password/token attempts per (IP, action)
FAILED_ATTEMPTS: Dict[str, tuple[int, float]] = {}

# Whitelist of allowed interactive and game types for backend security validation
ALLOWED_INTERACTIVE_TYPES = {
    'quiz', 'birthday_quiz', 'love_quiz', 'know_me_quiz', 'best_friend_quiz', 'our_story_quiz',
    'memory_match', 'surprise_wheel', 'would_you_rather', 'this_or_that', 'who_said_it',
    'guess_age', 'mystery_box', 'countdown', 'timeline', 'secret_message', 'surprise_button',
    'slideshow', 'final_message', 'photo_memories', 'video_memories', 'mixed_memories',
    'cake', 'love_lock', 'gift_box', 'candle', 'spotify_music', 'cake_box_config'
}

# Whitelist of allowed digital goodie types
ALLOWED_GOODIE_TYPES = {
    'note', 'photo', 'video', 'song', 'voice', 'drawing', 'place', 'coupon', 'custom_card', 'surprise'
}

SAFE_PUBLISH_ERROR_MESSAGE = "We couldn't publish your gift right now. Your saved work is safe. Please try again."

def generate_unpredictable_public_id() -> str:
    """Generates a random 12-char nanoid-style string for public gift URLs."""
    return secrets.token_urlsafe(9).replace("_", "a").replace("-", "b")[:12]

def secure_token_compare(val1: str, val2: str) -> bool:
    """Uses constant-time comparison to prevent timing attacks on tokens."""
    if not val1 or not val2:
        return False
    return hmac.compare_digest(val1.encode('utf-8'), val2.encode('utf-8'))

@router.post("/gifts", response_model=EditGiftResponse, status_code=status.HTTP_201_CREATED)
def create_published_gift(gift_in: GiftCreate, db: Session = Depends(get_db)):
    """
    Creates and publishes a new digital gift with games, memories, and digital goodies.
    Wrapped in an atomic transaction: rolls back completely on any failure to prevent duplicate
    or partially published gifts.
    """
    try:
        # Generate collision-free public_id and edit_token
        public_id = generate_unpredictable_public_id()
        for _ in range(5):
            if not db.query(Gift.id).filter(Gift.public_id == public_id).first():
                break
            public_id = generate_unpredictable_public_id()

        edit_token = generate_edit_token()
        for _ in range(5):
            if not db.query(Gift.id).filter(Gift.edit_token == edit_token).first():
                break
            edit_token = generate_edit_token()

        hashed_pwd = hash_password(gift_in.password) if gift_in.password else None
        has_pwd = gift_in.password_enabled if gift_in.password_enabled is not None else bool(hashed_pwd)

        # Ensure theme_id exists in gift_themes table to prevent ForeignKeyViolation
        target_theme_id = gift_in.theme_id or "theme-romantic"
        existing_theme = db.query(GiftTheme).filter(GiftTheme.id == target_theme_id).first()
        if not existing_theme:
            new_theme = GiftTheme(
                id=target_theme_id,
                name=target_theme_id.replace("theme-", "").replace("-", " ").title(),
                description="Auto-created theme",
                configuration_json={},
                is_active=True
            )
            db.add(new_theme)
            db.flush()

        gift = Gift(
            public_id=public_id,
            edit_token=edit_token,
            occasion_type=gift_in.occasion_type,
            recipient_name=gift_in.recipient_name,
            recipient_date=gift_in.recipient_date,
            title=gift_in.title,
            message=gift_in.message,
            theme_id=target_theme_id,
            music_url=gift_in.music_url,
            password_hash=hashed_pwd,
            password_hint=gift_in.password_hint,
            password_enabled=has_pwd,
            is_published=gift_in.is_published
        )
        db.add(gift)
        db.flush()

        photos_to_save = []
        for p in gift_in.photos:
            if p.file_url and not str(p.file_url).startswith("blob:"):
                photos_to_save.append(p)

        if not photos_to_save:
            # Fallback: check if photo_memories interactive has photos
            for inter in gift_in.interactives:
                if inter.interactive_type == "photo_memories":
                    mems = (inter.configuration_json or {}).get("memories", [])
                    for idx, m in enumerate(mems):
                        if isinstance(m, dict) and m.get("fileUrl") and not str(m.get("fileUrl")).startswith("blob:"):
                            photos_to_save.append(
                                GiftPhoto(
                                    gift_id=gift.id,
                                    file_url=m["fileUrl"],
                                    caption=m.get("caption") or m.get("title") or "",
                                    display_order=m.get("displayOrder", idx)
                                )
                            )

        for idx, photo_data in enumerate(photos_to_save):
            if isinstance(photo_data, GiftPhoto):
                db.add(photo_data)
            else:
                photo = GiftPhoto(
                    gift_id=gift.id,
                    file_url=photo_data.file_url,
                    caption=photo_data.caption,
                    display_order=photo_data.display_order or idx
                )
                db.add(photo)

        for idx, section_data in enumerate(gift_in.sections):
            section = GiftSection(
                gift_id=gift.id,
                section_type=section_data.section_type,
                title=section_data.title,
                content=section_data.content,
                display_order=section_data.display_order or idx,
                is_enabled=section_data.is_enabled
            )
            db.add(section)

        has_photo_memories = any(i.interactive_type == "photo_memories" for i in gift_in.interactives)
        for idx, interactive_data in enumerate(gift_in.interactives):
            if interactive_data.interactive_type not in ALLOWED_INTERACTIVE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid interactive/game type: {interactive_data.interactive_type}"
                )
            interactive = GiftInteractive(
                gift_id=gift.id,
                interactive_type=interactive_data.interactive_type,
                configuration_json=interactive_data.configuration_json,
                display_order=interactive_data.display_order or idx,
                is_enabled=interactive_data.is_enabled
            )
            db.add(interactive)

        # If photos were provided but interactives was completely empty, auto-generate photo_memories interactive
        if not gift_in.interactives and photos_to_save:
            memories_list = [
                {
                    "id": f"mem-{idx}",
                    "type": "photo",
                    "fileUrl": p.file_url if isinstance(p, GiftPhoto) else p.file_url,
                    "title": (p.caption if isinstance(p, GiftPhoto) else p.caption) or "Photo Memory",
                    "caption": (p.caption if isinstance(p, GiftPhoto) else p.caption) or "",
                    "date": "",
                    "frameStyle": "polaroid",
                    "displayOrder": idx
                }
                for idx, p in enumerate(photos_to_save)
            ]
            auto_mem_interactive = GiftInteractive(
                gift_id=gift.id,
                interactive_type="photo_memories",
                configuration_json={"memories": memories_list},
                display_order=0,
                is_enabled=True
            )
            db.add(auto_mem_interactive)

        for idx, goodie_data in enumerate(gift_in.goodies):
            if goodie_data.goodie_type not in ALLOWED_GOODIE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid goodie type: {goodie_data.goodie_type}"
                )
            clean_goodie_media = goodie_data.media_url
            if clean_goodie_media and str(clean_goodie_media).startswith("blob:"):
                clean_goodie_media = None
            goodie = GiftGoodie(
                gift_id=gift.id,
                goodie_type=goodie_data.goodie_type,
                title=goodie_data.title,
                description=goodie_data.description,
                content=goodie_data.content,
                media_url=clean_goodie_media,
                configuration_json=goodie_data.configuration_json,
                display_order=goodie_data.display_order or idx,
                is_enabled=goodie_data.is_enabled
            )
            db.add(goodie)

        db.commit()
        db.refresh(gift)
        return gift

    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as sqle:
        db.rollback()
        logger.error(f"Database error during gift publishing: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SAFE_PUBLISH_ERROR_MESSAGE
        )
    except Exception as exc:
        db.rollback()
        logger.error(f"Unexpected error during gift publishing: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SAFE_PUBLISH_ERROR_MESSAGE
        )


@router.get("/gifts/public/{public_id}", response_model=PublicGiftResponse)
def get_public_gift(public_id: str, db: Session = Depends(get_db)):
    """Retrieves public gift details for recipient viewing. Strips content if locked."""
    try:
        gift = db.query(Gift).filter(Gift.public_id == public_id).first()
        if not gift:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gift not found or URL expired."
            )

        response = PublicGiftResponse.model_validate(gift)

        if gift.password_enabled:
            response.is_locked = True
            response.title = "Protected Gift"
            response.message = None
            response.music_url = None
            response.photos = []
            response.sections = []
            response.interactives = []
            response.goodies = []
        else:
            response.is_locked = False

        return response
    except HTTPException:
        raise
    except SQLAlchemyError as sqle:
        logger.error(f"Database error loading public gift {public_id}: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load gift at this time. Please try again in a moment."
        )


@router.post("/gifts/public/{public_id}/verify-password")
def verify_public_gift_password(
    public_id: str,
    req: VerifyPasswordRequest,
    http_req: Request,
    db: Session = Depends(get_db)
):
    """Verifies gift password with rate limiting."""
    client_ip = http_req.client.host if http_req.client else "unknown"
    rate_key = f"{client_ip}:{public_id}"
    now = time.time()

    if rate_key in FAILED_ATTEMPTS:
        count, lockout_until = FAILED_ATTEMPTS[rate_key]
        if now < lockout_until:
            wait_secs = int(lockout_until - now)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed password attempts. Please wait {wait_secs} seconds before trying again."
            )
        elif now >= lockout_until and count >= 5:
            FAILED_ATTEMPTS[rate_key] = (0, 0.0)

    try:
        gift = db.query(Gift).filter(Gift.public_id == public_id).first()
        if not gift:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gift not found."
            )

        if not gift.password_enabled or not gift.password_hash:
            token = generate_access_token(public_id)
            return {"verified": True, "access_token": token}

        if not verify_password(req.password, gift.password_hash):
            current_count = FAILED_ATTEMPTS.get(rate_key, (0, 0.0))[0] + 1
            if current_count >= 5:
                lockout_until = now + 60.0
                FAILED_ATTEMPTS[rate_key] = (current_count, lockout_until)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed password attempts. Please wait 1 minute before trying again."
                )
            else:
                FAILED_ATTEMPTS[rate_key] = (current_count, 0.0)
                remaining = 5 - current_count
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Incorrect gift password. {remaining} attempt(s) remaining."
                )

        if rate_key in FAILED_ATTEMPTS:
            del FAILED_ATTEMPTS[rate_key]

        token = generate_access_token(public_id)
        return {"verified": True, "access_token": token}
    except HTTPException:
        raise
    except SQLAlchemyError as sqle:
        logger.error(f"Database error verifying password for {public_id}: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify password at this time. Please try again."
        )


@router.post("/gifts/public/{public_id}/unlocked-content", response_model=PublicGiftResponse)
def get_unlocked_gift_content(
    public_id: str,
    access_token: str,
    db: Session = Depends(get_db)
):
    """Retrieves complete unlocked gift content using temporary access_token."""
    if not verify_access_token(access_token, public_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token. Please enter the password again."
        )

    try:
        gift = db.query(Gift).filter(Gift.public_id == public_id).first()
        if not gift:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gift not found."
            )

        response = PublicGiftResponse.model_validate(gift)
        response.is_locked = False
        return response
    except HTTPException:
        raise
    except SQLAlchemyError as sqle:
        logger.error(f"Database error retrieving unlocked gift content for {public_id}: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load unlocked gift at this time. Please try again."
        )


@router.get("/gifts/edit/{edit_token}", response_model=EditGiftResponse)
def get_gift_by_edit_token(edit_token: str, db: Session = Depends(get_db)):
    """Retrieves complete gift payload for author editing using constant-time token validation."""
    try:
        gift = db.query(Gift).filter(Gift.edit_token == edit_token).first()
        if not gift or not secure_token_compare(gift.edit_token, edit_token):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid edit token or gift not found."
            )
        return gift
    except HTTPException:
        raise
    except SQLAlchemyError as sqle:
        logger.error(f"Database error retrieving gift for edit token: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load gift for editing at this time. Please try again."
        )


@router.put("/gifts/edit/{edit_token}", response_model=EditGiftResponse)
def update_gift_by_edit_token(
    edit_token: str,
    gift_update: GiftUpdate,
    db: Session = Depends(get_db)
):
    """Updates an existing published gift using the secret edit_token."""
    try:
        gift = db.query(Gift).filter(Gift.edit_token == edit_token).first()
        if not gift or not secure_token_compare(gift.edit_token, edit_token):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid edit token or gift not found."
            )

        if gift_update.recipient_name is not None:
            gift.recipient_name = gift_update.recipient_name
        if gift_update.recipient_date is not None:
            gift.recipient_date = gift_update.recipient_date
        if gift_update.title is not None:
            gift.title = gift_update.title
        if gift_update.message is not None:
            gift.message = gift_update.message
        if gift_update.occasion_type is not None:
            gift.occasion_type = gift_update.occasion_type
        if gift_update.theme_id is not None:
            existing_theme = db.query(GiftTheme).filter(GiftTheme.id == gift_update.theme_id).first()
            if not existing_theme:
                new_theme = GiftTheme(
                    id=gift_update.theme_id,
                    name=gift_update.theme_id.replace("theme-", "").replace("-", " ").title(),
                    description="Auto-created theme",
                    configuration_json={},
                    is_active=True
                )
                db.add(new_theme)
                db.flush()
            gift.theme_id = gift_update.theme_id
        if gift_update.music_url is not None:
            gift.music_url = gift_update.music_url
        if gift_update.is_published is not None:
            gift.is_published = gift_update.is_published

        if gift_update.password:
            gift.password_hash = hash_password(gift_update.password)
            gift.password_enabled = True
        elif gift_update.password_enabled is False:
            gift.password_hash = None
            gift.password_enabled = False

        if gift_update.password_hint is not None:
            gift.password_hint = gift_update.password_hint

        if gift_update.photos is not None:
            # Filter out blob: and empty urls
            valid_photos = [p for p in gift_update.photos if p.file_url and not str(p.file_url).startswith("blob:")]
            
            # If no direct photos passed in update, check if incoming photo_memories has memories
            if not valid_photos and gift_update.interactives is not None:
                for inter in gift_update.interactives:
                    if inter.interactive_type == "photo_memories":
                        mems = (inter.configuration_json or {}).get("memories", [])
                        for idx, m in enumerate(mems):
                            if isinstance(m, dict) and m.get("fileUrl") and not str(m.get("fileUrl")).startswith("blob:"):
                                valid_photos.append(
                                    GiftPhotoCreate(
                                        file_url=m["fileUrl"],
                                        caption=m.get("caption") or m.get("title") or "",
                                        display_order=m.get("displayOrder", idx)
                                    )
                                )

            # Only replace photos if we have valid replacement photos.
            # If valid_photos is empty but photos already exist in DB, PRESERVE them.
            # This protects against accidental deletion during theme switching or metadata edits.
            if valid_photos:
                db.query(GiftPhoto).filter(GiftPhoto.gift_id == gift.id).delete()
                for idx, photo_data in enumerate(valid_photos):
                    photo = GiftPhoto(
                        gift_id=gift.id,
                        file_url=photo_data.file_url,
                        caption=photo_data.caption,
                        display_order=photo_data.display_order or idx
                    )
                    db.add(photo)

        if gift_update.sections is not None:
            # Only wipe if incoming sections is non-empty or no sections exist in DB
            existing_sections_count = db.query(GiftSection).filter(GiftSection.gift_id == gift.id).count()
            if len(gift_update.sections) > 0 or existing_sections_count == 0:
                db.query(GiftSection).filter(GiftSection.gift_id == gift.id).delete()
                for idx, section_data in enumerate(gift_update.sections):
                    section = GiftSection(
                        gift_id=gift.id,
                        section_type=section_data.section_type,
                        title=section_data.title,
                        content=section_data.content,
                        display_order=section_data.display_order or idx,
                        is_enabled=section_data.is_enabled
                    )
                    db.add(section)

        if gift_update.interactives is not None:
            # Preserve system interactives (photo_memories, cake_box_config, spotify_music) if omitted in update
            existing_interactives = db.query(GiftInteractive).filter(GiftInteractive.gift_id == gift.id).all()
            existing_by_type = {i.interactive_type: i for i in existing_interactives}
            incoming_types = {i.interactive_type for i in gift_update.interactives}

            if len(gift_update.interactives) > 0 or not existing_interactives:
                db.query(GiftInteractive).filter(GiftInteractive.gift_id == gift.id).delete()
                for idx, interactive_data in enumerate(gift_update.interactives):
                    if interactive_data.interactive_type not in ALLOWED_INTERACTIVE_TYPES:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid interactive/game type: {interactive_data.interactive_type}"
                        )
                    interactive = GiftInteractive(
                        gift_id=gift.id,
                        interactive_type=interactive_data.interactive_type,
                        configuration_json=interactive_data.configuration_json,
                        display_order=interactive_data.display_order or idx,
                        is_enabled=interactive_data.is_enabled
                    )
                    db.add(interactive)

                # Preserve system modules if omitted in incoming update
                system_types = ["photo_memories", "cake_box_config", "spotify_music"]
                for sys_type in system_types:
                    if sys_type not in incoming_types and sys_type in existing_by_type:
                        prev = existing_by_type[sys_type]
                        preserved = GiftInteractive(
                            gift_id=gift.id,
                            interactive_type=prev.interactive_type,
                            configuration_json=prev.configuration_json,
                            display_order=len(gift_update.interactives) + 1,
                            is_enabled=prev.is_enabled
                        )
                        db.add(preserved)

        if gift_update.goodies is not None:
            # Only wipe and replace if incoming goodies is non-empty, or no goodies currently exist in DB.
            # This protects against empty goodies arrays wiping saved goodies during theme switching.
            existing_goodies_count = db.query(GiftGoodie).filter(GiftGoodie.gift_id == gift.id).count()
            if len(gift_update.goodies) > 0 or existing_goodies_count == 0:
                db.query(GiftGoodie).filter(GiftGoodie.gift_id == gift.id).delete()
                for idx, goodie_data in enumerate(gift_update.goodies):
                    if goodie_data.goodie_type not in ALLOWED_GOODIE_TYPES:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid goodie type: {goodie_data.goodie_type}"
                        )
                    clean_media_url = goodie_data.media_url
                    if clean_media_url and str(clean_media_url).startswith("blob:"):
                        clean_media_url = None
                    goodie = GiftGoodie(
                        gift_id=gift.id,
                        goodie_type=goodie_data.goodie_type,
                        title=goodie_data.title,
                        description=goodie_data.description,
                        content=goodie_data.content,
                        media_url=clean_media_url,
                        configuration_json=goodie_data.configuration_json,
                        display_order=goodie_data.display_order or idx,
                        is_enabled=goodie_data.is_enabled
                    )
                    db.add(goodie)

        db.commit()
        db.refresh(gift)
        return gift

    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as sqle:
        db.rollback()
        logger.error(f"Database error during gift update: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SAFE_PUBLISH_ERROR_MESSAGE
        )
    except Exception as exc:
        db.rollback()
        logger.error(f"Unexpected error during gift update: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=SAFE_PUBLISH_ERROR_MESSAGE
        )


# ==========================================
# DIGITAL GOODIES DEDICATED API ENDPOINTS
# ==========================================

@router.post("/gifts/{gift_id}/goodies", response_model=GiftGoodieResponse, status_code=status.HTTP_201_CREATED)
def create_goodie_for_gift(gift_id: str, goodie_in: GiftGoodieCreate, db: Session = Depends(get_db)):
    """Creates a new digital goodie for a gift."""
    try:
        gift = db.query(Gift).filter(Gift.id == gift_id).first()
        if not gift:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gift not found.")

        if goodie_in.goodie_type not in ALLOWED_GOODIE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid goodie type: {goodie_in.goodie_type}"
            )

        goodie = GiftGoodie(
            gift_id=gift.id,
            goodie_type=goodie_in.goodie_type,
            title=goodie_in.title,
            description=goodie_in.description,
            content=goodie_in.content,
            media_url=goodie_in.media_url,
            configuration_json=goodie_in.configuration_json,
            display_order=goodie_in.display_order,
            is_enabled=goodie_in.is_enabled
        )
        db.add(goodie)
        db.commit()
        db.refresh(goodie)
        return goodie
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as sqle:
        db.rollback()
        logger.error(f"Database error creating goodie: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SAFE_PUBLISH_ERROR_MESSAGE
        )


@router.get("/gifts/{gift_id}/goodies", response_model=List[GiftGoodieResponse])
def get_goodies_for_gift(gift_id: str, db: Session = Depends(get_db)):
    """Lists all digital goodies for a gift ordered by display_order."""
    try:
        gift = db.query(Gift).filter(Gift.id == gift_id).first()
        if not gift:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gift not found.")

        return db.query(GiftGoodie).filter(GiftGoodie.gift_id == gift_id).order_by(GiftGoodie.display_order).all()
    except HTTPException:
        raise
    except SQLAlchemyError as sqle:
        logger.error(f"Database error loading goodies: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to load goodies at this time."
        )


@router.put("/goodies/{goodie_id}", response_model=GiftGoodieResponse)
def update_goodie(goodie_id: str, goodie_update: GiftGoodieUpdate, db: Session = Depends(get_db)):
    """Updates an existing digital goodie by ID."""
    try:
        goodie = db.query(GiftGoodie).filter(GiftGoodie.id == goodie_id).first()
        if not goodie:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goodie not found.")

        if goodie_update.goodie_type is not None:
            if goodie_update.goodie_type not in ALLOWED_GOODIE_TYPES:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid goodie type: {goodie_update.goodie_type}"
                )
            goodie.goodie_type = goodie_update.goodie_type

        if goodie_update.title is not None:
            goodie.title = goodie_update.title
        if goodie_update.description is not None:
            goodie.description = goodie_update.description
        if goodie_update.content is not None:
            goodie.content = goodie_update.content
        if goodie_update.media_url is not None:
            goodie.media_url = goodie_update.media_url
        if goodie_update.configuration_json is not None:
            goodie.configuration_json = goodie_update.configuration_json
        if goodie_update.display_order is not None:
            goodie.display_order = goodie_update.display_order
        if goodie_update.is_enabled is not None:
            goodie.is_enabled = goodie_update.is_enabled

        db.commit()
        db.refresh(goodie)
        return goodie
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as sqle:
        db.rollback()
        logger.error(f"Database error updating goodie: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=SAFE_PUBLISH_ERROR_MESSAGE
        )


@router.delete("/goodies/{goodie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goodie(goodie_id: str, db: Session = Depends(get_db)):
    """Deletes a digital goodie by ID."""
    try:
        goodie = db.query(GiftGoodie).filter(GiftGoodie.id == goodie_id).first()
        if not goodie:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goodie not found.")

        db.delete(goodie)
        db.commit()
        return None
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as sqle:
        db.rollback()
        logger.error(f"Database error deleting goodie: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to delete goodie at this time."
        )


@router.put("/gifts/{gift_id}/goodies/reorder", response_model=List[GiftGoodieResponse])
def reorder_goodies_for_gift(gift_id: str, items: List[GiftGoodieReorderItem], db: Session = Depends(get_db)):
    """Bulk updates display_order for goodies in a gift."""
    try:
        gift = db.query(Gift).filter(Gift.id == gift_id).first()
        if not gift:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gift not found.")

        for item in items:
            db.query(GiftGoodie).filter(GiftGoodie.id == item.id, GiftGoodie.gift_id == gift_id).update(
                {"display_order": item.display_order}
            )

        db.commit()
        return db.query(GiftGoodie).filter(GiftGoodie.gift_id == gift_id).order_by(GiftGoodie.display_order).all()
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as sqle:
        db.rollback()
        logger.error(f"Database error reordering goodies: {sqle}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reorder goodies at this time."
        )
