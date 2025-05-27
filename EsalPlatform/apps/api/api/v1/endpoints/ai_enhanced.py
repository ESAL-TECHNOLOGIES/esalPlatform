"""
Enhanced AI endpoints with role-based access control.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.auth_enhanced import (
    get_current_user, require_permission, require_portal_access,
    get_approved_user
)
from core.database import get_session
from models.user import User, Permissions
from services.ai.matchmaking import MatchmakingEngine, MatchCriteria, MatchResult
from services.ai.client import GeminiClient, OpenAIClient

router = APIRouter()


# Request/Response Models
class UserProfile(BaseModel):
    """User profile data model for AI services."""
    id: str
    name: str = Field(..., min_length=1)
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    availability: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class MatchRequest(BaseModel):
    """Match request model."""
    users: List[UserProfile] = Field(..., min_items=2)
    criteria: Optional[MatchCriteria] = None
    organization_id: Optional[str] = None


class PitchScoringRequest(BaseModel):
    """Pitch scoring request model."""
    pitch_content: str = Field(..., min_length=10)
    criteria: Optional[Dict[str, Any]] = None
    pitch_type: str = Field(default="general")


class PitchScore(BaseModel):
    """Pitch scoring response model."""
    overall_score: float = Field(ge=0, le=100)
    category_scores: Dict[str, float] = Field(default_factory=dict)
    feedback: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)


class EvaluationRequest(BaseModel):
    """General evaluation request model."""
    content: str = Field(..., min_length=10)
    evaluation_type: str = Field(..., description="Type of evaluation: project, business_plan, etc.")
    criteria: Optional[Dict[str, Any]] = None


class EvaluationResult(BaseModel):
    """Evaluation result model."""
    score: float = Field(ge=0, le=100)
    evaluation_type: str
    summary: str
    detailed_feedback: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)


class RecommendationRequest(BaseModel):
    """AI recommendation request."""
    user: UserProfile
    matches: List[MatchResult]
    format: Optional[str] = Field(default="text")


class RecommendationResponse(BaseModel):
    """AI recommendation response."""
    recommendation: str
    matches: List[MatchResult]
    confidence: float = Field(ge=0, le=1)


# Dependency for AI services
async def get_matchmaking_engine() -> MatchmakingEngine:
    """Get configured matchmaking engine."""
    try:
        client = GeminiClient()
    except ValueError:
        try:
            client = OpenAIClient()
        except ValueError:
            client = None
    
    return MatchmakingEngine(client)


@router.post(
    "/matchmake",
    response_model=List[MatchResult],
    summary="AI-powered user matchmaking",
    dependencies=[Depends(require_permission(Permissions.AI_MATCHMAKING))]
)
async def ai_matchmaking(
    request: MatchRequest,
    current_user: User = Depends(get_approved_user),
    engine: MatchmakingEngine = Depends(get_matchmaking_engine),
    db: Session = Depends(get_session)
) -> List[MatchResult]:
    """
    Find optimal matches between users using AI analysis.
    
    **Required Permission:** `ai:matchmaking`
    
    **Available to:** Approved Innovators, Investors, Hubs
    
    This endpoint uses sophisticated AI algorithms to analyze user profiles
    and find the best possible matches based on skills, interests, availability,
    and other criteria.
    """
    try:
        # Convert UserProfile models to dictionaries for the engine
        user_dicts = []
        for user_profile in request.users:
            user_dict = {
                "id": user_profile.id,
                "name": user_profile.name,
                "skills": user_profile.skills,
                "interests": user_profile.interests,
                "availability": user_profile.availability or {},
                "location": user_profile.location or {},
                "metadata": user_profile.metadata or {}
            }
            user_dicts.append(user_dict)
        
        # Perform matchmaking
        matches = await engine.find_matches(user_dicts, request.criteria)
        
        # TODO: Store matches in database for tracking
        # for match in matches:
        #     db_match = Match(
        #         user_id_1=match.user_id1,
        #         user_id_2=match.user_id2,
        #         score=match.score,
        #         match_reasons=match.match_reasons,
        #         compatibility_areas=match.compatibility_areas,
        #         organization_id=request.organization_id
        #     )
        #     db.add(db_match)
        # db.commit()
        
        return matches
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Matchmaking failed: {str(e)}"
        )


@router.post(
    "/pitch",
    response_model=PitchScore,
    summary="AI pitch scoring and feedback",
    dependencies=[Depends(require_permission(Permissions.AI_PITCH_SCORING))]
)
async def ai_pitch_scoring(
    request: PitchScoringRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
) -> PitchScore:
    """
    Score and provide feedback on pitch content using AI.
    
    **Required Permission:** `ai:pitch_scoring`
    
    **Available to:** Innovators, Hubs
    
    Analyzes pitch content and provides detailed scoring across multiple
    categories with actionable feedback for improvement.
    """
    try:
        # TODO: Implement actual AI pitch scoring
        # This is a placeholder implementation
        
        # Mock scoring based on content length and keywords
        content_length = len(request.pitch_content)
        base_score = min(85, max(40, content_length / 10))
        
        # Mock category scores
        category_scores = {
            "clarity": base_score + 5,
            "innovation": base_score - 5,
            "market_potential": base_score + 2,
            "team": base_score - 3,
            "financials": base_score + 1
        }
        
        # Ensure scores are within bounds
        for category in category_scores:
            category_scores[category] = max(0, min(100, category_scores[category]))
        
        overall_score = sum(category_scores.values()) / len(category_scores)
        
        return PitchScore(
            overall_score=overall_score,
            category_scores=category_scores,
            feedback=[
                "Strong value proposition clearly articulated",
                "Market analysis could be more detailed",
                "Consider adding more financial projections"
            ],
            strengths=[
                "Clear problem identification",
                "Innovative solution approach"
            ],
            improvements=[
                "Expand on competitive analysis",
                "Include more detailed go-to-market strategy"
            ],
            confidence=0.85
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pitch scoring failed: {str(e)}"
        )


@router.post(
    "/score",
    response_model=EvaluationResult,
    summary="AI-powered general evaluation",
    dependencies=[Depends(require_permission(Permissions.AI_EVALUATION))]
)
async def ai_evaluation(
    request: EvaluationRequest,
    current_user: User = Depends(get_approved_user),
    db: Session = Depends(get_session)
) -> EvaluationResult:
    """
    Perform AI-powered evaluation of various content types.
    
    **Required Permission:** `ai:evaluation`
    
    **Available to:** Investors, Hubs
    
    Provides comprehensive evaluation and scoring for business plans,
    project proposals, and other innovation-related content.
    """
    try:
        # TODO: Implement actual AI evaluation
        # This is a placeholder implementation
        
        content_length = len(request.content)
        base_score = min(90, max(50, content_length / 15))
        
        # Mock evaluation based on type
        if request.evaluation_type == "business_plan":
            recommendations = [
                "Strengthen financial projections",
                "Expand market research section",
                "Add risk mitigation strategies"
            ]
            risk_factors = [
                "Market competition intensity",
                "Technology adoption rate uncertainty"
            ]
        elif request.evaluation_type == "project":
            recommendations = [
                "Define clearer success metrics",
                "Establish detailed timeline",
                "Identify key stakeholders"
            ]
            risk_factors = [
                "Resource availability",
                "Technical complexity"
            ]
        else:
            recommendations = ["Consider more detailed analysis"]
            risk_factors = ["Insufficient information provided"]
        
        return EvaluationResult(
            score=base_score,
            evaluation_type=request.evaluation_type,
            summary=f"Overall assessment shows {base_score:.1f}% viability with several areas for improvement.",
            detailed_feedback={
                "strengths": ["Clear vision", "Market opportunity"],
                "weaknesses": ["Limited financial detail", "Competitive analysis"],
                "opportunities": ["Partnership potential", "Scalability"],
                "threats": ["Market saturation", "Regulatory changes"]
            },
            recommendations=recommendations,
            risk_factors=risk_factors
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )


@router.post(
    "/recommend",
    response_model=RecommendationResponse,
    summary="AI-generated recommendations",
    dependencies=[Depends(require_permission(Permissions.AI_MATCHMAKING))]
)
async def ai_recommendations(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    engine: MatchmakingEngine = Depends(get_matchmaking_engine)
) -> RecommendationResponse:
    """
    Generate AI-powered recommendations based on user profile and matches.
    
    **Required Permission:** `ai:matchmaking`
    
    **Available to:** All approved users
    
    Provides personalized recommendations and insights based on
    user profile analysis and match results.
    """
    try:
        # Convert UserProfile to dict for the engine
        user_dict = {
            "id": request.user.id,
            "name": request.user.name,
            "skills": request.user.skills,
            "interests": request.user.interests,
            "availability": request.user.availability or {},
            "location": request.user.location or {}
        }
        
        # Generate AI recommendation
        recommendation_text = await engine.get_ai_recommendation(user_dict, request.matches)
        
        return RecommendationResponse(
            recommendation=recommendation_text,
            matches=request.matches,
            confidence=0.82
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation generation failed: {str(e)}"
        )


@router.get(
    "/usage",
    summary="Get AI service usage statistics",
    dependencies=[Depends(require_permission(Permissions.ANALYTICS_VIEW))]
)
async def get_ai_usage(
    current_user: User = Depends(get_current_user),
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    Get AI service usage statistics for the current user or organization.
    
    **Required Permission:** `analytics:view`
    
    **Available to:** Investors, Hubs, Admins
    """
    try:
        # TODO: Implement actual usage tracking from database
        # This is a placeholder implementation
        
        return {
            "user_id": current_user.id,
            "period_days": days,
            "usage": {
                "matchmaking_requests": 15,
                "pitch_scoring_requests": 8,
                "evaluation_requests": 12,
                "recommendation_requests": 6
            },
            "limits": {
                "matchmaking_daily": 50,
                "pitch_scoring_daily": 25,
                "evaluation_daily": 30,
                "recommendation_daily": 20
            },
            "remaining": {
                "matchmaking_today": 35,
                "pitch_scoring_today": 17,
                "evaluation_today": 18,
                "recommendation_today": 14
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve usage statistics: {str(e)}"
        )
