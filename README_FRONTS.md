# 🏠 TrapHouse Discord Bot - Tony Montana's Fronts Edition

A Discord bot for managing a "traphouse" themed server with a sophisticated lending/fronts system inspired by Tony Montana.

## 🎯 Features

### 💰 Tony Montana's Fronts System
- **Monday-only fronts**: Lending only available on Mondays
- **5-day repayment period**: Users have exactly 5 days to repay
- **150% repayment rate**: Borrow $20, repay $30 (50% interest)
- **Trust-based limits**: Progressive lending limits based on payment history
- **Late fee penalties**: 25% additional fees for overdue payments
- **No partial payments**: Full repayment required

### 🏆 Trust System
- **Low Trust** (0-1 successful payments): Max $20 loans
- **Medium Trust** (2-4 successful payments): Max $50 loans  
- **High Trust** (5+ successful payments): Max $100 loans
- Late payments only build half trust

### 📋 Commands

#### User Commands
- `!front me <amount>` - Request a front (Mondays only)
- `!front repay <amount>` - Repay your debt
- `!front check` - Check your loan status and time remaining
- `!front trust` - View your trust level and borrowing limits
- `!front help` - Show all commands and rules

#### Admin Commands  
- `!admin_front override` - Disable Monday restriction for testing
- `!admin_front restore` - Re-enable Monday restriction
- `!admin_front stats` - View system statistics
- `!admin_front clear <user_id>` - Clear a user's debt

#### Other Commands
- `!streetname` - Get assigned a street role
- `!work` - Earn respect points
- `!repay` - Legacy loan repayment (for old loan system)

## 🚀 Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install discord.js dotenv
   ```

3. Create a `.env` file with your bot token:
   ```
   DISCORD_BOT_TOKEN=your_bot_token_here
   ```

4. Run the bot:
   ```bash
   node index.js
   ```

## 📁 File Structure

- `index.js` - Main bot entry point
- `front.js` - Tony Montana's fronts system
- `admin_front.js` - Admin commands for fronts management
- `loanManager.js` - Legacy loan system
- `roleManager.js` - Role assignment system
- `respectManager.js` - Respect/reputation system
- `loans.json` - Stores active loans (auto-created)
- `user_trust.json` - Stores user trust levels (auto-created)
- `monday_override.json` - Admin override for testing (created when needed)

## 🎭 Tony Montana Quotes & Vibes

The bot incorporates classic Tony Montana quotes and street slang:
- "Whatchu need? A chicken? A bird? Maybe a nickel? Dimebag?"
- "You got some fo me? That's okkk..."
- "Another quaalude she love me in the mornin'"
- "Don't make me come lookin' for you..."
- "Once you build trust with me, I will open the doors to bigger amounts!"

## 🧪 Testing

Run the test suite:
```bash
node test_fronts.js
```

Use admin override for testing on non-Mondays:
```
!admin_front override
```

## ⚠️ Important Notes

- **Monday Restriction**: Fronts are only available on Mondays (use admin override for testing)
- **No Partial Payments**: Users must pay the full amount due
- **Trust Building**: Successful on-time payments build trust for larger loans
- **Late Fees**: 25% penalty added to overdue loans
- **Data Persistence**: All data stored in JSON files

## 📊 Example Usage

```
User: !front me 20
Bot: You been fronted 💸 $20! You got 5 days to bring me back $30 (150%). Don't make me come lookin' for you... 🔫

[5 days later]
User: !front repay 30  
Bot: Respect! 💯 You paid your dues in full ($30). Trust level: low (max loan: $20). You got some fo me? That's okkk, I got more for you when you need it! 🤝
```

## 🔧 Configuration

Trust levels and loan amounts can be modified in `front.js`:
```javascript
function getMaxLoanAmount(trustLevel) {
    switch(trustLevel) {
        case 'high': return 100;    // Modify max amounts here
        case 'medium': return 50;
        case 'low': return 20;
        default: return 20;
    }
}
```

---

*"Say hello to my little bot!"* 🤖🔫
