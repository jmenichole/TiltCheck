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

# Docker Production Deployment Script

set -e

DOMAIN=${1:-"localhost"}
EMAIL=${2:-"admin@${DOMAIN}"}

echo "🚀 Deploying TrapHouse to Production..."
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Verify environment file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from .env.docker template."
    exit 1
fi

# Update domain in environment
sed -i.bak "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env
sed -i.bak "s/EMAIL=.*/EMAIL=$EMAIL/" .env

echo "🏗️  Building production containers..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

echo "🔧 Setting up SSL certificates..."
mkdir -p ssl
if [ "$DOMAIN" != "localhost" ]; then
    echo "⚠️  For production SSL, you'll need to setup Let's Encrypt certificates"
    echo "   or place your certificates in the ssl/ directory"
fi

echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Health checks
echo "🔍 Running health checks..."
for service in webapp traphouse-bot; do
    if docker-compose -f docker-compose.prod.yml ps $service | grep -q "Up"; then
        echo "   ✅ $service is running"
    else
        echo "   ❌ $service failed to start"
    fi
done

echo ""
echo "📊 Production Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 Production URLs:"
if [ "$DOMAIN" != "localhost" ]; then
    echo "   Website:      https://$DOMAIN"
    echo "   API:          https://$DOMAIN/api/"
    echo "   Webhooks:     https://$DOMAIN/webhooks/"
else
    echo "   Website:      http://localhost"
    echo "   API:          http://localhost/api/"
fi

echo ""
echo "📋 Management Commands:"
echo "   View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop:         docker-compose -f docker-compose.prod.yml down"
echo "   Restart:      docker-compose -f docker-compose.prod.yml restart"
echo "   Update:       ./scripts/docker-deploy.sh $DOMAIN"

echo ""
echo "✅ Production deployment complete!"
