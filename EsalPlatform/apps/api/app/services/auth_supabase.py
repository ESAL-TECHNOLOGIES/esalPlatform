"""
Supabase Authentication service with email verification
"""
from supabase import create_client, Client
from fastapi import HTTPException, status
from typing import Dict, Any, Optional
import logging
from datetime import datetime, timezone

from app.config import settings
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.jwt import create_access_token
from app.services.email_verification import EmailVerificationService

logger = logging.getLogger(__name__)


class SupabaseAuthService:     
    def __init__(self):       
        try:
            # Use service role key for auth operations (bypasses RLS)
            service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
            if service_key:
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    service_key
                )
                logger.info("Auth service using service role key (bypasses RLS)")
            else:
                # Fallback to anon key if service role not available
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.warning("Auth service using anon key - may have RLS issues")
                
            # Initialize email verification service
            self.email_verification = EmailVerificationService(self.supabase)
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is not available"
            )    
    async def signup(self, user_data: UserCreate) -> Dict[str, Any]:
        """Register a new user - requires email verification with 6-digit code"""
        try:
            # Create user in Supabase Auth with email confirmation required
            auth_response = self.supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "full_name": user_data.full_name,
                        "role": user_data.role,
                        "is_active": False,  # Not active until email is verified
                        "is_blocked": False,
                        "email_verified": False
                    },
                    "email_confirm": False  # We'll handle our own verification
                }
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user account"
                )
            
            user_id = auth_response.user.id
            logger.info(f"User {auth_response.user.email} created - awaiting email verification")
            
            # Create and send verification code
            try:
                code = await self.email_verification.create_verification_code(user_id, user_data.email)
                email_sent = await self.email_verification.send_verification_email(user_data.email, code)
                
                if not email_sent:
                    logger.warning(f"Failed to send verification email to {user_data.email}")
                    # Don't fail the signup, but log the issue
                
            except Exception as e:
                logger.error(f"Error sending verification email: {e}")
                # Don't fail the signup process for email issues
            
            # Return response indicating verification is required
            return {
                "message": "Account created successfully! Please check your email for a 6-digit verification code.",
                "requires_verification": True,
                "user_id": user_id,
                "email": user_data.email
            }
            
        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Signup error: {error_msg}")
            
            # Handle specific Supabase errors
            if "Email address" in error_msg and "is invalid" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide a valid email address. Avoid using test domains like 'example.com'."
                )
            elif "User already registered" in error_msg or "already been registered" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please use a different email or try logging in."
                )            
            elif "Password" in error_msg and "6 characters" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must be at least 6 characters long."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Registration failed: {error_msg}"
                )

    async def verify_email_code(self, user_id: str, code: str) -> Dict[str, Any]:
        """Verify email with 6-digit code and activate account"""
        try:
            # Verify the code
            is_valid = await self.email_verification.verify_code(user_id, code)
            
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired verification code. Please try again or request a new code."
                )
            
            # Get user from Supabase
            user_response = self.supabase.auth.admin.get_user_by_id(user_id)
            if not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
              # Update user metadata to mark as verified and active
            updated_metadata = user_response.user.user_metadata or {}
            updated_metadata.update({
                "is_active": True,
                "email_verified": True,
                "verified_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Update user in Supabase
            self.supabase.auth.admin.update_user_by_id(
                user_id,
                {"user_metadata": updated_metadata}
            )
            
            logger.info(f"Email verified successfully for user {user_id}")
            
            # Create JWT token for the verified user
            access_token = create_access_token({
                "sub": user_response.user.id,
                "email": user_response.user.email,
                "role": updated_metadata.get("role", "innovator")
            })
            
            # Return response with user data
            user_data = UserResponse(
                id=user_response.user.id,
                email=user_response.user.email,
                full_name=updated_metadata.get("full_name", ""),
                role=updated_metadata.get("role", "innovator"),
                is_active=updated_metadata.get("is_active", True),
                is_blocked=updated_metadata.get("is_blocked", False),
                created_at=user_response.user.created_at.isoformat() if user_response.user.created_at else ""
            )
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_data,
                "message": "Email verified successfully! Welcome to ESAL Platform!"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Email verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Verification failed: {str(e)}"
            )
    
    async def resend_verification_code(self, email: str) -> Dict[str, Any]:
        """Resend verification code to email"""
        try:
            # Find user by email
            users = self.supabase.auth.admin.list_users()
            user = None
            for u in users:
                if u.email == email:
                    user = u
                    break
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No account found with this email address"
                )
            
            # Check if user is already verified
            user_metadata = user.user_metadata or {}
            if user_metadata.get("email_verified", False):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already verified. You can log in to your account."
                )
            
            # Resend verification code
            success = await self.email_verification.resend_verification_code(user.id, email)
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to send verification email. Please try again later."
                )
            
            return {
                "message": "Verification code sent successfully! Please check your email.",
                "user_id": user.id
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Resend verification error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to resend verification code: {str(e)}"
            )    
    async def login(self, credentials: UserLogin) -> TokenResponse:
        """Login user with Supabase Auth - requires email verification"""
        try:
            logger.info(f"Attempting login for email: {credentials.email}")
            
            # Authenticate with Supabase
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })
            
            logger.info(f"Supabase auth response received: {auth_response.user is not None}")
            
            if not auth_response.user:
                logger.warning(f"Login failed - no user returned from Supabase for {credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            # Get user metadata from Supabase
            user_metadata = auth_response.user.user_metadata or {}
            
            # Check if email is verified
            if not user_metadata.get("email_verified", False):
                logger.warning(f"Login attempt with unverified email: {credentials.email}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Please verify your email address before logging in. Check your email for the verification code."
                )
            
            # Check if user is blocked
            if user_metadata.get("is_blocked", False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account has been blocked"
                )
            
            # Check if user is active
            if not user_metadata.get("is_active", True):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is not active. Please contact support."
                )
              # Log user details for debugging
            logger.info(f"User logged in successfully: {auth_response.user.email}")
            
            # Create JWT token
            access_token = create_access_token({
                "sub": auth_response.user.id,
                "email": auth_response.user.email,
                "role": user_metadata.get("role", "innovator")
            })
            
            # Return response with user data from Supabase
            user_response = UserResponse(
                id=auth_response.user.id,
                email=auth_response.user.email,
                full_name=user_metadata.get("full_name", ""),
                role=user_metadata.get("role", "innovator"),
                is_active=user_metadata.get("is_active", True),
                is_blocked=user_metadata.get("is_blocked", False),
                created_at=auth_response.user.created_at.isoformat() if auth_response.user.created_at else ""
            )
            
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )
            
        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Login error for {credentials.email}: {error_msg}")
              # Handle specific Supabase auth errors
            if "Invalid login credentials" in error_msg or "invalid_grant" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password. Please check your credentials and try again."
                )
            elif "Email rate limit exceeded" in error_msg or "rate_limit" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many login attempts. Please try again later."
                )
            elif "User not found" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No account found with this email address. Please sign up first."
                )            
            else:                # Log the full error for debugging
                logger.error(f"Unexpected login error: {error_msg}")               
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Login failed. Please check your credentials and try again."
                )

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user data from Supabase by ID"""
        try:
            # Get current user from Supabase
            user_response = self.supabase.auth.get_user()
            
            if user_response.user and user_response.user.id == user_id:
                user_metadata = user_response.user.user_metadata or {}
                return {
                    "id": user_response.user.id,
                    "email": user_response.user.email,
                    "full_name": user_metadata.get("full_name", ""),
                    "role": user_metadata.get("role", "innovator"),
                    "is_active": user_metadata.get("is_active", True),
                    "is_blocked": user_metadata.get("is_blocked", False),
                    "created_at": user_response.user.created_at.isoformat() if user_response.user.created_at else ""
                }
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    async def update_user_metadata(self, user_id: str, metadata: Dict[str, Any]) -> bool:
        """Update user metadata in Supabase"""
        try:
            # Update user metadata
            response = self.supabase.auth.update_user({
                "data": metadata
            })
            
            return response.user is not None
            
        except Exception as e:
            logger.error(f"Error updating user metadata: {e}")
            return False
    
    async def block_user(self, user_id: str) -> bool:
        """Block a user by updating their metadata"""
        return await self.update_user_metadata(user_id, {"is_blocked": True})
    
    async def unblock_user(self, user_id: str) -> bool:
        """Unblock a user by updating their metadata"""
        return await self.update_user_metadata(user_id, {"is_blocked": False})
    
    async def change_password(self, current_password: str, new_password: str) -> bool:
        """Change user password in Supabase"""
        try:
            # Update password using Supabase auth
            response = self.supabase.auth.update_user({
                "password": new_password
            })
            
            return response.user is not None
            
        except Exception as e:
            logger.error(f"Error changing password: {e}")
            return False
    
    async def delete_user_account(self, user_id: str) -> bool:
        """Soft delete user account by marking as deleted"""
        try:
            # Mark user as deleted in metadata (soft delete)
            return await self.update_user_metadata(user_id, {
                "is_deleted": True,
                "deleted_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Error deleting user account: {e}")
            return False
        
    async def verify_password(self, user_id: str, password: str) -> bool:
        """Verify user's current password by attempting to sign in"""
        try:
            # Get user's email first
            user_data = await self.get_user_by_id(user_id)
            if not user_data:
                return False
            
            # Try to sign in with the provided password to verify it
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": user_data["email"],
                "password": password
            })
            
            return auth_response.user is not None
            
        except Exception as e:
            logger.error(f"Error verifying password: {e}")
            return False
