"""
Database configuration and connection management for the ESAL Platform API.

This module sets up the SQLAlchemy engine and session management for the API.
"""
from typing import AsyncGenerator, Generator
import logging
from contextlib import contextmanager
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlmodel import SQLModel

from core.config import settings

logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(
    str(settings.DATABASE_URL),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()


def create_db_and_tables() -> None:
    """Create database tables if they don't exist."""
    logger.info("Creating database tables")
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def get_session() -> Generator[Session, None, None]:
    """
    Get a database session for dependency injection.
    
    Yields:
        SQLAlchemy Session
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager to get a database session.
    
    Yields:
        SQLAlchemy Session
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# Register event listeners
@event.listens_for(engine, "connect")
def set_connection_timeout(dbapi_connection, connection_record):
    """Set SQLite timeout for concurrent access."""
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA busy_timeout = 5000")
        cursor.close()
