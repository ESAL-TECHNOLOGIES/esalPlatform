"""
Platform Assistant API endpoint for the chatbot
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import logging

from app.services.gemini_ai import GeminiAIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])


class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = "general"


class ChatResponse(BaseModel):
    response: str
    context: str


@router.post("/platform-assistant", response_model=ChatResponse)
async def platform_assistant(chat_message: ChatMessage):
    """
    Platform assistant chatbot endpoint that provides information about ESAL Platform
    """
    try:
        ai_service = GeminiAIService()
        
        # Create a specialized prompt for platform assistance
        platform_context = """You are the ESAL Platform Assistant, a helpful AI that helps users understand the ESAL Platform.

ESAL Platform is a comprehensive entrepreneurship and innovation platform that connects innovators, investors, and entrepreneurship hubs.

Key Platform Information:
- Multi-portal system: Innovator Portal, Investor Portal, Hub Portal, Admin Portal, and Landing Page
- AI-powered matching system using Google Gemini AI
- Idea development and pitch generation tools
- Analytics and performance tracking
- Role-based access control and authentication

AI Matchmaking Features:
- Analyzes startup profiles (industry, stage, funding needs, market potential)
- Matches based on investor preferences (criteria, risk tolerance, portfolio preferences)
- Provides match scores (0-100%) with detailed explanations
- Real-time processing of hundreds of startups
- Scoring factors: Industry alignment (30%), Development stage (25%), Market opportunity (20%), Risk-return profile (15%), Geographic preferences (10%)

Portal Details:
- Innovator Portal: Submit ideas, AI assistance, pitch development, analytics
- Investor Portal: Browse opportunities, AI matching, portfolio management, due diligence
- Hub Portal: Cohort management, event planning, member coordination, resource allocation
- Admin Portal: User management, platform control, analytics, content moderation

Technology Stack:
- Frontend: React 18 + TypeScript + Vite
- Backend: FastAPI (Python)
- Database: Supabase (PostgreSQL)
- AI: Google Gemini AI
- Authentication: JWT with role-based access control

Please provide helpful, accurate information about the ESAL Platform. Keep responses focused on platform-specific questions and features. Be friendly and informative.

User Question: {message}

Provide a clear, helpful response about the ESAL Platform:"""

        prompt = platform_context.format(message=chat_message.message)
        
        # Generate response using Gemini AI
        response = ai_service.model.generate_content(prompt)
        
        return ChatResponse(
            response=response.text.strip(),
            context=chat_message.context or "platform_assistance"
        )
        
    except Exception as e:
        logger.error(f"Error in platform assistant: {e}")
        
        # Provide fallback response for common questions
        fallback_responses = {
            "what is esal": "ESAL Platform is a comprehensive entrepreneurship and innovation platform that connects innovators, investors, and entrepreneurship hubs in a unified ecosystem. It features AI-powered matching, idea development tools, and specialized portals for different user types.",
            "ai matchmaking": "Our AI matchmaking system uses Google Gemini AI to intelligently connect investors with startups based on industry alignment, development stage, market opportunity, risk profile, and geographic preferences. It provides detailed match scores and explanations.",
            "how to start": "To get started, choose your role (Innovator, Investor, Hub Manager, or Admin), access the appropriate portal from our landing page, complete registration, and start exploring the features designed for your needs.",
            "portals": "ESAL Platform has specialized portals: Innovator Portal for startup founders, Investor Portal for investment discovery, Hub Portal for program management, Admin Portal for platform oversight, and a Landing Page for general information.",
        }
        
        message_lower = chat_message.message.lower()
        for key, response in fallback_responses.items():
            if key in message_lower:
                return ChatResponse(
                    response=response,
                    context=chat_message.context or "platform_assistance"
                )
        
        # Generic fallback
        return ChatResponse(
            response="I'm here to help you learn about the ESAL Platform! You can ask me about our AI matchmaking system, different portals (Innovator, Investor, Hub, Admin), getting started, platform features, or technology stack. What would you like to know?",
            context=chat_message.context or "platform_assistance"
        )
