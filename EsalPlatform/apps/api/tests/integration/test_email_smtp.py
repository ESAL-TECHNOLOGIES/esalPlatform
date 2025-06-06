#!/usr/bin/env python3
"""
Test script for ESAL Platform email SMTP service
This script tests sending verification emails using the configured SMTP settings
"""
import asyncio
import sys
import os
import logging
from datetime import datetime

# Add the API directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'EsalPlatform', 'apps', 'api'))

from app.config import settings
from app.services.email_verification import EmailVerificationService
from supabase import create_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_email_smtp():
    """Test the email SMTP service by sending a verification email"""
    
    print("🔧 ESAL Platform Email SMTP Test")
    print("=" * 50)
      # Test email address
    test_email = "danielokinda001@gmail.com"
    
    # Check SMTP configuration
    print("\n📋 Checking SMTP Configuration:")
    print(f"   SMTP Host: {settings.SMTP_HOST}")
    print(f"   SMTP Port: {settings.SMTP_PORT}")
    print(f"   SMTP User: {settings.SMTP_USER}")
    print(f"   From Email: {settings.SMTP_FROM_EMAIL}")
    print(f"   From Name: {settings.SMTP_FROM_NAME}")
    print(f"   Password: {'✓ Configured' if settings.SMTP_PASSWORD else '✗ Missing'}")
    
    try:
        # Initialize Supabase client (for the email service)
        print("\n🔗 Initializing Supabase client...")
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        
        # Initialize email service
        print("📧 Initializing email verification service...")
        email_service = EmailVerificationService(supabase)
        
        # Check if SMTP is configured
        if not email_service.is_configured():
            print("❌ SMTP is not properly configured!")
            return False
        
        print("✅ SMTP configuration looks good!")
        
        # Generate a test verification code
        print(f"\n🔢 Generating test verification code...")
        test_code = email_service.generate_verification_code()
        print(f"   Generated code: {test_code}")
        
        # Send test email
        print(f"\n📤 Sending test email to {test_email}...")
        success = await email_service.send_verification_email(test_email, test_code)
        
        if success:
            print("✅ Email sent successfully!")
            print(f"   📧 Check {test_email} for the verification email")
            print(f"   🔢 Verification code: {test_code}")
            print(f"   ⏰ Sent at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            return True
        else:
            print("❌ Failed to send email!")
            return False
            
    except Exception as e:
        print(f"❌ Error during email test: {e}")
        logger.error(f"Email test error: {e}", exc_info=True)
        return False

async def test_smtp_connection_only():
    """Test just the SMTP connection without Supabase"""
    
    print("\n🔗 Testing SMTP Connection Only:")
    print("-" * 30)
    
    import smtplib
    import ssl
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = "danielokinda001@gmail.com"
        message["Subject"] = "ESAL Platform SMTP Test"
        
        # Email body
        body = f"""
        Hello!
        
        This is a test email from the ESAL Platform SMTP service.
        
        Test Details:
        - Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        - SMTP Host: {settings.SMTP_HOST}
        - SMTP Port: {settings.SMTP_PORT}
        - From: {settings.SMTP_FROM_EMAIL}
        
        If you received this email, the SMTP configuration is working correctly!
        
        Best regards,
        ESAL Platform Team
        """
        
        message.attach(MIMEText(body, "plain"))
        
        # Create SMTP session
        print(f"   Connecting to {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
        
        # Create secure connection
        context = ssl.create_default_context()
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls(context=context)
        
        print("   Authenticating...")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        print("   Sending email...")
        text = message.as_string()
        server.sendmail(settings.SMTP_FROM_EMAIL, "danielokinda001@gmail.com", text)
        server.quit()
        
        print("✅ SMTP connection and email sending successful!")
        return True
        
    except Exception as e:
        print(f"❌ SMTP connection failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Starting ESAL Platform Email SMTP Tests")
    print("=" * 60)
    
    # Test 1: Full email service test
    print("\n📋 Test 1: Full Email Verification Service")
    full_test_success = await test_email_smtp()
    
    # Test 2: Basic SMTP connection test
    print("\n📋 Test 2: Basic SMTP Connection")
    smtp_test_success = await test_smtp_connection_only()
    
    # Summary
    print("\n📊 Test Summary:")
    print("=" * 30)
    print(f"   Full Service Test: {'✅ PASSED' if full_test_success else '❌ FAILED'}")
    print(f"   SMTP Connection Test: {'✅ PASSED' if smtp_test_success else '❌ FAILED'}")
      if full_test_success or smtp_test_success:
        print("\n🎉 At least one test passed! Check danielokinda001@gmail.com for test emails.")
    else:
        print("\n😞 All tests failed. Please check your SMTP configuration.")
        
        print("\n🔧 Troubleshooting Tips:")
        print("   1. Verify Gmail App Password is correct")
        print("   2. Ensure 2FA is enabled on Gmail account")
        print("   3. Check if 'Less secure app access' is enabled (if needed)")
        print("   4. Verify SMTP settings in config.py")
        print("   5. Check firewall/network restrictions")

if __name__ == "__main__":
    asyncio.run(main())
