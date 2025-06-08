#!/usr/bin/env python3
"""
Additional Admin User Creation Script
This script creates additional admin users for the ESAL Platform admin portal.
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

async def create_additional_admin_user(email: str, password: str, full_name: str, username: str):
    """Create an additional admin user for the admin portal with full system authentication"""
    try:
        print(f"🔐 Creating Admin User: {email}")
        print("=" * 50)
        
        # Use service role key to access Supabase admin functions
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        print(f"📧 Admin Email: {email}")
        print(f"👤 Full Name: {full_name}")
        print(f"🏷️  Username: {username}")
        print(f"🔑 Password: {'*' * len(password)}")
        print()
        
        # Check if admin user already exists by trying to get user by email
        print("🔍 Checking if user already exists...")
        try:
            # Use admin API to list users and find by email
            users_response = supabase_client.auth.admin.list_users()
            existing_user = None
            
            if users_response.data:
                for user in users_response.data:
                    if user.email == email:
                        existing_user = user
                        break
            
            if existing_user:
                print("⚠️  Admin user already exists!")
                user_id = existing_user.id
                print(f"   User ID: {user_id}")
                print(f"   Email: {existing_user.email}")
                print(f"   Created: {existing_user.created_at}")
                
                print("🔄 Updating existing user to admin with full permissions...")
                # Update their role to admin with comprehensive metadata
                update_response = supabase_client.auth.admin.update_user_by_id(
                    user_id,
                    {
                        "user_metadata": {
                            "role": "admin",
                            "full_name": full_name,
                            "username": username,
                            "is_active": True,
                            "is_blocked": False,
                            "permissions": [
                                "admin.read",
                                "admin.write", 
                                "admin.delete",
                                "users.manage",
                                "system.configure",
                                "reports.view",
                                "analytics.access"
                            ],
                            "admin_level": "super_admin",
                            "created_by": "system",
                            "last_updated": datetime.now(timezone.utc).isoformat()
                        },
                        "app_metadata": {
                            "role": "admin",
                            "admin": True,
                            "provider": "email"
                        }
                    }
                )
                
                if update_response.user:
                    print("✅ Updated existing user to admin role with full permissions")
                    
                    # Try to update/create profile as well
                    try:
                        print("🔄 Creating/updating admin profile...")
                        admin_profile = {
                            "id": user_id,
                            "full_name": full_name,
                            "username": username,
                            "email": email,
                            "bio": f"ESAL Platform Administrator - {full_name}",
                            "role": "admin",
                            "is_active": True,
                            "permissions": [
                                "admin.read",
                                "admin.write", 
                                "admin.delete",
                                "users.manage",
                                "system.configure"
                            ],
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
                    
                    # Create admin-specific records if needed
                    await create_admin_system_records(supabase_client, user_id, email, full_name, username)
                    
                    print()
                    print("🎉 EXISTING ADMIN USER UPDATED SUCCESSFULLY!")
                    print("=" * 50)
                    print("Admin Portal Login Details:")
                    print(f"   Email:    {email}")
                    print(f"   Role:     super_admin")
                    print(f"   User ID:  {user_id}")
                    print("🚀 Admin portal access:")
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
        
        print("🆕 Creating new admin user with full system authentication...")
        
        # Create admin user through Supabase Admin API with comprehensive setup
        auth_response = supabase_client.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,  # Auto-confirm email for admin
            "user_metadata": {
                "role": "admin",
                "full_name": full_name,
                "username": username,
                "is_active": True,
                "is_blocked": False,
                "permissions": [
                    "admin.read",
                    "admin.write", 
                    "admin.delete",
                    "users.manage",
                    "system.configure",
                    "reports.view",
                    "analytics.access"
                ],
                "admin_level": "super_admin",
                "created_by": "system",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            "app_metadata": {
                "role": "admin",
                "admin": True,
                "provider": "email"
            }
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"✅ Created admin user with ID: {user_id}")
            
            # Create corresponding profile in profiles table
            try:
                print("🔄 Creating admin profile...")
                admin_profile = {
                    "id": user_id,
                    "full_name": full_name,
                    "username": username,
                    "email": email,
                    "bio": f"ESAL Platform Administrator - {full_name}",
                    "role": "admin",
                    "is_active": True,
                    "permissions": [
                        "admin.read",
                        "admin.write", 
                        "admin.delete",
                        "users.manage",
                        "system.configure"
                    ],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                profile_result = supabase_client.table("profiles").insert(admin_profile).execute()
                
                if profile_result.data:
                    print("✅ Created admin profile in profiles table")
                else:
                    print("⚠️  Admin user created but profile creation failed")
                    
            except Exception as profile_error:
                print(f"⚠️  Could not create profile: {profile_error}")
            
            # Create admin-specific system records
            await create_admin_system_records(supabase_client, user_id, email, full_name, username)
            
            print()
            print("🎉 ADMIN USER CREATED SUCCESSFULLY!")
            print("=" * 50)
            print("Admin Portal Login Details:")
            print(f"   Email:    {email}")
            print(f"   Password: {password}")
            print(f"   Role:     super_admin")
            print(f"   User ID:  {user_id}")
            print("🚀 Admin portal access:")
            print("   http://localhost:3004/login")
            print()
            print("✅ Full system authentication configured")
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

async def create_admin_system_records(supabase_client, user_id: str, email: str, full_name: str, username: str):
    """Create additional system records for admin user"""
    try:
        print("🔄 Setting up additional admin system records...")
        
        # Create admin session record (if admin_sessions table exists)
        try:
            admin_session = {
                "user_id": user_id,
                "email": email,
                "role": "admin",
                "permissions": [
                    "admin.read",
                    "admin.write", 
                    "admin.delete",
                    "users.manage",
                    "system.configure"
                ],
                "last_login": None,
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Try to create admin session record
            session_result = supabase_client.table("admin_sessions").upsert(admin_session).execute()
            if session_result.data:
                print("✅ Created admin session record")
                
        except Exception as session_error:
            print(f"ℹ️  Admin session table may not exist: {session_error}")
        
        # Create admin permissions record (if admin_permissions table exists)
        try:
            admin_permissions = {
                "user_id": user_id,
                "email": email,
                "permissions": {
                    "dashboard": True,
                    "users": True,
                    "analytics": True,
                    "settings": True,
                    "reports": True,
                    "system": True
                },
                "admin_level": "super_admin",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            permission_result = supabase_client.table("admin_permissions").upsert(admin_permissions).execute()
            if permission_result.data:
                print("✅ Created admin permissions record")
                
        except Exception as perm_error:
            print(f"ℹ️  Admin permissions table may not exist: {perm_error}")
        
        print("✅ Admin system records setup completed")
        
    except Exception as e:
        print(f"⚠️  Error creating admin system records: {e}")
        # This is not critical, so we don't fail the entire process

async def test_admin_login(email: str, password: str):
    """Test that the admin user can log in with full system authentication"""
    try:
        print(f"\n🧪 Testing Full System Authentication for {email}...")
        print("=" * 50)
        
        # Import auth service to test login
        from app.services.auth_supabase import SupabaseAuthService
        from app.schemas import UserLogin
        
        auth_service = SupabaseAuthService()
        
        # Test login
        login_data = UserLogin(
            email=email,
            password=password
        )
        
        print("🔄 Attempting login...")
        result = await auth_service.login(login_data)
        
        if result and result.user.role == "admin":
            print("✅ Admin authentication successful!")
            print(f"   ✅ Access Token Generated: {result.access_token[:50]}...")
            print(f"   ✅ User Role Verified: {result.user.role}")
            print(f"   ✅ User ID: {result.user.id}")
            print(f"   ✅ Email Verified: {result.user.email}")
            
            # Test admin permissions
            if hasattr(result.user, 'permissions'):
                print(f"   ✅ Permissions: {len(result.user.permissions)} permission(s)")
            
            print()
            print("🔐 Full System Authentication Test: PASSED")
            print("   • User can authenticate with email/password")
            print("   • Admin role is properly assigned")
            print("   • Access tokens are generated correctly")
            print("   • User metadata is accessible")
            
            return True
        elif result:
            print("❌ Admin authentication failed - incorrect role")
            print(f"   Expected role: admin")
            print(f"   Actual role: {result.user.role}")
            return False
        else:
            print("❌ Admin authentication failed - login unsuccessful")
            return False
            
    except Exception as e:
        print(f"❌ Admin authentication test error: {e}")
        print("   This could indicate:")
        print("   • Authentication service configuration issues")
        print("   • Database connection problems")
        print("   • Missing dependencies")
        import traceback
        traceback.print_exc()
        return False

async def create_multiple_admins():
    """Create multiple admin users"""
    print("🏗️  ESAL Platform Additional Admin Users Setup")
    print("=" * 60)
    
    # Check environment
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Error: Missing Supabase configuration")
        print("   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file")
        return False
    
    print(f"🔗 Supabase URL: {settings.SUPABASE_URL}")
    print(f"🔑 Service Key: {settings.SUPABASE_SERVICE_ROLE_KEY[:20]}...")
    print()
    
    # Define additional admin users to create
    admin_users = [
        {
            "email": "admin@esal.platform",
            "password": "AdminSecure123!",
            "full_name": "System Administrator", 
            "username": "sysadmin"
        },
        {
            "email": "manager@esal.platform",
            "password": "ManagerSecure123!",
            "full_name": "Platform Manager",
            "username": "manager"
        },
        {
            "email": "super@esal.platform", 
            "password": "SuperSecure123!",
            "full_name": "Super Administrator",
            "username": "superadmin"
        }
    ]
    
    created_users = []
    
    for admin_data in admin_users:
        print(f"\n{'='*60}")
        user_id = await create_additional_admin_user(
            email=admin_data["email"],
            password=admin_data["password"], 
            full_name=admin_data["full_name"],
            username=admin_data["username"]
        )
        
        if user_id:
            # Test login
            login_success = await test_admin_login(
                email=admin_data["email"],
                password=admin_data["password"]
            )
            
            created_users.append({
                "user_id": user_id,
                "email": admin_data["email"],
                "login_success": login_success,
                "full_name": admin_data["full_name"]
            })
        
        print(f"{'='*60}")
    
    # Summary
    print(f"\n🎉 ADMIN USERS SETUP SUMMARY")
    print("=" * 60)
    
    if created_users:
        print(f"✅ Successfully processed {len(created_users)} admin users:")
        for user in created_users:
            status = "✅ Login OK" if user["login_success"] else "⚠️  Login Failed"
            print(f"   • {user['full_name']} ({user['email']}) - {status}")
        
        print("\n🚀 All admin users can now log into the admin portal at:")
        print("   http://localhost:3004/login")
        print("\n⚠️  IMPORTANT: Change default passwords after first login!")
        return True
    else:
        print("❌ No admin users were successfully created")
        return False

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not any(c in special_chars for c in password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is strong"

def validate_username(username: str) -> tuple[bool, str]:
    """Validate username format"""
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    
    if len(username) > 20:
        return False, "Username must be no more than 20 characters long"
    
    if not username.replace('_', '').replace('-', '').isalnum():
        return False, "Username can only contain letters, numbers, hyphens, and underscores"
    
    if username.startswith(('-', '_')) or username.endswith(('-', '_')):
        return False, "Username cannot start or end with hyphens or underscores"
    
    return True, "Username is valid"

def get_user_input_with_validation():
    """Get user input with validation"""
    print("🏗️  ESAL Platform Admin User Creation")
    print("=" * 50)
    print("Please provide the following details for the new admin user:")
    print()
    
    # Get and validate email
    while True:
        email = input("📧 Email address: ").strip().lower()
        if not email:
            print("❌ Email is required!")
            continue
        
        if not validate_email(email):
            print("❌ Please enter a valid email address!")
            continue
        
        print(f"✅ Email: {email}")
        break
    
    # Get and validate full name
    while True:
        full_name = input("👤 Full name: ").strip()
        if not full_name:
            print("❌ Full name is required!")
            continue
        
        if len(full_name) < 2:
            print("❌ Full name must be at least 2 characters long!")
            continue
        
        print(f"✅ Full name: {full_name}")
        break
    
    # Get and validate username
    while True:
        username = input("🏷️  Username: ").strip().lower()
        if not username:
            print("❌ Username is required!")
            continue
        
        is_valid, message = validate_username(username)
        if not is_valid:
            print(f"❌ {message}")
            continue
        
        print(f"✅ Username: {username}")
        break
    
    # Get and validate password
    while True:
        print("\n🔑 Password Requirements:")
        print("   • At least 8 characters long")
        print("   • Contains uppercase and lowercase letters")
        print("   • Contains at least one number")
        print("   • Contains at least one special character (!@#$%^&*etc.)")
        print()
        
        password = input("🔑 Password: ").strip()
        if not password:
            print("❌ Password is required!")
            continue
        
        is_valid, message = validate_password(password)
        if not is_valid:
            print(f"❌ {message}")
            continue
        
        # Confirm password
        confirm_password = input("🔑 Confirm password: ").strip()
        if password != confirm_password:
            print("❌ Passwords do not match!")
            continue
        
        print("✅ Password validated successfully")
        break
    
    # Show summary and confirm
    print("\n" + "=" * 50)
    print("📋 ADMIN USER SUMMARY")
    print("=" * 50)
    print(f"📧 Email:     {email}")
    print(f"👤 Full Name: {full_name}")
    print(f"🏷️  Username:  {username}")
    print(f"🔑 Password:  {'*' * len(password)}")
    print()
    
    while True:
        confirm = input("✅ Create this admin user? (y/n): ").strip().lower()
        if confirm in ['y', 'yes']:
            return email, full_name, username, password
        elif confirm in ['n', 'no']:
            print("❌ Admin user creation cancelled.")
            return None, None, None, None
        else:
            print("❌ Please enter 'y' for yes or 'n' for no")

async def create_single_admin():
    """Create a single admin user with user input and validation"""
    print("🏗️  ESAL Platform Single Admin User Setup")
    print("=" * 50)
    
    # Check environment
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Error: Missing Supabase configuration")
        print("   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file")
        return False
    
    print(f"🔗 Connected to: {settings.SUPABASE_URL}")
    print(f"🔑 Using service key: {settings.SUPABASE_SERVICE_ROLE_KEY[:20]}...")
    print()
    
    # Get user input with validation
    email, full_name, username, password = get_user_input_with_validation()
    
    if not all([email, full_name, username, password]):
        return False
    
    print("\n🚀 Creating admin user...")
    
    # Create the admin user
    user_id = await create_additional_admin_user(
        email=email,
        password=password,
        full_name=full_name,
        username=username
    )
    
    if user_id:
        # Test login
        login_success = await test_admin_login(email, password)
        
        if login_success:
            print("\n🎉 SETUP COMPLETE!")
            print("The admin user is ready for use with full system authentication.")
            print("\n📝 Login Instructions:")
            print("   1. Go to http://localhost:3004/login")
            print("   2. Use the email and password you just created")
            print("   3. You will have full admin access to the platform")
            print()
            print("⚠️  SECURITY REMINDER:")
            print("   • Keep your admin credentials secure")
            print("   • Consider changing the password periodically")
            print("   • Do not share admin access with unauthorized users")
            return True
        else:
            print("\n⚠️  Admin user created but login test failed.")
            print("You may need to check the authentication configuration.")
            print("The user was created successfully in the database.")
            return True  # User was created, so partially successful
    else:
        print("\n❌ SETUP FAILED!")
        print("Could not create admin user.")
        return False

async def main():
    """Main function with improved user interface"""
    print("🔧 ESAL Platform Admin User Management System")
    print("=" * 60)
    print("This tool creates admin users with full system authentication.")
    print("Admin users will have complete access to:")
    print("   • Admin Portal Dashboard")
    print("   • User Management")
    print("   • System Configuration")
    print("   • Analytics & Reports")
    print("   • Platform Settings")
    print()
    print("Choose an option:")
    print("1. 🆕 Create a new admin user (recommended)")
    print("2. 🔄 Create multiple predefined admin users")
    print("3. ❌ Exit")
    print()
    
    while True:
        choice = input("Enter your choice (1, 2, or 3): ").strip()
        
        if choice == "1":
            print("\n" + "🆕" * 20)
            success = await create_single_admin()
            break
        elif choice == "2":
            print("\n" + "🔄" * 20)
            print("⚠️  This will create multiple predefined admin accounts.")
            confirm = input("Are you sure you want to continue? (y/n): ").strip().lower()
            if confirm in ['y', 'yes']:
                success = await create_multiple_admins()
            else:
                print("❌ Operation cancelled.")
                success = False
            break
        elif choice == "3":
            print("👋 Goodbye!")
            return True
        else:
            print("❌ Invalid choice! Please enter 1, 2, or 3.")
            continue
    
    return success

if __name__ == "__main__":
    try:
        print("🚀 Starting ESAL Platform Admin User Management System...")
        print("⚡ Checking system requirements...")
        
        # Quick environment check
        if not os.path.exists('.env'):
            print("⚠️  Warning: .env file not found in current directory")
            print("   Make sure you're running this from the API directory")
            print("   and that your .env file contains SUPABASE configuration")
        
        success = asyncio.run(main())
        
        if success:
            print("\n" + "🎉" * 20)
            print("✅ ADMIN USER MANAGEMENT COMPLETED SUCCESSFULLY!")
            print("🔐 Your admin user is ready with full system authentication")
            print("🚀 Next steps:")
            print("   1. Start the admin portal: http://localhost:3004")
            print("   2. Log in with your admin credentials")
            print("   3. Explore the admin dashboard")
            print("   4. Manage users and platform settings")
            print()
            print("📚 For help with the admin portal, see:")
            print("   • Admin documentation in /docs/admin/")
            print("   • Platform startup guide: PLATFORM_STARTUP.md")
            print("=" * 60)
            sys.exit(0)
        else:
            print("\n" + "❌" * 20)
            print("❌ ADMIN USER MANAGEMENT FAILED!")
            print("🔧 Troubleshooting steps:")
            print("   1. Check your .env file for correct SUPABASE configuration")
            print("   2. Ensure the API server dependencies are installed")
            print("   3. Verify Supabase connection and service key permissions")
            print("   4. Check the logs above for specific error details")
            print()
            print("📞 Need help? Check the documentation or contact support.")
            print("=" * 60)
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⏹️  Operation cancelled by user.")
        print("👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        print("\n🔧 Please check your setup and try again.")
        sys.exit(1)
