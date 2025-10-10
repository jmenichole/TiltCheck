#!/bin/bash

# 🚀 TrapHouse Discord Bot - Quick Start Script
# This script starts all bot services in the correct order

echo "🎯 Starting TrapHouse Discord Bot Ecosystem..."
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create .env file with required variables."
    echo "📋 See START_BOT_GUIDE.md for environment setup instructions."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🔧 Starting services..."

# Start main Discord bot
echo "🤖 Starting main Discord bot..."
node bot.js > logs/bot.log 2>&1 &
BOT_PID=$!
echo "   ✅ Bot started (PID: $BOT_PID)"

# Wait a moment for bot to initialize
sleep 2

# Start beta testing server
echo "🧪 Starting beta testing server (Port 3333)..."
node beta-testing-server.js > logs/beta-server.log 2>&1 &
BETA_PID=$!
echo "   ✅ Beta server started (PID: $BETA_PID)"

# Start GitHub webhook server
echo "🐙 Starting GitHub webhook server (Port 3001)..."
node github-webhook-server.js > logs/github-server.log 2>&1 &
GITHUB_PID=$!
echo "   ✅ GitHub server started (PID: $GITHUB_PID)"

# Start CollectClock OAuth handler
echo "⏰ Starting CollectClock OAuth handler (Port 3002)..."
node collectClockOAuthHandler.js > logs/collectclock.log 2>&1 &
COLLECTCLOCK_PID=$!
echo "   ✅ CollectClock handler started (PID: $COLLECTCLOCK_PID)"

# Start Degens card game bot
echo "🎮 Starting Degens card game bot..."
node degens_bot.js > logs/degens-bot.log 2>&1 &
DEGENS_PID=$!
echo "   ✅ Degens bot started (PID: $DEGENS_PID)"

# Start TiltCheck API server with verified nodes
if [ -d "tiltcheck-server/api" ]; then
    echo "🎯 Starting TiltCheck API with verified node confirmations..."
    cd tiltcheck-server/api
    node server.js > ../../logs/tiltcheck-api.log 2>&1 &
    TILTCHECK_PID=$!
    cd ../..
    echo "   ✅ TiltCheck API started (PID: $TILTCHECK_PID)"
    echo "   🔗 Local: http://localhost:4001"
    echo "   🌐 Production: https://tiltcheck.it.com"
else
    echo "⚠️  TiltCheck server not found. Run ./setup-tiltcheck-domain.sh first"
fi

# Wait for services to fully initialize
echo "⏳ Waiting for services to initialize..."
sleep 5

echo "🔍 Checking service health..."

# Check health of each service
check_health() {
    local url=$1
    local service_name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "   ✅ $service_name: Healthy"
        return 0
    else
        echo "   ❌ $service_name: Not responding"
        return 1
    fi
}

# Health check URLs
check_health "http://localhost:3333/health" "Beta Testing Server"
check_health "http://localhost:3001/health" "GitHub Webhook Server" 
check_health "http://localhost:3002/auth/collectclock/health" "CollectClock OAuth Handler"
if [ -d "tiltcheck-server/api" ]; then
    check_health "http://localhost:4001/api/health" "TiltCheck API (Verified Nodes)"
fi

echo ""
echo "🎯 TrapHouse Discord Bot Ecosystem Status:"
echo "=========================================="
echo "🤖 Main Bot PID: $BOT_PID"
echo "🧪 Beta Server PID: $BETA_PID (http://localhost:3333/beta)"
echo "🐙 GitHub Server PID: $GITHUB_PID (http://localhost:3001/health)"
echo "⏰ CollectClock PID: $COLLECTCLOCK_PID (http://localhost:3002)"
echo "🎮 Degens Bot PID: $DEGENS_PID"
if [ ! -z "$TILTCHECK_PID" ]; then
    echo "🎯 TiltCheck API PID: $TILTCHECK_PID (http://localhost:4001)"
    echo "   ✅ Verified Node Confirmations: Active"
    echo "   🔗 Production URL: https://tiltcheck.it.com"
fi
echo ""
echo "📊 Available Dashboards:"
echo "   • Beta Dashboard: http://localhost:3333/beta"
echo "   • AIM Overlay: http://localhost:3333/aim-overlay"
echo "   • Analytics: http://localhost:3333/analytics"
echo "   • Dev Tools: http://localhost:3333/dev-tools"
if [ ! -z "$TILTCHECK_PID" ]; then
    echo "   • TiltCheck Main: http://localhost:4001"
    echo "   • TiltCheck Health: http://localhost:4001/api/health"
    echo "   • Node Verification: http://localhost:4001/api/verify"
fi
echo ""
echo "📋 Discord Bot Installation Links:"
echo "   • Main Bot: https://discord.com/api/oauth2/authorize?client_id=1354450590813655142&permissions=274881367104&scope=bot%20applications.commands"
echo "   • Beta Bot: https://discord.com/api/oauth2/authorize?client_id=1373784722718720090&permissions=274881367104&scope=bot%20applications.commands"
echo "   • Degens Bot: https://discord.com/api/oauth2/authorize?client_id=1376113587025739807&permissions=274881367104&scope=bot%20applications.commands"
echo ""
echo "📝 Logs are being written to:"
echo "   • Main Bot: logs/bot.log"
echo "   • Beta Server: logs/beta-server.log"
echo "   • GitHub Server: logs/github-server.log"
echo "   • CollectClock: logs/collectclock.log"
echo "   • Degens Bot: logs/degens-bot.log"
echo ""
echo "🔧 To stop all services, run: ./stop_bot.sh"
echo "📖 For detailed setup instructions, see: START_BOT_GUIDE.md"
echo ""
echo "🚀 TrapHouse Discord Bot Ecosystem is now running!"

# Save PIDs to file for stop script
echo "$BOT_PID" > .bot_pids
echo "$BETA_PID" >> .bot_pids
echo "$GITHUB_PID" >> .bot_pids
echo "$COLLECTCLOCK_PID" >> .bot_pids
echo "$DEGENS_PID" >> .bot_pids
if [ ! -z "$TILTCHECK_PID" ]; then
    echo "$TILTCHECK_PID" >> .bot_pids
fi

# Keep script running to monitor
echo "💡 Press Ctrl+C to view logs or use './stop_bot.sh' to stop all services"
echo "⏳ Monitoring services... (logs updating in real-time)"

# Monitor logs in real-time
tail -f logs/*.log
