#!/bin/bash

# ============================================
# TiltCheck Railway Setup Script
# ============================================
# This script helps you set up and deploy TiltCheck to Railway
# Usage: ./scripts/setup-railway.sh

set -e

echo "🚂 TiltCheck Railway Deployment Setup"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
else
    echo -e "${GREEN}✅ Railway CLI is already installed${NC}"
fi

echo ""
echo "======================================"
echo "Step 1: Login to Railway"
echo "======================================"
echo ""

railway login

echo ""
echo "======================================"
echo "Step 2: Create or Link Project"
echo "======================================"
echo ""

read -p "Do you want to (1) Create new project or (2) Link existing project? [1/2]: " project_choice

if [ "$project_choice" == "1" ]; then
    echo "Creating new Railway project..."
    railway init
elif [ "$project_choice" == "2" ]; then
    echo "Please enter your Railway Project ID:"
    read project_id
    railway link --project "$project_id"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project linked${NC}"

echo ""
echo "======================================"
echo "Step 3: Add PostgreSQL Database"
echo "======================================"
echo ""

read -p "Do you want to add a PostgreSQL database? [y/n]: " add_db

if [ "$add_db" == "y" ] || [ "$add_db" == "Y" ]; then
    echo "Adding PostgreSQL..."
    railway add --plugin postgresql
    echo -e "${GREEN}✅ PostgreSQL added${NC}"
    echo ""
    echo "Setting DB_TYPE to postgresql..."
    railway variables set DB_TYPE=postgresql
fi

echo ""
echo "======================================"
echo "Step 4: Configure Environment Variables"
echo "======================================"
echo ""

echo "Generating production JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo -e "${GREEN}✅ JWT secret generated${NC}"

echo ""
echo "Setting essential environment variables..."

railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set RATE_LIMIT_ENABLED=true
railway variables set SSL_ENABLED=true
railway variables set HELMET_ENABLED=true
railway variables set CORS_ENABLED=true

echo -e "${GREEN}✅ Essential variables set${NC}"

echo ""
echo "======================================"
echo "Step 5: Configure CORS Origins"
echo "======================================"
echo ""

echo "Please enter your domain(s) for CORS (comma-separated):"
echo "Example: https://yourdomain.com,https://app.yourdomain.com"
read cors_origin

if [ ! -z "$cors_origin" ]; then
    railway variables set CORS_ORIGIN="$cors_origin"
    echo -e "${GREEN}✅ CORS origins configured${NC}"
else
    echo -e "${YELLOW}⚠️  CORS set to allow all origins (not recommended for production)${NC}"
    railway variables set CORS_ORIGIN="*"
fi

echo ""
echo "======================================"
echo "Step 6: Configure Coinbase (Optional)"
echo "======================================"
echo ""

read -p "Do you want to configure Coinbase payment integration? [y/n]: " setup_coinbase

if [ "$setup_coinbase" == "y" ] || [ "$setup_coinbase" == "Y" ]; then
    echo ""
    echo "Coinbase App ID (default: ca8b3b06-99e0-4611-affd-b39c2e7ca273):"
    read coinbase_app_id
    coinbase_app_id=${coinbase_app_id:-ca8b3b06-99e0-4611-affd-b39c2e7ca273}
    
    echo "Coinbase API Key:"
    read coinbase_api_key
    
    echo "Coinbase API Secret:"
    read -s coinbase_api_secret
    echo ""
    
    echo "Coinbase Wallet Secret:"
    read -s coinbase_wallet_secret
    echo ""
    
    railway variables set COINBASE_APP_ID="$coinbase_app_id"
    railway variables set COINBASE_API_KEY="$coinbase_api_key"
    railway variables set COINBASE_API_SECRET="$coinbase_api_secret"
    railway variables set COINBASE_WALLET_SECRET="$coinbase_wallet_secret"
    
    echo -e "${GREEN}✅ Coinbase configured${NC}"
fi

echo ""
echo "======================================"
echo "Step 7: Configure Discord (Optional)"
echo "======================================"
echo ""

read -p "Do you want to configure Discord integration? [y/n]: " setup_discord

if [ "$setup_discord" == "y" ] || [ "$setup_discord" == "Y" ]; then
    echo ""
    echo "Discord Client ID:"
    read discord_client_id
    
    echo "Discord Client Secret:"
    read -s discord_client_secret
    echo ""
    
    echo "Discord Alert Webhook URL:"
    read discord_webhook
    
    railway variables set DISCORD_CLIENT_ID="$discord_client_id"
    railway variables set DISCORD_CLIENT_SECRET="$discord_client_secret"
    railway variables set DISCORD_ALERT_WEBHOOK="$discord_webhook"
    
    echo -e "${GREEN}✅ Discord configured${NC}"
fi

echo ""
echo "======================================"
echo "Step 8: Deploy to Railway"
echo "======================================"
echo ""

read -p "Ready to deploy? [y/n]: " ready_deploy

if [ "$ready_deploy" == "y" ] || [ "$ready_deploy" == "Y" ]; then
    echo "Deploying to Railway..."
    railway up --detach
    echo ""
    echo -e "${GREEN}✅ Deployment started!${NC}"
    echo ""
    echo "Waiting for deployment to complete..."
    sleep 30
    
    # Get deployment URL
    echo ""
    echo "Getting deployment URL..."
    railway status
    
    echo ""
    echo -e "${GREEN}======================================"
    echo "🎉 Deployment Complete!"
    echo "======================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Check your Railway dashboard for deployment status"
    echo "2. Set up custom domain (Settings → Domains)"
    echo "3. Test your deployment:"
    echo "   - Health check: https://your-domain.railway.app/health"
    echo "   - API docs: https://your-domain.railway.app/api-docs"
    echo "   - Admin dashboard: https://your-domain.railway.app/admin"
    echo ""
    echo "4. Configure GitHub Actions for automatic deployments:"
    echo "   - Add RAILWAY_TOKEN to GitHub Secrets"
    echo "   - Add RAILWAY_PROJECT_ID to GitHub Secrets"
    echo ""
    echo "See RAILWAY_DEPLOYMENT.md for complete documentation."
    echo ""
else
    echo ""
    echo "Deployment cancelled. Run this script again when ready."
    echo ""
fi

echo ""
echo "======================================"
echo "Configuration Summary"
echo "======================================"
echo ""
echo "✅ Railway CLI configured"
echo "✅ Project linked"
if [ "$add_db" == "y" ] || [ "$add_db" == "Y" ]; then
    echo "✅ PostgreSQL database added"
fi
echo "✅ Environment variables set"
echo "✅ JWT secret generated"
if [ "$setup_coinbase" == "y" ] || [ "$setup_coinbase" == "Y" ]; then
    echo "✅ Coinbase integration configured"
fi
if [ "$setup_discord" == "y" ] || [ "$setup_discord" == "Y" ]; then
    echo "✅ Discord integration configured"
fi
echo ""
echo "Your TiltCheck instance is ready! 🚀"
echo ""
