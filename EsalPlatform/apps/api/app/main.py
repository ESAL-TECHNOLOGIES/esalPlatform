"""
ESAL Platform Backend - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import create_tables
from app.routers import auth, innovator, hub, investor, admin
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    create_tables()
    yield
    # Shutdown
    pass


# Initialize FastAPI app
app = FastAPI(
    title="ESAL Innovation Platform API",
    description="Innovation matchmaking platform for Innovators, Hubs, Investors, and Admins",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(innovator.router, prefix="/innovator", tags=["Innovator"])
app.include_router(hub.router, prefix="/hub", tags=["Hub"])
app.include_router(investor.router, prefix="/investor", tags=["Investor"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "ESAL Innovation Platform API",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
