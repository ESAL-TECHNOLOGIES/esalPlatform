#!/usr/bin/env python3
"""
Debug script to test the AI matching service specifically
"""
import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

from app.services.investor_matching import InvestorMatchingService
from app.schemas import AIMatchingRequest, InvestorPreferences

async def debug_ai_matching():
    """Debug the AI matching service specifically"""
    print("🔍 DEBUG: Testing AI Matching Service")
    print("="*60)
    
    try:
        # Initialize the service
        matching_service = InvestorMatchingService()
        print("✅ AI Matching Service initialized successfully")
        
        # 1. Test _get_startup_ideas method directly
        print("\n1. Testing _get_startup_ideas method:")
        startup_ideas = await matching_service._get_startup_ideas()
        print(f"   _get_startup_ideas returned: {len(startup_ideas)} ideas")
        
        if startup_ideas:
            print("   Startup ideas found:")
            for idea in startup_ideas:
                print(f"     - ID: {idea.get('id')}, Title: {idea.get('title')}, Status: {idea.get('status')}, Visibility: {idea.get('visibility')}")
        else:
            print("   ❌ No startup ideas returned by _get_startup_ideas")
            
            # Debug further - check the raw ideas
            print("\n   Debugging _get_startup_ideas...")
            ideas = await matching_service.ideas_service.get_ideas_list(
                user_id=None,
                visibility_filter="public",
                limit=1000
            )
            print(f"   Raw ideas from get_ideas_list: {len(ideas)}")
            
            for idea in ideas:
                visibility = idea.get('visibility')
                status = idea.get('status')
                is_visible = visibility in ['public', 'public_ideas']
                is_not_archived = status != 'archived'
                print(f"     - ID: {idea.get('id')}, Visibility: {visibility} (valid: {is_visible}), Status: {status} (not archived: {is_not_archived})")
        
        # 2. Test full AI matching with sample preferences
        print("\n2. Testing full AI matching:")
        sample_preferences = InvestorPreferences(
            industries=["AI/ML", "FinTech"],
            stages=["Seed", "Series A"],
            min_funding_amount=10000,
            max_funding_amount=1000000,
            geographic_preferences=["North America"],
            risk_tolerance="medium",
            investment_timeline="6_months"
        )
        
        sample_request = AIMatchingRequest(
            preferences=sample_preferences,
            top_k=10,
            min_score=0.1  # Very low threshold to get any matches
        )
        
        print(f"   Sample preferences: {sample_preferences}")
        result = await matching_service.find_matching_startups(
            request=sample_request,
            investor_id="test-investor-123"
        )
        
        print(f"   AI Matching result:")
        print(f"     - Matches found: {len(result.matches)}")
        print(f"     - Total found: {result.total_found}")
        print(f"     - High quality: {result.high_quality_matches}")
        print(f"     - Perfect matches: {result.perfect_matches}")
        
        if result.matches:
            print("   Match details:")
            for match in result.matches:
                print(f"     - Startup: {match.startup_title}, Score: {match.match_score:.2f}")
        
    except Exception as e:
        print(f"❌ Error during AI matching debug: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_ai_matching())
