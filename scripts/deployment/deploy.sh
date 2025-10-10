#!/bin/bash

# TiltCheck Ecosystem Production Deployment Script
# Deploys Discord bot, casino transparency system, and TiltCheck servers

echo "🚀 TiltCheck Ecosystem Production Deployment"
echo "========================================="
echo "Date: $(date)"
echo ""

# Set working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Install/update npm packages
install_packages() {
    print_status "Installing/updating npm packages..."
    
    if [ -f "package.json" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_success "Packages installed successfully"
        else
            print_error "Failed to install packages"
            exit 1
        fi
    else
        print_warning "No package.json found, skipping npm install"
    fi
}

# Check environment variables
check_env() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning "No .env file found. Creating template..."
        cat > .env << EOF
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_GUILD_ID=your_discord_guild_id_here

# TiltCheck API Configuration
TILTCHECK_API_PORT=4001
TILTCHECK_API_HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/tiltcheck
REDIS_URL=redis://localhost:6379

# Crypto Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_infura_key
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_infura_key

# External APIs
COLLECTCLOCK_API_KEY=your_collectclock_api_key
CASINO_API_KEYS=your_casino_api_keys

# Production URLs
PRODUCTION_URL=https://tiltcheck.it.com
ECOSYSTEM_URL=https://tiltcheckecosystem.created.app
EOF
        print_warning "Please edit .env file with your actual configuration"
    else
        print_success "Environment file found"
    fi
}

# Start Discord Bot
start_discord_bot() {
    print_status "Starting Discord Bot..."
    
    # Check if bot.js exists
    if [ -f "bot.js" ]; then
        # Start bot in background
        nohup node bot.js > logs/discord-bot.log 2>&1 &
        BOT_PID=$!
        echo $BOT_PID > pids/discord-bot.pid
        print_success "Discord Bot started (PID: $BOT_PID)"
    else
        print_error "bot.js not found"
        return 1
    fi
}

# Start TiltCheck API Server
start_tiltcheck_server() {
    print_status "Starting TiltCheck API Server..."
    
    if [ -f "enhanced_suslink_server.js" ]; then
        # Start TiltCheck server in background
        nohup node enhanced_suslink_server.js > logs/tiltcheck-server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > pids/tiltcheck-server.pid
        print_success "TiltCheck Server started on port 4001 (PID: $SERVER_PID)"
    else
        print_error "enhanced_suslink_server.js not found"
        return 1
    fi
}

# Start Casino Transparency System
start_transparency_system() {
    print_status "Starting Casino Transparency System..."
    
    if [ -f "enhanced_casino_profile_system.js" ]; then
        # Start transparency system in background
        nohup node enhanced_casino_profile_system.js > logs/transparency-system.log 2>&1 &
        TRANSPARENCY_PID=$!
        echo $TRANSPARENCY_PID > pids/transparency-system.pid
        print_success "Casino Transparency System started (PID: $TRANSPARENCY_PID)"
    else
        print_error "enhanced_casino_profile_system.js not found"
        return 1
    fi
}

# Create necessary directories
setup_directories() {
    print_status "Setting up directories..."
    
    mkdir -p logs
    mkdir -p pids
    mkdir -p data/backups
    mkdir -p data/nft-metadata
    mkdir -p data/casino-profiles
    
    print_success "Directories created"
}

# Register Discord slash commands
register_slash_commands() {
    print_status "Registering Discord slash commands..."
    
    if [ -f "register-commands.js" ]; then
        node register-commands.js
        if [ $? -eq 0 ]; then
            print_success "Slash commands registered"
        else
            print_warning "Failed to register some slash commands"
        fi
    else
        print_warning "register-commands.js not found, skipping slash command registration"
    fi
}

# Health check function
health_check() {
    print_status "Performing health checks..."
    
    # Check Discord Bot
    if [ -f "pids/discord-bot.pid" ]; then
        BOT_PID=$(cat pids/discord-bot.pid)
        if kill -0 $BOT_PID 2>/dev/null; then
            print_success "Discord Bot is running (PID: $BOT_PID)"
        else
            print_error "Discord Bot is not running"
        fi
    fi
    
    # Check TiltCheck Server
    if [ -f "pids/tiltcheck-server.pid" ]; then
        SERVER_PID=$(cat pids/tiltcheck-server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            print_success "TiltCheck Server is running (PID: $SERVER_PID)"
            # Test API endpoint
            if command -v curl &> /dev/null; then
                if curl -s http://localhost:4001/ > /dev/null; then
                    print_success "TiltCheck API is responding"
                else
                    print_warning "TiltCheck API is not responding"
                fi
            fi
        else
            print_error "TiltCheck Server is not running"
        fi
    fi
    
    # Check Transparency System
    if [ -f "pids/transparency-system.pid" ]; then
        TRANSPARENCY_PID=$(cat pids/transparency-system.pid)
        if kill -0 $TRANSPARENCY_PID 2>/dev/null; then
            print_success "Casino Transparency System is running (PID: $TRANSPARENCY_PID)"
        else
            print_error "Casino Transparency System is not running"
        fi
    fi
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    REPORT_FILE="logs/deployment-$(date +%Y%m%d-%H%M%S).log"
    
    cat > "$REPORT_FILE" << EOF
TiltCheck Ecosystem Deployment Report
=====================================
Date: $(date)
User: $(whoami)
Host: $(hostname)
Directory: $(pwd)

System Status:
EOF
    
    # Add process status to report
    if [ -f "pids/discord-bot.pid" ]; then
        echo "Discord Bot PID: $(cat pids/discord-bot.pid)" >> "$REPORT_FILE"
    fi
    
    if [ -f "pids/tiltcheck-server.pid" ]; then
        echo "TiltCheck Server PID: $(cat pids/tiltcheck-server.pid)" >> "$REPORT_FILE"
    fi
    
    if [ -f "pids/transparency-system.pid" ]; then
        echo "Transparency System PID: $(cat pids/transparency-system.pid)" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    echo "Environment Variables:" >> "$REPORT_FILE"
    echo "DISCORD_BOT_TOKEN: $([ -n "$DISCORD_BOT_TOKEN" ] && echo "Set" || echo "Not Set")" >> "$REPORT_FILE"
    echo "TILTCHECK_API_PORT: ${TILTCHECK_API_PORT:-4001}" >> "$REPORT_FILE"
    
    print_success "Deployment report saved to $REPORT_FILE"
}

# Stop all services
stop_services() {
    print_status "Stopping all services..."
    
    # Stop Discord Bot
    if [ -f "pids/discord-bot.pid" ]; then
        BOT_PID=$(cat pids/discord-bot.pid)
        if kill -0 $BOT_PID 2>/dev/null; then
            kill $BOT_PID
            print_success "Discord Bot stopped"
        fi
        rm -f pids/discord-bot.pid
    fi
    
    # Stop TiltCheck Server
    if [ -f "pids/tiltcheck-server.pid" ]; then
        SERVER_PID=$(cat pids/tiltcheck-server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            print_success "TiltCheck Server stopped"
        fi
        rm -f pids/tiltcheck-server.pid
    fi
    
    # Stop Transparency System
    if [ -f "pids/transparency-system.pid" ]; then
        TRANSPARENCY_PID=$(cat pids/transparency-system.pid)
        if kill -0 $TRANSPARENCY_PID 2>/dev/null; then
            kill $TRANSPARENCY_PID
            print_success "Casino Transparency System stopped"
        fi
        rm -f pids/transparency-system.pid
    fi
}

# Main deployment function
deploy() {
    print_status "Starting TiltCheck Ecosystem deployment..."
    
    # Setup
    setup_directories
    check_dependencies
    check_env
    install_packages
    
    # Stop existing services
    stop_services
    sleep 2
    
    # Start services
    start_discord_bot
    sleep 3
    
    start_tiltcheck_server
    sleep 3
    
    start_transparency_system
    sleep 3
    
    # Register commands
    register_slash_commands
    
    # Health check
    sleep 5
    health_check
    
    # Generate report
    generate_report
    
    echo ""
    print_success "🎉 TiltCheck Ecosystem deployment complete!"
    echo ""
    echo "📊 Service Status:"
    echo "  • Discord Bot: Running on Discord servers"
    echo "  • TiltCheck API: http://localhost:4001"
    echo "  • Casino Transparency: Background analysis system"
    echo ""
    echo "📋 Available Commands:"
    echo "  • /casino-transparency rankings - View casino rankings"
    echo "  • /casino-transparency profile [casino] - Detailed analysis"
    echo "  • /casino-transparency api-status - API availability"
    echo "  • /casino-transparency compliance - Gambling awareness"
    echo "  • /casino-transparency nft-verify - NFT verification status"
    echo ""
    echo "📁 Logs Location: ./logs/"
    echo "🔧 To stop services: ./deploy.sh stop"
    echo "🔍 To check status: ./deploy.sh status"
    echo ""
    echo "🌟 Made 4 Degens by Degens ❤️"
}

# Handle command line arguments
case "${1:-deploy}" in
    "deploy"|"start")
        deploy
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 3
        deploy
        ;;
    "status")
        health_check
        ;;
    "logs")
        echo "📋 Recent logs:"
        echo "==============="
        if [ -f "logs/discord-bot.log" ]; then
            echo "Discord Bot (last 10 lines):"
            tail -10 logs/discord-bot.log
            echo ""
        fi
        if [ -f "logs/tiltcheck-server.log" ]; then
            echo "TiltCheck Server (last 10 lines):"
            tail -10 logs/tiltcheck-server.log
            echo ""
        fi
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  deploy/start  - Deploy and start all services"
        echo "  stop          - Stop all services"
        echo "  restart       - Restart all services"
        echo "  status        - Check service status"
        echo "  logs          - Show recent logs"
        exit 1
        ;;
esac
