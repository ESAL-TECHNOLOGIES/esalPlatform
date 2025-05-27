#!/usr/bin/env python3
"""
Simple script to create a superuser for the ESAL Platform.

This script creates an admin user directly in the database without complex model imports.
"""

import sys
import uuid
import sqlite3
from datetime import datetime
from getpass import getpass
from pathlib import Path
import bcrypt

# Database path
DB_PATH = Path(__file__).parent.parent / "esal_dev.db"


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_tables():
    """Create the necessary tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'innovator',
                status TEXT NOT NULL DEFAULT 'pending',
                is_active BOOLEAN NOT NULL DEFAULT 1,
                is_approved BOOLEAN NOT NULL DEFAULT 0,
                password_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        
        # Create user_profiles table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                bio TEXT,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create user_permissions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_permissions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                permission_name TEXT NOT NULL,
                granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        print("✅ Database tables created/verified successfully")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


def create_superuser(auto_mode=False):
    """Create a superuser with admin privileges."""
    print("Creating ESAL Platform Superuser")
    print("=" * 40)
    
    if auto_mode:
        # Predefined admin user for testing
        email = "admin@esal.com"
        name = "ESAL Admin"
        password = "admin123456"
        print(f"📧 Email: {email}")
        print(f"👤 Name: {name}")
        print("🔄 Using predefined credentials for testing...")
    else:
        # Get user input
        email = input("Email: ").strip()
        if not email:
            print("❌ Error: Email is required")
            sys.exit(1)
        
        name = input("Full Name: ").strip()
        if not name:
            print("❌ Error: Name is required")
            sys.exit(1)
        
        password = getpass("Password: ").strip()
        if len(password) < 8:
            print("❌ Error: Password must be at least 8 characters long")
            sys.exit(1)
        
        confirm_password = getpass("Confirm Password: ").strip()
        if password != confirm_password:
            print("❌ Error: Passwords do not match")
            sys.exit(1)
    
    # Create database tables
    create_tables()
    
    # Create the superuser
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"❌ Error: User with email {email} already exists")
            sys.exit(1)
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(password)
        now = datetime.utcnow().isoformat()
        
        cursor.execute('''
            INSERT INTO users (
                id, email, name, role, status, is_active, is_approved, 
                password_hash, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, email, name, 'admin', 'approved', 
            True, True, hashed_password, now
        ))
        
        # Create user profile
        profile_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO user_profiles (
                id, user_id, bio, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?)
        ''', (
            profile_id, user_id, "Platform Administrator", 
            '{"created_by": "superuser_script"}', now
        ))
        
        # Add admin permissions
        admin_permissions = [
            "ADMIN_FULL_ACCESS",
            "USER_APPROVE",
            "USER_SUSPEND", 
            "USER_VIEW_ALL",
            "AI_MATCHMAKING",
            "AI_PITCH_SCORING",
            "AI_EVALUATION",
            "PROJECT_VIEW_ALL",
            "ANALYTICS_VIEW",
            "ANALYTICS_EXPORT"
        ]
        
        for permission in admin_permissions:
            permission_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO user_permissions (
                    id, user_id, permission_name, granted_at
                ) VALUES (?, ?, ?, ?)
            ''', (permission_id, user_id, permission, now))
        
        conn.commit()
        
        print(f"\n✅ Superuser created successfully!")
        print(f"📧 Email: {email}")
        print(f"👤 Name: {name}")
        print(f"🔑 Role: Admin")
        print(f"🆔 User ID: {user_id}")
        print(f"📊 Permissions: {len(admin_permissions)} admin permissions granted")
        print(f"\n🚀 You can now log in to the admin portal with these credentials.")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating superuser: {e}")
        sys.exit(1)
    finally:
        conn.close()


def list_superusers():
    """List all admin users."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT id, email, name, status, is_active, created_at 
            FROM users WHERE role = 'admin'
        ''')
        admins = cursor.fetchall()
        
        if not admins:
            print("📭 No admin users found.")
            return
        
        print("👥 Admin Users:")
        print("=" * 80)
        for admin in admins:
            user_id, email, name, status, is_active, created_at = admin
            print(f"🆔 ID: {user_id}")
            print(f"📧 Email: {email}")
            print(f"👤 Name: {name}")
            print(f"📊 Status: {status}")
            print(f"✅ Active: {'Yes' if is_active else 'No'}")
            print(f"📅 Created: {created_at}")
            print("-" * 80)
            
    except Exception as e:
        print(f"❌ Error listing admins: {e}")
    finally:
        conn.close()


def verify_database():
    """Verify database connection and show basic info."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        print(f"📂 Database: {DB_PATH}")
        print(f"📋 Tables: {[table[0] for table in tables]}")
        
        # Count users
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"👥 Total users: {user_count}")
        
        # Count admins
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cursor.fetchone()[0]
        print(f"🔑 Admin users: {admin_count}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Database verification failed: {e}")


def main():
    """Main function."""
    if len(sys.argv) > 1:
        if sys.argv[1] == "list":
            list_superusers()
        elif sys.argv[1] == "verify":
            verify_database()
        elif sys.argv[1] == "auto":
            create_superuser(auto_mode=True)
        else:
            print("Usage: python simple_superuser.py [list|verify|auto]")
    else:
        create_superuser()


if __name__ == "__main__":
    main()
