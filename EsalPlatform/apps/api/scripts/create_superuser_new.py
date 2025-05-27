#!/usr/bin/env python3
"""
Script to create a superuser for the ESAL Platform.

This script creates an admin user with full permissions to access the admin portal.
"""

import asyncio
import sys
import uuid
import bcrypt
from datetime import datetime
from getpass import getpass
from pathlib import Path

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from core.database import SessionLocal, create_db_and_tables
from models.user import User, UserRoleEnum, UserStatusEnum, UserProfile, UserPermission, Permissions


def hash_password(password: str) -> str:
    """Hash a password."""
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hash_bytes.decode('utf-8')


def create_superuser():
    """Create a superuser with admin privileges."""
    print("Creating ESAL Platform Superuser")
    print("=" * 40)
    
    # Get user input
    email = input("Email: ").strip()
    if not email:
        print("Error: Email is required")
        sys.exit(1)
    
    name = input("Full Name: ").strip()
    if not name:
        print("Error: Name is required")
        sys.exit(1)
    
    password = getpass("Password: ").strip()
    if len(password) < 8:
        print("Error: Password must be at least 8 characters long")
        sys.exit(1)
    
    confirm_password = getpass("Confirm Password: ").strip()
    if password != confirm_password:
        print("Error: Passwords do not match")
        sys.exit(1)
    
    # Create database tables if they don't exist
    create_db_and_tables()
    
    # Create the superuser
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Error: User with email {email} already exists")
            sys.exit(1)
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(password)
        
        user = User(
            id=user_id,
            email=email,
            name=name,
            password_hash=hashed_password,  # Store password hash in proper field
            role=UserRoleEnum.ADMIN,
            status=UserStatusEnum.APPROVED,
            is_active=True,
            is_approved=True,
            created_at=datetime.utcnow(),
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create user profile
        profile = UserProfile(
            id=str(uuid.uuid4()),
            user_id=user.id,
            bio="Platform Administrator",
            extra_data='{"created_by": "superuser_script"}',
            created_at=datetime.utcnow(),
        )
        
        db.add(profile)
        
        # Add admin permissions
        admin_permissions = [
            Permissions.ADMIN_FULL_ACCESS,
            Permissions.USER_APPROVE,
            Permissions.USER_SUSPEND,
            Permissions.USER_VIEW_ALL,
            Permissions.AI_MATCHMAKING,
            Permissions.AI_PITCH_SCORING,
            Permissions.AI_EVALUATION,
            Permissions.PROJECT_VIEW_ALL,
            Permissions.ANALYTICS_VIEW,
            Permissions.ANALYTICS_EXPORT,
        ]
        
        for permission in admin_permissions:
            user_permission = UserPermission(
                id=str(uuid.uuid4()),
                user_id=user.id,
                permission_name=permission,
                granted_at=datetime.utcnow(),
            )
            db.add(user_permission)
        
        db.commit()
        
        print("\n✅ Superuser created successfully!")
        print(f"Email: {email}")
        print(f"Name: {name}")
        print("Role: Admin")
        print(f"User ID: {user_id}")
        print("\nYou can now log in to the admin portal with these credentials.")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating superuser: {e}")
        sys.exit(1)
    finally:
        db.close()


def list_superusers():
    """List all admin users."""
    db = SessionLocal()
    try:
        admins = db.query(User).filter(User.role == UserRoleEnum.ADMIN).all()
        
        if not admins:
            print("No admin users found.")
            return
        
        print("Admin Users:")
        print("=" * 60)
        for admin in admins:
            print(f"ID: {admin.id}")
            print(f"Email: {admin.email}")
            print(f"Name: {admin.name}")
            print(f"Status: {admin.status}")
            print(f"Active: {admin.is_active}")
            print(f"Created: {admin.created_at}")
            print("-" * 60)
            
    except Exception as e:
        print(f"Error listing admins: {e}")
    finally:
        db.close()


def main():
    """Main function."""
    if len(sys.argv) > 1 and sys.argv[1] == "list":
        list_superusers()
    else:
        create_superuser()


if __name__ == "__main__":
    main()
