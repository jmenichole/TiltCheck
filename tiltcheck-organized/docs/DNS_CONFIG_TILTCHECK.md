# 🌐 DNS Configuration for tiltcheck.it.com

## 📋 DNS Records Setup

### **A Records (Required)**
```dns
@                        A    YOUR_SERVER_IP     300
www                      A    YOUR_SERVER_IP     300
dashboard                A    YOUR_SERVER_IP     300
api                      A    YOUR_SERVER_IP     300
collectclock             A    YOUR_SERVER_IP     300
tilt                     A    YOUR_SERVER_IP     300
admin                    A    YOUR_SERVER_IP     300
vault                    A    YOUR_SERVER_IP     300
portal                   A    YOUR_SERVER_IP     300
bot                      A    YOUR_SERVER_IP     300
```

### **CNAME Records (Optional)**
```dns
degens                   CNAME    tiltcheck.it.com    300
traphouse               CNAME    tiltcheck.it.com    300
cards                   CNAME    tiltcheck.it.com    300
loans                   CNAME    tiltcheck.it.com    300
```

## 🎯 Domain Structure for TrapHouse System

### **Primary Services:**
- **Main Site:** `https://tiltcheck.it.com`
- **Dashboard:** `https://dashboard.tiltcheck.it.com`
- **API:** `https://api.tiltcheck.it.com`
- **CollectClock:** `https://collectclock.tiltcheck.it.com`

### **TiltCheck Features:**
- **Tilt Monitor:** `https://tilt.tiltcheck.it.com`
- **Vault System:** `https://vault.tiltcheck.it.com`
- **Portal:** `https://portal.tiltcheck.it.com`
- **Admin Panel:** `https://admin.tiltcheck.it.com`

### **Bot Integration:**
- **Bot Dashboard:** `https://bot.tiltcheck.it.com`
- **Discord OAuth:** `https://tiltcheck.it.com/auth/discord`
- **Webhooks:** `https://api.tiltcheck.it.com/webhooks/`

## 🔧 Configuration Steps

### **1. DNS Provider Setup (Cloudflare Recommended)**

**Cloudflare DNS:**
```bash
# Go to Cloudflare Dashboard
# Select tiltcheck.it.com domain
# DNS > Records > Add record

# Add these A records:
Name: @               Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
Name: dashboard       Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only  
Name: api             Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
Name: collectclock    Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
Name: tilt            Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
Name: admin           Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
Name: vault           Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
Name: portal          Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
Name: bot             Type: A    Value: YOUR_SERVER_IP    Proxy: DNS only
```

### **2. Environment Configuration**

**Update .env.server:**
```bash
# TiltCheck Domain Configuration
DOMAIN=tiltcheck.it.com
BASE_URL=https://tiltcheck.it.com
DASHBOARD_URL=https://dashboard.tiltcheck.it.com
API_URL=https://api.tiltcheck.it.com
COLLECTCLOCK_URL=https://collectclock.tiltcheck.it.com

# Discord OAuth
OAUTH_REDIRECT_URI=https://tiltcheck.it.com/auth/callback
DISCORD_REDIRECT_URI=https://bot.tiltcheck.it.com/auth/discord

# SSL Configuration
EMAIL=admin@tiltcheck.it.com
SSL_ENABLED=true
```

### **3. SSL Certificate Setup**

**Automated SSL with Let's Encrypt:**
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate wildcard certificate
sudo certbot certonly --manual \
  --preferred-challenges=dns \
  --email admin@tiltcheck.it.com \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos \
  -d tiltcheck.it.com \
  -d *.tiltcheck.it.com

# Copy certificates
sudo cp /etc/letsencrypt/live/tiltcheck.it.com/fullchain.pem nginx/ssl/tiltcheck.crt
sudo cp /etc/letsencrypt/live/tiltcheck.it.com/privkey.pem nginx/ssl/tiltcheck.key
```

## 🚀 Nginx Configuration

**nginx/conf.d/tiltcheck.conf:**
```nginx
# Main site
server {
    listen 443 ssl http2;
    server_name tiltcheck.it.com www.tiltcheck.it.com;
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Dashboard
server {
    listen 443 ssl http2;
    server_name dashboard.tiltcheck.it.com;
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://dashboard:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API
server {
    listen 443 ssl http2;
    server_name api.tiltcheck.it.com;
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://api:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# CollectClock Integration
server {
    listen 443 ssl http2;
    server_name collectclock.tiltcheck.it.com;
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://collectclock:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name tiltcheck.it.com *.tiltcheck.it.com;
    return 301 https://$host$request_uri;
}
```

## 🔍 Verification Commands

**Test DNS Resolution:**
```bash
# Check A records
dig tiltcheck.it.com
dig dashboard.tiltcheck.it.com
dig api.tiltcheck.it.com
dig collectclock.tiltcheck.it.com

# Check CNAME records  
dig degens.tiltcheck.it.com
dig vault.tiltcheck.it.com

# Test SSL
openssl s_client -connect tiltcheck.it.com:443 -servername tiltcheck.it.com
```

**Test Endpoints:**
```bash
# Main services
curl -I https://tiltcheck.it.com
curl -I https://dashboard.tiltcheck.it.com
curl -I https://api.tiltcheck.it.com/health
curl -I https://collectclock.tiltcheck.it.com

# TiltCheck features
curl -I https://tilt.tiltcheck.it.com
curl -I https://vault.tiltcheck.it.com
curl -I https://portal.tiltcheck.it.com
```

## 🎯 Discord Integration Updates

**Discord Developer Portal Updates:**
```bash
# Update OAuth Redirect URIs:
https://tiltcheck.it.com/auth/callback
https://bot.tiltcheck.it.com/auth/discord
https://dashboard.tiltcheck.it.com/auth/callback

# Webhook URLs:
https://api.tiltcheck.it.com/webhooks/discord
https://api.tiltcheck.it.com/webhooks/stripe
https://api.tiltcheck.it.com/webhooks/tipcc
```

## 📋 Production Checklist

- [ ] DNS A records configured and propagated
- [ ] Wildcard SSL certificate installed
- [ ] Environment variables updated with new domain
- [ ] Nginx configuration updated
- [ ] Discord OAuth redirect URIs updated
- [ ] Webhook URLs updated in all services
- [ ] Health checks passing on all subdomains
- [ ] TiltCheck dashboard accessible
- [ ] CollectClock integration working
- [ ] Bot commands responding correctly

## 🛡️ Security Considerations

**Firewall Rules:**
```bash
# Allow HTTPS traffic
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp

# Allow SSH (if needed)
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable
```

**Additional Security:**
- Enable Cloudflare proxy after initial setup
- Set up rate limiting
- Configure fail2ban for SSH protection
- Regular SSL certificate renewal automation
- Monitor DNS for unauthorized changes

## 🚀 Deployment Script

**deploy-tiltcheck.sh:**
```bash
#!/bin/bash
echo "🚀 Deploying TiltCheck to tiltcheck.it.com..."

# Update environment
export DOMAIN=tiltcheck.it.com
export $(cat .env.server | xargs)

# Deploy with new domain
docker-compose -f docker-compose.server.yml --env-file .env.server down
docker-compose -f docker-compose.server.yml --env-file .env.server up -d

# Wait for services
sleep 30

# Health check
echo "🔍 Running health checks..."
curl -f https://tiltcheck.it.com/health || echo "❌ Main site failed"
curl -f https://dashboard.tiltcheck.it.com || echo "❌ Dashboard failed"  
curl -f https://api.tiltcheck.it.com/health || echo "❌ API failed"
curl -f https://collectclock.tiltcheck.it.com || echo "❌ CollectClock failed"

echo "✅ TiltCheck deployment complete!"
echo "🌐 Visit: https://tiltcheck.it.com"
echo "📊 Dashboard: https://dashboard.tiltcheck.it.com"
```

---

**🎉 Your TiltCheck empire is ready to dominate at tiltcheck.it.com! 🏠🎯**
