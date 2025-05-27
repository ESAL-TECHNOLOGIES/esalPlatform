"""
Authentication service for the ESAL Platform API.

This service handles user authentication using the SQLite database.
"""

import sqlite3
import bcrypt
from pathlib import Path
from typing import Optional, List
from pydantic import BaseModel
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Database path
DB_PATH = Path(__file__).parent.parent / "esal_dev.db"


class AuthenticatedUser(BaseModel):
    """Authenticated user model."""
    id: str
    email: str
    name: str
    role: str
    status: str
    is_active: bool
    is_approved: bool


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: The plain text password
        hashed_password: The hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False


def authenticate_user(email: str, password: str) -> Optional[AuthenticatedUser]:
    """
    Authenticate a user with email and password.
    
    Args:
        email: User's email address
        password: User's plain text password
        
    Returns:
        AuthenticatedUser if authentication successful, None otherwise
    """
    try:
        logger.debug(f"Attempting authentication for email: {email}")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get user by email
        cursor.execute('''
            SELECT id, email, name, role, status, is_active, is_approved, password_hash
            FROM users 
            WHERE email = ? AND is_active = 1
        ''', (email,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            logger.debug(f"No active user found with email: {email}")
            return None
        
        user_id, email, name, role, status, is_active, is_approved, password_hash = result
        logger.debug(f"Found user: {email}, role: {role}, status: {status}, approved: {is_approved}")
        
        # Verify password
        if not verify_password(password, password_hash):
            logger.debug("Password verification failed")
            return None

        logger.debug("Password verification successful")
        return AuthenticatedUser(
            id=user_id,
            email=email,
            name=name,
            role=role.lower(),  # Convert role to lowercase to match UserRoleEnum values
            status=status.lower(),  # Convert status to lowercase to match UserStatusEnum values
            is_active=bool(is_active),
            is_approved=bool(is_approved)
        )
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return None


def get_user_by_id(user_id: str) -> Optional[AuthenticatedUser]:
    """
    Get user by ID.
    
    Args:
        user_id: User's unique identifier
        
    Returns:
        AuthenticatedUser if found, None otherwise
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, email, name, role, status, is_active, is_approved
            FROM users 
            WHERE id = ? AND is_active = 1
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return None
        
        user_id, email, name, role, status, is_active, is_approved = result
        
        return AuthenticatedUser(
            id=user_id,
            email=email,
            name=name,
            role=role.lower(),  # Convert role to lowercase to match UserRoleEnum values
            status=status.lower(),  # Convert status to lowercase to match UserStatusEnum values
            is_active=bool(is_active),
            is_approved=bool(is_approved)
        )
        
    except Exception as e:
        logger.error(f"Error getting user by ID: {e}")
        return None


def get_user_permissions(user_id: str) -> List[str]:
    """
    Get user's permissions.
    
    Args:
        user_id: User's unique identifier
        
    Returns:
        List of permission names
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT permission_name
            FROM user_permissions 
            WHERE user_id = ?
        ''', (user_id,))
        
        results = cursor.fetchall()
        conn.close()
        
        return [result[0] for result in results]
        
    except Exception as e:
        logger.error(f"Error getting user permissions: {e}")
        return []