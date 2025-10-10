// TiltCheck Beta NFT Contract System
// Creates unique NFTs for beta users that serve as verifiable contract signatures
// Links Discord ID ownership to NFT for authentication

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class BetaNFTContract {
    constructor() {
        this.contractCollection = 'TiltCheckBetaAccess';
        this.nftBasePath = path.join(__dirname, 'data', 'beta-nfts');
        this.metadataPath = path.join(__dirname, 'data', 'nft-metadata');
        this.ownershipPath = path.join(__dirname, 'data', 'nft-ownership');
        
        // NFT Contract configuration
        this.contractConfig = {
            name: 'TiltCheck Beta Access NFT',
            symbol: 'TCBETA',
            version: '1.0.0',
            maxSupply: 1000, // Limited beta access
            royalty: 2.5, // 2.5% royalty on secondary sales
            contractCreator: 'jmenichole0', // Your identifier
            network: 'TiltCheck-Beta-Chain' // Custom verification chain
        };

        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.nftBasePath, { recursive: true });
            await fs.mkdir(this.metadataPath, { recursive: true });
            await fs.mkdir(this.ownershipPath, { recursive: true });
            console.log('✅ Beta NFT contract system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize NFT system:', error);
        }
    }

    // Generate unique NFT for beta user
    async mintBetaNFT(discordId, contractId, deviceFingerprint, userSignature) {
        const tokenId = this.generateTokenId(discordId, contractId);
        const timestamp = Date.now();
        
        // Create NFT metadata
        const metadata = {
            tokenId,
            name: `TiltCheck Beta Access #${tokenId.slice(-6)}`,
            description: 'Exclusive NFT representing verified beta testing access to TiltCheck ecosystem with legally binding contract signature.',
            image: await this.generateNFTImage(discordId, tokenId),
            attributes: [
                {
                    trait_type: 'Access Level',
                    value: 'Beta Tester'
                },
                {
                    trait_type: 'Discord ID',
                    value: discordId
                },
                {
                    trait_type: 'Contract ID',
                    value: contractId
                },
                {
                    trait_type: 'Mint Date',
                    value: new Date(timestamp).toISOString().split('T')[0]
                },
                {
                    trait_type: 'Platform',
                    value: 'TiltCheck'
                },
                {
                    trait_type: 'Access Type',
                    value: 'Desktop Beta'
                },
                {
                    trait_type: 'Contract Signature',
                    value: await this.createContractSignature(discordId, contractId, userSignature)
                },
                {
                    trait_type: 'Device Fingerprint Hash',
                    value: crypto.createHash('sha256').update(deviceFingerprint.fingerprint).digest('hex').slice(0, 16)
                },
                {
                    trait_type: 'Verification Status',
                    value: 'Verified'
                }
            ],
            properties: {
                category: 'Access Token',
                rarity: 'Limited',
                utility: ['Beta Access', 'Legal Contract', 'Discord Verification'],
                transferable: false, // Non-transferable for security
                burnable: true // Can be burned if access revoked
            },
            external_url: `https://tiltcheck.it.com/nft/${tokenId}`,
            animation_url: await this.generateAnimatedNFT(discordId, tokenId)
        };

        // Create ownership record
        const ownershipRecord = {
            tokenId,
            owner: discordId,
            contractId,
            mintedAt: timestamp,
            deviceFingerprint: deviceFingerprint.fingerprint,
            contractSignature: metadata.attributes.find(attr => attr.trait_type === 'Contract Signature').value,
            status: 'active',
            verificationHash: this.generateVerificationHash(discordId, tokenId, contractId),
            accessRights: {
                betaTesting: true,
                desktopAccess: true,
                analyticsAccess: true,
                feedbackSubmission: true,
                contractualProtection: true
            }
        };

        // Save NFT data
        await this.saveNFTData(tokenId, metadata, ownershipRecord);
        
        return {
            tokenId,
            metadata,
            ownershipRecord,
            contractSignature: metadata.attributes.find(attr => attr.trait_type === 'Contract Signature').value,
            verificationUrl: `${process.env.BASE_URL || 'http://localhost:4002'}/verify-nft/${tokenId}`
        };
    }

    // Generate unique token ID based on Discord ID and contract
    generateTokenId(discordId, contractId) {
        const combined = `${discordId}${contractId}${Date.now()}`;
        return crypto.createHash('sha256').update(combined).digest('hex');
    }

    // Create verifiable contract signature
    async createContractSignature(discordId, contractId, userSignature) {
        const signatureData = {
            discordId,
            contractId,
            userSignature,
            timestamp: Date.now(),
            creator: this.contractConfig.contractCreator
        };

        return crypto
            .createHash('sha256')
            .update(JSON.stringify(signatureData))
            .digest('hex');
    }

    // Generate verification hash for ownership
    generateVerificationHash(discordId, tokenId, contractId) {
        return crypto
            .createHash('sha256')
            .update(`${discordId}:${tokenId}:${contractId}:${this.contractConfig.contractCreator}`)
            .digest('hex');
    }

    // Generate NFT image (SVG-based)
    async generateNFTImage(discordId, tokenId) {
        const discordIdShort = discordId.slice(-8);
        const tokenIdShort = tokenId.slice(-8);
        const timestamp = new Date().toISOString().split('T')[0];

        const svgImage = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#0a0a0a"/>
                    <stop offset="50%" style="stop-color:#2c1810"/>
                    <stop offset="100%" style="stop-color:#8b4513"/>
                </linearGradient>
                <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#00ff00"/>
                    <stop offset="100%" style="stop-color:#0080ff"/>
                </linearGradient>
            </defs>
            
            <!-- Background -->
            <rect width="400" height="400" fill="url(#bg)"/>
            
            <!-- Border -->
            <rect x="10" y="10" width="380" height="380" fill="none" stroke="url(#accent)" stroke-width="3" rx="20"/>
            
            <!-- Title -->
            <text x="200" y="60" text-anchor="middle" fill="#00ff00" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
                TILTCHECK BETA
            </text>
            
            <!-- NFT Icon -->
            <circle cx="200" cy="140" r="40" fill="none" stroke="url(#accent)" stroke-width="3"/>
            <text x="200" y="150" text-anchor="middle" fill="#00ff00" font-family="Arial, sans-serif" font-size="30" font-weight="bold">
                🎮
            </text>
            
            <!-- Discord ID -->
            <text x="200" y="220" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="14">
                Discord: ${discordIdShort}
            </text>
            
            <!-- Token ID -->
            <text x="200" y="245" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="12">
                Token: ${tokenIdShort}
            </text>
            
            <!-- Date -->
            <text x="200" y="270" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12">
                Minted: ${timestamp}
            </text>
            
            <!-- Access Level -->
            <rect x="50" y="300" width="300" height="40" fill="rgba(0,255,0,0.1)" stroke="#00ff00" stroke-width="1" rx="20"/>
            <text x="200" y="325" text-anchor="middle" fill="#00ff00" font-family="Arial, sans-serif" font-size="16" font-weight="bold">
                VERIFIED BETA ACCESS
            </text>
            
            <!-- Footer -->
            <text x="200" y="370" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="10">
                tiltcheck.it.com
            </text>
        </svg>`;

        const imageDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgImage).toString('base64')}`;
        return imageDataUrl;
    }

    // Generate animated NFT (CSS animation)
    async generateAnimatedNFT(discordId, tokenId) {
        const animationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; background: #000; overflow: hidden; }
                .nft-container {
                    width: 400px;
                    height: 400px;
                    position: relative;
                    background: linear-gradient(135deg, #0a0a0a 0%, #2c1810 50%, #8b4513 100%);
                    border: 3px solid #00ff00;
                    border-radius: 20px;
                    animation: glow 3s ease-in-out infinite alternate;
                }
                @keyframes glow {
                    from { box-shadow: 0 0 20px #00ff00; }
                    to { box-shadow: 0 0 40px #00ff00, 0 0 60px #0080ff; }
                }
                .title {
                    position: absolute;
                    top: 40px;
                    width: 100%;
                    text-align: center;
                    color: #00ff00;
                    font-family: Arial, sans-serif;
                    font-size: 24px;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .icon {
                    position: absolute;
                    top: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 60px;
                    animation: rotate 5s linear infinite;
                }
                @keyframes rotate {
                    from { transform: translateX(-50%) rotate(0deg); }
                    to { transform: translateX(-50%) rotate(360deg); }
                }
                .access-badge {
                    position: absolute;
                    bottom: 60px;
                    left: 50px;
                    right: 50px;
                    background: rgba(0,255,0,0.1);
                    border: 1px solid #00ff00;
                    border-radius: 20px;
                    padding: 10px;
                    text-align: center;
                    color: #00ff00;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    animation: glow-text 2s ease-in-out infinite alternate;
                }
                @keyframes glow-text {
                    from { text-shadow: 0 0 10px #00ff00; }
                    to { text-shadow: 0 0 20px #00ff00, 0 0 30px #0080ff; }
                }
            </style>
        </head>
        <body>
            <div class="nft-container">
                <div class="title">TILTCHECK BETA</div>
                <div class="icon">🎮</div>
                <div class="access-badge">VERIFIED BETA ACCESS</div>
            </div>
        </body>
        </html>`;

        const animationDataUrl = `data:text/html;base64,${Buffer.from(animationHtml).toString('base64')}`;
        return animationDataUrl;
    }

    // Save NFT data to storage
    async saveNFTData(tokenId, metadata, ownershipRecord) {
        try {
            // Save metadata
            await fs.writeFile(
                path.join(this.metadataPath, `${tokenId}.json`),
                JSON.stringify(metadata, null, 2)
            );

            // Save ownership record
            await fs.writeFile(
                path.join(this.ownershipPath, `${tokenId}.json`),
                JSON.stringify(ownershipRecord, null, 2)
            );

            // Update master registry
            await this.updateNFTRegistry(tokenId, metadata, ownershipRecord);

        } catch (error) {
            console.error('Error saving NFT data:', error);
            throw error;
        }
    }

    // Update master NFT registry
    async updateNFTRegistry(tokenId, metadata, ownershipRecord) {
        const registryPath = path.join(this.nftBasePath, 'registry.json');
        
        try {
            let registry = { tokens: [], totalSupply: 0 };
            
            try {
                const registryData = await fs.readFile(registryPath, 'utf8');
                registry = JSON.parse(registryData);
            } catch (error) {
                // Registry doesn't exist yet, use default
            }

            // Add new token to registry
            registry.tokens.push({
                tokenId,
                owner: ownershipRecord.owner,
                mintedAt: ownershipRecord.mintedAt,
                name: metadata.name,
                contractId: ownershipRecord.contractId,
                verificationHash: ownershipRecord.verificationHash
            });

            registry.totalSupply = registry.tokens.length;
            registry.lastUpdated = Date.now();

            await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));

        } catch (error) {
            console.error('Error updating NFT registry:', error);
            throw error;
        }
    }

    // Verify NFT ownership by Discord ID
    async verifyNFTOwnership(discordId, tokenId) {
        try {
            const ownershipPath = path.join(this.ownershipPath, `${tokenId}.json`);
            const ownershipData = await fs.readFile(ownershipPath, 'utf8');
            const ownership = JSON.parse(ownershipData);

            return {
                isValid: ownership.owner === discordId && ownership.status === 'active',
                ownership,
                verificationHash: ownership.verificationHash
            };
        } catch (error) {
            return {
                isValid: false,
                error: 'NFT not found or verification failed'
            };
        }
    }

    // Get NFT metadata
    async getNFTMetadata(tokenId) {
        try {
            const metadataPath = path.join(this.metadataPath, `${tokenId}.json`);
            const metadataData = await fs.readFile(metadataPath, 'utf8');
            return JSON.parse(metadataData);
        } catch (error) {
            return null;
        }
    }

    // Get all NFTs for a Discord user
    async getUserNFTs(discordId) {
        try {
            const registryPath = path.join(this.nftBasePath, 'registry.json');
            const registryData = await fs.readFile(registryPath, 'utf8');
            const registry = JSON.parse(registryData);

            return registry.tokens.filter(token => token.owner === discordId);
        } catch (error) {
            return [];
        }
    }

    // Revoke NFT (burn) if access is revoked
    async revokeNFT(tokenId, reason) {
        try {
            const ownershipPath = path.join(this.ownershipPath, `${tokenId}.json`);
            const ownershipData = await fs.readFile(ownershipPath, 'utf8');
            const ownership = JSON.parse(ownershipData);

            ownership.status = 'revoked';
            ownership.revokedAt = Date.now();
            ownership.revocationReason = reason;

            await fs.writeFile(ownershipPath, JSON.stringify(ownership, null, 2));

            return true;
        } catch (error) {
            console.error('Error revoking NFT:', error);
            return false;
        }
    }

    // Generate NFT contract terms
    generateNFTContractTerms(discordId) {
        return {
            nftContract: {
                collection: this.contractCollection,
                tokenStandard: 'TiltCheck-Beta-NFT',
                transferable: false,
                royalty: this.contractConfig.royalty,
                maxSupply: this.contractConfig.maxSupply
            },
            ownership: {
                linkedDiscordId: discordId,
                verificationRequired: true,
                deviceBinding: true,
                accessRights: [
                    'TiltCheck Beta Testing',
                    'Desktop Application Access',
                    'Analytics Dashboard Access',
                    'Contract Signature Verification',
                    'Legal Protection Coverage'
                ]
            },
            legalBinding: {
                contractSignature: true,
                deviceFingerprinting: true,
                identityVerification: true,
                termsAcceptance: true,
                revocationRights: true
            }
        };
    }
}

module.exports = BetaNFTContract;
