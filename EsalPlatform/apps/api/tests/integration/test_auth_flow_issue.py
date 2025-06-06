#!/usr/bin/env python3
"""
Test script to replicate the authentication issue after AI idea generation.

This script will:
1. Simulate user login to get an authentication token
2. Generate an AI idea (which reportedly works)
3. Immediately try to fetch ideas (which reportedl    # Step 7: Summary
    print_section("TEST SUMMARY")
    print(f"🕒 Test completed at: {datetime.now()}")
    print("📋 Results:")
    print(f"   • Login: {'✅ Success' if 'access_token' in locals() else '❌ Failed'}")
    print(f"   • Initial ideas fetch: {'✅ Success' if 'initial_ideas_response' in locals() and initial_ideas_response.status_code == 200 else '❌ Failed'}")
    print(f"   • AI idea generation: {'✅ Success' if 'ai_response' in locals() and ai_response.status_code == 200 else '❌ Failed'}")
    print(f"   • Post-AI ideas fetch: {'✅ Success' if 'post_ai_ideas_response' in locals() and post_ai_ideas_response.status_code == 200 else '❌ Failed'}")
    print(f"   • Idea details fetch: {'✅ Success' if 'idea_details_response' in locals() and idea_details_response.status_code == 200 else '❌ Failed or Skipped'}")
    
    if 'post_ai_ideas_response' in locals() and post_ai_ideas_response.status_code == 403:
        print("\n🔍 ISSUE IDENTIFIED: 403 Forbidden on post-AI ideas fetch")
        print("💡 This suggests the authentication token is being invalidated or modified during AI generation")
    
    if 'idea_details_response' in locals() and idea_details_response.status_code == 500:
        print("\n🔍 ISSUE IDENTIFIED: 500 Internal Server Error on idea details fetch")
        print("💡 This suggests a schema validation or data processing error in the idea details endpoint")s with 403)
4. Analyze the authentication flow to identify the issue
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
TEST_EMAIL = "modaniels512@gmail.com"  # You'll need to replace with a real test user
TEST_PASSWORD = "qwertyuiop"  # You'll need to replace with the real password

def print_section(title):
    """Print a section header"""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_request_details(method, url, headers=None, data=None):
    """Print request details for debugging"""
    print(f"🔄 {method} {url}")
    if headers:
        print(f"📋 Headers: {headers}")
    if data:
        print(f"📦 Data: {json.dumps(data, indent=2)}")

def print_response_details(response):
    """Print response details for debugging"""
    print(f"📈 Status: {response.status_code}")
    print(f"📋 Headers: {dict(response.headers)}")
    try:
        response_data = response.json()
        print(f"📦 Response: {json.dumps(response_data, indent=2)}")
    except:
        print(f"📦 Response: {response.text}")

def test_authentication_flow():
    """Test the complete authentication flow to identify the issue"""
    
    print_section("AUTHENTICATION FLOW TEST")
    print(f"🕒 Test started at: {datetime.now()}")
    
    # Step 1: Login to get authentication token
    print_section("Step 1: User Login")
    
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    print_request_details("POST", f"{BASE_URL}/auth/login-json", data=login_data)
    
    try:
        login_response = requests.post(
            f"{BASE_URL}/auth/login-json",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print_response_details(login_response)
        
        if login_response.status_code != 200:
            print("❌ LOGIN FAILED - Cannot proceed with test")
            print("💡 Make sure you have a valid test user account")
            return
        
        login_result = login_response.json()
        access_token = login_result.get("access_token")
        
        if not access_token:
            print("❌ NO ACCESS TOKEN RECEIVED")
            return
        
        print(f"✅ LOGIN SUCCESSFUL - Token received (length: {len(access_token)})")
        
    except Exception as e:
        print(f"❌ LOGIN ERROR: {e}")
        return
    
    # Step 2: Test initial idea fetching (should work)
    print_section("Step 2: Initial Ideas Fetch (Control Test)")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    print_request_details("GET", f"{BASE_URL}/innovator/view-ideas", headers=headers)
    
    try:
        ideas_response = requests.get(
            f"{BASE_URL}/innovator/view-ideas",
            headers=headers
        )
        
        print_response_details(ideas_response)
        if ideas_response.status_code == 200:
            ideas_data = ideas_response.json()
            idea_count = len(ideas_data) if isinstance(ideas_data, list) else 0
            print(f"✅ INITIAL IDEAS FETCH SUCCESSFUL - Found {idea_count} ideas")
            
            # Store first idea ID for testing idea details
            first_idea_id = None
            initial_ideas = ideas_data  # Store for later comparison
            if ideas_data and len(ideas_data) > 0:
                first_idea_id = str(ideas_data[0].get("id", ""))
                print(f"📝 First idea ID: {first_idea_id}")
        else:
            print(f"❌ INITIAL IDEAS FETCH FAILED - Status: {ideas_response.status_code}")
            print("💡 This indicates a problem with the view-ideas endpoint")
            first_idea_id = None
            initial_ideas = []
    
    except Exception as e:
        print(f"❌ IDEAS FETCH ERROR: {e}")
        first_idea_id = None
        initial_ideas = []
    
    # Step 3: Generate AI idea
    print_section("Step 3: AI Idea Generation")
    
    ai_generation_data = {
        "interests": "artificial intelligence, technology",
        "skills": "programming, machine learning",
        "industry": "technology", 
        "problem_area": "productivity",
        "target_market": "developers",
        "save_to_database": True
    }
    
    print_request_details("POST", f"{BASE_URL}/innovator/ai/generate-idea", headers=headers, data=ai_generation_data)
    
    try:
        ai_response = requests.post(
            f"{BASE_URL}/innovator/ai/generate-idea",
            json=ai_generation_data,
            headers=headers
        )
        
        print_response_details(ai_response)
        
        if ai_response.status_code == 200:
            print("✅ AI IDEA GENERATION SUCCESSFUL")
            ai_result = ai_response.json()
            saved_to_db = ai_result.get("metadata", {}).get("saved_to_database", False)
            print(f"💾 Saved to database: {saved_to_db}")
        else:
            print("❌ AI IDEA GENERATION FAILED")
            return
            
    except Exception as e:
        print(f"❌ AI IDEA GENERATION ERROR: {e}")
        return
    
    # Step 4: Wait a moment (to simulate real user behavior)
    print_section("Step 4: Waiting (simulating user behavior)")
    print("⏳ Waiting 2 seconds...")
    time.sleep(2)
    
    # Step 5: Try to fetch ideas again (this is where the issue reportedly occurs)
    print_section("Step 5: Post-AI Ideas Fetch (The Problematic Request)")
    
    print_request_details("GET", f"{BASE_URL}/innovator/view-ideas", headers=headers)
    
    try:
        post_ai_ideas_response = requests.get(
            f"{BASE_URL}/innovator/view-ideas",
            headers=headers
        )
        
        print_response_details(post_ai_ideas_response)
        
        if post_ai_ideas_response.status_code == 200:
            print("✅ POST-AI IDEAS FETCH SUCCESSFUL")
            post_ai_ideas = post_ai_ideas_response.json()
            print(f"📊 Found {len(post_ai_ideas)} ideas after AI generation")
            
            if len(post_ai_ideas) > len(initial_ideas):
                print("🎉 NEW IDEA DETECTED - AI generation worked correctly!")
            else:
                print("⚠️  NO NEW IDEAS - AI idea might not have been saved")
                
        elif post_ai_ideas_response.status_code == 403:
            print("🚨 403 FORBIDDEN - AUTHENTICATION ISSUE REPRODUCED!")
            print("🔍 This confirms the reported problem")
            
            # Additional debugging
            print_section("DEBUGGING: Token Validation")
            
            # Test the /auth/me endpoint to check token validity
            me_response = requests.get(
                f"{BASE_URL}/auth/me",
                headers=headers
            )
            
            print(f"🔍 /auth/me status: {me_response.status_code}")
            if me_response.status_code == 200:
                print("✅ Token is still valid according to /auth/me")
                print("🤔 This suggests an issue with the view-ideas endpoint specifically")
            else:
                print("❌ Token has become invalid")
                print_response_details(me_response)
                
        else:
            print(f"❌ UNEXPECTED ERROR: {post_ai_ideas_response.status_code}")
    except Exception as e:
        print(f"❌ POST-AI IDEAS FETCH ERROR: {e}")
    
    # Step 6: Test Idea Details Endpoint (New test for the latest issue)
    print_section("Step 6: Idea Details Fetch Test")
    
    if first_idea_id:
        print(f"🔍 Testing idea details for ID: {first_idea_id}")
        print_request_details("GET", f"{BASE_URL}/ideas/{first_idea_id}", headers=headers)
        
        try:
            idea_details_response = requests.get(
                f"{BASE_URL}/ideas/{first_idea_id}",
                headers=headers
            )
            
            print_response_details(idea_details_response)
            
            if idea_details_response.status_code == 200:
                print("✅ IDEA DETAILS FETCH SUCCESSFUL")
                idea_details = idea_details_response.json()
                print(f"📝 Idea title: {idea_details.get('title', 'Unknown')}")
                print(f"📊 Views: {idea_details.get('views_count', 0)}")
                print(f"🤝 Interests: {idea_details.get('interests_count', 0)}")
                
            elif idea_details_response.status_code == 500:
                print("🚨 500 INTERNAL SERVER ERROR - IDEA DETAILS ISSUE REPRODUCED!")
                print("🔍 This confirms the reported problem with idea details page")
                
            elif idea_details_response.status_code == 404:
                print("❌ 404 NOT FOUND - Idea doesn't exist or not accessible")
                
            else:
                print(f"❌ UNEXPECTED ERROR: {idea_details_response.status_code}")
                
        except Exception as e:
            print(f"❌ IDEA DETAILS FETCH ERROR: {e}")
    else:
        print("⚠️  SKIPPING IDEA DETAILS TEST - No ideas available")
    
    # Step 7: Summary    print_section("TEST SUMMARY")
    print(f"🕒 Test completed at: {datetime.now()}")
    print("📋 Results:")
    print(f"   • Login: {'✅ Success' if 'access_token' in locals() else '❌ Failed'}")
    print(f"   • Initial ideas fetch: {'✅ Success' if 'ideas_response' in locals() and ideas_response.status_code == 200 else '❌ Failed'}")
    print(f"   • AI generation: {'✅ Success' if 'ai_response' in locals() and ai_response.status_code == 200 else '❌ Failed'}")
    print(f"   • Post-AI ideas fetch: {'✅ Success' if 'post_ai_ideas_response' in locals() and post_ai_ideas_response.status_code == 200 else '❌ Failed'}")
    
    if 'post_ai_ideas_response' in locals() and post_ai_ideas_response.status_code == 403:
        print("\n🎯 ISSUE CONFIRMED: Authentication fails specifically after AI idea generation")
        print("🔧 Recommended next steps:")
        print("   1. Check if AI generation endpoint modifies authentication state")
        print("   2. Verify token expiration/invalidation logic")
        print("   3. Check for session interference between endpoints")

def main():
    """Main test function"""
    print("🔬 ESAL Platform Authentication Flow Tester")
    print("=" * 60)
    print("This script tests the authentication issue after AI idea generation")
    print("=" * 60)
    
    # Prompt for test credentials if needed
    print("\n⚠️  IMPORTANT: Make sure you have a valid test user account")
    print(f"Current test credentials: {TEST_EMAIL} / {TEST_PASSWORD}")
    print("Edit the script if you need to use different credentials")
    
    proceed = input("\nProceed with test? (y/N): ").strip().lower()
    if proceed != 'y':
        print("Test cancelled")
        return
    
    test_authentication_flow()

if __name__ == "__main__":
    main()
