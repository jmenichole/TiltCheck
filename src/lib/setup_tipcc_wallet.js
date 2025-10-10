/**
 * Link tip.cc wallet to hot wallet and setup airdrops
 */

const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function setupWalletAndAirdrop() {
    console.log('🚀 Setting up tip.cc wallet with hot wallet and airdrop...\n');
    
    try {
        // Initialize the enhanced crypto system
        const tipManager = new EnhancedCryptoTipManager();
        await tipManager.initialize();
        
        // Your details
        const discordId = '1153034319271559328';
        const tipccWallet = '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z';
        
        console.log(`👤 Discord ID: ${discordId}`);
        console.log(`💼 tip.cc Wallet: ${tipccWallet}`);
        
        // Get the hot wallet info
        const status = tipManager.getBlockchainStatus();
        console.log(`🔥 Hot Wallet: ${status.hotWallet}`);
        console.log(`🌐 Network: ${status.network}`);
        console.log('');
        
        // Link your tip.cc wallet to your Discord account
        console.log('🔗 Linking tip.cc wallet to Discord account...');
        await tipManager.linkUserWallet(discordId, tipccWallet);
        console.log('✅ Wallet linked successfully!');
        
        // Check current balances
        console.log('\n💰 Current Balances:');
        
        // Hot wallet balance
        const hotWalletSol = await tipManager.blockchain.getSolBalance(status.hotWallet);
        console.log(`🔥 Hot Wallet SOL: ${hotWalletSol.toFixed(4)}`);
        
        // Your tip.cc wallet balance
        const yourSol = await tipManager.blockchain.getSolBalance(tipccWallet);
        console.log(`💼 Your Wallet SOL: ${yourSol.toFixed(4)}`);
        
        // Request airdrop for hot wallet if needed
        if (hotWalletSol < 1) {
            console.log('\n🚁 Requesting airdrop for hot wallet...');
            try {
                const hotWalletAirdrop = await tipManager.requestTestnetAirdrop(status.hotWallet, 2);
                console.log(`✅ Hot wallet airdrop: ${hotWalletAirdrop}`);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
                
                const newHotBalance = await tipManager.blockchain.getSolBalance(status.hotWallet);
                console.log(`💰 Hot wallet new balance: ${newHotBalance.toFixed(4)} SOL`);
            } catch (error) {
                console.log(`❌ Hot wallet airdrop failed: ${error.message}`);
            }
        }
        
        // Request airdrop for your wallet if needed
        if (yourSol < 0.5) {
            console.log('\n🚁 Requesting airdrop for your wallet...');
            try {
                const yourAirdrop = await tipManager.requestTestnetAirdrop(tipccWallet, 1);
                console.log(`✅ Your wallet airdrop: ${yourAirdrop}`);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
                
                const newYourBalance = await tipManager.blockchain.getSolBalance(tipccWallet);
                console.log(`💰 Your wallet new balance: ${newYourBalance.toFixed(4)} SOL`);
            } catch (error) {
                console.log(`❌ Your wallet airdrop failed: ${error.message}`);
            }
        }
        
        // Show enhanced balances
        console.log('\n🔄 Enhanced Balances (Virtual + On-Chain):');
        const enhancedSol = await tipManager.getEnhancedBalance(discordId, 'SOLANA');
        const enhancedUsdc = await tipManager.getEnhancedBalance(discordId, 'SOLUSDC');
        
        console.log(`💎 SOLANA: Virtual=${enhancedSol.virtual}, OnChain=${enhancedSol.onChain}, Total=${enhancedSol.total}`);
        console.log(`💎 SOLUSDC: Virtual=${enhancedUsdc.virtual}, OnChain=${enhancedUsdc.onChain}, Total=${enhancedUsdc.total}`);
        
        // Hot wallet private key for reference
        console.log('\n🔑 Hot Wallet Details (SAVE THESE):');
        console.log(`Address: ${status.hotWallet}`);
        console.log('Private Key: 3HpsCB7jMK2C5ZgFCYLVxa5aczuocdwEr9Jx13c61W8W9LwQPHcpuvs1vf6nTd5BNNmpzPQwfvysd2nppvPxybLe');
        
        console.log('\n🎯 Ready for Discord Testing:');
        console.log('   $balance - Check enhanced balances');
        console.log('   $wallet - View wallet info');
        console.log('   $airdrop - Request more testnet SOL');
        console.log('   $withdraw SOLANA 10 <address> - Test withdrawal');
        
        console.log('\n✅ Setup complete! Your tip.cc wallet is linked to the hot wallet system.');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        console.error(error.stack);
    }
}

// Run the setup
if (require.main === module) {
    setupWalletAndAirdrop();
}

module.exports = { setupWalletAndAirdrop };
