// Desktop Installer Server for TrapHouse Beta
// Only allows desktop clients, forwards ports, and launches dashboard overlay after TOS/agreements

const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({});

const BETA_PORT = 3335;
const ANALYTICS_PORT = 3336;
const DASHBOARD_OVERLAY_URL = `http://localhost:${ANALYTICS_PORT}/dashboard`;

// Middleware: Block mobile clients
app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) {
    return res.status(403).send('Beta testing is only supported on desktop at this time.');
  }
  next();
});

// Serve TOS and agreements page
app.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, 'tos.html'));
});

// Accept agreements endpoint
app.post('/accept-tos', express.json(), (req, res) => {
  // Here you would record acceptance in a DB or file
  res.json({ success: true, message: 'Agreements accepted. Launching dashboard overlay...' });
});

// Proxy/forward beta dashboard requests to the analytics server (dashboard overlay)
app.use('/dashboard', (req, res) => {
  proxy.web(req, res, { target: `http://localhost:${ANALYTICS_PORT}` });
});

// Proxy/forward all other beta requests to the beta server
app.use('/', (req, res) => {
  proxy.web(req, res, { target: `http://localhost:${BETA_PORT}` });
});

// Start the installer server
const INSTALLER_PORT = 4000;
app.listen(INSTALLER_PORT, () => {
  console.log(`🖥️ Desktop Installer Server running on http://localhost:${INSTALLER_PORT}`);
  console.log('Only desktop clients are allowed. Beta dashboard overlay will launch after agreements.');
});
