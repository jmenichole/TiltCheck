# React Components Guide - Session & Wallet State Management

## 🎯 Overview

This document catalogs all React components in the TiltCheck system that handle state management for user sessions, wallet connections, and authentication flows. These components are critical for maintaining user context across the application.

---

## 📊 Components with State Management

### Core Dashboard Components

#### 1. **TiltCheckUI.jsx**
**Location**: `/TiltCheckUI.jsx`

**State Management**:
- `alerts` - Array of active alert messages
- `messengerVisible` - Boolean for messenger display
- `stats` - Current player statistics
- `activeAlert` - Currently displayed alert

**Key Features**:
```javascript
const TiltCheckUI = ({ tiltChecker, playerId }) => {
  const [alerts, setAlerts] = useState([]);
  const [messengerVisible, setMessengerVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    // Global UI methods for TiltCheck integration
    window.TiltCheckUI = {
      showPopup: (alert) => setActiveAlert(alert),
      showMessenger: (alert) => setAlerts(prev => [...prev, alert])
    };

    // Update stats every 5 seconds
    const statsInterval = setInterval(() => {
      const playerStats = tiltChecker.getPlayerStats(playerId);
      setStats(playerStats);
    }, 5000);

    return () => clearInterval(statsInterval);
  }, [tiltChecker, playerId]);
}
```

**Session Tracking**:
- Real-time stats polling
- Alert history management
- Auto-dismissal of alerts
- Messenger state persistence

---

#### 2. **PlayerDashboard.jsx**
**Location**: `/src/components/PlayerDashboard.jsx`

**State Management**:
- `selectedPlayer` - Currently monitored player
- `isLiveMode` - Live monitoring toggle

**Key Features**:
```javascript
const PlayerDashboard = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(mockPlayers[0]);
  const [isLiveMode, setIsLiveMode] = useState(true);

  // Session data visualization
  const last14Sessions = selectedPlayer.sessions.slice(0, 14).reverse();
  const tiltChart = last14Sessions.map((session, index) => ({
    day: `Day ${index + 1}`,
    tiltRisk: session.tiltRisk,
    duration: session.duration,
    betIncrease: session.betIncreaseStreak,
    lossStreak: session.lossStreak
  }));
}
```

**Session Tracking**:
- 14-day session history
- Tilt risk calculations
- Duration tracking
- Betting pattern analysis
- Live vs. paused modes

---

#### 3. **TiltCheckDashboard.jsx**
**Location**: `/TiltCheckDashboard.jsx`

**State Management**:
- `activeTab` - Current dashboard view
- `selectedPlayer` - Player being monitored
- `liveData` - Real-time monitoring data
- `notifications` - Alert notifications

**Features**:
- Multi-tab interface
- Real-time data updates
- Player selection
- Notification management

---

### Wallet Connection Components

#### 4. **Login.jsx**
**Location**: `/tiltcheck-organized/webapp/src/components/Login.jsx`

**State Management**:
- `walletAddress` - Connected wallet address
- `isConnecting` - Connection in progress
- `authToken` - JWT authentication token
- `error` - Connection error state

**Key Features**:
```javascript
const Login = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Phantom wallet connection
      const { solana } = window;
      if (solana?.isPhantom) {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
        
        // Generate auth token
        const token = await generateAuthToken(response.publicKey);
        setAuthToken(token);
        localStorage.setItem('authToken', token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };
}
```

**Wallet Integration**:
- Phantom wallet support
- WalletConnect integration
- Token authentication
- Error handling
- Session persistence

---

#### 5. **UserProfile.jsx**
**Location**: `/tiltcheck-organized/webapp/src/components/UserProfile.jsx`

**State Management**:
- `userProfile` - User profile data
- `trustScore` - Trust score from blockchain
- `linkedWallets` - Array of linked wallet addresses
- `isEditing` - Profile edit mode
- `sessionHistory` - Gaming session data

**Key Features**:
```javascript
const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [trustScore, setTrustScore] = useState(0);
  const [linkedWallets, setLinkedWallets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);

  useEffect(() => {
    // Load user profile from API
    const loadProfile = async () => {
      const profile = await fetchUserProfile();
      setUserProfile(profile);
      setTrustScore(profile.trustScore);
      setLinkedWallets(profile.wallets);
      setSessionHistory(profile.sessions);
    };
    loadProfile();
  }, []);
}
```

**Data Management**:
- Multi-wallet support
- Trust score display
- Session history
- Profile editing
- Real-time updates

---

### Session Management Components

#### 6. **OverlayDashboard.jsx**
**Location**: `/tiltcheck-organized/webapp/src/components/OverlayDashboard.jsx`

**State Management**:
- `currentSession` - Active gaming session
- `sessionStats` - Real-time session statistics
- `tiltRisk` - Current tilt risk level
- `alerts` - Active alerts for session

**Key Features**:
```javascript
const OverlayDashboard = () => {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    totalBets: 0,
    netPL: 0,
    tiltScore: 0
  });
  const [tiltRisk, setTiltRisk] = useState('low');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Update session stats every second
    const interval = setInterval(() => {
      if (currentSession) {
        setSessionStats(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
        
        // Check tilt risk
        const risk = calculateTiltRisk(sessionStats);
        setTiltRisk(risk);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);
}
```

**Real-time Tracking**:
- Session duration counter
- Bet tracking
- P&L calculation
- Tilt risk monitoring
- Alert generation

---

#### 7. **ConfigurationPanel.jsx**
**Location**: `/src/components/ConfigurationPanel.jsx`

**State Management**:
- `alertThresholds` - Configurable alert thresholds
- `notificationSettings` - Notification preferences
- `sessionLimits` - Session time and spend limits
- `autoActions` - Automated intervention settings

**Key Features**:
```javascript
const ConfigurationPanel = () => {
  const [alertThresholds, setAlertThresholds] = useState({
    stakeIncrease: 200,
    timeAtSlots: 180,
    lossSequence: 5,
    emotionalIndicatorScore: 7
  });

  const [sessionLimits, setSessionLimits] = useState({
    maxDuration: 300,
    maxLoss: 1000,
    breakInterval: 60
  });

  const saveConfiguration = async () => {
    await updateUserConfiguration({
      thresholds: alertThresholds,
      limits: sessionLimits
    });
  };
}
```

**Configuration Management**:
- Threshold customization
- Limit settings
- Notification preferences
- Auto-save functionality

---

### Web3 Integration Components

#### 8. **JustTheTip Page** (`webapp/app/justthetip/page.tsx`)
**State Management**:
- `walletConnected` - Wallet connection status
- `balance` - Token balance
- `tipHistory` - Tipping transaction history
- `recipientAddress` - Tip recipient

**Wallet Features**:
- Phantom wallet integration
- Token balance checking
- Transaction signing
- History tracking

---

#### 9. **Ecosystem Page** (`webapp/app/ecosystem/page.tsx`)
**State Management**:
- `userWallet` - Connected wallet info
- `nftCollection` - User's NFT collection
- `trustNFT` - Trust score NFT data
- `ecosystemStats` - Platform statistics

**NFT Features**:
- NFT minting interface
- Trust NFT display
- Collection management
- Metadata viewing

---

## 🔄 State Management Patterns

### 1. Session Persistence

```javascript
// Local storage for session continuity
const saveSession = (sessionData) => {
  localStorage.setItem('currentSession', JSON.stringify(sessionData));
};

const loadSession = () => {
  const saved = localStorage.getItem('currentSession');
  return saved ? JSON.parse(saved) : null;
};
```

### 2. Real-time Updates

```javascript
// Polling pattern for live data
useEffect(() => {
  const interval = setInterval(async () => {
    const freshData = await fetchLatestData();
    setData(freshData);
  }, 5000); // Update every 5 seconds

  return () => clearInterval(interval);
}, [dependencies]);
```

### 3. Wallet State Management

```javascript
// Global wallet context
const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      setWallet(response.publicKey);
      setConnected(true);
    }
  };

  const disconnect = () => {
    setWallet(null);
    setConnected(false);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider value={{ wallet, connected, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};
```

---

## 📊 State Flow Diagram

```
User Action
    ↓
Component Event Handler
    ↓
setState() Call
    ↓
React Re-render
    ↓
useEffect() Triggers
    ↓
API Call / Blockchain Interaction
    ↓
State Update
    ↓
UI Reflects New State
```

---

## 🔐 Security Considerations

### 1. Wallet Connection Security
- Never store private keys in state
- Use secure wallet adapters
- Validate all wallet addresses
- Implement connection timeouts

### 2. Session Data Protection
- Encrypt sensitive session data
- Use HTTPS for all API calls
- Implement CSRF protection
- Validate all user inputs

### 3. State Sanitization
```javascript
// Sanitize before storing in state
const sanitizeUserInput = (input) => {
  return DOMPurify.sanitize(input);
};

const handleInput = (value) => {
  const clean = sanitizeUserInput(value);
  setState(clean);
};
```

---

## 🚀 Performance Optimization

### 1. Memoization
```javascript
import { useMemo, useCallback } from 'react';

// Expensive calculation
const tiltRisk = useMemo(() => {
  return calculateComplexRisk(sessionData);
}, [sessionData]);

// Callback optimization
const handleUpdate = useCallback(() => {
  updateSession(currentSession);
}, [currentSession]);
```

### 2. Lazy Loading
```javascript
// Lazy load heavy components
const HeavyDashboard = React.lazy(() => import('./HeavyDashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyDashboard />
</Suspense>
```

### 3. Debouncing
```javascript
// Debounce frequent updates
const debouncedUpdate = useMemo(
  () => debounce((value) => {
    updateState(value);
  }, 300),
  []
);
```

---

## 📝 Best Practices

1. **Always Clean Up**
   ```javascript
   useEffect(() => {
     const subscription = subscribeToUpdates();
     return () => subscription.unsubscribe();
   }, []);
   ```

2. **Use Context for Global State**
   - Wallet connection state
   - User authentication
   - Theme preferences
   - Alert settings

3. **Local State for Component-Specific Data**
   - Form inputs
   - UI toggles
   - Animation states
   - Modal visibility

4. **Lift State Up When Needed**
   - Share data between siblings
   - Coordinate multiple components
   - Maintain single source of truth

---

## 🔧 Testing State Management

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

test('wallet connection updates state', async () => {
  const { getByText } = render(<Login />);
  
  act(() => {
    fireEvent.click(getByText('Connect Wallet'));
  });

  await waitFor(() => {
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();
  });
});
```

---

## 📚 Related Documentation

- [Wallet Integration Guide](./WALLET_INTEGRATION.md)
- [Session Management API](./SESSION_API.md)
- [Trust Score System](./TRUST_SCORE_ARCHITECTURE.md)
- [Component Library](./COMPONENT_LIBRARY.md)

---

*Last Updated: November 2024*
*Version: 2.0.0*
