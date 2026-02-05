# 🚀 Quick Deploy to Railway (5 Minutes)

Your backend is ready to deploy with:
- ✅ Supabase PostgreSQL (already configured)
- ✅ Railway Redis (free tier)
- ✅ FastAPI + Rate Limiting + Caching

---

## Option 1: Automated Deploy (Recommended) ⚡

Run the automated deployment script:

```bash
cd /Users/yashsarjekar/Documents/AI_WORK/resume-builder-saas/backend

./deploy.sh
```

The script will:
1. Install Railway CLI (if needed)
2. Login to Railway
3. Initialize project
4. Add Redis
5. Set all environment variables (interactive)
6. Deploy your backend
7. Give you the live URL

**Total time: 5-10 minutes**

---

## Option 2: Manual Deploy (Step by Step) 📝

### Prerequisites:
You need these values ready:
- ✅ Supabase DATABASE_URL: `postgresql://postgres:3BvvjhNh1nT0mWCB@db.inihvvbmzstfvnzzwfca.supabase.co:5432/postgres`
- ❓ ANTHROPIC_API_KEY: (your Claude API key)
- ❓ RAZORPAY_KEY_ID: (your Razorpay key)
- ❓ RAZORPAY_KEY_SECRET: (your Razorpay secret)
- ❓ RAZORPAY_WEBHOOK_SECRET: (your Razorpay webhook secret)

### Steps:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd /Users/yashsarjekar/Documents/AI_WORK/resume-builder-saas/backend
railway init
# Name: resume-builder-backend

# 4. Add Redis
railway add
# Select: Redis

# 5. Set environment variables (replace with your actual values)
railway variables set DATABASE_URL="postgresql://postgres:3BvvjhNh1nT0mWCB@db.inihvvbmzstfvnzzwfca.supabase.co:5432/postgres"
railway variables set ANTHROPIC_API_KEY="your_anthropic_key_here"
railway variables set RAZORPAY_KEY_ID="your_razorpay_key_id"
railway variables set RAZORPAY_KEY_SECRET="your_razorpay_secret"
railway variables set RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set ENVIRONMENT="production"
railway variables set FRONTEND_URL="*"

# 6. Deploy
railway up

# 7. Get URL
railway domain
```

---

## After Deployment

### Test Your API:

```bash
# Get your URL
RAILWAY_URL=$(railway domain)

# Test health endpoint
curl $RAILWAY_URL/health

# Expected response:
{
  "status": "healthy",
  "redis": "healthy",
  "environment": "production",
  "cache_enabled": true,
  "rate_limit_enabled": true
}

# Open API docs in browser
open $RAILWAY_URL/docs
```

### View Logs:

```bash
# Watch live logs
railway logs

# Or open Railway dashboard
railway open
```

---

## Update Deployment

When you make code changes:

```bash
# Deploy updated code
railway up

# Or if connected to GitHub, just push:
git push origin main
```

---

## Cost

**Railway:**
- Free: $5 credit/month (≈ 100 hours)
- Paid: $10/month (FastAPI + Redis, always-on)

**Supabase:**
- Free tier (already using) ✅

**Total: $0-10/month**

---

## Troubleshooting

**Issue: Railway CLI not found**
```bash
npm install -g @railway/cli
```

**Issue: Authentication error**
```bash
railway logout
railway login
```

**Issue: Deployment failed**
```bash
# Check logs
railway logs

# Common fixes:
# 1. Verify all environment variables are set:
railway variables

# 2. Check requirements.txt is complete:
pip freeze > requirements.txt
railway up
```

**Issue: Redis connection failed**
```bash
# Verify Redis was added:
railway services

# Re-add Redis if needed:
railway add redis
```

---

## Next Steps After Deployment

1. **Update FRONTEND_URL:**
   ```bash
   # After deploying frontend, update:
   railway variables set FRONTEND_URL="https://yourfrontend.vercel.app"
   ```

2. **Setup Monitoring:**
   - Use UptimeRobot (free) to monitor `/health`
   - Set up alerts for downtime

3. **Configure Razorpay Webhooks:**
   - Update webhook URL in Razorpay dashboard to:
   - `https://your-railway-url.up.railway.app/api/payment/webhook`

4. **Build Frontend:**
   - Now that backend is deployed, build frontend against this URL
   - Frontend can be deployed to Vercel (free)

---

## Support

- Full guide: [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)
- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Ready to deploy? Run: `./deploy.sh`** 🚀
