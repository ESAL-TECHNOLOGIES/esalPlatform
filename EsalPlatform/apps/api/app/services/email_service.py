"""
Email service for sending custom emails when Supabase email is not configured
"""
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.site_url = settings.SITE_URL
        self.confirm_redirect_url = settings.CONFIRM_EMAIL_REDIRECT_URL
    
    def is_configured(self) -> bool:
        """Check if SMTP is properly configured"""
        return bool(
            self.smtp_host and 
            self.smtp_user and 
            self.smtp_password and 
            self.from_email
        )
    
    async def send_confirmation_email(self, email: str, confirmation_token: str) -> bool:
        """Send email confirmation email"""
        if not self.is_configured():
            logger.warning("SMTP not configured - cannot send custom confirmation email")
            return False
            
        try:
            # Create confirmation URL
            confirm_url = f"{self.site_url}/api/v1/auth/confirm?token={confirmation_token}"
            
            # Create email content
            subject = "Confirm Your ESAL Platform Account"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; }}
                    .button {{ 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background-color: #007bff; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0; 
                    }}
                    .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to ESAL Platform!</h1>
                    </div>
                    <div class="content">
                        <h2>Confirm Your Email Address</h2>
                        <p>Thank you for signing up for ESAL Platform. To complete your registration and start using your account, please confirm your email address by clicking the button below:</p>
                        
                        <a href="{confirm_url}" class="button">Confirm Email Address</a>
                        
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #007bff;">{confirm_url}</p>
                        
                        <p>If you didn't create an account with ESAL Platform, please ignore this email.</p>
                        
                        <p>Best regards,<br>The ESAL Platform Team</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 ESAL Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Welcome to ESAL Platform!
            
            Thank you for signing up. To complete your registration, please confirm your email address by visiting:
            
            {confirm_url}
            
            If you didn't create an account with ESAL Platform, please ignore this email.
            
            Best regards,
            The ESAL Platform Team
            """
            
            # Send email
            return await self._send_email(email, subject, text_content, html_content)
            
        except Exception as e:
            logger.error(f"Error sending confirmation email: {e}")
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
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False


# Global email service instance
email_service = EmailService()
