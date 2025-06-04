#!/usr/bin/env python3
"""
Admin User Creation Script
This script creates an admin user for the ESAL Platform admin portal.
"""
import asyncio
import sys
import os
import logging
from datetime import datetime, timezone

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.config import settings
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_admin_user():
    """Create an admin user for the admin portal"""
    try:
        print("🔐 Creating Admin User for ESAL Platform")
        print("=" * 50)
        
        # Use service role key to access Supabase admin functions
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        # Admin user credentials
        admin_email = "junior@esal.platform"
        admin_password = "Admin123567!@#"  # Strong password for production
        
        print(f"📧 Admin Email: {admin_email}")
        print(f"🔑 Admin Password: {admin_password}")
        print()
          # Check if admin user already exists by trying to get user by email
        try:
            # Use admin API to list users and find by email
            users_response = supabase_client.auth.admin.list_users()
            existing_user = None
            
            if users_response.data:
                for user in users_response.data:
                    if user.email == admin_email:
                        existing_user = user
                        break
            
            if existing_user:
                print("⚠️  Admin user already exists!")
                user_id = existing_user.id
                print(f"   User ID: {user_id}")
                print(f"   Email: {existing_user.email}")
                print(f"   Created: {existing_user.created_at}")
                
                # Update their role to admin if needed
                print("🔄 Updating user role to admin...")
                update_response = supabase_client.auth.admin.update_user_by_id(
                    user_id,
                    {
                        "user_metadata": {
                            "role": "admin",
                            "full_name": "Platform Administrator",
                            "is_active": True,
                            "is_blocked": False
                        }
                    }
                )
                
                if update_response.user:
                    print("✅ Updated existing user to admin role")
                    
                    # Try to update/create profile as well
                    try:
                        admin_profile = {
                            "id": user_id,
                            "full_name": "Platform Administrator",
                            "username": "admin",
                            "bio": "ESAL Platform Administrator with full system access",
                            "updated_at": datetime.now(timezone.utc).isoformat()
                        }
                        
                        # Try to upsert (insert or update) the profile
                        profile_result = supabase_client.table("profiles").upsert(admin_profile).execute()
                        
                        if profile_result.data:
                            print("✅ Updated admin profile in profiles table")
                        else:
                            print("⚠️  Could not update profile")
                            
                    except Exception as profile_error:
                        print(f"⚠️  Profile update failed: {profile_error}")
                    
                    print()
                    print("🎉 EXISTING ADMIN USER UPDATED SUCCESSFULLY!")
                    print("=" * 50)
                    print("Admin Portal Login Details:")
                    print(f"   Email:    {admin_email}")
                    print(f"   Password: {admin_password}")
                    print(f"   Role:     admin")
                    print(f"   User ID:  {user_id}")
                    print("🚀 You can now log into the admin portal at:")
                    print("   http://localhost:3004/login")
                    print()
                    print("⚠️  IMPORTANT: Use the existing password or reset if needed!")
                    
                    return user_id
                else:
                    print("⚠️  Could not update existing user role")
                    return user_id  # Still return the user ID as they exist
                    
        except Exception as e:
            print(f"ℹ️  Error checking for existing user: {e}")
            print("🔄 Proceeding to create new user...")
        
        print("🆕 Creating new admin user...")
        
        # Create admin user through Supabase Admin API
        auth_response = supabase_client.auth.admin.create_user({
            "email": admin_email,
            "password": admin_password,
            "email_confirm": True,  # Auto-confirm email
            "user_metadata": {
                "role": "admin",
                "full_name": "Platform Administrator",
                "is_active": True,
                "is_blocked": False
            }
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"✅ Created admin user with ID: {user_id}")
            
            # Create corresponding profile in profiles table (if profiles table exists)
            try:
                admin_profile = {
                    "id": user_id,
                    "full_name": "Platform Administrator",
                    "username": "admin",
                    "bio": "ESAL Platform Administrator with full system access",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                profile_result = supabase_client.table("profiles").insert(admin_profile).execute()
                
                if profile_result.data:
                    print("✅ Created admin profile in profiles table")
                else:
                    print("⚠️  Admin user created but profile creation failed")
                    
            except Exception as profile_error:
                print(f"⚠️  Could not create profile (profiles table may not exist): {profile_error}")
            
            print()
            print("🎉 ADMIN USER CREATED SUCCESSFULLY!")
            print("=" * 50)
            print("Admin Portal Login Details:")
            print(f"   Email:    {admin_email}")
            print(f"   Password: {admin_password}")
            print(f"   Role:     admin")
            print(f"   User ID:  {user_id}")
            print("🚀 You can now log into the admin portal at:")
            print("   http://localhost:3004/login")
            print()
            print("⚠️  IMPORTANT: Change the default password after first login!")
            
            return user_id
            
        else:
            print("❌ Failed to create admin user")
            return None
            
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def test_admin_login():
    """Test that the admin user can log in"""
    try:
        print("\n🧪 Testing Admin Login...")
        
        # Import auth service to test login
        from app.services.auth_supabase import SupabaseAuthService
        from app.schemas import UserLogin
        
        auth_service = SupabaseAuthService()
        
        # Test login
        login_data = UserLogin(
            email="admin@esal.platform",
            password="Admin123!@#"
        )
        
        result = await auth_service.login(login_data)
        
        if result and result.user.role == "admin":
            print("✅ Admin login test successful!")
            print(f"   Access Token: {result.access_token[:50]}...")
            print(f"   User Role: {result.user.role}")
            return True
        else:
            print("❌ Admin login test failed")
            return False
            
    except Exception as e:
        print(f"❌ Admin login test error: {e}")
        return False

async def main():
    """Main function to create admin user and test login"""
    print("🏗️  ESAL Platform Admin User Setup")
    print("=" * 50)
    
    # Check environment
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Error: Missing Supabase configuration")
        print("   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file")
        return False
    
    print(f"🔗 Supabase URL: {settings.SUPABASE_URL}")
    print(f"🔑 Service Key: {settings.SUPABASE_SERVICE_ROLE_KEY[:20]}...")
    print()
    
    # Create admin user
    user_id = await create_admin_user()
    
    if user_id:
        # Test login
        login_success = await test_admin_login()
        
        if login_success:
            print("\n🎉 SETUP COMPLETE!")
            print("The admin user is ready for use.")
            return True
        else:
            print("\n⚠️  Admin user created but login test failed.")
            print("You may need to check the authentication configuration.")
            return True  # User was created, so partially successful
    else:
        print("\n❌ SETUP FAILED!")
        print("Could not create admin user.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    if success:
        print("\n✅ Admin user setup completed!")
        sys.exit(0)
    else:
        print("\n❌ Admin user setup failed!")
        sys.exit(1)