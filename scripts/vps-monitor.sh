#!/bin/bash
# VPS Monitoring Script for TrapHouse

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 TrapHouse VPS Monitoring${NC}"
echo "=========================="

PROJECT_DIR="$HOME/traphouse-production/trap-house-discord-bot"

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# System Information
echo -e "${BLUE}🖥️  System Information:${NC}"
echo "   Hostname: $(hostname)"
echo "   Uptime: $(uptime -p)"
echo "   Load: $(uptime | awk -F'load average:' '{print $2}')"

# Memory Usage
echo ""
echo -e "${BLUE}🧠 Memory Usage:${NC}"
free -h | grep -E "Mem|Swap" | while read line; do
    echo "   $line"
done

# Disk Usage
echo ""
echo -e "${BLUE}💾 Disk Usage:${NC}"
df -h / | tail -1 | awk '{print "   Root: " $3 " used / " $2 " total (" $5 " used)"}'

# Docker Container Status
echo ""
echo -e "${BLUE}🐳 Docker Container Status:${NC}"
if docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "Up"; then
    docker-compose -f docker-compose.prod.yml ps | grep -E "Name|---" -A 10
else
    echo -e "${RED}   ❌ No containers running${NC}"
fi

# Container Resource Usage
echo ""
echo -e "${BLUE}📈 Container Resource Usage:${NC}"
if docker ps -q >/dev/null 2>&1; then
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | head -6
else
    echo -e "${RED}   ❌ Docker not accessible${NC}"
fi

# Service Health Checks
echo ""
echo -e "${BLUE}🏥 Service Health Checks:${NC}"

# Check webapp
if curl -sf http://localhost:3000/api/health >/dev/null 2>&1; then
    echo -e "   ✅ Webapp: ${GREEN}Healthy${NC}"
else
    echo -e "   ❌ Webapp: ${RED}Unhealthy${NC}"
fi

# Check nginx
if curl -sf http://localhost/health >/dev/null 2>&1; then
    echo -e "   ✅ Nginx: ${GREEN}Healthy${NC}"
else
    echo -e "   ❌ Nginx: ${RED}Unhealthy${NC}"
fi

# Check redis
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo -e "   ✅ Redis: ${GREEN}Healthy${NC}"
else
    echo -e "   ❌ Redis: ${RED}Unhealthy${NC}"
fi

# SSL Certificate Status
echo ""
echo -e "${BLUE}🔒 SSL Certificate Status:${NC}"
if [ -d "/etc/letsencrypt/live" ] && [ "$(ls -A /etc/letsencrypt/live)" ]; then
    for domain in /etc/letsencrypt/live/*/; do
        if [ -d "$domain" ]; then
            domain_name=$(basename "$domain")
            expiry=$(sudo openssl x509 -enddate -noout -in "$domain/cert.pem" 2>/dev/null | cut -d= -f2)
            if [ -n "$expiry" ]; then
                echo "   📜 $domain_name: Expires $expiry"
            fi
        fi
    done
else
    echo "   ℹ️  No SSL certificates found"
fi

# Recent Logs (last 5 entries)
echo ""
echo -e "${BLUE}📋 Recent Application Logs:${NC}"
if docker-compose -f docker-compose.prod.yml logs --tail=5 2>/dev/null | head -10; then
    echo "   (Use 'docker-compose -f docker-compose.prod.yml logs -f' for live logs)"
else
    echo -e "${RED}   ❌ Cannot access logs${NC}"
fi

# Network Connections
echo ""
echo -e "${BLUE}🌐 Network Status:${NC}"
echo "   Active connections:"
ss -tuln | grep -E ":80|:443|:3000|:3001|:3002|:6379" | while read line; do
    echo "     $line"
done

# Backup Status
echo ""
echo -e "${BLUE}💾 Backup Information:${NC}"
if [ -d "backups" ]; then
    latest_backup=$(ls -t backups/ 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        echo "   📦 Latest backup: $latest_backup"
    else
        echo "   ⚠️  No backups found"
    fi
else
    echo "   ⚠️  Backup directory not found"
fi

# System Services
echo ""
echo -e "${BLUE}⚙️  System Services:${NC}"
for service in docker fail2ban ufw; do
    if systemctl is-active --quiet $service; then
        echo -e "   ✅ $service: ${GREEN}Active${NC}"
    else
        echo -e "   ❌ $service: ${RED}Inactive${NC}"
    fi
done

# TrapHouse service
if systemctl is-enabled --quiet traphouse 2>/dev/null; then
    if systemctl is-active --quiet traphouse; then
        echo -e "   ✅ traphouse: ${GREEN}Active${NC}"
    else
        echo -e "   ❌ traphouse: ${RED}Inactive${NC}"
    fi
else
    echo -e "   ℹ️  traphouse: Not configured as service"
fi

# Quick Action Menu
echo ""
echo -e "${BLUE}🎛️  Quick Actions:${NC}"
echo "   1. View live logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   2. Restart services: docker-compose -f docker-compose.prod.yml restart"
echo "   3. Update deployment: git pull && docker-compose -f docker-compose.prod.yml up -d --build"
echo "   4. Check disk usage: du -sh * | sort -hr"
echo "   5. System update: sudo apt update && sudo apt upgrade"

echo ""
echo -e "${GREEN}✅ Monitoring complete!${NC}"
