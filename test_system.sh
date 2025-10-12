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


echo "🚀 TrapHouse Enhanced Bot - System Test"
echo "========================================"

echo ""
echo "📊 Bot Status Check:"
echo "- Port 3002: $(curl -s http://localhost:3002/health | jq -r '.status' 2>/dev/null || echo 'No response')"

echo ""
echo "🔍 Process Status:"
ps aux | grep "node main.js" | grep -v grep | awk '{print "- PID:", $2, "| Memory:", $6/1024 "MB | CPU:", $3"%"}'

echo ""
echo "🌐 Network Status:"
echo "- Port 3001 (JustTheTip): $(lsof -i :3001 >/dev/null 2>&1 && echo 'In Use' || echo 'Free')"
echo "- Port 3002 (TrapHouse): $(lsof -i :3002 >/dev/null 2>&1 && echo 'In Use' || echo 'Free')"

echo ""
echo "✅ Available Systems:"
echo "- Enhanced TiltCheck Verification"
echo "- Secure Crypto Payment Wallets (7 chains)"
echo "- Regulatory Compliance Helper"
echo "- Unicode Protection & Security"

echo ""
echo "🎯 Test Commands (try in Discord):"
echo "- !tiltcheck help"
echo "- !crypto chains"
echo "- !compliance"
echo "- !unban-state WA"
echo "- !front trust"
echo "- !hood stats"

echo ""
echo "🔧 Configuration:"
echo "- TrapHouse Bot: All features enabled"
echo "- JustTheTip Bot: TiltCheck + Crypto only"  
echo "- Degens Bot: TiltCheck + Crypto only"

echo ""
echo "📝 Next Steps:"
echo "1. Test bot commands in Discord"
echo "2. Configure API keys for full functionality"
echo "3. Set up real blockchain RPC endpoints"
echo "4. Configure compliance APIs (Chainalysis, etc.)"

echo ""
echo "🏆 System Status: READY FOR TESTING! 🏆"
