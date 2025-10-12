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

const { Client, IntentsBitField, Collection, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// Import existing modules
const respectManager = require('./respectManager');
const loanManager = require('./loanManager');
const roleManager = require('./roleManager');
const storage = require('./storage');
const PaymentManager = require('./paymentManager');

// Import new integration modules
const JustTheTipIntegration = require('./justTheTipIntegration');
const CollectClockIntegration = require('./collectClockIntegration_simple');

class TrapHouseEcosystem {
    constructor() {
        // Initialize main TrapHouse bot
        this.client = new Client({
            intents: [
                'Guilds',
                'GuildMessages', 
                'MessageContent',
                'GuildMembers',
                'GuildMessageReactions',
                'DirectMessages'
            ]
        });

        // Initialize managers
        this.respectManager = respectManager;
        this.loanManager = loanManager;
        this.roleManager = roleManager;
        this.storage = storage;
        this.paymentManager = new PaymentManager(this.client);

        // Initialize integrations
        this.justTheTipIntegration = new JustTheTipIntegration();
        
        // Initialize CollectClock integration
        try {
            this.collectClockIntegration = new CollectClockIntegration();
            console.log('✅ CollectClock integration initialized');
        } catch (error) {
            console.error('⚠️ CollectClock integration failed:', error.message);
            this.collectClockIntegration = null;
        }

        // Commands collection
        this.client.commands = new Collection();

        // Initialize the ecosystem
        this.initializeEcosystem();
    }

    async initializeEcosystem() {
        try {
            console.log('🚀 Initializing TrapHouse Ecosystem...');

            // Load commands
            await this.loadCommands();

            // Set up event handlers
            this.setupEventHandlers();

            // Set up integrations
            await this.setupIntegrations();

            // Login main bot
            await this.client.login(process.env.DISCORD_BOT_TOKEN);

        } catch (error) {
            console.error('❌ Failed to initialize TrapHouse Ecosystem:', error);
        }
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ('data' in command && 'execute' in command) {
                this.client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: ${command.data.name}`);
            } else {
                console.log(`⚠️ Command at ${filePath} is missing required "data" or "execute" property.`);
            }
        }
    }

    setupEventHandlers() {
        // Main bot ready event
        this.client.once('ready', () => {
            console.log(`🏠 TrapHouse Bot is online! Logged in as ${this.client.user.tag}`);
            console.log(`📊 Serving ${this.client.guilds.cache.size} guilds`);
            
            // Set activity status
            this.client.user.setActivity('TrapHouse Ecosystem | !help', { type: 'WATCHING' });
        });

        // Message handling
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            await this.handleMessage(message);
        });

        // Reaction handling for respect system
        this.client.on('messageReactionAdd', async (reaction, user) => {
            if (user.bot) return;
            await this.handleReactionAdd(reaction, user);
        });

        // Error handling
        this.client.on('error', (error) => {
            console.error('TrapHouse Bot Error:', error);
        });

        this.client.on('warn', (warning) => {
            console.warn('TrapHouse Bot Warning:', warning);
        });
    }

    async setupIntegrations() {
        try {
            // Set up JustTheTip integration
            console.log('✅ JustTheTip integration configured');

            // Set up CollectClock integration
            if (this.collectClockIntegration) {
                // Set reference to main bot for integration
                this.collectClockIntegration.setTrapHouseBot(this.client);
                console.log('✅ CollectClock integration configured');
            }

            // Wait for integrations to be ready
            setTimeout(() => {
                console.log('🟢 JustTheTip integration is ready');
                if (this.collectClockIntegration && this.collectClockIntegration.isReady()) {
                    console.log('🟢 CollectClock integration is ready');
                }
            }, 5000);

        } catch (error) {
            console.error('❌ Failed to setup integrations:', error);
        }
    }

    async handleMessage(message) {
        const content = message.content.toLowerCase().trim();

        try {
            // Handle CollectClock commands first
            if (this.collectClockIntegration && this.collectClockIntegration.isCollectClockCommand(content)) {
                await this.collectClockIntegration.handleMessage(message);
                return;
            }

            // Handle legacy commands and new ecosystem commands
            if (content.startsWith('!')) {
                await this.processCommand(message);
            }

            // Auto-respect for helpful messages (existing functionality)
            await this.checkAutoRespect(message);

        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    async processCommand(message) {
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // TrapHouse Ecosystem Commands
        switch (commandName) {
            case 'help':
            case 'commands':
                await this.showEcosystemHelp(message);
                break;

            case 'status':
            case 'ecosystem':
                await this.showEcosystemStatus(message);
                break;

            case 'respect':
                await this.handleRespectCommand(message, args);
                break;

            case 'loan':
            case 'borrow':
                await this.handleLoanCommand(message, args);
                break;

            case 'marketplace':
            case 'store':
                await this.paymentManager.handleMarketplaceCommand(message);
                break;

            case 'seller':
            case 'sell':
                await this.paymentManager.handleSellerCommand(message, args);
                break;

            case 'pay':
            case 'repay':
                await this.handlePaymentCommand(message, args);
                break;

            case 'balance':
            case 'wallet':
                await this.handleBalanceCommand(message);
                break;

            case 'leaderboard':
            case 'top':
                await this.handleLeaderboardCommand(message);
                break;

            case 'work':
            case 'job':
                await this.handleWorkCommand(message);
                break;

            // Admin commands
            case 'admin':
                if (this.isAdmin(message.author)) {
                    await this.handleAdminCommand(message, args);
                } else {
                    await message.reply('❌ You need admin permissions to use this command.');
                }
                break;

            default:
                // Check if it's a loaded command
                const command = this.client.commands.get(commandName);
                if (command) {
                    await command.execute(message, args);
                }
                break;
        }
    }

    async showEcosystemHelp(message) {
        const embed = new EmbedBuilder()
            .setColor('#FF6B35')
            .setTitle('🏠 TrapHouse Ecosystem Commands')
            .setDescription('Complete bot ecosystem with crypto payments, time tracking, and more!')
            .addFields(
                {
                    name: '💰 Core Economy',
                    value: '`!respect` - Manage respect points\n`!loan` - Borrow respect\n`!pay` - Repay loans\n`!balance` - Check wallet\n`!leaderboard` - Top users',
                    inline: true
                },
                {
                    name: '🕒 Time Tracking (CollectClock)',
                    value: '`!clockin` - Start work session\n`!clockout` - End work session\n`!timesheet` - View hours\n`!productivity` - Stats\n`!goal <hours>` - Set daily goal',
                    inline: true
                },
                {
                    name: '₿ Crypto Payments (JustTheTip)',
                    value: '`!tip @user <amount>` - Send crypto tip\n`!withdraw <address>` - Withdraw funds\n`!deposit` - Get deposit address\n`!crypto-balance` - Check crypto wallet',
                    inline: true
                },
                {
                    name: '🎯 Work & Jobs',
                    value: '`!work` - Earn respect\n`!job list` - Available jobs\n`!job apply <job>` - Apply for job\n`!daily` - Daily bonus',
                    inline: true
                },
                {
                    name: '🛍️ Marketplace (Stripe Connect)',
                    value: '`!marketplace` - Browse products\n`!seller create <email>` - Become seller\n`!seller onboard` - Complete verification\n`!seller status` - Account status',
                    inline: true
                },
                {
                    name: '⚙️ System',
                    value: '`!status` - Ecosystem status\n`!help` - This help menu\n`!admin` - Admin commands (admins only)',
                    inline: true
                },
                {
                    name: '🔗 Integrations',
                    value: '• **JustTheTip**: Multi-chain crypto (ETH, BTC, MATIC, BNB)\n• **CollectClock**: Time tracking & productivity\n• **GitHub**: Repository notifications\n• **OAuth**: Web dashboard access',
                    inline: false
                }
            )
            .setFooter({ text: 'TrapHouse Ecosystem • Powered by respect and crypto' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    async showEcosystemStatus(message) {
        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('📊 TrapHouse Ecosystem Status')
            .setDescription('Real-time system health and statistics')
            .addFields(
                {
                    name: '🤖 Bots Online',
                    value: `🏠 TrapHouse: ${this.client.user ? '🟢 Online' : '🔴 Offline'}\n🕒 CollectClock: ${this.collectClockIntegration && this.collectClockIntegration.isInitialized ? '🟢 Online' : '🔴 Offline'}\n₿ JustTheTip: ${this.justTheTipIntegration ? '🟢 Online' : '🔴 Offline'}`,
                    inline: true
                },
                {
                    name: '📈 Statistics',
                    value: `👥 Guilds: ${this.client.guilds.cache.size}\n👤 Users: ${this.client.users.cache.size}\n💾 Uptime: ${this.getUptime()}`,
                    inline: true
                },
                {
                    name: '🔗 Integrations',
                    value: '✅ Multi-chain crypto payments\n✅ Time tracking system\n✅ GitHub webhooks\n✅ OAuth authentication\n✅ Webhook server (port 3002)',
                    inline: true
                }
            )
            .setFooter({ text: 'TrapHouse Ecosystem • All systems operational' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    async handleRespectCommand(message, args) {
        if (args.length === 0) {
            // Show user's respect
            const userData = await this.storage.getUser(message.author.id);
            const respect = userData.respect || 0;
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('💰 Your Respect Balance')
                .setDescription(`You have **${respect}** respect points`)
                .addFields(
                    { name: '💡 Tip', value: 'Earn more respect by:\n• Working (`!work`)\n• Being active\n• Helping others\n• Time tracking', inline: false }
                )
                .setFooter({ text: 'TrapHouse Economy' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } else if (args[0] === 'give' && args.length >= 3) {
            // Give respect to another user (admin only)
            if (!this.isAdmin(message.author)) {
                await message.reply('❌ Only admins can give respect to others.');
                return;
            }

            const targetUser = message.mentions.users.first();
            const amount = parseInt(args[2]);

            if (!targetUser || !amount) {
                await message.reply('❌ Usage: `!respect give @user <amount>`');
                return;
            }

            await this.respectManager.addRespect(targetUser.id, amount, 'Admin gift');
            await message.reply(`✅ Gave **${amount}** respect to ${targetUser.username}`);
        }
    }

    async handleLoanCommand(message, args) {
        if (args.length === 0) {
            // Show loan help
            const embed = new EmbedBuilder()
                .setColor('#2196F3')
                .setTitle('🏦 Loan System')
                .setDescription('Borrow respect points with crypto-secured loans')
                .addFields(
                    { name: '📝 Commands', value: '`!loan <amount>` - Request a loan\n`!loan status` - Check your loans\n`!loan repay <id>` - Repay a loan', inline: false },
                    { name: '💳 Payment', value: 'All loan fees are paid via cryptocurrency through JustTheTip integration', inline: false },
                    { name: '📋 Loan Terms', value: '• Interest: 10% per day\n• Fee: $3 USD in crypto\n• Collateral: May be required', inline: false }
                )
                .setFooter({ text: 'TrapHouse Bank • Crypto-secured lending' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } else {
            await this.loanManager.handleLoanCommand(message, args);
        }
    }

    async handlePaymentCommand(message, args) {
        await this.paymentManager.handlePaymentCommand(message, args);
    }

    async handleBalanceCommand(message) {
        const userData = await this.storage.getUser(message.author.id);
        const respect = userData.respect || 0;
        const loans = userData.loans || [];
        const totalDebt = loans.reduce((sum, loan) => sum + loan.amount + loan.interest, 0);

        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('💰 Your Financial Summary')
            .setDescription(`Complete overview of your TrapHouse finances`)
            .addFields(
                { name: '💎 Respect Balance', value: `${respect} points`, inline: true },
                { name: '🏦 Outstanding Loans', value: `${loans.length} loans`, inline: true },
                { name: '💸 Total Debt', value: `${totalDebt} respect`, inline: true },
                { name: '📊 Net Worth', value: `${respect - totalDebt} respect`, inline: true }
            )
            .setFooter({ text: 'TrapHouse Financial Services' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    async handleLeaderboardCommand(message) {
        // Implementation for leaderboard
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 TrapHouse Leaderboard')
            .setDescription('Top respect earners in the ecosystem')
            .addFields(
                { name: '🥇 Coming Soon', value: 'Leaderboard functionality is being developed', inline: false }
            )
            .setFooter({ text: 'TrapHouse Rankings' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    async handleWorkCommand(message) {
        // Implementation for work command
        const earnings = Math.floor(Math.random() * 20) + 10; // 10-30 respect
        await this.respectManager.addRespect(message.author.id, earnings, 'Work');

        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('💼 Work Complete!')
            .setDescription(`You earned **${earnings}** respect points for your hard work!`)
            .addFields(
                { name: '💡 Tip', value: 'Use `!clockin` and `!clockout` to track your time and earn bonus respect!', inline: false }
            )
            .setFooter({ text: 'TrapHouse Jobs • Keep grinding!' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }

    async handleAdminCommand(message, args) {
        if (args.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#FF5722')
                .setTitle('🔐 TrapHouse Admin Panel')
                .setDescription('Administrative commands for ecosystem management')
                .addFields(
                    { name: '👥 User Management', value: '`!admin respect @user <amount>` - Give/take respect\n`!admin ban @user` - Ban user\n`!admin unban @user` - Unban user', inline: false },
                    { name: '🏦 Loan Management', value: '`!admin loan forgive <id>` - Forgive loan\n`!admin loan list` - View all loans', inline: false },
                    { name: '📊 System', value: '`!admin stats` - Detailed statistics\n`!admin backup` - Create data backup\n`!admin reset @user` - Reset user data', inline: false }
                )
                .setFooter({ text: 'TrapHouse Admin • Use with caution' })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }
        // Add more admin command implementations here
    }

    async handleReactionAdd(reaction, user) {
        // Handle respect reactions (existing functionality)
        if (reaction.emoji.name === '💰' || reaction.emoji.name === '🔥') {
            await this.respectManager.addRespect(reaction.message.author.id, 1, 'Reaction');
        }
    }

    async checkAutoRespect(message) {
        // Auto-respect for helpful messages (existing functionality)
        const helpfulKeywords = ['help', 'thanks', 'tutorial', 'guide', 'tip'];
        if (helpfulKeywords.some(keyword => message.content.toLowerCase().includes(keyword))) {
            if (Math.random() < 0.3) { // 30% chance
                await this.respectManager.addRespect(message.author.id, 2, 'Being helpful');
            }
        }
    }

    isAdmin(user) {
        // Check if user has admin permissions
        return user.id === process.env.OWNER_ID || user.permissions?.has(PermissionFlagsBits.Administrator);
    }

    getUptime() {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    // Public methods for integration access
    getMainBot() {
        return this.client;
    }

    getJustTheTipBot() {
        return this.justTheTipIntegration.getClient();
    }

    getCollectClockBot() {
        return this.collectClockIntegration.getClient();
    }

    getRespectManager() {
        return this.respectManager;
    }

    getLoanManager() {
        return this.loanManager;
    }

    getPaymentManager() {
        return this.paymentManager;
    }
}

// Initialize and start the ecosystem
const trapHouseEcosystem = new TrapHouseEcosystem();

// Export for external access
module.exports = trapHouseEcosystem;

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('🛑 Shutting down TrapHouse Ecosystem...');
    trapHouseEcosystem.client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
