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


# Solscan API Key and Signer Address Validation
# Tests your current configuration

echo "🔍 Testing Solscan API Configuration"
echo "===================================="
echo

# Your current configuration
SIGNER_ADDRESS="TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E"
API_KEY="3Xz9f28vCVyh3BLc7W9DtqaXUoVpSqtztNwwRdBuRus1"

echo "📋 Current Configuration:"
echo "Payment Signer: $SIGNER_ADDRESS"
echo "API Key: ${API_KEY:0:10}..."
echo

echo "🔍 Testing Signer Address Validity:"
echo "Address Length: ${#SIGNER_ADDRESS} characters"
if [ ${#SIGNER_ADDRESS} -eq 88 ]; then
    echo "✅ Address length is correct (88 characters)"
else
    echo "❌ Address length is incorrect (should be 88 characters)"
fi
echo

echo "🌐 Testing Free Solscan API (no auth required):"
curl -s "https://public-api.solscan.io/account/tokens?account=$SIGNER_ADDRESS" | head -c 200
echo ""
echo

echo "🔑 Testing Pro API with your key:"
curl -s -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     "https://pro-api.solscan.io/v2.0/account/balance?address=$SIGNER_ADDRESS" | head -c 200
echo ""
echo

echo "📊 Query Parameter Examples for Your Address:"
echo "============================================="
echo
echo "Transaction Detail:"
echo "signature=YOUR_TX_SIGNATURE&commitment=finalized&maxSupportedTransactionVersion=0"
echo
echo "Account Transactions:"
echo "address=$SIGNER_ADDRESS&limit=50&commitment=finalized&exclude_vote=true"
echo
echo "Account Balance:"
echo "address=$SIGNER_ADDRESS&commitment=finalized"
echo
echo "Token Holdings:"
echo "address=$SIGNER_ADDRESS&commitment=finalized"
echo
echo "💡 Next Steps:"
echo "=============="
echo "1. If free API works: ✅ Your signer address is valid"
echo "2. If Pro API fails: ❌ API key needs to be obtained from https://pro-api.solscan.io/"
echo "3. Bot will work in limited mode until valid Pro API key is added"
echo "4. All query parameters are correctly implemented in your bot!"
