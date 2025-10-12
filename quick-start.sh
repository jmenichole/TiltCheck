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


# TiltCheck VPS Quick Start
# Run this on your VPS to deploy TiltCheck

echo "🚀 TiltCheck VPS Quick Start"
echo "============================"
echo ""

# Download and run the deployment script
echo "📥 Downloading deployment script..."
wget https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh

echo "🔧 Making script executable..."
chmod +x vps-deploy.sh

echo "🚀 Starting deployment..."
echo "⚠️  This script needs to run as root (will prompt for sudo)"
echo ""

sudo ./vps-deploy.sh
