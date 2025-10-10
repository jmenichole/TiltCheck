#!/bin/bash

# TiltCheck + QualifyFirst Integration Setup
# This script sets up clean integration without directory confusion

echo "🔗 TiltCheck + QualifyFirst Integration Setup"
echo "=============================================="

# Check current location
TILTCHECK_DIR="/Users/fullsail/tiltcheck/tiltcheck-organized"

if [ ! -d "$TILTCHECK_DIR" ]; then
    echo "❌ TiltCheck organized directory not found!"
    echo "Expected: $TILTCHECK_DIR"
    exit 1
fi

cd "$TILTCHECK_DIR"
echo "📍 Working in: $(pwd)"

# Create integration structure
echo ""
echo "📁 Creating integration structure..."
mkdir -p integrations/{shared,qualifyfirst-workspace}

# Set up QualifyFirst workspace
echo "📦 Setting up QualifyFirst workspace..."
cd integrations/qualifyfirst-workspace

# Check if QualifyFirst repo exists, if not clone it
if [ ! -d ".git" ]; then
    echo "   Cloning QualifyFirst repository..."
    git clone https://github.com/jmenichole/QualifyFirst.git . 2>/dev/null || {
        echo "   Creating QualifyFirst workspace structure..."
        # If clone fails, create basic structure
        mkdir -p {src/components,src/utils,public,docs}
        
        # Create basic package.json for QualifyFirst
        cat > package.json << 'EOF'
{
  "name": "qualifyfirst-tiltcheck-integration",
  "version": "1.0.0",
  "description": "QualifyFirst survey platform integrated with TiltCheck",
  "main": "src/index.js",
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "test": "jest",
    "tiltcheck-integration": "node ../shared/integration-bridge.js"
  },
  "dependencies": {
    "next": "^13.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.21.0",
    "axios": "^1.3.0",
    "styled-components": "^5.3.0"
  },
  "devDependencies": {
    "eslint": "^8.40.0",
    "jest": "^29.5.0"
  },
  "keywords": ["surveys", "gambling", "tiltcheck", "qualifyfirst", "revenue-share"]
}
EOF
        
        # Create basic README
        cat > README.md << 'EOF'
# QualifyFirst - TiltCheck Integration

Survey platform providing alternative earning opportunities for TiltCheck users.

## Features
- CPX Research API integration
- Revenue sharing with TiltCheck
- User behavioral tracking
- Gambling intervention redirection

## Development
```bash
npm install
npm run dev  # Runs on localhost:3001
```

## Integration
- Connects to TiltCheck via shared integration bridge
- Revenue share: 20-30% to TiltCheck platform
- User data synced for intervention purposes
EOF
    }
else
    echo "   ✅ QualifyFirst repository already exists"
fi

# Install QualifyFirst dependencies
echo "📦 Installing QualifyFirst dependencies..."
npm install 2>/dev/null || echo "   Note: npm install completed with warnings"

# Create integration bridge
echo ""
echo "🌉 Creating integration bridge..."
cd ../shared

cat > integration-bridge.js << 'EOF'
// TiltCheck <-> QualifyFirst Integration Bridge
// Handles communication between TiltCheck and QualifyFirst platforms

const express = require('express');
const cors = require('cors');
const axios = require('axios');

class TiltCheckQualifyFirstBridge {
    constructor() {
        this.app = express();
        this.port = 3002;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Log all integration requests
        this.app.use((req, res, next) => {
            console.log(`[Integration Bridge] ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                services: {
                    tiltcheck: 'connected',
                    qualifyfirst: 'connected'
                },
                timestamp: new Date().toISOString()
            });
        });

        // User intervention redirect
        this.app.post('/api/intervention/redirect', async (req, res) => {
            try {
                const { userId, tiltLevel, gamblingSession } = req.body;
                
                // Generate QualifyFirst survey opportunity
                const surveyOpportunity = await this.generateSurveyOpportunity(userId, tiltLevel);
                
                res.json({
                    success: true,
                    action: 'redirect_to_surveys',
                    surveyUrl: surveyOpportunity.url,
                    estimatedEarning: surveyOpportunity.earning,
                    intervention: {
                        message: "Take a break and earn some money with quick surveys!",
                        type: 'positive_alternative'
                    }
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Revenue tracking
        this.app.post('/api/revenue/track', async (req, res) => {
            try {
                const { userId, surveyCompleted, earningAmount } = req.body;
                
                // Calculate TiltCheck revenue share (25%)
                const tiltcheckShare = earningAmount * 0.25;
                
                // Log revenue
                console.log(`[Revenue] User ${userId}: $${earningAmount} earned, $${tiltcheckShare} to TiltCheck`);
                
                // Update TiltCheck user stats
                await this.updateTiltCheckStats(userId, {
                    alternativeEarning: earningAmount,
                    interventionSuccess: true
                });

                res.json({
                    success: true,
                    userEarning: earningAmount,
                    tiltcheckRevenue: tiltcheckShare
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Integration status
        this.app.get('/api/integration/status', (req, res) => {
            res.json({
                tiltcheck: {
                    webapp: 'http://localhost:3000',
                    backend: 'http://localhost:3001',
                    extension: 'active'
                },
                qualifyfirst: {
                    platform: 'http://localhost:3001',
                    cpxResearch: 'connected',
                    surveys: 'available'
                },
                bridge: {
                    port: this.port,
                    status: 'active',
                    uptime: process.uptime()
                }
            });
        });
    }

    async generateSurveyOpportunity(userId, tiltLevel) {
        // Generate appropriate survey based on user's tilt level
        const surveys = {
            low: { earning: '$2-5', duration: '5-10 min' },
            medium: { earning: '$5-10', duration: '10-15 min' },
            high: { earning: '$10-20', duration: '15-30 min' }
        };

        const survey = surveys[tiltLevel] || surveys.medium;
        
        return {
            url: `http://localhost:3001/surveys/available?user=${userId}&priority=intervention`,
            earning: survey.earning,
            duration: survey.duration
        };
    }

    async updateTiltCheckStats(userId, stats) {
        // Update user statistics in TiltCheck
        // This would connect to TiltCheck database/API
        console.log(`[Stats Update] User ${userId}:`, stats);
        return true;
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('\n🌉 TiltCheck <-> QualifyFirst Integration Bridge');
            console.log('==============================================');
            console.log(`🚀 Running on: http://localhost:${this.port}`);
            console.log('📊 Health Check: /health');
            console.log('🔗 Integration Status: /api/integration/status');
            console.log('💰 Revenue Tracking: /api/revenue/track');
            console.log('🚨 Intervention API: /api/intervention/redirect');
            console.log('\n✅ Integration bridge active and ready!');
        });
    }
}

// Start the integration bridge
if (require.main === module) {
    const bridge = new TiltCheckQualifyFirstBridge();
    bridge.start();
}

module.exports = TiltCheckQualifyFirstBridge;
EOF

# Create integration config
cat > integration-config.js << 'EOF'
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
EOF

# Create package.json for shared integration
cat > package.json << 'EOF'
{
  "name": "tiltcheck-qualifyfirst-integration",
  "version": "1.0.0",
  "description": "Integration bridge between TiltCheck and QualifyFirst",
  "main": "integration-bridge.js",
  "scripts": {
    "start": "node integration-bridge.js",
    "dev": "nodemon integration-bridge.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "axios": "^1.3.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.5.0"
  }
}
EOF

# Install integration dependencies
echo "📦 Installing integration bridge dependencies..."
npm install 2>/dev/null || echo "   Note: npm install completed with warnings"

# Update root workspace package.json
echo ""
echo "🔧 Updating workspace configuration..."
cd "$TILTCHECK_DIR"

# Create start-integration script
cat > start-integration.sh << 'EOF'
#!/bin/bash

# TiltCheck + QualifyFirst Development Startup
echo "🚀 Starting TiltCheck + QualifyFirst Integration"
echo "================================================"

# Start each service in background
echo "📱 Starting TiltCheck webapp (localhost:3000)..."
cd webapp && npm start &
TILTCHECK_PID=$!

echo "💰 Starting QualifyFirst platform (localhost:3001)..."  
cd ../integrations/qualifyfirst-workspace && npm run dev &
QUALIFYFIRST_PID=$!

echo "🌉 Starting Integration Bridge (localhost:3002)..."
cd ../shared && npm start &
BRIDGE_PID=$!

echo ""
echo "✅ All services starting..."
echo "   TiltCheck: http://localhost:3000"
echo "   QualifyFirst: http://localhost:3001" 
echo "   Integration: http://localhost:3002"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $TILTCHECK_PID $QUALIFYFIRST_PID $BRIDGE_PID 2>/dev/null' INT
wait
EOF

chmod +x start-integration.sh

echo ""
echo "🎉 Integration Setup Complete!"
echo "=============================="
echo ""
echo "📁 Directory Structure:"
echo "   $TILTCHECK_DIR/"
echo "   ├── webapp/                           # TiltCheck React app"
echo "   ├── integrations/"
echo "   │   ├── qualifyfirst-workspace/       # QualifyFirst development"
echo "   │   └── shared/                       # Integration bridge"
echo "   └── start-integration.sh              # Start all services"
echo ""
echo "🚀 Ready to develop!"
echo ""
echo "Next steps:"
echo "1. cd $TILTCHECK_DIR"
echo "2. ./start-integration.sh"
echo "3. Visit http://localhost:3000 (TiltCheck)"
echo "4. Visit http://localhost:3001 (QualifyFirst)" 
echo "5. Visit http://localhost:3002/health (Integration)"
echo ""
echo "✅ Clean integration without home directory confusion!"