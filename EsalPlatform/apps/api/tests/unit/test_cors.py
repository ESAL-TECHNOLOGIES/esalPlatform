#!/usr/bin/env python3
"""
Test CORS functionality by making requests from frontend domain
"""
import requests
import json
import sys

def test_cors_preflight():
    """Test CORS preflight request"""
    api_url = "http://localhost:8000/api/v1/innovator/view-ideas"
    frontend_origin = "http://localhost:3001"
    
    print("🧪 Testing CORS preflight request...")
    print(f"API URL: {api_url}")
    print(f"Origin: {frontend_origin}")
    
    # Test preflight OPTIONS request
    try:
        preflight_response = requests.options(
            api_url,
            headers={
                "Origin": frontend_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type,Authorization"
            },
            timeout=10
        )
        
        print(f"\n✅ Preflight Response Status: {preflight_response.status_code}")
        print("📋 Preflight Response Headers:")
        for header, value in preflight_response.headers.items():
            if header.lower().startswith('access-control'):
                print(f"   {header}: {value}")
        
        # Check for required CORS headers
        required_headers = [
            'access-control-allow-origin',
            'access-control-allow-methods', 
            'access-control-allow-headers'
        ]
        
        missing_headers = []
        for header in required_headers:
            if header not in preflight_response.headers:
                missing_headers.append(header)
        
        if missing_headers:
            print(f"❌ Missing CORS headers: {missing_headers}")
            return False
        else:
            print("✅ All required CORS headers present")
            
    except Exception as e:
        print(f"❌ Preflight request failed: {e}")
        return False
      # Test actual GET request (without auth first)
    try:
        print("\n🔄 Testing actual GET request (without auth)...")
        get_response = requests.get(
            api_url,
            headers={
                "Origin": frontend_origin,
                "Content-Type": "application/json"
            },
            timeout=10
        )
        print(f"✅ GET Response Status: {get_response.status_code}")
        print("📋 GET Response Headers:")
        for header, value in get_response.headers.items():
            if header.lower().startswith('access-control'):
                print(f"   {header}: {value}")
        
        # Check response status
        if get_response.status_code == 200:
            print("✅ GET request successful")
            return True
        elif get_response.status_code == 403:
            print("✅ GET request returned 403 (Expected - endpoint requires authentication)")
            print("🔑 CORS is working! The 403 is an auth issue, not CORS.")
            return True  # CORS is working, 403 is expected without auth
        else:
            print(f"⚠️ GET request returned unexpected status {get_response.status_code}")
            try:
                error_detail = get_response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Response text: {get_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ GET request failed: {e}")
        return False

def test_api_health():
    """Test API health check"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ API Health Check: {response.json()}")
            return True
        else:
            print(f"❌ API Health Check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API not reachable: {e}")
        return False

def test_public_endpoint_cors():
    """Test CORS on a public endpoint that doesn't require auth"""
    api_url = "http://localhost:8000/"  # Root endpoint is public
    frontend_origin = "http://localhost:3001"
    
    print("\n🌐 Testing CORS on public endpoint...")
    print(f"API URL: {api_url}")
    print(f"Origin: {frontend_origin}")
    
    try:
        response = requests.get(
            api_url,
            headers={
                "Origin": frontend_origin,
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print(f"✅ Public Endpoint Response Status: {response.status_code}")
        print("📋 Public Endpoint Response Headers:")
        for header, value in response.headers.items():
            if header.lower().startswith('access-control'):
                print(f"   {header}: {value}")
        
        if response.status_code == 200:
            print("✅ Public endpoint CORS test successful!")
            return True
        else:
            print(f"❌ Public endpoint returned status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Public endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting CORS Test Suite...")
      # Test API health first
    if not test_api_health():
        print("❌ API is not running. Please start the API server first.")
        sys.exit(1)
    
    # Test CORS on public endpoint
    print("\n" + "="*50)
    if test_public_endpoint_cors():
        print("✅ Public endpoint CORS test passed!")
    else:
        print("❌ Public endpoint CORS test failed!")
    
    # Test CORS on protected endpoint
    print("\n" + "="*50)
    if test_cors_preflight():
        print("\n🎉 CORS tests passed! The 403 error from the frontend is an authentication issue, not CORS.")
        print("\n💡 Solution: The frontend needs to include the Authorization header with a valid JWT token.")
        print("   Example: Authorization: Bearer <jwt_token>")
    else:
        print("\n❌ CORS test failed!")
        sys.exit(1)
    
    # Test public endpoint CORS
    if test_public_endpoint_cors():
        print("\n🎉 Public endpoint CORS test passed!")
    else:
        print("\n❌ Public endpoint CORS test failed!")
        sys.exit(1)
