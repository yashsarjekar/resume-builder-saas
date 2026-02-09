"""
Razorpay Payment Service for Resume Builder.

This module handles all Razorpay payment operations including order creation,
payment verification, subscription management, and webhook processing.
"""

import razorpay
import hmac
import hashlib
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from app.config import get_settings

settings = get_settings()
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    PaymentStatus,
    SubscriptionPlan,
    PricingPlan,
    PricingResponse,
)

logger = logging.getLogger(__name__)


class RazorpayService:
    """Service for handling Razorpay payment operations."""

    # Pricing in INR (Indian Rupees) - Affordable for Indian market
    PRICING = {
        "starter": {
            1: 299,      # Monthly - Perfect for job seekers
            3: 799,      # Quarterly (11% discount)
            6: 1499,     # Half-yearly (16% discount)
            12: 2799,    # Yearly (22% discount) - ₹233/month
        },
        "pro": {
            1: 999,      # Monthly - Best value for professionals
            3: 2699,     # Quarterly (10% discount)
            6: 4999,     # Half-yearly (17% discount)
            12: 8999,    # Yearly (25% discount) - ₹749/month
        }
    }

    # Plan features and limits
    PLAN_FEATURES = {
        "starter": {
            "resume_limit": 5,
            "ats_analysis_limit": 10,
            "features": [
                "5 Resume Creations",
                "10 ATS Analyses",
                "50 AI Assists per day",
                "AI Resume Optimization",
                "Cover Letter Generator",
                "Keyword Extraction",
                "4 Premium Templates",
                "Email Support"
            ],
            "is_popular": False
        },
        "pro": {
            "resume_limit": -1,  # Unlimited
            "ats_analysis_limit": -1,  # Unlimited
            "features": [
                "Unlimited Resume Creations",
                "Unlimited ATS Analyses",
                "Unlimited AI Assists",
                "AI Resume Optimization",
                "Cover Letter Generator",
                "LinkedIn Profile Optimizer",
                "Keyword Extraction",
                "4 Premium Templates",
                "Priority Email Support",
                "Early Access to Features"
            ],
            "is_popular": True
        }
    }

    def __init__(self):
        """Initialize Razorpay client."""
        self.client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        logger.info("Razorpay service initialized")

    def get_pricing_info(self) -> PricingResponse:
        """
        Get pricing information for all plans.

        Returns:
            PricingResponse: Pricing information for display
        """
        plans = []
        for plan_name, pricing in self.PRICING.items():
            plan_info = self.PLAN_FEATURES[plan_name]
            plans.append(PricingPlan(
                plan=plan_name,
                monthly_price=pricing[1],
                quarterly_price=pricing[3],
                half_yearly_price=pricing[6],
                yearly_price=pricing[12],
                features=plan_info["features"],
                resume_limit=plan_info["resume_limit"],
                ats_analysis_limit=plan_info["ats_analysis_limit"],
                is_popular=plan_info["is_popular"]
            ))

        return PricingResponse(plans=plans, currency="INR")

    def calculate_amount(self, plan: str, duration_months: int) -> int:
        """
        Calculate payment amount for a plan and duration.

        Args:
            plan: Plan name (starter/pro)
            duration_months: Duration in months (1, 3, 6, 12)

        Returns:
            int: Amount in paise (100 paise = 1 INR)

        Raises:
            ValueError: If plan or duration is invalid
        """
        if plan not in self.PRICING:
            raise ValueError(f"Invalid plan: {plan}")

        if duration_months not in self.PRICING[plan]:
            raise ValueError(f"Invalid duration: {duration_months}")

        amount_inr = self.PRICING[plan][duration_months]
        return amount_inr * 100  # Convert to paise

    def create_order(
        self,
        user_id: int,
        request: CreateOrderRequest,
        db: Session
    ) -> CreateOrderResponse:
        """
        Create a Razorpay order or subscription.

        Args:
            user_id: User ID creating the order
            request: Order creation request
            db: Database session

        Returns:
            CreateOrderResponse: Order/Subscription details

        Raises:
            ValueError: If order creation fails
        """
        try:
            # Calculate amount for one payment cycle
            amount = self.calculate_amount(request.plan, request.duration_months)

            if request.recurring:
                # Create recurring subscription
                return self._create_subscription(user_id, request, amount, db)
            else:
                # Create one-time order
                return self._create_one_time_order(user_id, request, amount, db)

        except Exception as e:
            logger.error(f"Failed to create order: {str(e)}")
            raise ValueError(f"Failed to create order: {str(e)}")

    def _create_one_time_order(
        self,
        user_id: int,
        request: CreateOrderRequest,
        amount: int,
        db: Session
    ) -> CreateOrderResponse:
        """Create a one-time payment order."""
        order_data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"order_{user_id}_{datetime.utcnow().timestamp()}",
            "notes": {
                "plan": request.plan,
                "duration_months": request.duration_months,
                "user_id": user_id,
                "recurring": False
            }
        }

        razorpay_order = self.client.order.create(data=order_data)

        # Save payment record
        payment = Payment(
            user_id=user_id,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
            currency="INR",
            status=PaymentStatus.PENDING,
            plan=request.plan,
            duration_months=request.duration_months
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        logger.info(f"One-time order created: {razorpay_order['id']} for user {user_id}")

        return CreateOrderResponse(
            order_id=razorpay_order["id"],
            amount=amount,
            currency="INR",
            plan=request.plan,
            duration_months=request.duration_months,
            key_id=settings.RAZORPAY_KEY_ID,
            recurring=False
        )

    def _create_subscription(
        self,
        user_id: int,
        request: CreateOrderRequest,
        amount: int,
        db: Session
    ) -> CreateOrderResponse:
        """Create a recurring subscription."""
        # Get user for customer creation
        from app.models.user import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Create or get Razorpay customer
        customer = self._get_or_create_customer(user, db)

        # Create subscription plan dynamically
        # Note: In production, you should create plans in Razorpay dashboard
        plan_data = {
            "period": "monthly" if request.duration_months == 1 else "yearly",
            "interval": 1,
            "item": {
                "name": f"{request.plan.title()} Plan - {'Monthly' if request.duration_months == 1 else 'Yearly'}",
                "amount": amount // request.duration_months,  # Per cycle amount
                "currency": "INR",
                "description": f"{request.plan} subscription"
            },
            "notes": {
                "plan": request.plan,
                "user_id": user_id
            }
        }

        # Create subscription
        subscription_data = {
            "plan_id": f"plan_{request.plan}_{request.duration_months}m",
            "customer_id": customer["id"],
            "quantity": 1,
            "total_count": request.duration_months,  # Number of billing cycles
            "customer_notify": 1,
            "notes": {
                "plan": request.plan,
                "duration_months": request.duration_months,
                "user_id": user_id,
                "recurring": True
            }
        }

        try:
            subscription = self.client.subscription.create(subscription_data)
        except Exception as e:
            # If plan doesn't exist, try to create it first
            if "plan_id" in str(e).lower():
                logger.info(f"Creating plan for {request.plan} - {request.duration_months}m")
                try:
                    plan = self.client.plan.create(plan_data)
                    subscription_data["plan_id"] = plan["id"]
                    subscription = self.client.subscription.create(subscription_data)
                except Exception as plan_err:
                    logger.error(f"Failed to create plan: {str(plan_err)}")
                    raise ValueError(f"Failed to create subscription plan: {str(plan_err)}")
            else:
                raise

        # Save payment record
        payment = Payment(
            user_id=user_id,
            razorpay_order_id=subscription["id"],  # Use subscription ID
            amount=amount // request.duration_months,  # Per cycle amount
            currency="INR",
            status=PaymentStatus.PENDING,
            plan=request.plan,
            duration_months=request.duration_months
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        logger.info(f"Recurring subscription created: {subscription['id']} for user {user_id}")

        return CreateOrderResponse(
            order_id=subscription["id"],
            amount=amount // request.duration_months,  # Per cycle amount
            currency="INR",
            plan=request.plan,
            duration_months=request.duration_months,
            key_id=settings.RAZORPAY_KEY_ID,
            recurring=True,
            subscription_id=subscription["id"]
        )

    def _get_or_create_customer(self, user: Any, db: Session) -> Dict:
        """Get or create Razorpay customer for user."""
        # Check if user has razorpay_customer_id stored
        if hasattr(user, 'razorpay_customer_id') and user.razorpay_customer_id:
            try:
                customer = self.client.customer.fetch(user.razorpay_customer_id)
                return customer
            except:
                pass  # Customer not found, create new one

        # Create new customer
        customer_data = {
            "name": user.name,
            "email": user.email,
            "notes": {
                "user_id": user.id
            }
        }

        customer = self.client.customer.create(customer_data)

        # Store customer ID (if user model supports it)
        if hasattr(user, 'razorpay_customer_id'):
            user.razorpay_customer_id = customer["id"]
            db.commit()

        logger.info(f"Created Razorpay customer: {customer['id']} for user {user.id}")
        return customer

    def verify_payment_signature(
        self,
        order_id: str,
        payment_id: str,
        signature: str
    ) -> bool:
        """
        Verify Razorpay payment signature.

        Args:
            order_id: Razorpay order ID
            payment_id: Razorpay payment ID
            signature: Payment signature

        Returns:
            bool: True if signature is valid
        """
        try:
            # Generate expected signature
            message = f"{order_id}|{payment_id}"
            expected_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected_signature, signature)

        except Exception as e:
            logger.error(f"Signature verification failed: {str(e)}")
            return False

    def verify_webhook_signature(
        self,
        payload: str,
        signature: str
    ) -> bool:
        """
        Verify Razorpay webhook signature.

        Args:
            payload: Webhook payload
            signature: Webhook signature

        Returns:
            bool: True if signature is valid
        """
        try:
            expected_signature = hmac.new(
                settings.RAZORPAY_WEBHOOK_SECRET.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected_signature, signature)

        except Exception as e:
            logger.error(f"Webhook signature verification failed: {str(e)}")
            return False

    def process_payment(
        self,
        user_id: int,
        request: VerifyPaymentRequest,
        db: Session
    ) -> Tuple[Payment, User]:
        """
        Process and verify a payment.

        Args:
            user_id: User ID
            request: Payment verification request
            db: Database session

        Returns:
            Tuple[Payment, User]: Updated payment and user records

        Raises:
            ValueError: If payment processing fails
        """
        # Find payment record
        payment = db.query(Payment).filter(
            Payment.razorpay_order_id == request.razorpay_order_id,
            Payment.user_id == user_id
        ).first()

        if not payment:
            raise ValueError("Payment record not found")

        if payment.status == PaymentStatus.SUCCESS:
            raise ValueError("Payment already processed")

        # Verify signature
        if not self.verify_payment_signature(
            request.razorpay_order_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        ):
            payment.status = PaymentStatus.FAILED
            db.commit()
            raise ValueError("Payment signature verification failed")

        # Update payment record
        payment.razorpay_payment_id = request.razorpay_payment_id
        payment.status = PaymentStatus.SUCCESS

        # Upgrade user subscription
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Calculate subscription expiry
        if user.subscription_expiry and user.subscription_expiry > datetime.utcnow():
            # Extend existing subscription
            expiry_date = user.subscription_expiry + timedelta(days=payment.duration_months * 30)
        else:
            # New subscription
            expiry_date = datetime.utcnow() + timedelta(days=payment.duration_months * 30)

        # Update user subscription
        user.subscription_type = payment.plan
        user.subscription_expiry = expiry_date

        # Reset usage counts if upgrading from FREE or if subscription was expired
        if user.subscription_type.upper() == "FREE" or (
            user.subscription_expiry and user.subscription_expiry < datetime.utcnow()
        ):
            user.resume_count = 0
            user.ats_analysis_count = 0

        db.commit()
        db.refresh(payment)
        db.refresh(user)

        logger.info(
            f"Payment processed: {payment.id} for user {user_id}, "
            f"subscription: {user.subscription_type} until {user.subscription_expiry}"
        )

        return payment, user

    def get_plan_limits(self, plan: str) -> Dict[str, int]:
        """
        Get limits for a subscription plan.

        Args:
            plan: Plan name (FREE/starter/pro)

        Returns:
            Dict[str, int]: Plan limits
        """
        if plan.upper() == "FREE":
            return {
                "resume_limit": 1,
                "ats_analysis_limit": 2
            }

        if plan in self.PLAN_FEATURES:
            return {
                "resume_limit": self.PLAN_FEATURES[plan]["resume_limit"],
                "ats_analysis_limit": self.PLAN_FEATURES[plan]["ats_analysis_limit"]
            }

        return {
            "resume_limit": 0,
            "ats_analysis_limit": 0
        }

    def check_subscription_active(self, user: User) -> bool:
        """
        Check if user's subscription is active.

        Args:
            user: User object

        Returns:
            bool: True if subscription is active
        """
        if user.subscription_type.upper() == "FREE":
            return True

        if not user.subscription_expiry:
            return False

        return user.subscription_expiry > datetime.utcnow()

    def get_days_remaining(self, user: User) -> Optional[int]:
        """
        Get days remaining in subscription.

        Args:
            user: User object

        Returns:
            Optional[int]: Days remaining or None if FREE/expired
        """
        if user.subscription_type.upper() == "FREE":
            return None

        if not user.subscription_expiry:
            return None

        if user.subscription_expiry < datetime.utcnow():
            return 0

        delta = user.subscription_expiry - datetime.utcnow()
        return delta.days


# Service instance
razorpay_service = RazorpayService()
