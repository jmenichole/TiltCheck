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

# Docker Health Check Script

set -e

echo "🏥 Running Docker Health Checks..."

COMPOSE_FILE="docker-compose.yml"
if [ "$1" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "   $service: "
    
    if ! docker-compose -f $COMPOSE_FILE ps $service | grep -q "Up"; then
        echo "❌ Not running"
        return 1
    fi
    
    if [ -n "$url" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        if [ "$response" = "$expected_code" ]; then
            echo "✅ Healthy (HTTP $response)"
        else
            echo "⚠️  Warning (HTTP $response)"
        fi
    else
        echo "✅ Running"
    fi
}

echo ""
echo "🔍 Service Health Status:"

# Check each service
check_service "webapp" "http://localhost:3000" "200"
check_service "traphouse-bot" "http://localhost:3001/health" "200"
check_service "nginx" "http://localhost/health" "200"
check_service "redis"

# Overall system health
echo ""
echo "📊 System Status:"

# Check Docker stats
echo "   🐳 Docker Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -6

# Check disk space
echo ""
echo "   💾 Disk Usage:"
df -h / | tail -1 | awk '{print "      Root: " $3 " used / " $2 " total (" $5 " used)"}'

# Check memory
echo "   🧠 Memory Usage:"
free -h | grep Mem | awk '{print "      RAM: " $3 " used / " $2 " total"}'

# Docker system info
echo ""
echo "   🔧 Docker Info:"
docker system df

echo ""
echo "✅ Health check complete!"
