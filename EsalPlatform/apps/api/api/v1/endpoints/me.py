"""
User profile and authentication status endpoints.
"""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from core.auth_enhanced import get_current_user, get_current_active_user, UserResponse
from core.database import get_session
from models.user import User, Permissions

router = APIRouter()


class UserProfileResponse(BaseModel):
    """User profile response model."""
    id: str
    email: str
    name: str
    role: str = Field(..., description="User role: innovator, investor, or hub")
    is_approved: bool = Field(..., description="Whether user is approved for restricted roles")
    profile: Optional[Dict[str, Any]] = Field(default=None, description="Extended profile data")
    permissions: list[str] = Field(default_factory=list, description="User permissions")
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UserPermissions(BaseModel):
    """User permissions model."""
    can_access_ai_matchmaking: bool = False
    can_access_ai_pitch: bool = False
    can_access_ai_score: bool = False
    can_manage_projects: bool = False
    can_view_analytics: bool = False
    can_approve_users: bool = False


def get_user_permissions(user: Dict[str, Any]) -> UserPermissions:
    """
    Get user permissions based on role and approval status.
    
    Args:
        user: User data dictionary
        
    Returns:
        UserPermissions object with role-based permissions
    """
    role = user.get("role", "")
    is_approved = user.get("is_approved", False)
    
    permissions = UserPermissions()
    
    if role == "innovator":
        # Innovators have access to AI services and project management
        permissions.can_access_ai_pitch = True
        permissions.can_access_ai_score = True
        permissions.can_manage_projects = True
        
        # If approved, can access matchmaking
        if is_approved:
            permissions.can_access_ai_matchmaking = True
    
    elif role == "investor" and is_approved:
        # Approved investors have full AI access and analytics
        permissions.can_access_ai_matchmaking = True
        permissions.can_access_ai_pitch = True
        permissions.can_access_ai_score = True
        permissions.can_view_analytics = True
        
    elif role == "hub" and is_approved:
        # Approved hubs have full access including user management
        permissions.can_access_ai_matchmaking = True
        permissions.can_access_ai_pitch = True
        permissions.can_access_ai_score = True
        permissions.can_view_analytics = True
        permissions.can_manage_projects = True
        permissions.can_approve_users = True
    
    return permissions


@router.get(
    "/me", 
    response_model=UserProfileResponse,
    summary="Get current user profile and permissions"
)
async def get_me(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserProfileResponse:
    """
    Get the current authenticated user's profile, role, and permissions.
    
    This endpoint is used by the frontend to:
    - Determine which portal to show
    - Check user permissions for features
    - Display user information
    
    Returns:
        User profile with role and permissions
    """
    try:
        permissions = get_user_permissions(current_user)
        
        # Convert permissions to list for easier frontend handling
        permission_list = []
        if permissions.can_access_ai_matchmaking:
            permission_list.append("ai:matchmaking")
        if permissions.can_access_ai_pitch:
            permission_list.append("ai:pitch")
        if permissions.can_access_ai_score:
            permission_list.append("ai:score")
        if permissions.can_manage_projects:
            permission_list.append("projects:manage")
        if permissions.can_view_analytics:
            permission_list.append("analytics:view")
        if permissions.can_approve_users:
            permission_list.append("users:approve")
        
        return UserProfileResponse(
            id=current_user.get("id", ""),
            email=current_user.get("email", ""),
            name=current_user.get("name", ""),
            role=current_user.get("role", ""),
            is_approved=current_user.get("is_approved", False),
            profile=current_user.get("profile"),
            permissions=permission_list,
            created_at=current_user.get("created_at"),
            updated_at=current_user.get("updated_at")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user profile: {str(e)}"
        )


@router.get(
    "/me/permissions",
    response_model=UserPermissions,
    summary="Get current user permissions"
)
async def get_me_permissions(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserPermissions:
    """
    Get detailed permissions for the current user.
    
    Returns:
        UserPermissions object with boolean flags for each permission
    """
    return get_user_permissions(current_user)


@router.put(
    "/me/profile",
    response_model=UserProfileResponse,
    summary="Update current user profile"
)
async def update_me_profile(
    profile_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserProfileResponse:
    """
    Update the current user's profile information.
    
    Args:
        profile_data: Profile data to update
        
    Returns:
        Updated user profile
    """
    # TODO: Implement profile update logic with database
    # For now, return current user data
    return await get_me(current_user)
