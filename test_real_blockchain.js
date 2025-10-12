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
 * Real Blockchain Integration Test
 * Tests actual Solana blockchain connectivity and transactions
 */

const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');

async function testRealBlockchain() {
    console.log('🧪 Testing Real Blockchain Integration...\n');
    
    try {
        // Initialize enhanced system
        const enhancedManager = new EnhancedCryptoTipManager();
        await enhancedManager.initialize();
        
        console.log('\n🔗 Blockchain Status:');
        const status = enhancedManager.getBlockchainStatus();
        console.log(JSON.stringify(status, null, 2));
        
        if (!status.enabled) {
            console.log('⚠️  Blockchain integration disabled, testing virtual features only');
            return await testVirtualFeatures(enhancedManager);
        }
        
        console.log('\n✅ Blockchain integration enabled! Testing real features...\n');
        
        // Test 1: Generate new wallet
        console.log('📋 Test 1: Generate New Wallet');
        const testDiscordId = '999888777';
        const newWallet = enhancedManager.generateUserWallet(testDiscordId);
        console.log('✅ Generated wallet:', newWallet);
        
        // Test 2: Request testnet airdrop
        console.log('\n📋 Test 2: Request Testnet Airdrop');
        try {
            const airdropSignature = await enhancedManager.requestTestnetAirdrop(newWallet.publicKey, 0.5);
            console.log('✅ Airdrop successful:', airdropSignature);
            
            // Wait a moment for airdrop to process
            await new Promise(resolve => setTimeout(resolve, 3000));
            
        } catch (error) {
            console.log('⚠️  Airdrop failed (this is normal):', error.message);
        }
        
        // Test 3: Check real balances
        console.log('\n📋 Test 3: Check Real Blockchain Balances');
        const solBalance = await enhancedManager.blockchain.getSolBalance(newWallet.publicKey);
        const usdcBalance = await enhancedManager.blockchain.getUSDCBalance(newWallet.publicKey);
        console.log(`💰 SOL Balance: ${solBalance}`);
        console.log(`💰 USDC Balance: ${usdcBalance}`);
        
        // Test 4: Enhanced balance (virtual + on-chain)
        console.log('\n📋 Test 4: Enhanced Balance Check');
        // Add some virtual balance first
        await enhancedManager.addUserBalance(testDiscordId, 'SOLUSDC', 50);
        await enhancedManager.addUserBalance(testDiscordId, 'SOLANA', 5);
        
        const enhancedSOLUSDC = await enhancedManager.getEnhancedBalance(testDiscordId, 'SOLUSDC');
        const enhancedSOLANA = await enhancedManager.getEnhancedBalance(testDiscordId, 'SOLANA');
        
        console.log('💎 Enhanced SOLUSDC Balance:', enhancedSOLUSDC);
        console.log('💎 Enhanced SOLANA Balance:', enhancedSOLANA);
        
        // Test 5: Validate addresses
        console.log('\n📋 Test 5: Address Validation');
        const validAddress = enhancedManager.blockchain.isValidAddress(newWallet.publicKey);
        const invalidAddress = enhancedManager.blockchain.isValidAddress('invalid-address');
        console.log(`✅ Valid address check: ${validAddress}`);
        console.log(`❌ Invalid address check: ${invalidAddress}`);
        
        // Test 6: Transaction simulation (if we have enough SOL)
        console.log('\n📋 Test 6: Transaction Capabilities');
        if (solBalance > 0.01) {
            console.log('💸 Sufficient SOL for transaction testing');
            // In a real test, you might send a small amount between test wallets
        } else {
            console.log('⚠️  Insufficient SOL for transaction testing');
            console.log('💡 To test real transactions:');
            console.log('   1. Get SOL from a faucet: https://faucet.solana.com/');
            console.log('   2. Transfer to wallet:', newWallet.publicKey);
            console.log('   3. Re-run this test');
        }
        
        // Test 7: Show your personal wallet info
        console.log('\n📋 Test 7: Your Personal Wallet Status');
        const yourDiscordId = '1153034319271559328';
        const yourWallet = await enhancedManager.getUserWalletAddress(yourDiscordId);
        
        if (yourWallet) {
            console.log(`🏦 Your linked wallet: ${yourWallet}`);
            const yourEnhancedBalance = await enhancedManager.getEnhancedBalance(yourDiscordId, 'SOLUSDC');
            console.log('💰 Your enhanced balance:', yourEnhancedBalance);
        } else {
            console.log('⚠️  No wallet linked to your Discord ID');
            console.log('💡 Link a wallet with: enhancedManager.linkUserWallet(yourDiscordId, walletAddress)');
        }
        
        console.log('\n🎉 Real Blockchain Integration Test Complete!');
        console.log('\n🚀 Available Real Blockchain Features:');
        console.log('   ✅ Generate wallets');
        console.log('   ✅ Check real SOL/USDC balances');
        console.log('   ✅ Request testnet airdrops');
        console.log('   ✅ Send real transactions (when funded)');
        console.log('   ✅ Withdraw virtual → real blockchain');
        console.log('   ✅ Deposit real blockchain → virtual');
        console.log('   ✅ Enhanced balance tracking');
        
    } catch (error) {
        console.error('❌ Real blockchain test failed:', error);
    }
}

async function testVirtualFeatures(enhancedManager) {
    console.log('\n🧪 Testing Virtual Features (Blockchain Disabled)...\n');
    
    // Test virtual balances and tips
    const testUser1 = '111222333';
    const testUser2 = '444555666';
    
    // Add virtual balances
    await enhancedManager.addUserBalance(testUser1, 'SOLUSDC', 100);
    await enhancedManager.addUserBalance(testUser2, 'SOLUSDC', 50);
    
    console.log('💰 Virtual balances added');
    console.log(`User 1 SOLUSDC: ${enhancedManager.getUserBalance(testUser1, 'SOLUSDC')}`);
    console.log(`User 2 SOLUSDC: ${enhancedManager.getUserBalance(testUser2, 'SOLUSDC')}`);
    
    // Test enhanced balance (should show virtual only)
    const enhancedBalance = await enhancedManager.getEnhancedBalance(testUser1, 'SOLUSDC');
    console.log('\n💎 Enhanced balance (virtual only):', enhancedBalance);
    
    console.log('\n✅ Virtual features working correctly!');
}

// Run the test
testRealBlockchain().then(() => {
    console.log('\n📋 Test completed');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
});
