#!/bin/bash
# TiltCheck VPS Deployment with Password Change
# Server: 203.161.58.173, User: root, Temp Password: VvKugq08S7o1z5J1ZE

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server Configuration
SERVER_IP="203.161.58.173"
SERVER_USER="root"
SERVER_PORT="22"
TEMP_PASS="VvKugq08S7o1z5J1ZE"

# SSL Manager JWT Token
SSL_JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZmODYyN2ZjOGE1NjAwMWM3YzY3ZTQiLCJpYXQiOjE3MzUzMDA2NDcsImV4cCI6MTczNTkwNTQ0N30.m8VlRwSfUJmLFb4MWayJNJ0WLbT7p_FyggkdX4bH_iE"

echo -e "${BLUE}🚀 TiltCheck VPS Deployment${NC}"
echo "=============================="
echo -e "${GREEN}Server: $SERVER_IP:$SERVER_PORT${NC}"
echo -e "${GREEN}User: $SERVER_USER${NC}"
echo -e "${YELLOW}⚠️  Password is temporary and will be changed on login${NC}"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass is required but not installed${NC}"
    echo "Install with: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

echo -e "${BLUE}🔗 Testing connection to server...${NC}"
if sshpass -p "$TEMP_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "echo 'Connection test successful'" &> /dev/null; then
    echo -e "${GREEN}✅ Server connection established${NC}"
else
    echo -e "${RED}❌ Failed to connect to server${NC}"
    echo "This might be because:"
    echo "1. Password has already been changed"
    echo "2. Server requires interactive password change"
    echo "3. Network connectivity issue"
    echo ""
    echo "Please connect manually first:"
    echo "ssh root@203.161.58.173"
    echo "Then run this script again after password change"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 IMPORTANT: Password Change Required${NC}"
echo "The server requires password change on first login."
echo "This script will help you through the process."
echo ""

read -p "Have you already changed the password? (y/n): " password_changed

if [ "$password_changed" = "n" ] || [ "$password_changed" = "N" ]; then
    echo ""
    echo -e "${YELLOW}🔑 Password Change Process:${NC}"
    echo "1. You'll be prompted to enter the temporary password"
    echo "2. Server will ask you to change the password"
    echo "3. Choose a strong new password"
    echo "4. Remember the new password for deployment"
    echo ""
    echo "Connecting to server for password change..."
    echo "ssh root@$SERVER_IP"
    
    # Interactive SSH for password change
    ssh root@$SERVER_IP
    
    echo ""
    echo "After changing your password, please run this script again."
    exit 0
fi

# If password has been changed, get the new password
echo ""
read -s -p "Enter your new server password: " NEW_PASS
echo ""

# Function to run commands on remote server with new password
run_remote() {
    local command="$1"
    echo -e "${YELLOW}[REMOTE]${NC} $command"
    sshpass -p "$NEW_PASS" ssh -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$command"
}

# Test new password
echo -e "${BLUE}🔐 Testing new password...${NC}"
if run_remote "echo 'New password works!'" &> /dev/null; then
    echo -e "${GREEN}✅ New password confirmed${NC}"
else
    echo -e "${RED}❌ New password doesn't work${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Starting TiltCheck Deployment...${NC}"

# Step 1: Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
run_remote "apt update && apt upgrade -y"

# Step 2: Install dependencies
echo -e "${BLUE}📦 Installing required packages...${NC}"
run_remote "apt install -y curl wget git nodejs npm nginx certbot python3-certbot-nginx ufw htop"

# Step 3: Install SSL Manager
echo -e "${BLUE}🔐 Installing SSL Manager...${NC}"
run_remote "curl -sL 'https://ssl-manager.s3.amazonaws.com/external/sh/installer.sh' | sh"

# Step 4: Register SSL Manager
echo -e "${BLUE}🔑 Registering SSL Manager...${NC}"
run_remote "echo '$SSL_JWT_TOKEN' | ssl-manager register"

# Step 5: Setup TiltCheck directory
echo -e "${BLUE}📁 Creating TiltCheck directory structure...${NC}"
run_remote "mkdir -p /root/tiltcheck/{dashboard,security,sounds}"

# Step 6: Setup environment
echo -e "${BLUE}⚙️ Setting up environment...${NC}"
run_remote "cd /root/tiltcheck && cat > .env << 'EOF'
# TiltCheck Environment Variables
NODE_ENV=production
PORT=3000
DOMAIN=tiltcheck.it.com
SERVER_IP=203.161.58.173

# Discord Bot Configuration
DISCORD_TOKEN=your_discord_token_here
DISCORD_CLIENT_ID=your_client_id_here

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/tiltcheck.it.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/tiltcheck.it.com/privkey.pem

# Overlay Configuration
OVERLAY_PORT=8080
AIM_SOUNDS_ENABLED=true

# Security
MASTER_KEY_PATH=/root/tiltcheck/.master.key
EOF"

# Step 7: Generate master encryption key
echo -e "${BLUE}🔐 Generating master encryption key...${NC}"
run_remote "cd /root/tiltcheck && node -e \"
const crypto = require('crypto');
const fs = require('fs');
const masterKey = crypto.randomBytes(32).toString('hex');
fs.writeFileSync('.master.key', masterKey, 'utf8');
console.log('Master key generated successfully');
\""

# Step 8: Setup DNS (instructions)
echo ""
echo -e "${BLUE}🌐 DNS Configuration Required${NC}"
echo "=============================="
echo "Your server IP is: $SERVER_IP"
echo ""
echo "Update your DNS records in Namecheap:"
echo "1. Login to Namecheap"
echo "2. Go to Domain List → tiltcheck.it.com → Manage"
echo "3. Switch from 'Namecheap Hosting' to 'Namecheap BasicDNS'"
echo "4. Add these DNS records:"
echo ""
echo "   A Record: @        → $SERVER_IP"
echo "   A Record: server1  → $SERVER_IP"
echo "   A Record: overlay  → $SERVER_IP"
echo "   CNAME:    www      → tiltcheck.it.com"
echo ""

# Step 9: Setup firewall
echo -e "${BLUE}🔥 Configuring firewall...${NC}"
run_remote "ufw allow 22/tcp"
run_remote "ufw allow 80/tcp"
run_remote "ufw allow 443/tcp"
run_remote "ufw allow 8080/tcp"
run_remote "ufw --force enable"

# Step 10: Create deployment script for later use
echo -e "${BLUE}📜 Creating deployment scripts...${NC}"
run_remote "cd /root/tiltcheck && cat > deploy-tiltcheck.sh << 'EOF'
#!/bin/bash
# TiltCheck Application Deployment

echo '🚀 Deploying TiltCheck Application...'

# Install Node.js dependencies
npm install

# Setup SSL certificates (after DNS is configured)
certbot --nginx -d tiltcheck.it.com -d server1.tiltcheck.it.com -d overlay.tiltcheck.it.com --non-interactive --agree-tos --email admin@tiltcheck.it.com

# Start overlay server
cd dashboard
python3 -m http.server 8080 &

echo '✅ TiltCheck deployment complete!'
echo 'Configure DNS first, then run: ./deploy-tiltcheck.sh'
EOF"

run_remote "chmod +x /root/tiltcheck/deploy-tiltcheck.sh"

# Step 11: Create management script
run_remote "cd /root/tiltcheck && cat > manage.sh << 'EOF'
#!/bin/bash
case \$1 in
    'start')
        echo 'Starting TiltCheck services...'
        cd dashboard && python3 -m http.server 8080 &
        ;;
    'stop')
        echo 'Stopping TiltCheck services...'
        pkill -f 'python3 -m http.server'
        ;;
    'status')
        echo 'TiltCheck Status:'
        ps aux | grep 'python3 -m http.server'
        ;;
    'logs')
        echo 'System logs:'
        tail -20 /var/log/syslog
        ;;
    *)
        echo 'Usage: ./manage.sh {start|stop|status|logs}'
        ;;
esac
EOF"

run_remote "chmod +x /root/tiltcheck/manage.sh"

echo ""
echo -e "${GREEN}🎉 TiltCheck Server Setup Complete!${NC}"
echo "===================================="
echo ""
echo -e "${GREEN}✅ Server prepared and secured${NC}"
echo -e "${GREEN}✅ SSL Manager installed and registered${NC}"
echo -e "${GREEN}✅ TiltCheck directory structure created${NC}"
echo -e "${GREEN}✅ Environment configured${NC}"
echo -e "${GREEN}✅ Firewall configured${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Configure DNS records (instructions above)"
echo "2. Wait 5-30 minutes for DNS propagation"
echo "3. SSH to server and run: ./tiltcheck/deploy-tiltcheck.sh"
echo "4. Upload your TiltCheck files (AIM messenger, bot, etc.)"
echo ""
echo -e "${BLUE}🔗 Server Access:${NC}"
echo "   SSH: ssh root@$SERVER_IP"
echo "   TiltCheck Dir: /root/tiltcheck/"
echo ""
echo -e "${YELLOW}⚠️  Remember to update Discord bot token in .env file${NC}"
