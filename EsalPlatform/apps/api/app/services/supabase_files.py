"""
Supabase-based File Upload service
"""
from supabase import create_client, Client
from fastapi import HTTPException, status, UploadFile
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import uuid
import os
import mimetypes

from app.config import settings

logger = logging.getLogger(__name__)


class SupabaseFileService:
    def __init__(self):
        try:
            # Use service role key for file operations (bypasses RLS)
            service_key = getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
            if service_key:
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    service_key
                )
                logger.info("File service using service role key (bypasses RLS)")
            else:
                # Fallback to anon key if service role not available
                self.supabase: Client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
                logger.warning("File service using anon key - may have RLS issues")
        except Exception as e:            
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="File service is not available"
            )

    async def upload_file(
        self, 
        user_id: str, 
        file: UploadFile, 
        bucket_name: str = "uploads",
        folder: str = "ideas",
        idea_id: Optional[int] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a file to Supabase Storage"""
        try:
            # Validate file
            if not file.filename:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No filename provided"
                )

            # Check file size (10MB limit)
            file_content = await file.read()
            file_size = len(file_content)
            if file_size > 10 * 1024 * 1024:  # 10MB
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail="File size exceeds 10MB limit"
                )

            # Reset file pointer
            await file.seek(0)

            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = f"{folder}/{user_id}/{unique_filename}"

            # Get content type
            content_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

            # Upload to Supabase Storage
            result = self.supabase.storage.from_(bucket_name).upload(
                file_path,
                file_content,
                file_options={
                    "content-type": content_type,
                    "cache-control": "3600"
                }
            )

            if hasattr(result, 'error') and result.error:
                logger.error(f"Supabase storage error: {result.error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to upload file to storage"
                )            # Get public URL (for convenience, not stored in DB)
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)
            
            # Save file metadata to database (matching actual schema)
            file_record = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "filename": file.filename,
                "original_filename": file.filename,
                "file_path": file_path,
                "file_size": file_size,
                "content_type": content_type,
                "created_at": datetime.utcnow().isoformat()
            }
              # Add optional fields if provided
            if idea_id is not None:
                file_record["idea_id"] = idea_id
            if description is not None:
                file_record["description"] = description

            # Insert into files table
            db_result = self.supabase.table("files").insert(file_record).execute()

            if db_result.data:
                # Enhance with public URL before returning
                enhanced_file = await self.enhance_file_with_url(db_result.data[0], bucket_name)
                return enhanced_file
            else:
                # If database insert fails, cleanup storage
                self.supabase.storage.from_(bucket_name).remove([file_path])
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save file metadata"
                )

        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload file"
            )    
        async def get_user_files(self, user_id: str) -> List[Dict[str, Any]]:
            """Get all files uploaded by a user"""
        try:
            result = self.supabase.table("files").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            files = result.data or []
            # Enhance files with public URLs
            return await self.enhance_files_with_urls(files)
            
        except Exception as e:
            logger.error(f"Error fetching user files: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch files"
            )    
        async def get_file_by_id(self, file_id: str, user_id: str) -> Optional[Dict[str, Any]]:
            """Get a specific file by ID (only if user owns it)"""
        try:
            result = self.supabase.table("files").select("*").eq("id", file_id).eq("user_id", user_id).execute()
            
            if result.data:
                # Enhance with public URL
                enhanced_file = await self.enhance_file_with_url(result.data[0])
                return enhanced_file
            return None
            
        except Exception as e:
            logger.error(f"Error fetching file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch file"
            )
        async def delete_file(self, file_id: str, user_id: str, bucket_name: str = "uploads") -> bool:
            """Delete a file and its metadata"""
        try:
            # Get file info first
            file_info = await self.get_file_by_id(file_id, user_id)
            if not file_info:
                return False

            # Delete from storage using the file_path
            storage_result = self.supabase.storage.from_(bucket_name).remove([file_info["file_path"]])
            
            # Delete from database
            db_result = self.supabase.table("files").delete().eq("id", file_id).eq("user_id", user_id).execute()
            
            return len(db_result.data) > 0
            
        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete file"
            )    
        async def associate_file_with_idea(self, file_id: str, idea_id: str, user_id: str) -> bool:
            """Associate a file with an idea"""
        try:
            # Verify the user owns both the file and the idea
            file_info = await self.get_file_by_id(file_id, user_id)
            if not file_info:
                return False

            # Update file record to include idea_id
            result = self.supabase.table("files").update({
                "idea_id": idea_id
            }).eq("id", file_id).eq("user_id", user_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error associating file with idea: {e}")
            return False

        async def get_idea_files(self, idea_id: str, user_id: str) -> List[Dict[str, Any]]:
            """Get all files associated with an idea"""
            try:
                result = self.supabase.table("files").select("*").eq("idea_id", idea_id).eq("user_id", user_id).execute()
                files = result.data or []
                # Enhance files with public URLs
                return await self.enhance_files_with_urls(files)

            except Exception as e:
                logger.error(f"Error fetching idea files: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to fetch idea files"
                )

        async def get_file_url(self, file_path: str, bucket_name: str = "uploads") -> str:
            """Get public URL for a file"""
            try:
                return self.supabase.storage.from_(bucket_name).get_public_url(file_path)
            except Exception as e:
                logger.error(f"Error getting file URL: {e}")
                return ""

    async def enhance_file_with_url(self, file_record: Dict[str, Any], bucket_name: str = "uploads") -> Dict[str, Any]:
        """Add public_url to file record"""
        if file_record and "file_path" in file_record:
            file_record["public_url"] = await self.get_file_url(file_record["file_path"], bucket_name)
        return file_record

    async def enhance_files_with_urls(self, files: List[Dict[str, Any]], bucket_name: str = "uploads") -> List[Dict[str, Any]]:
        """Add public_urls to list of file records"""
        enhanced_files = []
        for file_record in files:
            enhanced_file = await self.enhance_file_with_url(file_record, bucket_name)
            enhanced_files.append(enhanced_file)
        return enhanced_files
