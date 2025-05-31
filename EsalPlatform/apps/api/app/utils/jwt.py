"""
JWT token utilities for authentication with Supabase
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
from supabase import create_client, Client

from app.config import settings
from app.schemas import UserResponse

security = HTTPBearer()


def create_access_token(data: Dict[str, Any]) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(seconds=settings.JWT_EXPIRATION_TIME)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def get_current_user(
    token: str = Depends(security)
) -> UserResponse:
    """Get current user from JWT token using Supabase"""
    try:
        # Extract token from Bearer format
        if hasattr(token, 'credentials'):
            token_str = token.credentials
        else:
            token_str = str(token)
        
        # Verify token
        payload = verify_token(token_str)
        user_id = payload.get("sub")
        user_email = payload.get("email")
        user_role = payload.get("role", "innovator")
        
        if user_id is None or user_email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Initialize Supabase client
        try:
            supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is not available"
            )
        
        # Get user from Supabase
        try:
            user_response = supabase.auth.get_user(token_str)
            if not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            supabase_user = user_response.user
            user_metadata = supabase_user.user_metadata or {}
            
            # Check if user is blocked
            if user_metadata.get("is_blocked", False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account has been blocked"
                )
            
            # Return user data from Supabase
            return UserResponse(
                id=supabase_user.id,
                email=supabase_user.email,
                full_name=user_metadata.get("full_name", ""),
                role=user_metadata.get("role", user_role),
                is_active=user_metadata.get("is_active", True),
                is_blocked=user_metadata.get("is_blocked", False),
                created_at=supabase_user.created_at.isoformat() if supabase_user.created_at else ""
            )
            
        except HTTPException:
            raise
        except Exception as e:
            # If Supabase call fails, create user response from JWT payload
            # This is a fallback for cases where the Supabase token might not work
            # but our JWT token is still valid
            return UserResponse(
                id=user_id,
                email=user_email,
                full_name="",  # We don't have this in the JWT payload
                role=user_role,
                is_active=True,
                is_blocked=False,
                created_at=""
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )
