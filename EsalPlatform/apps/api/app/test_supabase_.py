"""
Simple test to verify Supabase initialization
"""
import pytest
import asyncio
from supabase import create_client, Client
from app.config import settings


class TestSupabaseInitialization:
    """Test Supabase client initialization and basic connectivity"""
    
    def test_supabase_client_creation(self):
        """Test that Supabase client can be created with current settings"""
        try:
            # Try to create Supabase client using app settings
            supabase_client: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
            
            # Verify client was created successfully
            assert supabase_client is not None
            assert hasattr(supabase_client, 'auth')
            assert hasattr(supabase_client, 'table')
            
            print("✅ Supabase client created successfully")
            
        except Exception as e:
            pytest.fail(f"Failed to create Supabase client: {str(e)}")
    
    def test_supabase_config_values(self):
        """Test that Supabase configuration values are properly set"""
        # Check that URL is not empty and has correct format
        assert settings.SUPABASE_URL is not None
        assert settings.SUPABASE_URL.startswith("https://")
        assert ".supabase.co" in settings.SUPABASE_URL
        
        # Check that anonymous key is not empty and has JWT format
        assert settings.SUPABASE_ANON_KEY is not None
        assert len(settings.SUPABASE_ANON_KEY) > 20  # JWT tokens are much longer
        assert settings.SUPABASE_ANON_KEY.count('.') == 2  # JWT has 3 parts separated by dots
        
        print(f"✅ Supabase URL: {settings.SUPABASE_URL}")
        print(f"✅ Anonymous key length: {len(settings.SUPABASE_ANON_KEY)} characters")
    
    @pytest.mark.asyncio
    async def test_supabase_basic_connection(self):
        """Test basic connection to Supabase by checking auth status"""
        try:
            # Create client
            supabase_client: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
            
            # Try to get session (should work even if no user is logged in)
            session = supabase_client.auth.get_session()
            
            # Session can be None for anonymous users, which is expected
            print(f"✅ Supabase auth session check completed")
            print(f"   Current session: {'Active' if session else 'None (anonymous)'}")
            
            # Try to access a basic auth method
            user = supabase_client.auth.get_user()
            print(f"✅ Supabase auth.get_user() accessible")
            print(f"   Current user: {'Logged in' if user else 'Anonymous'}")
            
        except Exception as e:
            pytest.fail(f"Failed to connect to Supabase: {str(e)}")
    
    def test_auth_service_initialization(self):
        """Test that AuthService can initialize Supabase client correctly"""
        from app.services.auth import AuthService
        from sqlalchemy.orm import Session
        from app.database import SessionLocal
        
        try:
            # Create a test database session
            db: Session = SessionLocal()
            
            # Initialize AuthService
            auth_service = AuthService(db)
            
            # Verify the service was created and has Supabase client
            assert auth_service is not None
            assert auth_service.supabase is not None
            assert isinstance(auth_service.supabase, Client)
            
            print("✅ AuthService initialized successfully with Supabase client")
            
            # Clean up
            db.close()
            
        except Exception as e:
            pytest.fail(f"Failed to initialize AuthService: {str(e)}")


def run_test_manually():
    """Run the test manually without pytest for quick verification"""
    print("🧪 Testing Supabase Initialization")
    print("=" * 50)
    
    test_instance = TestSupabaseInitialization()
    
    try:
        print("\n1. Testing Supabase client creation...")
        test_instance.test_supabase_client_creation()
        
        print("\n2. Testing Supabase configuration...")
        test_instance.test_supabase_config_values()
        
        print("\n3. Testing AuthService initialization...")
        test_instance.test_auth_service_initialization()
        
        print("\n4. Testing basic connection...")
        # Run async test
        asyncio.run(test_instance.test_supabase_basic_connection())
        
        print("\n" + "=" * 50)
        print("🎉 All Supabase initialization tests passed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False
    
    return True


if __name__ == "__main__":
    # Run the test manually when script is executed directly
    success = run_test_manually()
    exit(0 if success else 1)
