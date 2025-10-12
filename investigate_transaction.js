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
 * Transaction Investigation Tool
 * Investigating transaction: 4RRK2QLmdW335SvQYphSRbC3XBtHr7bsVNaSKzt8PtZYDMFtYrE7mxKGSaH7G9fXBSb72CzW1NSqjn2Eu91Xi6mN
 * Checking USDC mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

async function investigateTransaction() {
    console.log('🔍 Investigating tip.cc → Phantom Transaction...\n');
    
    const transactionId = '4RRK2QLmdW335SvQYphSRbC3XBtHr7bsVNaSKzt8PtZYDMFtYrE7mxKGSaH7G9fXBSb72CzW1NSqjn2Eu91Xi6mN';
    const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC Mainnet
    const phantomWallet = '6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB';
    const tipCCWallet = '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z';
    
    console.log('🎯 Transaction ID:', transactionId);
    console.log('💰 USDC Mint:', usdcMint);
    console.log('👻 Phantom Wallet:', phantomWallet);
    console.log('📱 tip.cc Wallet:', tipCCWallet);
    console.log('');
    
    try {
        // Connect to Solana mainnet
        const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
        console.log('🔗 Connected to Solana mainnet');
        
        // 1. Get transaction details
        console.log('\n📋 Transaction Analysis:');
        try {
            const transaction = await connection.getTransaction(transactionId, {
                maxSupportedTransactionVersion: 0
            });
            
            if (transaction) {
                console.log('✅ Transaction found on blockchain');
                console.log(`   Block Time: ${new Date(transaction.blockTime * 1000).toLocaleString()}`);
                console.log(`   Slot: ${transaction.slot}`);
                console.log(`   Fee: ${transaction.meta.fee} lamports`);
                console.log(`   Status: ${transaction.meta.err ? 'FAILED' : 'SUCCESS'}`);
                
                if (transaction.meta.err) {
                    console.log(`   Error: ${JSON.stringify(transaction.meta.err)}`);
                } else {
                    console.log('   ✅ Transaction executed successfully');
                }
                
                // Analyze account changes
                console.log('\n💸 Account Balance Changes:');
                const preBalances = transaction.meta.preBalances;
                const postBalances = transaction.meta.postBalances;
                const accounts = transaction.transaction.message.staticAccountKeys || transaction.transaction.message.accountKeys;
                
                for (let i = 0; i < accounts.length; i++) {
                    const account = accounts[i].toString();
                    const preBalance = preBalances[i] / LAMPORTS_PER_SOL;
                    const postBalance = postBalances[i] / LAMPORTS_PER_SOL;
                    const change = postBalance - preBalance;
                    
                    if (Math.abs(change) > 0) {
                        console.log(`   ${account}: ${change > 0 ? '+' : ''}${change.toFixed(6)} SOL`);
                        
                        // Check if this is our wallets
                        if (account === phantomWallet) {
                            console.log('     👻 This is your Phantom wallet!');
                        } else if (account === tipCCWallet) {
                            console.log('     📱 This is the tip.cc wallet!');
                        }
                    }
                }
                
                // Check token transfers
                console.log('\n🪙 Token Transfer Analysis:');
                if (transaction.meta.preTokenBalances && transaction.meta.postTokenBalances) {
                    const preTokenBalances = transaction.meta.preTokenBalances;
                    const postTokenBalances = transaction.meta.postTokenBalances;
                    
                    console.log(`   Pre-transaction token accounts: ${preTokenBalances.length}`);
                    console.log(`   Post-transaction token accounts: ${postTokenBalances.length}`);
                    
                    // Map token changes
                    const tokenChanges = new Map();
                    
                    // Process pre-balances
                    preTokenBalances.forEach(balance => {
                        const key = `${balance.owner}_${balance.mint}`;
                        tokenChanges.set(key, {
                            owner: balance.owner,
                            mint: balance.mint,
                            preAmount: parseFloat(balance.uiTokenAmount.uiAmount || 0),
                            postAmount: 0
                        });
                    });
                    
                    // Process post-balances
                    postTokenBalances.forEach(balance => {
                        const key = `${balance.owner}_${balance.mint}`;
                        if (tokenChanges.has(key)) {
                            tokenChanges.get(key).postAmount = parseFloat(balance.uiTokenAmount.uiAmount || 0);
                        } else {
                            tokenChanges.set(key, {
                                owner: balance.owner,
                                mint: balance.mint,
                                preAmount: 0,
                                postAmount: parseFloat(balance.uiTokenAmount.uiAmount || 0)
                            });
                        }
                    });
                    
                    // Show token changes
                    tokenChanges.forEach((change, key) => {
                        const difference = change.postAmount - change.preAmount;
                        if (Math.abs(difference) > 0) {
                            console.log(`   Token Change: ${change.mint}`);
                            console.log(`     Owner: ${change.owner}`);
                            console.log(`     Change: ${difference > 0 ? '+' : ''}${difference.toFixed(6)}`);
                            
                            if (change.mint === usdcMint) {
                                console.log('     💰 This is USDC!');
                            }
                            
                            if (change.owner === phantomWallet) {
                                console.log('     👻 Phantom wallet affected!');
                            } else if (change.owner === tipCCWallet) {
                                console.log('     📱 tip.cc wallet affected!');
                            }
                        }
                    });
                }
                
            } else {
                console.log('❌ Transaction not found on blockchain');
                console.log('   This could mean:');
                console.log('   • Transaction ID is incorrect');
                console.log('   • Transaction was on a different network');
                console.log('   • Transaction was dropped/expired');
            }
            
        } catch (error) {
            console.log(`❌ Error getting transaction: ${error.message}`);
        }
        
        // 2. Check current USDC balances
        console.log('\n💰 Current USDC Balances:');
        
        // Check tip.cc wallet USDC
        try {
            const tipCCPublicKey = new PublicKey(tipCCWallet);
            const tipCCUsdcAccount = await getAssociatedTokenAddress(
                new PublicKey(usdcMint),
                tipCCPublicKey
            );
            
            console.log(`📱 tip.cc USDC Account: ${tipCCUsdcAccount.toString()}`);
            
            try {
                const tipCCUsdcInfo = await connection.getTokenAccountBalance(tipCCUsdcAccount);
                const tipCCUsdc = parseFloat(tipCCUsdcInfo.value.uiAmount || 0);
                console.log(`   Balance: ${tipCCUsdc.toFixed(6)} USDC`);
            } catch (error) {
                console.log('   Balance: 0.00 USDC (no token account)');
            }
            
        } catch (error) {
            console.log(`❌ Error checking tip.cc USDC: ${error.message}`);
        }
        
        // Check Phantom wallet USDC
        try {
            const phantomPublicKey = new PublicKey(phantomWallet);
            const phantomUsdcAccount = await getAssociatedTokenAddress(
                new PublicKey(usdcMint),
                phantomPublicKey
            );
            
            console.log(`👻 Phantom USDC Account: ${phantomUsdcAccount.toString()}`);
            
            try {
                const phantomUsdcInfo = await connection.getTokenAccountBalance(phantomUsdcAccount);
                const phantomUsdc = parseFloat(phantomUsdcInfo.value.uiAmount || 0);
                console.log(`   Balance: ${phantomUsdc.toFixed(6)} USDC`);
                
                if (phantomUsdc > 0) {
                    console.log('   🎉 SUCCESS! USDC found in Phantom wallet!');
                }
            } catch (error) {
                console.log('   Balance: 0.00 USDC (no token account)');
                console.log('   Note: Token account might need to be created first');
            }
            
        } catch (error) {
            console.log(`❌ Error checking Phantom USDC: ${error.message}`);
        }
        
        // 3. Check recent Phantom wallet activity
        console.log('\n📊 Recent Phantom Wallet Activity:');
        try {
            const phantomPublicKey = new PublicKey(phantomWallet);
            const signatures = await connection.getSignaturesForAddress(phantomPublicKey, { limit: 10 });
            
            console.log(`   Found ${signatures.length} recent transactions:`);
            
            for (let i = 0; i < Math.min(5, signatures.length); i++) {
                const sig = signatures[i];
                console.log(`   ${i + 1}. ${sig.signature}`);
                
                if (sig.signature === transactionId) {
                    console.log('      🎯 THIS IS OUR TRANSACTION!');
                }
                
                if (sig.blockTime) {
                    const date = new Date(sig.blockTime * 1000);
                    console.log(`      Time: ${date.toLocaleString()}`);
                }
                console.log(`      Status: ${sig.confirmationStatus}`);
                
                // Quick check if this transaction involved USDC
                try {
                    const txDetail = await connection.getTransaction(sig.signature, {
                        maxSupportedTransactionVersion: 0
                    });
                    
                    if (txDetail && txDetail.meta.postTokenBalances) {
                        const hasUsdc = txDetail.meta.postTokenBalances.some(balance => 
                            balance.mint === usdcMint
                        );
                        if (hasUsdc) {
                            console.log('      💰 USDC transaction detected!');
                        }
                    }
                } catch (error) {
                    // Skip detailed analysis if error
                }
                
                console.log('');
            }
            
        } catch (error) {
            console.log(`❌ Error checking recent activity: ${error.message}`);
        }
        
        // 4. Validate USDC mint
        console.log('\n🪙 USDC Mint Validation:');
        try {
            const usdcMintInfo = await connection.getAccountInfo(new PublicKey(usdcMint));
            
            if (usdcMintInfo) {
                console.log('✅ USDC mint is valid and active');
                console.log(`   Owner: ${usdcMintInfo.owner.toString()}`);
                console.log(`   Executable: ${usdcMintInfo.executable}`);
                
                // Try to get mint details
                try {
                    const { getMint } = require('@solana/spl-token');
                    const mintInfo = await getMint(connection, new PublicKey(usdcMint));
                    console.log(`   Decimals: ${mintInfo.decimals}`);
                    console.log(`   Supply: ${mintInfo.supply.toString()}`);
                    console.log(`   Mint Authority: ${mintInfo.mintAuthority?.toString() || 'None'}`);
                } catch (error) {
                    console.log('   (Could not fetch detailed mint info)');
                }
            } else {
                console.log('❌ USDC mint not found or invalid');
            }
            
        } catch (error) {
            console.log(`❌ Error validating USDC mint: ${error.message}`);
        }
        
        // 5. Summary and recommendations
        console.log('\n📝 Investigation Summary:');
        console.log('='.repeat(50));
        
        console.log('\n🔍 What to check next:');
        console.log('1. Open your Phantom wallet app');
        console.log('2. Make sure you\'re on the "Tokens" tab');
        console.log('3. Look for USDC in your token list');
        console.log('4. If not visible, try refreshing or adding USDC manually');
        console.log('5. Check transaction history in Phantom');
        
        console.log('\n💡 Possible explanations for "Expected String" error:');
        console.log('• tip.cc API response format changed');
        console.log('• Network connectivity issue during transaction');
        console.log('• Transaction succeeded but status check failed');
        console.log('• USDC transfer completed but balance update pending');
        
        console.log('\n🚀 Next steps:');
        console.log('• Check Phantom wallet for USDC balance');
        console.log('• Try a smaller test transaction if needed');
        console.log('• Contact tip.cc support if transaction shows as failed');
        console.log('• Monitor blockchain explorer for confirmation');
        
        console.log('\n✅ Investigation complete!');
        
    } catch (error) {
        console.error('❌ Investigation failed:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the investigation
if (require.main === module) {
    investigateTransaction();
}

module.exports = { investigateTransaction };
