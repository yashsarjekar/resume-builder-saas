# Email Service Fix Guide

## Problem
The email service works locally but not in production (Railway) because environment variables are not configured.

## Root Cause
Railway doesn't automatically use the `.env` file from your repository. Environment variables must be configured directly in the Railway dashboard or via CLI.

## Solution

### Option 1: Using Railway Dashboard (Recommended)

1. Go to [Railway Dashboard](https://railway.app/)
2. Select your project
3. Click on your **backend service**
4. Navigate to the **Variables** tab
5. Add the following environment variables:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = yashsarjekar35@gmail.com
SMTP_PASSWORD = qdmepvjkblmksdgt
SMTP_FROM_EMAIL = noreply@resumebuilder.com
SMTP_FROM_NAME = Resume Builder
EMAIL_ENABLED = true
```

6. Click **Save** - Railway will automatically redeploy your service

### Option 2: Using Railway CLI

If you have the Railway CLI installed:

```bash
cd backend
railway link  # Link to your project if not already linked
bash setup_railway_env.sh
```

Or manually:

```bash
railway variables set SMTP_HOST=smtp.gmail.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER=yashsarjekar35@gmail.com
railway variables set SMTP_PASSWORD=qdmepvjkblmksdgt
railway variables set SMTP_FROM_EMAIL=noreply@resumebuilder.com
railway variables set SMTP_FROM_NAME="Resume Builder"
railway variables set EMAIL_ENABLED=true
```

## Verification

### 1. Verify Configuration (Production)

After deployment, SSH into your Railway instance or check logs:

```bash
railway run python verify_email_config.py
```

This will show whether all email environment variables are properly configured.

### 2. Test Email Locally

```bash
cd backend
source venv/bin/activate
python test_email_connection.py
```

### 3. Check Production Logs

After setting up the variables, trigger a user registration or password reset and check the Railway logs for:

```
✓ Email sent successfully to user@example.com: Welcome to Resume Builder!
```

Or if there's an error:

```
✗ Failed to send email to user@example.com: [error details]
```

## Important: Gmail App Password

The SMTP password `qdmepvjkblmksdgt` appears to be a Gmail App Password. If you're having authentication issues:

1. **Enable 2-Factor Authentication** on your Gmail account (yashsarjekar35@gmail.com)
2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Resume Builder App"
   - Copy the 16-character password
3. **Update the password** in Railway variables with the new App Password

## Security Best Practice

⚠️ **Never commit `.env` files to Git!**

The `.env` file contains sensitive credentials. Make sure it's in `.gitignore`:

```bash
# Check if .env is ignored
git check-ignore backend/.env
```

If not, add it to `.gitignore`:

```bash
echo "backend/.env" >> .gitignore
git add .gitignore
git commit -m "Ensure .env is gitignored"
```

## Troubleshooting

### Emails Still Not Sending?

1. **Check Railway Logs**:
   ```bash
   railway logs
   ```
   Look for email-related errors

2. **Verify Variables Are Set**:
   In Railway dashboard → Variables tab, confirm all SMTP variables are present

3. **Check Gmail Security**:
   - Visit https://myaccount.google.com/security
   - Check "Recent security events" for blocked sign-in attempts
   - Make sure "Less secure app access" is OFF (use App Passwords instead)

4. **Test SMTP Connection**:
   Deploy this test and check if it works:
   ```bash
   railway run python test_email_connection.py
   ```

5. **Check Email Service is Enabled**:
   Verify `EMAIL_ENABLED=true` in Railway variables

## Current Email Triggers

Emails are sent in these scenarios:

1. **Welcome Email** - When a new user registers ([auth.py:101](app/routes/auth.py#L101))
2. **Payment Success** - After successful payment ([payment.py:383](app/routes/payment.py#L383))
3. **Payment Failed** - When payment fails ([payment.py:414](app/routes/payment.py#L414))
4. **Subscription Activated** - When subscription starts ([payment.py:450](app/routes/payment.py#L450))
5. **Subscription Cancelled** - When user cancels ([payment.py:542](app/routes/payment.py#L542))

All email sending is wrapped in try-catch blocks, so failures won't crash the application.

## Next Steps

After fixing the Railway environment variables:

1. ✅ Set up SMTP variables in Railway
2. ✅ Verify configuration with `verify_email_config.py`
3. ✅ Test by registering a new user
4. ✅ Check Railway logs for success messages
5. ✅ Check your email inbox (and spam folder)

If you still have issues after following this guide, check the Railway logs for specific error messages.
