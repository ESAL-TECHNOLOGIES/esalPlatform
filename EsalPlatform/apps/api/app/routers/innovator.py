"""
Innovator router - Supabase + AI integration
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

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


@router.post("/submit-idea", response_model=IdeaResponse)
async def submit_idea(
    idea_data: IdeaCreate,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Submit a new innovation idea"""
    try:
        ideas_service = SupabaseIdeasService()
        idea = await ideas_service.create_idea(current_user.id, idea_data)
        return idea
    except Exception as e:
        logger.error(f"Error creating idea: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/update-idea/{idea_id}", response_model=IdeaResponse)
async def update_idea(
    idea_id: int,
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
    idea_id: int,
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


@router.get("/view-ideas", response_model=List[IdeaResponse])
async def view_ideas(
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get all ideas for the current user"""
    try:
        ideas_service = SupabaseIdeasService()
        ideas = await ideas_service.get_user_ideas(current_user.id)
        return ideas
    except Exception as e:
        logger.error(f"Error fetching user ideas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
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
        
        # Read file content
        file_content = await file.read()
        
        # Upload file
        file_record = await file_service.upload_file(
            user_id=current_user.id,
            file_name=file.filename,
            file_content=file_content,
            content_type=file.content_type,
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
        success = await file_service.delete_file(file_id, current_user.id)
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
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get user profile information"""
    try:
        profile_service = SupabaseProfileService()
        profile = await profile_service.get_or_create_profile(current_user.id, {
            "email": current_user.email,
            "username": current_user.username or current_user.email.split("@")[0]
        })
        return {"profile": profile}
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Update user profile information"""
    try:
        profile_service = SupabaseProfileService()
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
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Upload user avatar"""
    try:
        profile_service = SupabaseProfileService()
        
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
        response = await ai_service.generate_new_idea(request)
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
        response = await ai_service.judge_idea(request)
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
