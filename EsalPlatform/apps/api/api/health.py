"""
Health check endpoints for monitoring the API.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any

from sqlalchemy.orm import Session
from core.database import get_session
from core.config import settings

health_router = APIRouter(tags=["health"])


@health_router.get("/health", summary="Health check")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.
    
    Returns basic information about the API and its status.
    """
    return {
        "status": "ok",
        "name": settings.PROJECT_NAME,
        "version": settings.API_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@health_router.get("/health/db", summary="Database health check")
async def db_health_check(db: Session = Depends(get_session)) -> Dict[str, Any]:
    """
    Database health check endpoint.
    
    Verifies the database connection is working.
    """
    try:
        # Execute a simple query to verify database connection
        db.execute("SELECT 1")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "database": "disconnected", "message": str(e)},
        )
