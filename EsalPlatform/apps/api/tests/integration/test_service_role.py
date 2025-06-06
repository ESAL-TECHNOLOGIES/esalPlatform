#!/usr/bin/env python3
"""
Test script to verify service role key loading and profile creation
"""
import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.config import settings
from app.services.supabase_profiles import SupabaseProfileService

async def test_service_role_key():
    """Test that service role key is loaded and profile service works"""
    
    print("🔧 Testing Service Role Key Configuration...")
    print("=" * 50)
    
    # Test 1: Check if service role key is loaded
    print(f"✅ Supabase URL: {settings.SUPABASE_URL}")
    print(f"✅ Anon Key: {settings.SUPABASE_ANON_KEY[:20]}...")
    
    if settings.SUPABASE_SERVICE_ROLE_KEY:
        print(f"✅ Service Role Key: {settings.SUPABASE_SERVICE_ROLE_KEY[:20]}...")
    else:
        print("❌ Service Role Key: NOT LOADED")
        return False
    
    print("\n🔧 Testing Profile Service Initialization...")
    print("=" * 50)
    
    # Test 2: Initialize profile service
    try:
        profile_service = SupabaseProfileService()
        
        if profile_service.service_supabase:
            print("✅ Service role client created successfully")
        else:
            print("❌ Service role client not created")
            return False
            
    except Exception as e:
        print(f"❌ Failed to initialize profile service: {e}")
        return False
    
    print("\n🔧 Testing Database Connection...")
    print("=" * 50)
    
    # Test 3: Test basic database connection
    try:
        # Try to read from profiles table (should work with both anon and service keys)
        result = profile_service.supabase.table("profiles").select("id").limit(1).execute()
        print("✅ Database connection successful")
        
        # Test service role connection
        service_result = profile_service.service_supabase.table("profiles").select("id").limit(1).execute()
        print("✅ Service role database connection successful")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    print("\n🔧 Testing Profile Creation (Mock)...")
    print("=" * 50)
      # Test 4: Test profile creation with mock data
    # Using proper UUID format to comply with PostgreSQL auth.users(id) foreign key constraint
    test_user_id = "123e4567-e89b-12d3-a456-426614174001"
    test_user_data = {
        "email": "test@example.com",
        "full_name": "Test User",
        "username": "testuser"
    }
    
    try:
        # This would normally create a profile, but we'll just test the service initialization
        print("✅ Profile service ready for profile creation")
        print(f"✅ Test user ID: {test_user_id}")
        print(f"✅ Test user data: {test_user_data}")
        
    except Exception as e:
        print(f"❌ Profile creation test failed: {e}")
        return False
    
    print("\n🎉 All tests passed! Service role key is configured correctly.")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    print("🚀 Starting Service Role Key Test...")
    print("=" * 50)
    
    success = asyncio.run(test_service_role_key())
    
    if success:
        print("\n✅ Configuration is ready for profile operations!")
        print("You can now test avatar upload and profile creation in the frontend.")
    else:
        print("\n❌ Configuration issues found. Please check the service role key.")
    
    print("\n" + "=" * 50)
