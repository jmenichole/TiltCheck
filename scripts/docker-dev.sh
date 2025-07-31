#!/bin/bash
# Docker Development Environment Startup Script

set -e

echo "🐳 Starting TrapHouse Docker Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file with your actual tokens and keys!"
    echo "   Then run this script again."
    exit 1
fi

# Create necessary directories
mkdir -p data logs ssl nginx/conf.d

# Build and start services
echo "🏗️  Building Docker containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

# Show service URLs
echo ""
echo "🌐 Service URLs:"
echo "   Webapp:       http://localhost:3000"
echo "   TrapHouse Bot: http://localhost:3001"
echo "   Degens Bot:   http://localhost:3002"
echo "   Nginx Proxy:  http://localhost:80"
echo "   Redis:        localhost:6379"

echo ""
echo "📋 Useful Commands:"
echo "   View logs:    ./scripts/docker-logs.sh"
echo "   Stop all:     ./scripts/docker-stop.sh"
echo "   Restart:      docker-compose restart"
echo "   Shell access: docker-compose exec traphouse-bot sh"

echo ""
echo "✅ Development environment is ready!"
