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
        console.log(`🌐 Network: ${this.network}`);
    }

    async getSignerTransactions(limit = 50) {
        try {
            const url = `https://api.helius.xyz/v0/addresses/${this.paymentSigner}/transactions?api-key=${this.apiKey}`;
            
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
            
            console.log(`✅ Fetched ${signatures.length} signatures from Solana RPC`);
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
