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


# TrapHouse Discord Bot Auto-Restart Script
# This script automatically restarts the bot when it crashes or when files change

echo "🤖 TrapHouse Discord Bot Auto-Restart Manager"
echo "============================================="
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to display menu
show_menu() {
    echo "Choose auto-restart method:"
    echo "1) Nodemon (File watching + auto-restart)"
    echo "2) Forever (Crash recovery)"
    echo "3) PM2 (Production process manager)"
    echo "4) Simple loop (Basic restart on crash)"
    echo "5) Install dependencies"
    echo "6) Stop all running instances"
    echo "7) View logs"
    echo "8) Exit"
    echo ""
    read -p "Enter your choice (1-8): " choice
}

# Function to install dependencies
install_deps() {
    echo "📦 Installing auto-restart dependencies..."
    npm install nodemon forever pm2 --save-dev
    echo "✅ Dependencies installed!"
}

# Function to start with nodemon (file watching)
start_nodemon() {
    echo "🔄 Starting bot with Nodemon (auto-restart on file changes)..."
    echo "   - Watches: .js, .json files"
    echo "   - Ignores: node_modules, .git, test files"
    echo "   - Delay: 2 seconds after change"
    echo ""
    npm run auto-restart
}

# Function to start with forever (crash recovery)
start_forever() {
    echo "♾️  Starting bot with Forever (crash recovery)..."
    echo "   - Auto-restart on crash"
    echo "   - Minimum uptime: 1 second"
    echo "   - Max restarts: 5 in 10 minutes"
    echo ""
    npm run forever
    echo "✅ Bot started with Forever!"
    echo "   - Logs: forever.log, out.log, err.log"
    echo "   - Stop with: npm run forever-stop"
}

# Function to start with PM2 (production)
start_pm2() {
    echo "🚀 Starting bot with PM2 (production process manager)..."
    echo "   - Auto-restart on crash or file changes"
    echo "   - Memory monitoring"
    echo "   - Advanced logging"
    echo ""
    npm run pm2
    echo "✅ Bot started with PM2!"
    echo "   - Monitor: pm2 monit"
    echo "   - Logs: npm run pm2-logs"
    echo "   - Stop: npm run pm2-stop"
}

# Function to start with simple loop
start_simple() {
    echo "🔁 Starting bot with simple restart loop..."
    echo "   - Restarts immediately on crash"
    echo "   - Press Ctrl+C to stop"
    echo ""
    
    while true; do
        echo "$(date): Starting TrapHouse Discord Bot..."
        node index.js
        echo "$(date): Bot crashed or stopped. Restarting in 3 seconds..."
        sleep 3
    done
}

# Function to stop all instances
stop_all() {
    echo "🛑 Stopping all running instances..."
    
    # Stop Forever
    forever stopall 2>/dev/null
    
    # Stop PM2
    pm2 delete all 2>/dev/null
    
    # Kill any remaining node processes (be careful with this)
    # pkill -f "node index.js" 2>/dev/null
    
    echo "✅ All instances stopped!"
}

# Function to view logs
view_logs() {
    echo "📋 Available logs:"
    echo "1) Forever logs"
    echo "2) PM2 logs"
    echo "3) Direct bot output"
    echo ""
    read -p "Which logs do you want to see? (1-3): " log_choice
    
    case $log_choice in
        1)
            echo "Forever logs:"
            [ -f forever.log ] && tail -f forever.log || echo "No forever.log found"
            ;;
        2)
            npm run pm2-logs
            ;;
        3)
            echo "Starting bot in direct mode (Ctrl+C to stop):"
            node index.js
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
}

# Main script loop
while true; do
    show_menu
    
    case $choice in
        1)
            start_nodemon
            break
            ;;
        2)
            start_forever
            break
            ;;
        3)
            start_pm2
            break
            ;;
        4)
            start_simple
            break
            ;;
        5)
            install_deps
            ;;
        6)
            stop_all
            ;;
        7)
            view_logs
            ;;
        8)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
