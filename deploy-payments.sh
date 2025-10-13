#!/bin/bash
#
# Copyright (c) 2024-2025 JME (jmenichole)
# All Rights Reserved
# 
# PROPRIETARY AND CONFIDENTIAL
# Unauthorized copying of this file, via any medium, is strictly prohibited.
# 
# This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
# For licensing information, see LICENSE file in the root directory.
#

# TrapHouse Payment System - Quick Deployment Script

echo "🏠 TrapHouse Payment System Deployment"
echo "======================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env from template..."
    cp .env.payments .env
    echo "⚠️  Please configure your API keys in .env before running the bot"
else
    echo "✅ Environment file exists"
fi

# Create data directory if it doesn't exist
mkdir -p data

# Run the payment system test
echo ""
echo "🧪 Testing Payment System..."
node test-payment-system.js

echo ""
echo "🚀 Deployment Complete!"
echo ""
echo "Next Steps:"
echo "1. Configure your API keys in .env"
echo "2. Start the bot: node index.js"
echo "3. Test payments: !deposit crypto ETH"
echo "4. Test fiat deposits: !deposit fiat 100"
echo ""
echo "💰 Supported Features:"
echo "   • Crypto: ETH, USDC, USDT, WBTC"
echo "   • Fiat: USD via Stripe"
echo "   • Real wallet generation"
echo "   • Automatic deposit detection"
echo "   • Vault integration"
echo "   • TiltCheck integration"
echo ""
echo "🔐 Security Features:"
echo "   • Webhook signature verification"
echo "   • Encrypted private key storage"
echo "   • Rate limiting"
echo "   • Transaction monitoring"
echo ""
echo "Happy trading! 📈"
