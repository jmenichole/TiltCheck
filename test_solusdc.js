/**
 * Test script for SOLUSDC functionality
 */

const CryptoTipManager = require('./cryptoTipManager');
const CryptoTipAdmin = require('./cryptoTipAdmin');

async function testSOLUSDC() {
    console.log('🧪 Testing SOLUSDC Functionality...');
    
    try {
        // Initialize managers
        const tipManager = new CryptoTipManager();
        const tipAdmin = new CryptoTipAdmin(tipManager);
        
        console.log('✅ Managers initialized successfully');
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test users
        const aliceId = '123456789';
        const bobId = '987654321';
        
        // Add SOLUSDC to Alice
        console.log('📝 Adding 100 SOLUSDC to Alice...');
        await tipManager.addUserBalance(aliceId, 'SOLUSDC', 100);
        
        // Check Alice's balance
        const aliceBalance = tipManager.getUserBalance(aliceId, 'SOLUSDC');
        console.log(`💰 Alice's SOLUSDC balance: ${aliceBalance}`);
        
        // Simulate SOLUSDC tip from Alice to Bob
        console.log('📤 Simulating SOLUSDC tip from Alice to Bob...');
        
        // Deduct from Alice
        const tipAmount = 25;
        const newAliceBalance = aliceBalance - tipAmount;
        tipManager.setUserBalance(aliceId, 'SOLUSDC', newAliceBalance);
        
        // Add to Bob
        const bobBalance = tipManager.getUserBalance(bobId, 'SOLUSDC');
        const newBobBalance = bobBalance + tipAmount;
        tipManager.setUserBalance(bobId, 'SOLUSDC', newBobBalance);
        
        // Create tip record
        const tipRecord = {
            id: `tip_${Date.now()}_test`,
            fromUserId: aliceId,
            fromUsername: 'Alice',
            toUserId: bobId,
            toUsername: 'Bob',
            amount: tipAmount,
            chain: 'SOLUSDC',
            status: 'completed',
            timestamp: new Date().toISOString()
        };
        
        tipManager.tipHistory.set(tipRecord.id, tipRecord);
        await tipManager.saveTipData();
        
        // Verify balances
        console.log(`💰 Alice's new SOLUSDC balance: ${tipManager.getUserBalance(aliceId, 'SOLUSDC')}`);
        console.log(`💰 Bob's new SOLUSDC balance: ${tipManager.getUserBalance(bobId, 'SOLUSDC')}`);
        
        // Test tip statistics
        const aliceSent = tipManager.getTotalTipsSent(aliceId);
        const bobReceived = tipManager.getTotalTipsReceived(bobId);
        
        console.log(`📊 Alice total sent: ${aliceSent}`);
        console.log(`📊 Bob total received: ${bobReceived}`);
        
        // Test price calculation
        const price = tipManager.getMockPrice('SOLUSDC');
        console.log(`💵 SOLUSDC price: $${price}`);
        
        console.log('🎉 SOLUSDC testing completed successfully!');
        console.log('\n🚀 Ready-to-use SOLUSDC commands:');
        console.log('  Admin: $solusdc add 100');
        console.log('  User: $solusdc send @user 10');
        console.log('  User: $solusdc balance');
        console.log('  User: $tip @user 10 SOLUSDC');
        
    } catch (error) {
        console.error('❌ SOLUSDC test failed:', error);
    }
}

// Run the test
testSOLUSDC().then(() => {
    console.log('SOLUSDC test finished');
    process.exit(0);
}).catch(error => {
    console.error('SOLUSDC test error:', error);
    process.exit(1);
});
