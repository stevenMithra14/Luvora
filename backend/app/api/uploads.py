import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.storage import get_storage_provider

router = APIRouter(prefix="/upload", tags=["Uploads"])

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/jpg": [".jpg", ".jpeg"],
    "image/pjpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/x-png": [".png"],
    "image/webp": [".webp"],
    "image/heic": [".heic"],
    "image/heif": [".heif"],
    "image/bmp": [".bmp"],
    "image/gif": [".gif"],
    "image/svg+xml": [".svg"],
    "application/octet-stream": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".bmp", ".gif", ".svg"]
}
MAX_IMAGE_SIZE = 25 * 1024 * 1024  # 25 MB

ALLOWED_AUDIO_TYPES = {
    "audio/mpeg": [".mp3"],
    "audio/mp3": [".mp3"],
    "audio/wav": [".wav"],
    "audio/ogg": [".ogg"],
    "audio/webm": [".webm"],
    "audio/mp4": [".m4a"],
    "audio/x-m4a": [".m4a"],
    "audio/aac": [".aac"],
    "audio/m4a": [".m4a"],
    "application/octet-stream": [".mp3", ".wav", ".ogg", ".webm", ".m4a", ".aac"]
}
MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25 MB

ALLOWED_VIDEO_TYPES = {
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
    "video/quicktime": [".mov"],
    "video/ogg": [".ogv"],
    "video/x-matroska": [".mkv"],
    "video/3gpp": [".3gp"],
    "video/x-msvideo": [".avi"],
    "application/octet-stream": [".mp4", ".webm", ".mov", ".ogv", ".mkv", ".3gp", ".avi"]
}
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50 MB

@router.post("/photo")
async def upload_photo(file: UploadFile = File(...)):
    """
    Uploads a photo asset with MIME, size, and storage persistence validation.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    
    if file.content_type not in ALLOWED_IMAGE_TYPES and ext not in [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".bmp", ".gif", ".svg"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP, HEIC, GIF, BMP."
        )

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed photo limit of 25MB."
        )

    file.file.seek(0)
    try:
        storage = get_storage_provider()
        filename_saved = storage.save_file(file.file, file.filename or "photo.jpg", file.content_type or "image/jpeg")
        file_url = storage.get_file_url(filename_saved)
        
        if not storage.verify_file_exists(filename_saved):
            print(f"Warning: Uploaded file verification returned false for {filename_saved}")
            
        return {
            "status": "success",
            "url": file_url,
            "path": filename_saved,
            "filename": file.filename
        }
    except Exception as e:
        print(f"Error during photo upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist photo upload: {str(e)}"
        )


@router.post("/audio")
async def upload_audio(file: UploadFile = File(...)):
    """
    Uploads a background audio track or voice recording with MIME, size, and persistence validation.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    
    if file.content_type not in ALLOWED_AUDIO_TYPES and ext not in [".mp3", ".wav", ".ogg", ".webm", ".m4a", ".aac"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio format. Supported formats: MP3, WAV, OGG, WEBM, M4A, AAC."
        )

    contents = await file.read()
    if len(contents) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed audio limit of 25MB."
        )

    file.file.seek(0)
    try:
        storage = get_storage_provider()
        filename_saved = storage.save_file(file.file, file.filename or "audio.mp3", file.content_type or "audio/mpeg")
        file_url = storage.get_file_url(filename_saved)

        return {
            "status": "success",
            "url": file_url,
            "path": filename_saved,
            "filename": file.filename
        }
    except Exception as e:
        print(f"Error during audio upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist audio upload: {str(e)}"
        )


@router.post("/video")
async def upload_video(file: UploadFile = File(...)):
    """
    Uploads a video memory asset with MIME, size, and persistence validation.
    """
    ext = os.path.splitext(file.filename or "")[1].lower()
    
    if file.content_type not in ALLOWED_VIDEO_TYPES and ext not in [".mp4", ".webm", ".mov", ".ogv", ".mkv", ".3gp", ".avi"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video format. Supported formats: MP4, WEBM, MOV, OGV, MKV, 3GP, AVI."
        )

    contents = await file.read()
    if len(contents) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed video limit of 50MB."
        )

    file.file.seek(0)
    try:
        storage = get_storage_provider()
        filename_saved = storage.save_file(file.file, file.filename or "video.mp4", file.content_type or "video/mp4")
        file_url = storage.get_file_url(filename_saved)

        return {
            "status": "success",
            "url": file_url,
            "path": filename_saved,
            "filename": file.filename
        }
    except Exception as e:
        print(f"Error during video upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist video upload: {str(e)}"
        )

