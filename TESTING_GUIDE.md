# 🎯 Bot Testing Checklist

## ✅ Configuration Status
- [x] Discord Server IDs configured
- [x] Bot tokens configured  
- [x] Feature flags set
- [ ] Crypto addresses (optional for basic testing)

## 🧪 Basic Testing Commands

### In your Discord server, try these commands:

#### Basic Bot Commands:
```
!help           # Shows available commands
!ping           # Tests bot responsiveness
!hello          # Basic greeting
```

#### Respect System:
```
!respect @user  # Give respect to a user
!leaderboard    # View respect rankings
```

#### Loan System (TrapHouse bot only):
```
!loan request 100   # Request a loan
!loan status        # Check loan status
!loans              # View all loans
```

#### Card Game:
```
!cards          # Start card game
!deck           # View your deck
```

#### Admin Commands (if you have admin role):
```
!purge 10       # Delete 10 messages
!admin help     # Admin command list
```

## 🔧 If Bot Doesn't Respond:

1. **Check Bot Status:**
   - Is the bot showing as online in Discord?
   - Check server member list for your bot

2. **Check Permissions:**
   - Bot needs "Send Messages" permission
   - Bot needs "Read Message History" permission
   - Bot role should be above regular user roles

3. **Check Configuration:**
   - Run: `node setup_config.js`
   - Verify DISCORD_GUILD_ID matches your server

4. **Restart Bot:**
   ```bash
   # Stop bot
   pkill -f "node index.js"
   
   # Start bot
   node index.js &
   ```

## 🚀 Advanced Testing (After Basic Setup Works):

### Crypto Tipping (if addresses configured):
```
$tip @user 10 SOLUSDC      # Tip user crypto
$balance                   # Check your balance
$history                   # View tip history
```

### TiltCheck Integration (JustTheTip bot):
```
!tiltcheck verify @user    # Verify gambling behavior
!tiltcheck stats           # View statistics
```

### Payment Processing:
```
!deposit                   # Start deposit process
!withdraw 50               # Withdraw funds
```

## 📊 Success Indicators:

- [ ] Bot responds to !ping
- [ ] Bot shows in server member list as online
- [ ] !help command works
- [ ] Bot logs appear in your log channel
- [ ] Commands work without errors

## 🆘 Common Issues:

**Bot not responding:**
- Check bot token is correct
- Verify bot has joined the server
- Check bot permissions

**Permission errors:**
- Move bot role higher in server settings
- Grant necessary permissions

**Commands not working:**
- Check prefix (! for basic commands, $ for crypto)
- Verify you're in the right channel
- Check if command exists in !help
