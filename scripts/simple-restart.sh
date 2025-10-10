#!/bin/bash

# Simple Auto-Restart Script for TrapHouse Discord Bot
# No additional dependencies required

echo "🤖 TrapHouse Discord Bot - Simple Auto-Restart"
echo "==============================================="
echo ""

# Function to start bot with restart loop
start_with_restart() {
    echo "🔄 Starting bot with automatic restart on crash..."
    echo "   Press Ctrl+C to stop the auto-restart loop"
    echo ""
    
    restart_count=0
    max_restarts=10
    
    while [ $restart_count -lt $max_restarts ]; do
        echo "$(date): [Attempt $((restart_count + 1))] Starting TrapHouse Discord Bot..."
        
        # Start the bot
        node index.js
        exit_code=$?
        
        # If exit code is 0, bot was stopped gracefully
        if [ $exit_code -eq 0 ]; then
            echo "$(date): Bot stopped gracefully (exit code 0)"
            break
        fi
        
        # If bot crashed, increment restart count
        restart_count=$((restart_count + 1))
        echo "$(date): Bot crashed (exit code $exit_code). Restart $restart_count/$max_restarts"
        
        if [ $restart_count -lt $max_restarts ]; then
            echo "$(date): Restarting in 5 seconds..."
            sleep 5
        else
            echo "$(date): Maximum restart limit reached ($max_restarts). Stopping auto-restart."
            echo "$(date): Check for recurring errors and restart manually when ready."
        fi
    done
}

# Function to start bot normally
start_normal() {
    echo "▶️  Starting bot normally (no auto-restart)..."
    node index.js
}

# Function to test your new tilt protection
test_tilt_protection() {
    echo "🧪 Testing your personalized tilt protection..."
    echo ""
    echo "This will test if your \$mytilt commands work:"
    echo ""
    
    # Test the modules
    node -e "
    try {
        console.log('🔍 Testing PersonalizedTiltProtection...');
        const PersonalizedTiltProtection = require('./personalizedTiltProtection');
        const protection = new PersonalizedTiltProtection();
        console.log('✅ PersonalizedTiltProtection loaded successfully');
        
        console.log('');
        console.log('🎯 Your bot should now respond to:');
        console.log('   \$mytilt setup     - Create your tilt profile');
        console.log('   \$mytilt emergency - Emergency protection');
        console.log('   \$mytilt patterns  - View your tilt patterns');
        console.log('   \$mytilt analyze   - Stake Originals explanation');
        console.log('');
        console.log('💡 Make sure to restart your bot after file changes!');
        
    } catch (error) {
        console.error('❌ Error testing tilt protection:', error.message);
    }
    "
}

# Main menu
echo "Choose an option:"
echo "1) Start bot with auto-restart (recommended)"
echo "2) Start bot normally (no auto-restart)"
echo "3) Test tilt protection system"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        start_with_restart
        ;;
    2)
        start_normal
        ;;
    3)
        test_tilt_protection
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
