/**
 * BetCollective Support System Integration
 * Add this to your main bot file to enable the support system
 */

const BetCollectiveSupportSystem = require('./supportSystem');

class SupportIntegration {
    constructor(client) {
        this.client = client;
        this.supportSystem = null;
    }

    async initialize() {
        console.log('🎫 Initializing BetCollective Support Integration...');
        
        try {
            // Initialize support system
            this.supportSystem = new BetCollectiveSupportSystem(this.client);
            
            // Set up event listener for guild ready
            this.client.on('ready', async () => {
                console.log('🎫 Bot ready, setting up support systems...');
                
                // Find BetCollective server or use first server for testing
                const targetGuild = this.client.guilds.cache.find(guild => 
                    guild.name.toLowerCase().includes('betcollective') ||
                    guild.name.toLowerCase().includes('bet collective') ||
                    guild.name.toLowerCase().includes('traphouse') // Fallback
                );

                if (targetGuild) {
                    await this.supportSystem.initialize(targetGuild);
                    console.log(`✅ Support system initialized for guild: ${targetGuild.name}`);
                } else {
                    console.log('⚠️ BetCollective guild not found, using first available guild...');
                    const firstGuild = this.client.guilds.cache.first();
                    if (firstGuild) {
                        await this.supportSystem.initialize(firstGuild);
                        console.log(`✅ Support system initialized for guild: ${firstGuild.name}`);
                    }
                }
            });

            // Add support commands
            this.addSupportCommands();
            
            console.log('✅ Support integration initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize support integration:', error);
            return false;
        }
    }

    addSupportCommands() {
        // Add $support command
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            
            const args = message.content.trim().split(/\s+/);
            const command = args[0].toLowerCase();

            // Support command
            if (command === '$support' || command === '$ticket') {
                await this.handleSupportCommand(message, args);
            }
            
            // Support stats command (admin only)
            else if (command === '$supportstats') {
                await this.handleSupportStats(message);
            }
            
            // Dev ping command
            else if (command === '$pingdev') {
                await this.handlePingDev(message, args);
            }
            
            // Wallet info command
            else if (command === '$walletinfo' || command === '$wallets') {
                await this.handleWalletInfo(message);
            }
        });
    }

    async handleSupportCommand(message, args) {
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        
        const supportEmbed = new EmbedBuilder()
            .setTitle('🎫 BetCollective Support')
            .setDescription(`
**Need help?** Our support team is ready to assist you!

**📞 Main Developer:** @jmenichole
**💰 Primary Wallet:** \`8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z\`
**👻 Phantom Wallet:** \`6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB\`

**Quick Commands:**
• \`$support\` - Show this help
• \`$walletinfo\` - View wallet information
• \`$pingdev\` - Contact the main developer

**For detailed support, visit the #create-ticket channel to open a support ticket.**
            `)
            .setColor(0x00ff00)
            .setFooter({ text: 'BetCollective Support • Always here to help' })
            .setTimestamp();

        const supportButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🎫 Create Ticket')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/channels/' + message.guild.id + '/create-ticket'),
                
                new ButtonBuilder()
                    .setCustomId('quick_crypto_help')
                    .setLabel('₿ Crypto Help')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('₿')
            );

        await message.reply({ embeds: [supportEmbed], components: [supportButton] });
    }

    async handleSupportStats(message) {
        // Check if user has admin permissions
        if (!message.member.permissions.has('Administrator')) {
            return await message.reply('❌ You need administrator permissions to view support statistics.');
        }

        if (!this.supportSystem) {
            return await message.reply('❌ Support system not initialized.');
        }

        const stats = this.supportSystem.getTicketStats();
        const { EmbedBuilder } = require('discord.js');

        const statsEmbed = new EmbedBuilder()
            .setTitle('📊 Support System Statistics')
            .setDescription(`
**Ticket Overview:**
• **Total Tickets:** ${stats.total}
• **Open Tickets:** ${stats.open}
• **Closed Tickets:** ${stats.closed}
• **High Priority:** ${stats.highPriority}

**System Status:** ✅ Online
**Main Developer:** @jmenichole
**Primary Wallet:** \`8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z\`
            `)
            .setColor(0x0099ff)
            .setFooter({ text: 'BetCollective Support Stats' })
            .setTimestamp();

        await message.reply({ embeds: [statsEmbed] });
    }

    async handlePingDev(message, args) {
        const reason = args.slice(1).join(' ') || 'No reason provided';
        const { EmbedBuilder } = require('discord.js');

        // Find the main developer
        const mainDev = message.guild.members.cache.find(member => 
            member.user.username === 'jmenichole' ||
            member.user.tag === 'jmenichole' ||
            member.displayName.includes('jmenichole')
        );

        const pingEmbed = new EmbedBuilder()
            .setTitle('🔔 Developer Ping Request')
            .setDescription(`
**User:** ${message.author.tag}
**Channel:** ${message.channel}
**Reason:** ${reason}
**Time:** <t:${Math.floor(Date.now() / 1000)}:F>

**Message Link:** [Jump to Message](${message.url})
            `)
            .setColor(0xff6b6b)
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: 'BetCollective Dev Ping' })
            .setTimestamp();

        if (mainDev) {
            await message.reply({
                content: `🔔 ${mainDev} - Developer assistance requested!`,
                embeds: [pingEmbed]
            });
        } else {
            await message.reply({
                content: `🔔 @jmenichole - Developer assistance requested!`,
                embeds: [pingEmbed]
            });
        }
    }

    async handleWalletInfo(message) {
        const { EmbedBuilder } = require('discord.js');

        const walletEmbed = new EmbedBuilder()
            .setTitle('💰 BetCollective Wallet Information')
            .setDescription(`
**Primary Receiving Wallet:**
\`8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z\`
*Use this address for all deposits to BetCollective*

**Phantom Wallet (User Withdrawals):**
\`6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB\`
*This is the linked Phantom wallet for user withdrawals*

**📊 Wallet Status:**
• **Network:** Solana Mainnet
• **Supported Tokens:** SOL, USDC
• **Last Transfer:** TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E

**💡 Usage:**
• Send SOL/USDC to the primary wallet for deposits
• Withdrawals are processed to the Phantom wallet
• All transactions are logged and monitored

**Need help with crypto?** Use \`$support\` or create a ticket!
            `)
            .setColor(0xf39c12)
            .setFooter({ text: 'BetCollective Wallets • Always verify addresses' })
            .setTimestamp();

        await message.reply({ embeds: [walletEmbed] });
    }
}

module.exports = SupportIntegration;
