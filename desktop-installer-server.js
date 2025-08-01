// Desktop Installer Server for TrapHouse Beta
// Only allows desktop clients, forwards ports, and launches dashboard overlay after TOS/agreements
// Integrated with TiltCheck.it.com domain system

const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({});

// Domain configuration
const DOMAIN = process.env.DOMAIN || 'tiltcheck.it.com';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BASE_URL = IS_DEVELOPMENT ? 'http://localhost' : `https://${DOMAIN}`;

// Port configuration matching tiltcheck-domain-integration.js
const PORTS = {
    BETA: process.env.BETA_PORT || 3335,
    ANALYTICS: process.env.ANALYTICS_PORT || 3336,
    INSTALLER: process.env.INSTALLER_PORT || 4000
};

const DASHBOARD_OVERLAY_URL = `${BASE_URL}:${PORTS.ANALYTICS}/dashboard`;

console.log(`🖥️ Desktop Installer Server for ${DOMAIN}`);
console.log(`🔧 Environment: ${IS_DEVELOPMENT ? 'Development' : 'Production'}`);
console.log(`📍 Beta Port: ${PORTS.BETA}, Analytics Port: ${PORTS.ANALYTICS}`);

// Middleware: Block mobile clients
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) {
    return res.status(403).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Desktop Only - TiltCheck</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #1a1a2e; 
            color: #fff; 
            text-align: center; 
            padding: 100px 20px; 
        }
        .container { max-width: 400px; margin: 0 auto; }
        .icon { font-size: 4rem; margin-bottom: 30px; }
        .title { font-size: 1.5rem; color: #ff6b6b; margin-bottom: 20px; }
        .message { color: #ccc; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🖥️</div>
        <div class="title">Desktop Only</div>
        <div class="message">
            Beta testing is only supported on desktop at this time.
            <br><br>
            Please visit <strong>${DOMAIN}</strong> from a desktop computer to access the beta environment.
        </div>
    </div>
</body>
</html>`);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'desktop-installer',
    domain: DOMAIN,
    ports: PORTS,
    timestamp: new Date().toISOString()
  });
});

// Serve TOS and agreements page
app.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, 'tos.html'));
});

// Accept agreements endpoint
app.post('/accept-tos', express.json(), (req, res) => {
  // Record acceptance with enhanced logging
  const acceptanceData = {
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    domain: DOMAIN
  };
  
  console.log('📋 TOS Accepted:', acceptanceData);
  
  res.json({ 
    success: true, 
    message: 'Agreements accepted. Launching dashboard overlay...',
    redirectUrl: '/dashboard'
  });
});

// Proxy/forward beta dashboard requests to the analytics server (dashboard overlay)
app.use('/dashboard', (req, res) => {
  const target = IS_DEVELOPMENT ? `http://localhost:${PORTS.ANALYTICS}` : `https://dashboard.${DOMAIN}`;
  proxy.web(req, res, { target }, (error) => {
    if (error) {
      console.error('❌ Dashboard proxy error:', error.message);
      res.status(503).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Unavailable</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #1a1a2e; 
            color: #fff; 
            text-align: center; 
            padding: 100px 20px; 
        }
        .retry-btn { 
            background: #00ff88; 
            color: #000; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 8px; 
            text-decoration: none; 
            font-weight: bold; 
            margin-top: 20px; 
            display: inline-block; 
        }
    </style>
</head>
<body>
    <div>
        <h2>🔧 Dashboard Temporarily Unavailable</h2>
        <p>The analytics dashboard is currently starting up.</p>
        <a href="/dashboard" class="retry-btn">Retry</a>
        <a href="/" class="retry-btn">Return Home</a>
    </div>
</body>
</html>`);
    }
  });
});

// Proxy/forward all other beta requests to the beta server
app.use('/', (req, res, next) => {
  // Skip if already handled by other routes
  if (req.path === '/health' || req.path === '/tos' || req.path === '/accept-tos' || req.path.startsWith('/dashboard')) {
    return next();
  }
  
  const target = IS_DEVELOPMENT ? `http://localhost:${PORTS.BETA}` : `https://beta.${DOMAIN}`;
  proxy.web(req, res, { target }, (error) => {
    if (error) {
      console.error('❌ Beta proxy error:', error.message);
      res.status(503).json({
        error: 'Beta service unavailable',
        message: 'Please try again in a moment',
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Start the installer server
app.listen(PORTS.INSTALLER, () => {
  console.log(`🖥️ Desktop Installer Server running on ${BASE_URL}:${PORTS.INSTALLER}`);
  console.log('✅ Desktop-only access enforced');
  console.log('📊 Dashboard overlay launches after agreements');
  console.log(`🔗 TOS Page: ${BASE_URL}:${PORTS.INSTALLER}/tos`);
  console.log(`🎯 Dashboard: ${BASE_URL}:${PORTS.INSTALLER}/dashboard`);
});
