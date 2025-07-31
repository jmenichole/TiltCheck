# 🚀 TrapHouse Bot Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Discord Bot Setup
- [ ] Go to https://discord.com/developers/applications
- [ ] Create new application
- [ ] Navigate to "Bot" section
- [ ] Create bot and copy token
- [ ] Enable required intents:
  - [ ] Message Content Intent
  - [ ] Server Members Intent (optional)
  - [ ] Guild Message Reactions

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Add your Discord bot token to `.env`
- [ ] Verify token format (should start with MTN... or similar)

### 3. Dependencies
- [ ] Run `npm install discord.js dotenv`
- [ ] Verify all files are present (run `ls *.js`)

### 4. tip.cc Setup
- [ ] Invite tip.cc bot to your Discord server
- [ ] Set up tip.cc wallet
- [ ] Test tip.cc functionality with small amounts
- [ ] Ensure tip.cc has permissions in front channels

## 🔧 Bot Configuration

### 5. Bot Permissions
Invite bot to server with these permissions:
- [ ] Send Messages
- [ ] Read Message History
- [ ] Add Reactions
- [ ] Mention Everyone (for @user features)
- [ ] Manage Messages (for admin commands)

### 6. Channel Setup
- [ ] Create `#tony-montanas-fronts` private channel
- [ ] Create `#showoff-your-hits` channel (50 respect points)
- [ ] Create `#busted-and-disgusted` channel (75 respect points)
- [ ] Set proper channel permissions
- [ ] Test bot access to channels

## 🧪 Testing Phase

### 7. Basic Functionality
- [ ] Run `./start.sh` or `node index.js`
- [ ] Verify bot comes online in Discord
- [ ] Test `!front help` command
- [ ] Test `!work` command for respect

### 8. Respect System
- [ ] Test `!work` command (15 points)
- [ ] Test `!respect @user` (100 points, cooldown)
- [ ] Post in #showoff-your-hits (50 points)
- [ ] Post in #busted-and-disgusted (75 points)
- [ ] Test 🔥 reactions (10 points)
- [ ] Verify rank progression with `!front trust`

### 9. Fronts System
- [ ] Use `!admin_front override` to bypass Monday restriction
- [ ] Test `!front me 10` (small amount)
- [ ] Verify tip.cc integration instructions appear
- [ ] Test `!front check` and `!front trust`
- [ ] Test admin commands: `!admin_front debts`, `!admin_front confirm`

## 🔴 Go-Live Steps

### 10. Production Setup
- [ ] Remove Monday override: `!admin_front restore`
- [ ] Set up monitoring/logging
- [ ] Create backup of data files
- [ ] Document admin procedures

### 11. User Onboarding
- [ ] Post rules in #tony-montanas-fronts
- [ ] Explain respect earning methods
- [ ] Share command list (`!front help`)
- [ ] Set expectations for tip.cc payments

### 12. Admin Training
- [ ] Train admins on `!admin_front confirm @user`
- [ ] Show how to check `!admin_front debts`
- [ ] Explain tip.cc verification process
- [ ] Create admin response templates

## 📊 Monitoring

### 13. Daily Checks
- [ ] Monitor `!admin_front stats`
- [ ] Check `!admin_front debts` for overdue loans
- [ ] Verify tip.cc transactions match bot records
- [ ] Review respect point distribution

### 14. Weekly Reviews
- [ ] Analyze user engagement with `!hood`
- [ ] Check for any abuse patterns
- [ ] Update trust levels if needed
- [ ] Review rank progression

## 🆘 Troubleshooting

### Common Issues:
- **Bot not responding**: Check token, permissions, and error logs
- **tip.cc not working**: Verify tip.cc bot permissions and setup
- **Users can't get fronts**: Check Monday restriction and rank limits
- **Data not persisting**: Verify file write permissions

### Emergency Commands:
- `!admin_front clear @user` - Manually clear debt
- `!admin_front override` - Enable testing mode
- Restart bot if needed: `./start.sh`

## 📁 File Backup

Important files to backup regularly:
- [ ] `loans.json` - Active loans
- [ ] `user_trust.json` - Trust levels
- [ ] `user_data.json` - Respect points
- [ ] `respect_cooldowns.json` - Cooldown tracking

---

**🎯 Ready to launch? All checkboxes completed = GO TIME!**

*"Say hello to my little bot!"* 🤖🔫
