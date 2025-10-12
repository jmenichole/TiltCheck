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
 * Hot Wallet Linking & Airdrop Test for Devnet
 * This script links the user wallet to the hot wallet and requests airdrops
 */

const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58').default;

async function testHotWalletLinkingAndAirdrop() {
    console.log('🔗 Starting Hot Wallet Linking & Airdrop Test...\n');
    
    try {
        // Initialize enhanced crypto system
        const tipManager = new EnhancedCryptoTipManager();
        await tipManager.initialize();
        
        if (!tipManager.isBlockchainEnabled) {
            console.log('❌ Blockchain is not enabled. Cannot proceed with test.');
            return;
        }
        
        // Get blockchain status
        const status = tipManager.getBlockchainStatus();
        console.log('📋 Blockchain Status:');
        console.log(`   Network: ${status.network}`);
        console.log(`   Hot Wallet: ${status.hotWallet}`);
        console.log(`   USDC Mint: ${status.usdcMint}`);
        console.log('');
        
        // Test Discord user ID (replace with actual user's Discord ID)
        const testDiscordId = '1153034319271559328'; // Your Discord ID
        
        // Get user's linked wallet
        let userWalletAddress = await tipManager.getUserWalletAddress(testDiscordId);
        console.log('👤 Current User Wallet:', userWalletAddress || 'None linked');
        
        // If no wallet is linked, use the one we know about
        if (!userWalletAddress) {
            userWalletAddress = 'ED9SyrAtLzZThfkwdfyi85bCVFiotfP9gHq5dp5sxWMc';
            console.log('🔗 Linking wallet:', userWalletAddress);
            await tipManager.linkUserWallet(testDiscordId, userWalletAddress);
        }
        
        // Check initial balances
        console.log('\\n💰 Initial Balances:');
        
        // Hot wallet balances
        const hotWalletSol = await tipManager.blockchain.getSolBalance(status.hotWallet);
        const hotWalletUsdc = await tipManager.blockchain.getUSDCBalance(status.hotWallet);
        console.log(`   Hot Wallet SOL: ${hotWalletSol.toFixed(4)}`);
        console.log(`   Hot Wallet USDC: ${hotWalletUsdc.toFixed(2)}`);
        
        // User wallet balances
        const userSol = await tipManager.blockchain.getSolBalance(userWalletAddress);
        const userUsdc = await tipManager.blockchain.getUSDCBalance(userWalletAddress);
        console.log(`   User Wallet SOL: ${userSol.toFixed(4)}`);
        console.log(`   User Wallet USDC: ${userUsdc.toFixed(2)}`);
        
        // Enhanced balances (virtual + on-chain)
        const enhancedSolana = await tipManager.getEnhancedBalance(testDiscordId, 'SOLANA');
        const enhancedUsdc = await tipManager.getEnhancedBalance(testDiscordId, 'SOLUSDC');
        console.log(`   Enhanced SOLANA: Virtual=${enhancedSolana.virtual}, OnChain=${enhancedSolana.onChain}, Total=${enhancedSolana.total}`);
        console.log(`   Enhanced SOLUSDC: Virtual=${enhancedUsdc.virtual}, OnChain=${enhancedUsdc.onChain}, Total=${enhancedUsdc.total}`);
        
        // Request airdrop for hot wallet if needed
        console.log('\\n🚁 Airdrop Operations:');
        
        if (hotWalletSol < 1) {
            console.log('📡 Requesting airdrop for hot wallet...');
            try {
                const airdropSignature = await tipManager.requestTestnetAirdrop(status.hotWallet, 2);
                console.log(`   ✅ Hot wallet airdrop signature: ${airdropSignature}`);
                
                // Wait a bit for confirmation
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check new balance
                const newHotWalletSol = await tipManager.blockchain.getSolBalance(status.hotWallet);
                console.log(`   💰 Hot wallet new SOL balance: ${newHotWalletSol.toFixed(4)}`);
            } catch (error) {
                console.log(`   ❌ Hot wallet airdrop failed: ${error.message}`);
            }
        } else {
            console.log('✅ Hot wallet has sufficient SOL');
        }
        
        // Request airdrop for user wallet if needed
        if (userSol < 0.1) {
            console.log('📡 Requesting airdrop for user wallet...');
            try {
                const userAirdropSignature = await tipManager.requestTestnetAirdrop(userWalletAddress, 1);
                console.log(`   ✅ User wallet airdrop signature: ${userAirdropSignature}`);
                
                // Wait a bit for confirmation
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check new balance
                const newUserSol = await tipManager.blockchain.getSolBalance(userWalletAddress);
                console.log(`   💰 User wallet new SOL balance: ${newUserSol.toFixed(4)}`);
            } catch (error) {
                console.log(`   ❌ User wallet airdrop failed: ${error.message}`);
            }
        } else {
            console.log('✅ User wallet has sufficient SOL');
        }
        
        // Test wallet linking functionality
        console.log('\\n🔗 Testing Wallet Linking:');
        
        // Generate a new test wallet
        const newTestWallet = tipManager.generateUserWallet(testDiscordId);
        console.log(`   📝 Generated new wallet: ${newTestWallet.publicKey}`);
        console.log(`   🔑 Private key: ${newTestWallet.privateKey}`);
        
        // Link back to original wallet
        await tipManager.linkUserWallet(testDiscordId, userWalletAddress);
        console.log(`   🔗 Re-linked to original wallet: ${userWalletAddress}`);
        
        // Test enhanced balance after potential airdrops
        console.log('\\n💰 Final Enhanced Balances:');
        const finalSolana = await tipManager.getEnhancedBalance(testDiscordId, 'SOLANA');
        const finalUsdc = await tipManager.getEnhancedBalance(testDiscordId, 'SOLUSDC');
        console.log(`   Enhanced SOLANA: Virtual=${finalSolana.virtual}, OnChain=${finalSolana.onChain}, Total=${finalSolana.total}`);
        console.log(`   Enhanced SOLUSDC: Virtual=${finalUsdc.virtual}, OnChain=${finalUsdc.onChain}, Total=${finalUsdc.total}`);
        
        // Test withdrawal capability
        console.log('\\n💸 Testing Withdrawal Capability:');
        if (finalSolana.canWithdraw) {
            console.log('   ✅ Can withdraw SOLANA to blockchain');
        } else {
            console.log(`   ❌ Cannot withdraw SOLANA (need ${tipManager.withdrawalThreshold} minimum, have ${finalSolana.virtual} virtual)`);
        }
        
        if (finalUsdc.canWithdraw) {
            console.log('   ✅ Can withdraw SOLUSDC to blockchain');
        } else {
            console.log(`   ❌ Cannot withdraw SOLUSDC (need ${tipManager.withdrawalThreshold} minimum, have ${finalUsdc.virtual} virtual)`);
        }
        
        // Show hot wallet info for reference
        console.log('\\n🔥 Hot Wallet Information:');
        console.log(`   Address: ${status.hotWallet}`);
        
        // Get hot wallet private key (only for testing on devnet!)
        if (tipManager.blockchain.hotWallet) {
            const hotWalletPrivateKey = bs58.encode(tipManager.blockchain.hotWallet.secretKey);
            console.log(`   Private Key: ${hotWalletPrivateKey}`);
            console.log('   ⚠️  SAVE THIS KEY - needed for transactions!');
        }
        
        console.log('\\n✅ Hot Wallet Linking & Airdrop Test Complete!');
        console.log('\\n🎯 Next Steps:');
        console.log('   1. Test Discord commands: $balance, $wallet, $airdrop');
        console.log('   2. Try withdrawal: $withdraw SOLUSDC 10 <address>');
        console.log('   3. Verify transactions on Solana Explorer (devnet)');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
if (require.main === module) {
    testHotWalletLinkingAndAirdrop();
}

module.exports = { testHotWalletLinkingAndAirdrop };
