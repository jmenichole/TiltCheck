#!/usr/bin/env node

/**
 * Test Solana Key Generation
 * Demonstrates different methods of generating Solana keypairs
 */

const SolanaKeyGenerator = require('./solanaKeyGenerator');

async function testSolanaKeyGeneration() {
    console.log('🔑 Solana Keypair Generation Test\n');

    try {
        // Method 1: Using Node.js crypto (recommended for server)
        console.log('1️⃣ Method 1: Node.js Crypto API');
        console.log('================================');
        
        const keypair1 = await SolanaKeyGenerator.generateSolanaKeypair();
        console.log('✅ Generated successfully!');
        console.log(`Public Key:  ${keypair1.publicKey}`);
        console.log(`Private Key: ${keypair1.privateKey}`);
        console.log(`Address Length: ${keypair1.publicKey.length} characters`);
        console.log(`Private Key Length: ${keypair1.privateKey.length} characters`);
        console.log('');

        // Method 2: Using @solana/web3.js (most reliable)
        console.log('2️⃣ Method 2: @solana/web3.js (Recommended)');
        console.log('==========================================');
        
        const keypair2 = await SolanaKeyGenerator.generateSolanaKeypairSolanaJS();
        console.log('✅ Generated successfully!');
        console.log(`Public Key:  ${keypair2.publicKey}`);
        console.log(`Private Key: ${keypair2.privateKey}`);
        console.log(`Address Length: ${keypair2.publicKey.length} characters`);
        console.log(`Private Key Length: ${keypair2.privateKey.length} characters`);
        console.log('');

        // Validation tests
        console.log('3️⃣ Validation Tests');
        console.log('==================');
        
        const isValidAddress1 = SolanaKeyGenerator.isValidSolanaAddress(keypair1.publicKey);
        const isValidPrivateKey1 = SolanaKeyGenerator.isValidSolanaPrivateKey(keypair1.privateKey);
        
        const isValidAddress2 = SolanaKeyGenerator.isValidSolanaAddress(keypair2.publicKey);
        const isValidPrivateKey2 = SolanaKeyGenerator.isValidSolanaPrivateKey(keypair2.privateKey);
        
        console.log(`Method 1 - Valid Address: ${isValidAddress1 ? '✅' : '❌'}`);
        console.log(`Method 1 - Valid Private Key: ${isValidPrivateKey1 ? '✅' : '❌'}`);
        console.log(`Method 2 - Valid Address: ${isValidAddress2 ? '✅' : '❌'}`);
        console.log(`Method 2 - Valid Private Key: ${isValidPrivateKey2 ? '✅' : '❌'}`);
        console.log('');

        // Test conversion back to keypair
        console.log('4️⃣ Keypair Conversion Test');
        console.log('=========================');
        
        try {
            const recoveredKeypair = SolanaKeyGenerator.privateKeyToKeypair(keypair2.privateKey);
            const recoveredPublicKey = recoveredKeypair.publicKey.toBase58();
            
            console.log(`Original:  ${keypair2.publicKey}`);
            console.log(`Recovered: ${recoveredPublicKey}`);
            console.log(`Match: ${recoveredPublicKey === keypair2.publicKey ? '✅' : '❌'}`);
        } catch (error) {
            console.log(`❌ Conversion failed: ${error.message}`);
        }
        
        console.log('');
        
        // Example .env configuration
        console.log('5️⃣ Example .env Configuration');
        console.log('============================');
        console.log('# Add these to your .env file:');
        console.log(`SOLANA_SOL_RECEIVING_ADDRESS=${keypair2.publicKey}`);
        console.log(`SOLANA_USDC_RECEIVING_ADDRESS=${keypair2.publicKey}`);
        console.log(`SOLANA_PRIVATE_KEY=${keypair2.privateKey}`);
        console.log('');
        
        console.log('⚠️  SECURITY WARNING:');
        console.log('• Never share your private key');
        console.log('• Store private keys securely');
        console.log('• Use different keys for testing vs production');
        console.log('• The same address can receive both SOL and SPL tokens (like USDC)');
        
    } catch (error) {
        console.error('❌ Error during key generation:', error);
    }
}

// Run the test
testSolanaKeyGeneration();
