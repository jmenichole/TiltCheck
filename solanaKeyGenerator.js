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
 * Solana Keypair Generator
 * Generates Ed25519 keypairs for Solana and formats them properly
 */

const crypto = require('crypto');
const bs58 = require('bs58');

class SolanaKeyGenerator {
    /**
     * Generate a Solana keypair using Node.js crypto
     * Returns both public and private keys in proper Solana format
     */
    static async generateSolanaKeypair() {
        try {
            // Generate Ed25519 keypair using Node.js crypto
            const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'der'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'der'
                }
            });

            // Extract raw key bytes
            const publicKeyBytes = this.extractPublicKeyBytes(publicKey);
            const privateKeyBytes = this.extractPrivateKeyBytes(privateKey);

            // Combine private key bytes + public key bytes (Solana format)
            const combinedBytes = new Uint8Array(64);
            combinedBytes.set(privateKeyBytes, 0);
            combinedBytes.set(publicKeyBytes, 32);

            // Encode to base58 (Solana standard)
            const solanaPrivateKey = bs58.encode(combinedBytes);
            const solanaPublicKey = bs58.encode(publicKeyBytes);

            return {
                publicKey: solanaPublicKey,
                privateKey: solanaPrivateKey,
                publicKeyBytes: publicKeyBytes,
                privateKeyBytes: privateKeyBytes,
                combinedBytes: combinedBytes
            };

        } catch (error) {
            console.error('Error generating Solana keypair:', error);
            throw error;
        }
    }

    /**
     * Alternative method using @solana/web3.js
     */
    static async generateSolanaKeypairSolanaJS() {
        try {
            const { generateSolanaWallet } = require('./utils/solanaWalletUtils');
            const wallet = generateSolanaWallet();
            
            return {
                publicKey: wallet.publicKey,
                privateKey: wallet.privateKey,
                publicKeyBytes: wallet.keypair.publicKey.toBytes(),
                privateKeyBytes: wallet.secretKey.slice(0, 32),
                secretKey: wallet.secretKey // Full 64-byte secret key
            };

        } catch (error) {
            const { logError } = require('./utils/errorHandlingUtils');
            logError('Generate Solana keypair with Solana JS', error);
            throw error;
        }
    }

    /**
     * Web Crypto API version (for browser environments)
     */
    static async generateSolanaKeypairWebCrypto() {
        try {
            // Generate Ed25519 keypair
            const keypair = await crypto.subtle.generateKey(
                'Ed25519',
                true, /* extractable */
                ["sign", "verify"]
            );

            // Export public key bytes
            const publicKeyArrayBuffer = await crypto.subtle.exportKey('raw', keypair.publicKey);
            const publicKeyBytes = new Uint8Array(publicKeyArrayBuffer);

            // Export private key bytes
            const privateKeyArrayBuffer = await crypto.subtle.exportKey('pkcs8', keypair.privateKey);
            const privateKeyBytes = this.extractPrivateKeyFromPKCS8(privateKeyArrayBuffer);

            // Combine for Solana format (private + public)
            const combinedBytes = new Uint8Array(64);
            combinedBytes.set(privateKeyBytes, 0);
            combinedBytes.set(publicKeyBytes, 32);

            // Encode to base58
            const solanaPrivateKey = bs58.encode(combinedBytes);
            const solanaPublicKey = bs58.encode(publicKeyBytes);

            return {
                publicKey: solanaPublicKey,
                privateKey: solanaPrivateKey,
                publicKeyBytes: publicKeyBytes,
                privateKeyBytes: privateKeyBytes,
                combinedBytes: combinedBytes
            };

        } catch (error) {
            console.error('Error generating Solana keypair with Web Crypto:', error);
            throw error;
        }
    }

    /**
     * Extract public key bytes from DER format
     */
    static extractPublicKeyBytes(derPublicKey) {
        // Ed25519 public key is the last 32 bytes of the DER structure
        const keyBytes = derPublicKey.slice(-32);
        return new Uint8Array(keyBytes);
    }

    /**
     * Extract private key bytes from DER format
     */
    static extractPrivateKeyBytes(derPrivateKey) {
        // Ed25519 private key is typically at offset 16, length 32
        const keyBytes = derPrivateKey.slice(16, 48);
        return new Uint8Array(keyBytes);
    }

    /**
     * Extract private key from PKCS8 format (Web Crypto)
     */
    static extractPrivateKeyFromPKCS8(pkcs8ArrayBuffer) {
        const pkcs8Bytes = new Uint8Array(pkcs8ArrayBuffer);
        // Ed25519 private key is typically at offset 16, length 32
        return pkcs8Bytes.slice(16, 48);
    }

    /**
     * Validate a Solana address
     */
    static isValidSolanaAddress(address) {
        try {
            const decoded = bs58.decode(address);
            return decoded.length === 32;
        } catch {
            return false;
        }
    }

    /**
     * Validate a Solana private key
     */
    static isValidSolanaPrivateKey(privateKey) {
        try {
            const decoded = bs58.decode(privateKey);
            return decoded.length === 64;
        } catch {
            return false;
        }
    }

    /**
     * Convert private key to keypair object
     */
    static privateKeyToKeypair(privateKeyBase58) {
        try {
            const { Keypair } = require('@solana/web3.js');
            const secretKey = bs58.decode(privateKeyBase58);
            return Keypair.fromSecretKey(secretKey);
        } catch (error) {
            console.error('Error converting private key to keypair:', error);
            throw error;
        }
    }
}

module.exports = SolanaKeyGenerator;
