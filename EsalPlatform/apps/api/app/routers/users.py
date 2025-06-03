"""
User management router - Profile and account management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
import logging
from datetime import datetime

from app.schemas import (
    UserResponse, NotificationSettings, UserSettings, UserDataExport
)
from app.schemas import (
    ChangePasswordRequest, Enable2FARequest, Verify2FARequest, SessionInfo
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
        # Validate password confirmation
        if request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password and confirmation do not match"
            )
        
        # Validate password strength
        if len(request.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        success = await auth_service.change_password(
            current_user.id,
            request.current_password,
            request.new_password
        )
        
        if success:
            return {"message": "Password changed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
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
    notifications: NotificationSettings,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update user notification preferences"""
    try:
        # Store notification preferences in user metadata
        auth_service = SupabaseAuthService()        
        success = await auth_service.update_user_metadata(
            current_user.id,
            {"notification_preferences": notifications.model_dump()}
        )
        
        if success:
            return {
                "message": "Notification preferences updated successfully",
                "preferences": notifications.model_dump()
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
            return NotificationSettings().model_dump()
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
            {"user_settings": settings.model_dump()}
        )
        
        if success:
            return {
                "message": "Settings updated successfully",
                "settings": settings.model_dump()
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
            return UserSettings().model_dump()
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
    """Export all user data as a ZIP file"""
    import zipfile
    import json
    import io
    import tempfile
    from fastapi.responses import StreamingResponse
    
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
        
        # Get user files (if they exist)
        try:
            from app.services.supabase_files import SupabaseFileService
            file_service = SupabaseFileService()
            user_files = await file_service.get_user_files(current_user.id)
        except Exception:
            user_files = []
        
        # Compile export data
        export_data = UserDataExport(
            profile=profile_data or {},
            ideas=[idea for idea in user_ideas] if user_ideas else [],
            activities=[],  # Could be expanded to include activity logs
            settings=user_data.get("user_settings", {}) if user_data else {},
            export_date=datetime.now().isoformat()
        )
        
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add main data export as JSON
            zip_file.writestr(
                'user_data.json',
                json.dumps(export_data.model_dump(), indent=2, ensure_ascii=False)
            )
            
            # Add profile data as separate JSON
            if profile_data:
                zip_file.writestr(
                    'profile.json',
                    json.dumps(profile_data, indent=2, ensure_ascii=False)
                )
            
            # Add ideas data as separate JSON
            if user_ideas:
                zip_file.writestr(
                    'ideas.json',
                    json.dumps(user_ideas, indent=2, ensure_ascii=False)
                )
            
            # Add file list information
            if user_files:
                file_info = []
                for file in user_files:
                    file_info.append({
                        'filename': file.get('filename'),
                        'file_type': file.get('file_type'),
                        'file_size': file.get('file_size'),
                        'upload_date': file.get('upload_date'),
                        'download_url': file.get('download_url'),
                        'note': 'Original files stored in Supabase storage - URLs provided above'
                    })
                
                zip_file.writestr(
                    'files_list.json',
                    json.dumps(file_info, indent=2, ensure_ascii=False)
                )
            
            # Add readme file with export information
            readme_content = f"""# Your ESAL Platform Data Export

Export Date: {datetime.now().isoformat()}
User ID: {current_user.id}
User Email: {current_user.email}

## Files in this archive:

- user_data.json: Complete export data in structured format
- profile.json: Your profile information
- ideas.json: All your submitted ideas
- files_list.json: List of your uploaded files with download URLs

## File Downloads:
Your uploaded files are stored securely in our cloud storage. The files_list.json 
contains direct download URLs for all your files. These URLs are valid and can be 
used to download your original files.

## Data Format:
All data is exported in JSON format for easy parsing and compatibility with 
various data processing tools.

## Support:
If you have any questions about this export, please contact our support team.

---
ESAL Platform Data Export
Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
            zip_file.writestr('README.txt', readme_content)
        
        zip_buffer.seek(0)
        
        # Generate filename with user ID and timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"esal_data_export_{current_user.id}_{timestamp}.zip"
        
        # Return ZIP file as download
        return StreamingResponse(
            io.BytesIO(zip_buffer.read()),
            media_type='application/zip',
            headers={'Content-Disposition': f'attachment; filename="{filename}"'}
        )
        
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


@router.post("/enable-2fa")
async def enable_2fa(
    request: Enable2FARequest,
    current_user: UserResponse = Depends(get_current_user),
    auth_service: SupabaseAuthService = Depends(get_auth_service)
):
    """Enable two-factor authentication for user"""
    try:
        # Verify password first
        is_valid = await auth_service.verify_password(current_user.id, request.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )
        
        # Generate 2FA secret (placeholder - would use a proper 2FA library in production)
        import secrets
        secret = secrets.token_hex(16)
        
        # Store 2FA settings in user metadata
        success = await auth_service.update_user_metadata(
            current_user.id,
            {
                "two_factor_enabled": True,
                "two_factor_secret": secret,
                "two_factor_backup_codes": [secrets.token_hex(4) for _ in range(8)]
            }
        )
        
        if success:
            return {
                "message": "2FA enabled successfully",
                "secret": secret,
                "qr_code_url": f"otpauth://totp/ESAL:{current_user.email}?secret={secret}&issuer=ESAL",
                "backup_codes": [secrets.token_hex(4) for _ in range(8)]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to enable 2FA"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enabling 2FA: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enable 2FA"
        )


@router.post("/disable-2fa")
async def disable_2fa(
    current_user: UserResponse = Depends(get_current_user),
    auth_service: SupabaseAuthService = Depends(get_auth_service)
):
    """Disable two-factor authentication for user"""
    try:
        success = await auth_service.update_user_metadata(
            current_user.id,
            {
                "two_factor_enabled": False,
                "two_factor_secret": None,
                "two_factor_backup_codes": None
            }
        )
        
        if success:
            return {"message": "2FA disabled successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to disable 2FA"
            )
    except Exception as e:
        logger.error(f"Error disabling 2FA: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to disable 2FA"
        )


@router.get("/sessions")
async def get_user_sessions(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user's active sessions"""
    try:
        # Mock session data - in production this would come from a session store
        from datetime import datetime, timedelta
        import platform
        import socket
        
        sessions = [
            SessionInfo(
                device="Current Device",
                browser="Chrome 91.0",
                ip_address="192.168.1.100",
                location="Local Network",
                last_active=datetime.now(),
                is_current=True
            ),
            SessionInfo(
                device="Mobile Device",
                browser="Safari 14.0",
                ip_address="192.168.1.101",
                location="Local Network", 
                last_active=datetime.now() - timedelta(hours=2),
                is_current=False
            )
        ]
        
        return {"sessions": [session.model_dump() for session in sessions]}
    except Exception as e:
        logger.error(f"Error getting sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user sessions"
        )


@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Revoke a specific user session"""
    try:
        # Mock implementation - in production would revoke actual session
        logger.info(f"Revoking session {session_id} for user {current_user.id}")
        
        return {"message": f"Session {session_id} revoked successfully"}
    except Exception as e:
        logger.error(f"Error revoking session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke session"
        )


@router.get("/security-info") 
async def get_security_info(
    current_user: UserResponse = Depends(get_current_user),
    auth_service: SupabaseAuthService = Depends(get_auth_service)
):
    """Get user's security information"""
    try:
        user_data = await auth_service.get_user_by_id(current_user.id)
        
        security_info = {
            "two_factor_enabled": user_data.get("two_factor_enabled", False) if user_data else False,
            "last_password_change": user_data.get("last_password_change") if user_data else None,
            "account_created": current_user.created_at,
            "login_notifications": user_data.get("login_notifications", True) if user_data else True,
            "active_sessions_count": 2  # Mock data
        }
        
        return security_info
    except Exception as e:
        logger.error(f"Error getting security info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get security information"
        )
