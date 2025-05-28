"""
Innovator router - Real DB + AI integration
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import IdeaCreate, IdeaUpdate, IdeaResponse, PitchRequest, PitchResponse, UserResponse
from app.services.idea_logic import IdeaService
from app.services.gemini_ai import GeminiAIService
from app.utils.jwt import get_current_user
from app.utils.roles import require_role

router = APIRouter()


@router.post("/submit-idea", response_model=IdeaResponse)
async def submit_idea(
    idea_data: IdeaCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Submit a new innovation idea"""
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
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Update an existing idea"""
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
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Delete an idea"""
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
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(require_role("innovator"))
):
    """Get all ideas for the current user"""
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
    ai_service = GeminiAIService()
    
    try:
        pitch = await ai_service.generate_pitch(pitch_request)
        return pitch
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}"
        )
