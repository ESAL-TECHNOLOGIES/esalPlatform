"""
AI-related endpoints for the ESAL Platform API.
"""
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from services.ai.matchmaking import MatchmakingEngine, MatchResult, MatchCriteria
from api.dependencies import get_ai_service
from core.auth import get_current_user

router = APIRouter()


# ---- Permission Decorators ----

def require_permission(permission: str):
    """Decorator to require specific permissions for AI endpoints."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Get current user from kwargs
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check permission based on role and approval status
            role = current_user.get("role", "")
            is_approved = current_user.get("is_approved", False)
            
            # Permission checks
            if permission == "ai:matchmaking":
                if role == "innovator" and not is_approved:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Approval required for matchmaking access"
                    )
                elif role in ["investor", "hub"] and not is_approved:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Approval required for AI services"
                    )
            elif permission == "ai:pitch":
                if role in ["investor", "hub"] and not is_approved:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Approval required for AI services"
                    )
            elif permission == "ai:score":
                if role in ["investor", "hub"] and not is_approved:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Approval required for AI services"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# ---- Model Definitions ----

class UserProfile(BaseModel):
    """User profile data model."""
    id: str
    name: str = Field(..., min_length=1)
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    availability: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class MatchRequest(BaseModel):
    """Match request model."""
    users: List[UserProfile]
    criteria: Optional[MatchCriteria] = None


class RecommendationRequest(BaseModel):
    """Recommendation request model."""
    user: UserProfile
    matches: List[MatchResult]
    format: Optional[str] = Field(default="text")


class RecommendationResponse(BaseModel):
    """Recommendation response model."""
    recommendation: str
    matches: List[MatchResult]


# ---- Endpoints ----

@router.post("/matchmake", response_model=List[MatchResult], summary="Find user matches")
async def find_matches(
    request: MatchRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    matchmaking_service: MatchmakingEngine = Depends(get_ai_service),
) -> List[MatchResult]:
    """
    Find matches for users based on their profiles and criteria.
    
    Requires authentication and appropriate role permissions.
    Innovators need approval for matchmaking access.
    
    Args:
        request: Match request with user profiles and criteria
        current_user: Current authenticated user
        matchmaking_service: AI matchmaking service
        
    Returns:
        List of match results
    """
    # Check permissions
    role = current_user.get("role", "")
    is_approved = current_user.get("is_approved", False)
    
    if role == "innovator" and not is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Approval required for matchmaking access"
        )
    elif role in ["investor", "hub"] and not is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Approval required for AI services"
        )
    
    try:
        # Use the matchmaking service to find matches
        matches = await matchmaking_service.find_matches(
            users=request.users,
            criteria=request.criteria
        )
        
        return matches
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error finding matches: {str(e)}"
        )


@router.post("/pitch", summary="Analyze pitch content")
async def analyze_pitch(
    pitch_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Analyze pitch content using AI services.
    
    Available to all authenticated users, with approval required for investors/hubs.
    
    Args:
        pitch_data: Pitch content and metadata
        current_user: Current authenticated user
        
    Returns:
        Pitch analysis results
    """
    # Check permissions
    role = current_user.get("role", "")
    is_approved = current_user.get("is_approved", False)
    
    if role in ["investor", "hub"] and not is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Approval required for AI services"
        )
    
    try:
        # TODO: Implement pitch analysis service
        # For now, return mock response
        return {
            "analysis": "Pitch analysis completed",
            "score": 0.85,
            "recommendations": [
                "Strengthen market analysis section",
                "Add more financial projections",
                "Clarify competitive advantages"
            ],
            "user_id": current_user.get("id"),
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing pitch: {str(e)}"
        )


@router.post("/score", summary="Score innovation projects")
async def score_project(
    project_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Score innovation projects using AI analysis.
    
    Available to all authenticated users, with approval required for investors/hubs.
    
    Args:
        project_data: Project information and metadata
        current_user: Current authenticated user
        
    Returns:
        Project scoring results
    """
    # Check permissions
    role = current_user.get("role", "")
    is_approved = current_user.get("is_approved", False)
    
    if role in ["investor", "hub"] and not is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Approval required for AI services"
        )
    
    try:
        # TODO: Implement project scoring service
        # For now, return mock response
        return {
            "overall_score": 8.2,
            "category_scores": {
                "innovation": 8.5,
                "market_potential": 7.8,
                "team_strength": 8.0,
                "financial_viability": 8.5
            },
            "risk_assessment": "Medium",
            "recommendations": [
                "Consider expanding target market",
                "Strengthen intellectual property portfolio"
            ],
            "user_id": current_user.get("id"),
            "timestamp": "2024-01-01T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scoring project: {str(e)}"
        )
) -> List[MatchResult]:
    """
    Find optimal matches between users based on provided criteria.
    
    This endpoint uses AI to analyze user profiles and find optimal matches
    based on skills, interests, availability, and other factors.
    """
    # Convert UserProfile objects to dictionaries for the matchmaking engine
    user_data = [user.model_dump() for user in request.users]
    
    # Find matches
    matches = await matchmaking_service.find_matches(
        user_data, 
        criteria=request.criteria
    )
    
    return matches


@router.post("/recommend", response_model=RecommendationResponse, summary="Get AI recommendation")
async def get_recommendation(
    request: RecommendationRequest,
    matchmaking_service: MatchmakingEngine = Depends(get_ai_service),
) -> RecommendationResponse:
    """
    Get an AI-generated recommendation for a user based on their matches.
    
    This endpoint uses AI to generate personalized recommendations and insights
    based on the user's profile and their matches.
    """
    # Convert UserProfile to dictionary
    user_data = request.user.model_dump()
    
    # Generate recommendation
    recommendation = await matchmaking_service.get_ai_recommendation(
        user_data,
        request.matches
    )
    
    return RecommendationResponse(
        recommendation=recommendation,
        matches=request.matches
    )
