"""
ESAL Platform Backend - FastAPI Application Entry Point
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import sys

from app.database import create_tables
from app.routers import auth, innovator, hub, investor, admin, ideas, users, contact
from app.config import settings

# Configure logging based on environment
if settings.DEBUG:
    logging.basicConfig(level=logging.INFO)
else:
    logging.basicConfig(
        level=logging.WARNING,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting ESAL Platform API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Is Production: {settings.is_production}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    logger.info(f"CORS Origins: {settings.ALLOWED_ORIGINS}")
    logger.info(f"CORS Origins Type: {type(settings.ALLOWED_ORIGINS)}")
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
else:
    # Production trusted hosts
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "*.onrender.com",  # All Render domains
            "localhost",  # Keep for health checks
            "127.0.0.1",  # Local IP
        ]
    )

# CORS middleware - Configure before other middleware
def is_allowed_origin(origin: str) -> bool:
    """Check if origin is allowed, supporting wildcard patterns"""
    if not origin:
        return False
    
    allowed_origins = settings.ALLOWED_ORIGINS
    
    # If in development mode, allow all
    if not settings.is_production:
        return True
    
    # Check exact matches first
    if origin in allowed_origins:
        return True
    
    # Check wildcard patterns
    for allowed in allowed_origins:
        if allowed.startswith("https://*."):
            domain = allowed.replace("https://*.", "")
            if origin.endswith(f".{domain}") or origin == f"https://{domain}":
                return True
        elif allowed.startswith("http://*."):
            domain = allowed.replace("http://*.", "")
            if origin.endswith(f".{domain}") or origin == f"http://{domain}":
                return True
    
    return False

# CORS configuration with proper origin list
if settings.is_production:
    # Use specific allowed origins from settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-CSRF-Token"],
        expose_headers=["*"],
        max_age=3600,
    )
else:
    # In development, allow all origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "X-CSRF-Token"],
        expose_headers=["*"],
        max_age=3600,
    )

# Include routers with consistent API versioning
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(innovator.router, prefix="/api/v1/innovator", tags=["Innovator"])
app.include_router(hub.router, prefix="/api/v1/hub", tags=["Hub"])
app.include_router(investor.router, prefix="/api/v1/investor", tags=["Investor"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(ideas.router, prefix="/api/v1/ideas", tags=["Ideas"])
app.include_router(users.router, prefix="/api/v1/users", tags=["User Management"])
app.include_router(contact.router, prefix="/api/v1/contact", tags=["Contact"])


@app.options("/{path:path}")
async def options_handler(path: str, request: Request):
    """Handle CORS preflight requests manually"""
    origin = request.headers.get("origin")
    response = Response()
    
    # Log CORS preflight request for debugging
    logger.info(f"CORS preflight request - Origin: {origin}, Path: {path}")
    
    # Use settings for allowed origins
    allowed_origins = settings.ALLOWED_ORIGINS
    logger.info(f"Configured allowed origins: {allowed_origins}")
    
    # Always allow requests from configured origins
    if origin and origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        logger.info(f"CORS: Allowed origin {origin}")
    elif not settings.is_production:
        # In development, allow all
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        logger.info(f"CORS: Development mode - allowing origin {origin}")
    else:
        # Production: Be more permissive for Render domains
        if origin and (origin.endswith(".onrender.com") or origin.endswith(".vercel.app")):
            response.headers["Access-Control-Allow-Origin"] = origin
            logger.info(f"CORS: Allowed Render/Vercel origin {origin}")
        else:
            logger.warning(f"CORS: Origin {origin} not allowed")
            # Don't set Access-Control-Allow-Origin if not allowed
    
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, Origin, X-Requested-With, X-CSRF-Token"
    response.headers["Access-Control-Max-Age"] = "3600"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "ESAL Innovation Platform API",
        "status": "running",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "cors_origins": settings.ALLOWED_ORIGINS if settings.DEBUG else ["*** HIDDEN IN PRODUCTION ***"]
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
    """Debug CORS requests - Only in debug mode"""
    if settings.DEBUG:
        origin = request.headers.get("origin")
        method = request.method
        path = request.url.path
        
        logger.info(f"Request: {method} {path} from origin: {origin}")
        
        response = await call_next(request)
        
        logger.info(f"Response status: {response.status_code}")
        
        return response
    else:
        # In production, just pass through without logging
        return await call_next(request)


@app.get("/api/debug/cors")
async def debug_cors():
    """Debug endpoint to check CORS configuration"""
    return {
        "environment": settings.ENVIRONMENT,
        "is_production": settings.is_production,
        "debug": settings.DEBUG,
        "allowed_origins": settings.ALLOWED_ORIGINS,
        "cors_configured": True
    }
