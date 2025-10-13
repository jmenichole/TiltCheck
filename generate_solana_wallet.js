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

#!/usr/bin/env node

/**
 * Simple Solana Keypair Generator
 * Uses @solana/web3.js for reliable keypair generation
 */

const { Keypair } = require('@solana/web3.js');

async function generateSolanaKeypair() {
    console.log('🔑 Generating Solana Keypair\n');

    try {
        // Generate a new keypair
        const keypair = Keypair.generate();
        
        // Get the addresses
        const publicKey = keypair.publicKey.toBase58();
        const privateKey = Buffer.from(keypair.secretKey).toString('base64');
        const secretKeyArray = Array.from(keypair.secretKey);
        
        console.log('✅ Keypair Generated Successfully!');
        console.log('================================');
        console.log(`Public Key (Address): ${publicKey}`);
        console.log(`Private Key (Base64): ${privateKey}`);
        console.log(`Secret Key Array: [${secretKeyArray.slice(0, 8).join(', ')}, ...] (64 bytes total)`);
        console.log('');
        
        // Validation
        console.log('📋 Validation:');
        console.log(`• Address Length: ${publicKey.length} characters`);
        console.log(`• Secret Key Length: ${keypair.secretKey.length} bytes`);
        console.log(`• Valid Solana Address: ${publicKey.length >= 32 && publicKey.length <= 44 ? '✅' : '❌'}`);
        console.log('');
        
        // .env configuration
        console.log('📝 Copy these to your .env file:');
        console.log('===============================');
        console.log(`SOLANA_SOL_RECEIVING_ADDRESS=${publicKey}`);
        console.log(`SOLANA_USDC_RECEIVING_ADDRESS=${publicKey}`);
        console.log(`SOLANA_PRIVATE_KEY=${privateKey}`);
        console.log('');
        
        // Usage examples
        console.log('🎯 Usage Examples:');
        console.log('=================');
        console.log('After adding to .env, test with:');
        console.log('• $solusdc add 100');
        console.log('• $solusdc balance');
        console.log('• $solusdc send @user 10');
        console.log('');
        
        console.log('⚠️  SECURITY NOTES:');
        console.log('• This address can receive both SOL and SPL tokens (USDC, USDT, etc.)');
        console.log('• Keep your private key secure and never share it');
        console.log('• Use different keys for testing vs production');
        console.log('• Consider using a hardware wallet for large amounts');
        
        return {
            publicKey,
            privateKey,
            secretKey: keypair.secretKey
        };
        
    } catch (error) {
        console.error('❌ Error generating keypair:', error);
        throw error;
    }
}

// If run directly
if (require.main === module) {
    generateSolanaKeypair();
}

module.exports = { generateSolanaKeypair };
