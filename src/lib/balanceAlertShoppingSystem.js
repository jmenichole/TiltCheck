/**
 * Balance Alert Shopping System
 * Reminds users of shopping goals when reaching target balances
 * Integrates with adult responsibility auto-vault system
 */

const { EmbedBuilder } = require('discord.js');

class BalanceAlertShoppingSystem {
    constructor() {
        this.userShoppingLists = new Map(); // userId -> shopping lists
        this.userBalanceTargets = new Map(); // userId -> balance targets
        this.userAdultVaults = new Map(); // userId -> adult responsibility goals
        this.amazonWishlistIntegration = new Map(); // userId -> amazon wishlist links
    }

    // Set balance targets for shopping reminders
    async setBalanceTarget(message, args) {
        if (args.length < 2) {
            return await message.reply(`❌ **Usage:** \`$shopping target <amount> <item>\`

**Examples:**
• \`$shopping target 500 "New Gaming Chair"\`
• \`$shopping target 1000 "Emergency Fund Top-up"\`
• \`$shopping target 200 "Groceries & Bills"\``);
        }

        const targetAmount = parseFloat(args[0]);
        const item = args.slice(1).join(' ');
        const userId = message.author.id;

        if (isNaN(targetAmount) || targetAmount <= 0) {
            return await message.reply('❌ Please provide a valid target amount!');
        }

        if (!this.userShoppingLists.has(userId)) {
            this.userShoppingLists.set(userId, []);
        }

        if (!this.userBalanceTargets.has(userId)) {
            this.userBalanceTargets.set(userId, []);
        }

        const target = {
            amount: targetAmount,
            item: item,
            dateSet: new Date(),
            triggered: false,
            priority: this.determinePriority(item)
        };

        this.userBalanceTargets.get(userId).push(target);

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎯 Balance Target Set!')
            .setDescription(`I'll remind you when you hit **$${targetAmount}** to get:\n**${item}**`)
            .addFields(
                {
                    name: '💡 Smart Spending Tip',
                    value: this.getSpendingTip(targetAmount, item),
                    inline: false
                }
            )
            .setFooter({ text: 'Balance monitoring active • Discipline = Freedom' });

        await message.reply({ embeds: [embed] });
    }

    // Add items to shopping list
    async addShoppingItem(message, args) {
        if (args.length === 0) {
            return await message.reply(`❌ **Usage:** \`$shopping add <item> [estimated_cost] [priority]\`

**Examples:**
• \`$shopping add "Rent Money" 1200 high\`
• \`$shopping add "New Headphones" 150 medium\`
• \`$shopping add "Gaming Mouse" 80 low\`

**Priorities:** high, medium, low`);
        }

        const userId = message.author.id;
        const itemText = args.join(' ');
        
        // Parse item details
        const costMatch = itemText.match(/(\d+(?:\.\d{2})?)/);
        const priorityMatch = itemText.match(/\b(high|medium|low)\b/i);
        
        const estimatedCost = costMatch ? parseFloat(costMatch[1]) : null;
        const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';
        const cleanItem = itemText.replace(/\d+(?:\.\d{2})?/g, '').replace(/\b(high|medium|low)\b/gi, '').trim();

        if (!this.userShoppingLists.has(userId)) {
            this.userShoppingLists.set(userId, []);
        }

        const shoppingItem = {
            id: Date.now(),
            item: cleanItem,
            estimatedCost: estimatedCost,
            priority: priority,
            dateAdded: new Date(),
            purchased: false,
            category: this.categorizeItem(cleanItem)
        };

        this.userShoppingLists.get(userId).push(shoppingItem);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🛒 Shopping Item Added!')
            .setDescription(`**${cleanItem}** added to your list`)
            .addFields(
                {
                    name: '💰 Details',
                    value: `**Cost:** ${estimatedCost ? `$${estimatedCost}` : 'Not specified'}\n**Priority:** ${priority.toUpperCase()}\n**Category:** ${shoppingItem.category}`,
                    inline: true
                },
                {
                    name: '🎯 Next Steps',
                    value: `Use \`$shopping target ${estimatedCost || 100} "${cleanItem}"\` to set a balance alert!`,
                    inline: false
                }
            );

        await message.reply({ embeds: [embed] });
    }

    // Check current balance and trigger alerts
    async checkBalanceAlerts(userId, currentBalance, cryptoManager) {
        const targets = this.userBalanceTargets.get(userId) || [];
        const triggeredAlerts = [];

        for (const target of targets) {
            if (!target.triggered && currentBalance >= target.amount) {
                target.triggered = true;
                triggeredAlerts.push(target);
            }
        }

        return triggeredAlerts;
    }

    // Show shopping list
    async showShoppingList(message) {
        const userId = message.author.id;
        const shoppingList = this.userShoppingLists.get(userId) || [];
        const targets = this.userBalanceTargets.get(userId) || [];

        if (shoppingList.length === 0 && targets.length === 0) {
            return await message.reply(`🛒 **Your shopping list is empty!**

**Get started:**
• \`$shopping add "Item Name" 100 high\` - Add items to your list
• \`$shopping target 500 "Emergency Fund"\` - Set balance alerts
• \`$shopping vault 200 "Rent Money"\` - Auto-save for responsibilities`);
        }

        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🛒 Your Shopping & Goals List')
            .setDescription('Smart spending starts with planning!');

        // Show active targets
        if (targets.length > 0) {
            const activeTargets = targets.filter(t => !t.triggered);
            if (activeTargets.length > 0) {
                const targetList = activeTargets
                    .sort((a, b) => a.amount - b.amount)
                    .slice(0, 5)
                    .map(t => `💰 **$${t.amount}** → ${t.item}`)
                    .join('\n');

                embed.addFields({
                    name: '🎯 Active Balance Targets',
                    value: targetList,
                    inline: false
                });
            }
        }

        // Show shopping items by priority
        if (shoppingList.length > 0) {
            const priorities = ['high', 'medium', 'low'];
            
            for (const priority of priorities) {
                const items = shoppingList
                    .filter(item => item.priority === priority && !item.purchased)
                    .slice(0, 3);

                if (items.length > 0) {
                    const itemList = items.map(item => 
                        `${this.getPriorityEmoji(priority)} **${item.item}** ${item.estimatedCost ? `($${item.estimatedCost})` : ''}`
                    ).join('\n');

                    embed.addFields({
                        name: `${priority.toUpperCase()} Priority`,
                        value: itemList,
                        inline: true
                    });
                }
            }
        }

        // Calculate total estimated costs
        const totalCost = shoppingList
            .filter(item => !item.purchased && item.estimatedCost)
            .reduce((sum, item) => sum + item.estimatedCost, 0);

        if (totalCost > 0) {
            embed.addFields({
                name: '💎 Total Estimated Cost',
                value: `$${totalCost.toFixed(2)} for planned purchases`,
                inline: false
            });
        }

        embed.setFooter({ text: 'Use $shopping target <amount> <item> to set balance alerts' });

        await message.reply({ embeds: [embed] });
    }

    // Adult responsibility auto-vault system
    async setAdultVault(message, args) {
        if (args.length < 2) {
            return await message.reply(`❌ **Usage:** \`$vault set <percentage> <purpose>\`

**Examples:**
• \`$vault set 25 "Rent & Bills"\` - Save 25% of gambling wins
• \`$vault set 50 "Emergency Fund"\` - Save 50% automatically
• \`$vault set 10 "Grocery Money"\` - Small but consistent savings

**Adult Responsibility Categories:**
🏠 Rent/Mortgage • 💡 Utilities • 🍕 Food/Groceries • 🚗 Transportation
💊 Healthcare • 📱 Phone/Internet • 🎓 Education • 🏦 Emergency Fund`);
        }

        const percentage = parseFloat(args[0]);
        const purpose = args.slice(1).join(' ');
        const userId = message.author.id;

        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            return await message.reply('❌ Please provide a valid percentage (1-100)!');
        }

        if (!this.userAdultVaults.has(userId)) {
            this.userAdultVaults.set(userId, []);
        }

        const vault = {
            id: Date.now(),
            percentage: percentage,
            purpose: purpose,
            totalSaved: 0,
            dateCreated: new Date(),
            active: true,
            category: this.categorizeResponsibility(purpose)
        };

        this.userAdultVaults.get(userId).push(vault);

        const embed = new EmbedBuilder()
            .setColor('#28a745')
            .setTitle('🏦 Adult Vault Created!')
            .setDescription(`**${percentage}%** of your gambling wins will be auto-saved for:\n**${purpose}**`)
            .addFields(
                {
                    name: '🎯 Vault Details',
                    value: `**Category:** ${vault.category}\n**Auto-Save:** ${percentage}% of wins\n**Status:** Active`,
                    inline: true
                },
                {
                    name: '💡 Pro Tip',
                    value: 'Consistent small saves beat big occasional saves. Your future self will thank you!',
                    inline: false
                }
            )
            .setFooter({ text: 'Adulting done right • Financial discipline = True freedom' });

        await message.reply({ embeds: [embed] });
    }

    // Process auto-vault on gambling wins
    async processAutoVault(userId, winAmount) {
        const vaults = this.userAdultVaults.get(userId) || [];
        const activeVaults = vaults.filter(v => v.active);
        
        if (activeVaults.length === 0) return null;

        const vaultAllocations = [];
        let totalVaulted = 0;

        for (const vault of activeVaults) {
            const vaultAmount = (winAmount * vault.percentage) / 100;
            vault.totalSaved += vaultAmount;
            totalVaulted += vaultAmount;
            
            vaultAllocations.push({
                purpose: vault.purpose,
                amount: vaultAmount,
                percentage: vault.percentage
            });
        }

        return {
            totalVaulted: totalVaulted,
            allocations: vaultAllocations,
            remainingAmount: winAmount - totalVaulted
        };
    }

    // Show vault status
    async showVaultStatus(message) {
        const userId = message.author.id;
        const vaults = this.userAdultVaults.get(userId) || [];

        if (vaults.length === 0) {
            return await message.reply(`🏦 **No adult vaults set up yet!**

**Why use vaults?**
• Automatic savings from gambling wins
• Adult responsibility money management
• Peace of mind knowing bills are covered

**Get started:**
\`$vault set 25 "Rent Money"\` - Save 25% of wins for rent`);
        }

        const totalSaved = vaults.reduce((sum, vault) => sum + vault.totalSaved, 0);
        const activeVaults = vaults.filter(v => v.active);

        const embed = new EmbedBuilder()
            .setColor('#28a745')
            .setTitle('🏦 Your Adult Responsibility Vaults')
            .setDescription(`💰 **Total Saved:** $${totalSaved.toFixed(2)}`)
            .addFields({
                name: '📊 Active Vaults',
                value: activeVaults.length > 0 ? 
                    activeVaults.map(v => 
                        `🏛️ **${v.purpose}** - ${v.percentage}% ($${v.totalSaved.toFixed(2)} saved)`
                    ).join('\n') : 
                    'No active vaults',
                inline: false
            });

        if (activeVaults.length > 0) {
            const totalPercentage = activeVaults.reduce((sum, v) => sum + v.percentage, 0);
            embed.addFields({
                name: '🎯 Auto-Save Rate',
                value: `${totalPercentage}% of gambling wins automatically saved`,
                inline: true
            });
        }

        await message.reply({ embeds: [embed] });
    }

    // Integration with TiltCheck for responsible gambling
    async handleGamblingWin(userId, winAmount, cryptoManager) {
        const vaultResult = await this.processAutoVault(userId, winAmount);
        const balanceAlerts = await this.checkBalanceAlerts(userId, await cryptoManager.getBalance(userId), cryptoManager);
        
        return {
            vaultResult: vaultResult,
            balanceAlerts: balanceAlerts,
            responsibleGamblingMessage: this.getResponsibleGamblingMessage(winAmount, vaultResult)
        };
    }

    // Helper methods
    determinePriority(item) {
        const itemLower = item.toLowerCase();
        const highPriority = ['rent', 'mortgage', 'bills', 'utilities', 'food', 'groceries', 'medicine', 'healthcare', 'emergency'];
        const lowPriority = ['gaming', 'entertainment', 'luxury', 'wants'];

        if (highPriority.some(keyword => itemLower.includes(keyword))) return 'high';
        if (lowPriority.some(keyword => itemLower.includes(keyword))) return 'low';
        return 'medium';
    }

    categorizeItem(item) {
        const itemLower = item.toLowerCase();
        if (itemLower.includes('gaming') || itemLower.includes('entertainment')) return '🎮 Gaming/Entertainment';
        if (itemLower.includes('rent') || itemLower.includes('bills') || itemLower.includes('utilities')) return '🏠 Housing/Bills';
        if (itemLower.includes('food') || itemLower.includes('groceries')) return '🍕 Food/Groceries';
        if (itemLower.includes('emergency') || itemLower.includes('savings')) return '🏦 Emergency/Savings';
        return '🛒 General';
    }

    categorizeResponsibility(purpose) {
        const purposeLower = purpose.toLowerCase();
        if (purposeLower.includes('rent') || purposeLower.includes('mortgage')) return '🏠 Housing';
        if (purposeLower.includes('utilities') || purposeLower.includes('bills')) return '💡 Utilities';
        if (purposeLower.includes('food') || purposeLower.includes('groceries')) return '🍕 Food';
        if (purposeLower.includes('emergency') || purposeLower.includes('savings')) return '🏦 Emergency Fund';
        if (purposeLower.includes('healthcare') || purposeLower.includes('medicine')) return '💊 Healthcare';
        return '📋 Adult Responsibility';
    }

    getPriorityEmoji(priority) {
        const emojis = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return emojis[priority] || '⚪';
    }

    getSpendingTip(amount, item) {
        if (amount < 100) return "Small goals build big habits! 💪";
        if (amount < 500) return "Perfect planning prevents poor performance! 🎯";
        if (amount < 1000) return "Smart savers always win in the long run! 🏆";
        return "Big goals require big discipline - you've got this! 🚀";
    }

    getResponsibleGamblingMessage(winAmount, vaultResult) {
        if (!vaultResult) return "Consider setting up adult vaults to save some of your wins! 🏦";
        
        return `🎉 Win processed responsibly!\n💰 Win: $${winAmount.toFixed(2)}\n🏦 Vaulted: $${vaultResult.totalVaulted.toFixed(2)}\n💵 Available: $${vaultResult.remainingAmount.toFixed(2)}`;
    }
}

module.exports = BalanceAlertShoppingSystem;
