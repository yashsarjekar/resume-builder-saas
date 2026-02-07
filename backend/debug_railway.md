# Debug Railway Production Issues

## Current Situation

After updating environment variables with Resend configuration, the Railway service is not responding to requests (all endpoints timing out).

## Steps to Debug

### 1. Check Railway Deployment Status

```bash
railway status
```

Look for:
- Service status (should be "Active" or "Running")
- Recent deployments
- Any error states

### 2. Check Railway Logs

```bash
railway logs --tail 100
```

Look for:
- Startup errors
- Module import errors
- Database connection errors
- SMTP/email errors
- Port binding errors
- Any exceptions or tracebacks

Common issues to look for:
```
ModuleNotFoundError: No module named 'resend'  # Package missing
ConnectionRefusedError  # Database issue
OSError: [Errno 98] Address already in use  # Port issue
AttributeError  # Code error
```

### 3. Check Environment Variables Are Set

```bash
railway variables
```

Verify these are set correctly:
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4
SMTP_FROM_EMAIL=onboarding@resend.dev
ENVIRONMENT=production
```

### 4. Check Recent Deployments

```bash
railway deployments
```

Look for:
- Latest deployment status
- Whether it succeeded or failed
- Deployment duration

### 5. Manual Redeploy (If Needed)

If deployment seems stuck:

```bash
railway up
```

Or in Railway Dashboard:
- Go to your backend service
- Click "Deployments" tab
- Click "Redeploy" on the latest deployment

### 6. Check Service Health

Once service is running:

```bash
# Test health endpoint
curl https://resume-builder-backend-production-f9db.up.railway.app/health

# Should return:
# {"status":"healthy","environment":"production",...}
```

### 7. Test Email Service

Once health check passes:

```bash
cd backend
bash check_production_email.sh
```

Or manually:

```bash
curl -X POST https://resume-builder-backend-production-f9db.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'
```

Then check logs for email:

```bash
railway logs --tail 50 | grep -i email
```

## Common Issues & Solutions

### Issue 1: Service Won't Start

**Symptom:** Logs show startup errors

**Check:**
```bash
railway logs | grep -E "error|Error|ERROR|exception|Exception"
```

**Common causes:**
- Missing dependencies in requirements.txt
- Database connection failure
- Invalid environment variables
- Code syntax errors

**Fix:**
- Check requirements.txt has all packages
- Verify DATABASE_URL is correct
- Fix any code errors shown in logs

### Issue 2: Email Sending Still Failing

**Symptom:** User created but email not sent

**Check logs for:**
```
Failed to send email to ...
```

**Possible errors:**

1. **"Network is unreachable"** - Still using Gmail SMTP
   - Verify SMTP_HOST=smtp.resend.com
   - Redeploy if variables were just changed

2. **"Authentication failed"** - Wrong Resend credentials
   - Check SMTP_USER=resend (not an email!)
   - Verify SMTP_PASSWORD is your Resend API key
   - Make sure it starts with "re_"

3. **"Bad sender"** - Email address not verified
   - Use SMTP_FROM_EMAIL=onboarding@resend.dev
   - Or verify your own domain in Resend

### Issue 3: Timeout on Signup

**Symptom:** Signup request takes 30+ seconds and times out

**Cause:** Usually email service hanging

**Check logs during signup:**
```bash
# In one terminal, tail logs:
railway logs --follow

# In another, trigger signup:
curl -X POST https://resume-builder-backend-production-f9db.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!"}'
```

**Fix:**
- If logs show SMTP connection hanging, verify Resend variables
- If no logs appear, check if service is actually running

### Issue 4: Deployment Stuck

**Symptom:** Deployment shows "In Progress" for too long

**Fix:**
1. Cancel deployment in Railway dashboard
2. Check logs for what it's stuck on
3. Fix the issue
4. Redeploy

## Quick Checklist

After running the above commands, verify:

- [ ] Railway service status is "Active"
- [ ] Latest deployment succeeded
- [ ] Health endpoint responds with 200 OK
- [ ] SMTP_HOST=smtp.resend.com (not Gmail)
- [ ] SMTP_USER=resend
- [ ] SMTP_PASSWORD starts with "re_"
- [ ] SMTP_FROM_EMAIL=onboarding@resend.dev
- [ ] ENVIRONMENT=production
- [ ] No errors in recent logs
- [ ] Signup endpoint responds (not timeout)
- [ ] Email sending succeeds in logs

## Next Steps

Once you've run the debugging commands above, you'll have a better idea of what's wrong.

**Most likely issues:**

1. **Deployment failed** - Check logs, fix errors, redeploy
2. **Variables not updated** - Verify in Railway dashboard
3. **Service needs restart** - Trigger manual redeploy
4. **Email config wrong** - Double-check Resend variables

After fixing, retest with:

```bash
# 1. Health check
curl https://resume-builder-backend-production-f9db.up.railway.app/health

# 2. Signup test
bash check_production_email.sh

# 3. Check logs
railway logs --tail 50 | grep -i email
```

You should see:
```
✓ Email sent successfully to ...
```

## Contact

If you're still having issues after following this guide:

1. Share the Railway logs output
2. Share the `railway variables` output
3. Share any error messages

This will help identify the specific problem!
