/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

const { createExpressApp, addHealthCheckEndpoint, addStatusEndpoint, startServer } = require('./utils/expressServerUtils');

// Create Express app with default middleware
const app = createExpressApp();

// Add health check endpoint with custom metadata
addHealthCheckEndpoint(app, {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    bot: 'TrapHouse Discord Bot',
    platform: 'Railway',
    domain: 'tiltcheck.it.com',
    features: [
        'TiltCheck Integration',
        'CollectClock Portal', 
        'Degen Balance System',
        'JustTheTip Integration',
        'AIM Control Panel'
    ],
    services: {
        discord: 'Connected',
        express: 'Running',
        tiltcheck: 'Active',
        collectclock: 'Integrated'
    }
});

// Add API status endpoint with custom metadata
addStatusEndpoint(app, {
    platform: 'TiltCheck.it.com',
    bot: 'TrapHouse Discord Bot',
    features: ['TiltCheck', 'CollectClock', 'Degen Balance'],
    version: '1.0.0'
});

// Start health check server
const HEALTH_PORT = process.env.HEALTH_PORT || 3001;
startServer(app, HEALTH_PORT, '🏥 Health check server').catch(console.error);

module.exports = app;
