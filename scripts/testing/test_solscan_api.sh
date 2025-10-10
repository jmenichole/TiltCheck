#!/bin/bash

# Solscan API Test Script for JustTheTip Bot
# Usage: ./test_solscan_api.sh [transaction_signature] [api_key]

# Default transaction signature (your payment signer)
DEFAULT_TX="TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E"

# Get transaction signature from command line or use default
TX_SIGNATURE=${1:-$DEFAULT_TX}
API_KEY=${2:-""}

echo "🔍 Testing Solscan API for JustTheTip Bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Transaction: ${TX_SIGNATURE:0:20}..."
echo "🌐 API Endpoint: https://pro-api.solscan.io/v2.0/transaction/detail"
echo ""

# Build the curl command
if [ -n "$API_KEY" ]; then
    echo "🔑 Using API Key: ${API_KEY:0:10}..."
    echo ""
    curl --request GET \
         --url "https://pro-api.solscan.io/v2.0/transaction/detail?signature=$TX_SIGNATURE" \
         --header 'content-Type: application/json' \
         --header "Authorization: Bearer $API_KEY" \
         --silent --show-error | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
else
    echo "⚠️  No API Key provided - testing without authentication"
    echo ""
    curl --request GET \
         --url "https://pro-api.solscan.io/v2.0/transaction/detail?signature=$TX_SIGNATURE" \
         --header 'content-Type: application/json' \
         --silent --show-error | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "� Testing Query Parameters (Enhanced Mode)"
echo ""

# Test with commitment parameter
echo "📊 Testing with commitment=finalized parameter:"
if [ -n "$API_KEY" ]; then
    curl --request GET \
         --url "https://pro-api.solscan.io/v2.0/transaction/detail?signature=$TX_SIGNATURE&commitment=finalized" \
         --header 'content-Type: application/json' \
         --header "Authorization: Bearer $API_KEY" \
         --silent --show-error | jq '.commitment // "No commitment field"' 2>/dev/null || echo "Response received"
else
    echo "⚠️  API Key required for parameter testing"
fi

echo ""
echo "🔍 Testing with maxSupportedTransactionVersion parameter:"
if [ -n "$API_KEY" ]; then
    curl --request GET \
         --url "https://pro-api.solscan.io/v2.0/transaction/detail?signature=$TX_SIGNATURE&maxSupportedTransactionVersion=0" \
         --header 'content-Type: application/json' \
         --header "Authorization: Bearer $API_KEY" \
         --silent --show-error | jq '.version // "No version field"' 2>/dev/null || echo "Response received"
else
    echo "⚠️  API Key required for parameter testing"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "�💡 To get better results:"
echo "   1. Get API key from: https://pro-api.solscan.io/"
echo "   2. Run: ./test_solscan_api.sh $TX_SIGNATURE YOUR_API_KEY"
echo "   3. Or add to .env: SOLSCAN_API_KEY=your_key_here"
echo ""
echo "🤖 Test in Discord:"
echo "   !verify-payment $TX_SIGNATURE"
echo "   !check-tx $TX_SIGNATURE"
echo "   !test-balance"
echo "   !test-tokens"
echo "   !test-tx $TX_SIGNATURE"
echo "   !solscan-status"
echo ""
echo "📋 Additional API Endpoints Available:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 Account Balance:"
echo "   curl 'https://pro-api.solscan.io/v2.0/account/balance?address=$DEFAULT_TX'"
echo ""
echo "🪙 Token Holdings:"
echo "   curl 'https://pro-api.solscan.io/v2.0/account/token-holdings?address=$DEFAULT_TX'"
echo ""
echo "📈 Account Transactions:"
echo "   curl 'https://pro-api.solscan.io/v2.0/account/transactions?address=$DEFAULT_TX&limit=10'"
echo ""
echo "🔄 Token Transfers:"
echo "   curl 'https://pro-api.solscan.io/v2.0/account/token-transfers?address=$DEFAULT_TX&limit=10'"
