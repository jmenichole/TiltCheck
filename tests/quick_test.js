/**
 * Quick test to verify crypto commands work
 */

const CryptoTipManager = require('./cryptoTipManager');

async function quickTest() {
    console.log('🧪 Quick Crypto Command Test...');
    
    try {
        const tipManager = new CryptoTipManager();
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test basic functionality
        const testUserId = '123456789';
        
        // Add balance
        await tipManager.addUserBalance(testUserId, 'SOLUSDC', 100);
        console.log('✅ Balance added successfully');
        
        // Check balance
        const balance = tipManager.getUserBalance(testUserId, 'SOLUSDC');
        console.log(`✅ Balance retrieved: ${balance} SOLUSDC`);
        
        // Test price
        const price = tipManager.getMockPrice('SOLUSDC');
        console.log(`✅ Price function works: $${price}`);
        
        console.log('\n🎉 Basic crypto system is working!');
        console.log('\n🚀 Try these commands in Discord:');
        console.log('  $balance - Check your crypto balances');
        console.log('  $solusdc - Show SOLUSDC help');
        console.log('  !help - Show all commands');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

quickTest();
