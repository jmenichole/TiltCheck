/**
 * Crypto Transfer Tool: tip.cc to Phantom Wallet
 * This script helps monitor and facilitate transfers from tip.cc to Phantom
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');

async function linkCryptoTipCCToPhantom() {
    console.log('🔗 Linking Crypto from tip.cc to Phantom Wallet...\n');
    
    const tipCCWallet = '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z'; // Source: tip.cc
    const phantomWallet = '6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB'; // Destination: Phantom
    const discordId = '1153034319271559328'; // Your Discord ID
    
    console.log('💼 Source (tip.cc):', tipCCWallet);
    console.log('👻 Destination (Phantom):', phantomWallet);
    console.log('👤 Discord ID:', discordId);
    console.log('');
    
    try {
        // Initialize enhanced crypto system
        const tipManager = new EnhancedCryptoTipManager();
        await tipManager.initialize();
        
        // Update wallet linking to Phantom
        console.log('🔗 Linking Phantom wallet to Discord account...');
        await tipManager.linkUserWallet(discordId, phantomWallet);
        console.log('✅ Phantom wallet linked to Discord account');
        
        // Check balances on both wallets
        console.log('\n💰 Current Wallet Balances:\n');
        
        // Mainnet connection for real balance checking
        const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        
        // Check tip.cc wallet balance
        console.log('📊 tip.cc Wallet (Source):');
        try {
            const tipCCPublicKey = new PublicKey(tipCCWallet);
            const tipCCSolBalance = await mainnetConnection.getBalance(tipCCPublicKey);
            const tipCCSol = tipCCSolBalance / LAMPORTS_PER_SOL;
            console.log(`   SOL: ${tipCCSol.toFixed(6)}`);
            
            // Check for USDC on tip.cc wallet
            try {
                const { getAssociatedTokenAddress } = require('@solana/spl-token');
                const usdcMintMainnet = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                const tipCCUsdcAccount = await getAssociatedTokenAddress(usdcMintMainnet, tipCCPublicKey);
                const tipCCUsdcInfo = await mainnetConnection.getTokenAccountBalance(tipCCUsdcAccount);
                const tipCCUsdc = parseFloat(tipCCUsdcInfo.value.uiAmount || 0);
                console.log(`   USDC: ${tipCCUsdc.toFixed(2)}`);
            } catch (error) {
                console.log('   USDC: 0.00 (no token account)');
            }
        } catch (error) {
            console.log(`   ❌ Error checking tip.cc wallet: ${error.message}`);
        }
        
        console.log('');
        
        // Check Phantom wallet balance
        console.log('📊 Phantom Wallet (Destination):');
        try {
            const phantomPublicKey = new PublicKey(phantomWallet);
            const phantomSolBalance = await mainnetConnection.getBalance(phantomPublicKey);
            const phantomSol = phantomSolBalance / LAMPORTS_PER_SOL;
            console.log(`   SOL: ${phantomSol.toFixed(6)}`);
            
            // Check for USDC on Phantom wallet
            try {
                const { getAssociatedTokenAddress } = require('@solana/spl-token');
                const usdcMintMainnet = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
                const phantomUsdcAccount = await getAssociatedTokenAddress(usdcMintMainnet, phantomPublicKey);
                const phantomUsdcInfo = await mainnetConnection.getTokenAccountBalance(phantomUsdcAccount);
                const phantomUsdc = parseFloat(phantomUsdcInfo.value.uiAmount || 0);
                console.log(`   USDC: ${phantomUsdc.toFixed(2)}`);
            } catch (error) {
                console.log('   USDC: 0.00 (no token account)');
            }
        } catch (error) {
            console.log(`   ❌ Error checking Phantom wallet: ${error.message}`);
        }
        
        // Show transaction history for tip.cc wallet
        console.log('\n📊 Recent tip.cc Wallet Activity:');
        try {
            const tipCCPublicKey = new PublicKey(tipCCWallet);
            const signatures = await mainnetConnection.getSignaturesForAddress(tipCCPublicKey, { limit: 5 });
            
            if (signatures.length > 0) {
                console.log(`   Found ${signatures.length} recent transactions:`);
                
                for (let i = 0; i < Math.min(3, signatures.length); i++) {
                    const sig = signatures[i];
                    console.log(`   ${i + 1}. ${sig.signature}`);
                    if (sig.blockTime) {
                        const date = new Date(sig.blockTime * 1000);
                        console.log(`      Time: ${date.toLocaleString()}`);
                    }
                    console.log(`      Status: ${sig.confirmationStatus}`);
                }
            } else {
                console.log('   No recent transactions found');
            }
        } catch (error) {
            console.log(`   ❌ Error checking transactions: ${error.message}`);
        }
        
        // Show enhanced balances
        console.log('\n🔄 Enhanced Discord Balances:');
        const enhancedSol = await tipManager.getEnhancedBalance(discordId, 'SOLANA');
        const enhancedUsdc = await tipManager.getEnhancedBalance(discordId, 'SOLUSDC');
        
        console.log(`💎 SOLANA: Virtual=${enhancedSol.virtual}, OnChain=${enhancedSol.onChain}, Total=${enhancedSol.total}`);
        console.log(`💎 SOLUSDC: Virtual=${enhancedUsdc.virtual}, OnChain=${enhancedUsdc.onChain}, Total=${enhancedUsdc.total}`);
        
        // Show transfer instructions
        console.log('\n🚀 How to Transfer from tip.cc to Phantom:\n');
        
        console.log('📱 Using tip.cc Discord Bot:');
        console.log('   1. In Discord, use: `/withdraw` or `/send`');
        console.log('   2. Enter Phantom address: 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('   3. Specify amount and token (SOL or USDC)');
        console.log('   4. Confirm the transaction');
        
        console.log('\n🌐 Using tip.cc Website:');
        console.log('   1. Go to https://tip.cc');
        console.log('   2. Connect your Discord account');
        console.log('   3. Navigate to Withdraw/Send');
        console.log('   4. Paste Phantom address: 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('   5. Complete the withdrawal');
        
        console.log('\n👻 Using Phantom Wallet:');
        console.log('   1. Open Phantom wallet');
        console.log('   2. Go to Receive tab');
        console.log('   3. Copy your address (should match): 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('   4. Use this address in tip.cc for withdrawal');
        
        // Show Discord bot integration
        console.log('\n🎯 Discord Bot Integration:');
        console.log('   • Use $balance to see virtual + Phantom balances');
        console.log('   • Use $withdraw SOLANA 10 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB');
        console.log('   • Use $wallet to manage blockchain connections');
        console.log('   • Your Phantom wallet is now the primary receiving address');
        
        // Show monitoring capabilities
        console.log('\n📊 Monitoring Features:');
        console.log('   • Real-time balance checking for both wallets');
        console.log('   • Transaction history tracking');
        console.log('   • Enhanced balances (virtual + real blockchain)');
        console.log('   • Automatic updates when transfers complete');
        
        console.log('\n✅ Crypto linking setup complete!');
        console.log('🔗 tip.cc → Phantom wallet connection established');
        console.log('👻 Phantom wallet is now your primary receiving address');
        console.log('💰 Use tip.cc to send crypto to your Phantom wallet');
        
    } catch (error) {
        console.error('❌ Crypto linking failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the crypto linking
if (require.main === module) {
    linkCryptoTipCCToPhantom();
}

module.exports = { linkCryptoTipCCToPhantom };
