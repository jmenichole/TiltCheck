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

# VPS Initial Setup Script for TrapHouse Docker Deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TrapHouse VPS + Docker Setup${NC}"
echo "=================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   echo "Please create a non-root user first:"
   echo "  adduser traphouse"
   echo "  usermod -aG sudo traphouse"
   echo "  su - traphouse"
   exit 1
fi

# Variables
DOMAIN=${1:-""}
EMAIL=${2:-""}
USERNAME=$(whoami)

if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  No domain provided. Using localhost for testing.${NC}"
    DOMAIN="localhost"
fi

if [ -z "$EMAIL" ]; then
    EMAIL="admin@${DOMAIN}"
fi

echo -e "${GREEN}📋 Setup Configuration:${NC}"
echo "   User: $USERNAME"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo -e "${BLUE}🔧 Installing essential packages...${NC}"
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    tree \
    nano

# Install Docker
echo -e "${BLUE}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USERNAME
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${BLUE}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose already installed${NC}"
fi

# Install Node.js (for local development tools)
echo -e "${BLUE}📦 Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js already installed${NC}"
fi

# Configure Firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Configure Fail2Ban
echo -e "${BLUE}🛡️  Configuring Fail2Ban...${NC}"
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create project directory
echo -e "${BLUE}📁 Setting up project directory...${NC}"
mkdir -p ~/traphouse-production
cd ~/traphouse-production

# Download project files
echo -e "${BLUE}📥 Cloning TrapHouse repository...${NC}"
if [ ! -d "trap-house-discord-bot" ]; then
    git clone https://github.com/jmenichole/trap-house-discord-bot.git
else
    cd trap-house-discord-bot
    git pull origin main
    cd ..
fi

# Create SSL directory
mkdir -p ~/traphouse-production/ssl

# Install Certbot for SSL
if [ "$DOMAIN" != "localhost" ]; then
    echo -e "${BLUE}🔒 Installing Certbot for SSL...${NC}"
    sudo apt install -y certbot python3-certbot-nginx
fi

# Create swap file if needed
echo -e "${BLUE}💾 Checking swap file...${NC}"
if [ ! -f /swapfile ]; then
    echo -e "${BLUE}💾 Creating 2GB swap file...${NC}"
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}✅ Swap file created${NC}"
fi

# Create systemd service for Docker Compose
echo -e "${BLUE}⚙️  Creating systemd service...${NC}"
sudo tee /etc/systemd/system/traphouse.service > /dev/null <<EOF
[Unit]
Description=TrapHouse Discord Bot Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/$USERNAME/traphouse-production/trap-house-discord-bot
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=$USERNAME
Group=$USERNAME

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable traphouse.service

echo ""
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Logout and login again (to apply Docker group)"
echo "2. Run the deployment script:"
echo "   cd ~/traphouse-production/trap-house-discord-bot"
echo "   ./scripts/vps-deploy.sh $DOMAIN $EMAIL"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "   Check Docker: docker --version"
echo "   Check status: sudo systemctl status traphouse"
echo "   View logs: journalctl -u traphouse -f"
echo ""
echo -e "${YELLOW}⚠️  Please logout and login again before proceeding!${NC}"
