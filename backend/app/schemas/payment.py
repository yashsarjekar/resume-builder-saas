"""
Pydantic schemas for payment-related requests and responses.

This module defines all data validation models for payment operations
including Razorpay order creation, verification, and subscriptions.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class PaymentStatus(str, Enum):
    """Payment status enum."""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubscriptionPlan(str, Enum):
    """Subscription plan enum."""
    STARTER = "starter"
    PRO = "pro"


class CreateOrderRequest(BaseModel):
    """
    Schema for creating a Razorpay order or subscription.

    Attributes:
        plan: Subscription plan to purchase (starter/pro)
        duration_months: Subscription duration in months (1, 3, 6, 12)
        recurring: Whether to enable auto-renewal (default: False)
                  If True, creates a recurring subscription
                  If False, creates a one-time payment
    """
    plan: SubscriptionPlan
    duration_months: int = Field(..., ge=1, le=12, description="Duration in months")
    recurring: bool = Field(default=False, description="Enable auto-renewal")

    @field_validator('duration_months')
    @classmethod
    def validate_duration(cls, v: int) -> int:
        """Validate duration is in allowed values."""
        allowed = [1, 3, 6, 12]
        if v not in allowed:
            raise ValueError(f'Duration must be one of {allowed}')
        return v


class CreateOrderResponse(BaseModel):
    """
    Schema for Razorpay order/subscription creation response.

    Attributes:
        order_id: Razorpay order ID or subscription ID
        amount: Order amount in paise
        currency: Currency code (INR)
        plan: Subscription plan
        duration_months: Duration in months
        key_id: Razorpay key ID for frontend
        recurring: Whether this is a recurring subscription
        subscription_id: Razorpay subscription ID (only if recurring)
    """
    order_id: str
    amount: int
    currency: str = "INR"
    plan: str
    duration_months: int
    key_id: str
    recurring: bool = False
    subscription_id: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    """
    Schema for payment verification.

    Attributes:
        razorpay_order_id: Order ID from Razorpay
        razorpay_payment_id: Payment ID from Razorpay
        razorpay_signature: Payment signature for verification
    """
    razorpay_order_id: str = Field(..., min_length=1)
    razorpay_payment_id: str = Field(..., min_length=1)
    razorpay_signature: str = Field(..., min_length=1)


class VerifyPaymentResponse(BaseModel):
    """
    Schema for payment verification response.

    Attributes:
        success: Whether payment was verified successfully
        message: Response message
        subscription_type: Updated subscription type
        subscription_expiry: Subscription expiry date
        payment_id: Payment record ID
    """
    success: bool
    message: str
    subscription_type: str
    subscription_expiry: datetime
    payment_id: int


class PaymentResponse(BaseModel):
    """
    Schema for payment record response.

    Attributes:
        id: Payment record ID
        user_id: User ID
        razorpay_order_id: Razorpay order ID
        razorpay_payment_id: Razorpay payment ID (if completed)
        amount: Payment amount in paise
        currency: Currency code
        status: Payment status
        plan: Subscription plan
        duration_months: Duration in months
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    id: int
    user_id: int
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    amount: int
    currency: str
    status: str
    plan: str
    duration_months: int
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class PaymentHistoryResponse(BaseModel):
    """
    Schema for payment history.

    Attributes:
        payments: List of payments
        total: Total number of payments
    """
    payments: list[PaymentResponse]
    total: int


class WebhookEvent(BaseModel):
    """
    Schema for Razorpay webhook event.

    Attributes:
        event: Event type
        payload: Event payload
    """
    event: str
    payload: Dict[str, Any]


class SubscriptionDetails(BaseModel):
    """
    Schema for detailed subscription information.

    Attributes:
        subscription_type: Current subscription type
        subscription_expiry: Expiry date (if applicable)
        is_active: Whether subscription is active
        days_remaining: Days until expiry (if applicable)
        resume_limit: Resume creation limit
        ats_analysis_limit: ATS analysis limit
        resume_count: Current resume count
        ats_analysis_count: Current ATS analysis count
    """
    subscription_type: str
    subscription_expiry: Optional[datetime] = None
    is_active: bool
    days_remaining: Optional[int] = None
    resume_limit: int
    ats_analysis_limit: int
    resume_count: int
    ats_analysis_count: int


class PricingPlan(BaseModel):
    """
    Schema for pricing plan information.

    Attributes:
        plan: Plan name
        monthly_price: Monthly price in INR
        quarterly_price: Quarterly price in INR
        half_yearly_price: Half-yearly price in INR
        yearly_price: Yearly price in INR
        features: List of features
        resume_limit: Resume creation limit
        ats_analysis_limit: ATS analysis limit
        is_popular: Whether this is the most popular plan
    """
    plan: str
    monthly_price: int
    quarterly_price: int
    half_yearly_price: int
    yearly_price: int
    features: list[str]
    resume_limit: int
    ats_analysis_limit: int
    is_popular: bool = False


class PricingResponse(BaseModel):
    """
    Schema for pricing information.

    Attributes:
        plans: Available pricing plans
        currency: Currency code
    """
    plans: list[PricingPlan]
    currency: str = "INR"
