# Recurring Payment Implementation & Testing Guide

## ✅ Implementation Complete!

### What Was Implemented:

1. **User Choice for Payment Type**
   - Users can now choose between one-time and recurring payments
   - Same plan, different payment methods

2. **Schema Updates**
   - Added `recurring` boolean flag to `CreateOrderRequest`
   - Updated `CreateOrderResponse` to include subscription details

3. **Razorpay Service**
   - Automatic subscription creation for recurring payments
   - Customer management (create/fetch)
   - Dynamic plan creation if needed
   - Separate handlers for one-time vs recurring

4. **Webhook Handling**
   - ✅ `subscription.activated` - First payment, activate subscription
   - ✅ `subscription.charged` - Monthly payment, extend subscription
   - ✅ `subscription.halted` - Payment failed, downgrade to FREE
   - ✅ `subscription.completed` - All payments done
   - ✅ `subscription.cancelled` - User cancelled

5. **Database**
   - Added `razorpay_customer_id` to users table
   - Migration executed successfully

---

## Payment Options for Users

### Starter Plan (Monthly)
```
┌──────────────────────────────────────────────────┐
│ Option 1: Pay Monthly (No Recurring)            │
├──────────────────────────────────────────────────┤
│ Cost: ₹299 for 1 month                          │
│ Auto-renewal: NO                                 │
│ After 1 month: Subscription expires             │
│ User must manually renew                         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Option 2: Pay Monthly (Recurring) ⭐             │
├──────────────────────────────────────────────────┤
│ Cost: ₹299/month                                 │
│ Auto-renewal: YES                                │
│ Automatic charge every month                     │
│ User can cancel anytime                          │
│ Keeps access until period ends                   │
└──────────────────────────────────────────────────┘
```

### API Request Examples

#### One-Time Payment (No Recurring)
```json
POST /api/payment/create-order
{
  "plan": "starter",
  "duration_months": 1,
  "recurring": false
}

Response:
{
  "order_id": "order_xxx",
  "amount": 29900,
  "plan": "starter",
  "recurring": false
}
```

#### Recurring Payment (Auto-Renewal)
```json
POST /api/payment/create-order
{
  "plan": "starter",
  "duration_months": 1,
  "recurring": true
}

Response:
{
  "order_id": "sub_xxx",
  "amount": 29900,
  "plan": "starter",
  "recurring": true,
  "subscription_id": "sub_xxx"
}
```

---

## Testing Instructions

### Test 1: One-Time Payment (No Recurring)

```bash
# 1. Create user and login
POST /api/auth/signup
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test123!",
  "confirm_password": "Test123!"
}

# 2. Get token
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "Test123!"
}

# 3. Create one-time order
POST /api/payment/create-order
Authorization: Bearer <token>
{
  "plan": "starter",
  "duration_months": 1,
  "recurring": false
}

# 4. Complete payment on Razorpay checkout

# 5. Verify payment
POST /api/payment/verify
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}

# 6. Check subscription
GET /api/payment/subscription
# Should show: 1 month active, no auto-renewal
```

### Test 2: Recurring Payment (Auto-Renewal)

```bash
# 1-2. Same as above (create user, login)

# 3. Create recurring subscription
POST /api/payment/create-order
Authorization: Bearer <token>
{
  "plan": "starter",
  "duration_months": 12,  # 12 monthly payments
  "recurring": true
}

# 4. Complete first payment on Razorpay

# 5. Webhook: subscription.activated
# - Subscription activated
# - User gets 1 month access

# 6. Wait for next billing cycle (or simulate webhook)
POST /api/payment/webhook
X-Razorpay-Signature: <valid_signature>
{
  "event": "subscription.charged",
  "payload": {
    "subscription": {
      "entity": {
        "id": "sub_xxx",
        "status": "active"
      }
    }
  }
}

# 7. Check subscription extended by 1 month
GET /api/payment/subscription
```

---

## Webhook Events Flow

### Recurring Subscription Lifecycle

```
Month 1:
  User subscribes → subscription.activated
  ↓
  Subscription active for 30 days

Month 2:
  Auto-charge → subscription.charged
  ↓
  Subscription extended for 30 days

Month 2 (if payment fails):
  Payment failed → payment.failed
  ↓
  Retry 1 (Day +1) → payment.failed
  ↓
  Retry 2 (Day +3) → payment.failed
  ↓
  Retry 3 (Day +5) → subscription.halted
  ↓
  User downgraded to FREE

Month 12:
  Final payment → subscription.charged
  ↓
  Wait for billing cycle end
  ↓
  subscription.completed
  ↓
  Subscription ends (user keeps access until expiry)

Any time:
  User cancels → subscription.cancelled
  ↓
  No more charges
  ↓
  User keeps access until current period ends
```

---

## Frontend Integration

### Payment Form UI

```tsx
// Example React component
<Form>
  <Select name="plan">
    <option value="starter">Starter - ₹299/month</option>
    <option value="pro">Pro - ₹599/month</option>
  </Select>

  <Select name="duration">
    <option value="1">1 Month</option>
    <option value="3">3 Months</option>
    <option value="6">6 Months</option>
    <option value="12">12 Months</option>
  </Select>

  <Checkbox name="recurring">
    ✓ Enable auto-renewal (charge automatically every month)
  </Checkbox>

  {recurring && (
    <Alert>
      Your subscription will automatically renew every month.
      You can cancel anytime from your account settings.
    </Alert>
  )}

  <Button>Proceed to Payment</Button>
</Form>
```

---

## Important Notes

### 1. Razorpay Plans
For production, you should create plans in Razorpay Dashboard:
- Login to Razorpay Dashboard
- Go to Subscriptions → Plans
- Create plans:
  - `plan_starter_monthly`: ₹299/month
  - `plan_starter_quarterly`: ₹799/3 months
  - `plan_pro_monthly`: ₹599/month
  - `plan_pro_quarterly`: ₹1,599/3 months

### 2. Webhook Configuration
Add these events in Razorpay webhook settings:
- ✅ payment.captured
- ✅ payment.failed
- ✅ subscription.activated
- ✅ subscription.charged
- ✅ subscription.halted
- ✅ subscription.completed
- ✅ subscription.cancelled

### 3. Customer Management
- First payment creates Razorpay customer
- Customer ID stored in user.razorpay_customer_id
- Subsequent subscriptions reuse customer

### 4. Grace Period
Current implementation:
- Razorpay automatically retries 3 times
- After 3 failures → subscription.halted
- User downgraded to FREE
- Consider adding grace period before downgrade

---

## Pricing Comparison

### Starter Plan

| Duration | One-Time | Recurring (Total) | Difference |
|----------|----------|-------------------|------------|
| 1 month | ₹299 | ₹299 | Same |
| 3 months | ₹799 | ₹897 (₹299×3) | +₹98 |
| 6 months | ₹1,499 | ₹1,794 (₹299×6) | +₹295 |
| 12 months | ₹2,799 | ₹3,588 (₹299×12) | +₹789 |

**User Benefits:**
- Recurring: Lower initial cost, flexibility
- One-Time: Save money, no auto-charges

### Pro Plan

| Duration | One-Time | Recurring (Total) | Difference |
|----------|----------|-------------------|------------|
| 1 month | ₹599 | ₹599 | Same |
| 3 months | ₹1,599 | ₹1,797 (₹599×3) | +₹198 |
| 6 months | ₹2,999 | ₹3,594 (₹599×6) | +₹595 |
| 12 months | ₹5,599 | ₹7,188 (₹599×12) | +₹1,589 |

---

## Testing Checklist

### One-Time Payment
- [ ] User can select plan without recurring
- [ ] Order created successfully
- [ ] Payment processed
- [ ] Subscription activated for duration
- [ ] No auto-renewal
- [ ] Subscription expires after period

### Recurring Payment
- [ ] User can enable recurring checkbox
- [ ] Razorpay customer created
- [ ] Subscription created
- [ ] First payment activates subscription
- [ ] Monthly charge extends subscription
- [ ] Payment failure triggers retries
- [ ] Halted subscription downgrades user
- [ ] Completed subscription ends gracefully
- [ ] Cancelled subscription stops charges

### Edge Cases
- [ ] Existing customer reuses customer ID
- [ ] Plan doesn't exist → auto-created
- [ ] Payment fails → proper error handling
- [ ] Webhook signature invalid → rejected
- [ ] User cancels mid-subscription → access retained

---

## Production Checklist

- [ ] Create plans in Razorpay Dashboard
- [ ] Configure webhook URL
- [ ] Add all webhook events
- [ ] Test with Razorpay test mode
- [ ] Implement email notifications
- [ ] Add cancellation flow in frontend
- [ ] Add subscription management page
- [ ] Test payment failures
- [ ] Monitor webhook logs
- [ ] Set up alerts for halted subscriptions

---

## Summary

✅ **Implementation Status: COMPLETE**
- Schemas updated
- Service logic implemented
- Webhooks configured
- Database migrated
- Ready for testing

🎯 **User Experience:**
- Simple checkbox: "Enable auto-renewal"
- Same plans, different payment methods
- Clear pricing comparison
- Full control over subscriptions

🚀 **Next Steps:**
1. Test with Razorpay test mode
2. Create plans in Razorpay dashboard
3. Update frontend UI
4. Test webhook events
5. Deploy to production
