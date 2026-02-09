# Quick Start Guide

Get the Resume Builder frontend up and running in minutes!

## Prerequisites

✅ Node.js 18+ installed
✅ Backend API running at: `https://resume-builder-backend-production-f9db.up.railway.app`

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install
```

## Environment Setup

The `.env.local` file is already configured with production backend:

```bash
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test the Integration

### 1. **Test Landing Page**
- Visit http://localhost:3000
- Should see hero section with "Build Your Dream Resume"
- Click "Get Started Free" → Should redirect to signup

### 2. **Test Authentication**

**Sign Up:**
```
Route: /signup
- Enter name, email, password
- Check "I agree to terms"
- Click "Create Account"
- Should redirect to /dashboard
```

**Login:**
```
Route: /login
- Enter email and password
- Click "Sign In"
- Should redirect to /dashboard
```

### 3. **Test Dashboard**
```
Route: /dashboard
- View subscription stats (Free/Starter/Pro)
- See resume count: 0/1 (for free tier)
- See ATS analysis count: 0/1
- View AI Tools section
- Click "+ Create Resume" → Go to builder
```

### 4. **Test Resume Builder**
```
Route: /builder
1. Fill in basic info:
   - Title: "Software Engineer Resume"
   - Job Description: [Paste any job description]
   - Template: Modern

2. Fill personal info:
   - Name, email, phone, location

3. Add experience, skills, education

4. Click "Save Resume"
   ✓ Should save to database
   ✓ URL updates with resume ID

5. Click "Optimize with AI"
   ✓ Should show ATS score
   ✓ Offers to apply optimizations

6. Click "Download PDF"
   ✓ Should download resume.pdf
```

### 5. **Test AI Tools**

**Keyword Extractor** (`/tools/keywords`):
```
1. Paste a job description
2. Click "Extract Keywords"
3. View extracted keywords as tags
```

**Cover Letter Generator** (`/tools/cover-letter`):
```
1. Paste job description
2. Paste resume content
3. Click "Generate Cover Letter"
4. Copy or download the result
```

**LinkedIn Optimizer** (`/tools/linkedin`):
```
1. Enter target role (e.g., "Senior Software Engineer")
2. Paste resume content
3. Click "Optimize LinkedIn Profile"
4. View optimized headline, summary, and skills
```

### 6. **Test Pricing Page**
```
Route: /pricing
1. View three plans: Free, Starter (₹499), Pro (₹999)
2. Click "Upgrade Now" on Starter/Pro
3. Razorpay payment modal should open
4. Test payment (use Razorpay test cards)
```

## Verify API Integration

Open browser DevTools → Network tab:

1. **Check API Requests:**
   - All requests should go to `https://resume-builder-backend-production-f9db.up.railway.app`
   - POST /api/auth/login → Returns JWT token
   - GET /api/resume/ → Returns user's resumes
   - POST /api/ai/extract-keywords → Returns keywords array

2. **Check Headers:**
   - `Authorization: Bearer <token>` should be present on protected routes

3. **Check Responses:**
   - 200/201 for success
   - 401 for unauthorized (redirects to /login)
   - Error messages displayed in UI

## Build for Production

```bash
# Create production build
npm run build

# Output should show all routes:
# ○ /                        (Static)
# ○ /builder                 (Static)
# ○ /dashboard               (Static)
# ○ /login                   (Static)
# ○ /pricing                 (Static)
# ○ /signup                  (Static)
# ○ /tools/cover-letter      (Static)
# ○ /tools/keywords          (Static)
# ○ /tools/linkedin          (Static)

# Start production server
npm start
```

## Common Issues & Solutions

### Issue: API calls failing with CORS error
**Solution:** Backend CORS is configured to allow all origins (`allow_origins=["*"]`). Check backend logs.

### Issue: 401 Unauthorized on dashboard
**Solution:** Check if token is stored in localStorage. Try logging out and logging in again.

### Issue: Razorpay not loading
**Solution:** Verify `NEXT_PUBLIC_RAZORPAY_KEY` in `.env.local`

### Issue: Build fails with TypeScript errors
**Solution:**
```bash
rm -rf .next
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── builder/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── tools/
│   │       ├── keywords/page.tsx
│   │       ├── cover-letter/page.tsx
│   │       └── linkedin/page.tsx
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── api.ts               # Axios client
│   │   ├── validators.ts        # Zod schemas
│   │   └── utils.ts
│   ├── store/
│   │   └── authStore.ts         # Zustand store
│   └── types/
│       ├── user.ts
│       ├── resume.ts
│       └── api.ts
├── .env.local                   # Environment variables
├── package.json
└── README.md
```

## API Endpoints Connected

✅ **Authentication:** `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
✅ **Resumes:** `/api/resume/` (GET, POST, PUT, DELETE)
✅ **ATS Analysis:** `/api/resume/{id}/analyze-ats`
✅ **PDF Export:** `/api/resume/{id}/download`
✅ **AI Tools:** `/api/ai/extract-keywords`, `/api/ai/generate-cover-letter`, `/api/ai/optimize-linkedin`
✅ **Payments:** `/api/payment/create-order`, `/api/payment/verify-payment`

## Next Steps

1. ✅ Test all features locally
2. 🚀 Deploy to Vercel/Production
3. 📧 Update email templates in backend
4. 🎨 Customize branding/colors
5. 📊 Add analytics (Google Analytics, etc.)

## Deployment to Vercel

```bash
# 1. Push to GitHub
git add .
git commit -m "Complete frontend implementation"
git push

# 2. Go to vercel.com
# 3. Import repository
# 4. Add environment variables:
#    - NEXT_PUBLIC_API_URL
#    - NEXT_PUBLIC_RAZORPAY_KEY
#    - NEXT_PUBLIC_APP_URL (update to production URL)
# 5. Deploy!
```

## Support

- **Backend API Docs:** https://resume-builder-backend-production-f9db.up.railway.app/docs
- **Frontend:** Check browser console for errors
- **API Issues:** Check Network tab in DevTools

---

## 🎉 You're All Set!

The frontend is fully integrated with all backend APIs. Start the dev server and test the complete flow!

```bash
npm run dev
# Open http://localhost:3000
```
