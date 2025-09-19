
# TiltCheck - Casino Monitoring & Fairness Verification Suite

TiltCheck is a comprehensive casino monitoring system that combines multiple key functions:
1. **Tilt Detection**: Identify, track, and mitigate player tilt behaviors by analyzing betting patterns, time spent on slots vs originals, and emotional indicators
2. **Fairness Verification**: Verify the integrity of casino games using cryptographic seed verification  
3. **Real-time Alerts**: Provide pop-up messages, browser notifications, and AOL-style instant messenger overlay
4. **Smart Recommendations**: Help recognize when it's time to hold 'em and when it's time to fold 'em

## Features

- **🎯 Betting Pattern Analysis**: Real-time monitoring of bet sizes, frequency, and rapid betting detection
- **⏱️ Time Tracking**: Monitors time spent on slots vs originals with balance recommendations
- **🧠 Emotional Indicators**: Detects signs of emotional gambling through behavioral patterns
- **🚨 Multi-Channel Alerts**: 
  - Browser pop-up messages
  - Native browser notifications  
  - AOL-style instant messenger overlay
- **🏦 Vault Reminders**: Suggests saving winnings when balance exceeds thresholds
- **🤝 Hold 'em vs Fold 'em**: Smart recommendations for when to continue or take a break
- **📊 Real-time Dashboard**: Live monitoring interface with player statistics

### Fairness Verification
- Cryptographic verification of game results using server/client seeds
- Single bet verification and bulk JSON processing
- Visual feedback for fair vs unfair results
- Support for provably fair gambling verification

## Quick Demo

Open `demo.html` in your browser to see TiltCheck in action with simulated player behavior.

## Installation

```bash
git clone https://github.com/mischief-manager/TiltCheck.git
cd TiltCheck
npm install
```

## Configuration

The `config.json` file contains all customizable parameters:

```json
{
  "alertThresholds": {
    "stakeIncrease": 200,
    "timeAtSlots": 180,
    "timeAtOriginals": 120,
    "lossSequence": 5,
    "emotionalIndicatorScore": 7,
    "vaultReminderBalance": 1000,
    "rapidBettingThreshold": 10,
    "maxSessionTime": 300
  },
  "notifications": {
    "popup": { "enabled": true, "position": "top-right" },
    "browserNotification": { "enabled": true, "icon": "/tilt-warning.png" },
    "messenger": { "enabled": true, "style": "aol", "position": "bottom-right" }
  },
  "monitoring": {
    "slotsVsOriginalsRatio": 0.7,
    "emotionalIndicators": {
      "rapidClicking": 3,
      "increasingBetSize": 5,
      "timeSpentIncreasing": 4,
      "lossChasing": 8
    }
  }
}
```

## Usage

### Basic Usage

```javascript
const TiltCheck = require('./tiltCheck');

// Initialize TiltCheck
const monitor = new TiltCheck('YOUR_API_KEY');

// Start monitoring a player
const player = monitor.trackPlayer('player123', {
  initialStake: 500,
  riskProfile: 'medium'
});

// Update player activity
monitor.updatePlayerActivity('player123', {
  type: 'bet',
  amount: 50,
  gameType: 'slots',
  newStake: 450
});

// Get player statistics
const stats = monitor.getPlayerStats('player123');
console.log(stats.recommendation); // { action: 'holdEm', message: '...', confidence: 'high' }
```

### React Integration

```jsx
import TiltCheckDashboard from './TiltCheckDashboard.jsx';
import TiltCheckUI from './TiltCheckUI.jsx';

function App() {
  return (
    <div>
      <TiltCheckDashboard />
      {/* TiltCheckUI provides overlay alerts automatically */}
    </div>
  );
}
```

## Activity Types

Track different player activities to trigger appropriate alerts:

```javascript
// Betting activity
monitor.updatePlayerActivity(playerId, {
  type: 'bet',
  amount: 100,
  gameType: 'slots', // or 'originals'
  newStake: 1400
});

// Game switching
monitor.updatePlayerActivity(playerId, {
  type: 'gameSwitch',
  fromGame: 'slots',
  toGame: 'originals'
});

// Wins and losses
monitor.updatePlayerActivity(playerId, {
  type: 'win', // or 'loss'
  amount: 150,
  newStake: 1550
});
```

## Alert Types

TiltCheck generates various alert types:

- **stakeIncrease**: When stake increases beyond threshold
- **lossSequence**: Multiple consecutive losses detected
- **rapidBetting**: Too many bets in a short timeframe
- **gameBalance**: Spending too much time on slots vs originals
- **emotional**: High emotional stress indicators
- **vault**: Reminder to save winnings
- **sessionTime**: Extended session duration

## API Reference

### TiltCheck Class

#### Methods

- `trackPlayer(playerId, options)` - Start monitoring a player
- `updatePlayerActivity(playerId, activity)` - Record player activity
- `getPlayerStats(playerId)` - Get current player statistics and recommendations
- `stopTracking(playerId)` - Stop monitoring a player
- `getAllActivePlayers()` - Get all currently monitored players

#### Options

- `initialStake` (number): Player's starting balance
- `riskProfile` ('low'|'medium'|'high'): Player's risk tolerance

### Player Statistics

```javascript
{
  averageBetSize: 75,
  bettingFrequency: 2.5, // bets per minute  
  slotsVsOriginalsRatio: 0.8,
  sessionDuration: 1800, // seconds
  lossSequence: 2,
  stakeChange: 15.5, // percentage
  emotionalScore: 4,
  recommendation: {
    action: 'holdEm', // 'foldEm', 'holdEm', 'vault', 'diversify'
    message: 'You are doing well...',
    confidence: 'high'
  }
}
```

### React Integration

```jsx
import TiltCheckDashboard from './TiltCheckDashboard.jsx';
import TiltCheckUI from './TiltCheckUI.jsx';

function App() {
  return (
    <div>
      <TiltCheckDashboard />
      {/* TiltCheckUI provides overlay alerts automatically */}
    </div>
  );
}
```

## Activity Types

Track different player activities to trigger appropriate alerts:

```javascript
// Betting activity
monitor.updatePlayerActivity(playerId, {
  type: 'bet',
  amount: 100,
  gameType: 'slots', // or 'originals'
  newStake: 1400
});

// Game switching
monitor.updatePlayerActivity(playerId, {
  type: 'gameSwitch',
  fromGame: 'slots',
  toGame: 'originals'
});

// Wins and losses
monitor.updatePlayerActivity(playerId, {
  type: 'win', // or 'loss'
  amount: 150,
  newStake: 1550
});
```

## Alert Types

TiltCheck generates various alert types:

- **stakeIncrease**: When stake increases beyond threshold
- **lossSequence**: Multiple consecutive losses detected
- **rapidBetting**: Too many bets in a short timeframe
- **gameBalance**: Spending too much time on slots vs originals
- **emotional**: High emotional stress indicators
- **vault**: Reminder to save winnings
- **sessionTime**: Extended session duration

## API Reference

### TiltCheck Class

#### Methods

- `trackPlayer(playerId, options)` - Start monitoring a player
- `updatePlayerActivity(playerId, activity)` - Record player activity
- `getPlayerStats(playerId)` - Get current player statistics and recommendations
- `stopTracking(playerId)` - Stop monitoring a player
- `getAllActivePlayers()` - Get all currently monitored players

#### Options

- `initialStake` (number): Player's starting balance
- `riskProfile` ('low'|'medium'|'high'): Player's risk tolerance

### Player Statistics

```javascript
{
  averageBetSize: 75,
  bettingFrequency: 2.5, // bets per minute  
  slotsVsOriginalsRatio: 0.8,
  sessionDuration: 1800, // seconds
  lossSequence: 2,
  stakeChange: 15.5, // percentage
  emotionalScore: 4,
  recommendation: {
    action: 'holdEm', // 'foldEm', 'holdEm', 'vault', 'diversify'
    message: 'You are doing well...',
    confidence: 'high'
  }
}
```

### Fairness Verification

The `FairnessVerifier.jsx` React component provides a UI for verifying game fairness:

```jsx
import FairnessVerifier from './FairnessVerifier';

function App() {
  return (
    <div>
      <FairnessVerifier />
    </div>
  );
}
```

The component supports:
- Single bet verification with server seed, client seed, and nonce
- Bulk JSON verification for multiple bets
- Visual feedback showing expected vs actual results

License

MIT

## Contact

For support or feature requests, please contact the development team at j.chapman7@yahoo.com.
