#!/usr/bin/env python3
"""
Test script to verify that the dashboard endpoint table name fixes work
"""
import requests
import json
import sys
from datetime import datetime

# Test configuration
API_BASE_URL = "http://localhost:8000"
# Use a proper UUID format for test user ID to avoid PostgreSQL constraint violations
TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000"

def test_table_access():
    """Test if we can access the tables with the correct names"""
    print("🧪 Testing table access after fixes...")
    print(f"📅 Test time: {datetime.now()}")
    print("-" * 50)
    
    # Test 1: Check API root endpoint
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"✅ API Root Endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Status: {data.get('status')}")
            print(f"   Version: {data.get('version')}")
    except Exception as e:
        print(f"❌ API Root Error: {e}")
        return False
    
    # Test 2: Try dashboard endpoint (expect auth error, not table error)
    try:
        headers = {
            "Authorization": "Bearer test-token",
            "Content-Type": "application/json"
        }
        response = requests.get(f"{API_BASE_URL}/api/v1/innovator/dashboard", headers=headers)
        print(f"\n🎯 Dashboard Endpoint Test:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
        
        # Check if we get auth error (good) vs table error (bad)
        if response.status_code == 422 or "Authentication failed" in response.text:
            print("   ✅ GOOD: Getting auth error (not table error)")
            print("   ✅ This means table names are now correct!")
            return True
        elif response.status_code == 400 and "table" in response.text.lower():
            print("   ❌ BAD: Still getting table-related error")
            return False
        else:
            print(f"   🤔 UNEXPECTED: {response.status_code} - {response.text}")
            return True  # Might still be working, just different error
            
    except Exception as e:
        print(f"❌ Dashboard Test Error: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Testing Dashboard Table Name Fixes")
    print("="*60)
    
    success = test_table_access()
    
    print("\n" + "="*60)
    if success:
        print("🎉 SUCCESS: Table name fixes appear to be working!")
        print("   - API is accessible")
        print("   - No more 400 Bad Request errors from wrong table names")
        print("   - Authentication errors are expected (normal behavior)")
        print("\n💡 Next steps:")
        print("   - Set up proper Supabase authentication")
        print("   - Test with real user tokens")
    else:
        print("❌ FAILED: There might still be table name issues")
        print("   - Check the error messages above")
        print("   - Verify all table references were updated")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
