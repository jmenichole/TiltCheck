/**
 * Non-Custodial Tipping System using Solana Smart Contracts
 * Users control their own wallets and private keys
 */
class NonCustodialTippingSystem {
    constructor(config) {
        this.userWallets = new Map(); // Discord ID -> User's wallet pubkey
        this.config = config || {};
        console.log('🔒 Non-Custodial Tipping System initialized');
    }

    async registerUserWallet(discordId, walletPubkey) {
        this.userWallets.set(discordId, walletPubkey);
        return {
            success: true,
            message: `✅ Wallet registered successfully! You maintain full control of your funds.`,
            walletAddress: walletPubkey,
            note: "🔒 Your private key never leaves your wallet - fully non-custodial!"
        };
    }

    async getUserBalance(discordId) {
        const userWallet = this.userWallets.get(discordId);
        
        if (!userWallet) {
            return {
                registered: false,
                message: "❌ No wallet registered. Use `/wallet register` to connect your wallet."
            };
        }

        return {
            registered: true,
            walletAddress: userWallet,
            balance: { SOL: 0, formatted: "0.0000 SOL" },
            stats: { tipsSent: 0, tipsReceived: 0, reputation: 1000 },
            controlMessage: "🔒 You have full control of these funds in your own wallet"
        };
    }

    async executeTip(senderDiscordId, recipientDiscordId, amount, message = '') {
        const senderWallet = this.userWallets.get(senderDiscordId);
        const recipientWallet = this.userWallets.get(recipientDiscordId);

        if (!senderWallet) {
            throw new Error(`❌ ${senderDiscordId} needs to register their wallet first. Use /wallet register`);
        }
        
        if (!recipientWallet) {
            throw new Error(`❌ ${recipientDiscordId} needs to register their wallet first`);
        }

        return {
            success: true,
            instruction: {
                type: 'direct_tip',
                accounts: { sender: senderWallet, recipient: recipientWallet },
                data: { amount: amount * 1000000000, message: message }
            },
            message: `💰 Ready to tip ${amount} SOL from ${senderDiscordId} to ${recipientDiscordId}`,
            userAction: `Please sign this transaction with your wallet to complete the tip`
        };
    }

    generateWalletInstructions() {
        return {
            title: "🔒 Connect Your Non-Custodial Wallet",
            steps: [
                "1️⃣ Install a Solana wallet (Phantom, Solflare, etc.)",
                "2️⃣ Create or import your wallet",
                "3️⃣ Copy your wallet's public address", 
                "4️⃣ Use command: `/wallet register <your_public_key>`"
            ],
            security: [
                "🔒 **NEVER share your private key or seed phrase**",
                "✅ Only share your PUBLIC wallet address", 
                "🛡️ You maintain 100% control of your funds"
            ],
            note: "This system is completely non-custodial!"
        };
    }
}

module.exports = { NonCustodialTippingSystem };
