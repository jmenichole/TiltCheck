// Integration Configuration
module.exports = {
    tiltcheck: {
        webapp: process.env.TILTCHECK_WEBAPP_URL || 'http://localhost:3000',
        api: process.env.TILTCHECK_API_URL || 'http://localhost:3001',
        extension: {
            enabled: true,
            chromeStoreId: 'tiltcheck-extension'
        }
    },
    
    qualifyfirst: {
        platform: process.env.QUALIFYFIRST_URL || 'http://localhost:3001',
        api: process.env.QUALIFYFIRST_API || 'http://localhost:3001/api',
        cpxResearch: {
            enabled: true,
            apiKey: process.env.CPX_RESEARCH_API_KEY,
            revenueShare: 0.25 // 25% to TiltCheck
        }
    },
    
    bridge: {
        port: process.env.BRIDGE_PORT || 3002,
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            credentials: true
        }
    },
    
    revenue: {
        tiltcheckShare: 0.25, // 25% revenue share
        trackingEnabled: true,
        payoutThreshold: 10.00 // Minimum $10 for payout
    },
    
    intervention: {
        tiltLevels: {
            low: { surveyPriority: 'standard', earning: '2-5' },
            medium: { surveyPriority: 'high', earning: '5-10' },
            high: { surveyPriority: 'urgent', earning: '10-20' }
        }
    }
};
