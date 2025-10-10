#!/bin/bash

# 🔥 TrapHouse Bot Environment Configuration Helper
# This script will help you configure all the required environment variables

echo "🏠 TrapHouse Discord Bot Configuration Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
fi

echo -e "\n${BLUE}📋 Required Configuration Steps:${NC}\n"

echo -e "${YELLOW}1. DISCORD BOT SETUP:${NC}"
echo "   • Go to: https://discord.com/developers/applications"
echo "   • Create new application"
echo "   • Go to 'Bot' section and create bot"
echo "   • Copy bot token"
echo ""

echo -e "${YELLOW}2. TIP.CC SETUP:${NC}"
echo "   • Go to: https://tip.cc/developers"
echo "   • Create developer account"
echo "   • Get API key and webhook secret"
echo "   • Set webhook URL: https://yourdomain.com/webhooks/tipcc"
echo ""

echo -e "${YELLOW}3. STRIPE SETUP:${NC}"
echo "   • Go to: https://dashboard.stripe.com"
echo "   • Get publishable and secret keys"
echo "   • Set webhook URL: https://yourdomain.com/webhooks/stripe"
echo "   • Add events: invoice.payment_succeeded, invoice.payment_failed"
echo ""

echo -e "${YELLOW}4. DISCORD CONFIGURATION:${NC}"
echo "   • Right-click your Discord server name → Copy Server ID"
echo "   • Right-click your Discord username → Copy User ID"
echo "   • Create #payment-notifications channel"
echo ""

echo -e "\n${BLUE}🔧 Current .env status:${NC}"

# Check environment variables
check_env_var() {
    local var_name=$1
    local description=$2
    
    if grep -q "${var_name}=your_" .env || grep -q "${var_name}=$" .env; then
        echo -e "${RED}❌ ${var_name}${NC} - ${description}"
        return 1
    else
        echo -e "${GREEN}✅ ${var_name}${NC} - ${description}"
        return 0
    fi
}

check_env_var "DISCORD_BOT_TOKEN" "Discord bot token"
check_env_var "TIPCC_API_KEY" "tip.cc API key"
check_env_var "STRIPE_SECRET_KEY" "Stripe secret key"
check_env_var "STRIPE_PUBLISHABLE_KEY" "Stripe publishable key"
check_env_var "ADMIN_USER_ID" "Admin Discord user ID"

echo -e "\n${BLUE}💡 Quick Setup Commands:${NC}"
echo ""
echo -e "${GREEN}# Edit environment file:${NC}"
echo "nano .env"
echo ""
echo -e "${GREEN}# Test configuration:${NC}"
echo "./test-payments.sh"
echo ""
echo -e "${GREEN}# Install dependencies:${NC}"
echo "npm install"
echo ""
echo -e "${GREEN}# Start bot locally:${NC}"
echo "npm start"
echo ""

echo -e "\n${BLUE}🎯 Payment System Configuration:${NC}"
echo ""
echo -e "${YELLOW}Loan Issuance Fee:${NC} \$3.00 (via tip.cc)"
echo -e "${YELLOW}Late Payment Fee:${NC} \$3.00 (via tip.cc)"
echo -e "${YELLOW}Premium Subscription:${NC} \$2000 split into 4 payments (via Stripe)"
echo ""

echo -e "${BLUE}📱 Webhook Endpoints:${NC}"
echo "tip.cc webhook: https://yourdomain.com/webhooks/tipcc"
echo "Stripe webhook: https://yourdomain.com/webhooks/stripe"
echo ""

echo -e "${BLUE}🔐 Security Notes:${NC}"
echo "• Never commit .env file to git"
echo "• Use test API keys for development"
echo "• Switch to live keys only for production"
echo "• Regularly rotate webhook secrets"
echo ""

echo -e "${GREEN}🎉 Ready to configure your TrapHouse empire! 💰${NC}"

# Interactive configuration option
read -p "Would you like to configure environment variables now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${BLUE}Opening .env file for editing...${NC}"
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "Please edit .env file manually with your preferred editor"
    fi
else
    echo -e "${YELLOW}Remember to edit .env file before starting the bot!${NC}"
fi
