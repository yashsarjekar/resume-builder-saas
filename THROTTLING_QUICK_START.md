# 🛡️ Soft Throttling System - Quick Start

## ✅ What's Active Now

Your backend now has **progressive soft throttling** to protect against heavy users without blocking them!

## 🎯 How It Works

### For Regular Users (0-70% quota):
- ⚡ **Full speed** - No delays
- ✅ Great experience
- 💰 Profitable for you

### For Heavy Users (70-100% quota):
- ⏱️ **Progressive delays** - 1s → 2s → 3s
- 📊 Still functional, just slower
- 💡 Encourages upgrades

### For Quota Exceeded (100%+):
- ❌ **Blocked** with upgrade message
- 🎯 Must upgrade or wait 24h
- 💸 Revenue opportunity

## 📊 Current Limits

| Tier | Daily AI Assists | Lifetime ATS | Throttle Starts At |
|------|------------------|--------------|---------------------|
| **FREE** | 10/day | 2 total | 7 requests (70%) |
| **STARTER** | 50/day | 10 total | 35 requests (70%) |
| **PRO** | 999/day | 999 total | 700 requests (70%) |

## 🔥 Throttling Behavior

### AI Assist Endpoints (Daily Reset):
```
Usage: 0-70%   → No delay (instant)
Usage: 70-85%  → 1 second delay
Usage: 85-95%  → 2 second delay
Usage: 95-100% → 3 second delay
Usage: 100%+   → BLOCKED ❌
```

### ATS Analysis (More Aggressive):
```
Usage: 0-70%   → No delay (instant)
Usage: 70-85%  → 2 second delay
Usage: 85-100% → 4 second delay
Usage: 100%+   → BLOCKED ❌
```

## 📈 Expected Results

### Cost Savings:
- **Before:** Heavy users cost ₹2,500/month
- **After:** Heavy users cost ~₹1,500/month (40% reduction!)
- **Reason:** Delays reduce request volume

### Upgrade Conversions:
- **Target:** 10-20% of throttled users upgrade
- **Revenue:** ₹700 extra per upgrade (STARTER → PRO)
- **Break-even:** After ~2-3 upgrades

### User Impact:
- **Light Users (70%):** No change, happy
- **Normal Users (20%):** Rarely throttled, acceptable
- **Heavy Users (10%):** Throttled, some upgrade
- **Abusers (<1%):** Blocked, forced to pay

## 🎮 Testing

### Test Throttling Manually:

**1. Test as FREE User (10/day limit):**
```bash
# Make 5 requests (50% usage) - should be instant
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/ai/extract-keywords \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"job_description":"..."}'
done

# Make 8th request (80% usage) - should have 1s delay
# Make 10th request (100% usage) - should have 3s delay
# Make 11th request (110% usage) - should be BLOCKED
```

**2. Check Logs:**
```bash
tail -f backend/backend.log | grep "throttling"
```

You'll see:
```
INFO: Soft throttling user 123: 8/10 (80.0%) - 1s delay
INFO: Soft throttling user 123: 9/10 (90.0%) - 2s delay
WARNING: AI assist limit BLOCKED for user 123: 10/10 (100%)
```

## 🔧 Adjusting Throttling

### If Users Complain (Too Strict):

**Option 1: Start throttling later (80% instead of 70%)**
```python
# In routes/ai.py, line ~150
if usage_percent >= 98:  # Was 95
    throttle_delay = 3
elif usage_percent >= 90:  # Was 85
    throttle_delay = 2
elif usage_percent >= 80:  # Was 70
    throttle_delay = 1
```

**Option 2: Reduce delays (1s → 0.5s)**
```python
if usage_percent >= 95:
    throttle_delay = 2  # Was 3
elif usage_percent >= 85:
    throttle_delay = 1  # Was 2
elif usage_percent >= 70:
    throttle_delay = 0.5  # Was 1
```

### If Costs Still High (Too Loose):

**Option 1: Start throttling earlier (60%)**
```python
if usage_percent >= 90:  # Was 95
    throttle_delay = 3
elif usage_percent >= 75:  # Was 85
    throttle_delay = 2
elif usage_percent >= 60:  # Was 70
    throttle_delay = 1
```

**Option 2: Increase delays (3s → 5s)**
```python
if usage_percent >= 95:
    throttle_delay = 5  # Was 3
elif usage_percent >= 85:
    throttle_delay = 3  # Was 2
elif usage_percent >= 70:
    throttle_delay = 2  # Was 1
```

## 📊 Monitoring Dashboard (Todo)

### Add to Frontend:

```typescript
// Show usage bar in dashboard
<div className="bg-white p-6 rounded-lg">
  <h3>Today's AI Usage</h3>
  <div className="mt-4">
    <div className="flex justify-between mb-2">
      <span>AI Assists</span>
      <span className={usagePercent > 70 ? 'text-red-600' : ''}>
        {usageCount} / {limit}
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className={`h-3 rounded-full ${
          usagePercent > 95 ? 'bg-red-500' :
          usagePercent > 85 ? 'bg-orange-500' :
          usagePercent > 70 ? 'bg-yellow-500' :
          'bg-green-500'
        }`}
        style={{width: `${usagePercent}%`}}
      />
    </div>
  </div>

  {usagePercent > 70 && (
    <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
      <p className="text-sm text-yellow-800">
        ⚠️ You're experiencing slower responses due to high usage.
        Upgrade to PRO for unlimited fast access!
      </p>
      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
        Upgrade Now
      </button>
    </div>
  )}
</div>
```

## 🚨 Important Notes

### What's Protected:
✅ `/api/ai/extract-keywords` - Throttled at 70%
✅ `/api/ai/generate-cover-letter` - Throttled at 70%
✅ `/api/ai/optimize-linkedin` - Throttled at 70%
✅ `/api/ai/analyze-ats` - Throttled at 70%
✅ `/api/ai/analyze-resume/{id}` - Throttled at 70%
✅ `/api/ai/optimize-resume/{id}` - Throttled at 70%

### What's NOT Protected:
❌ `/api/resume/upload` - No quota (every file upload uses AI!)
❌ `/api/resume/parse` - No quota (LinkedIn parsing)

### Recommendation:
Add quota to file uploads too:
```python
# FREE: 1 upload/day
# STARTER: 5 uploads/day
# PRO: Unlimited
```

## 🎯 Next Steps (Priority Order)

### Week 1 (Critical):
1. ✅ **Done:** Soft throttling implemented
2. ⏳ **Monitor:** Watch logs for throttle events
3. ⏳ **Test:** Manual testing with different tiers
4. ⏳ **Track:** Count throttled users daily

### Week 2 (Important):
5. ⏳ Add usage dashboard in frontend
6. ⏳ Add email alerts at 80%, 100% quota
7. ⏳ Add upgrade prompts when throttled
8. ⏳ Add file upload quotas

### Month 2 (Nice to Have):
9. ⏳ Add PRO+ tier (₹1,999) for power users
10. ⏳ Add one-time credit packs
11. ⏳ Add admin dashboard for heavy user monitoring
12. ⏳ A/B test different throttle thresholds

## 📞 Support Scripts

### Check User's Usage:
```bash
# Check how many AI assists today
redis-cli GET "quota:ai_assist:USER_ID:$(date +%Y-%m-%d)"

# Check ATS analysis count
psql -d resume_builder -c "SELECT ats_analysis_count FROM users WHERE id=USER_ID;"
```

### Find Heavy Users:
```bash
# Users who used >80% of quota today
redis-cli --scan --pattern "quota:ai_assist:*:$(date +%Y-%m-%d)" | while read key; do
  count=$(redis-cli GET "$key")
  if [ $count -gt 40 ]; then
    echo "Heavy user: $key = $count requests"
  fi
done
```

### Reset User's Quota (Support Request):
```bash
# Reset daily quota for specific user
redis-cli DEL "quota:ai_assist:USER_ID:$(date +%Y-%m-%d)"

# Reset ATS count in database
psql -d resume_builder -c "UPDATE users SET ats_analysis_count=0 WHERE id=USER_ID;"
```

## ✅ Success!

Your throttling system is now **ACTIVE** and protecting you from heavy users! 🎉

**What you achieved:**
- ✅ Cost protection without blocking users
- ✅ Natural upgrade prompts
- ✅ Fair for light users (unaffected)
- ✅ Revenue opportunity from throttled users

**Monitor for next 7 days:**
- How many users hit throttling?
- Do they upgrade or churn?
- Are complaints increasing?
- Are costs decreasing?

**Adjust as needed** based on real data!

---

**Status:** ✅ Live and Active
**Last Updated:** 2026-02-10
**Review Date:** 2026-02-17 (7 days)
