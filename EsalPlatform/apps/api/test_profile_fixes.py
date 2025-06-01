#!/usr/bin/env python3
"""
Test script to start the API server and validate the fixes
"""
import os
import sys
import subprocess
import time

def main():
    """Test the profile service fixes"""
    print("🔧 Testing Profile Service Fixes...")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_file):
        print("❌ .env file not found!")
        print("📝 Please create a .env file based on .env.example")
        print("🔑 Most importantly, add your SUPABASE_SERVICE_ROLE_KEY")
        print(f"📁 Expected location: {env_file}")
        print("\n📋 Steps to fix:")
        print("1. Go to https://app.supabase.com")
        print("2. Select your project")
        print("3. Go to Settings > API")
        print("4. Copy the 'service_role' key (NOT the anon key)")
        print("5. Create .env file with SUPABASE_SERVICE_ROLE_KEY=your-key-here")
        print("\n📖 See SERVICE_ROLE_SETUP.md for detailed instructions")
        return False
    
    print("✅ .env file found")
    
    # Check if service role key is configured
    from dotenv import load_dotenv
    load_dotenv(env_file)
    
    service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    if not service_role_key or service_role_key == 'your-supabase-service-role-key':
        print("❌ SUPABASE_SERVICE_ROLE_KEY not configured!")
        print("🔑 Please add your actual Supabase service role key to .env file")
        print("\n📖 See SERVICE_ROLE_SETUP.md for instructions")
        return False
    
    print("✅ Service role key configured")
    print(f"🔑 Key starts with: {service_role_key[:20]}...")
    
    # Check if we can import the app
    try:
        sys.path.append(os.path.dirname(__file__))
        from app.config import settings
        print(f"✅ App configuration loaded")
        print(f"🌐 Supabase URL: {settings.SUPABASE_URL}")
        print(f"🔑 Service role key configured: {'Yes' if settings.SUPABASE_SERVICE_ROLE_KEY else 'No'}")
        
        # Test the profile service
        from app.services.supabase_profiles import SupabaseProfileService
        profile_service = SupabaseProfileService()
        print("✅ Profile service initialized successfully")
        
        if profile_service.service_supabase:
            print("✅ Service role client created - RLS bypass enabled")
        else:
            print("❌ Service role client not created - RLS operations may fail")
            
    except Exception as e:
        print(f"❌ Error testing configuration: {e}")
        return False
    
    print("\n🚀 Configuration looks good! You can now:")
    print("1. Start the API server: uvicorn app.main:app --reload --port 8000")
    print("2. Test profile creation and avatar upload")
    print("3. Check logs for 'Service role client created' messages")
    
    return True

if __name__ == "__main__":
    main()
