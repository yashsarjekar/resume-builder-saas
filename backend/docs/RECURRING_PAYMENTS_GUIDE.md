# Recurring Payments & Webhook Guide

## Current Implementation ✅

### One-Time Payments
Currently, the system uses **one-time payments** with different durations:
- 1 month: ₹299 (Starter) / ₹599 (Pro)
- 3 months: ₹799 (Starter) / ₹1,599 (Pro)
- 6 months: ₹1,499 (Starter) / ₹2,999 (Pro)
- 12 months: ₹2,799 (Starter) / ₹5,599 (Pro)

**How it works:**
1. User pays once for the entire period
2. Subscription is active for the purchased duration
3. No auto-renewal - user needs to manually renew

### Webhook Implementation ✅
- **Signature Verification**: Working perfectly
- **Payment Status Updates**: Automatic
- **Security**: Using HMAC-SHA256 verification
- **Events Supported**:
  - `payment.captured` - Updates payment to SUCCESS
  - `payment.failed` - Updates payment to FAILED

---

## Adding Recurring Payments (Yearly with Monthly Billing)

### Option 1: Razorpay Subscriptions API (Recommended)

To implement recurring monthly payments for a yearly commitment:

#### 1. Create Subscription Plans in Razorpay Dashboard

```bash
# Starter Plan - Monthly recurring for 12 months
Plan ID: plan_starter_monthly
Amount: ₹249/month (₹299 with discount for annual commitment)
Interval: 1 month
Total Count: 12

# Pro Plan - Monthly recurring for 12 months
Plan ID: plan_pro_monthly
Amount: ₹499/month (₹599 with discount for annual commitment)
Interval: 1 month
Total Count: 12
```

#### 2. Update Payment Schema

```python
# Add to app/schemas/payment.py

class PaymentType(str, Enum):
    ONE_TIME = "one_time"
    SUBSCRIPTION = "subscription"

class CreateSubscriptionRequest(BaseModel):
    plan: SubscriptionPlan  # starter/pro
    payment_type: PaymentType = PaymentType.SUBSCRIPTION
    billing_cycle: str = "monthly"  # monthly, quarterly, yearly
```

#### 3. Implement Subscription Service

```python
# Add to app/services/razorpay_service.py

def create_subscription(
    self,
    user_id: int,
    plan: str,
    billing_cycle: str,
    db: Session
) -> Dict:
    """Create a recurring subscription."""

    # Map to Razorpay plan IDs
    plan_ids = {
        "starter_monthly": "plan_starter_monthly",
        "pro_monthly": "plan_pro_monthly"
    }

    plan_id = plan_ids.get(f"{plan}_{billing_cycle}")

    # Create subscription
    subscription = self.client.subscription.create({
        "plan_id": plan_id,
        "customer_notify": 1,
        "total_count": 12,  # 12 months
        "notes": {
            "user_id": user_id,
            "plan": plan
        }
    })

    # Save subscription record
    payment = Payment(
        user_id=user_id,
        razorpay_order_id=subscription["id"],
        amount=subscription["plan"]["item"]["amount"],
        currency="INR",
        status=PaymentStatus.PENDING,
        plan=plan,
        duration_months=1,  # Billed monthly
        payment_type="subscription"
    )
    db.add(payment)
    db.commit()

    return subscription
```

#### 4. Handle Subscription Webhooks

```python
# Update webhook handler in app/routes/payment.py

elif event_type == 'subscription.charged':
    # Monthly payment successful
    subscription_entity = webhook_data.get('payload', {}).get('subscription', {}).get('entity', {})
    subscription_id = subscription_entity.get('id')

    # Extend user subscription by 1 month
    # Update payment records

elif event_type == 'subscription.cancelled':
    # User cancelled subscription
    # Mark as cancelled, stop future charges

elif event_type == 'subscription.completed':
    # 12 months completed
    # Subscription ended
```

#### 5. Add Subscription Management Endpoints

```python
# Add to app/routes/payment.py

@router.post("/subscription/create")
async def create_subscription(...):
    """Create recurring subscription"""
    pass

@router.post("/subscription/cancel")
async def cancel_subscription(...):
    """Cancel recurring subscription"""
    pass

@router.post("/subscription/pause")
async def pause_subscription(...):
    """Pause recurring subscription"""
    pass

@router.get("/subscription/status")
async def get_subscription_status(...):
    """Get subscription status"""
    pass
```

---

## Implementation Comparison

### Current (One-Time)
✅ Simple implementation
✅ User pays once
✅ No payment failures mid-subscription
❌ Manual renewal required
❌ Higher upfront cost

### Recurring (Subscription)
✅ Lower monthly cost
✅ Automatic renewal
✅ Better cash flow for business
❌ More complex implementation
❌ Need to handle payment failures
❌ Need cancellation management

---

## Webhook Testing Results ✅

### Test 1: Valid Signature
```bash
✅ Status: 200 OK
✅ Payment updated to SUCCESS
✅ razorpay_payment_id saved correctly
```

### Test 2: Invalid Signature
```bash
✅ Status: 400 Bad Request
✅ Webhook rejected with "Invalid webhook signature"
```

### Test 3: Missing Signature
```bash
✅ Status: 400 Bad Request
✅ Webhook rejected with "Missing webhook signature"
```

### Webhook Security Features:
- ✅ HMAC-SHA256 signature verification
- ✅ Constant-time comparison (timing attack protection)
- ✅ Webhook secret from environment variables
- ✅ Automatic payment status updates
- ✅ Database transaction safety

---

## Webhook Setup in Razorpay Dashboard

1. **Login to Razorpay Dashboard**
2. **Go to Settings → Webhooks**
3. **Add Webhook URL:**
   ```
   Production: https://your-domain.com/api/payment/webhook
   Development: Use ngrok tunnel
   ```
4. **Select Events:**
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ subscription.charged (if using subscriptions)
   - ✅ subscription.cancelled (if using subscriptions)
5. **Set Webhook Secret:**
   - Copy the secret to your `.env` file:
   ```
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

---

## Recommendation

### For MVP/Launch:
**Use Current Implementation (One-Time Payments)**
- ✅ Simple and reliable
- ✅ No recurring payment failures
- ✅ Already fully tested
- ✅ Easier to manage initially

### For Scale/Growth:
**Add Subscription Option Later**
- Offer both options:
  - Annual (One-Time): ₹2,799 (save 22%)
  - Monthly (Recurring): ₹299/month × 12 = ₹3,588

### Best of Both Worlds:
```python
# Let users choose payment method
class CreateOrderRequest(BaseModel):
    plan: SubscriptionPlan
    duration_months: int
    payment_type: PaymentType = PaymentType.ONE_TIME  # or SUBSCRIPTION
```

---

## Next Steps to Add Recurring Payments

If you want to implement this:

1. **Create plans in Razorpay Dashboard** (5 mins)
2. **Update schemas** to support subscription type (10 mins)
3. **Implement subscription service** (30 mins)
4. **Add subscription routes** (20 mins)
5. **Update webhook handler** (15 mins)
6. **Write tests** (30 mins)
7. **Update frontend** to show both options (1 hour)

**Total Implementation Time: ~3 hours**

Would you like me to implement recurring payments now?
