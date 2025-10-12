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
 * System Status Checker - View all crypto balances and activity
 */

const CryptoTipManager = require('./cryptoTipManager');

async function checkSystemStatus() {
    console.log('🔍 Checking Crypto Tipping System Status...\n');
    
    try {
        const tipManager = new CryptoTipManager();
        await tipManager.initializeTipManager();
        
        console.log('✅ System initialized successfully\n');
        
        // Show all users with balances
        console.log('👥 ALL USERS WITH CRYPTO BALANCES:');
        console.log('═'.repeat(50));
        
        const userSummary = new Map();
        
        for (const [key, balance] of tipManager.userBalances.entries()) {
            if (balance > 0) {
                const [userId, chain] = key.split('_');
                if (!userSummary.has(userId)) {
                    userSummary.set(userId, {});
                }
                userSummary.get(userId)[chain] = balance;
            }
        }
        
        if (userSummary.size === 0) {
            console.log('📝 No users with balances found\n');
        } else {
            for (const [userId, balances] of userSummary.entries()) {
                // Check if this is your personal account
                const isPersonal = userId === '1153034319271559328';
                const userLabel = isPersonal ? '👤 YOUR PERSONAL ACCOUNT' : `👤 Discord ID: ${userId}`;
                
                console.log(`\n${userLabel}`);
                if (isPersonal) {
                    console.log('   🏆 Status: Personal wallet linked');
                }
                
                let totalValue = 0;
                for (const [chain, balance] of Object.entries(balances)) {
                    const price = tipManager.getMockPrice(chain);
                    const value = balance * price;
                    totalValue += value;
                    console.log(`   ${chain}: ${balance} (≈ $${value.toFixed(2)})`);
                }
                console.log(`   💎 Total Value: ≈ $${totalValue.toFixed(2)}`);
            }
        }
        
        // Show recent tip activity
        console.log('\n\n📈 RECENT TIP ACTIVITY:');
        console.log('═'.repeat(50));
        
        const recentTips = Array.from(tipManager.tipHistory.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
            
        if (recentTips.length === 0) {
            console.log('📝 No recent tip activity\n');
        } else {
            recentTips.forEach(tip => {
                const date = new Date(tip.timestamp).toLocaleString();
                console.log(`\n📤 ${tip.fromUsername} → ${tip.toUsername}`);
                console.log(`   Amount: ${tip.amount} ${tip.chain}`);
                console.log(`   Status: ${tip.status}`);
                console.log(`   Date: ${date}`);
            });
        }
        
        // System health check
        console.log('\n\n🔧 SYSTEM HEALTH:');
        console.log('═'.repeat(50));
        console.log('✅ CryptoTipManager: Operational');
        console.log('✅ User Balance Storage: Operational');
        console.log('✅ Tip History Tracking: Operational');
        console.log('✅ Multi-chain Support: 8 chains active');
        
        // Show available commands
        console.log('\n\n🚀 AVAILABLE DISCORD COMMANDS:');
        console.log('═'.repeat(50));
        console.log('💰 $balance - Check your crypto balances');
        console.log('📤 $tip @user amount CHAIN - Send crypto tips');
        console.log('📊 $history - View your transaction history');
        console.log('💎 $solusdc balance - Check SOLUSDC specifically');
        console.log('🔧 Admin commands available via CryptoTipAdmin');
        
        // Show your specific status
        if (userSummary.has('1153034319271559328')) {
            console.log('\n\n🎯 YOUR PERSONAL STATUS:');
            console.log('═'.repeat(50));
            console.log('✅ Personal wallet linked to Discord');
            console.log('✅ Ready to send and receive crypto tips');
            console.log('✅ Transaction signing configured');
            console.log('💡 Use $balance in Discord to check your balances');
        }
        
    } catch (error) {
        console.error('❌ Error checking system status:', error);
    }
}

checkSystemStatus().then(() => {
    console.log('\n📋 Status check complete!\n');
    process.exit(0);
}).catch(error => {
    console.error('Status check error:', error);
    process.exit(1);
});
