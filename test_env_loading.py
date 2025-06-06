#!/usr/bin/env python3
"""
Test script to verify environment variables are being loaded correctly
"""
import sys
import os

# Add the API directory to Python path
sys.path.append('d:/esalPlatform/EsalPlatform/apps/api')

# Change to the API directory to ensure .env file is found
os.chdir('d:/esalPlatform/EsalPlatform/apps/api')

try:
    from app.config import settings
    
    print("=== Environment Variable Loading Test ===")
    print(f"Current working directory: {os.getcwd()}")
    print(f".env file exists: {os.path.exists('.env')}")
    print()
    
    print("=== Configuration Values ===")
    print(f"SUPABASE_URL: {'***' if settings.SUPABASE_URL else 'NOT SET'}")
    print(f"SUPABASE_ANON_KEY: {'***' if settings.SUPABASE_ANON_KEY else 'NOT SET'}")
    print(f"SMTP_HOST: {settings.SMTP_HOST}")
    print(f"SMTP_PORT: {settings.SMTP_PORT}")
    print(f"SMTP_USER: {'***' if settings.SMTP_USER else 'NOT SET'}")
    print(f"SMTP_PASSWORD: {'***' if settings.SMTP_PASSWORD else 'NOT SET'}")
    print(f"SMTP_FROM_EMAIL: {'***' if settings.SMTP_FROM_EMAIL else 'NOT SET'}")
    print(f"SMTP_FROM_NAME: {settings.SMTP_FROM_NAME}")
    print(f"JWT_SECRET_KEY: {'***' if settings.JWT_SECRET_KEY and settings.JWT_SECRET_KEY != 'dev-change-this-in-production' else 'NOT SET'}")
    print()
    
    # Test if critical values are loaded
    critical_missing = []
    if not settings.SUPABASE_URL:
        critical_missing.append("SUPABASE_URL")
    if not settings.SUPABASE_ANON_KEY:
        critical_missing.append("SUPABASE_ANON_KEY")
    if not settings.SMTP_USER:
        critical_missing.append("SMTP_USER")
    if not settings.SMTP_PASSWORD:
        critical_missing.append("SMTP_PASSWORD")
    if not settings.SMTP_FROM_EMAIL:
        critical_missing.append("SMTP_FROM_EMAIL")
    
    if critical_missing:
        print(f"❌ CRITICAL: Missing environment variables: {', '.join(critical_missing)}")
        print("Environment variables are NOT loading correctly!")
    else:
        print("✅ SUCCESS: All critical environment variables are loaded!")
        print("Environment variables are loading correctly!")
        
except Exception as e:
    print(f"❌ ERROR: Failed to load configuration: {e}")
    import traceback
    traceback.print_exc()
