# Railway Deployment Guide

Complete guide for deploying Resume Builder SaaS to Railway (both frontend and backend).

## Overview

- **Backend**: FastAPI (Python) - Already deployed ✅
- **Frontend**: Next.js (TypeScript) - To be deployed 🚀
- **Database**: PostgreSQL on Railway
- **Redis**: Redis on Railway
- **Payment**: Razorpay

---

## Prerequisites

1. Railway account (https://railway.app)
2. Railway CLI installed (optional but recommended)
3. GitHub repository connected to Railway
4. Domain name (optional, Railway provides free subdomain)

---

## Part 1: Backend Deployment (Already Done ✅)

Your backend is already deployed with:
- Configuration: `backend/railway.toml`
- Start command: `python init_db.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/health`

### Backend Environment Variables (Verify These)

```env
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Redis (Railway provides this automatically if Redis service added)
REDIS_URL=redis://host:port

# JWT Authentication
SECRET_KEY=your-secret-key-here-use-strong-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Claude AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# CORS (Important: Add your frontend Railway URL)
CORS_ORIGINS=https://your-frontend.railway.app,https://www.yourdomain.com

# App Config
ENVIRONMENT=production
DEBUG=false
```

### Get Your Backend URL

Your backend Railway URL will be something like:
```
https://resume-builder-backend-production.up.railway.app
```

**Action Required**: Copy your actual backend URL - you'll need it for frontend deployment.

---

## Part 2: Frontend Deployment (New Deployment)

### Step 1: Create New Railway Project for Frontend

**Option A: Via Railway Dashboard**
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will detect it's a monorepo - select the **frontend** directory
6. Railway will auto-detect Next.js

**Option B: Via Railway CLI**
```bash
cd frontend
railway login
railway init
railway up
```

### Step 2: Configure Frontend Environment Variables

In Railway dashboard for your **frontend** project, add these variables:

```env
# Backend API URL (CRITICAL - Use your actual backend Railway URL)
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production.up.railway.app

# Razorpay (Use LIVE keys for production)
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxx

# Frontend URL (Railway will provide this, add after first deploy)
NEXT_PUBLIC_APP_URL=https://your-frontend.railway.app
```

**Important Notes:**
- Replace `resume-builder-backend-production.up.railway.app` with your **actual backend Railway URL**
- Use `rzp_live_` keys for production (not `rzp_test_`)
- `NEXT_PUBLIC_APP_URL` will be your frontend Railway URL (add after first deploy)

### Step 3: Deploy Frontend

Railway will automatically:
1. Detect Next.js
2. Run `npm install`
3. Run `npm run build`
4. Start with `npm run start`
5. Provide a Railway URL (e.g., `https://resume-builder-frontend-production.up.railway.app`)

### Step 4: Update Backend CORS

After frontend deploys, **update backend environment variables**:

```env
# Add your frontend Railway URL to CORS_ORIGINS
CORS_ORIGINS=https://your-frontend.railway.app,https://www.yourdomain.com
```

Then restart your backend service in Railway.

### Step 5: Update Frontend APP_URL

After frontend deploys, update frontend environment variable:

```env
NEXT_PUBLIC_APP_URL=https://your-actual-frontend-url.railway.app
```

---

## Part 3: Custom Domain (Optional)

### For Backend:
1. In Railway backend project → Settings → Domains
2. Click "Add Domain"
3. Enter: `api.yourdomain.com`
4. Add CNAME record in your DNS:
   ```
   CNAME api.yourdomain.com -> your-backend.railway.app
   ```

### For Frontend:
1. In Railway frontend project → Settings → Domains
2. Click "Add Domain"
3. Enter: `yourdomain.com` or `www.yourdomain.com`
4. Add CNAME record in your DNS:
   ```
   CNAME yourdomain.com -> your-frontend.railway.app
   ```

### After Adding Custom Domains:

**Update Backend CORS:**
```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com
```

**Update Frontend Variables:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Part 4: Database & Redis Setup

### PostgreSQL Database

**If not already set up:**
1. In Railway dashboard → New → Database → PostgreSQL
2. Railway automatically creates and provides `DATABASE_URL`
3. Link it to your backend service
4. Database tables will auto-create on first backend startup (via `init_db.py`)

### Redis Cache

**If not already set up:**
1. In Railway dashboard → New → Database → Redis
2. Railway automatically provides `REDIS_URL`
3. Link it to your backend service
4. Backend will connect automatically

---

## Part 5: Verification Checklist

### Backend Health Check
```bash
curl https://your-backend.railway.app/health

# Expected response:
{
  "status": "healthy",
  "environment": "production",
  "database": "connected",
  "redis": "connected"
}
```

### Frontend Health Check
```bash
curl https://your-frontend.railway.app

# Should return HTML with no errors
```

### Test Full Flow
1. Visit frontend URL: `https://your-frontend.railway.app`
2. Sign up for a new account
3. Verify email validation works
4. Try creating a resume
5. Test pricing page → Select STARTER plan
6. Razorpay payment modal should open with LIVE key
7. Test ATS analysis feature
8. Test AI optimization features

### CORS Verification
Open browser console on frontend:
- Should see API requests to backend URL
- No CORS errors
- Successful authentication

---

## Part 6: Environment Variables Summary

### Backend (backend/.env on Railway)
```env
DATABASE_URL=<auto-provided-by-railway>
REDIS_URL=<auto-provided-by-railway>
SECRET_KEY=<generate-strong-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ANTHROPIC_API_KEY=<your-anthropic-key>
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=<your-secret>
CORS_ORIGINS=https://your-frontend.railway.app
ENVIRONMENT=production
DEBUG=false
```

### Frontend (frontend/.env on Railway)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxx
NEXT_PUBLIC_APP_URL=https://your-frontend.railway.app
```

---

## Part 7: Deployment Commands (Quick Reference)

### Deploy Backend Updates
```bash
cd backend
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-deploys from GitHub
```

### Deploy Frontend Updates
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
# Railway auto-deploys from GitHub
```

### Manual Redeploy (if needed)
```bash
# Via Railway CLI
cd backend  # or frontend
railway up

# Or in Railway Dashboard:
# Click service → Deployments → Redeploy latest
```

### View Logs
```bash
# Via Railway CLI
railway logs

# Or in Railway Dashboard:
# Click service → Deployments → View logs
```

---

## Part 8: Monitoring & Maintenance

### Health Checks
Railway automatically monitors:
- Backend: `GET /health` every 30 seconds
- Frontend: `GET /` every 30 seconds
- Auto-restarts on failure (max 10 retries)

### Logging
View logs in Railway dashboard:
- Backend: API request logs, error logs, database queries
- Frontend: Next.js build logs, runtime logs

### Alerts (Set Up Recommended)
1. Railway Dashboard → Project → Settings → Notifications
2. Enable Slack/Discord/Email alerts for:
   - Deployment failures
   - Health check failures
   - High resource usage

---

## Part 9: Cost Estimation

### Railway Pricing (as of 2026)
- **Free Tier**: $5 credit/month
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

### Estimated Monthly Cost
- Backend: ~$5-10/month
- Frontend: ~$5-10/month
- PostgreSQL: ~$5/month
- Redis: ~$5/month
- **Total**: ~$20-30/month (with moderate traffic)

### Cost Optimization
1. Use single PostgreSQL instance for all environments
2. Share Redis instance
3. Enable Railway's automatic sleep (dev environments)
4. Monitor usage in Railway dashboard

---

## Part 10: Security Checklist

### Before Going Live:
- [ ] Change all secret keys (SECRET_KEY, RAZORPAY_KEY_SECRET)
- [ ] Use Razorpay LIVE keys (not test keys)
- [ ] Set `DEBUG=false` in backend
- [ ] Enable HTTPS only (Railway provides by default)
- [ ] Verify CORS origins are correct
- [ ] Test all authentication flows
- [ ] Test payment flows with real transactions
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Enable Railway's automatic backups for database
- [ ] Document all environment variables securely

---

## Part 11: Troubleshooting

### Issue: Frontend can't connect to backend
**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in frontend env vars
2. Verify backend CORS includes frontend URL
3. Check backend is healthy: `curl https://backend.railway.app/health`

### Issue: "CORS policy" errors in browser console
**Solution**:
1. Add frontend URL to backend `CORS_ORIGINS`
2. Restart backend service
3. Clear browser cache

### Issue: Payment not working
**Solution**:
1. Verify you're using `rzp_live_` key (not `rzp_test_`)
2. Check Razorpay dashboard for webhook failures
3. Ensure `RAZORPAY_KEY_SECRET` matches backend

### Issue: Database connection error
**Solution**:
1. Check `DATABASE_URL` is set in backend env vars
2. Verify PostgreSQL service is running in Railway
3. Check Railway PostgreSQL logs
4. Restart backend service

### Issue: Build failures
**Solution**:
1. Check Railway build logs
2. Verify `package.json` has correct scripts
3. Ensure all dependencies are listed
4. Try local build: `npm run build`

---

## Part 12: Quick Start Deployment (TL;DR)

### Backend (Already Done ✅)
- Your backend is already running on Railway
- Just verify environment variables

### Frontend (Do This Now 🚀)

1. **Create Railway Project**
   - Go to Railway dashboard → New Project → Deploy from GitHub
   - Select your repo → Choose `frontend` directory

2. **Set Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=<your-backend-railway-url>
   NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_xxxxx
   NEXT_PUBLIC_APP_URL=<will-be-provided-by-railway>
   ```

3. **Deploy**
   - Railway auto-builds and deploys
   - Copy your frontend URL

4. **Update Backend CORS**
   - Add frontend URL to backend `CORS_ORIGINS`
   - Restart backend

5. **Test**
   - Visit frontend URL
   - Sign up → Create resume → Test payment

**Done! 🎉**

---

## Support

**Railway Documentation**: https://docs.railway.app
**Issues**: Check Railway logs first, then debug locally

**Common Railway URLs**:
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app
- Status: https://status.railway.app

---

**Last Updated**: February 10, 2026
**Deployment Platform**: Railway
**Repository**: resume-builder-saas
