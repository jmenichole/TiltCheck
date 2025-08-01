// Beta Verification Contract System
// Implements crypto signature verification and device fingerprinting for legal protection
// Now includes NFT minting for verified contract signatures

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const BetaNFTContract = require('./beta-nft-contract');

class BetaVerificationContract {
    constructor() {
        this.approvedBetaUsers = [
            '1155164907680043059',   // Beta tester 1
            '297854966591127552',    // Beta tester 2
            '4927969932326994201217998526663888916', // Beta tester 3
            '997337840734187621',    // User provided
            '1271253905115975773'    // User provided
        ];
        
        this.waitlistChannel = '1400663773102211166'; // Bet Collective Discord tickets channel
        this.contractsPath = path.join(__dirname, 'data', 'beta-contracts');
        this.nftContract = new BetaNFTContract(); // Initialize NFT system
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.contractsPath, { recursive: true });
            console.log('✅ Beta verification contract system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize contract system:', error);
        }
    }

    // Generate device fingerprint for legal tracking
    generateDeviceFingerprint(req) {
        const userAgent = req.headers['user-agent'] || '';
        const acceptLanguage = req.headers['accept-language'] || '';
        const acceptEncoding = req.headers['accept-encoding'] || '';
        const xForwardedFor = req.headers['x-forwarded-for'] || '';
        const timestamp = Date.now();
        
        const fingerprint = crypto
            .createHash('sha256')
            .update(`${userAgent}${acceptLanguage}${acceptEncoding}${xForwardedFor}${timestamp}`)
            .digest('hex');
            
        return {
            fingerprint,
            userAgent,
            acceptLanguage,
            acceptEncoding,
            ipHint: xForwardedFor.split(',')[0] || 'unknown',
            timestamp,
            sessionId: crypto.randomUUID()
        };
    }

    // Generate legal contract for beta testing
    generateBetaContract(discordId, deviceFingerprint) {
        const contractId = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        
        return {
            contractId,
            discordId,
            deviceFingerprint,
            timestamp,
            version: '1.0.0',
            terms: {
                betaTesting: {
                    agreed: false,
                    desktopOnly: true,
                    feedbackRequired: true,
                    cryptoFundingRequired: true,
                    sessionDuration: '7 days',
                    testingEnvironment: true
                },
                legalProtection: {
                    gamblingAccountability: true,
                    noGuarantees: true,
                    personalResponsibility: true,
                    dataCollection: true,
                    deviceTracking: true
                },
                technicalRequirements: {
                    desktopAccess: true,
                    discordAccount: true,
                    cryptoWallet: true,
                    stableInternet: true
                }
            },
            signature: null,
            status: 'pending'
        };
    }

    // Create crypto signature for contract and mint NFT
    async signContract(contractId, userSignature) {
        try {
            // Load the contract
            const contracts = await this.getAllContracts();
            const contract = contracts.find(c => c.contractId === contractId);
            
            if (!contract) {
                throw new Error('Contract not found');
            }

            const contractData = JSON.stringify({
                contractId: contract.contractId,
                discordId: contract.discordId,
                timestamp: contract.timestamp,
                terms: contract.terms
            });

            // Create server signature
            const serverSignature = crypto
                .createHmac('sha256', process.env.CONTRACT_SECRET || 'tiltcheck-beta-contract-2025')
                .update(contractData)
                .digest('hex');

            // Create combined signature
            const combinedSignature = crypto
                .createHash('sha256')
                .update(`${serverSignature}${userSignature}${contract.deviceFingerprint.fingerprint}`)
                .digest('hex');

            contract.signature = {
                server: serverSignature,
                user: userSignature,
                combined: combinedSignature,
                signedAt: new Date().toISOString()
            };

            contract.status = 'signed';

            // Mint NFT for the signed contract
            console.log(`🎨 Minting Beta NFT for Discord ID: ${contract.discordId}`);
            const nft = await this.nftContract.mintBetaNFT(
                contract.discordId,
                contract.contractId,
                contract.deviceFingerprint,
                userSignature
            );

            // Add NFT details to contract
            contract.nft = {
                tokenId: nft.tokenId,
                contractSignature: nft.contractSignature,
                verificationUrl: nft.verificationUrl,
                mintedAt: Date.now()
            };

            // Save updated contract
            await this.saveContract(contract);

            console.log(`✅ Beta NFT minted successfully: ${nft.tokenId}`);
            return {
                success: true,
                contract,
                nft,
                message: 'Contract signed and NFT minted successfully'
            };

        } catch (error) {
            console.error('❌ Failed to sign contract and mint NFT:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verify Discord ID is approved for beta
    isApprovedBetaUser(discordId) {
        return this.approvedBetaUsers.includes(discordId.toString());
    }

    // Save contract to file system
    async saveContract(contract) {
        try {
            const filename = `contract-${contract.discordId}-${contract.contractId}.json`;
            const filepath = path.join(this.contractsPath, filename);
            await fs.writeFile(filepath, JSON.stringify(contract, null, 2));
            console.log(`📋 Beta contract saved: ${filename}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to save contract:', error);
            return false;
        }
    }

    // Load existing contract
    async loadContract(discordId, contractId) {
        try {
            const filename = `contract-${discordId}-${contractId}.json`;
            const filepath = path.join(this.contractsPath, filename);
            const data = await fs.readFile(filepath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    // Get all contracts for a user
    async getUserContracts(discordId) {
        try {
            const files = await fs.readdir(this.contractsPath);
            const userFiles = files.filter(file => file.startsWith(`contract-${discordId}-`));
            
            const contracts = [];
            for (const file of userFiles) {
                try {
                    const data = await fs.readFile(path.join(this.contractsPath, file), 'utf8');
                    contracts.push(JSON.parse(data));
                } catch (error) {
                    console.error(`Failed to load contract file ${file}:`, error);
                }
            }
            
            return contracts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('Failed to get user contracts:', error);
            return [];
        }
    }

    // Get all contracts (for internal use)
    async getAllContracts() {
        try {
            const files = await fs.readdir(this.contractsPath);
            const contractFiles = files.filter(file => file.startsWith('contract-') && file.endsWith('.json'));
            
            const contracts = [];
            for (const file of contractFiles) {
                try {
                    const data = await fs.readFile(path.join(this.contractsPath, file), 'utf8');
                    contracts.push(JSON.parse(data));
                } catch (error) {
                    console.error(`Failed to load contract file ${file}:`, error);
                }
            }
            
            return contracts;
        } catch (error) {
            console.error('Failed to get all contracts:', error);
            return [];
        }
    }

    // Verify NFT ownership for Discord ID
    async verifyNFTOwnership(discordId) {
        try {
            const userNFTs = await this.nftContract.getUserNFTs(discordId);
            return {
                hasValidNFT: userNFTs.length > 0,
                nfts: userNFTs,
                totalNFTs: userNFTs.length
            };
        } catch (error) {
            console.error('Failed to verify NFT ownership:', error);
            return {
                hasValidNFT: false,
                nfts: [],
                totalNFTs: 0,
                error: error.message
            };
        }
    }

    // Get NFT details for verification page
    async getNFTDetails(tokenId) {
        try {
            const metadata = await this.nftContract.getNFTMetadata(tokenId);
            const ownership = await this.nftContract.verifyNFTOwnership(
                metadata?.attributes?.find(attr => attr.trait_type === 'Discord ID')?.value,
                tokenId
            );
            
            return {
                metadata,
                ownership,
                isValid: ownership.isValid
            };
        } catch (error) {
            console.error('Failed to get NFT details:', error);
            return {
                metadata: null,
                ownership: { isValid: false },
                isValid: false,
                error: error.message
            };
        }
    }

    // Check if user has valid contract with NFT
    async hasValidContract(discordId) {
        try {
            const contracts = await this.getUserContracts(discordId);
            const signedContracts = contracts.filter(c => c.status === 'signed' && c.nft);
            
            if (signedContracts.length > 0) {
                // Verify NFT still exists and is valid
                const latestContract = signedContracts[0];
                if (latestContract.nft && latestContract.nft.tokenId) {
                    const nftVerification = await this.nftContract.verifyNFTOwnership(
                        discordId, 
                        latestContract.nft.tokenId
                    );
                    return nftVerification.isValid;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Failed to check valid contract:', error);
            return false;
        }
    }

    // Verify contract signature
    verifyContractSignature(contract) {
        if (!contract.signature) return false;

        const contractData = JSON.stringify({
            contractId: contract.contractId,
            discordId: contract.discordId,
            timestamp: contract.timestamp,
            terms: contract.terms
        });

        const expectedServerSignature = crypto
            .createHmac('sha256', process.env.CONTRACT_SECRET || 'tiltcheck-beta-contract-2025')
            .update(contractData)
            .digest('hex');

        return expectedServerSignature === contract.signature.server;
    }

    // Generate waitlist ticket for non-approved users
    generateWaitlistTicket(discordId, deviceFingerprint) {
        return {
            ticketId: crypto.randomUUID(),
            discordId,
            deviceFingerprint,
            status: 'waitlisted',
            requestedAt: new Date().toISOString(),
            waitlistChannel: this.waitlistChannel,
            estimatedWait: 'TBD - Manual approval required',
            message: 'Thank you for your interest in TiltCheck beta testing. Your request has been submitted to the waitlist. You will be notified when a spot becomes available.'
        };
    }

    // Check if user has valid active contract
    async hasValidContract(discordId) {
        const contracts = await this.getUserContracts(discordId);
        const activeContract = contracts.find(contract => 
            contract.status === 'signed' && 
            this.verifyContractSignature(contract) &&
            new Date(contract.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
        );
        return activeContract || null;
    }

    // Get contract analytics
    async getContractAnalytics() {
        try {
            const files = await fs.readdir(this.contractsPath);
            const contracts = [];
            
            for (const file of files) {
                try {
                    const data = await fs.readFile(path.join(this.contractsPath, file), 'utf8');
                    contracts.push(JSON.parse(data));
                } catch (error) {
                    continue;
                }
            }

            return {
                totalContracts: contracts.length,
                signedContracts: contracts.filter(c => c.status === 'signed').length,
                pendingContracts: contracts.filter(c => c.status === 'pending').length,
                activeContracts: contracts.filter(c => 
                    c.status === 'signed' && 
                    new Date(c.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                uniqueUsers: [...new Set(contracts.map(c => c.discordId))].length,
                lastWeekSignings: contracts.filter(c => 
                    new Date(c.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
            };
        } catch (error) {
            return {
                totalContracts: 0,
                signedContracts: 0,
                pendingContracts: 0,
                activeContracts: 0,
                uniqueUsers: 0,
                lastWeekSignings: 0
            };
        }
    }
}

module.exports = BetaVerificationContract;
