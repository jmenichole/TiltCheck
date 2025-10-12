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


# 🚂 Railway Deployment Script for TiltCheck.it.com
# Port 3000 Configuration for Railway Project 0gapllg9

echo "🚂 RAILWAY DEPLOYMENT - TILTCHECK.IT.COM"
echo "=========================================="
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "🔧 DEPLOYMENT CONFIGURATION:"
echo "   📦 Project ID: 0gapllg9"
echo "   🌐 Domain: tiltcheck.it.com"
echo "   🔌 Port: 3000"
echo "   🐳 Docker: docker-compose.server.yml"
echo ""

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Set environment variables for Railway
echo "⚙️  Setting Railway environment variables..."
railway variables set PORT=3000
railway variables set NODE_ENV=production
railway variables set HOST=0.0.0.0
railway variables set BASE_URL=https://tiltcheck.it.com
railway variables set OAUTH_REDIRECT_URI=https://tiltcheck.it.com/auth/callback
railway variables set TILTCHECK_BASE_URL=https://api.tiltcheck.it.com
railway variables set COLLECTCLOCK_BASE_URL=https://collectclock.tiltcheck.it.com
railway variables set DEGENS_CARDS_BASE_URL=https://cards.tiltcheck.it.com

# Deploy using the server configuration
echo "🚀 Deploying to Railway..."
railway up --service web

echo ""
echo "✅ RAILWAY DEPLOYMENT INITIATED"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Go to Railway dashboard: https://railway.app/project/0gapllg9"
echo "   2. Add custom domain: tiltcheck.it.com"
echo "   3. Configure DNS A record to point to Railway's IP"
echo "   4. Wait for SSL certificate provisioning"
echo ""
echo "🔗 URLs after deployment:"
echo "   🌐 Main Site: https://tiltcheck.it.com"
echo "   📊 Dashboard: https://dashboard.tiltcheck.it.com"
echo "   🔗 API: https://api.tiltcheck.it.com"
echo "   ⏰ CollectClock: https://collectclock.tiltcheck.it.com"
echo "   🎮 Degens Cards: https://cards.tiltcheck.it.com"
echo ""
echo "🎯 Degen-Mindful Balance System will be live at tiltcheck.it.com:3000"
