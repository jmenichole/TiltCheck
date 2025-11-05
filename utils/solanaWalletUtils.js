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
 * Shared Solana Wallet Utilities
 * Eliminates duplicated wallet generation and management code
 */

const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;

/**
 * Generate a new Solana keypair
 * @returns {Object} Object containing keypair, public key, and private key
 */
function generateSolanaWallet() {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toString();
    const privateKey = bs58.encode(keypair.secretKey);

    return {
        keypair,
        publicKey,
        privateKey,
        secretKey: keypair.secretKey
    };
}

/**
 * Load a keypair from a base58 encoded private key
 * @param {string} privateKeyBase58 - Base58 encoded private key
 * @returns {Keypair} Solana Keypair object
 * @throws {Error} If private key is invalid
 */
function loadKeypairFromPrivateKey(privateKeyBase58) {
    try {
        const privateKeyBytes = bs58.decode(privateKeyBase58);
        return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
        throw new Error(`Invalid private key: ${error.message}`);
    }
}

/**
 * Load a keypair from environment variable or generate new one
 * @param {string} envVarName - Name of environment variable containing private key
 * @returns {Object} Object containing keypair and whether it was loaded or generated
 */
function loadOrGenerateWallet(envVarName = 'SOLANA_PRIVATE_KEY') {
    const privateKey = process.env[envVarName];

    if (privateKey && privateKey.trim() !== '') {
        try {
            const keypair = loadKeypairFromPrivateKey(privateKey);
            console.log(`🔑 Loaded wallet from ${envVarName}:`, keypair.publicKey.toString());
            return {
                keypair,
                publicKey: keypair.publicKey.toString(),
                isGenerated: false
            };
        } catch (error) {
            console.warn(`⚠️ Invalid ${envVarName}, generating new wallet:`, error.message);
        }
    }

    // Generate new wallet if not loaded
    const wallet = generateSolanaWallet();
    console.log('🔑 Generated new wallet:', wallet.publicKey);
    console.log('⚠️ Save this private key to your .env file:');
    console.log(`${envVarName}=${wallet.privateKey}`);

    return {
        keypair: wallet.keypair,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        isGenerated: true
    };
}

/**
 * Validate a Solana public key
 * @param {string} publicKeyString - Public key string to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidPublicKey(publicKeyString) {
    try {
        const { PublicKey } = require('@solana/web3.js');
        new PublicKey(publicKeyString);
        return true;
    } catch {
        return false;
    }
}

/**
 * Convert keypair to exportable format
 * @param {Keypair} keypair - Solana keypair
 * @returns {Object} Exportable wallet data
 */
function exportWallet(keypair) {
    return {
        publicKey: keypair.publicKey.toString(),
        privateKey: bs58.encode(keypair.secretKey),
        secretKeyArray: Array.from(keypair.secretKey)
    };
}

module.exports = {
    generateSolanaWallet,
    loadKeypairFromPrivateKey,
    loadOrGenerateWallet,
    isValidPublicKey,
    exportWallet
};
