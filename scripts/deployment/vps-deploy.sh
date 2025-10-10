#!/bin/bash

# TiltCheck VPS Deployment Script
# Complete setup for Ubuntu/Debian VPS hosting

set -e

echo "🚀 TiltCheck VPS Deployment Script"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DOMAIN="tiltcheck.it.com"
PROJECT_DIR="/var/www/tiltcheck"
SSL_DIR="/etc/ssl/tiltcheck"
LOG_FILE="/var/log/tiltcheck-setup.log"

echo -e "${PURPLE}🔧 Starting TiltCheck VPS Setup...${NC}"

# Function to log and display
log_and_echo() {
    echo -e "$1"
    echo "$(date): $1" >> $LOG_FILE
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ This script must be run as root${NC}"
        echo "Run: sudo $0"
        exit 1
    fi
}

# Function to update system
update_system() {
    log_and_echo "${BLUE}📦 Updating system packages...${NC}"
    apt update && apt upgrade -y
    apt install -y curl wget git unzip software-properties-common
}

# Function to install Node.js
install_nodejs() {
    log_and_echo "${BLUE}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt install -y nodejs
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_and_echo "${GREEN}✅ Node.js $NODE_VERSION installed${NC}"
    log_and_echo "${GREEN}✅ NPM $NPM_VERSION installed${NC}"
}

# Function to install PM2
install_pm2() {
    log_and_echo "${BLUE}📦 Installing PM2 process manager...${NC}"
    npm install -g pm2
    pm2 startup
    log_and_echo "${GREEN}✅ PM2 installed${NC}"
}

# Function to install Nginx
install_nginx() {
    log_and_echo "${BLUE}📦 Installing Nginx...${NC}"
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    log_and_echo "${GREEN}✅ Nginx installed and started${NC}"
}

# Function to install Certbot (Let's Encrypt)
install_certbot() {
    log_and_echo "${BLUE}📦 Installing Certbot for SSL...${NC}"
    apt install -y certbot python3-certbot-nginx
    log_and_echo "${GREEN}✅ Certbot installed${NC}"
}

# Function to create project directories
create_directories() {
    log_and_echo "${BLUE}📁 Creating project directories...${NC}"
    mkdir -p $PROJECT_DIR
    mkdir -p $SSL_DIR
    mkdir -p /var/log/tiltcheck
    mkdir -p /etc/tiltcheck
    
    # Set permissions
    chown -R www-data:www-data $PROJECT_DIR
    chmod -R 755 $PROJECT_DIR
    
    log_and_echo "${GREEN}✅ Directories created${NC}"
}

# Function to configure firewall
configure_firewall() {
    log_and_echo "${BLUE}🛡️ Configuring firewall...${NC}"
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw allow 22
    ufw allow 80
    ufw allow 443
    ufw allow 4001  # TiltCheck API
    ufw allow 3001  # Dashboard
    ufw --force enable
    log_and_echo "${GREEN}✅ Firewall configured${NC}"
}

# Function to clone TiltCheck repository
clone_repository() {
    log_and_echo "${BLUE}📥 Cloning TiltCheck repository...${NC}"
    cd /tmp
    git clone https://github.com/jmenichole/trap-house-discord-bot.git tiltcheck-temp
    
    # Copy files to project directory
    cp -r tiltcheck-temp/* $PROJECT_DIR/
    rm -rf tiltcheck-temp
    
    # Set ownership
    chown -R www-data:www-data $PROJECT_DIR
    
    log_and_echo "${GREEN}✅ Repository cloned${NC}"
}

# Function to install dependencies
install_dependencies() {
    log_and_echo "${BLUE}📦 Installing project dependencies...${NC}"
    cd $PROJECT_DIR
    
    # Install main dependencies
    sudo -u www-data npm install
    
    # Install additional packages if needed
    sudo -u www-data npm install express cors dotenv discord.js axios
    
    log_and_echo "${GREEN}✅ Dependencies installed${NC}"
}

# Function to create environment file
create_env_file() {
    log_and_echo "${BLUE}⚙️ Creating environment configuration...${NC}"
    
    cat > $PROJECT_DIR/.env << EOF
# TiltCheck VPS Configuration
NODE_ENV=production
PORT=4001
DASHBOARD_PORT=3001

# Domain Configuration
DOMAIN=$DOMAIN
BASE_URL=https://$DOMAIN
API_URL=https://api.$DOMAIN
DASHBOARD_URL=https://dashboard.$DOMAIN

# Discord Configuration (UPDATE THESE)
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Admin Configuration
ADMIN_NFT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C6212d5f2b5FcD
ADMIN_TOKEN_ID=1337

# SSL Configuration
SSL_CERT_PATH=$SSL_DIR/fullchain.pem
SSL_KEY_PATH=$SSL_DIR/privkey.pem

# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/tiltcheck
EOF

    chown www-data:www-data $PROJECT_DIR/.env
    chmod 600 $PROJECT_DIR/.env
    
    log_and_echo "${GREEN}✅ Environment file created${NC}"
    log_and_echo "${YELLOW}⚠️  Remember to update Discord tokens in .env${NC}"
}

# Function to configure Nginx
configure_nginx() {
    log_and_echo "${BLUE}🌐 Configuring Nginx...${NC}"
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/tiltcheck << EOF
# TiltCheck Nginx Configuration

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN dashboard.$DOMAIN admin.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# Main site (HTTPS)
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration (will be updated after certificate installation)
    ssl_certificate $SSL_DIR/fullchain.pem;
    ssl_certificate_key $SSL_DIR/privkey.pem;
    
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
    add_header X-XSS-Protection "1; mode=block";

    # Document root
    root $PROJECT_DIR;
    index index.html;

    # Main site
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Landing pages
    location /landing-pages/ {
        try_files \$uri \$uri/ =404;
    }

    # Public assets
    location /public/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# API Server
server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;

    ssl_certificate $SSL_DIR/fullchain.pem;
    ssl_certificate_key $SSL_DIR/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Proxy to TiltCheck API
    location / {
        proxy_pass http://localhost:4001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Dashboard
server {
    listen 443 ssl http2;
    server_name dashboard.$DOMAIN;

    ssl_certificate $SSL_DIR/fullchain.pem;
    ssl_certificate_key $SSL_DIR/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Proxy to Dashboard
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
    }
}

# Admin Panel (with additional security)
server {
    listen 443 ssl http2;
    server_name admin.$DOMAIN;

    ssl_certificate $SSL_DIR/fullchain.pem;
    ssl_certificate_key $SSL_DIR/privkey.pem;
    
    # Additional security for admin
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Proxy to Admin Dashboard
    location / {
        proxy_pass http://localhost:3001/admin;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
    }
}
EOF

    # Enable the site
    ln -sf /etc/nginx/sites-available/tiltcheck /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    log_and_echo "${GREEN}✅ Nginx configured${NC}"
}

# Function to obtain SSL certificate
obtain_ssl_certificate() {
    log_and_echo "${BLUE}🔒 Obtaining SSL certificate...${NC}"
    
    # Test nginx configuration
    nginx -t
    
    if [ $? -eq 0 ]; then
        # Temporarily start nginx without SSL
        systemctl reload nginx
        
        # Obtain certificate
        certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN -d dashboard.$DOMAIN -d admin.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        if [ $? -eq 0 ]; then
            log_and_echo "${GREEN}✅ SSL certificate obtained${NC}"
            
            # Set up auto-renewal
            crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -
            log_and_echo "${GREEN}✅ SSL auto-renewal configured${NC}"
        else
            log_and_echo "${YELLOW}⚠️  SSL certificate failed, continuing without SSL${NC}"
        fi
    else
        log_and_echo "${RED}❌ Nginx configuration error${NC}"
    fi
}

# Function to create PM2 configuration
create_pm2_config() {
    log_and_echo "${BLUE}⚙️ Creating PM2 configuration...${NC}"
    
    cat > $PROJECT_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'tiltcheck-api',
      script: 'bot.js',
      cwd: '$PROJECT_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      },
      error_file: '/var/log/tiltcheck/api-error.log',
      out_file: '/var/log/tiltcheck/api-out.log',
      log_file: '/var/log/tiltcheck/api-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    },
    {
      name: 'tiltcheck-dashboard',
      script: 'dashboard/ecosystemDashboard.js',
      cwd: '$PROJECT_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/tiltcheck/dashboard-error.log',
      out_file: '/var/log/tiltcheck/dashboard-out.log',
      log_file: '/var/log/tiltcheck/dashboard-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    },
    {
      name: 'tiltcheck-coach',
      script: 'tiltcheck_strategy_coach.js',
      cwd: '$PROJECT_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/tiltcheck/coach-error.log',
      out_file: '/var/log/tiltcheck/coach-out.log',
      log_file: '/var/log/tiltcheck/coach-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    }
  ]
};
EOF

    chown www-data:www-data $PROJECT_DIR/ecosystem.config.js
    log_and_echo "${GREEN}✅ PM2 configuration created${NC}"
}

# Function to create systemd service
create_systemd_service() {
    log_and_echo "${BLUE}⚙️ Creating systemd service...${NC}"
    
    cat > /etc/systemd/system/tiltcheck.service << EOF
[Unit]
Description=TiltCheck Ecosystem
After=network.target

[Service]
Type=forking
User=www-data
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/pm2 start ecosystem.config.js
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 stop all
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable tiltcheck.service
    
    log_and_echo "${GREEN}✅ Systemd service created${NC}"
}

# Function to start services
start_services() {
    log_and_echo "${BLUE}🚀 Starting TiltCheck services...${NC}"
    
    cd $PROJECT_DIR
    
    # Start with PM2
    sudo -u www-data pm2 start ecosystem.config.js
    sudo -u www-data pm2 save
    
    # Start systemd service
    systemctl start tiltcheck.service
    
    # Reload nginx
    systemctl reload nginx
    
    log_and_echo "${GREEN}✅ Services started${NC}"
}

# Function to create management scripts
create_management_scripts() {
    log_and_echo "${BLUE}📜 Creating management scripts...${NC}"
    
    # Status script
    cat > /usr/local/bin/tiltcheck-status << 'EOF'
#!/bin/bash
echo "🎮 TiltCheck Status Check"
echo "========================"
echo ""
echo "📊 PM2 Processes:"
pm2 list
echo ""
echo "🌐 Nginx Status:"
systemctl status nginx --no-pager -l
echo ""
echo "🔒 SSL Certificate Status:"
certbot certificates
echo ""
echo "🖥️ System Resources:"
free -h
df -h /
echo ""
echo "📱 Service URLs:"
echo "  Main Site: https://tiltcheck.it.com"
echo "  API: https://api.tiltcheck.it.com"
echo "  Dashboard: https://dashboard.tiltcheck.it.com"
echo "  Admin: https://admin.tiltcheck.it.com"
EOF

    # Restart script
    cat > /usr/local/bin/tiltcheck-restart << 'EOF'
#!/bin/bash
echo "🔄 Restarting TiltCheck services..."
pm2 restart all
systemctl reload nginx
echo "✅ TiltCheck restarted"
EOF

    # Logs script
    cat > /usr/local/bin/tiltcheck-logs << 'EOF'
#!/bin/bash
echo "📋 TiltCheck Logs"
echo "================="
echo ""
echo "Recent API logs:"
tail -n 20 /var/log/tiltcheck/api-combined.log
echo ""
echo "Recent Dashboard logs:"
tail -n 20 /var/log/tiltcheck/dashboard-combined.log
echo ""
echo "Recent Nginx logs:"
tail -n 20 /var/log/nginx/access.log
EOF

    # Make scripts executable
    chmod +x /usr/local/bin/tiltcheck-*
    
    log_and_echo "${GREEN}✅ Management scripts created${NC}"
}

# Function to display completion message
display_completion() {
    log_and_echo "${GREEN}🎉 TiltCheck VPS Deployment Complete!${NC}"
    echo ""
    echo -e "${CYAN}📱 Your TiltCheck ecosystem is now live at:${NC}"
    echo -e "${CYAN}   Main Site: https://$DOMAIN${NC}"
    echo -e "${CYAN}   API: https://api.$DOMAIN${NC}"
    echo -e "${CYAN}   Dashboard: https://dashboard.$DOMAIN${NC}"
    echo -e "${CYAN}   Admin: https://admin.$DOMAIN${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Management Commands:${NC}"
    echo -e "${YELLOW}   tiltcheck-status   → Check all services${NC}"
    echo -e "${YELLOW}   tiltcheck-restart  → Restart services${NC}"
    echo -e "${YELLOW}   tiltcheck-logs     → View recent logs${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
    echo -e "${YELLOW}   1. Update Discord tokens in $PROJECT_DIR/.env${NC}"
    echo -e "${YELLOW}   2. Configure DNS records to point to this server${NC}"
    echo -e "${YELLOW}   3. Test all services and endpoints${NC}"
    echo ""
    echo -e "${PURPLE}📋 Deployment log saved to: $LOG_FILE${NC}"
}

# Main execution
main() {
    check_root
    
    log_and_echo "${PURPLE}Starting TiltCheck VPS deployment...${NC}"
    
    update_system
    install_nodejs
    install_pm2
    install_nginx
    install_certbot
    create_directories
    configure_firewall
    clone_repository
    install_dependencies
    create_env_file
    configure_nginx
    obtain_ssl_certificate
    create_pm2_config
    create_systemd_service
    start_services
    create_management_scripts
    
    display_completion
}

# Run main function
main "$@"
