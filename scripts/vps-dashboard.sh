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

# VPS Management Dashboard for TrapHouse

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$HOME/traphouse-production/trap-house-discord-bot"

# Function to show header
show_header() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    🏠 TrapHouse VPS Dashboard                 ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Quick Status:${NC}"
    
    # Docker status
    if docker info >/dev/null 2>&1; then
        echo -e "   🐳 Docker: ${GREEN}Running${NC}"
    else
        echo -e "   🐳 Docker: ${RED}Not Available${NC}"
    fi
    
    # Container status
    if [ -d "$PROJECT_DIR" ]; then
        cd "$PROJECT_DIR"
        if docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "Up"; then
            UP_COUNT=$(docker-compose -f docker-compose.prod.yml ps | grep "Up" | wc -l)
            echo -e "   📦 Containers: ${GREEN}$UP_COUNT Running${NC}"
        else
            echo -e "   📦 Containers: ${RED}None Running${NC}"
        fi
    else
        echo -e "   📦 Project: ${RED}Not Found${NC}"
    fi
    
    # System load
    LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    echo -e "   ⚡ Load: ${YELLOW}$LOAD${NC}"
    
    # Memory usage
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')
    echo -e "   🧠 Memory: ${YELLOW}$MEM_USAGE${NC}"
    
    echo ""
}

# Function to show menu
show_menu() {
    echo -e "${CYAN}🎛️  Management Options:${NC}"
    echo ""
    echo "   ${BLUE}🚀 Deployment${NC}"
    echo "     1) 🏗️  Deploy/Update TrapHouse"
    echo "     2) 🔄 Restart All Services"
    echo "     3) 🛑 Stop All Services"
    echo "     4) 🔧 Rebuild Containers"
    echo ""
    echo "   ${BLUE}📊 Monitoring${NC}"
    echo "     5) 📋 View Live Logs"
    echo "     6) 📈 System Monitor"
    echo "     7) 🏥 Health Check"
    echo "     8) 🐳 Container Stats"
    echo ""
    echo "   ${BLUE}💾 Maintenance${NC}"
    echo "     9) 💾 Create Backup"
    echo "    10) 🧹 Clean Docker"
    echo "    11) 📦 Update System"
    echo "    12) 🔒 Renew SSL"
    echo ""
    echo "   ${BLUE}🔧 Configuration${NC}"
    echo "    13) ⚙️  Edit Environment"
    echo "    14) 🌐 Update Domain"
    echo "    15) 📂 File Manager"
    echo ""
    echo "    16) ❌ Exit"
    echo ""
    echo -n "   Select option (1-16): "
}

# Function to execute commands
execute_option() {
    case $1 in
        1)
            echo -e "${BLUE}🏗️  Deploying TrapHouse...${NC}"
            cd "$PROJECT_DIR"
            ./scripts/vps-deploy.sh
            read -p "Press Enter to continue..."
            ;;
        2)
            echo -e "${BLUE}🔄 Restarting services...${NC}"
            cd "$PROJECT_DIR"
            docker-compose -f docker-compose.prod.yml restart
            echo -e "${GREEN}✅ Services restarted${NC}"
            read -p "Press Enter to continue..."
            ;;
        3)
            echo -e "${BLUE}🛑 Stopping services...${NC}"
            cd "$PROJECT_DIR"
            docker-compose -f docker-compose.prod.yml down
            echo -e "${GREEN}✅ Services stopped${NC}"
            read -p "Press Enter to continue..."
            ;;
        4)
            echo -e "${BLUE}🔧 Rebuilding containers...${NC}"
            cd "$PROJECT_DIR"
            docker-compose -f docker-compose.prod.yml down
            docker-compose -f docker-compose.prod.yml build --no-cache
            docker-compose -f docker-compose.prod.yml up -d
            echo -e "${GREEN}✅ Containers rebuilt${NC}"
            read -p "Press Enter to continue..."
            ;;
        5)
            echo -e "${BLUE}📋 Starting live logs (Ctrl+C to exit)...${NC}"
            cd "$PROJECT_DIR"
            docker-compose -f docker-compose.prod.yml logs -f
            ;;
        6)
            echo -e "${BLUE}📈 System monitoring...${NC}"
            ./scripts/vps-monitor.sh
            read -p "Press Enter to continue..."
            ;;
        7)
            echo -e "${BLUE}🏥 Running health check...${NC}"
            ./scripts/docker-health.sh prod
            read -p "Press Enter to continue..."
            ;;
        8)
            echo -e "${BLUE}🐳 Container statistics:${NC}"
            docker stats --no-stream
            read -p "Press Enter to continue..."
            ;;
        9)
            echo -e "${BLUE}💾 Creating backup...${NC}"
            ./scripts/vps-backup.sh
            read -p "Press Enter to continue..."
            ;;
        10)
            echo -e "${BLUE}🧹 Cleaning Docker...${NC}"
            docker system prune -f
            docker volume prune -f
            echo -e "${GREEN}✅ Docker cleaned${NC}"
            read -p "Press Enter to continue..."
            ;;
        11)
            echo -e "${BLUE}📦 Updating system...${NC}"
            sudo apt update && sudo apt upgrade -y
            echo -e "${GREEN}✅ System updated${NC}"
            read -p "Press Enter to continue..."
            ;;
        12)
            echo -e "${BLUE}🔒 Renewing SSL certificates...${NC}"
            sudo certbot renew
            cd "$PROJECT_DIR"
            docker-compose -f docker-compose.prod.yml restart nginx
            echo -e "${GREEN}✅ SSL renewed${NC}"
            read -p "Press Enter to continue..."
            ;;
        13)
            echo -e "${BLUE}⚙️  Opening environment editor...${NC}"
            cd "$PROJECT_DIR"
            nano .env
            echo -e "${YELLOW}⚠️  Don't forget to restart services if you made changes${NC}"
            read -p "Press Enter to continue..."
            ;;
        14)
            echo -e "${BLUE}🌐 Domain configuration...${NC}"
            echo -n "Enter new domain: "
            read NEW_DOMAIN
            echo -n "Enter email: "
            read EMAIL
            cd "$PROJECT_DIR"
            ./scripts/vps-deploy.sh "$NEW_DOMAIN" "$EMAIL"
            read -p "Press Enter to continue..."
            ;;
        15)
            echo -e "${BLUE}📂 File manager...${NC}"
            cd "$PROJECT_DIR"
            echo "Current directory: $(pwd)"
            echo ""
            ls -la
            echo ""
            echo "Available commands:"
            echo "  ls -la          - List files"
            echo "  nano <file>     - Edit file"
            echo "  cat <file>      - View file"
            echo "  tail -f <file>  - Follow file"
            echo ""
            echo -n "Enter command (or 'exit'): "
            read COMMAND
            if [ "$COMMAND" != "exit" ]; then
                eval "$COMMAND"
            fi
            read -p "Press Enter to continue..."
            ;;
        16)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option${NC}"
            read -p "Press Enter to continue..."
            ;;
    esac
}

# Main loop
while true; do
    show_header
    show_status
    show_menu
    read CHOICE
    execute_option "$CHOICE"
done
