"""
Admin endpoints for the ESAL Platform Admin Portal.

Provides comprehensive admin functionality including:
- User management
- Organization management
- System metrics and analytics
- Platform monitoring
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.database import get_session
from core.auth import get_current_admin

router = APIRouter()

# Response Models
class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    status: str
    created_at: datetime
    last_login: Optional[datetime] = None
    profile: Optional[Dict[str, Any]] = None

class AdminOrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    member_count: int = 0

class AdminMatchResponse(BaseModel):
    id: str
    user_id_1: str
    user_id_2: str
    score: float
    status: str
    match_reason: Optional[str] = None
    created_at: datetime
    organization_id: Optional[str] = None

class SystemMetricsResponse(BaseModel):
    total_users: int
    active_users: int
    total_organizations: int
    total_matches: int
    matches_this_month: int
    user_growth_rate: float
    platform_utilization: float

class UserGrowthData(BaseModel):
    date: str
    count: int

class MatchesGrowthData(BaseModel):
    date: str
    count: int

# Request Models
class AdminUserCreate(BaseModel):
    email: str
    name: str
    role: str = "innovator"
    status: str = "active"

class AdminUserUpdate(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None

@router.get("/metrics", response_model=SystemMetricsResponse, summary="Get system metrics")
async def get_system_metrics(
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Get comprehensive system metrics for the admin dashboard.
    
    Returns:
        System metrics including user counts, growth rates, and platform utilization
    """
    try:
        # Calculate date ranges
        now = datetime.utcnow()
        
        # These would be actual database queries in production
        # For now, returning mock data since we don't have all models set up
        
        # Mock calculations (replace with actual queries)
        total_users = 156
        active_users = 89
        total_organizations = 23
        total_matches = 342
        matches_this_month = 45
        
        # Calculate growth rate (mock calculation)
        previous_month_users = 134
        user_growth_rate = ((total_users - previous_month_users) / previous_month_users) * 100 if previous_month_users > 0 else 0
        
        # Platform utilization (active users / total users * 100)
        platform_utilization = (active_users / total_users * 100) if total_users > 0 else 0
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_organizations": total_organizations,
            "total_matches": total_matches,
            "matches_this_month": matches_this_month,
            "user_growth_rate": round(user_growth_rate, 2),
            "platform_utilization": round(platform_utilization, 2),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching system metrics: {str(e)}"
        )

@router.get("/analytics/user-growth", response_model=List[UserGrowthData], summary="Get user growth analytics")
async def get_user_growth_analytics(
    days: int = Query(30, ge=7, le=365),
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    Get user growth analytics data for charts.
    
    Args:
        days: Number of days to include in the analytics (7-365)
        
    Returns:
        List of daily user growth data
    """
    try:
        # Generate mock data for the last N days
        # In production, this would query the database
        
        start_date = datetime.utcnow() - timedelta(days=days)
        growth_data = []
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            # Mock growth pattern (replace with actual query)
            count = max(0, int(5 + (i * 0.3) + (i % 7 * 2)))  # Simulate weekday variations
            
            growth_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "count": count
            })
        
        return growth_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user growth analytics: {str(e)}"
        )

@router.get("/analytics/matches-growth", response_model=List[MatchesGrowthData], summary="Get matches growth analytics")
async def get_matches_growth_analytics(
    days: int = Query(30, ge=7, le=365),
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    Get matches growth analytics data for charts.
    
    Args:
        days: Number of days to include in the analytics (7-365)
        
    Returns:
        List of daily matches growth data
    """
    try:
        # Generate mock data for the last N days
        # In production, this would query the database
        
        start_date = datetime.utcnow() - timedelta(days=days)
        growth_data = []
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            # Mock matches pattern (replace with actual query)
            count = max(0, int(2 + (i * 0.1) + (i % 5 * 1)))  # Simulate match patterns
            
            growth_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "count": count
            })
        
        return growth_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching matches growth analytics: {str(e)}"
        )

@router.get("/users", response_model=List[AdminUserResponse], summary="Get all users")
async def get_admin_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    Get all users with admin-level details.
    
    Args:
        skip: Number of users to skip (for pagination)
        limit: Maximum number of users to return
        
    Returns:
        List of users with admin-level information
    """
    try:
        # In production, this would query the actual User model
        # For now, returning mock data
        
        mock_users = [
            {
                "id": "5fcca1a1-1925-4a0e-8e15-86ca5752a403",
                "email": "mosejr@esal.com",
                "name": "mose jr",
                "role": "admin",
                "status": "active",
                "created_at": datetime.utcnow() - timedelta(days=30),
                "last_login": datetime.utcnow() - timedelta(hours=2),
                "profile": {
                    "bio": "Platform Administrator",
                    "skills": ["Platform Management", "System Administration"],
                    "interests": ["Innovation", "Technology"]
                }
            },
            {
                "id": "user2-uuid",
                "email": "innovator@example.com",
                "name": "Jane Innovator",
                "role": "innovator",
                "status": "active",
                "created_at": datetime.utcnow() - timedelta(days=25),
                "last_login": datetime.utcnow() - timedelta(hours=5),
                "profile": {
                    "bio": "Tech startup founder",
                    "skills": ["Product Development", "Leadership"],
                    "interests": ["AI", "SaaS", "FinTech"]
                }
            },
            {
                "id": "user3-uuid",
                "email": "investor@example.com",
                "name": "John Investor",
                "role": "investor",
                "status": "active",
                "created_at": datetime.utcnow() - timedelta(days=20),
                "last_login": datetime.utcnow() - timedelta(days=1),
                "profile": {
                    "bio": "Venture capital partner",
                    "skills": ["Investment Analysis", "Due Diligence"],
                    "interests": ["Deep Tech", "Healthcare", "Climate"]
                }
            },
            {
                "id": "user4-uuid",
                "email": "hub@example.com",
                "name": "Hub Manager",
                "role": "hub",
                "status": "pending",
                "created_at": datetime.utcnow() - timedelta(days=5),
                "last_login": None,
                "profile": {
                    "bio": "Innovation hub coordinator",
                    "skills": ["Community Building", "Event Management"],
                    "interests": ["Ecosystem Development", "Networking"]
                }
            }
        ]
        
        # Apply pagination
        start_idx = skip
        end_idx = skip + limit
        paginated_users = mock_users[start_idx:end_idx]
        
        return paginated_users
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )

@router.get("/organizations", response_model=List[AdminOrganizationResponse], summary="Get all organizations")
async def get_admin_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    Get all organizations with admin-level details.
    
    Args:
        skip: Number of organizations to skip (for pagination)
        limit: Maximum number of organizations to return
        
    Returns:
        List of organizations with admin-level information
    """
    try:
        # Mock data for organizations
        mock_organizations = [
            {
                "id": "org1-uuid",
                "name": "TechVentures Capital",
                "slug": "techventures-capital",
                "description": "Early-stage technology investment firm",
                "website": "https://techventures.com",
                "logo_url": None,
                "created_at": datetime.utcnow() - timedelta(days=60),
                "updated_at": datetime.utcnow() - timedelta(days=10),
                "member_count": 8
            },
            {
                "id": "org2-uuid",
                "name": "Innovation Hub Boston",
                "slug": "innovation-hub-boston",
                "description": "Leading innovation ecosystem in Boston",
                "website": "https://innovationhub-boston.com",
                "logo_url": None,
                "created_at": datetime.utcnow() - timedelta(days=45),
                "updated_at": datetime.utcnow() - timedelta(days=5),
                "member_count": 23
            },
            {
                "id": "org3-uuid",
                "name": "StartupTech Solutions",
                "slug": "startuptech-solutions",
                "description": "AI-powered business automation platform",
                "website": "https://startuptech.com",
                "logo_url": None,
                "created_at": datetime.utcnow() - timedelta(days=30),
                "updated_at": datetime.utcnow() - timedelta(days=2),
                "member_count": 12
            }
        ]
        
        # Apply pagination
        start_idx = skip
        end_idx = skip + limit
        paginated_orgs = mock_organizations[start_idx:end_idx]
        
        return paginated_orgs
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching organizations: {str(e)}"
        )

@router.get("/matches", response_model=List[AdminMatchResponse], summary="Get all matches")
async def get_admin_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    Get all matches with admin-level details.
    
    Args:
        skip: Number of matches to skip (for pagination)
        limit: Maximum number of matches to return
        
    Returns:
        List of matches with admin-level information
    """
    try:
        # Mock data for matches
        mock_matches = [
            {
                "id": "match1-uuid",
                "user_id_1": "user2-uuid",
                "user_id_2": "user3-uuid",
                "score": 0.89,
                "status": "active",
                "match_reason": "High compatibility in FinTech sector",
                "created_at": datetime.utcnow() - timedelta(days=15),
                "organization_id": None
            },
            {
                "id": "match2-uuid",
                "user_id_1": "user2-uuid",
                "user_id_2": "user4-uuid",
                "score": 0.76,
                "status": "pending",
                "match_reason": "Innovation hub collaboration opportunity",
                "created_at": datetime.utcnow() - timedelta(days=10),
                "organization_id": "org2-uuid"
            },
            {
                "id": "match3-uuid",
                "user_id_1": "user3-uuid",
                "user_id_2": "user4-uuid",
                "score": 0.82,
                "status": "active",
                "match_reason": "Investment opportunity in emerging tech",
                "created_at": datetime.utcnow() - timedelta(days=8),
                "organization_id": None
            }
        ]
        
        # Apply pagination
        start_idx = skip
        end_idx = skip + limit
        paginated_matches = mock_matches[start_idx:end_idx]
        
        return paginated_matches
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching matches: {str(e)}"
        )

@router.post("/users", response_model=AdminUserResponse, summary="Create new user")
async def create_admin_user(
    user_data: AdminUserCreate,
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Create a new user (admin only).
    
    Args:
        user_data: User creation data
        
    Returns:
        Created user information
    """
    try:
        # In production, this would create a new User in the database
        # For now, returning mock created user
        
        new_user = {
            "id": f"user-{datetime.utcnow().timestamp()}",
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role,
            "status": user_data.status,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "profile": {}
        }
        
        return new_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.put("/users/{user_id}", response_model=AdminUserResponse, summary="Update user")
async def update_admin_user(
    user_id: str,
    user_data: AdminUserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Update a user (admin only).
    
    Args:
        user_id: User ID to update
        user_data: User update data
        
    Returns:
        Updated user information
    """
    try:
        # In production, this would update the User in the database
        # For now, returning mock updated user
        
        updated_user = {
            "id": user_id,
            "email": user_data.email or "updated@example.com",
            "name": user_data.name or "Updated User",
            "role": user_data.role or "innovator",
            "status": user_data.status or "active",
            "created_at": datetime.utcnow() - timedelta(days=10),
            "last_login": datetime.utcnow() - timedelta(hours=1),
            "profile": user_data.profile or {}
        }
        
        return updated_user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

@router.delete("/users/{user_id}", summary="Delete user")
async def delete_admin_user(
    user_id: str,
    current_user: Dict[str, Any] = Depends(get_current_admin),
    db: Session = Depends(get_session),
) -> Dict[str, str]:
    """
    Delete a user (admin only).
    
    Args:
        user_id: User ID to delete
        
    Returns:
        Success message
    """
    try:
        # In production, this would delete the User from the database
        # For now, just returning success
        
        return {"message": f"User {user_id} deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        )

