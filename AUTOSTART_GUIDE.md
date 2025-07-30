# 🚀 TrapHouse Bot Auto-Start Setup Guide

## 🎯 Overview
Set up your TrapHouse Discord bot to automatically start when your Mac boots up and keep running reliably.

## 📋 Setup Options

### Option 1: Quick Setup (Recommended)
```bash
# Run the automated setup script
./setup_autostart.sh
```

### Option 2: Manual Setup
```bash
# 1. Copy the launch agent
cp com.traphouse.discordbot.plist ~/Library/LaunchAgents/

# 2. Load the service
launchctl load ~/Library/LaunchAgents/com.traphouse.discordbot.plist

# 3. Start immediately
launchctl start com.traphouse.discordbot
```

## 🛠️ Bot Management Commands

### Using the Enhanced Bot Manager
```bash
# Start the bot
./bot_manager.sh start

# Stop the bot
./bot_manager.sh stop

# Restart the bot
./bot_manager.sh restart

# Check status
./bot_manager.sh status

# View logs
./bot_manager.sh logs
./bot_manager.sh logs error

# Monitor mode (auto-restart if crashes)
./bot_manager.sh monitor
```

### Using macOS launchctl
```bash
# Start service
launchctl start com.traphouse.discordbot

# Stop service
launchctl stop com.traphouse.discordbot

# Restart service
launchctl kickstart -k gui/$(id -u)/com.traphouse.discordbot

# Check if running
launchctl list | grep traphouse

# View service status
launchctl print gui/$(id -u)/com.traphouse.discordbot
```

## 📊 Monitoring & Logs

### Log Files Location
- **Bot Output**: `logs/bot.log`
- **Error Log**: `logs/bot_error.log`

### Real-time Log Viewing
```bash
# Watch bot logs live
tail -f logs/bot.log

# Watch error logs live
tail -f logs/bot_error.log

# Watch both logs
tail -f logs/*.log
```

### Log Rotation (Optional)
```bash
# Create weekly log rotation
echo "0 0 * * 0 cd /Users/fullsail/Desktop/traphouse_discordbot && mv logs/bot.log logs/bot-$(date +%Y%m%d).log && touch logs/bot.log" | crontab -
```

## ⚙️ Configuration

### Launch Agent Settings
The `com.traphouse.discordbot.plist` file controls:
- **RunAtLoad**: Starts on system boot
- **KeepAlive**: Automatically restarts if crashes
- **ThrottleInterval**: Prevents rapid restart loops
- **Logging**: Captures output and errors

### Environment Variables
Edit the plist file to add environment variables:
```xml
<key>EnvironmentVariables</key>
<dict>
    <key>NODE_ENV</key>
    <string>production</string>
    <key>DISCORD_BOT_TOKEN</key>
    <string>your_token_here</string>
</dict>
```

## 🔧 Troubleshooting

### Bot Won't Start
```bash
# Check if service is loaded
launchctl list | grep traphouse

# Check error logs
./bot_manager.sh logs error

# Verify Node.js path
which node

# Test bot manually
node index.js
```

### Permission Issues
```bash
# Fix script permissions
chmod +x *.sh

# Fix log directory permissions
chmod 755 logs/
```

### Service Not Loading
```bash
# Unload and reload
launchctl unload ~/Library/LaunchAgents/com.traphouse.discordbot.plist
launchctl load ~/Library/LaunchAgents/com.traphouse.discordbot.plist

# Check plist syntax
plutil -lint com.traphouse.discordbot.plist
```

## 🗑️ Uninstall Auto-Start

### Quick Removal
```bash
# Run the uninstall script
./uninstall_autostart.sh
```

### Manual Removal
```bash
# Stop and unload service
launchctl stop com.traphouse.discordbot
launchctl unload ~/Library/LaunchAgents/com.traphouse.discordbot.plist

# Remove plist file
rm ~/Library/LaunchAgents/com.traphouse.discordbot.plist
```

## 📈 Advanced Features

### Health Checks
Add to your bot code for health monitoring:
```javascript
// Add this to index.js
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Health check endpoint (optional)
const http = require('http');
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
    }
});
server.listen(3000);
```

### Resource Monitoring
```bash
# Monitor bot resource usage
while true; do
    echo "$(date): $(ps aux | grep 'node index.js' | grep -v grep | awk '{print "CPU: "$3"% MEM: "$4"%"}')"
    sleep 60
done >> logs/resource.log &
```

## 🎯 Best Practices

1. **Regular Monitoring**: Check logs daily
2. **Token Security**: Never commit tokens to git
3. **Update Dependencies**: Keep packages updated
4. **Backup Data**: Regular backup of bot data files
5. **Test Changes**: Test bot changes before deployment

## 🚨 Emergency Commands

```bash
# Kill all Node.js processes (DANGER!)
pkill -f node

# Force restart the service
sudo launchctl kickstart -k gui/$(id -u)/com.traphouse.discordbot

# Check system logs
log show --predicate 'process == "node"' --last 1h
```

---

**🏠 Your TrapHouse bot will now automatically start on system boot and keep running 24/7!**

*Use `./bot_manager.sh status` to check if everything is working correctly.* 💯
