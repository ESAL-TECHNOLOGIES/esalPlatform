"""
Supabase-based Ideas service for managing user ideas
"""
from supabase import create_client, Client
from fastapi import HTTPException, status
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timezone
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
            logger.info(f"Creating idea for user: {user_id}")
            logger.info(f"Idea data received: {idea_data}")
            
            # Use description from frontend if provided, otherwise build from structured fields
            description = idea_data.description
            if not description and (idea_data.problem or idea_data.solution or idea_data.target_market):
                # Build description from structured fields if no direct description provided
                description_parts = []
                if idea_data.problem:
                    description_parts.append(f"Problem: {idea_data.problem}")
                if idea_data.solution:
                    description_parts.append(f"Solution: {idea_data.solution}")
                if idea_data.target_market:
                    description_parts.append(f"Target Market: {idea_data.target_market}")
                description = "\n\n".join(description_parts)
            
            # Build idea record with all fields from frontend
            idea_record = {
                "user_id": user_id,
                "title": idea_data.title,
                "description": description or "No description provided",
                "category": idea_data.category,
                "tags": idea_data.tags or [],
                "status": idea_data.status or "draft",
                "visibility": idea_data.visibility or "private",
                "view_count": 0,
                "interest_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Add structured fields if they exist
            if idea_data.problem:
                idea_record["problem"] = idea_data.problem
            if idea_data.solution:
                idea_record["solution"] = idea_data.solution
            if idea_data.target_market:
                idea_record["target_market"] = idea_data.target_market
            
            logger.info(f"Idea record to insert: {idea_record}")
            
            result = self.supabase.table("ideas").insert(idea_record).execute()
            
            logger.info(f"Supabase result: {result}")
            logger.info(f"Result data: {result.data}")
            logger.info(f"Result count: {result.count}")
            
            if result.data:
                logger.info(f"Successfully created idea with ID: {result.data[0].get('id')}")
                return result.data[0]
            else:
                logger.error("No data returned from Supabase insert")
                logger.error(f"Full result object: {vars(result)}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create idea - no data returned"
                )
        except Exception as e:
            logger.error(f"Error creating idea: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error args: {e.args}")
            
            # Log Supabase-specific error details
            if hasattr(e, 'message'):
                logger.error(f"Supabase error message: {e.message}")
            if hasattr(e, 'details'):
                logger.error(f"Supabase error details: {e.details}")
            if hasattr(e, 'code'):
                logger.error(f"Supabase error code: {e.code}")
            if hasattr(e, 'hint'):
                logger.error(f"Supabase error hint: {e.hint}")
                
            # Print full exception info for debugging
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create idea: {str(e)}"
            )
    async def get_user_ideas(self, user_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all ideas for a specific user"""
        try:
            query = self.supabase.table("ideas").select("*").eq("user_id", user_id).order("created_at", desc=True)
            if limit is not None:
                query = query.limit(limit)
            result = query.execute()
            
            # Transform raw database data to match IdeaResponse schema
            transformed_ideas = []
            for idea in (result.data or []):
                transformed_idea = {
                    "id": str(idea.get("id", "")),
                    "title": idea.get("title", ""),
                    "description": idea.get("description", ""),
                    "industry": idea.get("category", ""),  # Map category to industry
                    "stage": "idea",  # Default stage since not in DB schema
                    "status": idea.get("status", "draft"),
                    "created_at": idea.get("created_at", ""),
                    "updated_at": idea.get("updated_at", ""),
                    "views_count": idea.get("view_count", 0),  # Map view_count to views_count
                    "interests_count": idea.get("interest_count", 0),  # Map interest_count to interests_count
                    "user_id": str(idea.get("user_id", "")),
                    "ai_score": idea.get("ai_score"),
                    # Optional fields for frontend compatibility
                    "target_market": idea.get("target_market", ""),
                    "problem": idea.get("problem", ""),
                    "solution": idea.get("solution", ""),
                    "category": idea.get("category", ""),
                    "tags": idea.get("tags", []),
                    "visibility": idea.get("visibility", "private")
                }
                transformed_ideas.append(transformed_idea)
            
            return transformed_ideas
            
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

            # Prepare update data - handle ALL fields that can be updated
            update_data = {}
            
            # Basic fields
            if idea_data.title is not None:
                update_data["title"] = idea_data.title
            if idea_data.description is not None:
                update_data["description"] = idea_data.description
              # Category field (industry doesn't exist in DB, so we'll use category for both)
            if idea_data.category is not None:
                update_data["category"] = idea_data.category
            # Note: 'industry' column doesn't exist in DB, mapping to category instead
            if idea_data.industry is not None:
                update_data["category"] = idea_data.industry
                
            # Stage field - NOTE: 'stage' column doesn't exist in DB, skipping
            # if idea_data.stage is not None:
            #     update_data["stage"] = idea_data.stage
            if idea_data.status is not None:
                update_data["status"] = idea_data.status
                
            # Visibility field
            if idea_data.visibility is not None:
                update_data["visibility"] = idea_data.visibility
                
            # Structured content fields
            if idea_data.problem is not None:
                update_data["problem"] = idea_data.problem
            if idea_data.solution is not None:
                update_data["solution"] = idea_data.solution
            if idea_data.target_market is not None:
                update_data["target_market"] = idea_data.target_market
                
            # Tags field (array)
            if idea_data.tags is not None:
                update_data["tags"] = idea_data.tags
            
            # Always update timestamp
            update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            logger.info(f"Updating idea {idea_id} with data: {update_data}")
            
            result = self.supabase.table("ideas").update(update_data).eq("id", idea_id).eq("user_id", user_id).execute()
            
            if result.data:
                logger.info(f"Successfully updated idea {idea_id}")
                return result.data[0]
            else:
                logger.warning(f"No rows updated for idea {idea_id}")
                return None
        except Exception as e:
            logger.error(f"Error updating idea {idea_id}: {e}", exc_info=True)
            # Log more details about the error
            logger.error(f"Error type: {type(e).__name__}")
            if hasattr(e, 'message'):
                logger.error(f"Error message: {e.message}")
            if hasattr(e, 'details'):
                logger.error(f"Error details: {e.details}")
            if hasattr(e, 'code'):
                logger.error(f"Error code: {e.code}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update idea: {str(e)}"
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

    # AI Integration Methods
    
    async def create_ai_generated_idea(self, user_id: str, ai_response: str, ai_metadata: dict = None) -> Dict[str, Any]:
        """Create a new idea from AI generation with metadata"""
        try:
            # Parse AI response to extract structured data
            title, description, problem, solution, target_market = self._parse_ai_response(ai_response)
            
            # Build idea record for AI-generated content
            idea_record = {
                "user_id": user_id,
                "title": title,
                "description": description,                "status": "draft",
                "ai_generated": True,
                "ai_metadata": ai_metadata or {
                    "generation_timestamp": datetime.now(timezone.utc).isoformat(),
                    "ai_confidence": ai_metadata.get("confidence_score", 0.8) if ai_metadata else 0.8,
                    "generation_type": "ai_generated"
                },
                "view_count": 0,
                "interest_count": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Add structured fields if available
            if problem:
                idea_record["problem"] = problem
            if solution:
                idea_record["solution"] = solution  
            if target_market:
                idea_record["target_market"] = target_market
                
            result = self.supabase.table("ideas").insert(idea_record).execute()
            
            if result.data:
                logger.info(f"Created AI-generated idea {result.data[0]['id']} for user {user_id}")
                return result.data[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create AI-generated idea"
                )
                
        except Exception as e:
            logger.error(f"Error creating AI-generated idea: {e}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create AI-generated idea"
            )

    async def update_ai_score(self, idea_id: str, user_id: str, ai_score: float, ai_judgment_data: dict = None) -> bool:
        """Update an idea with AI judgment score and metadata"""
        try:
            # Prepare update data
            update_data = {
                "ai_score": ai_score,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Add AI judgment metadata if provided
            if ai_judgment_data:
                # Get existing metadata and merge with new judgment data
                existing_result = self.supabase.table("ideas").select("ai_metadata").eq("id", idea_id).eq("user_id", user_id).execute()
                
                existing_metadata = {}
                if existing_result.data:
                    existing_metadata = existing_result.data[0].get("ai_metadata", {})
                
                # Merge metadata
                updated_metadata = {**existing_metadata}
                updated_metadata.update({
                    "ai_judgment": {
                        "overall_score": ai_score,
                        "judgment_timestamp": datetime.now(timezone.utc).isoformat(),
                        **ai_judgment_data
                    }
                })
                
                update_data["ai_metadata"] = updated_metadata
            
            # Update the idea
            result = self.supabase.table("ideas").update(update_data).eq("id", idea_id).eq("user_id", user_id).execute()
            
            if result.data:
                logger.info(f"Updated AI score for idea {idea_id}: {ai_score}")
                return True
            else:
                logger.warning(f"No idea found with id {idea_id} for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating AI score: {e}")
            return False

    async def get_ai_analytics(self, user_id: str) -> Dict[str, Any]:
        """Get AI-related analytics for a user"""
        try:
            # Get user's ideas with AI scores
            result = self.supabase.table("ideas").select("ai_score, ai_generated, ai_metadata").eq("user_id", user_id).execute()
            
            if not result.data:
                return {
                    "total_ideas": 0,
                    "ai_generated_ideas": 0,
                    "ai_scored_ideas": 0,
                    "average_ai_score": None,
                    "highest_ai_score": None,
                    "ai_score_distribution": {}
                }
            
            ideas = result.data
            total_ideas = len(ideas)
            ai_generated_count = sum(1 for idea in ideas if idea.get("ai_generated", False))
            ai_scored_ideas = [idea for idea in ideas if idea.get("ai_score") is not None]
            ai_scored_count = len(ai_scored_ideas)
            
            # Calculate AI score statistics
            average_score = None
            highest_score = None
            score_distribution = {"0-3": 0, "3-5": 0, "5-7": 0, "7-8": 0, "8-10": 0}
            
            if ai_scored_ideas:
                scores = [idea["ai_score"] for idea in ai_scored_ideas]
                average_score = sum(scores) / len(scores)
                highest_score = max(scores)
                
                # Calculate distribution
                for score in scores:
                    if score < 3:
                        score_distribution["0-3"] += 1
                    elif score < 5:
                        score_distribution["3-5"] += 1
                    elif score < 7:
                        score_distribution["5-7"] += 1
                    elif score < 8:
                        score_distribution["7-8"] += 1
                    else:
                        score_distribution["8-10"] += 1
            
            return {
                "total_ideas": total_ideas,
                "ai_generated_ideas": ai_generated_count,
                "ai_scored_ideas": ai_scored_count,
                "average_ai_score": round(average_score, 2) if average_score else None,
                "highest_ai_score": round(highest_score, 2) if highest_score else None,
                "ai_score_distribution": score_distribution
            }
            
        except Exception as e:
            logger.error(f"Error getting AI analytics: {e}")
            return {
                "total_ideas": 0,
                "ai_generated_ideas": 0,
                "ai_scored_ideas": 0,
                "average_ai_score": None,
                "highest_ai_score": None,
                "ai_score_distribution": {}
            }

    def _parse_ai_response(self, ai_response: str) -> tuple:
        """Parse AI response text to extract structured data"""
        try:
            # Simple parsing - look for common patterns in AI responses
            lines = ai_response.split('\n')
            title = ""
            description = ai_response  # Full response as description by default
            problem = ""
            solution = ""
            target_market = ""
            
            current_section = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Look for section headers
                line_lower = line.lower()
                if any(keyword in line_lower for keyword in ['title:', '**title**', 'name:']):
                    current_section = 'title'
                    title = line.split(':', 1)[-1].strip().replace('**', '').replace('*', '')
                elif any(keyword in line_lower for keyword in ['problem:', '**problem**', 'problem statement']):
                    current_section = 'problem'
                    if ':' in line:
                        problem = line.split(':', 1)[-1].strip()
                elif any(keyword in line_lower for keyword in ['solution:', '**solution**']):
                    current_section = 'solution' 
                    if ':' in line:
                        solution = line.split(':', 1)[-1].strip()
                elif any(keyword in line_lower for keyword in ['target market:', '**target market**', 'market:']):
                    current_section = 'target_market'
                    if ':' in line:
                        target_market = line.split(':', 1)[-1].strip()
                elif current_section and not line.startswith('**') and not line.startswith('#'):
                    # Continue building current section
                    if current_section == 'problem' and not problem:
                        problem = line
                    elif current_section == 'solution' and not solution:
                        solution = line
                    elif current_section == 'target_market' and not target_market:
                        target_market = line
            
            # Extract title from first line if not found
            if not title and lines:
                first_line = lines[0].strip()
                if len(first_line) < 100:  # Likely a title
                    title = first_line.replace('**', '').replace('#', '').strip()
            
            # Fallback title
            if not title:
                title = "AI Generated Startup Idea"
                
            return title, description, problem, solution, target_market
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return "AI Generated Startup Idea", ai_response, "", "", ""
