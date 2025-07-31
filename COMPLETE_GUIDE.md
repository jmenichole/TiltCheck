# 🏠 TrapHouse Discord Bot - Complete Integration Guide

## 🎯 Overview
The TrapHouse Discord Bot combines a sophisticated respect/ranking system with Tony Montana-inspired fronts (loans) using real money via tip.cc integration.

## 💯 Respect System

### Earning Respect Points
- **!work command**: 15 points
- **#showoff-your-hits posts**: 50 points
- **#busted-and-disgusted posts**: 75 points
- **🔥 reactions received**: 10 points  
- **!respect @user**: 100 points (1 hour cooldown)
- **Job completion**: 25 points (varies)

### Rank Progression
- **Street Soldier** (0-499 respect): Max $20 loans
- **Corner Boy** (500-999 respect): Max $35 loans
- **Hustler** (1000-1999 respect): Max $50 loans  
- **Shot Caller** (2000-4999 respect): Max $75 loans
- **Boss** (5000+ respect): Max $100 loans

## 💰 Fronts System

### How It Works
1. **Monday Only**: Fronts available Mondays only
2. **5 Day Terms**: Exactly 5 days to repay
3. **150% Repayment**: Borrow $20, repay $30 (50% interest)
4. **Respect + Trust**: Your rank determines base limit, trust determines percentage
5. **tip.cc Integration**: All payments via Discord tip bot

### Trust Multipliers
- **Low Trust** (0-1 payments): 50% of respect cap
- **Medium Trust** (2-4 payments): 75% of respect cap
- **High Trust** (5+ payments): 100% of respect cap

### Example Progression
```
New User (0 respect, low trust):
- Rank: Street Soldier ($20 cap)
- Trust: Low (50% modifier)
- Max loan: $10

After 600 respect + 3 successful payments:
- Rank: Corner Boy ($35 cap)  
- Trust: Medium (75% modifier)
- Max loan: $26

After 2500 respect + 6 successful payments:
- Rank: Shot Caller ($75 cap)
- Trust: High (100% modifier)
- Max loan: $75
```

## 🎮 Commands

### User Commands
```
💯 General
!street - Get your street name
!work - Earn 15 respect points
!respect @user - Give 100 respect (1hr cooldown)
!leaderboard - View top hustlers
!flex - Show off your stats
!hood - View server stats

💰 Fronts
!front me <amount> - Request front (Mondays only)
!front repay <amount> - Declare repayment amount
!front check - Check loan status  
!front trust - View rank/trust details
!front help - Show all rules
```

### Admin Commands
```
🔨 Front Management
!admin_front override - Disable Monday restriction
!admin_front restore - Re-enable Monday restriction
!admin_front stats - View system statistics
!admin_front confirm @user - Mark payment received
!admin_front debts - List all outstanding debts
!admin_front clear @user - Manual debt clearing

👑 General Admin
!kick @user - Remove from server
!ban @user - Permanent ban
!clear [number] - Delete messages
!mute @user - Silence user
```

## 💳 tip.cc Payment Flow

### 1. User Requests Front
```
User: !front me 25
Bot: You been fronted 💸 $25! You got 5 days to bring me back $38 (150%).

PAYMENT METHOD: Use tip.cc to send payment
Admin will send you: `$tip <@123456> 25`
You repay with: `$tip <@ADMIN> 38`
```

### 2. Admin Sends Money
```
$tip @username 25
```

### 3. User Repays
```
$tip @admin 38
```

### 4. Admin Confirms
```
!admin_front confirm @username
```

## 🏆 Game Mechanics

### Respect Earning Strategies
1. **Daily Grinding**: Use `!work` for steady 15 points
2. **Content Creation**: Post in #showoff-your-hits for 50 points
3. **Premium Content**: Post in #busted-and-disgusted for 75 points  
4. **Community Engagement**: Get 🔥 reactions for 10 points each
5. **Social Building**: Give respect to others for networking

### Trust Building
1. **Start Small**: Request minimum amounts first
2. **Pay On Time**: On-time payments build full trust
3. **Avoid Late Fees**: Late payments only build 50% trust
4. **Consistent History**: Build payment streak for higher trust

### Loan Optimization
```
Beginner Strategy:
1. Work to 500+ respect (Corner Boy rank)
2. Make 2-3 small on-time payments (Medium trust)
3. Unlock $26 loans (75% of $35 cap)

Advanced Strategy:
1. Grind to 2000+ respect (Shot Caller)
2. Maintain perfect payment history (High trust)
3. Access $75 maximum loans
```

## 🛠️ Setup Instructions

### Prerequisites
1. Discord bot with proper permissions
2. tip.cc bot invited to server
3. Node.js environment
4. Required npm packages: `discord.js`, `dotenv`

### Installation
```bash
git clone [your-repo]
cd traphouse_discordbot
npm install discord.js dotenv
```

### Environment Setup
Create `.env` file:
```
DISCORD_BOT_TOKEN=your_token_here
```

### Running the Bot
```bash
node index.js
```

## 📊 File Structure
```
traphouse_discordbot/
├── index.js              # Main bot entry
├── front.js               # Fronts system + tip.cc
├── respectManager.js      # Respect/ranking system
├── admin_front.js         # Admin front commands
├── storage.js             # Data persistence
├── loans.json             # Active loans (auto-created)
├── user_trust.json        # Trust levels (auto-created)
├── respect_cooldowns.json # Respect giving limits
└── README.md              # This file
```

## 🚨 Important Notes

### Security
- Bot tracks all transactions automatically
- Admin confirmation required for tip.cc payments
- Trust system prevents rapid scaling abuse
- Respect earning has built-in rate limits

### Economics
- 50% interest rate encourages quick repayment
- 25% late fees discourage defaults
- Respect requirements create long-term engagement
- Trust system rewards good behavior

### Moderation
- Admin override system for disputes
- Manual debt clearing for special cases
- Comprehensive logging for all transactions
- Respect point adjustments if needed

## 🎭 Roleplay Elements

The bot maintains Tony Montana/street theme throughout:
- "Whatchu need? A chicken? A bird? Maybe a nickel?"
- "You got some fo me? That's okkk..."
- "Don't make me come lookin' for you..."
- Street ranks and terminology
- Authentic slang and emojis

## 📈 Analytics & Tracking

Monitor these metrics:
- Total respect points distributed
- Average loan amounts by rank
- Repayment success rates
- Trust level distribution
- Most active respect earners

Use `!hood` command for real-time statistics.

---

*"Say hello to my little bot!"* 🤖🔫

**Ready to run the streets? Start with `!front help` and `!work`!**
