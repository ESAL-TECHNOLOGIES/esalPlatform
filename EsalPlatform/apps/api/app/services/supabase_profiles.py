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
    def __init__(self, user_token: Optional[str] = None):
        try:
            # Create client with service role key as primary (bypasses RLS)
            service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
            if service_key:
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    service_key
                )
                logger.info("Primary client created with service role key (bypasses RLS)")
                # Also create service client reference for clarity
                self.service_supabase: Client = self.supabase
            else:
                # Fallback to anon key if service role not available
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                self.service_supabase = None
                logger.warning("No service role key available - using anon key (may have RLS issues)")
            
            # Store user_id for RLS operations (extracted from JWT payload if needed)
            self.user_id = None
            if user_token:
                try:
                    # Try to extract user_id from custom JWT token
                    from app.utils.jwt import verify_token
                    payload = verify_token(user_token)
                    self.user_id = payload.get("sub")
                    logger.info(f"Extracted user_id from token: {self.user_id}")
                except Exception as token_error:
                    logger.warning(f"Could not extract user_id from token: {token_error}")
                    
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
            
            # Profile doesn't exist, create a new one            logger.info(f"Creating new profile for user {user_id}")            # Prepare profile data for creation (using profiles table schema)
            profile_create = {
                "id": user_id,  # Use 'id' for profiles table primary key
                "username": user_data.get("username") or user_data.get("email", "").split("@")[0],
                "full_name": user_data.get("full_name") or user_data.get("email", "").split("@")[0],
                "bio": None,
                "location": None,
                "company": None,
                "position": None,
                "skills": [],
                "interests": [],
                "website_url": None,
                "linkedin_url": None,
                "twitter_url": None,
                "github_url": None,
                "phone": None,
                "avatar_url": None,
                "experience_years": 0,
                "education": None,
                "total_ideas": 0,
                "total_views": 0,
                "total_interests": 0
            }# Create profile in profiles table (service role bypasses RLS)
            result = self.supabase.table("profiles").insert(profile_create).execute()
            logger.info(f"Created profile for user {user_id}")
            
            if result.data:
                # Return the newly created profile using get_profile to ensure consistency
                return await self.get_profile(user_id)
            else:                # If creation failed, return basic profile data
                logger.warning(f"Failed to create profile in database for user {user_id}, returning basic data")
                return {
                    "id": user_id,
                    "email": user_data.get("email"),
                    "full_name": user_data.get("full_name") or user_data.get("email", "").split("@")[0],
                    "username": user_data.get("username") or user_data.get("email", "").split("@")[0],
                    "role": "innovator",
                    "bio": None,
                    "location": None,
                    "company": None,
                    "position": None,
                    "website_url": None,
                    "linkedin_url": None,
                    "twitter_url": None,
                    "github_url": None,
                    "phone": None,
                    "skills": [],
                    "interests": [],
                    "experience_years": 0,
                    "education": None,
                    "avatar_url": None,
                    "total_ideas": 0,
                    "total_views": 0,
                    "total_interests": 0,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error in get_or_create_profile: {e}")            # Return basic profile data as fallback
            return {
                "id": user_id,
                "email": user_data.get("email"),
                "full_name": user_data.get("full_name") or user_data.get("email", "").split("@")[0],
                "username": user_data.get("username") or user_data.get("email", "").split("@")[0],
                "role": "innovator",
                "bio": None,
                "location": None,
                "company": None,
                "position": None,
                "website_url": None,
                "linkedin_url": None,
                "twitter_url": None,
                "github_url": None,
                "phone": None,
                "skills": [],
                "interests": [],
                "experience_years": 0,
                "education": None,
                "avatar_url": None,
                "total_ideas": 0,
                "total_views": 0,
                "total_interests": 0,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }

    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile with extended information"""
        try:
            # Get profile data from profiles table
            profile_result = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
            
            if not profile_result.data:
                return None
                
            profile_data = profile_result.data[0]
            return {
                "id": profile_data.get("id"),  # Use id as the main id
                "username": profile_data.get("username"),
                "full_name": profile_data.get("full_name"),
                "bio": profile_data.get("bio"),
                "location": profile_data.get("location"),
                "company": profile_data.get("company"),
                "position": profile_data.get("position"),
                "skills": profile_data.get("skills", []),
                "interests": profile_data.get("interests", []),
                "website_url": profile_data.get("website_url"),
                "linkedin_url": profile_data.get("linkedin_url"),
                "twitter_url": profile_data.get("twitter_url"),
                "github_url": profile_data.get("github_url"),
                "phone": profile_data.get("phone"),
                "avatar_url": profile_data.get("avatar_url"),
                "experience_years": profile_data.get("experience_years", 0),
                "education": profile_data.get("education"),
                "total_ideas": profile_data.get("total_ideas", 0),                "total_views": profile_data.get("total_views", 0),                "total_interests": profile_data.get("total_interests", 0),
                "created_at": profile_data.get("created_at"),
                "updated_at": profile_data.get("updated_at")
            }
            
        except Exception as e:
            logger.error(f"Error fetching profile: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch profile"
            )
                        
    async def update_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        try:            # Prepare profile data for profiles table
            profile_update = {
                "id": user_id,  # Use 'id' for profiles table primary key
                "updated_at": datetime.utcnow().isoformat()
            }

            # Define field mappings from frontend to database (profiles table fields)
            field_mappings = {
                "username": "username",
                "full_name": "full_name",
                "bio": "bio",
                "location": "location",
                "company": "company",
                "position": "position",
                "skills": "skills",
                "interests": "interests",
                "website_url": "website_url",
                "linkedin_url": "linkedin_url", 
                "twitter_url": "twitter_url",
                "github_url": "github_url",
                "phone": "phone",
                "avatar_url": "avatar_url",
                "experience_years": "experience_years",
                "education": "education"
            }
            
            # Add profile fields that exist in the input data
            for frontend_field, db_field in field_mappings.items():
                if frontend_field in profile_data:
                    profile_update[db_field] = profile_data[frontend_field]
            
            # NOTE: is_active and is_blocked are stored in Supabase user metadata, not in profiles table
            logger.info(f"Updating profile for user {user_id}")
            
            # Upsert profile data in the profiles table (service role bypasses RLS)
            result = self.supabase.table("profiles").upsert(profile_update).execute()
            logger.info(f"Profile update completed for user {user_id}")
            
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
    async def upload_avatar(self, user_id: str, file_content: bytes, filename: str) -> str:
        """Upload user avatar file and update profile"""
        try:
            import uuid
            import os
            import mimetypes
            
            # Validate file size (max 5MB)
            if len(file_content) > 5 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="Avatar file size exceeds 5MB limit"
                )
            
            # Generate unique filename for avatar with user folder structure
            file_extension = os.path.splitext(filename)[1] if filename else '.jpg'
            unique_filename = f"avatar_{uuid.uuid4()}{file_extension}"
            # Store in user-specific folder: avatars/user_id/filename
            file_path = f"{user_id}/{unique_filename}"
            
            # Get content type
            content_type = mimetypes.guess_type(filename)[0] if filename else "image/jpeg"
            if not content_type or not content_type.startswith("image/"):
                content_type = "image/jpeg"
            
            # Upload to Supabase Storage avatars bucket
            upload_result = self.supabase.storage.from_("avatars").upload(
                file_path,
                file_content,
                file_options={
                    "content-type": content_type,
                    "cache-control": "3600",
                    "upsert": "true"  # Allow overwriting
                }
            )
            
            if hasattr(upload_result, 'error') and upload_result.error:
                logger.error(f"Supabase storage error: {upload_result.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload avatar to storage: {upload_result.error}"
                )
            
            # Get public URL for the uploaded avatar
            avatar_url = self.supabase.storage.from_("avatars").get_public_url(file_path)              # Update profile with new avatar URL (service role bypasses RLS)
            result = self.supabase.table("profiles").upsert({
                "id": user_id,  # Use 'id' instead of 'user_id' for profiles table
                "avatar_url": avatar_url,
                "updated_at": datetime.utcnow().isoformat()
            }).execute()
            logger.info(f"Updated profile avatar for user {user_id}")
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update profile with avatar URL"
                )
            
            logger.info(f"Avatar uploaded successfully for user {user_id}: {avatar_url}")
            return avatar_url
            
        except Exception as e:
            logger.error(f"Error uploading avatar: {e}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload avatar: {str(e)}"
            )

    async def get_profile_stats(self, user_id: str) -> Dict[str, Any]:
        """Get profile statistics"""
        try:
            # Get ideas count
            ideas_result = self.supabase.table("ideas").select("id", count="exact").eq("user_id", user_id).execute()
            ideas_count = ideas_result.count or 0
            
            # Get total views
            views_result = self.supabase.table("ideas").select("view_count").eq("user_id", user_id).execute()
            total_views = sum(idea.get("view_count", 0) for idea in (views_result.data or []))
            
            # Get total interests
            interests_result = self.supabase.table("ideas").select("interest_count").eq("user_id", user_id).execute()
            total_interests = sum(idea.get("interest_count", 0) for idea in (interests_result.data or []))
            
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
            result = self.supabase.table("profiles").select("*").or_(
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
        try:
            # Get recent ideas
            recent_ideas = self.supabase.table("ideas").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
            
            # Get recent files
            recent_files = self.supabase.table("files").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
            
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
