import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, DateTime, Date, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.utils.security import generate_public_id, generate_edit_token

def generate_uuid_str() -> str:
    return str(uuid.uuid4())

class GiftTheme(Base):
    """
    Visual theme template for digital gifts.
    """
    __tablename__ = "gift_themes"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    configuration_json = Column(JSON, nullable=False, default=dict)
    preview_image = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    gifts = relationship("Gift", back_populates="theme")

    def __repr__(self):
        return f"<GiftTheme(name='{self.name}', is_active={self.is_active})>"


class Gift(Base):
    """
    Core Gift Entity representing a digital card, love letter, memory box, or anniversary experience.
    """
    __tablename__ = "gifts"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    public_id = Column(String(36), unique=True, index=True, nullable=False, default=generate_public_id)
    edit_token = Column(String(64), unique=True, index=True, nullable=False, default=generate_edit_token)
    
    occasion_type = Column(String(50), nullable=False, default="general") # e.g. birthday, love_letter, anniversary, friendship
    recipient_name = Column(String(255), nullable=False)
    recipient_date = Column(Date, nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    
    theme_id = Column(String(36), ForeignKey("gift_themes.id", ondelete="SET NULL"), nullable=True)
    music_url = Column(String(512), nullable=True)
    
    password_hash = Column(String(255), nullable=True)
    password_hint = Column(String(255), nullable=True)
    password_enabled = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    theme = relationship("GiftTheme", back_populates="gifts")
    photos = relationship("GiftPhoto", back_populates="gift", cascade="all, delete-orphan", order_by="GiftPhoto.display_order")
    sections = relationship("GiftSection", back_populates="gift", cascade="all, delete-orphan", order_by="GiftSection.display_order")
    interactives = relationship("GiftInteractive", back_populates="gift", cascade="all, delete-orphan", order_by="GiftInteractive.display_order")
    goodies = relationship("GiftGoodie", back_populates="gift", cascade="all, delete-orphan", order_by="GiftGoodie.display_order")

    def __repr__(self):
        return f"<Gift(title='{self.title}', recipient='{self.recipient_name}', public_id='{self.public_id}')>"


class GiftPhoto(Base):
    """
    Photo gallery items associated with a digital gift.
    """
    __tablename__ = "gift_photos"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    gift_id = Column(String(36), ForeignKey("gifts.id", ondelete="CASCADE"), nullable=False, index=True)
    file_url = Column(String(512), nullable=False)
    caption = Column(Text, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    gift = relationship("Gift", back_populates="photos")

    def __repr__(self):
        return f"<GiftPhoto(id='{self.id}', gift_id='{self.gift_id}', display_order={self.display_order})>"


class GiftSection(Base):
    """
    Dynamic content sections (e.g. text block, timeline memory, love note, quote).
    """
    __tablename__ = "gift_sections"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    gift_id = Column(String(36), ForeignKey("gifts.id", ondelete="CASCADE"), nullable=False, index=True)
    section_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=True)
    content = Column(JSON, nullable=True, default=dict)
    display_order = Column(Integer, default=0, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)

    # Relationship
    gift = relationship("Gift", back_populates="sections")

    def __repr__(self):
        return f"<GiftSection(type='{self.section_type}', title='{self.title}', display_order={self.display_order})>"


class GiftInteractive(Base):
    """
    Interactive components (e.g. quiz, scratch card, unlock box, memory game).
    """
    __tablename__ = "gift_interactives"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    gift_id = Column(String(36), ForeignKey("gifts.id", ondelete="CASCADE"), nullable=False, index=True)
    interactive_type = Column(String(50), nullable=False)
    configuration_json = Column(JSON, nullable=False, default=dict)
    display_order = Column(Integer, default=0, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)

    # Relationship
    gift = relationship("Gift", back_populates="interactives")

    def __repr__(self):
        return f"<GiftInteractive(type='{self.interactive_type}', display_order={self.display_order})>"


class GiftGoodie(Base):
    """
    Personalized digital goodies (notes, photos, videos, songs, voice messages, drawings, places, coupons, custom cards, surprises).
    """
    __tablename__ = "gift_goodies"

    id = Column(String(36), primary_key=True, default=generate_uuid_str)
    gift_id = Column(String(36), ForeignKey("gifts.id", ondelete="CASCADE"), nullable=False, index=True)
    goodie_type = Column(String(50), nullable=False) # e.g. note, photo, video, song, voice, drawing, place, coupon, custom_card, surprise
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    content = Column(JSON, nullable=True, default=dict)
    media_url = Column(Text, nullable=True)
    configuration_json = Column(JSON, nullable=False, default=dict)
    display_order = Column(Integer, default=0, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    gift = relationship("Gift", back_populates="goodies")

    def __repr__(self):
        return f"<GiftGoodie(type='{self.goodie_type}', title='{self.title}', display_order={self.display_order})>"

