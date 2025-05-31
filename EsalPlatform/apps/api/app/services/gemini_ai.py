"""
Gemini AI service for generating innovation pitches and AI interactions
"""
import google.generativeai as genai
from datetime import datetime
from typing import Dict, Any, List
import json

from app.config import settings
from app.schemas import (
    PitchRequest, PitchResponse, AIGenerateIdeaRequest, AIFineTuneRequest,
    AIJudgeIdeaRequest, AIRecommendationRequest, AIInteractionResponse,
    AIJudgeResponse
)


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

    # New AI Interaction Methods
    
    async def generate_new_idea(self, request: AIGenerateIdeaRequest) -> AIInteractionResponse:
        """Generate a new startup idea based on user interests and skills"""
        try:
            prompt = f"""You are an AI innovation consultant. Based on the following user profile, generate a detailed startup idea:

Interests: {request.interests}
Skills: {request.skills}
Industry: {request.industry or 'Any'}
Problem Area: {request.problem_area or 'Not specified'}
Target Market: {request.target_market or 'To be determined'}

Generate a comprehensive startup idea with:
1. **Title**: A catchy, memorable name
2. **Problem Statement**: A clear, specific problem worth solving
3. **Solution**: An innovative solution leveraging the user's skills
4. **Target Market**: Specific audience who would pay for this
5. **Revenue Model**: How the business would make money
6. **Key Features**: 3-5 core features
7. **Competitive Advantage**: What makes this unique
8. **Next Steps**: 3 actionable steps to validate the idea

Make it practical, feasible, and aligned with current market trends."""

            response = self.model.generate_content(prompt)
            
            return AIInteractionResponse(
                response_text=response.text.strip(),
                confidence_score=0.85,
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            return self._create_fallback_idea_response(request)
    
    async def fine_tune_idea(self, request: AIFineTuneRequest) -> AIInteractionResponse:
        """Fine-tune an existing idea based on specific focus areas"""
        try:
            prompt = f"""You are an AI business consultant. Here's a startup idea that needs refinement:

Current Content: {request.current_content}

Focus Area for Improvement: {request.improvement_focus}
Additional Context: {request.additional_context or 'None provided'}

Please provide specific, actionable improvements for the {request.improvement_focus}. Include:
1. **Analysis**: What's currently missing or weak
2. **Improvements**: Specific enhancements with examples
3. **Implementation**: How to execute these improvements
4. **Market Validation**: Ways to test these improvements

Be constructive, specific, and provide actionable advice."""

            response = self.model.generate_content(prompt)
            
            # Extract suggestions from response
            suggestions = self._extract_suggestions_from_text(response.text)
            
            return AIInteractionResponse(
                response_text=response.text.strip(),
                suggestions=suggestions,
                confidence_score=0.88,
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            return self._create_fallback_finetune_response(request)
    
    async def judge_idea(self, request: AIJudgeIdeaRequest) -> AIJudgeResponse:
        """Provide comprehensive judgment and scoring of a startup idea"""
        try:
            prompt = f"""You are an expert startup evaluator and investor. Analyze this startup idea:

Title: {request.title}
Problem: {request.problem}
Solution: {request.solution}
Target Market: {request.target_market}

Provide a comprehensive evaluation in JSON format:
{{
  "overall_score": <float 0-10>,
  "strengths": [<list of 3-5 specific strengths>],
  "weaknesses": [<list of 3-5 specific weaknesses>],
  "improvement_suggestions": [<list of 3-5 actionable improvements>],
  "market_viability": <float 0-10>,
  "technical_feasibility": <float 0-10>,
  "business_potential": <float 0-10>
}}

Be honest, constructive, and specific in your evaluation."""

            response = self.model.generate_content(prompt)
            
            # Try to parse JSON response
            try:
                eval_data = json.loads(response.text.strip())
                return AIJudgeResponse(
                    overall_score=eval_data.get('overall_score', 6.5),
                    strengths=eval_data.get('strengths', []),
                    weaknesses=eval_data.get('weaknesses', []),
                    improvement_suggestions=eval_data.get('improvement_suggestions', []),
                    market_viability=eval_data.get('market_viability', 6.0),
                    technical_feasibility=eval_data.get('technical_feasibility', 7.0),
                    business_potential=eval_data.get('business_potential', 6.5),
                    generated_at=datetime.utcnow()
                )
            except json.JSONDecodeError:
                return self._create_fallback_judgment(request)
                
        except Exception as e:
            return self._create_fallback_judgment(request)
    
    async def get_recommendations(self, request: AIRecommendationRequest) -> AIInteractionResponse:
        """Provide personalized recommendations based on user's current ideas"""
        try:
            ideas_context = "\n".join([f"- {idea}" for idea in request.current_ideas])
            
            prompt = f"""You are an AI business strategist. Based on this user's current startup ideas, provide strategic recommendations:

Current Ideas:
{ideas_context}

Focus Area: {request.focus_area or 'General business development'}

Provide comprehensive recommendations including:
1. **Pattern Analysis**: Common themes and opportunities across their ideas
2. **Market Gaps**: Underexplored opportunities they should consider
3. **Skill Development**: Technical or business skills to develop
4. **Networking**: Types of people they should connect with
5. **Next Actions**: 5 specific, actionable next steps
6. **Resource Recommendations**: Tools, books, courses, or platforms that would help

Be specific, actionable, and tailored to their portfolio of ideas."""

            response = self.model.generate_content(prompt)
            
            suggestions = self._extract_action_items_from_text(response.text)
            
            return AIInteractionResponse(
                response_text=response.text.strip(),
                suggestions=suggestions,
                confidence_score=0.82,
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            return self._create_fallback_recommendations(request)
    
    # Helper methods for fallbacks and text processing
    
    def _create_fallback_idea_response(self, request: AIGenerateIdeaRequest) -> AIInteractionResponse:
        """Create fallback idea when AI service fails"""
        fallback = f"""**Smart {request.interests.split(',')[0].strip()} Platform**

**Problem Statement:** Many people interested in {request.interests} lack easy access to tools and resources that match their skill level in {request.skills}.

**Solution:** A comprehensive platform that combines {request.skills} with {request.interests} to create personalized experiences and solutions.

**Target Market:** {request.target_market or 'Professionals and enthusiasts in the ' + (request.industry or 'technology') + ' sector'}

**Revenue Model:** Subscription-based SaaS with freemium tier

**Key Features:**
- Personalized dashboard
- Community networking
- Resource recommendations
- Progress tracking
- Expert mentorship

**Competitive Advantage:** Unique combination of {request.skills} expertise with {request.interests} focus

**Next Steps:**
1. Survey 50 potential users about their current challenges
2. Build a simple MVP to test core features
3. Connect with industry experts for validation

[AI-generated idea - Fallback mode]"""

        return AIInteractionResponse(
            response_text=fallback,
            confidence_score=0.6,
            generated_at=datetime.utcnow()
        )
    
    def _create_fallback_finetune_response(self, request: AIFineTuneRequest) -> AIInteractionResponse:
        """Create fallback fine-tuning response"""
        fallback = f"""**Improvement Analysis for {request.improvement_focus}:**

**Current State Analysis:**
Your {request.improvement_focus} shows potential but could be strengthened with more specific details and market validation.

**Recommended Improvements:**
1. Add more specific metrics and data points
2. Include competitive analysis and differentiation
3. Provide clearer value proposition
4. Add risk mitigation strategies
5. Include timeline and milestones

**Implementation Steps:**
1. Research competitors and market data
2. Interview potential customers
3. Refine messaging based on feedback
4. Test assumptions with MVP
5. Iterate based on results

**Market Validation:**
- Conduct user interviews
- Create landing page to test interest
- Run small-scale pilot program

[AI-generated improvements - Fallback mode]"""

        return AIInteractionResponse(
            response_text=fallback,
            suggestions=["Add specific metrics", "Include competitive analysis", "Interview potential customers"],
            confidence_score=0.65,
            generated_at=datetime.utcnow()
        )
    
    def _create_fallback_judgment(self, request: AIJudgeIdeaRequest) -> AIJudgeResponse:
        """Create fallback judgment when AI service fails"""
        return AIJudgeResponse(
            overall_score=6.5,
            strengths=[
                "Clear problem identification",
                "Defined target market",
                "Feasible solution approach"
            ],
            weaknesses=[
                "Needs more market validation",
                "Competitive analysis required",
                "Revenue model needs refinement"
            ],
            improvement_suggestions=[
                "Conduct user interviews to validate problem",
                "Research competitors and differentiation",
                "Develop detailed financial projections",
                "Create minimum viable product plan"
            ],
            market_viability=6.0,
            technical_feasibility=7.0,
            business_potential=6.5,
            generated_at=datetime.utcnow()
        )
    
    def _create_fallback_recommendations(self, request: AIRecommendationRequest) -> AIInteractionResponse:
        """Create fallback recommendations"""
        fallback = f"""**Strategic Recommendations Based on Your Ideas:**

**Pattern Analysis:**
Your ideas show a strong focus on solving real-world problems with technology solutions. This is a great foundation for successful startups.

**Market Gaps to Explore:**
1. B2B solutions in your area of expertise
2. Mobile-first approaches to existing problems
3. AI/automation opportunities in traditional industries

**Skill Development Priorities:**
1. Customer development and user research
2. Business model design and validation
3. Technical implementation and MVP development

**Networking Opportunities:**
- Join local entrepreneur meetups
- Connect with industry professionals on LinkedIn
- Attend startup competitions and pitch events

**Next Actions:**
1. Choose one idea to focus on for the next 30 days
2. Interview 10 potential customers about the problem
3. Create a simple landing page to test interest
4. Build a basic prototype or mockup
5. Join an entrepreneur community or incubator

**Resource Recommendations:**
- "The Lean Startup" by Eric Ries
- Startup accelerator programs
- Customer development frameworks
- Prototype development tools

[AI-generated recommendations - Fallback mode]"""

        return AIInteractionResponse(
            response_text=fallback,
            suggestions=[
                "Focus on one idea for 30 days",
                "Interview 10 potential customers",
                "Create a landing page",
                "Build a basic prototype",
                "Join entrepreneur community"
            ],
            confidence_score=0.7,
            generated_at=datetime.utcnow()
        )
    
    def _extract_suggestions_from_text(self, text: str) -> List[str]:
        """Extract actionable suggestions from AI response text"""
        suggestions = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith(('- ', '• ', '1. ', '2. ', '3. ', '4. ', '5. ')):
                clean_suggestion = line.replace('- ', '').replace('• ', '')
                # Remove numbering
                import re
                clean_suggestion = re.sub(r'^\d+\.\s*', '', clean_suggestion)
                if len(clean_suggestion.strip()) > 10:  # Filter out very short items
                    suggestions.append(clean_suggestion.strip())
        
        return suggestions[:5]  # Return max 5 suggestions
    
    def _extract_action_items_from_text(self, text: str) -> List[str]:
        """Extract action items from recommendations text"""
        action_items = []
        lines = text.split('\n')
        
        in_action_section = False
        for line in lines:
            line = line.strip()
            if 'next actions' in line.lower() or 'action' in line.lower():
                in_action_section = True
                continue
            
            if in_action_section and line.startswith(('- ', '• ', '1. ', '2. ', '3. ', '4. ', '5. ')):
                clean_action = line.replace('- ', '').replace('• ', '')
                import re
                clean_action = re.sub(r'^\d+\.\s*', '', clean_action)
                if len(clean_action.strip()) > 10:
                    action_items.append(clean_action.strip())
        
        return action_items[:5] if action_items else self._extract_suggestions_from_text(text)
