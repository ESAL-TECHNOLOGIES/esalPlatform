#!/usr/bin/env python3
"""
ESAL Platform Email Authentication Diagnostic Tool
==================================================

This script comprehensively diagnoses email authentication issues by checking:
1. Environment configuration
2. Database connectivity 
3. SMTP configuration
4. Email service functionality
5. Authentication flow
6. Recent changes and errors

Usage: python email_auth_diagnostic.py
"""

import asyncio
import sys
import os
import logging
from datetime import datetime, timedelta
import traceback
from typing import Dict, Any, List, Optional

# Add the API directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

try:
    from app.config import settings
    from app.services.email_verification import EmailVerificationService
    from app.services.auth_supabase import SupabaseAuthService
    from supabase import create_client
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure you're running this from the correct directory")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EmailAuthDiagnostic:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.success_checks = []
        
    def log_issue(self, message: str):
        """Log a critical issue"""
        self.issues.append(message)
        print(f"❌ {message}")
        
    def log_warning(self, message: str):
        """Log a warning"""
        self.warnings.append(message)
        print(f"⚠️  {message}")
        
    def log_success(self, message: str):
        """Log a successful check"""
        self.success_checks.append(message)
        print(f"✅ {message}")

    def check_environment_config(self) -> bool:
        """Check environment configuration"""
        print("\n🔧 ENVIRONMENT CONFIGURATION CHECK")
        print("=" * 50)
        
        config_ok = True
        
        # Critical Supabase settings
        if not settings.SUPABASE_URL:
            self.log_issue("SUPABASE_URL not configured")
            config_ok = False
        else:
            self.log_success(f"SUPABASE_URL: {settings.SUPABASE_URL[:30]}...")
            
        if not settings.SUPABASE_ANON_KEY:
            self.log_issue("SUPABASE_ANON_KEY not configured")
            config_ok = False
        else:
            self.log_success("SUPABASE_ANON_KEY: Configured")
            
        if not settings.SUPABASE_SERVICE_ROLE_KEY:
            self.log_issue("SUPABASE_SERVICE_ROLE_KEY not configured")
            config_ok = False
        else:
            self.log_success("SUPABASE_SERVICE_ROLE_KEY: Configured")
        
        # SMTP Configuration
        print(f"\n📧 SMTP Configuration:")
        print(f"   Host: {settings.SMTP_HOST}")
        print(f"   Port: {settings.SMTP_PORT}")
        print(f"   User: {settings.SMTP_USER if settings.SMTP_USER else 'NOT SET'}")
        print(f"   Password: {'SET' if settings.SMTP_PASSWORD else 'NOT SET'}")
        print(f"   From Email: {settings.SMTP_FROM_EMAIL if settings.SMTP_FROM_EMAIL else 'NOT SET'}")
        print(f"   From Name: {settings.SMTP_FROM_NAME}")
        
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD or not settings.SMTP_FROM_EMAIL:
            self.log_warning("SMTP not fully configured - email verification may not work")
        else:
            self.log_success("SMTP fully configured")
        
        # JWT Configuration
        if settings.JWT_SECRET_KEY == "dev-change-this-in-production":
            self.log_warning("Using default JWT secret key")
        else:
            self.log_success("JWT secret key configured")
            
        return config_ok

    async def check_database_connectivity(self) -> bool:
        """Check database connectivity and table existence"""
        print("\n🗄️ DATABASE CONNECTIVITY CHECK")
        print("=" * 50)
        
        try:
            # Initialize Supabase client
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            self.log_success("Supabase client initialized")
            
            # Check if email_verifications table exists
            try:
                result = supabase.table("email_verifications").select("id").limit(1).execute()
                self.log_success("email_verifications table exists and is accessible")
                
            except Exception as e:
                self.log_issue(f"email_verifications table not accessible: {e}")
                return False
            
            # Check auth.users table accessibility
            try:
                users_result = supabase.auth.admin.list_users()
                self.log_success("auth.users table accessible")
            except Exception as e:
                self.log_issue(f"auth.users table not accessible: {e}")
                return False
                
            return True
            
        except Exception as e:
            self.log_issue(f"Database connection failed: {e}")
            return False

    async def check_email_service(self) -> bool:
        """Check email service functionality"""
        print("\n📧 EMAIL SERVICE CHECK")
        print("=" * 50)
        
        try:
            # Initialize services
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            email_service = EmailVerificationService(supabase)
            
            # Check SMTP configuration
            if not email_service.is_configured():
                self.log_warning("SMTP not configured - emails will not be sent")
                return False
            else:
                self.log_success("SMTP configuration valid")
            
            # Test code generation
            test_code = email_service.generate_verification_code()
            if len(test_code) == 6 and test_code.isdigit():
                self.log_success(f"Code generation working: {test_code}")
            else:
                self.log_issue(f"Code generation failed: {test_code}")
                return False
            
            return True
            
        except Exception as e:
            self.log_issue(f"Email service check failed: {e}")
            logger.error(f"Email service error: {e}", exc_info=True)
            return False

    async def check_authentication_flow(self) -> bool:
        """Check authentication service"""
        print("\n🔐 AUTHENTICATION FLOW CHECK")
        print("=" * 50)
        
        try:
            # Initialize services
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            auth_service = SupabaseAuthService()
            
            self.log_success("Authentication service initialized")
            
            # Check if we can connect to Supabase auth
            try:
                # Test auth connection by attempting to list users (this will fail gracefully if no permission)
                users = supabase.auth.admin.list_users()
                self.log_success("Supabase auth connection working")
            except Exception as e:
                self.log_warning(f"Supabase auth connection issue: {e}")
            
            return True
            
        except Exception as e:
            self.log_issue(f"Authentication flow check failed: {e}")
            logger.error(f"Auth flow error: {e}", exc_info=True)
            return False    
    async def check_recent_verifications(self) -> Dict[str, Any]:
        """Check recent verification attempts"""
        print("\n📊 RECENT VERIFICATION ATTEMPTS")
        print("=" * 50)
        
        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            
            # Get recent verification codes - fix timezone issue
            from datetime import timezone
            cutoff_time = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            
            result = supabase.table("email_verifications").select("*").gte(
                "created_at", cutoff_time
            ).order("created_at", desc=True).limit(10).execute()
            
            if result.data:
                print(f"   Found {len(result.data)} verification attempts in last 24 hours")
                
                for record in result.data[:5]:  # Show first 5
                    status = "USED" if record.get("is_used") else "UNUSED"
                    
                    # Fix timezone comparison issue
                    try:
                        expires_at_str = record["expires_at"].replace("Z", "+00:00")
                        expires_at = datetime.fromisoformat(expires_at_str)
                        current_time = datetime.now(timezone.utc)
                        
                        # Make sure both datetimes are timezone-aware
                        if expires_at.tzinfo is None:
                            expires_at = expires_at.replace(tzinfo=timezone.utc)
                        
                        expired = expires_at < current_time
                        if expired:
                            status += " (EXPIRED)"
                    except Exception as dt_error:
                        print(f"   ⚠️  Could not parse expiry time: {dt_error}")
                        status += " (UNKNOWN EXPIRY)"
                    
                    print(f"   📧 {record['email']} - {status} - {record['created_at'][:19]}")
                
                self.log_success("Recent verification data retrieved")
            else:
                self.log_warning("No recent verification attempts found")
                
            return {"recent_attempts": len(result.data) if result.data else 0}
            
        except Exception as e:
            self.log_issue(f"Could not check recent verifications: {e}")
            return {"recent_attempts": 0}

    async def check_smtp_connection(self) -> bool:
        """Test SMTP connection"""
        print("\n🔗 SMTP CONNECTION TEST")
        print("=" * 50)
        
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            self.log_warning("SMTP credentials not configured - skipping connection test")
            return False
            
        try:
            import smtplib
            import ssl
            
            print(f"   Testing connection to {settings.SMTP_HOST}:{settings.SMTP_PORT}")
            
            # Create SMTP connection
            context = ssl.create_default_context()
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls(context=context)
            
            # Test authentication
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.quit()
            
            self.log_success("SMTP connection and authentication successful")
            return True
            
        except Exception as e:
            self.log_issue(f"SMTP connection failed: {e}")
            return False

    def check_common_issues(self):
        """Check for common configuration issues"""
        print("\n🔍 COMMON ISSUES CHECK")
        print("=" * 50)
        
        # Check for mixed authentication systems
        if settings.SMTP_USER and not settings.SMTP_PASSWORD:
            self.log_issue("SMTP user set but password missing")
            
        # Check for environment file loading
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        if os.path.exists(env_path):
            self.log_success(f".env file found at {env_path}")
        else:
            self.log_warning(".env file not found - using system environment variables")
            
        # Check for conflicting configurations
        if "localhost" in settings.SUPABASE_URL:
            self.log_warning("Using localhost Supabase URL - ensure local instance is running")
            
        # Check CORS settings
        if hasattr(settings, 'ALLOWED_ORIGINS'):
            self.log_success(f"CORS configured for {len(settings.ALLOWED_ORIGINS)} origins")
        
    def print_summary(self):
        """Print diagnostic summary"""
        print("\n" + "=" * 70)
        print("📋 DIAGNOSTIC SUMMARY")
        print("=" * 70)
        
        print(f"\n✅ Successful Checks: {len(self.success_checks)}")
        for check in self.success_checks:
            print(f"   • {check}")
            
        if self.warnings:
            print(f"\n⚠️  Warnings: {len(self.warnings)}")
            for warning in self.warnings:
                print(f"   • {warning}")
        
        if self.issues:
            print(f"\n❌ Critical Issues: {len(self.issues)}")
            for issue in self.issues:
                print(f"   • {issue}")
        
        print("\n" + "=" * 70)
        
        if self.issues:
            print("🚨 CRITICAL ISSUES FOUND - Email authentication will not work properly")
            print("\n🔧 RECOMMENDED ACTIONS:")
            
            if any("SUPABASE" in issue for issue in self.issues):
                print("   1. Check Supabase configuration in .env file")
                print("   2. Verify Supabase project URL and keys")
                
            if any("SMTP" in issue for issue in self.issues):
                print("   3. Configure SMTP settings for email delivery")
                print("   4. Check Gmail App Password if using Gmail")
                
            if any("database" in issue.lower() for issue in self.issues):
                print("   5. Verify email_verifications table exists")
                print("   6. Check database permissions and RLS policies")
                
        elif self.warnings:
            print("⚠️  Some warnings found - Email authentication may have limited functionality")
        else:
            print("🎉 All checks passed - Email authentication should be working properly!")

async def main():
    """Main diagnostic function"""
    print("🚀 ESAL Platform Email Authentication Diagnostic")
    print("=" * 70)
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    diagnostic = EmailAuthDiagnostic()
    
    # Run all diagnostic checks
    checks = [
        ("Environment Configuration", diagnostic.check_environment_config()),
        ("Database Connectivity", diagnostic.check_database_connectivity()),
        ("Email Service", diagnostic.check_email_service()),
        ("Authentication Flow", diagnostic.check_authentication_flow()),
        ("SMTP Connection", diagnostic.check_smtp_connection()),
        ("Recent Verifications", diagnostic.check_recent_verifications()),
    ]
    
    # Execute checks
    for check_name, check_coro in checks:
        try:
            if asyncio.iscoroutine(check_coro):
                await check_coro
            else:
                check_coro
        except Exception as e:
            diagnostic.log_issue(f"{check_name} check failed: {e}")
            logger.error(f"{check_name} error: {e}", exc_info=True)
    
    # Check common issues
    diagnostic.check_common_issues()
    
    # Print summary
    diagnostic.print_summary()
    
    # Additional troubleshooting info
    print("\n🔧 TROUBLESHOOTING RESOURCES:")
    print("   • Email Setup Guide: EMAIL_SETUP_GUIDE.md")
    print("   • Authentication Docs: EMAIL_AUTHENTICATION_FLOW_DOCUMENTATION.md")
    print("   • Quick Reference: EMAIL_AUTHENTICATION_QUICK_REFERENCE.md")
    print("   • Test SMTP: python tests/integration/test_email_smtp.py")
    
    print(f"\n🕒 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️ Diagnostic interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Diagnostic failed with error: {e}")
        traceback.print_exc()