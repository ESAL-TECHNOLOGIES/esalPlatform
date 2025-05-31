"""
Innovator router - Real DB + AI integration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.config import settings
from app.schemas import IdeaCreate, IdeaUpdate, IdeaResponse, PitchRequest, PitchResponse, UserResponse
from app.utils.jwt import get_current_user
from app.utils.roles import require_role

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


@router.post("/submit-idea", response_model=IdeaResponse)
async def submit_idea(
    idea_data: IdeaCreate,
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Submit a new innovation idea"""
    if not settings.USE_LOCAL_DB:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Ideas functionality is not available in Supabase-only mode yet. Please check back later."
        )
    
    from app.services.idea_logic import IdeaService
    from app.database import get_db
    from fastapi import Depends
    
    db: Session = Depends(get_db)
    idea_service = IdeaService(db)
    
    try:
        idea = idea_service.create_idea(current_user.id, idea_data)
        return idea
    except Exception as e:
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
    if not settings.USE_LOCAL_DB:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Ideas functionality is not available in Supabase-only mode yet. Please check back later."
        )
    
    from app.services.idea_logic import IdeaService
    from app.database import get_db
    from fastapi import Depends
    
    db: Session = Depends(get_db)
    idea_service = IdeaService(db)
    
    try:
        idea = idea_service.update_idea(idea_id, current_user.id, idea_data)
        if not idea:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Idea not found or not owned by user"
            )
        return idea
    except HTTPException:
        raise
    except Exception as e:
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
    if not settings.USE_LOCAL_DB:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Ideas functionality is not available in Supabase-only mode yet. Please check back later."
        )
    
    from app.services.idea_logic import IdeaService
    from app.database import get_db
    from fastapi import Depends
    
    db: Session = Depends(get_db)
    idea_service = IdeaService(db)
    
    try:
        success = idea_service.delete_idea(idea_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Idea not found or not owned by user"
            )
        return {"message": "Idea deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/view-ideas", response_model=List[IdeaResponse])
async def view_ideas(
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get all ideas for the current user"""
    if not settings.USE_LOCAL_DB:
        # Return empty list for Supabase-only mode
        return []
    
    from app.services.idea_logic import IdeaService
    from app.database import get_db
    from fastapi import Depends
    
    db: Session = Depends(get_db)
    idea_service = IdeaService(db)
    
    try:
        ideas = idea_service.get_user_ideas(current_user.id)
        return ideas
    except Exception as e:
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
    if not settings.USE_LOCAL_DB:
        # AI pitch can work without local DB as it doesn't depend on stored ideas
        try:
            from app.services.gemini_ai import GeminiAIService
            ai_service = GeminiAIService()
            pitch = await ai_service.generate_pitch(pitch_request)
            return pitch
        except ImportError:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="AI service is not available in Supabase-only mode yet. Please check back later."
            )
    else:
        from app.services.gemini_ai import GeminiAIService
        ai_service = GeminiAIService()
        
        try:
            pitch = await ai_service.generate_pitch(pitch_request)
            return pitch
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"AI service error: {str(e)}"
            )


@router.get("/dashboard")
async def innovator_dashboard(
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get dashboard data including recent ideas and stats"""
    
    if settings.USE_LOCAL_DB:
        # Use local database for ideas
        from app.services.idea_logic import IdeaService
        from app.database import get_db
        from fastapi import Depends
        
        db: Session = Depends(get_db)
        idea_service = IdeaService(db)
        
        try:
            # Get user's recent ideas (limit to 5 for dashboard)
            all_ideas = idea_service.get_user_ideas(current_user.id)
            recent_ideas = all_ideas[:5] if all_ideas else []
            
            # Calculate dashboard stats
            total_ideas = len(all_ideas)
            active_ideas = len([idea for idea in all_ideas if idea.status in ["active", "featured"]])
            
            # For now, views and interests are not tracked in the database
            # So we'll return 0 or could implement these fields later
            total_views = 0
            total_interests = 0
            
            return {
                "user": current_user,
                "recent_ideas": recent_ideas,
                "stats": {
                    "total_ideas": total_ideas,
                    "active_ideas": active_ideas,
                    "total_views": total_views,
                    "total_interests": total_interests
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    else:
        # Supabase-only mode - return mock dashboard data for now
        # TODO: Implement Supabase table for ideas
        try:
            return {
                "user": current_user,
                "recent_ideas": [],  # Empty for now - will be populated when ideas are moved to Supabase
                "stats": {
                    "total_ideas": 0,
                    "active_ideas": 0,
                    "total_views": 0,
                    "total_interests": 0
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
