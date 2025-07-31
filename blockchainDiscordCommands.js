/**
 * Enhanced Discord Commands with Real Blockchain Integration
 * Add these commands to your Discord bot
 */

const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');

class BlockchainDiscordCommands {
    constructor(enhancedTipManager) {
        this.tipManager = enhancedTipManager;
    }

    /**
     * Enhanced balance command showing virtual + on-chain
     */
    async handleEnhancedBalance(message) {
        const discordId = message.author.id;
        
        try {
            const chains = ['SOLUSDC', 'SOLANA', 'ETHEREUM', 'POLYGON'];
            let response = '💰 **Enhanced Crypto Balances**\n\n';
            
            let totalValue = 0;
            
            for (const chain of chains) {
                const enhancedBalance = await this.tipManager.getEnhancedBalance(discordId, chain);
                
                if (enhancedBalance.total > 0) {
                    response += `💎 **${chain}**\n`;
                    response += `   Virtual: ${enhancedBalance.virtual}\n`;
                    
                    if (this.tipManager.isBlockchainEnabled && (chain === 'SOLUSDC' || chain === 'SOLANA')) {
                        response += `   On-chain: ${enhancedBalance.onChain}\n`;
                        response += `   Total: ${enhancedBalance.total}\n`;
                        
                        if (enhancedBalance.wallet) {
                            response += `   Wallet: \`${enhancedBalance.wallet.substring(0, 8)}...\`\n`;
                        }
                        
                        if (enhancedBalance.canWithdraw) {
                            response += `   ✅ Can withdraw to blockchain\n`;
                        }
                    } else {
                        response += `   Total: ${enhancedBalance.virtual}\n`;
                    }
                    
                    const price = this.tipManager.getMockPrice(chain);
                    const value = enhancedBalance.total * price;
                    totalValue += value;
                    response += `   Value: $${value.toFixed(2)}\n\n`;
                }
            }
            
            response += `💵 **Total Portfolio Value: $${totalValue.toFixed(2)}**\n\n`;
            
            if (this.tipManager.isBlockchainEnabled) {
                response += '🔗 **Blockchain Integration: ACTIVE**\n';
                response += '💡 Use `$wallet` to manage your blockchain wallet\n';
                response += '💡 Use `$withdraw` to move funds to blockchain\n';
            } else {
                response += '⚠️ **Blockchain Integration: DISABLED**\n';
                response += '💡 Virtual balances only\n';
            }
            
            return await message.reply(response);
            
        } catch (error) {
            console.error('Enhanced balance error:', error);
            return await message.reply('❌ Error checking enhanced balance. Please try again.');
        }
    }

    /**
     * Wallet management command
     */
    async handleWallet(message, args) {
        const discordId = message.author.id;
        
        if (!this.tipManager.isBlockchainEnabled) {
            return await message.reply('❌ Blockchain integration is not enabled.');
        }
        
        try {
            if (args.length === 0) {
                // Show wallet info
                const walletAddress = await this.tipManager.getUserWalletAddress(discordId);
                const status = this.tipManager.getBlockchainStatus();
                
                let response = '🏦 **Your Blockchain Wallet**\n\n';
                
                if (walletAddress) {
                    response += `📍 **Address:** \`${walletAddress}\`\n`;
                    response += `🔗 **Network:** ${status.network}\n\n`;
                    
                    // Show real balances
                    const solBalance = await this.tipManager.blockchain.getSolBalance(walletAddress);
                    const usdcBalance = await this.tipManager.blockchain.getUSDCBalance(walletAddress);
                    
                    response += '💰 **On-Chain Balances:**\n';
                    response += `   SOL: ${solBalance.toFixed(4)}\n`;
                    response += `   USDC: ${usdcBalance.toFixed(2)}\n\n`;
                    
                    response += '💡 **Commands:**\n';
                    response += '`$withdraw SOLUSDC 10 <address>` - Withdraw to blockchain\n';
                    response += '`$deposit <signature>` - Deposit from blockchain\n';
                    response += '`$airdrop` - Request testnet SOL (devnet only)\n';
                } else {
                    response += '❌ **No wallet linked**\n\n';
                    response += '💡 **Commands:**\n';
                    response += '`$wallet generate` - Generate new wallet\n';
                    response += '`$wallet link <address>` - Link existing wallet\n';
                }
                
                return await message.reply(response);
                
            } else if (args[0] === 'generate') {
                // Generate new wallet
                const newWallet = this.tipManager.generateUserWallet(discordId);
                
                let response = '✅ **New Wallet Generated!**\n\n';
                response += `📍 **Public Address:** \`${newWallet.publicKey}\`\n`;
                response += `🔑 **Private Key:** ||${newWallet.privateKey}||\n\n`;
                response += '⚠️ **IMPORTANT:** Save your private key securely!\n';
                response += '🔗 **Network:** ' + this.tipManager.getBlockchainStatus().network + '\n\n';
                response += '💡 Use `$airdrop` to get testnet SOL\n';
                
                return await message.reply(response);
                
            } else if (args[0] === 'link' && args[1]) {
                // Link existing wallet
                const walletAddress = args[1];
                
                if (!this.tipManager.blockchain.isValidAddress(walletAddress)) {
                    return await message.reply('❌ Invalid wallet address format.');
                }
                
                await this.tipManager.linkUserWallet(discordId, walletAddress);
                
                return await message.reply(`✅ Wallet linked successfully!\n📍 Address: \`${walletAddress}\``);
                
            } else {
                return await message.reply('❌ Invalid wallet command. Use `$wallet` for help.');
            }
            
        } catch (error) {
            console.error('Wallet command error:', error);
            return await message.reply('❌ Error managing wallet. Please try again.');
        }
    }

    /**
     * Withdraw to real blockchain
     */
    async handleWithdraw(message, args) {
        const discordId = message.author.id;
        
        if (!this.tipManager.isBlockchainEnabled) {
            return await message.reply('❌ Blockchain integration is not enabled.');
        }
        
        if (args.length < 3) {
            return await message.reply('❌ Usage: `$withdraw <CHAIN> <AMOUNT> <ADDRESS>`\nExample: `$withdraw SOLUSDC 10 <wallet_address>`');
        }
        
        try {
            const [chain, amountStr, toAddress] = args;
            const amount = parseFloat(amountStr);
            
            if (isNaN(amount) || amount <= 0) {
                return await message.reply('❌ Invalid amount. Must be a positive number.');
            }
            
            if (!this.tipManager.blockchain.isValidAddress(toAddress)) {
                return await message.reply('❌ Invalid destination address.');
            }
            
            // Show confirmation message first
            let confirmMsg = `🔄 **Withdrawal Request**\n\n`;
            confirmMsg += `💰 Amount: ${amount} ${chain}\n`;
            confirmMsg += `📍 To: \`${toAddress.substring(0, 8)}...${toAddress.substring(toAddress.length - 8)}\`\n`;
            confirmMsg += `⏳ Processing...`;
            
            const statusMessage = await message.reply(confirmMsg);
            
            // Process withdrawal
            const withdrawal = await this.tipManager.withdrawToBlockchain(discordId, chain, amount, toAddress);
            
            // Update message with result
            let resultMsg = `✅ **Withdrawal Successful!**\n\n`;
            resultMsg += `💰 Amount: ${amount} ${chain}\n`;
            resultMsg += `📍 To: \`${toAddress}\`\n`;
            resultMsg += `🔗 Signature: \`${withdrawal.signature}\`\n`;
            resultMsg += `⏰ Time: ${new Date(withdrawal.timestamp).toLocaleString()}\n\n`;
            resultMsg += `💡 Your virtual balance has been reduced by ${amount} ${chain}`;
            
            await statusMessage.edit(resultMsg);
            
        } catch (error) {
            console.error('Withdraw error:', error);
            return await message.reply(`❌ Withdrawal failed: ${error.message}`);
        }
    }

    /**
     * Request testnet airdrop
     */
    async handleAirdrop(message, args) {
        const discordId = message.author.id;
        
        if (!this.tipManager.isBlockchainEnabled) {
            return await message.reply('❌ Blockchain integration is not enabled.');
        }
        
        const status = this.tipManager.getBlockchainStatus();
        if (status.network === 'mainnet') {
            return await message.reply('❌ Airdrops are only available on devnet/testnet.');
        }
        
        try {
            const walletAddress = await this.tipManager.getUserWalletAddress(discordId);
            if (!walletAddress) {
                return await message.reply('❌ No wallet linked. Use `$wallet generate` first.');
            }
            
            const amount = args[0] ? parseFloat(args[0]) : 0.5;
            if (amount > 2) {
                return await message.reply('❌ Maximum airdrop amount is 2 SOL.');
            }
            
            const statusMessage = await message.reply(`⏳ Requesting ${amount} SOL airdrop...`);
            
            const signature = await this.tipManager.requestTestnetAirdrop(walletAddress, amount);
            
            let response = `✅ **Airdrop Successful!**\n\n`;
            response += `💰 Amount: ${amount} SOL\n`;
            response += `📍 To: \`${walletAddress}\`\n`;
            response += `🔗 Signature: \`${signature}\`\n`;
            response += `🔗 Network: ${status.network}\n\n`;
            response += `💡 Check your balance with \`$balance\``;
            
            await statusMessage.edit(response);
            
        } catch (error) {
            console.error('Airdrop error:', error);
            return await message.reply(`❌ Airdrop failed: ${error.message}`);
        }
    }

    /**
     * Show blockchain status
     */
    async handleBlockchainStatus(message) {
        const status = this.tipManager.getBlockchainStatus();
        
        let response = '🔗 **Blockchain Integration Status**\n\n';
        
        if (status.enabled) {
            response += `✅ **Status:** ENABLED\n`;
            response += `🌐 **Network:** ${status.network}\n`;
            response += `🔗 **RPC:** ${status.connection}\n`;
            response += `💰 **USDC Mint:** \`${status.usdcMint.substring(0, 8)}...\`\n`;
            response += `🏦 **Hot Wallet:** \`${status.hotWallet?.substring(0, 8)}...\`\n`;
            response += `💸 **Min Withdrawal:** ${status.withdrawalThreshold}\n\n`;
            response += `🚀 **Available Features:**\n`;
            response += `   • Real SOL/USDC transactions\n`;
            response += `   • Wallet generation & linking\n`;
            response += `   • Blockchain withdrawals\n`;
            response += `   • Testnet airdrops\n`;
            response += `   • On-chain balance tracking\n`;
        } else {
            response += `❌ **Status:** DISABLED\n`;
            response += `📝 **Reason:** ${status.reason}\n\n`;
            response += `💡 **Available Features:**\n`;
            response += `   • Virtual balances only\n`;
            response += `   • Internal tipping system\n`;
        }
        
        return await message.reply(response);
    }
}

module.exports = BlockchainDiscordCommands;
