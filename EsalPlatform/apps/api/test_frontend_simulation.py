#!/usr/bin/env python3
"""
Simulate exact frontend request to diagnose the 500 error
"""
import requests
import json
import sys

def test_frontend_exact_request():
    """Test the exact request the frontend is making"""
    api_url = "http://localhost:8000/api/v1/innovator/view-ideas"
    frontend_origin = "http://localhost:3001"
    
    print("🔍 Simulating exact frontend request...")
    print(f"API URL: {api_url}")
    print(f"Origin: {frontend_origin}")
    
    # This simulates what the frontend fetch() is doing
    headers = {
        "Origin": frontend_origin,
        "Content-Type": "application/json",
        "Accept": "application/json",
        # Note: No Authorization header - this is likely the issue
    }
    
    try:
        print("\n📤 Making GET request with frontend headers...")
        response = requests.get(
            api_url,
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        print(f"\nResponse Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
        return response.status_code, dict(response.headers)
        
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None, {}

def test_with_invalid_auth():
    """Test with invalid authorization header"""
    api_url = "http://localhost:8000/api/v1/innovator/view-ideas"
    frontend_origin = "http://localhost:3001"
    
    print("\n🔍 Testing with invalid auth token...")
    
    headers = {
        "Origin": frontend_origin,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer invalid-token-12345"
    }
    
    try:
        response = requests.get(
            api_url,
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"CORS Headers:")
        for header, value in response.headers.items():
            if header.lower().startswith('access-control'):
                print(f"  {header}: {value}")
        
        print(f"\nResponse Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
        return response.status_code
        
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def test_login_endpoint():
    """Test if we can get a real token from login"""
    login_url = "http://localhost:8000/api/auth/login"
    
    print("\n🔐 Testing login endpoint to get real token...")
    
    # Test credentials (you might need to register a user first)
    test_credentials = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(
            login_url,
            json=test_credentials,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Login Status Code: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Login successful!")
            return token_data.get("access_token")
        else:
            print(f"Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return None

def test_with_real_auth(token):
    """Test with real authorization token"""
    if not token:
        print("⚠️ No token provided, skipping authenticated test")
        return
        
    api_url = "http://localhost:8000/api/v1/innovator/view-ideas"
    frontend_origin = "http://localhost:3001"
    
    print(f"\n🔑 Testing with real auth token...")
    
    headers = {
        "Origin": frontend_origin,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(
            api_url,
            headers=headers,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"CORS Headers:")
        for header, value in response.headers.items():
            if header.lower().startswith('access-control'):
                print(f"  {header}: {value}")
        
        print(f"\nResponse Body:")
        try:
            response_json = response.json()
            print(json.dumps(response_json, indent=2))
        except:
            print(response.text)
            
        if response.status_code == 200:
            print("✅ Authenticated request successful!")
        
    except Exception as e:
        print(f"❌ Authenticated request failed: {e}")

def check_api_logs():
    """Check if we can get more info from the server"""
    print("\n📋 Server Response Analysis:")
    print("The frontend is getting these errors:")
    print("1. 500 Internal Server Error")
    print("2. Missing CORS headers")
    print("3. 'Failed to fetch' error")
    print("\nThis suggests:")
    print("- The server is crashing before CORS headers can be added")
    print("- There might be an import error or missing dependency")
    print("- The authentication middleware might be causing the crash")

if __name__ == "__main__":
    print("🚀 Frontend Request Simulation Test")
    print("=" * 50)
    
    # Test 1: Exact frontend request (no auth)
    status_code, headers = test_frontend_exact_request()
    
    # Test 2: Invalid auth
    test_with_invalid_auth()
    
    # Test 3: Try to get real token
    token = test_login_endpoint()
    
    # Test 4: Real auth
    test_with_real_auth(token)
    
    # Analysis
    check_api_logs()
    
    print("\n🎯 Diagnosis:")
    if status_code == 500:
        print("❌ The server is returning 500 errors - this indicates a server-side crash")
        print("💡 Likely causes:")
        print("   1. Missing Python dependencies (google-generativeai, etc.)")
        print("   2. Database connection issues")
        print("   3. Authentication middleware crashing")
        print("   4. Import errors in the service layer")
        print("\n🔧 Recommended fixes:")
        print("   1. Check server logs for the exact error")
        print("   2. Install missing dependencies: pip install google-generativeai")
        print("   3. Restart the API server")
        print("   4. Test the endpoint with proper authentication")
    elif status_code == 403:
        print("✅ Server is working but needs authentication")
        print("💡 Frontend needs to include: Authorization: Bearer <token>")
    else:
        print(f"🤔 Unexpected status code: {status_code}")
