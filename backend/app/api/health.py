from fastapi import APIRouter
from app.database import check_database_connection

router = APIRouter()

@router.get("/health")
def health_check():
    is_connected, message, diagnostics = check_database_connection()
    return {
        "status": "ok" if is_connected else "degraded",
        "service": "Luvora API",
        "database": {
            "connected": is_connected,
            "message": message,
            "dialect": diagnostics.get("dialect"),
            "host": diagnostics.get("host"),
            "port": diagnostics.get("port"),
            "is_supabase_pooler": diagnostics.get("is_supabase_pooler"),
            "pooler_region": diagnostics.get("pooler_region"),
            "render_ipv4_safe": diagnostics.get("render_ipv4_safe")
        }
    }
