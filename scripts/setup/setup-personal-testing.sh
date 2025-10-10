#!/bin/bash
# TiltCheck Personal Testing Setup
# Remove MIT license and prepare for commercial use

echo "🎯 Setting up TiltCheck for personal gambling habit testing..."

# 1. Remove MIT License (preparing for commercial use)
echo "📄 Removing open-source licensing..."
rm -f LICENSE
rm -f COPYING 2>/dev/null

# 2. Update package.json to remove MIT license
sed -i '' 's/"license": "MIT"/"license": "PROPRIETARY"/g' package.json 2>/dev/null

# 3. Create your personal testing environment file
cat > .env.personal << 'EOF'
# Personal TiltCheck Testing Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_GUILD_ID=your_test_server_id

# Personal Testing Mode
TILTCHECK_MODE=personal_testing
USER_ID=your_discord_user_id
TESTING_PLATFORM=stake_us

# Database (use local for testing)
DATABASE_URL=sqlite:./personal_tiltcheck.db

# Alerts - Set these to YOUR preferences
ALERT_LOSS_STREAK=3
ALERT_SESSION_TIME=60  # minutes
ALERT_STAKE_INCREASE=50  # dollars
PERSONAL_BANKROLL_LIMIT=1000

# Commercial Settings
BUSINESS_MODE=true
DATA_RETENTION_DAYS=365
USER_ANALYTICS_ENABLED=true
EOF

echo "✅ License removed - now proprietary for your business"
echo "✅ Personal testing environment created (.env.personal)"
echo ""
echo "🎮 Ready for personal gambling habit testing!"
echo ""
echo "Next steps:"
echo "1. Edit .env.personal with your Discord bot token"
echo "2. Run: npm start"
echo "3. Use these commands in Discord:"
echo "   !tiltcheck start \"Stake US\" 200"
echo "   !tiltcheck bet 25 loss"
echo "   !tiltcheck bet 50 win 150"
echo "   !tiltcheck status"
echo "   !tiltcheck end"