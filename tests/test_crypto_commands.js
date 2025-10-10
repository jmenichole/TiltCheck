#!/usr/bin/env node

// Quick test of crypto commands
const CryptoTipManager = require('./cryptoTipManager');
const CryptoTipAdmin = require('./cryptoTipAdmin');

async function quickTest() {
    console.log('🧪 Testing Crypto Commands...');
    
    try {
        const tipManager = new CryptoTipManager();
        await tipManager.initializeTipManager();
        
        const tipAdmin = new CryptoTipAdmin(tipManager);
        
        console.log('✅ CryptoTipManager initialized successfully');
        console.log('✅ CryptoTipAdmin initialized successfully');
        
        // Test adding balance
        const testUserId = '123456789';
        await tipManager.addUserBalance(testUserId, 'SOLUSDC', 100);
        
        const balance = tipManager.getUserBalance(testUserId, 'SOLUSDC');
        console.log(`✅ Balance test: ${balance} SOLUSDC`);
        
        if (balance === 100) {
            console.log('🎉 All systems working! Discord bot should now respond to $balance command.');
        } else {
            console.log('❌ Balance test failed');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

quickTest();
