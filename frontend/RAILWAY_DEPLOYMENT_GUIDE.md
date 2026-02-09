# Railway Frontend Deployment Guide

## 🚂 Deploy Resume Builder Frontend to Railway

Since your backend is already on Railway, deploying the frontend there keeps everything together!

---

## Prerequisites

- ✅ Railway account (already have it)
- ✅ Railway CLI installed OR use Railway dashboard
- ✅ Backend already deployed at: `https://resume-builder-backend-production-f9db.up.railway.app`

---

## Method 1: Deploy via Railway Dashboard (Easiest)

### Step 1: Push Frontend to GitHub

```bash
cd /Users/yashsarjekar/Documents/AI_WORK/resume-builder-saas

# Initialize git if not already
git init
git add .
git commit -m "Frontend ready for deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/resume-builder-saas.git
git branch -M main
git push -u origin main
```

### Step 2: Create New Project on Railway

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `resume-builder-saas` repository
5. Railway will detect it's a monorepo

### Step 3: Configure Frontend Service

1. **Root Directory:** Set to `frontend`
2. **Build Command:** `npm run build`
3. **Start Command:** `npm start`
4. **Install Command:** `npm install`

### Step 4: Set Environment Variables

In Railway dashboard, add these variables:

```env
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

Note: `${{RAILWAY_PUBLIC_DOMAIN}}` is Railway's template variable for your app's URL

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Railway will provide a public URL like: `https://your-app.up.railway.app`

---

## Method 2: Deploy via Railway CLI (Faster)

### Step 1: Install Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login
```

### Step 2: Initialize and Deploy

```bash
# Navigate to frontend directory
cd /Users/yashsarjekar/Documents/AI_WORK/resume-builder-saas/frontend

# Link to Railway project
railway init

# Set environment variables
railway variables set NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
railway variables set NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Step 3: Get Your URL

```bash
railway domain
```

---

## Configuration Files

### Create `railway.json` in frontend directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Your existing `package.json` scripts are already correct:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Post-Deployment Steps

### 1. Update Backend CORS

Once frontend is deployed, update backend environment variable on Railway:

```bash
# In backend Railway service settings, update:
FRONTEND_URL=https://your-frontend.up.railway.app
```

Or keep it as `*` for development:
```bash
FRONTEND_URL=*
```

### 2. Test Your Deployment

Visit your Railway URL:
```
https://your-app.up.railway.app
```

Test flow:
1. ✅ Open homepage
2. ✅ Click "Sign Up" → Create account
3. ✅ Should redirect to dashboard
4. ✅ See all components (stats, AI tools, etc.)
5. ✅ Click AI Tools → Keyword Extractor
6. ✅ Paste job description
7. ✅ Click "Extract Keywords"
8. ✅ See extracted keywords!

### 3. Custom Domain (Optional)

In Railway dashboard:
1. Go to your frontend service
2. Click "Settings" → "Domains"
3. Add custom domain (e.g., `app.yourcompany.com`)
4. Update DNS records as shown
5. Update `NEXT_PUBLIC_APP_URL` variable

---

## Troubleshooting

### Build Fails - Missing Dependencies

If build fails with dependency errors:

```bash
# Make sure package.json has all dependencies
cd frontend
npm install
npm run build  # Test locally first

# If it works locally, deploy again
railway up
```

### Environment Variables Not Working

Check they're set correctly:
```bash
railway variables
```

Should see:
```
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH
NODE_ENV=production
```

### App Crashes on Start

Check logs:
```bash
railway logs
```

Common issues:
- Port binding: Railway auto-assigns port via $PORT
- Next.js handles this automatically, should work out of the box

### CORS Errors Still Happening

Update backend `FRONTEND_URL`:
```bash
# In backend Railway service:
FRONTEND_URL=https://your-frontend.up.railway.app
```

Then restart backend service.

---

## Cost Estimate

**Railway Free Tier:**
- $5 free credit per month
- Enough for both frontend + backend for hobby projects
- Auto-sleeps after inactivity (free tier)

**Railway Pro Plan** (if needed):
- $20/month for $20 credit
- No auto-sleep
- Better performance
- Custom domains

---

## Monitoring

### Check Deployment Status

```bash
railway status
```

### View Logs

```bash
railway logs
```

### View Metrics

```bash
railway metrics
```

---

## Quick Deploy Commands

```bash
# One-time setup
cd frontend
railway init
railway variables set NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
railway variables set NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH

# Deploy (anytime you make changes)
railway up

# Get your URL
railway domain
```

---

## Expected Result

Once deployed:

✅ **Frontend URL:** `https://resume-builder-frontend-production.up.railway.app`
✅ **Backend URL:** `https://resume-builder-backend-production-f9db.up.railway.app`

Both services running on Railway, no CORS issues, everything works!

---

## Next Steps After Deployment

1. ✅ Test complete signup → login → dashboard flow
2. ✅ Test all AI tools (Keywords, Cover Letter, LinkedIn)
3. ✅ Test resume creation
4. ✅ Test payment flow
5. ✅ Share URL with users for feedback!

---

## Need Help?

Railway docs: https://docs.railway.app/
Railway Discord: https://discord.gg/railway

Happy deploying! 🚀
