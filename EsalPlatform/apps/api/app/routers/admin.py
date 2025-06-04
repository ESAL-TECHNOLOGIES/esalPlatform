"""
Admin router - User management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List

from app.database import get_db
from app.schemas import (
    UsersListResponse, BlockUserRequest, UserResponse, DashboardStats,
    AnalyticsResponse, SystemHealthResponse, ActivityResponse, 
    PendingActionsResponse, ContentStats, ModerationQueueResponse,
    UserStatistics
)
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

# Analytics endpoints
@router.get("/analytics", response_model=AnalyticsResponse)
async def get_platform_analytics(
    time_range: str = "30d",
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get platform analytics data"""
    idea_service = IdeaService(db)
    
    # Calculate analytics based on time range
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True, User.is_blocked == False).count()
    total_ideas = idea_service.get_total_ideas_count()
    
    # Mock data for now - should be replaced with real analytics
    return {
        "kpiData": [
            {
                "label": "Total Users",
                "value": str(total_users),
                "change": "+12%",
                "trend": "up"
            },
            {
                "label": "Active Users", 
                "value": str(active_users),
                "change": "+15%",
                "trend": "up"
            },
            {
                "label": "Total Ideas",
                "value": str(total_ideas),
                "change": "+8%",
                "trend": "up"
            },
            {
                "label": "Platform Usage",
                "value": "85%",
                "change": "+5%",
                "trend": "up"
            }
        ],
        "userMetrics": [
            {
                "role": "Innovators",
                "count": db.query(User).filter(User.role == "innovator").count(),
                "percentage": 60.0,
                "change": "+12%"
            },
            {
                "role": "Investors", 
                "count": db.query(User).filter(User.role == "investor").count(),
                "percentage": 25.0,
                "change": "+18%"
            },
            {
                "role": "Hubs",
                "count": db.query(User).filter(User.role == "hub").count(),
                "percentage": 10.0,
                "change": "+8%"
            },
            {
                "role": "Admins",
                "count": db.query(User).filter(User.role == "admin").count(),
                "percentage": 5.0,
                "change": "0%"
            }
        ],
        "engagementData": [
            {"metric": "Daily Active Users", "value": "892", "change": "+7%"},
            {"metric": "Weekly Active Users", "value": "1,156", "change": "+12%"},
            {"metric": "Monthly Active Users", "value": str(active_users), "change": "+15%"},
            {"metric": "Average Session Duration", "value": "24m 32s", "change": "+8%"},
            {"metric": "Page Views per Session", "value": "8.4", "change": "+5%"},
            {"metric": "Bounce Rate", "value": "23%", "change": "-3%"}
        ]
    }

@router.get("/activity", response_model=ActivityResponse)
async def get_activity_data(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get recent platform activity"""
    # This should be replaced with real activity tracking
    return {
        "recentActivities": [
            {
                "type": "user",
                "message": "New user registration completed",
                "time": "2 minutes ago",
                "status": "completed"
            },
            {
                "type": "startup", 
                "message": "New idea submitted for review",
                "time": "15 minutes ago",
                "status": "pending"
            },
            {
                "type": "system",
                "message": "System backup completed successfully", 
                "time": "1 hour ago",
                "status": "completed"
            }
        ]
    }

@router.get("/system/health", response_model=SystemHealthResponse)
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get system health status"""
    # Mock system health data - should be replaced with real monitoring
    return {
        "systemHealth": [
            {
                "service": "API Server",
                "status": "healthy",
                "uptime": "99.9%",
                "responseTime": "120ms"
            },
            {
                "service": "Database",
                "status": "healthy", 
                "uptime": "99.8%",
                "responseTime": "45ms"
            },
            {
                "service": "File Storage",
                "status": "healthy",
                "uptime": "99.5%",
                "responseTime": "200ms"
            },
            {
                "service": "Email Service",
                "status": "healthy",
                "uptime": "100%",
                "responseTime": "80ms"
            }
        ]
    }

@router.get("/system/actions", response_model=PendingActionsResponse)
async def get_pending_actions(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get pending admin actions"""
    # Calculate real pending actions
    pending_users = db.query(User).filter(User.is_active == False).count()
    
    return {
        "pendingActions": [
            {
                "title": "User Verification Requests",
                "count": pending_users,
                "urgency": "high" if pending_users > 10 else "medium"
            },
            {
                "title": "Content Moderation",
                "count": 5,
                "urgency": "low"
            },
            {
                "title": "System Updates",
                "count": 2,
                "urgency": "medium"
            }
        ]
    }

# Content Management endpoints
@router.get("/content/moderation", response_model=ModerationQueueResponse)
async def get_moderation_queue(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get content moderation queue"""
    # This should return actual content needing moderation
    return {
        "queue": [],
        "total": 0,
        "pending": 0
    }

@router.put("/content/moderation/{item_id}")
async def update_moderation_status(
    item_id: int,
    action: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Update moderation status of content"""
    # Implement content moderation logic
    return {
        "message": f"Content {item_id} {action.get('action', 'updated')} successfully",
        "item_id": item_id,
        "action": action.get('action')
    }

@router.get("/content/stats", response_model=ContentStats)
async def get_content_stats(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get content statistics"""
    idea_service = IdeaService(db)
    total_ideas = idea_service.get_total_ideas_count()
    
    return {
        "totalIdeas": total_ideas,
        "pendingReviews": 0,  # Should calculate actual pending reviews
        "reportedContent": 0,  # Should calculate actual reported content
        "totalFiles": 0  # Should calculate actual file count
    }

# User management enhancements
@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Update user status (active/inactive/blocked)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user status based on provided data
    if "is_active" in status_data:
        user.is_active = status_data["is_active"]
    if "is_blocked" in status_data:
        user.is_blocked = status_data["is_blocked"]
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User status updated successfully",
        "user_id": user_id,
        "is_active": user.is_active,
        "is_blocked": user.is_blocked
    }

@router.get("/users/stats", response_model=UserStatistics)
async def get_user_statistics(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get detailed user statistics"""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True, User.is_blocked == False).count()
    blocked_users = db.query(User).filter(User.is_blocked == True).count()
    
    role_counts = {}
    for role in ["innovator", "investor", "hub", "admin"]:
        role_counts[role] = db.query(User).filter(User.role == role).count()
    
    return {
        "total": total_users,
        "active": active_users,
        "blocked": blocked_users,
        "pending": total_users - active_users - blocked_users,
        "by_role": role_counts
    }
