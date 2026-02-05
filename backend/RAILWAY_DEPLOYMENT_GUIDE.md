# Railway Deployment Guide
## Using Supabase PostgreSQL + Railway Redis

**Setup:** FastAPI on Railway + Supabase PostgreSQL + Railway Redis

---

## Prerequisites

- ✅ Supabase account with PostgreSQL database (already configured)
- ✅ Railway account (sign up at railway.app)
- ✅ Backend code ready in GitHub (optional) or deploy from local

---

## Step-by-Step Deployment

### **1. Install Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Verify installation
railway --version
```

### **2. Login to Railway**

```bash
# Open browser and login
railway login
```

### **3. Initialize Railway Project**

```bash
# Navigate to backend directory
cd /Users/yashsarjekar/Documents/AI_WORK/resume-builder-saas/backend

# Initialize Railway project
railway init

# When prompted:
# - Project name: resume-builder-backend
# - Create new project
```

### **4. Add Redis to Railway**

```bash
# Add Redis service (FREE)
railway add

# Select: Redis
# This will create a Redis instance and provide REDIS_URL automatically
```

### **5. Set Environment Variables**

Railway will automatically provide:
- ✅ `REDIS_URL` (from Railway Redis)

You need to manually set:

```bash
# Database (your existing Supabase)
railway variables set DATABASE_URL="postgresql://postgres:3BvvjhNh1nT0mWCB@db.inihvvbmzstfvnzzwfca.supabase.co:5432/postgres"

# Anthropic API Key
railway variables set ANTHROPIC_API_KEY="your_anthropic_api_key_here"

# JWT Secret (generate a secure random string)
railway variables set JWT_SECRET="$(openssl rand -hex 32)"

# Razorpay Keys
railway variables set RAZORPAY_KEY_ID="your_razorpay_key_id"
railway variables set RAZORPAY_KEY_SECRET="your_razorpay_secret"
railway variables set RAZORPAY_WEBHOOK_SECRET="your_razorpay_webhook_secret"

# Environment
railway variables set ENVIRONMENT="production"

# Frontend URL (set to * for now, update later with actual frontend URL)
railway variables set FRONTEND_URL="*"

# Optional: Email settings (if using)
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set SMTP_USER="your_email@gmail.com"
railway variables set SMTP_PASSWORD="your_app_password"
railway variables set SMTP_FROM_EMAIL="noreply@yourapp.com"
```

**Quick command to set all at once:**

```bash
# Copy this, replace with your actual values, and run
railway variables set \
  DATABASE_URL="postgresql://postgres:3BvvjhNh1nT0mWCB@db.inihvvbmzstfvnzzwfca.supabase.co:5432/postgres" \
  ANTHROPIC_API_KEY="your_key" \
  JWT_SECRET="$(openssl rand -hex 32)" \
  RAZORPAY_KEY_ID="your_key" \
  RAZORPAY_KEY_SECRET="your_secret" \
  RAZORPAY_WEBHOOK_SECRET="your_webhook" \
  ENVIRONMENT="production" \
  FRONTEND_URL="*"
```

### **6. Create Railway Configuration**

Create `railway.toml` in your backend directory:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### **7. Deploy to Railway**

```bash
# Deploy your code
railway up

# This will:
# 1. Upload your code
# 2. Install dependencies from requirements.txt
# 3. Start your FastAPI server
# 4. Connect to Supabase PostgreSQL
# 5. Connect to Railway Redis
```

### **8. Get Your Deployment URL**

```bash
# Generate a public URL
railway domain

# This will give you a URL like:
# https://resume-builder-backend-production.up.railway.app
```

### **9. Verify Deployment**

```bash
# Test health endpoint (replace with your actual Railway URL)
curl https://your-app.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "environment": "production",
  "redis": "healthy",
  "cache_enabled": true,
  "rate_limit_enabled": true
}

# Test API docs (open in browser)
https://your-app.up.railway.app/docs
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Railway Platform                  │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  FastAPI Application                 │  │
│  │  - Authentication                    │  │
│  │  - Resume CRUD                       │  │
│  │  - AI Features                       │  │
│  │  - Payment Integration               │  │
│  └──────────────────────────────────────┘  │
│                ↓         ↓                  │
│    ┌──────────────┐   ┌──────────────┐    │
│    │   Railway    │   │   Supabase   │    │
│    │   Redis      │   │  PostgreSQL  │    │
│    │  (Caching &  │   │  (External)  │    │
│    │Rate Limiting)│   │              │    │
│    └──────────────┘   └──────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Environment Variables Summary

| Variable | Source | Required | Example |
|----------|--------|----------|---------|
| `DATABASE_URL` | Supabase | ✅ Yes | `postgresql://postgres:pass@db.supabase.co:5432/postgres` |
| `REDIS_URL` | Railway (auto) | ✅ Yes | Auto-provided by Railway |
| `ANTHROPIC_API_KEY` | Anthropic | ✅ Yes | `sk-ant-...` |
| `JWT_SECRET` | Generate | ✅ Yes | Random 64-char hex |
| `RAZORPAY_KEY_ID` | Razorpay | ✅ Yes | `rzp_live_...` or `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay | ✅ Yes | Your secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay | ✅ Yes | Your webhook secret |
| `ENVIRONMENT` | Manual | ✅ Yes | `production` |
| `FRONTEND_URL` | Manual | ✅ Yes | `*` or `https://yourfrontend.com` |
| `SMTP_*` | Email provider | ❌ Optional | Gmail SMTP settings |

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Health endpoint returns "healthy"
- [ ] Redis status is "healthy"
- [ ] API docs accessible at `/docs`
- [ ] Can create a test user (signup)
- [ ] Can login and get JWT token
- [ ] Can create a resume
- [ ] AI endpoints working (check quota limits)
- [ ] Rate limiting active (headers present)

---

## Monitoring & Logs

### View Logs:
```bash
# Watch live logs
railway logs

# View logs in Railway dashboard
railway open
# Click on "Deployments" → "Logs"
```

### View Metrics:
```bash
# Open Railway dashboard
railway open

# Navigate to "Metrics" tab to see:
# - CPU usage
# - Memory usage
# - Network traffic
# - Request count
```

---

## Update Deployment

When you make code changes:

```bash
# Option 1: Push to GitHub (if connected)
git add .
git commit -m "Update feature"
git push origin main
# Railway auto-deploys

# Option 2: Manual deploy from local
railway up
```

---

## Rollback Deployment

If something goes wrong:

```bash
# Via CLI
railway rollback

# Or via Railway dashboard:
# Go to Deployments → Select previous deployment → Redeploy
```

---

## Cost Estimate

**Railway Free Tier:**
- $5 credit/month (≈ 100 hours)
- Enough for testing/development

**Paid Plan (Recommended for Production):**
- FastAPI app: $5/month (512MB RAM, always-on)
- Redis: $5/month (256MB)
- **Total: $10/month**

**Supabase:**
- Free tier: 500MB database, 2GB bandwidth
- Already included in your setup ✅

**Total Cost:** $10/month (Railway) + $0 (Supabase free tier)

---

## Troubleshooting

### Issue: Deployment fails with "Module not found"
**Solution:** Ensure `requirements.txt` is complete
```bash
pip freeze > requirements.txt
railway up
```

### Issue: Redis connection failed
**Solution:** Verify REDIS_URL is set
```bash
railway variables
# Check if REDIS_URL is listed
```

### Issue: Database connection failed
**Solution:** Check Supabase DATABASE_URL
```bash
# Verify DATABASE_URL is correct
railway variables | grep DATABASE_URL

# Test connection from Railway
railway run python -c "from sqlalchemy import create_engine; engine = create_engine('your_db_url'); print('Connected!')"
```

### Issue: 500 errors on AI endpoints
**Solution:** Check ANTHROPIC_API_KEY
```bash
railway variables | grep ANTHROPIC
# Verify key is correct and has credits
```

### Issue: CORS errors
**Solution:** Update FRONTEND_URL
```bash
railway variables set FRONTEND_URL="https://yourfrontend.vercel.app"
```

---

## Security Best Practices

1. **Environment Variables:**
   - ✅ Never commit `.env` files
   - ✅ Use Railway variables for secrets
   - ✅ Rotate JWT_SECRET periodically

2. **Database:**
   - ✅ Use Supabase connection pooling
   - ✅ Enable SSL (already enabled in Supabase)
   - ✅ Restrict IP access in Supabase dashboard (optional)

3. **API Keys:**
   - ✅ Use test keys for development
   - ✅ Use live keys only in production
   - ✅ Monitor Anthropic API usage

4. **Rate Limiting:**
   - ✅ Already configured (5 req/min for auth)
   - ✅ Monitor rate limit violations in logs

---

## Next Steps

After successful deployment:

1. **Update Frontend:**
   - Set API URL to your Railway deployment
   - Example: `NEXT_PUBLIC_API_URL=https://your-app.up.railway.app`

2. **Setup Custom Domain (Optional):**
   ```bash
   railway domain add yourdomain.com
   # Follow DNS configuration instructions
   ```

3. **Enable Monitoring:**
   - Set up UptimeRobot to monitor `/health` endpoint
   - Alert: https://uptimerobot.com (free)

4. **Configure Webhooks:**
   - Update Razorpay webhook URL to Railway URL
   - Example: `https://your-app.up.railway.app/api/payment/webhook`

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Supabase Docs: https://supabase.com/docs

---

**Deployment completed! 🚀**

Your backend is now live and accessible from anywhere.
