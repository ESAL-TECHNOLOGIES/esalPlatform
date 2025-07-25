"""
Innovator router - Supabase + AI integration
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime

from app.config import settings
from app.schemas import (
    IdeaCreate, IdeaUpdate, IdeaResponse, PitchRequest, PitchResponse, UserResponse,
    AIGenerateIdeaRequest, AIFineTuneRequest, AIJudgeIdeaRequest, 
    AIRecommendationRequest, AIInteractionResponse, AIJudgeResponse
)
from app.utils.jwt import get_current_user
from app.utils.roles import require_role

# Import Supabase services
from app.services.supabase_ideas import SupabaseIdeasService
from app.services.supabase_files import SupabaseFileService
from app.services.supabase_profiles import SupabaseProfileService

# Only import database dependencies if local DB is enabled
if settings.USE_LOCAL_DB:
    from app.database import get_db
    from app.services.idea_logic import IdeaService
    from app.services.gemini_ai import GeminiAIService
else:
    # Mock dependencies for Supabase-only mode
    def get_db():
        return None

router = APIRouter()
logger = logging.getLogger(__name__)
security = HTTPBearer()


@router.post("/submit-idea", response_model=IdeaResponse)
async def submit_idea(
    idea_data: IdeaCreate,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Submit a new innovation idea"""
    try:
        logger.info(f"User {current_user.id} submitting idea: {idea_data.title}")
        logger.debug(f"Idea data: {idea_data.model_dump()}")
        
        ideas_service = SupabaseIdeasService()
        idea = await ideas_service.create_idea(current_user.id, idea_data)
        
        logger.info(f"Successfully created idea {idea.get('id')} for user {current_user.id}")
        return idea
    except Exception as e:
        logger.error(f"Error creating idea for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/update-idea/{idea_id}", response_model=IdeaResponse)
async def update_idea(
    idea_id: str,
    idea_data: IdeaUpdate,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Update an existing idea"""
    try:
        ideas_service = SupabaseIdeasService()
        idea = await ideas_service.update_idea(idea_id, current_user.id, idea_data)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Idea not found or not owned by user"
            )
        return idea
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating idea: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/delete-idea/{idea_id}")
async def delete_idea(
    idea_id: str,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Delete an idea"""
    try:
        ideas_service = SupabaseIdeasService()
        success = await ideas_service.delete_idea(idea_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Idea not found or not owned by user"
            )
        return {"message": "Idea deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting idea: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/view-ideas")
async def view_ideas(
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get all ideas for the current user"""
    try:
        ideas_service = SupabaseIdeasService()
        ideas = await ideas_service.get_user_ideas(current_user.id)
        
        # Log the data structure for debugging
        logger.info(f"Successfully fetched {len(ideas)} ideas for user {current_user.id}")
        if ideas:
            logger.debug(f"Sample idea structure: {ideas[0]}")
        
        # Validate each idea against the schema manually to catch validation errors
        validated_ideas = []
        for i, idea in enumerate(ideas):
            try:
                # Ensure all required fields are present with defaults
                validated_idea = {
                    "id": str(idea.get("id", "")),
                    "title": idea.get("title", "Untitled"),
                    "description": idea.get("description", ""),
                    "industry": idea.get("industry", idea.get("category", "Other")),  # Use industry first, fallback to category
                    "stage": idea.get("stage", "idea"),
                    "status": idea.get("status", "draft"),
                    "created_at": idea.get("created_at", ""),
                    "updated_at": idea.get("updated_at", ""),
                    "views_count": idea.get("views_count", 0),
                    "interests_count": idea.get("interests_count", 0),
                    "user_id": str(idea.get("user_id", current_user.id)),
                    "ai_score": idea.get("ai_score"),
                    # Optional fields
                    "target_market": idea.get("target_market", ""),
                    "problem": idea.get("problem", ""),
                    "solution": idea.get("solution", ""),
                    "category": idea.get("category", ""),
                    "tags": idea.get("tags", []),
                    "visibility": idea.get("visibility", "private")
                }
                validated_ideas.append(validated_idea)
            except Exception as validation_error:
                logger.error(f"Validation error for idea {i}: {validation_error}")
                logger.error(f"Problematic idea data: {idea}")
                continue
        
        return validated_ideas
    except Exception as e:
        logger.error(f"Error fetching user ideas: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user ideas"
        )


@router.post("/pitch-ai", response_model=PitchResponse)
async def generate_ai_pitch(
    pitch_request: PitchRequest,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Generate AI pitch using Gemini API"""
    try:
        from app.services.gemini_ai import GeminiAIService
        ai_service = GeminiAIService()
        pitch = await ai_service.generate_pitch(pitch_request)
        return pitch
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="AI service is not available. Please check back later."
        )
    except Exception as e:
        logger.error(f"AI service error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.get("/dashboard")
async def innovator_dashboard(
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get dashboard data including recent ideas and stats"""
    try:
        ideas_service = SupabaseIdeasService()
        profile_service = SupabaseProfileService()
        
        # Get dashboard statistics
        stats = await ideas_service.get_dashboard_stats(current_user.id)
        
        # Get recent ideas (limit to 5 for dashboard)
        recent_ideas = await ideas_service.get_user_ideas(current_user.id, limit=5)
          # Get or create user profile
        profile = await profile_service.get_or_create_profile(current_user.id, {
            "email": current_user.email,
            "username": current_user.email.split("@")[0]
        })
        
        return {
            "user": current_user,
            "profile": profile,
            "recent_ideas": recent_ideas,
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# File Upload Endpoints
@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    idea_id: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Upload a file and optionally associate it with an idea"""
    try:
        file_service = SupabaseFileService()
        
        # Upload file to idea-files bucket
        file_record = await file_service.upload_file(
            user_id=current_user.id,
            file=file,
            bucket_name="idea-files",  # Use the idea-files bucket
            folder="ideas",
            idea_id=idea_id,
            description=description
        )
        
        return {
            "message": "File uploaded successfully",
            "file": file_record
        }    
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/files")
async def get_user_files(
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get all files uploaded by the current user"""
    try:
        file_service = SupabaseFileService()
        files = await file_service.get_user_files(current_user.id)
        # Note: enhance_files_with_urls in the service should be updated to use idea-files bucket
        return {"files": files}
    except Exception as e:
        logger.error(f"Error fetching user files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/files/{file_id}")
async def delete_file(
    file_id: str,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Delete a file"""
    try:
        file_service = SupabaseFileService()
        success = await file_service.delete_file(
            file_id, 
            current_user.id, 
            bucket_name="idea-files"  # Use the idea-files bucket
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found or not owned by user"
            )
        return {"message": "File deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Profile Management Endpoints
@router.get("/profile")
async def get_profile(
    current_user: UserResponse = Depends(require_role("innovator")),
    token = Depends(security)
):
    """Get user profile information"""
    try:
        # Extract token string from HTTPBearer object
        token_str = token.credentials
        profile_service = SupabaseProfileService(user_token=token_str)
        profile = await profile_service.get_or_create_profile(current_user.id, {
            "email": current_user.email,
            "full_name": current_user.full_name or "",
            "username": current_user.email.split("@")[0],
            "role": current_user.role
        })
        
        # Ensure profile has all the fields frontend expects
        complete_profile = {
            "id": profile.get("id", current_user.id),
            "email": current_user.email,
            "username": profile.get("username") or current_user.email.split("@")[0],
            "full_name": profile.get("full_name") or current_user.full_name or "",
            "role": current_user.role,
            "bio": profile.get("bio"),
            "location": profile.get("location"),
            "company": profile.get("company"),
            "position": profile.get("position"),
            "skills": profile.get("skills", []),
            "interests": profile.get("interests", []),
            "website_url": profile.get("website_url"),
            "linkedin_url": profile.get("linkedin_url"),
            "twitter_url": profile.get("twitter_url"),
            "github_url": profile.get("github_url"),
            "phone": profile.get("phone"),
            "avatar_url": profile.get("avatar_url"),
            "experience_years": profile.get("experience_years", 0),
            "education": profile.get("education"),            "total_ideas": 0,  # Will be populated by frontend from dashboard
            "total_views": 0,
            "total_interests": 0,
            "is_active": current_user.is_active,
            "is_blocked": current_user.is_blocked,
            "created_at": profile.get("created_at"),
            "updated_at": profile.get("updated_at")
        }
        
        return {"profile": complete_profile}
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: UserResponse = Depends(require_role("innovator")),
    token = Depends(security)
):
    """Update user profile information"""
    try:
        # Extract token string from HTTPBearer object
        token_str = token.credentials
        profile_service = SupabaseProfileService(user_token=token_str)
        profile = await profile_service.update_profile(current_user.id, profile_data)
        return {"profile": profile}
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(require_role("innovator")),
    token = Depends(security)
):
    """Upload user avatar"""
    try:
        # Extract token string from HTTPBearer object
        token_str = token.credentials
        logger.info(f"Token extracted: {token_str[:20]}...")
        profile_service = SupabaseProfileService(user_token=token_str)
        
        # Read file content
        file_content = await file.read()
        
        # Upload avatar
        avatar_url = await profile_service.upload_avatar(
            user_id=current_user.id,
            file_content=file_content,
            filename=file.filename
        )
        
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        }
    except Exception as e:
        logger.error(f"Error uploading avatar: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Search and Discovery Endpoints
@router.get("/search-ideas")
async def search_ideas(
    q: str,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Search ideas by title and description"""
    try:
        ideas_service = SupabaseIdeasService()
        ideas = await ideas_service.search_ideas(q, current_user.id)
        return {"ideas": ideas}
    except Exception as e:
        logger.error(f"Error searching ideas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/ideas/{idea_id}/view")
async def increment_idea_view(
    idea_id: int,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Increment view count for an idea"""
    try:
        ideas_service = SupabaseIdeasService()
        await ideas_service.increment_view_count(idea_id)
        return {"message": "View count updated"}
    except Exception as e:
        logger.error(f"Error incrementing view count: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Enhanced AI Interaction Endpoints

@router.post("/ai/generate-idea", response_model=AIInteractionResponse)
async def generate_new_idea(
    request: AIGenerateIdeaRequest,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Generate a new startup idea using AI based on user interests and skills"""
    try:
        from app.services.gemini_ai import GeminiAIService
        ai_service = GeminiAIService()
        
        # Generate AI response
        response = await ai_service.generate_new_idea(request)
          # Store AI-generated idea in database if save_to_database is requested
        if getattr(request, 'save_to_database', False) and response.response_text:
            try:
                ideas_service = SupabaseIdeasService()
                ai_metadata = {
                    "generation_prompt": request.interests + " " + request.skills if hasattr(request, 'interests') and hasattr(request, 'skills') else "",
                    "ai_service": "gemini",
                    "confidence_score": getattr(response, 'confidence_score', 0.8),
                    "generation_type": "ai_generated"
                }
                
                saved_idea = await ideas_service.create_ai_generated_idea(
                    user_id=current_user.id,
                    ai_response=response.response_text,
                    ai_metadata=ai_metadata
                )
                
                # Add database ID to response
                response.metadata = response.metadata or {}
                response.metadata["saved_idea_id"] = saved_idea["id"]
                response.metadata["saved_to_database"] = True
                
                logger.info(f"AI-generated idea saved to database with ID: {saved_idea['id']}")
                
            except Exception as db_error:
                logger.error(f"Failed to save AI-generated idea to database: {db_error}")
                # Don't fail the request if database save fails
                response.metadata = response.metadata or {}
                response.metadata["database_save_error"] = str(db_error)
        
        return response
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="AI service is not available. Please check back later."
        )
    except Exception as e:
        logger.error(f"AI idea generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/ai/fine-tune", response_model=AIInteractionResponse)
async def fine_tune_idea(
    request: AIFineTuneRequest,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Fine-tune an existing idea with AI suggestions"""
    try:
        from app.services.gemini_ai import GeminiAIService
        ai_service = GeminiAIService()
        response = await ai_service.fine_tune_idea(request)
        return response
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="AI service is not available. Please check back later."
        )
    except Exception as e:
        logger.error(f"AI fine-tuning error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/ai/judge-idea", response_model=AIJudgeResponse)
async def judge_idea(
    request: AIJudgeIdeaRequest,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get AI judgment and scoring of a startup idea"""
    try:
        from app.services.gemini_ai import GeminiAIService
        ai_service = GeminiAIService()
        
        # Get AI judgment
        response = await ai_service.judge_idea(request)
        
        # Save AI score to database if idea_id is provided and score is available
        if hasattr(request, 'idea_id') and request.idea_id and response.overall_score is not None:
            try:
                ideas_service = SupabaseIdeasService()
                  # Prepare AI judgment metadata
                ai_judgment_data = {
                    "feedback": getattr(response, 'feedback', response.response_text if hasattr(response, 'response_text') else ""),
                    "strengths": response.strengths,
                    "weaknesses": response.weaknesses,
                    "suggestions": response.improvement_suggestions,
                    "market_potential": getattr(response, 'market_viability', None),
                    "technical_feasibility": getattr(response, 'technical_feasibility', None),
                    "innovation_level": getattr(response, 'innovation_level', None),
                    "ai_service": "gemini",
                    "judgment_version": "1.0"
                }
                
                # Update idea with AI score
                success = await ideas_service.update_ai_score(
                    idea_id=request.idea_id,
                    user_id=current_user.id,
                    ai_score=response.overall_score,
                    ai_judgment_data=ai_judgment_data
                )
                
                if success:
                    response.metadata = response.metadata or {}
                    response.metadata["saved_to_database"] = True
                    response.metadata["idea_id"] = request.idea_id
                    logger.info(f"AI score {response.overall_score} saved for idea {request.idea_id}")
                else:
                    logger.warning(f"Failed to save AI score for idea {request.idea_id}")
                    
            except Exception as db_error:
                logger.error(f"Failed to save AI score to database: {db_error}")
                # Don't fail the request if database save fails
                response.metadata = response.metadata or {}
                response.metadata["database_save_error"] = str(db_error)
        
        return response
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="AI service is not available. Please check back later."
        )
    except Exception as e:
        logger.error(f"AI idea judgment error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/ai/recommendations", response_model=AIInteractionResponse)
async def get_ai_recommendations(
    request: AIRecommendationRequest,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get personalized AI recommendations based on user's ideas"""
    try:
        from app.services.gemini_ai import GeminiAIService
        ai_service = GeminiAIService()
        
        # Set user_id from current user
        request.user_id = current_user.id
        
        response = await ai_service.get_recommendations(request)
        return response
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="AI service is not available. Please check back later."
        )
    except Exception as e:
        logger.error(f"AI recommendations error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )


@router.get("/ai/analytics")
async def get_ai_analytics(
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get AI-related analytics for the current user"""
    try:
        ideas_service = SupabaseIdeasService()
        analytics = await ideas_service.get_ai_analytics(current_user.id)
        
        return {
            "success": True,
            "data": analytics,
            "message": "AI analytics retrieved successfully"
        }
    except Exception as e:
        logger.error(f"AI analytics error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI analytics: {str(e)}"
        )
