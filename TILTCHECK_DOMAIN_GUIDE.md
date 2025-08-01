# 🌐 TiltCheck.it.com Domain Integration

Complete port forwarding and landing page system for the TrapHouse Discord Bot ecosystem.

## 🎯 Overview

This integration provides:
- **Comprehensive port mapping** for all TrapHouse services
- **Desktop-only beta testing** environment
- **Professional landing pages** with TiltCheck.it.com branding
- **Automated service management** and health monitoring
- **OAuth callback handling** with custom success pages

## 🔗 Port Architecture

### Service Mapping
```
┌─────────────────────────────────────────────────────────────┐
│                    TiltCheck.it.com                         │
│                   (Proxy Port: 8080)                       │
├─────────────────────────────────────────────────────────────┤
│ Service           │ Port │ Subdomain                        │
├─────────────────────────────────────────────────────────────┤
│ Main TrapHouse    │ 3000 │ tiltcheck.it.com                │
│ JustTheTip Bot    │ 3001 │ bot.tiltcheck.it.com            │
│ OAuth/Auth        │ 3002 │ auth.tiltcheck.it.com           │
│ Degens Cards      │ 3003 │ cards.tiltcheck.it.com          │
│ CollectClock      │ 3004 │ collectclock.tiltcheck.it.com   │
│ Beta Testing      │ 3335 │ beta.tiltcheck.it.com           │
│ Analytics         │ 3336 │ dashboard.tiltcheck.it.com      │
│ Desktop Installer │ 4000 │ installer.tiltcheck.it.com      │
└─────────────────────────────────────────────────────────────┘
```

### Additional Subdomains
- `api.tiltcheck.it.com` → Main API (Port 3000)
- `tilt.tiltcheck.it.com` → TiltCheck Monitor (Port 3000)
- `vault.tiltcheck.it.com` → Crypto Vault (Port 3001)
- `portal.tiltcheck.it.com` → CollectClock Portal (Port 3004)
- `admin.tiltcheck.it.com` → Admin Dashboard (Port 3336)

## 🚀 Quick Start

### 1. Start Complete Ecosystem
```bash
./start-tiltcheck.sh start
```

### 2. Individual Service Management
```bash
# Start specific service
./start-tiltcheck.sh start-beta
./start-tiltcheck.sh start-analytics

# Stop specific service  
./start-tiltcheck.sh stop-proxy
./start-tiltcheck.sh stop-installer

# Check status
./start-tiltcheck.sh status

# View logs
./start-tiltcheck.sh logs
```

### 3. Environment Configuration
```bash
# Development (default)
NODE_ENV=development ./start-tiltcheck.sh start

# Production
NODE_ENV=production ./start-tiltcheck.sh start
```

## 📋 Access Points

### Development URLs
- **Main Landing**: http://localhost:8080
- **Beta Testing**: http://localhost:4000/tos
- **Analytics Dashboard**: http://localhost:8080/dashboard
- **Service Health**: http://localhost:8080/health

### Production URLs  
- **Main Landing**: https://tiltcheck.it.com
- **Beta Testing**: https://installer.tiltcheck.it.com/tos
- **Analytics Dashboard**: https://dashboard.tiltcheck.it.com
- **Bot Installation**: https://bot.tiltcheck.it.com

## 🛠️ Core Components

### 1. Domain Integration (`tiltcheck-domain-integration.js`)
- **Primary router** and subdomain handler
- **Landing page generation** for all services
- **Proxy management** with error handling
- **Health monitoring** and service discovery

### 2. Desktop Installer (`desktop-installer-server.js`)
- **Desktop-only access** enforcement
- **TOS/agreements** handling
- **Dashboard overlay** launch after acceptance
- **Mobile device blocking**

### 3. Ecosystem Manager (`start-tiltcheck.sh`)
- **Service orchestration** and lifecycle management
- **Port conflict resolution**
- **Log aggregation** and monitoring
- **Graceful shutdown** handling

### 4. Environment Config (`.env.tiltcheck`)
- **Complete port mapping** configuration
- **Service URL** definitions
- **Feature flags** and security settings
- **Development/production** environment support

---

**🏠 TrapHouse - TiltCheck.it.com | Enhanced Balance Support for Degen + Mindful Integration**
