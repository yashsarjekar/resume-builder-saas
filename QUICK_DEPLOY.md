# Quick Deploy to Railway - Frontend

Your backend is already deployed ✅. Now deploy your frontend in **5 minutes**.

---

## Step 1: Get Your Backend URL

Your backend is already on Railway. Find your backend URL:

1. Go to https://railway.app/dashboard
2. Open your **backend** project
3. Click on your service
4. Copy the domain (looks like: `resume-builder-backend-production.up.railway.app`)

**Write it down**: `https://________________________.railway.app`

---

## Step 2: Deploy Frontend to Railway

### Option A: Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository**: `resume-builder-saas`
5. **Important**: Railway detects monorepo - select the **frontend** folder
6. **Click "Deploy"**

Railway will automatically:
- Detect Next.js
- Install dependencies (`npm install`)
- Build the app (`npm run build`)
- Start the server (`npm run start`)

### Option B: Via Railway CLI

```bash
# Install Railway CLI (if not already)
npm i -g @railway/cli

# Login
railway login

# Deploy frontend
cd frontend
railway init
railway up
```

---

## Step 3: Set Environment Variables

**CRITICAL STEP**: In Railway dashboard for your **frontend** project:

1. Click on your frontend service
2. Go to **Variables** tab
3. Add these 3 variables:

### Variable 1: Backend API URL
```
Name: NEXT_PUBLIC_API_URL
Value: https://YOUR-BACKEND-URL.railway.app
```
**Replace with your actual backend URL from Step 1!**

### Variable 2: Razorpay Key
```
Name: NEXT_PUBLIC_RAZORPAY_KEY
Value: rzp_test_SBnvLkUM2KLOUH
```
**For production, use your LIVE Razorpay key** (`rzp_live_xxxxx`)

### Variable 3: Frontend URL (Add this AFTER deployment)
```
Name: NEXT_PUBLIC_APP_URL
Value: https://YOUR-FRONTEND-URL.railway.app
```
**Copy this from Railway after it generates your frontend URL**

4. **Click "Deploy"** or **"Redeploy"** after adding variables

---

## Step 4: Update Backend CORS

**CRITICAL**: Your backend needs to allow requests from your frontend.

1. Go to your **backend** project in Railway
2. Go to **Variables** tab
3. Find `CORS_ORIGINS` variable
4. **Add your frontend URL** to it:

```
Before:
CORS_ORIGINS=http://localhost:3000

After:
CORS_ORIGINS=http://localhost:3000,https://YOUR-FRONTEND-URL.railway.app
```

5. **Redeploy backend** (click Redeploy button)

---

## Step 5: Verify Deployment

### Check Frontend
1. Visit your frontend URL: `https://your-frontend-url.railway.app`
2. You should see the Resume Builder homepage
3. Try signing up for an account

### Check Backend Connection
1. Open browser console (F12)
2. Try logging in or signing up
3. You should see API requests to your backend URL
4. **No CORS errors** should appear

### Check Health
```bash
# Check backend
curl https://your-backend.railway.app/health

# Should return:
{
  "status": "healthy",
  "environment": "production"
}
```

---

## Common Issues & Fixes

### Issue: "Network Error" or "Cannot connect to backend"
**Fix**: Check `NEXT_PUBLIC_API_URL` in frontend variables
- Make sure it starts with `https://`
- Make sure it's your backend Railway URL
- Redeploy frontend after fixing

### Issue: "CORS policy" error in console
**Fix**: Add frontend URL to backend `CORS_ORIGINS`
- Go to backend Railway project → Variables
- Update `CORS_ORIGINS` to include frontend URL
- Redeploy backend

### Issue: Payment not opening
**Fix**: Check Razorpay key
- Make sure `NEXT_PUBLIC_RAZORPAY_KEY` is set
- Use test key for testing: `rzp_test_SBnvLkUM2KLOUH`
- Use live key for production: `rzp_live_xxxxx`

### Issue: Frontend URL not updating
**Fix**: Add `NEXT_PUBLIC_APP_URL` variable
- Copy your frontend Railway URL
- Add as environment variable
- Redeploy frontend

---

## Environment Variables Checklist

### Frontend Variables (3 required)
- [ ] `NEXT_PUBLIC_API_URL` → Backend Railway URL
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY` → Razorpay key (test or live)
- [ ] `NEXT_PUBLIC_APP_URL` → Frontend Railway URL

### Backend Variables (verify these exist)
- [ ] `DATABASE_URL` → Auto-provided by Railway
- [ ] `REDIS_URL` → Auto-provided by Railway
- [ ] `SECRET_KEY` → Your JWT secret
- [ ] `ANTHROPIC_API_KEY` → Claude AI key
- [ ] `RAZORPAY_KEY_ID` → Razorpay key
- [ ] `RAZORPAY_KEY_SECRET` → Razorpay secret
- [ ] `CORS_ORIGINS` → Must include frontend URL
- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=false`

---

## Production Checklist (Before Going Live)

### Security
- [ ] Change `SECRET_KEY` to a strong random string
- [ ] Use Razorpay **LIVE** keys (not test keys)
- [ ] Set `DEBUG=false` in backend
- [ ] Verify CORS only allows your domains

### Testing
- [ ] Sign up flow works
- [ ] Login flow works
- [ ] Resume creation works
- [ ] ATS analysis works
- [ ] AI optimization works
- [ ] Payment flow works (Razorpay opens)
- [ ] Subscription upgrade works

### Monitoring
- [ ] Railway health checks working (backend `/health`)
- [ ] Check Railway logs for errors
- [ ] Test on mobile devices
- [ ] Test on different browsers

---

## Your URLs (Fill This In)

```
Backend URL: https://________________________________.railway.app
Frontend URL: https://________________________________.railway.app
```

---

## Next Steps After Deployment

1. **Test Everything**: Go through the full user flow
2. **Add Custom Domain** (Optional):
   - Frontend: `yourdomain.com`
   - Backend: `api.yourdomain.com`
3. **Set Up Monitoring**: Enable Railway alerts
4. **Update Legal Pages**: Add your actual company info
5. **Launch Marketing**: Share your app!

---

## Need Help?

- **Railway Docs**: https://docs.railway.app
- **Railway Logs**: Click your service → Deployments → View logs
- **Full Guide**: See `DEPLOYMENT_GUIDE.md` for detailed instructions

---

**Estimated Time**: 5-10 minutes
**Difficulty**: Easy ⭐

Good luck with your deployment! 🚀
