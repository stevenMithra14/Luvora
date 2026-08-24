import os
import shutil
import uuid
from abc import ABC, abstractmethod
from typing import BinaryIO

class BaseStorageProvider(ABC):
    """
    Abstract Storage Provider Interface for Luvora asset storage (images, audio, etc.).
    Allows seamless switching between local disk, Cloudinary, Supabase, or AWS S3.
    """
    
    @abstractmethod
    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        """
        Saves file data and returns accessible URL or file identifier.
        """
        pass

    @abstractmethod
    def delete_file(self, file_identifier: str) -> bool:
        """
        Deletes file by its identifier or path.
        """
        pass

    @abstractmethod
    def get_file_url(self, file_identifier: str) -> str:
        """
        Returns full public URL for the given file identifier.
        """
        pass


class LocalStorageProvider(BaseStorageProvider):
    """
    Local filesystem storage provider for development environment.
    Stores files under the `uploads/` directory.
    Includes path traversal sanitization.
    """
    def __init__(self, upload_dir: str = "uploads", base_url: str = "/uploads"):
        self.upload_dir = upload_dir
        self.base_url = base_url
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        # Sanitize filename to prevent path traversal attacks
        safe_filename = os.path.basename(filename or "file")
        ext = os.path.splitext(safe_filename)[1].lower()
        if not ext:
            ext = ".jpg" if "image" in content_type else ".mp3"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        destination = os.path.join(self.upload_dir, unique_name)
        
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(file_data, buffer)
            
        return unique_name

    def delete_file(self, file_identifier: str) -> bool:
        # Sanitize file_identifier to prevent path traversal
        safe_identifier = os.path.basename(file_identifier)
        file_path = os.path.join(self.upload_dir, safe_identifier)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

    def get_file_url(self, file_identifier: str) -> str:
        safe_identifier = os.path.basename(file_identifier)
        return f"{self.base_url}/{safe_identifier}"


class CloudinaryStorageProvider(BaseStorageProvider):
    """
    Placeholder Cloudinary storage provider ready for future integration.
    """
    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        raise NotImplementedError("Cloudinary storage provider is not yet configured.")

    def delete_file(self, file_identifier: str) -> bool:
        raise NotImplementedError("Cloudinary storage provider is not yet configured.")

    def get_file_url(self, file_identifier: str) -> str:
        raise NotImplementedError("Cloudinary storage provider is not yet configured.")


class SupabaseStorageProvider(BaseStorageProvider):
    """
    Placeholder Supabase storage provider ready for future integration.
    """
    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        raise NotImplementedError("Supabase storage provider is not yet configured.")

    def delete_file(self, file_identifier: str) -> bool:
        raise NotImplementedError("Supabase storage provider is not yet configured.")

    def get_file_url(self, file_identifier: str) -> str:
        raise NotImplementedError("Supabase storage provider is not yet configured.")


def get_storage_provider() -> BaseStorageProvider:
    backend_type = os.getenv("STORAGE_BACKEND", "local").lower()
    if backend_type == "cloudinary":
        return CloudinaryStorageProvider()
    elif backend_type == "supabase":
        return SupabaseStorageProvider()
    else:
        upload_dir = os.getenv("UPLOAD_DIR", "uploads")
        return LocalStorageProvider(upload_dir=upload_dir)
