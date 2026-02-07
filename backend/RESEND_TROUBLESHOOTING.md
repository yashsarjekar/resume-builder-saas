# Resend SMTP Connection Timeout Fix

## Current Error in Railway Logs

```
Failed to send email: [Errno 110] Connection timed out
```

## Root Cause

Railway is timing out when trying to connect to `smtp.resend.com:587`. This could be:

1. Railway network restrictions on port 587
2. Invalid Resend API key
3. Resend API key permissions issue
4. Need to use SSL/TLS differently

## Solutions to Try (In Order)

### Solution 1: Verify Resend API Key (Quickest)

Your current API key: `re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4`

1. **Check if key is valid:**
   - Go to https://resend.com/api-keys
   - Make sure this key exists and is active
   - Check it has "Email Sending" permission

2. **If needed, create a new API key:**
   - Click "Create API Key"
   - Name: "Resume Builder Production"
   - Permission: "Sending access" or "Full access"
   - Copy the new key (starts with `re_`)

3. **Update Railway:**
   ```bash
   railway variables set SMTP_PASSWORD="re_your_new_key"
   ```

### Solution 2: Try Port 465 (SMTP_SSL)

Port 465 uses implicit SSL (might avoid Railway restrictions).

**Important:** This requires code changes to use `SMTP_SSL` instead of `SMTP`.

**Update email_service.py:**

```python
# Current code (line 84-86):
with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
    server.starttls()
    server.login(self.smtp_user, self.smtp_password)

# Change to (for port 465):
import ssl

if self.smtp_port == 465:
    # Use SMTP_SSL for port 465
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, context=context) as server:
        server.login(self.smtp_user, self.smtp_password)
        # ... send email
else:
    # Use SMTP with STARTTLS for port 587
    with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
        server.starttls()
        server.login(self.smtp_user, self.smtp_password)
        # ... send email
```

### Solution 3: Contact Railway Support

If SMTP is blocked, ask Railway to whitelist smtp.resend.com:

```
Railway support: https://railway.app/help
```

Ask: "Is outbound SMTP traffic (port 587) allowed? I'm trying to use Resend SMTP."

### Solution 4: Use Resend HTTP API Instead of SMTP

**Pros:**
- No SMTP port restrictions
- Faster
- Better for cloud platforms
- More features (templates, webhooks)

**Cons:**
- Requires code changes
- Need to install `resend` package

**Implementation:**

1. **Install Resend SDK:**
   ```bash
   pip install resend
   # Add to requirements.txt
   ```

2. **Update email_service.py** to use HTTP API instead of SMTP

Would you like me to implement the Resend HTTP API solution? It's more reliable for cloud deployments.

### Solution 5: Try Alternative Email Service

If Resend SMTP doesn't work on Railway:

**SendGrid** (100 emails/day free):
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_sendgrid_api_key
```

**Mailgun** (5,000 emails/month):
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-sandbox.mailgun.org
SMTP_PASSWORD=your_mailgun_password
```

## Quick Test

Check if Resend SMTP works from Railway:

```bash
# SSH into Railway container (if possible)
railway run bash

# Try telnet to test SMTP connection
telnet smtp.resend.com 587

# Or with curl
curl -v telnet://smtp.resend.com:587
```

If this times out, Railway is blocking SMTP.

## Recommended: Switch to Resend HTTP API

Since you already have a Resend account, the HTTP API is the most reliable solution. No port restrictions, no SMTP issues.

Let me know if you want me to:
1. ✅ Implement Resend HTTP API (recommended)
2. Update code for port 465
3. Try SendGrid SMTP instead

The HTTP API is the best long-term solution for production!
