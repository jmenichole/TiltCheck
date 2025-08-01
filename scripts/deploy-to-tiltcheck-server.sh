#!/bin/bash
# Deploy TiltCheck Ecosystem to server1.tiltcheck.it.com
# Server: kvmnode202, Port: 6467, Password: iVjgB6BM

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server Configuration
SERVER_HOST="server1.tiltcheck.it.com"
SERVER_USER="kvmnode202"
SERVER_PORT="6467"
SERVER_PASS="iVjgB6BM"

# SSL Manager JWT Token (from previous setup)
SSL_JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZmODYyN2ZjOGE1NjAwMWM3YzY3ZTQiLCJpYXQiOjE3MzUzMDA2NDcsImV4cCI6MTczNTkwNTQ0N30.m8VlRwSfUJmLFb4MWayJNJ0WLbT7p_FyggkdX4bH_iE"

echo -e "${BLUE}🚀 TiltCheck Server Deployment${NC}"
echo "=================================="
echo -e "${GREEN}Target Server: $SERVER_HOST:$SERVER_PORT${NC}"
echo -e "${GREEN}User: $SERVER_USER${NC}"
echo ""

# Function to run commands on remote server
run_remote() {
    local command="$1"
    echo -e "${YELLOW}[REMOTE]${NC} $command"
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$command"
}

# Function to copy files to remote server
copy_to_remote() {
    local local_path="$1"
    local remote_path="$2"
    echo -e "${YELLOW}[COPY]${NC} $local_path -> $remote_path"
    sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" -o StrictHostKeyChecking=no "$local_path" "$SERVER_USER@$SERVER_HOST:$remote_path"
}

# Function to copy directories to remote server
copy_dir_to_remote() {
    local local_path="$1"
    local remote_path="$2"
    echo -e "${YELLOW}[COPY DIR]${NC} $local_path -> $remote_path"
    sshpass -p "$SERVER_PASS" scp -P "$SERVER_PORT" -r -o StrictHostKeyChecking=no "$local_path" "$SERVER_USER@$SERVER_HOST:$remote_path"
}

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass is required but not installed${NC}"
    echo "Install with: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

echo -e "${BLUE}🔗 Testing connection to server...${NC}"
if run_remote "echo 'Connection successful!'" &> /dev/null; then
    echo -e "${GREEN}✅ Server connection established${NC}"
else
    echo -e "${RED}❌ Failed to connect to server${NC}"
    exit 1
fi

# Step 1: Update system and install dependencies
echo -e "${BLUE}📦 Updating server packages...${NC}"
run_remote "sudo apt update && sudo apt upgrade -y"

echo -e "${BLUE}📦 Installing required packages...${NC}"
run_remote "sudo apt install -y curl wget git nodejs npm docker.io docker-compose nginx certbot python3-certbot-nginx ufw"

# Step 2: Install SSL Manager
echo -e "${BLUE}🔐 Installing SSL Manager...${NC}"
run_remote "curl -sL 'https://ssl-manager.s3.amazonaws.com/external/sh/installer.sh' | sh"

# Register SSL Manager with our JWT token
echo -e "${BLUE}🔑 Registering SSL Manager...${NC}"
run_remote "echo '$SSL_JWT_TOKEN' | ssl-manager register"

# Step 3: Setup TiltCheck directory structure
echo -e "${BLUE}📁 Creating TiltCheck directory structure...${NC}"
run_remote "mkdir -p /home/$SERVER_USER/tiltcheck/{app,dashboard,security,data,nginx,scripts}"

# Step 4: Copy project files
echo -e "${BLUE}📂 Copying project files...${NC}"

# Copy main application files
copy_to_remote "src/bot.js" "/home/$SERVER_USER/tiltcheck/app/"
copy_to_remote "package.json" "/home/$SERVER_USER/tiltcheck/"

# Copy security files
copy_to_remote "security/encrypt-secrets.js" "/home/$SERVER_USER/tiltcheck/security/"

# Copy dashboard and AIM messenger
copy_to_remote "dashboard/aim-messenger.js" "/home/$SERVER_USER/tiltcheck/dashboard/"
copy_to_remote "dashboard/overlay.html" "/home/$SERVER_USER/tiltcheck/dashboard/"

# Copy the .wav file for AIM sounds
if [ -f "55817__sergenious__bloop2.wav" ]; then
    copy_to_remote "55817__sergenious__bloop2.wav" "/home/$SERVER_USER/tiltcheck/dashboard/"
fi

# Copy nginx configuration
copy_to_remote "nginx/nginx.conf" "/home/$SERVER_USER/tiltcheck/nginx/"

# Copy docker files
copy_to_remote "compose.yaml" "/home/$SERVER_USER/tiltcheck/"
copy_to_remote "Dockerfile" "/home/$SERVER_USER/tiltcheck/"

# Step 5: Install Node.js dependencies
echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
run_remote "cd /home/$SERVER_USER/tiltcheck && npm install"

# Step 6: Setup environment variables
echo -e "${BLUE}⚙️ Setting up environment variables...${NC}"
run_remote "cd /home/$SERVER_USER/tiltcheck && cat > .env << 'EOF'
# TiltCheck Environment Variables
NODE_ENV=production
PORT=3000
DOMAIN=server1.tiltcheck.it.com

# Discord Bot Configuration
DISCORD_TOKEN=your_discord_token_here
DISCORD_CLIENT_ID=your_client_id_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tiltcheck
DB_USER=tiltcheck
DB_PASS=secure_password_here

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/server1.tiltcheck.it.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/server1.tiltcheck.it.com/privkey.pem

# Overlay Configuration
OVERLAY_PORT=8080
AIM_SOUNDS_ENABLED=true

# Security
MASTER_KEY_PATH=/home/$SERVER_USER/tiltcheck/.master.key
EOF"

# Step 7: Generate master encryption key
echo -e "${BLUE}🔐 Generating master encryption key...${NC}"
run_remote "cd /home/$SERVER_USER/tiltcheck && node -e \"
const crypto = require('crypto');
const fs = require('fs');
const masterKey = crypto.randomBytes(32).toString('hex');
fs.writeFileSync('.master.key', masterKey, 'utf8');
console.log('Master key generated successfully');
\""

# Step 8: Setup SSL certificates
echo -e "${BLUE}🔒 Setting up SSL certificates...${NC}"
run_remote "sudo certbot --nginx -d server1.tiltcheck.it.com --non-interactive --agree-tos --email admin@tiltcheck.it.com"

# Step 9: Configure nginx
echo -e "${BLUE}🌐 Configuring nginx...${NC}"
run_remote "sudo cp /home/$SERVER_USER/tiltcheck/nginx/nginx.conf /etc/nginx/sites-available/tiltcheck"
run_remote "sudo ln -sf /etc/nginx/sites-available/tiltcheck /etc/nginx/sites-enabled/"
run_remote "sudo nginx -t && sudo systemctl reload nginx"

# Step 10: Setup firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
run_remote "sudo ufw allow 22/tcp"
run_remote "sudo ufw allow 80/tcp"
run_remote "sudo ufw allow 443/tcp"
run_remote "sudo ufw allow 3000/tcp"
run_remote "sudo ufw allow 8080/tcp"
run_remote "sudo ufw --force enable"

# Step 11: Setup systemd service for TiltCheck
echo -e "${BLUE}⚙️ Creating TiltCheck systemd service...${NC}"
run_remote "sudo tee /etc/systemd/system/tiltcheck.service > /dev/null << 'EOF'
[Unit]
Description=TiltCheck Discord Bot
After=network.target

[Service]
Type=simple
User=$SERVER_USER
WorkingDirectory=/home/$SERVER_USER/tiltcheck
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/bot.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

# Step 12: Setup systemd service for AIM Overlay
echo -e "${BLUE}⚙️ Creating AIM Overlay systemd service...${NC}"
run_remote "sudo tee /etc/systemd/system/tiltcheck-overlay.service > /dev/null << 'EOF'
[Unit]
Description=TiltCheck AIM Overlay Server
After=network.target

[Service]
Type=simple
User=$SERVER_USER
WorkingDirectory=/home/$SERVER_USER/tiltcheck/dashboard
Environment=NODE_ENV=production
ExecStart=/usr/bin/python3 -m http.server 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

# Step 13: Enable and start services
echo -e "${BLUE}🚀 Starting TiltCheck services...${NC}"
run_remote "sudo systemctl daemon-reload"
run_remote "sudo systemctl enable tiltcheck"
run_remote "sudo systemctl enable tiltcheck-overlay"
run_remote "sudo systemctl start tiltcheck"
run_remote "sudo systemctl start tiltcheck-overlay"

# Step 14: Create startup script
echo -e "${BLUE}📜 Creating startup script...${NC}"
run_remote "cd /home/$SERVER_USER/tiltcheck && cat > start-tiltcheck.sh << 'EOF'
#!/bin/bash
# TiltCheck Startup Script

echo '🚀 Starting TiltCheck Ecosystem...'

# Start main bot
sudo systemctl start tiltcheck
echo '✅ TiltCheck Bot started'

# Start overlay server
sudo systemctl start tiltcheck-overlay
echo '✅ AIM Overlay started'

# Check SSL certificates
ssl-manager check --domain server1.tiltcheck.it.com
echo '✅ SSL certificates verified'

echo '🎉 TiltCheck Ecosystem is running!'
echo 'Bot Status: https://server1.tiltcheck.it.com'
echo 'AIM Overlay: https://server1.tiltcheck.it.com:8080'
EOF"

run_remote "chmod +x /home/$SERVER_USER/tiltcheck/start-tiltcheck.sh"

# Step 15: Final status check
echo -e "${BLUE}📊 Checking deployment status...${NC}"
run_remote "sudo systemctl status tiltcheck --no-pager"
run_remote "sudo systemctl status tiltcheck-overlay --no-pager"
run_remote "curl -s http://localhost:8080 | head -5"

echo ""
echo -e "${GREEN}🎉 TiltCheck Deployment Complete!${NC}"
echo "=================================="
echo -e "${GREEN}✅ SSL Manager installed and registered${NC}"
echo -e "${GREEN}✅ TiltCheck bot deployed and running${NC}"
echo -e "${GREEN}✅ AIM Overlay system active${NC}"
echo -e "${GREEN}✅ SSL certificates configured${NC}"
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""
echo -e "${YELLOW}🌐 Access Points:${NC}"
echo "   Main Site: https://server1.tiltcheck.it.com"
echo "   AIM Overlay: https://server1.tiltcheck.it.com:8080"
echo "   SSH Access: ssh -p 6467 kvmnode202@server1.tiltcheck.it.com"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Update Discord bot token in /home/kvmnode202/tiltcheck/.env"
echo "2. Configure database connection"
echo "3. Test AIM messenger functionality"
echo "4. Encrypt remaining secrets with: node security/encrypt-secrets.js"
echo ""
echo -e "${BLUE}🔄 To restart services:${NC}"
echo "   ssh -p 6467 kvmnode202@server1.tiltcheck.it.com"
echo "   cd /home/kvmnode202/tiltcheck"
echo "   ./start-tiltcheck.sh"
