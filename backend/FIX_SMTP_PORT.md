# Fix SMTP Connection Timeout - Try Port 465

## Issue Identified

Railway logs show:
```
Failed to send email: [Errno 110] Connection timed out
```

Railway may be blocking/throttling port 587 (SMTP/STARTTLS).

## Solution: Switch to Port 465 (SMTPS)

### Update Railway Environment Variables

Change only ONE variable:

```bash
SMTP_PORT=465
```

Keep everything else the same:
```bash
SMTP_HOST=smtp.resend.com
SMTP_USER=resend
SMTP_PASSWORD=re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4
SMTP_FROM_EMAIL=onboarding@resend.dev
SMTP_FROM_NAME=Resume Builder
EMAIL_ENABLED=true
```

### Using Railway CLI

```bash
railway variables set SMTP_PORT=465
```

### Wait & Test

After Railway redeploys (2-3 min):

```bash
# Test signup
curl -X POST https://resume-builder-backend-production-f9db.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Port 465","email":"test465@example.com","password":"Test123!"}'

# Check logs
railway logs --tail 20 | grep -i email
```

Look for:
- ✅ `Email sent successfully` (not timeout!)
- ✅ Check Resend dashboard for sent email

---

## Alternative: Try Port 2525

If port 465 doesn't work, some platforms allow port 2525:

```bash
railway variables set SMTP_PORT=2525
```

---

## If Both Fail: Code Change Needed for Port 465

Port 465 requires SSL from the start (not STARTTLS). Our current code uses STARTTLS which works for port 587 but not 465.

If you need to use port 465, we'll need to update the email service code to use `SMTP_SSL` instead of `SMTP` with `starttls()`.

But try port 587 with Resend first - it should work on Railway!

---

## Verification

Once it works, you should see in Railway logs:
```
✅ Email sent successfully to test@example.com: Welcome to Resume Builder!
```

And in Resend dashboard (https://resend.com/emails):
- Email appears as "Delivered"
