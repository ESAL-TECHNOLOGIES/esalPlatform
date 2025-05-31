"""
ESAL Platform Backend - Supabase-only FastAPI Application
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.routers import auth_supabase as auth, innovator, hub, investor, admin
from app.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting ESAL Platform API (Supabase-only mode)...")
    logger.info(f"CORS Origins: {settings.ALLOWED_ORIGINS}")
    logger.info(f"Supabase URL: {settings.SUPABASE_URL}")
    logger.info("No local database initialization required - using Supabase")
    yield
    # Shutdown
    logger.info("Shutting down ESAL Platform API...")


# Initialize FastAPI app
app = FastAPI(
    title="ESAL Innovation Platform API",
    description="Innovation matchmaking platform for Innovators, Hubs, Investors, and Admins (Supabase-powered)",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Trust localhost for development
if settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=["*"]
    )

# CORS middleware - Configure before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "supabase",
        "message": "ESAL Platform API is running with Supabase"
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to ESAL Innovation Platform API",
        "version": "1.0.0",
        "database": "supabase",
        "docs_url": "/api/docs",
        "endpoints": {
            "authentication": "/api/auth",
            "innovator": "/api/innovator",
            "hub": "/api/hub", 
            "investor": "/api/investor",
            "admin": "/api/admin"
        }
    }


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(innovator.router, prefix="/api/innovator", tags=["Innovator"])
app.include_router(hub.router, prefix="/api/hub", tags=["Hub"])
app.include_router(investor.router, prefix="/api/investor", tags=["Investor"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


# Request logging middleware (optional)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for debugging"""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    
    # Process request
    response = await call_next(request)
    
    # Log response time
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
    
    return response


if __name__ == "__main__":
    import uvicorn
    import time
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
