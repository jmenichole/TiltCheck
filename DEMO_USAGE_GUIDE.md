# TiltCheck AI Demo Usage Guide

## Overview

The enhanced demo page (`demo.html`) showcases TiltCheck's AI-powered tilt detection system with comprehensive behavioral analysis and real-time interventions.

## Accessing the Demo

### Local Development
1. Clone the repository
2. Open `demo.html` in a web browser
3. No build process required - pure HTML/CSS/JS

### Online Demo
Visit: `https://jmenichole.github.io/TiltCheck/demo.html`

## Features Demonstrated

### 1. Real-Time Betting Simulation
- **Place Bet**: Simulates a betting event with current bet amount
- **Double Bet**: Increases bet size (demonstrates aggressive betting pattern)
- **Current Balance**: Shows net PnL (Profit and Loss)
- **Session Timer**: Tracks how long you've been "playing"

### 2. Session Configuration
Configure different scenarios to see how AI responds:

#### Currency Selection
- **USD (Fiat)**: Lower risk baseline
- **BTC/ETH/SOL (Crypto)**: Higher risk due to volatility
- **USDC (Stablecoin)**: Medium risk

#### Device Selection
- **Desktop**: More deliberate, lower impulsivity
- **Mobile**: Higher risk, faster betting
- **Tablet**: Medium risk profile

#### Game Type
- **Slots**: High variance
- **Blackjack/Roulette/Crash**: Different risk profiles

### 3. AI Risk Meter
Visual indicator showing overall tilt risk:
- **Green (0-40%)**: Low Risk - Safe gambling behavior
- **Yellow (40-60%)**: Medium Risk - Warning signs present
- **Orange (60-80%)**: High Risk - Strong intervention needed
- **Red (80-100%)**: Critical - Immediate action required

### 4. Pattern Analysis Dashboard

#### Time of Day Analysis
- Shows current time period risk level
- Identifies best historical times to play
- Collapsible section with detailed metrics

#### Currency & Payment Analysis
- Active currency display
- Risk level for current payment method
- Historical currency performance

#### Device Behavior Analysis
- Current device risk profile
- Betting speed (bets per minute)
- Device-specific statistics

#### PnL Variation & Trends
- Visual chart of profit/loss over time
- Percentage variation indicator
- Trend direction (positive/negative)
- Green bars = winning bets
- Red bars = losing bets

#### Betting Behavior Modality
- **Aggressive**: Rapidly increasing bets
- **Conservative**: Consistent small bets
- **Chasing**: Increasing after losses (DANGER)
- **Strategic**: Varied, thoughtful betting

### 5. AI Recommendations
Personalized recommendations based on detected patterns:
- **CRITICAL**: Stop immediately
- **HIGH**: Take a break
- **MEDIUM**: Reduce bet sizes
- **INFO**: Alternative activities

### 6. Intervention System
When critical tilt is detected:
- Full-screen overlay with alert
- Statistics on potential losses prevented
- Options to take a break or redirect to earning opportunities

## How to Use the Demo

### Basic Testing (5 minutes)

1. **Start Simple**
   - Click "Place Bet" a few times
   - Watch the AI Risk Meter remain green/yellow
   - Observe basic statistics updating

2. **Trigger Medium Risk**
   - Click "Double Bet" 2-3 times
   - Place several bets quickly
   - Watch risk meter turn yellow
   - Check recommendations that appear

3. **Trigger High/Critical Risk**
   - Continue doubling bets
   - Place many bets rapidly
   - Watch risk meter turn orange/red
   - See the intervention overlay appear

4. **Explore Analytics**
   - Click section headers to expand/collapse
   - Observe PnL chart building up
   - Check modality counters increasing
   - Review personalized recommendations

### Advanced Testing (15 minutes)

1. **Test Time-of-Day Impact**
   - Note the current time period
   - Compare with your own gambling patterns
   - See if AI detects risky times

2. **Test Currency Impact**
   - Switch between USD and BTC
   - Place same number of bets
   - Notice risk score differences

3. **Test Device Impact**
   - Switch from desktop to mobile
   - Notice how mobile increases risk faster
   - Check betting speed metrics

4. **Test Pattern Recognition**
   - Place consistent small bets (conservative)
   - Then switch to increasing bets (aggressive)
   - Watch modality counts change
   - See if AI detects the shift

5. **Reset and Compare**
   - Click "Reset Demo"
   - Try different patterns
   - Compare risk scores between sessions

## Understanding the Metrics

### Overall Risk Score
Weighted calculation of all factors:
- 25% Time of Day
- 15% Currency Type
- 15% Device Behavior
- 25% PnL Variation
- 20% Betting Modality

### Win Rate
`Wins / Total Bets × 100%`
Demo uses ~40% win rate to simulate realistic gambling

### Bets Per Minute
`Total Bets / Session Minutes`
Higher = more impulsive

### PnL Variation
`(Max PnL - Min PnL) / Max PnL × 100%`
Higher = more volatile session

## Common Scenarios

### Scenario 1: Responsible Gambler
- Small, consistent bets ($10-20)
- Desktop device
- Fiat currency
- Moderate win rate
- **Result**: Low risk score (20-35%)

### Scenario 2: Warning Signs
- Increasing bet sizes
- Mobile device
- Mixed currency
- Losing streak
- **Result**: Medium risk (45-55%)

### Scenario 3: Critical Tilt
- Rapidly doubling bets
- Mobile device at 2 AM
- Cryptocurrency
- Chasing losses
- **Result**: Critical risk (80-95%)

## Tips for Presenters/Demos

1. **Start with explanation**: "This shows what responsible gaming tools can do"
2. **Demo gradually**: Don't jump to critical immediately
3. **Highlight features**: Point out each analytics section
4. **Show intervention**: Let it naturally trigger
5. **Reset and compare**: Show different behavior patterns
6. **Discuss applications**: Talk about real-world use cases

## Technical Details

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Client-side only (no server needed)
- <10ms analysis latency
- Handles 1000+ bets efficiently
- Local storage not used (data ephemeral)

### Data Privacy
- All data stays in browser
- Nothing sent to servers
- Reset clears all data
- No cookies or tracking

## Customization

To customize thresholds, edit `ai-tilt-detection.js`:

```javascript
this.thresholds = {
  timeOfDayRisk: {
    lateNight: 0.8,    // Adjust risk levels
    // ... etc
  }
}
```

To modify UI, edit `demo.html` CSS section.

## Troubleshooting

### Demo Not Loading
- Check browser console for errors
- Ensure `ai-tilt-detection.js` is in same directory
- Try different browser

### Risk Score Seems Wrong
- This is a simulation with simplified logic
- Real implementation uses more sophisticated ML
- Thresholds are for demonstration purposes

### Intervention Not Triggering
- Need to reach 80%+ risk score
- Try: Mobile + Crypto + Rapid doubling bets
- Or click "Double Bet" 5+ times then place many bets

## Next Steps

After demo:
1. Review `AI_TILT_DETECTION_README.md` for technical details
2. Check main `README.md` for full project overview
3. Explore integration options for your platform
4. Contact for commercial licensing/customization

## Support

- Questions: Open a GitHub issue
- Bugs: Submit PR or issue
- Commercial: See pricing in main README
- Custom Development: Enterprise plan includes customization

## Contributing

Improvements welcome! Areas for contribution:
- Additional pattern recognition
- UI enhancements
- Mobile responsiveness
- Accessibility improvements
- Localization

## License

Copyright (c) 2024-2025 JME (jmenichole)
All Rights Reserved - See LICENSE for details
