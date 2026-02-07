# Railway Configuration Fixes

## Issues Found

### 1. Production API Not Responding
Your Railway service at `https://resume-builder-backend-production-f9db.up.railway.app` is not responding to requests. This could be why emails aren't working.

**Check Railway Status:**
```bash
railway status
railway logs --tail 100
```

Look for errors like:
- Database connection failures
- Port binding issues
- Module import errors
- Startup crashes

### 2. Wrong ENVIRONMENT Setting
Your Railway environment variables show:
```
ENVIRONMENT="development"
```

This should be:
```
ENVIRONMENT="production"
```

**Fix:** In Railway Dashboard → Variables → Edit `ENVIRONMENT` → Set to `production`

### 3. Wrong FRONTEND_URL
Current setting:
```
FRONTEND_URL="http://localhost:3000"
```

This will break email links! Update to your actual frontend URL:
```
FRONTEND_URL="https://your-frontend-domain.com"
```

Or if using Vercel:
```
FRONTEND_URL="https://your-app.vercel.app"
```

**Why this matters for emails:**
- Welcome emails include login links
- Password reset emails include reset links
- Payment emails include dashboard links
- All these use FRONTEND_URL

### 4. Potential Gmail App Password Issue

The SMTP password in your config (`qdmepvjkblmksdgt`) might be:
- Invalid or expired
- Not an App Password (should be 16 characters without spaces)
- Blocked by Gmail for Railway's IP addresses

## How to Fix

### Step 1: Check Railway Logs
```bash
# Install Railway CLI if needed
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Check logs
railway logs --tail 100
```

Look for:
- Startup errors
- Database connection issues
- Email sending errors
- SMTP authentication failures

### Step 2: Fix Environment Variables

In Railway Dashboard, update these variables:

```bash
# Required fixes
ENVIRONMENT="production"
FRONTEND_URL="https://your-actual-frontend-url.com"

# Verify these are still set (email config)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="yashsarjekar35@gmail.com"
SMTP_PASSWORD="<your-16-char-app-password>"
SMTP_FROM_EMAIL="yashsarjekar35@gmail.com"  # Changed - see below
SMTP_FROM_NAME="Resume Builder"
EMAIL_ENABLED="true"
```

### Step 3: Fix SMTP_FROM_EMAIL

**Current issue:** You're setting `SMTP_FROM_EMAIL="noreply@resumebuilder.com"` but authenticating with `yashsarjekar35@gmail.com`.

Gmail will likely reject this as spoofing. Change to:
```bash
SMTP_FROM_EMAIL="yashsarjekar35@gmail.com"
```

Or keep the friendly name but use the real email:
```bash
SMTP_FROM_NAME="Resume Builder (via Yash)"
SMTP_FROM_EMAIL="yashsarjekar35@gmail.com"
```

### Step 4: Generate Fresh Gmail App Password

1. Go to Google Account: https://myaccount.google.com/
2. Ensure 2-Step Verification is enabled: https://myaccount.google.com/security
3. Generate App Password: https://myaccount.google.com/apppasswords
   - Select "Mail"
   - Select "Other (Custom name)"
   - Enter "Resume Builder Railway"
   - Click "Generate"
4. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
5. **Remove spaces** → `abcdefghijklmnop`
6. Update in Railway: `SMTP_PASSWORD="abcdefghijklmnop"`

### Step 5: Verify Database Connection

Your Railway config shows:
```
DATABASE_URL="${{Postgres.DATABASE_URL}}"
```

This template should automatically resolve to your Postgres service. If the service is down:

1. Check Railway Dashboard → Postgres service is running
2. Check if database is out of storage/resources
3. Verify the reference name is exactly "Postgres" (case-sensitive)

### Step 6: Test After Fixes

1. **Redeploy** (Railway auto-redeploys when you save variables)

2. **Wait 2-3 minutes** for deployment

3. **Test health endpoint:**
   ```bash
   curl https://resume-builder-backend-production-f9db.up.railway.app/health
   ```

4. **Test signup (triggers welcome email):**
   ```bash
   curl -X POST https://resume-builder-backend-production-f9db.up.railway.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@youremail.com","password":"TestPass123!"}'
   ```

5. **Check logs immediately:**
   ```bash
   railway logs --tail 50
   ```

   Look for:
   ```
   ✓ Email sent successfully to test@youremail.com: Welcome to Resume Builder!
   ```

   Or error:
   ```
   ✗ Failed to send email to test@youremail.com: [error message]
   ```

## Gmail Troubleshooting

### If you see "Authentication failed" errors:

1. **Check 2FA is enabled:**
   - Visit https://myaccount.google.com/security
   - "2-Step Verification" should be ON

2. **Less Secure Apps is OFF:**
   - Good! Use App Passwords instead

3. **Check recent security events:**
   - Visit https://myaccount.google.com/notifications
   - Look for blocked sign-in attempts
   - Check if the time matches your deployment

4. **Allow Railway's IP in Gmail:**
   - Gmail might be blocking Railway's IP range
   - Check for "suspicious activity" emails from Google
   - You may need to verify it's you in the Gmail security page

### If emails still don't send:

Consider using a dedicated email service for production:

**Option 1: SendGrid** (12k free emails/month)
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="<your-sendgrid-api-key>"
SMTP_FROM_EMAIL="noreply@yourdomain.com"  # Can use custom domain
```

**Option 2: Mailgun** (First 3 months free)
```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASSWORD="<your-mailgun-password>"
```

**Option 3: AWS SES** (62k free emails/month)
```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="<your-ses-smtp-username>"
SMTP_PASSWORD="<your-ses-smtp-password>"
```

## Quick Checklist

- [ ] Railway service is running (green status)
- [ ] `ENVIRONMENT="production"`
- [ ] `FRONTEND_URL` points to real frontend (not localhost)
- [ ] `SMTP_FROM_EMAIL` matches `SMTP_USER` (both use Gmail address)
- [ ] Fresh Gmail App Password generated and set
- [ ] 2FA enabled on Gmail account
- [ ] Database connection working
- [ ] Logs show no startup errors
- [ ] Health endpoint responds
- [ ] Test signup triggers email
- [ ] Email received (check spam folder)

## After Fixing

Once your service is running properly, test with:

```bash
cd backend
source venv/bin/activate
python test_production_email.py
```

Then check Railway logs:
```bash
railway logs --tail 50 | grep -i email
```

You should see successful email sends!
