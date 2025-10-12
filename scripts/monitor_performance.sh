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


echo "📊 TrapHouse Bot System Performance Monitor"
echo "=========================================="

echo ""
echo "🤖 Bot Process Status:"
echo "---------------------"
BOT_PIDS=$(ps aux | grep "node main.js" | grep -v grep | awk '{print $2}')
if [ -n "$BOT_PIDS" ]; then
    for PID in $BOT_PIDS; do
        echo "✅ Bot PID: $PID"
        ps -p $PID -o pid,ppid,%cpu,%mem,etime,command --no-headers
    done
else
    echo "❌ No bot processes running"
fi

echo ""
echo "🌐 Network Status:"
echo "-----------------"
echo "Port 3001 (JustTheTip): $(lsof -i :3001 >/dev/null 2>&1 && echo '✅ Active' || echo '❌ Inactive')"
echo "Port 3002 (TrapHouse): $(lsof -i :3002 >/dev/null 2>&1 && echo '✅ Active' || echo '❌ Inactive')"

echo ""
echo "🏥 Health Check:"
echo "---------------"
HEALTH_3002=$(curl -s -w "%{http_code}" http://localhost:3002/health -o /tmp/health_3002.json 2>/dev/null)
if [ "$HEALTH_3002" = "200" ]; then
    echo "✅ TrapHouse Bot (3002): $(cat /tmp/health_3002.json | jq -r '.status' 2>/dev/null || echo 'healthy')"
    echo "   └─ Last Response: $(cat /tmp/health_3002.json | jq -r '.timestamp' 2>/dev/null || echo 'unknown')"
else
    echo "❌ TrapHouse Bot (3002): Unhealthy (HTTP $HEALTH_3002)"
fi

echo ""
echo "💾 Memory Usage:"
echo "---------------"
if [ -n "$BOT_PIDS" ]; then
    for PID in $BOT_PIDS; do
        MEM_MB=$(ps -p $PID -o rss --no-headers | awk '{print $1/1024}')
        CPU_PERCENT=$(ps -p $PID -o %cpu --no-headers)
        echo "PID $PID: ${MEM_MB}MB RAM, ${CPU_PERCENT}% CPU"
    done
fi

echo ""
echo "📊 System Resources:"
echo "-------------------"
echo "System Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Available RAM: $(vm_stat | grep 'Pages free' | awk '{print $3*4096/1024/1024}' | cut -d. -f1)MB"
echo "Disk Usage: $(df -h . | tail -1 | awk '{print $5}') used"

echo ""
echo "🔗 RPC Endpoint Tests:"
echo "---------------------"
echo -n "Ethereum: "
ETH_BLOCK=$(curl -s -X POST https://eth-mainnet.g.alchemy.com/v2/demo \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
  jq -r '.result' 2>/dev/null)
if [ "$ETH_BLOCK" != "null" ] && [ -n "$ETH_BLOCK" ]; then
    echo "✅ Block $(printf "%d" $ETH_BLOCK)"
else
    echo "❌ Connection failed"
fi

echo -n "Polygon: "
POLY_BLOCK=$(curl -s -X POST https://polygon-mainnet.g.alchemy.com/v2/demo \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
  jq -r '.result' 2>/dev/null)
if [ "$POLY_BLOCK" != "null" ] && [ -n "$POLY_BLOCK" ]; then
    echo "✅ Block $(printf "%d" $POLY_BLOCK)"
else
    echo "❌ Connection failed"
fi

echo -n "Solana: "
SOLANA_SLOT=$(curl -s -X POST https://api.mainnet-beta.solana.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}' | \
  jq -r '.result' 2>/dev/null)
if [ "$SOLANA_SLOT" != "null" ] && [ -n "$SOLANA_SLOT" ]; then
    echo "✅ Slot $SOLANA_SLOT"
else
    echo "❌ Connection failed"
fi

echo ""
echo "📁 Log Files:"
echo "------------"
if [ -f "bot.log" ]; then
    echo "✅ Bot log: $(wc -l bot.log | awk '{print $1}') lines"
    echo "   └─ Last error: $(grep -i error bot.log | tail -1 || echo 'None found')"
else
    echo "📝 No log file found (consider adding logging)"
fi

echo ""
echo "🚨 Error Monitoring:"
echo "-------------------"
# Check for common error patterns
if [ -n "$BOT_PIDS" ]; then
    echo "Checking for recent errors..."
    # Sample error checking - you'd expand this based on your logging
    if pgrep -f "node main.js" > /dev/null; then
        echo "✅ Bot process stable"
    else
        echo "❌ Bot process may be unstable"
    fi
else
    echo "❌ No bot process to monitor"
fi

echo ""
echo "⏱️ Response Time Tests:"
echo "----------------------"
echo -n "Health endpoint: "
RESPONSE_TIME=$(curl -s -w "%{time_total}" http://localhost:3002/health -o /dev/null 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "${RESPONSE_TIME}s"
else
    echo "❌ Failed to connect"
fi

echo ""
echo "📈 Performance Recommendations:"
echo "-----------------------------"
if [ -n "$BOT_PIDS" ]; then
    for PID in $BOT_PIDS; do
        MEM_MB=$(ps -p $PID -o rss --no-headers | awk '{print $1/1024}')
        if (( $(echo "$MEM_MB > 500" | bc -l) )); then
            echo "⚠️  High memory usage: ${MEM_MB}MB (consider optimization)"
        elif (( $(echo "$MEM_MB > 200" | bc -l) )); then
            echo "✅ Normal memory usage: ${MEM_MB}MB"
        else
            echo "✅ Low memory usage: ${MEM_MB}MB"
        fi
    done
fi

echo ""
echo "🔄 Auto-Restart Check:"
echo "---------------------"
if [ -f "/tmp/bot_restart_needed" ]; then
    echo "⚠️  Restart flag detected - bot may need restart"
    rm /tmp/bot_restart_needed
else
    echo "✅ No restart needed"
fi

echo ""
echo "📊 Summary:"
echo "----------"
TOTAL_ERRORS=0
if [ -z "$BOT_PIDS" ]; then ((TOTAL_ERRORS++)); fi
if [ "$HEALTH_3002" != "200" ]; then ((TOTAL_ERRORS++)); fi

if [ $TOTAL_ERRORS -eq 0 ]; then
    echo "🟢 System Status: HEALTHY"
    echo "   └─ All systems operational"
elif [ $TOTAL_ERRORS -eq 1 ]; then
    echo "🟡 System Status: WARNING"
    echo "   └─ Minor issues detected"
else
    echo "🔴 System Status: CRITICAL"
    echo "   └─ Multiple issues require attention"
fi

echo ""
echo "🔧 Maintenance Commands:"
echo "-----------------------"
echo "Restart bot: pkill -f 'node main.js' && sleep 2 && node main.js &"
echo "View logs: tail -f bot.log"
echo "Check ports: lsof -i :3001 && lsof -i :3002"
echo "Memory cleanup: sudo purge (macOS)"

echo ""
echo "📅 Next monitoring check recommended in 15 minutes"
echo "Run: ./monitor_performance.sh"
