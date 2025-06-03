#!/usr/bin/env python3
"""
Test script to simulate the exact request the frontend makes
"""
import requests
import json

def test_frontend_request():
    """Test the exact request that frontend makes"""
    try:
        print("=== Testing Frontend-like Request ===")
        
        # This is similar to what frontend sends
        request_data = {
            "title": "Updated Test Title",
            "description": "Updated Test Description", 
            "category": "Technology",
            "industry": "Technology",  # Frontend sends this even though DB doesn't have it
            "stage": "idea",
            "problem": "Updated Test Problem",
            "solution": "Updated Test Solution",
            "target_market": "Updated Test Market",
            "tags": ["test", "updated"]
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer invalid-token"  # This will fail auth but show us the flow
        }
        
        url = "http://localhost:8000/api/v1/innovator/update-idea/4"
        
        print(f"Making PUT request to: {url}")
        print(f"Request data: {json.dumps(request_data, indent=2)}")
        print(f"Headers: {headers}")
        
        response = requests.put(url, json=request_data, headers=headers)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 401:
            print("\n✅ Authentication failed as expected (invalid token)")
            print("❓ Next step: Test with valid token")
        else:
            print(f"\n❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection Error: {e}")
        print("Backend might not be running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_frontend_request()
