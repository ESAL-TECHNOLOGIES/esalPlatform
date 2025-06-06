"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, field_validator, field_serializer
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import uuid


# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str  # Supabase uses string IDs
    is_active: bool
    is_blocked: bool
    created_at: str  # Supabase returns datetime as string
    
    @field_serializer('id')
    def serialize_id(self, value: Any) -> str:
        """Convert UUID objects to string"""
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)
    
    @field_serializer('created_at')
    def serialize_created_at(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserLoginForm(BaseModel):
    """For OAuth2 form compatibility"""
    username: EmailStr  # OAuth2 uses 'username' field for email
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# Idea schemas
class IdeaBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: Optional[str] = ""
    tags: Optional[List[str]] = []
    status: Optional[str] = "draft"
    visibility: Optional[str] = "private"


class IdeaCreate(IdeaBase):
    # Additional optional fields for idea creation
    problem: Optional[str] = ""
    solution: Optional[str] = ""
    target_market: Optional[str] = ""
    industry: Optional[str] = ""
    stage: Optional[str] = "idea"


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    target_market: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    visibility: Optional[str] = None


class IdeaResponse(BaseModel):
    id: str  # Changed to string to match Supabase
    title: str
    description: str
    industry: str  # Maps to category in DB
    stage: str
    status: str
    created_at: str  # String format for API response
    updated_at: str  # String format for API response
    views_count: int = 0
    interests_count: int = 0
    user_id: str
    ai_score: Optional[float] = None
    
    # Optional fields for frontend compatibility
    target_market: Optional[str] = ""
    problem: Optional[str] = ""
    solution: Optional[str] = ""
    category: Optional[str] = ""
    tags: Optional[List[str]] = []
    visibility: Optional[str] = "private"
    
    @field_serializer('id')
    def serialize_id(self, value: Any) -> str:
        """Convert UUID objects to string"""
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)
    
    @field_serializer('user_id')
    def serialize_user_id(self, value: Any) -> str:
        """Convert UUID objects to string"""
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)
    
    @field_serializer('created_at')
    def serialize_created_at(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    @field_serializer('updated_at')
    def serialize_updated_at(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    class Config:
        from_attributes = True


# Comment schemas
class CommentCreate(BaseModel):
    content: str


# AI Pitch schemas
class PitchRequest(BaseModel):
    title: str
    problem: str
    solution: str
    target_market: str


class PitchResponse(BaseModel):
    pitch: str
    generated_at: str
    
    @field_serializer('generated_at')
    def serialize_generated_at(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)


# Admin schemas
class UsersListResponse(BaseModel):
    users: List[UserResponse]
    total: int


class BlockUserRequest(BaseModel):
    reason: Optional[str] = None


class DashboardStats(BaseModel):
    total_users: int
    total_ideas: int
    active_users: int


class KPIData(BaseModel):
    label: str
    value: str
    change: str
    trend: str


class UserMetric(BaseModel):
    role: str
    count: int
    percentage: float
    change: str


class EngagementData(BaseModel):
    metric: str
    value: str
    change: str


class AnalyticsResponse(BaseModel):
    kpiData: List[KPIData]
    userMetrics: List[UserMetric]
    engagementData: List[EngagementData]


class SystemHealthService(BaseModel):
    service: str
    status: str
    uptime: str
    responseTime: str


class SystemHealthResponse(BaseModel):
    systemHealth: List[SystemHealthService]


class RecentActivity(BaseModel):
    type: str
    message: str
    time: str
    status: str


class ActivityResponse(BaseModel):
    recentActivities: List[RecentActivity]


class PendingAction(BaseModel):
    title: str
    count: int
    urgency: str


class PendingActionsResponse(BaseModel):
    pendingActions: List[PendingAction]


class ContentStats(BaseModel):
    totalIdeas: int
    pendingReviews: int
    reportedContent: int
    totalFiles: int


class ModerationQueueResponse(BaseModel):
    queue: List[Dict[str, Any]]
    total: int
    pending: int


class UserStatistics(BaseModel):
    total: int
    active: int
    blocked: int
    pending: int
    by_role: Dict[str, int]


# Enhanced AI Interaction Schemas
class AIGenerateIdeaRequest(BaseModel):
    interests: str
    skills: str
    industry: Optional[str] = None
    problem_area: Optional[str] = None
    target_market: Optional[str] = None
    save_to_database: Optional[bool] = False


class AIFineTuneRequest(BaseModel):
    idea_id: str
    current_content: str
    improvement_focus: str  # e.g., "problem_statement", "solution", "market_analysis"
    additional_context: Optional[str] = None


class AIJudgeIdeaRequest(BaseModel):
    idea_id: str
    title: str
    problem: str
    solution: str
    target_market: str


class AIRecommendationRequest(BaseModel):
    user_id: str
    current_ideas: List[str]  # List of idea titles/descriptions
    focus_area: Optional[str] = None  # e.g., "funding", "marketing", "technical"


class AIInteractionResponse(BaseModel):
    response_text: str
    suggestions: Optional[List[str]] = None
    confidence_score: Optional[float] = None
    generated_at: str
    metadata: Optional[Dict[str, Any]] = None
    
    @field_serializer('generated_at')
    def serialize_generated_at(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    class Config:
        from_attributes = True


class AIJudgeResponse(BaseModel):
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]
    market_viability: float
    technical_feasibility: float
    business_potential: float
    generated_at: str
    metadata: Optional[Dict[str, Any]] = None
    
    @field_serializer('generated_at')
    def serialize_generated_at(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    class Config:
        from_attributes = True


# User Management schemas
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class NotificationSettings(BaseModel):
    email_notifications: bool = True
    idea_comments: bool = True
    idea_interests: bool = True
    platform_updates: bool = True
    marketing_emails: bool = False
    weekly_digest: bool = True


class PrivacySettings(BaseModel):
    profile_visibility: str = "public"  # "public", "private", "registered"
    show_contact_info: bool = True
    allow_messages: bool = True
    show_ideas: bool = True
    data_sharing: bool = False


class SecuritySettings(BaseModel):
    two_factor_enabled: bool = False
    login_notifications: bool = True
    session_timeout: int = 30  # minutes (frontend expects minutes)


class NotificationPreferences(BaseModel):
    emailUpdates: bool = True
    pushNotifications: bool = False
    weeklyDigest: bool = True
    investorInterest: bool = True
    systemAlerts: bool = False


class UserSettings(BaseModel):
    notifications: NotificationSettings = NotificationSettings()
    privacy: PrivacySettings = PrivacySettings()
    security: SecuritySettings = SecuritySettings()
    theme: str = "light"
    language: str = "en"
    timezone: str = "UTC"


class UserDataExport(BaseModel):
    profile: Dict[str, Any]
    ideas: List[Dict[str, Any]]
    activities: List[Dict[str, Any]]
    settings: Dict[str, Any]
    export_date: str


# Security schemas
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


class Enable2FARequest(BaseModel):
    password: str


class Verify2FARequest(BaseModel):
    token: str


class SessionInfo(BaseModel):
    device: str
    browser: str
    ip_address: str
    location: str
    last_active: str
    is_current: bool = False
    
    @field_serializer('last_active')
    def serialize_last_active(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)


# AI Matching schemas for Investor Portal
class InvestorPreferences(BaseModel):
    industries: List[str] = []
    stages: List[str] = []
    min_funding_amount: Optional[float] = None
    max_funding_amount: Optional[float] = None
    geographic_preferences: List[str] = []
    risk_tolerance: str = "medium"  # conservative, medium, aggressive
    investment_timeline: str = "6_months"  # 3_months, 6_months, 12_months, 24_months


class AIMatchingRequest(BaseModel):
    preferences: InvestorPreferences
    top_k: Optional[int] = 10
    min_score: Optional[float] = 0.6


class MatchHighlight(BaseModel):
    reason: str
    score: float


class StartupMatch(BaseModel):
    startup_id: str
    startup_title: str
    match_score: float
    highlights: List[MatchHighlight] = []
    industry: Optional[str] = None
    stage: Optional[str] = None
    description: Optional[str] = None
    funding_needed: Optional[str] = None
    target_market: Optional[str] = None
    team_size: Optional[int] = None
    location: Optional[str] = None
    traction: Optional[str] = None
    
    class Config:
        from_attributes = True


class MatchingStatistics(BaseModel):
    total_startups_analyzed: int
    high_quality_matches: int  # >80% score
    average_score: float
    processing_time_seconds: float
    ai_confidence: float


class AIMatchingResponse(BaseModel):
    matches: List[StartupMatch]
    total_matches: int
    matching_statistics: MatchingStatistics
    
    class Config:
        from_attributes = True


class MatchingHistory(BaseModel):
    id: str
    investor_id: str
    preferences: InvestorPreferences
    matches_found: int
    created_at: str
    
    @field_serializer('id')
    def serialize_id(self, value: Any) -> str:
        """Convert UUID objects to string"""
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)
    
    @field_serializer('investor_id')
    def serialize_investor_id(self, value: Any) -> str:
        """Convert UUID objects to string"""
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)
    
    @field_serializer('created_at')
    def serialize_created_at(self, value: Any) -> str:
        """Convert datetime objects to ISO format string"""
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value)
    
    class Config:
        from_attributes = True


# Hub Dashboard Schema
class HubDashboard(BaseModel):
    message: str
    stats: Dict[str, Any]
    
    class Config:
        from_attributes = True


# Investor Dashboard Schema
class InvestorDashboard(BaseModel):
    message: str
    stats: Dict[str, Any]
    
    class Config:
        from_attributes = True
