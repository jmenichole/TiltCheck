// Beta Verification Contract System
// Implements crypto signature verification and device fingerprinting for legal protection

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

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

    // Create crypto signature for contract
    async signContract(contract, userSignature) {
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
        return contract;
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
