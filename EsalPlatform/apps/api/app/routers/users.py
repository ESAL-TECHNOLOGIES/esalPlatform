"""
User management router - Profile and account management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
import logging
from datetime import datetime

from app.schemas import (
    UserResponse, ChangePasswordRequest, NotificationPreferences, 
    UserSettings, UserDataExport
)
from app.utils.jwt import get_current_user
from app.services.auth_supabase import SupabaseAuthService
from app.services.supabase_profiles import SupabaseProfileService

router = APIRouter()
logger = logging.getLogger(__name__)


def get_auth_service():
    """Dependency to get auth service"""
    return SupabaseAuthService()


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: UserResponse = Depends(get_current_user),
    auth_service: SupabaseAuthService = Depends(get_auth_service)
):
    """Change user password"""
    try:
        success = await auth_service.change_password(
            request.current_password,
            request.new_password
        )
        
        if success:
            return {"message": "Password changed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to change password"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.put("/notifications")
async def update_notifications(
    notifications: NotificationPreferences,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update user notification preferences"""
    try:
        # Store notification preferences in user metadata
        auth_service = SupabaseAuthService()
        success = await auth_service.update_user_metadata(
            current_user.id,
            {"notification_preferences": notifications.dict()}
        )
        
        if success:
            return {
                "message": "Notification preferences updated successfully",
                "preferences": notifications.dict()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update notification preferences"
            )
    except Exception as e:
        logger.error(f"Error updating notifications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification preferences"
        )


@router.get("/notifications")
async def get_notifications(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user notification preferences"""
    try:
        auth_service = SupabaseAuthService()
        user_data = await auth_service.get_user_by_id(current_user.id)
        
        if user_data and "notification_preferences" in user_data:
            return user_data["notification_preferences"]
        else:
            # Return default preferences
            return NotificationPreferences().dict()
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get notification preferences"
        )


@router.put("/settings")
async def update_settings(
    settings: UserSettings,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update user settings"""
    try:
        auth_service = SupabaseAuthService()
        success = await auth_service.update_user_metadata(
            current_user.id,
            {"user_settings": settings.dict()}
        )
        
        if success:
            return {
                "message": "Settings updated successfully",
                "settings": settings.dict()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update settings"
            )
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update settings"
        )


@router.get("/settings")
async def get_settings(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user settings"""
    try:
        auth_service = SupabaseAuthService()
        user_data = await auth_service.get_user_by_id(current_user.id)
        
        if user_data and "user_settings" in user_data:
            return user_data["user_settings"]
        else:
            # Return default settings
            return UserSettings().dict()
    except Exception as e:
        logger.error(f"Error getting settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get settings"
        )


@router.get("/export")
async def export_user_data(
    current_user: UserResponse = Depends(get_current_user)
):
    """Export all user data"""
    try:
        auth_service = SupabaseAuthService()
        
        # Get user profile data
        user_data = await auth_service.get_user_by_id(current_user.id)
        
        # Get user ideas (if they exist)
        try:
            from app.services.supabase_ideas import SupabaseIdeasService
            ideas_service = SupabaseIdeasService()
            user_ideas = await ideas_service.get_user_ideas(current_user.id)
        except Exception:
            user_ideas = []
        
        # Get user profile from profile service
        try:
            profile_service = SupabaseProfileService()
            profile_data = await profile_service.get_profile(current_user.id)
        except Exception:
            profile_data = {}
        
        # Compile export data
        export_data = UserDataExport(
            profile=profile_data or {},
            ideas=[idea for idea in user_ideas] if user_ideas else [],
            activities=[],  # Could be expanded to include activity logs
            settings=user_data.get("user_settings", {}) if user_data else {},
            export_date=datetime.now().isoformat()
        )
        
        return export_data.dict()
        
    except Exception as e:
        logger.error(f"Error exporting user data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export user data"
        )


@router.delete("/delete-account")
async def delete_account(
    current_user: UserResponse = Depends(get_current_user),
    auth_service: SupabaseAuthService = Depends(get_auth_service)
):
    """Delete user account (soft delete)"""
    try:
        success = await auth_service.delete_user_account(current_user.id)
        
        if success:
            return {
                "message": "Account deletion initiated successfully",
                "note": "Your account has been marked for deletion and will be processed within 30 days"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete account"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
