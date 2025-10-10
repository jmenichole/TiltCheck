const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    console.log('Request:', req.method, req.url);
    
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'OK', 
            message: 'TiltCheck is running',
            timestamp: new Date().toISOString() 
        }));
        return;
    }
    
    let filePath = req.url === '/' ? './tiltcheck/index.html' : './tiltcheck/' + req.url.slice(1);
    
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'File not found',
            url: req.url,
            message: 'The requested file was not found',
            available: ['/', '/demo.html', '/overlay-demo.html', '/simple-demo.html', '/health']
        }));
        return;
    }
    
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json'
    };
    
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
});

const port = 3000;
server.listen(port, () => {
    console.log(`🚀 TiltCheck server running on http://localhost:${port}`);
    console.log(`💓 Health check: http://localhost:${port}/health`);
    console.log(`🏠 Main page: http://localhost:${port}/`);
});
