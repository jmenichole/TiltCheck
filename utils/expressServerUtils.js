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

/**
 * Shared Express Server Utilities
 * Eliminates duplicated server setup code across multiple files
 */

const express = require('express');
const cors = require('cors');

/**
 * Create and configure a standard Express application
 * @param {Object} options - Configuration options
 * @param {boolean} options.cors - Enable CORS (default: true)
 * @param {boolean} options.json - Enable JSON parsing (default: true)
 * @param {boolean} options.urlencoded - Enable URL encoded parsing (default: true)
 * @returns {express.Application} Configured Express app
 */
function createExpressApp(options = {}) {
    const {
        cors: enableCors = true,
        json: enableJson = true,
        urlencoded: enableUrlencoded = true
    } = options;

    const app = express();

    // Apply middleware based on options
    if (enableCors) {
        app.use(cors());
    }

    if (enableJson) {
        app.use(express.json());
    }

    if (enableUrlencoded) {
        app.use(express.urlencoded({ extended: true }));
    }

    return app;
}

/**
 * Create a standard health check endpoint
 * @param {express.Application} app - Express application
 * @param {Object} metadata - Additional metadata for health check
 * @returns {void}
 */
function addHealthCheckEndpoint(app, metadata = {}) {
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            ...metadata
        });
    });
}

/**
 * Create a standard API status endpoint
 * @param {express.Application} app - Express application
 * @param {Object} metadata - Additional metadata for status
 * @returns {void}
 */
function addStatusEndpoint(app, metadata = {}) {
    app.get('/api/status', (req, res) => {
        res.json({
            status: 'online',
            timestamp: new Date().toISOString(),
            ...metadata
        });
    });
}

/**
 * Start Express server with error handling
 * @param {express.Application} app - Express application
 * @param {number} port - Port to listen on
 * @param {string} serverName - Name for logging
 * @returns {Promise<Server>} HTTP server instance
 */
function startServer(app, port, serverName = 'Server') {
    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(port, () => {
                console.log(`✅ ${serverName} running on port ${port}`);
                resolve(server);
            });

            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`❌ Port ${port} is already in use`);
                } else {
                    console.error(`❌ Server error:`, error);
                }
                reject(error);
            });
        } catch (error) {
            console.error(`❌ Failed to start ${serverName}:`, error);
            reject(error);
        }
    });
}

/**
 * Add common security headers
 * @param {express.Application} app - Express application
 * @returns {void}
 */
function addSecurityHeaders(app) {
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
}

/**
 * Add ngrok bypass header (for development)
 * @param {express.Application} app - Express application
 * @returns {void}
 */
function addNgrokBypass(app) {
    app.use((req, res, next) => {
        res.setHeader('ngrok-skip-browser-warning', 'true');
        next();
    });
}

module.exports = {
    createExpressApp,
    addHealthCheckEndpoint,
    addStatusEndpoint,
    startServer,
    addSecurityHeaders,
    addNgrokBypass
};
