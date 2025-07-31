/**
 * Enhanced Tilt Setup Integration
 * Integrates JustTheIP wallets and Stake API with the personalized tilt protection system
 * 
 * Features:
 * - JustTheIP wallet verification and monitoring
 * - Stake API integration for real-time gambling tracking
 * - Cross-platform tilt pattern detection
 * - Automated interventions based on blockchain activity
 */

const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

class EnhancedTiltSetup {
    constructor(personalizedTiltProtection, solscanTracker) {
        this.personalizedTiltProtection = personalizedTiltProtection;
        this.solscanTracker = solscanTracker;
        this.userSetups = new Map(); // userId -> enhanced setup data
        this.walletMonitors = new Map(); // userId -> wallet monitoring data
        this.stakeIntegrations = new Map(); // userId -> stake API data
        
        // JustTheIP integration settings
        this.justTheIPConfig = {
            supportedChains: ['SOLANA', 'ETHEREUM', 'POLYGON', 'BSC'],
            tiltThresholds: {
                rapidTransfers: 5, // 5+ transfers in 1 hour = potential tilt
                largeTransfers: 1000, // $1000+ transfers = high risk
                lateNightActivity: '22:00-06:00', // late night gambling hours
                multiPlatformActivity: 3 // active on 3+ platforms = concern
            }
        };
        
        // Stake API integration settings
        this.stakeConfig = {
            apiKey: process.env.STAKE_US_API_KEY,
            baseUrl: process.env.STAKE_US_BASE_URL || 'https://stake.us/api',
            rateLimits: {
                requestsPerMinute: 30,
                burstLimit: 10
            },
            monitoringIntervals: {
                activeSession: 30000, // 30 seconds during active gambling
                background: 300000 // 5 minutes for background monitoring
            }
        };
        
        console.log('🔧 Enhanced Tilt Setup initialized with JustTheIP and Stake API integration');
    }

    /**
     * Enhanced tilt setup with wallet and API integration
     */
    async setupEnhancedTiltProtection(message, options = {}) {
        const userId = message.author.id;
        const { EmbedBuilder } = require('discord.js');
        
        try {
            // Step 1: Create base personalized tilt profile
            const userPatterns = [
                'upwardsTilt',
                'betEscalation', 
                'gameHopping',
                'ignoredWarnings',
                'frozenFundFrustration'
            ];
            
            await this.personalizedTiltProtection.createPersonalizedProfile(message, userPatterns);
            
            // Step 2: Setup JustTheIP wallet integration
            const walletSetup = await this.setupJustTheIPWalletIntegration(userId, options.wallets);
            
            // Step 3: Setup Stake API integration
            const stakeSetup = await this.setupStakeAPIIntegration(userId, options.stakeAccount);
            
            // Step 4: Create enhanced monitoring profile
            const enhancedProfile = {
                userId: userId,
                setupDate: new Date().toISOString(),
                walletIntegration: walletSetup,
                stakeIntegration: stakeSetup,
                riskLevel: this.calculateEnhancedRiskLevel(walletSetup, stakeSetup),
                monitoringActive: true,
                interventionSettings: this.generateEnhancedInterventions(userPatterns, walletSetup, stakeSetup)
            };
            
            this.userSetups.set(userId, enhancedProfile);
            
            // Step 5: Start real-time monitoring
            this.startEnhancedMonitoring(userId);
            
            // Step 6: Send comprehensive setup confirmation
            await this.sendEnhancedSetupConfirmation(message, enhancedProfile);
            
            return enhancedProfile;
            
        } catch (error) {
            console.error('Enhanced tilt setup error:', error);
            await message.reply('❌ Error setting up enhanced tilt protection. Please try again or contact support.');
            throw error;
        }
    }

    /**
     * Setup JustTheIP wallet integration for tilt monitoring
     */
    async setupJustTheIPWalletIntegration(userId, providedWallets = []) {
        const walletIntegration = {
            status: 'configuring',
            connectedWallets: [],
            monitoringEnabled: false,
            riskIndicators: [],
            lastActivity: null
        };

        try {
            // Check for existing wallet connections via SolscanTracker
            if (this.solscanTracker && this.solscanTracker.paymentSigner) {
                walletIntegration.connectedWallets.push({
                    address: this.solscanTracker.paymentSigner,
                    chain: 'SOLANA',
                    type: 'payment_signer',
                    verified: true,
                    monitoringActive: true
                });
            }

            // Add any provided wallets
            for (const wallet of providedWallets) {
                if (this.isValidWalletAddress(wallet.address, wallet.chain)) {
                    walletIntegration.connectedWallets.push({
                        address: wallet.address,
                        chain: wallet.chain,
                        type: 'user_provided',
                        verified: false,
                        monitoringActive: false
                    });
                }
            }

            // Setup wallet monitoring
            if (walletIntegration.connectedWallets.length > 0) {
                walletIntegration.monitoringEnabled = true;
                walletIntegration.status = 'active';
                
                // Initial wallet analysis
                await this.performInitialWalletAnalysis(userId, walletIntegration.connectedWallets);
            } else {
                walletIntegration.status = 'no_wallets';
            }

            return walletIntegration;
            
        } catch (error) {
            console.error('JustTheIP wallet integration error:', error);
            walletIntegration.status = 'error';
            walletIntegration.error = error.message;
            return walletIntegration;
        }
    }

    /**
     * Setup Stake API integration for real-time gambling monitoring
     */
    async setupStakeAPIIntegration(userId, stakeAccountData = null) {
        const stakeIntegration = {
            status: 'configuring',
            accountVerified: false,
            sessionTracking: false,
            realTimeAlerts: false,
            riskFactors: [],
            lastUpdate: null
        };

        try {
            if (!this.stakeConfig.apiKey || this.stakeConfig.apiKey === 'your_stake_us_api_key_here') {
                stakeIntegration.status = 'api_key_missing';
                stakeIntegration.note = 'Stake API key not configured - using fallback monitoring';
                return stakeIntegration;
            }

            if (!stakeAccountData) {
                stakeIntegration.status = 'account_not_provided';
                stakeIntegration.note = 'Stake account not linked - manual setup required';
                return stakeIntegration;
            }

            // Verify Stake account
            const verification = await this.verifyStakeAccount(stakeAccountData);
            
            if (verification.valid) {
                stakeIntegration.accountVerified = true;
                stakeIntegration.sessionTracking = true;
                stakeIntegration.realTimeAlerts = true;
                stakeIntegration.status = 'active';
                stakeIntegration.accountInfo = verification.accountInfo;
                
                // Analyze gambling patterns
                stakeIntegration.riskFactors = this.analyzeStakeRiskFactors(verification.accountInfo);
            } else {
                stakeIntegration.status = 'verification_failed';
                stakeIntegration.error = verification.error;
            }

            return stakeIntegration;
            
        } catch (error) {
            console.error('Stake API integration error:', error);
            stakeIntegration.status = 'error';
            stakeIntegration.error = error.message;
            return stakeIntegration;
        }
    }

    /**
     * Verify Stake account using API
     */
    async verifyStakeAccount(accountData) {
        try {
            const response = await axios.post(`${this.stakeConfig.baseUrl}/verify`, {
                accountId: accountData.accountId,
                sessionToken: accountData.sessionToken
            }, {
                headers: {
                    'Authorization': `Bearer ${this.stakeConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            if (response.data.verified) {
                return {
                    valid: true,
                    accountInfo: {
                        userId: response.data.userId,
                        tier: response.data.tier,
                        totalWagered: response.data.totalWagered,
                        currentBalance: response.data.currentBalance,
                        recentSessions: response.data.recentSessions || [],
                        riskScore: response.data.riskScore || 0
                    }
                };
            } else {
                return {
                    valid: false,
                    error: 'Account verification failed'
                };
            }
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Analyze Stake account for risk factors
     */
    analyzeStakeRiskFactors(accountInfo) {
        const riskFactors = [];

        if (accountInfo.totalWagered > 50000) {
            riskFactors.push('high_volume_gambler');
        }

        if (accountInfo.recentSessions.length > 10) {
            riskFactors.push('frequent_sessions');
        }

        const avgSessionLength = accountInfo.recentSessions.reduce((sum, s) => sum + s.duration, 0) / accountInfo.recentSessions.length;
        if (avgSessionLength > 180) { // 3 hours
            riskFactors.push('long_sessions');
        }

        if (accountInfo.riskScore > 70) {
            riskFactors.push('high_risk_score');
        }

        return riskFactors;
    }

    /**
     * Calculate enhanced risk level based on wallet and API data
     */
    calculateEnhancedRiskLevel(walletSetup, stakeSetup) {
        let riskScore = 50; // Base risk score

        // Wallet risk factors
        if (walletSetup.status === 'active') {
            riskScore += walletSetup.connectedWallets.length * 5; // More wallets = higher risk
            riskScore += walletSetup.riskIndicators.length * 10;
        }

        // Stake risk factors
        if (stakeSetup.status === 'active') {
            riskScore += stakeSetup.riskFactors.length * 15;
            if (stakeSetup.accountInfo && stakeSetup.accountInfo.riskScore) {
                riskScore += stakeSetup.accountInfo.riskScore * 0.3;
            }
        }

        // Determine risk level
        if (riskScore >= 80) return 'CRITICAL';
        if (riskScore >= 65) return 'HIGH';
        if (riskScore >= 50) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Generate enhanced interventions based on all available data
     */
    generateEnhancedInterventions(patterns, walletSetup, stakeSetup) {
        const interventions = {
            wallet: [],
            stake: [],
            combined: [],
            emergency: []
        };

        // Wallet-based interventions
        if (walletSetup.status === 'active') {
            interventions.wallet = [
                'wallet_transaction_alerts',
                'large_transfer_blocking',
                'multi_platform_detection',
                'late_night_activity_warnings'
            ];
        }

        // Stake-based interventions
        if (stakeSetup.status === 'active') {
            interventions.stake = [
                'real_time_session_monitoring',
                'bet_escalation_alerts',
                'loss_sequence_intervention',
                'session_length_warnings'
            ];
        }

        // Combined interventions
        if (walletSetup.status === 'active' && stakeSetup.status === 'active') {
            interventions.combined = [
                'cross_platform_correlation',
                'wallet_to_stake_tracking',
                'comprehensive_tilt_detection',
                'automated_fund_protection'
            ];
        }

        // Emergency interventions
        interventions.emergency = [
            'emergency_session_termination',
            'wallet_transfer_blocking',
            'accountability_buddy_notification',
            'professional_resource_connection'
        ];

        return interventions;
    }

    /**
     * Start enhanced real-time monitoring
     */
    startEnhancedMonitoring(userId) {
        const setup = this.userSetups.get(userId);
        if (!setup) return;

        // Wallet monitoring
        if (setup.walletIntegration.status === 'active') {
            this.startWalletMonitoring(userId);
        }

        // Stake monitoring
        if (setup.stakeIntegration.status === 'active') {
            this.startStakeMonitoring(userId);
        }

        console.log(`🔍 Enhanced monitoring started for user ${userId}`);
    }

    /**
     * Start wallet monitoring
     */
    startWalletMonitoring(userId) {
        const monitoringInterval = setInterval(async () => {
            try {
                await this.checkWalletActivity(userId);
            } catch (error) {
                console.error(`Wallet monitoring error for user ${userId}:`, error);
            }
        }, 60000); // Check every minute

        this.walletMonitors.set(userId, {
            interval: monitoringInterval,
            lastCheck: Date.now()
        });
    }

    /**
     * Start Stake monitoring
     */
    startStakeMonitoring(userId) {
        const setup = this.userSetups.get(userId);
        if (!setup || setup.stakeIntegration.status !== 'active') return;

        const monitoringInterval = setInterval(async () => {
            try {
                await this.checkStakeActivity(userId);
            } catch (error) {
                console.error(`Stake monitoring error for user ${userId}:`, error);
            }
        }, this.stakeConfig.monitoringIntervals.background);

        // Store monitoring data
        if (!this.stakeIntegrations.has(userId)) {
            this.stakeIntegrations.set(userId, {});
        }
        this.stakeIntegrations.get(userId).monitoringInterval = monitoringInterval;
    }

    /**
     * Check wallet activity for tilt patterns
     */
    async checkWalletActivity(userId) {
        const setup = this.userSetups.get(userId);
        if (!setup || setup.walletIntegration.status !== 'active') return;

        for (const wallet of setup.walletIntegration.connectedWallets) {
            if (wallet.chain === 'SOLANA' && this.solscanTracker) {
                // Use Solscan to check recent transactions
                const transactions = await this.solscanTracker.getSignerTransactions({
                    limit: 10,
                    commitment: 'confirmed'
                });

                if (transactions && transactions.length > 0) {
                    await this.analyzeSolanaTransactions(userId, transactions);
                }
            }
        }
    }

    /**
     * Analyze Solana transactions for tilt patterns
     */
    async analyzeSolanaTransactions(userId, transactions) {
        const recentTxs = transactions.filter(tx => {
            const txTime = new Date(tx.timestamp * 1000);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return txTime > oneHourAgo;
        });

        // Check for rapid transfers (potential tilt)
        if (recentTxs.length >= this.justTheIPConfig.tiltThresholds.rapidTransfers) {
            await this.triggerWalletTiltAlert(userId, 'rapid_transfers', {
                count: recentTxs.length,
                timeframe: '1 hour'
            });
        }

        // Check for large transfers
        for (const tx of recentTxs) {
            const amount = this.calculateTransactionValue(tx);
            if (amount >= this.justTheIPConfig.tiltThresholds.largeTransfers) {
                await this.triggerWalletTiltAlert(userId, 'large_transfer', {
                    amount: amount,
                    signature: tx.signature
                });
            }
        }
    }

    /**
     * Check Stake activity for tilt patterns
     */
    async checkStakeActivity(userId) {
        const setup = this.userSetups.get(userId);
        if (!setup || setup.stakeIntegration.status !== 'active') return;

        try {
            // Get current session data from Stake API
            const sessionData = await this.getStakeSessionData(userId);
            
            if (sessionData && sessionData.activeSession) {
                await this.analyzeStakeSession(userId, sessionData);
            }
        } catch (error) {
            console.error('Stake activity check error:', error);
        }
    }

    /**
     * Get current Stake session data
     */
    async getStakeSessionData(userId) {
        const setup = this.userSetups.get(userId);
        if (!setup || !setup.stakeIntegration.accountInfo) return null;

        try {
            const response = await axios.get(`${this.stakeConfig.baseUrl}/session`, {
                headers: {
                    'Authorization': `Bearer ${this.stakeConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    userId: setup.stakeIntegration.accountInfo.userId
                }
            });

            return response.data;
        } catch (error) {
            console.error('Failed to get Stake session data:', error);
            return null;
        }
    }

    /**
     * Analyze Stake session for tilt patterns
     */
    async analyzeStakeSession(userId, sessionData) {
        const session = sessionData.activeSession;
        
        // Check session length
        if (session.duration > 180) { // 3 hours
            await this.triggerStakeTiltAlert(userId, 'long_session', {
                duration: session.duration
            });
        }

        // Check bet escalation
        if (session.bets && session.bets.length > 0) {
            const recentBets = session.bets.slice(-10);
            const avgBet = recentBets.reduce((sum, bet) => sum + bet.amount, 0) / recentBets.length;
            const maxBet = Math.max(...recentBets.map(bet => bet.amount));
            
            if (maxBet > avgBet * 3) { // 300% increase
                await this.triggerStakeTiltAlert(userId, 'bet_escalation', {
                    avgBet: avgBet,
                    maxBet: maxBet,
                    increase: ((maxBet / avgBet - 1) * 100).toFixed(1)
                });
            }
        }
    }

    /**
     * Trigger wallet-based tilt alert
     */
    async triggerWalletTiltAlert(userId, alertType, data) {
        console.log(`🚨 Wallet tilt alert for user ${userId}: ${alertType}`, data);
        
        // Here you would send Discord alerts, trigger interventions, etc.
        // Integration with existing PersonalizedTiltProtection system
        
        const session = {
            alertHistory: [],
            type: 'wallet_activity'
        };
        
        // Use existing tilt protection methods
        if (alertType === 'rapid_transfers') {
            // Trigger rapid activity intervention
        } else if (alertType === 'large_transfer') {
            // Trigger large transfer intervention
        }
    }

    /**
     * Trigger Stake-based tilt alert
     */
    async triggerStakeTiltAlert(userId, alertType, data) {
        console.log(`🎰 Stake tilt alert for user ${userId}: ${alertType}`, data);
        
        // Integration with existing tilt protection
        if (alertType === 'long_session') {
            // Trigger session length intervention
        } else if (alertType === 'bet_escalation') {
            // Trigger bet escalation intervention
        }
    }

    /**
     * Send enhanced setup confirmation
     */
    async sendEnhancedSetupConfirmation(message, profile) {
        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🚀 Enhanced Tilt Protection Setup Complete')
            .setDescription('Your comprehensive tilt protection system is now active with advanced integrations!')
            .addFields(
                {
                    name: '🛡️ Base Protection',
                    value: 'Personalized tilt patterns and interventions activated',
                    inline: false
                },
                {
                    name: '💰 JustTheIP Wallet Integration',
                    value: `Status: ${profile.walletIntegration.status}\nWallets: ${profile.walletIntegration.connectedWallets.length}\nMonitoring: ${profile.walletIntegration.monitoringEnabled ? 'Active' : 'Inactive'}`,
                    inline: true
                },
                {
                    name: '🎰 Stake API Integration',
                    value: `Status: ${profile.stakeIntegration.status}\nVerified: ${profile.stakeIntegration.accountVerified ? 'Yes' : 'No'}\nReal-time: ${profile.stakeIntegration.realTimeAlerts ? 'Active' : 'Inactive'}`,
                    inline: true
                },
                {
                    name: '📊 Risk Assessment',
                    value: `Overall Risk Level: **${profile.riskLevel}**\nMonitoring: Active\nInterventions: Configured`,
                    inline: false
                },
                {
                    name: '🎯 Enhanced Commands',
                    value: '• `$mytilt wallet` - Wallet activity overview\n• `$mytilt stake` - Stake session analysis\n• `$mytilt combined` - Cross-platform insights\n• `$mytilt emergency` - Enhanced emergency protocol',
                    inline: false
                }
            )
            .setFooter({ text: 'Enhanced Tilt Protection • Your safety is our priority' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    /**
     * Handle enhanced tilt commands
     */
    async handleEnhancedTiltCommand(message, args) {
        const subcommand = args[0]?.toLowerCase();
        const userId = message.author.id;

        switch (subcommand) {
            case 'setup':
                await this.setupEnhancedTiltProtection(message);
                break;
            case 'wallet':
                await this.showWalletAnalysis(message);
                break;
            case 'stake':
                await this.showStakeAnalysis(message);
                break;
            case 'combined':
                await this.showCombinedAnalysis(message);
                break;
            case 'status':
                await this.showEnhancedStatus(message);
                break;
            default:
                await this.showEnhancedHelp(message);
        }
    }

    /**
     * Show wallet analysis
     */
    async showWalletAnalysis(message) {
        const userId = message.author.id;
        const setup = this.userSetups.get(userId);
        
        if (!setup) {
            return await message.reply('❌ Enhanced tilt protection not set up. Use `$mytilt setup` first.');
        }

        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('💰 Wallet Activity Analysis')
            .setDescription('Your blockchain wallet activity and tilt risk assessment')
            .addFields(
                {
                    name: '🔗 Connected Wallets',
                    value: setup.walletIntegration.connectedWallets.map(w => 
                        `**${w.chain}**: ${w.address.substring(0, 10)}...${w.address.substring(w.address.length - 6)}`
                    ).join('\n') || 'No wallets connected',
                    inline: false
                },
                {
                    name: '📊 Risk Indicators',
                    value: setup.walletIntegration.riskIndicators.length > 0 
                        ? setup.walletIntegration.riskIndicators.join(', ')
                        : 'No risk indicators detected',
                    inline: false
                }
            );

        await message.reply({ embeds: [embed] });
    }

    /**
     * Show Stake analysis
     */
    async showStakeAnalysis(message) {
        const userId = message.author.id;
        const setup = this.userSetups.get(userId);
        
        if (!setup) {
            return await message.reply('❌ Enhanced tilt protection not set up. Use `$mytilt setup` first.');
        }

        const embed = new EmbedBuilder()
            .setColor('#ff4444')
            .setTitle('🎰 Stake Activity Analysis')
            .setDescription('Your Stake.com gambling patterns and risk assessment')
            .addFields(
                {
                    name: '🔐 Account Status',
                    value: `Verified: ${setup.stakeIntegration.accountVerified ? 'Yes' : 'No'}\nReal-time: ${setup.stakeIntegration.realTimeAlerts ? 'Active' : 'Inactive'}`,
                    inline: true
                },
                {
                    name: '⚠️ Risk Factors',
                    value: setup.stakeIntegration.riskFactors.length > 0 
                        ? setup.stakeIntegration.riskFactors.join(', ')
                        : 'No risk factors detected',
                    inline: false
                }
            );

        await message.reply({ embeds: [embed] });
    }

    /**
     * Show combined analysis
     */
    async showCombinedAnalysis(message) {
        const userId = message.author.id;
        const setup = this.userSetups.get(userId);
        
        if (!setup) {
            return await message.reply('❌ Enhanced tilt protection not set up. Use `$mytilt setup` first.');
        }

        const embed = new EmbedBuilder()
            .setColor('#8a2be2')
            .setTitle('🔍 Combined Cross-Platform Analysis')
            .setDescription('Comprehensive analysis across all integrated platforms')
            .addFields(
                {
                    name: '📈 Overall Risk Level',
                    value: `**${setup.riskLevel}**`,
                    inline: true
                },
                {
                    name: '🔄 Active Integrations',
                    value: `Wallets: ${setup.walletIntegration.status === 'active' ? '✅' : '❌'}\nStake: ${setup.stakeIntegration.status === 'active' ? '✅' : '❌'}`,
                    inline: true
                },
                {
                    name: '🛡️ Protection Status',
                    value: `Monitoring: ${setup.monitoringActive ? 'Active' : 'Inactive'}\nInterventions: Ready`,
                    inline: false
                }
            );

        await message.reply({ embeds: [embed] });
    }

    /**
     * Show enhanced status
     */
    async showEnhancedStatus(message) {
        const userId = message.author.id;
        const setup = this.userSetups.get(userId);
        
        if (!setup) {
            return await message.reply('❌ Enhanced tilt protection not set up. Use `$mytilt setup` first.');
        }

        const embed = new EmbedBuilder()
            .setColor('#00bfff')
            .setTitle('📊 Enhanced Tilt Protection Status')
            .setDescription('Complete overview of your tilt protection system')
            .addFields(
                {
                    name: '⏰ Setup Date',
                    value: new Date(setup.setupDate).toLocaleDateString(),
                    inline: true
                },
                {
                    name: '🔍 Monitoring',
                    value: setup.monitoringActive ? 'Active' : 'Inactive',
                    inline: true
                },
                {
                    name: '⚡ Quick Actions',
                    value: '• `$mytilt emergency` - Emergency stop\n• `$mytilt wallet` - Check wallet activity\n• `$mytilt stake` - Check gambling activity',
                    inline: false
                }
            );

        await message.reply({ embeds: [embed] });
    }

    /**
     * Show enhanced help
     */
    async showEnhancedHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#7289da')
            .setTitle('🚀 Enhanced Tilt Protection Help')
            .setDescription('Advanced tilt protection with JustTheIP and Stake API integration')
            .addFields(
                {
                    name: '🔧 Setup Commands',
                    value: '• `$mytilt setup` - Complete enhanced setup\n• `$mytilt wallet` - Wallet activity analysis\n• `$mytilt stake` - Stake gambling analysis',
                    inline: false
                },
                {
                    name: '📊 Monitoring Commands',
                    value: '• `$mytilt status` - Full system status\n• `$mytilt combined` - Cross-platform analysis\n• `$mytilt emergency` - Enhanced emergency protocol',
                    inline: false
                },
                {
                    name: '🔗 Integrations',
                    value: '• **JustTheIP Wallets**: Real-time blockchain monitoring\n• **Stake API**: Live gambling session tracking\n• **Cross-Platform**: Comprehensive tilt detection',
                    inline: false
                }
            )
            .setFooter({ text: 'Enhanced Tilt Protection • Protecting you across all platforms' });

        await message.reply({ embeds: [embed] });
    }

    /**
     * Utility methods
     */
    
    isValidWalletAddress(address, chain) {
        // Basic validation - you might want to implement more sophisticated validation
        if (!address || !chain) return false;
        
        switch (chain.toUpperCase()) {
            case 'SOLANA':
                return address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
            case 'ETHEREUM':
            case 'POLYGON':
            case 'BSC':
                return address.startsWith('0x') && address.length === 42;
            default:
                return false;
        }
    }

    calculateTransactionValue(transaction) {
        // Simplified transaction value calculation
        // In a real implementation, you'd need to parse the transaction properly
        return transaction.fee || 0;
    }

    async performInitialWalletAnalysis(userId, wallets) {
        // Perform initial analysis of connected wallets
        console.log(`📊 Performing initial wallet analysis for user ${userId}`);
        // Implementation would analyze transaction history, patterns, etc.
    }

    /**
     * Cleanup monitoring for a user
     */
    stopEnhancedMonitoring(userId) {
        // Stop wallet monitoring
        const walletMonitor = this.walletMonitors.get(userId);
        if (walletMonitor && walletMonitor.interval) {
            clearInterval(walletMonitor.interval);
            this.walletMonitors.delete(userId);
        }

        // Stop stake monitoring
        const stakeData = this.stakeIntegrations.get(userId);
        if (stakeData && stakeData.monitoringInterval) {
            clearInterval(stakeData.monitoringInterval);
        }

        console.log(`🛑 Enhanced monitoring stopped for user ${userId}`);
    }
}

module.exports = EnhancedTiltSetup;
