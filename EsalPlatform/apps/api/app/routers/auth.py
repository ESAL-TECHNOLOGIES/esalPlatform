"""
Authentication router and endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import HTTPBearer, OAuth2PasswordRequestForm

from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse, EmailVerificationRequest, VerifyCodeRequest, VerificationResponse
from app.services.auth_supabase import SupabaseAuthService
from app.utils.jwt import get_current_user
from pydantic import BaseModel

router = APIRouter()
security = HTTPBearer()


class ResendConfirmationRequest(BaseModel):
    email: str


def get_auth_service():
    """Dependency to get auth service"""
    return SupabaseAuthService()


@router.post("/register")
async def signup(user_data: UserCreate, auth_service: SupabaseAuthService = Depends(get_auth_service)):
    """Register a new user"""    
    # Basic validation
    if not user_data.email or not user_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    if user_data.role not in ["innovator", "investor", "hub", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be one of: innovator, investor, hub, admin"
        )
    
    try:
        result = await auth_service.signup(user_data)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), auth_service: SupabaseAuthService = Depends(get_auth_service)):
    """Login user - OAuth2 compatible"""
    
    # Convert form data to UserLogin schema
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    
    try:
        result = await auth_service.login(credentials)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


# Alternative JSON login endpoint
@router.post("/login-json", response_model=TokenResponse)
async def login_json(credentials: UserLogin, auth_service: SupabaseAuthService = Depends(get_auth_service)):
    """Login user with JSON payload"""
    
    try:
        result = await auth_service.login(credentials)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(
    request: VerifyCodeRequest, 
    auth_service: SupabaseAuthService = Depends(get_auth_service)
):
    """Verify email with 6-digit code"""
    try:
        result = await auth_service.verify_email_code(request.user_id, request.code)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Verification failed: {str(e)}"
        )


@router.post("/resend-verification", response_model=VerificationResponse)
async def resend_verification(
    request: EmailVerificationRequest,
    auth_service: SupabaseAuthService = Depends(get_auth_service)
):
    """Resend verification code to email"""
    try:
        result = await auth_service.resend_verification_code(request.email)
        return VerificationResponse(
            message=result["message"],
            requires_verification=True,
            user_id=result.get("user_id")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to resend verification: {str(e)}"
        )
