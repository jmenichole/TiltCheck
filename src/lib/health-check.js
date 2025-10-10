const express = require('express');
const app = express();

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
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
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        platform: 'TiltCheck.it.com',
        bot: 'TrapHouse Discord Bot',
        features: ['TiltCheck', 'CollectClock', 'Degen Balance'],
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Start health check server
const HEALTH_PORT = process.env.HEALTH_PORT || 3001;
app.listen(HEALTH_PORT, () => {
    console.log(`🏥 Health check server running on port ${HEALTH_PORT}`);
    console.log(`📊 Health endpoint: http://localhost:${HEALTH_PORT}/health`);
});

module.exports = app;
