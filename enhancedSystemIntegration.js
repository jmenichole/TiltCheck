/**
 * Enhanced System Integration Manager
 * Combines all advanced features with existing TiltCheck system
 */

const TiltCheckMischiefManager = require('./tiltCheckMischiefManager');
const BalanceAlertShoppingSystem = require('./balanceAlertShoppingSystem');
const ProjectManagementSystem = require('./projectManagementSystem');
const VerificationProofSystem = require('./verificationProofSystem');
const { EmbedBuilder } = require('discord.js');

class EnhancedSystemIntegration {
    constructor() {
        this.tiltCheck = new TiltCheckMischiefManager();
        this.shoppingSys = new BalanceAlertShoppingSystem();
        this.projectMgmt = new ProjectManagementSystem();
        this.verification = new VerificationProofSystem();
        this.userSystemPreferences = new Map(); // userId -> enabled systems
    }

    // Main command router for all enhanced features
    async handleEnhancedCommand(message, args) {
        if (args.length === 0) {
            return await this.showSystemOverview(message);
        }

        const subCommand = args[0].toLowerCase();
        const subArgs = args.slice(1);

        switch (subCommand) {
            // Tilt Check & Stop Loss
            case 'tiltcheck':
            case 'tilt':
            case 'stopless':
                return await this.tiltCheck.handleTiltCheck(message, subArgs);

            // Shopping & Balance Alerts
            case 'shopping':
            case 'shop':
            case 'balance':
                return await this.handleShoppingCommands(message, subArgs);

            // Adult Responsibility Vaults
            case 'vault':
            case 'adult':
            case 'responsibility':
                return await this.handleVaultCommands(message, subArgs);

            // Project Management / Scrum
            case 'scrum':
            case 'project':
            case 'sprint':
                return await this.handleProjectCommands(message, subArgs);

            // Verification & Provable Fairness
            case 'verify':
            case 'proof':
            case 'fairness':
                return await this.handleVerificationCommands(message, subArgs);

            // System configuration
            case 'config':
            case 'setup':
            case 'enable':
                return await this.handleSystemConfig(message, subArgs);

            default:
                return await this.showSystemOverview(message);
        }
    }

    // Shopping system command handler
    async handleShoppingCommands(message, args) {
        if (args.length === 0) {
            return await this.shoppingSys.showShoppingList(message);
        }

        const action = args[0].toLowerCase();
        const actionArgs = args.slice(1);

        switch (action) {
            case 'add':
                return await this.shoppingSys.addShoppingItem(message, actionArgs);
            case 'target':
                return await this.shoppingSys.setBalanceTarget(message, actionArgs);
            case 'list':
            case 'show':
                return await this.shoppingSys.showShoppingList(message);
            default:
                return await message.reply(`❌ **Shopping Commands:**
• \`$enhanced shopping add <item> [cost] [priority]\` - Add item to list
• \`$enhanced shopping target <amount> <item>\` - Set balance alert
• \`$enhanced shopping list\` - Show your shopping list

**Example:** \`$enhanced shopping target 500 "Gaming Chair"\``);
        }
    }

    // Vault system command handler
    async handleVaultCommands(message, args) {
        if (args.length === 0) {
            return await this.shoppingSys.showVaultStatus(message);
        }

        const action = args[0].toLowerCase();
        const actionArgs = args.slice(1);

        switch (action) {
            case 'set':
            case 'create':
                return await this.shoppingSys.setAdultVault(message, actionArgs);
            case 'status':
            case 'show':
                return await this.shoppingSys.showVaultStatus(message);
            default:
                return await message.reply(`❌ **Vault Commands:**
• \`$enhanced vault set <percentage> <purpose>\` - Create auto-save vault
• \`$enhanced vault status\` - Show vault details

**Example:** \`$enhanced vault set 25 "Rent Money"\``);
        }
    }

    // Project management command handler
    async handleProjectCommands(message, args) {
        if (args.length === 0) {
            return await this.projectMgmt.showDashboard(message);
        }

        const action = args[0].toLowerCase();
        const actionArgs = args.slice(1);

        switch (action) {
            case 'create':
                return await this.projectMgmt.createProject(message, actionArgs);
            case 'backlog':
                if (actionArgs[0] === 'add') {
                    return await this.projectMgmt.addBacklogItem(message, actionArgs.slice(1));
                }
                break;
            case 'sprint':
                if (actionArgs[0] === 'start') {
                    return await this.projectMgmt.startSprint(message, actionArgs.slice(1));
                }
                break;
            case 'standup':
                return await this.projectMgmt.dailyStandup(message, actionArgs);
            case 'retro':
            case 'retrospective':
                return await this.projectMgmt.sprintRetrospective(message, actionArgs);
            case 'dashboard':
                return await this.projectMgmt.showDashboard(message);
            default:
                return await message.reply(`❌ **Scrum Commands:**
• \`$enhanced scrum create <project_name>\` - Create new project
• \`$enhanced scrum backlog add <points> <description>\` - Add backlog item
• \`$enhanced scrum sprint start [duration]\` - Start new sprint
• \`$enhanced scrum standup <update>\` - Daily standup
• \`$enhanced scrum dashboard\` - Project overview`);
        }
    }

    // Verification system command handler
    async handleVerificationCommands(message, args) {
        if (args.length === 0) {
            return await this.verification.explainProvableFairness(message);
        }

        const action = args[0].toLowerCase();
        const actionArgs = args.slice(1);

        switch (action) {
            case 'seed':
                return await this.verification.generateProvablyFairSeed(message, actionArgs);
            case 'bet':
                return await this.verification.verifyBetResult(message, actionArgs);
            case 'third-party':
            case 'external':
                return await this.verification.requestThirdPartyVerification(message, actionArgs);
            case 'report':
                return await this.verification.generateFairnessReport(message);
            case 'explain':
            case 'help':
                return await this.verification.explainProvableFairness(message);
            default:
                return await message.reply(`❌ **Verification Commands:**
• \`$enhanced verify seed <casino> [game]\` - Generate fair seeds
• \`$enhanced verify bet <game_id> <server_seed> <client_seed> <nonce>\` - Verify bet
• \`$enhanced verify third-party\` - External verification links
• \`$enhanced verify report\` - Your fairness report
• \`$enhanced verify explain\` - Learn about provable fairness`);
        }
    }

    // System configuration handler
    async handleSystemConfig(message, args) {
        const userId = message.author.id;

        if (args.length === 0) {
            return await this.showSystemConfig(message);
        }

        const action = args[0].toLowerCase();
        const system = args[1]?.toLowerCase();

        if (action === 'enable' && system) {
            return await this.enableSystem(message, system);
        } else if (action === 'disable' && system) {
            return await this.disableSystem(message, system);
        }

        return await this.showSystemConfig(message);
    }

    // Show comprehensive system overview
    async showSystemOverview(message) {
        const userId = message.author.id;
        const userPrefs = this.userSystemPreferences.get(userId) || {};

        const embed = new EmbedBuilder()
            .setColor('#6f42c1')
            .setTitle('🚀 Enhanced Discord Bot Systems')
            .setDescription('Comprehensive tools for responsible gambling, productivity, and verification')
            .addFields(
                {
                    name: '🛡️ Real-Time Stop Loss & Tilt Protection',
                    value: `${userPrefs.tiltCheck !== false ? '✅' : '❌'} **Status:** ${userPrefs.tiltCheck !== false ? 'Active' : 'Disabled'}\n• Live gambling session monitoring\n• Automated tilt detection and intervention\n• Stake escalation alerts\n• Loss streak protection\n\n**Commands:** \`$enhanced tiltcheck\``,
                    inline: false
                },
                {
                    name: '🛒 Balance Alert Shopping System',
                    value: `${userPrefs.shopping !== false ? '✅' : '❌'} **Status:** ${userPrefs.shopping !== false ? 'Active' : 'Disabled'}\n• Balance target reminders\n• Shopping list management\n• Smart spending suggestions\n\n**Commands:** \`$enhanced shopping\``,
                    inline: true
                },
                {
                    name: '🏦 Adult Responsibility Auto-Vault',
                    value: `${userPrefs.vault !== false ? '✅' : '❌'} **Status:** ${userPrefs.vault !== false ? 'Active' : 'Disabled'}\n• Automatic win percentage saving\n• Bill money protection\n• Emergency fund building\n\n**Commands:** \`$enhanced vault\``,
                    inline: true
                },
                {
                    name: '📋 Scrum Project Management',
                    value: `${userPrefs.scrum !== false ? '✅' : '❌'} **Status:** ${userPrefs.scrum !== false ? 'Active' : 'Disabled'}\n• Sprint planning and tracking\n• Daily standups\n• Backlog management\n• Team velocity analytics\n\n**Commands:** \`$enhanced scrum\``,
                    inline: true
                },
                {
                    name: '🔍 Provable Fairness Verification',
                    value: `${userPrefs.verification !== false ? '✅' : '❌'} **Status:** ${userPrefs.verification !== false ? 'Active' : 'Disabled'}\n• Cryptographic game verification\n• Third-party proof sources\n• Fairness reporting\n• Educational resources\n\n**Commands:** \`$enhanced verify\``,
                    inline: true
                },
                {
                    name: '⚙️ System Configuration',
                    value: `• \`$enhanced config\` - View/modify settings\n• \`$enhanced config enable <system>\` - Enable features\n• \`$enhanced config disable <system>\` - Disable features`,
                    inline: false
                }
            )
            .setFooter({ text: 'Next-generation gambling responsibility tools • Your financial future, secured' });

        await message.reply({ embeds: [embed] });
    }

    // Show system configuration
    async showSystemConfig(message) {
        const userId = message.author.id;
        const userPrefs = this.userSystemPreferences.get(userId) || {};

        const embed = new EmbedBuilder()
            .setColor('#17a2b8')
            .setTitle('⚙️ System Configuration')
            .setDescription('Enable or disable enhanced features')
            .addFields(
                {
                    name: '🛡️ TiltCheck Stop Loss',
                    value: `**Status:** ${userPrefs.tiltCheck !== false ? '✅ Enabled' : '❌ Disabled'}\n**Function:** Real-time gambling protection`,
                    inline: true
                },
                {
                    name: '🛒 Shopping Alerts',
                    value: `**Status:** ${userPrefs.shopping !== false ? '✅ Enabled' : '❌ Disabled'}\n**Function:** Balance-based reminders`,
                    inline: true
                },
                {
                    name: '🏦 Adult Vaults',
                    value: `**Status:** ${userPrefs.vault !== false ? '✅ Enabled' : '❌ Disabled'}\n**Function:** Automatic responsibility savings`,
                    inline: true
                },
                {
                    name: '📋 Scrum Management',
                    value: `**Status:** ${userPrefs.scrum !== false ? '✅ Enabled' : '❌ Disabled'}\n**Function:** Project organization`,
                    inline: true
                },
                {
                    name: '🔍 Verification Tools',
                    value: `**Status:** ${userPrefs.verification !== false ? '✅ Enabled' : '❌ Disabled'}\n**Function:** Provable fairness checking`,
                    inline: true
                },
                {
                    name: '🎮 Available Commands',
                    value: `• \`$enhanced config enable tiltcheck\`\n• \`$enhanced config enable shopping\`\n• \`$enhanced config enable vault\`\n• \`$enhanced config enable scrum\`\n• \`$enhanced config enable verification\`\n• \`$enhanced config disable <system>\``,
                    inline: false
                }
            )
            .setFooter({ text: 'Customize your experience • Enable what helps you most' });

        await message.reply({ embeds: [embed] });
    }

    // Enable system
    async enableSystem(message, system) {
        const userId = message.author.id;
        
        if (!this.userSystemPreferences.has(userId)) {
            this.userSystemPreferences.set(userId, {});
        }

        const validSystems = ['tiltcheck', 'shopping', 'vault', 'scrum', 'verification'];
        
        if (!validSystems.includes(system)) {
            return await message.reply(`❌ Invalid system. Choose from: ${validSystems.join(', ')}`);
        }

        this.userSystemPreferences.get(userId)[system] = true;

        const systemNames = {
            tiltcheck: 'TiltCheck Stop Loss',
            shopping: 'Shopping Alerts',
            vault: 'Adult Vaults',
            scrum: 'Scrum Management',
            verification: 'Verification Tools'
        };

        await message.reply(`✅ **${systemNames[system]}** has been enabled! Use \`$enhanced ${system}\` to get started.`);
    }

    // Disable system
    async disableSystem(message, system) {
        const userId = message.author.id;
        
        if (!this.userSystemPreferences.has(userId)) {
            this.userSystemPreferences.set(userId, {});
        }

        this.userSystemPreferences.get(userId)[system] = false;

        const systemNames = {
            tiltcheck: 'TiltCheck Stop Loss',
            shopping: 'Shopping Alerts', 
            vault: 'Adult Vaults',
            scrum: 'Scrum Management',
            verification: 'Verification Tools'
        };

        await message.reply(`❌ **${systemNames[system]}** has been disabled.`);
    }

    // Integration with existing gambling win processing
    async processGamblingWin(userId, winAmount, cryptoManager) {
        const userPrefs = this.userSystemPreferences.get(userId) || {};
        
        let response = {};

        // Process adult vault if enabled
        if (userPrefs.vault !== false) {
            response.vaultResult = await this.shoppingSys.processAutoVault(userId, winAmount);
        }

        // Check balance alerts if enabled
        if (userPrefs.shopping !== false && cryptoManager) {
            const currentBalance = await cryptoManager.getBalance(userId);
            response.balanceAlerts = await this.shoppingSys.checkBalanceAlerts(userId, currentBalance, cryptoManager);
        }

        return response;
    }

    // Integration with TiltCheck for comprehensive monitoring
    async enhancedTiltCheck(userId, betAmount, outcome, session) {
        const userPrefs = this.userSystemPreferences.get(userId) || {};
        
        if (userPrefs.tiltcheck === false) {
            return null; // TiltCheck disabled
        }

        // Enhanced tilt detection with all systems
        const tiltResult = await this.tiltCheck.analyzeTiltPatterns(null, session, {
            stake: betAmount,
            outcome: outcome,
            time: new Date()
        });

        return tiltResult;
    }
}

module.exports = EnhancedSystemIntegration;
