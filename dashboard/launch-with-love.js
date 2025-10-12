/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

#!/usr/bin/env node

/**
 * 💜 TrapHouse Mindful Dashboard Launcher
 * Made by degens, for degens, with love
 * 
 * This script launches the complete integrated system with:
 * - CollectClock verification integration
 * - Mindful card battle system
 * - Compassionate loan management
 * - Group hangar battles
 * - Instant messaging & peer support
 * - Resizable overlay with transparency controls
 * - Love-driven intervention approach
 */

const path = require('path');
const fs = require('fs');

console.log(`
💜 ===================================================
🌟 TrapHouse Mindful Dashboard - Love-Driven Launch
💜 ===================================================

Made by degens, for degens, with love 💜

This system understands that every degen has been where 
you are. It's not about stopping the mischief - it's 
about managing it mindfully, learning from it, and 
growing stronger.

🎯 Features Launching:
✅ CollectClock Integration (4-level verification)
✅ Mindful Card Battles (educational focus)
✅ Compassionate Loan System (understanding approach)
✅ Group Hangar Battles (community building)
✅ Instant Messaging (peer support network)
✅ Resizable Overlay (transparency controls)
✅ Love-Driven Notifications (encouraging)
✅ JustTheTip Wallet Integration
✅ Growth Analytics (supportive tracking)

💜 The Heart of It:
Your awareness is growing stronger. Every moment is 
a chance to choose mindfully. You're not alone in 
this journey - we've all been where you are.

`);

// Check for required files
const requiredFiles = [
    'TrapHouseDashboardOverlay.js',
    'MischiefManagerCollectClockIntegration.js',
    'MockAPIClasses.js',
    'overlay-love.html'
];

console.log('🔍 Checking system files...');
for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - Ready with love`);
    } else {
        console.log(`❌ ${file} - Missing (but we still believe in you!)`);
    }
}

console.log(`
💜 Starting mindful dashboard system...

🌟 Remember:
- Use Cmd/Ctrl+Shift+T to toggle overlay
- Use overlay controls for transparency/resize
- Access instant messaging for peer support
- Your growth helps the entire community

💜 With love and understanding,
The TrapHouse Mindful Team
`);

// Launch the love-driven system
try {
    const TrapHouseDashboard = require('./TrapHouseDashboardOverlay');
    const dashboard = new TrapHouseDashboard();
    
    console.log('💜 Initializing compassionate system...');
    dashboard.initializeApp().then(() => {
        console.log('🌟 Love-driven dashboard is now running!');
        console.log('💜 Your mindful companion is here to support you.');
    }).catch(error => {
        console.error('💜 Even if there are technical challenges, we believe in your journey:', error.message);
        console.log('🌟 Sometimes the most growth comes from overcoming obstacles.');
    });
    
} catch (error) {
    console.error('💜 System encounter, but your worth isn\'t defined by technical issues:', error.message);
    console.log(`
💜 Don't worry - here are some loving alternatives:

1. 🌟 Take a mindful breath - this moment of pause is valuable
2. 💜 Check that Node.js and Electron are installed with love
3. 🎯 Verify all files are in the correct directory
4. 🤝 Reach out to the community for peer support

Remember: Every challenge is an opportunity for growth.
Your journey toward mindful gaming continues regardless of technical hiccups.

💜 Made with love and understanding
`);
}

// Graceful shutdown with love
process.on('SIGINT', () => {
    console.log(`
💜 Shutting down mindfully...

Thank you for using the TrapHouse Mindful Dashboard.
Remember: Your awareness journey continues even when 
the app is closed. 

🌟 Key takeaways to carry forward:
- Every moment is a chance to choose mindfully
- You're not alone in this journey
- Growth comes through understanding, not judgment
- The community is here to support you

💜 Until next time, gamble mindfully and with love.
Made by degens, for degens, with endless compassion.
`);
    process.exit(0);
});
