# TiltCheck Ecosystem - Technical Documentation

**Version**: 2.0.0  
**Last Updated**: August 1, 2025  
**Maintainer**: jmenichole  
**Repository**: [trap-house-discord-bot](https://github.com/jmenichole/trap-house-discord-bot)

---

## 🎮 Project Overview

**TiltCheck** is a comprehensive gambling accountability and casino transparency platform built around Discord bot integration, featuring AI-powered strategy coaching, NFT verification systems, and real-time casino analysis. The ecosystem combines addiction prevention tools with transparency rankings for 21+ casinos.

### 🎯 Mission Statement
*"Built by degens, for degens who learned the hard way"* - Providing gambling accountability through technology, transparency, and community support.

---

## 🏗️ Technical Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    TiltCheck Ecosystem                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Discord Bot   │   TiltCheck API │    Strategy Coach AI        │
│   (bot.js)      │   (Express)     │    (ML/Analytics)           │
│   Port: Discord │   Port: 4001    │    Integrated               │
└─────────────────┴─────────────────┴─────────────────────────────┘
           │                 │                        │
           ▼                 ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│              Ecosystem Dashboard (Port 3001)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │
│  │ Public UI   │ │ Admin Panel │ │   NFT Verification          │ │
│  │ Features    │ │ (Protected) │ │   (0x742d...1337)           │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
           │                 │                        │
           ▼                 ▼                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Data Layer                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │
│  │   Casino    │ │  User Data  │ │      NFT Profiles           │ │
│  │ Analytics   │ │  & Sessions │ │   & Verification            │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### **Backend Technologies**
- **Runtime**: Node.js v18+ 
- **Framework**: Express.js
- **Discord Integration**: discord.js v14
- **Environment Management**: dotenv
- **Process Management**: PM2 compatible
- **Cryptocurrency**: Solana Web3.js, Ethereum Web3
- **HTTP Client**: Axios
- **File System**: Native Node.js fs modules

### **Frontend Technologies**
- **Landing Pages**: Vanilla HTML5/CSS3/JavaScript
- **Web Application**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **TypeScript**: Full TypeScript support
- **UI Components**: Custom React components
- **Responsive Design**: Mobile-first approach

### **Blockchain & Cryptocurrency**
- **Primary Chain**: Solana
- **Secondary Support**: Ethereum, Polygon
- **NFT Standards**: Metaplex (Solana), ERC-721 (Ethereum)
- **Wallet Integration**: Phantom, MetaMask
- **Payment Processing**: tip.cc integration

### **Data & Analytics**
- **Storage**: JSON-based file storage
- **Session Management**: In-memory Maps with persistence
- **Analytics**: Custom metrics collection
- **Logging**: Winston-compatible logging
- **Health Monitoring**: Custom health check endpoints

### **Security & Authentication**
- **Discord OAuth**: OAuth2 flow implementation
- **NFT Verification**: Blockchain-based admin access
- **CORS Protection**: Configurable origins
- **Input Validation**: Express middleware
- **Rate Limiting**: Custom implementation
- **Session Management**: JWT-like token system
- **SSL/TLS Encryption**: Positive SSL certificate
- **HTTPS Enforcement**: Automatic redirect to secure connections

### **DevOps & Deployment**
- **Containerization**: Docker support
- **Process Management**: Custom bash scripts
- **Health Monitoring**: Automated health checks
- **Logging**: Centralized log management
- **Auto-restart**: Process recovery systems
- **Environment**: Multi-environment support (.env)

---

## 🎯 Core Features

### **1. Discord Bot Integration**
```javascript
// Core Discord Bot Features
- Slash Commands (/casino-transparency, /verify-casino, /strategy-coach)
- Message Reactions (Respect system)
- Role Management (5-tier ranking system)
- Real-time Monitoring
- Admin Commands (kick, ban, mute, clear)
- OAuth Integration (Custom landing pages)
```

### **2. Casino Transparency System**
```javascript
// Casino Analysis Features
- 21+ Casino Analysis (Stake, Rollbit, BC.Game, etc.)
- API Availability Checking
- Transparency Score Calculation
- Compliance Rating System
- NFT Profile Generation
- Real-time Updates
```

### **3. AI Strategy Coach**
```javascript
// Strategy Coaching Modules
- Bankroll Management
- Tilt Prevention & Detection
- Risk Assessment Algorithms
- Game Selection Guidance
- Bonus Optimization
- Time Management
- Personalized Recommendations
- Behavioral Pattern Analysis
```

### **4. NFT Verification System**
```javascript
// NFT Integration
- Casino Profile NFTs
- Compliance Certificates
- Fairness Verification Tokens
- Admin Access NFTs (Token ID: 1337)
- Blockchain Verification
- Smart Contract Integration
```

### **5. Admin Dashboard**
```javascript
// Admin Panel Features (NFT Protected)
- Beta Testing Feedback Management
- Real-time Analytics Dashboard
- User Session Monitoring
- Task Management System
- System Health Monitoring
- Configuration Management
```

### **6. Crypto Payment System (JustTheTip)**
```javascript
// Payment Features
- Multi-chain Support (Solana, Ethereum)
- Real-time Transaction Tracking
- Wallet Integration (Phantom, MetaMask)
- tip.cc Integration
- Automated Payment Processing
- Transaction History
```

---

## 🚀 API Endpoints

### **Public Endpoints**
```
GET  /                           → Dashboard home
GET  /health                     → System health check
GET  /ecosystem-status           → Service status overview
GET  /strategy-coach             → Strategy coach interface
GET  /api/casino-transparency    → Casino rankings & data
GET  /api/nft-verification       → NFT verification status
GET  /api/compliance-status      → Compliance metrics
```

### **Strategy Coach API**
```
POST /api/coaching/session       → Create coaching session
GET  /api/coaching/recommendations/:userId → Get user recommendations
POST /api/coaching/feedback      → Submit coaching feedback
```

### **Admin Endpoints (NFT Protected)**
```
POST /api/admin/verify-nft       → NFT verification
GET  /admin/dashboard            → Admin control panel
GET  /admin/beta-feedback        → Beta testing feedback
GET  /admin/analytics            → System analytics
GET  /admin/suggestions          → User suggestions
GET  /admin/task-manager         → Task management
POST /admin/tasks                → Create new task
PUT  /admin/tasks/:id            → Update task
```

---

## 📊 Database Schema

### **User Profiles**
```javascript
{
  userId: "discord_user_id",
  totalSessions: 0,
  netResult: 0,
  riskTolerance: "medium",
  coachingHistory: [],
  respectPoints: 0,
  trustLevel: 1,
  joinedAt: timestamp,
  lastActive: timestamp
}
```

### **Casino Data**
```javascript
{
  casinoId: "stake",
  name: "Stake",
  url: "https://stake.com",
  hasAPI: true,
  transparencyScore: 95.2,
  complianceScore: 87.5,
  awarenessScore: 92.1,
  nftProfileId: "nft_token_id",
  lastUpdated: timestamp
}
```

### **Coaching Sessions**
```javascript
{
  sessionId: "session_uuid",
  userId: "discord_user_id",
  recommendations: [],
  riskLevel: "medium",
  bankrollAdvice: {},
  tiltIndicators: [],
  timestamp: Date.now(),
  feedback: null
}
```

### **Admin Sessions**
```javascript
{
  sessionToken: "uuid",
  walletAddress: "0x742d35Cc6634C0532925a3b8D4C6212d5f2b5FcD",
  tokenId: 1337,
  verified: true,
  permissions: [],
  expiresAt: timestamp
}
```

---

## 🔧 Configuration

### **Environment Variables**
```bash
# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Server Configuration
PORT=4001
DASHBOARD_PORT=3001
NODE_ENV=production

# Blockchain Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_key

# Admin Configuration
ADMIN_NFT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C6212d5f2b5FcD
ADMIN_TOKEN_ID=1337

# External APIs
CASINO_API_KEYS=your_api_keys
TIPCC_API_KEY=your_tipcc_key
```

### **Service Ports**
```
3001 → Ecosystem Dashboard
4001 → TiltCheck API Server
3002 → Strategy Coach (if standalone)
```

---

## 📁 Project Structure

```
trap-house-discord-bot/
├── 📁 commands/                 → Discord command handlers
├── 📁 dashboard/                → Dashboard application
│   └── ecosystemDashboard.js    → Main dashboard server
├── 📁 landing-pages/            → Static landing pages
│   ├── index.html               → Main TiltCheck landing
│   ├── beta.html                → Beta testing page
│   └── justthetip.html          → Crypto payment page
├── 📁 webapp/                   → Next.js application
│   ├── app/                     → App router
│   └── components/              → React components
├── 📁 public/                   → Static assets
├── 📁 logs/                     → Application logs
├── 📁 pids/                     → Process ID files
├── 📄 bot.js                    → Main Discord bot + API
├── 📄 tiltcheck_strategy_coach.js → AI coaching system
├── 📄 start-ecosystem.sh        → Deployment script
├── 📄 package.json              → Dependencies & scripts
└── 📄 README.md                 → Project documentation
```

---

## 🎮 Discord Commands

### **Slash Commands**
```javascript
/casino-transparency [casino_name]  → View casino rankings
/verify-casino [casino_name]        → Check casino verification
/strategy-coach                     → Access AI coaching
/respect-leaderboard                → View respect rankings
/loan-request [amount]              → Request a loan (if enabled)
```

### **Text Commands**
```javascript
!kick @user [reason]        → Kick user (admin only)
!ban @user [reason]         → Ban user (admin only)
!mute @user [duration]      → Mute user (admin only)
!clear [count]              → Clear messages (admin only)
!respect @user              → Check user respect
!balance                    → Check crypto balance
```

---

## 🔐 Security Features

### **Authentication & Authorization**
- NFT-based admin authentication
- Discord OAuth2 integration
- Session token management
- Role-based access control
- Wallet signature verification

### **Data Protection**
- Input validation and sanitization
- CORS protection with whitelisted origins
- Rate limiting on API endpoints
- Secure session management
- Environment variable protection

### **Blockchain Security**
- Multi-signature wallet support
- Smart contract verification
- NFT ownership validation
- Transaction monitoring
- Wallet address validation

---

## 📈 Analytics & Metrics

### **User Metrics**
- Session duration tracking
- Command usage statistics
- Coaching session effectiveness
- User retention rates
- Respect point distribution

### **System Metrics**
- API response times
- Error rates and logging
- Resource usage monitoring
- Service uptime tracking
- Database performance

### **Casino Metrics**
- Transparency score trends
- API availability monitoring
- Compliance rating changes
- User casino preferences
- Market analysis data

---

## 🚀 Deployment

### **Development Setup**
```bash
# Clone repository
git clone https://github.com/jmenichole/trap-house-discord-bot.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### **Production Deployment**
```bash
# Start full ecosystem
./start-ecosystem.sh

# Individual services
npm start                    # Discord bot + API
npm run start:dashboard      # Dashboard only
npm run start:webapp         # Next.js webapp

# Health check
npm run health

# View logs
npm run logs
```

### **Docker Deployment**
```bash
# Build container
docker build -t tiltcheck-ecosystem .

# Run with compose
docker-compose up -d

# Health check
docker-compose exec app npm run health
```

---

## 🧪 Testing

### **Test Commands**
```bash
npm test                    # Run crypto tests
npm run test:kofi          # Test Ko-fi webhooks
npm run test:endpoints     # Test API endpoints
npm run test:support       # Test support page
```

### **Health Monitoring**
```bash
./start-ecosystem.sh health     # Full health check
./start-ecosystem.sh status     # Service status
./start-ecosystem.sh logs       # View recent logs
```

---

## 📝 Development Guidelines

### **Code Standards**
- ES6+ JavaScript with async/await
- Modular architecture with clear separation
- Comprehensive error handling
- Detailed logging for debugging
- Environment-specific configuration

### **Git Workflow**
- Feature branches for new development
- Comprehensive commit messages
- Pull request reviews required
- Automated testing before merge
- Semantic versioning

### **Performance Optimization**
- Efficient Discord API usage
- Caching for frequently accessed data
- Optimized database queries
- Memory leak prevention
- Resource usage monitoring

---

## 🔗 External Integrations

### **Discord Platform**
- Discord.js v14 library
- OAuth2 authentication flow
- Slash command framework
- Message component handling
- Event-driven architecture

### **Blockchain Networks**
- Solana Web3.js integration
- Ethereum Web3 support
- NFT metadata handling
- Transaction monitoring
- Wallet connectivity

### **Casino APIs**
- Stake API integration
- Rollbit data feeds
- BC.Game connectivity
- Generic API framework
- Rate-limited requests

### **Payment Systems**
- tip.cc integration
- Multi-chain support
- Real-time transaction tracking
- Automated processing
- Error handling & recovery

---

## 📞 Support & Documentation

### **Community Links**
- **Discord Support**: https://discord.gg/K3Md6aZx
- **Main Website**: https://tiltcheck.it.com (SSL Secured)
- **Ecosystem Hub**: https://tiltcheckecosystem.created.app
- **GitHub Repository**: https://github.com/jmenichole/trap-house-discord-bot
- **SSL Configuration**: See SSL_CERTIFICATE_SETUP.md

### **Documentation**
- API documentation available at `/api/docs`
- Discord command help via `/help`
- Admin panel includes inline help
- Comprehensive README files

### **Issue Reporting**
- GitHub Issues for bugs and features
- Discord support channel for help
- Beta feedback system for testing
- Community forums for discussion

---

## 🎯 Roadmap & Future Development

### **Planned Features**
- Machine learning enhancement for coaching
- Mobile application development
- Advanced casino API integrations
- Expanded NFT ecosystem
- Multi-language support

### **Technical Improvements**
- Database migration to PostgreSQL
- Microservices architecture
- Advanced caching with Redis
- Real-time WebSocket integration
- Enhanced monitoring & alerting

---

**© 2025 TiltCheck Ecosystem - Built by degens, for degens who learned the hard way**
