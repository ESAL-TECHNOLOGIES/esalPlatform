"""
Enhanced authentication and authorization for ESAL Platform API.

This module provides comprehensive authentication utilities with role-based access control.
"""

from datetime import datetime, timedelta
from typing import Dict, Optional, Any, Union, List, Callable
import logging
from functools import wraps
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from core.config import settings
from core.exceptions import AuthenticationError, AuthorizationError
from core.database import get_session
from models.user import User, UserRoleEnum, Permissions

logger = logging.getLogger(__name__)

# Define security schemes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# JWT configuration
JWT_SECRET_KEY = getattr(settings, "JWT_SECRET_KEY", "dev_secret_key")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str
    expires_at: int  # Unix timestamp
    refresh_token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None


class TokenData(BaseModel):
    """Token data model."""
    sub: str  # user_id
    exp: int  # Expiration timestamp
    type: str = "access"  # Token type (access or refresh)
    scopes: List[str] = []  # Permission scopes
    role: Optional[str] = None


class UserResponse(BaseModel):
    """User response model."""
    id: str
    email: EmailStr
    name: str
    role: str
    is_active: bool = True
    is_approved: bool = False
    permissions: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None
    last_login: Optional[str] = None


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing token data
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """
    Create a JWT refresh token.
    
    Args:
        user_id: User identifier
        
    Returns:
        Encoded JWT refresh token
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
        token: JWT token to decode
        
    Returns:
        TokenData object
        
    Raises:
        AuthenticationError: If token is invalid
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token: missing user ID")
        
        return TokenData(
            sub=user_id,
            exp=payload.get("exp"),
            type=payload.get("type", "access"),
            scopes=payload.get("scopes", []),
            role=payload.get("role")
        )
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise AuthenticationError("Invalid token")


async def get_user_from_db(user_id: str, db: Session) -> Optional[User]:
    """
    Fetch user from database.
    
    Args:
        user_id: User identifier
        db: Database session
        
    Returns:
        User object or None
    """
    # This would be implemented with actual database queries
    # For now, returning a mock user for development
    if settings.ENVIRONMENT == "dev":
        return User(
            id=user_id,
            email="dev@example.com",
            name="Dev User",
            role=UserRoleEnum.ADMIN,
            is_active=True,
            is_approved=True
        )
    
    # TODO: Implement actual database query
    # return db.query(User).filter(User.id == user_id).first()
    return None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    api_key: Optional[str] = Depends(api_key_header),
    db: Session = Depends(get_session)
) -> User:
    """
    Validate the authentication token and return the current user.
    
    Args:
        token: JWT token from Authorization header
        api_key: API key from X-API-Key header
        db: Database session
        
    Returns:
        User object
        
    Raises:
        AuthenticationError: If authentication fails
    """
    # Development mode fallback
    if settings.ENVIRONMENT == "dev" and not token and not api_key:
        logger.warning("Using mock user in development mode")
        return User(
            id="dev_user_id",
            email="dev@example.com",
            name="Dev User",
            role=UserRoleEnum.ADMIN,
            is_active=True,
            is_approved=True
        )
    
    # Check for API key first
    if api_key:
        # TODO: Implement API key validation against database
        if api_key == "test_api_key":
            return User(
                id="api_client",
                email="api@example.com",
                name="API Client",
                role=UserRoleEnum.ADMIN,
                is_active=True,
                is_approved=True
            )
        raise AuthenticationError("Invalid API key")
    
    # Validate JWT token
    try:
        token_data = decode_token(token)
        user = await get_user_from_db(token_data.sub, db)
        
        if user is None:
            raise AuthenticationError("User not found")
        
        if not user.is_active:
            raise AuthenticationError("User account is disabled")
        
        return user
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise AuthenticationError("Could not validate credentials")


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Active user
        
    Raises:
        AuthenticationError: If user is not active
    """
    if not current_user.is_active:
        raise AuthenticationError("Inactive user")
    return current_user


def require_role(required_role: UserRoleEnum):
    """
    Decorator to require a specific user role.
    
    Args:
        required_role: Required user role
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user from kwargs (assumes it's passed as dependency)
            current_user = kwargs.get('current_user')
            if not current_user or current_user.role != required_role:
                raise AuthorizationError(f"Access denied. Required role: {required_role}")
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_permission(required_permission: str):
    """
    Decorator to require a specific permission.
    
    Args:
        required_permission: Required permission
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user or not current_user.has_permission(required_permission):
                raise AuthorizationError(f"Access denied. Required permission: {required_permission}")
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_portal_access(portal: str):
    """
    Decorator to require access to a specific portal.
    
    Args:
        portal: Portal name (innovator, investor, hub, admin)
        
    Returns:
        Decorated function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user or not current_user.can_access_portal(portal):
                raise AuthorizationError(f"Access denied to {portal} portal")
            return await func(*args, **kwargs)
        return wrapper
    return decorator


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Admin user
        
    Raises:
        AuthorizationError: If user is not admin
    """
    if current_user.role != UserRoleEnum.ADMIN:
        raise AuthorizationError("Admin access required")
    return current_user


async def get_approved_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user and verify approval status for restricted roles.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Approved user
        
    Raises:
        AuthorizationError: If user requires approval
    """
    if current_user.role in [UserRoleEnum.INVESTOR, UserRoleEnum.HUB] and not current_user.is_approved:
        raise AuthorizationError("Account approval required for this role")
    return current_user


def create_token_response(user: User) -> Token:
    """
    Create a complete token response for a user.
    
    Args:
        user: User object
        
    Returns:
        Token response
    """
    # Create access token with user claims
    access_token_data = {
        "sub": user.id,
        "role": user.role,
        "scopes": Permissions.get_default_permissions(user.role)
    }
    
    access_token = create_access_token(access_token_data)
    refresh_token = create_refresh_token(user.id)
    expires_at = int((datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp())
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_at=expires_at,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_approved": user.is_approved,
            "permissions": Permissions.get_default_permissions(user.role)
        }
    )
