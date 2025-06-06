#!/usr/bin/env python3
"""
Simple script to test authentication and get available ideas for testing
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_auth_flow():
    """Test different authentication endpoints to find working credentials"""
    
    print("🔐 Testing Authentication Flow")
    print("=" * 50)
    
    # First, let's check if the backend is running
    try:
        health_response = requests.get(f"{BASE_URL}/docs", timeout=5)
        if health_response.status_code == 200:
            print("✅ Backend server is running and accessible")
        else:
            print(f"⚠️ Backend responded with status: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return None
    
    # Try to register a test user first
    print("\n👤 Attempting to register a test user...")
    register_url = f"{API_BASE}/auth/register"
    
    test_user = {
        "email": "testuser@example.com",
        "full_name": "Test User",
        "password": "testpassword123",
        "role": "innovator"
    }
    
    try:
        register_response = requests.post(register_url, json=test_user)
        print(f"Registration status: {register_response.status_code}")
        
        if register_response.status_code == 200:
            print("✅ Test user registered successfully")
            registration_data = register_response.json()
            if "access_token" in registration_data:
                return registration_data["access_token"]
        elif register_response.status_code == 400:
            # User might already exist, try login
            print("ℹ️ User might already exist, trying to login...")
        else:
            print(f"Registration response: {register_response.text}")
    except Exception as e:
        print(f"Registration error: {e}")
    
    # Try to login with the test user
    print("\n🔑 Attempting to login with test user...")
    login_url = f"{API_BASE}/auth/login-json"
    
    login_data = {
        "email": "testuser@example.com",
        "password": "testpassword123"
    }
    
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            print("✅ Login successful!")
            login_result = login_response.json()
            return login_result.get("access_token")
        else:
            print(f"Login failed: {login_response.text}")
    except Exception as e:
        print(f"Login error: {e}")
    
    return None

def test_with_token(token):
    """Test API endpoints with the token"""
    if not token:
        print("❌ No token available for testing")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n🎯 Testing with token: {token[:20]}...")
    
    # Test viewing ideas
    print("\n📋 Testing view ideas endpoint...")
    try:
        ideas_response = requests.get(f"{API_BASE}/innovator/view-ideas", headers=headers)
        print(f"View ideas status: {ideas_response.status_code}")
        
        if ideas_response.status_code == 200:
            ideas = ideas_response.json()
            print(f"✅ Found {len(ideas)} ideas")
            
            # Show first few ideas
            for i, idea in enumerate(ideas[:3]):
                print(f"  Idea {i+1}: {idea.get('id')} - {idea.get('title', 'No title')}")
            
            return ideas
        else:
            print(f"❌ View ideas failed: {ideas_response.text}")
    except Exception as e:
        print(f"❌ Error viewing ideas: {e}")
    
    return []

def test_update_existing_idea(token, ideas):
    """Test updating an existing idea if any exist"""
    if not ideas:
        print("⚠️ No existing ideas to test update")
        return False
    
    idea = ideas[0]  # Use the first idea
    idea_id = idea.get('id')
    
    print(f"\n✏️ Testing update on idea {idea_id}...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    update_data = {
        "title": f"Updated: {idea.get('title', 'Test Title')}",
        "description": "This description was updated by the test script",
        "category": "Technology",
        "tags": ["test", "updated"],
        "problem": "Testing the update functionality",
        "solution": "Automated verification after bug fixes",
        "target_market": "Test environment"
    }
    
    try:
        update_response = requests.put(
            f"{API_BASE}/innovator/update-idea/{idea_id}", 
            headers=headers, 
            json=update_data
        )
        
        print(f"Update status: {update_response.status_code}")
        
        if update_response.status_code == 200:
            print("✅ Update successful!")
            updated_idea = update_response.json()
            print(f"New title: {updated_idea.get('title', 'N/A')}")
            return True
        else:
            print(f"❌ Update failed: {update_response.text}")
    except Exception as e:
        print(f"❌ Update error: {e}")
    
    return False

def main():
    print("🧪 ESAL Platform - Authentication & Update Test")
    print("=" * 60)
    
    # Get authentication token
    token = test_auth_flow()
    
    if not token:
        print("\n❌ Could not obtain authentication token")
        print("Please check:")
        print("1. Backend server is running on localhost:8000")
        print("2. Database is accessible")
        print("3. Registration/login endpoints are working")
        return
    
    # Test API calls with token
    ideas = test_with_token(token)
    
    # Test update functionality
    if ideas:
        success = test_update_existing_idea(token, ideas)
        
        print("\n" + "=" * 60)
        print("📊 FINAL RESULTS:")
        if success:
            print("✅ COMPLETE SUCCESS! All functionality is working:")
            print("  ✅ Authentication working")
            print("  ✅ Ideas retrieval working")
            print("  ✅ Idea update working")
            print("  ✅ Both original issues have been resolved!")
        else:
            print("⚠️ Partial success - authentication works but update needs attention")
    else:
        print("\n" + "=" * 60)
        print("📊 PARTIAL RESULTS:")
        print("✅ Authentication is working")
        print("⚠️ No ideas available to test update functionality")
        print("💡 You can create ideas via the frontend to test updates")

if __name__ == "__main__":
    main()
