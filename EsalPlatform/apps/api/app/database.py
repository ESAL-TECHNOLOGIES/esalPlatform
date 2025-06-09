"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize database components only if using local database
engine = None
SessionLocal = None

if settings.USE_LOCAL_DB and settings.DATABASE_URL:
    # Create SQLAlchemy engine for local database
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("Local database configured with SQLAlchemy")
elif settings.USE_LOCAL_DB and not settings.DATABASE_URL:
    logger.warning("USE_LOCAL_DB is True but DATABASE_URL is not set")
else:
    logger.info("Using Supabase as primary database - SQLAlchemy not initialized")

# Base class for models
Base = declarative_base()


def get_db():
    """Database dependency - only works with local database"""
    if not SessionLocal:
        # Return None or raise an informative error
        # You can modify this based on how your routes handle this
        raise RuntimeError("Local database not configured. This endpoint requires USE_LOCAL_DB=True and DATABASE_URL to be set.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_optional():
    """Optional database dependency - returns None if no local DB configured"""
    if not SessionLocal:
        yield None
        return
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables - only for local database"""
    if engine is not None:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created")
    else:
        logger.info("Skipping table creation - using Supabase")
