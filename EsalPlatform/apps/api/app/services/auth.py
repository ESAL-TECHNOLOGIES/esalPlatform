"""
Authentication service using Supabase
"""
from supabase import create_client, Client
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, Any
import uuid

from app.config import settings
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.models import User
from app.utils.jwt import create_access_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
    
    async def signup(self, user_data: UserCreate) -> TokenResponse:
        """Register a new user with Supabase and create local user record"""
        try:
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
            db_user = User(
                id=uuid.UUID(auth_response.user.id),
                email=user_data.email,
                full_name=user_data.full_name,
                role=user_data.role
            )
            
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            
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
            
        except Exception as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}"
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
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Login failed: {str(e)}"
            )
