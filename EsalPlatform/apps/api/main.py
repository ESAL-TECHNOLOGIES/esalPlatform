"""
Main entry point for the ESAL Platform API.

This module initializes the FastAPI application with all necessary middleware,
routes, and startup/shutdown handlers.
"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import logging
from typing import Dict, Any, Callable, Optional

from prometheus_fastapi_instrumentator import Instrumentator
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from core.config import settings, get_settings
from core.logging import setup_logging
from core.exceptions import AppException, register_exception_handlers
from core.auth import get_current_user
from core.database import create_db_and_tables, get_session

# Import routes
from api.v1.router import api_router
from api.health import health_router

logger = logging.getLogger(__name__)

def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application
    """
    # Setup logging
    setup_logging()
    
    # Create FastAPI app with metadata
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="ESAL Platform API - A secure and observable API for the ESAL platform",
        version=settings.API_VERSION,
        docs_url="/api/docs" if settings.DEBUG else None,
        redoc_url="/api/redoc" if settings.DEBUG else None,
        openapi_url="/api/openapi.json" if settings.DEBUG else None,
    )
    
    # Configure middleware
    _setup_middleware(app)
    
    # Register exception handlers
    register_exception_handlers(app)
    
    # Include routers
    app.include_router(health_router, tags=["health"])
    app.include_router(api_router, prefix=f"/api/{settings.API_VERSION}")
    
    # Configure startup and shutdown events
    _setup_events(app)
    
    return app

def _setup_middleware(app: FastAPI) -> None:
    """
    Set up middleware for the application.
    
    Args:
        app: The FastAPI application
    """
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Request ID middleware
    @app.middleware("http")
    async def request_middleware(request: Request, call_next: Callable) -> Any:
        """Add request ID and timing to all requests."""
        request_id = request.headers.get("X-Request-ID", f"req-{time.time()}")
        # Set request ID in the request state for access in route handlers
        request.state.request_id = request_id
        
        # Log incoming request
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={"request_id": request_id},
        )
        
        # Measure request processing time
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Add headers to response
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        
        # Log response status
        logger.info(
            f"Response: {response.status_code} in {process_time:.4f}s",
            extra={"request_id": request_id},
        )
        
        return response
    
    # Add metrics instrumentation if enabled
    if settings.TELEMETRY_ENABLED:
        # Prometheus metrics
        Instrumentator().instrument(app).expose(app, include_in_schema=False)
        
        # OpenTelemetry instrumentation
        FastAPIInstrumentor.instrument_app(app)

def _setup_events(app: FastAPI) -> None:
    """
    Set up startup and shutdown events for the application.
    
    Args:
        app: The FastAPI application
    """
    @app.on_event("startup")
    async def startup_event() -> None:
        """Perform startup tasks."""
        logger.info(f"Starting {settings.PROJECT_NAME} API in {settings.ENVIRONMENT} mode")
        
        # Initialize database
        create_db_and_tables()

        logger.info("Application startup complete")
    
    @app.on_event("shutdown")
    async def shutdown_event() -> None:
        """Perform shutdown tasks."""
        logger.info("Application shutting down")

app = create_application()

if __name__ == "__main__":
    """Run the API server."""
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)