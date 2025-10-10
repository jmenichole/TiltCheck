#!/usr/bin/env node

/**
 * Quick setup script to link Discord ID 1153034319271559328 to crypto wallet
 */

const CryptoTipManager = require('./cryptoTipManager');
const CryptoTipAdmin = require('./cryptoTipAdmin');

async function quickPersonalSetup() {
    console.log('⚡ Quick Personal Wallet Setup');
    console.log('Discord ID: 1153034319271559328');
    console.log('Wallet Address: TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhUBghUU34FC47M6DFeZyverJkm14BCe8E');
    console.log('');
    
    try {
        // Initialize systems
        const tipManager = new CryptoTipManager();
        await tipManager.initializeTipManager();
        const tipAdmin = new CryptoTipAdmin(tipManager);
        
        const yourDiscordId = '1153034319271559328';
        
        // Add substantial SOLUSDC balance for testing
        await tipManager.addUserBalance(yourDiscordId, 'SOLUSDC', 10000);
        
        // Add smaller amounts to other chains
        await tipManager.addUserBalance(yourDiscordId, 'POLYGON', 500);
        await tipManager.addUserBalance(yourDiscordId, 'ETHEREUM', 10);
        await tipManager.addUserBalance(yourDiscordId, 'SOLANA', 100);
        
        // Check all balances
        const chains = ['SOLUSDC', 'POLYGON', 'ETHEREUM', 'SOLANA'];
        console.log('💰 Your crypto balances:');
        for (const chain of chains) {
            const balance = tipManager.getUserBalance(yourDiscordId, chain);
            if (balance > 0) {
                console.log(`   ${chain}: ${balance}`);
            }
        }
        
        console.log('');
        console.log('✅ Setup complete! You can now:');
        console.log('   1. Use $balance in Discord to check balances');
        console.log('   2. Receive tips with: $tip @<1153034319271559328> amount SOLUSDC');
        console.log('   3. Send tips with: $tip @username amount SOLUSDC');
        console.log('   4. Use $solusdc commands for fast testing');
        
        // Test the balance command functionality
        const totalBalance = tipManager.getUserBalance(yourDiscordId, 'SOLUSDC');
        console.log('');
        console.log(`🎯 Test: Your SOLUSDC balance is ${totalBalance} (should be > 10000)`);
        
        if (totalBalance >= 10000) {
            console.log('🎉 SUCCESS: Your Discord ID is properly linked and funded!');
        } else {
            console.log('⚠️  Warning: Balance is lower than expected');
        }
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

quickPersonalSetup();
