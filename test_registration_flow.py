#!/usr/bin/env python3
"""
Test script to debug the user registration flow and email sending
"""
import asyncio
import sys
import os
import json
import requests
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_registration_endpoint():
    """Test the registration endpoint directly"""
    
    print("🔧 Testing User Registration Flow")
    print("=" * 50)
    
    # API endpoint
    api_url = "http://localhost:8000/api/v1/auth/register"    # Test user data - using timestamp for unique account but real email for testing
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    test_user = {
        "email": "danielokinda001@gmail.com",  # Real email to receive verification
        "full_name": f"Test User {timestamp}",  # Unique name for testing
        "password": "testpassword123",
        "role": "innovator"
    }
    
    print(f"\n📋 Test Registration Data:")
    print(f"   Email: {test_user['email']}")
    print(f"   Name: {test_user['full_name']}")
    print(f"   Role: {test_user['role']}")
    print(f"   API URL: {api_url}")
    
    try:
        print(f"\n📤 Sending registration request...")
        
        response = requests.post(
            api_url,
            json=test_user,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Registration successful!")
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            # Check if email verification was triggered
            if data.get("requires_verification"):
                print("✅ Email verification flow triggered!")
                print(f"   User ID: {data.get('user_id')}")
                print(f"   📧 Check {test_user['email']} for verification email")
            else:
                print("⚠️  Email verification flow not triggered")
                
            return True
            
        else:
            print(f"❌ Registration failed!")
            try:
                error_data = response.json()
                print(f"   Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Raw response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API server!")
        print("   Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error during registration test: {e}")
        logger.error(f"Registration test error: {e}", exc_info=True)
        return False

async def test_api_health():
    """Test if the API is healthy and accessible"""
    
    print("\n🏥 Testing API Health")
    print("-" * 30)
    
    endpoints_to_test = [
        "http://localhost:8000/",
        "http://localhost:8000/health",
        "http://localhost:8000/docs",
        "http://localhost:8000/api/v1/auth/health"
    ]
    
    for url in endpoints_to_test:
        try:
            print(f"   Testing {url}...")
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"   ✅ {url} - OK")
            else:
                print(f"   ⚠️  {url} - Status {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"   ❌ {url} - Connection failed")
        except Exception as e:
            print(f"   ❌ {url} - Error: {e}")

async def test_resend_verification():
    """Test the resend verification endpoint"""
    
    print("\n📧 Testing Resend Verification")
    print("-" * 30)
    api_url = "http://localhost:8000/api/v1/auth/resend-verification"
    # Use a test email that might be unverified
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    test_data = {
        "email": f"unverified_test_{timestamp}@gmail.com"
    }
    
    try:
        print(f"   Sending resend request for {test_data['email']}...")
        
        response = requests.post(
            api_url,
            json=test_data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=30
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Resend verification successful!")
            print(f"   Response: {json.dumps(data, indent=2)}")
            print(f"   📧 Check {test_data['email']} for verification email")
            return True
        else:
            try:
                error_data = response.json()
                print(f"   Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Raw response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during resend test: {e}")
        return False

async def main():
    """Main test function"""
    
    print("🚀 ESAL Platform Registration & Email Flow Test")
    print("=" * 60)
    
    # Test 1: API Health
    await test_api_health()
    
    # Test 2: Registration endpoint
    registration_success = await test_registration_endpoint()
    
    # Test 3: Resend verification (only if registration failed)
    if not registration_success:
        print("\n🔄 Trying resend verification endpoint...")
        await test_resend_verification()
    
    # Summary
    print("\n📊 Test Summary:")
    print("=" * 30)
    if registration_success:
        print("✅ Registration flow working correctly!")
        print("📧 Check danielokinda001@gmail.com for verification email")
    else:
        print("❌ Registration flow has issues")
        print("\n🔧 Troubleshooting steps:")
        print("   1. Check backend logs for errors")
        print("   2. Verify Supabase connection")
        print("   3. Check SMTP configuration")
        print("   4. Ensure email_verifications table exists")

if __name__ == "__main__":
    asyncio.run(main())
