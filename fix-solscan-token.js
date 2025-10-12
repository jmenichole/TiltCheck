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
 * Solscan API Token Fix
 * This script will help you properly configure the Solscan API authentication
 */

const fs = require('fs');
const path = require('path');

class SolscanTokenFix {
    constructor() {
        this.envPath = path.join(__dirname, '.env');
    }

    async diagnoseIssue() {
        console.log('🔍 DIAGNOSING SOLSCAN API TOKEN ISSUE');
        console.log('=' .repeat(50));

        // Check current .env configuration
        const envContent = fs.readFileSync(this.envPath, 'utf8');
        const lines = envContent.split('\n');
        
        let solscanApiKey = null;
        let solscanUrl = null;
        let paymentSigner = null;

        for (const line of lines) {
            if (line.startsWith('SOLSCAN_API_KEY=')) {
                solscanApiKey = line.split('=')[1];
            }
            if (line.startsWith('SOLSCAN_API_URL=')) {
                solscanUrl = line.split('=')[1];
            }
            if (line.startsWith('JUSTTHETIP_PAYMENT_SIGNER=')) {
                paymentSigner = line.split('=')[1];
            }
        }

        console.log('\n📋 Current Configuration:');
        console.log(`   SOLSCAN_API_KEY: ${solscanApiKey || 'NOT SET'}`);
        console.log(`   SOLSCAN_API_URL: ${solscanUrl || 'NOT SET'}`);
        console.log(`   PAYMENT_SIGNER: ${paymentSigner ? paymentSigner.substring(0, 10) + '...' : 'NOT SET'}`);

        console.log('\n🔍 Issue Analysis:');
        
        if (!solscanApiKey || solscanApiKey === 'jeFxyc-kikdiw-8rekne') {
            console.log('   ❌ SOLSCAN_API_KEY is missing or using placeholder value');
            console.log('   💡 This is a test/example key, not a real API key');
        }

        if (!paymentSigner) {
            console.log('   ❌ JUSTTHETIP_PAYMENT_SIGNER is not configured');
        }

        console.log('\n🔧 SOLUTIONS:');
        console.log('');
        
        console.log('OPTION 1: Use Free Solscan API (No authentication)');
        console.log('   - Remove authentication requirement');
        console.log('   - Use public endpoints only');
        console.log('   - Limited rate limits');
        console.log('');
        
        console.log('OPTION 2: Get Real Solscan Pro API Key');
        console.log('   - Visit: https://pro-api.solscan.io/');
        console.log('   - Sign up for Solscan Pro account');
        console.log('   - Get your real API key');
        console.log('   - Replace placeholder in .env file');
        console.log('');
        
        console.log('OPTION 3: Use Alternative (Helius/QuickNode)');
        console.log('   - Switch to Helius API or QuickNode');
        console.log('   - Often more reliable for transaction tracking');
        console.log('   - Better rate limits');

        return {
            hasValidApiKey: solscanApiKey && solscanApiKey !== 'jeFxyc-kikdiw-8rekne',
            hasPaymentSigner: !!paymentSigner,
            currentApiKey: solscanApiKey
        };
    }

    async fixWithFreeAPI() {
        console.log('\n🔧 APPLYING FIX: Remove Authentication (Free API)');
        console.log('=' .repeat(50));

        // Read the solscanPaymentTracker.js file
        const trackerPath = path.join(__dirname, 'solscanPaymentTracker.js');
        let content = fs.readFileSync(trackerPath, 'utf8');

        // Replace the API authentication logic
        const oldAuthPattern = /if \(this\.apiKey && this\.apiKey !== 'your_solscan_api_key_here'\) \{[\s\S]*?\}/g;
        const newAuthCode = `// Using free API - no authentication required
            // Note: Free API has rate limits but works without API key`;

        content = content.replace(oldAuthPattern, newAuthCode);

        // Also remove the Bearer token headers
        content = content.replace(/headers\['Authorization'\] = `Bearer \${this\.apiKey}`;/g, '// No authorization needed for free API');

        // Update API URL to use free endpoint
        content = content.replace(
            /this\.apiUrl = process\.env\.SOLSCAN_API_URL \|\| 'https:\/\/pro-api\.solscan\.io\/v2\.0';/,
            "this.apiUrl = process.env.SOLSCAN_API_URL || 'https://api.solscan.io';"
        );

        // Write the updated file
        fs.writeFileSync(trackerPath, content);

        // Update .env file
        let envContent = fs.readFileSync(this.envPath, 'utf8');
        envContent = envContent.replace(
            /SOLSCAN_API_URL=.*/,
            'SOLSCAN_API_URL=https://api.solscan.io'
        );
        envContent = envContent.replace(
            /SOLSCAN_API_KEY=.*/,
            'SOLSCAN_API_KEY=not_required_for_free_api'
        );

        fs.writeFileSync(this.envPath, envContent);

        console.log('✅ Applied free API fix');
        console.log('   - Removed authentication requirements');
        console.log('   - Updated API URL to free endpoint');
        console.log('   - Updated .env configuration');
        console.log('');
        console.log('💡 Restart your bot to apply changes');
    }

    async createHeliusAlternative() {
        console.log('\n🔧 CREATING HELIUS ALTERNATIVE');
        console.log('=' .repeat(50));

        const heliusTracker = `/**
 * Helius Transaction Tracker - Alternative to Solscan
 * More reliable for transaction monitoring
 */

const axios = require('axios');
require('dotenv').config();

class HeliusTransactionTracker {
    constructor() {
        this.apiKey = process.env.HELIUS_API_KEY || 'demo-key';
        this.network = process.env.HELIUS_NETWORK || 'mainnet-beta';
        this.paymentSigner = process.env.JUSTTHETIP_PAYMENT_SIGNER;
        
        console.log('🚀 HeliusTransactionTracker initialized');
        console.log(\`🌐 Network: \${this.network}\`);
    }

    async getSignerTransactions(limit = 50) {
        try {
            const url = \`https://api.helius.xyz/v0/addresses/\${this.paymentSigner}/transactions?api-key=\${this.apiKey}\`;
            
            const response = await axios.get(url, {
                params: {
                    limit: Math.min(limit, 100),
                    commitment: 'finalized'
                }
            });

            console.log('✅ Successfully fetched transactions from Helius');
            return response.data || [];
            
        } catch (error) {
            console.error('❌ Error fetching from Helius:', error.message);
            
            // Fallback to direct Solana RPC
            return this.fallbackToSolanaRPC(limit);
        }
    }

    async fallbackToSolanaRPC(limit = 50) {
        try {
            console.log('🔄 Falling back to direct Solana RPC...');
            
            const { Connection, PublicKey } = require('@solana/web3.js');
            const connection = new Connection('https://api.mainnet-beta.solana.com', 'finalized');
            
            const pubkey = new PublicKey(this.paymentSigner);
            const signatures = await connection.getSignaturesForAddress(pubkey, { limit });
            
            console.log(\`✅ Fetched \${signatures.length} signatures from Solana RPC\`);
            return signatures;
            
        } catch (error) {
            console.error('❌ Fallback also failed:', error.message);
            return [];
        }
    }

    async getTransactionDetail(signature) {
        try {
            const { Connection } = require('@solana/web3.js');
            const connection = new Connection('https://api.mainnet-beta.solana.com', 'finalized');
            
            const transaction = await connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0
            });
            
            return transaction;
            
        } catch (error) {
            console.error('❌ Error getting transaction detail:', error.message);
            return null;
        }
    }
}

module.exports = HeliusTransactionTracker;
`;

        fs.writeFileSync(path.join(__dirname, 'heliusTransactionTracker.js'), heliusTracker);

        console.log('✅ Created HeliusTransactionTracker alternative');
        console.log('');
        console.log('📋 To use Helius (recommended):');
        console.log('   1. Get free API key: https://www.helius.dev/');
        console.log('   2. Add to .env: HELIUS_API_KEY=your_key_here');
        console.log('   3. Replace Solscan imports with Helius');
    }

    async showQuickFix() {
        console.log('\n⚡ QUICK FIX FOR IMMEDIATE USE');
        console.log('=' .repeat(50));
        console.log('');
        console.log('Add this to your .env file to bypass authentication:');
        console.log('');
        console.log('# Solscan API Configuration (Free)');
        console.log('SOLSCAN_API_URL=https://api.solscan.io');
        console.log('SOLSCAN_API_KEY=not_required');
        console.log('');
        console.log('Then restart your bot.');
    }
}

async function main() {
    const fixer = new SolscanTokenFix();
    
    console.log('🤖 SOLSCAN API TOKEN ISSUE RESOLVER');
    console.log('=' .repeat(50));
    console.log('');
    
    const diagnosis = await fixer.diagnoseIssue();
    
    console.log('\n🎯 RECOMMENDED ACTIONS:');
    console.log('');
    console.log('1) Quick Fix (Immediate): Use free API without authentication');
    console.log('2) Better Solution: Switch to Helius API (more reliable)');
    console.log('3) Pro Solution: Get real Solscan Pro API key');
    console.log('');
    
    // Apply the quick fix automatically
    console.log('🔧 Applying quick fix automatically...');
    await fixer.fixWithFreeAPI();
    await fixer.createHeliusAlternative();
    await fixer.showQuickFix();
    
    console.log('\n✅ FIXES APPLIED!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Restart your bot');
    console.log('   2. Test with: $mytilt setup');
    console.log('   3. Transaction tracking should work now');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SolscanTokenFix;
