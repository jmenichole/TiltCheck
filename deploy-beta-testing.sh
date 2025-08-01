#!/bin/bash

echo "🧪 TrapHouse Beta Testing Environment - Deploy & Start"
echo "======================================================"
echo ""

# Check if required files exist
echo "📋 Checking beta testing setup..."
if [ ! -f "beta-testing-server.js" ]; then
    echo "❌ beta-testing-server.js not found!"
    exit 1
fi

if [ ! -f "dashboard/beta-testing-dashboard.html" ]; then
    echo "❌ Beta dashboard not found!"
    exit 1
fi

if [ ! -f "dashboard/overlay.html" ]; then
    echo "⚠️  AIM overlay not found, will create basic version..."
fi

echo "✅ Beta testing files verified"
echo ""

# Create directory for beta testing if it doesn't exist
mkdir -p logs/beta

# Check environment variables
echo "🔧 Checking environment configuration..."
if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo "❌ DISCORD_BOT_TOKEN not configured!"
    echo "   Add your bot token to .env file"
    exit 1
fi

echo "✅ Discord bot token configured"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready"
echo ""

# Kill any existing beta testing processes
echo "🔄 Stopping existing beta processes..."
pkill -f "beta-testing-server.js" 2>/dev/null || true
sleep 2

# Check if port 3333 is available
if lsof -i :3333 >/dev/null 2>&1; then
    echo "⚠️  Port 3333 is in use, attempting to free it..."
    lsof -ti :3333 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo "✅ Port 3333 available"
echo ""

# Start the beta testing server
echo "🚀 Starting TrapHouse Beta Testing Server..."
echo "   Port: 3333"
echo "   Mode: Beta Testing"
echo "   Features: All unlocked (except crypto funding requirement)"
echo ""

# Create start script with auto-restart
cat > start-beta-server.sh << 'EOF'
#!/bin/bash

echo "🧪 Beta Testing Server - Auto-Restart Mode"
echo "=========================================="

restart_count=0
max_restarts=5

while [ $restart_count -lt $max_restarts ]; do
    echo "$(date): [Attempt $((restart_count + 1))] Starting beta server..."
    
    # Start the beta server
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
    echo "$(date): Maximum restart attempts reached. Please check logs."
    exit 1
fi
EOF

chmod +x start-beta-server.sh

echo "🎯 Beta Testing Environment Ready!"
echo ""
echo "📊 Access Points:"
echo "   🌐 Beta Dashboard: http://localhost:3333/beta"
echo "   🎯 AIM Overlay: http://localhost:3333/aim-overlay"
echo "   ❤️  Health Check: http://localhost:3333/health"
echo ""
echo "🧪 Discord Commands:"
echo "   !beta-register - Join beta testing program"
echo "   !beta-help - View all available commands"
echo "   !beta-status - Check your testing session"
echo ""
echo "💰 Requirements:"
echo "   ✅ Discord account (for commands)"
echo "   ✅ Crypto wallet funding (for tip features)"
echo "   ❌ NO payment verification needed"
echo "   ❌ NO role requirements"
echo ""
echo "🔧 Starting Options:"
echo ""
echo "1️⃣  START WITH AUTO-RESTART (Recommended):"
echo "   ./start-beta-server.sh"
echo ""
echo "2️⃣  START DIRECTLY:"
echo "   node beta-testing-server.js"
echo ""
echo "3️⃣  START IN BACKGROUND:"
echo "   nohup node beta-testing-server.js > logs/beta/server.log 2>&1 &"
echo ""

# Prompt user for start method
read -p "🚀 Choose start method (1-3) or press Enter for auto-restart: " choice

case $choice in
    2)
        echo "Starting beta server directly..."
        node beta-testing-server.js
        ;;
    3)
        echo "Starting beta server in background..."
        nohup node beta-testing-server.js > logs/beta/server.log 2>&1 &
        echo "✅ Beta server started in background (PID: $!)"
        echo "📋 View logs: tail -f logs/beta/server.log"
        ;;
    *)
        echo "Starting with auto-restart..."
        ./start-beta-server.sh
        ;;
esac

echo ""
echo "🎉 TrapHouse Beta Testing Environment Deployed!"
echo ""
echo "📋 What to test:"
echo "   • All Discord commands work without restrictions"
echo "   • Crypto wallet creation and management"
echo "   • TiltCheck monitoring (no verification required)"
echo "   • AIM overlay dashboard functionality"
echo "   • Cross-chain tipping (requires funded wallets)"
echo ""
echo "🔗 Quick Access:"
echo "   Dashboard: http://localhost:3333/beta"
echo "   Overlay: http://localhost:3333/aim-overlay"
echo ""
echo "💡 Need help? Use !beta-help in Discord or visit the dashboard!"
