"""
Authentication service using Supabase
"""
from supabase import create_client, Client
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, Any
import uuid
import logging

from app.config import settings
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.models import User
from app.utils.jwt import create_access_token

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.db = db
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
        except Exception as e:
            logger.warning(f"Failed to initialize Supabase client: {e}")
            self.supabase = None

    async def signup(self, user_data: UserCreate) -> TokenResponse:
        """Register a new user with Supabase and create local user record"""
        try:
            if not self.supabase:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Authentication service is not available"
                )

            # Check if user already exists in local database
            existing_user = self.db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please use a different email or try logging in."
                )

            # Create user in Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "full_name": user_data.full_name,
                        "role": user_data.role
                    }
                }
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user account"
                )
            
            # Create user in local database
            try:
                db_user = User(
                    id=uuid.UUID(auth_response.user.id),
                    email=user_data.email,
                    full_name=user_data.full_name,
                    role=user_data.role
                )
                self.db.add(db_user)
                self.db.commit()
                self.db.refresh(db_user)
            except Exception as db_error:
                # If local DB creation fails, we should ideally clean up Supabase user
                # For now, we'll just log and raise an error
                logger.error(f"Failed to create user in local database: {db_error}")
                self.db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Account created in authentication service but failed to save locally. Please contact support."                )
            
            # Create JWT token
            access_token = create_access_token({
                "sub": str(db_user.id),
                "email": db_user.email,
                "role": db_user.role
            })
            
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse.model_validate(db_user)
            )
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as e:
            self.db.rollback()
            error_msg = str(e)
            
            # Handle specific database errors
            if "UNIQUE constraint failed: users.email" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please use a different email or try logging in."
                )
            # Handle specific Supabase errors
            elif "Email address" in error_msg and "is invalid" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide a valid email address. Avoid using test domains like 'example.com'."
                )
            elif "User already registered" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists. Please use a different email or try logging in."
                )
            elif "Password" in error_msg:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must be at least 6 characters long."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Registration failed: {error_msg}"
                )
    
    async def login(self, credentials: UserLogin) -> TokenResponse:
        """Login user with Supabase Auth"""
        try:
            # Authenticate with Supabase
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            # Get user from local database
            db_user = self.db.query(User).filter(
                User.id == uuid.UUID(auth_response.user.id)
            ).first()
            
            if not db_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found in local database"
                )
            
            if db_user.is_blocked:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account has been blocked"
                )
            
            # Create JWT token
            access_token = create_access_token({
                "sub": str(db_user.id),
                "email": db_user.email,
                "role": db_user.role
            })
            return TokenResponse(
                access_token=access_token,
                token_type="bearer",
                user=UserResponse.model_validate(db_user)
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {e}")
            import traceback
            logger.error(f"Login traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Login failed: {str(e)}"
            )
