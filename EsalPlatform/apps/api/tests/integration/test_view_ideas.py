#!/usr/bin/env python3
"""
Test script for the view-ideas endpoint data flow
"""
import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.supabase_ideas import SupabaseIdeasService

async def test_view_ideas_endpoint():
    """Test the data transformation in view-ideas endpoint"""
    print("🧪 Testing view-ideas endpoint data transformation...")
    
    try:
        # Initialize the service
        print("📡 Initializing SupabaseIdeasService...")
        ideas_service = SupabaseIdeasService()
        print("✅ Service initialized successfully")
        
        # Test with a sample user ID (replace with actual user ID for testing)
        test_user_id = "123e4567-e89b-12d3-a456-426614174000"  # Sample UUID
        
        print(f"🔍 Fetching ideas for user: {test_user_id}")
        result = await ideas_service.get_user_ideas(test_user_id)
        
        print(f"✅ Data structure: {result if len(str(result)) < 200 else 'Large response...'}")
        print(f"📊 Number of ideas returned: {len(result)}")
        
        if result:
            print("🔍 Sample idea structure:")
            sample_idea = result[0]
            for key, value in sample_idea.items():
                print(f"  {key}: {type(value).__name__} = {value}")
        else:
            print("📝 No ideas found for this user")
            
        # Test the field mappings
        print("\n🔧 Verifying field mappings:")
        expected_fields = [
            'id', 'title', 'description', 'industry', 'stage', 'status',
            'created_at', 'updated_at', 'views_count', 'interests_count',
            'user_id', 'ai_score', 'target_market', 'problem', 'solution',
            'category', 'tags', 'visibility'
        ]
        
        if result:
            sample_idea = result[0]
            for field in expected_fields:
                if field in sample_idea:
                    print(f"  ✅ {field}: {type(sample_idea[field]).__name__}")
                else:
                    print(f"  ❌ Missing: {field}")
        
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_view_ideas_endpoint())
