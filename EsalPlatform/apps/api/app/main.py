"""
ESAL Platform Backend - FastAPI Application Entry Point
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.database import create_tables
from app.routers import auth, innovator, hub, investor, admin
from app.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting ESAL Platform API...")
    logger.info(f"CORS Origins: {settings.ALLOWED_ORIGINS}")
    create_tables()
    yield
    # Shutdown
    logger.info("Shutting down ESAL Platform API...")
    pass


# Initialize FastAPI app
app = FastAPI(
    title="ESAL Innovation Platform API",
    description="Innovation matchmaking platform for Innovators, Hubs, Investors, and Admins",
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
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers with consistent API versioning
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(innovator.router, prefix="/api/v1/innovator", tags=["Innovator"])
app.include_router(hub.router, prefix="/api/v1/hub", tags=["Hub"])
app.include_router(investor.router, prefix="/api/v1/investor", tags=["Investor"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "ESAL Innovation Platform API",
        "status": "running",
        "version": "1.0.0",
        "cors_origins": settings.ALLOWED_ORIGINS
    }


@app.get("/api/health")
async def api_health_check():
    """API health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.middleware("http")
async def cors_debug_middleware(request: Request, call_next):
    """Debug CORS requests"""
    origin = request.headers.get("origin")
    method = request.method
    path = request.url.path
    
    logger.info(f"Request: {method} {path} from origin: {origin}")
    
    response = await call_next(request)
    
    logger.info(f"Response status: {response.status_code}")
    
    return response
