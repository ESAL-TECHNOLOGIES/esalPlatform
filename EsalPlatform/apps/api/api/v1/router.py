"""
Main router for API v1 endpoints.
"""
from fastapi import APIRouter

# Import all endpoint routers
from api.v1.endpoints.ai import router as ai_router
from api.v1.endpoints.users import router as users_router

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(ai_router, prefix="/ai", tags=["AI"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
