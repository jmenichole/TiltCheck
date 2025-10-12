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


# TrapHouse Bot Auto-Start Setup Script

echo "🏠 Setting up TrapHouse Bot for auto-start..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js first."
    exit 1
fi

# Get the Node.js path
NODE_PATH=$(which node)
echo "📍 Node.js found at: $NODE_PATH"

# Update the plist file with the correct Node.js path
sed -i '' "s|/usr/local/bin/node|$NODE_PATH|g" com.traphouse.discordbot.plist

# Copy the plist to the LaunchAgents directory
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCH_AGENTS_DIR"

cp com.traphouse.discordbot.plist "$LAUNCH_AGENTS_DIR/"
echo "✅ Copied launch agent to $LAUNCH_AGENTS_DIR"

# Load the launch agent
launchctl load "$LAUNCH_AGENTS_DIR/com.traphouse.discordbot.plist"
echo "✅ Launch agent loaded"

# Start the service immediately
launchctl start com.traphouse.discordbot
echo "✅ Bot service started"

echo ""
echo "🎉 TrapHouse Bot is now set to auto-start on system boot!"
echo ""
echo "📋 Useful commands:"
echo "  Start bot:   launchctl start com.traphouse.discordbot"
echo "  Stop bot:    launchctl stop com.traphouse.discordbot"
echo "  Restart bot: launchctl kickstart -k gui/$(id -u)/com.traphouse.discordbot"
echo "  View logs:   tail -f logs/bot.log"
echo "  View errors: tail -f logs/bot_error.log"
echo "  Uninstall:   ./uninstall_autostart.sh"
echo ""
echo "🔍 Check if running:"
echo "  launchctl list | grep traphouse"
