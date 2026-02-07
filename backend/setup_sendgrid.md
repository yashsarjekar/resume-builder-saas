# SendGrid Setup for Production Emails

## Why SendGrid?

Gmail SMTP doesn't work in Railway due to network restrictions (`[Errno 101] Network is unreachable`).

SendGrid is designed for production apps and works perfectly with Railway.

## Setup Steps (5 minutes)

### 1. Create SendGrid Account

1. Go to https://signup.sendgrid.com/
2. Sign up (free account)
3. Verify your email address
4. Complete the setup wizard

### 2. Create API Key

1. Log in to SendGrid
2. Go to **Settings** → **API Keys** (left sidebar)
3. Click **Create API Key**
4. Name it: `Resume Builder Production`
5. Choose **Full Access** (or at minimum: Mail Send - Full Access)
6. Click **Create & View**
7. **Copy the API key** (starts with `SG.`) - you won't see it again!

### 3. Verify Sender Identity

**Important:** SendGrid requires sender verification to prevent spam.

**Option A: Single Sender Verification (Quick - 2 minutes)**

1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **Create New Sender**
3. Fill in:
   - **From Name:** Resume Builder
   - **From Email Address:** yashsarjekar35@gmail.com
   - **Reply To:** yashsarjekar35@gmail.com
   - **Company/Organization:** Resume Builder (or your company)
   - **Address, City, State, etc.:** Your info
4. Click **Create**
5. **Check your email** (yashsarjekar35@gmail.com) and verify the sender

**Option B: Domain Authentication (Better for production)**

If you have a custom domain (e.g., resumebuilder.com):

1. Go to **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Follow the DNS setup instructions
3. Use `noreply@yourdomain.com` as SMTP_FROM_EMAIL

### 4. Update Railway Environment Variables

In Railway Dashboard → Your Backend Service → Variables:

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Your actual API key
SMTP_FROM_EMAIL="yashsarjekar35@gmail.com"  # Must match verified sender
SMTP_FROM_NAME="Resume Builder"
EMAIL_ENABLED="true"
```

**IMPORTANT:**
- `SMTP_USER` is literally the word `apikey` (not your username!)
- `SMTP_PASSWORD` is your SendGrid API key (starts with `SG.`)
- `SMTP_FROM_EMAIL` must be a verified sender (the email you verified in step 3)

### 5. Save & Deploy

Railway will automatically redeploy when you save the variables (takes 2-3 minutes).

### 6. Test

Once deployed:

```bash
# Test from your local machine
python test_production_email.py

# Or manually test signup
curl -X POST https://resume-builder-backend-production-f9db.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"yourtest@email.com","password":"TestPass123!"}'
```

Then check:
1. Railway logs: `railway logs --tail 50 | grep -i email`
2. Your email inbox
3. SendGrid dashboard: **Activity** → **Email Activity** (shows all sent emails)

## Troubleshooting

### "Failed to send email" errors

Check Railway logs for specific error:

**"550 Unauthenticated senders not allowed"**
- Your `SMTP_FROM_EMAIL` is not verified in SendGrid
- Go back to Step 3 and verify the sender

**"535 Authentication failed"**
- Wrong API key
- Make sure `SMTP_USER="apikey"` (literal word)
- Double-check `SMTP_PASSWORD` has the correct API key

**"403 Forbidden"**
- API key doesn't have "Mail Send" permission
- Create a new API key with Full Access

### Email not received

1. Check **Spam/Junk** folder
2. Check SendGrid dashboard → Activity → Email Activity
3. If it shows "Delivered" in SendGrid but not in inbox, it's an email provider issue (not SendGrid)

### Still having issues?

Enable debug logging in Railway:

Add this variable in Railway:
```bash
LOG_LEVEL="DEBUG"
```

Then check logs:
```bash
railway logs --tail 100 | grep -E "email|smtp|sendgrid"
```

## SendGrid Dashboard - Monitor Your Emails

After setup, you can:

1. **View all sent emails:** Activity → Email Activity
2. **Check delivery rate:** Stats → Overview
3. **See bounces/spam reports:** Suppressions
4. **Monitor API usage:** Settings → API Keys → [Your Key] → Usage

## Limits

**Free Tier:**
- 100 emails/day forever
- No credit card required
- Good for development/testing

**Need more?**
- Essentials: $19.95/month for 50,000 emails
- Pro: $89.95/month for 100,000 emails

For a Resume Builder SaaS, free tier (100/day) should be fine initially. You can upgrade when you get more users.

## Why This Works Better Than Gmail

| Gmail SMTP | SendGrid |
|------------|----------|
| ❌ Blocked by Railway network | ✅ Works with all cloud platforms |
| ❌ 500 emails/day limit | ✅ 100 emails/day (free) to millions |
| ❌ May get flagged as spam | ✅ Better deliverability |
| ❌ No monitoring/analytics | ✅ Full email tracking & analytics |
| ❌ Security issues with app passwords | ✅ API key-based auth |
| ❌ Not designed for apps | ✅ Built for transactional emails |

## Next Steps

After SendGrid is working:

1. ✅ Test all email types:
   - Welcome emails (signup)
   - Payment success emails
   - Password reset emails

2. ✅ Monitor SendGrid dashboard for delivery issues

3. ✅ Consider custom domain authentication for better deliverability

4. ✅ Set up email templates in SendGrid (optional, for prettier emails)

---

**Estimated time:** 5-10 minutes
**Cost:** $0 (free tier)
**Result:** Working production emails! 🎉
