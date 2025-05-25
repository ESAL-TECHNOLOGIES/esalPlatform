"""
Authentication related functionality for the ESAL Platform API.

This module provides authentication utilities for securing API endpoints.
It supports JWT token authentication and integration with Supabase Auth.
"""
from datetime import datetime, timedelta
from typing import Dict, Optional, Any, Union, List
import logging
import jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from pydantic import BaseModel, EmailStr

from core.config import settings
from core.exceptions import AuthenticationError

logger = logging.getLogger(__name__)

# Define security schemes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# JWT configuration
JWT_SECRET_KEY = settings.JWT_SECRET_KEY if hasattr(settings, "JWT_SECRET_KEY") else "dev_secret_key"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str
    expires_at: int  # Unix timestamp
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    """Token data model."""
    sub: str  # user_id
    exp: int  # Expiration timestamp
    type: str = "access"  # Token type (access or refresh)
    scopes: List[str] = []  # Permission scopes


class User(BaseModel):
    """User model."""
    id: str
    email: EmailStr
    name: str
    is_active: bool = True
    is_admin: bool = False


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in the token
        expires_delta: Token expiration time
        
    Returns:
        JWT token string
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        user_id: User ID to encode in the token
        
    Returns:
        JWT refresh token string
    """
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": user_id,
        "exp": expire,
        "type": "refresh"
    }
    
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> TokenData:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData with decoded information
        
    Raises:
        AuthenticationError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        token_data = TokenData(
            sub=payload["sub"],
            exp=payload["exp"],
            type=payload.get("type", "access"),
            scopes=payload.get("scopes", [])
        )
        
        # Check if token is expired
        if datetime.utcfromtimestamp(token_data.exp) < datetime.utcnow():
            raise AuthenticationError("Token has expired")
        
        return token_data
    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise AuthenticationError("Invalid token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    api_key: Optional[str] = Depends(api_key_header),
) -> Dict[str, Any]:
    """
    Validate the authentication token and return the current user.
    
    This function supports both JWT tokens and API keys.
    
    Args:
        token: JWT token from Authorization header
        api_key: API key from X-API-Key header
        
    Returns:
        User information
        
    Raises:
        AuthenticationError: If authentication fails
    """
    # In development mode, use a mock user if no token is provided
    if settings.ENVIRONMENT == "dev" and not token and not api_key:
        logger.warning("Using mock user in development mode")
        return {
            "id": "dev_user_id",
            "email": "dev@example.com",
            "name": "Dev User",
            "is_active": True,
            "is_admin": True,
            "created_at": datetime.utcnow().isoformat()
        }
    
    # Check for API key first
    if api_key:
        # In a real implementation, this would validate the API key against a database
        # This is a placeholder implementation
        if api_key == "test_api_key":
            return {
                "id": "api_client",
                "email": "api@example.com",
                "name": "API Client",
                "is_active": True,
                "is_admin": False,
                "created_at": datetime.utcnow().isoformat()
            }
        raise AuthenticationError("Invalid API key")
    
    # Otherwise, validate JWT token
    try:
        token_data = decode_token(token)
        
        # In a real implementation, this would fetch the user from the database
        # using the user_id from token_data.sub
        # This is a placeholder implementation
        user = {
            "id": token_data.sub,
            "email": "user@example.com",
            "name": "Authenticated User",
            "is_active": True,
            "is_admin": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return user
    except AuthenticationError as e:
        raise e
    except Exception as e:
        logger.exception(f"Error validating token: {e}")
        raise AuthenticationError("Authentication failed")


async def get_current_admin(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get the current user and verify they are an admin.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Admin user information
        
    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user