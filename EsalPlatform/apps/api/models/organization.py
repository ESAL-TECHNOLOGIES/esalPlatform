"""
Organization database model.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Organization(SQLModel, table=True):
    """Organization model for hubs and other entities."""
    __tablename__ = "organizations"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None, max_length=2000)
    
    # Contact information
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
      # Media
    logo_url: Optional[str] = None
    
    # Location and metadata as JSON strings
    location_data: Optional[str] = Field(default=None)
    extra_data: Optional[str] = Field(default=None)
    
    # Status
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
