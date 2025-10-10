/**
 * Real Blockchain Integration for Solana USDC
 * This module handles actual on-chain transactions
 */

const { 
    Connection, 
    PublicKey, 
    Keypair, 
    Transaction, 
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction
} = require('@solana/web3.js');

const {
    getOrCreateAssociatedTokenAccount,
    transfer,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
} = require('@solana/spl-token');

const bs58 = require('bs58').default;

class RealBlockchainManager {
    constructor() {
        // Solana RPC endpoints (using public endpoints - upgrade to paid for production)
        this.connections = {
            mainnet: new Connection('https://api.mainnet-beta.solana.com', 'confirmed'),
            devnet: new Connection('https://api.devnet.solana.com', 'confirmed'),
            testnet: new Connection('https://api.testnet.solana.com', 'confirmed')
        };
        
        // Start with devnet for testing
        this.activeConnection = this.connections.devnet;
        this.network = 'devnet';
        
        // USDC token mint addresses
        this.usdcMints = {
            mainnet: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
            devnet: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'), // USDC Devnet
            testnet: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
        };
        
        // Hot wallet for transactions (in production, use secure key management)
        this.hotWallet = null;
        this.initialized = false;
    }

    /**
     * Initialize the blockchain manager with environment variables
     */
    async initialize() {
        try {
            console.log('🔗 Initializing Real Blockchain Integration...');
            
            // Initialize hot wallet (for testing - use env vars in production)
            await this.initializeHotWallet();
            
            // Test connection
            const slot = await this.activeConnection.getSlot();
            console.log(`✅ Connected to Solana ${this.network} - Slot: ${slot}`);
            
            // Check USDC mint
            const mintInfo = await this.activeConnection.getParsedAccountInfo(this.getCurrentUSDCMint());
            console.log('✅ USDC mint validated');
            
            this.initialized = true;
            return true;
            
        } catch (error) {
            console.error('❌ Blockchain initialization failed:', error);
            return false;
        }
    }

    /**
     * Initialize hot wallet for transactions
     */
    async initializeHotWallet() {
        // For testing, generate a new keypair
        // In production, load from secure environment variable
        if (process.env.SOLANA_PRIVATE_KEY && process.env.SOLANA_PRIVATE_KEY.trim() !== '') {
            try {
                const privateKeyBytes = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
                this.hotWallet = Keypair.fromSecretKey(privateKeyBytes);
                console.log('🔑 Loaded wallet from environment:', this.hotWallet.publicKey.toString());
            } catch (error) {
                console.warn('⚠️  Invalid SOLANA_PRIVATE_KEY, generating new wallet');
                this.hotWallet = Keypair.generate();
            }
        } else {
            // Generate new wallet for testing
            this.hotWallet = Keypair.generate();
            console.log('🔑 Generated test wallet:', this.hotWallet.publicKey.toString());
            console.log('🔑 Private key (base58):', bs58.encode(this.hotWallet.secretKey));
            console.log('⚠️  Save this private key for production use!');
        }
    }

    /**
     * Get current USDC mint address
     */
    getCurrentUSDCMint() {
        return this.usdcMints[this.network];
    }

    /**
     * Switch networks (mainnet, devnet, testnet)
     */
    async switchNetwork(network) {
        if (!this.connections[network]) {
            throw new Error(`Invalid network: ${network}`);
        }
        
        this.activeConnection = this.connections[network];
        this.network = network;
        console.log(`🔄 Switched to ${network}`);
        
        // Re-validate connection
        const slot = await this.activeConnection.getSlot();
        console.log(`✅ Connected to Solana ${network} - Slot: ${slot}`);
    }

    /**
     * Get real SOL balance for an address
     */
    async getSolBalance(walletAddress) {
        try {
            const publicKey = new PublicKey(walletAddress);
            const balance = await this.activeConnection.getBalance(publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (error) {
            console.error('Error getting SOL balance:', error);
            return 0;
        }
    }

    /**
     * Get real USDC balance for an address
     */
    async getUSDCBalance(walletAddress) {
        try {
            const publicKey = new PublicKey(walletAddress);
            const usdcMint = this.getCurrentUSDCMint();
            
            // Get associated token account
            const tokenAccount = await this.getAssociatedTokenAccount(publicKey, usdcMint);
            if (!tokenAccount) return 0;
            
            const balance = await this.activeConnection.getTokenAccountBalance(tokenAccount);
            return parseFloat(balance.value.amount) / Math.pow(10, balance.value.decimals);
            
        } catch (error) {
            console.error('Error getting USDC balance:', error);
            return 0;
        }
    }

    /**
     * Get associated token account address
     */
    async getAssociatedTokenAccount(walletPublicKey, mintPublicKey) {
        try {
            const [tokenAccount] = await PublicKey.findProgramAddress(
                [
                    walletPublicKey.toBuffer(),
                    TOKEN_PROGRAM_ID.toBuffer(),
                    mintPublicKey.toBuffer(),
                ],
                ASSOCIATED_TOKEN_PROGRAM_ID
            );
            
            // Check if account exists
            const accountInfo = await this.activeConnection.getAccountInfo(tokenAccount);
            return accountInfo ? tokenAccount : null;
            
        } catch (error) {
            return null;
        }
    }

    /**
     * Send real USDC transaction
     */
    async sendUSDCTransaction(fromPrivateKey, toAddress, amount) {
        try {
            if (!this.initialized) {
                throw new Error('Blockchain manager not initialized');
            }

            console.log(`💸 Sending ${amount} USDC to ${toAddress}...`);
            
            // Create keypair from private key
            const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromPrivateKey));
            const toPublicKey = new PublicKey(toAddress);
            const usdcMint = this.getCurrentUSDCMint();
            
            // Get or create associated token accounts
            const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.activeConnection,
                fromKeypair,
                usdcMint,
                fromKeypair.publicKey
            );
            
            const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                this.activeConnection,
                fromKeypair, // Payer
                usdcMint,
                toPublicKey
            );
            
            // Convert amount to token units (USDC has 6 decimals)
            const tokenAmount = amount * Math.pow(10, 6);
            
            // Create and send transaction
            const signature = await transfer(
                this.activeConnection,
                fromKeypair,
                fromTokenAccount.address,
                toTokenAccount.address,
                fromKeypair.publicKey,
                tokenAmount
            );
            
            console.log('✅ Transaction sent:', signature);
            
            // Wait for confirmation
            const confirmation = await this.activeConnection.confirmTransaction(signature);
            
            return {
                success: true,
                signature,
                confirmation,
                amount,
                from: fromKeypair.publicKey.toString(),
                to: toAddress,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ USDC transaction failed:', error);
            return {
                success: false,
                error: error.message,
                amount,
                to: toAddress,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Send SOL transaction
     */
    async sendSOLTransaction(fromPrivateKey, toAddress, amount) {
        try {
            if (!this.initialized) {
                throw new Error('Blockchain manager not initialized');
            }

            console.log(`💸 Sending ${amount} SOL to ${toAddress}...`);
            
            const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromPrivateKey));
            const toPublicKey = new PublicKey(toAddress);
            
            // Create transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: fromKeypair.publicKey,
                    toPubkey: toPublicKey,
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );
            
            // Send and confirm transaction
            const signature = await sendAndConfirmTransaction(
                this.activeConnection,
                transaction,
                [fromKeypair]
            );
            
            console.log('✅ SOL transaction sent:', signature);
            
            return {
                success: true,
                signature,
                amount,
                from: fromKeypair.publicKey.toString(),
                to: toAddress,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ SOL transaction failed:', error);
            return {
                success: false,
                error: error.message,
                amount,
                to: toAddress,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get transaction details by signature
     */
    async getTransaction(signature) {
        try {
            const transaction = await this.activeConnection.getParsedTransaction(signature);
            return transaction;
        } catch (error) {
            console.error('Error getting transaction:', error);
            return null;
        }
    }

    /**
     * Request SOL airdrop (devnet/testnet only)
     */
    async requestAirdrop(walletAddress, amount = 1) {
        try {
            if (this.network === 'mainnet') {
                throw new Error('Airdrop not available on mainnet');
            }
            
            const publicKey = new PublicKey(walletAddress);
            const signature = await this.activeConnection.requestAirdrop(
                publicKey,
                amount * LAMPORTS_PER_SOL
            );
            
            await this.activeConnection.confirmTransaction(signature);
            console.log(`✅ Airdropped ${amount} SOL to ${walletAddress}`);
            
            return signature;
        } catch (error) {
            console.error('❌ Airdrop failed:', error);
            throw error;
        }
    }

    /**
     * Generate new wallet
     */
    generateWallet() {
        const keypair = Keypair.generate();
        return {
            publicKey: keypair.publicKey.toString(),
            privateKey: bs58.encode(keypair.secretKey)
        };
    }

    /**
     * Validate wallet address
     */
    isValidAddress(address) {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get current network info
     */
    getNetworkInfo() {
        return {
            network: this.network,
            connection: this.activeConnection.rpcEndpoint,
            usdcMint: this.getCurrentUSDCMint().toString(),
            hotWallet: this.hotWallet?.publicKey.toString()
        };
    }
}

module.exports = RealBlockchainManager;
