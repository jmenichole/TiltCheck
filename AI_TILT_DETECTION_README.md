# AI Tilt Detection Algorithm

## Overview

The AI Tilt Detection Algorithm is a comprehensive behavioral analysis system that monitors gambling patterns and provides real-time intervention recommendations. It uses multi-factor analysis to detect tilt patterns with high accuracy.

## Features

### 1. Time-of-Day Pattern Tracking
- **Purpose**: Identifies high-risk gambling periods
- **Analysis**: Tracks betting behavior across different times of day
- **Risk Levels**:
  - Late Night (11pm-4am): 80% base risk - highest impulsivity
  - Early Morning (4am-8am): 60% base risk - fatigue-induced decisions
  - Work Hours (9am-5pm): 30% base risk - moderate attention
  - Evening (6pm-11pm): 50% base risk - post-work stress

### 2. Currency/Payment Method Tracking
- **Purpose**: Correlates currency type with risk behavior
- **Analysis**: Monitors which currencies are used and their impact on behavior
- **Risk Factors**:
  - Cryptocurrency (BTC, ETH, SOL): 70% risk - high volatility correlation
  - Fiat Currency (USD, EUR): 40% risk - more stable
  - Mixed Currency Usage: 60% risk - indicates emotional switching

### 3. Device/Platform Analysis
- **Purpose**: Identifies impulsive behavior based on device usage
- **Tracking**:
  - Mobile: 70% risk - quick, impulsive bets
  - Desktop: 40% risk - more deliberate decisions
  - Tablet: 50% risk - moderate impulsivity
- **Metrics**: Bet speed (bets per minute) by device

### 4. PnL (Profit and Loss) Variation Analysis
- **Purpose**: Detects volatile betting patterns and loss-chasing
- **Metrics**:
  - PnL swing percentage
  - Current vs. peak comparison
  - Trend analysis (positive/negative)
- **Thresholds**:
  - Wild Swings (>50%): Critical risk
  - Chasing Losses (>30% down): High risk
  - Moderate Variation (20-50%): Medium risk

### 5. Betting Modality Recognition
- **Purpose**: Classifies betting behavior patterns
- **Types**:
  - **Aggressive**: Rapidly increasing bet sizes (80% risk)
  - **Conservative**: Consistent small bets (20% risk)
  - **Chasing**: Increasing bets after losses (90% risk) - CRITICAL
  - **Strategic**: Varied betting based on conditions (30% risk)

## Risk Scoring System

### Overall Risk Calculation
The overall risk score is a weighted combination of all factors:
- Time of Day: 25% weight
- Currency Usage: 15% weight
- Device Behavior: 15% weight
- PnL Variation: 25% weight
- Betting Modality: 20% weight

### Risk Levels
- **Low Risk (0-40%)**: Green indicators, minimal intervention
- **Medium Risk (40-60%)**: Yellow indicators, gentle warnings
- **High Risk (60-80%)**: Orange indicators, strong recommendations
- **Critical Risk (80-100%)**: Red indicators, immediate intervention

## Intervention System

### Recommendation Priorities
1. **CRITICAL**: Stop session immediately
2. **HIGH**: Take mandatory break (15+ minutes)
3. **MEDIUM**: Reduce bet sizes by 50%
4. **INFO**: Alternative earning opportunities

### Personalized Recommendations
Based on detected patterns:
- Time-based: Suggest better gambling hours
- Device-based: Switch to more deliberate platforms
- Behavior-based: Stop chasing losses, set hard limits
- Alternative: Redirect to earning activities

## Implementation

### Basic Usage

```javascript
// Initialize AI engine
const aiEngine = new AITiltDetection();

// Log a bet
aiEngine.logBet({
    amount: 50,
    currency: 'USD',
    device: 'desktop',
    outcome: 'loss',
    pnl: 50,
    gameType: 'slots'
});

// Get risk analysis
const analysis = aiEngine.analyzeTiltRisk();
console.log('Risk Score:', analysis.overallRiskScore);
console.log('Recommendations:', analysis.recommendations);

// Get session statistics
const stats = aiEngine.getSessionStats();
console.log('Win Rate:', stats.winRate);
console.log('Net PnL:', stats.netPnL);
```

### Integration with Demo Page

The demo page (`demo.html`) integrates the AI engine to provide:
- Real-time risk monitoring
- Visual pattern displays
- Interactive analytics dashboard
- Dynamic intervention overlays

## Data Privacy

All data is processed locally in the browser/client. No betting data is transmitted to external servers unless explicitly configured for analytics purposes.

## Technical Details

### Performance
- Efficient data structures with circular buffers
- Maximum 100 PnL history entries
- Maximum 50 betting history entries
- Real-time analysis with <10ms latency

### Browser Compatibility
- Works in all modern browsers
- No external dependencies
- Pure JavaScript implementation
- Compatible with Node.js for server-side analysis

## Future Enhancements

Planned features:
1. Machine learning model integration
2. Social comparison analytics
3. Predictive tilt detection (before it happens)
4. Integration with responsible gaming APIs
5. Multi-session pattern recognition
6. Seasonal/temporal trend analysis

## Support

For issues or questions:
- GitHub Issues: [TiltCheck Repository](https://github.com/jmenichole/TiltCheck)
- Documentation: See main README.md
- Commercial Support: Available with Professional/Enterprise plans

## License

Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved - See LICENSE file for details
