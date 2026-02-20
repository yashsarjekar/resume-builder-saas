"""
Payment routes for Razorpay (India) and Dodo Payments (International) integration.

This module provides endpoints for payment operations including order creation,
payment verification, subscription management, and webhook handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
import logging
import json

from app.database import get_db
from app.models.user import User
from app.models.payment import Payment
from app.routes.auth import get_current_user
from app.services.razorpay_service import razorpay_service
from app.services.dodo_service import dodo_service
from app.services.email_service import email_service
from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentHistoryResponse,
    PaymentResponse,
    SubscriptionDetails,
    PricingResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/pricing", response_model=PricingResponse)
async def get_pricing():
    """
    Get pricing information for all subscription plans.

    Returns:
        PricingResponse: Pricing details for all plans

    Example:
        GET /api/payment/pricing
    """
    try:
        pricing = razorpay_service.get_pricing_info()
        return pricing
    except Exception as e:
        logger.error(f"Failed to get pricing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pricing information"
        )


@router.post("/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a payment order (Razorpay for India, Dodo for international).

    Args:
        request: Order creation details (plan, duration, country)
        current_user: Authenticated user
        db: Database session

    Returns:
        CreateOrderResponse: Payment order details with gateway info

    Raises:
        HTTPException: If order creation fails

    Example:
        POST /api/payment/create-order
        {
            "plan": "pro",
            "duration_months": 12,
            "country": "IN"
        }
    """
    try:
        # Route to appropriate payment gateway based on country
        if request.country.upper() == "IN":
            # India - use Razorpay
            order = razorpay_service.create_order(
                user_id=current_user.id,
                request=request,
                db=db
            )
            logger.info(f"Razorpay order created for user {current_user.id}: {order.order_id}")
        else:
            # International - use Dodo Payments
            if not dodo_service.is_configured:
                logger.warning("Dodo Payments not configured, falling back to Razorpay")
                order = razorpay_service.create_order(
                    user_id=current_user.id,
                    request=request,
                    db=db
                )
            else:
                order = await dodo_service.create_checkout_session(
                    user_id=current_user.id,
                    request=request,
                    db=db
                )
                logger.info(f"Dodo checkout created for user {current_user.id}: {order.order_id}")

        return order

    except ValueError as e:
        logger.error(f"Order creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error creating order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment order"
        )


@router.post("/verify", response_model=VerifyPaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment and upgrade user subscription.

    Args:
        request: Payment verification details from Razorpay
        current_user: Authenticated user
        db: Database session

    Returns:
        VerifyPaymentResponse: Verification result and subscription details

    Raises:
        HTTPException: If verification fails

    Example:
        POST /api/payment/verify
        {
            "razorpay_order_id": "order_xxx",
            "razorpay_payment_id": "pay_xxx",
            "razorpay_signature": "signature_xxx"
        }
    """
    try:
        payment, user = razorpay_service.process_payment(
            user_id=current_user.id,
            request=request,
            db=db
        )

        logger.info(
            f"Payment verified for user {current_user.id}: "
            f"payment_id={payment.id}, subscription={user.subscription_type}"
        )

        return VerifyPaymentResponse(
            success=True,
            message="Payment verified successfully",
            subscription_type=user.subscription_type,
            subscription_expiry=user.subscription_expiry,
            payment_id=payment.id
        )

    except ValueError as e:
        logger.error(f"Payment verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error verifying payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify payment"
        )


@router.get("/history", response_model=PaymentHistoryResponse)
async def get_payment_history(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get payment history for the current user.

    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        current_user: Authenticated user
        db: Database session

    Returns:
        PaymentHistoryResponse: List of payments and total count

    Example:
        GET /api/payment/history?skip=0&limit=10
    """
    try:
        # Get total count
        total = db.query(Payment).filter(
            Payment.user_id == current_user.id
        ).count()

        # Get payments
        payments = db.query(Payment).filter(
            Payment.user_id == current_user.id
        ).order_by(
            Payment.created_at.desc()
        ).offset(skip).limit(limit).all()

        # Convert to response models
        payment_responses = [
            PaymentResponse(
                id=p.id,
                user_id=p.user_id,
                payment_gateway=p.payment_gateway,
                razorpay_order_id=p.razorpay_order_id,
                razorpay_payment_id=p.razorpay_payment_id,
                dodo_session_id=p.dodo_session_id,
                dodo_payment_id=p.dodo_payment_id,
                amount=p.amount,
                currency=p.currency,
                status=p.status.value,
                plan=p.plan,
                duration_months=p.duration_months,
                created_at=p.created_at,
                updated_at=p.updated_at
            )
            for p in payments
        ]

        return PaymentHistoryResponse(
            payments=payment_responses,
            total=total
        )

    except Exception as e:
        logger.error(f"Failed to get payment history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payment history"
        )


@router.get("/subscription", response_model=SubscriptionDetails)
async def get_subscription_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's subscription details.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        SubscriptionDetails: Subscription information and usage stats

    Example:
        GET /api/payment/subscription
    """
    try:
        # Get plan limits
        limits = razorpay_service.get_plan_limits(current_user.subscription_type)

        # Check if subscription is active
        is_active = razorpay_service.check_subscription_active(current_user)

        # Get days remaining
        days_remaining = razorpay_service.get_days_remaining(current_user)

        return SubscriptionDetails(
            subscription_type=current_user.subscription_type,
            subscription_expiry=current_user.subscription_expiry,
            is_active=is_active,
            days_remaining=days_remaining,
            resume_limit=limits["resume_limit"],
            ats_analysis_limit=limits["ats_analysis_limit"],
            resume_count=current_user.resume_count,
            ats_analysis_count=current_user.ats_analysis_count
        )

    except Exception as e:
        logger.error(f"Failed to get subscription details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscription details"
        )


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Handle Razorpay webhook events.

    Args:
        request: Raw request object
        x_razorpay_signature: Razorpay webhook signature header
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If signature verification fails

    Example:
        POST /api/payment/webhook
        Headers: X-Razorpay-Signature: <signature>
        Body: <webhook payload>
    """
    try:
        # Get raw body
        body = await request.body()
        payload = body.decode('utf-8')

        # Verify webhook signature
        if not x_razorpay_signature:
            logger.warning("Webhook received without signature")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing webhook signature"
            )

        is_valid = razorpay_service.verify_webhook_signature(
            payload=payload,
            signature=x_razorpay_signature
        )

        if not is_valid:
            logger.warning("Webhook signature verification failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )

        # Parse webhook data
        import json
        webhook_data = json.loads(payload)
        event_type = webhook_data.get('event')

        logger.info(f"Received webhook event: {event_type}")

        # Handle different webhook events
        if event_type == 'payment.captured':
            # Payment was captured successfully
            payment_entity = webhook_data.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')

            # Update payment status in database
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()

            if payment and payment.status != "success":
                from datetime import datetime, timedelta

                payment.razorpay_payment_id = payment_id
                payment.status = "success"

                # Upgrade user subscription
                user = db.query(User).filter(User.id == payment.user_id).first()
                if user:
                    # Calculate subscription expiry
                    if user.subscription_expiry and user.subscription_expiry > datetime.utcnow():
                        # Extend existing subscription
                        expiry_date = user.subscription_expiry + timedelta(days=payment.duration_months * 30)
                    else:
                        # New subscription
                        expiry_date = datetime.utcnow() + timedelta(days=payment.duration_months * 30)

                    user.subscription_type = payment.plan
                    user.subscription_expiry = expiry_date

                    # Reset usage counts if needed
                    if user.subscription_type.upper() == "FREE" or (
                        user.subscription_expiry and user.subscription_expiry < datetime.utcnow()
                    ):
                        user.resume_count = 0
                        user.ats_analysis_count = 0

                db.commit()
                logger.info(f"Payment {payment.id} marked as success and subscription upgraded via webhook")

                # Send payment success email
                try:
                    email_service.send_payment_success_email(
                        user_email=user.email,
                        user_name=user.name,
                        plan=payment.plan,
                        amount=payment.amount,
                        duration_months=payment.duration_months,
                        payment_id=payment_id,
                        recurring=False
                    )
                except Exception as email_error:
                    logger.error(f"Failed to send payment success email: {str(email_error)}")

        elif event_type == 'payment.failed':
            # Payment failed
            payment_entity = webhook_data.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')

            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()

            if payment:
                payment.status = "failed"
                db.commit()
                logger.info(f"Payment {payment.id} marked as failed via webhook")

                # Send payment failed email
                try:
                    user = db.query(User).filter(User.id == payment.user_id).first()
                    if user:
                        retry_date = (datetime.utcnow() + timedelta(days=1)).strftime("%B %d, %Y")
                        email_service.send_payment_failed_email(
                            user_email=user.email,
                            user_name=user.name,
                            plan=payment.plan,
                            amount=payment.amount,
                            retry_date=retry_date
                        )
                except Exception as email_error:
                    logger.error(f"Failed to send payment failed email: {str(email_error)}")

        # Subscription webhook events (for recurring payments)
        elif event_type == 'subscription.activated':
            # Subscription activated after first payment
            subscription_entity = webhook_data.get('payload', {}).get('subscription', {}).get('entity', {})
            subscription_id = subscription_entity.get('id')

            # Update payment and activate subscription
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == subscription_id
            ).first()

            if payment:
                payment.status = "success"
                user = db.query(User).filter(User.id == payment.user_id).first()
                if user:
                    user.subscription_type = payment.plan
                    # For recurring, activate for the billing period (typically 1 month)
                    user.subscription_expiry = datetime.utcnow() + timedelta(days=30)
                    user.resume_count = 0
                    user.ats_analysis_count = 0
                db.commit()
                logger.info(f"Subscription {subscription_id} activated for user {payment.user_id}")

                # Send subscription activated email
                try:
                    next_billing = (datetime.utcnow() + timedelta(days=30)).strftime("%B %d, %Y")
                    email_service.send_subscription_activated_email(
                        user_email=user.email,
                        user_name=user.name,
                        plan=payment.plan,
                        next_billing_date=next_billing
                    )
                except Exception as email_error:
                    logger.error(f"Failed to send subscription activated email: {str(email_error)}")

        elif event_type == 'subscription.charged':
            # Monthly payment successful - extend subscription
            subscription_entity = webhook_data.get('payload', {}).get('subscription', {}).get('entity', {})
            subscription_id = subscription_entity.get('id')

            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == subscription_id
            ).first()

            if payment:
                user = db.query(User).filter(User.id == payment.user_id).first()
                if user:
                    # Extend subscription by 1 month
                    if user.subscription_expiry and user.subscription_expiry > datetime.utcnow():
                        user.subscription_expiry += timedelta(days=30)
                    else:
                        user.subscription_expiry = datetime.utcnow() + timedelta(days=30)
                    db.commit()
                    logger.info(f"Subscription {subscription_id} extended for user {payment.user_id}")

        elif event_type == 'subscription.halted':
            # Payment failed after retries - downgrade to FREE
            subscription_entity = webhook_data.get('payload', {}).get('subscription', {}).get('entity', {})
            subscription_id = subscription_entity.get('id')

            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == subscription_id
            ).first()

            if payment:
                user = db.query(User).filter(User.id == payment.user_id).first()
                if user:
                    user.subscription_type = "FREE"
                    user.subscription_expiry = None
                    db.commit()
                    logger.warning(f"Subscription {subscription_id} halted for user {payment.user_id}")

                    # Send payment failed email (subscription halted)
                    try:
                        email_service.send_payment_failed_email(
                            user_email=user.email,
                            user_name=user.name,
                            plan=payment.plan,
                            amount=payment.amount,
                            retry_date=None
                        )
                    except Exception as email_error:
                        logger.error(f"Failed to send subscription halted email: {str(email_error)}")

        elif event_type == 'subscription.completed':
            # All payments completed - subscription ended
            subscription_entity = webhook_data.get('payload', {}).get('subscription', {}).get('entity', {})
            subscription_id = subscription_entity.get('id')

            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == subscription_id
            ).first()

            if payment:
                user = db.query(User).filter(User.id == payment.user_id).first()
                if user:
                    # Subscription naturally ended, don't downgrade immediately
                    # User keeps access until expiry date
                    logger.info(f"Subscription {subscription_id} completed for user {payment.user_id}")

        elif event_type == 'subscription.cancelled':
            # User cancelled subscription
            subscription_entity = webhook_data.get('payload', {}).get('subscription', {}).get('entity', {})
            subscription_id = subscription_entity.get('id')

            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == subscription_id
            ).first()

            if payment:
                # User keeps access until current period ends
                logger.info(f"Subscription {subscription_id} cancelled for user {payment.user_id}")

                # Send subscription cancelled email
                try:
                    user = db.query(User).filter(User.id == payment.user_id).first()
                    if user and user.subscription_expiry:
                        expiry_date = user.subscription_expiry.strftime("%B %d, %Y")
                        email_service.send_subscription_cancelled_email(
                            user_email=user.email,
                            user_name=user.name,
                            plan=payment.plan,
                            expiry_date=expiry_date
                        )
                except Exception as email_error:
                    logger.error(f"Failed to send subscription cancelled email: {str(email_error)}")

        return {"status": "success", "message": "Webhook processed"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process webhook"
        )


@router.post("/webhook/dodo")
async def handle_dodo_webhook(
    request: Request,
    webhook_signature: Optional[str] = Header(None, alias="webhook-signature"),
    db: Session = Depends(get_db)
):
    """
    Handle Dodo Payments webhook events.

    Args:
        request: Raw request object
        webhook_signature: Dodo webhook signature header
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If signature verification fails

    Example:
        POST /api/payment/webhook/dodo
        Headers: webhook-signature: <signature>
        Body: <webhook payload>
    """
    try:
        # Get raw body
        body = await request.body()
        payload = body.decode('utf-8')

        # Verify webhook signature (if configured)
        if dodo_service.webhook_secret:
            if not webhook_signature:
                logger.warning("Dodo webhook received without signature")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Missing webhook signature"
                )

            is_valid = dodo_service.verify_webhook_signature(
                payload=payload,
                signature=webhook_signature
            )

            if not is_valid:
                logger.warning("Dodo webhook signature verification failed")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid webhook signature"
                )

        # Parse webhook data
        webhook_data = json.loads(payload)
        event_type = webhook_data.get('type') or webhook_data.get('event_type')
        event_data = webhook_data.get('data', webhook_data)

        logger.info(f"Received Dodo webhook event: {event_type}")

        # Process the webhook event
        success = dodo_service.process_webhook_event(
            event_type=event_type,
            event_data=event_data,
            db=db
        )

        if success:
            return {"status": "success", "message": "Dodo webhook processed"}
        else:
            return {"status": "warning", "message": "Webhook event not fully processed"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dodo webhook processing error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process Dodo webhook"
        )
