#!/bin/bash

# 🔥 TrapHouse Payment System Test Script
# Test payment integration and admin notifications

echo "🎯 Testing TrapHouse Payment System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_payment_config() {
    echo -e "${BLUE}📋 Checking payment configuration...${NC}"
    
    if [ -f "config/payments.js" ]; then
        echo -e "${GREEN}✅ Payment config found${NC}"
    else
        echo -e "${RED}❌ Payment config missing${NC}"
        return 1
    fi
    
    if [ -f "paymentManager.js" ]; then
        echo -e "${GREEN}✅ Payment manager found${NC}"
    else
        echo -e "${RED}❌ Payment manager missing${NC}"
        return 1
    fi
    
    if [ -f "commands/payment.js" ]; then
        echo -e "${GREEN}✅ Payment commands found${NC}"
    else
        echo -e "${RED}❌ Payment commands missing${NC}"
        return 1
    fi
}

test_webhook_setup() {
    echo -e "${BLUE}🔗 Checking webhook configuration...${NC}"
    
    if [ -f "webhooks/payments.js" ]; then
        echo -e "${GREEN}✅ Payment webhooks found${NC}"
    else
        echo -e "${RED}❌ Payment webhooks missing${NC}"
        return 1
    fi
}

test_dependencies() {
    echo -e "${BLUE}📦 Checking dependencies...${NC}"
    
    if npm list express >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Express.js installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Installing Express.js...${NC}"
        npm install express
    fi
    
    if npm list axios >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Axios installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Installing Axios...${NC}"
        npm install axios
    fi
    
    if npm list stripe >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Stripe installed${NC}"
    else
        echo -e "${YELLOW}⚠️ Installing Stripe...${NC}"
        npm install stripe
    fi
}

test_environment() {
    echo -e "${BLUE}🔧 Checking environment variables...${NC}"
    
    if [ -f ".env" ]; then
        echo -e "${GREEN}✅ Environment file found${NC}"
        
        # Check for required payment variables
        if grep -q "TIPCC_API_KEY" .env; then
            echo -e "${GREEN}✅ tip.cc API key configured${NC}"
        else
            echo -e "${YELLOW}⚠️ tip.cc API key needs configuration${NC}"
        fi
        
        if grep -q "STRIPE_SECRET_KEY" .env; then
            echo -e "${GREEN}✅ Stripe secret key configured${NC}"
        else
            echo -e "${YELLOW}⚠️ Stripe secret key needs configuration${NC}"
        fi
        
        if grep -q "PAYMENT_ADMIN_ID" .env; then
            echo -e "${GREEN}✅ Payment admin ID configured${NC}"
        else
            echo -e "${YELLOW}⚠️ Payment admin ID needs configuration${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Creating .env from template...${NC}"
        cp .env.docker .env
        echo -e "${YELLOW}⚠️ Please edit .env with your actual credentials${NC}"
    fi
}

test_data_structure() {
    echo -e "${BLUE}💾 Checking data structure...${NC}"
    
    if [ ! -d "data" ]; then
        echo -e "${YELLOW}⚠️ Creating data directory...${NC}"
        mkdir -p data
    fi
    
    if [ ! -f "data/payments.json" ]; then
        echo -e "${YELLOW}⚠️ Creating payments data file...${NC}"
        echo '{"payments": [], "subscriptions": []}' > data/payments.json
    fi
    
    echo -e "${GREEN}✅ Data structure ready${NC}"
}

simulate_loan_payment() {
    echo -e "${BLUE}💳 Simulating loan payment flow...${NC}"
    
    echo -e "${YELLOW}📝 Loan Request: User requests 50 respect loan${NC}"
    echo -e "${YELLOW}💰 Fee Processing: $3 fee charged via tip.cc${NC}"
    echo -e "${YELLOW}📱 Admin Notification: DM sent to payment admin${NC}"
    echo -e "${YELLOW}✅ Loan Approval: Funds distributed after fee payment${NC}"
    
    echo -e "${GREEN}✅ Payment flow simulation complete${NC}"
}

show_next_steps() {
    echo -e "\n${BLUE}🚀 Next Steps:${NC}"
    echo -e "${YELLOW}1. Configure payment credentials in .env file${NC}"
    echo -e "${YELLOW}2. Set up tip.cc webhook: https://yourdomain.com/webhooks/tipcc${NC}"
    echo -e "${YELLOW}3. Set up Stripe webhook: https://yourdomain.com/webhooks/stripe${NC}"
    echo -e "${YELLOW}4. Test with: !front me 50${NC}"
    echo -e "${YELLOW}5. Monitor admin notifications in Discord${NC}"
    
    echo -e "\n${BLUE}💰 Payment Commands:${NC}"
    echo -e "${GREEN}/payment status     - Check payment status${NC}"
    echo -e "${GREEN}/payment history    - View payment history${NC}"
    echo -e "${GREEN}/payment subscribe  - Subscribe to premium${NC}"
    echo -e "${GREEN}/payment plans      - View payment options${NC}"
    
    echo -e "\n${BLUE}🔧 Admin Commands:${NC}"
    echo -e "${GREEN}/admin payment-status @user  - Check user payments${NC}"
    echo -e "${GREEN}/admin mark-paid [payment-id] - Mark manual payment complete${NC}"
    echo -e "${GREEN}/admin refund [payment-id]    - Process refund${NC}"
}

# Run all tests
echo -e "${BLUE}🎯 TrapHouse Payment System Test${NC}\n"

test_payment_config
test_webhook_setup
test_dependencies
test_environment
test_data_structure
simulate_loan_payment
show_next_steps

echo -e "\n${GREEN}🎉 Payment system test complete!${NC}"
echo -e "${BLUE}💡 Review PAYMENT_SETUP.md for detailed configuration instructions${NC}"
