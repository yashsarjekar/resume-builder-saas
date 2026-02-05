"""
Email service for sending transactional emails.
Supports SMTP with HTML and plain text templates.
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP."""

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("SMTP_FROM_EMAIL", "noreply@resumebuilder.com")
        self.from_name = os.getenv("SMTP_FROM_NAME", "Resume Builder")
        self.enabled = os.getenv("EMAIL_ENABLED", "true").lower() == "true"

        # Get template directory
        self.template_dir = Path(__file__).parent.parent / "templates" / "emails"

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> bool:
        """
        Send an email.

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content (fallback)
            cc: List of CC recipients
            bcc: List of BCC recipients

        Returns:
            bool: True if email was sent successfully, False otherwise
        """
        if not self.enabled:
            logger.info(f"Email service disabled. Would have sent: {subject} to {to_email}")
            return True

        if not self.smtp_user or not self.smtp_password:
            logger.error("SMTP credentials not configured")
            return False

        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email

            if cc:
                msg['Cc'] = ', '.join(cc)
            if bcc:
                msg['Bcc'] = ', '.join(bcc)

            # Attach plain text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, 'plain')
                msg.attach(part1)

            part2 = MIMEText(html_content, 'html')
            msg.attach(part2)

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)

                recipients = [to_email]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)

                server.sendmail(self.from_email, recipients, msg.as_string())

            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new user."""
        subject = "Welcome to Resume Builder!"

        html_content = self._load_template("welcome.html", {
            "user_name": user_name,
            "login_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/login"
        })

        text_content = f"""
Hi {user_name},

Welcome to Resume Builder! We're excited to have you on board.

Get started by logging in:
{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/login

Best regards,
Resume Builder Team
        """

        return self.send_email(user_email, subject, html_content, text_content)

    def send_payment_success_email(
        self,
        user_email: str,
        user_name: str,
        plan: str,
        amount: int,
        duration_months: int,
        payment_id: str,
        recurring: bool = False
    ) -> bool:
        """Send payment confirmation email."""
        subject = f"Payment Successful - {plan.upper()} Plan Activated"

        amount_inr = amount / 100  # Convert paise to rupees

        html_content = self._load_template("payment_success.html", {
            "user_name": user_name,
            "plan": plan.upper(),
            "amount": f"₹{amount_inr:,.2f}",
            "duration": f"{duration_months} month{'s' if duration_months > 1 else ''}",
            "payment_id": payment_id,
            "recurring": recurring,
            "recurring_text": "Your subscription will automatically renew each month." if recurring else "This is a one-time payment.",
            "dashboard_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard"
        })

        text_content = f"""
Hi {user_name},

Your payment was successful! Your {plan.upper()} plan is now active.

Payment Details:
- Plan: {plan.upper()}
- Amount: ₹{amount_inr:,.2f}
- Duration: {duration_months} month{'s' if duration_months > 1 else ''}
- Payment ID: {payment_id}
- Payment Type: {'Recurring (Auto-renewal enabled)' if recurring else 'One-time'}

{'Your subscription will automatically renew each month.' if recurring else 'This is a one-time payment. You will need to renew manually when it expires.'}

Access your dashboard:
{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard

Thank you for your purchase!

Best regards,
Resume Builder Team
        """

        return self.send_email(user_email, subject, html_content, text_content)

    def send_subscription_activated_email(
        self,
        user_email: str,
        user_name: str,
        plan: str,
        next_billing_date: str
    ) -> bool:
        """Send subscription activation email."""
        subject = f"Subscription Activated - {plan.upper()} Plan"

        html_content = self._load_template("subscription_activated.html", {
            "user_name": user_name,
            "plan": plan.upper(),
            "next_billing_date": next_billing_date,
            "dashboard_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard",
            "manage_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/settings/subscription"
        })

        text_content = f"""
Hi {user_name},

Your {plan.upper()} subscription is now active!

Next billing date: {next_billing_date}

You can manage your subscription at any time:
{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/settings/subscription

Best regards,
Resume Builder Team
        """

        return self.send_email(user_email, subject, html_content, text_content)

    def send_renewal_reminder_email(
        self,
        user_email: str,
        user_name: str,
        plan: str,
        amount: int,
        billing_date: str
    ) -> bool:
        """Send subscription renewal reminder."""
        subject = f"Upcoming Renewal - {plan.upper()} Plan"

        amount_inr = amount / 100

        html_content = self._load_template("renewal_reminder.html", {
            "user_name": user_name,
            "plan": plan.upper(),
            "amount": f"₹{amount_inr:,.2f}",
            "billing_date": billing_date,
            "manage_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/settings/subscription"
        })

        text_content = f"""
Hi {user_name},

This is a reminder that your {plan.upper()} subscription will automatically renew soon.

Billing Details:
- Amount: ₹{amount_inr:,.2f}
- Billing Date: {billing_date}

To manage or cancel your subscription:
{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/settings/subscription

Best regards,
Resume Builder Team
        """

        return self.send_email(user_email, subject, html_content, text_content)

    def send_payment_failed_email(
        self,
        user_email: str,
        user_name: str,
        plan: str,
        amount: int,
        retry_date: Optional[str] = None
    ) -> bool:
        """Send payment failure notification."""
        subject = "Payment Failed - Action Required"

        amount_inr = amount / 100

        html_content = self._load_template("payment_failed.html", {
            "user_name": user_name,
            "plan": plan.upper(),
            "amount": f"₹{amount_inr:,.2f}",
            "retry_date": retry_date or "soon",
            "update_payment_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/settings/payment"
        })

        text_content = f"""
Hi {user_name},

We were unable to process your payment for the {plan.upper()} plan.

Payment Details:
- Amount: ₹{amount_inr:,.2f}
- Plan: {plan.upper()}
- {'Next retry: ' + retry_date if retry_date else 'We will retry soon'}

Please update your payment method:
{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/settings/payment

If you have any questions, please contact our support team.

Best regards,
Resume Builder Team
        """

        return self.send_email(user_email, subject, html_content, text_content)

    def send_subscription_cancelled_email(
        self,
        user_email: str,
        user_name: str,
        plan: str,
        expiry_date: str
    ) -> bool:
        """Send subscription cancellation confirmation."""
        subject = "Subscription Cancelled"

        html_content = self._load_template("subscription_cancelled.html", {
            "user_name": user_name,
            "plan": plan.upper(),
            "expiry_date": expiry_date,
            "resubscribe_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pricing"
        })

        text_content = f"""
Hi {user_name},

Your {plan.upper()} subscription has been cancelled.

You will retain access until: {expiry_date}

After this date, you will be downgraded to the FREE plan.

To resubscribe:
{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/pricing

We're sorry to see you go!

Best regards,
Resume Builder Team
        """

        return self.send_email(user_email, subject, html_content, text_content)

    def send_password_reset_email(
        self,
        user_email: str,
        user_name: str,
        reset_token: str
    ) -> bool:
        """Send password reset email."""
        subject = "Reset Your Password"

        reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"

        html_content = self._load_template("password_reset.html", {
            "user_name": user_name,
            "reset_url": reset_url
        })

        text_content = f"""
Hi {user_name},

You requested to reset your password.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Resume Builder Team
        """

        return self.send_email(user_email, subject, html_content, text_content)

    def _load_template(self, template_name: str, variables: dict) -> str:
        """
        Load an email template and replace variables.

        Args:
            template_name: Name of the template file
            variables: Dictionary of variables to replace in template

        Returns:
            str: Rendered HTML content
        """
        template_path = self.template_dir / template_name

        # If template doesn't exist, return a simple HTML version
        if not template_path.exists():
            logger.warning(f"Template {template_name} not found, using inline HTML")
            return self._generate_inline_html(template_name, variables)

        try:
            with open(template_path, 'r') as f:
                template = f.read()

            # Simple template variable replacement
            for key, value in variables.items():
                template = template.replace(f"{{{{{key}}}}}", str(value))

            return template

        except Exception as e:
            logger.error(f"Failed to load template {template_name}: {str(e)}")
            return self._generate_inline_html(template_name, variables)

    def _generate_inline_html(self, template_name: str, variables: dict) -> str:
        """Generate simple inline HTML when template is not available."""
        # Simple fallback HTML
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #4F46E5; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background: #f9f9f9; }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Resume Builder</h1>
                </div>
                <div class="content">
        """

        # Add content based on template type
        if "welcome" in template_name:
            html += f"""
                    <h2>Welcome {variables.get('user_name', '')}!</h2>
                    <p>We're excited to have you on board.</p>
                    <p><a href="{variables.get('login_url', '#')}" class="button">Get Started</a></p>
            """
        elif "payment_success" in template_name:
            html += f"""
                    <h2>Payment Successful!</h2>
                    <p>Hi {variables.get('user_name', '')},</p>
                    <p>Your {variables.get('plan', '')} plan is now active.</p>
                    <p><strong>Amount:</strong> {variables.get('amount', '')}</p>
                    <p><strong>Duration:</strong> {variables.get('duration', '')}</p>
                    <p><strong>Payment ID:</strong> {variables.get('payment_id', '')}</p>
                    <p>{variables.get('recurring_text', '')}</p>
                    <p><a href="{variables.get('dashboard_url', '#')}" class="button">Go to Dashboard</a></p>
            """

        html += """
                </div>
                <div class="footer">
                    <p>&copy; 2026 Resume Builder. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """

        return html


# Singleton instance
email_service = EmailService()
