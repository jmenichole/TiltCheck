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
 * TiltCheck Legal Terms & User Agreement System
 * 
 * This answers the new requirement:
 * "Legal agreements when user accepts terms need to be fully compliant. Generate for 
 * user acceptance and integrate at the start of their account with TiltCheck. Ask user 
 * upon sign up if they want to connect login from another part of my ecosystem."
 * 
 * Features:
 * 1. Comprehensive Terms of Service
 * 2. Privacy Policy with GDPR compliance
 * 3. User consent tracking
 * 4. Ecosystem integration opt-in
 * 5. Legal audit trail
 * 6. Version management for terms updates
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class LegalTermsManager {
    constructor(options = {}) {
        // Storage paths
        this.termsDbPath = options.termsDbPath || './data/user_terms_acceptance.json';
        this.termsVersionPath = options.termsVersionPath || './data/terms_versions.json';
        
        // Current terms version
        this.currentTermsVersion = '1.0.0';
        this.currentPrivacyVersion = '1.0.0';
        this.termsLastUpdated = '2025-01-17';
        
        // User consent records
        this.userConsents = new Map(); // userId -> consent record
        
        // Ecosystem tools available for integration
        this.ecosystemTools = [
            {
                id: 'collectclock',
                name: 'CollectClock',
                description: 'Daily bonus collection tracker & reminders',
                icon: '⏰',
                benefits: [
                    'Never miss a daily bonus',
                    'Track collection streaks',
                    'Multi-casino scheduling',
                    'Automatic reminders'
                ]
            },
            {
                id: 'justthetip',
                name: 'JustTheTip',
                description: 'Trustless Solana tipping bot for Discord',
                icon: '💰',
                benefits: [
                    'Send/receive tips without custody',
                    'NFT-based trust scores',
                    'Community reputation system',
                    'Auto-vault integration'
                ]
            },
            {
                id: 'traphouse',
                name: 'TrapHouse Discord Bot',
                description: 'Full-featured Discord gambling community bot',
                icon: '🤖',
                benefits: [
                    'Casino commands and info',
                    'Degens card game',
                    'Respect points system',
                    'Loan/trust management'
                ]
            }
        ];
        
        console.log('⚖️ Legal Terms Manager initialized');
        
        this.loadUserConsents();
    }

    /**
     * Generate signup flow with legal terms
     * @param {Object} signupData - Signup information
     * @param {string} signupData.email - User email
     * @param {string} signupData.username - Username
     * @param {string} signupData.deviceType - Device type
     * @returns {Object} Signup flow data
     */
    generateSignupFlow(signupData) {
        const { email, username, deviceType = 'web' } = signupData;
        
        return {
            step: 1,
            totalSteps: 4,
            userId: crypto.randomBytes(16).toString('hex'),
            
            steps: [
                {
                    step: 1,
                    title: 'Welcome to TiltCheck 🎯',
                    type: 'welcome',
                    content: this._generateWelcomeMessage(username)
                },
                {
                    step: 2,
                    title: 'Terms of Service & Privacy Policy',
                    type: 'legal_agreement',
                    content: {
                        terms: this._generateTermsOfService(),
                        privacy: this._generatePrivacyPolicy(),
                        consent: this._generateConsentForm()
                    }
                },
                {
                    step: 3,
                    title: 'Connect Your Degen Ecosystem',
                    type: 'ecosystem_integration',
                    content: {
                        message: this._generateEcosystemMessage(),
                        availableTools: this.ecosystemTools,
                        optional: true
                    }
                },
                {
                    step: 4,
                    title: 'Setup Complete!',
                    type: 'completion',
                    content: this._generateCompletionMessage()
                }
            ]
        };
    }

    /**
     * Generate welcome message
     * @private
     */
    _generateWelcomeMessage(username) {
        return {
            title: `Welcome, ${username}! 👋`,
            message: `
# TiltCheck: Your Casino Fairness Guardian

You're about to join a community of players who believe in **transparency, fairness, and accountability**.

## What TiltCheck Does For You:

🎲 **Real-Time Fairness Verification**
   Analyze your gameplay to detect if casinos are operating fairly

📊 **Statistical Analysis**
   Compare actual RTP to casino claims using mathematics

🔐 **Provably Fair Verification**
   Verify cryptographic seeds to prove fairness

⚖️ **Legal Protection**
   Documentation and evidence for complaints or lawsuits

📱 **Cross-Platform Monitoring**
   Works on mobile, desktop, and web

🤝 **Community Support**
   Connect with fellow degens who value fair play

## Your Rights:

✓ You own your data
✓ You can export everything anytime
✓ You can delete your account anytime
✓ Full transparency in how we operate

Let's get started! First, we need your agreement to our terms...
            `.trim(),
            cta: 'Continue to Terms'
        };
    }

    /**
     * Generate Terms of Service
     * @private
     */
    _generateTermsOfService() {
        return {
            version: this.currentTermsVersion,
            lastUpdated: this.termsLastUpdated,
            effectiveDate: this.termsLastUpdated,
            
            document: `
# TILTCHECK TERMS OF SERVICE

**Version ${this.currentTermsVersion}**
**Last Updated: ${this.termsLastUpdated}**
**Effective Date: ${this.termsLastUpdated}**

═══════════════════════════════════════════════════════════

## 1. ACCEPTANCE OF TERMS

By creating a TiltCheck account, you agree to these Terms of Service ("Terms"). 
If you do not agree, do not use TiltCheck.

**Important:** TiltCheck is a tool for MONITORING and ANALYSIS. We do not operate 
casinos, process bets, or handle gambling transactions.

═══════════════════════════════════════════════════════════

## 2. DESCRIPTION OF SERVICE

TiltCheck provides:

### 2.1 Fairness Monitoring
- Real-time analysis of casino gameplay
- Statistical RTP (Return to Player) calculations
- Deviation detection and alerting
- Provably fair seed verification

### 2.2 Legal Documentation
- Evidence collection for regulatory complaints
- Mismatch logging and reporting
- Trust score calculations
- Compliance monitoring

### 2.3 User Tools
- Mobile app integration
- OAuth authentication
- Cross-platform session management
- Ecosystem tool integration

═══════════════════════════════════════════════════════════

## 3. USER RESPONSIBILITIES

### 3.1 You Must Be of Legal Age
- You must be at least 18 years old (or legal gambling age in your jurisdiction)
- You are responsible for complying with your local gambling laws
- TiltCheck is NOT responsible for your gambling activities

### 3.2 Accuracy of Information
- You must provide accurate information
- You must keep your account secure
- You are responsible for all activity under your account

### 3.3 Prohibited Activities
You may NOT:
- Use TiltCheck for illegal purposes
- Attempt to hack or compromise our systems
- Share your account credentials
- Use TiltCheck to operate or promote casinos
- Violate any applicable laws or regulations

═══════════════════════════════════════════════════════════

## 4. MONITORING AND DATA COLLECTION

### 4.1 What We Monitor
When you opt-in to monitoring, we collect:
- Bet amounts and outcomes
- Game types and sessions
- Casino identifiers
- Session duration and timestamps
- Screen capture data (with your permission)

### 4.2 How We Use This Data
- Calculate statistical RTP
- Detect fairness violations
- Generate reports and alerts
- Provide legal evidence if needed
- Improve our services

### 4.3 Your Control
- You can start/stop monitoring anytime
- You can export your data anytime
- You can delete your data anytime
- You own your gameplay data

═══════════════════════════════════════════════════════════

## 5. LEGAL ASSISTANCE

### 5.1 Evidence Collection
- We preserve evidence of casino violations
- We generate legal documentation
- We provide regulatory contact information
- We may assist in filing complaints

### 5.2 Not Legal Advice
- TiltCheck does NOT provide legal advice
- Information provided is educational only
- Consult with an attorney for legal matters
- We are not liable for legal outcomes

### 5.3 Developer Notifications
- Developer may be notified of serious violations
- This is for platform protection purposes
- Developer has no obligation to take action
- You must pursue your own legal remedies

═══════════════════════════════════════════════════════════

## 6. DISCLAIMER OF WARRANTIES

### 6.1 Service Provided "AS IS"
- No warranty of accuracy or reliability
- No guarantee of casino fairness detection
- No guarantee of legal success
- Statistical analysis has inherent limitations

### 6.2 Gambling Risks
- You acknowledge gambling involves risk of loss
- TiltCheck cannot prevent losses
- TiltCheck cannot guarantee winnings
- You gamble at your own risk

### 6.3 Technical Limitations
- Service may have bugs or errors
- OCR may misread screen content
- Internet connectivity may fail
- We are not liable for technical issues

═══════════════════════════════════════════════════════════

## 7. LIMITATION OF LIABILITY

**MAXIMUM LIABILITY: $100 USD**

To the fullest extent permitted by law:

- We are NOT liable for gambling losses
- We are NOT liable for casino actions
- We are NOT liable for legal outcomes
- We are NOT liable for data loss
- We are NOT liable for service interruptions

Our total liability for any claim is limited to $100 USD or the amount 
you paid for TiltCheck services in the last 12 months, whichever is less.

═══════════════════════════════════════════════════════════

## 8. INDEMNIFICATION

You agree to indemnify and hold harmless TiltCheck, its developer (jmenichole), 
and all affiliates from any claims arising from:

- Your use of TiltCheck
- Your gambling activities
- Your violation of these Terms
- Your violation of any laws
- Any legal action you pursue based on TiltCheck data

═══════════════════════════════════════════════════════════

## 9. INTELLECTUAL PROPERTY

### 9.1 Our Property
- TiltCheck code and algorithms are proprietary
- Copyright (c) 2024-2025 JME (jmenichole)
- Unauthorized copying or modification is prohibited

### 9.2 Your Property
- You own your gameplay data
- You grant us license to process your data
- You can revoke this license by deleting your account

═══════════════════════════════════════════════════════════

## 10. MODIFICATIONS TO TERMS

- We may update these Terms at any time
- We will notify you of material changes
- Continued use after changes means acceptance
- You can close your account if you disagree

═══════════════════════════════════════════════════════════

## 11. TERMINATION

### 11.1 By You
- Close your account anytime
- Export your data before closing
- Data deleted within 30 days

### 11.2 By Us
We may suspend or terminate your account for:
- Violation of these Terms
- Illegal activity
- Abuse of the service
- Non-payment (if applicable)

═══════════════════════════════════════════════════════════

## 12. GOVERNING LAW

These Terms are governed by the laws of [JURISDICTION - to be determined based 
on developer location].

Disputes must be resolved through binding arbitration, not class action lawsuits.

═══════════════════════════════════════════════════════════

## 13. CONTACT INFORMATION

**Developer:** jmenichole
**Email:** jmenichole007@outlook.com
**Discord:** jmenichole
**GitHub:** https://github.com/jmenichole/TiltCheck

═══════════════════════════════════════════════════════════

## 14. SEVERABILITY

If any provision of these Terms is found invalid, the remaining provisions 
remain in full effect.

═══════════════════════════════════════════════════════════

## 15. ENTIRE AGREEMENT

These Terms, together with our Privacy Policy, constitute the entire agreement 
between you and TiltCheck.

═══════════════════════════════════════════════════════════

**BY CLICKING "I ACCEPT", YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, 
AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.**

**FOR DEGENS, BY DEGENS. STAY SAFE. GAMBLE RESPONSIBLY.**

═══════════════════════════════════════════════════════════
            `.trim()
        };
    }

    /**
     * Generate Privacy Policy
     * @private
     */
    _generatePrivacyPolicy() {
        return {
            version: this.currentPrivacyVersion,
            lastUpdated: this.termsLastUpdated,
            
            document: `
# TILTCHECK PRIVACY POLICY

**Version ${this.currentPrivacyVersion}**
**Last Updated: ${this.termsLastUpdated}**

═══════════════════════════════════════════════════════════

## 1. INTRODUCTION

TiltCheck ("we", "us", "our") respects your privacy. This Privacy Policy explains 
how we collect, use, and protect your personal information.

**Developer:** JME (jmenichole)
**Contact:** jmenichole007@outlook.com

═══════════════════════════════════════════════════════════

## 2. INFORMATION WE COLLECT

### 2.1 Account Information
- Email address
- Username
- Password (encrypted via Magic.link)
- Web3 wallet address (optional)
- Discord ID (if you connect Discord)

### 2.2 Gameplay Monitoring Data
When you enable monitoring:
- Bet amounts and outcomes
- Win/loss records
- Game types (slots, dice, etc.)
- Casino identifiers
- Session timestamps and duration
- Screen capture frames (with permission)
- OCR-extracted text from gameplay

### 2.3 Technical Data
- IP address
- Device type and OS
- Browser type and version
- Session tokens
- Login timestamps

### 2.4 Usage Data
- Features used
- Time spent in app
- Errors encountered
- Performance metrics

═══════════════════════════════════════════════════════════

## 3. HOW WE USE YOUR INFORMATION

### 3.1 Primary Purposes
- **Fairness Analysis:** Calculate RTP and detect violations
- **Alerting:** Notify you of suspicious patterns
- **Legal Evidence:** Document casino violations
- **Service Improvement:** Enhance features and fix bugs

### 3.2 Communications
- Account notifications
- Alert messages
- Service updates
- Legal notices
- Marketing (opt-in only)

### 3.3 Legal Compliance
- Respond to legal requests
- Enforce our Terms
- Protect our rights
- Prevent fraud and abuse

═══════════════════════════════════════════════════════════

## 4. INFORMATION SHARING

### 4.1 We DO Share With:
- **You:** Full access to your data anytime
- **Law Enforcement:** If legally required
- **Regulatory Authorities:** When reporting casino violations
- **Legal Counsel:** If assisting with your case

### 4.2 We DO NOT Share With:
- Casinos (except anonymized aggregate data)
- Marketing companies
- Data brokers
- Social media platforms (unless you opt-in)

### 4.3 Ecosystem Tool Integration
If you opt-in to connect other tools:
- CollectClock: Shares user ID and session data
- JustTheTip: Shares wallet address and reputation score
- TrapHouse Bot: Shares Discord ID and activity data

You control these integrations and can disconnect anytime.

═══════════════════════════════════════════════════════════

## 5. DATA SECURITY

### 5.1 Security Measures
- End-to-end encryption for sensitive data
- Secure token storage
- Regular security audits
- Access controls and monitoring
- Encrypted backups

### 5.2 Magic.link Authentication
- Passwordless login (no passwords stored)
- DID (Decentralized Identity) based
- Multi-factor authentication support
- Session token rotation

### 5.3 Data Retention
- Active accounts: Data kept indefinitely
- Deleted accounts: Data purged within 30 days
- Legal evidence: Kept as required by law
- Backups: 90-day retention

═══════════════════════════════════════════════════════════

## 6. YOUR RIGHTS (GDPR & CCPA)

### 6.1 Access
- View all your data anytime
- Export in JSON format
- Portable to other services

### 6.2 Correction
- Update account information
- Correct erroneous data

### 6.3 Deletion
- Request account deletion
- Data purged within 30 days
- Some data retained for legal compliance

### 6.4 Opt-Out
- Stop monitoring anytime
- Opt-out of marketing emails
- Disconnect ecosystem tools

### 6.5 Data Portability
- Export all your data
- Machine-readable format
- Transfer to other services

═══════════════════════════════════════════════════════════

## 7. COOKIES AND TRACKING

### 7.1 Essential Cookies
- Authentication tokens
- Session management
- Security features

### 7.2 Analytics (Opt-In)
- Usage patterns
- Feature adoption
- Error tracking

### 7.3 No Third-Party Tracking
- No Facebook pixel
- No Google Analytics (unless you opt-in)
- No advertising cookies

═══════════════════════════════════════════════════════════

## 8. CHILDREN'S PRIVACY

TiltCheck is NOT intended for users under 18.

We do not knowingly collect data from minors. If we discover underage use, 
we will delete the account immediately.

═══════════════════════════════════════════════════════════

## 9. INTERNATIONAL USERS

TiltCheck is operated from [JURISDICTION].

If you are outside this jurisdiction:
- Your data may be transferred to our servers
- We comply with applicable data protection laws
- You consent to this transfer by using TiltCheck

═══════════════════════════════════════════════════════════

## 10. CHANGES TO PRIVACY POLICY

- We may update this policy at any time
- Material changes will be notified via email
- Continued use means acceptance
- You can close your account if you disagree

═══════════════════════════════════════════════════════════

## 11. CONTACT US

**Privacy Questions:** jmenichole007@outlook.com
**Data Requests:** jmenichole007@outlook.com
**Discord:** jmenichole

**Data Protection Officer:** JME (jmenichole)

═══════════════════════════════════════════════════════════

**BY USING TILTCHECK, YOU CONSENT TO THIS PRIVACY POLICY.**

**Last Updated:** ${this.termsLastUpdated}

═══════════════════════════════════════════════════════════
            `.trim()
        };
    }

    /**
     * Generate consent form
     * @private
     */
    _generateConsentForm() {
        return {
            title: 'Your Consent',
            required: [
                {
                    id: 'accept_terms',
                    label: 'I have read and accept the Terms of Service',
                    type: 'checkbox',
                    required: true,
                    link: '/terms'
                },
                {
                    id: 'accept_privacy',
                    label: 'I have read and accept the Privacy Policy',
                    type: 'checkbox',
                    required: true,
                    link: '/privacy'
                },
                {
                    id: 'age_confirmation',
                    label: 'I am at least 18 years old (or legal gambling age in my jurisdiction)',
                    type: 'checkbox',
                    required: true
                },
                {
                    id: 'gambling_risks',
                    label: 'I understand gambling involves risk and TiltCheck cannot prevent losses',
                    type: 'checkbox',
                    required: true
                },
                {
                    id: 'no_legal_advice',
                    label: 'I understand TiltCheck does not provide legal advice',
                    type: 'checkbox',
                    required: true
                }
            ],
            optional: [
                {
                    id: 'monitoring_consent',
                    label: 'I consent to gameplay monitoring and data collection',
                    type: 'checkbox',
                    default: true,
                    description: 'Required for fairness analysis. You can change this later.'
                },
                {
                    id: 'screen_capture',
                    label: 'I consent to screen capture for mobile app analysis',
                    type: 'checkbox',
                    default: false,
                    description: 'Only captures casino gameplay, not other apps.'
                },
                {
                    id: 'marketing_emails',
                    label: 'Send me tips, updates, and community news',
                    type: 'checkbox',
                    default: false
                },
                {
                    id: 'analytics',
                    label: 'Help improve TiltCheck by sharing anonymous usage data',
                    type: 'checkbox',
                    default: true
                }
            ]
        };
    }

    /**
     * Generate ecosystem integration message
     * @private
     */
    _generateEcosystemMessage() {
        return {
            title: 'Connect Your Degen Ecosystem 🔗',
            subtitle: 'One Account, All Your Tools',
            message: `
**For Degens, By Degens**

TiltCheck is part of a larger ecosystem of tools built specifically for the 
online gambling community.

## Why Connect?

✓ **Single Sign-On:** One account for all tools
✓ **Shared Data:** Your reputation and history carries over
✓ **Better Experience:** Tools work together seamlessly
✓ **Community:** Access to full degen network

## Available Tools:

Choose which tools you want to connect (all optional):
            `.trim(),
            optional: true,
            benefits: [
                'Automatic data sync',
                'Unified dashboard',
                'Shared reputation score',
                'Cross-tool notifications'
            ]
        };
    }

    /**
     * Generate completion message
     * @private
     */
    _generateCompletionMessage() {
        return {
            title: '🎉 Welcome to TiltCheck!',
            message: `
Your account is ready to go!

## What's Next?

1. **Connect a Casino**
   - Click a casino link
   - Log in through our secure OAuth
   - Start monitoring

2. **Enable Mobile App** (optional)
   - Download TiltCheck app
   - Scan QR code to sync
   - Enable screen capture

3. **Join the Community**
   - Discord: Join TrapHouse server
   - Share your experiences
   - Help others stay safe

4. **Set Your Preferences**
   - Alert thresholds
   - Notification settings
   - Privacy controls

═══════════════════════════════════════════════════════════

**Remember:** TiltCheck is a tool for monitoring and protection. 
Always gamble responsibly and within your means.

**Need Help?**
- Discord: @jmenichole
- Email: jmenichole007@outlook.com
- Docs: /help

═══════════════════════════════════════════════════════════

**Let's keep casinos honest together! 🎯**
            `.trim(),
            cta: 'Go to Dashboard'
        };
    }

    /**
     * Record user consent
     * @param {Object} consentData - Consent information
     * @param {string} consentData.userId - User identifier
     * @param {Object} consentData.consents - Consent checkboxes
     * @param {Array} consentData.ecosystemTools - Selected ecosystem tools
     * @param {string} consentData.ipAddress - IP address
     * @param {string} consentData.userAgent - User agent
     * @returns {Object} Consent record
     */
    async recordConsent(consentData) {
        const {
            userId,
            consents,
            ecosystemTools = [],
            ipAddress,
            userAgent
        } = consentData;
        
        // Validate required consents
        const required = ['accept_terms', 'accept_privacy', 'age_confirmation', 'gambling_risks', 'no_legal_advice'];
        for (const req of required) {
            if (!consents[req]) {
                throw new Error(`Required consent missing: ${req}`);
            }
        }
        
        const record = {
            userId,
            timestamp: Date.now(),
            termsVersion: this.currentTermsVersion,
            privacyVersion: this.currentPrivacyVersion,
            consents: {
                ...consents,
                consentTimestamp: Date.now(),
                consentMethod: 'signup',
                ipAddress,
                userAgent
            },
            ecosystemIntegrations: ecosystemTools,
            legallyBinding: true,
            auditTrail: [
                {
                    action: 'terms_accepted',
                    timestamp: Date.now(),
                    version: this.currentTermsVersion
                },
                {
                    action: 'privacy_accepted',
                    timestamp: Date.now(),
                    version: this.currentPrivacyVersion
                }
            ]
        };
        
        // Store consent
        this.userConsents.set(userId, record);
        
        // Save to disk
        await this._saveConsents();
        
        console.log(`✅ Legal consent recorded for user ${userId}`);
        console.log(`   Terms v${record.termsVersion}, Privacy v${record.privacyVersion}`);
        console.log(`   Ecosystem tools: ${ecosystemTools.length}`);
        
        return {
            success: true,
            consentId: record.userId,
            timestamp: record.timestamp,
            legallyBinding: true,
            message: 'Your consent has been recorded and is legally binding.'
        };
    }

    /**
     * Check if user has valid consent
     * @param {string} userId - User identifier
     * @returns {Object} Consent status
     */
    checkUserConsent(userId) {
        const consent = this.userConsents.get(userId);
        
        if (!consent) {
            return {
                valid: false,
                reason: 'no_consent_found',
                action: 'must_accept_terms'
            };
        }
        
        // Check if terms version changed
        if (consent.termsVersion !== this.currentTermsVersion) {
            return {
                valid: false,
                reason: 'terms_updated',
                action: 'must_accept_new_terms',
                oldVersion: consent.termsVersion,
                newVersion: this.currentTermsVersion
            };
        }
        
        return {
            valid: true,
            consentDate: new Date(consent.timestamp).toISOString(),
            termsVersion: consent.termsVersion,
            privacyVersion: consent.privacyVersion
        };
    }

    /**
     * Get user consent record
     * @param {string} userId - User identifier
     * @returns {Object} Consent record
     */
    getUserConsent(userId) {
        return this.userConsents.get(userId) || null;
    }

    /**
     * Save consents to disk
     * @private
     */
    async _saveConsents() {
        try {
            const dir = path.dirname(this.termsDbPath);
            await fs.mkdir(dir, { recursive: true });
            
            const data = {
                consents: Array.from(this.userConsents.entries()).map(([userId, consent]) => ({
                    userId,
                    ...consent
                })),
                lastUpdated: Date.now()
            };
            
            await fs.writeFile(
                this.termsDbPath,
                JSON.stringify(data, null, 2),
                'utf8'
            );
            
        } catch (error) {
            console.error('Failed to save consents:', error);
        }
    }

    /**
     * Load user consents
     * @private
     */
    async loadUserConsents() {
        try {
            const data = await fs.readFile(this.termsDbPath, 'utf8');
            const parsed = JSON.parse(data);
            
            for (const consent of parsed.consents || []) {
                this.userConsents.set(consent.userId, consent);
            }
            
            console.log(`📊 Loaded consents for ${this.userConsents.size} users`);
            
        } catch (error) {
            // No historical data
        }
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LegalTermsManager;
}
