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
 * Script to add balances for new Discord users
 * Usage: node add_user_balance.js <discordId> <chain> <amount>
 * Example: node add_user_balance.js 123456789 SOLUSDC 100
 */

const CryptoTipManager = require('./cryptoTipManager');

async function addUserBalance() {
    const args = process.argv.slice(2);
    
    if (args.length !== 3) {
        console.log('❌ Usage: node add_user_balance.js <discordId> <chain> <amount>');
        console.log('📋 Available chains: ETHEREUM, POLYGON, BSC, ARBITRUM, AVALANCHE, SOLANA, TRON, SOLUSDC');
        console.log('💡 Example: node add_user_balance.js 123456789 SOLUSDC 100');
        return;
    }

    const [discordId, chain, amount] = args;
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
        console.log('❌ Amount must be a valid number');
        return;
    }

    try {
        console.log('🔧 Initializing crypto system...');
        const tipManager = new CryptoTipManager();
        await tipManager.initializeTipManager();
        
        console.log(`💰 Adding ${numAmount} ${chain} to Discord ID: ${discordId}`);
        await tipManager.addUserBalance(discordId, chain, numAmount);
        
        const newBalance = tipManager.getUserBalance(discordId, chain);
        console.log(`✅ Success! New ${chain} balance: ${newBalance}`);
        
        // Show all balances for this user
        console.log(`\n📊 All balances for Discord ID ${discordId}:`);
        const chains = ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'AVALANCHE', 'SOLANA', 'TRON', 'SOLUSDC'];
        for (const chainName of chains) {
            const balance = tipManager.getUserBalance(discordId, chainName);
            if (balance > 0) {
                console.log(`   ${chainName}: ${balance}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error adding balance:', error);
    }
}

addUserBalance().then(() => process.exit(0)).catch(error => {
    console.error('Script error:', error);
    process.exit(1);
});
