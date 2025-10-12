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
 * BetCollective Support System
 * Comprehensive ticket management with dev pinging and wallet integration
 */

const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

class BetCollectiveSupportSystem {
    constructor(client) {
        this.client = client;
        this.activeTickets = new Map();
        this.supportConfig = {
            // Main developer and support staff
            mainDev: 'jmenichole', // @jmenichole
            supportTeam: ['jmenichole'], // Add more support staff user IDs here
            
            // Server configuration
            guildId: null, // Will be set when initialized
            
            // Channel configuration
            supportCategoryId: null,
            ticketLogChannelId: null,
            supportChannelId: null,
            
            // Wallet configuration - Updated with actual receiving address
            receivingWallet: '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z', // Primary receiving wallet
            phantomWallet: '6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB', // Phantom wallet for user transfers
            
            // Support categories
            ticketCategories: [
                { id: 'payment', name: '💰 Payment Issues', emoji: '💰' },
                { id: 'technical', name: '🔧 Technical Support', emoji: '🔧' },
                { id: 'betting', name: '🎲 Betting Questions', emoji: '🎲' },
                { id: 'crypto', name: '₿ Crypto Support', emoji: '₿' },
                { id: 'general', name: '❓ General Help', emoji: '❓' },
                { id: 'bug', name: '🐛 Bug Report', emoji: '🐛' }
            ]
        };
    }

    async initialize(guild) {
        console.log('🎫 Initializing BetCollective Support System...');
        
        this.supportConfig.guildId = guild.id;
        
        try {
            // Create support category if it doesn't exist
            await this.createSupportInfrastructure(guild);
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('✅ Support system initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize support system:', error);
            return false;
        }
    }

    async createSupportInfrastructure(guild) {
        // Create support category
        let supportCategory = guild.channels.cache.find(c => 
            c.name === 'SUPPORT SYSTEM' && c.type === ChannelType.GuildCategory
        );
        
        if (!supportCategory) {
            supportCategory = await guild.channels.create({
                name: '🎫 SUPPORT SYSTEM',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [PermissionFlagsBits.ViewChannel],
                        deny: [PermissionFlagsBits.SendMessages]
                    }
                ]
            });
            console.log('📁 Created support category');
        }
        
        this.supportConfig.supportCategoryId = supportCategory.id;

        // Create main support channel
        let supportChannel = guild.channels.cache.find(c => c.name === 'create-ticket');
        if (!supportChannel) {
            supportChannel = await guild.channels.create({
                name: '🎫-create-ticket',
                type: ChannelType.GuildText,
                parent: supportCategory.id,
                topic: 'Click the button below to create a support ticket',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                        deny: [PermissionFlagsBits.SendMessages]
                    }
                ]
            });
            console.log('🎫 Created main support channel');
        }
        
        this.supportConfig.supportChannelId = supportChannel.id;

        // Create ticket log channel
        let logChannel = guild.channels.cache.find(c => c.name === 'ticket-logs');
        if (!logChannel) {
            logChannel = await guild.channels.create({
                name: '📋-ticket-logs',
                type: ChannelType.GuildText,
                parent: supportCategory.id,
                topic: 'Support ticket logs and analytics',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });
            console.log('📋 Created ticket log channel');
        }
        
        this.supportConfig.ticketLogChannelId = logChannel.id;

        // Send support interface
        await this.sendSupportInterface(supportChannel);
    }

    async sendSupportInterface(channel) {
        // Clear existing messages
        const messages = await channel.messages.fetch({ limit: 100 });
        await channel.bulkDelete(messages);

        const supportEmbed = new EmbedBuilder()
            .setTitle('🎫 BetCollective Support System')
            .setDescription(`
**Welcome to BetCollective Support!**

Our support team is here to help you with any questions or issues you may have.

**📞 Main Developer:** @${this.supportConfig.mainDev}
**💰 Primary Wallet:** \`${this.supportConfig.receivingWallet}\`
**👻 Phantom Wallet:** \`${this.supportConfig.phantomWallet}\`

**Support Categories:**
${this.supportConfig.ticketCategories.map(cat => `${cat.emoji} ${cat.name}`).join('\n')}

**⏰ Response Times:**
• High Priority: Within 1 hour
• Normal Priority: Within 4 hours
• Low Priority: Within 24 hours

Click the button below to create a support ticket!
            `)
            .setColor(0x00ff00)
            .setThumbnail('https://cdn.discordapp.com/attachments/123456789/betcollective-logo.png')
            .setFooter({ 
                text: 'BetCollective Support • Click Create Ticket to get started',
                iconURL: 'https://cdn.discordapp.com/attachments/123456789/support-icon.png'
            })
            .setTimestamp();

        const ticketButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_support_ticket')
                    .setLabel('🎫 Create Support Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫'),
                
                new ButtonBuilder()
                    .setCustomId('support_faq')
                    .setLabel('❓ View FAQ')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓'),
                
                new ButtonBuilder()
                    .setCustomId('crypto_help')
                    .setLabel('₿ Crypto Guide')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('₿')
            );

        await channel.send({ embeds: [supportEmbed], components: [ticketButton] });
        console.log('🎫 Support interface sent successfully');
    }

    setupEventListeners() {
        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

            try {
                // Handle ticket creation
                if (interaction.customId === 'create_support_ticket') {
                    await this.handleTicketCreation(interaction);
                }
                
                // Handle FAQ
                else if (interaction.customId === 'support_faq') {
                    await this.showFAQ(interaction);
                }
                
                // Handle crypto guide
                else if (interaction.customId === 'crypto_help') {
                    await this.showCryptoGuide(interaction);
                }
                
                // Handle ticket category selection
                else if (interaction.customId === 'ticket_category_select') {
                    await this.handleCategorySelection(interaction);
                }
                
                // Handle ticket modal submission
                else if (interaction.customId === 'ticket_details_modal') {
                    await this.handleTicketModalSubmission(interaction);
                }
                
                // Handle ticket actions
                else if (interaction.customId.startsWith('ticket_')) {
                    await this.handleTicketAction(interaction);
                }
                
            } catch (error) {
                console.error('❌ Error handling support interaction:', error);
                
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ An error occurred. Please try again or contact support.',
                        ephemeral: true
                    });
                }
            }
        });
    }

    async handleTicketCreation(interaction) {
        // Check if user already has an open ticket
        const existingTicket = Array.from(this.activeTickets.values()).find(
            ticket => ticket.userId === interaction.user.id && ticket.status === 'open'
        );

        if (existingTicket) {
            return await interaction.reply({
                content: `❌ You already have an open ticket: <#${existingTicket.channelId}>`,
                ephemeral: true
            });
        }

        // Show category selection
        const categoryEmbed = new EmbedBuilder()
            .setTitle('🎫 Select Support Category')
            .setDescription('Please select the category that best describes your issue:')
            .setColor(0x0099ff);

        const categorySelect = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('category_payment')
                    .setLabel('💰 Payment Issues')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💰'),
                
                new ButtonBuilder()
                    .setCustomId('category_technical')
                    .setLabel('🔧 Technical Support')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔧'),
                
                new ButtonBuilder()
                    .setCustomId('category_crypto')
                    .setLabel('₿ Crypto Support')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('₿')
            );

        const categorySelect2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('category_betting')
                    .setLabel('🎲 Betting Questions')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎲'),
                
                new ButtonBuilder()
                    .setCustomId('category_bug')
                    .setLabel('🐛 Bug Report')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🐛'),
                
                new ButtonBuilder()
                    .setCustomId('category_general')
                    .setLabel('❓ General Help')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓')
            );

        await interaction.reply({
            embeds: [categoryEmbed],
            components: [categorySelect, categorySelect2],
            ephemeral: true
        });
    }

    async handleCategorySelection(interaction) {
        const category = interaction.customId.replace('category_', '');
        const categoryInfo = this.supportConfig.ticketCategories.find(cat => cat.id === category);

        if (!categoryInfo) {
            return await interaction.reply({
                content: '❌ Invalid category selected.',
                ephemeral: true
            });
        }

        // Show ticket details modal
        const modal = new ModalBuilder()
            .setCustomId(`ticket_details_modal_${category}`)
            .setTitle(`${categoryInfo.emoji} ${categoryInfo.name}`);

        const titleInput = new TextInputBuilder()
            .setCustomId('ticket_title')
            .setLabel('Ticket Title')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Brief description of your issue')
            .setRequired(true)
            .setMaxLength(100);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('ticket_description')
            .setLabel('Detailed Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Please provide as much detail as possible about your issue...')
            .setRequired(true)
            .setMaxLength(1000);

        const priorityInput = new TextInputBuilder()
            .setCustomId('ticket_priority')
            .setLabel('Priority Level (low/normal/high)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('normal')
            .setRequired(false)
            .setMaxLength(10);

        const row1 = new ActionRowBuilder().addComponents(titleInput);
        const row2 = new ActionRowBuilder().addComponents(descriptionInput);
        const row3 = new ActionRowBuilder().addComponents(priorityInput);

        modal.addComponents(row1, row2, row3);

        await interaction.showModal(modal);
    }

    async handleTicketModalSubmission(interaction) {
        const category = interaction.customId.split('_').pop();
        const title = interaction.fields.getTextInputValue('ticket_title');
        const description = interaction.fields.getTextInputValue('ticket_description');
        const priority = interaction.fields.getTextInputValue('ticket_priority') || 'normal';

        await interaction.deferReply({ ephemeral: true });

        try {
            const ticket = await this.createTicketChannel(interaction, category, title, description, priority);
            
            await interaction.editReply({
                content: `✅ Ticket created successfully! <#${ticket.channelId}>\n\n🔔 **@${this.supportConfig.mainDev}** has been notified.`
            });

        } catch (error) {
            console.error('❌ Error creating ticket:', error);
            await interaction.editReply({
                content: '❌ Failed to create ticket. Please try again or contact support directly.'
            });
        }
    }

    async createTicketChannel(interaction, category, title, description, priority) {
        const guild = interaction.guild;
        const user = interaction.user;
        const ticketId = Date.now().toString();
        
        const categoryInfo = this.supportConfig.ticketCategories.find(cat => cat.id === category);
        
        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}-${ticketId.slice(-6)}`,
            type: ChannelType.GuildText,
            parent: this.supportConfig.supportCategoryId,
            topic: `${categoryInfo.emoji} ${title} | Priority: ${priority} | User: ${user.tag}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                }
            ]
        });

        // Create ticket data
        const ticket = {
            id: ticketId,
            channelId: ticketChannel.id,
            userId: user.id,
            category: category,
            title: title,
            description: description,
            priority: priority,
            status: 'open',
            createdAt: new Date(),
            assignedTo: null
        };

        this.activeTickets.set(ticketId, ticket);

        // Send initial ticket message
        const ticketEmbed = new EmbedBuilder()
            .setTitle(`${categoryInfo.emoji} Support Ticket #${ticketId.slice(-6)}`)
            .setDescription(`
**Title:** ${title}
**Category:** ${categoryInfo.name}
**Priority:** ${priority.toUpperCase()}
**User:** ${user.tag}

**Description:**
${description}

**Wallet Information:**
• **Primary Receiving:** \`${this.supportConfig.receivingWallet}\`
• **Phantom Wallet:** \`${this.supportConfig.phantomWallet}\`
            `)
            .setColor(this.getPriorityColor(priority))
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ text: `Ticket ID: ${ticketId}` })
            .setTimestamp();

        const ticketActions = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_claim_${ticketId}`)
                    .setLabel('🙋‍♂️ Claim Ticket')
                    .setStyle(ButtonStyle.Success),
                
                new ButtonBuilder()
                    .setCustomId(`ticket_priority_${ticketId}`)
                    .setLabel('⚡ Change Priority')
                    .setStyle(ButtonStyle.Secondary),
                
                new ButtonBuilder()
                    .setCustomId(`ticket_close_${ticketId}`)
                    .setLabel('🔒 Close Ticket')
                    .setStyle(ButtonStyle.Danger)
            );

        const ticketMessage = await ticketChannel.send({
            content: `👋 Hello ${user}!\n\n🔔 **@${this.supportConfig.mainDev}** - New ${priority} priority ${categoryInfo.name} ticket created!\n\n**Our support team will assist you shortly.**`,
            embeds: [ticketEmbed],
            components: [ticketActions]
        });

        // Pin the ticket message
        await ticketMessage.pin();

        // Log ticket creation
        await this.logTicketAction(ticket, 'created', user);

        // Ping main developer
        await this.pingDeveloper(ticketChannel, ticket, user);

        return ticket;
    }

    async pingDeveloper(channel, ticket, user) {
        const guild = channel.guild;
        
        // Try to find the main developer by username
        const mainDev = guild.members.cache.find(member => 
            member.user.username === this.supportConfig.mainDev ||
            member.user.tag === this.supportConfig.mainDev ||
            member.displayName === this.supportConfig.mainDev
        );

        if (mainDev) {
            const pingEmbed = new EmbedBuilder()
                .setTitle('🚨 New Support Ticket Alert')
                .setDescription(`
**Developer:** ${mainDev}
**User:** ${user.tag}
**Category:** ${ticket.category}
**Priority:** ${ticket.priority.toUpperCase()}
**Title:** ${ticket.title}

**Action Required:** Please review and claim this ticket.
                `)
                .setColor(0xff6b6b)
                .setTimestamp();

            await channel.send({
                content: `🔔 ${mainDev}`,
                embeds: [pingEmbed]
            });
        } else {
            // Fallback ping by username
            await channel.send(`🔔 @${this.supportConfig.mainDev} - New support ticket created!`);
        }
    }

    getPriorityColor(priority) {
        switch (priority.toLowerCase()) {
            case 'high': return 0xff4757;
            case 'normal': return 0x3742fa;
            case 'low': return 0x2ed573;
            default: return 0x3742fa;
        }
    }

    async showFAQ(interaction) {
        const faqEmbed = new EmbedBuilder()
            .setTitle('❓ Frequently Asked Questions')
            .setDescription(`
**💰 Payment & Crypto Questions:**
• **Q: How do I deposit crypto?**
  A: Send SOL or USDC to: \`${this.supportConfig.receivingWallet}\`

• **Q: Where is my Phantom wallet?**
  A: Your linked Phantom: \`${this.supportConfig.phantomWallet}\`

• **Q: How long do withdrawals take?**
  A: Crypto withdrawals are usually processed within 1-10 minutes.

**🎲 Betting Questions:**
• **Q: What's the minimum bet?**
  A: Minimum bet varies by game, typically 0.001 SOL or $1 USDC.

• **Q: How do I check my bet history?**
  A: Use the \`$history\` command in any channel.

**🔧 Technical Issues:**
• **Q: Bot not responding?**
  A: Try using commands in the correct channel or restart Discord.

• **Q: Balance not updating?**
  A: Use \`$balance\` to refresh or wait 1-2 minutes for blockchain confirmation.

**Need more help? Create a support ticket!**
            `)
            .setColor(0x0099ff)
            .setFooter({ text: 'BetCollective FAQ • Updated regularly' });

        await interaction.reply({ embeds: [faqEmbed], ephemeral: true });
    }

    async showCryptoGuide(interaction) {
        const cryptoEmbed = new EmbedBuilder()
            .setTitle('₿ Crypto Guide - BetCollective')
            .setDescription(`
**💰 Primary Receiving Wallet:**
\`${this.supportConfig.receivingWallet}\`
*Use this address for deposits to BetCollective*

**👻 Your Phantom Wallet:**
\`${this.supportConfig.phantomWallet}\`
*This is your personal wallet for withdrawals*

**📝 How to Deposit:**
1. Copy the primary receiving wallet address above
2. Send SOL or USDC from your wallet/exchange
3. Wait 1-2 minutes for confirmation
4. Use \`$balance\` to check your balance

**💸 How to Withdraw:**
1. Use \`$withdraw AMOUNT WALLET_ADDRESS\`
2. Or transfer to your Phantom wallet automatically
3. Funds will be sent to your specified address

**🔗 Recent Transaction:**
Transaction ID: \`TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E\`
*Funds have been successfully moved from tip.cc*

**⚠️ Important Notes:**
• Always double-check wallet addresses
• Start with small test amounts
• Save transaction IDs for reference
• Contact support if you need help
            `)
            .setColor(0xf39c12)
            .setFooter({ text: 'BetCollective Crypto Guide • Stay safe!' });

        await interaction.reply({ embeds: [cryptoEmbed], ephemeral: true });
    }

    async logTicketAction(ticket, action, user, details = '') {
        const guild = this.client.guilds.cache.get(this.supportConfig.guildId);
        const logChannel = guild.channels.cache.get(this.supportConfig.ticketLogChannelId);

        if (!logChannel) return;

        const logEmbed = new EmbedBuilder()
            .setTitle(`📋 Ticket ${action.toUpperCase()}`)
            .setDescription(`
**Ticket ID:** ${ticket.id}
**User:** ${user.tag} (${user.id})
**Category:** ${ticket.category}
**Priority:** ${ticket.priority}
**Action:** ${action}
${details ? `**Details:** ${details}` : ''}
            `)
            .setColor(action === 'created' ? 0x00ff00 : action === 'closed' ? 0xff0000 : 0xffff00)
            .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
    }

    // Get ticket statistics
    getTicketStats() {
        const tickets = Array.from(this.activeTickets.values());
        const openTickets = tickets.filter(t => t.status === 'open').length;
        const closedTickets = tickets.filter(t => t.status === 'closed').length;
        const highPriority = tickets.filter(t => t.priority === 'high' && t.status === 'open').length;

        return {
            total: tickets.length,
            open: openTickets,
            closed: closedTickets,
            highPriority: highPriority
        };
    }
}

module.exports = BetCollectiveSupportSystem;
