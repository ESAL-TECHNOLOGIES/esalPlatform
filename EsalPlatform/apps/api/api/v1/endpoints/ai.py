"""
AI-related endpoints for the ESAL Platform API.
"""
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, Field

from services.ai.matchmaking import MatchmakingEngine, MatchResult, MatchCriteria
from api.dependencies import get_ai_service

router = APIRouter()


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

@router.post("/match", response_model=List[MatchResult], summary="Find user matches")
async def find_matches(
    request: MatchRequest,
    matchmaking_service: MatchmakingEngine = Depends(get_ai_service),
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
