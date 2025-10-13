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

/**
 * TiltCheck Enhanced Help Documentation
 * Comprehensive guide for the enhanced TiltCheck verification system
 */

module.exports = {
    getEnhancedTiltCheckHelp() {
        return `
🔍 **TiltCheck Enhanced Verification System**
*Comprehensive tilt detection with multi-platform verification*

**📋 AVAILABLE COMMANDS:**

**🔐 VERIFICATION & SETUP:**
\`!tiltcheck verify\` - Start comprehensive verification process
\`!tiltcheck start [hours]\` - Begin enhanced monitoring (requires verification)
\`!tiltcheck stop\` - Stop all monitoring

**📊 MONITORING & STATUS:**
\`!tiltcheck status\` - View complete monitoring dashboard
\`!tiltcheck patterns [detailed]\` - Check detected tilt patterns
\`!tiltcheck alerts [level]\` - Configure alert thresholds

**💰 WALLET TRACKING:**
\`!tiltcheck wallet [address]\` - View wallet verification status
\`!tiltcheck wallet add [address]\` - Add wallet for monitoring
\`!tiltcheck wallet remove [address]\` - Remove wallet tracking

**🎰 CASINO INTEGRATION:**
\`!tiltcheck casino list\` - View connected casinos
\`!tiltcheck casino add [name]\` - Add casino for tracking
\`!tiltcheck casino verify [name]\` - Verify casino session

**🕐 COLLECTCLOCK INTEGRATION:**
\`!tiltcheck collectclock\` - View bonus tracking status
\`!tiltcheck collectclock [casino]\` - Check specific casino bonuses

---

**🔍 VERIFICATION METHODS:**

**1. Wallet Verification:**
• Supports: Ethereum, Bitcoin, Solana, Polygon
• Tracks: Balance, transactions, gambling activity
• Risk scoring: Based on gambling transaction patterns

**2. Discord Session:**
• Validates: Server connections, activity patterns
• Analyzes: Gambling-related server participation
• Monitors: Late-night activity, excessive usage

**3. Stake Account:**
• Integrates: Official Stake API verification
• Tracks: Wagering history, session patterns, tier status
• Detects: Loss chasing, excessive session lengths

**4. Casino Sessions:**
• Supports: 15+ major crypto casinos
• Tracks: Active sessions, betting patterns
• Monitors: Multi-casino velocity, simultaneous activity

**5. Local Storage Analysis:**
• Scans: Browser data for gambling indicators
• Detects: Automation tools, wallet connections
• Identifies: Pattern manipulation attempts

---

**🎯 PATTERN DETECTION:**

**📈 Enhanced Patterns (Verification-Based):**
• **Verified Loss Chasing** - Wallet-confirmed deposit escalation
• **Multi-Casino Velocity** - Cross-platform rapid betting
• **Bonus Abuse Tilt** - Obsessive bonus collection patterns
• **Cross-Platform Correlation** - Activity correlation analysis
• **Stake Escalation** - API-verified betting increase

**🚨 Alert Levels:**
• **LOW (30%)** - Minor pattern indicators
• **MEDIUM (50%)** - Moderate risk patterns
• **HIGH (70%)** - Significant tilt behavior
• **CRITICAL (85%)** - Immediate intervention needed

---

**🏆 COLLECTCLOCK INTEGRATION:**

**Supported Platforms:**
• TrustDice, Stake US, MetaWin, SpinBlitz, Hello Millions
• Mega Bonanza, Real Prize, LuckyBird, WowVegas, Pulsz
• Modo, McLuck, Crown Coins, Chanced, Sportzino

**Bonus Tracking Features:**
• Daily bonus availability monitoring
• Collection pattern analysis (obsessive detection)
• Missed bonus risk assessment
• Cross-platform bonus hunting detection
• Optimal collection time suggestions

**Risk Indicators:**
• Obsessive collection patterns (>95% consistency)
• Very early collection times (<6 AM)
• Bonus hunting across multiple platforms
• Immediate loss of collected bonuses

---

**🔧 SETUP EXAMPLES:**

**Basic Verification:**
\`!tiltcheck verify wallets:0x1234...5678 collectclock:true\`

**Full Verification:**
\`!tiltcheck verify wallets:0x1234...5678,bc1q9876...4321 stake:your_account_id casinos:stake.us,trustdice,rollbit collectclock:true\`

**Start Monitoring:**
\`!tiltcheck start 24\` (24-hour monitoring session)

**Check Status:**
\`!tiltcheck status\` (complete monitoring overview)

**View Patterns:**
\`!tiltcheck patterns detailed\` (detailed pattern analysis)

---

**⚙️ REQUIREMENTS:**

**Minimum for Enhanced Monitoring:**
• Trust Score: 50/100 or higher
• At least 1 verified method
• Discord session validation
• JustTheTip bot access only

**Trust Score Calculation:**
• Wallet Verification: 30 points
• Discord Session: 20 points  
• Stake Account: 25 points
• Casino Sessions: 15 points
• Local Storage: 10 points

---

**🔒 PRIVACY & SECURITY:**

• All verification data encrypted
• Session tokens handled securely
• Wallet addresses monitored via public APIs only
• Casino data anonymized for pattern analysis
• No private keys or passwords stored
• Real-time monitoring can be stopped anytime

---

**💡 TIPS FOR ACCURATE MONITORING:**

1. **Provide multiple verification methods** for higher accuracy
2. **Keep casino sessions active** during monitoring
3. **Use consistent wallet addresses** across platforms
4. **Enable CollectClock** for comprehensive bonus analysis
5. **Set appropriate alert levels** for your risk tolerance

**Need help with specific commands?**
Use: \`!tiltcheck [command] help\` for detailed command instructions

*This system is designed to help identify problematic gambling patterns through comprehensive verification and real-time monitoring.*`;
    },

    getQuickReference() {
        return `
**🔍 TiltCheck Quick Reference**

**Setup:** \`!tiltcheck verify wallets:ADDRESS stake:ID casinos:LIST\`
**Monitor:** \`!tiltcheck start [hours]\`
**Status:** \`!tiltcheck status\`
**Patterns:** \`!tiltcheck patterns\`
**Stop:** \`!tiltcheck stop\`

**CollectClock:** \`!tiltcheck collectclock [casino]\`
**Wallets:** \`!tiltcheck wallet [address]\`
**Casinos:** \`!tiltcheck casino list\`
**Alerts:** \`!tiltcheck alerts [level]\`

*Full help: \`!tiltcheck help\`*`;
    }
};
