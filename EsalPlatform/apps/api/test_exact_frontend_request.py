#!/usr/bin/env python3
"""
Test the exact login request that the frontend is making
"""
import requests
import json

def test_user_signup_first():
    """First try to register a user"""
    signup_url = "http://localhost:8000/api/v1/auth/register"
    
    signup_payload = {
        "email": "realtest@gmail.com",
        "password": "testpassword123",
        "full_name": "Real Test User",
        "role": "innovator"
    }
    
    headers = {
        "Content-Type": "application/json",
    }
    
    print(f"🔧 Registering user first:")
    print(f"URL: {signup_url}")
    print(f"Payload: {json.dumps(signup_payload, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(signup_url, json=signup_payload, headers=headers)
        
        print(f"Signup Status Code: {response.status_code}")
        print(f"Signup Response:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
            if response.status_code == 200:
                return True
        except:
            print(response.text)
            
    except Exception as e:
        print(f"Signup failed: {e}")
    
    return False

def test_exact_frontend_login():
    """Test the exact login endpoint and payload that frontend uses"""
    
    # First try to create a user
    user_created = test_user_signup_first()
    
    print(f"\n" + "="*60)
    print("🔐 Testing Frontend Login Request")
    print("="*60)
    
    # The exact URL and payload from frontend
    url = "http://localhost:8000/api/v1/auth/login-json"
    
    payload = {
        "email": "realtest@gmail.com",
        "password": "testpassword123"
    }
    
    headers = {
        "Content-Type": "application/json",
    }
    
    print(f"Testing exact frontend request:")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print(f"\nResponse Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")
    
    # Also test the correct URL that should work
    correct_url = "http://localhost:8000/api/auth/login-json"
    print(f"\n" + "="*60)
    print(f"Testing correct URL: {correct_url}")
    print("-" * 50)
    
    try:
        response = requests.post(correct_url, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print(f"\nResponse Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_exact_frontend_login()
