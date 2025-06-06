"""
JWT token utilities for authentication with Supabase
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import jwt
import logging
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer
from supabase import create_client, Client

from app.config import settings
from app.schemas import UserResponse

security = HTTPBearer()
logger = logging.getLogger(__name__)


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
          # Initialize Supabase client - prefer service role for admin operations, anon for user verification
        try:
            service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
            if service_key:
                supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    service_key
                )
                logger.debug("JWT service using service role key")
            else:
                # Fallback to anon key for user token verification
                supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.debug("JWT service using anon key")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Authentication service is not available"
            )
        
        # Try to get user from Supabase first (using Supabase JWT)
        try:
            user_response = supabase.auth.get_user(token_str)
            if user_response.user:
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
                    role=user_metadata.get("role", "innovator"),
                    is_active=user_metadata.get("is_active", True),
                    is_blocked=user_metadata.get("is_blocked", False),
                    created_at=supabase_user.created_at.isoformat() if supabase_user.created_at else ""
                )
        except Exception as supabase_error:
            logger.warning(f"Supabase auth failed, trying JWT fallback: {supabase_error}")
            
            # Fallback to our JWT verification if Supabase auth fails
            try:
                payload = verify_token(token_str)
                user_id = payload.get("sub")
                user_email = payload.get("email")
                user_role = payload.get("role", "innovator")
                
                if user_id is None or user_email is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token payload"
                    )
                
                # Return user data from JWT payload
                return UserResponse(
                    id=user_id,
                    email=user_email,
                    full_name=payload.get("full_name", ""),
                    role=user_role,
                    is_active=True,
                    is_blocked=False,
                    created_at=""
                )
            except Exception as jwt_error:
                logger.error(f"Both Supabase and JWT auth failed: {jwt_error}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication failed"
                )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


async def get_current_user_from_token(token: str) -> Optional[UserResponse]:
    """Get current user from JWT token - for middleware use"""
    try:
        return get_current_user(token)
    except HTTPException:
        return None
    except Exception as e:
        logger.debug(f"Error getting user from token: {e}")
        return None
