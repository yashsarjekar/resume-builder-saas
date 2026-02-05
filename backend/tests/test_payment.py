"""
Tests for payment functionality.

This module contains tests for Razorpay payment integration including
order creation, payment verification, subscription management, and webhooks.
"""

import pytest
from fastapi import status
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import hmac
import hashlib
import json

from app.models.payment import Payment, PaymentStatus
from app.models.user import User
from app.services.razorpay_service import RazorpayService
from app.schemas.payment import (
    CreateOrderRequest,
    VerifyPaymentRequest,
    SubscriptionPlan
)


# Fixtures

@pytest.fixture
def razorpay_service():
    """Get Razorpay service instance."""
    return RazorpayService()


@pytest.fixture
def mock_razorpay_client():
    """Mock Razorpay client."""
    # Mock the razorpay_service.client attribute directly
    with patch('app.services.razorpay_service.razorpay_service.client') as mock:
        yield mock


# Razorpay Service Tests

class TestRazorpayService:
    """Tests for RazorpayService class."""

    def test_get_pricing_info(self, razorpay_service):
        """Test getting pricing information."""
        pricing = razorpay_service.get_pricing_info()

        assert pricing.currency == "INR"
        assert len(pricing.plans) == 2

        # Check starter plan
        starter = next(p for p in pricing.plans if p.plan == "starter")
        assert starter.monthly_price == 299
        assert starter.quarterly_price == 799
        assert starter.half_yearly_price == 1499
        assert starter.yearly_price == 2799
        assert starter.resume_limit == 10
        assert starter.ats_analysis_limit == 20
        assert not starter.is_popular

        # Check pro plan
        pro = next(p for p in pricing.plans if p.plan == "pro")
        assert pro.monthly_price == 599
        assert pro.is_popular

    def test_calculate_amount_valid(self, razorpay_service):
        """Test amount calculation for valid plan and duration."""
        # Starter monthly
        amount = razorpay_service.calculate_amount("starter", 1)
        assert amount == 29900  # Rs. 299 in paise

        # Pro yearly
        amount = razorpay_service.calculate_amount("pro", 12)
        assert amount == 559900  # Rs. 5599 in paise

    def test_calculate_amount_invalid_plan(self, razorpay_service):
        """Test amount calculation with invalid plan."""
        with pytest.raises(ValueError, match="Invalid plan"):
            razorpay_service.calculate_amount("invalid", 1)

    def test_calculate_amount_invalid_duration(self, razorpay_service):
        """Test amount calculation with invalid duration."""
        with pytest.raises(ValueError, match="Invalid duration"):
            razorpay_service.calculate_amount("starter", 5)

    def test_get_plan_limits(self, razorpay_service):
        """Test getting plan limits."""
        # FREE plan
        limits = razorpay_service.get_plan_limits("FREE")
        assert limits["resume_limit"] == 3
        assert limits["ats_analysis_limit"] == 5

        # Starter plan
        limits = razorpay_service.get_plan_limits("starter")
        assert limits["resume_limit"] == 10
        assert limits["ats_analysis_limit"] == 20

        # Pro plan
        limits = razorpay_service.get_plan_limits("pro")
        assert limits["resume_limit"] == -1  # Unlimited
        assert limits["ats_analysis_limit"] == -1

    def test_check_subscription_active(self, razorpay_service, test_user):
        """Test checking if subscription is active."""
        # FREE subscription
        test_user.subscription_type = "FREE"
        assert razorpay_service.check_subscription_active(test_user)

        # Active paid subscription
        test_user.subscription_type = "pro"
        test_user.subscription_expiry = datetime.utcnow() + timedelta(days=30)
        assert razorpay_service.check_subscription_active(test_user)

        # Expired subscription
        test_user.subscription_expiry = datetime.utcnow() - timedelta(days=1)
        assert not razorpay_service.check_subscription_active(test_user)

    def test_get_days_remaining(self, razorpay_service, test_user):
        """Test getting days remaining in subscription."""
        # FREE subscription
        test_user.subscription_type = "FREE"
        assert razorpay_service.get_days_remaining(test_user) is None

        # Active subscription
        test_user.subscription_type = "pro"
        test_user.subscription_expiry = datetime.utcnow() + timedelta(days=15)
        days = razorpay_service.get_days_remaining(test_user)
        assert 14 <= days <= 15  # Account for timing

        # Expired subscription
        test_user.subscription_expiry = datetime.utcnow() - timedelta(days=5)
        assert razorpay_service.get_days_remaining(test_user) == 0


# Payment API Tests

class TestCreateOrder:
    """Tests for /api/payment/create-order endpoint."""

    def test_create_order_success(
        self,
        client,
        auth_headers,
        db_session,
        mock_razorpay_client
    ):
        """Test successful order creation."""
        # Mock Razorpay order creation
        mock_razorpay_client.order.create.return_value = {
            "id": "order_test123",
            "amount": 29900,
            "currency": "INR",
            "status": "created"
        }

        response = client.post(
            "/api/payment/create-order",
            headers=auth_headers,
            json={
                "plan": "starter",
                "duration_months": 1
            }
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["order_id"] == "order_test123"
        assert data["amount"] == 29900
        assert data["currency"] == "INR"
        assert data["plan"] == "starter"
        assert data["duration_months"] == 1
        assert "key_id" in data

        # Verify payment record created
        payment = db_session.query(Payment).filter(
            Payment.razorpay_order_id == "order_test123"
        ).first()
        assert payment is not None
        assert payment.status == PaymentStatus.PENDING

    def test_create_order_invalid_plan(self, client, auth_headers):
        """Test order creation with invalid plan."""
        response = client.post(
            "/api/payment/create-order",
            headers=auth_headers,
            json={
                "plan": "invalid",
                "duration_months": 1
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_order_invalid_duration(self, client, auth_headers):
        """Test order creation with invalid duration."""
        response = client.post(
            "/api/payment/create-order",
            headers=auth_headers,
            json={
                "plan": "starter",
                "duration_months": 5  # Not in [1, 3, 6, 12]
            }
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_order_unauthorized(self, client):
        """Test order creation without authentication."""
        response = client.post(
            "/api/payment/create-order",
            json={
                "plan": "starter",
                "duration_months": 1
            }
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestVerifyPayment:
    """Tests for /api/payment/verify endpoint."""

    def test_verify_payment_success(
        self,
        client,
        auth_headers,
        test_user,
        db_session
    ):
        """Test successful payment verification."""
        # Create pending payment
        payment = Payment(
            user_id=test_user.id,
            razorpay_order_id="order_test123",
            amount=29900,
            currency="INR",
            status=PaymentStatus.PENDING,
            plan="starter",
            duration_months=1
        )
        db_session.add(payment)
        db_session.commit()

        # Mock signature verification
        with patch('app.services.razorpay_service.hmac.compare_digest') as mock_compare:
            mock_compare.return_value = True

            response = client.post(
                "/api/payment/verify",
                headers=auth_headers,
                json={
                    "razorpay_order_id": "order_test123",
                    "razorpay_payment_id": "pay_test123",
                    "razorpay_signature": "valid_signature"
                }
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["subscription_type"] == "starter"
        assert "subscription_expiry" in data

        # Verify payment updated
        db_session.refresh(payment)
        assert payment.status == PaymentStatus.SUCCESS
        assert payment.razorpay_payment_id == "pay_test123"

        # Verify user subscription updated
        db_session.refresh(test_user)
        assert test_user.subscription_type == "starter"
        assert test_user.subscription_expiry is not None

    def test_verify_payment_invalid_signature(
        self,
        client,
        auth_headers,
        test_user,
        db_session
    ):
        """Test payment verification with invalid signature."""
        # Create pending payment
        payment = Payment(
            user_id=test_user.id,
            razorpay_order_id="order_test456",
            amount=29900,
            currency="INR",
            status=PaymentStatus.PENDING,
            plan="starter",
            duration_months=1
        )
        db_session.add(payment)
        db_session.commit()

        # Mock signature verification failure
        with patch('app.services.razorpay_service.hmac.compare_digest') as mock_compare:
            mock_compare.return_value = False

            response = client.post(
                "/api/payment/verify",
                headers=auth_headers,
                json={
                    "razorpay_order_id": "order_test456",
                    "razorpay_payment_id": "pay_test456",
                    "razorpay_signature": "invalid_signature"
                }
            )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "signature verification failed" in response.json()["detail"].lower()

    def test_verify_payment_not_found(self, client, auth_headers):
        """Test verifying non-existent payment."""
        with patch('app.services.razorpay_service.hmac.compare_digest') as mock_compare:
            mock_compare.return_value = True

            response = client.post(
                "/api/payment/verify",
                headers=auth_headers,
                json={
                    "razorpay_order_id": "order_nonexistent",
                    "razorpay_payment_id": "pay_test",
                    "razorpay_signature": "signature"
                }
            )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_verify_payment_already_processed(
        self,
        client,
        auth_headers,
        test_user,
        db_session
    ):
        """Test verifying already successful payment."""
        # Create successful payment
        payment = Payment(
            user_id=test_user.id,
            razorpay_order_id="order_processed",
            razorpay_payment_id="pay_processed",
            amount=29900,
            currency="INR",
            status=PaymentStatus.SUCCESS,
            plan="starter",
            duration_months=1
        )
        db_session.add(payment)
        db_session.commit()

        response = client.post(
            "/api/payment/verify",
            headers=auth_headers,
            json={
                "razorpay_order_id": "order_processed",
                "razorpay_payment_id": "pay_processed2",
                "razorpay_signature": "signature"
            }
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already processed" in response.json()["detail"].lower()


class TestPaymentHistory:
    """Tests for /api/payment/history endpoint."""

    def test_get_payment_history(
        self,
        client,
        auth_headers,
        test_user,
        db_session
    ):
        """Test getting payment history."""
        # Create test payments
        for i in range(3):
            payment = Payment(
                user_id=test_user.id,
                razorpay_order_id=f"order_{i}",
                amount=29900,
                currency="INR",
                status=PaymentStatus.SUCCESS if i < 2 else PaymentStatus.PENDING,
                plan="starter",
                duration_months=1
            )
            db_session.add(payment)
        db_session.commit()

        response = client.get(
            "/api/payment/history",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 3
        assert len(data["payments"]) == 3

    def test_get_payment_history_pagination(
        self,
        client,
        auth_headers,
        test_user,
        db_session
    ):
        """Test payment history pagination."""
        # Create 5 payments
        for i in range(5):
            payment = Payment(
                user_id=test_user.id,
                razorpay_order_id=f"order_{i}",
                amount=29900,
                currency="INR",
                status=PaymentStatus.SUCCESS,
                plan="starter",
                duration_months=1
            )
            db_session.add(payment)
        db_session.commit()

        # Get first 2
        response = client.get(
            "/api/payment/history?skip=0&limit=2",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 5
        assert len(data["payments"]) == 2

        # Get next 2
        response = client.get(
            "/api/payment/history?skip=2&limit=2",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["payments"]) == 2

    def test_get_payment_history_empty(self, client, auth_headers):
        """Test getting empty payment history."""
        response = client.get(
            "/api/payment/history",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total"] == 0
        assert data["payments"] == []


class TestSubscriptionDetails:
    """Tests for /api/payment/subscription endpoint."""

    def test_get_subscription_free(self, client, auth_headers, test_user, db_session):
        """Test getting FREE subscription details."""
        response = client.get(
            "/api/payment/subscription",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["subscription_type"].upper() == "FREE"
        assert data["is_active"] is True
        assert data["days_remaining"] is None
        assert data["resume_limit"] == 3
        assert data["ats_analysis_limit"] == 5

    def test_get_subscription_active_paid(
        self,
        client,
        auth_headers,
        test_user,
        db_session
    ):
        """Test getting active paid subscription details."""
        # Update user subscription
        test_user.subscription_type = "pro"
        test_user.subscription_expiry = datetime.utcnow() + timedelta(days=20)
        db_session.commit()

        response = client.get(
            "/api/payment/subscription",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["subscription_type"] == "pro"
        assert data["is_active"] is True
        assert 19 <= data["days_remaining"] <= 20
        assert data["resume_limit"] == -1  # Unlimited

    def test_get_subscription_expired(
        self,
        client,
        auth_headers,
        test_user,
        db_session
    ):
        """Test getting expired subscription details."""
        test_user.subscription_type = "starter"
        test_user.subscription_expiry = datetime.utcnow() - timedelta(days=5)
        db_session.commit()

        response = client.get(
            "/api/payment/subscription",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_active"] is False
        assert data["days_remaining"] == 0


class TestWebhook:
    """Tests for /api/payment/webhook endpoint."""

    def test_webhook_payment_captured(self, client, db_session, test_user):
        """Test webhook for payment.captured event."""
        # Create pending payment
        payment = Payment(
            user_id=test_user.id,
            razorpay_order_id="order_webhook123",
            amount=29900,
            currency="INR",
            status=PaymentStatus.PENDING,
            plan="starter",
            duration_months=1
        )
        db_session.add(payment)
        db_session.commit()

        # Create webhook payload
        payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_webhook123",
                        "order_id": "order_webhook123",
                        "status": "captured"
                    }
                }
            }
        }

        payload_str = json.dumps(payload)

        # Mock signature verification
        with patch('app.services.razorpay_service.hmac.compare_digest') as mock_compare:
            mock_compare.return_value = True

            response = client.post(
                "/api/payment/webhook",
                content=payload_str,
                headers={"X-Razorpay-Signature": "valid_signature"}
            )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "success"

        # Verify payment updated
        db_session.refresh(payment)
        assert payment.status == PaymentStatus.SUCCESS
        assert payment.razorpay_payment_id == "pay_webhook123"

    def test_webhook_payment_failed(self, client, db_session, test_user):
        """Test webhook for payment.failed event."""
        # Create pending payment
        payment = Payment(
            user_id=test_user.id,
            razorpay_order_id="order_failed123",
            amount=29900,
            currency="INR",
            status=PaymentStatus.PENDING,
            plan="starter",
            duration_months=1
        )
        db_session.add(payment)
        db_session.commit()

        payload = {
            "event": "payment.failed",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_failed123",
                        "order_id": "order_failed123",
                        "status": "failed"
                    }
                }
            }
        }

        payload_str = json.dumps(payload)

        with patch('app.services.razorpay_service.hmac.compare_digest') as mock_compare:
            mock_compare.return_value = True

            response = client.post(
                "/api/payment/webhook",
                content=payload_str,
                headers={"X-Razorpay-Signature": "valid_signature"}
            )

        assert response.status_code == status.HTTP_200_OK

        # Verify payment marked as failed
        db_session.refresh(payment)
        assert payment.status == PaymentStatus.FAILED

    def test_webhook_invalid_signature(self, client):
        """Test webhook with invalid signature."""
        payload = {"event": "payment.captured", "payload": {}}
        payload_str = json.dumps(payload)

        with patch('app.services.razorpay_service.hmac.compare_digest') as mock_compare:
            mock_compare.return_value = False

            response = client.post(
                "/api/payment/webhook",
                content=payload_str,
                headers={"X-Razorpay-Signature": "invalid_signature"}
            )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_webhook_missing_signature(self, client):
        """Test webhook without signature header."""
        payload = {"event": "payment.captured", "payload": {}}
        payload_str = json.dumps(payload)

        response = client.post(
            "/api/payment/webhook",
            content=payload_str
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestGetPricing:
    """Tests for /api/payment/pricing endpoint."""

    def test_get_pricing_no_auth(self, client):
        """Test getting pricing without authentication."""
        response = client.get("/api/payment/pricing")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["currency"] == "INR"
        assert len(data["plans"]) == 2

        # Verify plan structure
        plan = data["plans"][0]
        assert "plan" in plan
        assert "monthly_price" in plan
        assert "quarterly_price" in plan
        assert "features" in plan
        assert "resume_limit" in plan

    def test_get_pricing_with_auth(self, client, auth_headers):
        """Test getting pricing with authentication."""
        response = client.get(
            "/api/payment/pricing",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["plans"]) == 2
