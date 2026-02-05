# Email Notifications Guide

## Overview

The Resume Builder application includes a comprehensive email notification system that sends transactional emails for important user events such as account creation, payment confirmations, subscription updates, and more.

---

## Features

- ✅ **Welcome Emails** - Sent when users sign up
- ✅ **Payment Confirmations** - Sent after successful payments
- ✅ **Subscription Notifications** - Activated, renewed, cancelled
- ✅ **Payment Failures** - Alerts when payments fail
- ✅ **Password Reset** - Secure password reset links
- ✅ **Professional Templates** - Beautiful HTML email templates
- ✅ **SMTP Support** - Works with Gmail, SendGrid, AWS SES, and more
- ✅ **Fallback Support** - Plain text versions for all emails
- ✅ **Easy Configuration** - Environment-based setup

---

## Email Service Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@resumebuilder.com
SMTP_FROM_NAME=Resume Builder
EMAIL_ENABLED=true
```

### Supported Email Providers

#### 1. Gmail (Recommended for Development)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Get from Google Account Security
```

**Setup Instructions:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use that password in `SMTP_PASSWORD`

**Note:** Regular Gmail password won't work. You must use App Password.

#### 2. SendGrid (Recommended for Production)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

**Setup Instructions:**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create an API Key with "Mail Send" permissions
4. Use `apikey` as username and your API key as password

**Benefits:**
- 100 emails/day on free tier
- Better deliverability
- Email analytics
- Template management

#### 3. AWS SES (Recommended for Scale)

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

**Setup Instructions:**
1. Enable AWS SES in your AWS account
2. Verify your sender email/domain
3. Create SMTP credentials in SES Console
4. Move out of sandbox mode for production

**Benefits:**
- $0.10 per 1,000 emails
- Highly scalable
- AWS infrastructure reliability

#### 4. Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
```

---

## Email Types and Templates

### 1. Welcome Email
**Triggered:** When user signs up
**Template:** `welcome.html`
**Subject:** "Welcome to Resume Builder!"

**Usage:**
```python
from app.services.email_service import email_service

email_service.send_welcome_email(
    user_email="user@example.com",
    user_name="John Doe"
)
```

### 2. Payment Success Email
**Triggered:** After successful payment
**Template:** `payment_success.html`
**Subject:** "Payment Successful - PLAN Plan Activated"

**Usage:**
```python
email_service.send_payment_success_email(
    user_email="user@example.com",
    user_name="John Doe",
    plan="starter",
    amount=29900,  # Amount in paise (₹299)
    duration_months=12,
    payment_id="pay_ABC123",
    recurring=False
)
```

### 3. Subscription Activated Email
**Triggered:** When recurring subscription is activated
**Template:** `subscription_activated.html`
**Subject:** "Subscription Activated - PLAN Plan"

**Usage:**
```python
email_service.send_subscription_activated_email(
    user_email="user@example.com",
    user_name="John Doe",
    plan="starter",
    next_billing_date="March 1, 2026"
)
```

### 4. Renewal Reminder Email
**Triggered:** 3 days before next billing
**Template:** `renewal_reminder.html`
**Subject:** "Upcoming Renewal - PLAN Plan"

**Usage:**
```python
email_service.send_renewal_reminder_email(
    user_email="user@example.com",
    user_name="John Doe",
    plan="starter",
    amount=29900,
    billing_date="March 1, 2026"
)
```

### 5. Payment Failed Email
**Triggered:** When payment fails
**Template:** `payment_failed.html`
**Subject:** "Payment Failed - Action Required"

**Usage:**
```python
email_service.send_payment_failed_email(
    user_email="user@example.com",
    user_name="John Doe",
    plan="starter",
    amount=29900,
    retry_date="February 10, 2026"
)
```

### 6. Subscription Cancelled Email
**Triggered:** When user cancels subscription
**Template:** `subscription_cancelled.html`
**Subject:** "Subscription Cancelled"

**Usage:**
```python
email_service.send_subscription_cancelled_email(
    user_email="user@example.com",
    user_name="John Doe",
    plan="starter",
    expiry_date="March 31, 2026"
)
```

### 7. Password Reset Email
**Triggered:** When user requests password reset
**Template:** `password_reset.html`
**Subject:** "Reset Your Password"

**Usage:**
```python
email_service.send_password_reset_email(
    user_email="user@example.com",
    user_name="John Doe",
    reset_token="secure_token_123"
)
```

---

## Current Integrations

### Auth Routes ([auth.py](../app/routes/auth.py))

**Signup (`POST /api/auth/signup`):**
- Sends welcome email after successful registration
- Non-blocking (doesn't fail signup if email fails)

### Payment Webhooks ([payment.py](../app/routes/payment.py))

**payment.captured:**
- Sends payment success email
- Includes plan, amount, duration details

**subscription.activated:**
- Sends subscription activated email
- Includes next billing date

**payment.failed:**
- Sends payment failed notification
- Includes retry date

**subscription.halted:**
- Sends payment failed email (after retries)
- User has been downgraded to FREE

**subscription.cancelled:**
- Sends cancellation confirmation
- User keeps access until expiry

---

## Email Template Customization

### Template Location
All templates are in: `backend/app/templates/emails/`

### Template Variables

Templates use `{{variable_name}}` for variable substitution.

**Example:**
```html
<h2>Welcome, {{user_name}}!</h2>
<a href="{{login_url}}">Login Here</a>
```

### Creating Custom Templates

1. Create new HTML file in `backend/app/templates/emails/`
2. Use template variables with `{{variable_name}}`
3. Add method to `EmailService` class
4. Call the method from your route

**Example:**
```python
# In app/services/email_service.py
def send_custom_email(self, user_email: str, user_name: str) -> bool:
    """Send custom email."""
    html_content = self._load_template("custom.html", {
        "user_name": user_name,
        "custom_var": "value"
    })

    return self.send_email(
        to_email=user_email,
        subject="Custom Email",
        html_content=html_content
    )
```

---

## Testing Email Service

### Run Email Tests

```bash
cd backend
source venv/bin/activate
pytest tests/test_email.py -v
```

**Test Coverage:**
- ✅ 19 email service tests
- ✅ SMTP connection mocking
- ✅ All email types
- ✅ Template loading
- ✅ Error handling
- ✅ Configuration validation

### Manual Testing

1. **Disable Email Sending (Development):**
```bash
EMAIL_ENABLED=false
```

2. **Test with Real SMTP:**
```bash
EMAIL_ENABLED=true
SMTP_USER=your-real-email@gmail.com
SMTP_PASSWORD=your-app-password
```

3. **Check Logs:**
```bash
tail -f logs/app.log | grep email
```

---

## Production Checklist

### Before Deployment

- [ ] Choose email provider (SendGrid/AWS SES recommended)
- [ ] Create production email account/API keys
- [ ] Verify sender email/domain
- [ ] Update `SMTP_FROM_EMAIL` to your domain
- [ ] Test all email types in staging
- [ ] Set up email monitoring/alerts
- [ ] Configure SPF/DKIM/DMARC records
- [ ] Enable EMAIL_ENABLED=true

### Domain Configuration

**SPF Record:**
```
v=spf1 include:_spf.google.com ~all  # For Gmail
v=spf1 include:sendgrid.net ~all     # For SendGrid
v=spf1 include:amazonses.com ~all    # For AWS SES
```

**DKIM Record:**
Follow your provider's instructions to set up DKIM.

**DMARC Record:**
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

---

## Monitoring and Logging

### Email Logs

All email operations are logged:

```python
logger.info(f"Email sent successfully to {to_email}: {subject}")
logger.error(f"Failed to send email to {to_email}: {str(e)}")
```

### View Logs

```bash
# All email logs
grep "email" backend/logs/app.log

# Failed emails only
grep "Failed to send email" backend/logs/app.log
```

### Monitoring Metrics

Track these metrics in production:
- Email delivery rate
- Email bounce rate
- Open rates (if using SendGrid/Mailgun)
- Click-through rates
- Spam complaints

---

## Troubleshooting

### Email Not Sending

**Check Configuration:**
```bash
# Verify environment variables are set
echo $SMTP_USER
echo $SMTP_HOST
```

**Common Issues:**

1. **Gmail: "Username and Password not accepted"**
   - Solution: Use App Password, not regular password
   - Enable 2-Factor Authentication first

2. **Connection Timeout**
   - Solution: Check firewall/network settings
   - Ensure port 587 is open

3. **Authentication Failed**
   - Solution: Verify credentials
   - Check if account is active

4. **Emails in Spam**
   - Solution: Configure SPF, DKIM, DMARC
   - Use verified domain
   - Avoid spam trigger words

### Testing SMTP Connection

```python
import smtplib

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login('your-email@gmail.com', 'your-app-password')
    print("✓ SMTP connection successful")
    server.quit()
except Exception as e:
    print(f"✗ SMTP connection failed: {e}")
```

---

## Performance Considerations

### Async Email Sending

For production, consider sending emails asynchronously:

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=3)

def send_email_async(email_func, *args, **kwargs):
    """Send email in background thread."""
    loop = asyncio.get_event_loop()
    loop.run_in_executor(executor, email_func, *args, **kwargs)
```

### Email Queue (Future Enhancement)

For high-volume applications, use a queue:
- Celery + Redis
- AWS SQS
- RabbitMQ

---

## Security Best Practices

1. **Never Commit Credentials**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use App Passwords**
   - Never use main account password
   - Rotate credentials regularly

3. **Validate Email Addresses**
   - Already handled by Pydantic validation
   - Additional validation in email service

4. **Rate Limiting**
   - Implement email sending limits
   - Prevent abuse

5. **Secure Password Reset**
   - Tokens expire in 1 hour
   - One-time use only
   - Secure random generation

---

## API Reference

### EmailService Class

**Location:** `app/services/email_service.py`

**Methods:**

- `send_email()` - Core email sending method
- `send_welcome_email()` - Welcome new users
- `send_payment_success_email()` - Payment confirmation
- `send_subscription_activated_email()` - Subscription start
- `send_renewal_reminder_email()` - Billing reminder
- `send_payment_failed_email()` - Payment failure alert
- `send_subscription_cancelled_email()` - Cancellation confirm
- `send_password_reset_email()` - Password reset link

**Configuration:**

```python
from app.services.email_service import email_service

# Email service is a singleton
# Configuration loaded from environment variables
```

---

## Summary

✅ **Email System Implemented:**
- 7 email types configured
- 7 professional HTML templates
- Full SMTP integration
- 19 passing tests
- Production-ready
- Integrated with auth and payment systems

🚀 **Next Steps:**
1. Configure production SMTP provider
2. Verify sender domain
3. Test in staging environment
4. Monitor email delivery rates
5. Set up email analytics (optional)

📧 **Support:**
- For issues, check logs in `backend/logs/app.log`
- Test connection with provider's diagnostic tools
- Consult provider documentation for specific errors
