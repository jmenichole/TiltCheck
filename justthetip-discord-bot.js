// JustTheTip Discord Bot Commands - Custom Implementation 
// Enhanced alternative to Collab.Land SmartTag with responsible gaming features

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { JustTheTipTokenSystem } = require('./justthetip-token-system.js');

class JustTheTipBot {
    constructor(client, config) {
        this.client = client;
        this.justTheTip = new JustTheTipTokenSystem(config);
        this.setupCommands();
        this.setupEventListeners();
    }

    setupCommands() {
        const commands = [
            // Balance Command - Enhanced with responsible gaming insights
            new SlashCommandBuilder()
                .setName('jtt-balance')
                .setDescription('🛡️ Check your JustTheTip token account balance and gaming insights'),

            // Send/Tip Command - With responsible gaming protections
            new SlashCommandBuilder()
                .setName('jtt-send')
                .setDescription('💰 Send tokens to another community member')
                .addUserOption(option =>
                    option.setName('recipient')
                        .setDescription('Who to send tokens to')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Amount to send')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('token')
                        .setDescription('Token symbol (e.g. SOL, USDC)')
                        .setRequired(true)),

            // Deposit Command
            new SlashCommandBuilder()
                .setName('jtt-deposit')
                .setDescription('🏦 Get your deposit address to fund your JustTheTip account'),

            // Withdraw Command
            new SlashCommandBuilder()
                .setName('jtt-withdraw')
                .setDescription('💸 Withdraw tokens from your JustTheTip account')
                .addStringOption(option =>
                    option.setName('address')
                        .setDescription('Wallet address to withdraw to')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Amount to withdraw')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('token')
                        .setDescription('Token symbol')
                        .setRequired(true)),

            // Raindrop/Giveaway Command (Admin only)
            new SlashCommandBuilder()
                .setName('tilttag-raindrop')
                .setDescription('🌧️ Create a token raindrop giveaway (Admin only)')
                .addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Total amount for the raindrop')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('token')
                        .setDescription('Token symbol')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('duration')
                        .setDescription('Duration in minutes')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('max_entries')
                        .setDescription('Maximum number of participants')
                        .setRequired(false)),

            // NFT Commands
            new SlashCommandBuilder()
                .setName('tilttag-nft-balance')
                .setDescription('🖼️ Check your NFT balance including DegenTrust verification'),

            new SlashCommandBuilder()
                .setName('tilttag-send-nft')
                .setDescription('🎨 Send an NFT to another community member')
                .addUserOption(option =>
                    option.setName('recipient')
                        .setDescription('Who to send the NFT to')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('collection')
                        .setDescription('NFT collection address')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('token_id')
                        .setDescription('NFT token ID')
                        .setRequired(true)),

            // Tokens Command - List supported tokens
            new SlashCommandBuilder()
                .setName('tilttag-tokens')
                .setDescription('📋 List supported tokens in this community'),

            // Help Command
            new SlashCommandBuilder()
                .setName('tilttag-help')
                .setDescription('❓ Get help with TiltTag commands and responsible gaming features'),

            // Responsible Gaming Command
            new SlashCommandBuilder()
                .setName('tilttag-limits')
                .setDescription('🛡️ View/modify your responsible gaming limits')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action to take')
                        .setRequired(true)
                        .addChoices(
                            { name: 'View Current Limits', value: 'view' },
                            { name: 'Set Daily Tip Limit', value: 'set_daily' },
                            { name: 'Set Weekly Receive Limit', value: 'set_weekly' },
                            { name: 'Reset to Defaults', value: 'reset' }
                        ))
                .addNumberOption(option =>
                    option.setName('limit')
                        .setDescription('New limit amount (if setting limits)')
                        .setRequired(false)),

            // Statistics Command
            new SlashCommandBuilder()
                .setName('tilttag-stats')
            // Verification NFT Commands
            new SlashCommandBuilder()
                .setName('jtt-verify')
                .setDescription('✅ Get your verification NFT for TiltCheck access')
                .addStringOption(option =>
                    option.setName('level')
                        .setDescription('Verification level (basic, premium, enterprise)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Basic', value: 'basic' },
                            { name: 'Premium', value: 'premium' },
                            { name: 'Enterprise', value: 'enterprise' }
                        )),
            new SlashCommandBuilder()
                .setName('jtt-check-verification')
                .setDescription('🔍 Check your verification NFT status')                .setDescription('📊 View community tipping statistics and insights')
        ];

        // Register commands
        commands.forEach(command => {
            this.client.application?.commands.create(command);
        });
    }

    setupEventListeners() {
        this.client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const { commandName } = interaction;

            try {
                switch (commandName) {
                    case 'tilttag-balance':
                        await this.handleBalance(interaction);
                        break;
                    case 'tilttag-send':
                        await this.handleSend(interaction);
                        break;
                    case 'tilttag-deposit':
                        await this.handleDeposit(interaction);
                        break;
                    case 'tilttag-withdraw':
                        await this.handleWithdraw(interaction);
                        break;
                    case 'tilttag-raindrop':
                        await this.handleRaindrop(interaction);
                        break;
                    case 'tilttag-nft-balance':
                        await this.handleNFTBalance(interaction);
                        break;
                    case 'tilttag-send-nft':
                        await this.handleSendNFT(interaction);
                        break;
                    case 'tilttag-tokens':
                        await this.handleTokens(interaction);
                        break;
                    case 'tilttag-help':
                        await this.handleHelp(interaction);
                        break;
                    case 'tilttag-limits':
                        await this.handleLimits(interaction);
                        break;
                    case 'tilttag-stats':
                case 'jtt-verify':
                    await this.handleVerify(interaction);
                    break;
                case 'jtt-check-verification':
                    await this.handleCheckVerification(interaction);
                    break;            // Verification NFT Commands
            new SlashCommandBuilder()
                .setName('jtt-verify')
                .setDescription('✅ Get your verification NFT for TiltCheck access')
                .addStringOption(option =>
                    option.setName('level')
                        .setDescription('Verification level (basic, premium, enterprise)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Basic', value: 'basic' },
                            { name: 'Premium', value: 'premium' },
                            { name: 'Enterprise', value: 'enterprise' }
                        )),
            new SlashCommandBuilder()
                .setName('jtt-check-verification')
                .setDescription('🔍 Check your verification NFT status')                        await this.handleStats(interaction);
                        break;
                }
            } catch (error) {
                console.error('Command error:', error);
                await interaction.reply({ 
                    content: '❌ An error occurred. Please try again or contact support.', 
                    ephemeral: true 
                });
            }
        });

        // React to raindrop events
        this.client.on('messageReactionAdd', async (reaction, user) => {
            if (user.bot) return;
            if (reaction.emoji.name === '🌧️') {
                await this.handleRaindropEntry(reaction, user);
            }
        });
    }

    async handleBalance(interaction) {
        const result = await this.tiltTag.getUserBalance(interaction.user.id);
        
        if (result.success) {
            await interaction.reply({ embeds: [result.embed] });
            
            // Play sound effect if user has it enabled
            if (result.playSound !== false) {
                await this.playTiltSound(interaction.channel, 'balance_check');
            }
        } else {
            await interaction.reply({ 
                content: `❌ ${result.error}`, 
                ephemeral: true 
            });
        }
    }

    async handleSend(interaction) {
        const recipient = interaction.options.getUser('recipient');
        const amount = interaction.options.getNumber('amount');
        const token = interaction.options.getString('token').toUpperCase();

        if (recipient.bot) {
            await interaction.reply({ 
                content: '❌ Cannot send tokens to bots.', 
                ephemeral: true 
            });
            return;
        }

        if (recipient.id === interaction.user.id) {
            await interaction.reply({ 
                content: '❌ Cannot send tokens to yourself.', 
                ephemeral: true 
            });
            return;
        }

        const result = await this.tiltTag.tipUser(
            interaction.user.id, 
            recipient.id, 
            amount, 
            token, 
            interaction.channel.id
        );

        if (result.success) {
            await interaction.reply({ embeds: [result.embed] });
            
            // Play blackjackson's redeem sound
            if (result.playSound) {
                await this.playTiltSound(interaction.channel, 'tip_sent');
            }

            // Send notification to recipient
            try {
                const recipientEmbed = new EmbedBuilder()
                    .setColor('#10B981')
                    .setTitle('💰 You Received a Tip!')
                    .setDescription(`**${interaction.user.username}** sent you **${amount} ${token}**!`)
                    .addFields([
                        { name: '🏦 Check Balance', value: 'Use `/tilttag-balance` to see your updated balance', inline: false }
                    ])
                    .setFooter({ text: 'TiltTag • Responsible Gaming Community' });

                await recipient.send({ embeds: [recipientEmbed] });
            } catch (dmError) {
                // Couldn't send DM, that's okay
            }
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#EF4444')
                .setTitle('❌ Transaction Failed')
                .setDescription(result.error)
                .setFooter({ text: 'TiltTag • Responsible Gaming Protection' });

            if (result.supportMessage) {
                errorEmbed.addFields([
                    { name: '🛡️ Support Resources', value: result.supportMessage, inline: false }
                ]);
            }

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }

    async handleDeposit(interaction) {
        const result = await this.tiltTag.getUserBalance(interaction.user.id);
        
        if (result.success && result.account) {
            const depositEmbed = new EmbedBuilder()
                .setColor('#60A5FA')
                .setTitle('🏦 TiltTag Deposit Address')
                .setDescription('Send tokens to this address to fund your TiltTag account')
                .addFields([
                    { 
                        name: '🔗 Wallet Address', 
                        value: `\`${result.account.publicKey}\``, 
                        inline: false 
                    },
                    { 
                        name: '⚠️ Important', 
                        value: 'Only send supported tokens to this address. Unsupported tokens may be lost.', 
                        inline: false 
                    },
                    { 
                        name: '🛡️ Responsible Gaming', 
                        value: 'Remember to only deposit what you can afford to tip/trade.', 
                        inline: false 
                    }
                ])
                .setFooter({ text: 'TiltTag Deposit • Secure & On-Chain' });

            await interaction.reply({ embeds: [depositEmbed], ephemeral: true });
        } else {
            await interaction.reply({ 
                content: '❌ Error getting deposit address. Please try again.', 
                ephemeral: true 
            });
        }
    }

    async handleWithdraw(interaction) {
        const address = interaction.options.getString('address');
        const amount = interaction.options.getNumber('amount');
        const token = interaction.options.getString('token').toUpperCase();

        // Validate Solana address format
        try {
            new PublicKey(address);
        } catch {
            await interaction.reply({ 
                content: '❌ Invalid Solana wallet address format.', 
                ephemeral: true 
            });
            return;
        }

        const result = await this.tiltTag.withdrawTokens(
            interaction.user.id, 
            address, 
            amount, 
            token
        );

        if (result.success) {
            const withdrawEmbed = new EmbedBuilder()
                .setColor('#F59E0B')
                .setTitle('💸 Withdrawal Initiated')
                .setDescription(`Your ${amount} ${token} withdrawal is being processed`)
                .addFields([
                    { name: '🔗 Transaction', value: `[View on Explorer](https://solscan.io/tx/${result.signature})`, inline: true },
                    { name: '📍 Destination', value: `\`${address}\``, inline: false }
                ])
                .setFooter({ text: 'TiltTag Withdrawal • Processing...' });

            await interaction.reply({ embeds: [withdrawEmbed] });

            // Play blackjackson's redeem sound for withdrawals
            await this.playTiltSound(interaction.channel, 'withdrawal');
        } else {
            await interaction.reply({ 
                content: `❌ ${result.error}`, 
                ephemeral: true 
            });
        }
    }

    async handleHelp(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#8B5CF6')
            .setTitle('🛡️ TiltTag Help - Responsible Gaming Token System')
            .setDescription('TiltTag enables secure, on-chain token tipping and trading with built-in responsible gaming protections.')
            .addFields([
                {
                    name: '💰 Basic Commands',
                    value: `\`/tilttag-balance\` - Check your account balance
\`/tilttag-send @user amount token\` - Send tokens
\`/tilttag-deposit\` - Get deposit address
\`/tilttag-withdraw address amount token\` - Withdraw tokens`,
                    inline: false
                },
                {
                    name: '🎨 NFT Commands',
                    value: `\`/tilttag-nft-balance\` - Check NFT holdings
\`/tilttag-send-nft @user collection token_id\` - Send NFTs
*DegenTrust NFTs provide verification status*`,
                    inline: false
                },
                {
                    name: '🛡️ Responsible Gaming',
                    value: `\`/tilttag-limits\` - View/modify spending limits
Daily tip limits protect against excessive sending
Weekly receive limits prevent accumulation issues
All transactions are monitored for safety`,
                    inline: false
                },
                {
                    name: '🌧️ Community Features',
                    value: `\`/tilttag-raindrop\` - Create giveaways (Admin only)
\`/tilttag-stats\` - Community statistics
            // Verification NFT Commands
            new SlashCommandBuilder()
                .setName('jtt-verify')
                .setDescription('✅ Get your verification NFT for TiltCheck access')
                .addStringOption(option =>
                    option.setName('level')
                        .setDescription('Verification level (basic, premium, enterprise)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Basic', value: 'basic' },
                            { name: 'Premium', value: 'premium' },
                            { name: 'Enterprise', value: 'enterprise' }
                        )),
            new SlashCommandBuilder()
                .setName('jtt-check-verification')
                .setDescription('🔍 Check your verification NFT status')\`/tilttag-tokens\` - Supported token list`,
                    inline: false
                },
                {
                    name: '🎵 Audio Features',
                    value: 'Sound effects by blackjackson enhance the experience!\nCustomize sound preferences in your profile.',
                    inline: false
                },
                {
                    name: '🔗 Integration',
                    value: 'Links with TiltCheck community forum and DegenTrust verification system for enhanced trust and features.',
                    inline: false
                }
            ])
            .setFooter({ text: 'TiltTag • Building Responsible Gaming Communities' });

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }

    async playTiltSound(channel, soundType) {
        // Integration with existing sound system
        try {
            const soundMessage = {
                'balance_check': '🎵 *Balance check sound by blackjackson*',
                'tip_sent': '🎵 *Tip sent - redeem alert by blackjackson*',
                'withdrawal': '🎵 *Withdrawal confirmed - redeem alert by blackjackson*',
                'raindrop_start': '🎵 *Raindrop started - community sound*',
                'nft_transfer': '🎵 *NFT transferred - verification sound*'
            };

            if (soundMessage[soundType]) {
                const tempMessage = await channel.send(soundMessage[soundType]);
                setTimeout(() => tempMessage.delete().catch(() => {}), 3000);
            }
        } catch (error) {
            // Sound is optional, don't fail on this
            console.log('Sound playback failed:', error.message);
        }
    }

    // Additional handlers for NFT, raindrop, etc. commands would go here...
}

module.exports = { JustTheTipBot };