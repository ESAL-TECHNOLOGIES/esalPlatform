"""
Supabase-based Profile service for managing user profiles
"""
from supabase import create_client, Client
from fastapi import HTTPException, status
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseProfileService:
    def __init__(self):
        try:
            self.supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Profile service is not available"
            )

    async def get_or_create_profile(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get existing profile or create new one if it doesn't exist"""
        try:
            # First try to get existing profile
            existing_profile = await self.get_profile(user_id)
            
            if existing_profile:
                return existing_profile
            
            # Profile doesn't exist, create a new one
            logger.info(f"Creating new profile for user {user_id}")
            
            # Prepare profile data for creation
            profile_create = {
                "id": user_id,
                "email": user_data.get("email"),
                "full_name": user_data.get("username") or user_data.get("email", "").split("@")[0],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
              # Create profile in profiles table
            result = self.supabase.table("avatara").insert(profile_create).execute()
            
            if result.data:
                # Return the newly created profile using get_profile to ensure consistency
                return await self.get_profile(user_id)
            else:
                # If creation failed, return basic profile data
                logger.warning(f"Failed to create profile in database for user {user_id}, returning basic data")
                return {
                    "id": user_id,
                    "email": user_data.get("email"),
                    "full_name": user_data.get("username") or user_data.get("email", "").split("@")[0],
                    "role": "innovator",
                    "bio": None,
                    "location": None,
                    "website": None,
                    "linkedin": None,
                    "twitter": None,
                    "expertise": [],
                    "company": None,
                    "avatar_url": None,
                    "is_active": True,
                    "is_blocked": False,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error in get_or_create_profile: {e}")
            # Return basic profile data as fallback
            return {
                "id": user_id,
                "email": user_data.get("email"),
                "full_name": user_data.get("username") or user_data.get("email", "").split("@")[0],
                "role": "innovator",
                "bio": None,
                "location": None,
                "website": None,
                "linkedin": None,
                "twitter": None,
                "expertise": [],
                "company": None,
                "avatar_url": None,
                "is_active": True,
                "is_blocked": False,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }

    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile with extended information"""
        try:
            # Get user from auth.users metadata
            user_result = self.supabase.auth.admin.get_user_by_id(user_id)
            
            if not user_result.user:
                return None

            # Get additional profile data from profiles table if it exists
            profile_result = self.supabase.table("avatara").select("*").eq("id", user_id).execute()
            
            profile_data = profile_result.data[0] if profile_result.data else {}
            
            # Combine auth user data with profile data
            user_metadata = user_result.user.user_metadata or {}
            
            return {
                "id": user_result.user.id,
                "email": user_result.user.email,
                "full_name": profile_data.get("full_name") or user_metadata.get("full_name"),
                "role": user_metadata.get("role", "innovator"),
                "bio": profile_data.get("bio"),
                "location": profile_data.get("location"),
                "website": profile_data.get("website"),
                "linkedin": profile_data.get("linkedin"),
                "twitter": profile_data.get("twitter"),
                "expertise": profile_data.get("expertise", []),
                "company": profile_data.get("company"),
                "avatar_url": profile_data.get("avatar_url"),
                "is_active": user_metadata.get("is_active", True),
                "is_blocked": user_metadata.get("is_blocked", False),
                "created_at": user_result.user.created_at,
                "updated_at": profile_data.get("updated_at", user_result.user.updated_at)
            }
            
        except Exception as e:
            logger.error(f"Error fetching profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch profile"
            )

    async def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        try:
            # Update user metadata in auth
            auth_metadata = {}
            if "full_name" in profile_data:
                auth_metadata["full_name"] = profile_data["full_name"]
            
            if auth_metadata:
                self.supabase.auth.admin.update_user_by_id(
                    user_id, 
                    {"user_metadata": auth_metadata}
                )

            # Prepare profile data for profiles table
            profile_update = {
                "id": user_id,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Add profile fields
            profile_fields = [
                "full_name", "bio", "location", "website", 
                "linkedin", "twitter", "expertise", "company", "avatar_url"
            ]
            
            for field in profile_fields:
                if field in profile_data:
                    profile_update[field] = profile_data[field]

            # Upsert profile data
            result = self.supabase.table("avatara").upsert(profile_update).execute()
            
            if result.data:
                # Return updated profile
                return await self.get_profile(user_id)
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to update profile"
                )
                
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )

    async def upload_avatar(self, user_id: str, avatar_url: str) -> bool:
        """Update user avatar URL"""
        try:
            result = self.supabase.table("avatara").upsert({
                "id": user_id,
                "avatar_url": avatar_url,
                "updated_at": datetime.utcnow().isoformat()
            }).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error updating avatar: {e}")
            return False

    async def get_profile_stats(self, user_id: str) -> Dict[str, Any]:
        """Get profile statistics"""
        try:            # Get ideas count
            ideas_result = self.supabase.table("idea-files").select("id", count="exact").eq("user_id", user_id).execute()
            ideas_count = ideas_result.count or 0
              # Get total views
            views_result = self.supabase.table("idea-files").select("views_count").eq("user_id", user_id).execute()
            total_views = sum(idea.get("views_count", 0) for idea in (views_result.data or []))
              # Get total interests
            interests_result = self.supabase.table("idea-files").select("interests_count").eq("user_id", user_id).execute()
            total_interests = sum(idea.get("interests_count", 0) for idea in (interests_result.data or []))
            
            # Get files count
            files_result = self.supabase.table("files").select("id", count="exact").eq("user_id", user_id).execute()
            files_count = files_result.count or 0
            
            return {
                "ideas_count": ideas_count,
                "total_views": total_views,
                "total_interests": total_interests,
                "files_count": files_count
            }
            
        except Exception as e:
            logger.error(f"Error getting profile stats: {e}")
            return {
                "ideas_count": 0,
                "total_views": 0,
                "total_interests": 0,
                "files_count": 0
            }

    async def search_profiles(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search user profiles"""
        try:
            result = self.supabase.table("avatara").select("*").or_(
                f"full_name.ilike.%{query}%,bio.ilike.%{query}%,company.ilike.%{query}%"
            ).limit(limit).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error searching profiles: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to search profiles"
            )

    async def get_user_activity(self, user_id: str) -> Dict[str, Any]:
        """Get user activity summary"""
        try:            # Get recent ideas
            recent_ideas = self.supabase.table("idea-files").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
            
            # Get recent files
            recent_files = self.supabase.table("files").select("*").eq("user_id", user_id).order("uploaded_at", desc=True).limit(5).execute()
            
            return {
                "recent_ideas": recent_ideas.data or [],
                "recent_files": recent_files.data or []
            }
            
        except Exception as e:
            logger.error(f"Error getting user activity: {e}")
            return {
                "recent_ideas": [],
                "recent_files": []
            }
