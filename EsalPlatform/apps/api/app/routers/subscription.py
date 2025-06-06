"""
Subscription Management API Routes
Handles subscription plans and user subscriptions
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import logging
from datetime import datetime, timedelta

from app.utils.jwt import get_current_user
from app.services.subscription_manager import SubscriptionService
from app.schemas import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class SubscriptionPlan(BaseModel):
    id: int
    name: str
    price: float
    currency: str
    duration_months: int
    description: Optional[str] = None
    features: Optional[dict] = None
    is_active: bool

class UserSubscriptionResponse(BaseModel):
    id: int
    user_id: str
    plan: SubscriptionPlan
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    created_at: datetime
    usage_this_month: Optional[dict] = None

# Simplified subscription management models
class SubscriptionRequest(BaseModel):
    plan_id: int

class SubscriptionResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[int] = None

class UsageResponse(BaseModel):
    plan_limits: dict
    current_usage: dict
    remaining_usage: dict
    reset_date: datetime

# Subscription Plans Endpoints
@router.get("/plans", response_model=List[SubscriptionPlan])
async def get_subscription_plans():
    """Get all available subscription plans"""
    try:
        subscription_service = SubscriptionService()
        plans = await subscription_service.get_all_subscription_plans()
        return plans
    except Exception as e:
        logger.error(f"Error fetching subscription plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscription plans"
        )

@router.get("/plans/{plan_id}", response_model=SubscriptionPlan)
async def get_subscription_plan(plan_id: int):
    """Get a specific subscription plan by ID"""
    try:
        subscription_service = SubscriptionService()
        plan = await subscription_service.get_plan_by_id(plan_id)
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription plan not found"
            )
        return plan
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching subscription plan {plan_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscription plan"
        )

# User Subscription Endpoints
@router.get("/my-subscription", response_model=UserSubscriptionResponse)
async def get_my_subscription(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get current user's subscription details"""
    try:
        subscription_service = SubscriptionService()
        subscription = await subscription_service.get_user_subscription(current_user.id)
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No subscription found"
            )
        
        return subscription
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user subscription for {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscription"
        )

@router.get("/usage", response_model=UsageResponse)
async def get_usage_stats(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get current user's usage statistics and limits"""
    try:
        subscription_service = SubscriptionService()
        usage_data = await subscription_service.get_user_usage_stats(current_user.id)
        
        return usage_data
    except Exception as e:
        logger.error(f"Error fetching usage stats for {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch usage statistics"
        )

# Subscription Management Endpoints
@router.post("/subscribe", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_request: SubscriptionRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new subscription (for development/testing - no payment required)"""
    try:
        # Validate the plan exists
        subscription_service = SubscriptionService()
        plan = await subscription_service.get_plan_by_id(subscription_request.plan_id)
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription plan not found"
            )
        
        # Check if user already has an active subscription to this plan
        current_subscription = await subscription_service.get_user_subscription(current_user.id)
        if current_subscription and current_subscription.get('plan', {}).get('id') == subscription_request.plan_id:
            if current_subscription.get('status') == 'active':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You already have an active subscription to this plan"
                )
        
        # Create subscription directly (without payment processing)
        subscription_id = await subscription_service.create_subscription(
            user_id=current_user.id,
            plan_id=subscription_request.plan_id
        )
        
        return SubscriptionResponse(
            success=True,
            message="Subscription activated successfully",
            subscription_id=subscription_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )

@router.post("/upgrade", response_model=SubscriptionResponse)
async def upgrade_subscription(
    subscription_request: SubscriptionRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """Upgrade to a higher-tier subscription plan"""
    try:
        subscription_service = SubscriptionService()
        
        # Get current subscription
        current_subscription = await subscription_service.get_user_subscription(current_user.id)
        if not current_subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No current subscription found"
            )
        
        # Validate new plan
        new_plan = await subscription_service.get_plan_by_id(subscription_request.plan_id)
        if not new_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target subscription plan not found"
            )
        
        current_plan = current_subscription.get('plan', {})
        
        # Check if it's actually an upgrade
        if new_plan['price'] <= current_plan.get('price', 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New plan must be higher tier than current plan"
            )
        
        # Upgrade subscription directly (without payment processing)
        success = await subscription_service.upgrade_subscription(
            user_id=current_user.id,
            new_plan_id=subscription_request.plan_id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upgrade subscription"
            )
        
        return SubscriptionResponse(
            success=True,
            message="Subscription upgraded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upgrading subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process upgrade"
        )

@router.post("/cancel")
async def cancel_subscription(
    current_user: UserResponse = Depends(get_current_user)
):
    """Cancel current subscription (will remain active until end of billing period)"""
    try:
        subscription_service = SubscriptionService()
        
        success = await subscription_service.cancel_subscription(current_user.id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active subscription found to cancel"
            )
        
        return {"message": "Subscription cancelled successfully", "status": "cancelled"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"        )

# Subscription History
@router.get("/subscription-history")
async def get_subscription_history(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user's subscription history"""
    try:
        subscription_service = SubscriptionService()
        subscription_history = await subscription_service.get_subscription_history(current_user.id)
        
        return {"subscriptions": subscription_history}
        
    except Exception as e:
        logger.error(f"Error fetching subscription history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscription history"
        )

# Admin endpoints (if needed)
@router.get("/admin/subscriptions")
async def get_all_subscriptions(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all user subscriptions (admin only)"""
    # Add admin role check here
    if not hasattr(current_user, 'role') or current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        subscription_service = SubscriptionService()
        subscriptions = await subscription_service.get_all_subscriptions()
        
        return {"subscriptions": subscriptions}
        
    except Exception as e:
        logger.error(f"Error fetching all subscriptions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch subscriptions"
        )
