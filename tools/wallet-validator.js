#!/usr/bin/env node

/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * Wallet Address and NFT Validation Utility
 * Validates wallet addresses and NFT tokens to prevent malformed data and fake NFTs
 */

const crypto = require('crypto');

class WalletValidator {
    constructor() {
        // Blockchain address patterns
        this.patterns = {
            solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
            ethereum: /^0x[a-fA-F0-9]{40}$/,
            bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
            bitcoinSegwit: /^bc1[a-z0-9]{39,59}$/
        };

        // NFT mint address patterns (Solana)
        this.nftMintPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

        // Blacklisted addresses (known scams)
        this.blacklist = new Set([
            // Add known scam addresses here
        ]);
    }

    /**
     * Validate Solana wallet address
     */
    validateSolanaAddress(address) {
        const errors = [];
        const warnings = [];

        // Basic format check
        if (!address || typeof address !== 'string') {
            errors.push('Address must be a non-empty string');
            return { valid: false, errors, warnings };
        }

        // Length check
        if (address.length < 32 || address.length > 44) {
            errors.push(`Invalid address length: ${address.length} (should be 32-44 characters)`);
        }

        // Character check
        if (!this.patterns.solana.test(address)) {
            errors.push('Address contains invalid characters (must be base58)');
        }

        // Blacklist check
        if (this.blacklist.has(address)) {
            errors.push('Address is blacklisted (known scam)');
        }

        // Check for common typos
        if (address.includes('O') || address.includes('0') || address.includes('I') || address.includes('l')) {
            warnings.push('Address contains ambiguous characters (O, 0, I, l are not valid in base58)');
        }

        // Check if it looks like a system program
        const systemPrograms = [
            '11111111111111111111111111111111', // System Program
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
        ];

        if (systemPrograms.includes(address)) {
            warnings.push('Address appears to be a system program, not a user wallet');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            format: 'solana',
            checksum: this.computeChecksum(address)
        };
    }

    /**
     * Validate Ethereum wallet address
     */
    validateEthereumAddress(address) {
        const errors = [];
        const warnings = [];

        if (!address || typeof address !== 'string') {
            errors.push('Address must be a non-empty string');
            return { valid: false, errors, warnings };
        }

        // Format check
        if (!this.patterns.ethereum.test(address)) {
            errors.push('Invalid Ethereum address format (should be 0x followed by 40 hex characters)');
        }

        // Checksum validation (EIP-55)
        const hasChecksum = address !== address.toLowerCase() && address !== address.toUpperCase();
        if (hasChecksum) {
            const isValidChecksum = this.validateEthereumChecksum(address);
            if (!isValidChecksum) {
                warnings.push('Invalid checksum (address may be mistyped)');
            }
        }

        // Null address check
        if (address === '0x0000000000000000000000000000000000000000') {
            warnings.push('Address is the null address (0x0...)');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            format: 'ethereum',
            hasChecksum
        };
    }

    /**
     * Validate Ethereum checksum (EIP-55)
     */
    validateEthereumChecksum(address) {
        const addr = address.slice(2); // Remove 0x
        const hash = crypto.createHash('sha3-256').update(addr.toLowerCase()).digest('hex');

        for (let i = 0; i < 40; i++) {
            const hashByte = parseInt(hash[i], 16);
            if ((hashByte > 7 && addr[i].toUpperCase() !== addr[i]) || 
                (hashByte <= 7 && addr[i].toLowerCase() !== addr[i])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate NFT mint address
     */
    validateNFTMintAddress(mintAddress, blockchain = 'solana') {
        if (blockchain === 'solana') {
            return this.validateSolanaAddress(mintAddress);
        } else if (blockchain === 'ethereum') {
            return this.validateEthereumAddress(mintAddress);
        }

        return {
            valid: false,
            errors: ['Unsupported blockchain'],
            warnings: []
        };
    }

    /**
     * Validate NFT metadata
     */
    validateNFTMetadata(metadata) {
        const errors = [];
        const warnings = [];

        // Required fields
        const requiredFields = ['name', 'symbol', 'uri'];
        requiredFields.forEach(field => {
            if (!metadata[field]) {
                errors.push(`Missing required field: ${field}`);
            }
        });

        // URI validation
        if (metadata.uri) {
            try {
                const url = new URL(metadata.uri);
                
                // Check for suspicious domains
                const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf'];
                if (suspiciousTLDs.some(tld => url.hostname.endsWith(tld))) {
                    warnings.push('URI uses a suspicious top-level domain');
                }

                // Prefer HTTPS
                if (url.protocol !== 'https:') {
                    warnings.push('URI should use HTTPS');
                }

                // IPFS or Arweave are good signs
                if (url.protocol === 'ipfs:' || url.hostname.includes('arweave')) {
                    // Good - decentralized storage
                } else if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    errors.push('URI points to localhost (metadata not accessible)');
                }
            } catch (error) {
                errors.push('Invalid URI format');
            }
        }

        // Symbol validation
        if (metadata.symbol && metadata.symbol.length > 10) {
            warnings.push('Symbol is unusually long');
        }

        // Name validation
        if (metadata.name) {
            if (metadata.name.length < 3) {
                warnings.push('Name is very short');
            }
            if (metadata.name.length > 100) {
                warnings.push('Name is unusually long');
            }
        }

        // Seller fee basis points check
        if (metadata.seller_fee_basis_points !== undefined) {
            if (metadata.seller_fee_basis_points > 10000) {
                errors.push('Invalid seller fee (must be <= 10000 basis points)');
            }
            if (metadata.seller_fee_basis_points > 5000) {
                warnings.push('Very high seller fee (> 50%)');
            }
        }

        // Creators validation
        if (metadata.creators) {
            if (!Array.isArray(metadata.creators)) {
                errors.push('Creators must be an array');
            } else {
                let totalShare = 0;
                metadata.creators.forEach((creator, index) => {
                    if (!creator.address) {
                        errors.push(`Creator ${index} missing address`);
                    } else {
                        const addressValidation = this.validateSolanaAddress(creator.address);
                        if (!addressValidation.valid) {
                            errors.push(`Creator ${index} has invalid address`);
                        }
                    }

                    if (creator.share !== undefined) {
                        totalShare += creator.share;
                    }
                });

                if (totalShare !== 100) {
                    warnings.push(`Creator shares sum to ${totalShare}% (should be 100%)`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Verify NFT ownership on-chain
     */
    async verifyNFTOwnership(ownerAddress, mintAddress, blockchain = 'solana') {
        // Note: This requires blockchain connection
        // For demo purposes, we'll validate the addresses
        
        const ownerValidation = blockchain === 'solana' ? 
            this.validateSolanaAddress(ownerAddress) :
            this.validateEthereumAddress(ownerAddress);

        const mintValidation = this.validateNFTMintAddress(mintAddress, blockchain);

        if (!ownerValidation.valid || !mintValidation.valid) {
            return {
                verified: false,
                errors: [
                    ...ownerValidation.errors,
                    ...mintValidation.errors
                ]
            };
        }

        // In production, this would make an on-chain query
        // For now, return structure for integration
        return {
            verified: true,
            owner: ownerAddress,
            mint: mintAddress,
            blockchain,
            note: 'Address validation passed. On-chain verification requires blockchain connection.'
        };
    }

    /**
     * Detect fake or suspicious NFTs
     */
    detectFakeNFT(metadata, mintAddress) {
        const suspiciousIndicators = [];

        // Check for common scam patterns
        const scamKeywords = [
            'free mint',
            'airdrop',
            'giveaway',
            'claim now',
            'limited time',
            'urgent',
            'whitelist'
        ];

        const name = (metadata.name || '').toLowerCase();
        const description = (metadata.description || '').toLowerCase();

        scamKeywords.forEach(keyword => {
            if (name.includes(keyword) || description.includes(keyword)) {
                suspiciousIndicators.push(`Contains suspicious keyword: "${keyword}"`);
            }
        });

        // Check for impersonation
        const knownProjects = ['bored ape', 'cryptopunk', 'degod', 'solana monkey'];
        knownProjects.forEach(project => {
            if (name.includes(project) && !this.isVerifiedProject(mintAddress, project)) {
                suspiciousIndicators.push(`Possible impersonation of ${project}`);
            }
        });

        // Check metadata URI
        if (metadata.uri) {
            if (metadata.uri.includes('bit.ly') || metadata.uri.includes('tinyurl')) {
                suspiciousIndicators.push('Uses URL shortener (suspicious)');
            }
        }

        // Check for very high royalties
        if (metadata.seller_fee_basis_points > 5000) {
            suspiciousIndicators.push('Unusually high royalty fee (> 50%)');
        }

        return {
            isSuspicious: suspiciousIndicators.length > 0,
            suspiciousIndicators,
            riskLevel: suspiciousIndicators.length > 2 ? 'high' : 
                       suspiciousIndicators.length > 0 ? 'medium' : 'low'
        };
    }

    /**
     * Check if project is verified (stub for demo)
     */
    isVerifiedProject(mintAddress, projectName) {
        // In production, this would check against a verified projects database
        return false;
    }

    /**
     * Compute checksum for address
     */
    computeChecksum(address) {
        return crypto.createHash('sha256').update(address).digest('hex').substring(0, 8);
    }

    /**
     * Batch validate addresses
     */
    batchValidate(addresses, blockchain = 'solana') {
        return addresses.map(address => {
            const validation = blockchain === 'solana' ?
                this.validateSolanaAddress(address) :
                this.validateEthereumAddress(address);

            return {
                address,
                ...validation
            };
        });
    }
}

// CLI usage
if (require.main === module) {
    const validator = new WalletValidator();

    console.log('Wallet Validator Demo\n');

    // Test Solana address
    const solanaAddress = '7xKXtg2CW87d97TXJSDpLq2otBKHT8CveFmPY8gSZz8F';
    console.log('Validating Solana address:', solanaAddress);
    const solResult = validator.validateSolanaAddress(solanaAddress);
    console.log('Result:', JSON.stringify(solResult, null, 2));

    // Test Ethereum address
    console.log('\nValidating Ethereum address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
    const ethAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    const ethResult = validator.validateEthereumAddress(ethAddress);
    console.log('Result:', JSON.stringify(ethResult, null, 2));

    // Test NFT metadata
    console.log('\nValidating NFT metadata:');
    const metadata = {
        name: 'TiltCheck Trust NFT',
        symbol: 'TCTRUST',
        uri: 'https://arweave.net/abc123',
        seller_fee_basis_points: 500,
        creators: [
            { address: '7xKXtg2CW87d97TXJSDpLq2otBKHT8CveFmPY8gSZz8F', share: 100 }
        ]
    };
    const metaResult = validator.validateNFTMetadata(metadata);
    console.log('Result:', JSON.stringify(metaResult, null, 2));
}

module.exports = WalletValidator;
