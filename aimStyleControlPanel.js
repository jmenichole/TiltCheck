const { Client, IntentsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const crypto = require('crypto');
const axios = require('axios');

/**
 * AIM-Style Control Panel for Verified Degens
 * Features:
 * - Discord verification linking
 * - Provably fair integrations
 * - Wallet security verification
 * - Instant messaging between verified users
 * - Anti-farming with alt detection
 * - Unicode/context fuzzing protection
 * - Fast tips and airdrops
 */
class AIMStyleControlPanel {
    constructor(collectClockIntegration, trapHouseBot) {
        this.collectClock = collectClockIntegration;
        this.trapHouse = trapHouseBot;
        
        // Verification system
        this.verificationSystem = {
            pendingVerifications: new Map(),
            verifiedUsers: new Map(),
            walletLinks: new Map(),
            deviceFingerprints: new Map(),
            behaviorProfiles: new Map(),
            tiltCheckProfiles: new Map(),
            justTheTipWallets: new Map()
        };
        
        // Instant messaging system
        this.messagingSystem = {
            activeChats: new Map(),
            messageHistory: new Map(),
            blockedUsers: new Map(),
            chatRooms: new Map()
        };
        
        // Anti-farming detection
        this.antiFarmingSystem = {
            suspiciousPatterns: new Map(),
            altAccountDetection: new Map(),
            unicodeFilters: new Set(),
            contextFuzzing: new Map()
        };
        
        // Tip/Airdrop system
        this.rewardsSystem = {
            pendingTips: new Map(),
            airdropQueue: new Map(),
            eligibilityScores: new Map(),
            reputationScores: new Map()
        };

        // Compliance & Regulatory system
        this.complianceSystem = {
            kycVerification: new Map(),
            amlScreening: new Map(),
            regulatoryReports: new Map(),
            provablyFairChains: new Map(),
            complianceFlags: new Map(),
            auditTrails: new Map()
        };
        
        this.initializeSystem();
    }

    async initializeSystem() {
        console.log('🎮 Initializing AIM-Style Control Panel...');
        
        // Initialize verification system
        await this.setupVerificationSystem();
        
        // Initialize anti-farming detection
        await this.setupAntiFarmingSystem();
        
        // Initialize messaging system
        await this.setupMessagingSystem();
        
        // Initialize rewards system
        await this.setupRewardsSystem();
        
        // Initialize compliance system
        await this.setupComplianceSystem();
        
        console.log('✅ AIM-Style Control Panel initialized successfully!');
    }

    // ===== VERIFICATION SYSTEM =====
    
    async setupVerificationSystem() {
        // Initialize provably fair verification chains
        this.verificationChains = {
            discord: new Map(),
            wallet: new Map(),
            casino: new Map(),
            device: new Map(),
            behavioral: new Map()
        };
        
        // Load Unicode normalization filters
        this.loadUnicodeFilters();
        
        console.log('🔐 Verification system initialized');
    }

    /**
     * Start comprehensive user verification process
     */
    async startVerification(userId, message) {
        if (this.verificationSystem.verifiedUsers.has(userId)) {
            return await this.showVerifiedStatus(message);
        }

        const verificationId = this.generateVerificationId();
        this.verificationSystem.pendingVerifications.set(userId, {
            id: verificationId,
            startedAt: new Date(),
            steps: {
                discord: false,
                tiltcheck: false,
                justthetip: false,
                device: false,
                behavioral: false
            },
            challenges: new Map(),
            proofs: new Map()
        });

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎮 AIM Control Panel - Verification Required')
            .setDescription('Welcome to the verified degen network! Complete verification to unlock features.')
            .addFields(
                {
                    name: '🔐 Verification Steps',
                    value: '1️⃣ **Discord ID Verification** - Provably fair Discord linking\n2️⃣ **TiltCheck Profile Link** - Gambling behavior verification\n3️⃣ **JustTheTip Wallet** - Financial verification & fast transactions\n4️⃣ **Device Fingerprinting** - Anti-alt detection\n5️⃣ **Behavioral Analysis** - Anti-farming protection',
                    inline: false
                },
                {
                    name: '🎯 What You Get',
                    value: '• **Instant Messaging** with verified degens\n• **Fast Tips & Airdrops** via JustTheTip wallet\n• **TiltCheck Integration** - Responsible gambling tools\n• **Exclusive Chat Rooms** - Verified only\n• **Advanced Casino APIs** - Real-time integration\n• **Anti-Scam Protection** - Verified transactions only',
                    inline: false
                },
                {
                    name: '🛡️ Security Features',
                    value: '• Unicode normalization protection\n• Context fuzzing detection\n• Alt account prevention\n• Behavioral pattern analysis\n• Provably fair verification chains',
                    inline: false
                }
            )
            .setFooter({ text: `Verification ID: ${verificationId} • AIM Control Panel` });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`verify_start_${userId}`)
                    .setLabel('🚀 Start Verification')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`verify_info_${userId}`)
                    .setLabel('ℹ️ Learn More')
                    .setStyle(ButtonStyle.Secondary)
            );

        await message.reply({ embeds: [embed], components: [row] });
    }

    /**
     * Generate cryptographically secure verification ID
     */
    generateVerificationId() {
        const timestamp = Date.now().toString(36);
        const random = crypto.randomBytes(16).toString('hex');
        return `${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Step 1: Discord ID Verification with provably fair linking
     */
    async verifyDiscordId(userId, interaction) {
        const verification = this.verificationSystem.pendingVerifications.get(userId);
        if (!verification) return;

        // Generate challenge for provably fair verification
        const challenge = crypto.randomBytes(32).toString('hex');
        const signature = this.generateProofSignature(userId, challenge);
        
        verification.challenges.set('discord', challenge);
        verification.proofs.set('discord', signature);

        // Create verification link with challenge
        const verificationUrl = `https://jmenichole.github.io/CollectClock/verify?` +
            `challenge=${challenge}&` +
            `signature=${signature}&` +
            `userId=${userId}&` +
            `timestamp=${Date.now()}`;

        const embed = new EmbedBuilder()
            .setColor('#5865f2')
            .setTitle('🔗 Discord Verification Challenge')
            .setDescription('Complete provably fair Discord verification')
            .addFields(
                {
                    name: '🎯 Step 1: Visit Verification Link',
                    value: `[**Click Here to Verify**](${verificationUrl})`,
                    inline: false
                },
                {
                    name: '🔐 Challenge Details',
                    value: `**Challenge:** \`${challenge.substring(0, 16)}...\`\n**Verification ID:** \`${verification.id}\``,
                    inline: false
                },
                {
                    name: '⚡ What Happens Next',
                    value: '• Visit the link to complete Discord OAuth\n• Challenge signature will be verified\n• Your Discord identity will be cryptographically linked\n• No personal data stored permanently',
                    inline: false
                }
            );

        await interaction.update({ embeds: [embed], components: [] });
        
        // Start timeout for verification
        setTimeout(() => this.checkVerificationTimeout(userId, 'discord'), 300000); // 5 minutes
    }

    /**
     * Step 2: TiltCheck Profile Verification
     */
    async verifyTiltCheckProfile(userId) {
        const verification = this.verificationSystem.pendingVerifications.get(userId);
        if (!verification || !verification.steps.discord) return;

        const user = await this.collectClock.client.users.fetch(userId);
        
        // Check if user already has TiltCheck profile
        const existingProfile = await this.getTiltCheckProfile(userId);
        
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('�️ TiltCheck Profile Verification')
            .setDescription('Link your TiltCheck profile for responsible gambling verification')
            .addFields(
                {
                    name: '🎯 TiltCheck Integration',
                    value: existingProfile ? 
                        '✅ **Existing Profile Found**\nYour TiltCheck profile will be verified and linked' :
                        '🆕 **Create New Profile**\nSet up TiltCheck protection during verification',
                    inline: false
                },
                {
                    name: '🔐 What Gets Verified',
                    value: '• Gambling behavior patterns\n• Tilt detection sensitivity\n• Loss limits and controls\n• Session tracking preferences\n• Accountability buddy links',
                    inline: false
                },
                {
                    name: '🛡️ Privacy Protection',
                    value: '• Only verification status shared\n• Gambling data stays private\n• User-controlled sharing settings\n• Revokable at any time',
                    inline: false
                }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`tilt_verify_${userId}`)
                    .setLabel(existingProfile ? '🔗 Link Profile' : '🆕 Create Profile')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`tilt_settings_${userId}`)
                    .setLabel('⚙️ TiltCheck Settings')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`tilt_skip_${userId}`)
                    .setLabel('⏭️ Skip (Optional)')
                    .setStyle(ButtonStyle.Secondary)
            );

        await user.send({ embeds: [embed], components: [row] });
    }

    /**
     * Step 3: JustTheTip Wallet Verification
     */
    async verifyJustTheTipWallet(userId) {
        const verification = this.verificationSystem.pendingVerifications.get(userId);
        if (!verification || !verification.steps.discord) return;

        const user = await this.collectClock.client.users.fetch(userId);
        
        // Check if user already has JustTheTip wallet
        const existingWallet = await this.getJustTheTipWallet(userId);
        
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('💰 JustTheTip Wallet Verification')
            .setDescription('Connect your JustTheTip wallet for fast tips and financial features')
            .addFields(
                {
                    name: '🏦 Wallet Integration',
                    value: existingWallet ? 
                        `✅ **Wallet Found**\nBalance: $${existingWallet.balance?.toFixed(2) || '0.00'}\nStatus: ${existingWallet.status || 'Active'}` :
                        '🆕 **Create New Wallet**\nSet up JustTheTip wallet for instant transactions',
                    inline: false
                },
                {
                    name: '⚡ Fast Transaction Features',
                    value: '• **Instant Tips** - Send tips to verified degens\n• **Lightning Airdrops** - Participate in verified airdrops\n• **Vault Integration** - Connect to investment vaults\n• **Cross-Platform** - Works with all TrapHouse systems',
                    inline: false
                },
                {
                    name: '🔐 Security Features',
                    value: '• Multi-signature protection\n• Transaction limits and controls\n• Real-time fraud detection\n• Backup and recovery options',
                    inline: false
                }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`wallet_connect_${userId}`)
                    .setLabel(existingWallet ? '🔗 Link Wallet' : '🆕 Create Wallet')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`wallet_settings_${userId}`)
                    .setLabel('⚙️ Wallet Settings')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`wallet_security_${userId}`)
                    .setLabel('🛡️ Security Setup')
                    .setStyle(ButtonStyle.Primary)
            );

        await user.send({ embeds: [embed], components: [row] });
    }

    /**
     * Step 4: Device Fingerprinting for Alt Detection
     */
    async performDeviceFingerprinting(userId, deviceData) {
        const fingerprint = this.generateDeviceFingerprint(deviceData);
        
        // Check for existing fingerprints (alt detection)
        const existingUser = this.findExistingFingerprint(fingerprint);
        if (existingUser && existingUser !== userId) {
            await this.handleSuspiciousAltAccount(userId, existingUser, fingerprint);
            return false;
        }

        this.verificationSystem.deviceFingerprints.set(userId, {
            fingerprint,
            deviceData,
            verifiedAt: new Date(),
            lastSeen: new Date()
        });

        return true;
    }

    /**
     * Step 5: Behavioral Analysis
     */
    async analyzeBehavioralPatterns(userId) {
        const patterns = await this.collectBehavioralData(userId);
        const suspicionScore = this.calculateSuspicionScore(patterns);
        
        if (suspicionScore > 0.7) {
            await this.flagSuspiciousBehavior(userId, patterns, suspicionScore);
            return false;
        }

        this.verificationSystem.behaviorProfiles.set(userId, {
            patterns,
            suspicionScore,
            verifiedAt: new Date(),
            lastAnalysis: new Date()
        });

        return true;
    }

    // ===== INSTANT MESSAGING SYSTEM =====

    async setupMessagingSystem() {
        // Initialize chat system for verified users only
        this.messagingCommands = new Map([
            ['msg', this.sendInstantMessage.bind(this)],
            ['chat', this.joinChatRoom.bind(this)],
            ['block', this.blockUser.bind(this)],
            ['online', this.showOnlineUsers.bind(this)],
            ['rooms', this.showChatRooms.bind(this)]
        ]);

        console.log('💬 Instant messaging system initialized');
    }

    /**
     * Send instant message to verified user
     */
    async sendInstantMessage(fromUserId, toUserId, message, interaction) {
        // Verify both users
        if (!this.isUserVerified(fromUserId) || !this.isUserVerified(toUserId)) {
            return await interaction.reply({ 
                content: '❌ Both users must be verified to use instant messaging.',
                ephemeral: true 
            });
        }

        // Check if users are blocked
        if (this.isUserBlocked(fromUserId, toUserId)) {
            return await interaction.reply({ 
                content: '❌ You are blocked by this user.',
                ephemeral: true 
            });
        }

        // Apply anti-spam and content filtering
        const filteredMessage = await this.filterMessage(message);
        if (!filteredMessage) {
            return await interaction.reply({ 
                content: '❌ Message blocked by content filter.',
                ephemeral: true 
            });
        }

        // Send message
        await this.deliverInstantMessage(fromUserId, toUserId, filteredMessage);
        
        await interaction.reply({ 
            content: '✅ Message sent!',
            ephemeral: true 
        });
    }

    /**
     * Create and manage chat rooms for verified users
     */
    async createChatRoom(creatorId, roomName, isPrivate = false) {
        if (!this.isUserVerified(creatorId)) return false;

        const roomId = crypto.randomUUID();
        this.messagingSystem.chatRooms.set(roomId, {
            id: roomId,
            name: roomName,
            creator: creatorId,
            members: new Set([creatorId]),
            isPrivate,
            createdAt: new Date(),
            messageHistory: [],
            settings: {
                maxMembers: isPrivate ? 10 : 50,
                allowTips: true,
                moderated: false
            }
        });

        return roomId;
    }

    // ===== ANTI-FARMING SYSTEM =====

    async setupAntiFarmingSystem() {
        // Load detection patterns
        this.farmingPatterns = {
            timePatterns: new Map(),
            actionPatterns: new Map(),
            networkPatterns: new Map(),
            devicePatterns: new Map()
        };

        // Initialize Unicode filters
        this.loadUnicodeFilters();

        console.log('🛡️ Anti-farming system initialized');
    }

    /**
     * Load Unicode normalization filters to prevent fuzzing
     */
    loadUnicodeFilters() {
        // Common Unicode attack patterns
        this.antiFarmingSystem.unicodeFilters = new Set([
            // Zero-width characters
            '\u200B', '\u200C', '\u200D', '\uFEFF',
            // Homoglyphs and lookalikes
            '\u0430', '\u043E', '\u0440', // Cyrillic a, o, p
            '\u0391', '\u039F', '\u03A1', // Greek A, O, P
            // Modifier characters
            '\u0301', '\u0302', '\u0303', '\u0304'
        ]);
    }

    /**
     * Normalize and filter text for anti-fuzzing
     */
    normalizeText(text) {
        let normalized = text.normalize('NFD');
        
        // Remove zero-width characters
        for (const char of this.antiFarmingSystem.unicodeFilters) {
            normalized = normalized.replace(new RegExp(char, 'g'), '');
        }
        
        // Convert lookalikes to standard characters
        normalized = normalized
            .replace(/[а-я]/g, match => this.cyrillicToLatin(match))
            .replace(/[Α-Ω]/g, match => this.greekToLatin(match));
            
        return normalized.normalize('NFC');
    }

    /**
     * Detect suspicious farming patterns
     */
    async detectFarmingPatterns(userId, action, context) {
        const patterns = this.antiFarmingSystem.suspiciousPatterns.get(userId) || {
            actions: [],
            timings: [],
            contexts: [],
            score: 0
        };

        patterns.actions.push({
            action,
            context,
            timestamp: new Date(),
            fingerprint: this.generateActionFingerprint(action, context)
        });

        // Analyze patterns
        const suspicion = this.analyzeFarmingPatterns(patterns);
        
        if (suspicion.score > 0.8) {
            await this.handleSuspectedFarmer(userId, suspicion);
        }

        this.antiFarmingSystem.suspiciousPatterns.set(userId, patterns);
    }

    // ===== REWARDS SYSTEM =====

    async setupRewardsSystem() {
        this.rewardTypes = {
            tip: { minAmount: 0.01, maxAmount: 100, fee: 0.02 },
            airdrop: { minRecipients: 5, maxRecipients: 1000, eligibilityThreshold: 0.7 },
            bonus: { verifiedOnly: true, antiSpam: true }
        };

        console.log('🎁 Rewards system initialized');
    }

    /**
     * Send fast tip to verified user via JustTheTip wallet
     */
    async sendFastTip(fromUserId, toUserId, amount, currency, message) {
        // Verify both users
        if (!this.isUserVerified(fromUserId) || !this.isUserVerified(toUserId)) {
            throw new Error('Both users must be verified for tips');
        }

        // Check farming suspicion
        if (this.isSuspectedFarmer(fromUserId) || this.isSuspectedFarmer(toUserId)) {
            throw new Error('Tip blocked - farming detection');
        }

        // Verify JustTheTip wallet connections
        const fromWallet = this.verificationSystem.justTheTipWallets.get(fromUserId);
        const toWallet = this.verificationSystem.justTheTipWallets.get(toUserId);

        if (!fromWallet || !toWallet) {
            throw new Error('Both users must have verified JustTheTip wallets');
        }

        // Check sender balance
        if (fromWallet.balance < amount) {
            throw new Error(`Insufficient balance. Available: $${fromWallet.balance.toFixed(2)}`);
        }

        // Generate tip ID and create transaction
        const tipId = crypto.randomUUID();
        const tip = {
            id: tipId,
            from: fromUserId,
            to: toUserId,
            amount,
            currency,
            message: this.normalizeText(message),
            timestamp: new Date(),
            status: 'pending',
            walletTxId: null,
            tiltCheckAlert: false
        };

        this.rewardsSystem.pendingTips.set(tipId, tip);

        // Check for tilt patterns before processing
        await this.checkTiltPatternsBeforeTip(fromUserId, amount, currency);

        // Process tip through JustTheTip wallet system
        await this.processJustTheTipTransaction(tip);
        
        return tipId;
    }

    /**
     * Create airdrop for verified users only
     */
    async createVerifiedAirdrop(creatorId, totalAmount, currency, eligibilityCriteria) {
        if (!this.isUserVerified(creatorId)) {
            throw new Error('Only verified users can create airdrops');
        }

        // Get eligible verified users
        const eligibleUsers = await this.getEligibleUsers(eligibilityCriteria);
        
        // Filter out farmers and suspicious accounts
        const verifiedEligible = eligibleUsers.filter(userId => 
            this.isUserVerified(userId) && 
            !this.isSuspectedFarmer(userId)
        );

        const airdropId = crypto.randomUUID();
        const airdrop = {
            id: airdropId,
            creator: creatorId,
            totalAmount,
            currency,
            recipients: verifiedEligible,
            amountPerUser: totalAmount / verifiedEligible.length,
            criteria: eligibilityCriteria,
            createdAt: new Date(),
            status: 'pending'
        };

        this.rewardsSystem.airdropQueue.set(airdropId, airdrop);
        
        return airdropId;
    }

    // ===== CONTROL PANEL INTERFACE =====

    /**
     * Show AIM-style control panel interface
     */
    async showControlPanel(userId, interaction) {
        const isVerified = this.isUserVerified(userId);
        const verificationData = this.verificationSystem.verifiedUsers.get(userId);
        
        const embed = new EmbedBuilder()
            .setColor(isVerified ? '#00ff88' : '#ffa500')
            .setTitle('🎮 AIM Control Panel - Degen Network')
            .setDescription(isVerified ? 
                '**VERIFIED DEGEN** - Full access to all features' : 
                '**UNVERIFIED** - Complete verification to unlock features'
            );

        if (isVerified) {
            const onlineCount = this.getOnlineVerifiedCount();
            const messageCount = this.getUserMessageCount(userId);
            const tipsSent = this.getUserTipCount(userId);
            const tiltProfile = this.verificationSystem.tiltCheckProfiles.get(userId);
            const wallet = this.verificationSystem.justTheTipWallets.get(userId);

            embed.addFields(
                {
                    name: '👥 Network Status',
                    value: `**Online Degens:** ${onlineCount}\n**Your Messages:** ${messageCount}\n**Tips Sent:** ${tipsSent}`,
                    inline: true
                },
                {
                    name: '🔐 Verification Level',
                    value: `**Score:** ${verificationData.verificationScore}/100\n**Joined:** ${verificationData.verifiedAt.toLocaleDateString()}\n**Trust Level:** ${this.getTrustLevel(verificationData.verificationScore)}`,
                    inline: true
                },
                {
                    name: '�️ TiltCheck Status',
                    value: tiltProfile ? 
                        `**Status:** ${tiltProfile.status}\n**Tilt Risk:** ${tiltProfile.currentRisk || 'Low'}\n**Sessions:** ${tiltProfile.totalSessions || 0}` :
                        '❌ Not Connected',
                    inline: true
                },
                {
                    name: '💰 JustTheTip Wallet',
                    value: wallet ? 
                        `**Balance:** $${wallet.balance.toFixed(2)}\n**Status:** ${wallet.status}\n**Transactions:** ${wallet.txCount || 0}` :
                        '❌ Not Connected',
                    inline: true
                },
                {
                    name: '�💬 Quick Actions',
                    value: '• Use `/msg @user message` to instant message\n• Use `/tip @user amount` for fast tips via JustTheTip\n• Use `/rooms` to see active chat rooms\n• Use `/tilt` for responsible gambling tools',
                    inline: false
                }
            );

            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`panel_msg_${userId}`)
                        .setLabel('💬 Messages')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`panel_tips_${userId}`)
                        .setLabel('💰 Tips')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`panel_rooms_${userId}`)
                        .setLabel('🏠 Rooms')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`panel_settings_${userId}`)
                        .setLabel('⚙️ Settings')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });
        } else {
            embed.addFields(
                {
                    name: '🚀 Get Verified',
                    value: 'Complete verification to access:\n• Instant messaging with verified degens\n• Fast tips via JustTheTip wallet\n• TiltCheck responsible gambling tools\n• Exclusive chat rooms\n• Anti-scam protection\n• Advanced casino integrations',
                    inline: false
                }
            );

            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`verify_start_${userId}`)
                        .setLabel('🔐 Start Verification')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });
        }
    }

    // ===== UTILITY METHODS =====

    isUserVerified(userId) {
        return this.verificationSystem.verifiedUsers.has(userId);
    }

    isSuspectedFarmer(userId) {
        const patterns = this.antiFarmingSystem.suspiciousPatterns.get(userId);
        return patterns && patterns.score > 0.7;
    }

    generateProofSignature(userId, challenge) {
        const data = `${userId}:${challenge}:${Date.now()}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    // ===== TILTCHECK INTEGRATION =====

    /**
     * Get or create TiltCheck profile for user
     */
    async getTiltCheckProfile(userId) {
        // Check if TiltCheck profile already exists in TrapHouse bot
        if (this.trapHouse?.tiltCheckVerification) {
            return await this.trapHouse.tiltCheckVerification.getUserProfile(userId);
        }
        return null;
    }

    /**
     * Link TiltCheck profile to verification system
     */
    async linkTiltCheckProfile(userId, profileData) {
        const verification = this.verificationSystem.pendingVerifications.get(userId);
        if (!verification) return false;

        // Create or update TiltCheck profile link
        this.verificationSystem.tiltCheckProfiles.set(userId, {
            profileId: profileData.id,
            status: profileData.status || 'active',
            currentRisk: profileData.currentRisk || 'low',
            totalSessions: profileData.totalSessions || 0,
            linkedAt: new Date(),
            lastSync: new Date(),
            settings: {
                alertThreshold: profileData.alertThreshold || 0.7,
                sessionLimit: profileData.sessionLimit || 120,
                lossLimit: profileData.lossLimit || 100,
                cooldownPeriod: profileData.cooldownPeriod || 30
            }
        });

        // Mark TiltCheck verification as complete
        verification.steps.tiltcheck = true;
        verification.proofs.set('tiltcheck', this.generateProofSignature(userId, 'tiltcheck'));

        return true;
    }

    /**
     * Check tilt patterns before processing tip
     */
    async checkTiltPatternsBeforeTip(userId, amount, currency) {
        const tiltProfile = this.verificationSystem.tiltCheckProfiles.get(userId);
        if (!tiltProfile) return;

        // Check if user is currently in tilt state
        if (tiltProfile.currentRisk === 'high') {
            throw new Error('Transaction blocked - TiltCheck high risk detected');
        }

        // Check if tip amount exceeds tilt limits
        if (amount > tiltProfile.settings.lossLimit) {
            await this.sendTiltAlert(userId, 'large_tip', { amount, currency });
            throw new Error(`Tip amount exceeds TiltCheck limit ($${tiltProfile.settings.lossLimit})`);
        }

        // Log transaction for tilt analysis
        await this.logTiltTransaction(userId, 'tip_sent', { amount, currency });
    }

    /**
     * Send tilt alert to user
     */
    async sendTiltAlert(userId, alertType, data) {
        const user = await this.collectClock.client.users.fetch(userId);
        const tiltProfile = this.verificationSystem.tiltCheckProfiles.get(userId);

        const embed = new EmbedBuilder()
            .setColor('#ff4444')
            .setTitle('🛡️ TiltCheck Alert')
            .setDescription('Responsible gambling protection activated')
            .addFields(
                {
                    name: '⚠️ Alert Type',
                    value: this.getTiltAlertMessage(alertType),
                    inline: false
                },
                {
                    name: '📊 Your Data',
                    value: `**Risk Level:** ${tiltProfile.currentRisk}\n**Session Time:** ${data.sessionTime || 'N/A'}\n**Amount:** $${data.amount || 0}`,
                    inline: true
                },
                {
                    name: '🛠️ Recommended Actions',
                    value: '• Take a break from gambling\n• Review your limits\n• Contact accountability buddy\n• Use cooling-off period',
                    inline: true
                }
            );

        await user.send({ embeds: [embed] });
    }

    // ===== JUSTTHETIP WALLET INTEGRATION =====

    /**
     * Get or create JustTheTip wallet for user
     */
    async getJustTheTipWallet(userId) {
        // Check if wallet already exists
        const existingWallet = this.verificationSystem.justTheTipWallets.get(userId);
        if (existingWallet) return existingWallet;

        // Create new wallet (mock implementation)
        return null;
    }

    /**
     * Link JustTheTip wallet to verification system
     */
    async linkJustTheTipWallet(userId, walletData) {
        const verification = this.verificationSystem.pendingVerifications.get(userId);
        if (!verification) return false;

        // Create or update JustTheTip wallet link
        this.verificationSystem.justTheTipWallets.set(userId, {
            walletId: walletData.id || crypto.randomUUID(),
            address: walletData.address,
            balance: walletData.balance || 0,
            status: walletData.status || 'active',
            linkedAt: new Date(),
            lastSync: new Date(),
            txCount: 0,
            settings: {
                tipLimit: walletData.tipLimit || 50,
                dailyLimit: walletData.dailyLimit || 200,
                autoBackup: walletData.autoBackup || true,
                twoFactorEnabled: walletData.twoFactorEnabled || false
            },
            security: {
                multisig: walletData.multisig || false,
                backupSeed: walletData.backupSeed || null,
                recoveryEmail: walletData.recoveryEmail || null
            }
        });

        // Mark JustTheTip verification as complete
        verification.steps.justthetip = true;
        verification.proofs.set('justthetip', this.generateProofSignature(userId, 'justthetip'));

        return true;
    }

    /**
     * Process tip transaction through JustTheTip wallet
     */
    async processJustTheTipTransaction(tip) {
        const fromWallet = this.verificationSystem.justTheTipWallets.get(tip.from);
        const toWallet = this.verificationSystem.justTheTipWallets.get(tip.to);

        try {
            // Deduct from sender
            fromWallet.balance -= tip.amount;
            fromWallet.txCount++;

            // Add to recipient
            toWallet.balance += tip.amount;
            toWallet.txCount++;

            // Update tip status
            tip.status = 'completed';
            tip.walletTxId = crypto.randomUUID();
            tip.completedAt = new Date();

            // Log transaction
            await this.logWalletTransaction(tip);

            // Send notifications
            await this.sendTipNotifications(tip);

            return tip;

        } catch (error) {
            tip.status = 'failed';
            tip.error = error.message;
            throw error;
        }
    }

    /**
     * Log wallet transaction for audit trail
     */
    async logWalletTransaction(tip) {
        // Implementation would log to database/file for audit
        console.log(`💰 JustTheTip Transaction: ${tip.from} -> ${tip.to} ($${tip.amount})`);
    }

    /**
     * Send tip completion notifications
     */
    async sendTipNotifications(tip) {
        const fromUser = await this.collectClock.client.users.fetch(tip.from);
        const toUser = await this.collectClock.client.users.fetch(tip.to);

        // Sender notification
        const senderEmbed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('💸 Tip Sent Successfully!')
            .setDescription(`Your tip was processed via JustTheTip wallet`)
            .addFields(
                {
                    name: '💰 Transaction Details',
                    value: `**Amount:** $${tip.amount}\n**Recipient:** ${toUser.username}\n**Message:** ${tip.message || 'No message'}\n**TX ID:** \`${tip.walletTxId}\``,
                    inline: false
                }
            );

        await fromUser.send({ embeds: [senderEmbed] });

        // Recipient notification
        const recipientEmbed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('💰 Tip Received!')
            .setDescription(`You received a tip from a verified degen!`)
            .addFields(
                {
                    name: '🎁 Tip Details',
                    value: `**Amount:** $${tip.amount}\n**From:** ${fromUser.username}\n**Message:** ${tip.message || 'No message'}\n**TX ID:** \`${tip.walletTxId}\``,
                    inline: false
                }
            );

        await toUser.send({ embeds: [recipientEmbed] });
    }

    /**
     * Get tilt alert message based on type
     */
    getTiltAlertMessage(alertType) {
        const messages = {
            'large_tip': 'Large tip amount detected - consider your spending',
            'high_frequency': 'Frequent transactions detected - take a break',
            'session_limit': 'Session time limit exceeded',
            'loss_limit': 'Daily loss limit approached'
        };
        return messages[alertType] || 'Responsible gambling reminder';
    }

    /**
     * Log transaction for tilt analysis
     */
    async logTiltTransaction(userId, type, data) {
        // Implementation would log to TiltCheck system
        console.log(`🛡️ TiltCheck Log: ${userId} - ${type} - $${data.amount || 0}`);
    }
}

module.exports = AIMStyleControlPanel;
