#!/bin/bash
# Quick TiltCheck Testing Setup - Get running in 5 minutes

echo "🎯 TiltCheck Quick Testing Setup"
echo "================================="
echo ""

# Check if Discord token is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your Discord bot token:"
    echo ""
    echo "Usage: ./quick-test-setup.sh YOUR_DISCORD_BOT_TOKEN"
    echo ""
    echo "To get a Discord bot token:"
    echo "1. Go to https://discord.com/developers/applications"
    echo "2. Create New Application → Bot → Copy Token"
    echo "3. Invite bot to your server with admin permissions"
    echo ""
    exit 1
fi

DISCORD_TOKEN="$1"

echo "🔧 Setting up environment..."

# Create .env file with your token
cat > .env << EOF
# TiltCheck Testing Environment - PROPRIETARY LICENSE
DISCORD_BOT_TOKEN=$DISCORD_TOKEN
DISCORD_TOKEN=$DISCORD_TOKEN

# Testing Configuration
NODE_ENV=development
TILTCHECK_MODE=personal_testing

# Database (SQLite for local testing)
DATABASE_URL=sqlite:./tiltcheck_test.db

# Personal Alert Settings (adjust to your preferences)
ALERT_LOSS_STREAK=3
ALERT_SESSION_TIME=60
ALERT_STAKE_INCREASE=50
PERSONAL_BANKROLL_LIMIT=1000

# Business Settings
BUSINESS_MODE=true
DATA_RETENTION_ENABLED=true
USER_ANALYTICS_ENABLED=true
PROPRIETARY_LICENSE=true
EOF

echo "✅ Environment configured"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 READY TO TEST!"
echo "================="
echo ""
echo "1. Start the bot:"
echo "   npm start"
echo ""
echo "2. In your Discord server, try these commands:"
echo "   !tiltcheck help"
echo "   !tiltcheck start \"Stake US\" 200"
echo "   !tiltcheck bet 25 loss"
echo "   !tiltcheck bet 50 win 150"
echo "   !tiltcheck status" 
echo "   !tiltcheck end"
echo ""
echo "3. Track your REAL gambling session to generate data!"
echo ""
echo "📋 See PERSONAL_TESTING_GUIDE.md for detailed testing scenarios"
echo ""
echo "🎯 This will help you understand your gambling patterns"
echo "💰 and validate the business model before launch!"