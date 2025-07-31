/**
 * Solana Command Helper - Proper CLI and Discord Bot Integration
 * This script helps with Solana operations and testing
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');

async function testSolanaOperations() {
    console.log('🔧 Testing Solana Operations and Commands...\n');
    
    const tipCCWallet = '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z';
    const phantomWallet = '6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB';
    const discordId = '1153034319271559328';
    
    try {
        // Initialize enhanced crypto system
        const tipManager = new EnhancedCryptoTipManager();
        await tipManager.initialize();
        
        console.log('✅ Enhanced Crypto System initialized');
        
        // Test Discord bot commands (these are the ones you should use in Discord)
        console.log('\n🤖 Discord Bot Commands to Use:\n');
        console.log('In your Discord server, try these commands:');
        console.log('   $balance');
        console.log('   $wallet');
        console.log('   $airdrop');
        console.log('   $withdraw SOLANA 10 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('   $tip @user 5 SOLUSDC');
        
        // Test virtual withdrawal simulation
        console.log('\n🧪 Testing Virtual Withdrawal (Simulation):\n');
        
        const enhancedSol = await tipManager.getEnhancedBalance(discordId, 'SOLANA');
        console.log(`Current SOLANA balance: Virtual=${enhancedSol.virtual}, OnChain=${enhancedSol.onChain}`);
        
        if (enhancedSol.virtual >= 10) {
            console.log('✅ You have enough SOLANA for withdrawal');
            console.log('💡 To withdraw 10 SOLANA to your Phantom wallet, use this Discord command:');
            console.log('   $withdraw SOLANA 10 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        } else {
            console.log('⚠️  Insufficient SOLANA for 10 token withdrawal');
            console.log(`💡 You can withdraw up to ${enhancedSol.virtual} SOLANA`);
        }
        
        // Check blockchain status
        console.log('\n🔗 Blockchain Integration Status:');
        const status = tipManager.getBlockchainStatus();
        console.log(`   Network: ${status.network}`);
        console.log(`   Hot Wallet: ${status.hotWallet}`);
        console.log(`   Integration: ${status.enabled ? 'ENABLED' : 'DISABLED'}`);
        
        // Show wallet balances
        console.log('\n💰 Current Wallet Balances:');
        const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        
        // tip.cc wallet
        try {
            const tipCCBalance = await mainnetConnection.getBalance(new PublicKey(tipCCWallet));
            console.log(`   tip.cc Wallet: ${(tipCCBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
        } catch (error) {
            console.log('   tip.cc Wallet: Error checking balance');
        }
        
        // Phantom wallet
        try {
            const phantomBalance = await mainnetConnection.getBalance(new PublicKey(phantomWallet));
            console.log(`   Phantom Wallet: ${(phantomBalance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
        } catch (error) {
            console.log('   Phantom Wallet: Error checking balance');
        }
        
        // Show correct Solana CLI commands (if you want to use CLI)
        console.log('\n⚡ Correct Solana CLI Commands (if needed):\n');
        console.log('Check balance:');
        console.log('   solana balance 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('');
        console.log('Check account info:');
        console.log('   solana account 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('');
        console.log('Transfer SOL (if you have a keypair):');
        console.log('   solana transfer 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB 0.01 --allow-unfunded-recipient');
        
        // Show tip.cc transfer instructions
        console.log('\n💸 How to Transfer from tip.cc to Phantom:\n');
        console.log('1. **Using tip.cc Discord Bot:**');
        console.log('   - Type: `/withdraw`');
        console.log('   - Select: Solana (SOL) or USDC');
        console.log('   - Amount: (e.g., 0.001 for testing)');
        console.log('   - Address: 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('');
        console.log('2. **Using tip.cc Website:**');
        console.log('   - Go to: https://tip.cc');
        console.log('   - Login with Discord');
        console.log('   - Go to Withdraw section');
        console.log('   - Paste your Phantom address');
        console.log('');
        console.log('3. **Using Your Discord Bot:**');
        console.log('   - Type: $withdraw SOLANA 10 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('   - This moves virtual SOLANA to real blockchain');
        
        // Show troubleshooting
        console.log('\n🔧 Troubleshooting:\n');
        console.log('If you got "permission denied" errors:');
        console.log('1. Make sure you\'re using Discord bot commands, not terminal commands');
        console.log('2. For Solana CLI, install with: brew install solana');
        console.log('3. For Discord bot, use $ prefix: $balance, $withdraw, etc.');
        console.log('4. Make sure your Discord bot is running: node index.js');
        
        console.log('\n✅ Solana operations test complete!');
        console.log('🎯 Use Discord commands with $ prefix for best results');
        
    } catch (error) {
        console.error('❌ Solana operations test failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
if (require.main === module) {
    testSolanaOperations();
}

module.exports = { testSolanaOperations };
