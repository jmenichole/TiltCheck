#!/bin/bash

# TiltCheck.it.com Ecosystem Startup Script
# Manages all ports, services, and landing pages for the complete TrapHouse ecosystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="tiltcheck.it.com"
ENV=${NODE_ENV:-development}

# Port configuration
declare -A PORTS=(
    ["main"]="3000"
    ["justthetip"]="3001" 
    ["oauth"]="3002"
    ["degens"]="3003"
    ["collectclock"]="3004"
    ["beta"]="3335"
    ["analytics"]="3336"
    ["installer"]="4000"
    ["proxy"]="8080"
)

# Service commands
declare -A SERVICES=(
    ["main"]="node index.js"
    ["justthetip"]="node cryptoTipManager.js"
    ["oauth"]="node oauth-server.js"
    ["degens"]="node degens-server.js"
    ["collectclock"]="node collectclock-server.js"
    ["beta"]="node beta-testing-server.js"
    ["analytics"]="node analytics-server.js"
    ["installer"]="node desktop-installer-server.js"
    ["proxy"]="node tiltcheck-domain-integration.js"
)

echo -e "${BLUE}"
echo "████████╗██╗██╗  ████████╗ ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗"
echo "╚══██╔══╝██║██║  ╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝"
echo "   ██║   ██║██║     ██║   ██║     ███████║█████╗  ██║     █████╔╝ "
echo "   ██║   ██║██║     ██║   ██║     ██╔══██║██╔══╝  ██║     ██╔═██╗ "
echo "   ██║   ██║███████╗██║   ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗"
echo "   ╚═╝   ╚═╝╚══════╝╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${PURPLE}🌐 TiltCheck.it.com Ecosystem Manager${NC}"
echo "============================================="
echo -e "📍 Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "🔧 Environment: ${GREEN}${ENV}${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port)
    if [ ! -z "$pids" ]; then
        echo -e "🔄 Stopping service on port ${port}..."
        kill -9 $pids 2>/dev/null || true
        sleep 1
    fi
}

# Function to start service
start_service() {
    local service_name=$1
    local port=${PORTS[$service_name]}
    local command=${SERVICES[$service_name]}
    
    echo -e "${YELLOW}🚀 Starting ${service_name} service (port ${port})...${NC}"
    
    # Kill existing process on port
    kill_port $port
    
    # Start service in background
    nohup $command > logs/${service_name}.log 2>&1 &
    local pid=$!
    
    # Wait a moment and check if process is still running
    sleep 2
    if kill -0 $pid 2>/dev/null; then
        echo -e "${GREEN}✅ ${service_name} started successfully (PID: ${pid})${NC}"
        echo $pid > pids/${service_name}.pid
        return 0
    else
        echo -e "${RED}❌ Failed to start ${service_name}${NC}"
        return 1
    fi
}

# Function to stop service
stop_service() {
    local service_name=$1
    local pid_file="pids/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat $pid_file)
        if kill -0 $pid 2>/dev/null; then
            echo -e "${YELLOW}🛑 Stopping ${service_name} (PID: ${pid})...${NC}"
            kill -TERM $pid
            sleep 2
            if kill -0 $pid 2>/dev/null; then
                kill -9 $pid
            fi
            echo -e "${GREEN}✅ ${service_name} stopped${NC}"
        fi
        rm -f $pid_file
    fi
    
    # Also kill by port as backup
    kill_port ${PORTS[$service_name]}
}

# Function to check service status
check_service() {
    local service_name=$1
    local port=${PORTS[$service_name]}
    
    if check_port $port; then
        echo -e "${GREEN}✅ ${service_name}${NC} - Port ${port} - ${GREEN}Running${NC}"
        return 0
    else
        echo -e "${RED}❌ ${service_name}${NC} - Port ${port} - ${RED}Stopped${NC}"
        return 1
    fi
}

# Function to show service status
show_status() {
    echo -e "${BLUE}📊 Service Status:${NC}"
    echo "================================"
    
    local running=0
    local total=0
    
    for service in "${!PORTS[@]}"; do
        check_service $service
        if [ $? -eq 0 ]; then
            ((running++))
        fi
        ((total++))
    done
    
    echo "================================"
    echo -e "📈 Services: ${GREEN}${running}${NC}/${total} running"
    echo ""
    
    if [ $ENV = "development" ]; then
        echo -e "${BLUE}🔗 Development URLs:${NC}"
        echo "   • Main: http://localhost:${PORTS[proxy]}"
        echo "   • Beta: http://beta.localhost:${PORTS[proxy]}"
        echo "   • Dashboard: http://dashboard.localhost:${PORTS[proxy]}"
        echo "   • Installer: http://localhost:${PORTS[installer]}"
    else
        echo -e "${BLUE}🔗 Production URLs:${NC}"
        echo "   • Main: https://${DOMAIN}"
        echo "   • Beta: https://beta.${DOMAIN}"
        echo "   • Dashboard: https://dashboard.${DOMAIN}"
        echo "   • Installer: https://installer.${DOMAIN}"
    fi
    echo ""
}

# Function to start all services
start_all() {
    echo -e "${BLUE}🚀 Starting TiltCheck.it.com Ecosystem...${NC}"
    echo ""
    
    # Create necessary directories
    mkdir -p logs pids
    
    # Start services in order
    local services_order=("main" "justthetip" "oauth" "degens" "collectclock" "beta" "analytics" "installer" "proxy")
    
    for service in "${services_order[@]}"; do
        if [[ -n "${SERVICES[$service]}" ]]; then
            start_service $service
            sleep 1
        fi
    done
    
    echo ""
    echo -e "${GREEN}🎉 TiltCheck.it.com Ecosystem startup complete!${NC}"
    echo ""
    show_status
    
    echo -e "${YELLOW}💡 Next steps:${NC}"
    echo "   1. Visit http://localhost:${PORTS[proxy]} for main landing page"
    echo "   2. Visit http://localhost:${PORTS[installer]}/tos for beta testing"
    echo "   3. Check logs in ./logs/ directory"
    echo "   4. Use './start-tiltcheck.sh status' to monitor services"
}

# Function to stop all services
stop_all() {
    echo -e "${YELLOW}🛑 Stopping TiltCheck.it.com Ecosystem...${NC}"
    echo ""
    
    for service in "${!SERVICES[@]}"; do
        stop_service $service
    done
    
    echo ""
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Function to restart all services
restart_all() {
    echo -e "${BLUE}🔄 Restarting TiltCheck.it.com Ecosystem...${NC}"
    stop_all
    sleep 3
    start_all
}

# Function to show help
show_help() {
    echo -e "${BLUE}TiltCheck.it.com Ecosystem Manager${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show service status"
    echo "  logs      - Show recent logs"
    echo "  help      - Show this help message"
    echo ""
    echo "Individual service commands:"
    echo "  start-<service>  - Start specific service"
    echo "  stop-<service>   - Stop specific service"
    echo ""
    echo "Available services:"
    for service in "${!SERVICES[@]}"; do
        echo "  • $service (port ${PORTS[$service]})"
    done
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Recent Logs:${NC}"
    echo "=================="
    
    for service in "${!SERVICES[@]}"; do
        local log_file="logs/${service}.log"
        if [ -f "$log_file" ]; then
            echo -e "\n${YELLOW}📁 ${service}:${NC}"
            tail -5 $log_file
        fi
    done
}

# Main command handling
case "${1:-start}" in
    "start")
        start_all
        ;;
    "stop")
        stop_all
        ;;
    "restart")
        restart_all
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    start-*)
        service_name=${1#start-}
        if [[ -n "${SERVICES[$service_name]}" ]]; then
            mkdir -p logs pids
            start_service $service_name
        else
            echo -e "${RED}❌ Unknown service: $service_name${NC}"
            exit 1
        fi
        ;;
    stop-*)
        service_name=${1#stop-}
        if [[ -n "${SERVICES[$service_name]}" ]]; then
            stop_service $service_name
        else
            echo -e "${RED}❌ Unknown service: $service_name${NC}"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
