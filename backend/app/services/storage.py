import os
import shutil
import uuid
import requests
from abc import ABC, abstractmethod
from typing import BinaryIO

class BaseStorageProvider(ABC):
    """
    Abstract Storage Provider Interface for Luvora asset storage (images, audio, video).
    Allows seamless switching between local disk, Supabase Storage, Cloudinary, or AWS S3.
    """
    
    @abstractmethod
    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        """
        Saves file data and returns accessible file identifier or path.
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

    @abstractmethod
    def verify_file_exists(self, file_identifier: str) -> bool:
        """
        Verifies if the file actually exists in storage.
        """
        pass


class LocalStorageProvider(BaseStorageProvider):
    """
    Local filesystem storage provider with path traversal sanitization and file verification.
    Stores files under the `uploads/` directory.
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
            if "image" in content_type:
                ext = ".jpg"
            elif "video" in content_type:
                ext = ".mp4"
            else:
                ext = ".mp3"

        unique_name = f"{uuid.uuid4().hex}{ext}"
        destination = os.path.join(self.upload_dir, unique_name)
        
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(file_data, buffer)
            
        return unique_name

    def delete_file(self, file_identifier: str) -> bool:
        safe_identifier = os.path.basename(file_identifier)
        file_path = os.path.join(self.upload_dir, safe_identifier)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

    def get_file_url(self, file_identifier: str) -> str:
        if file_identifier.startswith("http://") or file_identifier.startswith("https://"):
            return file_identifier
        safe_identifier = os.path.basename(file_identifier)
        return f"{self.base_url}/{safe_identifier}"

    def verify_file_exists(self, file_identifier: str) -> bool:
        safe_identifier = os.path.basename(file_identifier)
        file_path = os.path.join(self.upload_dir, safe_identifier)
        return os.path.exists(file_path) and os.path.getsize(file_path) > 0


class SupabaseStorageProvider(BaseStorageProvider):
    """
    Production Supabase Object Storage Provider.
    Uploads files to Supabase Storage bucket via REST API.
    """
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
        self.bucket = os.getenv("SUPABASE_BUCKET", "luvora-media")
        
        if not self.supabase_url or not self.supabase_key:
            print("Warning: SUPABASE_URL or SUPABASE_KEY missing in environment variables.")

    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase Storage credentials (SUPABASE_URL & SUPABASE_KEY) are not configured.")

        safe_filename = os.path.basename(filename or "file")
        ext = os.path.splitext(safe_filename)[1].lower()
        if not ext:
            if "image" in content_type:
                ext = ".jpg"
            elif "video" in content_type:
                ext = ".mp4"
            else:
                ext = ".mp3"

        unique_name = f"gifts/{uuid.uuid4().hex}{ext}"
        upload_endpoint = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{unique_name}"
        
        headers = {
            "Authorization": f"Bearer {self.supabase_key}",
            "apikey": self.supabase_key,
            "Content-Type": content_type or "application/octet-stream",
            "x-upsert": "true"
        }

        # Read binary data
        file_bytes = file_data.read()
        res = requests.post(upload_endpoint, headers=headers, data=file_bytes, timeout=30)
        
        if res.status_code not in (200, 201):
            # Try PUT if POST returned 400 or 409
            res = requests.put(upload_endpoint, headers=headers, data=file_bytes, timeout=30)

        if res.status_code not in (200, 201):
            raise RuntimeError(f"Supabase Storage Upload failed ({res.status_code}): {res.text}")

        return unique_name

    def delete_file(self, file_identifier: str) -> bool:
        if not self.supabase_url or not self.supabase_key:
            return False

        delete_endpoint = f"{self.supabase_url}/storage/v1/object/{self.bucket}"
        headers = {
            "Authorization": f"Bearer {self.supabase_key}",
            "apikey": self.supabase_key,
            "Content-Type": "application/json"
        }
        res = requests.delete(delete_endpoint, headers=headers, json={"prefixes": [file_identifier]}, timeout=15)
        return res.status_code == 200

    def get_file_url(self, file_identifier: str) -> str:
        if file_identifier.startswith("http://") or file_identifier.startswith("https://"):
            return file_identifier

        if not self.supabase_url:
            return f"/uploads/{os.path.basename(file_identifier)}"

        clean_path = file_identifier.lstrip("/")
        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket}/{clean_path}"

    def verify_file_exists(self, file_identifier: str) -> bool:
        url = self.get_file_url(file_identifier)
        if url.startswith("http"):
            try:
                res = requests.head(url, timeout=5)
                return res.status_code == 200
            except Exception:
                return False
        return False


class CloudinaryStorageProvider(BaseStorageProvider):
    """
    Cloudinary Storage Provider implementation using REST API.
    """
    def __init__(self):
        self.cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        self.api_key = os.getenv("CLOUDINARY_API_KEY", "")
        self.api_secret = os.getenv("CLOUDINARY_API_SECRET", "")

    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        if not self.cloud_name or not self.api_key:
            raise ValueError("Cloudinary credentials are not configured.")

        url = f"https://api.cloudinary.com/v1_1/{self.cloud_name}/auto/upload"
        files = {"file": (filename, file_data, content_type)}
        data = {"upload_preset": os.getenv("CLOUDINARY_UPLOAD_PRESET", "luvora_preset")}
        
        res = requests.post(url, files=files, data=data, timeout=30)
        if res.status_code == 200:
            res_json = res.json()
            return res_json.get("secure_url", "")
        raise RuntimeError(f"Cloudinary upload failed ({res.status_code}): {res.text}")

    def delete_file(self, file_identifier: str) -> bool:
        return False

    def get_file_url(self, file_identifier: str) -> str:
        return file_identifier

    def verify_file_exists(self, file_identifier: str) -> bool:
        if file_identifier.startswith("http"):
            try:
                res = requests.head(file_identifier, timeout=5)
                return res.status_code == 200
            except Exception:
                return False
        return False


def get_storage_provider() -> BaseStorageProvider:
    backend_type = os.getenv("STORAGE_BACKEND", "").lower()
    
    # Auto-detect Supabase or Cloudinary if env vars are present even if STORAGE_BACKEND is unset
    if backend_type == "supabase" or (not backend_type and os.getenv("SUPABASE_URL")):
        return SupabaseStorageProvider()
    elif backend_type == "cloudinary" or (not backend_type and os.getenv("CLOUDINARY_CLOUD_NAME")):
        return CloudinaryStorageProvider()
    else:
        upload_dir = os.getenv("UPLOAD_DIR", "uploads")
        return LocalStorageProvider(upload_dir=upload_dir)

