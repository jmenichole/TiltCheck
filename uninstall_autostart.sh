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


# TrapHouse Bot Auto-Start Removal Script

echo "🗑️ Removing TrapHouse Bot auto-start..."

# Stop the service
launchctl stop com.traphouse.discordbot 2>/dev/null
echo "🛑 Stopped bot service"

# Unload the launch agent
launchctl unload "$HOME/Library/LaunchAgents/com.traphouse.discordbot.plist" 2>/dev/null
echo "📤 Unloaded launch agent"

# Remove the plist file
rm -f "$HOME/Library/LaunchAgents/com.traphouse.discordbot.plist"
echo "🗑️ Removed launch agent file"

echo ""
echo "✅ TrapHouse Bot auto-start has been removed"
echo "The bot will no longer start automatically on system boot."
