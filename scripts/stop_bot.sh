#!/bin/bash

# 🛑 TrapHouse Discord Bot - Stop All Services Script

echo "🛑 Stopping TrapHouse Discord Bot Ecosystem..."
echo "=============================================="

# Check if PIDs file exists
if [ ! -f .bot_pids ]; then
    echo "❌ No PID file found. Services may not be running or were started manually."
    echo "🔍 Searching for running Node.js processes..."
    
    # Find and kill Node.js processes related to the bot
    pkill -f "node bot.js"
    pkill -f "node beta-testing-server.js"
    pkill -f "node github-webhook-server.js"
    pkill -f "node collectClockOAuthHandler.js"
    pkill -f "node degens_bot.js"
    
    echo "✅ Attempted to stop all related Node.js processes"
    exit 0
fi

# Read PIDs and stop each service
echo "📋 Reading saved process IDs..."

while IFS= read -r pid; do
    if [ ! -z "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        echo "🔄 Stopping process $pid..."
        kill "$pid"
        
        # Wait for graceful shutdown
        sleep 2
        
        # Force kill if still running
        if kill -0 "$pid" 2>/dev/null; then
            echo "   🔨 Force stopping process $pid..."
            kill -9 "$pid"
        fi
        
        echo "   ✅ Process $pid stopped"
    else
        echo "   ⚠️  Process $pid not found (may have already stopped)"
    fi
done < .bot_pids

# Clean up PID file
rm -f .bot_pids

echo ""
echo "🧹 Cleanup complete:"

# Verify no processes are still running
echo "🔍 Checking for remaining processes..."

check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "   ⚠️  Port $port ($service_name) still in use"
        echo "      🔨 Force killing process on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
    else
        echo "   ✅ Port $port ($service_name) is free"
    fi
}

check_port 3000 "Main Bot"
check_port 3333 "Beta Server"
check_port 3001 "GitHub Server"
check_port 3002 "CollectClock Handler"

echo ""
echo "📊 Final Status Check:"

# Check if services are actually stopped
if curl -s -f "http://localhost:3333/health" > /dev/null 2>&1; then
    echo "   ⚠️  Beta server still responding - attempting additional cleanup..."
    pkill -f "beta-testing-server"
else
    echo "   ✅ Beta Testing Server: Stopped"
fi

if curl -s -f "http://localhost:3001/health" > /dev/null 2>&1; then
    echo "   ⚠️  GitHub server still responding - attempting additional cleanup..."
    pkill -f "github-webhook-server"
else
    echo "   ✅ GitHub Webhook Server: Stopped"
fi

if curl -s -f "http://localhost:3002/auth/collectclock/health" > /dev/null 2>&1; then
    echo "   ⚠️  CollectClock handler still responding - attempting additional cleanup..."
    pkill -f "collectClockOAuthHandler"
else
    echo "   ✅ CollectClock OAuth Handler: Stopped"
fi

echo ""
echo "🗂️  Log files preserved in /logs directory:"
echo "   • logs/bot.log"
echo "   • logs/beta-server.log"
echo "   • logs/github-server.log"
echo "   • logs/collectclock.log"
echo "   • logs/degens-bot.log"
echo ""
echo "💡 To restart the ecosystem, run: ./start_bot.sh"
echo "🧹 To clear logs, run: rm logs/*.log"
echo ""
echo "✅ TrapHouse Discord Bot Ecosystem has been stopped!"
