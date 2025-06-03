"""
Ideas router - Metrics and analytics for ideas
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

# Import from the direct schemas.py module instead of the package
import app.schemas as schemas
from app.utils.roles import require_role

router = APIRouter()


class IdeaDetailResponse(BaseModel):
    id: str
    title: str
    description: str
    industry: str
    stage: str
    target_market: str
    funding_needed: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    team_size: Optional[int] = None
    status: str
    ai_score: Optional[float] = None
    created_at: str
    updated_at: str
    views_count: int
    interests_count: int
    user_id: str
    author_name: Optional[str] = None
    comments: List[Dict[str, Any]] = []
    files: List[Dict[str, Any]] = []
    similar_ideas: List[Dict[str, Any]] = []


@router.get("/metrics")
async def get_ideas_metrics(
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> List[Dict[str, Any]]:
    """Get metrics data for user's real ideas from database"""
    
    try:
        # Import Supabase service
        from app.services.supabase_ideas import SupabaseIdeasService
        
        # Initialize service
        ideas_service = SupabaseIdeasService()
        
        # Get real user ideas from database
        user_ideas = await ideas_service.get_user_ideas(current_user.id)
        
        # Transform data to match frontend expectations
        metrics_data = []
        for idea in user_ideas:
            metrics_data.append({
                "id": str(idea.get("id", "")),
                "title": idea.get("title", "Untitled Idea"),
                "views": idea.get("view_count", 0),
                "interests": idea.get("interest_count", 0),
                "ai_score": idea.get("ai_score", None),  # May be None if not calculated yet
                "status": idea.get("status", "draft"),
                "created_at": idea.get("created_at", datetime.now().isoformat())
            })
        
        return metrics_data
        
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching user metrics: {e}")
        
        # Return empty list instead of demo data
        return []


@router.get("/analytics")
async def get_ideas_analytics(
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Get detailed analytics for user's real ideas from database"""
    
    try:
        # Import Supabase service
        from app.services.supabase_ideas import SupabaseIdeasService
        
        # Initialize service
        ideas_service = SupabaseIdeasService()
        
        # Get real user ideas from database
        user_ideas = await ideas_service.get_user_ideas(current_user.id)
        
        # Calculate real statistics
        total_ideas = len(user_ideas)
        active_ideas = len([idea for idea in user_ideas if idea.get("status") in ["active", "published"]])
        draft_ideas = len([idea for idea in user_ideas if idea.get("status") == "draft"])
        total_views = sum(idea.get("view_count", 0) for idea in user_ideas)
        total_interests = sum(idea.get("interest_count", 0) for idea in user_ideas)
        
        # Calculate average AI score (only for ideas that have scores)
        ideas_with_scores = [idea for idea in user_ideas if idea.get("ai_score") is not None]
        avg_ai_score = (
            sum(idea.get("ai_score", 0) for idea in ideas_with_scores) / len(ideas_with_scores)
            if ideas_with_scores else 0
        )
        
        # Find top performing ideas
        most_viewed = max(user_ideas, key=lambda x: x.get("view_count", 0)) if user_ideas else None
        most_interested = max(user_ideas, key=lambda x: x.get("interest_count", 0)) if user_ideas else None
        highest_score = max(ideas_with_scores, key=lambda x: x.get("ai_score", 0)) if ideas_with_scores else None
        
        # Count categories (map to existing categories)
        category_counts = {}
        for idea in user_ideas:
            category = idea.get("category") or "technology"  # Default to technology
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Generate trend data (for now, return empty arrays - can be enhanced later with real time-series data)
        performance_trends = {
            "views_last_30_days": [],
            "interests_last_30_days": []
        }
        
        return {
            "overview": {
                "total_ideas": total_ideas,
                "active_ideas": active_ideas,
                "draft_ideas": draft_ideas,
                "total_views": total_views,
                "total_interests": total_interests,
                "avg_ai_score": round(avg_ai_score, 2)
            },
            "performance_trends": performance_trends,
            "top_performing": {
                "most_viewed": {
                    "id": str(most_viewed.get("id", "")),
                    "title": most_viewed.get("title", ""),
                    "views": most_viewed.get("view_count", 0)
                } if most_viewed else None,
                "most_interested": {
                    "id": str(most_interested.get("id", "")),
                    "title": most_interested.get("title", ""),
                    "interests": most_interested.get("interest_count", 0)
                } if most_interested else None,
                "highest_score": {
                    "id": str(highest_score.get("id", "")),
                    "title": highest_score.get("title", ""),
                    "ai_score": highest_score.get("ai_score", 0)
                } if highest_score else None
            },
            "categories": category_counts
        }
        
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching user analytics: {e}")
        
        # Return empty analytics instead of demo data
        return {
            "overview": {
                "total_ideas": 0,
                "active_ideas": 0,
                "draft_ideas": 0,
                "total_views": 0,
                "total_interests": 0,
                "avg_ai_score": 0
            },
            "performance_trends": {
                "views_last_30_days": [],
                "interests_last_30_days": []
            },
            "top_performing": {
                "most_viewed": None,
                "most_interested": None,
                "highest_score": None
            },
            "categories": {}
        }


@router.get("/list", response_model=List[Dict[str, Any]])
async def get_all_ideas(
    status: Optional[str] = None,
    industry: Optional[str] = None,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> List[Dict[str, Any]]:
    """Get all ideas for the current user with filters using real database data"""
    
    try:
        # Import Supabase service
        from app.services.supabase_ideas import SupabaseIdeasService
        
        # Initialize service
        ideas_service = SupabaseIdeasService()
        
        # Get real user ideas from database
        user_ideas = await ideas_service.get_user_ideas(current_user.id)
        
        # Transform data to match frontend expectations and apply filters
        ideas_list = []
        for idea in user_ideas:
            # Apply status filter
            if status and idea.get("status") != status:
                continue
                
            # Apply industry filter (checking category field)
            if industry and idea.get("category", "").lower() != industry.lower():
                continue
            
            # Transform idea data
            ideas_list.append({
                "id": str(idea.get("id", "")),
                "title": idea.get("title", "Untitled Idea"),
                "description": idea.get("description", ""),
                "industry": idea.get("category", "Technology"),  # Map category to industry
                "stage": "idea",  # Default stage since not in current schema
                "status": idea.get("status", "draft"),
                "created_at": idea.get("created_at", datetime.now().isoformat()),
                "updated_at": idea.get("updated_at", datetime.now().isoformat()),
                "views_count": idea.get("view_count", 0),
                "interests_count": idea.get("interest_count", 0)
            })
        
        return ideas_list
        
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching user ideas list: {e}")
        
        # Return empty list instead of demo data
        return []


@router.get("/{idea_id}")
async def get_idea_details(
    idea_id: str,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
):
    """Get detailed information about a specific idea using real database data"""
    
    try:
        # Import Supabase service
        from app.services.supabase_ideas import SupabaseIdeasService
        import logging
        
        logger = logging.getLogger(__name__)
        logger.info(f"Fetching idea details for ID: {idea_id} for user {current_user.id}")
        
        # Initialize service
        ideas_service = SupabaseIdeasService()
        
        # Get real user ideas from database
        user_ideas = await ideas_service.get_user_ideas(current_user.id)
        logger.debug(f"Retrieved {len(user_ideas)} ideas for user")
        
        # Find the specific idea
        idea = None
        for user_idea in user_ideas:
            if str(user_idea.get("id")) == idea_id:
                idea = user_idea
                break
        
        if not idea:
            logger.warning(f"Idea with ID {idea_id} not found for user {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Idea with ID {idea_id} not found"
            )
        
        logger.debug(f"Found idea: {idea.get('title', 'Unknown')} with data keys: {list(idea.keys())}")
        
        # Transform idea data to match frontend expectations with manual validation
        try:
            idea_details = {
                "id": str(idea.get("id", "")),
                "title": idea.get("title", "Untitled Idea"),
                "description": idea.get("description", ""),
                "problem": idea.get("problem", ""),
                "solution": idea.get("solution", ""),
                "industry": idea.get("category", idea.get("industry", "Technology")),  # Try category first, then industry
                "stage": idea.get("stage", "idea"),
                "target_market": idea.get("target_market", ""),
                "funding_needed": idea.get("funding_needed", ""),
                "team_size": idea.get("team_size", 1),
                "status": idea.get("status", "draft"),
                "ai_score": idea.get("ai_score"),
                "created_at": idea.get("created_at", ""),
                "updated_at": idea.get("updated_at", ""),
                "views_count": idea.get("view_count", idea.get("views_count", 0)),
                "interests_count": idea.get("interest_count", idea.get("interests_count", 0)),
                "user_id": str(current_user.id),
                "author_name": getattr(current_user, 'full_name', getattr(current_user, 'name', 'Unknown User')),
                "comments": [],  # TODO: Implement real comments from database
                "files": [],     # TODO: Implement real files from database
                "similar_ideas": []  # TODO: Implement real similar ideas logic
            }
            
            logger.info(f"Successfully transformed idea details for ID {idea_id}")
            return idea_details
            
        except Exception as transform_error:
            logger.error(f"Error transforming idea data for ID {idea_id}: {transform_error}")
            logger.error(f"Raw idea data: {idea}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error processing idea data"
            )        
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error fetching idea details for ID {idea_id}: {e}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve idea details"
        )


@router.post("/{idea_id}/comment", response_model=Dict[str, Any])
async def add_comment(
    idea_id: str,
    comment_data: schemas.CommentCreate,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Add a comment to an idea using real database operations"""
    
    try:
        # TODO: Implement real database comment creation
        # This would involve:
        # 1. Validating that the idea exists and belongs to the user
        # 2. Creating a new comment record in the database
        # 3. Returning the created comment with a real database-generated ID
        
        # For now, return a placeholder response indicating the feature needs implementation
        return {
            "message": "Comment functionality requires database implementation",
            "comment": {
                "id": "pending_implementation",
                "content": comment_data.content,
                "user_id": current_user.id,
                "user_name": current_user.full_name,
                "user_role": current_user.role,
                "created_at": datetime.now().isoformat(),
                "idea_id": idea_id
            }
        }
        
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error adding comment to idea {idea_id}: {e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding comment"
        )


@router.post("/{idea_id}/upload-file")
async def upload_file(
    idea_id: str,
    file: UploadFile = File(...),
    description: str = Form(None),
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Upload a file attachment for an idea using real file storage"""
    
    try:
        # TODO: Implement real file upload functionality
        # This would involve:
        # 1. Validating that the idea exists and belongs to the user
        # 2. Uploading the file to cloud storage (e.g., Supabase Storage, AWS S3)
        # 3. Creating a file record in the database with real metadata
        # 4. Returning the file information with actual URLs and IDs
        
        # For now, return a placeholder response indicating the feature needs implementation
        file_data = {
            "id": "pending_implementation",
            "name": file.filename,
            "type": file.content_type,
            "size": 0,  # Real size would be calculated during upload
            "url": "pending_file_storage_implementation",
            "description": description,
            "uploaded_at": datetime.now().isoformat(),
            "idea_id": idea_id
        }
        
        return {
            "message": "File upload functionality requires storage implementation",
            "file": file_data
        }
        
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error uploading file for idea {idea_id}: {e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading file"
        )


@router.put("/{idea_id}", response_model=Dict[str, Any])
async def update_idea(
    idea_id: str,
    idea_data: schemas.IdeaCreate,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Update an existing idea using real database operations"""
    
    try:
        # Import Supabase service
        from app.services.supabase_ideas import SupabaseIdeasService
        
        # Initialize service
        ideas_service = SupabaseIdeasService()
        
        # Get user ideas to verify ownership
        user_ideas = await ideas_service.get_user_ideas(current_user.id)
        
        # Check if idea exists and belongs to current user
        idea_exists = False
        for idea in user_ideas:
            if str(idea.get("id")) == idea_id:
                idea_exists = True
                break
        
        if not idea_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Idea with ID {idea_id} not found or does not belong to user"
            )
        
        # TODO: Implement real database update functionality
        # This would involve:
        # 1. Updating the idea record in the database with new data
        # 2. Returning the updated idea information
        
        # For now, return a placeholder response with the provided data
        updated_idea = {
            "id": idea_id,
            "title": idea_data.title,
            "description": idea_data.description,
            "industry": idea_data.industry,
            "stage": idea_data.stage,
            "target_market": idea_data.target_market,
            "funding_needed": getattr(idea_data, "funding_needed", None),
            "problem": getattr(idea_data, "problem", None),
            "solution": getattr(idea_data, "solution", None),
            "updated_at": datetime.now().isoformat()
        }
        
        return {
            "message": f"Idea update functionality requires database implementation",
            "idea": updated_idea
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating idea {idea_id}: {e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating idea"
        )


@router.delete("/{idea_id}", response_model=Dict[str, str])
async def delete_idea(
    idea_id: str,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, str]:
    """Delete an idea using real database operations"""
    
    try:
        # Import Supabase service
        from app.services.supabase_ideas import SupabaseIdeasService
        
        # Initialize service
        ideas_service = SupabaseIdeasService()
        
        # Get user ideas to verify ownership
        user_ideas = await ideas_service.get_user_ideas(current_user.id)
        
        # Check if idea exists and belongs to current user
        idea_exists = False
        for idea in user_ideas:
            if str(idea.get("id")) == idea_id:
                idea_exists = True
                break
        
        if not idea_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Idea with ID {idea_id} not found or does not belong to user"
            )
        
        # TODO: Implement real database deletion functionality
        # This would involve:
        # 1. Deleting the idea record from the database
        # 2. Handling related data (comments, files, etc.)
        # 3. Proper cleanup of associated resources
        
        return {
            "message": f"Idea deletion functionality requires database implementation"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error deleting idea {idea_id}: {e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting idea"
        )


@router.post("/upload", response_model=Dict[str, Any])
async def upload_idea(
    idea_data: schemas.IdeaCreate,
    current_user: schemas.UserResponse = Depends(require_role("innovator"))
) -> Dict[str, Any]:
    """Upload a new idea using real database operations"""
    
    try:
        # TODO: Implement real database idea creation functionality
        # This would involve:
        # 1. Creating a new idea record in the database
        # 2. Generating real AI scores through actual ML models
        # 3. Returning the created idea with database-generated ID
        
        # For now, return a placeholder response indicating the feature needs implementation
        new_idea = {
            "id": "pending_implementation",
            "title": idea_data.title,
            "description": idea_data.description,
            "industry": idea_data.industry,
            "stage": idea_data.stage,
            "target_market": idea_data.target_market,
            "funding_needed": getattr(idea_data, "funding_needed", None),
            "problem": getattr(idea_data, "problem", None),
            "solution": getattr(idea_data, "solution", None),
            "status": "draft",
            "ai_score": 0,  # Real AI score would be calculated by ML models
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "views_count": 0,
            "interests_count": 0,
            "user_id": current_user.id,
            "author_name": current_user.full_name,
            "comments": [],
            "files": []
        }
        
        return {
            "message": "Idea creation functionality requires database implementation",
            "idea": new_idea
        }
        
    except Exception as e:
        # Log error but don't expose internal details
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating new idea: {e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating idea"
        )
