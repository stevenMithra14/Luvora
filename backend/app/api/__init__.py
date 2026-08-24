from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.uploads import router as uploads_router
from app.api.gifts import router as gifts_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(uploads_router, tags=["Uploads"])
api_router.include_router(gifts_router, tags=["Gifts"])

__all__ = ["api_router"]
