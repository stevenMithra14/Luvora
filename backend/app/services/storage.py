import os
import re
import shutil
import uuid
import logging
from abc import ABC, abstractmethod
from typing import BinaryIO, Optional

try:
    import requests
except ImportError:
    requests = None

logger = logging.getLogger("luvora.storage")

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
    Used for local development environments.
    """
    def __init__(self, upload_dir: str = "uploads", base_url: str = "/uploads"):
        self.upload_dir = upload_dir
        self.base_url = base_url
        os.makedirs(self.upload_dir, exist_ok=True)

    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
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
        if not file_identifier:
            return ""
        if file_identifier.startswith("http://") or file_identifier.startswith("https://"):
            return file_identifier
        safe_identifier = os.path.basename(file_identifier)
        return f"{self.base_url}/{safe_identifier}"

    def verify_file_exists(self, file_identifier: str) -> bool:
        if not file_identifier:
            return False
        safe_identifier = os.path.basename(file_identifier)
        file_path = os.path.join(self.upload_dir, safe_identifier)
        return os.path.exists(file_path) and os.path.getsize(file_path) > 0


class SupabaseStorageProvider(BaseStorageProvider):
    """
    Production Supabase Object Storage Provider.
    Uploads files to a persistent public Supabase Storage bucket via REST API.
    Guarantees permanent public URLs that never expire across sessions and browser refreshes.
    """
    def __init__(self):
        raw_url = (
            os.getenv("SUPABASE_URL")
            or os.getenv("SUPABASE_PROJECT_URL")
            or os.getenv("VITE_SUPABASE_URL")
            or ""
        ).strip().rstrip("/")

        # Auto-derive Supabase project URL from DATABASE_URL if not explicitly set
        if not raw_url:
            db_url = os.getenv("DATABASE_URL", "")
            match = re.search(r"postgres\.([a-zA-Z0-9_-]+):", db_url)
            if not match:
                match = re.search(r"([a-zA-Z0-9_-]+)\.supabase\.(?:co|in|net)", db_url)
            if match:
                project_ref = match.group(1)
                raw_url = f"https://{project_ref}.supabase.co"
                logger.info(f"Derived Supabase URL from database configuration: {raw_url}")

        if raw_url and not raw_url.startswith("http://") and not raw_url.startswith("https://"):
            raw_url = f"https://{raw_url}"

        self.supabase_url = raw_url
        self.supabase_key = (
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            or os.getenv("SUPABASE_KEY")
            or os.getenv("SUPABASE_SECRET_KEY")
            or os.getenv("SUPABASE_ANON_KEY")
            or os.getenv("VITE_SUPABASE_ANON_KEY")
            or ""
        ).strip()
        self.bucket = os.getenv("SUPABASE_BUCKET", "luvora-media").strip()
        self._bucket_checked = False

        if not self.supabase_url or not self.supabase_key:
            logger.warning("SUPABASE_URL or SUPABASE_KEY missing in environment variables.")

    def _ensure_bucket_exists(self) -> bool:
        """
        Ensures the public Supabase Storage bucket exists.
        Creates it if missing and verifies public read access.
        """
        if self._bucket_checked:
            return True
        if not self.supabase_url or not self.supabase_key or not requests:
            return False

        headers = {
            "Authorization": f"Bearer {self.supabase_key}",
            "apikey": self.supabase_key,
            "Content-Type": "application/json"
        }
        bucket_url = f"{self.supabase_url}/storage/v1/bucket/{self.bucket}"

        try:
            res = requests.get(bucket_url, headers=headers, timeout=10)
            if res.status_code == 200:
                bucket_info = res.json()
                if not bucket_info.get("public"):
                    requests.put(bucket_url, headers=headers, json={"public": True}, timeout=10)
                self._bucket_checked = True
                return True
            elif res.status_code == 404:
                create_url = f"{self.supabase_url}/storage/v1/bucket"
                create_res = requests.post(
                    create_url,
                    headers=headers,
                    json={
                        "id": self.bucket,
                        "name": self.bucket,
                        "public": True,
                        "file_size_limit": 52428800  # 50MB
                    },
                    timeout=10
                )
                if create_res.status_code in (200, 201):
                    self._bucket_checked = True
                    return True
                else:
                    logger.warning(f"Could not create Supabase bucket '{self.bucket}': {create_res.status_code} {create_res.text}")
        except Exception as e:
            logger.warning(f"Error ensuring Supabase bucket '{self.bucket}' exists: {e}")

        return False

    def save_file(self, file_data: BinaryIO, filename: str, content_type: str = "") -> str:
        if not self.supabase_url or not self.supabase_key:
            is_render = os.getenv("RENDER") == "true" or bool(os.getenv("RENDER_SERVICE_ID"))
            is_production = os.getenv("APP_ENV", "").lower() == "production" or is_render
            if is_production:
                raise RuntimeError(
                    "Persistent cloud storage is required in production on Render. "
                    "SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be configured in Render environment variables."
                )
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

        file_bytes = file_data.read()
        res = requests.post(upload_endpoint, headers=headers, data=file_bytes, timeout=30)
        
        # If bucket not found, attempt to auto-create and retry upload once
        if res.status_code == 404:
            self._ensure_bucket_exists()
            res = requests.post(upload_endpoint, headers=headers, data=file_bytes, timeout=30)

        if res.status_code not in (200, 201):
            # Fallback retry with PUT
            res = requests.put(upload_endpoint, headers=headers, data=file_bytes, timeout=30)

        if res.status_code not in (200, 201):
            raise RuntimeError(f"Supabase Storage Upload failed ({res.status_code}): {res.text}")

        return unique_name

    def delete_file(self, file_identifier: str) -> bool:
        if not self.supabase_url or not self.supabase_key or not requests:
            return False

        clean_path = file_identifier.lstrip("/")
        if clean_path.startswith(f"{self.bucket}/"):
            clean_path = clean_path[len(self.bucket) + 1:]

        delete_endpoint = f"{self.supabase_url}/storage/v1/object/{self.bucket}"
        headers = {
            "Authorization": f"Bearer {self.supabase_key}",
            "apikey": self.supabase_key,
            "Content-Type": "application/json"
        }
        try:
            res = requests.delete(delete_endpoint, headers=headers, json={"prefixes": [clean_path]}, timeout=15)
            return res.status_code == 200
        except Exception:
            return False

    def get_file_url(self, file_identifier: str) -> str:
        if not file_identifier:
            return ""
        if file_identifier.startswith("http://") or file_identifier.startswith("https://"):
            return file_identifier

        clean_path = file_identifier.lstrip("/")
        if clean_path.startswith(f"{self.bucket}/"):
            clean_path = clean_path[len(self.bucket) + 1:]

        if not self.supabase_url:
            return f"/uploads/{os.path.basename(file_identifier)}"

        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket}/{clean_path}"

    def verify_file_exists(self, file_identifier: str) -> bool:
        if not file_identifier:
            return False
        url = self.get_file_url(file_identifier)
        if url.startswith("http") and requests:
            try:
                headers = {}
                if self.supabase_key:
                    headers["apikey"] = self.supabase_key
                res = requests.head(url, headers=headers, timeout=5)
                if res.status_code == 200:
                    return True
                # Fallback to small Range GET if server denies HEAD
                res_get = requests.get(url, headers={"Range": "bytes=0-0", **headers}, timeout=5)
                return res_get.status_code in (200, 206)
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
        if not self.cloud_name or not self.api_key or not requests:
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
        if file_identifier.startswith("http") and requests:
            try:
                res = requests.head(file_identifier, timeout=5)
                return res.status_code == 200
            except Exception:
                return False
        return False


def get_storage_provider() -> BaseStorageProvider:
    """
    Returns the appropriate storage provider.
    In production environments (e.g. Render), Supabase Storage is strictly enforced
    to ensure uploaded files are never written to ephemeral filesystem disks.
    """
    backend_type = os.getenv("STORAGE_BACKEND", "").lower().strip()
    is_render = os.getenv("RENDER") == "true" or bool(os.getenv("RENDER_SERVICE_ID"))
    is_production = os.getenv("APP_ENV", "").lower() == "production" or is_render
    
    # In production on Render, ALWAYS use persistent Supabase storage
    if backend_type == "supabase" or is_production or os.getenv("SUPABASE_URL") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        provider = SupabaseStorageProvider()
        if is_production and (not provider.supabase_url or not provider.supabase_key):
            logger.error("CRITICAL CONFIGURATION WARNING: Running in production on Render without SUPABASE_KEY or SUPABASE_URL configured!")
            logger.error("Render's filesystem is ephemeral. Local uploads will be wiped on sleep or restart.")
            logger.error("Please configure SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) in Render environment variables.")
        return provider
    elif backend_type == "cloudinary" or os.getenv("CLOUDINARY_CLOUD_NAME"):
        return CloudinaryStorageProvider()
    else:
        # Development fallback only
        upload_dir = os.getenv("UPLOAD_DIR", "uploads")
        return LocalStorageProvider(upload_dir=upload_dir)

