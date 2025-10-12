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
 * Personal Wallet Configuration for Discord ID: 1153034319271559328
 * This file links your Discord account to crypto wallets and transaction signing
 */

const CryptoTipManager = require('./cryptoTipManager');
const CryptoTipAdmin = require('./cryptoTipAdmin');

// Your personal Discord configuration
const PERSONAL_CONFIG = {
    discordId: '1153034319271559328',
    username: 'YourUsername', // Update this with your actual Discord username
    preferredChain: 'SOLUSDC',
    
    // Wallet addresses (these will be generated/linked)
    wallets: {
        SOLUSDC: null,  // Will be generated
        ETHEREUM: null,
        POLYGON: null,
        SOLANA: null
    },
    
    // Transaction signing configuration
    transactionSigner: {
        // This will use the payment signer for receiving transactions
        receiverAddress: process.env.PAYMENT_SIGNER || 'TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhUBghUU34FC47M6DFeZyverJkm14BCe8E',
        signerRole: 'receiver' // You are the transaction receiver
    }
};

async function setupPersonalWallet() {
    console.log('🔗 Setting up personal wallet linkage...');
    console.log(`👤 Discord ID: ${PERSONAL_CONFIG.discordId}`);
    console.log(`💎 Preferred Chain: ${PERSONAL_CONFIG.preferredChain}`);
    console.log(`📍 Receiver Address: ${PERSONAL_CONFIG.transactionSigner.receiverAddress}`);
    
    try {
        // Initialize crypto systems
        const tipManager = new CryptoTipManager();
        await tipManager.initializeTipManager();
        const tipAdmin = new CryptoTipAdmin(tipManager);
        
        console.log('✅ Crypto systems initialized');
        
        // Set up your initial balance
        const initialBalance = 5000; // Starting with 5000 SOLUSDC
        await tipManager.addUserBalance(PERSONAL_CONFIG.discordId, PERSONAL_CONFIG.preferredChain, initialBalance);
        
        // Verify your balance
        const balance = tipManager.getUserBalance(PERSONAL_CONFIG.discordId, PERSONAL_CONFIG.preferredChain);
        console.log(`💰 Your ${PERSONAL_CONFIG.preferredChain} balance: ${balance}`);
        
        // Set up wallet linking in the system
        console.log('🔧 Configuring wallet linkage...');
        
        // Create a wallet entry for your Discord ID
        const walletData = {
            discordId: PERSONAL_CONFIG.discordId,
            username: PERSONAL_CONFIG.username,
            walletAddress: PERSONAL_CONFIG.transactionSigner.receiverAddress,
            preferredChain: PERSONAL_CONFIG.preferredChain,
            role: 'receiver',
            setupDate: new Date().toISOString(),
            balances: {}
        };
        
        // Add balances for all supported chains
        const supportedChains = ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'AVALANCHE', 'SOLANA', 'TRON', 'SOLUSDC'];
        for (const chain of supportedChains) {
            walletData.balances[chain] = tipManager.getUserBalance(PERSONAL_CONFIG.discordId, chain);
        }
        
        console.log('✅ Personal wallet configuration complete!');
        console.log('\n📋 Your Wallet Information:');
        console.log(`   Discord ID: ${walletData.discordId}`);
        console.log(`   Wallet Address: ${walletData.walletAddress}`);
        console.log(`   Preferred Chain: ${walletData.preferredChain}`);
        console.log(`   Current ${PERSONAL_CONFIG.preferredChain} Balance: ${balance}`);
        
        console.log('\n🚀 Commands you can use in Discord:');
        console.log(`   $balance - Check your crypto balances`);
        console.log(`   $tip @user amount SOLUSDC - Send SOLUSDC tips`);
        console.log(`   $history - View your transaction history`);
        console.log(`   $solusdc balance - Check SOLUSDC specifically`);
        
        console.log('\n📨 For others to send you crypto:');
        console.log(`   $tip @<${PERSONAL_CONFIG.discordId}> amount SOLUSDC`);
        console.log(`   Or: $tip @YourUsername amount SOLUSDC`);
        
        return walletData;
        
    } catch (error) {
        console.error('❌ Failed to setup personal wallet:', error);
        throw error;
    }
}

// Test receiving a transaction
async function testReceiveTransaction() {
    console.log('\n🧪 Testing transaction receiving...');
    
    try {
        const tipManager = new CryptoTipManager();
        await tipManager.initializeTipManager();
        
        // Simulate someone sending you SOLUSDC
        const senderId = '999888777';  // Test sender
        const senderUsername = 'TestSender';
        const amount = 50;
        
        console.log(`📤 Simulating: ${senderUsername} sends you ${amount} SOLUSDC`);
        
        // Add balance to sender first
        await tipManager.addUserBalance(senderId, 'SOLUSDC', 100);
        
        // Get balances before transaction
        const yourBalanceBefore = tipManager.getUserBalance(PERSONAL_CONFIG.discordId, 'SOLUSDC');
        const senderBalanceBefore = tipManager.getUserBalance(senderId, 'SOLUSDC');
        
        console.log(`💰 Before - Your balance: ${yourBalanceBefore} SOLUSDC`);
        console.log(`💰 Before - Sender balance: ${senderBalanceBefore} SOLUSDC`);
        
        // Execute the transaction
        tipManager.setUserBalance(senderId, 'SOLUSDC', senderBalanceBefore - amount);
        await tipManager.addUserBalance(PERSONAL_CONFIG.discordId, 'SOLUSDC', amount);
        
        // Check balances after transaction
        const yourBalanceAfter = tipManager.getUserBalance(PERSONAL_CONFIG.discordId, 'SOLUSDC');
        const senderBalanceAfter = tipManager.getUserBalance(senderId, 'SOLUSDC');
        
        console.log(`💰 After - Your balance: ${yourBalanceAfter} SOLUSDC (+${amount})`);
        console.log(`💰 After - Sender balance: ${senderBalanceAfter} SOLUSDC (-${amount})`);
        
        // Create transaction record
        const transactionRecord = {
            id: `tx_${Date.now()}_personal`,
            fromUserId: senderId,
            fromUsername: senderUsername,
            toUserId: PERSONAL_CONFIG.discordId,
            toUsername: PERSONAL_CONFIG.username,
            amount: amount,
            chain: 'SOLUSDC',
            status: 'completed',
            signerAddress: PERSONAL_CONFIG.transactionSigner.receiverAddress,
            timestamp: new Date().toISOString()
        };
        
        tipManager.tipHistory.set(transactionRecord.id, transactionRecord);
        await tipManager.saveTipData();
        
        console.log('✅ Transaction completed and recorded!');
        console.log(`📍 Signed to address: ${PERSONAL_CONFIG.transactionSigner.receiverAddress}`);
        
    } catch (error) {
        console.error('❌ Transaction test failed:', error);
    }
}

// Run the setup
async function main() {
    console.log('🏦 Personal Crypto Wallet Setup for Discord ID: 1153034319271559328');
    console.log('=' .repeat(70));
    
    try {
        // Setup your personal wallet
        const walletData = await setupPersonalWallet();
        
        // Test receiving a transaction
        await testReceiveTransaction();
        
        console.log('\n🎉 Setup Complete! Your Discord ID is now linked to crypto wallets.');
        console.log('💡 You can now receive crypto tips in Discord using your Discord ID.');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

// Export for use in other files
module.exports = {
    PERSONAL_CONFIG,
    setupPersonalWallet,
    testReceiveTransaction
};

// Run if this file is executed directly
if (require.main === module) {
    main().then(() => {
        console.log('Personal wallet setup finished');
        process.exit(0);
    }).catch(error => {
        console.error('Personal wallet setup error:', error);
        process.exit(1);
    });
}
