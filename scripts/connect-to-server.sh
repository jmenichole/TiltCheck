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

# Easy SSH Connection to TiltCheck Server

SERVER_HOST="server1.tiltcheck.it.com"
SERVER_USER="kvmnode202"
SERVER_PORT="6467"
SERVER_PASS="iVjgB6BM"

echo "🔗 Connecting to TiltCheck Server..."
echo "   Host: $SERVER_HOST"
echo "   User: $SERVER_USER"
echo "   Port: $SERVER_PORT"
echo ""

# Check if sshpass is available
if command -v sshpass &> /dev/null; then
    echo "🚀 Connecting with saved credentials..."
    sshpass -p "$SERVER_PASS" ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST"
else
    echo "🔑 Please enter password when prompted: $SERVER_PASS"
    ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST"
fi
