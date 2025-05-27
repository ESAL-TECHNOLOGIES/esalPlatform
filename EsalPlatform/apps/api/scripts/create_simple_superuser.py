#!/usr/bin/env python3
"""
Create a superuser for the admin panel.

This script creates an admin user with full permissions to access the admin portal.
Run this script to set up the initial admin account.

Usage:
    python scripts/create_simple_superuser.py
"""

import os
import sys
import uuid
from datetime import datetime

# Add parent directory to path so we can import from the API
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlmodel import create_engine, Session
from core.config import settings
from models.simple_user import SimpleUser, UserRoleEnum, UserStatusEnum

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    SimpleUser.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.query(SimpleUser).filter(SimpleUser.email == email).first()
        if existing_user:
            print(f"❌ User with email {email} already exists")
            return
        
        # Create new admin user
        admin_user = SimpleUser(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            password_hash=hash_password(password),
            role=UserRoleEnum.ADMIN,
            status=UserStatusEnum.APPROVED,
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


if __name__ == "__main__":
    try:
        create_superuser()
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        sys.exit(1)
