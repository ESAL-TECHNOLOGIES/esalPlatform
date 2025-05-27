"""
User management endpoints with role-based access control.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session

from core.auth_enhanced import (
    get_current_user, require_permission, require_role,
    get_current_admin
)
from core.database import get_session
from models.user import User, UserRoleEnum, UserStatusEnum, Permissions

router = APIRouter()


class UserApprovalRequest(BaseModel):
    """User approval request model."""
    user_id: str
    status: UserStatusEnum
    reason: Optional[str] = None


class UserSuspensionRequest(BaseModel):
    """User suspension request model."""
    reason: str = Field(..., description="Reason for suspension")


class UserListResponse(BaseModel):
    """User list response model."""
    users: List[Dict[str, Any]]
    total: int
    page: int
    per_page: int


class UserStatsResponse(BaseModel):
    """User statistics response model."""
    total_users: int
    by_role: Dict[str, int]
    by_status: Dict[str, int]
    pending_approvals: int
    active_users: int


@router.get(
    "/",
    response_model=UserListResponse,
    summary="List users with filtering",
    dependencies=[Depends(require_permission(Permissions.USER_VIEW_ALL))]
)
async def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    role: Optional[UserRoleEnum] = Query(default=None),
    status: Optional[UserStatusEnum] = Query(default=None),
    search: Optional[str] = Query(default=None)
) -> UserListResponse:
    """
    List users with optional filtering and pagination.
    
    **Required Permission:** `user:view_all`
    
    **Available to:** Hubs, Admins
    
    Supports filtering by role, status, and search terms.
    """
    try:
        # TODO: Implement actual database query
        # This is a placeholder implementation
        
        # Mock user data
        mock_users = [
            {
                "id": "user_1",
                "email": "innovator@example.com",
                "name": "John Innovator",
                "role": "innovator",
                "status": "approved",
                "is_approved": True,
                "created_at": "2024-01-15T10:00:00Z",
                "last_login": "2024-01-20T15:30:00Z"
            },
            {
                "id": "user_2",
                "email": "investor@example.com",
                "name": "Jane Investor",
                "role": "investor",
                "status": "pending",
                "is_approved": False,
                "created_at": "2024-01-18T14:00:00Z",
                "last_login": None
            },
            {
                "id": "user_3",
                "email": "hub@example.com",
                "name": "Hub Manager",
                "role": "hub",
                "status": "approved",
                "is_approved": True,
                "created_at": "2024-01-10T09:00:00Z",
                "last_login": "2024-01-21T11:00:00Z"
            }
        ]
        
        # Apply filters
        filtered_users = mock_users
        if role:
            filtered_users = [u for u in filtered_users if u["role"] == role]
        if status:
            filtered_users = [u for u in filtered_users if u["status"] == status]
        if search:
            search_lower = search.lower()
            filtered_users = [
                u for u in filtered_users 
                if search_lower in u["name"].lower() or search_lower in u["email"].lower()
            ]
        
        # Pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_users = filtered_users[start_idx:end_idx]
        
        return UserListResponse(
            users=paginated_users,
            total=len(filtered_users),
            page=page,
            per_page=per_page
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list users: {str(e)}"
        )


@router.get(
    "/pending",
    response_model=List[Dict[str, Any]],
    summary="Get users pending approval",
    dependencies=[Depends(require_permission(Permissions.USER_APPROVE))]
)
async def get_pending_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
) -> List[Dict[str, Any]]:
    """
    Get all users pending approval.
    
    **Required Permission:** `user:approve`
    
    **Available to:** Hubs, Admins
    
    Returns list of users with investor or hub roles that require approval.
    """
    try:
        # TODO: Implement actual database query
        # return db.query(User).filter(
        #     User.status == UserStatusEnum.PENDING,
        #     User.role.in_([UserRoleEnum.INVESTOR, UserRoleEnum.HUB])
        # ).all()
        
        # Mock pending users
        return [
            {
                "id": "pending_1",
                "email": "pending.investor@example.com",
                "name": "Pending Investor",
                "role": "investor",
                "status": "pending",
                "created_at": "2024-01-22T10:00:00Z",
                "profile": {
                    "bio": "Experienced investor in tech startups",
                    "linkedin_url": "https://linkedin.com/in/pending-investor"
                }
            },
            {
                "id": "pending_2",
                "email": "pending.hub@example.com",
                "name": "Innovation Hub",
                "role": "hub",
                "status": "pending",
                "created_at": "2024-01-23T14:00:00Z",
                "profile": {
                    "bio": "Regional innovation hub supporting startups",
                    "website_url": "https://innovationhub.example.com"
                }
            }
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending users: {str(e)}"
        )


@router.post(
    "/{user_id}/approve",
    summary="Approve or reject user",
    dependencies=[Depends(require_permission(Permissions.USER_APPROVE))]
)
async def approve_user(
    user_id: str,
    request: UserApprovalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Approve or reject a user's access request.
    
    **Required Permission:** `user:approve`
    
    **Available to:** Hubs, Admins
    
    Updates user status and sends notification email.
    """
    try:
        if request.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID mismatch"
            )
        
        # TODO: Implement actual database update
        # user = db.query(User).filter(User.id == user_id).first()
        # if not user:
        #     raise HTTPException(status_code=404, detail="User not found")
        
        # user.status = request.status
        # user.is_approved = request.status == UserStatusEnum.APPROVED
        # user.updated_at = datetime.utcnow()
        # db.commit()
        
        # TODO: Send notification email to user
        
        return {
            "message": f"User {user_id} has been {request.status}",
            "user_id": user_id,
            "status": request.status,
            "approved_by": current_user.id,
            "reason": request.reason
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user status: {str(e)}"
        )


@router.post(
    "/{user_id}/suspend",
    summary="Suspend user account",
    dependencies=[Depends(require_permission(Permissions.USER_SUSPEND))]
)
async def suspend_user(
    user_id: str,
    suspension_data: UserSuspensionRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Suspend a user account.
    
    **Required Permission:** `user:suspend`
    
    **Available to:** Admins only
    
    Deactivates user account and invalidates all sessions.
    """
    try:
        # TODO: Implement actual database update
        # user = db.query(User).filter(User.id == user_id).first()
        # if not user:
        #     raise HTTPException(status_code=404, detail="User not found")
        
        # user.status = UserStatusEnum.SUSPENDED
        # user.is_active = False
        # user.updated_at = datetime.utcnow()
        # db.commit()
        
        # TODO: Invalidate all user sessions/tokens
        # TODO: Send notification email to user
          return {
            "message": f"User {user_id} has been suspended",
            "user_id": user_id,
            "suspended_by": current_user.id,
            "reason": suspension_data.reason,
            "suspended_at": "2024-01-24T10:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to suspend user: {str(e)}"
        )


@router.get(
    "/stats",
    response_model=UserStatsResponse,
    summary="Get user statistics",
    dependencies=[Depends(require_permission(Permissions.ANALYTICS_VIEW))]
)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
) -> UserStatsResponse:
    """
    Get user statistics and metrics.
    
    **Required Permission:** `analytics:view`
    
    **Available to:** Hubs, Admins
    
    Provides overview of user base composition and status.
    """
    try:
        # TODO: Implement actual database queries
        # role_counts = db.query(User.role, func.count(User.id)).group_by(User.role).all()
        # status_counts = db.query(User.status, func.count(User.id)).group_by(User.status).all()
        
        # Mock statistics
        return UserStatsResponse(
            total_users=156,
            by_role={
                "innovator": 89,
                "investor": 45,
                "hub": 18,
                "admin": 4
            },
            by_status={
                "approved": 142,
                "pending": 12,
                "suspended": 2,
                "rejected": 0
            },
            pending_approvals=12,
            active_users=142
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user statistics: {str(e)}"
        )


@router.get(
    "/{user_id}",
    response_model=Dict[str, Any],
    summary="Get user details",
    dependencies=[Depends(require_permission(Permissions.USER_VIEW_ALL))]
)
async def get_user_details(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get detailed information about a specific user.
    
    **Required Permission:** `user:view_all`
    
    **Available to:** Hubs, Admins
    
    Returns comprehensive user profile and activity information.
    """
    try:
        # TODO: Implement actual database query
        # user = db.query(User).filter(User.id == user_id).first()
        # if not user:
        #     raise HTTPException(status_code=404, detail="User not found")
        
        # Mock user details
        return {
            "id": user_id,
            "email": "user@example.com",
            "name": "Example User",
            "role": "innovator",
            "status": "approved",
            "is_approved": True,
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-20T15:30:00Z",
            "last_login": "2024-01-24T09:00:00Z",
            "profile": {
                "bio": "Passionate innovator working on sustainable technology",
                "skills": ["AI/ML", "Sustainability", "Product Development"],
                "interests": ["Climate Tech", "EdTech", "HealthTech"],
                "location": {
                    "city": "San Francisco",
                    "country": "USA"
                },
                "linkedin_url": "https://linkedin.com/in/example-user",
                "website_url": "https://example-user.com"
            },
            "activity": {
                "projects_created": 3,
                "matches_made": 8,
                "ai_requests_total": 24,
                "last_activity": "2024-01-24T09:00:00Z"
            },
            "permissions": Permissions.get_default_permissions(UserRoleEnum.INNOVATOR)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user details: {str(e)}"
        )
