/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 */

const http = require('http');

const PORT = process.env.PORT || 3001;

// Create a simple health check server
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'TiltCheck Casino Fairness Verification System',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            uptime: process.uptime(),
            features: [
                'RTP Verification',
                'AI Fairness Monitoring',
                'Mobile Integration',
                'Provably Fair Verification',
                'Legal Compliance Monitoring'
            ]
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🏥 Health check server running on port ${PORT}`);
    console.log(`🎲 TiltCheck Casino Fairness Verification System`);
    console.log(`✅ Ready to verify casino fairness without API access`);
    console.log(`📊 Using statistical analysis, AI monitoring, and cryptographic verification`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('⚠️  SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
