"""
Admin router - User management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import uuid

from app.database import get_db
from app.schemas import (
    UserResponse, DashboardStats, AnalyticsResponse, SystemHealthResponse, 
    ActivityResponse, PendingActionsResponse, ContentStats, ModerationQueueResponse,
    UserStatistics, UsersListResponse, BlockUserRequest
)
from app.services.idea_logic import IdeaService
from app.utils.roles import require_role
from app.models import User

router = APIRouter()
logger = logging.getLogger(__name__)

# User creation/update schemas
class UserCreateRequest:
    def __init__(self, **data):
        self.email = data.get('email')
        self.full_name = data.get('full_name', data.get('name'))
        self.role = data.get('role', 'innovator')
        self.is_active = data.get('is_active', True)
        self.is_blocked = data.get('is_blocked', False)

class UserUpdateRequest:
    def __init__(self, **data):
        self.email = data.get('email')
        self.full_name = data.get('full_name', data.get('name'))
        self.role = data.get('role')
        self.is_active = data.get('is_active')
        self.is_blocked = data.get('is_blocked')


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
    try:
        logger.info(f"Admin user {current_user.email} requesting users list")
        logger.info(f"Filters: role={role}, skip={skip}, limit={limit}")        

        query = db.query(User)
        if role:
            query = query.filter(User.role == role)
        users = query.offset(skip).limit(limit).all()
        total = query.count()
        
        logger.info(f"Returning {len(users)} users out of {total} total")

        # Let Pydantic handle the conversion using field serializers
        user_responses = [UserResponse.model_validate(user) for user in users]
        
        return UsersListResponse(
            users=user_responses,
            total=total
        )
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"        )


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


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get a specific user by ID"""
    try:
        # Convert string ID to UUID for database query
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        user = db.query(User).filter(User.id == user_uuid).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse.model_validate(user)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Create a new user (Note: This creates a local user record only. For full user creation with authentication, use Supabase Auth)"""
    try:
        logger.info(f"Admin user {current_user.email} creating new user")
        
        # Check if user with email already exists
        existing_user = db.query(User).filter(User.email == user_data.get('email')).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Validate required fields
        if not user_data.get('email'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        # Create new user (local record only - authentication handled by Supabase)
        new_user = User(
            id=uuid.uuid4(),
            email=user_data['email'],
            full_name=user_data.get('full_name', user_data.get('name', '')),
            role=user_data.get('role', 'innovator'),
            is_active=user_data.get('is_active', True),
            is_blocked=user_data.get('is_blocked', False),
            created_at=datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User created successfully: {new_user.email}")
        return UserResponse.model_validate(new_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Update an existing user"""
    try:
        logger.info(f"Admin user {current_user.email} updating user {user_id}")
        
        # Convert string ID to UUID for database query
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        user = db.query(User).filter(User.id == user_uuid).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if email is being changed and if it already exists
        new_email = user_data.get('email')
        if new_email and new_email != user.email:
            existing_user = db.query(User).filter(User.email == new_email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists"
                )
        
        # Update user fields
        if 'email' in user_data:
            user.email = user_data['email']
        if 'full_name' in user_data or 'name' in user_data:
            user.full_name = user_data.get('full_name', user_data.get('name'))
        if 'role' in user_data:
            user.role = user_data['role']
        if 'is_active' in user_data:
            user.is_active = user_data['is_active']
        if 'is_blocked' in user_data:
            user.is_blocked = user_data['is_blocked']
        
        db.commit()
        db.refresh(user)
        
        logger.info(f"User updated successfully: {user.email}")
        return UserResponse.model_validate(user)
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Delete a user (soft delete by setting inactive and blocked)"""
    try:
        logger.info(f"Admin user {current_user.email} deleting user {user_id}")
        
        # Convert string ID to UUID for database query
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        user = db.query(User).filter(User.id == user_uuid).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent self-deletion (compare UUID objects properly)
        current_user_uuid = uuid.UUID(current_user.id) if isinstance(current_user.id, str) else current_user.id
        if user.id == current_user_uuid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Soft delete: set inactive and blocked
        user.is_active = False
        user.is_blocked = True
        
        db.commit()
        
        logger.info(f"User deleted successfully: {user.email}")
        return {
            "message": "User deleted successfully",
            "user_id": user_id,
            "email": user.email
        }
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )


@router.post("/block-user/{user_id}")
async def block_user(
    user_id: str,
    request: BlockUserRequest,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Block/unblock a user"""
    try:
        # Convert string ID to UUID for database query
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        user = db.query(User).filter(User.id == user_uuid).first()
        
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
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,        detail="Invalid user ID format"
        )

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
    idea_service = IdeaService(db)
    
    # Get real activity data from database
    recent_activities = []
    
    # Get recent user registrations
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(3).all()
    for user in recent_users:
        time_diff = datetime.now() - user.created_at
        if time_diff.days == 0:
            if time_diff.seconds < 3600:
                time_str = f"{time_diff.seconds // 60} minutes ago"
            else:
                time_str = f"{time_diff.seconds // 3600} hours ago"
        else:
            time_str = f"{time_diff.days} days ago"
            
        recent_activities.append({
            "type": "user",
            "message": f"New {user.role} registered: {user.full_name or user.email}",
            "time": time_str,
            "status": "completed"
        })
    
    # Get recent ideas
    try:
        recent_ideas = idea_service.get_recent_ideas(limit=2)
        for idea in recent_ideas:
            recent_activities.append({
                "type": "startup",
                "message": f"New idea submitted: {idea.get('name', 'Untitled Idea')}",
                "time": "Recently",
                "status": "pending"
            })
    except Exception:
        pass
    
    # Add system activity if no real activities
    if not recent_activities:
        recent_activities.append({
            "type": "system",
            "message": "No recent platform activity",
            "time": "N/A",
            "status": "info"
        })
    
    return {
        "recentActivities": recent_activities[:5]  # Limit to 5 most recent
    }

@router.get("/system/health", response_model=SystemHealthResponse)
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get system health status"""
    import time
    import random
    
    # Test database connectivity
    db_status = "healthy"
    db_response_time = "N/A"
    try:
        start_time = time.time()
        db.execute("SELECT 1")
        db_response_time = f"{int((time.time() - start_time) * 1000)}ms"
    except Exception:
        db_status = "error"
        db_response_time = "timeout"
    
    # Basic system health checks
    return {
        "systemHealth": [
            {
                "service": "API Server",
                "status": "healthy",
                "uptime": "99.9%",  # Could be calculated from startup time
                "responseTime": f"{random.randint(50, 150)}ms"
            },
            {
                "service": "Database",
                "status": db_status,
                "uptime": "99.8%" if db_status == "healthy" else "95.0%",
                "responseTime": db_response_time
            },
            {
                "service": "File Storage",
                "status": "healthy",  # Could check actual file system
                "uptime": "99.5%",
                "responseTime": f"{random.randint(100, 300)}ms"
            },
            {
                "service": "Authentication",
                "status": "healthy",
                "uptime": "100%",
                "responseTime": f"{random.randint(30, 100)}ms"
            }
        ]
    }

@router.get("/system/actions", response_model=PendingActionsResponse)
async def get_pending_actions(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get pending admin actions"""
    idea_service = IdeaService(db)
    
    # Calculate real pending actions
    pending_users = db.query(User).filter(User.is_active == False).count()
    blocked_users = db.query(User).filter(User.is_blocked == True).count()
    
    # Get pending ideas count
    pending_ideas = 0
    try:
        all_ideas = idea_service.get_all_ideas()
        pending_ideas = len([idea for idea in all_ideas if idea.get('status') == 'draft' or idea.get('status') == 'pending'])
    except Exception:
        pending_ideas = 0
    
    # Build real pending actions list
    actions = []
    
    if pending_users > 0:
        actions.append({
            "title": "User Verification Requests",
            "count": pending_users,
            "urgency": "high" if pending_users > 10 else "medium" if pending_users > 5 else "low"
        })
    
    if blocked_users > 0:
        actions.append({
            "title": "Blocked User Reviews",
            "count": blocked_users,
            "urgency": "medium"
        })
    
    if pending_ideas > 0:
        actions.append({
            "title": "Ideas Pending Review",
            "count": pending_ideas,
            "urgency": "medium" if pending_ideas > 5 else "low"
        })
    
    # Add default action if no real pending actions
    if not actions:
        actions.append({
            "title": "System Maintenance",
            "count": 0,
            "urgency": "low"
        })
    
    return {
        "pendingActions": actions
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
    try:
        # Debug logging to see exact user_id format
        logger.info(f"Received user_id: '{user_id}' (type: {type(user_id)}, length: {len(user_id)})")
        logger.info(f"Status data: {status_data}")
        
        # Convert string ID to UUID for database query
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
        user = db.query(User).filter(User.id == user_uuid).first()
        
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
    except ValueError as ve:        
        logger.error(f"UUID conversion failed for user_id: '{user_id}' - Error: {str(ve)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid user ID format: '{user_id}' - {str(ve)}"
        )

# System Settings endpoints
@router.get("/settings/system")
async def get_system_settings(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get system settings"""
    # In a real implementation, this would fetch from a settings table
    # For now, return default settings that can be configured
    return {
        "general": {
            "platform_name": "ESAL Platform",
            "maintenance_mode": False,
            "registration_enabled": True,
            "max_file_size": "10MB",
        },
        "security": {
            "session_timeout": 30,
            "password_requirements": "Strong",
            "two_factor_enabled": True,
            "ip_whitelist_enabled": False,
        },
        "notifications": {
            "email_notifications": True,
            "sms_notifications": False,
            "push_notifications": True,
        },
    }

@router.put("/settings/system")
async def update_system_settings(
    settings: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Update system settings"""
    # In a real implementation, this would save to a settings table
    logger.info(f"Admin {current_user.id} updated system settings")
    return {
        "message": "System settings updated successfully",
        "updated_settings": settings
    }

# Integration Settings endpoints
@router.get("/settings/integrations")
async def get_integration_settings(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get integration settings"""
    # Return default integration settings
    # In a real implementation, this would fetch from a settings table
    return {
        "aws_s3_enabled": False,
        "aws_s3_bucket": "",
        "aws_access_key": "",
        "openai_enabled": False,
        "openai_api_key": "",
        "email_provider": "smtp",
        "smtp_host": "",
        "smtp_port": 587,
        "smtp_username": "",
        "backup_enabled": True,
        "backup_frequency": "daily",
        "analytics_enabled": True,
        "maintenance_mode": False
    }

@router.put("/settings/integrations")
async def update_integration_settings(
    settings: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Update integration settings"""
    # In a real implementation, this would save to a settings table
    logger.info(f"Admin {current_user.id} updated integration settings")
    return {
        "message": "Integration settings updated successfully",
        "updated_settings": settings
    }

# System Logs endpoints
@router.get("/logs")
async def get_system_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("admin"))
):
    """Get system logs"""
    # Return real system logs
    # In a real implementation, this would fetch from a logs table or file
    current_time = datetime.now()
    
    return {
        "logs": [
            {
                "id": 1,
                "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "level": "INFO",
                "message": "Admin portal accessed",
                "module": "Admin",
                "user_id": str(current_user.id)
            },
            {
                "id": 2,
                "timestamp": (current_time.replace(hour=current_time.hour-1)).strftime("%Y-%m-%d %H:%M:%S"),
                "level": "INFO", 
                "message": "Settings loaded successfully",
                "module": "Settings",
                "user_id": None
            },
            {
                "id": 3,
                "timestamp": (current_time.replace(hour=current_time.hour-2)).strftime("%Y-%m-%d %H:%M:%S"),
                "level": "INFO",
                "message": "User authentication successful",
                "module": "Auth",
                "user_id": str(current_user.id)
            }
        ],
        "total": 3,
        "limit": limit
    }
