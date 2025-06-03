#!/usr/bin/env python3
"""Test the complete frontend authentication flow"""

import requests
import json

def test_frontend_flow():
    """Simulate exactly what the frontend does"""
    
    print("🧪 Testing Frontend Authentication Flow")
    print("=" * 50)
    
    # Step 1: Login (like frontend does)
    print("🔐 Step 1: Login...")
    login_data = {
        'username': 'test@example.com',
        'password': 'password123'
    }
    
    login_response = requests.post(
        'http://localhost:8000/api/v1/auth/login', 
        data=login_data,
        headers={'Origin': 'http://localhost:3001'}  # Add Origin header like browser
    )
    
    print(f"Login Status: {login_response.status_code}")
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token_data = login_response.json()
    access_token = token_data.get('access_token')
    user_id = token_data.get('user', {}).get('id')
    
    print(f"✅ Login successful for user: {user_id}")
    print(f"📄 Token: {access_token[:50]}...")
    
    # Step 2: Test view-ideas with exact headers frontend uses
    print("\n👀 Step 2: Fetch Ideas (like frontend)...")
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001',  # Browser automatically adds this
        'Accept': 'application/json',
    }
    
    ideas_response = requests.get(
        'http://localhost:8000/api/v1/innovator/view-ideas',
        headers=headers
    )
    
    print(f"Ideas Request Status: {ideas_response.status_code}")
    print("Response Headers:")
    for header, value in ideas_response.headers.items():
        if 'access-control' in header.lower() or header.lower() in ['content-type']:
            print(f"  {header}: {value}")
    
    if ideas_response.status_code == 200:
        ideas = ideas_response.json()
        print(f"✅ Successfully fetched {len(ideas)} ideas")
        for idea in ideas:
            print(f"  - {idea.get('title', 'Untitled')} (ID: {idea.get('id')})")
    else:
        print(f"❌ Failed to fetch ideas: {ideas_response.text}")
    
    # Step 3: Test CORS preflight (what browser does automatically)
    print("\n🔄 Step 3: CORS Preflight Check...")
    
    preflight_headers = {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type'
    }
    
    preflight_response = requests.options(
        'http://localhost:8000/api/v1/innovator/view-ideas',
        headers=preflight_headers
    )
    
    print(f"Preflight Status: {preflight_response.status_code}")
    if preflight_response.status_code == 200:
        print("✅ CORS preflight successful")
        print("CORS Response Headers:")
        for header, value in preflight_response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
    else:
        print(f"❌ CORS preflight failed")

if __name__ == "__main__":
    test_frontend_flow()
