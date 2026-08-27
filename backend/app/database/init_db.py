from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.gift import GiftTheme

DEFAULT_THEMES = [
    {
        "id": "theme-romantic",
        "name": "Romantic Blush",
        "description": "Soft rose gold, crimson accents, serif typography, and floating heart feelings.",
        "configuration_json": {
            "primaryColor": "#ec4899",
            "secondaryColor": "#f43f5e",
            "backgroundColor": "#0f0913",
            "textColor": "#fdf2f8",
            "fontHeading": "Playfair Display",
            "fontBody": "Plus Jakarta Sans",
            "particles": "hearts"
        },
        "preview_image": "/assets/themes/romantic-blush.jpg",
        "is_active": True
    },
    {
        "id": "theme-midnight",
        "name": "Midnight Stars",
        "description": "Deep cosmic indigo, glowing violet stardust, and dreamlike atmosphere.",
        "configuration_json": {
            "primaryColor": "#8b5cf6",
            "secondaryColor": "#6366f1",
            "backgroundColor": "#090d16",
            "textColor": "#f1f5f9",
            "fontHeading": "Playfair Display",
            "fontBody": "Plus Jakarta Sans",
            "particles": "stars"
        },
        "preview_image": "/assets/themes/midnight-stars.jpg",
        "is_active": True
    },
    {
        "id": "theme-sunset",
        "name": "Sunset Glow",
        "description": "Warm amber, golden coral hues, and elegant nostalgic twilight vibes.",
        "configuration_json": {
            "primaryColor": "#f59e0b",
            "secondaryColor": "#ef4444",
            "backgroundColor": "#180e05",
            "textColor": "#fffbeb",
            "fontHeading": "Playfair Display",
            "fontBody": "Plus Jakarta Sans",
            "particles": "sun"
        },
        "preview_image": "/assets/themes/sunset-glow.jpg",
        "is_active": True
    },
    {
        "id": "theme-dreamy",
        "name": "Dreamy Lavender",
        "description": "Soft pastel purple, ethereal cyan highlights, and gentle floating rhythm.",
        "configuration_json": {
            "primaryColor": "#c084fc",
            "secondaryColor": "#e879f9",
            "backgroundColor": "#14091f",
            "textColor": "#faf5ff",
            "fontHeading": "Playfair Display",
            "fontBody": "Plus Jakarta Sans",
            "particles": "sparkles"
        },
        "preview_image": "/assets/themes/dreamy-lavender.jpg",
        "is_active": True
    },
    {
        "id": "theme-minimal",
        "name": "Minimal Obsidian",
        "description": "Sleek dark monochrome, emerald accents, and clean modern lines.",
        "configuration_json": {
            "primaryColor": "#10b981",
            "secondaryColor": "#059669",
            "backgroundColor": "#090d16",
            "textColor": "#f8fafc",
            "fontHeading": "Plus Jakarta Sans",
            "fontBody": "Plus Jakarta Sans",
            "particles": "none"
        },
        "preview_image": "/assets/themes/minimal-obsidian.jpg",
        "is_active": True
    },
    {
        "id": "theme-celebration",
        "name": "Party Celebration",
        "description": "Vibrant celebratory sparkles, festive magenta, and joyful energy.",
        "configuration_json": {
            "primaryColor": "#f43f5e",
            "secondaryColor": "#ec4899",
            "backgroundColor": "#190914",
            "textColor": "#fff1f2",
            "fontHeading": "Playfair Display",
            "fontBody": "Plus Jakarta Sans",
            "particles": "confetti"
        },
        "preview_image": "/assets/themes/party-celebration.jpg",
        "is_active": True
    },
    {
        "id": "theme-romantic-blush",
        "name": "Romantic Blush (Legacy)",
        "description": "Soft rose gold, delicate floating hearts, and elegant calligraphy.",
        "configuration_json": {"primaryColor": "#ec4899"},
        "preview_image": "/assets/themes/romantic-blush.jpg",
        "is_active": True
    },
    {
        "id": "theme-midnight-stars",
        "name": "Midnight Stars (Legacy)",
        "description": "Deep cosmic blue, glowing stardust particles.",
        "configuration_json": {"primaryColor": "#8b5cf6"},
        "preview_image": "/assets/themes/midnight-stars.jpg",
        "is_active": True
    },
    {
        "id": "theme-birthday-glow",
        "name": "Birthday Glow (Legacy)",
        "description": "Vibrant confetti, celebratory sparkle.",
        "configuration_json": {"primaryColor": "#f59e0b"},
        "preview_image": "/assets/themes/birthday-glow.jpg",
        "is_active": True
    },
    {
        "id": "theme-vintage-parchment",
        "name": "Vintage Parchment (Legacy)",
        "description": "Classic warm paper textures.",
        "configuration_json": {"primaryColor": "#d97706"},
        "preview_image": "/assets/themes/vintage-parchment.jpg",
        "is_active": True
    }
]

def init_db(db: Session = None):
    """
    Creates database tables and seeds default GiftThemes.
    """
    # Create all tables defined in Base models
    Base.metadata.create_all(bind=engine)

    # Migrate missing columns if table already exists
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "gifts" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("gifts")]
            with engine.connect() as conn:
                if "password_hint" not in columns:
                    conn.execute(text("ALTER TABLE gifts ADD COLUMN password_hint TEXT;"))
                    conn.commit()
                if "password_enabled" not in columns:
                    conn.execute(text("ALTER TABLE gifts ADD COLUMN password_enabled BOOLEAN DEFAULT FALSE;"))
                    conn.commit()
                if "password_hash" not in columns:
                    conn.execute(text("ALTER TABLE gifts ADD COLUMN password_hash VARCHAR;"))
                    conn.commit()
    except Exception as err:
        print(f"Migration note: {err}")
    
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
        
    try:
        # Seed default themes if not existing
        for theme_data in DEFAULT_THEMES:
            existing = db.query(GiftTheme).filter(GiftTheme.id == theme_data["id"]).first()
            if not existing:
                theme = GiftTheme(**theme_data)
                db.add(theme)
        db.commit()
        print("Database initialized successfully with default themes.")
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
        raise e
    finally:
        if close_db:
            db.close()

if __name__ == "__main__":
    init_db()
