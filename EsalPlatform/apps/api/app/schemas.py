"""
Pydantic schemas for API models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# Auth schemas
class UserBase(BaseModel):
    email: EmailStr
    role: str = "innovator"
    

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool = True
    is_blocked: bool = False
    created_at: str
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class EmailVerificationRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    user_id: str
    code: str


class VerificationResponse(BaseModel):
    message: str
    requires_verification: bool = False
    user_id: Optional[str] = None


# Ideas schemas
class IdeaBase(BaseModel):
    title: str
    description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    target_market: Optional[str] = None
    funding_needed: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None


class IdeaCreate(BaseModel):
    title: str
    problem: Optional[str] = None
    solution: Optional[str] = None
    target_market: Optional[str] = None
    # Allow additional optional fields that frontend might send
    description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    funding_needed: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    visibility: Optional[str] = None


class IdeaUpdate(IdeaBase):
    title: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    target_market: Optional[str] = None


class IdeaResponse(IdeaBase):
    id: str
    status: str
    created_at: str
    updated_at: str
    user_id: str
    views_count: int = 0
    interests_count: int = 0
    ai_score: Optional[float] = None
    # Additional fields for frontend compatibility
    industry: Optional[str] = None
    stage: Optional[str] = "idea"
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    visibility: Optional[str] = "private"
    
    class Config:
        from_attributes = True


# Comment schemas
class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    pass


class CommentResponse(CommentBase):
    id: str
    user_id: str
    user_name: Optional[str] = None
    user_role: str
    created_at: str
    
    class Config:
        from_attributes = True


# File schemas
class FileBase(BaseModel):
    name: str
    type: str
    size: int
    url: str
    description: Optional[str] = None


class FileResponse(FileBase):
    id: str
    uploaded_at: str
    
    class Config:
        from_attributes = True


# Profile schemas
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    bio: Optional[str] = None
    company: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    created_at: str
    ideas_count: int = 0
    
    class Config:
        from_attributes = True


# AI Schemas
class AIGenerateRequest(BaseModel):
    interests: str
    skills: str
    industry: Optional[str] = None
    problem_area: Optional[str] = None
    target_market: Optional[str] = None


class AIGenerateResponse(BaseModel):
    idea_description: str
    ai_score: float
    
    class Config:
        from_attributes = True


class PitchRequest(BaseModel):
    idea_id: str
    target_audience: Optional[str] = None


class PitchResponse(BaseModel):
    idea_id: str
    pitch_text: str
    pitch_title: str
    
    class Config:
        from_attributes = True


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
    
    class Config:
        from_attributes = True


# User Management schemas
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
    
    class Config:
        from_attributes = True


class NotificationPreferences(BaseModel):
    emailUpdates: bool = True
    pushNotifications: bool = False
    weeklyDigest: bool = True
    investorInterest: bool = True
    systemAlerts: bool = False


class UserDataExport(BaseModel):
    profile: Dict[str, Any]
    ideas: List[Dict[str, Any]]
    activities: List[Dict[str, Any]]
    settings: Dict[str, Any]
    export_date: str


# AI Matching schemas for Investor Portal
class InvestorPreferences(BaseModel):
    industries: List[str] = []
    stages: List[str] = []
    min_funding_amount: Optional[str] = None
    max_funding_amount: Optional[str] = None
    geographic_preferences: List[str] = []
    risk_tolerance: str = "medium"  # conservative, medium, aggressive


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
    industry: Optional[str] = None
    stage: Optional[str] = None
    description: Optional[str] = None
    team_size: Optional[int] = None
    funding_needed: Optional[str] = None
    location: Optional[str] = None
    target_market: Optional[str] = None
    match_score: float
    highlights: List[MatchHighlight] = []
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
    
    class Config:
        from_attributes = True
