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


echo "🧪 TrapHouse Comprehensive Beta Environment - Auto-Restart"
echo "========================================================"

source .env.beta
restart_count=0
max_restarts=10

while [ $restart_count -lt $max_restarts ]; do
    echo "$(date): [Attempt $((restart_count + 1))] Starting comprehensive beta server..."
    
    # Start the comprehensive beta server
    node beta-testing-server.js
    exit_code=$?
    
    # If exit code is 0, server was stopped gracefully
    if [ $exit_code -eq 0 ]; then
        echo "$(date): Beta server stopped gracefully"
        break
    fi
    
    # If server crashed, increment restart count
    restart_count=$((restart_count + 1))
    echo "$(date): Beta server crashed (exit code: $exit_code), restarting in 5 seconds..."
    sleep 5
done

if [ $restart_count -eq $max_restarts ]; then
    echo "$(date): Maximum restart attempts reached. Check logs for issues."
    exit 1
fi
