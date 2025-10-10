# QualifyFirst Development Guide - Integrated with TiltCheck

## 🚀 Quick Start

### Start Development Environment
```bash
cd /Users/fullsail/tiltcheck/tiltcheck-organized
./start-integration.sh
```

This starts:
- TiltCheck webapp: http://localhost:3000
- QualifyFirst platform: http://localhost:3001  
- Integration bridge: http://localhost:3002

### Development Workflow

#### Working on QualifyFirst
```bash
# Navigate to QualifyFirst workspace
cd /Users/fullsail/tiltcheck/tiltcheck-organized/integrations/qualifyfirst-workspace

# Your QualifyFirst development commands
npm run dev          # Start development server
npm run build        # Build for production
npm test            # Run tests
```

#### Working on TiltCheck
```bash
# Navigate to TiltCheck webapp
cd /Users/fullsail/tiltcheck/tiltcheck-organized/webapp

# Your TiltCheck development commands  
npm start           # Start development server
npm test            # Run tests
npm run build       # Build for production
```

#### Integration Development
```bash
# Navigate to integration bridge
cd /Users/fullsail/tiltcheck/tiltcheck-organized/integrations/shared

# Integration bridge commands
npm start           # Start integration API
npm run dev         # Start with auto-reload
npm test            # Test integration endpoints
```

## 🔗 Integration Points

### Revenue Sharing API
```javascript
// When user completes survey in QualifyFirst
POST http://localhost:3002/api/revenue/track
{
  "userId": "user123",
  "surveyCompleted": true,
  "earningAmount": 5.00
}

// Response includes TiltCheck revenue share (25%)
{
  "success": true,
  "userEarning": 5.00,
  "tiltcheckRevenue": 1.25
}
```

### Gambling Intervention API
```javascript
// When TiltCheck detects tilt behavior
POST http://localhost:3002/api/intervention/redirect
{
  "userId": "user123", 
  "tiltLevel": "high",
  "gamblingSession": {...}
}

// Response provides QualifyFirst survey redirection
{
  "success": true,
  "action": "redirect_to_surveys",
  "surveyUrl": "http://localhost:3001/surveys/available?user=user123",
  "estimatedEarning": "$10-20",
  "intervention": {
    "message": "Take a break and earn some money with quick surveys!",
    "type": "positive_alternative"
  }
}
```

## 📁 File Structure Reference

```
tiltcheck-organized/
├── webapp/                          # TiltCheck React App
│   ├── src/components/             # TiltCheck components
│   ├── package.json               # TiltCheck dependencies
│   └── ...
├── integrations/
│   ├── qualifyfirst-workspace/     # QualifyFirst Development
│   │   ├── app/                   # Next.js QualifyFirst app
│   │   ├── package.json          # QualifyFirst dependencies  
│   │   └── ...
│   └── shared/                    # Integration Bridge
│       ├── integration-bridge.js  # API bridge server
│       ├── integration-config.js  # Configuration
│       └── package.json          # Bridge dependencies
└── start-integration.sh           # Start all services
```

## 🛠 Development Tips

### 1. Clean Development
- Each project maintains its own `package.json` and dependencies
- No conflicting Node.js versions or package conflicts  
- Clean separation allows independent development

### 2. Integration Testing
```bash
# Test integration bridge health
curl http://localhost:3002/health

# Test integration status  
curl http://localhost:3002/api/integration/status
```

### 3. Debugging
- TiltCheck logs: Check webapp console
- QualifyFirst logs: Check Next.js console  
- Integration logs: Check bridge console (localhost:3002)

### 4. Database Synchronization
- QualifyFirst uses Supabase
- TiltCheck can connect via integration bridge
- User data synced for intervention purposes

## 🎯 Development Priorities

### Phase 1: Core Integration
1. Test QualifyFirst survey platform functionality
2. Implement TiltCheck intervention triggers
3. Set up revenue tracking in integration bridge

### Phase 2: Enhanced Features  
1. User profile synchronization
2. Advanced intervention algorithms
3. Real-time earnings dashboard

### Phase 3: Production Ready
1. Deploy QualifyFirst to production
2. Scale integration bridge API
3. Monitor revenue sharing metrics

## ✅ Success Metrics

- **Revenue Sharing**: 25% of QualifyFirst earnings to TiltCheck
- **Intervention Success**: Users redirected from gambling to surveys
- **Development Efficiency**: Clean, separate codebases
- **No Directory Confusion**: Organized workspace structure

You're all set to develop QualifyFirst within the TiltCheck ecosystem! 🚀