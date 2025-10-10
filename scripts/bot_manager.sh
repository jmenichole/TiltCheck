#!/bin/bash

# Enhanced TrapHouse Bot Startup Script
# This script includes error handling, logging, and auto-restart capabilities

# Configuration
BOT_DIR="/Users/fullsail/Desktop/traphouse_discordbot"
LOG_DIR="$BOT_DIR/logs"
PID_FILE="$LOG_DIR/bot.pid"
LOG_FILE="$LOG_DIR/bot.log"
ERROR_LOG="$LOG_DIR/bot_error.log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if bot is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to start the bot
start_bot() {
    if is_running; then
        log "🤖 Bot is already running (PID: $(cat $PID_FILE))"
        return 0
    fi
    
    log "🚀 Starting TrapHouse Bot..."
    
    # Change to bot directory
    cd "$BOT_DIR" || {
        log "❌ Failed to change to bot directory: $BOT_DIR"
        return 1
    }
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log "❌ .env file not found! Please create it with your Discord bot token."
        return 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log "📦 Installing dependencies..."
        npm install || {
            log "❌ Failed to install dependencies"
            return 1
        }
    fi
    
    # Start the bot in background
    nohup node index.js >> "$LOG_FILE" 2>> "$ERROR_LOG" &
    BOT_PID=$!
    
    # Save PID
    echo "$BOT_PID" > "$PID_FILE"
    
    # Wait a moment and check if it's still running
    sleep 3
    if is_running; then
        log "✅ TrapHouse Bot started successfully (PID: $BOT_PID)"
        log "🏠 Welcome to the streets! 💯"
        return 0
    else
        log "❌ Bot failed to start. Check error log: $ERROR_LOG"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Function to stop the bot
stop_bot() {
    if ! is_running; then
        log "🤖 Bot is not running"
        return 0
    fi
    
    PID=$(cat "$PID_FILE")
    log "🛑 Stopping TrapHouse Bot (PID: $PID)..."
    
    kill "$PID"
    
    # Wait for graceful shutdown
    for i in {1..10}; do
        if ! is_running; then
            log "✅ Bot stopped successfully"
            rm -f "$PID_FILE"
            return 0
        fi
        sleep 1
    done
    
    # Force kill if still running
    log "⚠️ Force stopping bot..."
    kill -9 "$PID" 2>/dev/null
    rm -f "$PID_FILE"
    log "✅ Bot force stopped"
}

# Function to restart the bot
restart_bot() {
    log "🔄 Restarting TrapHouse Bot..."
    stop_bot
    sleep 2
    start_bot
}

# Function to show status
status() {
    if is_running; then
        PID=$(cat "$PID_FILE")
        log "🟢 TrapHouse Bot is running (PID: $PID)"
        
        # Show recent log entries
        echo ""
        echo "📄 Recent log entries:"
        tail -5 "$LOG_FILE"
    else
        log "🔴 TrapHouse Bot is not running"
    fi
}

# Function to show logs
show_logs() {
    if [ "$1" = "error" ]; then
        echo "📄 Error logs:"
        tail -20 "$ERROR_LOG"
    else
        echo "📄 Bot logs:"
        tail -20 "$LOG_FILE"
    fi
}

# Function to monitor and auto-restart
monitor() {
    log "👀 Starting bot monitor..."
    
    while true; do
        if ! is_running; then
            log "⚠️ Bot is not running! Attempting restart..."
            start_bot
        fi
        sleep 30
    done
}

# Main script logic
case "$1" in
    start)
        start_bot
        ;;
    stop)
        stop_bot
        ;;
    restart)
        restart_bot
        ;;
    status)
        status
        ;;
    logs)
        show_logs "$2"
        ;;
    monitor)
        monitor
        ;;
    *)
        echo "🏠 TrapHouse Bot Management Script"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|logs|monitor}"
        echo ""
        echo "Commands:"
        echo "  start    - Start the bot"
        echo "  stop     - Stop the bot"
        echo "  restart  - Restart the bot"
        echo "  status   - Show bot status"
        echo "  logs     - Show recent logs"
        echo "  logs error - Show error logs"
        echo "  monitor  - Start monitoring mode (auto-restart)"
        echo ""
        exit 1
        ;;
esac
