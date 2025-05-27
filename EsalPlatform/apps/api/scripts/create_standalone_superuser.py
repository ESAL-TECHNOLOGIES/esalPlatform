#!/usr/bin/env python3
"""
Create a superuser for the admin panel - standalone version.

This script creates an admin user with full permissions to access the admin portal.
Run this script to set up the initial admin account.

Usage:
    python scripts/create_standalone_superuser.py
"""

import os
import sys
import uuid
from datetime import datetime
from typing import Optional
from enum import Enum

# Add parent directory to path so we can import from the API
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlmodel import SQLModel, Field, create_engine, Session
from core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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


class AdminUser(SQLModel, table=True):
    """Admin user model for superuser creation."""
    __tablename__ = "admin_users"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str = Field(min_length=2, max_length=100)
    password_hash: str
    role: str = Field(default="admin")
    status: str = Field(default="approved")
    is_active: bool = Field(default=True)
    is_approved: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_superuser():
    """Create a superuser with admin privileges."""
    print("🚀 Creating superuser for ESAL Platform Admin Portal")
    print("=" * 50)
    
    # Use predefined admin credentials for initial setup
    email = "admin@esal.com"
    name = "ESAL Admin"
    password = "admin123"
    
    print(f"Creating admin user: {email}")
    
    # Create database engine and session
    engine = create_engine(str(settings.DATABASE_URL), echo=False)
    
    # Create tables if they don't exist
    AdminUser.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.query(AdminUser).filter(AdminUser.email == email).first()
        if existing_user:
            print(f"❌ User with email {email} already exists")
            return
        
        # Create new admin user
        admin_user = AdminUser(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            password_hash=hash_password(password),
            role="admin",
            status="approved",
            is_active=True,
            is_approved=True,
            created_at=datetime.utcnow()
        )
        
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)
        
        print("✅ Superuser created successfully!")
        print(f"📧 Email: {admin_user.email}")
        print(f"👤 Name: {admin_user.name}")
        print(f"🔑 Role: {admin_user.role}")
        print(f"📅 Created: {admin_user.created_at}")
        print("\n🎉 You can now log in to the admin portal!")
        print(f"🔐 Login credentials:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")


if __name__ == "__main__":
    try:
        create_superuser()
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
