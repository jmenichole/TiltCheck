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


# TrapHouse Discord Bot Startup Script
echo "🏠 Starting TrapHouse Discord Bot..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ No .env file found!"
    echo "📝 Copy .env.example to .env and add your Discord bot token"
    echo "cp .env.example .env"
    echo "Then edit .env with your bot token"
    exit 1
fi

# Check if Discord token is set
if grep -q "your_bot_token_here" .env; then
    echo "❌ Please set your Discord bot token in .env file"
    echo "Edit .env and replace 'your_bot_token_here' with your actual bot token"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting bot..."
node index.js
