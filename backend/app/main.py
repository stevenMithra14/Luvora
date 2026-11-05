import json
import logging
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.database import init_db
from app.database.session import check_database_connection, get_safe_db_diagnostics

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("luvora")

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "Luvora API")
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
SECRET_KEY = os.getenv("SECRET_KEY", "luvora-production-secret-change-this-key")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Production Secret Key validation check
    if not DEBUG and ("change-this-key" in SECRET_KEY or len(SECRET_KEY) < 32):
        logger.warning("CRITICAL WARNING: Default or insecure SECRET_KEY detected in production environment!")
        logger.warning("Generate a secure secret using: python -c 'import secrets; print(secrets.token_urlsafe(64))'")

    # Safe database configuration diagnostics check
    db_diag = get_safe_db_diagnostics()
    logger.info(
        f"Database configuration: dialect={db_diag.get('dialect')}, host={db_diag.get('host')}, "
        f"port={db_diag.get('port')}, is_pooler={db_diag.get('is_supabase_pooler')}, "
        f"region={db_diag.get('pooler_region')}, render_ipv4_safe={db_diag.get('render_ipv4_safe')}"
    )

    # Verify live database connectivity on startup
    is_connected, db_msg, _ = check_database_connection()
    if is_connected:
        logger.info(f"Database connectivity check passed: {db_msg}")
    else:
        logger.error(f"Database connectivity check failed on startup: {db_msg}")

    # Initialize DB tables and seed default themes on startup
    try:
        init_db()
        logger.info("Database schema and default themes initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization error on startup: {e}", exc_info=True)

    yield

app = FastAPI(
    title=APP_NAME,
    description="Backend API for Luvora - Digital Gift Creation Platform",
    version="1.0.0",
    debug=DEBUG,
    lifespan=lifespan
)

# Production Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self' http: https: data: blob: 'unsafe-inline';"
    return response

# User-Facing Error Handler: Never leaks credentials, hostnames, SQL statements or raw tracebacks
@app.exception_handler(Exception)
async def custom_global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)

    path = request.url.path.lower()
    is_publishing_or_db_error = (
        "gift" in path
        or "upload" in path
        or "goodie" in path
        or "operationalerror" in str(type(exc)).lower()
        or "database" in str(type(exc)).lower()
        or "sqlalchemy" in str(type(exc)).lower()
    )

    user_message = (
        "We couldn't publish your gift right now. Your saved work is safe. Please try again."
        if is_publishing_or_db_error
        else "Something went wrong on our end. Please try again in a moment."
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": user_message},
        headers={"Access-Control-Allow-Origin": "*"}
    )

# Configure CORS
cors_origins_raw = os.getenv("CORS_ORIGINS", '["*"]')
try:
    origins = json.loads(cors_origins_raw)
except Exception:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True if "*" not in origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory
upload_dir = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# Include API Router
from app.api import api_router
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to Luvora API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
