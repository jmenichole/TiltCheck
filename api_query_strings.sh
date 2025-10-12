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


# Solscan API Query Parameter Examples
# Copy and paste these parameter strings for testing

echo "🔍 Solscan API Query Parameter Strings"
echo "======================================"
echo

echo "📋 **Transaction Detail Query String:**"
echo "signature=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&commitment=finalized&maxSupportedTransactionVersion=0"
echo

echo "📊 **Account Transactions Query String:**"
echo "address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&limit=50&exclude_vote=true&exclude_failed=false&commitment=finalized"
echo

echo "💰 **Account Balance Query String:**"
echo "address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&commitment=finalized"
echo

echo "🪙 **Token Holdings Query String:**"
echo "address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&commitment=finalized"
echo

echo "🔄 **Token Transfers Query String:**"
echo "address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&limit=50&commitment=finalized"
echo

echo "🌐 **Complete API URLs with Parameters:**"
echo "========================================"
echo

echo "Transaction Detail:"
echo "https://pro-api.solscan.io/v2.0/transaction/detail?signature=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&commitment=finalized"
echo

echo "Account Transactions:"
echo "https://pro-api.solscan.io/v2.0/account/transactions?address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&limit=50&commitment=finalized"
echo

echo "Account Balance:"
echo "https://pro-api.solscan.io/v2.0/account/balance?address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&commitment=finalized"
echo

echo "Token Holdings:"
echo "https://pro-api.solscan.io/v2.0/account/token-holdings?address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&commitment=finalized"
echo

echo "Token Transfers:"
echo "https://pro-api.solscan.io/v2.0/account/token-transfers?address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&limit=50&commitment=finalized"
echo

echo "📋 **Parameter Reference:**"
echo "=========================="
echo "commitment: finalized | confirmed | processed"
echo "limit: 1-100 (default: 50)"
echo "exclude_vote: true | false"
echo "exclude_failed: true | false"
echo "maxSupportedTransactionVersion: 0 | null"
echo

echo "🔑 **Required Headers:**"
echo "======================="
echo "Content-Type: application/json"
echo "Authorization: Bearer YOUR_API_KEY"
