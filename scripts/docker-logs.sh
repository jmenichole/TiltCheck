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

# Docker Logs Viewer Script

set -e

SERVICE=${1:-"all"}

echo "📋 Viewing Docker Logs..."

case $SERVICE in
    "all")
        echo "🔍 Showing logs for all services..."
        docker-compose logs -f --tail=100
        ;;
    "traphouse"|"traphouse-bot")
        echo "🏠 Showing TrapHouse bot logs..."
        docker-compose logs -f --tail=100 traphouse-bot
        ;;
    "degens"|"degens-bot")
        echo "🎲 Showing Degens bot logs..."
        docker-compose logs -f --tail=100 degens-bot
        ;;
    "webapp"|"web")
        echo "🌐 Showing webapp logs..."
        docker-compose logs -f --tail=100 webapp
        ;;
    "nginx"|"proxy")
        echo "🔧 Showing nginx logs..."
        docker-compose logs -f --tail=100 nginx
        ;;
    "redis")
        echo "💾 Showing Redis logs..."
        docker-compose logs -f --tail=100 redis
        ;;
    *)
        echo "❌ Unknown service: $SERVICE"
        echo ""
        echo "Available services:"
        echo "   all          - All services (default)"
        echo "   traphouse    - TrapHouse Discord bot"
        echo "   degens       - Degens Against Decency bot"
        echo "   webapp       - Marketing webapp"
        echo "   nginx        - Reverse proxy"
        echo "   redis        - Redis cache"
        echo ""
        echo "Usage: $0 [service]"
        exit 1
        ;;
esac
