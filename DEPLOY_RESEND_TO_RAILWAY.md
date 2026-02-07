# Deploy Resend HTTP API to Railway

## ✅ What We've Done Locally

1. ✅ Installed `resend` Python package
2. ✅ Updated `email_service.py` to use Resend HTTP API (no more SMTP!)
3. ✅ Updated `requirements.txt` with `resend==2.21.0`
4. ✅ Tested locally - **Email sent successfully!**

## Next Steps: Deploy to Railway

### Step 1: Update Railway Environment Variables

Go to **Railway Dashboard** → **Your Backend Service** → **Variables**

**Add/Update these variables:**

```bash
RESEND_API_KEY=re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=Resume Builder
EMAIL_ENABLED=true
```

**Also ensure these are correct:**

```bash
ENVIRONMENT=production
FRONTEND_URL=https://your-actual-frontend-url.com
```

**Remove or keep for backward compatibility:**
```bash
# These are no longer needed but won't hurt:
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4
```

The email service now uses `RESEND_API_KEY` but falls back to `SMTP_PASSWORD` for backward compatibility.

### Step 2: Commit and Push Changes

```bash
git add .
git commit -m "Switch email service from SMTP to Resend HTTP API

- Install resend package
- Update email_service.py to use HTTP API instead of SMTP
- Add RESEND_API_KEY environment variable
- Fixes email sending on Railway (no more SMTP port restrictions)
- Tested locally and working

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

Railway will automatically deploy when you push!

### Step 3: Monitor Deployment

```bash
# Watch deployment
railway status

# Watch logs
railway logs --follow
```

Look for:
```
✅ Resend email service initialized successfully
```

### Step 4: Test Production Email

Once deployed (2-3 minutes):

```bash
# Test signup (triggers welcome email)
curl -X POST https://resume-builder-backend-production-f9db.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Resend Test","email":"test@youremail.com","password":"Test123!"}'
```

### Step 5: Verify Email Was Sent

**Check Railway logs:**
```bash
railway logs --tail 50 | grep -i email
```

You should see:
```
✅ Email sent successfully to test@youremail.com: Welcome to Resume Builder! (ID: xxxxxxxxx)
```

**NOT:**
```
❌ [Errno 110] Connection timed out
```

**Check Resend Dashboard:**
- Go to https://resend.com/emails
- You should see the sent email
- Status should be "Delivered"

**Check your email inbox:**
- Welcome email should arrive within seconds
- Check spam folder if not in inbox

## What Changed?

### Before (SMTP - Didn't Work on Railway):
```python
# Used SMTP on port 587
with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
    server.starttls()
    server.login(self.smtp_user, self.smtp_password)
    server.sendmail(...)

# Result: [Errno 110] Connection timed out ❌
```

### After (HTTP API - Works Everywhere):
```python
# Uses HTTPS on port 443
import resend
resend.api_key = self.resend_api_key
response = resend.Emails.send(params)

# Result: Email sent successfully! ✅
```

## Benefits of This Change

| Feature | SMTP | Resend HTTP API |
|---------|------|-----------------|
| Works on Railway | ❌ Blocked/timeout | ✅ Yes |
| Works on any cloud | ⚠️ Hit or miss | ✅ Yes |
| Speed | Slow (2-5s) | Fast (<1s) |
| Port restrictions | ❌ Often blocked | ✅ No issues |
| Error handling | Basic | Detailed |
| Delivery tracking | No | Yes (via dashboard) |
| Analytics | No | Yes |
| Webhooks | No | Yes |
| Templates | No | Yes (optional) |

## Troubleshooting

### If deployment fails:

1. **Check Railway logs:**
   ```bash
   railway logs --tail 100
   ```

2. **Common issues:**
   - Missing `resend` in requirements.txt → Check requirements.txt line 23
   - RESEND_API_KEY not set → Check Railway variables
   - Module import error → Clear build cache and redeploy

### If email still not sending:

1. **Check API key is valid:**
   - Go to https://resend.com/api-keys
   - Verify `re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4` exists and is active

2. **Check logs show initialization:**
   ```bash
   railway logs | grep "Resend email service"
   ```

   Should show:
   ```
   ✅ Resend email service initialized successfully
   ```

3. **Test with curl:**
   Test directly on Railway to see exact error

## Files Changed

- ✅ `app/services/email_service.py` - Complete rewrite to use Resend HTTP API
- ✅ `requirements.txt` - Added `resend==2.21.0`
- ✅ `app/config.py` - Added RESEND_* environment variables
- ✅ `.env` - Updated with RESEND_API_KEY
- ✅ `.env.example` - Updated documentation
- ✅ `test_email_connection.py` - Updated to work with HTTP API

## Success Criteria

✅ Railway deployment succeeds
✅ No errors in logs
✅ Test signup creates user
✅ Welcome email arrives in inbox
✅ Resend dashboard shows "Delivered"
✅ Railway logs show "Email sent successfully"

---

**Ready to deploy? Follow the steps above!** 🚀

After deployment, your email service will work reliably on Railway (and any other cloud platform).
