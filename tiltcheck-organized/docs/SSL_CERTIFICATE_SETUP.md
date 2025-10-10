# SSL Certificate Configuration Guide

## 🔒 Positive SSL Certificate Setup for tiltcheck.it.com

### ✅ SSL Certificate Purchased!
You now have a Positive SSL certificate for enhanced security and trust.

## 🌐 Deployment Options with SSL

### **Option 1: GitHub Pages with Custom SSL (Recommended)**
GitHub Pages automatically provides SSL for custom domains, but your Positive SSL can be used elsewhere.

#### Setup Steps:
1. **Enable GitHub Pages** (as planned)
2. **Configure DNS** to point to GitHub Pages
3. **GitHub handles SSL automatically** (Let's Encrypt)
4. **Use your Positive SSL** for other services (API endpoints, admin panels)

### **Option 2: VPS Hosting with Your SSL Certificate**
Use your Positive SSL certificate on a VPS for full control.

#### VPS Setup with SSL:
```bash
# 1. Set up VPS (DigitalOcean, Linode, AWS)
# 2. Install nginx
sudo apt update
sudo apt install nginx

# 3. Configure SSL certificate
sudo mkdir -p /etc/ssl/tiltcheck
sudo cp your_certificate.crt /etc/ssl/tiltcheck/
sudo cp your_private.key /etc/ssl/tiltcheck/
sudo cp intermediate_bundle.crt /etc/ssl/tiltcheck/

# 4. Nginx configuration
sudo nano /etc/nginx/sites-available/tiltcheck
```

#### Nginx Configuration:
```nginx
server {
    listen 80;
    server_name tiltcheck.it.com www.tiltcheck.it.com;
    return 301 https://tiltcheck.it.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tiltcheck.it.com www.tiltcheck.it.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/tiltcheck/your_certificate.crt;
    ssl_certificate_key /etc/ssl/tiltcheck/your_private.key;
    ssl_trusted_certificate /etc/ssl/tiltcheck/intermediate_bundle.crt;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Main site (static files)
    location / {
        root /var/www/tiltcheck;
        index index.html;
        try_files $uri $uri/ =404;
    }

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:4001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Dashboard
    location /dashboard/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Option 3: Hybrid Approach (Best of Both)**
Combine GitHub Pages for static content with VPS for dynamic services.

#### Configuration:
- **Main Site**: GitHub Pages (tiltcheck.it.com) - Auto SSL
- **API Server**: VPS with your SSL (api.tiltcheck.it.com)
- **Dashboard**: VPS with your SSL (dashboard.tiltcheck.it.com)
- **Admin Panel**: VPS with your SSL (admin.tiltcheck.it.com)

#### DNS Setup for Hybrid:
```dns
# GitHub Pages (main site)
@                 A     185.199.108.153
@                 A     185.199.109.153
@                 A     185.199.110.153
@                 A     185.199.111.153
www               CNAME jmenichole.github.io

# VPS services (with your SSL)
api               A     YOUR_VPS_IP
dashboard         A     YOUR_VPS_IP
admin             A     YOUR_VPS_IP
```

## 🔧 SSL Certificate Installation Steps

### **For VPS Deployment:**
1. **Upload Certificate Files**:
   - `tiltcheck_it_com.crt` (your certificate)
   - `tiltcheck_it_com.key` (private key)
   - `intermediate_bundle.crt` (CA bundle)

2. **Set Correct Permissions**:
```bash
sudo chmod 600 /etc/ssl/tiltcheck/tiltcheck_it_com.key
sudo chmod 644 /etc/ssl/tiltcheck/tiltcheck_it_com.crt
sudo chown root:root /etc/ssl/tiltcheck/*
```

3. **Test SSL Configuration**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

4. **Verify SSL**:
```bash
curl -I https://tiltcheck.it.com
openssl s_client -connect tiltcheck.it.com:443 -servername tiltcheck.it.com
```

## 🛡️ Security Enhancements with SSL

### **HTTPS Enforcement**:
```javascript
// Update ecosystem dashboard
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});
```

### **Update CORS for HTTPS**:
```javascript
// In ecosystemDashboard.js
app.use(cors({
    origin: [
        'https://tiltcheck.it.com',
        'https://api.tiltcheck.it.com',
        'https://dashboard.tiltcheck.it.com',
        'https://admin.tiltcheck.it.com'
    ],
    credentials: true
}));
```

### **Update Environment Variables**:
```env
# HTTPS URLs
BASE_URL=https://tiltcheck.it.com
API_URL=https://api.tiltcheck.it.com
DASHBOARD_URL=https://dashboard.tiltcheck.it.com
ADMIN_URL=https://admin.tiltcheck.it.com

# SSL Settings
SSL_CERT_PATH=/etc/ssl/tiltcheck/tiltcheck_it_com.crt
SSL_KEY_PATH=/etc/ssl/tiltcheck/tiltcheck_it_com.key
SSL_CA_PATH=/etc/ssl/tiltcheck/intermediate_bundle.crt
```

## 📱 Updated Landing Page Links

Update all URLs in your landing pages to use HTTPS:

```html
<!-- Update in index.html and landing pages -->
<a href="https://tiltcheck.it.com/landing-pages/beta.html">Beta Access</a>
<a href="https://api.tiltcheck.it.com/health">API Status</a>
<a href="https://dashboard.tiltcheck.it.com">Dashboard</a>
```

## 🎯 Recommended Approach

**For immediate deployment**: Use GitHub Pages + your SSL on a separate VPS for APIs
1. Deploy static site to GitHub Pages (auto HTTPS)
2. Set up VPS with your SSL certificate for dynamic services
3. Use subdomains to separate concerns
4. This gives you the best performance and security

## 🔍 SSL Verification Tools

After setup, verify your SSL:
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com/
- **Certificate Transparency**: https://crt.sh/

Your Positive SSL certificate will provide:
✅ **256-bit encryption**  
✅ **99.9% browser recognition**  
✅ **Warranty protection**  
✅ **Green padlock indicator**  
✅ **SEO benefits from HTTPS**  

Which deployment option would you like to proceed with?
