/**
 * Analyze Solana Transaction
 * Check transaction details on devnet
 */

const { Connection, PublicKey } = require('@solana/web3.js');

async function analyzeTransaction() {
    const signature = '3h1VkdSq9h4YwyQUEGNRbqMmSgFY2UxCACoH16M6Hsa4yumcyDf3a1ZEHzMWGKcEAK6Y3MqA1X6VbGgVx7yZZkHC';
    const walletAddress = 'ED9SyrAtLzZThfkwdfyi85bCVFiotfP9gHq5dp5sxWMc';
    const network = 'devnet';
    
    console.log('🔍 Analyzing Solana Transaction...\n');
    console.log(`📋 Signature: ${signature}`);
    console.log(`🏦 Wallet: ${walletAddress}`);
    console.log(`🌐 Network: ${network}\n`);
    
    try {
        // Connect to devnet
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('✅ Connected to Solana devnet');
        
        // Get transaction details
        console.log('🔍 Fetching transaction details...');
        const transaction = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0
        });
        
        if (!transaction) {
            console.log('❌ Transaction not found');
            return;
        }
        
        console.log('\n📊 Transaction Details:');
        console.log(`   Slot: ${transaction.slot}`);
        console.log(`   Block Time: ${new Date(transaction.blockTime * 1000).toLocaleString()}`);
        console.log(`   Fee: ${transaction.meta.fee / 1000000000} SOL`);
        console.log(`   Status: ${transaction.meta.err ? 'Failed' : 'Success'}`);
        
        // Analyze balance changes
        if (transaction.meta.preBalances && transaction.meta.postBalances) {
            console.log('\n💰 Balance Changes:');
            for (let i = 0; i < transaction.meta.preBalances.length; i++) {
                const preBalance = transaction.meta.preBalances[i] / 1000000000;
                const postBalance = transaction.meta.postBalances[i] / 1000000000;
                const change = postBalance - preBalance;
                
                if (change !== 0) {
                    const pubkey = transaction.transaction.message.accountKeys[i];
                    console.log(`   ${pubkey}: ${change > 0 ? '+' : ''}${change.toFixed(6)} SOL`);
                    
                    // Check if this is our target wallet
                    if (pubkey.toString() === walletAddress) {
                        console.log(`   🎯 Target wallet change: ${change > 0 ? '+' : ''}${change.toFixed(6)} SOL`);
                    }
                }
            }
        }
        
        // Check current wallet balance
        console.log('\n🏦 Current Wallet Status:');
        const walletPubkey = new PublicKey(walletAddress);
        const currentBalance = await connection.getBalance(walletPubkey);
        console.log(`   Current SOL Balance: ${(currentBalance / 1000000000).toFixed(6)} SOL`);
        
        // Get recent transactions for this wallet
        console.log('\n📊 Recent Transactions:');
        const signatures = await connection.getSignaturesForAddress(walletPubkey, { limit: 5 });
        for (const sig of signatures) {
            const date = new Date(sig.blockTime * 1000).toLocaleString();
            const status = sig.err ? '❌' : '✅';
            console.log(`   ${status} ${sig.signature.substring(0, 8)}... (${date})`);
        }
        
    } catch (error) {
        console.error('❌ Error analyzing transaction:', error.message);
    }
}

// Run analysis
analyzeTransaction();
