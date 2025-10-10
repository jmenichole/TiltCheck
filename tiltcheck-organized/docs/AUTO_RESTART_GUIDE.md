# 🤖 AUTO-RESTART SETUP GUIDE

## **QUICK START - GET YOUR BOT RUNNING WITH AUTO-RESTART**

### **🚀 Method 1: Simple Auto-Restart (Recommended)**
```bash
./simple-restart.sh
```
- Choose option 1 for auto-restart on crash
- No additional packages needed
- Restarts up to 10 times if bot crashes

### **🔧 Method 2: Advanced Auto-Restart (Node.js)**
```bash
node auto-restart.js
```
- Cross-platform solution
- File watching capabilities
- Advanced logging

### **⚡ Method 3: Quick Commands**
```bash
# Basic auto-restart with crash recovery
npm run auto-restart

# Watch files and restart on changes
npm run watch

# Start normally
npm start
```

---

## **📋 AVAILABLE RESTART METHODS**

### **1. Simple Bash Script** ⭐ **RECOMMENDED FOR BEGINNERS**
- **Command:** `./simple-restart.sh`
- **Features:** 
  - Auto-restart on crash (up to 10 times)
  - No dependencies required
  - Built-in tilt protection test
- **Best for:** Quick setup, testing, development

### **2. Node.js Auto-Restart Manager**
- **Command:** `node auto-restart.js`
- **Features:**
  - File watching (restarts when you edit code)
  - Crash recovery
  - Advanced logging
  - Cross-platform
- **Best for:** Development, file monitoring

### **3. NPM Scripts**
- **Commands:**
  ```bash
  npm run auto-restart  # Nodemon with file watching
  npm run watch         # File watching only
  npm start            # Normal start
  ```
- **Features:** Integrated with package.json
- **Best for:** Development workflow

### **4. Production Process Managers** (Advanced)
- **PM2:** `npm run pm2` (production-grade)
- **Forever:** `npm run forever` (simple daemon)
- **Best for:** Production servers

---

## **🎯 TEST YOUR TILT PROTECTION AFTER RESTART**

After starting your bot with auto-restart, test your personalized tilt protection:

### **In Discord, try these commands:**
```
$mytilt setup     # Create your tilt profile
$mytilt emergency # Emergency protection
$mytilt patterns  # View your tilt patterns
$mytilt analyze   # Stake Originals explanation
```

If `$mytilt` doesn't work:
1. Make sure bot restarted successfully
2. Check bot has permissions in channel
3. Try in DM with bot first
4. Run `./simple-restart.sh` and choose option 3 to test

---

## **🔄 HOW AUTO-RESTART WORKS**

### **Crash Detection:**
- Monitors bot process exit codes
- Automatically restarts if bot crashes
- Limits restart attempts to prevent infinite loops

### **File Watching** (Advanced methods):
- Watches `.js` and `.json` files for changes
- Automatically restarts when you edit code
- Ignores `node_modules`, `.git`, test files

### **Logging:**
- All restart events are logged
- Bot output is captured
- Error messages are preserved

---

## **⚡ IMMEDIATE COMMANDS TO TRY**

### **Start bot with auto-restart right now:**
```bash
# Option 1: Simple (recommended)
./simple-restart.sh

# Option 2: Advanced
node auto-restart.js

# Option 3: Quick npm
npm run auto-restart
```

### **Test tilt protection:**
```bash
# Test the modules
./simple-restart.sh
# Choose option 3: "Test tilt protection system"
```

---

## **🛠️ TROUBLESHOOTING**

### **If scripts don't run:**
```bash
# Make scripts executable
chmod +x simple-restart.sh
chmod +x auto-restart.sh

# Or use Node.js version
node auto-restart.js
```

### **If bot doesn't restart:**
- Check console for error messages
- Verify `.env` file has correct Discord token
- Make sure `index.js` exists and is working
- Try starting bot manually first: `node index.js`

### **If $mytilt doesn't work:**
1. Bot needs to restart to load new commands
2. Use correct prefix: `$mytilt` not `!mytilt`
3. Check bot permissions in Discord channel
4. Test other commands first: `$help`, `$enhanced`

---

## **📁 FILES CREATED**

- `simple-restart.sh` - Simple bash auto-restart script
- `auto-restart.js` - Advanced Node.js restart manager
- `ecosystem.config.js` - PM2 configuration
- `package.json` - Updated with restart scripts

---

## **🎯 WHAT'S NEXT**

1. **Start your bot:** `./simple-restart.sh`
2. **Test tilt protection:** `$mytilt setup` in Discord
3. **Your personalized tilt protection is ready!**

**Remember:** Your tilt protection system uses YOUR own quotes and patterns:
- *"Went full tilt trying to chase the adrenaline rush"*
- *"$100 Bet Ended Up Tilting Whole Bal & Loss"*
- *"bankroll management is key and don't TILT"*

**Your bot will now restart automatically when it crashes AND protect you from the exact tilt patterns you described!**
