"""
Match database model.
"""

from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import SQLModel, Field


class MatchStatusEnum(str, Enum):
    """Match status enumeration."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class Match(SQLModel, table=True):
    """Match model for AI-generated user matches."""
    __tablename__ = "matches"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id_1: str = Field(foreign_key="users.id", index=True)
    user_id_2: str = Field(foreign_key="users.id", index=True)
      # Match details
    score: float = Field(ge=0.0, le=1.0)
    match_reason: Optional[str] = Field(default=None, max_length=1000)
    compatibility_data: Optional[str] = Field(default=None)  # JSON string
    match_reasons_data: Optional[str] = Field(default=None)  # JSON string
    
    # Status and organization
    status: MatchStatusEnum = Field(default=MatchStatusEnum.PENDING)
    organization_id: Optional[str] = Field(foreign_key="organizations.id", default=None)
    
    # AI metadata
    ai_model_used: Optional[str] = None
    ai_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
