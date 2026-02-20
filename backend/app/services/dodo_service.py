"""
Dodo Payments Service for Resume Builder.

This module handles all Dodo Payments operations for international customers,
including checkout session creation, payment verification, and webhook processing.
"""

import hmac
import hashlib
import httpx
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging
import json

from app.config import get_settings

settings = get_settings()
from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
)

logger = logging.getLogger(__name__)


class DodoService:
    """Service for handling Dodo Payments operations for international customers."""

    # Pricing in USD cents (100 cents = $1)
    PRICING_USD = {
        "starter": {
            1: 1299,    # $12.99/month
            3: 3499,    # $34.99/quarter (10% discount)
            6: 6499,    # $64.99/half-year (17% discount)
            12: 11999,  # $119.99/year (23% discount)
        },
        "pro": {
            1: 3999,    # $39.99/month
            3: 10999,   # $109.99/quarter (8% discount)
            6: 19999,   # $199.99/half-year (17% discount)
            12: 35999,  # $359.99/year (25% discount)
        }
    }

    # Plan features (same as Razorpay)
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
        """Initialize Dodo Payments client."""
        self.api_key = settings.DODO_API_KEY
        self.webhook_secret = settings.DODO_WEBHOOK_SECRET
        self.environment = settings.DODO_ENVIRONMENT

        # Set base URL based on environment
        if self.environment == "live_mode":
            self.base_url = "https://api.dodopayments.com"
        else:
            self.base_url = "https://test.dodopayments.com"

        self.is_configured = bool(self.api_key)

        if self.is_configured:
            logger.info(f"Dodo Payments service initialized ({self.environment})")
        else:
            logger.warning("Dodo Payments service not configured - missing API key")

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for Dodo API requests."""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def calculate_amount(self, plan: str, duration_months: int) -> int:
        """
        Calculate payment amount for a plan and duration.

        Args:
            plan: Plan name (starter/pro)
            duration_months: Duration in months (1, 3, 6, 12)

        Returns:
            int: Amount in cents (100 cents = $1)

        Raises:
            ValueError: If plan or duration is invalid
        """
        if plan not in self.PRICING_USD:
            raise ValueError(f"Invalid plan: {plan}")

        if duration_months not in self.PRICING_USD[plan]:
            raise ValueError(f"Invalid duration: {duration_months}")

        return self.PRICING_USD[plan][duration_months]

    def get_product_name(self, plan: str, duration_months: int) -> str:
        """Generate product name for checkout."""
        duration_names = {
            1: "Monthly",
            3: "Quarterly",
            6: "Half-Yearly",
            12: "Yearly"
        }
        duration_name = duration_names.get(duration_months, "Monthly")
        return f"{plan.title()} Plan - {duration_name}"

    async def create_checkout_session(
        self,
        user_id: int,
        request: CreateOrderRequest,
        db: Session
    ) -> CreateOrderResponse:
        """
        Create a Dodo Payments checkout session.

        Args:
            user_id: User ID creating the order
            request: Order creation request
            db: Database session

        Returns:
            CreateOrderResponse: Checkout session details with redirect URL

        Raises:
            ValueError: If checkout creation fails
        """
        if not self.is_configured:
            raise ValueError("Dodo Payments is not configured")

        try:
            # Get user for customer info
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")

            # Calculate amount
            amount = self.calculate_amount(request.plan.value, request.duration_months)
            product_name = self.get_product_name(request.plan.value, request.duration_months)

            # Create checkout session via Dodo API
            checkout_data = {
                "billing": {
                    "city": "Unknown",
                    "country": request.country,
                    "state": "Unknown",
                    "street": "Unknown",
                    "zipcode": "00000"
                },
                "customer": {
                    "email": user.email,
                    "name": user.name or "Customer"
                },
                "payment_link": True,
                "product_cart": [
                    {
                        "product_id": f"resume_builder_{request.plan.value}_{request.duration_months}m",
                        "quantity": 1
                    }
                ],
                "return_url": f"{settings.FRONTEND_URL}/payment/success",
                "metadata": {
                    "user_id": str(user_id),
                    "plan": request.plan.value,
                    "duration_months": str(request.duration_months)
                }
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/payments",
                    headers=self._get_headers(),
                    json=checkout_data,
                    timeout=30.0
                )

                if response.status_code not in [200, 201]:
                    error_detail = response.text
                    logger.error(f"Dodo checkout creation failed: {response.status_code} - {error_detail}")
                    raise ValueError(f"Failed to create checkout: {error_detail}")

                session_data = response.json()

            # Extract session/payment ID and checkout URL
            session_id = session_data.get("payment_id") or session_data.get("id")
            checkout_url = session_data.get("payment_link") or session_data.get("checkout_url")

            if not checkout_url:
                logger.error(f"Dodo response missing checkout URL: {session_data}")
                raise ValueError("Checkout URL not returned from Dodo")

            # Save payment record
            payment = Payment(
                user_id=user_id,
                payment_gateway="dodo",
                dodo_session_id=session_id,
                amount=amount,
                currency="USD",
                status=PaymentStatus.PENDING,
                plan=request.plan.value,
                duration_months=request.duration_months
            )
            db.add(payment)
            db.commit()
            db.refresh(payment)

            logger.info(f"Dodo checkout session created: {session_id} for user {user_id}")

            return CreateOrderResponse(
                order_id=session_id,
                amount=amount,
                currency="USD",
                plan=request.plan.value,
                duration_months=request.duration_months,
                key_id=None,  # Not needed for Dodo
                recurring=False,
                payment_gateway="dodo",
                checkout_url=checkout_url
            )

        except httpx.RequestError as e:
            logger.error(f"Dodo API request failed: {str(e)}")
            raise ValueError(f"Failed to connect to Dodo Payments: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to create Dodo checkout: {str(e)}")
            raise ValueError(f"Failed to create checkout: {str(e)}")

    def verify_webhook_signature(
        self,
        payload: str,
        signature: str
    ) -> bool:
        """
        Verify Dodo webhook signature using Standard Webhooks.

        Args:
            payload: Webhook payload
            signature: Webhook signature from header

        Returns:
            bool: True if signature is valid
        """
        if not self.webhook_secret:
            logger.warning("Dodo webhook secret not configured")
            return False

        try:
            # Standard Webhooks signature verification
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()

            return hmac.compare_digest(expected_signature, signature)

        except Exception as e:
            logger.error(f"Dodo webhook signature verification failed: {str(e)}")
            return False

    def process_webhook_event(
        self,
        event_type: str,
        event_data: Dict[str, Any],
        db: Session
    ) -> bool:
        """
        Process a Dodo webhook event.

        Args:
            event_type: Type of webhook event
            event_data: Event payload data
            db: Database session

        Returns:
            bool: True if event was processed successfully
        """
        try:
            logger.info(f"Processing Dodo webhook event: {event_type}")

            if event_type == "payment.succeeded":
                return self._handle_payment_succeeded(event_data, db)
            elif event_type == "payment.failed":
                return self._handle_payment_failed(event_data, db)
            else:
                logger.info(f"Unhandled Dodo webhook event: {event_type}")
                return True

        except Exception as e:
            logger.error(f"Error processing Dodo webhook: {str(e)}")
            return False

    def _handle_payment_succeeded(
        self,
        event_data: Dict[str, Any],
        db: Session
    ) -> bool:
        """Handle successful payment webhook."""
        payment_id = event_data.get("payment_id") or event_data.get("id")

        if not payment_id:
            logger.error("Payment succeeded webhook missing payment_id")
            return False

        # Find payment by Dodo session/payment ID
        payment = db.query(Payment).filter(
            Payment.dodo_session_id == payment_id
        ).first()

        if not payment:
            logger.warning(f"Payment not found for Dodo payment_id: {payment_id}")
            return False

        if payment.status == PaymentStatus.SUCCESS:
            logger.info(f"Payment {payment.id} already marked as success")
            return True

        # Update payment record
        payment.status = PaymentStatus.SUCCESS
        payment.dodo_payment_id = event_data.get("transaction_id", payment_id)

        # Upgrade user subscription
        user = db.query(User).filter(User.id == payment.user_id).first()
        if user:
            # Calculate subscription expiry
            if user.subscription_expiry and user.subscription_expiry > datetime.utcnow():
                expiry_date = user.subscription_expiry + timedelta(days=payment.duration_months * 30)
            else:
                expiry_date = datetime.utcnow() + timedelta(days=payment.duration_months * 30)

            user.subscription_type = payment.plan
            user.subscription_expiry = expiry_date

            # Reset usage counts
            user.resume_count = 0
            user.ats_analysis_count = 0

        db.commit()
        logger.info(f"Dodo payment {payment.id} marked as success, user {user.id} upgraded to {payment.plan}")

        return True

    def _handle_payment_failed(
        self,
        event_data: Dict[str, Any],
        db: Session
    ) -> bool:
        """Handle failed payment webhook."""
        payment_id = event_data.get("payment_id") or event_data.get("id")

        if not payment_id:
            logger.error("Payment failed webhook missing payment_id")
            return False

        # Find payment by Dodo session/payment ID
        payment = db.query(Payment).filter(
            Payment.dodo_session_id == payment_id
        ).first()

        if not payment:
            logger.warning(f"Payment not found for Dodo payment_id: {payment_id}")
            return False

        payment.status = PaymentStatus.FAILED
        db.commit()
        logger.info(f"Dodo payment {payment.id} marked as failed")

        return True

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


# Service instance
dodo_service = DodoService()
