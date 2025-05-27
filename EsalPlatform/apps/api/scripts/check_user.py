#!/usr/bin/env python3
"""Quick script to check user authentication details."""

import sys
from pathlib import Path

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent.parent))

import sqlite3
import bcrypt
from getpass import getpass

DB_PATH = Path(__file__).parent.parent / "esal_dev.db"

def check_user(email: str):
    """Check a user's details in the database."""
    print(f"Looking for user: {email}")
    print(f"Database path: {DB_PATH}")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        print("Connected to database")
        
        cursor.execute('''
            SELECT id, email, password_hash, role, status, is_active, is_approved
            FROM users 
            WHERE email = ?
        ''', (email,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            print(f"No user found with email: {email}")
            return
        
        user_id, email, password_hash, role, status, is_active, is_approved = result
        print("\nUser Details:")
        print("=" * 40)
        print(f"ID: {user_id}")
        print(f"Email: {email}")
        print(f"Role: {role}")
        print(f"Status: {status}")
        print(f"Active: {bool(is_active)}")
        print(f"Approved: {bool(is_approved)}")
        print(f"Password Hash: {password_hash[:20]}...")
        
        # Test password
        test_password = getpass("\nEnter password to test: ")
        try:
            matches = bcrypt.checkpw(
                test_password.encode('utf-8'),
                password_hash.encode('utf-8')
            )
            print(f"\nPassword verification {'succeeded' if matches else 'failed'}")
        except Exception as e:
            print(f"\nError verifying password: {e}")
            
    except Exception as e:
        print(f"Error checking user: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_user.py <email>")
        sys.exit(1)
    
    check_user(sys.argv[1])
