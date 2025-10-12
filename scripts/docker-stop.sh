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

# Docker Stop Script

set -e

echo "🛑 Stopping TrapHouse Docker Environment..."

# Check which compose file to use
if [ -f "docker-compose.prod.yml" ] && docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "🔧 Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
else
    echo "🔧 Stopping development environment..."
    docker-compose down
fi

echo ""
echo "🧹 Cleanup Options:"
echo "   Remove volumes:    docker-compose down -v"
echo "   Remove images:     docker-compose down --rmi all"
echo "   Full cleanup:      docker system prune -a"
echo ""
echo "✅ All services stopped!"
