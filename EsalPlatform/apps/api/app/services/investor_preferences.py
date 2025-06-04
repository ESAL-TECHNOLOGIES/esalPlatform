"""
Service for managing investor preferences and matching history
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
from supabase import create_client, Client
from app.config import settings
from app.schemas import InvestorPreferences, MatchingHistory

logger = logging.getLogger(__name__)

class InvestorPreferencesService:
    def __init__(self):
        try:
            # Use service role key for preferences operations (bypasses RLS)
            service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
            if service_key:
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    service_key
                )
                logger.info("Investor preferences service using service role key (bypasses RLS)")
            else:
                # Fallback to anon key if service role not available
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.warning("Investor preferences service using anon key - may have RLS issues")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise Exception(f"Investor preferences service is not available: {e}")

    async def save_preferences(
        self, 
        user_id: str, 
        preferences: InvestorPreferences,
        preferences_name: str = "Default",
        is_default: bool = True
    ) -> Dict[str, Any]:
        """Save investor preferences to database"""
        try:
            # If this is being set as default, unset other defaults first
            if is_default:
                await self._unset_other_defaults(user_id)
            
            # Convert preferences to database format
            preferences_data = {
                "user_id": user_id,
                "preferences_name": preferences_name,
                "industries": preferences.industries,
                "stages": preferences.stages,
                "min_funding_amount": preferences.min_funding_amount,
                "max_funding_amount": preferences.max_funding_amount,
                "geographic_preferences": preferences.geographic_preferences,
                "risk_tolerance": preferences.risk_tolerance,
                "investment_timeline": preferences.investment_timeline,
                "is_default": is_default,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Check if preferences already exist
            existing = self.supabase.table("investor_preferences").select("id").eq("user_id", user_id).eq("preferences_name", preferences_name).execute()
            
            if existing.data:
                # Update existing preferences
                result = self.supabase.table("investor_preferences").update(preferences_data).eq("id", existing.data[0]["id"]).execute()
                logger.info(f"Updated investor preferences for user {user_id}")
            else:
                # Insert new preferences
                result = self.supabase.table("investor_preferences").insert(preferences_data).execute()
                logger.info(f"Created new investor preferences for user {user_id}")
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error saving investor preferences: {e}")
            raise Exception(f"Failed to save preferences: {str(e)}")

    async def get_preferences(self, user_id: str, preferences_name: Optional[str] = None) -> Optional[InvestorPreferences]:
        """Get investor preferences from database"""
        try:
            query = self.supabase.table("investor_preferences").select("*").eq("user_id", user_id)
            
            if preferences_name:
                query = query.eq("preferences_name", preferences_name)
            else:
                # Get default preferences
                query = query.eq("is_default", True)
            
            result = query.order("created_at", desc=True).limit(1).execute()
            
            if result.data:
                pref_data = result.data[0]
                return InvestorPreferences(
                    industries=pref_data.get("industries", []),
                    stages=pref_data.get("stages", []),
                    min_funding_amount=pref_data.get("min_funding_amount"),
                    max_funding_amount=pref_data.get("max_funding_amount"),
                    geographic_preferences=pref_data.get("geographic_preferences", []),
                    risk_tolerance=pref_data.get("risk_tolerance", "medium"),
                    investment_timeline=pref_data.get("investment_timeline", "6_months")
                )
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting investor preferences: {e}")
            return None

    async def get_all_preferences(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all saved preferences for a user"""
        try:
            result = self.supabase.table("investor_preferences").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error getting all investor preferences: {e}")
            return []

    async def delete_preferences(self, user_id: str, preferences_name: str) -> bool:
        """Delete specific preferences"""
        try:
            result = self.supabase.table("investor_preferences").delete().eq("user_id", user_id).eq("preferences_name", preferences_name).execute()
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error deleting investor preferences: {e}")
            return False

    async def save_matching_history(
        self,
        user_id: str,
        preferences_used: InvestorPreferences,
        total_matches_found: int,
        high_quality_matches: int,
        average_score: float,
        ai_confidence: float,
        processing_time_seconds: float,
        startup_ids_matched: List[str]
    ) -> Dict[str, Any]:
        """Save matching history to database"""
        try:
            history_data = {
                "user_id": user_id,
                "preferences_used": preferences_used.dict(),
                "total_matches_found": total_matches_found,
                "high_quality_matches": high_quality_matches,
                "average_score": round(average_score, 3),
                "ai_confidence": round(ai_confidence, 3),
                "processing_time_seconds": round(processing_time_seconds, 3),
                "startup_ids_matched": startup_ids_matched,
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table("matching_history").insert(history_data).execute()
            logger.info(f"Saved matching history for user {user_id}: {total_matches_found} matches found")
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error saving matching history: {e}")
            raise Exception(f"Failed to save matching history: {str(e)}")

    async def get_matching_history(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get matching history for a user"""
        try:
            result = self.supabase.table("matching_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error getting matching history: {e}")
            return []

    async def express_interest(
        self,
        investor_user_id: str,
        startup_idea_id: int,
        startup_owner_user_id: str,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Express interest in a startup (create connection request)"""
        try:
            connection_data = {
                "investor_user_id": investor_user_id,
                "startup_idea_id": startup_idea_id,
                "startup_owner_user_id": startup_owner_user_id,
                "message": message,
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.supabase.table("connection_requests").insert(connection_data).execute()
            logger.info(f"Interest expressed by investor {investor_user_id} for startup {startup_idea_id}")
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error expressing interest: {e}")
            raise Exception(f"Failed to express interest: {str(e)}")

    async def get_connection_requests(self, user_id: str, as_investor: bool = True) -> List[Dict[str, Any]]:
        """Get connection requests for a user (as investor or startup owner)"""
        try:
            if as_investor:
                # Get requests made by this investor
                query = self.supabase.table("connection_requests").select("""
                    *,
                    ideas:startup_idea_id (
                        id,
                        title,
                        description,
                        category,
                        stage,
                        funding_needed
                    )
                """).eq("investor_user_id", user_id)
            else:
                # Get requests for startups owned by this user
                query = self.supabase.table("connection_requests").select("""
                    *,
                    ideas:startup_idea_id (
                        id,
                        title,
                        description,
                        category,
                        stage,
                        funding_needed
                    ),
                    investor_profiles:investor_user_id (
                        full_name,
                        bio,
                        company,
                        location
                    )
                """).eq("startup_owner_user_id", user_id)
            
            result = query.order("created_at", desc=True).execute()
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error getting connection requests: {e}")
            return []

    async def update_connection_status(
        self,
        connection_id: int,
        status: str,
        user_id: str
    ) -> bool:
        """Update connection request status (only by startup owner)"""
        try:
            result = self.supabase.table("connection_requests").update({
                "status": status,
                "responded_at": datetime.utcnow().isoformat()
            }).eq("id", connection_id).eq("startup_owner_user_id", user_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error updating connection status: {e}")
            return False

    async def track_startup_view(
        self,
        viewer_user_id: str,
        startup_idea_id: int,
        view_source: str = "browse"
    ):
        """Track when a user views a startup"""
        try:
            view_data = {
                "viewer_user_id": viewer_user_id,
                "startup_idea_id": startup_idea_id,
                "view_source": view_source,
                "viewed_at": datetime.utcnow().isoformat()
            }
            
            self.supabase.table("startup_views").insert(view_data).execute()
            logger.debug(f"Tracked view of startup {startup_idea_id} by user {viewer_user_id}")
            
        except Exception as e:
            logger.error(f"Error tracking startup view: {e}")

    async def get_investor_stats(self, user_id: str) -> Dict[str, Any]:
        """Get investor matching and connection statistics"""
        try:
            # Use the utility function created in the migration
            result = self.supabase.rpc("get_investor_matching_stats", {"investor_uuid": user_id}).execute()
            
            if result.data:
                return result.data[0]
            
            return {
                "total_matches_run": 0,
                "avg_matches_per_run": 0,
                "total_connections_made": 0,
                "pending_connections": 0
            }
            
        except Exception as e:
            logger.error(f"Error getting investor stats: {e}")
            return {
                "total_matches_run": 0,
                "avg_matches_per_run": 0,
                "total_connections_made": 0,
                "pending_connections": 0
            }

    async def _unset_other_defaults(self, user_id: str):
        """Unset other default preferences for a user"""
        try:
            self.supabase.table("investor_preferences").update({"is_default": False}).eq("user_id", user_id).eq("is_default", True).execute()
        except Exception as e:
            logger.error(f"Error unsetting other defaults: {e}")
