import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Fetch DATABASE_URL from environment variable with SQLite fallback
raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./luvora_dev.db")

# Fix Heroku/Render/Supabase postgres:// scheme compatibility for SQLAlchemy 2.0
if raw_db_url.startswith("postgres://"):
    DATABASE_URL = raw_db_url.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = raw_db_url

# Configure engine connect_args and pooling
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Automatically reconnect dropped/stale database connections
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Dependency yielding a SQLAlchemy database session.
    Automatically handles transaction rollback on error and closes connection on exit.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
