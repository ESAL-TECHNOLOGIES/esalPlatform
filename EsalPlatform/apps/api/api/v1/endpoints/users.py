"""
User-related endpoints for the ESAL Platform API.
"""
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, EmailStr

from core.database import get_session
from core.auth import get_current_user

router = APIRouter()


# ---- Model Definitions ----

class UserCreate(BaseModel):
    """User creation model."""
    email: EmailStr
    name: str = Field(..., min_length=2)
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """User update model."""
    name: Optional[str] = Field(None, min_length=2)
    email: Optional[EmailStr] = None
    profile: Optional[Dict[str, Any]] = None


class UserResponse(BaseModel):
    """User response model."""
    id: str
    email: EmailStr
    name: str
    profile: Optional[Dict[str, Any]] = None
    created_at: str
    updated_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """User profile update model."""
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    availability: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    bio: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


# ---- Endpoints ----

@router.get("/me", response_model=UserResponse, summary="Get current user")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get information about the currently authenticated user.
    
    This endpoint returns the profile and account information for the
    currently authenticated user.
    """
    # In a real implementation, this would fetch the user from the database
    # This is a placeholder implementation using the auth dependency
    return current_user


@router.patch("/me", response_model=UserResponse, summary="Update current user")
async def update_current_user(
    update_data: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Update the current user's information.
    
    This endpoint allows the authenticated user to update their profile information.
    """
    # In a real implementation, this would update the user in the database
    # This is a placeholder implementation
    updated_user = {**current_user}
    if update_data.name:
        updated_user["name"] = update_data.name
    if update_data.email:
        updated_user["email"] = update_data.email
    if update_data.profile:
        if "profile" not in updated_user:
            updated_user["profile"] = {}
        updated_user["profile"].update(update_data.profile)
    
    # Simulating an update timestamp
    from datetime import datetime
    updated_user["updated_at"] = datetime.utcnow().isoformat()
    
    return updated_user


@router.patch("/me/profile", response_model=UserResponse, summary="Update user profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Update the current user's profile information.
    
    This endpoint allows the authenticated user to update specific profile fields
    like skills, interests, availability, etc.
    """
    # In a real implementation, this would update the user's profile in the database
    # This is a placeholder implementation
    if "profile" not in current_user:
        current_user["profile"] = {}
    
    if profile_data.skills is not None:
        current_user["profile"]["skills"] = profile_data.skills
    if profile_data.interests is not None:
        current_user["profile"]["interests"] = profile_data.interests
    if profile_data.availability is not None:
        current_user["profile"]["availability"] = profile_data.availability
    if profile_data.location is not None:
        current_user["profile"]["location"] = profile_data.location
    if profile_data.bio is not None:
        current_user["profile"]["bio"] = profile_data.bio
    if profile_data.preferences is not None:
        current_user["profile"]["preferences"] = profile_data.preferences
    
    # Simulating an update timestamp
    from datetime import datetime
    current_user["updated_at"] = datetime.utcnow().isoformat()
    
    return current_user


# This would typically be an admin-only endpoint
@router.get("", response_model=List[UserResponse], summary="List users")
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    List users with pagination.
    
    This endpoint returns a list of users in the system.
    In a production implementation, this would be restricted to admins.
    """
    # In a real implementation, this would fetch users from the database
    # This is a placeholder implementation
    from datetime import datetime
    
    return [
        {
            "id": "user1",
            "email": "user1@example.com",
            "name": "User 1",
            "profile": {
                "skills": ["Python", "FastAPI", "React"],
                "interests": ["Web Development", "AI"],
            },
            "created_at": datetime.utcnow().isoformat(),
        },
        {
            "id": "user2",
            "email": "user2@example.com",
            "name": "User 2",
            "profile": {
                "skills": ["JavaScript", "TypeScript", "NextJS"],
                "interests": ["UI Design", "Frontend Development"],
            },
            "created_at": datetime.utcnow().isoformat(),
        },
    ]
