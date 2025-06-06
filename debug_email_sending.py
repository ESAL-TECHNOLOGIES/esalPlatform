#!/usr/bin/env python3
"""
Debug script to test the email sending process step by step
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
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def debug_email_verification_service():
    """Debug the email verification service step by step"""
    
    print("🔍 Debugging Email Verification Service")
    print("=" * 50)
    
    try:
        # Initialize Supabase client
        print("\n1️⃣ Initializing Supabase client...")
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        print("✅ Supabase client initialized")
        
        # Initialize email service
        print("\n2️⃣ Initializing email verification service...")
        email_service = EmailVerificationService(supabase)
        print("✅ Email verification service initialized")
        
        # Check SMTP configuration
        print("\n3️⃣ Checking SMTP configuration...")
        print(f"   SMTP Host: {settings.SMTP_HOST}")
        print(f"   SMTP Port: {settings.SMTP_PORT}")
        print(f"   SMTP User: {settings.SMTP_USER}")
        print(f"   SMTP Password: {'✓ Set' if settings.SMTP_PASSWORD else '✗ Missing'}")
        print(f"   From Email: {settings.SMTP_FROM_EMAIL}")
        print(f"   From Name: {settings.SMTP_FROM_NAME}")
        
        if not email_service.is_configured():
            print("❌ SMTP is not properly configured!")
            return False
        print("✅ SMTP configuration valid")
        
        # Test creating verification code in database
        print("\n4️⃣ Testing verification code creation...")
        test_user_id = "e085676f-5dbc-442c-bcb1-562ad7996c1f"  # From the test
        test_email = "danielokinda001@gmail.com"
        
        try:
            result = await email_service.create_verification_code(test_user_id, test_email)
            print(f"✅ Verification code created: {result}")
        except Exception as e:
            print(f"❌ Failed to create verification code: {e}")
            logger.error(f"Create verification error: {e}", exc_info=True)
            return False
        
        # Test sending email directly
        print("\n5️⃣ Testing email sending directly...")
        test_code = email_service.generate_verification_code()
        print(f"   Test code: {test_code}")
        
        try:
            success = await email_service.send_verification_email(test_email, test_code)
            if success:
                print("✅ Email sent successfully!")
                print(f"   📧 Check {test_email} for the verification email")
                return True
            else:
                print("❌ Email sending failed!")
                return False
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            logger.error(f"Email send error: {e}", exc_info=True)
            return False
            
    except Exception as e:
        print(f"❌ Error in debug process: {e}")
        logger.error(f"Debug error: {e}", exc_info=True)
        return False

async def test_manual_smtp():
    """Test SMTP manually with detailed logging"""
    
    print("\n📧 Manual SMTP Test with Detailed Logging")
    print("=" * 50)
    
    import smtplib
    import ssl
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    try:
        # Create test message
        message = MIMEMultipart()
        message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        message["To"] = "danielokinda001@gmail.com"
        message["Subject"] = "ESAL Platform Debug Test - Manual SMTP"
        
        body = f"""
Hello!

This is a debug test email sent manually to verify SMTP functionality.

Details:
- Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- Test Type: Manual SMTP Debug
- SMTP Host: {settings.SMTP_HOST}
- SMTP Port: {settings.SMTP_PORT}

If you receive this email, the SMTP configuration is working correctly!

Best regards,
ESAL Platform Debug Team
        """
        
        message.attach(MIMEText(body, "plain"))
        
        # Create SMTP session with detailed logging
        print(f"   🔗 Connecting to {settings.SMTP_HOST}:{settings.SMTP_PORT}...")
        
        # Enable debug mode
        smtp_debug_level = 1  # Set to 2 for more verbose output
        
        # Create secure connection
        context = ssl.create_default_context()
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.set_debuglevel(smtp_debug_level)
        
        print("   🔐 Starting TLS...")
        server.starttls(context=context)
        
        print("   🔑 Authenticating...")
        print(f"      Username: {settings.SMTP_USER}")
        print(f"      Password: {'*' * len(settings.SMTP_PASSWORD)}")
        
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        print("   ✅ Authentication successful!")
        
        print("   📤 Sending email...")
        text = message.as_string()
        result = server.sendmail(settings.SMTP_FROM_EMAIL, "danielokinda001@gmail.com", text)
        
        print(f"   📊 Send result: {result}")
        server.quit()
        
        print("✅ Manual SMTP test completed successfully!")
        print("📧 Check danielokinda001@gmail.com for the test email")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication failed: {e}")
        print("   🔧 Check your Gmail App Password")
        return False
    except smtplib.SMTPConnectError as e:
        print(f"❌ SMTP Connection failed: {e}")
        print("   🔧 Check SMTP host and port settings")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        logger.error(f"Manual SMTP error: {e}", exc_info=True)
        return False

async def check_database_verification_codes():
    """Check if verification codes are being saved to database"""
    
    print("\n🗄️ Checking Database Verification Codes")
    print("=" * 40)
    
    try:
        # Initialize Supabase client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        
        # Query recent verification codes
        print("   Querying recent verification codes...")
        
        result = supabase.table('email_verifications').select('*').order('created_at', desc=True).limit(5).execute()
        
        if result.data:
            print(f"   ✅ Found {len(result.data)} recent verification codes:")
            for i, code in enumerate(result.data, 1):
                print(f"      {i}. User: {code.get('user_id', 'N/A')[:8]}...")
                print(f"         Email: {code.get('email', 'N/A')}")
                print(f"         Code: {code.get('code', 'N/A')}")
                print(f"         Created: {code.get('created_at', 'N/A')}")
                print(f"         Used: {code.get('is_used', 'N/A')}")
                print()
        else:
            print("   ⚠️ No verification codes found in database")
            
        return True
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        logger.error(f"Database check error: {e}", exc_info=True)
        return False

async def main():
    """Main debug function"""
    
    print("🚀 ESAL Platform Email Debug Suite")
    print("=" * 60)
    
    # Test 1: Debug email verification service
    print("\n🔍 Debug 1: Email Verification Service")
    service_success = await debug_email_verification_service()
    
    # Test 2: Manual SMTP test
    print("\n🔍 Debug 2: Manual SMTP Test")
    smtp_success = await test_manual_smtp()
    
    # Test 3: Check database
    print("\n🔍 Debug 3: Database Verification Codes")
    db_success = await check_database_verification_codes()
    
    # Summary
    print("\n📊 Debug Summary:")
    print("=" * 30)
    print(f"   Email Service: {'✅ OK' if service_success else '❌ FAILED'}")
    print(f"   Manual SMTP: {'✅ OK' if smtp_success else '❌ FAILED'}")
    print(f"   Database Check: {'✅ OK' if db_success else '❌ FAILED'}")
    
    if service_success and smtp_success:
        print("\n🎉 Email system appears to be working correctly!")
        print("📧 Check danielokinda001@gmail.com for test emails")
    else:
        print("\n🔧 Issues found. Check the debug output above for details.")

if __name__ == "__main__":
    asyncio.run(main())
