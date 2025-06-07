"""
Email verification service for 6-digit code verification
"""
import random
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timedelta, timezone
from supabase import Client

from app.config import settings

logger = logging.getLogger(__name__)


class EmailVerificationService:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.expiry_minutes = settings.VERIFICATION_CODE_EXPIRY_MINUTES
    
    def is_configured(self) -> bool:
        """Check if SMTP is properly configured"""
        return bool(
            self.smtp_host and 
            self.smtp_user and 
            self.smtp_password and 
            self.from_email
        )
    
    def generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return str(random.randint(100000, 999999))
    async def create_verification_code(self, user_id: str, email: str) -> str:
        """Create and store a new verification code"""
        try:
            # Generate code
            code = self.generate_verification_code()
            
            # Calculate expiry time - using timezone-aware datetime
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=self.expiry_minutes)
            
            # Clean up any existing unused codes for this user
            await self._cleanup_existing_codes(user_id)
            
            # Store in database
            result = self.supabase.table("email_verifications").insert({
                "user_id": user_id,
                "email": email,
                "code": code,
                "expires_at": expires_at.isoformat(),
                "is_used": False
            }).execute()
            
            if not result.data:
                raise Exception("Failed to store verification code")
            
            logger.info(f"Created verification code for user {user_id}")
            return code
            
        except Exception as e:
            logger.error(f"Error creating verification code: {e}")
            raise Exception(f"Failed to create verification code: {str(e)}")
    async def verify_code(self, user_id: str, code: str) -> bool:
        """Verify a 6-digit code"""
        try:
            # Find the verification record
            result = self.supabase.table("email_verifications").select("*").eq(
                "user_id", user_id
            ).eq("code", code).eq("is_used", False).execute()
            
            if not result.data:
                logger.warning(f"No valid verification code found for user {user_id}")
                return False
            
            verification = result.data[0]
            
            # Check if code has expired - fix timezone comparison
            expires_at_str = verification["expires_at"].replace("Z", "+00:00")
            expires_at = datetime.fromisoformat(expires_at_str)
            current_time = datetime.now(timezone.utc)
            
            # Ensure both datetimes are timezone-aware
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if current_time > expires_at:
                logger.warning(f"Verification code expired for user {user_id}")
                return False
            
            # Mark code as used
            self.supabase.table("email_verifications").update({
                "is_used": True,
                "verified_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", verification["id"]).execute()
            
            logger.info(f"Successfully verified code for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error verifying code: {e}")
            return False
    
    async def send_verification_email(self, email: str, code: str) -> bool:
        """Send verification code email"""
        if not self.is_configured():
            logger.warning("SMTP not configured - cannot send verification email")
            return False
            
        try:
            subject = "Your ESAL Platform Verification Code"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ 
                        font-family: Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        margin: 0; 
                        padding: 0; 
                    }}
                    .container {{ 
                        max-width: 600px; 
                        margin: 0 auto; 
                        padding: 20px; 
                        background-color: #f9f9f9; 
                    }}
                    .header {{ 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center; 
                        border-radius: 10px 10px 0 0;
                    }}
                    .content {{ 
                        padding: 30px 20px; 
                        background-color: white; 
                        border-radius: 0 0 10px 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }}
                    .verification-code {{ 
                        font-size: 36px; 
                        font-weight: bold; 
                        color: #667eea; 
                        text-align: center; 
                        letter-spacing: 8px; 
                        margin: 30px 0; 
                        padding: 20px; 
                        background-color: #f8f9ff; 
                        border: 2px dashed #667eea; 
                        border-radius: 10px;
                    }}
                    .info-box {{ 
                        background-color: #e3f2fd; 
                        border-left: 4px solid #2196f3; 
                        padding: 15px; 
                        margin: 20px 0; 
                        border-radius: 5px;
                    }}
                    .footer {{ 
                        text-align: center; 
                        padding: 20px; 
                        color: #666; 
                        font-size: 14px; 
                    }}
                    .logo {{ 
                        font-size: 28px; 
                        font-weight: bold; 
                        margin-bottom: 10px; 
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">ESAL Platform</div>
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome to ESAL Platform!</h2>
                        <p>Thank you for signing up. To complete your registration and secure your account, please enter the verification code below:</p>
                        
                        <div class="verification-code">{code}</div>
                        
                        <div class="info-box">
                            <strong>Important:</strong>
                            <ul>
                                <li>This code will expire in {self.expiry_minutes} minutes</li>
                                <li>Enter this code exactly as shown (6 digits)</li>
                                <li>If you didn't create an account, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <p>Once verified, you'll have full access to:</p>
                        <ul>
                            <li>Innovation project management tools</li>
                            <li>Investor connection platform</li>
                            <li>Collaboration and networking features</li>
                            <li>Funding opportunity discovery</li>
                        </ul>
                        
                        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                        
                        <p>Best regards,<br>The ESAL Platform Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 Esal Ventures. All rights reserved.</p>
                        <p>Building the future of innovation together.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            ESAL Platform - Email Verification
            
            Welcome to ESAL Platform!
            
            Your verification code is: {code}
            
            Important:
            - This code will expire in {self.expiry_minutes} minutes
            - Enter this code exactly as shown (6 digits)
            - If you didn't create an account, please ignore this email
            
            Once verified, you'll have full access to our innovation platform.
            
            Best regards,
            The ESAL Platform Team
            
            © 2025 Esal Ventures. All rights reserved.
            """
            
            # Send email
            return await self._send_email(email, subject, text_content, html_content)
            
        except Exception as e:
            logger.error(f"Error sending verification email: {e}")
            return False
    
    async def _send_email(self, to_email: str, subject: str, text_content: str, html_content: str) -> bool:
        """Send email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email
            
            # Add text and HTML parts
            text_part = MIMEText(text_content, "plain")
            html_part = MIMEText(html_content, "html")
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Verification email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {e}")
            return False
    
    async def _cleanup_existing_codes(self, user_id: str):
        """Clean up any existing unused codes for a user"""
        try:
            self.supabase.table("email_verifications").delete().eq(
                "user_id", user_id
            ).eq("is_used", False).execute()
        except Exception as e:
            logger.warning(f"Error cleaning up existing codes: {e}")
    
    async def resend_verification_code(self, user_id: str, email: str) -> bool:
        """Resend verification code"""
        try:
            # Create new code
            code = await self.create_verification_code(user_id, email)
            
            # Send email
            return await self.send_verification_email(email, code)
            
        except Exception as e:
            logger.error(f"Error resending verification code: {e}")
            return False
