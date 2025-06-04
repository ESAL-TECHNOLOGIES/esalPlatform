"""
Investor router - Auth-protected API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query
from fastapi.security import HTTPBearer
from typing import Optional, List
import logging

from app.schemas import (
    InvestorDashboard, UserResponse, AIMatchingRequest, AIMatchingResponse,
    StartupMatch, InvestorPreferences, MatchingHistory, MatchingStatistics
)
from app.utils.roles import require_role
from app.services.supabase_profiles import SupabaseProfileService
from app.services.investor_matching import InvestorMatchingService
from app.services.investor_preferences import InvestorPreferencesService

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)


@router.get("/dashboard", response_model=InvestorDashboard)
async def investor_dashboard(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Investor dashboard - API-driven data only"""
    return InvestorDashboard(
        message=f"Welcome to Investor Dashboard, {current_user.full_name or current_user.email}!",
        stats={
            "portfolio_companies": 0,
            "total_investments": "$0",
            "active_deals": 0,
            "successful_exits": 0,
            "roi_average": "0%",
            "sectors_invested": []
        }
    )


@router.get("/opportunities")
async def view_opportunities(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """View investment opportunities - API-driven data only"""
    return {
        "opportunities": [],
        "total": 0
    }


@router.get("/portfolio")
async def view_portfolio(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """View current portfolio - API-driven data only"""
    return {
        "portfolio": [],
        "total_invested": "$0",
        "current_value": "$0"
    }


@router.get("/profile")
async def get_profile(
    current_user: UserResponse = Depends(require_role("investor")),
    token = Depends(security)
):
    """Get investor profile information"""
    try:
        # Extract token string from HTTPBearer object
        token_str = token.credentials
        profile_service = SupabaseProfileService(user_token=token_str)
        profile = await profile_service.get_or_create_profile(current_user.id, {
            "email": current_user.email,
            "full_name": current_user.full_name or "",
            "username": current_user.email.split("@")[0],
            "role": current_user.role
        })
        
        # Ensure profile has all the fields frontend expects
        complete_profile = {
            "id": profile.get("id", current_user.id),
            "email": current_user.email,
            "username": profile.get("username") or current_user.email.split("@")[0],
            "full_name": profile.get("full_name") or current_user.full_name or "",
            "role": current_user.role,
            "bio": profile.get("bio"),
            "location": profile.get("location"),
            "company": profile.get("company"),
            "position": profile.get("position"),
            "skills": profile.get("skills", []),
            "interests": profile.get("interests", []),
            "website_url": profile.get("website_url"),
            "linkedin_url": profile.get("linkedin_url"),
            "twitter_url": profile.get("twitter_url"),
            "github_url": profile.get("github_url"),
            "phone": profile.get("phone"),
            "avatar_url": profile.get("avatar_url"),
            "experience_years": profile.get("experience_years", 0),
            "education": profile.get("education"),
            "total_ideas": 0,  # Investors don't have ideas
            "total_views": 0,
            "total_interests": 0,
            "is_active": current_user.is_active,
            "is_blocked": current_user.is_blocked,
            "created_at": profile.get("created_at"),
            "updated_at": profile.get("updated_at")
        }
        
        return {"profile": complete_profile}
    except Exception as e:
        logger.error(f"Error fetching investor profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: UserResponse = Depends(require_role("investor")),
    token = Depends(security)
):
    """Update investor profile information"""
    try:
        # Extract token string from HTTPBearer object
        token_str = token.credentials
        profile_service = SupabaseProfileService(user_token=token_str)
        profile = await profile_service.update_profile(current_user.id, profile_data)
        return {"profile": profile}
    except Exception as e:
        logger.error(f"Error updating investor profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(require_role("investor")),
    token = Depends(security)
):
    """Upload investor avatar"""
    try:
        # Extract token string from HTTPBearer object
        token_str = token.credentials
        logger.info(f"Token extracted: {token_str[:20]}...")
        profile_service = SupabaseProfileService(user_token=token_str)
        
        # Read file content
        file_content = await file.read()
        
        # Upload avatar
        avatar_url = await profile_service.upload_avatar(
            user_id=current_user.id,
            file_content=file_content,
            filename=file.filename
        )
        
        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": avatar_url
        }
    except Exception as e:
        logger.error(f"Error uploading investor avatar: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/ai-matching", response_model=AIMatchingResponse)
async def ai_matching(
    matching_request: AIMatchingRequest,
    current_user: UserResponse = Depends(require_role("investor"))
):
    """AI-powered startup matching based on investor preferences"""
    import time
    start_time = time.time()
    
    try:
        logger.info(f"AI matching request from investor {current_user.id}")
          # Initialize services
        matching_service = InvestorMatchingService()
        preferences_service = InvestorPreferencesService()
          # Find matching startups
        service_response = await matching_service.find_matching_startups(
            request=matching_request,
            investor_id=current_user.id
        )
        
        # Extract matches from the service response
        matches = service_response.matches if service_response else []
          # Calculate matching statistics
        processing_time = time.time() - start_time
        total_startups_analyzed = service_response.matching_statistics.total_startups_analyzed if service_response else 0
        high_quality_matches = len([m for m in matches if m.match_score >= 0.8]) if matches else 0
        average_score = sum(m.match_score for m in matches) / len(matches) if matches else 0
        ai_confidence = 0.85  # TODO: Calculate from AI responses
        
        # Save matching history
        try:
            startup_ids = [str(match.startup_id) for match in matches] if matches else []
            await preferences_service.save_matching_history(
                user_id=current_user.id,
                preferences_used=matching_request.preferences,
                total_matches_found=len(matches),
                high_quality_matches=high_quality_matches,
                average_score=average_score,
                ai_confidence=ai_confidence,
                processing_time_seconds=processing_time,
                startup_ids_matched=startup_ids
            )
        except Exception as history_error:
            logger.warning(f"Failed to save matching history: {history_error}")
          # Create the response with the correct schema structure        
        matching_statistics = MatchingStatistics(
            total_startups_analyzed=total_startups_analyzed,
            high_quality_matches=high_quality_matches,
            average_score=round(average_score, 2),
            processing_time_seconds=round(processing_time, 3),
            ai_confidence=ai_confidence
        )
        
        response = AIMatchingResponse(
            matches=matches,
            total_matches=len(matches),
            matching_statistics=matching_statistics
        )
        
        logger.info(f"AI matching completed: {len(matches)} matches found in {processing_time:.2f}s")
        return response
        
    except Exception as e:
        logger.error(f"Error in AI matching: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI matching failed: {str(e)}"
        )


@router.get("/browse-startups")
async def browse_startups(
    industry: Optional[str] = None,
    stage: Optional[str] = None,
    limit: Optional[int] = 20,
    offset: Optional[int] = 0,
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Browse public startup ideas with filtering options"""
    try:
        from app.services.supabase_ideas import SupabaseIdeasService
        
        logger.info(f"Browsing startups for investor {current_user.id}")
        
        # Initialize the ideas service
        ideas_service = SupabaseIdeasService()
        
        # Get public startup ideas
        public_ideas = await ideas_service.get_ideas_list(
            user_id=None,  # Get all public ideas, not user-specific
            visibility_filter="public",
            limit=limit + offset if limit else None
        )
        
        # Apply filters
        filtered_ideas = []
        for idea in public_ideas:
            # Industry filter
            if industry and idea.get('category', '').lower() != industry.lower():
                continue
            
            # Stage filter (if we add stage field later)
            if stage and idea.get('stage', '').lower() != stage.lower():
                continue
                
            filtered_ideas.append(idea)
        
        # Apply pagination
        paginated_ideas = filtered_ideas[offset:offset + limit] if limit else filtered_ideas
        
        # Transform for frontend
        startup_list = []
        for idea in paginated_ideas:
            startup_list.append({
                "id": idea.get("id"),
                "title": idea.get("title"),
                "description": idea.get("description"),
                "industry": idea.get("category", "Technology"),
                "stage": idea.get("stage", "Ideation"),
                "target_market": idea.get("target_market", ""),
                "problem": idea.get("problem", ""),
                "solution": idea.get("solution", ""),
                "funding_needed": "",  # TODO: Add funding_needed field
                "team_size": 1,  # TODO: Add team_size field
                "created_at": idea.get("created_at"),
                "views_count": idea.get("views_count", 0),
                "interests_count": idea.get("interests_count", 0),
                "innovator_id": idea.get("user_id"),
                "ai_score": idea.get("ai_score")
            })
        
        return {
            "startups": startup_list,
            "total": len(filtered_ideas),
            "offset": offset,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Error browsing startups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to browse startups: {str(e)}"
        )


@router.get("/startup-details/{startup_id}")
async def get_startup_details(
    startup_id: str,
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Get detailed information about a specific startup"""
    try:
        from app.services.supabase_ideas import SupabaseIdeasService
        
        logger.info(f"Fetching startup details for {startup_id}")
        
        # Initialize the ideas service
        ideas_service = SupabaseIdeasService()
        
        # Get all public ideas to find the specific one
        public_ideas = await ideas_service.get_ideas_list(
            user_id=None,
            visibility_filter="public"
        )
        
        # Find the specific startup
        startup = None
        for idea in public_ideas:
            if str(idea.get("id")) == startup_id:
                startup = idea
                break
        
        if not startup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Startup not found or not public"
            )
        
        # Increment view count
        await ideas_service.increment_view_count(startup_id)
        
        # Get innovator profile information (if available)
        innovator_info = {
            "id": startup.get("user_id"),
            "name": "Anonymous Innovator",  # TODO: Get from profiles
            "bio": "",
            "experience": "",
            "contact_info": {}
        }
        
        startup_details = {
            "id": startup.get("id"),
            "title": startup.get("title"),
            "description": startup.get("description"),
            "industry": startup.get("category", "Technology"),
            "stage": startup.get("stage", "Ideation"),
            "target_market": startup.get("target_market", ""),
            "problem": startup.get("problem", ""),
            "solution": startup.get("solution", ""),
            "funding_needed": "",  # TODO: Add funding_needed field
            "team_size": 1,  # TODO: Add team_size field
            "created_at": startup.get("created_at"),
            "updated_at": startup.get("updated_at"),
            "views_count": startup.get("views_count", 0) + 1,  # Include the increment
            "interests_count": startup.get("interests_count", 0),
            "ai_score": startup.get("ai_score"),
            "tags": startup.get("tags", []),
            "innovator": innovator_info,
            "files": [],  # TODO: Get associated files
            "milestones": [],  # TODO: Add milestones
            "financials": {}  # TODO: Add financial projections
        }
        
        return startup_details
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching startup details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch startup details: {str(e)}"
        )


# ========================================
# INVESTOR PREFERENCES ENDPOINTS
# ========================================

@router.post("/preferences")
async def save_investor_preferences(
    preferences_data: dict,
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Save investor matching preferences"""
    try:
        preferences_service = InvestorPreferencesService()
        
        # Extract preferences and metadata
        preferences = InvestorPreferences(**preferences_data.get("preferences", {}))
        preferences_name = preferences_data.get("name", "Default")
        is_default = preferences_data.get("is_default", True)
        
        result = await preferences_service.save_preferences(
            user_id=current_user.id,
            preferences=preferences,
            preferences_name=preferences_name,
            is_default=is_default
        )
        
        return {
            "message": "Preferences saved successfully",
            "preferences_id": result.get("id"),
            "preferences_name": preferences_name
        }
        
    except Exception as e:
        logger.error(f"Error saving investor preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save preferences: {str(e)}"
        )


@router.get("/preferences")
async def get_investor_preferences(
    preferences_name: Optional[str] = None,
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Get investor matching preferences"""
    try:
        preferences_service = InvestorPreferencesService()
        
        if preferences_name:
            preferences = await preferences_service.get_preferences(
                user_id=current_user.id,
                preferences_name=preferences_name
            )
        else:
            # Get default preferences
            preferences = await preferences_service.get_preferences(
                user_id=current_user.id
            )
        
        if preferences:
            return {
                "preferences": preferences.dict(),
                "preferences_name": preferences_name or "Default"
            }
        else:
            # Return default empty preferences
            return {
                "preferences": InvestorPreferences().dict(),
                "preferences_name": "Default"
            }
        
    except Exception as e:
        logger.error(f"Error getting investor preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get preferences: {str(e)}"
        )


@router.get("/preferences/all")
async def get_all_investor_preferences(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Get all saved investor preferences"""
    try:
        preferences_service = InvestorPreferencesService()
        all_preferences = await preferences_service.get_all_preferences(current_user.id)
        
        return {
            "preferences_list": all_preferences,
            "total": len(all_preferences)
        }
        
    except Exception as e:
        logger.error(f"Error getting all investor preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get all preferences: {str(e)}"
        )


@router.delete("/preferences/{preferences_name}")
async def delete_investor_preferences(
    preferences_name: str,
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Delete specific investor preferences"""
    try:
        preferences_service = InvestorPreferencesService()
        success = await preferences_service.delete_preferences(
            user_id=current_user.id,
            preferences_name=preferences_name
        )
        
        if success:
            return {"message": f"Preferences '{preferences_name}' deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Preferences '{preferences_name}' not found"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting investor preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete preferences: {str(e)}"
        )


# ========================================
# MATCHING HISTORY ENDPOINTS
# ========================================

@router.get("/matching-history")
async def get_matching_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Get investor matching history"""
    try:
        preferences_service = InvestorPreferencesService()
        history = await preferences_service.get_matching_history(
            user_id=current_user.id,
            limit=limit
        )
        
        return {
            "history": history,
            "total": len(history)
        }
        
    except Exception as e:
        logger.error(f"Error getting matching history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get matching history: {str(e)}"
        )


# ========================================
# CONNECTION MANAGEMENT ENDPOINTS
# ========================================

@router.post("/express-interest")
async def express_interest_enhanced(
    interest_data: dict,
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Express interest in a startup (enhanced version)"""
    try:
        startup_id = interest_data.get("startup_id")
        message = interest_data.get("message", "")
        
        if not startup_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Startup ID is required"
            )
        
        # Get startup details to find owner
        from app.services.supabase_ideas import SupabaseIdeasService
        ideas_service = SupabaseIdeasService()
        
        public_ideas = await ideas_service.get_ideas_list(
            user_id=None,
            visibility_filter="public"
        )
        
        startup = None
        for idea in public_ideas:
            if str(idea.get("id")) == str(startup_id):
                startup = idea
                break
        
        if not startup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Startup not found or not public"
            )
        
        preferences_service = InvestorPreferencesService()
        result = await preferences_service.express_interest(
            investor_user_id=current_user.id,
            startup_idea_id=int(startup_id),
            startup_owner_user_id=startup["user_id"],
            message=message
        )
        
        logger.info(f"Investor {current_user.id} expressed interest in startup {startup_id}")
        
        return {
            "message": "Interest expressed successfully",
            "connection_id": result.get("id"),
            "startup_id": startup_id,
            "status": "pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error expressing interest: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to express interest: {str(e)}"
        )


@router.get("/connection-requests")
async def get_connection_requests_enhanced(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Get all connection requests for the investor (enhanced version)"""
    try:
        preferences_service = InvestorPreferencesService()
        requests = await preferences_service.get_connection_requests(
            user_id=current_user.id,
            as_investor=True
        )
        
        return {
            "requests": requests,
            "total": len(requests)
        }
        
    except Exception as e:
        logger.error(f"Error fetching connection requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch connection requests: {str(e)}"
        )


@router.get("/stats")
async def get_investor_stats(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Get investor matching and connection statistics"""
    try:
        preferences_service = InvestorPreferencesService()
        stats = await preferences_service.get_investor_stats(current_user.id)
        
        return {
            "stats": stats,
            "investor_id": current_user.id
        }
        
    except Exception as e:
        logger.error(f"Error getting investor stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get investor stats: {str(e)}"
        )

