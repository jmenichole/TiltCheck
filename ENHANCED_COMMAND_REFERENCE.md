# 🎮 Enhanced TrapHouse Bot System - Complete Command Reference

## 🤖 Bot Configuration Status

### **Active Bots:**
1. **TrapHouse Bot** (Port 3002) - `MTM1NDQ1MDU5MDgxMzY1NTE0Mg...` ✅
2. **JustTheTip Bot** (Port 3001) - `MTM3Mzc4NDcyMjcxODcyMDA5MA...` ✅  
3. **Degens Bot** - `MTM3NjExMzU4NzAyNTczOTgwNw...` ✅ **NEWLY CONFIGURED**

---

## 🎯 Command Distribution by Bot

### **TrapHouse Bot** (Full Feature Set)
- ✅ Loan System (Exclusive)
- ✅ Enhanced TiltCheck Verification 
- ✅ Secure Crypto Payment Wallets (7 chains)
- ✅ Regulatory Compliance Helper
- ✅ Degens Card Game
- ✅ Hood Stats & Community Features

### **JustTheTip Bot** (TiltCheck + Crypto Focus)
- ❌ No Loan System
- ✅ Enhanced TiltCheck Verification
- ✅ CollectClock Integration (Exclusive)
- ✅ Secure Crypto Payment Wallets
- ✅ Degens Card Game

### **Degens Bot** (TiltCheck + Crypto Focus) 
- ❌ No Loan System
- ✅ Enhanced TiltCheck Verification
- ✅ Secure Crypto Payment Wallets
- ✅ Degens Card Game (Primary)
- ❌ No CollectClock

---

## 💰 Loan System Commands (TrapHouse Only)

```bash
# Core Loan Functions
!front <amount>              # Request a loan/front
!front trust                 # Check your trust score and rank
!repay <amount>              # Repay your loan
!loans                       # View your active loans

# Trust & Ranking
!respect                     # Check respect points
!rank                        # View your current rank
!leaderboard                 # Community leaderboard
!flex                        # Show off your stats

# Community Stats
!hood stats                  # Overall community statistics
!front schedule              # Next loan availability
```

---

## 🔍 Enhanced TiltCheck Commands (All Bots)

```bash
# Verification System
!tiltcheck verify wallets:0x123...,bc1q... stake:username casinos:stake.us,trustdice collectclock:true
!tiltcheck status            # View monitoring dashboard
!tiltcheck stop              # Disable monitoring
!tiltcheck help              # Complete help guide

# Pattern Analysis
!tiltcheck patterns          # View detected tilt patterns
!tiltcheck patterns detailed # Detailed pattern analysis
!tiltcheck wallet <address>  # Wallet-specific monitoring
!tiltcheck casino <name>     # Casino session management

# Alerts & Configuration
!tiltcheck alerts on/off     # Toggle alert notifications
!tiltcheck alerts config     # Configure alert thresholds
!tiltcheck collectclock      # Bonus tracking status (JustTheTip only)
```

---

## 💎 Secure Crypto Payment Wallets (All Bots)

```bash
# Wallet Management
!crypto chains               # List all 7 supported blockchains
!crypto generate <chain>     # Generate new wallet (polygon, arbitrum, bsc, etc.)
!crypto balance <address>    # Check wallet balance
!crypto verify <address>     # Verify wallet compliance

# Transactions
!crypto send <to> <amount> <chain>    # Send crypto payment
!crypto history <address>             # Transaction history
!crypto fees <chain>                  # Current gas fees

# Admin Functions (TrapHouse Only)
!crypto admin stats          # Payment system statistics
!crypto admin wallets        # Manage system wallets
!crypto admin compliance     # AML/KYC status overview
```

### **Supported Blockchains:**
1. **Polygon (MATIC)** - Low fees, fast transactions
2. **Arbitrum (ETH)** - Ethereum Layer 2 scaling  
3. **BSC (BNB)** - Binance Smart Chain
4. **Ethereum (ETH)** - Main network
5. **Avalanche (AVAX)** - High throughput
6. **Solana (SOL)** - Ultra-fast transactions
7. **Tron (TRX)** - High TPS, low fees

---

## 🏛️ Regulatory Compliance Commands (TrapHouse Only)

```bash
# State Analysis
!compliance                  # Overview of compliance system
!compliance roadmap <STATE>  # Get compliance roadmap for state
!compliance check <STATE>    # Check current state regulations
!state-analysis <STATE>      # Detailed state analysis

# Unbanning Strategies
!unban-state <STATE>         # Generate comprehensive unbanning strategy
!unban-state WA              # Washington state strategy
!unban-state NY              # New York state strategy
!unban-state ID              # Idaho state strategy
!unban-state NV              # Nevada state strategy
!unban-state KY              # Kentucky state strategy

# Examples
!compliance roadmap CA       # California compliance path
!compliance check TX         # Texas regulation status
!state-analysis FL           # Florida detailed analysis
```

---

## 🎮 Degens Card Game (All Bots)

```bash
# Core Game Commands
!cards start                 # Start a new game
!cards play <card>           # Play a card
!cards hand                  # View your hand
!cards deck                  # Deck information

# Game Modes
!cards pvp @user             # Player vs Player
!cards tournament            # Join tournament
!cards solo                  # Single player mode

# Stats & Progress
!cards stats                 # Your game statistics
!cards collection            # View card collection
!cards leaderboard           # Game leaderboard
```

---

## 🔧 System & Admin Commands

```bash
# General Help
!help                        # Basic command list
!commands                    # Full command reference
!about                       # Bot information

# System Status (Admin)
!system status               # Overall system health
!system restart              # Restart bot services
!system logs                 # View recent logs
!system config               # Configuration overview

# Database Management (Admin)
!admin purge <count>         # Purge messages
!admin reset user <@user>    # Reset user data
!admin backup                # Create data backup
!admin restore               # Restore from backup
```

---

## 🔒 Security & Unicode Protection

### **Built-in Protection:**
- ✅ Unicode normalization (NFC)
- ✅ Confusable character detection
- ✅ Mixed script detection  
- ✅ Address validation enhancement
- ✅ AML/KYC compliance screening

### **Security Commands:**
```bash
!security check <text>       # Check for unicode variants
!security scan <address>     # Scan crypto address for risks
!security report             # Generate security report
```

---

## 📊 Real-Time Monitoring Features

### **TiltCheck Monitoring:**
- 🔄 Real-time wallet transaction monitoring
- 🎰 Casino session tracking (Stake, TrustDice, Rollbit, MetaWin)
- 📊 Trust scoring algorithm (0-100)
- 🕐 CollectClock bonus integration (JustTheTip)
- 🚨 Pattern detection and alerts

### **Crypto Payment Monitoring:**
- 🔗 7-blockchain real-time connectivity
- ⛽ Dynamic gas fee optimization
- 🛡️ AML/KYC compliance checking
- 💱 Multi-chain transaction routing
- 📈 Performance analytics

### **Regulatory Compliance:**
- 🏛️ State-by-state regulation tracking
- 📋 Compliance roadmap generation
- 🚀 Unbanning strategy development
- 📊 Economic impact analysis
- ⚖️ Legislative advocacy framework

---

## 🎯 Quick Start Examples

### **1. Set Up Enhanced TiltCheck:**
```bash
!tiltcheck verify wallets:0x742d35Cc6634C0532925a3b8D...,bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq stake:your_username casinos:stake.us,trustdice collectclock:true
```

### **2. Generate Crypto Wallet:**
```bash
!crypto generate polygon     # Generate Polygon wallet for low fees
!crypto balance 0x123...     # Check balance
!crypto send 0x456... 100 polygon  # Send 100 MATIC
```

### **3. Check State Regulations:**
```bash
!compliance roadmap WA       # Washington compliance path
!unban-state NY             # New York unbanning strategy
!state-analysis CA          # California analysis
```

### **4. Request Loan (TrapHouse only):**
```bash
!front trust                # Check eligibility
!front 500                  # Request $500 loan
!repay 100                  # Repay $100
```

---

## 🚀 System Performance

### **Current Status:**
- ✅ TrapHouse Bot: Port 3002 (All features)
- ✅ JustTheTip Bot: Port 3001 (TiltCheck + Crypto + CollectClock)  
- ✅ Degens Bot: Ready to deploy (TiltCheck + Crypto + Cards)
- ✅ 7 Blockchain networks: Live connectivity
- ✅ Real-time RPC endpoints: Operational
- ✅ Security systems: Active

### **API Integrations:**
- 🔗 Blockchain RPCs: Production-ready endpoints
- 🎰 Casino APIs: Configured for TiltCheck
- 🏛️ Compliance APIs: Ready for premium keys
- 🔒 Security APIs: Unicode protection active

---

## 📞 Support & Configuration

### **Need Help?**
1. Use `!help` for basic commands
2. Use `!tiltcheck help` for TiltCheck details  
3. Use `!crypto chains` for payment options
4. Use `!compliance` for regulatory tools

### **For Advanced Configuration:**
- Review `RPC_CONFIGURATION_GUIDE.md` for blockchain setup
- Check `COMPREHENSIVE_SYSTEM_SUMMARY.md` for full documentation
- Update `.env` file for API keys and custom settings

---

**🏆 Your enhanced TrapHouse ecosystem is ready for action! 🏆**

**All three bots configured with cutting-edge features for gambling verification, secure crypto payments, and regulatory compliance!**
