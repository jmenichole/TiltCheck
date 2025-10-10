const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    if (req.url === '/health') {
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            message: 'TiltCheck server is running!'
        }));
    } else {
        res.end(JSON.stringify({
            message: 'TiltCheck Demo Server',
            endpoints: ['/health', '/api/players'],
            timestamp: new Date().toISOString()
        }));
    }
});

const port = 3001;
server.listen(port, () => {
    console.log(`🌟 Simple TiltCheck server running on http://localhost:${port}`);
    console.log(`💓 Test health: curl http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📡 Shutting down...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});