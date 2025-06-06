#!/usr/bin/env python3
"""Test the complete ideas flow - login, create, and view"""

import requests
import json

def test_ideas_flow():
    try:
        # Login first
        login_data = {
            'username': 'test@example.com',
            'password': 'password123'
        }
        
        print("🔐 Attempting login...")
        login_response = requests.post('http://localhost:8000/api/v1/auth/login', data=login_data)
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            access_token = token_data.get('access_token')
            user_id = token_data.get('user', {}).get('id')
            
            print(f"✅ Logged in as user: {user_id}")
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Create a test idea with all required fields
            idea_data = {
                'title': 'Test Idea from API',
                'problem': 'Many people struggle with time management',
                'solution': 'An AI-powered time tracking and optimization app',
                'target_market': 'Professionals and students who want to improve productivity'
            }
            
            print("📝 Creating test idea...")
            create_response = requests.post(
                'http://localhost:8000/api/v1/innovator/submit-idea',
                headers=headers,
                json=idea_data
            )
            
            print(f"Create idea status: {create_response.status_code}")
            
            if create_response.status_code == 200:
                print("✅ Idea created successfully!")
                
                # Now try to view ideas
                print("👀 Fetching user ideas...")
                view_response = requests.get(
                    'http://localhost:8000/api/v1/innovator/view-ideas',
                    headers=headers
                )
                
                print(f"View ideas status: {view_response.status_code}")
                if view_response.status_code == 200:
                    ideas = view_response.json()
                    print(f"✅ Found {len(ideas)} ideas for this user")
                    for idea in ideas:
                        print(f"  - Title: {idea.get('title', 'N/A')} (ID: {idea.get('id', 'N/A')})")
                else:
                    print(f"❌ View ideas error: {view_response.text}")
            else:
                print(f"❌ Create idea error: {create_response.text}")
        else:
            print(f"❌ Login failed: {login_response.text}")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ideas_flow()
