#!/bin/bash

# TiltCheck Local Server Setup with PM2
# Keeps your server running continuously in background

echo "🔧 Setting up TiltCheck local server with PM2..."
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
else
    echo "✅ PM2 already installed"
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. Creating basic server..."
    
    cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Routes for TiltCheck pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pitchdeck', (req, res) => {
    res.sendFile(path.join(__dirname, 'pitchdeck.html'));
});

app.get('/justthetip', (req, res) => {
    res.sendFile(path.join(__dirname, 'justthetip-landing.html'));
});

app.get('/qualifyfirst', (req, res) => {
    res.sendFile(path.join(__dirname, 'qualifyfirst-landing.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 TiltCheck server running on http://localhost:${PORT}`);
    console.log(`📊 Pitch deck: http://localhost:${PORT}/pitchdeck.html`);
});
EOF
    
    echo "✅ Created server.js"
fi

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting TiltCheck server with PM2..."

# Start server with PM2
pm2 start server.js --name "tiltcheck-server"

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup

echo ""
echo "✅ TiltCheck server is now running continuously!"
echo ""
echo "🔗 Access your sites at:"
echo "   → Main site: http://localhost:3000"
echo "   → Pitch deck: http://localhost:3000/pitchdeck.html"
echo "   → JustTheTip: http://localhost:3000/justthetip-landing.html"
echo "   → QualifyFirst: http://localhost:3000/qualifyfirst-landing.html"
echo ""
echo "📋 PM2 Commands:"
echo "   → pm2 list              # Show running processes"
echo "   → pm2 logs tiltcheck-server  # View logs"
echo "   → pm2 restart tiltcheck-server  # Restart server"
echo "   → pm2 stop tiltcheck-server     # Stop server"
echo "   → pm2 delete tiltcheck-server   # Remove from PM2"
echo ""
echo "💡 Server will automatically restart if it crashes!"
echo "🔄 Server will start automatically when you reboot your computer!"