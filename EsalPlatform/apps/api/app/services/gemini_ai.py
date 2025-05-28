"""
Gemini AI service for generating innovation pitches
"""
import google.generativeai as genai
from datetime import datetime
from typing import Dict, Any

from app.config import settings
from app.schemas import PitchRequest, PitchResponse


class GeminiAIService:
    def __init__(self):
        # Configure Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_pitch(self, pitch_request: PitchRequest) -> PitchResponse:
        """Generate AI pitch using Gemini API"""
        try:
            # Create prompt for innovation pitch
            prompt = self._create_pitch_prompt(pitch_request)
            
            # Generate content using Gemini
            response = self.model.generate_content(prompt)
            
            # Extract pitch text
            pitch_text = response.text.strip()
            
            return PitchResponse(
                pitch=pitch_text,
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            # Fallback pitch if AI service fails
            fallback_pitch = self._create_fallback_pitch(pitch_request)
            return PitchResponse(
                pitch=fallback_pitch,
                generated_at=datetime.utcnow()
            )
    
    def _create_pitch_prompt(self, pitch_request: PitchRequest) -> str:
        """Create formatted prompt for Gemini API"""
        prompt = f"""You are an AI innovation coach. Given the idea details:

Title: {pitch_request.title}

Problem: {pitch_request.problem}

Solution: {pitch_request.solution}

Market: {pitch_request.target_market}

Generate a compelling, investor-ready startup pitch in less than 100 words. Focus on:
- Clear problem statement
- Innovative solution
- Market opportunity
- Competitive advantage
- Call to action

Make it professional, engaging, and investment-worthy."""
        
        return prompt
    
    def _create_fallback_pitch(self, pitch_request: PitchRequest) -> str:
        """Create fallback pitch if AI service fails"""
        return f"""🚀 **{pitch_request.title}**

**Problem:** {pitch_request.problem[:100]}...

**Solution:** {pitch_request.solution[:100]}...

**Market:** {pitch_request.target_market[:100]}...

This innovative solution addresses a critical market need with cutting-edge technology. Our unique approach positions us for rapid growth and market leadership.

*Ready to revolutionize the industry. Seeking strategic investment partners.*

[AI-generated pitch - Fallback mode]"""
