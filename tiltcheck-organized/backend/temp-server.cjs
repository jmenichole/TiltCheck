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

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    console.log('📡 Request:', req.method, req.url);
    
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'OK', 
            message: 'TiltCheck is running',
            timestamp: new Date().toISOString() 
        }));
        return;
    }
    
    // Determine file path
    let filePath = req.url === '/' ? 'index.html' : req.url.slice(1);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'File not found',
            url: req.url,
            message: 'The requested file was not found on this server',
            available_pages: [
                '/ (index.html)',
                '/demo.html', 
                '/overlay-demo.html', 
                '/simple-demo.html',
                '/test-casino-site.html',
                '/health (API endpoint)'
            ]
        }));
        return;
    }
    
    // Set content type based on file extension
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript', 
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };
    
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
});

const port = 3000;
server.listen(port, () => {
    console.log(`🚀 TiltCheck server is now running!`);
    console.log(`📍 URL: http://localhost:${port}`);
    console.log(`💓 Health check: http://localhost:${port}/health`);
    console.log(`📄 Available pages: /, /demo.html, /overlay-demo.html, /simple-demo.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed gracefully');
        process.exit(0);
    });
});
