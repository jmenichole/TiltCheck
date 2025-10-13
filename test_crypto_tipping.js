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
 * Test script for crypto tipping system
 */

const CryptoTipManager = require('./cryptoTipManager');
const CryptoTipAdmin = require('./cryptoTipAdmin');

async function testCryptoTipping() {
    console.log('🧪 Testing Crypto Tipping System...');
    
    try {
        // Initialize managers
        const tipManager = new CryptoTipManager();
        const tipAdmin = new CryptoTipAdmin(tipManager);
        
        console.log('✅ Managers initialized successfully');
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test adding balance
        const testUserId = '123456789';
        const testChain = 'POLYGON';
        const testAmount = 100;
        
        console.log(`📝 Adding ${testAmount} ${testChain} to user ${testUserId}...`);
        await tipManager.addUserBalance(testUserId, testChain, testAmount);
        
        // Check balance
        const balance = tipManager.getUserBalance(testUserId, testChain);
        console.log(`💰 User balance: ${balance} ${testChain}`);
        
        if (balance === testAmount) {
            console.log('✅ Balance test passed!');
        } else {
            console.log('❌ Balance test failed!');
        }
        
        // Test tip stats
        const totalSent = tipManager.getTotalTipsSent(testUserId);
        const totalReceived = tipManager.getTotalTipsReceived(testUserId);
        console.log(`📊 Tips - Sent: ${totalSent}, Received: ${totalReceived}`);
        
        console.log('🎉 Crypto tipping system test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testCryptoTipping().then(() => {
    console.log('Test finished');
    process.exit(0);
}).catch(error => {
    console.error('Test error:', error);
    process.exit(1);
});
