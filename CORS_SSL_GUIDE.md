# 🔒 CORS & SSL/HTTPS Configuration Guide

Complete guide for configuring Cross-Origin Resource Sharing (CORS) and SSL/HTTPS for TiltCheck in production.

## 📋 Table of Contents

1. [CORS Configuration](#cors-configuration)
2. [SSL/HTTPS Setup](#sslhttps-setup)
3. [Railway Automatic SSL](#railway-automatic-ssl)
4. [Custom SSL Certificates](#custom-ssl-certificates)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🌐 CORS Configuration

### What is CORS?

Cross-Origin Resource Sharing (CORS) is a security feature that controls which domains can access your API. It prevents unauthorized websites from making requests to your server.

### Development Setup

For local development, allow all origins:

```bash
# .env
CORS_ORIGIN=*
```

**Warning:** ⚠️ Never use `*` in production!

### Production Setup

#### Single Domain

If your frontend is hosted on one domain:

```bash
# .env
CORS_ORIGIN=https://tiltcheck.com
```

#### Multiple Domains

If you have multiple frontends (web app, mobile app dashboard, etc.):

```bash
# .env
CORS_ORIGIN=https://tiltcheck.com,https://app.tiltcheck.com,https://admin.tiltcheck.com
```

**Important:** 
- ✅ Include `https://` protocol
- ✅ No trailing slashes
- ✅ Comma-separated, no spaces
- ✅ Each domain must be exact match

#### Subdomain Wildcards

To allow all subdomains (not recommended, but sometimes necessary):

```bash
# This requires custom middleware modification
# Not supported by default for security reasons
```

### How It Works in TiltCheck

Our server automatically parses and validates CORS origins:

```javascript
// In api-server.js
const getCorsOrigin = () => {
    const corsOrigin = process.env.CORS_ORIGIN;
    
    if (!corsOrigin || corsOrigin === '*') {
        return '*';  // Development only
    }
    
    // Parse comma-separated domains
    const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
    
    return (origin, callback) => {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
    };
};
```

### CORS Headers Configured

Our server sets these CORS headers:

```http
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Expose-Headers: X-Total-Count, X-Page-Count
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Testing CORS Configuration

#### Test with cURL

```bash
# Test preflight request
curl -X OPTIONS https://api.tiltcheck.com/api/auth/login \
  -H "Origin: https://tiltcheck.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see: Access-Control-Allow-Origin: https://tiltcheck.com
```

#### Test with Browser Console

```javascript
// In your frontend app console
fetch('https://api.tiltcheck.com/health', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Common CORS Errors

#### Error: Origin not allowed by CORS policy

**Cause:** Your frontend domain is not in `CORS_ORIGIN`

**Solution:**
```bash
# Add your domain to CORS_ORIGIN
CORS_ORIGIN=https://yourfrontend.com
```

#### Error: Credentials flag is true but Access-Control-Allow-Credentials is not set

**Cause:** Your frontend is sending `credentials: 'include'` but server isn't configured

**Solution:** Already configured! Our server sets `credentials: true` by default.

#### Error: Method not allowed

**Cause:** The HTTP method is not in allowed methods

**Solution:** Already configured! We allow GET, POST, PUT, DELETE, OPTIONS.

---

## 🔐 SSL/HTTPS Setup

### Why SSL/HTTPS?

- 🔒 Encrypts data in transit
- ✅ Required for modern browsers (geolocation, webcam, etc.)
- 🌐 Required for PWAs
- 📱 Required for mobile apps
- 💳 Required for payment processing (Coinbase)
- 🔑 Prevents man-in-the-middle attacks

### Railway Automatic SSL (Recommended)

Railway provides **free automatic SSL certificates** for all deployments!

#### Features

- ✅ Free SSL certificates via Let's Encrypt
- ✅ Automatic renewal every 90 days
- ✅ Wildcard certificates for subdomains
- ✅ Zero configuration required
- ✅ Works with custom domains

#### How to Use

1. **Deploy to Railway** (see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md))
2. **Add Custom Domain:**
   - Go to Railway project → Settings → Domains
   - Click "Custom Domain"
   - Enter your domain: `api.tiltcheck.com`
   - Update DNS records as instructed
3. **Wait for SSL Provisioning** (5-10 minutes)
4. **Done!** Your site is now HTTPS

#### Verify Railway SSL

```bash
# Check certificate
curl -vI https://yourdomain.railway.app

# Should see:
# * SSL connection using TLSv1.3
# * Server certificate:
#   subject: CN=yourdomain.railway.app
#   issuer: C=US; O=Let's Encrypt; CN=R3
```

---

## 🔧 Custom SSL Certificates

If you want to use your own SSL certificates (e.g., wildcard certificate, EV certificate):

### Step 1: Obtain SSL Certificate

#### Option A: Let's Encrypt (Free)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com
```

Certificates will be saved to:
- Certificate: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

#### Option B: Commercial Certificate

Purchase from:
- [DigiCert](https://www.digicert.com/)
- [Comodo](https://www.comodo.com/)
- [GoDaddy](https://www.godaddy.com/)

### Step 2: Configure TiltCheck

```bash
# .env
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/fullchain.pem
SSL_KEY_PATH=/path/to/privkey.pem
```

### Step 3: Start Server

```bash
npm start
```

Server will start with HTTPS:
```
🚀 TiltCheck API Server Started (HTTPS)
================================
🔒 HTTPS Server: https://localhost:3000
🔐 SSL/TLS: ENABLED
```

### Step 4: HTTP to HTTPS Redirect

Our server automatically creates an HTTP redirect server:

```javascript
// Redirects http://yourdomain.com → https://yourdomain.com
// Port 80 → Port 443
```

### Automatic Certificate Renewal

#### Let's Encrypt Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal (crontab)
sudo crontab -e

# Add this line to renew daily at 2 AM:
0 2 * * * certbot renew --quiet --post-hook "pm2 restart tiltcheck"
```

---

## 🛡️ Security Best Practices

### 1. HSTS Headers

Our server automatically sets HSTS headers when SSL is enabled:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

This tells browsers to always use HTTPS for your domain.

### 2. Content Security Policy

Configured automatically:

```javascript
{
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
    connectSrc: ["'self'", "https://api.coinbase.com"],
    frameSrc: ["'self'", "https://pay.coinbase.com"]
  }
}
```

### 3. Secure Cookies

When using SSL, cookies are automatically secured:

```javascript
{
  httpOnly: true,
  secure: true,  // Only sent over HTTPS
  sameSite: 'strict'
}
```

### 4. Rate Limiting

Prevents abuse even with valid CORS:

```javascript
// Auth endpoints: 5 attempts per 15 minutes
// API endpoints: 100 requests per 15 minutes
// Payment endpoints: 10 attempts per hour
```

### 5. Input Validation

All endpoints validate input:
- Email format validation
- Password strength requirements
- Request size limits
- JSON schema validation

---

## 🐛 Troubleshooting

### CORS Issues

#### Symptoms
```
Access to fetch at 'https://api.tiltcheck.com/api/auth/login' from origin 
'https://tiltcheck.com' has been blocked by CORS policy
```

#### Solutions

1. **Check CORS_ORIGIN environment variable:**
   ```bash
   railway variables get CORS_ORIGIN
   ```

2. **Verify protocol matches:**
   ```bash
   # ✅ Correct
   CORS_ORIGIN=https://tiltcheck.com
   
   # ❌ Wrong
   CORS_ORIGIN=http://tiltcheck.com  # Missing 's' in https
   CORS_ORIGIN=tiltcheck.com         # Missing protocol
   ```

3. **Check for trailing slashes:**
   ```bash
   # ✅ Correct
   CORS_ORIGIN=https://tiltcheck.com
   
   # ❌ Wrong
   CORS_ORIGIN=https://tiltcheck.com/
   ```

4. **Test with wildcard temporarily:**
   ```bash
   # ONLY FOR TESTING - Don't use in production
   CORS_ORIGIN=*
   ```

### SSL Certificate Issues

#### Error: CERT_HAS_EXPIRED

**Solution:** Renew your certificate
```bash
sudo certbot renew
pm2 restart tiltcheck
```

#### Error: UNABLE_TO_VERIFY_LEAF_SIGNATURE

**Cause:** Certificate chain is incomplete

**Solution:** Use `fullchain.pem` instead of `cert.pem`
```bash
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

#### Error: EACCES: permission denied

**Cause:** Node.js can't read certificate files

**Solution:** Set proper permissions
```bash
sudo chmod 644 /path/to/cert.pem
sudo chmod 600 /path/to/privkey.pem
```

### Mixed Content Warnings

#### Symptoms
```
Mixed Content: The page at 'https://tiltcheck.com' was loaded over HTTPS, 
but requested an insecure resource 'http://api.tiltcheck.com'
```

#### Solutions

1. **Ensure API uses HTTPS:**
   ```javascript
   // ✅ Correct
   const API_URL = 'https://api.tiltcheck.com';
   
   // ❌ Wrong
   const API_URL = 'http://api.tiltcheck.com';
   ```

2. **Update all resource URLs:**
   - Images: Use `https://` or relative URLs
   - Scripts: Use `https://` or SRI hashes
   - Stylesheets: Use `https://`

### Railway-Specific Issues

#### SSL Not Working After Custom Domain

**Wait Time:** SSL provisioning takes 5-10 minutes

**Check Status:**
1. Go to Railway Dashboard
2. Settings → Domains
3. Look for "SSL Certificate: Provisioned ✓"

#### Certificate Not Auto-Renewing

**Solution:** Railway handles this automatically. If issues persist:
1. Remove custom domain
2. Wait 1 minute
3. Re-add custom domain

---

## 📚 Additional Resources

- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Railway SSL Documentation](https://docs.railway.app/deploy/deployments#custom-domains)
- [OWASP Transport Layer Protection](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/01-Testing_for_Weak_SSL_TLS_Ciphers_Insufficient_Transport_Layer_Protection)

---

## ✅ Quick Checklist

Before deploying to production:

- [ ] CORS_ORIGIN set to specific domain(s)
- [ ] SSL_ENABLED=true in production
- [ ] Custom domain configured with SSL
- [ ] HSTS headers enabled
- [ ] All API calls use HTTPS
- [ ] Frontend resources load via HTTPS
- [ ] Cookies set with secure flag
- [ ] Rate limiting enabled
- [ ] CSP headers configured
- [ ] Certificate auto-renewal configured (if self-hosted)

**Your TiltCheck instance is now secure!** 🔒✨
