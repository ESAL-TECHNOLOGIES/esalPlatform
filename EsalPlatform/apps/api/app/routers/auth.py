"""
Authentication router and endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import HTTPBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth import AuthService
from app.utils.jwt import get_current_user

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=TokenResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    auth_service = AuthService(db)
    
    try:
        result = await auth_service.signup(user_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user - OAuth2 compatible"""
    auth_service = AuthService(db)
    
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
async def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user with JSON payload"""
    auth_service = AuthService(db)
    
    try:
        result = await auth_service.login(credentials)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current user information"""
    return current_user
