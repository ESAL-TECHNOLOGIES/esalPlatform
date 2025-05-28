"""
Admin router - User management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.schemas import UsersListResponse, BlockUserRequest, UserResponse, DashboardStats
from app.services.idea_logic import IdeaService
from app.utils.roles import require_role
from app.models import User

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
async def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Admin dashboard with system stats"""
    idea_service = IdeaService(db)
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True, User.is_blocked == False).count()
    total_ideas = idea_service.get_total_ideas_count()
    
    return DashboardStats(
        total_users=total_users,
        total_ideas=total_ideas,
        active_users=active_users
    )


@router.get("/users", response_model=UsersListResponse)
async def get_all_users(
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get all users, optionally filtered by role"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.offset(skip).limit(limit).all()
    total = query.count()
    
    return UsersListResponse(
        users=users,
        total=total
    )


@router.post("/block-user/{user_id}")
async def block_user(
    user_id: str,
    request: BlockUserRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Block/unblock a user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Toggle block status
    user.is_blocked = not user.is_blocked
    db.commit()
    db.refresh(user)
    
    action = "blocked" if user.is_blocked else "unblocked"
    return {
        "message": f"User {action} successfully",
        "user_id": user_id,
        "is_blocked": user.is_blocked,
        "reason": request.reason
    }


@router.get("/users/by-role/{role}")
async def get_users_by_role(
    role: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get users by specific role"""
    valid_roles = ["innovator", "hub", "investor", "admin"]
    
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {valid_roles}"
        )
    
    users = db.query(User).filter(User.role == role).all()
    
    return {
        "role": role,
        "users": users,
        "count": len(users)
    }
