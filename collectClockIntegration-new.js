const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const CasinoApiConnector = require('./casinoApiConnector');
const AIMStyleControlPanel = require('./aimStyleControlPanel');
require('dotenv').config();

class CollectClockIntegration {
    constructor() {
        this.client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.DirectMessages
            ]
        });

        this.isInitialized = false;
        this.trapHouseBot = null; // Reference to main TrapHouse bot
        this.casinoApiConnector = null; // API connector for casino integration
        this.aimControlPanel = null; // AIM-style control panel for verified degens
        
        // Daily collection platforms from CollectClock website
        this.platforms = [
            { name: 'TrustDice', url: 'https://trustdice.win/', icon: '🎲', bonus: '$1-5' },
            { name: 'Stake US', url: 'https://stake.us/', icon: '💰', bonus: '$2-10' },
            { name: 'MetaWin', url: 'https://metawin.com/', icon: '🏆', bonus: '$1-3' },
            { name: 'SpinBlitz', url: 'https://www.spinblitz.com/', icon: '⚡', bonus: '$0.50-2' },
            { name: 'Hello Millions', url: 'https://www.hellomillions.com/', icon: '💎', bonus: '$1-5' },
            { name: 'Mega Bonanza', url: 'https://www.megabonanza.com/', icon: '🎰', bonus: '$2-8' },
            { name: 'Real Prize', url: 'https://www.realprize.com/', icon: '🏅', bonus: '$1-4' },
            { name: 'LuckyBird', url: 'https://luckybird.vip/', icon: '🦅', bonus: '$1-6' },
            { name: 'WowVegas', url: 'https://www.wowvegas.com/', icon: '🎭', bonus: '$2-7' },
            { name: 'Pulsz', url: 'https://www.pulsz.com/', icon: '⚡', bonus: '$1-3' },
            { name: 'Modo', url: 'https://modo.us/', icon: '🎯', bonus: '$0.75-2' },
            { name: 'McLuck', url: 'https://www.mcluck.com/', icon: '🍀', bonus: '$1-4' },
            { name: 'Crown Coins', url: 'https://crowncoinscasino.com/', icon: '👑', bonus: '$2-5' },
            { name: 'Chanced', url: 'https://chanced.com/', icon: '🎲', bonus: '$1-3' },
            { name: 'Sportzino', url: 'https://sportzino.com/', icon: '⚽', bonus: '$1-2' }
        ];
        
        this.userCollections = new Map(); // Track user collection data
        this.initializeBot();
    }

    async initializeBot() {
        try {
            this.client.on('ready', () => {
                console.log(`💧 CollectClock Bot is online! Logged in as ${this.client.user.tag}`);
                console.log(`🎰 Tracking ${this.platforms.length} daily bonus platforms`);
                this.isInitialized = true;
                
                // Initialize Casino API Connector
                this.initializeCasinoApiConnector();
                
                // Initialize AIM Control Panel
                this.initializeAIMControlPanel();
                
                // Start daily reminder system
                this.startDailyReminderSystem();
            });

            this.client.on('messageCreate', async (message) => {
                if (message.author.bot) return;
                await this.handleMessage(message);
            });

            this.client.on('error', (error) => {
                console.error('CollectClock Bot Error:', error);
            });

            // Login to Discord
            await this.client.login(process.env.COLLECTCLOCK_DISCORD_BOT_TOKEN);

        } catch (error) {
            console.error('Failed to initialize CollectClock bot:', error);
        }
    }

    // Set reference to main TrapHouse bot for integration
    setTrapHouseBot(trapHouseBot) {
        this.trapHouseBot = trapHouseBot;
    }

    // Initialize Casino API Connector
    initializeCasinoApiConnector() {
        try {
            // Get TiltCheck verification system if available
            const tiltCheckVerification = this.trapHouseBot?.tiltCheckVerification || null;
            
            this.casinoApiConnector = new CasinoApiConnector(this, tiltCheckVerification);
            this.casinoApiConnector.initialize();
            
            console.log('🔌 Casino API Connector integrated with CollectClock');
        } catch (error) {
            console.error('Failed to initialize Casino API Connector:', error);
        }
    }

    // Initialize AIM Control Panel
    initializeAIMControlPanel() {
        try {
            this.aimControlPanel = new AIMStyleControlPanel(this, this.trapHouseBot);
            console.log('🎮 AIM Control Panel integrated with CollectClock');
        } catch (error) {
            console.error('Failed to initialize AIM Control Panel:', error);
        }
    }

    // Handle casino login event (called when user logs into casino via CollectClock)
    async handleCasinoLogin(userId, casinoUrl, loginData) {
        if (!this.casinoApiConnector) {
            console.log('⚠️ Casino API Connector not initialized');
            return;
        }

        try {
            console.log(`🎰 Processing casino login: ${userId} -> ${casinoUrl}`);
            
            const connectionResult = await this.casinoApiConnector.handleCasinoLogin(userId, casinoUrl, loginData);
            
            if (connectionResult.success) {
                console.log(`✅ Casino API connection successful: ${connectionResult.casino}`);
                
                // Update user collection data with API connection
                const userData = this.getUserCollectionData(userId);
                if (!userData.apiConnections) userData.apiConnections = [];
                
                userData.apiConnections.push({
                    casino: connectionResult.casino,
                    connectedAt: new Date(),
                    hasBalance: connectionResult.balance?.success || false,
                    balanceAmount: connectionResult.balance?.totalUSD || 0
                });
                
                this.saveUserCollectionData(userId, userData);
                
                // Send success notification
                await this.sendApiConnectionSuccess(userId, connectionResult);
                
            } else {
                console.log(`❌ Casino API connection failed: ${connectionResult.reason}`);
                await this.sendApiConnectionFailure(userId, casinoUrl, connectionResult.reason);
            }

        } catch (error) {
            console.error('Casino login handling error:', error);
        }
    }

    // Send API connection success notification
    async sendApiConnectionSuccess(userId, connectionResult) {
        try {
            const user = await this.client.users.fetch(userId);
            if (!user) return;

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🎯 CollectClock API Integration Success!')
                .setDescription(`Successfully connected to **${connectionResult.casino}** with live balance monitoring!`)
                .addFields(
                    {
                        name: '💰 Current Balance',
                        value: connectionResult.balance?.success ? 
                            `$${connectionResult.balance.totalUSD?.toFixed(2) || '0.00'} (${connectionResult.balance.currencies?.length || 0} currencies)` :
                            'Balance retrieval pending...',
                        inline: true
                    },
                    {
                        name: '🔗 API Features',
                        value: Object.keys(connectionResult.apiDocumentation || {}).map(api => `• ${api}`).join('\n') || 'Basic monitoring',
                        inline: true
                    },
                    {
                        name: '🛡️ Monitoring Active',
                        value: '• Real-time balance tracking\n• Automatic tilt alerts\n• Loss pattern detection\n• Responsible gambling tools',
                        inline: false
                    }
                )
                .setFooter({ text: 'CollectClock API Connector • Your gambling is now monitored for safety' })
                .setTimestamp();

            await user.send({ embeds: [embed] });

        } catch (error) {
            console.error('API success notification error:', error);
        }
    }

    // Send API connection failure notification
    async sendApiConnectionFailure(userId, casinoUrl, reason) {
        try {
            const user = await this.client.users.fetch(userId);
            if (!user) return;

            const embed = new EmbedBuilder()
                .setColor('#ff4444')
                .setTitle('⚠️ CollectClock API Connection Issue')
                .setDescription(`Unable to establish API connection to casino`)
                .addFields(
                    {
                        name: '🎰 Casino',
                        value: new URL(casinoUrl).hostname,
                        inline: true
                    },
                    {
                        name: '❌ Reason',
                        value: this.getFailureReasonMessage(reason),
                        inline: true
                    },
                    {
                        name: '💡 Next Steps',
                        value: '• Manual collection tracking still available\n• Use `!cc collected [casino]` to log bonuses\n• Discord authentication may be required',
                        inline: false
                    }
                )
                .setFooter({ text: 'CollectClock • Manual tracking is always available' })
                .setTimestamp();

            await user.send({ embeds: [embed] });

        } catch (error) {
            console.error('API failure notification error:', error);
        }
    }

    // Get human-readable failure reason
    getFailureReasonMessage(reason) {
        const messages = {
            'unsupported_casino': 'Casino not supported for API integration',
            'auth_failed': 'Discord authentication required',
            'api_connection_failed': 'Casino API unavailable',
            'no_credentials_found': 'Login credentials not detected',
            'system_error': 'Technical error occurred'
        };
        
        return messages[reason] || 'Unknown error occurred';
    }

    async handleMessage(message) {
        const content = message.content.toLowerCase().trim();

        // Daily collection commands (NEW - MAIN FEATURE)
        if (content.startsWith('!collect') || content.startsWith('!cc')) {
            const args = content.split(' ').slice(1);
            await this.handleCollectClock(message, args);
        }
        // Show help for CollectClock
        else if (content.startsWith('!help-collect') || content === '!collectclock') {
            await this.showCollectClockHelp(message);
        }
    }

    // MAIN: CollectClock daily bonus system
    async handleCollectClock(message, args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'status':
                await this.showCollectionStatus(message);
                break;
            case 'remind':
                await this.setupReminders(message, args.slice(1));
                break;
            case 'streak':
                await this.showUserStreak(message);
                break;
            case 'leaderboard':
                await this.showCollectionLeaderboard(message);
                break;
            case 'platforms':
                await this.showPlatforms(message);
                break;
            case 'link':
                await this.linkDiscordAccount(message);
                break;
            case 'collected':
                await this.markAsCollected(message, args.slice(1));
                break;
            case 'api':
                await this.handleApiCommands(message, args.slice(1));
                break;
            case 'aim':
                await this.handleAIMCommands(message, args.slice(1));
                break;
            case 'verify':
                await this.handleVerificationCommands(message, args.slice(1));
                break;
            case 'msg':
                await this.handleInstantMessage(message, args.slice(1));
                break;
            case 'tip':
                await this.handleFastTip(message, args.slice(1));
                break;
            default:
                await this.showCollectionStatus(message);
        }
    }

    // Show daily collection status with JustTheTip degen humor
    async showCollectionStatus(message) {
        const userData = this.getUserCollectionData(message.author.id);
        const availablePlatforms = this.getAvailablePlatforms();
        const collectedToday = userData.collectedToday || [];
        const remainingPlatforms = availablePlatforms.filter(p => !collectedToday.includes(p.name));
        
        const embed = new EmbedBuilder()
            .setColor(remainingPlatforms.length > 0 ? '#00ff88' : '#ffd700')
            .setTitle('💧 CollectClock Status - Don\'t Miss Your Daily Bag!')
            .setDescription('*JustTheTip: Missing daily collections is like not buying the dip - pure degeneracy!*')
            .addFields(
                {
                    name: '🎰 Available Collections',
                    value: remainingPlatforms.length > 0 
                        ? remainingPlatforms.slice(0, 10).map(p => `${p.icon} **${p.name}** - ${p.bonus}`).join('\n')
                        : '✅ All caught up, degen! Time to touch grass... or not.',
                    inline: false
                },
                {
                    name: '🔥 Your Streak',
                    value: `${userData.streak || 0} days\n${this.getStreakEmoji(userData.streak || 0)} ${this.getStreakComment(userData.streak || 0)}`,
                    inline: true
                },
                {
                    name: '💰 Today\'s Progress',
                    value: `${collectedToday.length}/${this.platforms.length}\n💎 Completion: ${Math.round((collectedToday.length / this.platforms.length) * 100)}%`,
                    inline: true
                },
                {
                    name: '⏰ Next Reset',
                    value: this.getNextResetTime(),
                    inline: true
                }
            )
            .setFooter({ text: 'Use !cc link to connect to CollectClock • Made for degens by degens' })
            .setTimestamp();

        // Add JustTheTip vault recommendation based on collection behavior
        const degenLevel = this.calculateDegenLevel(userData);
        if (degenLevel >= 80) {
            embed.addFields({
                name: '🏦 JustTheTip Vault Suggestion',
                value: '**HODL Vault** - Your consistency shows diamond hands! 💎\nPerfect for steady accumulation like your collection game.',
                inline: false
            });
        } else if (degenLevel >= 40) {
            embed.addFields({
                name: '🏦 JustTheTip Vault Suggestion', 
                value: '**Grass Touching Vault** - You\'re building good habits! 🌱\nKeep this energy for your crypto strategy.',
                inline: false
            });
        } else {
            embed.addFields({
                name: '🏦 JustTheTip Vault Suggestion',
                value: '**YOLO Vault** - Inconsistent like your collection streak! 🎲\nTime to get serious about both habits.',
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });
    }

    // Setup collection reminders
    async setupReminders(message, args) {
        const time = args[0]; // Format: "09:00" or "daily"
        
        if (!time) {
            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('⏰ CollectClock Reminders Setup')
                .setDescription('Never miss your daily bag again!')
                .addFields(
                    {
                        name: '📱 Available Options',
                        value: '`!cc remind daily` - Daily reminder at 9 AM\n`!cc remind 15:30` - Custom time (24h format)\n`!cc remind off` - Disable reminders',
                        inline: false
                    },
                    {
                        name: '🎯 What You\'ll Get',
                        value: '• Daily DMs about available collections\n• Streak warnings when you\'re slipping\n• Platform-specific notifications\n• JustTheTip vault recommendations',
                        inline: false
                    }
                )
                .setFooter({ text: 'JustTheTip: Consistency in collections = consistency in gains!' });
            
            return await message.reply({ embeds: [embed] });
        }

        const userData = this.getUserCollectionData(message.author.id);
        
        if (time === 'off') {
            userData.reminders = false;
            await message.reply('🔕 Collection reminders disabled. *JustTheTip: Missing out on free money? That\'s a bold strategy, cotton.*');
        } else {
            userData.reminders = true;
            userData.reminderTime = time === 'daily' ? '09:00' : time;
            await message.reply(`✅ Collection reminders set for ${userData.reminderTime}!\n\n💡 *JustTheTip: Now you have no excuse for missing those daily bonuses!*`);
        }
        
        this.saveUserCollectionData(message.author.id, userData);
    }

    // Show user collection streak with degen insights
    async showUserStreak(message) {
        const userData = this.getUserCollectionData(message.author.id);
        const streakDays = userData.streak || 0;
        
        const embed = new EmbedBuilder()
            .setColor(this.getStreakColor(streakDays))
            .setTitle(`🔥 ${message.author.username}'s Collection Streak`)
            .setDescription(this.getStreakComment(streakDays))
            .addFields(
                {
                    name: '📊 Streak Stats',
                    value: `**Current:** ${streakDays} days\n**Best:** ${userData.bestStreak || streakDays} days\n**Total Collections:** ${userData.totalCollections || 0}`,
                    inline: true
                },
                {
                    name: '🎯 Degen Analysis',
                    value: this.getDegenAnalysis(userData),
                    inline: true
                },
                {
                    name: '🏆 Achievements',
                    value: this.getStreakAchievements(streakDays),
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Consistent collections = consistent gains!' });

        await message.reply({ embeds: [embed] });
    }

    // Show collection leaderboard
    async showCollectionLeaderboard(message) {
        const embed = new EmbedBuilder()
            .setColor('#9932cc')
            .setTitle('🏆 CollectClock Leaderboard - Top Degens')
            .setDescription('*The most consistent bag collectors in the TrapHouse*')
            .addFields(
                {
                    name: '👑 Streak Kings',
                    value: '1. **DegenKing#1337** - 45 days 🔥\n2. **BagChaser#0420** - 32 days 💎\n3. **DailyGrinder#6969** - 28 days ⚡',
                    inline: true
                },
                {
                    name: '💰 Collection Masters',
                    value: '1. **BonusHunter#2024** - 1,247 collections\n2. **FreeMoney#4455** - 1,103 collections\n3. **GrindNeverStops#7777** - 967 collections',
                    inline: true
                },
                {
                    name: '🎯 This Week\'s MVP',
                    value: `**${message.author.username}** could be here!\n\nStart your streak today with \`!cc link\``,
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Competition breeds excellence... and better bags!' });

        await message.reply({ embeds: [embed] });
    }

    // Show available platforms
    async showPlatforms(message) {
        const platformChunks = this.chunkArray(this.platforms, 5);
        
        const embed = new EmbedBuilder()
            .setColor('#00aaff')
            .setTitle('🎰 CollectClock Platforms - Your Daily Bag Sources')
            .setDescription('*All the platforms where you can collect your daily bread*');

        platformChunks.forEach((chunk, index) => {
            embed.addFields({
                name: `🎯 Platform Group ${index + 1}`,
                value: chunk.map(p => `${p.icon} **[${p.name}](${p.url})** - ${p.bonus}`).join('\n'),
                inline: true
            });
        });

        embed.addFields({
            name: '🚀 Quick Actions',
            value: '• `!cc status` - Check what\'s available\n• `!cc remind daily` - Never miss again\n• `!cc link` - Connect your Discord\n• [**Open CollectClock**](https://jmenichole.github.io/CollectClock/)',
            inline: false
        });

        embed.setFooter({ text: 'JustTheTip: Diversification is key - in crypto and in collections!' });

        await message.reply({ embeds: [embed] });
    }

    // Link Discord account to CollectClock
    async linkDiscordAccount(message) {
        const embed = new EmbedBuilder()
            .setColor('#5865f2')
            .setTitle('🔗 Link Your CollectClock Account')
            .setDescription('Connect your Discord to track collections and get personalized tips!')
            .addFields(
                {
                    name: '🎯 Step 1: Visit CollectClock',
                    value: '[**Click here to open CollectClock**](https://jmenichole.github.io/CollectClock/)',
                    inline: false
                },
                {
                    name: '🔐 Step 2: Login with Discord',
                    value: 'Click "Login with Discord" on the CollectClock site',
                    inline: false
                },
                {
                    name: '✅ Step 3: You\'re Connected!',
                    value: 'Your collections will now sync with JustTheTip for better insights',
                    inline: false
                },
                {
                    name: '💡 What You Get',
                    value: '• Automatic streak tracking\n• Personalized vault recommendations\n• Collection reminders via DM\n• Leaderboard participation\n• Degen level calculations\n• TrapHouse respect integration\n• **Casino API monitoring**\n• **Real-time balance tracking**',
                    inline: false
                },
                {
                    name: '🌐 TrapHouse Ecosystem',
                    value: '[**TrapHouse Bot**](https://traphousediscordbot.created.app) • [**GitHub**](https://github.com/jmenichole/trap-house-discord-bot)',
                    inline: false
                },
                {
                    name: '🔌 API Features',
                    value: 'After linking Discord, use `!cc api auth` to enable casino API monitoring for real-time balance tracking and tilt protection!',
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Connected accounts = connected gains!' });

        await message.reply({ embeds: [embed] });
    }

    // Handle API-related commands
    async handleApiCommands(message, args) {
        const subcommand = args[0]?.toLowerCase();
        const userId = message.author.id;

        if (!this.casinoApiConnector) {
            return await message.reply('❌ Casino API Connector not available. Please contact support.');
        }

        switch (subcommand) {
            case 'status':
                await this.showApiStatus(message);
                break;
            case 'connect':
                await this.manualApiConnect(message, args.slice(1));
                break;
            case 'disconnect':
                await this.disconnectApi(message, args.slice(1));
                break;
            case 'balances':
                await this.showApiBalances(message);
                break;
            case 'docs':
                await this.showApiDocumentation(message, args.slice(1));
                break;
            case 'auth':
                await this.handleDiscordAuth(message);
                break;
            default:
                await this.showApiHelp(message);
        }
    }

    // Show API connection status
    async showApiStatus(message) {
        const userId = message.author.id;
        const connections = this.casinoApiConnector.getUserConnections(userId);
        
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🔌 CollectClock API Status')
            .setDescription('Your casino API connections and monitoring status');

        if (connections.length === 0) {
            embed.addFields({
                name: '📱 Connection Status',
                value: 'No active API connections\n\nUse `!cc link` to connect your Discord account, then visit casinos through CollectClock for automatic API detection.',
                inline: false
            });
        } else {
            connections.forEach((conn, index) => {
                embed.addFields({
                    name: `🎰 ${conn.casino}`,
                    value: `**Status:** ${conn.status}\n**Connected:** ${conn.connectedAt.toLocaleDateString()}\n**Balance:** ${conn.lastBalance?.success ? `$${conn.lastBalance.totalUSD?.toFixed(2)}` : 'Unavailable'}`,
                    inline: true
                });
            });
        }

        embed.addFields({
            name: '🛠️ API Commands',
            value: '• `!cc api status` - View connections\n• `!cc api balances` - Check all balances\n• `!cc api docs [casino]` - View API documentation\n• `!cc api auth` - Discord authentication\n• `!cc api connect [casino]` - Manual connection',
            inline: false
        });

        await message.reply({ embeds: [embed] });
    }

    // Show current API balances
    async showApiBalances(message) {
        const userId = message.author.id;
        const connections = this.casinoApiConnector.getUserConnections(userId);
        
        if (connections.length === 0) {
            return await message.reply('❌ No active API connections. Use `!cc api status` to view connection options.');
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('💰 Live Casino Balances')
            .setDescription('Real-time balances from your connected casinos')
            .setTimestamp();

        let totalBalance = 0;
        connections.forEach(conn => {
            if (conn.lastBalance?.success) {
                totalBalance += conn.lastBalance.totalUSD || 0;
                embed.addFields({
                    name: `🎰 ${conn.casino}`,
                    value: `**Balance:** $${conn.lastBalance.totalUSD?.toFixed(2) || '0.00'}\n**Currencies:** ${conn.lastBalance.currencies?.join(', ') || 'N/A'}\n**Updated:** ${new Date(conn.lastBalance.lastUpdated).toLocaleTimeString()}`,
                    inline: true
                });
            }
        });

        embed.addFields({
            name: '💵 Total Portfolio',
            value: `$${totalBalance.toFixed(2)} USD`,
            inline: false
        });

        await message.reply({ embeds: [embed] });
    }

    // Show API documentation for a casino
    async showApiDocumentation(message, args) {
        const casino = args[0];
        
        if (!casino) {
            // Show all supported casinos
            const supportedCasinos = [];
            for (const [domain, config] of this.casinoApiConnector.apiDocumentation) {
                supportedCasinos.push(`• **${config.name}** (${domain}) - ${config.balanceSupport ? '✅' : '❌'} Balance API`);
            }

            const embed = new EmbedBuilder()
                .setColor('#9932cc')
                .setTitle('📚 Casino API Documentation')
                .setDescription('Available casino API integrations')
                .addFields({
                    name: '🎰 Supported Casinos',
                    value: supportedCasinos.join('\n') || 'No casinos configured',
                    inline: false
                })
                .addFields({
                    name: '💡 Usage',
                    value: '`!cc api docs [casino_name]` - View specific casino API details',
                    inline: false
                });

            return await message.reply({ embeds: [embed] });
        }

        // Find casino by name or domain
        let casinoConfig = null;
        for (const [domain, config] of this.casinoApiConnector.apiDocumentation) {
            if (config.name.toLowerCase().includes(casino.toLowerCase()) || domain.includes(casino.toLowerCase())) {
                casinoConfig = config;
                break;
            }
        }

        if (!casinoConfig) {
            return await message.reply(`❌ Casino "${casino}" not found. Use \`!cc api docs\` to see all supported casinos.`);
        }

        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle(`📋 ${casinoConfig.name} API Documentation`)
            .setDescription(`API integration details for ${casinoConfig.name}`)
            .addFields(
                {
                    name: '🔗 Base URL',
                    value: casinoConfig.baseUrl,
                    inline: false
                },
                {
                    name: '🔐 Authentication',
                    value: casinoConfig.authMethod.replace('_', ' ').toUpperCase(),
                    inline: true
                },
                {
                    name: '💰 Balance Support',
                    value: casinoConfig.balanceSupport ? '✅ Yes' : '❌ No',
                    inline: true
                },
                {
                    name: '⚡ Real-time',
                    value: casinoConfig.realTimeSupport ? '✅ Yes' : '❌ No',
                    inline: true
                },
                {
                    name: '📡 Available Endpoints',
                    value: Object.entries(casinoConfig.availableEndpoints).map(([name, path]) => `• **${name}:** \`${path}\``).join('\n'),
                    inline: false
                },
                {
                    name: '⏱️ Rate Limits',
                    value: `${casinoConfig.rateLimits.requestsPerMinute} requests/minute`,
                    inline: false
                }
            );

        await message.reply({ embeds: [embed] });
    }

    // Handle Discord authentication for API access
    async handleDiscordAuth(message) {
        const userId = message.author.id;
        
        // Generate Discord OAuth URL
        const authUrl = this.casinoApiConnector.generateDiscordOAuthUrl(userId);
        
        const embed = new EmbedBuilder()
            .setColor('#7289da')
            .setTitle('🔐 Discord Authentication Required')
            .setDescription('Authenticate with Discord to enable casino API monitoring')
            .addFields(
                {
                    name: '🔗 Authentication Link',
                    value: `[Click here to authenticate](${authUrl})`,
                    inline: false
                },
                {
                    name: '📋 What This Enables',
                    value: '• Automatic casino login detection\n• Real-time balance monitoring\n• Enhanced tilt protection\n• Cross-platform activity correlation',
                    inline: false
                },
                {
                    name: '🛡️ Privacy & Security',
                    value: 'We only access basic Discord profile information. Casino credentials are processed securely and never stored permanently.',
                    inline: false
                }
            )
            .setFooter({ text: 'CollectClock API Connector • Secure OAuth 2.0 authentication' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    // Show API help
    async showApiHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('🔌 CollectClock API Commands')
            .setDescription('Manage your casino API connections and monitoring')
            .addFields(
                {
                    name: '📊 Status & Monitoring',
                    value: '• `!cc api status` - View all API connections\n• `!cc api balances` - Check live casino balances\n• `!cc api auth` - Setup Discord authentication',
                    inline: false
                },
                {
                    name: '🔗 Connection Management',
                    value: '• `!cc api connect [casino]` - Manual casino connection\n• `!cc api disconnect [casino]` - Remove casino connection',
                    inline: false
                },
                {
                    name: '📚 Documentation',
                    value: '• `!cc api docs` - View all supported casinos\n• `!cc api docs [casino]` - Specific casino API details',
                    inline: false
                },
                {
                    name: '🤖 Automatic Detection',
                    value: 'Visit casinos through CollectClock links after authentication for automatic API connection detection!',
                    inline: false
                }
            )
            .setFooter({ text: 'CollectClock API Connector • Real-time casino monitoring' });

        await message.reply({ embeds: [embed] });
    }

    // Manual API connect (placeholder)
    async manualApiConnect(message, args) {
        await message.reply('🚧 Manual API connection coming soon! For now, visit casinos through CollectClock links after authentication for automatic detection.');
    }

    // Disconnect API (placeholder)
    async disconnectApi(message, args) {
        await message.reply('🚧 API disconnection coming soon! Contact support if you need to remove a connection immediately.');
    }

    // ===== AIM CONTROL PANEL COMMANDS =====

    // Handle AIM Control Panel commands
    async handleAIMCommands(message, args) {
        const subcommand = args[0]?.toLowerCase();
        const userId = message.author.id;

        if (!this.aimControlPanel) {
            return await message.reply('❌ AIM Control Panel not available. Please contact support.');
        }

        switch (subcommand) {
            case 'panel':
                await this.showAIMControlPanel(message);
                break;
            case 'online':
                await this.showOnlineVerifiedUsers(message);
                break;
            case 'rooms':
                await this.showChatRooms(message);
                break;
            case 'create':
                await this.createChatRoom(message, args.slice(1));
                break;
            case 'join':
                await this.joinChatRoom(message, args.slice(1));
                break;
            default:
                await this.showAIMHelp(message);
        }
    }

    // Show AIM Control Panel
    async showAIMControlPanel(message) {
        if (!this.aimControlPanel) {
            return await message.reply('❌ AIM Control Panel not initialized.');
        }

        // Create fake interaction object for the control panel
        const fakeInteraction = {
            reply: async (options) => {
                if (options.ephemeral) {
                    return await message.author.send(options);
                }
                return await message.reply(options);
            },
            update: async (options) => await message.edit(options)
        };

        await this.aimControlPanel.showControlPanel(message.author.id, fakeInteraction);
    }

    // Handle verification commands
    async handleVerificationCommands(message, args) {
        const subcommand = args[0]?.toLowerCase();
        const userId = message.author.id;

        if (!this.aimControlPanel) {
            return await message.reply('❌ Verification system not available. Please contact support.');
        }

        switch (subcommand) {
            case 'start':
                await this.startVerificationProcess(message);
                break;
            case 'status':
                await this.showVerificationStatus(message);
                break;
            case 'help':
                await this.showVerificationHelp(message);
                break;
            default:
                await this.startVerificationProcess(message);
        }
    }

    // Start verification process
    async startVerificationProcess(message) {
        if (!this.aimControlPanel) {
            return await message.reply('❌ Verification system not available.');
        }

        await this.aimControlPanel.startVerification(message.author.id, message);
    }

    // Show verification status
    async showVerificationStatus(message) {
        const userId = message.author.id;
        const isVerified = this.aimControlPanel?.isUserVerified(userId) || false;
        
        const embed = new EmbedBuilder()
            .setColor(isVerified ? '#00ff88' : '#ffa500')
            .setTitle('🔐 Verification Status')
            .setDescription(isVerified ? 
                '✅ **VERIFIED DEGEN** - Full access granted!' : 
                '⚠️ **UNVERIFIED** - Complete verification to unlock features'
            );

        if (isVerified) {
            const verificationData = this.aimControlPanel.verificationSystem.verifiedUsers.get(userId);
            if (verificationData) {
                embed.addFields(
                    {
                        name: '📊 Verification Details',
                        value: `**Score:** ${verificationData.verificationScore}/100\n**Level:** ${this.getTrustLevel(verificationData.verificationScore)}\n**Verified:** ${verificationData.verifiedAt.toLocaleDateString()}`,
                        inline: true
                    },
                    {
                        name: '✅ Completed Steps',
                        value: Object.entries(verificationData.steps)
                            .map(([step, completed]) => `${completed ? '✅' : '❌'} ${step.charAt(0).toUpperCase() + step.slice(1)}`)
                            .join('\n'),
                        inline: true
                    }
                );
            }
        } else {
            embed.addFields({
                name: '🚀 Next Steps',
                value: 'Use `!cc verify start` to begin verification process and unlock:\n• Instant messaging\n• Fast tips & airdrops\n• Verified chat rooms\n• Anti-scam protection',
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });
    }

    // Handle instant messaging
    async handleInstantMessage(message, args) {
        if (!this.aimControlPanel) {
            return await message.reply('❌ Instant messaging not available. Verification required.');
        }

        const userId = message.author.id;
        
        if (!this.aimControlPanel.isUserVerified(userId)) {
            return await message.reply('❌ Verification required for instant messaging. Use `!cc verify start`');
        }

        // Parse target user and message
        const targetMention = args[0];
        const messageText = args.slice(1).join(' ');

        if (!targetMention || !messageText) {
            return await message.reply('❌ Usage: `!cc msg @user your message here`');
        }

        // Extract user ID from mention
        const targetUserId = targetMention.replace(/[<@!>]/g, '');
        
        if (!this.aimControlPanel.isUserVerified(targetUserId)) {
            return await message.reply('❌ Target user must be verified to receive instant messages.');
        }

        // Create fake interaction for messaging system
        const fakeInteraction = {
            reply: async (options) => await message.reply(options)
        };

        await this.aimControlPanel.sendInstantMessage(userId, targetUserId, messageText, fakeInteraction);
    }

    // Handle fast tips
    async handleFastTip(message, args) {
        if (!this.aimControlPanel) {
            return await message.reply('❌ Fast tips not available. Verification required.');
        }

        const userId = message.author.id;
        
        if (!this.aimControlPanel.isUserVerified(userId)) {
            return await message.reply('❌ Verification required for fast tips. Use `!cc verify start`');
        }

        // Parse tip command: !cc tip @user amount [currency] [message]
        const targetMention = args[0];
        const amount = parseFloat(args[1]);
        const currency = args[2] || 'USD';
        const tipMessage = args.slice(3).join(' ') || 'Tip from verified degen!';

        if (!targetMention || isNaN(amount) || amount <= 0) {
            return await message.reply('❌ Usage: `!cc tip @user amount [currency] [message]`');
        }

        const targetUserId = targetMention.replace(/[<@!>]/g, '');
        
        if (!this.aimControlPanel.isUserVerified(targetUserId)) {
            return await message.reply('❌ Target user must be verified to receive tips.');
        }

        try {
            const tipId = await this.aimControlPanel.sendFastTip(userId, targetUserId, amount, currency, tipMessage);
            
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('💰 Fast Tip Sent!')
                .setDescription(`Successfully sent tip to verified degen!`)
                .addFields(
                    {
                        name: '💸 Tip Details',
                        value: `**Amount:** ${amount} ${currency}\n**Recipient:** <@${targetUserId}>\n**Message:** ${tipMessage}`,
                        inline: false
                    },
                    {
                        name: '🔐 Security',
                        value: `**Tip ID:** \`${tipId}\`\n**Status:** Processing through verified channels\n**Anti-farming:** ✅ Verified`,
                        inline: false
                    }
                )
                .setFooter({ text: 'AIM Control Panel • Verified tips only' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            await message.reply(`❌ Tip failed: ${error.message}`);
        }
    }

    // Show AIM help
    async showAIMHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#9932cc')
            .setTitle('🎮 AIM Control Panel Commands')
            .setDescription('Advanced Instant Messaging system for verified degens')
            .addFields(
                {
                    name: '🔐 Verification Commands',
                    value: '• `!cc verify start` - Begin verification process\n• `!cc verify status` - Check verification status\n• `!cc verify help` - Verification help',
                    inline: false
                },
                {
                    name: '💬 Messaging Commands',
                    value: '• `!cc msg @user message` - Send instant message\n• `!cc aim online` - Show online verified users\n• `!cc aim rooms` - View active chat rooms\n• `!cc aim create [room_name]` - Create chat room',
                    inline: false
                },
                {
                    name: '💰 Tip Commands',
                    value: '• `!cc tip @user amount` - Send fast tip\n• `!cc tip @user amount USD message` - Tip with message\n• Anti-farming protection included',
                    inline: false
                },
                {
                    name: '🎮 Control Panel',
                    value: '• `!cc aim panel` - Open AIM control panel\n• Full verification required for access\n• Real-time messaging and tips',
                    inline: false
                }
            )
            .setFooter({ text: 'AIM Control Panel • Verification required for most features' });

        await message.reply({ embeds: [embed] });
    }

    // Helper method for trust levels
    getTrustLevel(score) {
        if (score >= 90) return 'Elite Degen 👑';
        if (score >= 75) return 'Trusted Degen 💎';
        if (score >= 60) return 'Verified Degen ✅';
        if (score >= 40) return 'New Degen 🌱';
        return 'Unverified ❌';
    }

    // Mark collections as completed
    async markAsCollected(message, args) {
        const platformName = args.join(' ');
        if (!platformName) {
            return await message.reply('❌ Please specify a platform name. Example: `!cc collected TrustDice`');
        }

        const platform = this.platforms.find(p => p.name.toLowerCase().includes(platformName.toLowerCase()));
        if (!platform) {
            return await message.reply(`❌ Platform "${platformName}" not found. Use \`!cc platforms\` to see all available platforms.`);
        }

        const userData = this.getUserCollectionData(message.author.id);
        if (!userData.collectedToday) userData.collectedToday = [];
        
        if (userData.collectedToday.includes(platform.name)) {
            return await message.reply(`✅ You've already collected from **${platform.name}** today!`);
        }

        userData.collectedToday.push(platform.name);
        userData.totalCollections = (userData.totalCollections || 0) + 1;
        userData.lastCollectionDate = new Date().toDateString();

        // Update streak
        this.updateUserStreak(userData);
        
        this.saveUserCollectionData(message.author.id, userData);

        // Award TrapHouse respect
        if (this.trapHouseBot) {
            await this.awardCollectionRespect(message.author.id, platform.name);
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('💰 Collection Confirmed!')
            .setDescription(`Nice work collecting from **${platform.name}**!`)
            .addFields(
                {
                    name: '🎰 Platform',
                    value: `${platform.icon} **${platform.name}**\n💰 Bonus Range: ${platform.bonus}`,
                    inline: true
                },
                {
                    name: '🔥 Streak Status',
                    value: `${userData.streak} days\n${this.getStreakEmoji(userData.streak)}`,
                    inline: true
                },
                {
                    name: '📊 Today\'s Progress',
                    value: `${userData.collectedToday.length}/${this.platforms.length} platforms`,
                    inline: true
                }
            )
            .setFooter({ text: 'JustTheTip: Every collection counts toward your degen evolution!' });

        await message.reply({ embeds: [embed] });
    }

    // Show CollectClock help with full degen integration
    async showCollectClockHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('💧 CollectClock Integration - Made for Degens by Degens')
            .setDescription('*Never miss your daily collections again with JustTheTip insights!*')
            .addFields(
                {
                    name: '🎮 Collection Commands',
                    value: '`!cc` or `!collect` - Show this help\n`!cc status` - Check available collections\n`!cc remind [time]` - Setup reminders\n`!cc streak` - View your collection streak\n`!cc platforms` - List all platforms\n`!cc leaderboard` - Top collectors\n`!cc link` - Connect Discord account\n`!cc collected <platform>` - Mark as collected',
                    inline: false
                },
                {
                    name: '🏦 JustTheTip Integration',
                    value: '• Collection consistency affects vault recommendations\n• Streak data influences your degen level\n• Automatic accountability buddy matching\n• Collection habits impact crypto strategy tips\n• Earn TrapHouse respect for daily collections',
                    inline: false
                },
                {
                    name: '🎯 Pro Tips',
                    value: '• Set daily reminders to maintain streaks\n• Check status every morning with coffee\n• Use collection discipline for crypto habits\n• Track patterns to optimize timing\n• Link your account for full integration',
                    inline: false
                },
                {
                    name: '🔗 Quick Links',
                    value: '[**CollectClock Web App**](https://jmenichole.github.io/CollectClock/)\n[**TrapHouse Bot Site**](https://traphousediscordbot.created.app)\n[**GitHub Repository**](https://github.com/jmenichole/trap-house-discord-bot)',
                    inline: false
                }
            )
            .setFooter({ text: 'JustTheTip: Consistency in small things leads to big gains!' });

        await message.reply({ embeds: [embed] });
    }

    // Helper functions for CollectClock system
    getUserCollectionData(userId) {
        if (!this.userCollections.has(userId)) {
            this.userCollections.set(userId, {
                streak: 0,
                bestStreak: 0,
                totalCollections: 0,
                collectedToday: [],
                lastCollectionDate: null,
                reminders: false,
                reminderTime: '09:00'
            });
        }
        return this.userCollections.get(userId);
    }

    saveUserCollectionData(userId, data) {
        this.userCollections.set(userId, data);
        // TODO: Integrate with your storage.js system for persistence
    }

    getAvailablePlatforms() {
        // Mock availability - in production, this would check real API
        return this.platforms.filter(p => Math.random() > 0.2); // 80% availability
    }

    updateUserStreak(userData) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (userData.lastCollectionDate === yesterday) {
            userData.streak = (userData.streak || 0) + 1;
        } else if (userData.lastCollectionDate !== today) {
            userData.streak = 1;
        }
        
        userData.bestStreak = Math.max(userData.bestStreak || 0, userData.streak);
    }

    getStreakColor(streak) {
        if (streak >= 30) return '#ffd700'; // Gold
        if (streak >= 14) return '#00ff88'; // Green
        if (streak >= 7) return '#00aaff';  // Blue
        if (streak >= 3) return '#ffa500';  // Orange
        return '#ff6b6b'; // Red
    }

    getStreakEmoji(streak) {
        if (streak >= 30) return '👑';
        if (streak >= 14) return '🔥';
        if (streak >= 7) return '💎';
        if (streak >= 3) return '⚡';
        return '🌱';
    }

    getStreakComment(streak) {
        if (streak >= 30) return '*Absolute legend! This degen has transcended!*';
        if (streak >= 14) return '*Diamond hands in collections AND crypto!*';
        if (streak >= 7) return '*Solid consistency - the HODL energy is strong*';
        if (streak >= 3) return '*Building good habits - grass touching approved*';
        if (streak === 0) return '*Time to start your collection journey, degen!*';
        return '*Every journey starts with a single collection*';
    }

    getDegenAnalysis(userData) {
        const level = this.calculateDegenLevel(userData);
        
        if (level >= 80) return '**Transcended Degen** 🚀\nPeak performance mode';
        if (level >= 60) return '**Diamond Handed** 💎\nConsistent excellence';
        if (level >= 40) return '**Solid Grinder** ⚡\nBuilding momentum';
        if (level >= 20) return '**Learning Degen** 🌱\nGrowing strong';
        return '**Fresh Meat** 🥩\nWelcome to the game!';
    }

    calculateDegenLevel(userData) {
        const streakPoints = Math.min((userData.streak || 0) * 2, 50);
        const collectionPoints = Math.min((userData.totalCollections || 0) / 10, 30);
        const consistencyBonus = (userData.streak || 0) >= 7 ? 20 : 0;
        return Math.min(streakPoints + collectionPoints + consistencyBonus, 100);
    }

    getStreakAchievements(streak) {
        const achievements = [];
        if (streak >= 1) achievements.push('🌱 First Steps');
        if (streak >= 3) achievements.push('⚡ Getting Started');  
        if (streak >= 7) achievements.push('💎 Week Warrior');
        if (streak >= 14) achievements.push('🔥 Two Week Titan');
        if (streak >= 30) achievements.push('👑 Monthly Master');
        if (streak >= 100) achievements.push('🚀 Centennial Legend');
        
        return achievements.length > 0 ? achievements.join(' ') : '🥩 Ready to start!';
    }

    getNextResetTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const hours = Math.floor((tomorrow - now) / (1000 * 60 * 60));
        const minutes = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    // Award TrapHouse respect for collections
    async awardCollectionRespect(userId, platformName) {
        if (!this.trapHouseBot) return;
        
        try {
            // Award respect based on platform (5-15 points)
            const respectPoints = Math.floor(Math.random() * 10) + 5;
            console.log(`Awarding ${respectPoints} respect to ${userId} for collecting from ${platformName}`);
            // TODO: Integrate with your respectManager.js
        } catch (error) {
            console.error('Failed to award collection respect:', error);
        }
    }

    // Daily reminder system
    startDailyReminderSystem() {
        // Check every hour for users who need reminders
        setInterval(async () => {
            await this.checkAndSendReminders();
        }, 60 * 60 * 1000); // Every hour
        
        console.log('🔔 Daily reminder system started');
    }

    async checkAndSendReminders() {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        for (const [userId, userData] of this.userCollections) {
            if (userData.reminders && userData.reminderTime === currentTime) {
                await this.sendReminderDM(userId, userData);
            }
        }
    }

    async sendReminderDM(userId, userData) {
        try {
            const user = await this.client.users.fetch(userId);
            const collectedToday = userData.collectedToday || [];
            const remaining = this.platforms.length - collectedToday.length;
            
            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('💧 CollectClock Daily Reminder')
                .setDescription('Good morning, degen! Time to collect your daily bags!')
                .addFields(
                    {
                        name: '🎰 Available Today',
                        value: `${remaining} platforms ready for collection`,
                        inline: true
                    },
                    {
                        name: '🔥 Your Streak',
                        value: `${userData.streak || 0} days - keep it going!`,
                        inline: true
                    },
                    {
                        name: '🚀 Quick Links',
                        value: '[**CollectClock Web App**](https://jmenichole.github.io/CollectClock/)\nUse `!cc status` to check progress',
                        inline: false
                    }
                )
                .setFooter({ text: 'JustTheTip: Consistent collections = consistent gains!' });

            await user.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Failed to send reminder to ${userId}:`, error);
        }
    }

    // Public methods for external integration
    getClient() {
        return this.client;
    }

    isReady() {
        return this.isInitialized;
    }
}

module.exports = CollectClockIntegration;
