#!/bin/bash

echo "🧪 TrapHouse Comprehensive Beta Testing Environment - Deploy"
echo "=========================================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BETA_PORT=3333
BETA_USER_ID="115681066538237953"
BETA_SECRET_ROLE="TRAPHOUSE_BETA_VERIFIED_2025"
BETA_INVITE_CODE="traphouse-beta-exclusive"

echo -e "${BLUE}🎯 Configuration:${NC}"
echo "   Beta Port: $BETA_PORT"
echo "   Verified Beta User: $BETA_USER_ID"
echo "   Secret Role: $BETA_SECRET_ROLE"
echo "   Invite Code: $BETA_INVITE_CODE"
echo ""

# Check if required files exist
echo -e "${BLUE}📋 Checking beta testing setup...${NC}"
if [ ! -f "beta-testing-server.js" ]; then
    echo -e "${RED}❌ beta-testing-server.js not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Beta testing files verified${NC}"
echo ""

# Create directories for comprehensive beta environment
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p beta/{pages,docs,downloads,installer}
mkdir -p logs/beta
mkdir -p dashboard/beta-assets
mkdir -p public/beta

echo -e "${GREEN}✅ Directory structure created${NC}"
echo ""

# Stop any existing processes
echo -e "${YELLOW}🔄 Stopping existing processes...${NC}"
pkill -f "beta-testing-server.js" 2>/dev/null || true
pkill -f "index.js" 2>/dev/null || true
sleep 3

# Check if port is available
if lsof -i :$BETA_PORT >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $BETA_PORT is in use, attempting to free it...${NC}"
    lsof -ti :$BETA_PORT | xargs kill -9 2>/dev/null || true
    sleep 3
fi

# Install/update dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create logs directory
mkdir -p logs/beta
mkdir -p logs/comprehensive
mkdir -p dashboard/downloads

# Create comprehensive beta environment config
echo -e "${BLUE}🔧 Creating comprehensive beta configuration...${NC}"
cat > .env.beta << EOF
# TrapHouse Beta Testing Configuration
NODE_ENV=beta-testing
PORT=${BETA_PORT}
BETA_MODE=true

# Beta Overrides
BYPASS_PAYMENTS=true
BYPASS_ROLES=true
BYPASS_VERIFICATION=true
ALLOW_ALL_COMMANDS=true

# Session Configuration
BETA_MAX_USERS=50
BETA_SESSION_DURATION=86400000
BETA_TESTING_ENABLED=true

# Discord Configuration
DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
DISCORD_GUILD_ID=${DISCORD_GUILD_ID}

# Beta User Verification
BETA_VERIFIED_USER_ID=${BETA_USER_ID}
BETA_SECRET_ROLE=${BETA_SECRET_ROLE}
BETA_INVITE_CODE=${BETA_INVITE_CODE}

# URLs
BETA_BASE_URL=http://localhost:${BETA_PORT}
BETA_INVITE_URL=http://localhost:${BETA_PORT}/beta/invite
BETA_DOWNLOAD_URL=http://localhost:${BETA_PORT}/beta/download
BETA_DOCS_URL=http://localhost:${BETA_PORT}/beta/docs

# Security
BETA_API_SECRET=traphouse_beta_2025_${RANDOM}
BETA_SESSION_SECRET=beta_session_${RANDOM}
EOF

echo -e "${GREEN}✅ Beta configuration created${NC}"
echo ""

echo -e "${BLUE}🚀 Starting Comprehensive Beta Testing Server...${NC}"
echo "   Port: $BETA_PORT"
echo "   Features: All unlocked (payment bypass active)"
echo "   Verified User: $BETA_USER_ID"
echo ""

# Create comprehensive start script
cat > start-beta-comprehensive.sh << 'EOF'
#!/bin/bash

echo "🧪 TrapHouse Comprehensive Beta Environment - Auto-Restart"
echo "========================================================"

source .env.beta
restart_count=0
max_restarts=10

while [ $restart_count -lt $max_restarts ]; do
    echo "$(date): [Attempt $((restart_count + 1))] Starting comprehensive beta server..."
    
    # Start the comprehensive beta server
    node beta-testing-server.js
    exit_code=$?
    
    # If exit code is 0, server was stopped gracefully
    if [ $exit_code -eq 0 ]; then
        echo "$(date): Beta server stopped gracefully"
        break
    fi
    
    # If server crashed, increment restart count
    restart_count=$((restart_count + 1))
    echo "$(date): Beta server crashed (exit code: $exit_code), restarting in 5 seconds..."
    sleep 5
done

if [ $restart_count -eq $max_restarts ]; then
    echo "$(date): Maximum restart attempts reached. Check logs for issues."
    exit 1
fi
EOF

chmod +x start-beta-comprehensive.sh

echo -e "${GREEN}🎯 Comprehensive Beta Testing Environment Ready!${NC}"
echo ""
echo -e "${BLUE}📊 Access Points:${NC}"
echo "   🌐 Beta Invite Page: http://localhost:$BETA_PORT/beta/invite"
echo "   📱 Download Page: http://localhost:$BETA_PORT/beta/download"
echo "   📚 Documentation: http://localhost:$BETA_PORT/beta/docs"
echo "   🎯 AIM Overlay: http://localhost:$BETA_PORT/aim-overlay"
echo "   ❤️  Health Check: http://localhost:$BETA_PORT/health"
echo ""
echo -e "${BLUE}🔐 Verified Beta User:${NC}"
echo "   Discord ID: $BETA_USER_ID"
echo "   Secret Role: $BETA_SECRET_ROLE"
echo "   Invite Code: $BETA_INVITE_CODE"
echo ""
echo -e "${BLUE}🧪 Discord Commands:${NC}"
echo "   !beta-invite - Get exclusive invite link"
echo "   !beta-verify - Verify beta user status"
echo "   !beta-download - Download links"
echo "   !beta-docs - View documentation"
echo ""
echo -e "${BLUE}💰 Requirements:${NC}"
echo "   ✅ Discord ID verification (auto for $BETA_USER_ID)"
echo "   ✅ Crypto wallet funding (for tip features)"
echo "   ❌ NO payment verification needed"
echo "   ❌ NO role requirements"
echo ""
echo -e "${BLUE}🔧 Starting Options:${NC}"
echo ""
echo "1️⃣  START WITH AUTO-RESTART (Recommended):"
echo "   ./start-beta-comprehensive.sh"
echo ""
echo "2️⃣  START DIRECTLY:"
echo "   node beta-testing-server.js"
echo ""
echo "3️⃣  START IN BACKGROUND:"
echo "   nohup node beta-testing-server.js > logs/beta/comprehensive.log 2>&1 &"
echo ""

# Prompt user for start method
read -p "🚀 Choose start method (1-3) or press Enter for auto-restart: " choice

case $choice in
    2)
        echo "Starting comprehensive beta server directly..."
        source .env.beta
        node beta-testing-server.js
        ;;
    3)
        echo "Starting comprehensive beta server in background..."
        source .env.beta
        nohup node beta-testing-server.js > logs/beta/comprehensive.log 2>&1 &
        echo "✅ Beta server started in background (PID: $!)"
        echo "📋 View logs: tail -f logs/beta/comprehensive.log"
        ;;
    *)
        echo "Starting with auto-restart..."
        ./start-beta-comprehensive.sh
        ;;
esac

echo ""
echo -e "${GREEN}🎉 TrapHouse Comprehensive Beta Testing Environment Deployed!${NC}"
echo ""
echo -e "${BLUE}📋 What to test:${NC}"
echo "   • Exclusive beta user verification system"
echo "   • Custom invite/download pages"
echo "   • Complete documentation system"
echo "   • All Discord commands work without restrictions"
echo "   • Crypto wallet creation and management"
echo "   • TiltCheck monitoring (no verification required)"
echo "   • AIM overlay dashboard functionality"
echo "   • Cross-chain tipping (requires funded wallets)"
echo ""
echo -e "${BLUE}🔗 Quick Access:${NC}"
echo "   Invite: http://localhost:$BETA_PORT/beta/invite"
echo "   Download: http://localhost:$BETA_PORT/beta/download"
echo "   Docs: http://localhost:$BETA_PORT/beta/docs"
echo ""
echo -e "${YELLOW}💡 Need help? Visit the documentation page or use !beta-help in Discord!${NC}"
