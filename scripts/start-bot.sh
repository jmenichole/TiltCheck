#!/bin/bash
# TrapHouse Bot Quick Setup Script

echo "🏠 TrapHouse Discord Bot Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from template..."
    cp .env.payments .env
    echo "✅ .env file created"
fi

echo "🔍 Running configuration validation..."
node validate-config.js

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Configuration issues detected!"
    echo ""
    echo "🔧 Quick Setup Steps:"
    echo "====================="
    echo ""
    echo "1. 🔑 DISCORD BOT TOKEN (REQUIRED)"
    echo "   Go to: https://discord.com/developers/applications"
    echo "   Create/select your bot → Bot → Copy Token"
    echo "   Add to .env: DISCORD_BOT_TOKEN=your_token_here"
    echo ""
    echo "2. 💰 SOLANA USDC ADDRESS (RECOMMENDED)"
    echo "   Create Solana wallet → Copy public address"
    echo "   Add to .env: SOLANA_USDC_DESTINATION_ADDRESS=your_address"
    echo ""
    echo "3. 🔗 OPTIONAL APIs (for advanced features)"
    echo "   • Ethereum RPC (Infura/Alchemy)"
    echo "   • Stripe (credit card payments)"
    echo "   • TiltCheck (gambling protection)"
    echo "   • Stake API (vault features)"
    echo ""
    echo "📖 See CONFIGURATION_GUIDE.md for detailed instructions"
    echo ""
    echo "🔄 Run this script again after adding your Discord token!"
    exit 1
else
    echo ""
    echo "🎉 Configuration validated successfully!"
    echo ""
    echo "🚀 Starting TrapHouse Bot..."
    node index.js
fi
