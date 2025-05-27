"""
Authentication endpoints for the ESAL Platform API.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field

from core.database import get_session
from core.auth_enhanced import (
    Token, UserResponse, create_token_response, 
    get_current_user, get_current_active_user, decode_token
)
from core.exceptions import AuthenticationError, AuthorizationError
from models.user import User, UserRoleEnum, UserStatusEnum

router = APIRouter()


class UserRegistration(BaseModel):
    """User registration model."""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8)
    role: UserRoleEnum = Field(default=UserRoleEnum.INNOVATOR)


class PasswordReset(BaseModel):
    """Password reset model."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model."""
    token: str
    new_password: str = Field(..., min_length=8)


class PasswordChange(BaseModel):
    """Password change model."""
    current_password: str
    new_password: str = Field(..., min_length=8)


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


@router.post("/register", response_model=Token, summary="Register new user")
async def register_user(
    user_data: UserRegistration,
    db: Session = Depends(get_session)
) -> Token:
    """
    Register a new user account.
    
    - **Innovator role**: Automatically approved
    - **Investor/Hub roles**: Require manual approval
    """
    # TODO: Implement actual user registration with database
    # This is a placeholder implementation
    
    # Check if email already exists
    # existing_user = db.query(User).filter(User.email == user_data.email).first()
    # if existing_user:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Email already registered"
    #     )
    
    # Determine initial approval status
    is_approved = user_data.role == UserRoleEnum.INNOVATOR
    initial_status = UserStatusEnum.APPROVED if is_approved else UserStatusEnum.PENDING
    
    # Create new user (placeholder)
    new_user = User(
        id=f"user_{user_data.email.replace('@', '_')}",
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        status=initial_status,
        is_approved=is_approved,
        created_at=datetime.utcnow()
    )
    
    # Generate tokens
    return create_token_response(new_user)


@router.post("/login", response_model=Token, summary="User login")
async def login_user(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session)
) -> Token:
    """
    Authenticate user and return access token.
    
    Supports both email and username for login.
    """
    from services.auth_service import authenticate_user
    
    # Authenticate user with database
    auth_user = authenticate_user(form_data.username, form_data.password)
    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is approved (for admin access)
    if not auth_user.is_approved and auth_user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending approval"
        )
    
    # Convert to User model for token creation
    user = User(
        id=auth_user.id,
        email=auth_user.email,
        name=auth_user.name,
        role=UserRoleEnum(auth_user.role),
        status=UserStatusEnum(auth_user.status),
        is_approved=auth_user.is_approved,
        is_active=auth_user.is_active,
        last_login=datetime.utcnow()
    )
    
    # Create token response
    token_response = create_token_response(user)
    
    # Set secure HTTP-only cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=token_response.refresh_token,
        httponly=True,
        secure=False,  # Set to False for local development
        samesite="lax",  # Changed to lax for local development
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return token_response


@router.post("/refresh", response_model=Token, summary="Refresh access token")
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_session)
) -> Token:
    """
    Refresh access token using refresh token.
    """
    try:
        # Decode refresh token
        token_data = decode_token(request.refresh_token)
        
        if token_data.type != "refresh":
            raise AuthenticationError("Invalid token type")
        
        # Get user from database
        from services.auth_service import get_user_by_id
        auth_user = get_user_by_id(token_data.sub)
        if not auth_user or not auth_user.is_active:
            raise AuthenticationError("User not found or inactive")
        
        # Convert to User model
        user = User(
            id=auth_user.id,
            email=auth_user.email,
            name=auth_user.name,
            role=UserRoleEnum(auth_user.role),
            status=UserStatusEnum(auth_user.status),
            is_approved=auth_user.is_approved,
            is_active=auth_user.is_active
        )
        
        # Generate new tokens
        return create_token_response(user)
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )


@router.post("/logout", summary="User logout")
async def logout_user(
    response: Response,
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """
    Logout user and invalidate tokens.
    """
    # Clear refresh token cookie
    response.delete_cookie("refresh_token")
    
    # TODO: Add token to blacklist in Redis/database
    
    return {"message": "Successfully logged out"}


@router.post("/forgot-password", summary="Request password reset")
async def forgot_password(
    request: PasswordReset,
    db: Session = Depends(get_session)
) -> Dict[str, str]:
    """
    Request password reset email.
    """
    # TODO: Implement password reset logic
    # 1. Check if user exists
    # 2. Generate reset token
    # 3. Send reset email
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password", summary="Reset password")
async def reset_password(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_session)
) -> Dict[str, str]:
    """
    Reset password using reset token.
    """
    # TODO: Implement password reset logic
    # 1. Validate reset token (reset_data.token)
    # 2. Update user password (reset_data.new_password)
    # 3. Invalidate reset token
    
    return {"message": "Password has been reset successfully"}


@router.post("/change-password", summary="Change password")
async def change_password(
    request: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
) -> Dict[str, str]:
    """
    Change user password.
    """
    # TODO: Implement password change logic
    # 1. Verify current password
    # 2. Update to new password
    # 3. Optionally invalidate all existing sessions
    
    return {"message": "Password changed successfully"}


@router.get("/verify-role/{role}", summary="Verify role access")
async def verify_role_access(
    role: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Verify if current user can access a specific role/portal.
    """
    can_access = current_user.can_access_portal(role)
    
    return {
        "can_access": can_access,
        "user_role": current_user.role,
        "is_approved": current_user.is_approved,
        "requires_approval": role in ["investor", "hub"] and not current_user.is_approved
    }


@router.get("/permissions", summary="Get user permissions")
async def get_user_permissions(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get current user's permissions and capabilities.
    """
    from models.user import Permissions
    
    default_permissions = Permissions.get_default_permissions(current_user.role)
    
    return {
        "user_id": current_user.id,
        "role": current_user.role,
        "permissions": default_permissions,
        "portal_access": {
            "innovator": current_user.can_access_portal("innovator"),
            "investor": current_user.can_access_portal("investor"),
            "hub": current_user.can_access_portal("hub"),
            "admin": current_user.can_access_portal("admin")
        },
        "features": {
            "ai_matchmaking": Permissions.AI_MATCHMAKING in default_permissions,
            "ai_pitch_scoring": Permissions.AI_PITCH_SCORING in default_permissions,
            "ai_evaluation": Permissions.AI_EVALUATION in default_permissions,
            "analytics": Permissions.ANALYTICS_VIEW in default_permissions,
            "user_management": Permissions.USER_APPROVE in default_permissions
        }
    }
