"""
Hub router - Auth-protected dummy dashboard
"""
from fastapi import APIRouter, Depends

from app.schemas import HubDashboard, UserResponse
from app.utils.roles import require_role

router = APIRouter()


@router.get("/dashboard", response_model=HubDashboard)
async def hub_dashboard(
    current_user: UserResponse = Depends(require_role("hub"))
):
    """Hub dashboard with dummy data"""
    return HubDashboard(
        message=f"Welcome to Hub Dashboard, {current_user.full_name or current_user.email}!",
        stats={
            "connected_startups": 25,
            "active_programs": 8,
            "upcoming_events": 12,
            "member_count": 150,
            "partnerships": 5,
            "success_stories": 3
        }
    )


@router.get("/startups")
async def view_startups(
    current_user: UserResponse = Depends(require_role("hub"))
):
    """View connected startups (dummy data)"""
    return {
        "startups": [
            {
                "id": 1,
                "name": "EcoTech Solutions",
                "stage": "Seed",
                "industry": "CleanTech",
                "pitch": "Revolutionizing waste management with AI"
            },
            {
                "id": 2,
                "name": "HealthAI",
                "stage": "Series A",
                "industry": "HealthTech",
                "pitch": "AI-powered diagnostic platform"
            },
            {
                "id": 3,
                "name": "FinFlow",
                "stage": "Pre-seed",
                "industry": "FinTech",
                "pitch": "Blockchain-based payment solutions"
            }
        ],
        "total": 3
    }


@router.get("/programs")
async def view_programs(
    current_user: UserResponse = Depends(require_role("hub"))
):
    """View active programs (dummy data)"""
    return {
        "programs": [
            {
                "id": 1,
                "name": "Innovation Accelerator",
                "duration": "3 months",
                "participants": 12,
                "status": "Active"
            },
            {
                "id": 2,
                "name": "Tech Incubator",
                "duration": "6 months",
                "participants": 8,
                "status": "Starting Soon"
            }
        ],
        "total": 2
    }
