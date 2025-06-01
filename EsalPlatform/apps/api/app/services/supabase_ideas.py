"""
Supabase-based Ideas service for managing user ideas
"""
from supabase import create_client, Client
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import uuid

from app.config import settings
from app.schemas import IdeaCreate, IdeaUpdate, IdeaResponse

logger = logging.getLogger(__name__)


class SupabaseIdeasService:    
    def __init__(self):
        try:
            # Use service role key for ideas operations (bypasses RLS)
            service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
            if service_key:
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    service_key
                )
                logger.info("Ideas service using service role key (bypasses RLS)")
            else:
                # Fallback to anon key if service role not available
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.warning("Ideas service using anon key - may have RLS issues")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")           
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Ideas service is not available"
            )

    async def create_idea(self, user_id: str, idea_data: IdeaCreate) -> Dict[str, Any]:
        """Create a new idea in Supabase"""
        try:
            # Build description from frontend data if not provided
            description = idea_data.description
            if not description and (idea_data.problem or idea_data.solution or idea_data.target_market):
                description_parts = []
                if idea_data.problem:
                    description_parts.append(f"Problem: {idea_data.problem}")
                if idea_data.solution:
                    description_parts.append(f"Solution: {idea_data.solution}")
                if idea_data.target_market:
                    description_parts.append(f"Target Market: {idea_data.target_market}")
                description = "\n\n".join(description_parts)
            
            # Build idea record with only non-None values to avoid Supabase insertion issues
            idea_record = {
                "user_id": user_id,
                "title": idea_data.title,
                "description": description or "No description provided",  # Required field
                "status": "draft",
                "view_count": 0,
                "interest_count": 0,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()            }
            
            # Add optional fields only if they have values and exist in table
            if idea_data.category:
                idea_record["category"] = idea_data.category
            elif idea_data.industry:
                idea_record["category"] = idea_data.industry  # Map industry to category
            
            if idea_data.tags:
                idea_record["tags"] = idea_data.tags
            
            result = self.supabase.table("ideas").insert(idea_record).execute()
            
            if result.data:
                return result.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create idea"
                )
        except Exception as e:
            logger.error(f"Error creating idea: {e}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create idea"
            )

    async def get_user_ideas(self, user_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all ideas for a specific user"""
        try:
            query = self.supabase.table("ideas").select("*").eq("user_id", user_id).order("created_at", desc=True)
            if limit is not None:
                query = query.limit(limit)
            result = query.execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error fetching user ideas: {e}")            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch ideas"
            )

    async def get_idea_by_id(self, idea_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific idea by ID (only if user owns it)"""
        try:
            result = self.supabase.table("ideas").select("*").eq("id", idea_id).eq("user_id", user_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error fetching idea: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch idea"
            )

    async def update_idea(self, idea_id: str, user_id: str, idea_data: IdeaUpdate) -> Optional[Dict[str, Any]]:
        """Update an existing idea"""
        try:
            # First check if the idea exists and belongs to the user
            existing_idea = await self.get_idea_by_id(idea_id, user_id)
            if not existing_idea:
                return None

            # Prepare update data
            update_data = {}
            if idea_data.title is not None:
                update_data["title"] = idea_data.title
            if idea_data.description is not None:
                update_data["description"] = idea_data.description
            if idea_data.industry is not None:
                update_data["industry"] = idea_data.industry
            if idea_data.stage is not None:
                update_data["stage"] = idea_data.stage
            if idea_data.target_market is not None:
                update_data["target_market"] = idea_data.target_market
            
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.supabase.table("ideas").update(update_data).eq("id", idea_id).eq("user_id", user_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error updating idea: {e}")            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update idea"
            )

    async def delete_idea(self, idea_id: str, user_id: str) -> bool:
        """Delete an idea"""
        try:
            result = self.supabase.table("ideas").delete().eq("id", idea_id).eq("user_id", user_id).execute()
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error deleting idea: {e}")            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete idea"
            )

    async def get_dashboard_stats(self, user_id: str) -> Dict[str, Any]:
        """Get dashboard statistics for a user"""
        try:
            # Get all user ideas
            ideas = await self.get_user_ideas(user_id)
            
            total_ideas = len(ideas)
            active_ideas = len([idea for idea in ideas if idea.get("status") in ["active", "published"]])
            total_views = sum(idea.get("view_count", 0) for idea in ideas)
            total_interests = sum(idea.get("interest_count", 0) for idea in ideas)
            
            return {
                "total_ideas": total_ideas,
                "active_ideas": active_ideas,
                "total_views": total_views,
                "total_interests": total_interests
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {e}")            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get dashboard statistics"
            )

    async def increment_view_count(self, idea_id: str) -> bool:
        """Increment view count for an idea"""
        try:
            # Get current view count
            result = self.supabase.table("ideas").select("view_count").eq("id", idea_id).execute()
            
            if result.data:
                current_views = result.data[0].get("view_count", 0)
                new_views = current_views + 1
                
                self.supabase.table("ideas").update({"view_count": new_views}).eq("id", idea_id).execute()
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error incrementing view count: {e}")
            return False

    async def search_ideas(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search ideas by title or description"""
        try:
            # Note: This is a simple search. For production, you might want to use Supabase's full-text search
            result = self.supabase.table("ideas").select("*").or_(
                f"title.ilike.%{query}%,description.ilike.%{query}%"
            ).eq("status", "published").limit(limit).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error searching ideas: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to search ideas"
            )
