

# TiltCheck - Casino Monitoring & Fairness Verification Suite

TiltCheck is a comprehensive casino monitoring system that combines two key functions:
1. **Tilt Detection**: Identify, track, and mitigate player tilt behaviors by analyzing betting patterns, time spent at tables, and emotional indicators
2. **Fairness Verification**: Verify the integrity of casino games using cryptographic seed verification


## Features

### Tilt Detection
- Real-time monitoring of player betting patterns
- Configurable alert thresholds for stake increases, time at table, and loss sequences
- Risk profile management
- Integration with casino management APIs

### Fairness Verification
- Cryptographic verification of game results using server/client seeds
- Single bet verification and bulk JSON processing
- Visual feedback for fair vs unfair results
- Support for provably fair gambling verification

## Installation

```bash
git clone https://github.com/mischief-manager/TiltCheck.git
cd TiltCheck
npm install
```

## Configuration

Edit the `config.json` file to set your casino-specific parameters:

```json
{
  "alertThresholds": {
    "stakeIncrease": 200,
    "timeAtTable": 180,
    "lossSequence": 5
  },
  "integrations": {
    "casinoManagementApi": "https://api.example.com/casino",
    "notificationEndpoint": "https://alerts.example.com/notify"
  }
}
```

## Usage

### Tilt Monitoring

```javascript
const tiltCheck = require('./tiltCheck');

// Initialize with your API key
const monitor = tiltCheck.initialize('YOUR_API_KEY');

// Start monitoring a player
const playerMonitor = monitor.trackPlayer('player123', {
  initialStake: 500,
  riskProfile: 'medium'
});

// Update player stake
playerMonitor.updateStake(700);

// Add a bet result
playerMonitor.addBet({
  amount: 50,
  result: 'loss'
});

// Check current tilt status
const status = playerMonitor.checkTilt();
console.log('Player risk level:', status.riskLevel);
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
