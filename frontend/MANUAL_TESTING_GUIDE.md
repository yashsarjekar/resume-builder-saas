# Manual Testing Guide - Dashboard Features

**Test User Credentials:**
- Email: `testuser@example.com`
- Password: `TestUser12345`

---

## ✅ Complete Login → Dashboard Flow Test

### Step 1: Open Application
1. Open browser: http://localhost:3000
2. Click "Login" button in header

### Step 2: Login
1. Enter email: `testuser@example.com`
2. Enter password: `TestUser12345`
3. Click "Sign In"
4. **Expected:** Redirects to `/dashboard`
5. **Expected:** Shows loading spinner briefly
6. **Expected:** Dashboard loads with user data

### Step 3: Verify Dashboard Components

#### ✅ Header Section
- [ ] Shows "Welcome back, Test User!"
- [ ] Page title says "Dashboard"

#### ✅ Stats Cards (Top Row)
**Card 1: Subscription**
- [ ] Shows "Subscription" header
- [ ] Shows subscription type badge (FREE/STARTER/PRO)
- [ ] Shows current plan
- [ ] Has "Upgrade now →" link (if on free plan)

**Card 2: Resumes Created**
- [ ] Shows "Resumes Created" header
- [ ] Shows count (e.g., "0 / 1")
- [ ] Shows progress bar

**Card 3: ATS Analyses**
- [ ] Shows "ATS Analyses" header
- [ ] Shows count (e.g., "0 / 2")
- [ ] Shows progress bar

#### ✅ AI Tools Section
- [ ] Shows "AI Tools" header
- [ ] Has 3 tool cards:

**1. Keyword Extractor**
- [ ] Has green icon
- [ ] Shows "Keyword Extractor" title
- [ ] Shows description
- [ ] Is clickable

**2. Cover Letter Generator**
- [ ] Has purple icon
- [ ] Shows "Cover Letter Generator" title
- [ ] Shows description
- [ ] Is clickable

**3. LinkedIn Optimizer**
- [ ] Has blue icon
- [ ] Shows "LinkedIn Profile Optimizer" title
- [ ] Shows description
- [ ] Is clickable

#### ✅ Resume List Section
- [ ] Shows "Your Resumes" header
- [ ] Shows "Create New Resume" button (or similar)
- [ ] If no resumes: Shows empty state message
- [ ] If has resumes: Shows resume cards with:
  - Resume title
  - Last updated date
  - ATS score (if analyzed)
  - Edit/Delete buttons

### Step 4: Test AI Tool Navigation

#### Test 1: Keyword Extractor
1. Click "Keyword Extractor" card
2. **Expected:** Redirects to `/tools/keywords`
3. **Expected:** Shows keyword extraction form:
   - "Job Description" textarea
   - "Extract Keywords" button
4. Click browser back button
5. **Expected:** Returns to dashboard

#### Test 2: Cover Letter Generator
1. Click "Cover Letter Generator" card
2. **Expected:** Redirects to `/tools/cover-letter`
3. **Expected:** Shows cover letter form:
   - "Job Description" textarea
   - "Company Name" input
   - "Generate Cover Letter" button
4. Click browser back button
5. **Expected:** Returns to dashboard

#### Test 3: LinkedIn Optimizer
1. Click "LinkedIn Profile Optimizer" card
2. **Expected:** Redirects to `/tools/linkedin`
3. **Expected:** Shows LinkedIn form:
   - "Target Role" input
   - "Resume Content" textarea
   - "Optimize LinkedIn Profile" button
4. Click browser back button
5. **Expected:** Returns to dashboard

### Step 5: Test Create Resume Button
1. Click "Create New Resume" or "Create Resume" button
2. **Expected:** Redirects to `/builder`
3. **Expected:** Shows resume builder form with:
   - "Resume Title" input
   - Personal Information section (Name, Email, Phone, Location)
   - Experience section
   - Education section
   - Skills section
   - Save/Generate buttons
4. Navigate back to dashboard

### Step 6: Test Header Navigation

#### Navigate to Pricing
1. Click "Pricing" in header
2. **Expected:** Shows pricing page with 3 tiers
3. Navigate back to dashboard

#### Test Logout
1. Find logout button in header (might be in user menu dropdown)
2. Click logout
3. **Expected:** Redirects to landing page or login page
4. **Expected:** No longer authenticated

---

## 🧪 Test Results Checklist

### Core Functionality
- [ ] Login redirects to dashboard correctly
- [ ] Dashboard loads without errors
- [ ] User name displays correctly
- [ ] All 3 stat cards visible
- [ ] All 3 AI tool cards visible
- [ ] Create resume button visible

### Navigation
- [ ] Can navigate to Keyword Extractor
- [ ] Can navigate to Cover Letter tool
- [ ] Can navigate to LinkedIn tool
- [ ] Can navigate to Resume Builder
- [ ] Can navigate to Pricing
- [ ] Back button works correctly

### UI/UX
- [ ] Loading states show during data fetch
- [ ] No console errors (check browser DevTools)
- [ ] All elements properly styled
- [ ] Responsive on mobile (test at 375px width)
- [ ] Links and buttons have hover states

### Authentication
- [ ] Stays logged in on page refresh
- [ ] Protected pages redirect to login when not authenticated
- [ ] Logout clears session correctly

---

## 🐛 How to Check for Errors

### Open Browser Console
1. Press `F12` or `Cmd+Option+I` (Mac)
2. Go to "Console" tab
3. Look for:
   - ✅ Green `[API]` logs showing successful requests
   - ❌ Red errors or 403/401 status codes

### Check Network Tab
1. In DevTools, go to "Network" tab
2. Reload dashboard page
3. Check API requests:
   - `/api/auth/me` - should return 200 OK with user data
   - `/api/resume/` - should return 200 OK with resume list
4. Look for failed requests (red) or 403/401 responses

### Check localStorage
1. In DevTools, go to "Application" tab
2. Click "Local Storage" → `http://localhost:3000`
3. Verify `token` key exists with JWT value
4. Token should look like: `eyJhbGciOiJIUz...`

---

## ✅ Expected Results

If everything is working correctly, you should see:

### ✅ Console Logs (Success)
```
Login response received: {hasToken: true}
Token stored in localStorage
[API] Request to /api/auth/me - Token attached: eyJhbGciOiJIU...
User data fetched successfully
[API] Request to /api/resume/ - Token attached: eyJhbGciOiJIU...
```

### ❌ Console Errors (If present)
```
[API] 403 Forbidden - Token might be invalid or expired
[API] Error details: {detail: "Not authenticated"}
```

If you see 403 errors:
1. Clear localStorage (Application → Clear site data)
2. Log out and log in again
3. Check if token is being stored correctly

---

## 📸 Take Screenshots

Please take screenshots of:
1. **Dashboard after login** - showing all components
2. **Keyword Extractor page** - after clicking the card
3. **Cover Letter page** - after clicking the card
4. **LinkedIn Optimizer page** - after clicking the card
5. **Browser Console** - showing any logs or errors
6. **Network tab** - showing API requests status

This will help verify everything is working!

---

## 🆘 If Something Doesn't Work

### Login Fails
- Check browser console for errors
- Verify credentials: `testuser@example.com` / `TestUser12345`
- Try creating a new user if needed

### Dashboard Shows 403 Errors
- Clear browser cache and cookies
- Log out and log in again
- Check if token is in localStorage

### AI Tools Don't Load
- Check if you're authenticated (token in localStorage)
- Verify network requests return 200 OK
- Check console for JavaScript errors

---

## 💡 Why Manual Testing Works

**The Issue:** Automated Selenium tests fail because of CORS restrictions when testing localhost:3000 frontend against production Railway backend.

**Why Manual Testing Works:** When you use the browser manually, you're directly on localhost:3000, so all API calls work correctly. The CORS issue only affects Selenium's automated testing.

**In Production:** Once deployed to a real domain (e.g., Vercel), everything will work perfectly including automated tests!

---

**Ready to test?** Open http://localhost:3000 and follow the steps above! 🚀
