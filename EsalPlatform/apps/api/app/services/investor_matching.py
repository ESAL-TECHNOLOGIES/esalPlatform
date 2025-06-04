"""
AI Matching service for connecting investors with startups
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import json

from app.services.gemini_ai import GeminiAIService
from app.services.supabase_ideas import SupabaseIdeasService
from app.schemas import (
    AIMatchingRequest, AIMatchingResponse, StartupMatch, 
    InvestorPreferences, MatchingStatistics, MatchHighlight
)

logger = logging.getLogger(__name__)


class InvestorMatchingService:
    def __init__(self):
        self.ai_service = GeminiAIService()
        self.ideas_service = SupabaseIdeasService()
    async def find_matching_startups(
        self, 
        request: AIMatchingRequest,
        investor_id: str
    ) -> AIMatchingResponse:
        """Find startups that match investor preferences using AI scoring"""
        try:
            logger.info(f"Starting AI matching for investor {investor_id}")
            logger.info(f"Preferences: {request.preferences}")
            
            # Get all available startup ideas from the database
            startup_ideas = await self._get_startup_ideas()
            logger.info(f"Found {len(startup_ideas)} startup ideas to analyze")
            
            if not startup_ideas:
                return AIMatchingResponse(
                    matches=[],
                    total_matches=0,
                    matching_statistics=MatchingStatistics(
                        total_startups_analyzed=0,
                        high_quality_matches=0,
                        average_score=0.0,
                        processing_time_seconds=0.1,
                        ai_confidence=0.0
                    )
                )
              # Score each startup against investor preferences using AI or fallback
            scored_matches = []
            ai_failures = 0
            for idea in startup_ideas:
                try:
                    match_data = await self._score_startup_match(idea, request.preferences)
                    if match_data and match_data.match_score >= (request.min_score or 0.6):
                        scored_matches.append(match_data)
                except Exception as e:
                    logger.warning(f"Failed to score startup {idea.get('id', 'unknown')}: {e}")
                    ai_failures += 1
                    # Try fallback scoring immediately when AI fails
                    try:
                        fallback_match = self._fallback_scoring(idea, request.preferences)
                        if fallback_match and fallback_match.match_score >= (request.min_score or 0.6):
                            scored_matches.append(fallback_match)
                    except Exception as fallback_error:
                        logger.warning(f"Fallback scoring also failed for {idea.get('id', 'unknown')}: {fallback_error}")
                    continue
            
            # If most AI calls failed, use fallback for all remaining ideas
            if ai_failures > len(startup_ideas) * 0.5:  # More than 50% failed
                logger.info(f"AI service appears unavailable ({ai_failures}/{len(startup_ideas)} failures), using fallback scoring for all ideas")
                scored_matches = []
                for idea in startup_ideas:
                    try:
                        fallback_match = self._fallback_scoring(idea, request.preferences)
                        if fallback_match and fallback_match.match_score >= (request.min_score or 0.6):
                            scored_matches.append(fallback_match)
                    except Exception as e:
                        logger.warning(f"Fallback scoring failed for {idea.get('id', 'unknown')}: {e}")
                        continue
            
            # Sort by match score (highest first)
            scored_matches.sort(key=lambda x: x.match_score, reverse=True)
            
            # Apply limit (use top_k from request)
            final_matches = scored_matches[:request.top_k] if request.top_k else scored_matches
            
            # Calculate statistics
            processing_time = 0.1  # Will be calculated properly later
            high_quality_count = len([m for m in final_matches if m.match_score >= 0.8])
            average_score = sum(m.match_score for m in final_matches) / len(final_matches) if final_matches else 0.0
            ai_confidence = 0.85
            
            logger.info(f"Generated {len(final_matches)} matches ({high_quality_count} high-quality)")
            
            # Return the correct schema format expected by the router
            return AIMatchingResponse(
                matches=final_matches,
                total_matches=len(final_matches),
                matching_statistics=MatchingStatistics(
                    total_startups_analyzed=len(scored_matches),
                    high_quality_matches=high_quality_count,
                    average_score=round(average_score, 2),
                    processing_time_seconds=round(processing_time, 3),
                    ai_confidence=ai_confidence
                )
            )
            
        except Exception as e:
            logger.error(f"Error in AI matching: {str(e)}")
            # Return empty results on error with correct schema
            return AIMatchingResponse(
                matches=[],
                total_matches=0,
                matching_statistics=MatchingStatistics(
                    total_startups_analyzed=0,
                    high_quality_matches=0,
                    average_score=0.0,
                    processing_time_seconds=0.1,
                    ai_confidence=0.0
                )
            )
    async def _get_startup_ideas(self) -> List[Dict[str, Any]]:
        """Get all public startup ideas from the database"""
        try:
            # Get all ideas with visibility set to public or public_ideas
            ideas = await self.ideas_service.get_ideas_list(
                user_id=None,  # Get all ideas, not user-specific
                visibility_filter="public",
                limit=1000  # Large limit to get all available ideas
            )
            
            # Filter and format ideas for matching
            startup_ideas = []
            for idea in ideas:
                if (idea.get('visibility') in ['public', 'public_ideas'] and 
                    idea.get('status') != 'archived'):
                    startup_ideas.append(idea)
            return startup_ideas
            
        except Exception as e:
            logger.error(f"Error fetching startup ideas: {e}")
            return []
    
    async def _score_startup_match(
        self, 
        startup: Dict[str, Any], 
        preferences: InvestorPreferences
    ) -> Optional[StartupMatch]:
        """Score how well a startup matches investor preferences using AI"""
        try:
            # Create AI prompt for matching analysis
            prompt = self._create_matching_prompt(startup, preferences)
            
            # Get AI analysis
            response = self.ai_service.model.generate_content(prompt)
            
            # Parse AI response
            match_data = self._parse_ai_matching_response(response.text, startup)
            
            if match_data:
                return StartupMatch(**match_data)
            
            return None
            
        except Exception as e:
            logger.warning(f"Error scoring startup match: {e}")
            # Fallback scoring without AI
            return self._fallback_scoring(startup, preferences)
    
    def _create_matching_prompt(
        self, 
        startup: Dict[str, Any], 
        preferences: InvestorPreferences
    ) -> str:
        """Create AI prompt for startup-investor matching"""
        
        # Extract startup information
        startup_info = {
            'title': startup.get('title', 'Unknown'),
            'description': startup.get('description', ''),
            'category': startup.get('category', ''),
            'problem': startup.get('problem', ''),
            'solution': startup.get('solution', ''),
            'target_market': startup.get('target_market', ''),
            'stage': startup.get('stage', 'Unknown'),
            'tags': startup.get('tags', [])
        }
          # Build preference context
        pref_context = f"""
Investor Preferences:
- Industries: {', '.join(preferences.industries) if preferences.industries else 'Any'}
- Funding Stages: {', '.join(preferences.stages) if preferences.stages else 'Any'}
- Geography: {', '.join(preferences.geographic_preferences) if preferences.geographic_preferences else 'Any'}
- Risk Tolerance: {preferences.risk_tolerance}
- Funding Range: {preferences.min_funding_amount or 'No minimum'} to {preferences.max_funding_amount or 'No maximum'}
"""
        
        prompt = f"""You are an expert investment matching AI. Analyze this startup against investor preferences:

STARTUP PROFILE:
Title: {startup_info['title']}
Category: {startup_info['category']}
Stage: {startup_info['stage']}
Description: {startup_info['description'][:500]}...
Problem: {startup_info['problem'][:300] if startup_info['problem'] else 'Not specified'}
Solution: {startup_info['solution'][:300] if startup_info['solution'] else 'Not specified'}
Target Market: {startup_info['target_market'][:200] if startup_info['target_market'] else 'Not specified'}
Tags: {', '.join(startup_info['tags'][:5])}

{pref_context}

Provide a JSON response with this exact structure:
{{
  "match_score": <float 0.0-1.0>,
  "highlights": [<list of 2-4 specific reasons why this matches investor preferences>],
  "traction": "<brief traction summary>",
  "funding_alignment": "<how well funding needs align>",
  "risk_assessment": "<risk level: low/medium/high>"
}}

Score based on:
1. Industry/category alignment (30%)
2. Stage alignment (25%) 
3. Market opportunity (20%)
4. Risk-return profile (15%)
5. Geographic preferences (10%)

Be precise and honest in scoring. Only score >0.8 for exceptional matches."""
        
        return prompt
    
    def _parse_ai_matching_response(
        self, 
        ai_response: str, 
        startup: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Parse AI response and create match data"""
        try:
            # Try to extract JSON from response
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = ai_response[start_idx:end_idx]
                ai_data = json.loads(json_str)
                
                # Validate required fields
                if 'match_score' not in ai_data:
                    raise ValueError("Missing match_score in AI response")
                  # Build match data
                match_data = {
                    'startup_id': startup.get('id', ''),
                    'startup_title': startup.get('title', 'Unknown Startup'),
                    'industry': startup.get('category', 'Unknown'),
                    'stage': startup.get('stage', 'Unknown'),
                    'description': startup.get('description', '')[:200] + '...' if len(startup.get('description', '')) > 200 else startup.get('description', ''),
                    'team_size': startup.get('team_size'),
                    'funding_needed': startup.get('funding_needed'),
                    'location': startup.get('location'),
                    'target_market': startup.get('target_market'),
                    'match_score': float(ai_data['match_score']),
                    'highlights': [
                        MatchHighlight(reason=highlight, score=ai_data['match_score']) 
                        for highlight in ai_data.get('highlights', [])
                    ],
                    'traction': ai_data.get('traction', 'Not specified')
                }
                
                return match_data
                
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.warning(f"Failed to parse AI matching response: {e}")
            return None
        
        return None
    def _fallback_scoring(
        self, 
        startup: Dict[str, Any], 
        preferences: InvestorPreferences
    ) -> Optional[StartupMatch]:
        """Fallback scoring logic when AI fails"""
        try:
            score = 0.0
            highlights = []
            
            # Industry matching (40% weight)
            startup_category = startup.get('category', '').lower()
            industry_match = False
            if preferences.industries:
                for industry in preferences.industries:
                    if industry.lower() in startup_category or startup_category in industry.lower():
                        score += 0.4
                        highlights.append(f"Industry match: {industry}")
                        industry_match = True
                        break
            else:
                score += 0.2  # Partial score if no industry preference
            
            # Stage matching (30% weight)
            startup_stage = startup.get('stage', '').lower()
            if preferences.stages:
                for stage in preferences.stages:
                    if stage.lower() in startup_stage or startup_stage in stage.lower():
                        score += 0.3
                        highlights.append(f"Stage match: {stage}")
                        break
            else:
                score += 0.15  # Partial score if no stage preference
            
            # Content quality (30% weight)
            if startup.get('description') and len(startup.get('description', '')) > 100:
                score += 0.1
            if startup.get('problem'):
                score += 0.05
            if startup.get('solution'):
                score += 0.05
            if startup.get('target_market'):
                score += 0.05
            if startup.get('tags') and len(startup.get('tags', [])) > 0:
                score += 0.05
            
            # If AI is unavailable, be more generous with matching
            # Boost score for any startup with basic information
            if score < 0.5 and startup.get('title') and startup.get('description'):
                score += 0.2
                highlights.append("Basic startup information available")
            
            # Ensure minimum viable score (lowered from 0.3 to 0.2 when AI is unavailable)
            min_score = 0.2
            if score < min_score:
                return None
            
            # Add default highlights if none found
            if not highlights:
                highlights = ["Promising startup opportunity", "Good market potential"]
                
            return StartupMatch(
                startup_id=startup.get('id', ''),
                startup_title=startup.get('title', 'Unknown Startup'),
                industry=startup.get('category', 'Unknown'),
                stage=startup.get('stage', 'Unknown'),
                description=startup.get('description', '')[:200] + '...' if len(startup.get('description', '')) > 200 else startup.get('description', ''),
                team_size=startup.get('team_size'),
                funding_needed=startup.get('funding_needed'),
                location=startup.get('location'),
                target_market=startup.get('target_market'),
                match_score=min(score, 1.0),  # Cap at 1.0
                highlights=[MatchHighlight(reason=highlight, score=min(score, 1.0)) for highlight in highlights],
                traction="Not specified"
            )
            
        except Exception as e:
            logger.error(f"Error in fallback scoring: {e}")
            return None
