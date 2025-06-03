#!/usr/bin/env python3
"""
Debug script to check auth users and test AI idea saving with real authentication
"""
import asyncio
import sys
import os
import logging
from datetime import datetime, timezone

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.services.supabase_ideas import SupabaseIdeasService
from app.config import settings
from supabase import create_client, Client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def check_auth_users():
    """Check what users exist in profiles table"""
    try:
        print("=== Checking Supabase User Profiles ===")
        
        # Use service role key to access tables
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        # Try to query profiles table (this is where user info is stored)
        print("Attempting to query profiles table...")
        
        result = supabase_client.table("profiles").select("id,full_name,username").limit(5).execute()
        
        if result.data:
            print(f"✅ Found {len(result.data)} users in profiles table:")
            for user in result.data:
                print(f"   - ID: {user['id']}")
                print(f"   - Name: {user.get('full_name', 'N/A')}")
                print(f"   - Username: {user.get('username', 'N/A')}")
                print()
        else:
            print("❌ No users found in profiles table")
            
        return result.data if result.data else []
          except Exception as e:
        print(f"❌ Error checking users: {e}")
        print("   This might mean the profiles table doesn't exist yet.")
        print("   Please run the complete_supabase_setup.sql script in your Supabase SQL Editor")
        return []

async def create_test_auth_user():
    """Create a test user through proper authentication"""
    try:
        print("=== Creating Test Auth User ===")
        
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        
        # Try to create a user through auth.admin
        test_email = "test.ai.ideas@example.com"
        test_password = "test123456"
        
        print(f"Creating auth user with email: {test_email}")
        
        # Create user through admin API
        auth_response = supabase_client.auth.admin.create_user({
            "email": test_email,
            "password": test_password,
            "email_confirm": True  # Auto-confirm email
        })
          if auth_response.user:
            user_id = auth_response.user.id
            print(f"✅ Created auth user with ID: {user_id}")
            
            # Now create corresponding profile in profiles table
            user_profile = {
                "id": user_id,
                "full_name": "Test AI User",
                "username": f"testuser_{user_id[:8]}",
                "bio": "Test user for AI idea generation",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            profile_result = supabase_client.table("profiles").insert(user_profile).execute()
            
            if profile_result.data:
                print(f"✅ Created user profile in profiles table")
                return user_id
            else:
                print(f"⚠️  Auth user created but profile creation failed")
                return user_id
                
        else:
            print("❌ Failed to create auth user")
            return None
            
    except Exception as e:
        print(f"⚠️  Error creating test user (may already exist): {e}")
        # Try to find existing user by email
        try:
            users = await check_auth_users()
            if users:
                print(f"✅ Using existing user: {users[0]['id']}")
                return users[0]['id']
        except Exception as e2:
            print(f"❌ Could not find existing user: {e2}")
        return None

async def test_ai_idea_with_auth_user():
    """Test saving AI-generated idea with proper auth user"""
    try:
        print("=== Testing AI Idea Save with Auth User ===")
        
        # Check existing users first
        existing_users = await check_auth_users()
        
        if existing_users:
            user_id = existing_users[0]['id']
            print(f"✅ Using existing user: {user_id}")
        else:
            # Create a test user
            user_id = await create_test_auth_user()
            if not user_id:
                print("❌ Could not create or find test user")
                return False
        
        # Initialize ideas service
        ideas_service = SupabaseIdeasService()
        
        # Sample AI response text
        ai_response_text = """
        **Title: Smart Waste Sorter**
        
        **Problem:** Households struggle with proper waste sorting, leading to contamination of recycling streams and increased landfill waste.
        
        **Solution:** An AI-powered smart bin with computer vision that automatically sorts waste into recycling, compost, and landfill categories. The device would use machine learning to identify materials and provide feedback to users about their waste habits.
        
        **Target Market:** Environmentally conscious homeowners and apartment complexes looking to improve their waste management and reduce environmental impact.
        
        This solution addresses the growing need for sustainable waste management in urban environments.
        """
        
        # AI metadata
        ai_metadata = {
            "generation_prompt": "smart home environmental technology",
            "ai_service": "gemini",
            "confidence_score": 0.88,
            "generation_type": "ai_generated",
            "generation_timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        print(f"\nAttempting to save AI-generated idea for authenticated user: {user_id}")
        
        # Try to save the AI-generated idea
        saved_idea = await ideas_service.create_ai_generated_idea(
            user_id=user_id,
            ai_response=ai_response_text,
            ai_metadata=ai_metadata
        )
        
        print(f"\n✅ SUCCESS! AI-generated idea saved successfully:")
        print(f"   - ID: {saved_idea['id']}")
        print(f"   - Title: {saved_idea['title']}")
        print(f"   - Description length: {len(saved_idea.get('description', ''))}")
        print(f"   - Problem: {saved_idea.get('problem', 'N/A')[:100]}...")
        print(f"   - Solution: {saved_idea.get('solution', 'N/A')[:100]}...")
        print(f"   - Target Market: {saved_idea.get('target_market', 'N/A')[:100]}...")
        print(f"   - AI Generated: {saved_idea.get('ai_generated', False)}")
        print(f"   - Created at: {saved_idea.get('created_at')}")
        
        # Test retrieving the idea
        print(f"\nTesting idea retrieval...")
        retrieved_ideas = await ideas_service.get_user_ideas(user_id)
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
            print(f"   - Has structured fields: {bool(our_idea.get('problem') and our_idea.get('solution'))}")
        else:
            print(f"❌ Created idea NOT found in user's ideas list")
            
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_ai_idea_with_auth_user())
    print(f"\n=== Test {'PASSED' if success else 'FAILED'} ===")
