"""
SQLAlchemy models for ESAL Platform
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class User(Base):
    """User model - synced with Supabase Auth"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)  # innovator, hub, investor, admin
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ideas = relationship("Idea", back_populates="user")


class Idea(Base):
    """Innovation ideas submitted by users"""
    __tablename__ = "ideas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    problem = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    target_market = Column(Text, nullable=False)
    ai_pitch = Column(Text)  # Generated AI pitch
    status = Column(String, default="draft")  # draft, submitted, reviewed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="ideas")


class SystemSettings(Base):
    """System settings and configuration"""
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)
    key = Column(String(100), nullable=False)
    value = Column(Text)
    data_type = Column(String(20), default="string")  # string, number, boolean, json
    description = Column(Text)
    is_public = Column(Boolean, default=False)  # whether non-admin users can access
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
