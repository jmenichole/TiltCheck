# TrapHouse Discord Server Template - Quick Start Commands

# 🚀 SIMPLE COMMANDS (Docker Official Style)
# ===============================================

# 🔧 Development Mode (Hot Reload)
docker compose up -d                    # Start development environment
docker compose down                     # Stop development environment
docker compose logs -f                  # View logs
docker compose ps                       # View running containers

# 🚀 PRODUCTION COMMANDS (TrapHouse Enhanced)
# =============================================

# 🚀 One-Click Production Deployment
./deploy-server.sh

# 🔍 Health Check (Run Anytime)
./health-check.sh
./pre-deployment-check.sh

# 📊 View All Services (Production)
docker-compose -f docker-compose.server.yml ps

# 📋 View Logs (Production)
docker-compose -f docker-compose.server.yml logs -f

# 🔄 Restart All Services (Production)
docker-compose -f docker-compose.server.yml restart

# 📈 Scale Specific Bot
docker-compose -f docker-compose.server.yml up -d --scale traphouse-bot=3

# � Scale All Bots (High Load)
docker-compose -f docker-compose.server.yml up -d \
  --scale traphouse-bot=2 \
  --scale justthetip-bot=2 \
  --scale collectclock-bot=2 \
  --scale degens-bot=2

# �🛑 Stop All Services
docker-compose -f docker-compose.server.yml down

# 🔧 Rebuild and Deploy
docker-compose -f docker-compose.server.yml down
docker-compose -f docker-compose.server.yml build --no-cache
docker-compose -f docker-compose.server.yml up -d

# 🔄 Rolling Update (Zero Downtime)
docker-compose -f docker-compose.server.yml up -d --scale traphouse-bot=2
docker-compose -f docker-compose.server.yml up -d --scale traphouse-bot=1

# 💾 Database Backup
docker exec traphouse-db pg_dump -U traphouse traphouse > backup-$(date +%Y%m%d).sql

# 🔐 Generate New SSL Certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/traphouse.key \
  -out nginx/ssl/traphouse.crt \
  -subj "/C=US/ST=State/L=City/O=TrapHouse/CN=traphouse.dev"

# 📊 Monitor Resource Usage
docker stats

# 🔍 Check Individual Service
curl http://localhost:3001/health  # TrapHouse Bot
curl http://localhost:3002/health  # JustTheTip Bot  
curl http://localhost:3003/health  # CollectClock Bot
curl http://localhost:3004/health  # Degens Bot

# 🌐 Access Points
echo "Main Site: http://localhost"
echo "Grafana: http://localhost:3010"
echo "Prometheus: http://localhost:9090"

# 🎯 Test OAuth Flow
curl -I http://localhost:3002/auth/discord
