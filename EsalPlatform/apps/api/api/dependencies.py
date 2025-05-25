"""
Dependencies for the ESAL Platform API.

This module defines reusable dependencies that can be used in FastAPI endpoints.
"""
from typing import Optional, Any
from fastapi import Depends

from services.ai.client import GeminiClient, OpenAIClient
from services.ai.matchmaking import MatchmakingEngine
from core.config import settings
from core.database import get_session

def get_ai_service() -> MatchmakingEngine:
    """
    Get an instance of the MatchmakingEngine with the appropriate AI client.
    
    Returns:
        Configured MatchmakingEngine
    """
    # Try to use Gemini by default, fall back to OpenAI if no Gemini key is available
    try:
        client = GeminiClient(settings.GEMINI_API_KEY)
    except ValueError:
        try:
            client = OpenAIClient(settings.OPENAI_API_KEY)
        except ValueError:
            # Use a mock client in development if no API keys are set
            if settings.ENVIRONMENT == "dev":
                client = None
            else:
                raise ValueError("No AI API keys available")
    
    return MatchmakingEngine(client)
