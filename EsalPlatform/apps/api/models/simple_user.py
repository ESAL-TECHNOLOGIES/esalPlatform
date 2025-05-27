"""
Simplified user model for superuser creation.
"""

from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import SQLModel, Field


class UserRoleEnum(str, Enum):
    """User role enumeration."""
    INNOVATOR = "innovator"
    INVESTOR = "investor"
    HUB = "hub"
    ADMIN = "admin"


class UserStatusEnum(str, Enum):
    """User status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"
    REJECTED = "rejected"


class SimpleUser(SQLModel, table=True):
    """Simplified user model for basic functionality."""
    __tablename__ = "users"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str = Field(min_length=2, max_length=100)
    password_hash: str
    role: UserRoleEnum = Field(default=UserRoleEnum.INNOVATOR)
    status: UserStatusEnum = Field(default=UserStatusEnum.PENDING)
    is_active: bool = Field(default=True)
    is_approved: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
