/**
 * Link Personal tip.cc Solana Wallet to Discord Account
 * This script links your tip.cc wallet to your Discord ID and checks balances
 */

const EnhancedCryptoTipManager = require('./enhancedCryptoTipManager');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

async function linkTipCCWallet() {
    console.log('🔗 Linking tip.cc Solana Wallet to Discord Account...\n');
    
    try {
        // Initialize enhanced crypto system
        const tipManager = new EnhancedCryptoTipManager();
        await tipManager.initialize();
        
        // Your Discord ID and tip.cc wallet details
        const discordId = '1153034319271559328'; // Your Discord ID
        const tipCCWallet = '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z'; // Your tip.cc wallet
        
        console.log('👤 Discord ID:', discordId);
        console.log('💼 tip.cc Wallet:', tipCCWallet);
        console.log('');
        
        // Validate wallet address
        try {
            new PublicKey(tipCCWallet);
            console.log('✅ Wallet address format is valid');
        } catch (error) {
            console.error('❌ Invalid wallet address format:', error.message);
            return;
        }
        
        // Check current linked wallet
        const currentWallet = await tipManager.getUserWalletAddress(discordId);
        console.log('🔍 Currently linked wallet:', currentWallet || 'None');
        
        // Link the tip.cc wallet
        console.log('🔗 Linking tip.cc wallet...');
        await tipManager.linkUserWallet(discordId, tipCCWallet);
        console.log('✅ tip.cc wallet linked successfully!');
        
        // Check blockchain status
        const status = tipManager.getBlockchainStatus();
        console.log('\n📋 Blockchain Status:');
        console.log(`   Network: ${status.network}`);
        console.log(`   Enabled: ${status.enabled}`);
        
        // Check balances on both devnet and mainnet
        console.log('\n💰 Checking Wallet Balances...');
        
        // Check devnet (our current blockchain integration)
        if (tipManager.isBlockchainEnabled) {
            console.log('🔍 Devnet Balances:');
            const devnetSol = await tipManager.blockchain.getSolBalance(tipCCWallet);
            const devnetUsdc = await tipManager.blockchain.getUSDCBalance(tipCCWallet);
            console.log(`   SOL: ${devnetSol.toFixed(6)}`);
            console.log(`   USDC: ${devnetUsdc.toFixed(2)}`);
        }
        
        // Check mainnet (where tip.cc operates)
        console.log('\n🔍 Mainnet Balances (tip.cc network):');
        try {
            const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
            const publicKey = new PublicKey(tipCCWallet);
            
            // Get SOL balance on mainnet
            const mainnetSolBalance = await mainnetConnection.getBalance(publicKey);
            const mainnetSol = mainnetSolBalance / LAMPORTS_PER_SOL;
            console.log(`   SOL: ${mainnetSol.toFixed(6)}`);
            
            // Check for USDC on mainnet
            const usdcMintMainnet = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
            try {
                const { getAssociatedTokenAddress } = require('@solana/spl-token');
                const usdcTokenAccount = await getAssociatedTokenAddress(usdcMintMainnet, publicKey);
                const tokenAccountInfo = await mainnetConnection.getTokenAccountBalance(usdcTokenAccount);
                const mainnetUsdc = parseFloat(tokenAccountInfo.value.uiAmount || 0);
                console.log(`   USDC: ${mainnetUsdc.toFixed(2)}`);
            } catch (error) {
                console.log('   USDC: 0.00 (no token account)');
            }
            
        } catch (error) {
            console.log(`   ❌ Error checking mainnet: ${error.message}`);
        }
        
        // Check enhanced balances (virtual + on-chain)
        console.log('\n🔄 Enhanced Balances (Virtual + On-Chain):');
        
        const enhancedSol = await tipManager.getEnhancedBalance(discordId, 'SOLANA');
        const enhancedUsdc = await tipManager.getEnhancedBalance(discordId, 'SOLUSDC');
        
        console.log('💎 SOLANA:');
        console.log(`   Virtual: ${enhancedSol.virtual}`);
        console.log(`   On-Chain: ${enhancedSol.onChain}`);
        console.log(`   Total: ${enhancedSol.total}`);
        
        console.log('💎 SOLUSDC:');
        console.log(`   Virtual: ${enhancedUsdc.virtual}`);
        console.log(`   On-Chain: ${enhancedUsdc.onChain}`);
        console.log(`   Total: ${enhancedUsdc.total}`);
        
        // Check transaction history
        console.log('\n📊 Recent Transaction History...');
        try {
            // Check mainnet transactions (tip.cc)
            const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
            const publicKey = new PublicKey(tipCCWallet);
            
            const signatures = await mainnetConnection.getSignaturesForAddress(publicKey, { limit: 5 });
            
            if (signatures.length > 0) {
                console.log(`   Found ${signatures.length} recent mainnet transactions:`);
                
                for (let i = 0; i < Math.min(3, signatures.length); i++) {
                    const sig = signatures[i];
                    console.log(`   ${i + 1}. ${sig.signature}`);
                    console.log(`      Slot: ${sig.slot}`);
                    console.log(`      Status: ${sig.confirmationStatus}`);
                    if (sig.blockTime) {
                        const date = new Date(sig.blockTime * 1000);
                        console.log(`      Time: ${date.toLocaleString()}`);
                    }
                    if (sig.err) {
                        console.log(`      Error: ${sig.err}`);
                    }
                }
                
                // Get details of the most recent transaction
                console.log('\n🔍 Most Recent Transaction Details:');
                try {
                    const recentTx = await mainnetConnection.getTransaction(signatures[0].signature, {
                        maxSupportedTransactionVersion: 0
                    });
                    
                    if (recentTx) {
                        console.log(`   Signature: ${signatures[0].signature}`);
                        console.log(`   Fee: ${recentTx.meta?.fee || 0} lamports`);
                        console.log(`   Success: ${recentTx.meta?.err ? 'Failed' : 'Success'}`);
                        
                        // Check for SOL transfers
                        if (recentTx.meta?.preBalances && recentTx.meta?.postBalances) {
                            const balanceChange = recentTx.meta.postBalances[0] - recentTx.meta.preBalances[0];
                            if (balanceChange !== 0) {
                                const solChange = balanceChange / LAMPORTS_PER_SOL;
                                console.log(`   SOL Change: ${solChange > 0 ? '+' : ''}${solChange.toFixed(6)} SOL`);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`   Could not get transaction details: ${error.message}`);
                }
                
            } else {
                console.log('   No transactions found on mainnet');
            }
            
        } catch (error) {
            console.log(`   ❌ Error checking transactions: ${error.message}`);
        }
        
        // Show current virtual balances
        console.log('\n💰 Current Virtual Balances:');
        const chains = ['SOLANA', 'SOLUSDC', 'ETHEREUM', 'POLYGON'];
        let totalValue = 0;
        
        for (const chain of chains) {
            const balance = tipManager.getUserBalance(discordId, chain);
            if (balance > 0) {
                const price = tipManager.getMockPrice(chain);
                const value = balance * price;
                totalValue += value;
                console.log(`   ${chain}: ${balance} (~$${value.toFixed(2)})`);
            }
        }
        
        console.log(`\n💵 Total Portfolio Value: $${totalValue.toFixed(2)}`);
        
        // Show wallet management commands
        console.log('\n🎯 Discord Commands Available:');
        console.log('   $balance - Check all balances (includes tip.cc wallet)');
        console.log('   $wallet - Manage blockchain wallet');
        console.log('   $airdrop - Request testnet SOL (devnet only)');
        console.log('   $withdraw SOLANA 10 <address> - Withdraw virtual to blockchain');
        
        console.log('\n🔗 Blockchain Integration Info:');
        console.log('   • tip.cc wallet linked for balance display');
        console.log('   • Virtual system for Discord tipping');
        console.log('   • Devnet integration for testing withdrawals');
        console.log('   • Mainnet monitoring for tip.cc activity');
        
        console.log('\n✅ tip.cc wallet linking complete!');
        console.log(`🔗 Wallet ${tipCCWallet} is now linked to Discord ID ${discordId}`);
        console.log('💡 Your tip.cc balance will now show in Discord $balance command');
        
    } catch (error) {
        console.error('❌ Wallet linking failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the linking process
if (require.main === module) {
    linkTipCCWallet();
}

module.exports = { linkTipCCWallet };
