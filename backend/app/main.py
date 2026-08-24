import json
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.database.init_db import init_db

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "Luvora API")
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
SECRET_KEY = os.getenv("SECRET_KEY", "luvora-production-secret-change-this-key")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Production Secret Key validation check
    if not DEBUG and ("change-this-key" in SECRET_KEY or len(SECRET_KEY) < 32):
        print("CRITICAL WARNING: Default or insecure SECRET_KEY detected in production environment!")
        print("Generate a secure secret using: python -c 'import secrets; print(secrets.token_urlsafe(64))'")

    # Initialize DB tables and seed default themes on startup
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Database initialization error on startup: {e}")
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

# Production Error Handler (Hides raw tracebacks in production)
@app.exception_handler(Exception)
async def custom_global_exception_handler(request: Request, exc: Exception):
    if DEBUG:
        raise exc
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Configure CORS
cors_origins_raw = os.getenv("CORS_ORIGINS", '["http://localhost:5173","http://127.0.0.1:5173"]')
try:
    origins = json.loads(cors_origins_raw)
except Exception:
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
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
