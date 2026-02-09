# Payment Testing Guide - Razorpay Integration

**Environment:** Test Mode (Razorpay Test Keys)
**Date:** 2026-02-08
**Status:** Ready for Testing

---

## 🎯 Quick Start - Test Payment in 5 Steps

1. **Login** to http://localhost:3000
2. **Go to Pricing** page: http://localhost:3000/pricing
3. **Click** "Upgrade to Starter" (₹299) or "Upgrade to Pro" (₹599)
4. **Use Test Card** when Razorpay modal opens
5. **Verify** subscription upgraded in dashboard

---

## 💳 Razorpay Test Cards

### ✅ Success Scenarios

#### 1. Successful Payment (Most Common)
```
Card Number:    4111 1111 1111 1111
CVV:            Any 3 digits (e.g., 123)
Expiry:         Any future date (e.g., 12/25)
Cardholder:     Any name

Expected: Payment succeeds, subscription upgraded
```

#### 2. Successful Payment (Visa)
```
Card Number:    4012 8888 8888 1881
CVV:            Any 3 digits
Expiry:         Any future date

Expected: Payment succeeds
```

#### 3. Successful Payment (Mastercard)
```
Card Number:    5555 5555 5555 4444
CVV:            Any 3 digits
Expiry:         Any future date

Expected: Payment succeeds
```

---

### ❌ Failure Scenarios (For Testing Error Handling)

#### 1. Card Declined
```
Card Number:    4000 0000 0000 0002
CVV:            123
Expiry:         12/25

Expected: Payment fails with "Card declined" error
```

#### 2. Insufficient Funds
```
Card Number:    4000 0000 0000 9995
CVV:            123
Expiry:         12/25

Expected: Payment fails with "Insufficient funds"
```

#### 3. Invalid CVV
```
Card Number:    4111 1111 1111 1111
CVV:            Enter wrong CVV
Expiry:         12/25

Expected: Payment fails with "Invalid CVV"
```

---

## 🧪 Step-by-Step Testing Process

### Test 1: Starter Plan Purchase (₹299)

**Step 1: Navigate to Pricing**
```
URL: http://localhost:3000/pricing
```

**Step 2: Login (if not already)**
```
Email:    test@test.com
Password: Test1234
```

**Step 3: Click "Upgrade to Starter"**
- Look for the button under the STARTER plan card
- Should show loading state

**Step 4: Razorpay Modal Opens**
You should see:
- ✅ Amount: ₹299.00
- ✅ Merchant: Resume Builder (or your test business name)
- ✅ Card/UPI/Netbanking options

**Step 5: Enter Test Card Details**
```
Card Number:    4111 1111 1111 1111
CVV:            123
Expiry Month:   12
Expiry Year:    25
Cardholder:     Test User
```

**Step 6: Click "Pay ₹299"**
- Payment processes (2-3 seconds)
- Modal shows success message

**Step 7: Verify Success**
```
✅ Alert: "Payment successful! Your account has been upgraded."
✅ Redirected to: /dashboard
✅ Subscription badge shows: "STARTER"
✅ Resume limit increased: 1 → 10
✅ ATS limit increased: 2 → 20
```

---

### Test 2: Pro Plan Purchase (₹599)

**Follow same steps as above, but:**
- Click "Upgrade to Pro" button
- Amount should show: ₹599.00
- After success:
  - Subscription badge: "PRO"
  - Resume limit: "Unlimited"
  - ATS limit: "Unlimited"

---

## 🔍 Verification Checklist

### After Successful Payment:

#### 1. Check Dashboard
```
Navigate to: http://localhost:3000/dashboard

Verify:
[ ] Subscription badge changed from FREE to STARTER/PRO
[ ] Resume limit updated correctly
[ ] ATS analysis limit updated correctly
```

#### 2. Check Database (Backend)
```bash
# In backend directory
sqlite3 resume_builder.db

# Check user subscription
SELECT id, email, subscription_type, resume_count, ats_analysis_count
FROM users
WHERE email='test@test.com';

# Should show:
# subscription_type: starter or pro (not free)
```

#### 3. Check Payment History
```
Dashboard → Click "Show Payment History"

Verify:
[ ] New payment record appears
[ ] Correct plan name (Starter/Pro)
[ ] Correct amount (₹299/₹599)
[ ] Status: "completed"
[ ] Date: Today's date
```

---

## 🎭 Test Scenarios

### Scenario 1: Free to Starter Upgrade ✅

**Initial State:**
- User: test@test.com
- Subscription: FREE
- Resume Limit: 1
- ATS Limit: 2

**Action:**
1. Click "Upgrade to Starter"
2. Pay ₹299 with test card
3. Complete payment

**Expected Result:**
- Subscription: STARTER
- Resume Limit: 10
- ATS Limit: 20
- Payment recorded in history

---

### Scenario 2: Starter to Pro Upgrade ✅

**Initial State:**
- Subscription: STARTER

**Action:**
1. Click "Upgrade to Pro"
2. Pay ₹599 with test card

**Expected Result:**
- Subscription: PRO
- Resume Limit: Unlimited
- ATS Limit: Unlimited

---

### Scenario 3: Payment Failure Handling ✅

**Action:**
1. Click "Upgrade to Starter"
2. Use declined card: 4000 0000 0000 0002
3. Click Pay

**Expected Result:**
- ❌ Payment fails
- Error message shown in Razorpay modal
- User subscription remains unchanged (still FREE)
- No payment record created

---

### Scenario 4: User Cancels Payment ✅

**Action:**
1. Click "Upgrade to Starter"
2. Razorpay modal opens
3. Click "×" (close) or press ESC

**Expected Result:**
- Modal closes
- Loading state clears
- No payment made
- User stays on pricing page

---

## 🔧 Testing with Razorpay Dashboard

### View Test Payments

1. **Login to Razorpay Dashboard**
   - URL: https://dashboard.razorpay.com
   - Use your Razorpay account credentials

2. **Switch to Test Mode**
   - Toggle in top-right: "Test Mode"
   - Should show orange "TEST MODE" banner

3. **View Payments**
   - Navigate to: Transactions → Payments
   - See all test payments made
   - Filter by status, amount, date

4. **Check Order Details**
   - Click on any payment
   - View order ID, amount, status
   - See payment method used

---

## 💻 Backend API Testing (Optional)

### Test Create Order API
```bash
# Get auth token first
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}' | jq -r '.access_token')

# Create order for Starter plan
curl -X POST http://localhost:8000/api/payment/create-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "starter",
    "duration_months": 1
  }' | jq

# Expected Response:
{
  "order_id": "order_XXXXXXX",
  "amount": 29900,
  "currency": "INR",
  "plan": "starter",
  "duration_months": 1,
  "key_id": "rzp_test_SBnvLkUM2KLOUH",
  "recurring": false,
  "subscription_id": null
}
```

### Test Payment Verification API
```bash
# This would normally be called by Razorpay after successful payment
# For manual testing, you need actual Razorpay payment details

curl -X POST http://localhost:8000/api/payment/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_XXXXXXX",
    "razorpay_payment_id": "pay_XXXXXXX",
    "razorpay_signature": "signature_here",
    "plan": "starter"
  }'
```

---

## 🚨 Troubleshooting

### Issue 1: Razorpay Modal Doesn't Open

**Symptoms:**
- Click upgrade button
- Nothing happens
- Or error in console

**Checks:**
```javascript
// Open browser console (F12)
// Check for errors

// Verify Razorpay script loaded:
console.log(typeof window.Razorpay);
// Should show: "function"

// Check environment variable:
console.log(process.env.NEXT_PUBLIC_RAZORPAY_KEY);
// Should show: "rzp_test_SBnvLkUM2KLOUH"
```

**Solutions:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check frontend console for errors
4. Verify backend is running (http://localhost:8000/health)

---

### Issue 2: Payment Succeeds but Subscription Not Updated

**Checks:**
```bash
# Check backend logs
tail -50 /tmp/backend-dev.log | grep -i "payment\|subscription"

# Check database
sqlite3 backend/resume_builder.db "SELECT * FROM users WHERE email='test@test.com';"
```

**Possible Causes:**
- Payment verification failed
- Database commit failed
- Backend error during verification

**Solution:**
Check payment verification endpoint response in browser network tab

---

### Issue 3: "Payment verification failed" Error

**Causes:**
- Razorpay signature verification failed
- Network error during verification
- Backend not reachable

**Check:**
1. Backend logs for detailed error
2. Network tab for 500/422 errors
3. Payment status in Razorpay dashboard

---

### Issue 4: Amount Mismatch

**Expected Amounts:**
- Starter (1 month): ₹299 = 29900 paise
- Pro (1 month): ₹599 = 59900 paise

**If different amount shown:**
- Check pricing configuration in backend
- Verify duration_months is 1
- Clear backend cache

---

## 📊 Test Results Template

Use this template to document your testing:

```
## Payment Test Results - [Date]

### Test Environment
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- User: test@test.com
- Razorpay: Test Mode

### Test 1: Starter Plan Purchase
- [ ] Payment modal opens
- [ ] Amount shows ₹299
- [ ] Test card accepted
- [ ] Payment succeeds
- [ ] Subscription updated to STARTER
- [ ] Limits increased (10 resumes, 20 ATS)
- [ ] Payment history shows transaction

Result: ✅ PASS / ❌ FAIL
Notes: ___________

### Test 2: Pro Plan Purchase
- [ ] Payment modal opens
- [ ] Amount shows ₹599
- [ ] Test card accepted
- [ ] Payment succeeds
- [ ] Subscription updated to PRO
- [ ] Limits show "Unlimited"
- [ ] Payment history shows transaction

Result: ✅ PASS / ❌ FAIL
Notes: ___________

### Test 3: Payment Failure (Declined Card)
- [ ] Used test card: 4000 0000 0000 0002
- [ ] Payment declined
- [ ] Error message shown
- [ ] Subscription unchanged
- [ ] No payment record created

Result: ✅ PASS / ❌ FAIL
Notes: ___________

### Test 4: Payment Cancellation
- [ ] Modal opened
- [ ] Clicked close
- [ ] Modal closed
- [ ] No payment made
- [ ] Stayed on pricing page

Result: ✅ PASS / ❌ FAIL
Notes: ___________
```

---

## 🎓 Important Notes

### Test Mode Limitations
- ✅ No real money charged
- ✅ All payments are simulated
- ✅ Can use test cards unlimited times
- ⚠️ Test data doesn't sync to production

### Before Going to Production
1. **Replace Test Keys with Live Keys**
   ```bash
   # In .env
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXX
   RAZORPAY_KEY_SECRET=your_live_secret

   # In frontend .env.local
   NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_XXXXXXXXX
   ```

2. **Update Webhook URL**
   - Razorpay Dashboard → Settings → Webhooks
   - Change from localhost to production domain

3. **Test with Real Cards**
   - Use small amounts first
   - Verify refunds work
   - Test on different browsers

4. **Enable Production Mode**
   - Toggle in Razorpay dashboard
   - Update all keys
   - Monitor first few transactions closely

---

## 📞 Support

If payment testing fails:

1. **Check Logs:**
   ```bash
   # Backend logs
   tail -100 /tmp/backend-dev.log

   # Frontend console (F12 in browser)
   ```

2. **Check Backend Health:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Verify Razorpay Dashboard:**
   - Login to dashboard.razorpay.com
   - Check test payments section
   - Look for failed payments

4. **Common Issues:**
   - Backend not running → Start backend
   - Redis not connected → Start Redis
   - Wrong API keys → Check .env files
   - Browser cache → Clear cache and hard refresh

---

## ✅ Quick Test Checklist

**Before Testing:**
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Redis connected
- [ ] Logged in as test@test.com
- [ ] Browser console open (F12)

**Test Flow:**
- [ ] Navigate to /pricing
- [ ] Click "Upgrade to Starter"
- [ ] Razorpay modal opens
- [ ] Enter card: 4111 1111 1111 1111
- [ ] CVV: 123, Expiry: 12/25
- [ ] Click Pay
- [ ] See success message
- [ ] Redirected to dashboard
- [ ] Subscription shows STARTER
- [ ] Check payment history

**Success Criteria:**
- ✅ Payment completes without errors
- ✅ Subscription updates correctly
- ✅ Limits increase as expected
- ✅ Payment appears in history
- ✅ User can access premium features

---

**Test Card Reference:** Use `4111 1111 1111 1111` for successful payments
**Test Amount:** ₹299 (Starter) or ₹599 (Pro)
**Test Mode:** Always use test keys (rzp_test_...)

**Status:** ✅ Ready for Payment Testing
