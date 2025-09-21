
# TiltCheck - Professional Gaming Monitor

![TiltCheck Logo](https://img.shields.io/badge/TiltCheck-v1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Status](https://img.shields.io/badge/Status-Professional-green)

**TiltCheck** is a comprehensive system designed to identify, track, and mitigate player tilt behaviors in gaming environments. The system analyzes betting patterns, time spent at tables, emotional indicators, and playing speed to provide real-time alerts and intervention recommendations.

## 🎯 **Live Demo Features**

This demo showcases the complete TiltCheck system with:
- **Real-time Player Monitoring** - Track betting patterns, session duration, and tilt indicators
- **Intelligent Alert System** - Automated alerts based on configurable thresholds
- **Behavioral Analysis** - Advanced pattern recognition for tilt detection
- **Intervention Tools** - Proactive recommendations for responsible gaming
- **Fairness Verification** - Additional tool for gaming transparency

## 🚀 **Quick Start**

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck

# Install dependencies
npm install

# Start the development server
npm start
```

The application will open in your browser at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## 🔧 **Configuration**

The system includes a comprehensive configuration panel accessible through the web interface. Key configurable parameters include:

### Alert Thresholds
- **Stake Increase**: Percentage increase that triggers alerts (default: 200%)
- **Session Duration**: Maximum time at table before alert (default: 180 minutes)
- **Loss Sequence**: Consecutive losses triggering intervention (default: 5)
- **Emotional Score**: Threshold for emotional indicators (default: 7/10)
- **Speed Increase**: Playing speed increase percentage (default: 300%)

### Notification Settings
- Email alerts
- SMS notifications
- Dashboard alerts
- Audio notifications

### Monitoring Features
- Real-time tracking
- Session recording
- Behavioral analysis
- Predictive alerts

## 📊 **Key Features**

### 🎮 **Player Dashboard**
- Real-time monitoring of active players
- Tilt risk assessment and visualization
- Historical session analysis
- Behavioral pattern tracking

### 🚨 **Alert System**
- Live alert generation
- Severity-based classification (Low, Medium, High)
- Alert resolution tracking
- Automatic alert generation based on player behavior

### 🎯 **Tilt Detection Algorithms**
- **Betting Pattern Analysis**: Detects rapid stake increases and erratic betting
- **Time-Based Monitoring**: Tracks session duration and frequency
- **Loss Streak Detection**: Identifies consecutive losses and chase behavior
- **Emotional Indicators**: Monitors stress and frustration signals
- **Speed Analysis**: Detects rushed decision-making patterns

### 🛡️ **Intervention Tools**
- Automatic break suggestions
- Limit recommendations
- Cooldown period enforcement
- Support referral system

## 🏗️ **Architecture**

### Frontend Components
```
src/
├── components/
│   ├── PlayerDashboard.jsx    # Main monitoring interface
│   ├── AlertPanel.jsx         # Real-time alerts management
│   ├── ConfigurationPanel.jsx # System configuration
│   └── FairnessVerifier.jsx   # Gaming fairness verification
├── utils/
│   └── mockData.js           # Demo data generation
└── App.js                    # Main application component
```

### Technology Stack
- **Frontend**: React 18, Framer Motion for animations
- **Charts**: Recharts for data visualization  
- **Icons**: React Icons
- **Styling**: Custom CSS with utility classes
- **State Management**: React Hooks

## 📈 **Data Analytics**

The system tracks and analyzes multiple data points:

### Player Behavior Metrics
- Session duration and frequency
- Average bet sizes and variations
- Win/loss ratios and streaks
- Playing speed (bets per minute)
- Break frequency and duration

### Tilt Risk Calculation
The tilt risk score (0-10) is calculated based on:
- Session duration weighting
- Bet increase patterns
- Loss streak analysis
- Emotional state indicators
- Playing speed variations

## 🔒 **Responsible Gaming Integration**

TiltCheck promotes responsible gaming through:
- **Early Warning System**: Detects tilt before it becomes problematic
- **Intervention Recommendations**: Suggests breaks, limits, and support
- **Player Education**: Provides insights into gambling behavior
- **Operator Tools**: Helps operators fulfill duty of care responsibilities

## 🌐 **API Integration**

The system is designed to integrate with existing casino management systems:

```javascript
// Example integration
const tiltCheck = new TiltCheckMonitor({
  apiKey: 'YOUR_API_KEY',
  thresholds: {
    stakeIncrease: 200,
    timeAtTable: 180,
    lossSequence: 5
  }
});

// Start monitoring a player
tiltCheck.trackPlayer({
  playerId: 'player123',
  initialStake: 500,
  riskProfile: 'medium'
});
```

## 🎨 **Demo Highlights for Investors**

This demonstration showcases:

### Technical Excellence
- Modern React architecture with smooth animations
- Real-time data visualization and monitoring
- Responsive design suitable for all devices
- Professional UI/UX design

### Business Value
- Reduces player churn through responsible gaming
- Minimizes regulatory compliance risks
- Provides competitive advantage in player retention
- Demonstrates commitment to player welfare

### Scalability
- Modular component architecture
- Configurable alert thresholds
- API-ready for integration with existing systems
- Cloud deployment ready

## 🤝 **Investment Opportunity**

TiltCheck represents a significant opportunity in the growing responsible gaming technology sector:

- **Market Need**: Increasing regulatory requirements for player protection
- **Technical Innovation**: Advanced behavioral analysis and real-time monitoring
- **Revenue Model**: SaaS licensing for gaming operators
- **Scalability**: Cloud-based solution suitable for operators of all sizes

## 📞 **Contact & Support**

**Development Team**: j.chapman7@yahoo.com

For inquiries about:
- **Investment Opportunities**
- **Technical Partnerships** 
- **Custom Implementation**
- **Pilot Programs**

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**TiltCheck** - Promoting responsible gaming through intelligent monitoring and intervention.
