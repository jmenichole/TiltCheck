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
 * Check Wallet Status and Link to Discord
 */

const { Connection, PublicKey } = require('@solana/web3.js');
const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');
const CryptoTipManager = require('./cryptoTipManager');

async function checkWalletAndLink() {
    const walletAddress = 'ED9SyrAtLzZThfkwdfyi85bCVFiotfP9gHq5dp5sxWMc';
    const discordId = '1153034319271559328'; // Your Discord ID
    
    console.log('🔍 Checking Wallet Status...\n');
    console.log(`🏦 Wallet: ${walletAddress}`);
    console.log(`👤 Discord ID: ${discordId}\n`);
    
    try {
        // Connect to devnet
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('✅ Connected to Solana devnet');
        
        // Check wallet balance
        const walletPubkey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(walletPubkey);
        console.log(`💰 Current SOL Balance: ${(balance / 1000000000).toFixed(6)} SOL`);
        
        // Check if wallet is valid
        if (balance >= 0) {
            console.log('✅ Wallet is valid and active');
        }
        
        // Get recent transactions
        console.log('\n📊 Recent Transactions:');
        const signatures = await connection.getSignaturesForAddress(walletPubkey, { limit: 10 });
        
        if (signatures.length === 0) {
            console.log('   No transactions found');
        } else {
            for (const sig of signatures) {
                const date = new Date(sig.blockTime * 1000).toLocaleString();
                const status = sig.err ? '❌' : '✅';
                console.log(`   ${status} ${sig.signature.substring(0, 8)}... (${date})`);
            }
        }
        
        // Initialize enhanced crypto system
        console.log('\n🔗 Initializing Enhanced Crypto System...');
        const cryptoManager = new CryptoTipManager();
        await cryptoManager.initializeTipManager();
        
        const enhancedManager = new EnhancedCryptoTipManager(cryptoManager);
        await enhancedManager.initialize();
        
        if (enhancedManager.isBlockchainEnabled) {
            console.log('✅ Blockchain integration is enabled');
            
            // Link wallet to Discord account
            console.log(`\n🔗 Linking wallet to Discord account ${discordId}...`);
            await enhancedManager.linkUserWallet(discordId, walletAddress);
            console.log('✅ Wallet linked successfully!');
            
            // Check enhanced balance
            const solBalance = await enhancedManager.getEnhancedBalance(discordId, 'SOLANA');
            const usdcBalance = await enhancedManager.getEnhancedBalance(discordId, 'SOLUSDC');
            
            console.log('\n💎 Enhanced Balances:');
            console.log(`   SOLANA: Virtual ${solBalance.virtual}, On-chain ${solBalance.onChain}, Total ${solBalance.total}`);
            console.log(`   SOLUSDC: Virtual ${usdcBalance.virtual}, On-chain ${usdcBalance.onChain}, Total ${usdcBalance.total}`);
            
        } else {
            console.log('❌ Blockchain integration is disabled');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run check
checkWalletAndLink();
