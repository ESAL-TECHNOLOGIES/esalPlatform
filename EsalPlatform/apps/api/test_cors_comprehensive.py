#!/usr/bin/env python3
"""
Comprehensive CORS testing for view-ideas endpoint
"""
import requests
import json

def test_preflight_request():
    """Test the OPTIONS preflight request"""
    print("🚀 Testing OPTIONS preflight request")
    print("=" * 50)
    
    url = "http://localhost:8000/api/v1/innovator/view-ideas"
    
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization,content-type"
    }
    
    print(f"URL: {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.options(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers:")
        for key, value in response.headers.items():
            print(f"  {key}: {value}")
        
        print(f"\nResponse Body: {response.text}")
        
        # Check if all required CORS headers are present
        required_headers = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers'
        ]
        
        missing_headers = []
        for header in required_headers:
            if header not in response.headers:
                missing_headers.append(header)
        
        if missing_headers:
            print(f"❌ Missing CORS headers: {missing_headers}")
            return False
        else:
            print("✅ All required CORS headers present")
            return True
            
    except Exception as e:
        print(f"❌ Preflight request failed: {e}")
        return False

def test_actual_get_request():
    """Test the actual GET request with CORS headers"""
    print("\n🔍 Testing actual GET request")
    print("=" * 50)
    
    url = "http://localhost:8000/api/v1/innovator/view-ideas"
    
    headers = {
        "Origin": "http://localhost:3000",
        "Content-Type": "application/json",
        # Note: In a real scenario, you'd need a valid auth token
        # "Authorization": "Bearer your_token_here"
    }
    
    print(f"URL: {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.get(url, headers=headers)
        
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
        
        # Check if CORS headers are present in actual response
        if 'access-control-allow-origin' in response.headers:
            print("✅ Access-Control-Allow-Origin present in actual response")
            return True
        else:
            print("❌ Access-Control-Allow-Origin missing in actual response")
            return False
            
    except Exception as e:
        print(f"❌ GET request failed: {e}")
        return False

def test_simple_request():
    """Test a simple request without preflight"""
    print("\n📝 Testing simple request (no preflight needed)")
    print("=" * 50)
    
    url = "http://localhost:8000/api/v1/innovator/view-ideas"
    
    headers = {
        "Origin": "http://localhost:3000",
        # Simple request - no custom headers that trigger preflight
    }
    
    print(f"URL: {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.get(url, headers=headers)
        
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
        
        # Check if CORS headers are present
        if 'access-control-allow-origin' in response.headers:
            print("✅ Access-Control-Allow-Origin present in simple request")
            return True
        else:
            print("❌ Access-Control-Allow-Origin missing in simple request")
            return False
            
    except Exception as e:
        print(f"❌ Simple request failed: {e}")
        return False

def test_browser_cache_buster():
    """Test with cache busting parameter"""
    print("\n🔄 Testing with cache buster")
    print("=" * 50)
    
    import time
    cache_buster = int(time.time())
    url = f"http://localhost:8000/api/v1/innovator/view-ideas?cb={cache_buster}"
    
    headers = {
        "Origin": "http://localhost:3000",
        "Content-Type": "application/json"
    }
    
    print(f"URL: {url}")
    print(f"Headers: {json.dumps(headers, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"CORS Headers:")
        cors_headers = {k: v for k, v in response.headers.items() 
                       if 'access-control' in k.lower()}
        for key, value in cors_headers.items():
            print(f"  {key}: {value}")
        
        if cors_headers:
            print("✅ CORS headers present with cache buster")
            return True
        else:
            print("❌ No CORS headers with cache buster")
            return False
            
    except Exception as e:
        print(f"❌ Cache buster request failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Comprehensive CORS Testing for view-ideas endpoint")
    print("=" * 60)
    
    results = []
    
    # Test preflight
    results.append(("Preflight OPTIONS", test_preflight_request()))
    
    # Test actual request
    results.append(("Actual GET", test_actual_get_request()))
    
    # Test simple request
    results.append(("Simple GET", test_simple_request()))
    
    # Test cache buster
    results.append(("Cache Buster", test_browser_cache_buster()))
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    
    if all_passed:
        print("\n🎉 All CORS tests passed! The issue might be:")
        print("   1. Browser cache - try hard refresh (Ctrl+Shift+R)")
        print("   2. Browser dev tools network tab showing old cached requests")
        print("   3. Frontend code not handling the response properly")
    else:
        print("\n❌ Some CORS tests failed. Check the server configuration.")
    
    print("\n💡 Debugging tips:")
    print("   1. Clear browser cache completely")
    print("   2. Open browser in incognito/private mode")
    print("   3. Check browser dev tools console for detailed CORS errors")
    print("   4. Restart both frontend and backend servers")
