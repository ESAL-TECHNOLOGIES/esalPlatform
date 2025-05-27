"""
Main router for API v1 endpoints.
"""
from fastapi import APIRouter

# Import all endpoint routers
from api.v1.endpoints.auth import router as auth_router
from api.v1.endpoints.ai_enhanced import router as ai_router
from api.v1.endpoints.users_enhanced import router as users_router
from api.v1.endpoints.me import router as me_router
from api.v1.endpoints.admin import router as admin_router

# Create main API router
api_router = APIRouter()

# Include all endpoint routers with proper prefixes and tags
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(me_router, prefix="", tags=["User Profile"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Services"])
api_router.include_router(users_router, prefix="/users", tags=["User Management"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin Portal"])
