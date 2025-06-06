#!/usr/bin/env python3
"""
Script to check existing users in Supabase and optionally clean up test users
"""
import sys
import os

# Add the API directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'EsalPlatform', 'apps', 'api'))

from app.config import settings
from supabase import create_client

def main():
    """Check existing users in Supabase"""
    
    print("🔍 Checking Existing Users in Supabase")
    print("=" * 50)
    
    try:
        # Initialize Supabase client with service role key for admin operations
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        print("📋 Listing all users...")
        
        # List all users using admin API
        users_response = supabase.auth.admin.list_users()
        users = users_response
        
        if not users:
            print("📭 No users found in the system")
            return
        
        print(f"👥 Found {len(users)} users:")
        print("-" * 80)
        
        for i, user in enumerate(users, 1):
            user_metadata = user.user_metadata or {}
            
            print(f"{i}. User ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Name: {user_metadata.get('full_name', 'N/A')}")
            print(f"   Role: {user_metadata.get('role', 'N/A')}")
            print(f"   Email Verified: {user_metadata.get('email_verified', False)}")
            print(f"   Is Active: {user_metadata.get('is_active', 'N/A')}")
            print(f"   Created: {user.created_at}")
            print("-" * 40)
        
        # Ask if user wants to delete test users
        print("\n🗑️  Delete Test Users?")
        test_emails = [
            "danielokinda001@gmail.com",
            "modaniels507@gmail.com"
        ]
        
        for email in test_emails:
            user_to_delete = None
            for user in users:
                if user.email == email:
                    user_to_delete = user
                    break
            
            if user_to_delete:
                response = input(f"Delete user {email}? (y/N): ").strip().lower()
                if response == 'y':
                    try:
                        supabase.auth.admin.delete_user(user_to_delete.id)
                        print(f"✅ Deleted user {email}")
                    except Exception as e:
                        print(f"❌ Failed to delete user {email}: {e}")
                else:
                    print(f"⏭️  Skipped {email}")
            else:
                print(f"👤 User {email} not found")
        
    except Exception as e:
        print(f"❌ Error checking users: {e}")

if __name__ == "__main__":
    main()
