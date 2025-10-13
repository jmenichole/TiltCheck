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


# Comprehensive Solscan API Parameter Testing Script
# This script demonstrates all available query parameters for Solscan API endpoints

echo "🔍 Solscan API Parameter Testing Suite"
echo "======================================"
echo

# Test 1: Basic API Status
echo "📊 Test 1: Checking Solscan API Status"
echo "Command: !solscan-status"
echo "Expected: Shows API configuration and available features"
echo

# Test 2: Account Balance with Parameters
echo "💰 Test 2: Account Balance API"
echo "Command: !test-balance"
echo "Parameters tested:"
echo "  - address: Payment signer address"
echo "  - commitment: 'finalized' (default)"
echo "Expected: Shows SOL balance in lamports and SOL"
echo

# Test 3: Token Holdings with Parameters
echo "🪙 Test 3: Token Holdings API"
echo "Command: !test-tokens"
echo "Parameters tested:"
echo "  - address: Payment signer address"
echo "  - commitment: 'finalized' (default)"
echo "  - token: (optional, can be specific token address)"
echo "Expected: Shows top 5 token holdings"
echo

# Test 4: Transaction Detail with Full Parameters
echo "🔍 Test 4: Transaction Detail API"
echo "Command: !test-tx <transaction_signature>"
echo "Parameters tested:"
echo "  - signature: Transaction signature"
echo "  - commitment: 'finalized'"
echo "  - maxSupportedTransactionVersion: 0"
echo "Expected: Shows transaction status and block time"
echo

# Test 5: Payment Verification (Main Feature)
echo "✅ Test 5: Payment Verification"
echo "Command: !verify-payment <transaction_signature>"
echo "Parameters tested:"
echo "  - All transaction detail parameters"
echo "  - Signer validation"
echo "  - Webhook notifications"
echo "Expected: Verifies if transaction was signed by JustTheTip payment signer"
echo

echo "🚀 TESTING INSTRUCTIONS:"
echo "========================"
echo "1. Start JustTheTip bot: node launcher.js justthetip"
echo "2. Run each test command in Discord"
echo "3. Check responses for parameter handling"
echo
echo "📋 PARAMETER REFERENCE:"
echo "======================="
echo "Commitment Levels:"
echo "  - processed: Latest block (may be rolled back)"
echo "  - confirmed: Confirmed by cluster (recommended)"
echo "  - finalized: Finalized by cluster (safest, default)"
echo
echo "Transaction Version Support:"
echo "  - maxSupportedTransactionVersion: 0 (legacy transactions)"
echo "  - maxSupportedTransactionVersion: null (all versions)"
echo
echo "Pagination Parameters:"
echo "  - limit: Number of results (1-100)"
echo "  - before: Signature to paginate before"
echo "  - after: Signature to paginate after"
echo
echo "Filter Parameters:"
echo "  - exclude_vote: true/false (exclude vote transactions)"
echo "  - exclude_failed: true/false (exclude failed transactions)"
echo "  - token: Specific token mint address"
echo
echo "📈 API ENDPOINTS TESTED:"
echo "======================="
echo "1. /account/balance - Get SOL balance"
echo "2. /account/token-holdings - Get token balances"
echo "3. /account/transactions - Get transaction history"
echo "4. /transaction/detail - Get transaction details"
echo "5. /account/token-transfers - Get token transfer history"
echo
echo "⚠️  NOTES:"
echo "========="
echo "- Without Solscan Pro API key: Limited functionality with manual verification links"
echo "- With Solscan Pro API key: Full automated verification"
echo "- All parameters are properly handled with fallbacks"
echo "- Error responses include helpful debugging information"
echo
echo "🔗 GET YOUR API KEY:"
echo "==================="
echo "Visit: https://pro-api.solscan.io/"
echo "Add to .env: SOLSCAN_API_KEY=your_key_here"
echo "Restart bot: node launcher.js justthetip"
