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
            self.supabase: Client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY
            )
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
        folder: str = "ideas"
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
                )

            # Get public URL
            public_url = self.supabase.storage.from_(bucket_name).get_public_url(file_path)

            # Save file metadata to database
            file_record = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "filename": file.filename,
                "original_filename": file.filename,
                "file_path": file_path,
                "file_size": file_size,
                "content_type": content_type,
                "public_url": public_url,
                "bucket_name": bucket_name,
                "uploaded_at": datetime.utcnow().isoformat()
            }

            # Insert into files table
            db_result = self.supabase.table("files").insert(file_record).execute()

            if db_result.data:
                return db_result.data[0]
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
            result = self.supabase.table("files").select("*").eq("user_id", user_id).order("uploaded_at", desc=True).execute()
            return result.data or []
            
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
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error fetching file: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch file"
            )

    async def delete_file(self, file_id: str, user_id: str) -> bool:
        """Delete a file and its metadata"""
        try:
            # Get file info first
            file_info = await self.get_file_by_id(file_id, user_id)
            if not file_info:
                return False

            # Delete from storage
            storage_result = self.supabase.storage.from_(file_info["bucket_name"]).remove([file_info["file_path"]])
            
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
                "idea_id": idea_id,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", file_id).eq("user_id", user_id).execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"Error associating file with idea: {e}")
            return False

    async def get_idea_files(self, idea_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all files associated with an idea"""
        try:
            result = self.supabase.table("files").select("*").eq("idea_id", idea_id).eq("user_id", user_id).execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Error fetching idea files: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to fetch idea files"
            )
