#!/usr/bin/env python3
"""
Debug script to test AI-generated idea database saving
"""
import asyncio
import sys
import os
import logging
import uuid
from datetime import datetime, timezone

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.services.supabase_ideas import SupabaseIdeasService
from app.config import settings
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_test_user(supabase_client) -> str:
    """Create a test user if one doesn't exist"""
    try:
        test_user_id = str(uuid.uuid4())
        
        # Create test user in the users table
        user_data = {
            "id": test_user_id,
            "email": "test@example.com",
            "full_name": "Test User",
            "role": "innovator",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase_client.table("users").insert(user_data).execute()
        
        if result.data:
            print(f"✅ Created test user with ID: {test_user_id}")
            return test_user_id
        else:
            print("❌ Failed to create test user")
            return None
            
    except Exception as e:
        print(f"⚠️  Error creating test user (may already exist): {e}")
        # Try to find an existing user
        try:
            result = supabase_client.table("users").select("id").limit(1).execute()
            if result.data:
                existing_user_id = result.data[0]["id"]
                print(f"✅ Using existing user ID: {existing_user_id}")
                return existing_user_id
        except Exception as e2:
            print(f"❌ Could not find existing user: {e2}")
        return None

async def test_ai_idea_save():
    """Test saving an AI-generated idea to the database"""
    try:
        print("=== Testing AI-Generated Idea Database Save ===")
        print(f"Supabase URL: {settings.SUPABASE_URL}")
        print(f"Using service role key: {'Yes' if hasattr(settings, 'SUPABASE_SERVICE_ROLE_KEY') and settings.SUPABASE_SERVICE_ROLE_KEY else 'No'}")
          # Initialize ideas service
        ideas_service = SupabaseIdeasService()
        
        # Create or get a test user ID
        # Use service role key for user creation too
        service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
        if service_key:
            supabase_client = create_client(settings.SUPABASE_URL, service_key)
        else:
            supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        
        test_user_id = await create_test_user(supabase_client)
        
        if not test_user_id:
            print("❌ Could not create or find test user")
            return False
        
        # Sample AI response text
        ai_response_text = """
        **Title: EcoPackage Tracker**
        
        **Problem:** Many consumers want to make environmentally conscious purchasing decisions but lack easy access to information about product packaging sustainability and disposal methods.
        
        **Solution:** A mobile app that uses image recognition to scan product barcodes and packaging, providing instant information about recyclability, composting options, and eco-friendly alternatives. The app would also track users' environmental impact over time.
        
        **Target Market:** Environmentally conscious consumers aged 25-45, particularly millennials and Gen Z who are tech-savvy and willing to pay premium for sustainable products.
        
        This idea leverages the growing environmental awareness trend and provides actionable insights for everyday shopping decisions.
        """
        
        # AI metadata
        ai_metadata = {
            "generation_prompt": "environmental sustainability consumer apps",
            "ai_service": "gemini",
            "confidence_score": 0.85,
            "generation_type": "ai_generated",
            "generation_timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        print(f"\nAttempting to save AI-generated idea for user: {test_user_id}")
        print(f"AI Response length: {len(ai_response_text)} characters")
        
        # Try to save the AI-generated idea
        saved_idea = await ideas_service.create_ai_generated_idea(
            user_id=test_user_id,
            ai_response=ai_response_text,
            ai_metadata=ai_metadata
        )
        
        print(f"\n✅ SUCCESS! AI-generated idea saved successfully:")
        print(f"   - ID: {saved_idea['id']}")
        print(f"   - Title: {saved_idea['title']}")
        print(f"   - Description length: {len(saved_idea.get('description', ''))}")
        print(f"   - AI Generated: {saved_idea.get('ai_generated', False)}")
        print(f"   - Created at: {saved_idea.get('created_at')}")
        
        # Test retrieving the idea
        print(f"\nTesting idea retrieval...")
        retrieved_ideas = await ideas_service.get_user_ideas(test_user_id)
        print(f"Total user ideas found: {len(retrieved_ideas)}")
        
        # Find our created idea
        our_idea = None
        for idea in retrieved_ideas:
            if idea['id'] == saved_idea['id']:
                our_idea = idea
                break
                
        if our_idea:
            print(f"✅ Created idea found in user's ideas list!")
            print(f"   - Title: {our_idea['title']}")
            print(f"   - AI Generated: {our_idea.get('ai_generated', False)}")
        else:
            print(f"❌ Created idea NOT found in user's ideas list")
            
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_ai_idea_save())
    print(f"\n=== Test {'PASSED' if success else 'FAILED'} ===")
