from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.gift import GiftTheme

DEFAULT_THEMES = [
    {
        "id": "theme-romantic-blush",
        "name": "Romantic Blush",
        "description": "Soft rose gold, delicate floating hearts, and elegant calligraphy for love letters and anniversaries.",
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
        "id": "theme-midnight-stars",
        "name": "Midnight Stars",
        "description": "Deep cosmic blue, glowing stardust particles, and dreamlike animations for special memories.",
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
        "id": "theme-birthday-glow",
        "name": "Birthday Glow",
        "description": "Vibrant confetti, celebratory sparkle, and warm festive vibes for unforgettable birthdays.",
        "configuration_json": {
            "primaryColor": "#f59e0b",
            "secondaryColor": "#ef4444",
            "backgroundColor": "#180e05",
            "textColor": "#fffbeb",
            "fontHeading": "Playfair Display",
            "fontBody": "Plus Jakarta Sans",
            "particles": "confetti"
        },
        "preview_image": "/assets/themes/birthday-glow.jpg",
        "is_active": True
    },
    {
        "id": "theme-vintage-parchment",
        "name": "Vintage Parchment",
        "description": "Classic warm paper textures, antique typography, and nostalgic vibes for timeless friendship gifts.",
        "configuration_json": {
            "primaryColor": "#d97706",
            "secondaryColor": "#b45309",
            "backgroundColor": "#1c1917",
            "textColor": "#fef3c7",
            "fontHeading": "Playfair Display",
            "fontBody": "Plus Jakarta Sans",
            "particles": "dust"
        },
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
