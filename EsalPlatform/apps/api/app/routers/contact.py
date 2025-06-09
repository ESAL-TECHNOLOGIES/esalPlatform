"""
Contact form router for handling contact form submissions
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel, EmailStr, ValidationError
import logging

from app.services.email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/test")
async def test_contact_endpoint():
    """Simple test endpoint to verify CORS is working"""
    return {"message": "Contact endpoint is working", "success": True}


class ContactFormData(BaseModel):
    """Contact form submission data"""
    firstName: str
    lastName: str
    email: EmailStr
    role: str
    message: str


class ContactFormResponse(BaseModel):
    """Response for contact form submission"""
    success: bool
    message: str


@router.post("/submit", response_model=ContactFormResponse)
async def submit_contact_form(
    contact_data: ContactFormData,
    background_tasks: BackgroundTasks
):
    """
    Submit contact form data and send email to ESAL
    """
    try:
        logger.info(f"Received contact form submission from: {contact_data.email}")
        logger.info(f"Role: {contact_data.role}")
        logger.info(f"Message length: {len(contact_data.message)}")
        
        # Validate role
        valid_roles = [
            "Innovator/Entrepreneur",
            "Investor", 
            "Innovation Hub/Accelerator",
            "Other"
        ]
        
        if contact_data.role not in valid_roles:
            logger.error(f"Invalid role: '{contact_data.role}', valid roles: {valid_roles}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid role selected. Valid roles are: {', '.join(valid_roles)}"
            )
        
        # Check if email service is configured
        if not email_service.is_configured():
            logger.error("Email service not configured")
            raise HTTPException(
                status_code=500,
                detail="Email service is not available at the moment. Please try again later."
            )
        
        # Send email in background
        background_tasks.add_task(
            send_contact_email,
            contact_data
        )
        
        return ContactFormResponse(
            success=True,
            message="Thank you for your message! We'll get back to you soon."
        )
    except HTTPException:
        raise
    except ValidationError as e:
        logger.error(f"Validation error in contact form: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data provided: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing contact form: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your message. Please try again."
        )


async def send_contact_email(contact_data: ContactFormData):
    """
    Send contact form email to ESAL team
    """
    try:
        # Email to ESAL team
        esal_email = "esalventuresltd@gmail.com"
        subject = f"New Contact Form Submission from {contact_data.firstName} {contact_data.lastName}"
        
        # Create HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ padding: 20px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #555; }}
                .value {{ margin-top: 5px; padding: 10px; background-color: white; border-radius: 4px; border-left: 4px solid #667eea; }}
                .message-box {{ background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #764ba2; margin-top: 10px; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Contact Form Submission</h1>
                    <p>ESAL Platform Landing Page</p>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">Contact Information:</div>
                        <div class="value">
                            <strong>Name:</strong> {contact_data.firstName} {contact_data.lastName}<br>
                            <strong>Email:</strong> {contact_data.email}<br>
                            <strong>Role:</strong> {contact_data.role}
                        </div>
                    </div>
                    
                    <div class="field">
                        <div class="label">Message:</div>
                        <div class="message-box">
                            {contact_data.message.replace(chr(10), '<br>')}
                        </div>
                    </div>
                    
                    <div class="field">
                        <div class="label">Submission Details:</div>
                        <div class="value">
                            <strong>Submitted:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
                            <strong>Source:</strong> ESAL Platform Landing Page
                        </div>
                    </div>
                </div>
                <div class="footer">
                    <p>This message was sent from the ESAL Platform contact form.</p>
                    <p>Please respond directly to: {contact_data.email}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create text email content
        text_content = f"""
        New Contact Form Submission - ESAL Platform
        
        Contact Information:
        Name: {contact_data.firstName} {contact_data.lastName}
        Email: {contact_data.email}
        Role: {contact_data.role}
        
        Message:
        {contact_data.message}
        
        Submission Details:
        Submitted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
        Source: ESAL Platform Landing Page
        
        Please respond directly to: {contact_data.email}
        """
        
        # Send email to ESAL team
        success = await email_service._send_email(
            esal_email,
            subject,
            text_content,
            html_content
        )
        
        if success:
            logger.info(f"Contact form email sent successfully to {esal_email}")
        else:
            logger.error(f"Failed to send contact form email to {esal_email}")
            
    except Exception as e:
        logger.error(f"Error sending contact form email: {e}")


# Import datetime here to avoid circular import
from datetime import datetime
