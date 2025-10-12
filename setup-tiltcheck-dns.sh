#!/bin/bash
#
# Copyright (c) 2024-2025 JME (jmenichole)
# All Rights Reserved
# 
# PROPRIETARY AND CONFIDENTIAL
# Unauthorized copying of this file, via any medium, is strictly prohibited.
# 
# This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
# For licensing information, see LICENSE file in the root directory.
#


# 🌐 TiltCheck.it.com DNS Setup and SSL Implementation Script
# Complete automation for domain configuration and deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="tiltcheck.it.com"
EMAIL="admin@tiltcheck.it.com"
SERVER_IP=""

echo -e "${BLUE}🏠 TrapHouse DNS & SSL Setup for ${DOMAIN}${NC}"
echo "============================================="

# Function to display DNS records
show_dns_records() {
    echo -e "\n${YELLOW}📋 DNS Records to Configure:${NC}"
    echo "Type    Name                     Value              TTL"
    echo "A       @                        ${SERVER_IP}       300"
    echo "A       dashboard                ${SERVER_IP}       300"
    echo "A       api                      ${SERVER_IP}       300"
    echo "A       collectclock             ${SERVER_IP}       300"
    echo "A       tilt                     ${SERVER_IP}       300"
    echo "A       admin                    ${SERVER_IP}       300"
    echo "A       vault                    ${SERVER_IP}       300"
    echo "A       portal                   ${SERVER_IP}       300"
    echo "A       bot                      ${SERVER_IP}       300"
    echo "CNAME   www                      ${DOMAIN}          300"
    echo "CNAME   degens                   ${DOMAIN}          300"
    echo "CNAME   cards                    ${DOMAIN}          300"
}

# Get server IP if not provided
if [ -z "$SERVER_IP" ]; then
    echo -e "${YELLOW}🔍 Detecting server IP...${NC}"
    SERVER_IP=$(curl -s ifconfig.me)
    echo -e "${GREEN}✅ Detected IP: ${SERVER_IP}${NC}"
fi

# Check if we're running on the server
if [ "$1" == "--server" ]; then
    echo -e "${BLUE}🚀 Server-side setup detected${NC}"
    
    # Update system
    echo -e "${YELLOW}📦 Updating system packages...${NC}"
    sudo apt update && sudo apt upgrade -y
    
    # Install required packages
    echo -e "${YELLOW}📦 Installing required packages...${NC}"
    sudo apt install -y nginx certbot python3-certbot-nginx curl dig
    
    # Create SSL directory
    echo -e "${YELLOW}🔐 Setting up SSL directories...${NC}"
    sudo mkdir -p /etc/nginx/ssl
    sudo mkdir -p ./nginx/ssl
    
    # Generate temporary self-signed certificate for initial setup
    echo -e "${YELLOW}🔐 Generating temporary SSL certificate...${NC}"
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./nginx/ssl/tiltcheck.key \
        -out ./nginx/ssl/tiltcheck.crt \
        -subj "/C=US/ST=State/L=City/O=TrapHouse/CN=*.${DOMAIN}"
    
    # Set permissions
    sudo chown $(whoami):$(whoami) ./nginx/ssl/*
    
    echo -e "${GREEN}✅ Temporary SSL certificate created${NC}"
    
    # Create nginx configuration
    echo -e "${YELLOW}🔧 Creating nginx configuration...${NC}"
    
    cat > ./nginx/conf.d/tiltcheck.conf << EOF
# TiltCheck.it.com Main Configuration

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} *.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

# Main site
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /health {
        proxy_pass http://api:4000/health;
        proxy_set_header Host \$host;
    }
}

# Dashboard
server {
    listen 443 ssl http2;
    server_name dashboard.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://dashboard:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# API
server {
    listen 443 ssl http2;
    server_name api.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://api:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# CollectClock Integration
server {
    listen 443 ssl http2;
    server_name collectclock.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://collectclock:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Tilt Monitor
server {
    listen 443 ssl http2;
    server_name tilt.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://tiltcheck:3002;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://admin:3003;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Vault System
server {
    listen 443 ssl http2;
    server_name vault.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://vault:3004;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Portal
server {
    listen 443 ssl http2;
    server_name portal.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://portal:3005;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Bot Dashboard
server {
    listen 443 ssl http2;
    server_name bot.${DOMAIN};
    
    ssl_certificate /etc/ssl/certs/tiltcheck.crt;
    ssl_certificate_key /etc/ssl/private/tiltcheck.key;
    
    location / {
        proxy_pass http://bot:3006;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    echo -e "${GREEN}✅ Nginx configuration created${NC}"
    
    # Update environment file
    echo -e "${YELLOW}🔧 Updating environment configuration...${NC}"
    
    # Create or update .env.server
    cat > .env.server << EOF
# TiltCheck Domain Configuration
DOMAIN=${DOMAIN}
BASE_URL=https://${DOMAIN}
DASHBOARD_URL=https://dashboard.${DOMAIN}
API_URL=https://api.${DOMAIN}
COLLECTCLOCK_URL=https://collectclock.${DOMAIN}
TILT_URL=https://tilt.${DOMAIN}
ADMIN_URL=https://admin.${DOMAIN}
VAULT_URL=https://vault.${DOMAIN}
PORTAL_URL=https://portal.${DOMAIN}
BOT_URL=https://bot.${DOMAIN}

# Discord OAuth
OAUTH_REDIRECT_URI=https://${DOMAIN}/auth/callback
DISCORD_REDIRECT_URI=https://bot.${DOMAIN}/auth/discord

# SSL Configuration
EMAIL=${EMAIL}
SSL_ENABLED=true

# Database
POSTGRES_URL=postgresql://traphouse:traphouse@postgres:5432/traphouse
REDIS_URL=redis://redis:6379

# API Keys (Add your actual keys)
DISCORD_TOKEN=your_discord_token_here
STRIPE_SECRET_KEY=your_stripe_key_here
TIPCC_API_KEY=your_tipcc_key_here

# TiltCheck Integration
TILTCHECK_API_URL=https://api.${DOMAIN}/tiltcheck
COLLECTCLOCK_API_URL=https://api.${DOMAIN}/collectclock
VAULT_API_URL=https://api.${DOMAIN}/vault

# Webhook URLs
WEBHOOK_URL=https://api.${DOMAIN}/webhooks/discord
STRIPE_WEBHOOK_URL=https://api.${DOMAIN}/webhooks/stripe
TIPCC_WEBHOOK_URL=https://api.${DOMAIN}/webhooks/tipcc
EOF

    echo -e "${GREEN}✅ Environment configuration updated${NC}"
    
    # Configure firewall
    echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
    sudo ufw allow 22/tcp   # SSH
    sudo ufw allow 80/tcp   # HTTP
    sudo ufw allow 443/tcp  # HTTPS
    sudo ufw --force enable
    
    echo -e "${GREEN}✅ Firewall configured${NC}"
    
    # Wait for DNS configuration
    echo -e "\n${YELLOW}⏳ Waiting for DNS configuration...${NC}"
    echo -e "${BLUE}Please configure the following DNS records at your domain provider:${NC}"
    show_dns_records
    
    echo -e "\n${YELLOW}Press Enter when DNS records are configured and propagated...${NC}"
    read -r
    
    # Test DNS resolution
    echo -e "${YELLOW}🔍 Testing DNS resolution...${NC}"
    for subdomain in "" "dashboard" "api" "collectclock" "tilt" "admin" "vault" "portal" "bot"; do
        if [ -z "$subdomain" ]; then
            test_domain="$DOMAIN"
        else
            test_domain="$subdomain.$DOMAIN"
        fi
        
        if dig +short "$test_domain" | grep -q "$SERVER_IP"; then
            echo -e "${GREEN}✅ $test_domain resolves correctly${NC}"
        else
            echo -e "${RED}❌ $test_domain does not resolve to $SERVER_IP${NC}"
        fi
    done
    
    # Generate Let's Encrypt certificates
    echo -e "${YELLOW}🔐 Generating Let's Encrypt SSL certificates...${NC}"
    
    # Stop nginx temporarily
    sudo systemctl stop nginx 2>/dev/null || true
    
    # Generate wildcard certificate
    sudo certbot certonly \
        --manual \
        --preferred-challenges=dns \
        --email "$EMAIL" \
        --server https://acme-v02.api.letsencrypt.org/directory \
        --agree-tos \
        --manual-public-ip-logging-ok \
        -d "$DOMAIN" \
        -d "*.$DOMAIN"
    
    # Copy certificates to nginx directory
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ./nginx/ssl/tiltcheck.crt
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ./nginx/ssl/tiltcheck.key
    sudo chown $(whoami):$(whoami) ./nginx/ssl/*
    
    echo -e "${GREEN}✅ SSL certificates generated and configured${NC}"
    
    # Start services
    echo -e "${YELLOW}🚀 Starting TrapHouse services...${NC}"
    
    # Export environment and start services
    export $(cat .env.server | xargs)
    docker-compose -f docker-compose.server.yml --env-file .env.server down
    docker-compose -f docker-compose.server.yml --env-file .env.server up -d
    
    # Wait for services to start
    echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
    sleep 30
    
    # Health checks
    echo -e "${YELLOW}🔍 Running health checks...${NC}"
    
    health_check() {
        local url="$1"
        local name="$2"
        
        if curl -f -s --max-time 10 "$url" > /dev/null; then
            echo -e "${GREEN}✅ $name: OK${NC}"
        else
            echo -e "${RED}❌ $name: Failed${NC}"
        fi
    }
    
    health_check "https://$DOMAIN/health" "Main Site"
    health_check "https://dashboard.$DOMAIN" "Dashboard"
    health_check "https://api.$DOMAIN/health" "API"
    health_check "https://collectclock.$DOMAIN" "CollectClock"
    health_check "https://tilt.$DOMAIN" "Tilt Monitor"
    health_check "https://admin.$DOMAIN" "Admin Panel"
    health_check "https://vault.$DOMAIN" "Vault System"
    health_check "https://portal.$DOMAIN" "Portal"
    health_check "https://bot.$DOMAIN" "Bot Dashboard"
    
    # Setup SSL auto-renewal
    echo -e "${YELLOW}🔄 Setting up SSL auto-renewal...${NC}"
    
    # Create renewal script
    cat > ./ssl-renew.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/tiltcheck.it.com/fullchain.pem ./nginx/ssl/tiltcheck.crt
cp /etc/letsencrypt/live/tiltcheck.it.com/privkey.pem ./nginx/ssl/tiltcheck.key
docker-compose -f docker-compose.server.yml exec nginx nginx -s reload
EOF
    
    chmod +x ./ssl-renew.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 12 * * * $(pwd)/ssl-renew.sh") | crontab -
    
    echo -e "${GREEN}✅ SSL auto-renewal configured${NC}"
    
    echo -e "\n${GREEN}🎉 TiltCheck deployment complete!${NC}"
    echo -e "${BLUE}Your TrapHouse empire is now live at:${NC}"
    echo -e "• Main Site: https://$DOMAIN"
    echo -e "• Dashboard: https://dashboard.$DOMAIN"
    echo -e "• API: https://api.$DOMAIN"
    echo -e "• CollectClock: https://collectclock.$DOMAIN"
    echo -e "• Tilt Monitor: https://tilt.$DOMAIN"
    echo -e "• Admin Panel: https://admin.$DOMAIN"
    echo -e "• Vault System: https://vault.$DOMAIN"
    echo -e "• Portal: https://portal.$DOMAIN"
    echo -e "• Bot Dashboard: https://bot.$DOMAIN"
    
else
    # Client-side setup (local development)
    echo -e "${BLUE}🖥️ Client-side setup detected${NC}"
    
    echo -e "\n${YELLOW}📋 DNS Configuration Required:${NC}"
    show_dns_records
    
    echo -e "\n${YELLOW}🚀 To deploy to server, run:${NC}"
    echo -e "${BLUE}./setup-tiltcheck-dns.sh --server${NC}"
    
    echo -e "\n${YELLOW}🔧 Manual Steps:${NC}"
    echo -e "1. Configure DNS records at your domain provider"
    echo -e "2. Point $DOMAIN to your server IP: $SERVER_IP"
    echo -e "3. Run this script on your server with --server flag"
    echo -e "4. Update Discord OAuth redirect URIs"
    echo -e "5. Update webhook URLs in your services"
    
    echo -e "\n${YELLOW}📝 Discord OAuth Redirect URIs to add:${NC}"
    echo -e "• https://$DOMAIN/auth/callback"
    echo -e "• https://bot.$DOMAIN/auth/discord"
    echo -e "• https://dashboard.$DOMAIN/auth/callback"
    
    echo -e "\n${YELLOW}🔗 Webhook URLs to configure:${NC}"
    echo -e "• Discord: https://api.$DOMAIN/webhooks/discord"
    echo -e "• Stripe: https://api.$DOMAIN/webhooks/stripe"
    echo -e "• TipCC: https://api.$DOMAIN/webhooks/tipcc"
fi

echo -e "\n${GREEN}✅ TiltCheck DNS setup guide complete!${NC}"
echo -e "${BLUE}🏠 Welcome to the TrapHouse empire at $DOMAIN! 🎯${NC}"
