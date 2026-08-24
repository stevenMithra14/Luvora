import os
import bcrypt
import uuid
import secrets
import hmac
import hashlib
import time

SECRET_KEY = os.getenv("SECRET_KEY", "luvora-secret-key-change-in-production-2026").encode('utf-8')

def generate_public_id() -> str:
    """Generates a UUID4 string for internal gift IDs."""
    return str(uuid.uuid4())

def generate_edit_token() -> str:
    """Generates a secure 32-byte hex token for secret gift editing."""
    return secrets.token_hex(32)

def hash_password(password: str) -> str:
    """
    Hashes a gift password securely using bcrypt.
    Truncates to 72 bytes to prevent bcrypt 255-byte wrapping bugs.
    """
    if not password:
        raise ValueError("Password cannot be empty")
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored bcrypt hash.
    """
    if not password or not hashed_password:
        return False
    try:
        pwd_bytes = password.encode('utf-8')[:72]
        hash_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception:
        return False

def generate_access_token(public_id: str) -> str:
    """
    Generates a secure temporary access token for viewing password-unlocked gifts.
    """
    timestamp = str(int(time.time()))
    msg = f"{public_id}:{timestamp}".encode('utf-8')
    sig = hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()
    return f"{timestamp}.{sig}"

def verify_access_token(token: str, public_id: str, max_age_seconds: int = 86400) -> bool:
    """
    Verifies the signature and expiration (default 24h) of a gift access token.
    """
    if not token or "." not in token:
        return False
    try:
        timestamp_str, sig = token.split(".", 1)
        timestamp = int(timestamp_str)

        # Check expiration
        if time.time() - timestamp > max_age_seconds:
            return False

        msg = f"{public_id}:{timestamp_str}".encode('utf-8')
        expected_sig = hmac.new(SECRET_KEY, msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig, expected_sig)
    except Exception:
        return False
