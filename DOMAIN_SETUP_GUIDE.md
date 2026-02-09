# Custom Domain Setup Guide

Complete guide to connecting `resumebuilder.pulsestack.in` to your Railway deployment with automatic SSL.

---

## Overview

- **Frontend URL**: `resume-builder-frontend-production-6579.up.railway.app`
- **Custom Domain**: `resumebuilder.pulsestack.in`
- **SSL Certificate**: Automatic via Railway + Let's Encrypt
- **Setup Time**: 10-40 minutes (mostly DNS propagation)

---

## Step-by-Step Setup

### Step 1: Add Domain in Railway

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Select your frontend project**: `resume-builder-frontend-production`
3. **Click on your service** (Next.js app)
4. **Go to Settings tab**
5. **Scroll to "Domains" section**
6. **Click "+ Custom Domain"**
7. **Enter**: `resumebuilder.pulsestack.in`
8. **Click "Add"**

Railway will show you the CNAME value:
```
resume-builder-frontend-production-6579.up.railway.app
```

### Step 2: Configure DNS

Go to your DNS provider (where `pulsestack.in` is managed) and add:

#### CNAME Record (Recommended)
```
Type: CNAME
Name: resumebuilder
Target: resume-builder-frontend-production-6579.up.railway.app
TTL: 3600 (or Auto)
Proxy: Disabled (if using Cloudflare)
```

#### Alternative: ALIAS Record (if CNAME not supported)
```
Type: ALIAS or ANAME
Name: resumebuilder
Target: resume-builder-frontend-production-6579.up.railway.app
TTL: 3600
```

### Step 3: Wait for DNS Propagation

**Expected Timeline:**
- DNS changes saved: Instant
- DNS propagation: 5-30 minutes
- Railway detects domain: 1-5 minutes after DNS propagates
- SSL certificate issued: 1-2 minutes after domain verified
- **Total: 10-40 minutes**

**Check DNS propagation:**
```bash
# Check if DNS is live
nslookup resumebuilder.pulsestack.in

# Should show:
# resumebuilder.pulsestack.in    canonical name = resume-builder-frontend-production-6579.up.railway.app
```

**Check from multiple locations:**
- https://dnschecker.org/#CNAME/resumebuilder.pulsestack.in

### Step 4: Verify SSL Certificate

Once DNS propagates, Railway automatically:
1. Detects your domain ✅
2. Verifies domain ownership ✅
3. Requests Let's Encrypt certificate ✅
4. Installs certificate ✅
5. Enables HTTPS ✅

**Check in Railway:**
```
Settings → Domains → resumebuilder.pulsestack.in
Status: ✓ SSL Active (green checkmark)
```

**Check in Browser:**
1. Visit: https://resumebuilder.pulsestack.in
2. Look for 🔒 lock icon in address bar
3. Click lock → View certificate
4. Should show:
   - Issued to: `resumebuilder.pulsestack.in`
   - Issued by: `Let's Encrypt`
   - Valid until: ~90 days from now

**Check via Command Line:**
```bash
# Test HTTPS connection
curl -I https://resumebuilder.pulsestack.in

# Expected: HTTP/2 200 OK

# Check certificate
echo | openssl s_client -connect resumebuilder.pulsestack.in:443 -servername resumebuilder.pulsestack.in 2>/dev/null | grep -i "issuer"

# Expected: issuer=C = US, O = Let's Encrypt, CN = R...
```

### Step 5: Update Environment Variables

After SSL is active and domain is working:

#### Frontend Environment Variables (Railway)

Go to Railway → Frontend Service → Variables:

**Update or add these:**
```env
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH
NEXT_PUBLIC_APP_URL=https://resumebuilder.pulsestack.in
```

**Then redeploy frontend:**
- Click "Deployments" tab
- Click "Redeploy" on latest deployment

#### Backend Environment Variables (Railway)

Go to Railway → Backend Service → Variables:

**Update CORS_ORIGINS to include your domain:**
```env
CORS_ORIGINS=http://localhost:3000,https://resume-builder-frontend-production-6579.up.railway.app,https://resumebuilder.pulsestack.in
```

**Then redeploy backend:**
- Click "Deployments" tab
- Click "Redeploy" on latest deployment

### Step 6: Final Testing

Visit your custom domain: https://resumebuilder.pulsestack.in

**Test these features:**
- [ ] Home page loads (no errors in console)
- [ ] SSL certificate is valid (🔒 icon shows)
- [ ] Sign up for an account
- [ ] Login works
- [ ] Create a resume
- [ ] AI tools work (no CORS errors)
- [ ] Payment modal opens (Razorpay)
- [ ] ATS analysis works

**Check Browser Console:**
- Press F12 → Console tab
- Should see NO CORS errors
- API calls should go to backend successfully

---

## Special Cases

### If Using Cloudflare DNS

Cloudflare adds a proxy layer that can interfere with SSL. Choose one:

#### Option 1: Use Cloudflare with Full (Strict) SSL
```
Cloudflare Dashboard
→ Select domain: pulsestack.in
→ SSL/TLS → Overview
→ Set mode: "Full (strict)"
```

Keep the orange cloud (proxy) enabled. Cloudflare will use Railway's Let's Encrypt certificate.

#### Option 2: Disable Cloudflare Proxy
```
Cloudflare Dashboard
→ DNS → Records
→ Find: resumebuilder CNAME record
→ Click orange cloud to turn it gray (DNS only)
```

Railway handles SSL directly.

**Recommendation**: Use Option 1 (Full Strict) for better performance and DDoS protection.

### If Using GoDaddy DNS

GoDaddy sometimes caches DNS records aggressively:
1. Wait 30-60 minutes after adding CNAME
2. Clear GoDaddy's DNS cache (contact support if needed)
3. Use `nslookup` to verify propagation

### If Using Namecheap DNS

Namecheap DNS propagates quickly (5-15 minutes):
1. Add CNAME record as described
2. Leave TTL as "Automatic"
3. No special configuration needed

---

## Troubleshooting

### Issue: "This site can't be reached"

**Cause**: DNS not propagated yet

**Fix**:
```bash
# Check DNS status
nslookup resumebuilder.pulsestack.in

# If no result: Wait longer (DNS takes 5-30 min)
# If shows Railway domain: Good! Wait 5 more minutes for Railway
```

### Issue: "Your connection is not private" / SSL Error

**Cause**: Railway hasn't issued certificate yet, or DNS pointing to wrong place

**Fix**:
1. Verify DNS CNAME is correct
2. Wait 10 more minutes
3. Check Railway dashboard shows "SSL Active"
4. If still failing after 1 hour, remove and re-add domain in Railway

### Issue: "Mixed Content" warnings

**Cause**: HTTP resources loaded on HTTPS page

**Fix**: Ensure all environment variables use HTTPS:
```env
# ✅ Correct (HTTPS)
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app

# ❌ Wrong (HTTP)
NEXT_PUBLIC_API_URL=http://resume-builder-backend-production-f9db.up.railway.app
```

### Issue: CORS errors in browser console

**Cause**: Backend doesn't allow requests from your custom domain

**Fix**: Add domain to backend CORS_ORIGINS:
```env
CORS_ORIGINS=http://localhost:3000,https://resumebuilder.pulsestack.in
```

Then redeploy backend.

### Issue: Certificate expired

**Cause**: Railway's auto-renewal failed (rare)

**Fix**:
1. Check Railway service status: https://status.railway.app
2. Remove and re-add domain in Railway
3. Certificate will be re-issued automatically

---

## SSL Certificate Details

### How Railway's SSL Works

1. **Domain Verification**: Railway uses ACME protocol to verify you own the domain
2. **Certificate Request**: Railway requests certificate from Let's Encrypt
3. **Certificate Installation**: Railway installs certificate on your service
4. **Auto-Renewal**: Railway renews certificate 30 days before expiration

### Certificate Information

```
Issuer: Let's Encrypt
Type: Domain Validated (DV)
Encryption: TLS 1.3 (latest)
Validity: 90 days
Auto-Renewal: 30 days before expiration
Cost: FREE ✅
```

### Certificate Transparency

Your certificate will be logged in Certificate Transparency logs:
- https://crt.sh/?q=resumebuilder.pulsestack.in

This is normal and expected for all SSL certificates.

---

## Optional: Add WWW Subdomain

If you want `www.resumebuilder.pulsestack.in` to also work:

### Step 1: Add WWW in DNS
```
Type: CNAME
Name: www.resumebuilder
Target: resume-builder-frontend-production-6579.up.railway.app
TTL: 3600
```

### Step 2: Add WWW in Railway

Railway → Frontend → Settings → Domains → Add:
```
www.resumebuilder.pulsestack.in
```

Railway will automatically provision SSL for this too.

### Step 3: Add WWW to Backend CORS
```env
CORS_ORIGINS=...,https://www.resumebuilder.pulsestack.in
```

---

## Security Best Practices

### 1. HTTPS Only

Railway automatically redirects HTTP → HTTPS, but verify:
```bash
# Test HTTP redirect
curl -I http://resumebuilder.pulsestack.in

# Should return: 301 Moved Permanently
# Location: https://resumebuilder.pulsestack.in
```

### 2. Secure Headers

Railway automatically adds security headers:
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options`
- `X-Frame-Options`

Verify in browser:
```
Developer Tools → Network → Select any request → Headers
Look for security headers
```

### 3. Certificate Monitoring

Monitor your certificate expiration:
- Railway handles auto-renewal automatically
- But monitor via: https://www.ssllabs.com/ssltest/analyze.html?d=resumebuilder.pulsestack.in
- Should always show Grade A or A+

---

## Maintenance

### Certificate Renewal

**Railway handles this automatically!**

- Certificates expire: 90 days
- Railway renews: 30 days before expiration
- You receive: Email notification if renewal fails (rare)

**You don't need to do anything.**

### DNS Changes

If you need to change DNS:
1. Update CNAME record in DNS provider
2. Wait for DNS propagation (5-30 min)
3. Railway automatically detects change
4. No need to update anything in Railway

---

## Quick Reference

### Your URLs

```
Production Frontend:  https://resumebuilder.pulsestack.in
Railway Frontend:     https://resume-builder-frontend-production-6579.up.railway.app
Backend API:          https://resume-builder-backend-production-f9db.up.railway.app
```

### Important Environment Variables

```env
# Frontend
NEXT_PUBLIC_API_URL=https://resume-builder-backend-production-f9db.up.railway.app
NEXT_PUBLIC_APP_URL=https://resumebuilder.pulsestack.in
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_SBnvLkUM2KLOUH

# Backend
CORS_ORIGINS=http://localhost:3000,https://resumebuilder.pulsestack.in
```

### DNS Record

```
Type:   CNAME
Name:   resumebuilder
Target: resume-builder-frontend-production-6579.up.railway.app
TTL:    3600
```

### Check Commands

```bash
# DNS status
nslookup resumebuilder.pulsestack.in

# HTTPS test
curl -I https://resumebuilder.pulsestack.in

# SSL certificate
echo | openssl s_client -connect resumebuilder.pulsestack.in:443 2>/dev/null | grep -i "subject\|issuer"
```

---

## Support

### If Everything Fails

1. **Check Railway Status**: https://status.railway.app
2. **Check DNS Propagation**: https://dnschecker.org
3. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R)
4. **Try Incognito**: Rule out cache issues
5. **Wait 1 Hour**: DNS can be slow sometimes

### Railway Support

If SSL doesn't provision after 1 hour:
- Railway Discord: https://discord.gg/railway
- Railway Help: help.railway.app

---

**Setup Date**: February 10, 2026
**Last Updated**: February 10, 2026
**Domain**: resumebuilder.pulsestack.in
**Platform**: Railway
**SSL Provider**: Let's Encrypt (Automatic)
