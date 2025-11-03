# Tilt Detection Logic - Developer Onboarding Guide

## 🎯 What is Tilt?

"Tilt" in gaming refers to a state of mental or emotional confusion or frustration where a player makes increasingly poor decisions, often leading to:
- Chasing losses with larger bets
- Ignoring previously set limits
- Playing for extended periods without breaks
- Emotional decision-making rather than rational play

TiltCheck's mission is to detect tilt patterns early and provide helpful interventions to promote responsible gaming.

---

## 🧠 How TiltCheck Detects Tilt

### Core Detection Algorithm

The tilt detection system uses a multi-factor scoring algorithm that monitors:

1. **Betting Pattern Changes**
2. **Time-based Indicators**
3. **Emotional Behavior Signals**
4. **Session Context**
5. **Historical Patterns**

### Detection Thresholds

Located in `config.json`:

```json
{
  "alertThresholds": {
    "stakeIncrease": 200,        // % increase in bet size
    "timeAtSlots": 180,          // Minutes at slot games
    "timeAtOriginals": 120,      // Minutes at original games
    "lossSequence": 5,           // Consecutive losses
    "emotionalIndicatorScore": 7, // Emotional behavior score (0-10)
    "vaultReminderBalance": 1000, // Balance threshold for vault reminder
    "rapidBettingThreshold": 10,  // Bets per minute
    "maxSessionTime": 300         // Maximum session minutes
  }
}
```

---

## 📊 Tilt Scoring Components

### 1. Stake Increase Monitoring

**File**: `tiltCheck.js` - Method: `analyzePlayerBehavior()`

```javascript
// Detects rapid increases in bet amounts
const avgBetSize = player.bettingHistory.slice(-10).reduce((sum, bet) => sum + bet.amount, 0) / 10;
const currentBet = player.lastBet.amount;

if (currentBet > avgBetSize * (1 + config.alertThresholds.stakeIncrease / 100)) {
    // Tilt indicator: Bet size increased significantly
    player.emotionalScore += 5;
}
```

**What it detects**:
- User suddenly betting 2-3x their average
- Progressive bet size increases
- "Martingale" style betting (doubling after losses)

**Intervention**:
- Alert: "Your bet size has increased significantly"
- Recommendation: "Consider taking a break"

---

### 2. Loss Sequence Tracking

**File**: `tiltCheck.js` - Method: `updatePlayerActivity()`

```javascript
if (activity.type === 'loss') {
    player.lossSequence++;
    
    if (player.lossSequence >= config.alertThresholds.lossSequence) {
        // Multiple losses in a row - high tilt risk
        this.triggerAlert(playerId, {
            type: 'lossChase',
            severity: 'high',
            advice: 'foldEm'
        });
    }
} else if (activity.type === 'win') {
    player.lossSequence = 0; // Reset on win
}
```

**What it detects**:
- 5+ consecutive losses
- User likely to chase losses
- Emotional frustration building

**Intervention**:
- Alert: "You've had several losses in a row"
- Recommendation: "Time to take a break and reset"

---

### 3. Time-Based Monitoring

**File**: `tiltCheck.js` - Method: `updateSessionTime()`

```javascript
updateSessionTime(playerId) {
    const player = this.activePlayers.get(playerId);
    const sessionDuration = (Date.now() - player.sessionStart) / 1000 / 60; // minutes

    // Track time by game type
    if (player.currentGameType === 'slots') {
        player.timeAtSlots++;
    } else if (player.currentGameType === 'originals') {
        player.timeAtOriginals++;
    }

    // Check thresholds
    if (player.timeAtSlots > config.alertThresholds.timeAtSlots) {
        this.triggerAlert(playerId, {
            type: 'timeLimit',
            severity: 'warning',
            advice: 'break',
            message: 'You\'ve been playing slots for 3 hours'
        });
    }

    if (sessionDuration > config.alertThresholds.maxSessionTime) {
        this.triggerAlert(playerId, {
            type: 'sessionTime',
            severity: 'high',
            advice: 'foldEm',
            message: 'Your session has exceeded 5 hours'
        });
    }
}
```

**What it detects**:
- Extended play sessions (fatigue)
- Excessive time on high-volatility games
- Session length exceeding personal limits

**Intervention**:
- Alert: "You've been playing for X hours"
- Recommendation: "Take a mandatory 15-minute break"

---

### 4. Emotional Indicator Scoring

**File**: `tiltCheck.js` - Method: `calculateEmotionalScore()`

Emotional indicators are subtle behavioral cues:

```javascript
calculateEmotionalScore(player) {
    let score = 0;

    // Rapid clicking/betting
    const betsLastMinute = player.bettingHistory.filter(
        bet => Date.now() - bet.timestamp < 60000
    ).length;
    
    if (betsLastMinute > config.alertThresholds.rapidBettingThreshold) {
        score += config.monitoring.emotionalIndicators.rapidClicking;
    }

    // Increasing bet sizes
    const recentBets = player.bettingHistory.slice(-5);
    const isIncreasing = recentBets.every((bet, i) => 
        i === 0 || bet.amount >= recentBets[i - 1].amount
    );
    
    if (isIncreasing) {
        score += config.monitoring.emotionalIndicators.increasingBetSize;
    }

    // Time spent increasing
    if (player.sessionDuration > player.previousSessions.averageDuration * 1.5) {
        score += config.monitoring.emotionalIndicators.timeSpentIncreasing;
    }

    // Loss chasing pattern
    if (player.lossSequence >= 3 && player.lastBet.amount > player.avgBetSize) {
        score += config.monitoring.emotionalIndicators.lossChasing;
    }

    return score;
}
```

**Emotional Indicators**:

| Indicator | Points | Description |
|-----------|--------|-------------|
| Rapid Clicking | 3 | 10+ bets per minute |
| Increasing Bet Size | 5 | 5 consecutive bet increases |
| Time Spent Increasing | 4 | Session 50% longer than average |
| Loss Chasing | 8 | Big bets after losses |

**Score Interpretation**:
- **0-3**: Normal play
- **4-6**: Mild tilt risk
- **7-9**: High tilt risk
- **10+**: Critical tilt state

---

### 5. Game Type Analysis

**File**: `tiltCheck.js` - Method: `analyzeGameTypePatterns()`

```javascript
analyzeGameTypePatterns(player) {
    // Slots tend to be more addictive than table games
    const slotsRatio = player.timeAtSlots / (player.timeAtSlots + player.timeAtOriginals + 1);
    
    if (slotsRatio > config.monitoring.slotsVsOriginalsRatio) {
        // Player spending too much time on high-risk games
        return {
            concern: 'high',
            message: 'Consider trying lower-volatility games',
            recommendation: 'Switch to table games for better odds'
        };
    }

    // Game switching frequency
    const switchCount = player.gameHistory.filter(
        (game, i, arr) => i > 0 && game !== arr[i-1]
    ).length;

    if (switchCount > 10 && player.sessionDuration < 60) {
        // Rapid game switching = chasing wins
        return {
            concern: 'medium',
            message: 'Frequent game switching detected',
            recommendation: 'Stick to one game type for better strategy'
        };
    }
}
```

---

## 🚨 Alert System

### Alert Types

TiltCheck generates four types of interventions:

#### 1. **foldEm** (Critical)
- **When**: Critical tilt state detected
- **Action**: Strong recommendation to stop playing
- **Example**: "You've been on a losing streak for 2 hours. It's time to fold 'em and come back fresh."

#### 2. **holdEm** (Informational)
- **When**: Player is doing well
- **Action**: Positive reinforcement
- **Example**: "You're playing responsibly! Keep up the good work."

#### 3. **vault** (Reminder)
- **When**: Player has significant winnings
- **Action**: Remind to secure profits
- **Example**: "You're up $500! Consider vaulting your winnings before continuing."

#### 4. **break** (Preventive)
- **When**: Long session or multiple alerts
- **Action**: Suggest taking a break
- **Example**: "You've been playing for 90 minutes. Take a 10-minute break."

### Alert Priority System

```javascript
const alertPriority = {
    'foldEm': 10,    // Critical - immediate attention
    'vault': 7,      // Important - user should act
    'break': 5,      // Moderate - suggest action
    'holdEm': 2      // Info - positive feedback
};
```

---

## 🔄 Complete Detection Flow

```
User Activity
    ↓
Update Player State
    ↓
Calculate Emotional Score
    ↓
Check Time Thresholds
    ↓
Analyze Betting Patterns
    ↓
Evaluate Game Type
    ↓
Compute Overall Tilt Score
    ↓
Match Against Thresholds
    ↓
Trigger Appropriate Alert
    ↓
Log Event for Analytics
    ↓
Display Intervention to User
```

---

## 💻 Implementation Examples

### Basic Integration

```javascript
// Initialize TiltCheck
const tiltChecker = new TiltCheck('your-api-key');

// Track a new player session
const player = tiltChecker.trackPlayer('player-123', {
    initialStake: 1000,
    riskProfile: 'medium',
    sessionId: 'session_abc123'
});

// Update on each bet
tiltChecker.updatePlayerActivity('player-123', {
    type: 'bet',
    amount: 50,
    gameType: 'slots',
    newStake: 950,
    timestamp: Date.now()
});

// Get current stats
const stats = tiltChecker.getPlayerStats('player-123');
console.log('Tilt Risk:', stats.tiltRisk);
console.log('Recommendations:', stats.recommendations);
```

### Custom Threshold Configuration

```javascript
// Override default thresholds
tiltChecker.updateConfiguration({
    alertThresholds: {
        stakeIncrease: 150,      // More sensitive
        lossSequence: 3,         // Trigger earlier
        maxSessionTime: 120      // 2-hour limit
    }
});
```

### Custom Alert Handlers

```javascript
// Handle alerts in your UI
tiltChecker.on('alert', (alert) => {
    if (alert.severity === 'high') {
        showModal({
            title: alert.title,
            message: alert.message,
            action: alert.advice
        });
    } else {
        showNotification(alert);
    }
});
```

---

## 🧪 Testing Tilt Detection

### Unit Tests

```javascript
describe('Tilt Detection', () => {
    it('should detect stake increase', () => {
        const player = tiltChecker.trackPlayer('test-1', { initialStake: 100 });
        
        // Normal bets
        for (let i = 0; i < 5; i++) {
            tiltChecker.updatePlayerActivity('test-1', {
                type: 'bet',
                amount: 10
            });
        }
        
        // Sudden large bet
        tiltChecker.updatePlayerActivity('test-1', {
            type: 'bet',
            amount: 100
        });
        
        const stats = tiltChecker.getPlayerStats('test-1');
        expect(stats.alerts).toContainEqual(
            expect.objectContaining({ type: 'stakeIncrease' })
        );
    });

    it('should detect loss chasing', () => {
        const player = tiltChecker.trackPlayer('test-2', { initialStake: 100 });
        
        // 5 consecutive losses
        for (let i = 0; i < 5; i++) {
            tiltChecker.updatePlayerActivity('test-2', {
                type: 'loss',
                amount: 10
            });
        }
        
        const stats = tiltChecker.getPlayerStats('test-2');
        expect(stats.tiltRisk).toBe('high');
        expect(stats.recommendations).toContain('break');
    });
});
```

---

## 📈 Analytics Integration

All tilt events are logged for analysis:

```javascript
// Event logging structure
{
    eventType: 'tilt_alert',
    userId: 'user_123',
    timestamp: '2024-11-01T12:00:00Z',
    data: {
        severity: 'high',
        tiltScore: 8,
        triggers: ['lossSequence', 'stakeIncrease'],
        sessionDuration: 180,
        totalBets: 45,
        netPL: -350
    }
}
```

---

## 🔧 Customization Tips

### 1. Adjust Sensitivity
- **Conservative**: Higher thresholds, fewer alerts
- **Aggressive**: Lower thresholds, more interventions

### 2. Add Custom Indicators
```javascript
// Add your own tilt indicator
tiltChecker.addCustomIndicator('quickBetPattern', (player) => {
    const avgBetTime = calculateAvgTimeBetweenBets(player);
    return avgBetTime < 2000; // Less than 2 seconds
}, 6); // Severity score
```

### 3. Integrate with External Data
```javascript
// Use player history for better detection
tiltChecker.loadPlayerHistory('player-123', historicalData);
```

---

## 🎓 Best Practices

1. **Start Conservative**: Begin with higher thresholds and adjust based on feedback
2. **Personalize**: Use player history to customize thresholds per user
3. **Be Supportive**: Frame alerts as helpful rather than punitive
4. **Respect Autonomy**: Provide options, don't force actions
5. **Log Everything**: Analytics help improve detection over time
6. **Test Thoroughly**: Ensure false positives are minimized
7. **Iterate**: Continuously refine based on user feedback

---

## 📚 Further Reading

- [Trust Score Architecture](./TRUST_SCORE_ARCHITECTURE.md)
- [Analytics Implementation](./ANALYTICS_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Component Guide](./REACT_COMPONENTS_GUIDE.md)

---

## 🆘 Support

Questions about tilt detection?
- Review: `tiltCheck.js` for core implementation
- Discord: Join our developer community
- Issues: Open a GitHub issue with tag `tilt-detection`

---

*Last Updated: November 2024*
*Version: 2.0.0*
