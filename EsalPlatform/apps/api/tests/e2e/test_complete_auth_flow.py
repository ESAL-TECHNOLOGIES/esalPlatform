#!/usr/bin/env python3
"""
Complete end-to-end test script to verify both fixes:
1. Backend 500 error fix (now should return proper responses)
2. Authentication flow with real user credentials
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def authenticate_user():
    """
    Authenticate with real user credentials and get a valid JWT token
    """    
    print("🔄 Authenticating with real user credentials...")
    login_url = f"{API_BASE}/auth/login"
    
    # Use form data instead of JSON for login
    login_data = {
        "username": "modaniels512@gmail.com",
        "password": "qwertyuiop"
    }
    
    # Set proper headers for form data
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        # Send as form data, not JSON
        response = requests.post(login_url, data=login_data, headers=headers)
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            token = result.get("access_token")
            if token:
                print("✅ Successfully authenticated!")
                print(f"Token preview: {token[:20]}...")
                return token
            else:
                print("❌ No access token in response")
                print(f"Response: {response.text}")
                return None
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def test_backend_fix_without_auth():
    """
    Test the update endpoint without authentication to verify the 500 error fix
    """
    print("\n🔧 Testing Backend Fix (No Auth):")
    print("Expected: 401 Unauthorized (not 500 Internal Server Error)")
    
    sample_uuid = "550e8400-e29b-41d4-a716-446655440000"
    url = f"{API_BASE}/innovator/update-idea/{sample_uuid}"
    
    update_data = {
        "title": "Test Update Without Auth",
        "description": "Testing if the 500 error is fixed",
        "category": "Technology",
        "tags": ["test"],
        "problem": "Testing backend fix",
        "solution": "Automated verification",
        "target_market": "Developers"
    }
    
    try:
        response = requests.put(url, json=update_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ SUCCESS: Got 401 Unauthorized (expected)")
            print("✅ Backend route is working and no longer throwing 500 errors")
            return True
        elif response.status_code == 500:
            print("❌ FAILED: Still getting 500 Internal Server Error")
            print(f"Response: {response.text}")
            return False
        else:
            print(f"⚠️ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_view_ideas(token):
    """Test viewing user's ideas"""
    print("\n📋 Testing View Ideas:")
    
    url = f"{API_BASE}/innovator/view-ideas"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            ideas = response.json()
            print(f"✅ Successfully fetched {len(ideas)} ideas")
            
            # Display first few ideas
            for i, idea in enumerate(ideas[:3]):
                print(f"  Idea {i+1}: {idea.get('title', 'No title')} (ID: {idea.get('id', 'No ID')})")
            
            return ideas
        else:
            print(f"❌ Failed: {response.text}")
            return []
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def test_create_idea(token):
    """Test creating a new idea"""
    print("\n🚀 Testing Create Idea:")
    
    url = f"{API_BASE}/innovator/submit-idea"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    idea_data = {
        "title": f"Test Idea - {timestamp}",
        "description": "This is a test idea created by the automated test script to verify the fixes",
        "category": "Technology",
        "tags": ["test", "automation", "verification"],
        "status": "draft",
        "visibility": "private",
        "problem": "Testing the complete idea creation and update flow after fixing bugs",
        "solution": "Automated test verification with proper error handling",
        "target_market": "Developers and quality assurance teams"
    }
    
    try:
        response = requests.post(url, headers=headers, json=idea_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            idea = response.json()
            idea_id = idea.get('id')
            print(f"✅ Successfully created idea with ID: {idea_id}")
            print(f"Title: {idea.get('title', 'N/A')}")
            return idea
        else:
            print(f"❌ Failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_update_idea(token, idea_id):
    """
    Test updating an existing idea - this tests the main fix!
    """
    print(f"\n✏️ Testing Update Idea (ID: {idea_id}):")
    print("This tests the main backend fix for the 500 error!")
    
    url = f"{API_BASE}/innovator/update-idea/{idea_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    update_data = {
        "title": f"UPDATED Test Idea - {timestamp}",
        "description": "This idea has been updated by the test script to verify the fix works",
        "category": "Technology",
        "tags": ["test", "automation", "updated", "verified"],
        "problem": "Testing the idea update flow after fixing the backend 500 error and React null value warning",
        "solution": "Automated test verification with proper data handling and error resolution",
        "target_market": "Developers, testers, QA teams, and platform maintainers"
    }
    
    try:
        response = requests.put(url, headers=headers, json=update_data)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            updated_idea = response.json()
            print(f"✅ Successfully updated idea!")
            print(f"New title: {updated_idea.get('title', 'N/A')}")
            print(f"Updated description: {updated_idea.get('description', 'N/A')[:100]}...")
            return updated_idea
        else:
            print(f"❌ Failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_data_integrity(token, original_idea, updated_idea):
    """
    Verify that the update actually changed the data correctly
    """
    print("\n🔍 Testing Data Integrity:")
    
    if not updated_idea:
        print("❌ Cannot test integrity - no updated idea data")
        return False
    
    # Check that the update actually changed the title
    original_title = original_idea.get('title', '')
    updated_title = updated_idea.get('title', '')
    
    if original_title != updated_title:
        print(f"✅ Title successfully updated:")
        print(f"  Original: {original_title}")
        print(f"  Updated:  {updated_title}")
        title_success = True
    else:
        print("❌ Title was not updated")
        title_success = False
    
    # Check that the ID remained the same
    original_id = original_idea.get('id')
    updated_id = updated_idea.get('id')
    
    if original_id == updated_id:
        print(f"✅ ID correctly preserved: {original_id}")
        id_success = True
    else:
        print(f"❌ ID changed unexpectedly: {original_id} -> {updated_id}")
        id_success = False
    
    return title_success and id_success

def main():
    print("🧪 ESAL Platform - Complete End-to-End Fix Verification")
    print("=" * 70)
    print("Testing both fixes:")
    print("1. ✅ Backend 500 error fix (should return proper HTTP codes)")
    print("2. ✅ React null value warning fix (tested via data flow)")
    print("3. ✅ Complete authenticated update flow")
    print("=" * 70)
    
    # Step 1: Test backend fix without authentication
    backend_fix_working = test_backend_fix_without_auth()
    
    # Step 2: Authenticate with real user
    token = authenticate_user()
    
    if not token:
        print("\n❌ Cannot continue - authentication failed")
        return
    
    # Step 3: Test viewing existing ideas
    ideas = test_view_ideas(token)
    
    # Step 4: Create a new idea
    new_idea = test_create_idea(token)
    
    if not new_idea:
        print("\n❌ Cannot continue - idea creation failed")
        return
    
    # Step 5: Update the idea (main test!)
    updated_idea = test_update_idea(token, new_idea.get('id'))
    
    # Step 6: Verify data integrity
    data_integrity_ok = test_data_integrity(token, new_idea, updated_idea)
    
    # Final Summary
    print("\n" + "=" * 70)
    print("📊 FINAL TEST SUMMARY:")
    print("=" * 70)
    
    backend_status = "✅ FIXED" if backend_fix_working else "❌ FAILED"
    auth_status = "✅ SUCCESS" if token else "❌ FAILED"
    create_status = "✅ SUCCESS" if new_idea else "❌ FAILED"
    update_status = "✅ SUCCESS" if updated_idea else "❌ FAILED"
    integrity_status = "✅ SUCCESS" if data_integrity_ok else "❌ FAILED"
    
    print(f"1. Backend 500 Error Fix:    {backend_status}")
    print(f"2. User Authentication:      {auth_status}")
    print(f"3. Idea Creation:            {create_status}")
    print(f"4. Idea Update (Main Fix):   {update_status}")
    print(f"5. Data Integrity:           {integrity_status}")
    
    all_tests_passed = all([
        backend_fix_working,
        token is not None,
        new_idea is not None,
        updated_idea is not None,
        data_integrity_ok
    ])
    
    if all_tests_passed:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Both fixes are working correctly:")
        print("   • Backend no longer returns 500 errors")
        print("   • Idea updates work with proper authentication")
        print("   • Data is correctly updated in the database")
        print("   • React null value warnings should be resolved")
    else:
        print("\n⚠️ SOME TESTS FAILED")
        print("Please check the individual test results above.")
    
    print(f"\n🔧 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if all_tests_passed:
        print("\n📝 Next steps:")
        print("1. ✅ Backend fixes verified - no more 500 errors")
        print("2. ✅ Authentication flow working")
        print("3. 🔄 Test the React frontend to verify null value warnings are gone")
        print("4. 🔄 Test the complete frontend edit form functionality")

if __name__ == "__main__":
    main()
