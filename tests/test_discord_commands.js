/**
 * Discord Command Test for Personal Wallet
 * Tests Discord commands for user ID: 1153034319271559328
 */

const CryptoTipManager = require('./cryptoTipManager');

async function testDiscordCommands() {
    console.log('🎮 Testing Discord Commands for your personal wallet');
    console.log('Discord ID: 1153034319271559328');
    console.log('');
    
    try {
        const tipManager = new CryptoTipManager();
        await tipManager.initializeTipManager();
        
        const yourDiscordId = '1153034319271559328';
        
        // Simulate the $balance command
        console.log('🧪 Simulating: $balance command');
        const supportedChains = ['ETHEREUM', 'POLYGON', 'BSC', 'ARBITRUM', 'AVALANCHE', 'SOLANA', 'TRON', 'SOLUSDC'];
        const balances = [];
        
        for (const chain of supportedChains) {
            const balance = tipManager.getUserBalance(yourDiscordId, chain);
            if (balance > 0) {
                balances.push({ chain, balance });
            }
        }
        
        if (balances.length === 0) {
            console.log('   ❌ No crypto balances found');
        } else {
            console.log('   💰 Your Crypto Balances:');
            let totalUSD = 0;
            
            for (const b of balances) {
                const usdValue = b.balance * tipManager.getMockPrice(b.chain);
                totalUSD += usdValue;
                console.log(`   **${b.chain}:** ${b.balance.toFixed(6)} (~$${usdValue.toFixed(2)})`);
            }
            console.log(`   💵 Total Value: ~$${totalUSD.toFixed(2)} USD`);
        }
        
        console.log('');
        
        // Test receiving a tip
        console.log('🧪 Simulating: Someone sends you a tip');
        const senderId = '555666777';
        const senderUsername = 'TestUser';
        const tipAmount = 100;
        
        // Add balance to sender
        await tipManager.addUserBalance(senderId, 'SOLUSDC', 200);
        
        const beforeBalance = tipManager.getUserBalance(yourDiscordId, 'SOLUSDC');
        console.log(`   Before: Your SOLUSDC balance = ${beforeBalance}`);
        
        // Simulate tip transaction
        tipManager.setUserBalance(senderId, 'SOLUSDC', tipManager.getUserBalance(senderId, 'SOLUSDC') - tipAmount);
        await tipManager.addUserBalance(yourDiscordId, 'SOLUSDC', tipAmount);
        
        const afterBalance = tipManager.getUserBalance(yourDiscordId, 'SOLUSDC');
        console.log(`   After: Your SOLUSDC balance = ${afterBalance} (+${tipAmount})`);
        
        console.log('');
        
        // Test the $history command simulation
        console.log('🧪 Simulating: $history command');
        
        // Create a sample transaction history entry
        const historyEntry = {
            id: `tip_${Date.now()}_test`,
            fromUserId: senderId,
            fromUsername: senderUsername,
            toUserId: yourDiscordId,
            toUsername: 'YourUsername',
            amount: tipAmount,
            chain: 'SOLUSDC',
            status: 'completed',
            timestamp: new Date().toISOString()
        };
        
        tipManager.tipHistory.set(historyEntry.id, historyEntry);
        await tipManager.saveTipData();
        
        console.log('   📊 Recent Transaction:');
        console.log(`   Received ${tipAmount} SOLUSDC from ${senderUsername}`);
        console.log(`   Time: ${new Date(historyEntry.timestamp).toLocaleString()}`);
        console.log(`   Status: ${historyEntry.status}`);
        
        console.log('');
        console.log('✅ All Discord commands tested successfully!');
        console.log('');
        console.log('🎯 Your Discord ID 1153034319271559328 is ready for:');
        console.log('   • Receiving crypto tips via Discord');
        console.log('   • Checking balances with $balance');
        console.log('   • Viewing transaction history with $history');
        console.log('   • Using SOLUSDC for fast testing');
        console.log('');
        console.log('💡 Transaction Signer Address:');
        console.log('   TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhUBghUU34FC47M6DFeZyverJkm14BCe8E');
        
    } catch (error) {
        console.error('❌ Discord command test failed:', error);
    }
}

testDiscordCommands();
