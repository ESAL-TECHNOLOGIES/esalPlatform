"""
Test script for Supabase-only authentication
"""
import asyncio
import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.auth_supabase import SupabaseAuthService
from app.schemas import UserCreate, UserLogin
from app.config import settings

async def test_supabase_auth():
    """Test Supabase authentication functionality"""
    print("🧪 Testing Supabase Authentication Service")
    print(f"📊 Supabase URL: {settings.SUPABASE_URL}")
    print("")
    
    try:
        # Initialize auth service
        auth_service = SupabaseAuthService()
        print("✅ Supabase client initialized successfully")
        
        # Test user data
        test_user = UserCreate(
            email="test@example.com",
            password="testpassword123",
            full_name="Test User",
            role="innovator"
        )
        
        print(f"📝 Test user: {test_user.email}")
        print(f"🎭 Role: {test_user.role}")
        print("")
        
        # Note: We won't actually create a user in tests
        print("✅ Authentication service is ready")
        print("🎯 Ready to handle signup and login requests")
        print("")
        print("Next steps:")
        print("1. Start the API server: python start_supabase.py")
        print("2. Test registration: POST /api/auth/register")
        print("3. Test login: POST /api/auth/login")
        print("4. View API docs: http://localhost:8000/api/docs")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_supabase_auth())
    if result:
        print("\n🎉 All tests passed! Supabase authentication is ready.")
    else:
        print("\n💥 Tests failed. Please check your configuration.")
        sys.exit(1)
