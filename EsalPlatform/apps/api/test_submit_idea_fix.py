#!/usr/bin/env python3
"""
Integration test for the submit-idea endpoint
Tests the fix for the 500 Internal Server Error
"""
import asyncio
import sys
import os
import json
import pytest
from unittest.mock import AsyncMock, patch

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

@pytest.mark.asyncio
async def test_submit_idea_endpoint():
    """Test the submit-idea endpoint with frontend data structure"""
    print("🧪 Testing submit-idea endpoint integration...")
    
    try:
        # Test 1: Schema validation for frontend data
        print("\n1️⃣ Testing IdeaCreate schema with frontend data...")
        from app.schemas import IdeaCreate
        
        # This is the exact data structure sent by the frontend
        frontend_data = {
            "title": "Revolutionary AI Assistant",
            "description": "An AI assistant that helps developers write better code",
            "category": "Technology",            "tags": ["AI", "Software", "Development"],
            "status": "draft", 
            "visibility": "private"
        }
        
        # Validate against schema
        idea_create = IdeaCreate(**frontend_data)
        print("✅ IdeaCreate schema accepts frontend data structure")
        
        # Test 2: Service method with mocked Supabase
        print("\n2️⃣ Testing SupabaseIdeasService.create_idea with frontend data...")
        from app.services.supabase_ideas import SupabaseIdeasService
          # Mock the Supabase client to avoid actual database calls
        with patch('app.services.supabase_ideas.create_client') as mock_client_factory:
            # Setup mock - use Mock instead of AsyncMock since Supabase client is synchronous
            from unittest.mock import Mock
            mock_client = Mock()
            mock_client_factory.return_value = mock_client
            
            # Mock successful insert response
            mock_response = Mock()
            mock_response.data = [{
                "id": "123e4567-e89b-12d3-a456-426614174001",
                "user_id": "123e4567-e89b-12d3-a456-426614174002", 
                "title": "Revolutionary AI Assistant",
                "description": "An AI assistant that helps developers write better code",
                "category": "Technology",
                "tags": ["AI", "Software", "Development"],
                "status": "draft",
                "visibility": "private",
                "view_count": 0,
                "interest_count": 0,                
                "created_at": "2024-01-01T00:00:00+00:00",
                "updated_at": "2024-01-01T00:00:00+00:00"
            }]
            mock_response.error = None
            
            mock_client.table.return_value.insert.return_value.execute.return_value = mock_response
            
            # Create service instance
            ideas_service = SupabaseIdeasService()
            
            # Test create_idea with frontend data
            test_user_id = "123e4567-e89b-12d3-a456-426614174002"
            result = await ideas_service.create_idea(test_user_id, idea_create)
            print("✅ SupabaseIdeasService.create_idea handled frontend data successfully")
            print(f"   Result: {result}")
            
            # Verify the data passed to Supabase insert
            mock_client.table.assert_called_with("ideas")
            insert_call = mock_client.table.return_value.insert.call_args[0][0]
            
            # Check that all frontend fields are preserved
            assert insert_call["title"] == frontend_data["title"]
            assert insert_call["description"] == frontend_data["description"] 
            assert insert_call["category"] == frontend_data["category"]
            assert insert_call["tags"] == frontend_data["tags"]
            assert insert_call["status"] == frontend_data["status"]
            assert insert_call["visibility"] == frontend_data["visibility"]
            assert insert_call["user_id"] == test_user_id
            
            print("✅ All frontend fields correctly mapped to database insert")
        
        # Test 3: Router endpoint simulation
        print("\n3️⃣ Testing router endpoint with frontend data...")
        from app.routers.innovator import submit_idea
        from app.schemas import IdeaResponse, UserResponse
        from fastapi import HTTPException        # Mock the current user as a proper UserResponse object
        mock_user = UserResponse(
            id="123e4567-e89b-12d3-a456-426614174002",
            email="test@example.com",
            full_name="Test User",
            role="innovator",
            is_active=True,
            is_blocked=False,
            created_at="2024-01-01T00:00:00+00:00"
        )
        
        # Mock the ideas service
        with patch('app.routers.innovator.SupabaseIdeasService') as mock_service_class:
            mock_service = AsyncMock()
            mock_service_class.return_value = mock_service
            mock_service.create_idea.return_value = {
                "id": "123e4567-e89b-12d3-a456-426614174001",
                "user_id": "123e4567-e89b-12d3-a456-426614174002",
                "title": "Revolutionary AI Assistant", 
                "description": "An AI assistant that helps developers write better code",
                "category": "Technology",
                "tags": ["AI", "Software", "Development"],
                "status": "draft",
                "visibility": "private",
                "view_count": 0,
                "interest_count": 0,
                "created_at": "2024-01-01T00:00:00+00:00",
                "updated_at": "2024-01-01T00:00:00+00:00"
            }
            
            # Test the router function
            try:
                response = await submit_idea(idea_create, mock_user)
                print("✅ Router endpoint handled frontend data without 500 error")
                print(f"   Response type: {type(response)}")
                
                # Validate response against IdeaResponse schema
                if isinstance(response, dict):
                    idea_response = IdeaResponse(**response)
                    print("✅ Router response validates against IdeaResponse schema")
                
            except Exception as e:
                print(f"❌ Router test failed: {e}")
                raise
        
        print("\n🎉 All tests passed! The 500 Internal Server Error fix is working correctly.")
        print("   ✅ Frontend data structure is fully supported")
        print("   ✅ Backend service handles all frontend fields")
        print("   ✅ Router endpoint processes requests without errors")
        print("   ✅ Response format is correct")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        raise  # Re-raise for pytest to catch

@pytest.mark.asyncio
async def test_submit_idea_missing_fields():
    """Test submit-idea endpoint with minimal data (testing defaults)"""
    print("\n🧪 Testing submit-idea with minimal data...")
    
    try:
        from app.schemas import IdeaCreate
        
        # Test with minimal required data
        minimal_data = {
            "title": "Minimal Idea"
            # All other fields optional
        }
        
        idea_create = IdeaCreate(**minimal_data)
        print("✅ Schema accepts minimal data with defaults")
        
        # Check defaults are applied
        assert idea_create.description is None or idea_create.description == ""
        assert idea_create.category is None or idea_create.category == ""
        assert idea_create.tags is None or idea_create.tags == []
        assert idea_create.status is None or idea_create.status == "draft"
        assert idea_create.visibility is None or idea_create.visibility == "private"
        
        print("✅ Default values are correctly applied")
        
    except Exception as e:
        print(f"\n❌ Minimal data test failed: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    # For direct execution, still support asyncio.run
    async def run_tests():
        await test_submit_idea_endpoint()
        await test_submit_idea_missing_fields()
    
    asyncio.run(run_tests())
