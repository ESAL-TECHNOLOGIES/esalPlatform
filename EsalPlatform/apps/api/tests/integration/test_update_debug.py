#!/usr/bin/env python3
"""
Test script to debug the idea update functionality
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

from app.services.supabase_ideas import SupabaseIdeasService
from app.schemas import IdeaUpdate

async def test_update():
    """Test the update functionality with debugging"""
    try:
        print("=== Testing Idea Update Functionality ===")
        
        # Initialize the service
        service = SupabaseIdeasService()
          # Test user ID (using one from the database that has ideas)
        test_user_id = "152df5bf-cd2b-4ecc-a8de-0a528f22cccc"  # User with multiple ideas
        
        print(f"Testing with user ID: {test_user_id}")
        
        # First, get user ideas to find one we can update
        print("\n1. Fetching user ideas...")
        ideas = await service.get_user_ideas(test_user_id)
        
        if not ideas:
            print("No ideas found for user. Please create an idea first.")
            return
            
        print(f"Found {len(ideas)} ideas")
        
        # Use the first idea for testing
        test_idea = ideas[0]
        idea_id = test_idea["id"]
        
        print(f"\n2. Testing update for idea ID: {idea_id}")
        print(f"Current title: {test_idea.get('title', 'N/A')}")
        
        # Create update data similar to what frontend sends
        update_data = IdeaUpdate(
            title="Updated Test Title",
            description="Updated Test Description", 
            category="Technology",
            industry="Technology",
            stage="idea",
            problem="Updated Test Problem",
            solution="Updated Test Solution",
            target_market="Updated Test Market",
            tags=["test", "updated"]
        )
        
        print(f"\n3. Update data:")
        print(f"   - title: {update_data.title}")
        print(f"   - description: {update_data.description}")
        print(f"   - category: {update_data.category}")
        print(f"   - tags: {update_data.tags}")
          # Perform the update
        print(f"\n4. Performing update...")
        result = await service.update_idea(idea_id, test_user_id, update_data)
        
        if result:
            print("✅ Update successful!")
            print(f"Updated title: {result.get('title', 'N/A')}")
            print(f"Updated at: {result.get('updated_at', 'N/A')}")
        else:
            print("❌ Update failed - no result returned")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"Error type: {type(e).__name__}")
        if hasattr(e, 'detail'):
            print(f"Error detail: {e.detail}")
        if hasattr(e, 'status_code'):
            print(f"Status code: {e.status_code}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_update())
