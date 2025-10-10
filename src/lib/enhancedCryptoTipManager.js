/**
 * Enhanced Crypto Tip Manager with Real Blockchain Integration
 * Combines virtual balances with real on-chain transactions
 */

const CryptoTipManager = require('./cryptoTipManager');
const RealBlockchainManager = require('./realBlockchainManager');

class EnhancedCryptoTipManager extends CryptoTipManager {
    constructor() {
        super();
        this.blockchain = new RealBlockchainManager();
        this.isBlockchainEnabled = false;
        this.withdrawalThreshold = 10; // Minimum amount for real blockchain withdrawal
    }

    /**
     * Initialize both virtual and real blockchain systems
     */
    async initialize() {
        console.log('🚀 Initializing Enhanced Crypto System...');
        
        // Initialize virtual system first
        await super.initializeTipManager();
        
        // Initialize real blockchain
        try {
            this.isBlockchainEnabled = await this.blockchain.initialize();
            if (this.isBlockchainEnabled) {
                console.log('✅ Real blockchain integration enabled');
                console.log('📋 Network Info:', this.blockchain.getNetworkInfo());
            } else {
                console.log('⚠️  Real blockchain disabled - using virtual mode only');
            }
        } catch (error) {
            console.warn('⚠️  Blockchain initialization failed, continuing in virtual mode:', error.message);
            this.isBlockchainEnabled = false;
        }
    }

    /**
     * Enhanced balance check with real blockchain data
     */
    async getEnhancedBalance(discordId, chain) {
        const virtualBalance = this.getUserBalance(discordId, chain);
        
        if (!this.isBlockchainEnabled || (chain !== 'SOLUSDC' && chain !== 'SOLANA')) {
            return {
                virtual: virtualBalance,
                onChain: 0,
                total: virtualBalance,
                canWithdraw: false
            };
        }

        try {
            // Get user's wallet address (you'd store this in user profiles)
            const userWallet = await this.getUserWalletAddress(discordId);
            if (!userWallet) {
                return {
                    virtual: virtualBalance,
                    onChain: 0,
                    total: virtualBalance,
                    canWithdraw: false,
                    note: 'No wallet linked'
                };
            }

            let onChainBalance = 0;
            if (chain === 'SOLUSDC') {
                onChainBalance = await this.blockchain.getUSDCBalance(userWallet);
            } else if (chain === 'SOLANA') {
                onChainBalance = await this.blockchain.getSolBalance(userWallet);
            }

            return {
                virtual: virtualBalance,
                onChain: onChainBalance,
                total: virtualBalance + onChainBalance,
                canWithdraw: virtualBalance >= this.withdrawalThreshold,
                wallet: userWallet
            };

        } catch (error) {
            console.error('Error getting on-chain balance:', error);
            return {
                virtual: virtualBalance,
                onChain: 0,
                total: virtualBalance,
                canWithdraw: false,
                error: error.message
            };
        }
    }

    /**
     * Withdraw virtual balance to real blockchain
     */
    async withdrawToBlockchain(discordId, chain, amount, toAddress) {
        try {
            if (!this.isBlockchainEnabled) {
                throw new Error('Blockchain integration not available');
            }

            if (chain !== 'SOLUSDC' && chain !== 'SOLANA') {
                throw new Error(`Blockchain withdrawal not supported for ${chain}`);
            }

            // Check virtual balance
            const virtualBalance = this.getUserBalance(discordId, chain);
            if (virtualBalance < amount) {
                throw new Error('Insufficient virtual balance');
            }

            if (amount < this.withdrawalThreshold) {
                throw new Error(`Minimum withdrawal amount is ${this.withdrawalThreshold}`);
            }

            console.log(`💸 Processing withdrawal: ${amount} ${chain} to ${toAddress}`);

            // Get hot wallet private key (in production, use secure key management)
            const hotWalletPrivateKey = this.blockchain.hotWallet?.secretKey;
            if (!hotWalletPrivateKey) {
                throw new Error('Hot wallet not available');
            }

            // Send real blockchain transaction
            let txResult;
            if (chain === 'SOLUSDC') {
                txResult = await this.blockchain.sendUSDCTransaction(
                    hotWalletPrivateKey,
                    toAddress,
                    amount
                );
            } else if (chain === 'SOLANA') {
                txResult = await this.blockchain.sendSOLTransaction(
                    hotWalletPrivateKey,
                    toAddress,
                    amount
                );
            }

            if (txResult.success) {
                // Deduct from virtual balance
                this.setUserBalance(discordId, chain, virtualBalance - amount);
                
                // Record withdrawal
                const withdrawalRecord = {
                    id: `withdrawal_${Date.now()}`,
                    discordId,
                    chain,
                    amount,
                    toAddress,
                    signature: txResult.signature,
                    status: 'completed',
                    timestamp: txResult.timestamp
                };

                // Store withdrawal record
                this.withdrawalHistory = this.withdrawalHistory || new Map();
                this.withdrawalHistory.set(withdrawalRecord.id, withdrawalRecord);
                await this.saveWithdrawalData();

                console.log('✅ Withdrawal completed:', withdrawalRecord.id);
                return withdrawalRecord;

            } else {
                throw new Error(`Blockchain transaction failed: ${txResult.error}`);
            }

        } catch (error) {
            console.error('❌ Withdrawal failed:', error);
            throw error;
        }
    }

    /**
     * Deposit from blockchain to virtual balance
     */
    async depositFromBlockchain(discordId, signature) {
        try {
            if (!this.isBlockchainEnabled) {
                throw new Error('Blockchain integration not available');
            }

            console.log(`🔍 Processing deposit from signature: ${signature}`);

            // Get transaction details
            const transaction = await this.blockchain.getTransaction(signature);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Parse transaction for relevant transfers
            // This is simplified - you'd need more robust parsing
            const relevantTransfers = this.parseTransactionForDeposit(transaction);
            
            for (const transfer of relevantTransfers) {
                // Add to virtual balance
                await this.addUserBalance(discordId, transfer.chain, transfer.amount);
                
                // Record deposit
                const depositRecord = {
                    id: `deposit_${Date.now()}`,
                    discordId,
                    chain: transfer.chain,
                    amount: transfer.amount,
                    fromAddress: transfer.from,
                    signature,
                    status: 'completed',
                    timestamp: new Date().toISOString()
                };

                this.depositHistory = this.depositHistory || new Map();
                this.depositHistory.set(depositRecord.id, depositRecord);
                await this.saveDepositData();

                console.log('✅ Deposit completed:', depositRecord.id);
            }

            return true;

        } catch (error) {
            console.error('❌ Deposit failed:', error);
            throw error;
        }
    }

    /**
     * Link user Discord ID to wallet address
     */
    async linkUserWallet(discordId, walletAddress) {
        if (!this.blockchain.isValidAddress(walletAddress)) {
            throw new Error('Invalid wallet address');
        }

        this.userWallets = this.userWallets || new Map();
        this.userWallets.set(discordId, walletAddress);
        await this.saveUserWallets();

        console.log(`🔗 Linked Discord ${discordId} to wallet ${walletAddress}`);
        return true;
    }

    /**
     * Get user's linked wallet address
     */
    async getUserWalletAddress(discordId) {
        this.userWallets = this.userWallets || new Map();
        return this.userWallets.get(discordId) || null;
    }

    /**
     * Generate new wallet for user
     */
    generateUserWallet(discordId) {
        const wallet = this.blockchain.generateWallet();
        this.linkUserWallet(discordId, wallet.publicKey);
        return wallet;
    }

    /**
     * Get network status and info
     */
    getBlockchainStatus() {
        if (!this.isBlockchainEnabled) {
            return { enabled: false, reason: 'Blockchain integration disabled' };
        }

        return {
            enabled: true,
            ...this.blockchain.getNetworkInfo(),
            withdrawalThreshold: this.withdrawalThreshold
        };
    }

    /**
     * Request testnet airdrop
     */
    async requestTestnetAirdrop(walletAddress, amount = 1) {
        if (!this.isBlockchainEnabled) {
            throw new Error('Blockchain integration not available');
        }

        return await this.blockchain.requestAirdrop(walletAddress, amount);
    }

    /**
     * Parse transaction for deposit information
     */
    parseTransactionForDeposit(transaction) {
        // Simplified parsing - implement based on your needs
        const transfers = [];
        
        // Example: Look for USDC transfers to hot wallet
        if (transaction?.meta?.postTokenBalances) {
            // Parse token balance changes
            // This is where you'd implement detailed transaction parsing
        }

        return transfers;
    }

    /**
     * Save withdrawal history
     */
    async saveWithdrawalData() {
        if (this.withdrawalHistory) {
            const fs = require('fs').promises;
            const withdrawalData = Object.fromEntries(this.withdrawalHistory);
            await fs.writeFile('./data/withdrawals.json', JSON.stringify(withdrawalData, null, 2));
        }
    }

    /**
     * Save deposit history
     */
    async saveDepositData() {
        if (this.depositHistory) {
            const fs = require('fs').promises;
            const depositData = Object.fromEntries(this.depositHistory);
            await fs.writeFile('./data/deposits.json', JSON.stringify(depositData, null, 2));
        }
    }

    /**
     * Save user wallet mappings
     */
    async saveUserWallets() {
        if (this.userWallets) {
            const fs = require('fs').promises;
            const walletData = Object.fromEntries(this.userWallets);
            await fs.writeFile('./data/user_wallets.json', JSON.stringify(walletData, null, 2));
        }
    }

    /**
     * Load historical data
     */
    async loadBlockchainData() {
        const fs = require('fs').promises;
        
        try {
            // Load withdrawal history
            const withdrawalData = await fs.readFile('./data/withdrawals.json', 'utf8');
            this.withdrawalHistory = new Map(Object.entries(JSON.parse(withdrawalData)));
        } catch (error) {
            this.withdrawalHistory = new Map();
        }

        try {
            // Load deposit history
            const depositData = await fs.readFile('./data/deposits.json', 'utf8');
            this.depositHistory = new Map(Object.entries(JSON.parse(depositData)));
        } catch (error) {
            this.depositHistory = new Map();
        }

        try {
            // Load user wallets
            const walletData = await fs.readFile('./data/user_wallets.json', 'utf8');
            this.userWallets = new Map(Object.entries(JSON.parse(walletData)));
        } catch (error) {
            this.userWallets = new Map();
        }
    }
}

module.exports = EnhancedCryptoTipManager;
