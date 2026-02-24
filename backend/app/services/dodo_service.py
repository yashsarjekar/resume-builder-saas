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

    # Dodo Product IDs (Live - created in Dodo dashboard)
    DODO_PRODUCT_IDS = {
        "starter": {
            1: "pdt_0NZDGuhAvrASLdzlcnr6X",   # Starter Monthly
            3: "pdt_0NZDH2yBnrRTIopDdm2JN",   # Starter Quarterly
            6: "pdt_0NZDHETbrmJPA439mGogv",   # Starter Half-Yearly
            12: "pdt_0NZDJ7AgFwSsSiKSKsCfw",  # Starter Yearly
        },
        "pro": {
            1: "pdt_0NZDJTQwyoAh3FTR6GvnU",   # Pro Monthly
            3: "pdt_0NZDK4ZFPuZvPZyLW1jJq",   # Pro Quarterly
            6: "pdt_0NZDKEumCW9cOhGAXBWGo",   # Pro Half-Yearly
            12: "pdt_0NZDKdTNXlKy1uIbdNuSL",  # Pro Yearly
        }
    }

    # Plan features for International users (higher limits than India)
    PLAN_FEATURES = {
        "starter": {
            "resume_limit": 15,  # Higher for international
            "ats_analysis_limit": 15,  # Higher for international
            "features": [
                "15 Resume Creations",
                "15 ATS Analyses",
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

    # Free plan limits for International users
    FREE_LIMITS_INTL = {
        "resume_limit": 5,
        "ats_analysis_limit": 5
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
            # Get product ID from our mapping
            product_id = self.DODO_PRODUCT_IDS.get(request.plan.value, {}).get(request.duration_months)
            if not product_id:
                raise ValueError(f"No Dodo product configured for {request.plan.value} - {request.duration_months} months")

            checkout_data = {
                "billing": {
                    "city": "Unknown",
                    "country": request.country,
                    "state": "Unknown",
                    "street": "Unknown",
                    "zipcode": 0
                },
                "customer": {
                    "email": user.email,
                    "name": user.name or "Customer"
                },
                "payment_link": True,
                "product_cart": [
                    {
                        "product_id": product_id,
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

            logger.info(f"Creating Dodo checkout with product_id: {product_id}")

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
            logger.info(f"[DODO WEBHOOK] Processing event: {event_type}")

            # Handle various event type formats
            event_type_lower = (event_type or "").lower()

            if event_type_lower in ["payment.succeeded", "payment_succeeded", "payment.completed", "payment_completed", "payment.success"]:
                return self._handle_payment_succeeded(event_data, db)
            elif event_type_lower in ["payment.failed", "payment_failed"]:
                return self._handle_payment_failed(event_data, db)
            else:
                logger.info(f"[DODO WEBHOOK] Unhandled event type: {event_type}")
                # Return True so we don't reject the webhook
                return True

        except Exception as e:
            logger.error(f"[DODO WEBHOOK] Error processing: {str(e)}")
            import traceback
            logger.error(f"[DODO WEBHOOK] Traceback: {traceback.format_exc()}")
            return False

    def _handle_payment_succeeded(
        self,
        event_data: Dict[str, Any],
        db: Session
    ) -> bool:
        """Handle successful payment webhook."""
        # Try multiple possible payment ID fields
        payment_id = (
            event_data.get("payment_id") or
            event_data.get("id") or
            event_data.get("payment", {}).get("payment_id") or
            event_data.get("payment", {}).get("id")
        )

        logger.info(f"[DODO WEBHOOK] _handle_payment_succeeded called with data keys: {list(event_data.keys())}")
        logger.info(f"[DODO WEBHOOK] Extracted payment_id: {payment_id}")

        if not payment_id:
            logger.error("[DODO WEBHOOK] Payment succeeded webhook missing payment_id in all expected fields")
            logger.error(f"[DODO WEBHOOK] Full event_data: {json.dumps(event_data)}")
            return False

        # Find payment by Dodo session/payment ID
        payment = db.query(Payment).filter(
            Payment.dodo_session_id == payment_id
        ).first()

        if not payment:
            # Try searching with partial match or other fields
            logger.warning(f"[DODO WEBHOOK] Payment not found for dodo_session_id: {payment_id}")

            # List all pending Dodo payments for debugging
            pending_payments = db.query(Payment).filter(
                Payment.payment_gateway == "dodo",
                Payment.status == PaymentStatus.PENDING
            ).all()
            logger.info(f"[DODO WEBHOOK] Pending Dodo payments: {[(p.id, p.dodo_session_id) for p in pending_payments]}")

            return False

        if payment.status == PaymentStatus.SUCCESS:
            logger.info(f"[DODO WEBHOOK] Payment {payment.id} already marked as success")
            return True

        logger.info(f"[DODO WEBHOOK] Found payment record: id={payment.id}, user_id={payment.user_id}, plan={payment.plan}")

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

            old_subscription = user.subscription_type
            user.subscription_type = payment.plan
            user.subscription_expiry = expiry_date
            user.billing_duration = payment.duration_months

            # Set region to international for Dodo payments (higher limits)
            user.region = "INTL"

            # Reset usage counts
            user.resume_count = 0
            user.ats_analysis_count = 0

            logger.info(f"[DODO WEBHOOK] User {user.id} upgraded from {old_subscription} to {payment.plan} ({payment.duration_months}mo), expiry: {expiry_date}")
        else:
            logger.error(f"[DODO WEBHOOK] User not found for payment.user_id: {payment.user_id}")

        db.commit()
        logger.info(f"[DODO WEBHOOK] Payment {payment.id} marked as success, user {user.id} upgraded to {payment.plan}")

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
        Get limits for a subscription plan (International limits).

        Args:
            plan: Plan name (FREE/starter/pro)

        Returns:
            Dict[str, int]: Plan limits for international users
        """
        if plan.upper() == "FREE":
            return self.FREE_LIMITS_INTL

        if plan in self.PLAN_FEATURES:
            return {
                "resume_limit": self.PLAN_FEATURES[plan]["resume_limit"],
                "ats_analysis_limit": self.PLAN_FEATURES[plan]["ats_analysis_limit"]
            }

        return {
            "resume_limit": 0,
            "ats_analysis_limit": 0
        }

    async def verify_payment(
        self,
        payment_id: str,
        db: Session
    ) -> Tuple[bool, str, Optional[User]]:
        """
        Verify a Dodo payment by fetching its status from API.

        Args:
            payment_id: Dodo payment/session ID
            db: Database session

        Returns:
            Tuple[bool, str, Optional[User]]: (success, status, user)
        """
        if not self.is_configured:
            return False, "Dodo Payments is not configured", None

        try:
            # First, find the payment in our database
            payment = db.query(Payment).filter(
                Payment.dodo_session_id == payment_id
            ).first()

            if not payment:
                logger.warning(f"Payment not found for Dodo ID: {payment_id}")
                return False, "Payment not found", None

            # If already verified, return success
            if payment.status == PaymentStatus.SUCCESS:
                user = db.query(User).filter(User.id == payment.user_id).first()
                logger.info(f"Payment {payment_id} already verified")
                return True, "success", user

            # Fetch payment status from Dodo API
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/payments/{payment_id}",
                    headers=self._get_headers(),
                    timeout=30.0
                )

                if response.status_code == 404:
                    logger.warning(f"Payment {payment_id} not found in Dodo")
                    return False, "Payment not found in Dodo", None

                if response.status_code != 200:
                    logger.error(f"Dodo API error: {response.status_code} - {response.text}")
                    return False, f"API error: {response.status_code}", None

                payment_data = response.json()

            logger.info(f"Dodo payment status for {payment_id}: {json.dumps(payment_data)}")

            # Check payment status from Dodo
            dodo_status = payment_data.get("status", "").lower()

            if dodo_status in ["succeeded", "paid", "completed", "success"]:
                # Payment successful - update our records
                payment.status = PaymentStatus.SUCCESS
                payment.dodo_payment_id = payment_data.get("transaction_id") or payment_data.get("id") or payment_id

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
                    user.billing_duration = payment.duration_months
                    user.region = "INTL"

                    # Reset usage counts
                    user.resume_count = 0
                    user.ats_analysis_count = 0

                db.commit()
                logger.info(f"Payment {payment_id} verified and user {user.id} upgraded to {payment.plan} ({payment.duration_months}mo)")
                return True, "success", user

            elif dodo_status in ["pending", "processing", "requires_action"]:
                return False, "pending", None

            else:
                # Payment failed
                payment.status = PaymentStatus.FAILED
                db.commit()
                logger.info(f"Payment {payment_id} marked as failed (status: {dodo_status})")
                return False, "failed", None

        except httpx.RequestError as e:
            logger.error(f"Dodo API request failed: {str(e)}")
            return False, f"API request failed: {str(e)}", None
        except Exception as e:
            logger.error(f"Payment verification failed: {str(e)}")
            return False, f"Verification failed: {str(e)}", None


# Service instance
dodo_service = DodoService()
