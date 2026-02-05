"""
Tests for email service functionality.

This module tests email sending capabilities including welcome emails,
payment notifications, and subscription-related emails.
"""

import pytest
import os
from unittest.mock import Mock, patch, MagicMock
from app.services.email_service import EmailService, email_service


class TestEmailService:
    """Test suite for EmailService class."""

    def setup_method(self):
        """Set up test fixtures."""
        # Create email service instance with test config
        self.email_service = EmailService()
        self.test_email = "test@example.com"
        self.test_name = "Test User"

    @patch('smtplib.SMTP')
    def test_send_email_success(self, mock_smtp):
        """Test successful email sending."""
        # Mock SMTP server
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        # Send email
        result = self.email_service.send_email(
            to_email=self.test_email,
            subject="Test Email",
            html_content="<p>Test content</p>",
            text_content="Test content"
        )

        # Verify
        assert result is True
        mock_server.starttls.assert_called_once()
        mock_server.sendmail.assert_called_once()

    def test_send_email_disabled(self):
        """Test email sending when service is disabled."""
        # Temporarily disable email service
        original_enabled = self.email_service.enabled
        self.email_service.enabled = False

        # Send email
        result = self.email_service.send_email(
            to_email=self.test_email,
            subject="Test Email",
            html_content="<p>Test content</p>"
        )

        # Verify - should return True but not actually send
        assert result is True

        # Restore original setting
        self.email_service.enabled = original_enabled

    @patch('smtplib.SMTP')
    def test_send_email_smtp_failure(self, mock_smtp):
        """Test email sending with SMTP failure."""
        # Mock SMTP to raise exception
        mock_smtp.side_effect = Exception("SMTP connection failed")

        # Send email
        result = self.email_service.send_email(
            to_email=self.test_email,
            subject="Test Email",
            html_content="<p>Test content</p>"
        )

        # Verify - should return False on failure
        assert result is False

    @patch.object(EmailService, 'send_email')
    def test_send_welcome_email(self, mock_send):
        """Test welcome email sending."""
        mock_send.return_value = True

        # Send welcome email
        result = self.email_service.send_welcome_email(
            user_email=self.test_email,
            user_name=self.test_name
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        assert args[0] == self.test_email
        assert "Welcome" in args[1]  # Subject contains "Welcome"

    @patch.object(EmailService, 'send_email')
    def test_send_payment_success_email(self, mock_send):
        """Test payment success email sending."""
        mock_send.return_value = True

        # Send payment success email
        result = self.email_service.send_payment_success_email(
            user_email=self.test_email,
            user_name=self.test_name,
            plan="starter",
            amount=29900,
            duration_months=12,
            payment_id="pay_test123",
            recurring=False
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        assert args[0] == self.test_email
        assert "Payment Successful" in args[1]  # Subject

    @patch.object(EmailService, 'send_email')
    def test_send_payment_success_email_recurring(self, mock_send):
        """Test payment success email for recurring subscription."""
        mock_send.return_value = True

        # Send payment success email with recurring=True
        result = self.email_service.send_payment_success_email(
            user_email=self.test_email,
            user_name=self.test_name,
            plan="pro",
            amount=59900,
            duration_months=1,
            payment_id="pay_test456",
            recurring=True
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()

    @patch.object(EmailService, 'send_email')
    def test_send_subscription_activated_email(self, mock_send):
        """Test subscription activated email sending."""
        mock_send.return_value = True

        # Send subscription activated email
        result = self.email_service.send_subscription_activated_email(
            user_email=self.test_email,
            user_name=self.test_name,
            plan="starter",
            next_billing_date="March 1, 2026"
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        assert args[0] == self.test_email
        assert "Subscription Activated" in args[1]

    @patch.object(EmailService, 'send_email')
    def test_send_renewal_reminder_email(self, mock_send):
        """Test renewal reminder email sending."""
        mock_send.return_value = True

        # Send renewal reminder email
        result = self.email_service.send_renewal_reminder_email(
            user_email=self.test_email,
            user_name=self.test_name,
            plan="starter",
            amount=29900,
            billing_date="March 1, 2026"
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        assert args[0] == self.test_email
        assert "Renewal" in args[1]

    @patch.object(EmailService, 'send_email')
    def test_send_payment_failed_email(self, mock_send):
        """Test payment failed email sending."""
        mock_send.return_value = True

        # Send payment failed email
        result = self.email_service.send_payment_failed_email(
            user_email=self.test_email,
            user_name=self.test_name,
            plan="starter",
            amount=29900,
            retry_date="February 10, 2026"
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        assert args[0] == self.test_email
        assert "Payment Failed" in args[1]

    @patch.object(EmailService, 'send_email')
    def test_send_payment_failed_email_no_retry(self, mock_send):
        """Test payment failed email without retry date."""
        mock_send.return_value = True

        # Send payment failed email without retry date
        result = self.email_service.send_payment_failed_email(
            user_email=self.test_email,
            user_name=self.test_name,
            plan="starter",
            amount=29900,
            retry_date=None
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()

    @patch.object(EmailService, 'send_email')
    def test_send_subscription_cancelled_email(self, mock_send):
        """Test subscription cancelled email sending."""
        mock_send.return_value = True

        # Send subscription cancelled email
        result = self.email_service.send_subscription_cancelled_email(
            user_email=self.test_email,
            user_name=self.test_name,
            plan="starter",
            expiry_date="March 31, 2026"
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        assert args[0] == self.test_email
        assert "Subscription Cancelled" in args[1]

    @patch.object(EmailService, 'send_email')
    def test_send_password_reset_email(self, mock_send):
        """Test password reset email sending."""
        mock_send.return_value = True

        # Send password reset email
        result = self.email_service.send_password_reset_email(
            user_email=self.test_email,
            user_name=self.test_name,
            reset_token="test_token_123"
        )

        # Verify
        assert result is True
        mock_send.assert_called_once()
        args, kwargs = mock_send.call_args
        assert args[0] == self.test_email
        assert "Reset" in args[1] or "Password" in args[1]

    def test_load_template_not_exists(self):
        """Test template loading when template file doesn't exist."""
        # Try to load non-existent template
        html = self.email_service._load_template(
            "nonexistent.html",
            {"user_name": "Test User"}
        )

        # Verify - should return inline HTML
        assert html is not None
        assert "<!DOCTYPE html>" in html
        assert "Resume Builder" in html  # Default fallback includes app name

    def test_generate_inline_html(self):
        """Test inline HTML generation."""
        # Generate inline HTML
        html = self.email_service._generate_inline_html(
            "welcome.html",
            {
                "user_name": "Test User",
                "login_url": "http://localhost:3000/login"
            }
        )

        # Verify
        assert html is not None
        assert "<!DOCTYPE html>" in html
        assert "Test User" in html
        assert "Resume Builder" in html

    def test_email_service_configuration(self):
        """Test email service configuration from environment."""
        # Verify configuration is loaded
        assert self.email_service.smtp_host is not None
        assert self.email_service.smtp_port > 0
        assert self.email_service.from_email is not None
        assert self.email_service.from_name is not None

    @patch('smtplib.SMTP')
    def test_send_email_with_cc_bcc(self, mock_smtp):
        """Test email sending with CC and BCC recipients."""
        # Mock SMTP server
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        # Send email with CC and BCC
        result = self.email_service.send_email(
            to_email=self.test_email,
            subject="Test Email",
            html_content="<p>Test content</p>",
            cc=["cc@example.com"],
            bcc=["bcc@example.com"]
        )

        # Verify
        assert result is True
        mock_server.sendmail.assert_called_once()

    def test_singleton_instance(self):
        """Test that email_service is a singleton instance."""
        # Verify the module-level instance exists
        assert email_service is not None
        assert isinstance(email_service, EmailService)


class TestEmailIntegration:
    """Integration tests for email service."""

    @pytest.mark.integration
    @patch('smtplib.SMTP')
    def test_full_email_flow(self, mock_smtp):
        """Test complete email sending flow."""
        # Mock SMTP server
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        # Create service and send email
        service = EmailService()
        result = service.send_welcome_email(
            user_email="integration@test.com",
            user_name="Integration Test User"
        )

        # Verify
        assert result is True

    @pytest.mark.integration
    def test_email_disabled_flow(self):
        """Test email flow when service is disabled."""
        # Create service with disabled flag
        service = EmailService()
        original_enabled = service.enabled
        service.enabled = False

        # Try to send email
        result = service.send_payment_success_email(
            user_email="test@example.com",
            user_name="Test User",
            plan="starter",
            amount=29900,
            duration_months=12,
            payment_id="pay_test",
            recurring=False
        )

        # Verify - should return True but not send
        assert result is True

        # Restore
        service.enabled = original_enabled


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
