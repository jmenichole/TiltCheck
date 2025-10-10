# 🌐 DNS & SSL Configuration Guide

## 🔧 Step 5: Set up DNS (Point your domain to the server)

### **Option A: Local Development/Testing**
```bash
# Add to /etc/hosts for local testing
sudo nano /etc/hosts

# Add these lines:
127.0.0.1   traphouse.dev
127.0.0.1   dashboard.traphouse.dev
```

### **Option B: Production Server**
```bash
# DNS Records to create in your domain provider:
# (Replace YOUR_SERVER_IP with your actual server IP)

# A Records:
traphouse.dev           A    YOUR_SERVER_IP
dashboard.traphouse.dev A    YOUR_SERVER_IP
api.traphouse.dev       A    YOUR_SERVER_IP
*.traphouse.dev         A    YOUR_SERVER_IP

# CNAME Records (optional):
www.traphouse.dev       CNAME traphouse.dev
```

### **Popular DNS Providers Setup:**

#### **Cloudflare:**
1. Go to Cloudflare Dashboard
2. Select your domain
3. DNS > Records
4. Add A record: `traphouse.dev` → `YOUR_SERVER_IP`
5. Add A record: `dashboard.traphouse.dev` → `YOUR_SERVER_IP`
6. Set Proxy status to "DNS only" (gray cloud) initially

#### **Namecheap:**
1. Domain List > Manage
2. Advanced DNS
3. Add A Record: `@` → `YOUR_SERVER_IP`
4. Add A Record: `dashboard` → `YOUR_SERVER_IP`

#### **GoDaddy:**
1. DNS Management
2. Add A Record: `@` → `YOUR_SERVER_IP`
3. Add A Record: `dashboard` → `YOUR_SERVER_IP`

---

## 🔐 Step 6: Configure SSL (Use Let's Encrypt for production)

### **Option A: Automated SSL with Certbot (Recommended)**

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot certonly --nginx \
  -d traphouse.dev \
  -d dashboard.traphouse.dev \
  -d api.traphouse.dev \
  --email admin@traphouse.com \
  --agree-tos \
  --non-interactive

# Copy certificates to Docker volume
sudo cp /etc/letsencrypt/live/traphouse.dev/fullchain.pem nginx/ssl/traphouse.crt
sudo cp /etc/letsencrypt/live/traphouse.dev/privkey.pem nginx/ssl/traphouse.key

# Set proper permissions
sudo chown $(whoami):$(whoami) nginx/ssl/*
```

### **Option B: Manual SSL Setup**

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate production certificate (replace with your domain)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/traphouse.key \
  -out nginx/ssl/traphouse.crt \
  -subj "/C=US/ST=State/L=City/O=TrapHouse/CN=traphouse.dev"

# For wildcard certificate:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/traphouse.key \
  -out nginx/ssl/traphouse.crt \
  -subj "/C=US/ST=State/L=City/O=TrapHouse/CN=*.traphouse.dev"
```

### **Option C: Cloudflare SSL (Free)**

```bash
# If using Cloudflare:
# 1. Enable "Full (strict)" SSL in Cloudflare dashboard
# 2. Generate Origin Certificate in Cloudflare
# 3. Save as nginx/ssl/traphouse.crt and nginx/ssl/traphouse.key
```

---

## 🔄 SSL Certificate Renewal (Automated)

```bash
# Add to crontab for automatic renewal
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * certbot renew --quiet && docker-compose -f /path/to/docker-compose.server.yml restart nginx

# Or create renewal script:
cat > renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
if [ $? -eq 0 ]; then
    cp /etc/letsencrypt/live/traphouse.dev/fullchain.pem nginx/ssl/traphouse.crt
    cp /etc/letsencrypt/live/traphouse.dev/privkey.pem nginx/ssl/traphouse.key
    docker-compose -f docker-compose.server.yml restart nginx
    echo "SSL certificates renewed successfully"
fi
EOF

chmod +x renew-ssl.sh
```

---

## 🌐 Update Environment for Production

```bash
# Update .env.server with your domain
nano .env.server

# Change these values:
DOMAIN=yourdomain.com
OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback
BASE_URL=https://yourdomain.com
EMAIL=admin@yourdomain.com
```

---

## 🔍 Verify DNS & SSL Setup

```bash
# Check DNS resolution
nslookup traphouse.dev
dig traphouse.dev

# Test SSL certificate
openssl s_client -connect traphouse.dev:443 -servername traphouse.dev

# Check certificate expiry
openssl x509 -in nginx/ssl/traphouse.crt -noout -dates

# Test HTTPS endpoints
curl -I https://traphouse.dev
curl -I https://dashboard.traphouse.dev
```

---

## 🚀 Deploy with Production SSL

```bash
# After DNS and SSL are configured:
# 1. Update environment
export $(cat .env.server | xargs)

# 2. Deploy with production settings
docker-compose -f docker-compose.server.yml --env-file .env.server down
docker-compose -f docker-compose.server.yml --env-file .env.server up -d

# 3. Verify deployment
./health-check.sh

# 4. Test HTTPS access
curl https://traphouse.dev/health
curl https://dashboard.traphouse.dev
```

---

## 🔧 Discord OAuth Production Update

```bash
# Update Discord Developer Portal:
# 1. Go to https://discord.com/developers/applications/1373784722718720090/oauth2/general
# 2. Add redirect URI: https://yourdomain.com/auth/callback
# 3. Remove localhost redirect URI for security

# Test OAuth flow:
curl -I https://yourdomain.com/auth/discord
```

---

## ✅ Production Checklist

- [ ] DNS A records pointing to server IP
- [ ] SSL certificate installed and valid
- [ ] Domain updated in .env.server
- [ ] Discord OAuth redirect URI updated
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Health checks passing
- [ ] All services running with HTTPS
- [ ] Monitoring dashboards accessible
- [ ] SSL auto-renewal configured

**🎉 Your TrapHouse Discord ecosystem is now production-ready with proper DNS and SSL!**
