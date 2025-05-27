"""
User-related database models.
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class UserRoleEnum(str, Enum):
    """User role enumeration."""
    INNOVATOR = "innovator"
    INVESTOR = "investor"
    HUB = "hub"
    ADMIN = "admin"


class UserStatusEnum(str, Enum):
    """User status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    SUSPENDED = "suspended"
    REJECTED = "rejected"


class User(SQLModel, table=True):
    """User model representing authenticated users."""
    __tablename__ = "users"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str = Field(min_length=2, max_length=100)
    password_hash: Optional[str] = Field(default=None)  # Hashed password
    role: UserRoleEnum = Field(default=UserRoleEnum.INNOVATOR)
    status: UserStatusEnum = Field(default=UserStatusEnum.PENDING)
    is_active: bool = Field(default=True)
    is_approved: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
      # Relationships
    profile: Optional["UserProfile"] = Relationship(back_populates="user")
    permissions: List["UserPermission"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"foreign_keys": "UserPermission.user_id"}
    )
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission."""
        return any(p.permission_name == permission for p in self.permissions)
    
    def can_access_portal(self, portal: str) -> bool:
        """Check if user can access a specific portal."""
        if not self.is_active:
            return False
            
        if portal == "innovator" and self.role == UserRoleEnum.INNOVATOR:
            return True
        elif portal in ["investor", "hub"] and self.role in [UserRoleEnum.INVESTOR, UserRoleEnum.HUB]:
            return self.is_approved
        elif portal == "admin" and self.role == UserRoleEnum.ADMIN:
            return True
            
        return False


class UserProfile(SQLModel, table=True):
    """Extended user profile information."""
    __tablename__ = "user_profiles"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", unique=True)
    
    # Profile data
    bio: Optional[str] = Field(default=None, max_length=1000)
    avatar_url: Optional[str] = None
    skills: Optional[str] = Field(default=None)  # JSON string
    interests: Optional[str] = Field(default=None)  # JSON string
    location: Optional[str] = Field(default=None)  # JSON string
    availability: Optional[str] = Field(default=None)  # JSON string
    
    # Social links
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    
    # Additional data as JSON string
    extra_data: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="profile")


class UserPermission(SQLModel, table=True):
    """User-specific permissions."""
    __tablename__ = "user_permissions"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    permission_name: str = Field(index=True)
    granted_at: datetime = Field(default_factory=datetime.utcnow)
    granted_by: Optional[str] = Field(foreign_key="users.id", default=None)
      # Relationships
    user: Optional[User] = Relationship(
        back_populates="permissions",
        sa_relationship_kwargs={"foreign_keys": "UserPermission.user_id"}
    )


class UserRole(SQLModel, table=True):
    """Role definitions with permissions."""
    __tablename__ = "user_roles"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    role_name: UserRoleEnum = Field(unique=True)
    display_name: str
    description: Optional[str] = None
    default_permissions: Optional[str] = Field(default=None)  # JSON string
    requires_approval: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


# Permission constants
class Permissions:
    """Centralized permission definitions."""
    
    # AI Services
    AI_MATCHMAKING = "ai:matchmaking"
    AI_PITCH_SCORING = "ai:pitch_scoring" 
    AI_EVALUATION = "ai:evaluation"
    
    # Project Management
    PROJECT_CREATE = "project:create"
    PROJECT_EDIT = "project:edit"
    PROJECT_DELETE = "project:delete"
    PROJECT_VIEW_ALL = "project:view_all"
    
    # User Management
    USER_APPROVE = "user:approve"
    USER_SUSPEND = "user:suspend"
    USER_VIEW_ALL = "user:view_all"
    
    # Analytics
    ANALYTICS_VIEW = "analytics:view"
    ANALYTICS_EXPORT = "analytics:export"
    
    # Admin
    ADMIN_FULL_ACCESS = "admin:full_access"
    
    @classmethod
    def get_default_permissions(cls, role: UserRoleEnum) -> List[str]:
        """Get default permissions for a role."""
        if role == UserRoleEnum.INNOVATOR:
            return [
                cls.AI_MATCHMAKING,
                cls.PROJECT_CREATE,
                cls.PROJECT_EDIT,
            ]
        elif role == UserRoleEnum.INVESTOR:
            return [
                cls.AI_MATCHMAKING,
                cls.AI_EVALUATION,
                cls.PROJECT_VIEW_ALL,
                cls.ANALYTICS_VIEW,
            ]
        elif role == UserRoleEnum.HUB:
            return [
                cls.AI_MATCHMAKING,
                cls.AI_PITCH_SCORING,
                cls.AI_EVALUATION,
                cls.PROJECT_VIEW_ALL,
                cls.USER_APPROVE,
                cls.ANALYTICS_VIEW,
                cls.ANALYTICS_EXPORT,
            ]
        elif role == UserRoleEnum.ADMIN:
            return [
                cls.ADMIN_FULL_ACCESS,
                cls.USER_APPROVE,
                cls.USER_SUSPEND,
                cls.USER_VIEW_ALL,
            ]
        return []
