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


# TrapHouse Discord Bot - Stripe Connect Testing Script
# This script tests all Stripe Connect functionality

echo "🏠 TrapHouse Discord Bot - Stripe Connect Testing"
echo "=================================================="

BASE_URL="http://localhost:3002"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make API requests and show results
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}$method $endpoint${NC}"
    
    if [ -n "$data" ]; then
        result=$(curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        result=$(curl -s -X $method "$BASE_URL$endpoint")
    fi
    
    if echo "$result" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Success:${NC}"
        echo "$result" | jq .
    else
        echo -e "${RED}❌ Error:${NC}"
        echo "$result"
    fi
}

# Test server health
echo -e "\n${BLUE}1. Server Health Check${NC}"
test_endpoint "GET" "/webhook/health" "" "Health check"

# Test Stripe Connect account creation
echo -e "\n${BLUE}2. Stripe Connect Account Creation${NC}"
ACCOUNT_DATA='{
    "discordUserId": "test_user_'$(date +%s)'",
    "email": "test'$(date +%s)'@traphouse.com"
}'

account_result=$(curl -s -X POST "$BASE_URL/stripe/accounts/create" \
    -H "Content-Type: application/json" \
    -d "$ACCOUNT_DATA")

echo -e "${GREEN}✅ Account Creation Result:${NC}"
echo "$account_result" | jq .

# Extract account ID for subsequent tests
ACCOUNT_ID=$(echo "$account_result" | jq -r '.accountId')

if [ "$ACCOUNT_ID" != "null" ]; then
    echo -e "\n${BLUE}3. Account Status Check${NC}"
    test_endpoint "GET" "/stripe/accounts/$ACCOUNT_ID/status" "" "Account status"
    
    echo -e "\n${BLUE}4. Onboarding Link Creation${NC}"
    test_endpoint "POST" "/stripe/accounts/$ACCOUNT_ID/onboard" "" "Onboarding link"
    
    echo -e "\n${BLUE}5. Product Creation${NC}"
    PRODUCT_DATA='{
        "connectedAccountId": "'$ACCOUNT_ID'",
        "name": "TrapHouse Test Product",
        "description": "Test product for development",
        "priceInCents": 2500
    }'
    test_endpoint "POST" "/stripe/products/create" "$PRODUCT_DATA" "Product creation"
    
    echo -e "\n${BLUE}6. Test Mode Checkout (No Onboarding Required)${NC}"
    CHECKOUT_DATA='{
        "connectedAccountId": "'$ACCOUNT_ID'",
        "productName": "TrapHouse Test Product",
        "priceInCents": 2500,
        "quantity": 1,
        "testMode": true
    }'
    test_endpoint "POST" "/stripe/checkout/create" "$CHECKOUT_DATA" "Test mode checkout"
    
    echo -e "\n${BLUE}7. Production Mode Checkout (Requires Onboarding)${NC}"
    CHECKOUT_PROD_DATA='{
        "connectedAccountId": "'$ACCOUNT_ID'",
        "productName": "TrapHouse Production Product",
        "priceInCents": 2500,
        "quantity": 1,
        "testMode": false
    }'
    test_endpoint "POST" "/stripe/checkout/create" "$CHECKOUT_PROD_DATA" "Production mode checkout"
fi

echo -e "\n${BLUE}8. UI Endpoints${NC}"
echo -e "${YELLOW}Marketplace:${NC} $BASE_URL/stripe/marketplace"
echo -e "${YELLOW}Seller Dashboard:${NC} $BASE_URL/stripe/seller-dashboard"

echo -e "\n${GREEN}🎉 Testing Complete!${NC}"
echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Open the Stripe onboarding link to complete seller setup"
echo "2. Test the checkout URLs in your browser"
echo "3. Use Stripe test cards: 4242424242424242"
echo "4. Check the UI endpoints for user experience"

echo -e "\n${BLUE}Test Card Numbers:${NC}"
echo "• Success: 4242424242424242"
echo "• Declined: 4000000000000002"
echo "• Insufficient Funds: 4000000000009995"
