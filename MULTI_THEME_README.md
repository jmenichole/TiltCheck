# 🎮 Multi-Theme Discord Bot Collection

## 🏠 **TrapHouse Theme** vs 🎰 **Tilt Check Theme**

This repository contains two complete Discord bot themes that you can choose from:

---

## 🏠 **TrapHouse Discord Bot**
*Street-themed marketplace with respect system*

### **Features:**
- **Marketplace Integration**: Stripe Connect powered e-commerce
- **Respect System**: Earn points through work and community interaction  
- **Loan/Front System**: Borrow money based on trust levels
- **Degens Against Decency**: TrapHouse-themed Cards Against Humanity game
- **Role Management**: Street rank progression system
- **Economy**: Complete virtual economy with earnings

### **Commands:**
```
!marketplace  - Access TrapHouse marketplace
!work         - Earn respect points
!front        - Check loan eligibility
!cards start  - Play Degens Against Decency
!street       - Get street rank roles
!flex         - Show off your stats
!hood         - Community statistics
```

---

## 🎰 **Tilt Check Casino Bot**
*💜 Made for degens by degens - managing mischief through education & mindful behavior*

### **Mission Statement:**
"In hopes to help others manage their mischief through education, gamification, provable fairness, pattern analyzing, mindful willpower and behavior to correctly understand how to prevent tilted mistakes."

### **Features:**
- **Tilt Management System**: Scientific approach to emotional state tracking
- **Educational Framework**: Pattern recognition and behavioral analysis
- **Mindful Gaming**: Poker games with tilt-based learning outcomes
- **Pattern Analysis**: Advanced behavioral trigger identification
- **Provable Fairness**: Evidence-based strategies and techniques
- **Gamified Learning**: Educational progress through interactive experiences
- **Community Support**: Peer learning and wisdom sharing

### **Commands:**
```
!casino       - Access educational casino marketplace
!tilt         - Comprehensive behavioral analysis
!poker start  - Mindful Texas Hold'em with learning
!tiltcards    - Educational poker-themed card game
!breathe      - Mindfulness training (+5 willpower)
!meditation   - Deep pattern reset (+25 willpower)
!analyze      - Personal pattern analysis
!education    - Access Tilt Check University
!degen        - Community wisdom and support
!patterns     - Pattern learning laboratory
!badbeat      - Educational tilt simulation
```

---

## 🚀 **Quick Start**

### **Option 1: Use the Launcher**
```bash
# Show theme selection menu
node launcher.js

# Launch TrapHouse theme
node launcher.js traphouse

# Launch Tilt Check theme  
node launcher.js tiltcheck
```

### **Option 2: Direct Launch**
```bash
# TrapHouse theme
node index.js

# Tilt Check theme
node tiltCheckBot.js
```

---

## 🔧 **Setup Requirements**

### **Environment Variables** (`.env`)
```bash
# Discord Tokens
DISCORD_BOT_TOKEN=your_discord_bot_token
DEGENS_DISCORD_BOT_TOKEN=your_second_bot_token

# Stripe Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_CONNECT_CLIENT_ID=your_stripe_connect_id

# Optional Crypto Integration
JUSTTHETIP_API_KEY=your_crypto_payment_key
```

### **Dependencies**
```bash
npm install discord.js stripe express dotenv
```

---

## 🎯 **Theme Comparison**

| Feature | TrapHouse 🏠 | Tilt Check 🎰 |
|---------|-------------|---------------|
| **Theme** | Street/Urban | Poker/Casino |
| **Focus** | Community & Respect | Emotional Control |
| **Card Game** | Degens Against Decency | Tilt Check Cards |
| **Economy** | Respect Points | Tilt-Based Earnings |
| **Unique Feature** | Front/Loan System | Tilt Management |
| **Target Audience** | Urban/Street Culture | Poker Players |

---

## 🎮 **Card Games**

### **Degens Against Decency** (TrapHouse)
- Street-themed Cards Against Humanity
- Commands: `!cards start/join/play/pick`
- Themes: Street culture, crypto, Discord life

### **Tilt Check Cards** (Tilt Check)
- Poker-themed Cards Against Humanity  
- Commands: `!tiltcards start/join/play/pick`
- Themes: Bad beats, tilt management, casino life

---

## 🏪 **Marketplace Features**

Both themes include:
- **Stripe Connect Integration**: Real payment processing
- **Product Management**: Create and sell digital/physical goods
- **Buyer Protection**: Secure transactions
- **Multiple Payment Methods**: Cards, crypto, bank transfers
- **Seller Dashboard**: Complete seller onboarding
- **Test Mode**: Safe development environment

**Web Interfaces:**
- Marketplace: `http://localhost:3002/stripe/marketplace`
- Seller Dashboard: `http://localhost:3002/stripe/seller-dashboard`  
- Test Dashboard: `http://localhost:3002/test`

---

## 🎨 **Customization**

### **Creating Your Own Theme**
1. Copy `index.js` or `tiltCheckBot.js` as a template
2. Update command names and descriptions
3. Modify embed colors and emojis
4. Create themed card game content
5. Adjust marketplace branding
6. Add to `launcher.js` themes object

### **Card Game Customization**
- Edit `blackCards` and `whiteCards` arrays
- Modify game rules and scoring
- Customize embed styling
- Add theme-specific features

---

## 🔗 **Integration Options**

### **Webhook Server** (runs automatically)
- GitHub webhooks
- Stripe payment webhooks  
- JustTheTip crypto payments
- Health monitoring endpoints

### **External APIs**
- Stripe for payments
- Discord for bot functionality
- JustTheTip for crypto payments
- Custom marketplace APIs

---

## 🚦 **Development vs Production**

### **Test Mode** (Development)
- Uses Stripe test keys
- Fake payment processing
- Safe for development
- All features available

### **Live Mode** (Production)
- Real Stripe payments
- Actual money transactions
- Requires business verification
- Production-ready features

---

## 🎊 **Community Features**

### **Both Themes Include:**
- Role management and progression
- Reaction-based interactions (🔥 reactions)
- Leaderboards and statistics
- Community challenges
- Social features and flexing
- Admin moderation tools

---

## 🔒 **Security & Privacy**

- All payment processing through Stripe
- No storage of payment information
- Discord token security
- Environment variable protection
- Webhook signature verification
- Rate limiting and spam protection

---

## 📈 **Analytics & Monitoring**

- User engagement tracking
- Transaction monitoring  
- Game statistics
- Tilt level analytics (Tilt Check theme)
- Respect point tracking (TrapHouse theme)
- Community growth metrics

---

## 🤝 **Support & Contributing**

### **Getting Help**
- Check the theme-specific command help (`!cards` or `!tiltcards`)
- Review marketplace guides
- Test with development endpoints
- Use the launcher for easy theme switching

### **Contributing**
- Fork the repository
- Create new themes
- Add features to existing themes
- Submit pull requests
- Report bugs and suggestions

---

**Choose your theme and start building your Discord community today!** 🚀

Whether you prefer the street vibes of TrapHouse or the strategic mindset of Tilt Check, both themes offer complete Discord bot ecosystems with marketplace integration, card games, and community features.
