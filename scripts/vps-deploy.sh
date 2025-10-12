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

# VPS Docker Deployment Script for TrapHouse

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TrapHouse VPS Deployment${NC}"
echo "============================"

# Variables
DOMAIN=${1:-"localhost"}
EMAIL=${2:-"admin@${DOMAIN}"}
PROJECT_DIR="$HOME/traphouse-production/trap-house-discord-bot"

echo -e "${GREEN}📋 Deployment Configuration:${NC}"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo "   Project Dir: $PROJECT_DIR"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
    echo "Please run vps-setup.sh first"
    exit 1
fi

# Check if user is in docker group
if ! groups | grep -q docker; then
    echo -e "${RED}❌ User not in docker group${NC}"
    echo "Please logout and login again, or run:"
    echo "   newgrp docker"
    exit 1
fi

# Navigate to project directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    echo "Please run vps-setup.sh first"
    exit 1
fi

cd "$PROJECT_DIR"

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin main

# Create environment file
echo -e "${BLUE}⚙️  Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.docker .env
    
    echo -e "${YELLOW}📝 Please edit .env file with your actual tokens:${NC}"
    echo "   - DISCORD_TOKEN"
    echo "   - TIPCC_API_KEY"
    echo "   - TIPCC_WEBHOOK_SECRET"
    echo "   - DEGENS_DISCORD_TOKEN"
    echo ""
    echo -e "${YELLOW}Press Enter when ready to continue...${NC}"
    read -r
fi

# Update domain in nginx config
echo -e "${BLUE}🔧 Updating domain configuration...${NC}"
if [ "$DOMAIN" != "localhost" ]; then
    # Update nginx config with actual domain
    sed -i.bak "s/server_name localhost _;/server_name $DOMAIN;/" nginx/conf.d/default.conf
    
    # Create SSL nginx config
    cat > nginx/conf.d/ssl.conf << EOF
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Include common locations
    include /etc/nginx/conf.d/locations.conf;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}
EOF

    # Create locations config
    cat > nginx/conf.d/locations.conf << EOF
# Main webapp
location / {
    proxy_pass http://webapp:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
}

# Bot APIs and webhooks (same as default.conf)
location /api/traphouse/ {
    proxy_pass http://traphouse-bot:3001/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}

location /webhooks/ {
    proxy_pass http://traphouse-bot:3001/webhooks/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}

location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
EOF
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Build images
echo -e "${BLUE}🏗️  Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to initialize...${NC}"
sleep 30

# Setup SSL certificates
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "${BLUE}🔒 Setting up SSL certificates...${NC}"
    
    # Stop nginx temporarily for certbot
    docker-compose -f docker-compose.prod.yml stop nginx
    
    # Get SSL certificate
    sudo certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        -d "$DOMAIN"
    
    # Restart nginx with SSL
    docker-compose -f docker-compose.prod.yml start nginx
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx" | sudo crontab -
fi

# Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
sleep 10

if [ "$DOMAIN" != "localhost" ]; then
    WEBAPP_URL="https://$DOMAIN"
    API_URL="https://$DOMAIN/health"
else
    WEBAPP_URL="http://localhost"
    API_URL="http://localhost/health"
fi

# Check webapp
if curl -sf "$WEBAPP_URL" > /dev/null; then
    echo -e "${GREEN}✅ Webapp is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Webapp check failed${NC}"
fi

# Check API
if curl -sf "$API_URL" > /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API check failed${NC}"
fi

# Show status
echo ""
echo -e "${GREEN}📊 Deployment Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}🌐 Service URLs:${NC}"
if [ "$DOMAIN" != "localhost" ]; then
    echo "   Website:  https://$DOMAIN"
    echo "   API:      https://$DOMAIN/api/"
    echo "   Health:   https://$DOMAIN/health"
else
    echo "   Website:  http://localhost"
    echo "   API:      http://localhost/api/"
    echo "   Health:   http://localhost/health"
fi

echo ""
echo -e "${BLUE}📋 Management Commands:${NC}"
echo "   Status:   docker-compose -f docker-compose.prod.yml ps"
echo "   Logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop:     docker-compose -f docker-compose.prod.yml down"
echo "   Restart:  docker-compose -f docker-compose.prod.yml restart"
echo "   Update:   git pull && docker-compose -f docker-compose.prod.yml up -d --build"

echo ""
echo -e "${BLUE}🔧 System Management:${NC}"
echo "   Start on boot:    sudo systemctl start traphouse"
echo "   Stop service:     sudo systemctl stop traphouse"
echo "   Service status:   sudo systemctl status traphouse"
echo "   View logs:        journalctl -u traphouse -f"

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${BLUE}🎉 TrapHouse is now live at: $WEBAPP_URL${NC}"
