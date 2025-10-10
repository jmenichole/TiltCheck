# 🏠 TrapHouse Discord Server Template

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com)
[![Discord](https://img.shields.io/badge/Discord-Bots-5865F2?style=for-the-badge&logo=discord)](https://discord.com)
[![Production](https://img.shields.io/badge/Production-Ready-00C851?style=for-the-badge)](https://github.com)
[![Monitored](https://img.shields.io/badge/Monitored-Grafana-FF6900?style=for-the-badge&logo=grafana)](https://grafana.com)

> **Professional Discord Bot Ecosystem with Docker Deployment**
> 
> Complete production-ready Discord server template featuring 4 specialized bots, payment systems, OAuth integration, monitoring, and horizontal scaling capabilities.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/jmenichole/trap-house-discord-bot.git
cd trap-house-discord-bot

# Configure environment
cp .env.server .env
# Edit .env with your Discord tokens and configuration

# Deploy entire ecosystem
chmod +x deploy-server.sh
./deploy-server.sh
```

**🎉 Your professional Discord bot ecosystem will be live in under 5 minutes!**

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    🌐 Nginx Reverse Proxy                   │
│                     (SSL Termination)                       │
└─────────────────────┬───────────────────────────────────────┘
                     │
┌─────────────────────┴───────────────────────────────────────┐
│                  🤖 Discord Bot Ecosystem                   │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ 🏠 TrapHouse │ 💡 JustTheTip│ 💧 CollectCl.│ 🎰 Degens         │
│ Main Bot    │ Payment Bot │ Utility Bot │ Card Game Bot     │
│ Port: 3001  │ Port: 3002  │ Port: 3003  │ Port: 3004        │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
                     │
┌─────────────────────┴───────────────────────────────────────┐
│              🗃 Data & Infrastructure Layer                 │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ 🐘 PostgreSQL│ 🔴 Redis    │ 📊 Prometheus│ 📈 Grafana        │
│ Database    │ Cache/Queue │ Metrics     │ Dashboards        │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

## 🤖 Bot Ecosystem

### 🏠 **TrapHouse Main Bot** (Port 3001)
- **Core Features**: Respect system, user management, community commands
- **API Endpoint**: `/api/traphouse/`
- **Specialized**: Community engagement and core Discord functionality

### 💡 **JustTheTip Bot** (Port 3002)
- **Core Features**: Payment processing, crypto integration, Stripe/Solana
- **API Endpoint**: `/api/justthetip/`
- **Specialized**: Financial transactions and tip management

### 💧 **CollectClock Bot** (Port 3003)
- **Core Features**: Scheduling, reminders, automation utilities
- **API Endpoint**: `/api/collectclock/`
- **Specialized**: Time-based services and automation

### 🎰 **Degens Bot** (Port 3004)
- **Core Features**: Card games, gambling mechanics, entertainment
- **API Endpoint**: `/api/degens/`
- **Specialized**: Gaming and entertainment features

## 📊 Production Features

### 🔐 **Security**
- ✅ SSL/TLS encryption (HTTPS)
- ✅ Rate limiting (10 req/s API, 5 req/s webhooks)
- ✅ Security headers (HSTS, XSS protection)
- ✅ JWT authentication for OAuth
- ✅ Environment isolation

### 📈 **Monitoring & Observability**
- ✅ **Prometheus** metrics collection
- ✅ **Grafana** dashboards and alerts
- ✅ Health checks for all services
- ✅ Structured logging with rotation
- ✅ Performance monitoring

### 🚀 **Scaling & Deployment**
- ✅ **Docker Compose** orchestration
- ✅ Horizontal scaling support
- ✅ Zero-downtime deployments
- ✅ Load balancing with Nginx
- ✅ Service discovery

### 💾 **Data Management**
- ✅ **PostgreSQL** for persistent data
- ✅ **Redis** for caching and sessions
- ✅ Automatic database migrations
- ✅ Data backup strategies
- ✅ Volume persistence

## 🌐 Access Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| 🌐 **Main Site** | `https://traphouse.dev` | Landing page and OAuth |
| 📈 **Grafana** | `https://dashboard.traphouse.dev` | Monitoring dashboards |
| 🔧 **Prometheus** | `https://traphouse.dev/metrics` | Raw metrics (auth required) |
| 🏠 **TrapHouse API** | `https://traphouse.dev/api/traphouse/` | Main bot API |
| 💡 **JustTheTip API** | `https://traphouse.dev/api/justthetip/` | Payment bot API |
| 💧 **CollectClock API** | `https://traphouse.dev/api/collectclock/` | Utility bot API |
| 🎰 **Degens API** | `https://traphouse.dev/api/degens/` | Gaming bot API |
| 🔐 **OAuth** | `https://traphouse.dev/auth/discord` | Discord authentication |
| 🪝 **Webhooks** | `https://traphouse.dev/webhooks/` | GitHub webhooks |

## ⚙️ Configuration

### 🔧 Environment Variables

```bash
# Bot Tokens (Required)
TRAPHOUSE_BOT_TOKEN=your_traphouse_bot_token
JUSTTHETIP_BOT_TOKEN=your_justthetip_bot_token
COLLECTCLOCK_BOT_TOKEN=your_collectclock_bot_token
DEGENS_BOT_TOKEN=your_degens_bot_token

# Database
DB_PASSWORD=secure_password_here
REDIS_URL=redis://redis:6379

# Domain & SSL
DOMAIN=traphouse.dev
EMAIL=admin@traphouse.com

# OAuth & Security
DISCORD_CLIENT_ID=1373784722718720090
DISCORD_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret
```

### 🎯 Discord Setup

1. **Create Discord Applications** (4 bots)
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create applications for each bot
   - Copy bot tokens to environment

2. **Configure OAuth Redirects**
   ```
   https://traphouse.dev/auth/callback
   ```

3. **Set Bot Permissions**
   ```
   - Send Messages
   - Manage Messages  
   - Read Message History
   - Use Slash Commands
   - Manage Roles (optional)
   ```

## 🚀 Deployment Options

### 🔄 **Option 1: One-Click Deploy**
```bash
./deploy-server.sh
```

### ⚡ **Option 2: Manual Docker**
```bash
# Build and start
docker-compose -f docker-compose.server.yml up -d

# Scale specific bot
docker-compose -f docker-compose.server.yml up -d --scale traphouse-bot=3

# View logs
docker-compose -f docker-compose.server.yml logs -f
```

### 🛠 **Option 3: Development Mode**
```bash
# Local development
docker-compose up -d redis postgres
npm install
npm run dev
```

## 📊 Monitoring & Maintenance

### 📈 **Grafana Dashboards**
- **Bot Performance**: Response times, command usage, error rates
- **Infrastructure**: CPU, memory, disk usage, network I/O
- **Business Metrics**: User engagement, transactions, growth

### 🔍 **Health Checks**
```bash
# Check all services
curl https://traphouse.dev/health

# Individual bot health
curl https://traphouse.dev/api/traphouse/health
curl https://traphouse.dev/api/justthetip/health
```

### 📋 **Logs & Debugging**
```bash
# View all logs
docker-compose -f docker-compose.server.yml logs -f

# Specific service logs
docker-compose -f docker-compose.server.yml logs -f traphouse-bot

# Database logs
docker-compose -f docker-compose.server.yml logs -f postgres
```

## 🔄 Scaling & Performance

### 📈 **Horizontal Scaling**
```bash
# Scale TrapHouse bot to 3 instances
docker-compose -f docker-compose.server.yml up -d --scale traphouse-bot=3

# Scale all bots
docker-compose -f docker-compose.server.yml up -d \
  --scale traphouse-bot=2 \
  --scale justthetip-bot=2 \
  --scale collectclock-bot=2 \
  --scale degens-bot=2
```

### ⚡ **Performance Optimization**
- **Redis caching** for frequently accessed data
- **Database indexing** for optimal query performance
- **Connection pooling** for database connections
- **Rate limiting** to prevent abuse
- **CDN integration** for static assets

## 🛡 Security Features

### 🔐 **Built-in Security**
- ✅ **HTTPS enforcement** with automatic redirects
- ✅ **Security headers** (HSTS, XSS, CSRF protection)
- ✅ **Rate limiting** per IP address
- ✅ **Input validation** and sanitization
- ✅ **Environment isolation** with Docker
- ✅ **Secret management** with environment variables

### 🔒 **Best Practices**
- ✅ **Non-root containers** for security
- ✅ **Health checks** for service monitoring
- ✅ **Graceful shutdowns** with proper signal handling
- ✅ **Log rotation** to prevent disk filling
- ✅ **Backup strategies** for data persistence

## 📞 Support & Documentation

### 🆘 **Common Commands**
```bash
# Restart all services
docker-compose -f docker-compose.server.yml restart

# Update and redeploy
git pull && ./deploy-server.sh

# Backup database
docker exec traphouse-db pg_dump -U traphouse traphouse > backup.sql

# View service status
docker-compose -f docker-compose.server.yml ps
```

### 📚 **Additional Resources**
- [Discord Bot Setup Guide](./DISCORD_SETUP.md)
- [Payment Integration Guide](./PAYMENT_SETUP.md)
- [Monitoring Configuration](./MONITORING_SETUP.md)
- [Scaling Best Practices](./SCALING_GUIDE.md)

### 🎯 **Custom Install Links**
Your professional Discord bot installation experience:
```
https://discord.com/oauth2/authorize?client_id=1373784722718720090&permissions=414539926592&scope=bot&redirect_uri=https%3A%2F%2Ftraphouse.dev%2Fauth%2Fcallback&response_type=code
```

---

## 🎉 Production Ready

**This template provides everything needed for a professional Discord bot ecosystem:**

✅ **Multi-bot architecture** with specialized functions  
✅ **Production-grade infrastructure** with monitoring  
✅ **Scalable deployment** with Docker orchestration  
✅ **Professional branding** with custom OAuth flow  
✅ **Enterprise security** with SSL and rate limiting  
✅ **Business intelligence** with metrics and dashboards  

**Deploy your Discord server template in minutes, scale to thousands of users! 🚀**
