"""
Role-based access control utilities
"""
from functools import wraps
from typing import List, Union
from fastapi import HTTPException, status, Depends

from app.utils.jwt import get_current_user
from app.schemas import UserResponse


def require_role(allowed_roles: Union[str, List[str]]):
    """
    Dependency to require specific user roles
    
    Args:
        allowed_roles: Single role string or list of allowed roles
    
    Returns:
        FastAPI dependency function
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]
    
    def role_checker(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}"
            )
        return current_user
    
    return role_checker


def require_admin(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def require_innovator(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to require innovator role"""
    if current_user.role != "innovator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Innovator access required"
        )
    return current_user


def require_hub(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to require hub role"""
    if current_user.role != "hub":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hub access required"
        )
    return current_user


def require_investor(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to require investor role"""
    if current_user.role != "investor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Investor access required"
        )
    return current_user


def check_user_access(user: UserResponse, resource_user_id: str) -> bool:
    """
    Check if user has access to a resource
    
    Args:
        user: Current user
        resource_user_id: ID of the user who owns the resource
    
    Returns:
        True if user has access, False otherwise
    """
    # Admin can access everything
    if user.role == "admin":
        return True
    
    # Users can access their own resources
    if str(user.id) == str(resource_user_id):
        return True
    
    return False
