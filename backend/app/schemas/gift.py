from datetime import datetime, date
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# Gift Theme Schemas
# ==========================================

class GiftThemeBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    configuration_json: Dict[str, Any] = Field(default_factory=dict)
    preview_image: Optional[str] = None
    is_active: bool = True

class GiftThemeCreate(GiftThemeBase):
    pass

class GiftThemeResponse(GiftThemeBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Gift Photo Schemas
# ==========================================

class GiftPhotoBase(BaseModel):
    file_url: str = Field(..., max_length=512)
    caption: Optional[str] = None
    display_order: int = 0

class GiftPhotoCreate(GiftPhotoBase):
    pass

class GiftPhotoResponse(GiftPhotoBase):
    id: str
    gift_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Gift Section Schemas
# ==========================================

class GiftSectionBase(BaseModel):
    section_type: str = Field(..., max_length=50) # e.g. text, memory, letter, quote
    title: Optional[str] = Field(None, max_length=255)
    content: Dict[str, Any] = Field(default_factory=dict)
    display_order: int = 0
    is_enabled: bool = True

class GiftSectionCreate(GiftSectionBase):
    pass

class GiftSectionUpdate(BaseModel):
    section_type: Optional[str] = None
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    display_order: Optional[int] = None
    is_enabled: Optional[bool] = None

class GiftSectionResponse(GiftSectionBase):
    id: str
    gift_id: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Gift Interactive Schemas
# ==========================================

class GiftInteractiveBase(BaseModel):
    interactive_type: str = Field(..., max_length=50) # e.g. quiz, scratch_card, memory_game
    configuration_json: Dict[str, Any] = Field(default_factory=dict)
    display_order: int = 0
    is_enabled: bool = True

class GiftInteractiveCreate(GiftInteractiveBase):
    pass

class GiftInteractiveUpdate(BaseModel):
    interactive_type: Optional[str] = None
    configuration_json: Optional[Dict[str, Any]] = None
    display_order: Optional[int] = None
    is_enabled: Optional[bool] = None

class GiftInteractiveResponse(GiftInteractiveBase):
    id: str
    gift_id: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Gift Goodie Schemas
# ==========================================

class GiftGoodieBase(BaseModel):
    goodie_type: str = Field(..., max_length=50) # note, photo, video, song, voice, drawing, place, coupon, custom_card, surprise
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    content: Optional[Any] = Field(default_factory=dict)
    media_url: Optional[str] = None
    configuration_json: Dict[str, Any] = Field(default_factory=dict)
    display_order: int = 0
    is_enabled: bool = True

class GiftGoodieCreate(GiftGoodieBase):
    pass

class GiftGoodieUpdate(BaseModel):
    goodie_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[Any] = None
    media_url: Optional[str] = None
    configuration_json: Optional[Dict[str, Any]] = None
    display_order: Optional[int] = None
    is_enabled: Optional[bool] = None

class GiftGoodieReorderItem(BaseModel):
    id: str
    display_order: int

class GiftGoodieResponse(GiftGoodieBase):
    id: str
    gift_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Gift Core Schemas
# ==========================================

class GiftBase(BaseModel):
    occasion_type: str = Field("general", max_length=50)
    recipient_name: str = Field(..., max_length=255)
    recipient_date: Optional[date] = None
    title: str = Field(..., max_length=255)
    message: Optional[str] = None
    theme_id: Optional[str] = None
    music_url: Optional[str] = Field(None, max_length=512)
    is_published: bool = False


class GiftCreate(GiftBase):
    password: Optional[str] = Field(None, description="Optional access password for private gifts")
    password_hint: Optional[str] = Field(None, description="Optional password hint for recipient")
    photos: List[GiftPhotoCreate] = Field(default_factory=list)
    sections: List[GiftSectionCreate] = Field(default_factory=list)
    interactives: List[GiftInteractiveCreate] = Field(default_factory=list)
    goodies: List[GiftGoodieCreate] = Field(default_factory=list)


class GiftUpdate(BaseModel):
    occasion_type: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_date: Optional[date] = None
    title: Optional[str] = None
    message: Optional[str] = None
    theme_id: Optional[str] = None
    music_url: Optional[str] = None
    password: Optional[str] = Field(None, description="Set new password or set empty to remove")
    password_hint: Optional[str] = Field(None, description="Optional password hint for recipient")
    password_enabled: Optional[bool] = None
    is_published: Optional[bool] = None
    photos: Optional[List[GiftPhotoCreate]] = None
    sections: Optional[List[GiftSectionCreate]] = None
    interactives: Optional[List[GiftInteractiveCreate]] = None
    goodies: Optional[List[GiftGoodieCreate]] = None


class PublicGiftResponse(GiftBase):
    """
    Publicly safe gift response.
    STRICT SECURITY RULE: Never exposes edit_token or password_hash.
    """
    public_id: str
    password_enabled: bool
    password_hint: Optional[str] = None
    is_locked: bool = Field(False, description="True if gift requires password verification before full content view")
    created_at: datetime
    updated_at: datetime
    theme: Optional[GiftThemeResponse] = None
    photos: List[GiftPhotoResponse] = Field(default_factory=list)
    sections: List[GiftSectionResponse] = Field(default_factory=list)
    interactives: List[GiftInteractiveResponse] = Field(default_factory=list)
    goodies: List[GiftGoodieResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class EditGiftResponse(PublicGiftResponse):
    """
    Private author gift response.
    Includes edit_token for the original creator.
    """
    id: str
    edit_token: str

    model_config = ConfigDict(from_attributes=True)


class VerifyPasswordRequest(BaseModel):
    password: str

