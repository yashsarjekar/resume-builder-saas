# Resend Email Setup for Production

## ✅ Local Testing Successful

Your Resend SMTP configuration is working locally! Now let's configure Railway.

## Railway Configuration

### Update These Environment Variables in Railway

Go to **Railway Dashboard** → **Your Backend Service** → **Variables**

Update/Add these variables:

```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4
SMTP_FROM_EMAIL=onboarding@resend.dev
SMTP_FROM_NAME=Resume Builder
EMAIL_ENABLED=true
```

### Important Notes

1. **SMTP_USER** is literally the word `resend` (not an email address)
2. **SMTP_PASSWORD** is your Resend API key (starts with `re_`)
3. **SMTP_FROM_EMAIL** must be `onboarding@resend.dev` unless you verify your own domain

### Also Fix These Variables (Important!)

```bash
ENVIRONMENT=production  # Currently set to "development"
FRONTEND_URL=https://your-actual-frontend-url.com  # Currently "localhost:3000"
```

The `FRONTEND_URL` is used in emails for:
- Login links in welcome emails
- Password reset links
- Dashboard links in payment emails

## Using Railway CLI (Alternative)

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Set the variables
railway variables set SMTP_HOST=smtp.resend.com
railway variables set SMTP_PORT=587
railway variables set SMTP_USER=resend
railway variables set SMTP_PASSWORD=re_fpc3opZ7_HH7PDDsa5rJ4KqmEanwFHqD4
railway variables set SMTP_FROM_EMAIL=onboarding@resend.dev
railway variables set SMTP_FROM_NAME="Resume Builder"
railway variables set EMAIL_ENABLED=true

# Also fix these
railway variables set ENVIRONMENT=production
railway variables set FRONTEND_URL=https://your-frontend-url.com
```

## After Updating

1. **Railway will auto-redeploy** (takes 2-3 minutes)

2. **Check deployment status:**
   ```bash
   railway status
   ```

3. **Test the API:**
   ```bash
   curl https://resume-builder-backend-production-f9db.up.railway.app/health
   ```

4. **Test email by signing up a user:**
   ```bash
   curl -X POST https://resume-builder-backend-production-f9db.up.railway.app/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@youremail.com","password":"TestPass123!"}'
   ```

5. **Check Railway logs:**
   ```bash
   railway logs --tail 50 | grep -i email
   ```

   You should see:
   ```
   ✓ Email sent successfully to test@youremail.com: Welcome to Resume Builder!
   ```

6. **Check your email** (and spam folder!)

## Resend Dashboard

Monitor your emails at: https://resend.com/emails

You can see:
- All sent emails
- Delivery status
- Opens/clicks (if enabled)
- Bounces
- API usage

## Resend Limits

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for testing and small apps

**Need more?**
- Upgrade in Resend dashboard when needed

## Using Custom Domain (Optional)

To use your own domain (e.g., `noreply@resumebuilder.com`):

1. **Add domain in Resend:**
   - Go to https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `resumebuilder.com`)

2. **Add DNS records:**
   - Resend will show you DNS records to add
   - Add them in your domain registrar (Cloudflare, Namecheap, etc.)
   - Wait for verification (can take a few hours)

3. **Update Railway variables:**
   ```bash
   SMTP_FROM_EMAIL=noreply@resumebuilder.com
   ```

## Why Resend?

| Feature | Gmail SMTP | Resend |
|---------|-----------|--------|
| Works in Railway | ❌ Network unreachable | ✅ Works perfectly |
| Daily limit | 500 | 100 (free) / unlimited (paid) |
| Monthly limit | ~15,000 | 3,000 (free) / unlimited (paid) |
| Deliverability | May go to spam | Excellent |
| Analytics | None | Full dashboard |
| Custom domain | No | Yes (free) |
| API | No | Yes (REST API + SMTP) |
| Modern features | No | Webhooks, templates, etc. |

## Troubleshooting

### "Authentication failed"

- Check `SMTP_USER` is exactly `resend` (lowercase)
- Verify `SMTP_PASSWORD` is your API key starting with `re_`
- Make sure you copied the full API key

### "Bad sender"

- Use `onboarding@resend.dev` for testing
- Or verify your own domain first

### "Daily limit exceeded"

- You've hit the 100 emails/day limit
- Wait 24 hours or upgrade your plan

### Emails not received

1. Check spam folder
2. Check Resend dashboard → Emails (shows delivery status)
3. If status is "Delivered", it's the recipient's email provider blocking it
4. Try sending to a different email address

## Next Steps

After Railway is updated and working:

1. ✅ Test all email types:
   - Signup welcome email
   - Payment success email
   - Password reset (when you build it)

2. ✅ Update `FRONTEND_URL` to your actual frontend

3. ✅ Monitor emails in Resend dashboard

4. ✅ Consider verifying your own domain for professional emails

---

**Your emails will work in production now!** 🎉

The Railway network issue is resolved by using Resend instead of Gmail.
