"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


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
    
    class Config:
        from_attributes = True


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
    problem: str
    solution: str
    target_market: str


class IdeaCreate(IdeaBase):
    pass


class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None
    target_market: Optional[str] = None


class IdeaResponse(IdeaBase):
    id: int
    user_id: str  # Changed from UUID to string
    ai_pitch: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
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
    generated_at: datetime


# Admin schemas
class UsersListResponse(BaseModel):
    users: List[UserResponse]
    total: int


class BlockUserRequest(BaseModel):
    reason: Optional[str] = None


# Dashboard schemas
class DashboardStats(BaseModel):
    total_users: int
    total_ideas: int
    active_users: int


class HubDashboard(BaseModel):
    message: str
    stats: dict


class InvestorDashboard(BaseModel):
    message: str
    stats: dict


# Enhanced AI Interaction Schemas
class AIGenerateIdeaRequest(BaseModel):
    interests: str
    skills: str
    industry: Optional[str] = None
    problem_area: Optional[str] = None
    target_market: Optional[str] = None


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
    generated_at: datetime
    
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
    generated_at: datetime
    
    class Config:
        from_attributes = True
