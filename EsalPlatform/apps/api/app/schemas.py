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


# Ideas schemas
class IdeaBase(BaseModel):
    title: str
    description: str
    industry: str
    stage: str
    target_market: str
    funding_needed: Optional[str] = None
    problem: Optional[str] = None
    solution: Optional[str] = None


class IdeaCreate(IdeaBase):
    pass


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
