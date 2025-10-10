/**
 * Crypto Tip Manager - Direct crypto tipping without tip.cc API
 * Integrates with existing crypto wallet system for seamless tipping
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const SecureCryptoPaymentWallets = require('./cryptoPaymentWallets');
const fs = require('fs').promises;
const path = require('path');

class CryptoTipManager {
    constructor() {
        this.cryptoSystem = new SecureCryptoPaymentWallets();
        this.tipHistoryFile = path.join(__dirname, 'data', 'tip_history.json');
        this.userBalancesFile = path.join(__dirname, 'data', 'user_balances.json');
        this.pendingTips = new Map(); // Store pending tip transactions
        this.userBalances = new Map(); // User crypto balances
        this.tipHistory = new Map(); // Tip transaction history
        
        this.initializeTipManager();
    }

    async initializeTipManager() {
        console.log('💰 Initializing Crypto Tip Manager...');
        
        // Initialize crypto system
        await this.cryptoSystem.initializeSystem();
        
        // Load existing data
        await this.loadTipData();
        
        console.log('✅ Crypto Tip Manager Ready - No API required!');
    }

    async loadTipData() {
        try {
            // Load user balances
            const balanceData = JSON.parse(await fs.readFile(this.userBalancesFile, 'utf8'));
            this.userBalances = new Map(Object.entries(balanceData || {}));
            console.log('💳 User balance data loaded');
        } catch (error) {
            console.log('📝 No existing balance data found, starting fresh');
            this.userBalances = new Map();
        }

        try {
            // Load tip history
            const historyData = JSON.parse(await fs.readFile(this.tipHistoryFile, 'utf8'));
            this.tipHistory = new Map(Object.entries(historyData || {}));
            console.log('📊 Tip history data loaded');
        } catch (error) {
            console.log('📝 No existing tip history found, starting fresh');
            this.tipHistory = new Map();
        }
    }

    async saveTipData() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.tipHistoryFile);
            await fs.mkdir(dataDir, { recursive: true });

            // Save user balances
            const balanceData = Object.fromEntries(this.userBalances);
            await fs.writeFile(this.userBalancesFile, JSON.stringify(balanceData, null, 2));
            
            // Save tip history
            const historyData = Object.fromEntries(this.tipHistory);
            await fs.writeFile(this.tipHistoryFile, JSON.stringify(historyData, null, 2));
            
            console.log('💾 Tip data saved successfully');
        } catch (error) {
            console.error('❌ Error saving tip data:', error);
        }
    }

    /**
     * Handle $tip command - Send crypto tip to another user
     * Usage: $tip @user amount [chain]
     */
    async handleTipCommand(message, args) {
        const fromUserId = message.author.id;
        const fromUsername = message.author.username;

        try {
            // Parse command arguments
            const mentionMatch = args[0]?.match(/<@!?(\d+)>/);
            if (!mentionMatch) {
                return message.reply('❌ Please mention a user to tip: `$tip @user amount [chain]`');
            }

            const toUserId = mentionMatch[1];
            const amount = parseFloat(args[1]);
            const chain = (args[2] || 'POLYGON').toUpperCase();

            // Validation
            if (isNaN(amount) || amount <= 0) {
                return message.reply('❌ Please specify a valid amount: `$tip @user amount [chain]`');
            }

            if (fromUserId === toUserId) {
                return message.reply('❌ You cannot tip yourself!');
            }

            // Check if chain is supported
            const supportedChains = ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'AVALANCHE', 'SOLANA', 'TRON', 'SOLUSDC'];
            if (!supportedChains.includes(chain)) {
                return message.reply(`❌ Unsupported chain. Available: ${supportedChains.join(', ')}`);
            }

            // Check sender's balance
            const senderBalance = this.getUserBalance(fromUserId, chain);
            if (senderBalance < amount) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Insufficient Balance')
                    .setDescription(`You don't have enough ${chain} tokens to send this tip.`)
                    .setColor(0xFF0000)
                    .addFields(
                        { name: '💰 Your Balance', value: `${senderBalance.toFixed(6)} ${chain}`, inline: true },
                        { name: '💸 Tip Amount', value: `${amount.toFixed(6)} ${chain}`, inline: true },
                        { name: '❗ Shortfall', value: `${(amount - senderBalance).toFixed(6)} ${chain}`, inline: true }
                    )
                    .addFields({
                        name: '🔗 Add Funds',
                        value: 'Use `!crypto deposit` to add funds to your wallet',
                        inline: false
                    });

                return message.reply({ embeds: [embed] });
            }

            // Get recipient info
            const toUser = await message.client.users.fetch(toUserId);
            const toUsername = toUser.username;

            // Create tip transaction
            const tipId = `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const tipData = {
                id: tipId,
                fromUserId,
                fromUsername,
                toUserId,
                toUsername,
                amount,
                chain,
                status: 'pending',
                timestamp: new Date().toISOString(),
                guildId: message.guild.id,
                channelId: message.channel.id
            };

            // Store pending tip
            this.pendingTips.set(tipId, tipData);

            // Create confirmation embed
            const embed = new EmbedBuilder()
                .setTitle('💸 Confirm Crypto Tip')
                .setDescription(`Send **${amount} ${chain}** to **${toUsername}**?`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '👤 From', value: fromUsername, inline: true },
                    { name: '👤 To', value: toUsername, inline: true },
                    { name: '💰 Amount', value: `${amount} ${chain}`, inline: true }
                )
                .addFields(
                    { name: '🔗 Blockchain', value: chain, inline: true },
                    { name: '⚡ Fee', value: 'Network fees apply', inline: true },
                    { name: '🕐 Processing', value: 'Instant transfer', inline: true }
                )
                .setFooter({ text: 'Click confirm to send the tip!' })
                .setTimestamp();

            const confirmButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`confirm_tip_${tipId}`)
                        .setLabel('✅ Confirm Tip')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`cancel_tip_${tipId}`)
                        .setLabel('❌ Cancel')
                        .setStyle(ButtonStyle.Danger)
                );

            await message.reply({ embeds: [embed], components: [confirmButton] });

        } catch (error) {
            console.error('Error handling tip command:', error);
            await message.reply(`❌ Error processing tip: ${error.message}`);
        }
    }

    /**
     * Handle tip confirmation button
     */
    async handleTipConfirmation(interaction, tipId) {
        try {
            const tipData = this.pendingTips.get(tipId);
            if (!tipData) {
                return interaction.reply({ content: '❌ Tip not found or expired', ephemeral: true });
            }

            // Verify the user confirming is the sender
            if (interaction.user.id !== tipData.fromUserId) {
                return interaction.reply({ content: '❌ Only the sender can confirm this tip', ephemeral: true });
            }

            // Process the tip
            await this.processTip(tipData);

            // Update embed to show success
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Tip Sent Successfully!')
                .setDescription(`**${tipData.amount} ${tipData.chain}** sent to **${tipData.toUsername}**`)
                .setColor(0x00FF00)
                .addFields(
                    { name: '📊 Transaction ID', value: tipData.id, inline: false },
                    { name: '🕐 Completed', value: new Date().toLocaleString(), inline: true },
                    { name: '⛓️ Blockchain', value: tipData.chain, inline: true }
                )
                .setFooter({ text: 'Tip completed successfully!' });

            await interaction.update({ embeds: [successEmbed], components: [] });

            // Notify recipient
            try {
                const recipient = await interaction.client.users.fetch(tipData.toUserId);
                const dmEmbed = new EmbedBuilder()
                    .setTitle('💰 You Received a Tip!')
                    .setDescription(`**${tipData.fromUsername}** sent you **${tipData.amount} ${tipData.chain}**`)
                    .setColor(0x00FF00)
                    .addFields(
                        { name: '💰 Amount', value: `${tipData.amount} ${tipData.chain}`, inline: true },
                        { name: '👤 From', value: tipData.fromUsername, inline: true },
                        { name: '🏦 Your Balance', value: `${this.getUserBalance(tipData.toUserId, tipData.chain)} ${tipData.chain}`, inline: true }
                    )
                    .setFooter({ text: 'Use !crypto balance to check all your balances' });

                await recipient.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log('Could not DM recipient:', error.message);
            }

            // Clean up
            this.pendingTips.delete(tipId);

        } catch (error) {
            console.error('Error confirming tip:', error);
            await interaction.reply({ content: `❌ Error processing tip: ${error.message}`, ephemeral: true });
        }
    }

    /**
     * Handle tip cancellation
     */
    async handleTipCancellation(interaction, tipId) {
        try {
            const tipData = this.pendingTips.get(tipId);
            if (!tipData) {
                return interaction.reply({ content: '❌ Tip not found or expired', ephemeral: true });
            }

            // Verify the user canceling is the sender
            if (interaction.user.id !== tipData.fromUserId) {
                return interaction.reply({ content: '❌ Only the sender can cancel this tip', ephemeral: true });
            }

            // Update embed to show cancellation
            const cancelEmbed = new EmbedBuilder()
                .setTitle('❌ Tip Cancelled')
                .setDescription('The tip has been cancelled')
                .setColor(0xFF0000)
                .setFooter({ text: 'No funds were transferred' });

            await interaction.update({ embeds: [cancelEmbed], components: [] });

            // Clean up
            this.pendingTips.delete(tipId);

        } catch (error) {
            console.error('Error canceling tip:', error);
            await interaction.reply({ content: `❌ Error canceling tip: ${error.message}`, ephemeral: true });
        }
    }

    /**
     * Process the actual tip transaction
     */
    async processTip(tipData) {
        // Deduct from sender
        const senderKey = `${tipData.fromUserId}_${tipData.chain}`;
        const currentSenderBalance = this.getUserBalance(tipData.fromUserId, tipData.chain);
        this.userBalances.set(senderKey, currentSenderBalance - tipData.amount);

        // Add to recipient
        const recipientKey = `${tipData.toUserId}_${tipData.chain}`;
        const currentRecipientBalance = this.getUserBalance(tipData.toUserId, tipData.chain);
        this.userBalances.set(recipientKey, currentRecipientBalance + tipData.amount);

        // Update tip status
        tipData.status = 'completed';
        tipData.completedAt = new Date().toISOString();

        // Store in history
        this.tipHistory.set(tipData.id, tipData);

        // Save data
        await this.saveTipData();

        console.log(`✅ Tip processed: ${tipData.amount} ${tipData.chain} from ${tipData.fromUsername} to ${tipData.toUsername}`);
    }

    /**
     * Handle $balance command - Check crypto balances
     */
    async handleBalanceCommand(message, args) {
        const userId = message.author.id;
        const username = message.author.username;

        try {
            const supportedChains = ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'AVALANCHE', 'SOLANA', 'TRON', 'SOLUSDC'];
            const balances = [];

            for (const chain of supportedChains) {
                const balance = this.getUserBalance(userId, chain);
                if (balance > 0) {
                    balances.push({ chain, balance });
                }
            }

            const embed = new EmbedBuilder()
                .setTitle(`💰 ${username}'s Crypto Balances`)
                .setColor(0x00FF00)
                .setTimestamp();

            if (balances.length === 0) {
                embed.setDescription('No crypto balances found. Use `!crypto deposit` to add funds.');
            } else {
                let totalUSD = 0;
                const balanceText = balances.map(b => {
                    // Mock USD conversion for display
                    const usdValue = b.balance * this.getMockPrice(b.chain);
                    totalUSD += usdValue;
                    return `**${b.chain}:** ${b.balance.toFixed(6)} (~$${usdValue.toFixed(2)})`;
                }).join('\n');

                embed.setDescription(balanceText);
                embed.addFields({ name: '💵 Total Value', value: `~$${totalUSD.toFixed(2)} USD`, inline: true });
            }

            embed.addFields({
                name: '🔗 Quick Actions',
                value: '`$tip @user amount` - Send tip\n`!crypto deposit` - Add funds\n`!crypto withdraw` - Withdraw funds',
                inline: false
            });

            await message.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Error handling balance command:', error);
            await message.reply({ content: `❌ Error checking balance: ${error.message}`, ephemeral: true });
        }
    }

    /**
     * Handle $history command - View tip history
     */
    async handleHistoryCommand(message, args) {
        const userId = message.author.id;
        const username = message.author.username;

        try {
            // Get user's tip history (sent and received)
            const userTips = Array.from(this.tipHistory.values())
                .filter(tip => tip.fromUserId === userId || tip.toUserId === userId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10); // Last 10 transactions

            const embed = new EmbedBuilder()
                .setTitle(`📊 ${username}'s Tip History`)
                .setColor(0x0099FF)
                .setTimestamp();

            if (userTips.length === 0) {
                embed.setDescription('No tip history found. Start tipping with `$tip @user amount`!');
            } else {
                const historyText = userTips.map(tip => {
                    const isSender = tip.fromUserId === userId;
                    const direction = isSender ? '→' : '←';
                    const otherUser = isSender ? tip.toUsername : tip.fromUsername;
                    const date = new Date(tip.timestamp).toLocaleDateString();
                    
                    return `${direction} **${tip.amount} ${tip.chain}** ${isSender ? 'to' : 'from'} ${otherUser} (${date})`;
                }).join('\n');

                embed.setDescription(historyText);
            }

            embed.addFields({
                name: '🔗 Tip Commands',
                value: '`$tip @user amount [chain]` - Send tip\n`$balance` - Check balances',
                inline: false
            });

            await message.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Error handling history command:', error);
            await message.reply({ content: `❌ Error loading history: ${error.message}`, ephemeral: true });
        }
    }

    /**
     * Get user balance for specific chain
     */
    getUserBalance(userId, chain) {
        const key = `${userId}_${chain}`;
        return this.userBalances.get(key) || 0;
    }

    /**
     * Set user balance (for testing/admin)
     */
    setUserBalance(userId, chain, amount) {
        const key = `${userId}_${chain}`;
        this.userBalances.set(key, amount);
    }

    /**
     * Add balance to user (for deposits)
     */
    async addUserBalance(userId, chain, amount) {
        const currentBalance = this.getUserBalance(userId, chain);
        const key = `${userId}_${chain}`;
        this.userBalances.set(key, currentBalance + amount);
        await this.saveTipData();
    }

    /**
     * Mock price function (replace with real price API later)
     */
    getMockPrice(chain) {
        const mockPrices = {
            'ETHEREUM': 3500,
            'POLYGON': 0.85,
            'BSC': 315,
            'ARBITRUM': 3500,
            'AVALANCHE': 35,
            'SOLANA': 85,
            'TRON': 0.15,
            'SOLUSDC': 1.00  // USDC is always ~$1
        };
        return mockPrices[chain] || 1;
    }

    /**
     * Get total tips sent by user
     */
    getTotalTipsSent(userId) {
        return Array.from(this.tipHistory.values())
            .filter(tip => tip.fromUserId === userId && tip.status === 'completed')
            .reduce((total, tip) => total + tip.amount, 0);
    }

    /**
     * Get total tips received by user
     */
    getTotalTipsReceived(userId) {
        return Array.from(this.tipHistory.values())
            .filter(tip => tip.toUserId === userId && tip.status === 'completed')
            .reduce((total, tip) => total + tip.amount, 0);
    }
}

module.exports = CryptoTipManager;
