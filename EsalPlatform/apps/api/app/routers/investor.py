"""
Investor router - Auth-protected dummy dashboard
"""
from fastapi import APIRouter, Depends

from app.schemas import InvestorDashboard, UserResponse
from app.utils.roles import require_role

router = APIRouter()


@router.get("/dashboard", response_model=InvestorDashboard)
async def investor_dashboard(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """Investor dashboard with dummy data"""
    return InvestorDashboard(
        message=f"Welcome to Investor Dashboard, {current_user.full_name or current_user.email}!",
        stats={
            "portfolio_companies": 12,
            "total_investments": "$2.5M",
            "active_deals": 5,
            "successful_exits": 3,
            "roi_average": "15.2%",
            "sectors_invested": ["FinTech", "HealthTech", "CleanTech", "EdTech"]
        }
    )


@router.get("/opportunities")
async def view_opportunities(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """View investment opportunities (dummy data)"""
    return {
        "opportunities": [
            {
                "id": 1,
                "startup_name": "MedTech Innovations",
                "stage": "Series A",
                "seeking": "$1.5M",
                "valuation": "$8M",
                "industry": "HealthTech",
                "pitch_summary": "AI-powered medical imaging for early cancer detection"
            },
            {
                "id": 2,
                "startup_name": "GreenEnergy Pro",
                "stage": "Seed",
                "seeking": "$500K",
                "valuation": "$3M",
                "industry": "CleanTech",
                "pitch_summary": "Solar panel efficiency optimization platform"
            },
            {
                "id": 3,
                "startup_name": "EduNext",
                "stage": "Pre-seed",
                "seeking": "$250K",
                "valuation": "$1.2M",
                "industry": "EdTech",
                "pitch_summary": "Personalized learning platform using adaptive AI"
            }
        ],
        "total": 3
    }


@router.get("/portfolio")
async def view_portfolio(
    current_user: UserResponse = Depends(require_role("investor"))
):
    """View current portfolio (dummy data)"""
    return {
        "portfolio": [
            {
                "id": 1,
                "company": "TechStart Inc.",
                "investment_amount": "$200K",
                "investment_date": "2023-06-15",
                "current_valuation": "$2.5M",
                "status": "Growing",
                "industry": "FinTech"
            },
            {
                "id": 2,
                "company": "HealthCore",
                "investment_amount": "$150K",
                "investment_date": "2023-03-20",
                "current_valuation": "$1.8M",
                "status": "Stable",
                "industry": "HealthTech"
            }
        ],
        "total_invested": "$2.5M",
        "current_value": "$5.2M"
    }
