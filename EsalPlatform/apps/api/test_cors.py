#!/usr/bin/env python3
"""
CORS Configuration Test Script
Test the CORS configuration for the ESAL Platform API
"""
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
app_dir = Path(__file__).parent / "app"
sys.path.insert(0, str(app_dir))

from app.config import settings

def test_cors_config():
    """Test CORS configuration"""
    print("=== CORS Configuration Test ===")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Is Production: {settings.is_production}")
    print(f"Debug Mode: {settings.DEBUG}")
    print(f"ALLOWED_ORIGINS Type: {type(settings.ALLOWED_ORIGINS)}")
    print(f"ALLOWED_ORIGINS Value: {settings.ALLOWED_ORIGINS}")
    print()
    
    # Test origins
    test_origins = [
        "https://innovator-portal.onrender.com",
        "https://investor-portal-vz2e.onrender.com", 
        "https://esalplatform.onrender.com",
        "https://esalplatform-1.onrender.com",
        "https://esal-hub-portal.onrender.com",
        "https://esal-admin-portal.onrender.com",
        "http://localhost:3001",
        "https://unknown-domain.com"
    ]
    
    print("=== Testing Origins ===")
    for origin in test_origins:
        is_allowed = origin in settings.ALLOWED_ORIGINS
        print(f"Origin: {origin:<40} Allowed: {is_allowed}")
    
    print()
    print("=== Environment Variables ===")
    print(f"ALLOWED_ORIGINS env var: {os.getenv('ALLOWED_ORIGINS', 'NOT SET')}")
    print(f"ENVIRONMENT env var: {os.getenv('ENVIRONMENT', 'NOT SET')}")
    print(f"DEBUG env var: {os.getenv('DEBUG', 'NOT SET')}")

if __name__ == "__main__":
    test_cors_config()
