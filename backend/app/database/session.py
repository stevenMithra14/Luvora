import logging
import os
import re
from typing import Generator, Tuple, Dict, Any, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("luvora.database")

# Fetch DATABASE_URL from environment variable with SQLite fallback
raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./luvora_dev.db").strip()

# Fix Heroku/Render/Supabase postgres:// scheme compatibility for SQLAlchemy 2.0
if raw_db_url.startswith("postgres://"):
    DATABASE_URL = raw_db_url.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = raw_db_url

# Detect driver/dialect
is_sqlite = DATABASE_URL.startswith("sqlite")
is_postgres = DATABASE_URL.startswith("postgres")

# Read pool configuration from environment variables with production-ready defaults
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "300"))  # 5 minutes to prevent NAT / pooler timeout drops
DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))

if is_sqlite:
    connect_args = {"check_same_thread": False}
    engine_kwargs = {
        "connect_args": connect_args,
        "pool_pre_ping": True,
        "echo": False
    }
else:
    # PostgreSQL / Supabase
    connect_args = {
        "connect_timeout": DB_CONNECT_TIMEOUT,
        "sslmode": os.getenv("DB_SSLMODE", "require"),
        "application_name": "luvora_api"
    }
    engine_kwargs = {
        "connect_args": connect_args,
        "pool_size": DB_POOL_SIZE,
        "max_overflow": DB_MAX_OVERFLOW,
        "pool_recycle": DB_POOL_RECYCLE,
        "pool_timeout": DB_POOL_TIMEOUT,
        "pool_pre_ping": True,  # Automatically drops and re-establishes stale connections
        "echo": False
    }

engine = create_engine(DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_safe_db_diagnostics() -> Dict[str, Any]:
    """
    Returns non-sensitive database diagnostic info for logging and health checks.
    STRICT SECURITY RULE: Never returns or logs the raw database password.
    """
    try:
        url_obj = make_url(DATABASE_URL)
        host = url_obj.host or "local"
        port = url_obj.port
        dialect = url_obj.get_backend_name()
        driver = url_obj.get_driver_name()
        database = url_obj.database
        username = url_obj.username or ""

        # Supabase specific inspection
        is_supabase_pooler = "pooler.supabase.com" in host
        is_supabase_direct = "supabase.co" in host and not is_supabase_pooler

        # Extract pooler region if present, e.g. aws-0-ap-northeast-2.pooler.supabase.com -> ap-northeast-2
        detected_region = None
        if is_supabase_pooler:
            match = re.search(r"aws-\d+-([a-z0-9\-]+)\.pooler\.supabase\.com", host)
            if match:
                detected_region = match.group(1)

        # Supabase pooler username format: postgres.<project-ref>
        has_tenant_prefix = username.startswith("postgres.")
        tenant_ref = username.split("postgres.", 1)[1] if has_tenant_prefix else None

        # Direct Supabase (db.<ref>.supabase.co) is IPv6-only on free tier, which breaks on Render!
        render_ipv4_safe = is_supabase_pooler or is_sqlite

        return {
            "dialect": dialect,
            "driver": driver,
            "host": host,
            "port": port,
            "database": database,
            "username_preview": f"postgres.{tenant_ref[:4]}...{tenant_ref[-4:]}" if tenant_ref and len(tenant_ref) > 8 else (username or "none"),
            "has_tenant_ref": has_tenant_prefix,
            "tenant_ref": tenant_ref,
            "password_configured": bool(url_obj.password),
            "is_supabase_pooler": is_supabase_pooler,
            "pooler_region": detected_region,
            "is_supabase_direct": is_supabase_direct,
            "render_ipv4_safe": render_ipv4_safe,
            "pool_recycle_seconds": DB_POOL_RECYCLE,
            "pool_pre_ping": True,
            "connect_timeout_seconds": DB_CONNECT_TIMEOUT
        }
    except Exception as e:
        logger.warning(f"Could not parse database diagnostics: {e}")
        return {
            "error": "Failed to parse database configuration safely",
            "is_sqlite": is_sqlite
        }


def check_database_connection(timeout_seconds: float = 5.0) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Executes a test query to verify live database connectivity.
    Returns (is_connected, message, diagnostics).
    """
    diag = get_safe_db_diagnostics()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Database connection operational", diag
    except Exception as exc:
        err_str = str(exc)
        logger.error(f"Database connectivity check failed: {err_str}", exc_info=True)

        # Analyze common Supabase failure patterns for clear administrative guidance
        if "tenant/user" in err_str and "not found" in err_str:
            reason = (
                "Supabase Pooler error: tenant/user not found. "
                "The pooler hostname region does not match your project's region, "
                "or the project reference in the username is incorrect."
            )
        elif "password authentication failed" in err_str:
            reason = "Database authentication failed: incorrect password in DATABASE_URL."
        elif "could not translate host name" in err_str or "nodename nor servname provided" in err_str:
            reason = "Database hostname cannot be resolved."
        elif "timeout" in err_str.lower() or "timed out" in err_str.lower():
            reason = "Database connection timed out. Ensure pooler port 5432 and SSL mode are used."
        elif "Network is unreachable" in err_str or "IPv6" in err_str:
            reason = (
                "Render IPv6 restriction: Direct Supabase hostname is IPv6-only on free tier. "
                "Use the Supabase Session Pooler (aws-0-[REGION].pooler.supabase.com:5432)."
            )
        else:
            reason = "Database service unreachable."

        return False, reason, diag


def sanitize_database_error(exc: Optional[Exception] = None) -> str:
    """
    Translates raw database/connection errors into user-friendly message,
    preventing any leak of internal IPs, hostnames, SQL statements, or tenant credentials.
    """
    return "We couldn't publish your gift right now. Your saved work is safe. Please try again."


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Dependency yielding a SQLAlchemy database session.
    Automatically handles transaction rollback on error and closes connection on exit.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as exc:
        logger.error(f"Rolling back active session due to exception: {exc}")
        db.rollback()
        raise
    finally:
        db.close()
