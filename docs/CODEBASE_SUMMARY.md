# TiltCheck Codebase Summary

## 📊 5-Sentence Grant Milestone Update

**TiltCheck** is a comprehensive real-time player behavior monitoring system that combines AI-powered tilt detection with blockchain-based trust scoring and NFT verification to promote responsible gaming across Discord communities and casino platforms. The system features an autonomous Fetch.ai uAgents-powered monitoring agent, a sophisticated trust score algorithm tracking user behavior through verified wallet connections and casino interactions, and a complete NFT minting system that represents user trustworthiness on-chain. Currently implemented are core tilt detection algorithms, Discord bot integration with premium command sets, multi-casino transparency analysis tools, and a React-based analytics dashboard with real-time session monitoring. The codebase includes robust security features such as encrypted data storage, rate limiting, input validation, and PII protection mechanisms for GDPR compliance. Future milestones include advanced predictive AI models, mobile companion apps, cross-platform dApp integrations, and expansion of the NFT trust layer with dynamic metadata updates reflecting evolving user behavior patterns.

---

## 🏗️ Architecture Overview

### Core Components

1. **TiltCheck Engine** (`tiltCheck.js`)
   - Real-time player behavior monitoring
   - Configurable alert thresholds
   - Session tracking and analysis
   - Multi-game support (slots, table games, originals)

2. **Trust Scoring Systems**
   - `userTrustSystem.js` - Base trust scoring with beta verification
   - `nftUserTrustSystem.js` - NFT contract-based trust tracking
   - `degentrust-api.js` - DegenTrust API integration
   - Dynamic scoring based on verified actions and scam reports

3. **NFT Layer**
   - `tiltcheck-nft-minter.js` - On-chain NFT minting for trust scores
   - `verification_nft_methods.js` - Secure NFT ownership verification
   - `tiltcheck_nft_legal_system.js` - NFT legal compliance system
   - `nftUserTrustSystem.js` - NFT-based trust score persistence

4. **Discord Integration**
   - `bot.js` - Main Discord bot controller
   - `commands/` - Command handlers for user interactions
   - `events/` - Event listeners for Discord activities
   - Premium features with customizable alert channels

5. **Analytics & Monitoring**
   - `analytics/` - User behavior tracking and analysis
   - Session tracking with timestamps and wallet IDs
   - Performance metrics and engagement tracking
   - Chart rendering optimization for real-time data

6. **Web Applications**
   - `webapp/` - Next.js-based web interface
   - `dashboard/` - Real-time monitoring dashboard
   - `TiltCheckDashboard.jsx` - React dashboard component
   - Overlay systems for casino integration

7. **Blockchain Integration**
   - `realBlockchainManager.js` - Solana blockchain operations
   - Wallet connection and verification
   - Transaction tracking and analysis
   - NFT minting and metadata management

---

## 📁 Directory Structure

```
TiltCheck/
├── docs/                       # Documentation (this directory)
│   ├── CODEBASE_SUMMARY.md
│   ├── TRUST_SCORE_ARCHITECTURE.md
│   ├── SECURITY_BEST_PRACTICES.md
│   └── API_REFERENCE.md
│
├── src/                        # Source code (future organization)
│   ├── core/                   # Core monitoring engine
│   │   ├── tiltCheck.js
│   │   └── monitoring/
│   ├── trust/                  # Trust scoring systems
│   │   ├── userTrustSystem.js
│   │   └── nftUserTrustSystem.js
│   ├── nft/                    # NFT layer
│   │   ├── minter.js
│   │   └── verification.js
│   ├── analytics/              # Analytics and tracking
│   ├── discord/                # Discord bot integration
│   │   ├── bot.js
│   │   ├── commands/
│   │   └── events/
│   └── blockchain/             # Blockchain operations
│
├── webapp/                     # Web application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Next.js pages
│   │   └── utils/              # Utility functions
│   └── public/                 # Static assets
│
├── dashboard/                  # Monitoring dashboard
│   ├── ecosystemDashboard.js
│   └── components/
│
├── commands/                   # Discord bot commands
│   ├── trust-score.js
│   ├── nft-trust.js
│   └── crypto-tip.js
│
├── data/                       # Data storage
│   ├── user_trust_scores.json
│   ├── nft_user_trust.json
│   └── scam_reports.json
│
├── tests/                      # Test files
│   └── *.test.js
│
├── scripts/                    # Utility scripts
│   ├── deploy/
│   └── setup/
│
└── config/                     # Configuration files
    ├── config.json
    └── .env.example
```

---

## 🎯 Key Features by Category

### Monitoring & Detection
- Real-time tilt behavior analysis
- Configurable alert thresholds
- Multi-game support and pattern recognition
- Session time tracking and limits
- Emotional indicator scoring

### Trust & Reputation
- NFT contract-based trust initialization
- Verified action tracking and scoring
- Scam reporting and verification
- Community engagement metrics
- Beta user verification system

### Blockchain & NFT
- Solana integration for NFT minting
- Wallet verification and linking
- On-chain trust score persistence
- Dynamic NFT metadata updates
- Secure ownership verification

### Discord Integration
- Real-time alerts and notifications
- Premium command sets
- Multi-server support
- Custom alert channels
- Community moderation tools

### Analytics & Reporting
- Session analytics and tracking
- User behavior insights
- Engagement metrics
- Performance monitoring
- Historical data analysis

---

## 🔧 Technology Stack

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web server framework
- **Discord.js 14** - Discord bot library
- **MongoDB** - Data persistence
- **Redis** - Caching and rate limiting

### Frontend
- **React 18** - UI framework
- **Next.js** - Web application framework
- **Framer Motion** - Animations
- **Chart.js** - Data visualization

### Blockchain
- **Solana Web3.js** - Blockchain integration
- **@solana/spl-token** - Token operations
- **Ethers.js** - Ethereum compatibility
- **Hardhat** - Smart contract development

### Security & Infrastructure
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **xss-clean** - XSS protection

---

## 📈 Current Capabilities

### ✅ Fully Implemented
- Core tilt detection algorithms
- Trust score calculation system
- NFT minting infrastructure
- Discord bot with premium features
- Wallet verification and linking
- Real-time monitoring dashboard
- Session tracking and analytics
- Security and data protection

### 🚧 In Development
- Advanced AI/ML pattern recognition
- Mobile companion application
- Cross-platform dApp integrations
- Enhanced predictive analytics
- Automated intervention flows

### 🔮 Roadmap
- Multi-language support
- White-label solutions
- Regulatory compliance automation
- Third-party platform integrations
- Advanced reporting suites

---

## 🔐 Security Features

- **Data Encryption** - All sensitive data encrypted at rest and in transit
- **Rate Limiting** - API and bot command rate limiting
- **Input Validation** - Comprehensive input sanitization
- **XSS Protection** - Cross-site scripting prevention
- **CSRF Protection** - Cross-site request forgery protection
- **PII Protection** - Minimal data collection and anonymization
- **GDPR Compliance** - Full data protection regulation compliance
- **Secure Authentication** - JWT-based authentication system
- **Wallet Security** - Non-custodial wallet integration

---

## 📊 Data Flow

```
User Activity → TiltCheck Engine → Trust Score Calculation
                       ↓
                Analytics Tracking → Dashboard Display
                       ↓
                Alert Generation → Notification System
                                        ↓
                                   Discord/Email/SMS
                       ↓
                NFT Update → Blockchain → On-chain Persistence
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB instance
- Discord bot token
- Solana RPC endpoint

### Installation
```bash
# Clone repository
git clone https://github.com/jmenichole/TiltCheck.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start the application
npm start
```

### Testing
```bash
# Run test suite
npm test

# Run specific tests
npm test -- test-tilt-protection.js
```

---

## 📞 Support & Resources

- **Documentation**: [docs/](./docs/)
- **API Reference**: [docs/API_REFERENCE.md](./API_REFERENCE.md)
- **Repository**: https://github.com/jmenichole/TiltCheck
- **Issues**: https://github.com/jmenichole/TiltCheck/issues
- **Discord**: Private server for subscribers

---

*Last Updated: November 2024*
*Version: 2.0.0*
