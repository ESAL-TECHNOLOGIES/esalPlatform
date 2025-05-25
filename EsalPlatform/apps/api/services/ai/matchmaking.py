"""
Module for AI-powered matchmaking functionality.
"""

from typing import Dict, List, Optional, Set, Tuple, TypeVar, Generic, Any
import json
from pydantic import BaseModel, Field
from services.ai.client import GeminiClient, OpenAIClient

# Type definitions
User = TypeVar('User', bound=Dict[str, Any])
Match = Tuple[User, User, float]

class MatchCriteria(BaseModel):
    """Model for match criteria configuration."""
    importance_weights: Dict[str, float] = Field(
        default_factory=lambda: {"skills": 0.4, "interests": 0.3, "availability": 0.2, "location": 0.1}
    )
    min_match_score: float = Field(default=0.6, ge=0, le=1.0)
    max_matches_per_user: int = Field(default=3, ge=1)


class MatchResult(BaseModel):
    """Model for match results."""
    user_id1: str
    user_id2: str
    score: float = Field(ge=0, le=1.0)
    match_reasons: List[str] = Field(default_factory=list)
    compatibility_areas: Dict[str, float] = Field(default_factory=dict)


class MatchmakingEngine:
    """Matchmaking service using AI for optimal matching."""
    
    def __init__(self, llm_client: Optional[Any] = None):
        """
        Initialize the matchmaking engine with an LLM client.
        
        Args:
            llm_client: Either GeminiClient or OpenAIClient instance
        """
        self.llm = llm_client
        if self.llm is None:
            # Try to use Gemini by default, fall back to OpenAI
            try:
                self.llm = GeminiClient()
            except ValueError:
                try:
                    self.llm = OpenAIClient()
                except ValueError:
                    raise ValueError("No valid AI client could be initialized")
        
    async def find_matches(self, users: List[Dict[str, Any]], 
                          criteria: Optional[MatchCriteria] = None) -> List[MatchResult]:
        """
        Find optimal matches between users based on specified criteria.
        
        This function uses AI to analyze user profiles and find the best possible
        matches according to the given criteria.
        
        Args:
            users: List of user data dictionaries
            criteria: Optional matching criteria configuration
            
        Returns:
            List of MatchResult objects representing the matches
        """
        if len(users) < 2:
            return []
            
        criteria = criteria or MatchCriteria()
        
        # In production, we would use sophisticated AI matching logic here
        # This is a simplified implementation that simulates AI matching
        matches = []
        used_users: Set[str] = set()
        
        for i, user1 in enumerate(users):
            if user1["id"] in used_users:
                continue
                
            user_matches = []
            for j, user2 in enumerate(users):
                if i == j or user2["id"] in used_users:
                    continue
                
                # Calculate match score based on criteria
                # In production, this would be done by the LLM
                score = self._calculate_match_score(user1, user2, criteria)
                
                if score >= criteria.min_match_score:
                    user_matches.append(MatchResult(
                        user_id1=user1["id"],
                        user_id2=user2["id"],
                        score=score,
                        match_reasons=self._generate_match_reasons(user1, user2),
                        compatibility_areas=self._calculate_compatibility_areas(user1, user2, criteria)
                    ))
            
            # Sort matches by score and pick the top ones
            user_matches.sort(key=lambda m: m.score, reverse=True)
            top_matches = user_matches[:criteria.max_matches_per_user]
            
            if top_matches:
                matches.extend(top_matches)
                # Mark users as used
                used_users.add(user1["id"])
                for match in top_matches:
                    used_users.add(match.user_id2)
        
        return matches
    
    def _calculate_match_score(self, user1: Dict[str, Any], 
                              user2: Dict[str, Any], 
                              criteria: MatchCriteria) -> float:
        """Calculate match score between two users based on criteria."""
        # In production, this would use the LLM for more sophisticated matching
        # Here's a simple implementation for demonstration
        score = 0.0
        
        if "skills" in user1 and "skills" in user2:
            common_skills = set(user1["skills"]) & set(user2["skills"])
            skills_score = len(common_skills) / max(len(user1["skills"]), len(user2["skills"]), 1)
            score += skills_score * criteria.importance_weights.get("skills", 0.4)
            
        if "interests" in user1 and "interests" in user2:
            common_interests = set(user1["interests"]) & set(user2["interests"])
            interests_score = len(common_interests) / max(len(user1["interests"]), len(user2["interests"]), 1)
            score += interests_score * criteria.importance_weights.get("interests", 0.3)
            
        # Add more criteria as needed
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _generate_match_reasons(self, user1: Dict[str, Any], user2: Dict[str, Any]) -> List[str]:
        """Generate human-readable reasons for the match."""
        reasons = []
        
        # In production, this would use the LLM to generate reasons
        # Here's a simplified implementation
        if "skills" in user1 and "skills" in user2:
            common_skills = set(user1["skills"]) & set(user2["skills"])
            if common_skills:
                reasons.append(f"Shared skills: {', '.join(sorted(common_skills)[:3])}")
                
        if "interests" in user1 and "interests" in user2:
            common_interests = set(user1["interests"]) & set(user2["interests"])
            if common_interests:
                reasons.append(f"Similar interests: {', '.join(sorted(common_interests)[:3])}")
        
        return reasons
    
    def _calculate_compatibility_areas(self, user1: Dict[str, Any], 
                                      user2: Dict[str, Any],
                                      criteria: MatchCriteria) -> Dict[str, float]:
        """Calculate compatibility scores for different areas."""
        # In production, this would use the LLM for more nuanced analysis
        compatibility = {}
        
        if "skills" in user1 and "skills" in user2:
            common_skills = set(user1["skills"]) & set(user2["skills"])
            compatibility["skills"] = len(common_skills) / max(len(user1["skills"]), len(user2["skills"]), 1)
            
        if "interests" in user1 and "interests" in user2:
            common_interests = set(user1["interests"]) & set(user2["interests"])
            compatibility["interests"] = len(common_interests) / max(len(user1["interests"]), len(user2["interests"]), 1)
        
        # Add more areas as needed
        
        return compatibility
    
    async def get_ai_recommendation(self, user: Dict[str, Any], matches: List[MatchResult]) -> str:
        """Get AI-generated recommendation for a user based on their matches."""
        if not matches:
            return "No matches found for your profile."
            
        # In production, this would use the LLM to generate a personalized recommendation
        # Here we would call self.llm.generate_text() with a proper prompt
        
        match_info = []
        for match in matches[:3]:  # Limit to top 3 matches for the recommendation
            match_user_id = match.user_id2 if user["id"] == match.user_id1 else match.user_id1
            match_info.append(f"Match with user {match_user_id}: {match.score:.2f} score")
            if match.match_reasons:
                match_info.append(f"  Reasons: {', '.join(match.match_reasons)}")
                
        recommendation = "Based on your profile, we recommend the following matches:\n"
        recommendation += "\n".join(match_info)
        
        return recommendation