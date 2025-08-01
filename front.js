const fs = require('fs');
const { getUserData } = require('./storage');
const { getRankFromRespect, getLoanCapFromRespect } = require('./respectManager');
const PaymentManager = require('./paymentManager');

// Enhanced Casino Trust Integration
const DEGEN_APPROVED_CASINOS = {
    stake: {
        name: 'Stake',
        weight: 1.0,
        minBalance: 1000,
        riskLevel: 'very_low',
        apiEndpoint: 'https://api.stake.com',
        complianceProfile: {
            licenses: ['Curacao eGaming 8048/JAZ2020-013'],
            regulatoryStatus: 'compliant',
            kyc: { required: true, levels: ['basic', 'enhanced', 'premium'] },
            aml: { enabled: true, monitoring: 'real-time' },
            fairness: { provablyFair: true, rtp: 'verified', audited: true },
            lastAudit: '2024-12-15',
            complianceScore: 95
        },
        payoutMetrics: {
            statedTimeframe: '1-24 hours',
            actualAverage: '2.3 hours',
            variance: '+1.3 hours',
            successRate: 98.7,
            minimumWithdrawal: 10,
            maximumDaily: 100000,
            fees: { crypto: 0, fiat: '2.5%' }
        },
        bonusCompliance: {
            wageringRequirements: { stated: '40x', actual: '40x', fair: true },
            maxBet: { stated: '5', actual: '5', enforced: true },
            gameRestrictions: { stated: 'slots only', actual: 'slots only', accurate: true },
            timeLimit: { stated: '30 days', actual: '30 days', extended: false },
            bonusAbuse: { detection: 'advanced', prevention: 'strict' }
        },
        trustFactors: {
            userReviews: 4.6,
            payoutReliability: 98.7,
            bonusHonoring: 97.2,
            customerSupport: 4.4,
            platformStability: 99.1
        }
    },
    rollbit: {
        name: 'Rollbit',
        weight: 0.9,
        minBalance: 800,
        riskLevel: 'low',
        apiEndpoint: 'https://api.rollbit.com',
        complianceProfile: {
            licenses: ['Curacao eGaming 1668/JAZ'],
            regulatoryStatus: 'compliant',
            kyc: { required: true, levels: ['basic', 'enhanced'] },
            aml: { enabled: true, monitoring: 'batch' },
            fairness: { provablyFair: true, rtp: 'verified', audited: true },
            lastAudit: '2024-11-20',
            complianceScore: 88
        },
        payoutMetrics: {
            statedTimeframe: '1-6 hours',
            actualAverage: '4.1 hours',
            variance: '+2.1 hours',
            successRate: 96.4,
            minimumWithdrawal: 20,
            maximumDaily: 50000,
            fees: { crypto: 0, fiat: '3%' }
        },
        bonusCompliance: {
            wageringRequirements: { stated: '35x', actual: '35x', fair: true },
            maxBet: { stated: '10', actual: '10', enforced: true },
            gameRestrictions: { stated: 'all games', actual: 'all games', accurate: true },
            timeLimit: { stated: '14 days', actual: '14 days', extended: false },
            bonusAbuse: { detection: 'moderate', prevention: 'standard' }
        },
        trustFactors: {
            userReviews: 4.3,
            payoutReliability: 96.4,
            bonusHonoring: 94.8,
            customerSupport: 4.1,
            platformStability: 97.8
        }
    },
    shuffle: {
        name: 'Shuffle',
        weight: 0.85,
        minBalance: 600,
        riskLevel: 'low',
        apiEndpoint: 'https://api.shuffle.com',
        complianceProfile: {
            licenses: ['Curacao eGaming 1668/JAZ'],
            regulatoryStatus: 'under_review',
            kyc: { required: false, levels: ['optional'] },
            aml: { enabled: true, monitoring: 'manual' },
            fairness: { provablyFair: true, rtp: 'unverified', audited: false },
            lastAudit: null,
            complianceScore: 72
        },
        payoutMetrics: {
            statedTimeframe: 'instant',
            actualAverage: '15 minutes',
            variance: '+15 minutes',
            successRate: 94.2,
            minimumWithdrawal: 5,
            maximumDaily: 25000,
            fees: { crypto: 0, fiat: 'N/A' }
        },
        bonusCompliance: {
            wageringRequirements: { stated: '50x', actual: '50x', fair: false },
            maxBet: { stated: '2', actual: '2', enforced: false },
            gameRestrictions: { stated: 'slots only', actual: 'varies', accurate: false },
            timeLimit: { stated: '7 days', actual: '5 days', extended: false },
            bonusAbuse: { detection: 'basic', prevention: 'minimal' }
        },
        trustFactors: {
            userReviews: 3.9,
            payoutReliability: 94.2,
            bonusHonoring: 87.3,
            customerSupport: 3.6,
            platformStability: 92.1
        }
    },
    bcgame: {
        name: 'BC.Game',
        weight: 0.8,
        minBalance: 500,
        riskLevel: 'medium',
        apiEndpoint: 'https://api.bc.game',
        complianceProfile: {
            licenses: ['Curacao eGaming 1668/JAZ'],
            regulatoryStatus: 'compliant',
            kyc: { required: true, levels: ['basic', 'enhanced'] },
            aml: { enabled: true, monitoring: 'real-time' },
            fairness: { provablyFair: true, rtp: 'verified', audited: true },
            lastAudit: '2024-10-30',
            complianceScore: 84
        },
        payoutMetrics: {
            statedTimeframe: '1-12 hours',
            actualAverage: '6.8 hours',
            variance: '+4.8 hours',
            successRate: 93.1,
            minimumWithdrawal: 15,
            maximumDaily: 75000,
            fees: { crypto: 'network', fiat: '2%' }
        },
        bonusCompliance: {
            wageringRequirements: { stated: '40x', actual: '45x', fair: false },
            maxBet: { stated: '5', actual: '5', enforced: true },
            gameRestrictions: { stated: 'all games', actual: 'limited slots', accurate: false },
            timeLimit: { stated: '30 days', actual: '30 days', extended: false },
            bonusAbuse: { detection: 'advanced', prevention: 'strict' }
        },
        trustFactors: {
            userReviews: 4.1,
            payoutReliability: 93.1,
            bonusHonoring: 89.6,
            customerSupport: 3.8,
            platformStability: 94.7
        }
    },
    metawin: {
        name: 'MetaWin',
        weight: 0.75,
        minBalance: 400,
        riskLevel: 'medium',
        apiEndpoint: 'https://api.metawin.com',
        complianceProfile: {
            licenses: ['Costa Rica Gaming License'],
            regulatoryStatus: 'pending',
            kyc: { required: false, levels: ['none'] },
            aml: { enabled: false, monitoring: 'none' },
            fairness: { provablyFair: false, rtp: 'unverified', audited: false },
            lastAudit: null,
            complianceScore: 58
        },
        payoutMetrics: {
            statedTimeframe: '1-48 hours',
            actualAverage: '18.4 hours',
            variance: '+16.4 hours',
            successRate: 91.3,
            minimumWithdrawal: 25,
            maximumDaily: 20000,
            fees: { crypto: '1%', fiat: 'N/A' }
        },
        bonusCompliance: {
            wageringRequirements: { stated: '30x', actual: '40x', fair: false },
            maxBet: { stated: '10', actual: '5', enforced: false },
            gameRestrictions: { stated: 'no restrictions', actual: 'slots only', accurate: false },
            timeLimit: { stated: '21 days', actual: '14 days', extended: false },
            bonusAbuse: { detection: 'none', prevention: 'none' }
        },
        trustFactors: {
            userReviews: 3.4,
            payoutReliability: 91.3,
            bonusHonoring: 76.2,
            customerSupport: 3.2,
            platformStability: 89.4
        }
    },
    duelbits: {
        name: 'DuelBits',
        weight: 0.7,
        minBalance: 300,
        riskLevel: 'medium',
        apiEndpoint: 'https://api.duelbits.com',
        complianceProfile: {
            licenses: ['Curacao eGaming 1668/JAZ'],
            regulatoryStatus: 'compliant',
            kyc: { required: true, levels: ['basic'] },
            aml: { enabled: true, monitoring: 'manual' },
            fairness: { provablyFair: true, rtp: 'partially_verified', audited: false },
            lastAudit: '2024-09-15',
            complianceScore: 79
        },
        payoutMetrics: {
            statedTimeframe: '2-24 hours',
            actualAverage: '12.1 hours',
            variance: '+10.1 hours',
            successRate: 89.7,
            minimumWithdrawal: 30,
            maximumDaily: 30000,
            fees: { crypto: 'network', fiat: '4%' }
        },
        bonusCompliance: {
            wageringRequirements: { stated: '40x', actual: '40x', fair: true },
            maxBet: { stated: '5', actual: '5', enforced: false },
            gameRestrictions: { stated: 'slots only', actual: 'slots only', accurate: true },
            timeLimit: { stated: '30 days', actual: '30 days', extended: false },
            bonusAbuse: { detection: 'basic', prevention: 'standard' }
        },
        trustFactors: {
            userReviews: 3.7,
            payoutReliability: 89.7,
            bonusHonoring: 82.4,
            customerSupport: 3.5,
            platformStability: 91.8
        }
    }
};

const path = './loans.json';

function loadLoans() {
    if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');
    return JSON.parse(fs.readFileSync(path));
}

function saveLoans(loans) {
    fs.writeFileSync(path, JSON.stringify(loans, null, 2));
}

function loadUserTrust() {
    const trustPath = './user_trust.json';
    if (!fs.existsSync(trustPath)) fs.writeFileSync(trustPath, '{}');
    return JSON.parse(fs.readFileSync(trustPath));
}

function loadCasinoConnections() {
    const connectionsPath = './casino_connections.json';
    if (!fs.existsSync(connectionsPath)) fs.writeFileSync(connectionsPath, '{}');
    return JSON.parse(fs.readFileSync(connectionsPath));
}

function saveCasinoConnections(connections) {
    const connectionsPath = './casino_connections.json';
    fs.writeFileSync(connectionsPath, JSON.stringify(connections, null, 2));
}

/**
 * Enhanced Trust Score Calculation with Compliance & Regulatory Factors
 * Analyzes verifiable casino connections with compliance monitoring
 */
async function calculateEnhancedTrustScore(userId) {
    const userTrust = loadUserTrust()[userId] || { successfulPayments: 0, totalBorrowed: 0 };
    const connections = loadCasinoConnections()[userId] || {};
    const userData = await getUserData(userId);
    
    // Base trust score from payment history (0-40 points)
    const paymentScore = Math.min(userTrust.successfulPayments * 8, 40);
    
    // Casino connection verification score with compliance weighting (0-35 points)
    let casinoScore = 0;
    let totalCasinoWeight = 0;
    let verifiedConnections = 0;
    let complianceWeightedScore = 0;
    
    for (const [casino, casinoData] of Object.entries(DEGEN_APPROVED_CASINOS)) {
        if (connections[casino] && connections[casino].verified) {
            const connection = connections[casino];
            const baseWeight = casinoData.weight;
            
            // Compliance adjustment factor (0.5x to 1.2x based on regulatory standing)
            let complianceMultiplier = 1.0;
            const compliance = casinoData.complianceProfile;
            
            // Regulatory status impact
            switch (compliance.regulatoryStatus) {
                case 'compliant':
                    complianceMultiplier += 0.2;
                    break;
                case 'under_review':
                    complianceMultiplier -= 0.1;
                    break;
                case 'pending':
                    complianceMultiplier -= 0.2;
                    break;
                case 'non_compliant':
                    complianceMultiplier -= 0.5;
                    break;
            }
            
            // License quality impact
            if (compliance.licenses.some(license => license.includes('Curacao'))) {
                complianceMultiplier += 0.1;
            }
            
            // Audit and fairness impact
            if (compliance.fairness.audited) complianceMultiplier += 0.1;
            if (compliance.fairness.provablyFair) complianceMultiplier += 0.05;
            
            // Payout reliability impact
            const payoutReliability = casinoData.payoutMetrics.successRate / 100;
            complianceMultiplier += (payoutReliability - 0.9) * 0.5; // Bonus for >90% success rate
            
            // Bonus compliance impact
            const bonusCompliance = casinoData.bonusCompliance;
            let bonusFairness = 0;
            if (bonusCompliance.wageringRequirements.fair) bonusFairness += 0.25;
            if (bonusCompliance.gameRestrictions.accurate) bonusFairness += 0.25;
            if (bonusCompliance.maxBet.enforced) bonusFairness += 0.25;
            if (bonusCompliance.bonusAbuse.prevention !== 'none') bonusFairness += 0.25;
            
            complianceMultiplier += bonusFairness * 0.1; // Up to 0.1 bonus for fair bonus terms
            
            // Apply compliance multiplier (cap between 0.3 and 1.5)
            const adjustedWeight = baseWeight * Math.max(0.3, Math.min(1.5, complianceMultiplier));
            
            // Connection quality factors
            let connectionQuality = 0;
            
            // Account age bonus (max 5 points per casino)
            if (connection.accountAge >= 365) connectionQuality += 5;
            else if (connection.accountAge >= 180) connectionQuality += 3;
            else if (connection.accountAge >= 30) connectionQuality += 1;
            
            // Balance history bonus (max 5 points per casino)
            if (connection.avgBalance >= casinoData.minBalance * 5) connectionQuality += 5;
            else if (connection.avgBalance >= casinoData.minBalance * 2) connectionQuality += 3;
            else if (connection.avgBalance >= casinoData.minBalance) connectionQuality += 1;
            
            // Activity consistency bonus (max 3 points per casino)
            if (connection.daysActive >= 100) connectionQuality += 3;
            else if (connection.daysActive >= 30) connectionQuality += 2;
            else if (connection.daysActive >= 7) connectionQuality += 1;
            
            // VIP/Status bonus (max 2 points per casino)
            if (connection.vipLevel && connection.vipLevel >= 3) connectionQuality += 2;
            else if (connection.vipLevel && connection.vipLevel >= 1) connectionQuality += 1;
            
            casinoScore += connectionQuality * adjustedWeight;
            totalCasinoWeight += adjustedWeight;
            complianceWeightedScore += compliance.complianceScore * adjustedWeight;
            verifiedConnections++;
        }
    }
    
    // Normalize casino score (max 35 points)
    if (totalCasinoWeight > 0) {
        casinoScore = Math.min((casinoScore / totalCasinoWeight) * 35, 35);
    }
    
    // Compliance bonus for high-quality verified casinos (0-10 points)
    let complianceBonus = 0;
    if (totalCasinoWeight > 0) {
        const avgComplianceScore = complianceWeightedScore / totalCasinoWeight;
        complianceBonus = Math.min((avgComplianceScore / 100) * 10, 10);
    }
    
    // Diversity bonus for multiple verified connections (0-10 points, reduced from 15)
    const diversityBonus = Math.min(verifiedConnections * 2, 10);
    
    // Respect-based reliability score (0-5 points, reduced from 10)
    const respectScore = Math.min((userData.respect || 0) / 1000, 5);
    
    // Calculate final trust score (0-100)
    const finalScore = paymentScore + casinoScore + complianceBonus + diversityBonus + respectScore;
    
    return {
        totalScore: Math.round(finalScore),
        breakdown: {
            paymentHistory: Math.round(paymentScore),
            casinoConnections: Math.round(casinoScore),
            complianceBonus: Math.round(complianceBonus),
            diversityBonus: Math.round(diversityBonus),
            respectScore: Math.round(respectScore),
            verifiedCasinos: verifiedConnections,
            avgComplianceScore: totalCasinoWeight > 0 ? Math.round(complianceWeightedScore / totalCasinoWeight) : 0
        },
        risk: finalScore >= 85 ? 'very_low' : 
              finalScore >= 70 ? 'low' : 
              finalScore >= 50 ? 'medium' : 
              finalScore >= 30 ? 'high' : 'very_high'
    };
}

/**
 * Verify casino connection for trust scoring
 * Implements API calls to validate casino account connections
 */
async function verifyCasinoConnection(userId, casino, accountDetails) {
    const connections = loadCasinoConnections();
    if (!connections[userId]) connections[userId] = {};
    
    try {
        const casinoConfig = DEGEN_APPROVED_CASINOS[casino];
        if (!casinoConfig) throw new Error('Unsupported casino');
        
        // API verification based on casino type
        let verificationResult = null;
        
        switch (casino) {
            case 'stake':
                verificationResult = await verifyStakeAccount(accountDetails);
                break;
            case 'rollbit':
                verificationResult = await verifyRollbitAccount(accountDetails);
                break;
            case 'shuffle':
                verificationResult = await verifyShuffleAccount(accountDetails);
                break;
            case 'bcgame':
                verificationResult = await verifyBCGameAccount(accountDetails);
                break;
            case 'metawin':
                verificationResult = await verifyMetaWinAccount(accountDetails);
                break;
            case 'duelbits':
                verificationResult = await verifyDuelBitsAccount(accountDetails);
                break;
            default:
                throw new Error('Casino verification not implemented');
        }
        
        if (verificationResult && verificationResult.verified) {
            connections[userId][casino] = {
                verified: true,
                accountId: verificationResult.accountId,
                accountAge: verificationResult.accountAge,
                avgBalance: verificationResult.avgBalance,
                daysActive: verificationResult.daysActive,
                vipLevel: verificationResult.vipLevel,
                lastVerified: Date.now(),
                trustFactors: verificationResult.trustFactors
            };
            
            saveCasinoConnections(connections);
            return { success: true, data: connections[userId][casino] };
        }
        
        return { success: false, error: 'Verification failed' };
        
    } catch (error) {
        console.error(`Casino verification error for ${casino}:`, error);
        return { success: false, error: error.message };
    }
}

// Casino-specific verification functions
async function verifyStakeAccount(details) {
    try {
        // Stake API verification logic
        const response = await fetch(`${DEGEN_APPROVED_CASINOS.stake.apiEndpoint}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: details.username,
                signature: details.signature // Cryptographic proof of ownership
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                verified: true,
                accountId: data.accountId,
                accountAge: data.accountAge,
                avgBalance: data.stats.avgBalance,
                daysActive: data.stats.activeDays,
                vipLevel: data.vipLevel,
                trustFactors: data.trustFactors
            };
        }
    } catch (error) {
        console.error('Stake verification error:', error);
    }
    return { verified: false };
}

async function verifyRollbitAccount(details) {
    try {
        // Rollbit API verification logic
        const response = await fetch(`${DEGEN_APPROVED_CASINOS.rollbit.apiEndpoint}/user/verify`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${details.apiKey}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ userId: details.userId })
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                verified: true,
                accountId: data.user.id,
                accountAge: data.user.accountAge,
                avgBalance: data.stats.averageBalance,
                daysActive: data.stats.activeDays,
                vipLevel: data.user.vipTier,
                trustFactors: data.trustMetrics
            };
        }
    } catch (error) {
        console.error('Rollbit verification error:', error);
    }
    return { verified: false };
}

async function verifyShuffleAccount(details) {
    try {
        // Shuffle API verification logic
        const response = await fetch(`${DEGEN_APPROVED_CASINOS.shuffle.apiEndpoint}/account/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                publicKey: details.publicKey,
                signature: details.signature
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                verified: true,
                accountId: data.account.id,
                accountAge: data.metrics.accountAge,
                avgBalance: data.metrics.avgBalance,
                daysActive: data.metrics.activeDays,
                vipLevel: data.account.level,
                trustFactors: data.trustScore
            };
        }
    } catch (error) {
        console.error('Shuffle verification error:', error);
    }
    return { verified: false };
}

async function verifyBCGameAccount(details) {
    try {
        // BC.Game API verification logic
        const response = await fetch(`${DEGEN_APPROVED_CASINOS.bcgame.apiEndpoint}/user/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: details.username,
                token: details.authToken
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                verified: true,
                accountId: data.userId,
                accountAge: data.profile.accountAge,
                avgBalance: data.stats.avgBalance,
                daysActive: data.stats.activeDays,
                vipLevel: data.profile.vipLevel,
                trustFactors: data.trustMetrics
            };
        }
    } catch (error) {
        console.error('BC.Game verification error:', error);
    }
    return { verified: false };
}

async function verifyMetaWinAccount(details) {
    try {
        // MetaWin API verification logic
        const response = await fetch(`${DEGEN_APPROVED_CASINOS.metawin.apiEndpoint}/verify-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: details.walletAddress,
                signature: details.signature
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                verified: true,
                accountId: data.account.id,
                accountAge: data.account.createdDaysAgo,
                avgBalance: data.statistics.avgBalance,
                daysActive: data.statistics.activeDays,
                vipLevel: data.account.tier,
                trustFactors: data.trustScore
            };
        }
    } catch (error) {
        console.error('MetaWin verification error:', error);
    }
    return { verified: false };
}

/**
 * Enhanced loan eligibility calculation with compliance-weighted casino trust
 */
async function calculateEnhancedLoanAmount(userId) {
    const trustScore = await calculateEnhancedTrustScore(userId);
    const userData = await getUserData(userId);
    const respectLevel = userData.respect || 0;
    
    // Base loan amount from respect (existing system)
    let baseLoanAmount = 0;
    if (respectLevel >= 1000) baseLoanAmount = 500000;
    else if (respectLevel >= 500) baseLoanAmount = 250000;
    else if (respectLevel >= 100) baseLoanAmount = 100000;
    else if (respectLevel >= 50) baseLoanAmount = 50000;
    else if (respectLevel >= 10) baseLoanAmount = 25000;
    else baseLoanAmount = 10000;
    
    // Enhanced casino trust multiplier with compliance weighting
    let trustMultiplier = 1.0;
    switch (trustScore.risk) {
        case 'very_low':
            trustMultiplier = 3.0;  // 300% of base amount (increased from 2.5x)
            break;
        case 'low':
            trustMultiplier = 2.2;  // 220% of base amount (increased from 1.8x)
            break;
        case 'medium':
            trustMultiplier = 1.5;  // 150% of base amount (increased from 1.3x)
            break;
        case 'high':
            trustMultiplier = 0.9;  // 90% of base amount (increased from 0.8x)
            break;
        case 'very_high':
            trustMultiplier = 0.4;  // 40% of base amount (increased from 0.3x)
            break;
    }
    
    // Compliance elite tier bonus for high-compliance casinos
    const avgCompliance = trustScore.breakdown.avgComplianceScore;
    if (trustScore.breakdown.verifiedCasinos >= 2 && avgCompliance >= 90) {
        trustMultiplier += 0.8; // Additional 80% bonus for elite compliance
    } else if (trustScore.breakdown.verifiedCasinos >= 2 && avgCompliance >= 80) {
        trustMultiplier += 0.5; // Additional 50% bonus for good compliance
    }
    
    // Regulatory bonus for fully compliant casinos
    if (avgCompliance >= 95 && trustScore.breakdown.verifiedCasinos >= 3) {
        trustMultiplier += 0.3; // Additional 30% for regulatory excellence
    }
    
    const enhancedLoanAmount = Math.floor(baseLoanAmount * trustMultiplier);
    
    return {
        baseLoanAmount,
        trustMultiplier,
        enhancedLoanAmount,
        maxLoanAmount: enhancedLoanAmount,
        trustScore,
        complianceMetrics: {
            avgComplianceScore: avgCompliance,
            regulatoryBonus: avgCompliance >= 90 ? 'Elite' : avgCompliance >= 80 ? 'Standard' : 'Basic',
            verifiedCasinos: trustScore.breakdown.verifiedCasinos
        },
        eligibilityDetails: {
            respectBased: baseLoanAmount,
            casinoTrustBonus: Math.floor(baseLoanAmount * (trustMultiplier - 1)),
            finalAmount: enhancedLoanAmount,
            riskLevel: trustScore.risk
        }
    };
}

/**
 * Enhanced loan approval process with casino verification
 */
async function processEnhancedLoan(userId, requestedAmount, interaction) {
    try {
        const loanCalculation = await calculateEnhancedLoanAmount(userId);
        const userData = await getUserData(userId);
        
        // Check if user has existing loan
        const existingLoan = await checkExistingLoan(userId);
        if (existingLoan) {
            return {
                success: false,
                error: 'You already have an active loan. Please repay it before requesting a new one.',
                existingLoan
            };
        }
        
        // Validate requested amount against enhanced limit
        if (requestedAmount > loanCalculation.maxLoanAmount) {
            return {
                success: false,
                error: `Maximum loan amount: $${loanCalculation.maxLoanAmount.toLocaleString()}`,
                maxAmount: loanCalculation.maxLoanAmount,
                trustScore: loanCalculation.trustScore
            };
        }
        
        // Dynamic interest rate based on trust score
        let interestRate = 0.15; // Default 15%
        switch (loanCalculation.trustScore.risk) {
            case 'very_low':
                interestRate = 0.05; // 5% for elite users
                break;
            case 'low':
                interestRate = 0.08; // 8% for high trust
                break;
            case 'medium':
                interestRate = 0.12; // 12% for medium trust
                break;
            case 'high':
                interestRate = 0.18; // 18% for high risk
                break;
            case 'very_high':
                interestRate = 0.25; // 25% for very high risk
                break;
        }
        
        // Calculate loan terms
        const principal = requestedAmount;
        const interest = Math.floor(principal * interestRate);
        const totalRepayment = principal + interest;
        const dueDate = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        
        // Create enhanced loan record
        const loanRecord = {
            id: generateLoanId(),
            userId,
            principal,
            interest,
            totalRepayment,
            interestRate: Math.round(interestRate * 100),
            requestDate: Date.now(),
            dueDate,
            status: 'active',
            trustScore: loanCalculation.trustScore,
            riskLevel: loanCalculation.trustScore.risk,
            verifiedCasinos: loanCalculation.trustScore.breakdown.verifiedCasinos,
            paymentMethod: 'casino_verified'
        };
        
        // Save loan
        const success = await saveLoan(loanRecord);
        if (success) {
            // Update user balance
            userData.balance = (userData.balance || 0) + principal;
            await saveUserData(userId, userData);
            
            return {
                success: true,
                loan: loanRecord,
                message: `✅ **Enhanced Loan Approved!**\n` +
                        `💰 Amount: $${principal.toLocaleString()}\n` +
                        `📈 Interest Rate: ${Math.round(interestRate * 100)}% (Casino Trust Verified)\n` +
                        `💳 Total Repayment: $${totalRepayment.toLocaleString()}\n` +
                        `📅 Due Date: <t:${Math.floor(dueDate/1000)}:F>\n` +
                        `🎯 Trust Score: ${loanCalculation.trustScore.totalScore}/100 (${loanCalculation.trustScore.risk})\n` +
                        `🎰 Verified Casinos: ${loanCalculation.trustScore.breakdown.verifiedCasinos}\n` +
                        `⚡ Enhanced rates available due to casino verification!`
            };
        }
        
        return { success: false, error: 'Failed to process loan' };
        
    } catch (error) {
        console.error('Enhanced loan processing error:', error);
        return { success: false, error: 'Internal error processing loan' };
    }
}

async function verifyDuelBitsAccount(details) {
    try {
        // DuelBits API verification logic
        const response = await fetch(`${DEGEN_APPROVED_CASINOS.duelbits.apiEndpoint}/account/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: details.userId,
                apiSecret: details.apiSecret
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                verified: true,
                accountId: data.user.id,
                accountAge: data.user.accountAge,
                avgBalance: data.stats.avgBalance,
                daysActive: data.stats.activeDays,
                vipLevel: data.user.level,
                trustFactors: data.trustMetrics
            };
        }
    } catch (error) {
        console.error('DuelBits verification error:', error);
    }
    return { verified: false };
}

// Helper functions for loan system
async function checkExistingLoan(userId) {
    const loans = loadLoans();
    return loans.find(loan => loan.userId === userId && loan.status === 'active');
}

async function saveLoan(loanRecord) {
    try {
        const loans = loadLoans();
        loans.push(loanRecord);
        saveLoans(loans);
        return true;
    } catch (error) {
        console.error('Error saving loan:', error);
        return false;
    }
}

async function saveUserData(userId, userData) {
    try {
        const fs = require('fs');
        const userDataPath = './data/userData.json';
        let allUserData = {};
        
        if (fs.existsSync(userDataPath)) {
            allUserData = JSON.parse(fs.readFileSync(userDataPath));
        }
        
        allUserData[userId] = userData;
        fs.writeFileSync(userDataPath, JSON.stringify(allUserData, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
}

function generateLoanId() {
    return `LOAN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Original system functions for backward compatibility
async function isEligibleForLoan(userId) {
    const userData = await getUserData(userId);
    const respectLevel = userData.respect || 0;
    return respectLevel >= 10; // Minimum 10 respect required
}

async function calculateLoanAmount(userId) {
    const userData = await getUserData(userId);
    const respectLevel = userData.respect || 0;
    
    // Basic loan amount calculation
    if (respectLevel >= 1000) return 500000;
    if (respectLevel >= 500) return 250000;
    if (respectLevel >= 100) return 100000;
    if (respectLevel >= 50) return 50000;
    if (respectLevel >= 10) return 25000;
    return 10000;
}

async function processLoan(userId, amount) {
    try {
        const userData = await getUserData(userId);
        const existingLoan = await checkExistingLoan(userId);
        
        if (existingLoan) {
            return { success: false, error: 'Existing loan must be repaid first' };
        }
        
        const maxAmount = await calculateLoanAmount(userId);
        if (amount > maxAmount) {
            return { success: false, error: `Maximum loan amount: $${maxAmount}` };
        }
        
        // Create basic loan record
        const loanRecord = {
            id: generateLoanId(),
            userId,
            principal: amount,
            interest: Math.floor(amount * 0.15), // 15% interest
            totalRepayment: amount + Math.floor(amount * 0.15),
            requestDate: Date.now(),
            dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
            status: 'active'
        };
        
        const success = await saveLoan(loanRecord);
        if (success) {
            userData.balance = (userData.balance || 0) + amount;
            await saveUserData(userId, userData);
            return { success: true, loan: loanRecord };
        }
        
        return { success: false, error: 'Failed to process loan' };
    } catch (error) {
        console.error('Error processing loan:', error);
        return { success: false, error: 'Internal error' };
    }
}

/**
 * Get enhanced trust level with casino integration
 */
async function getEnhancedTrustLevel(userId) {
    const trustScore = await calculateEnhancedTrustScore(userId);
    
    if (trustScore.totalScore >= 80) return 'elite';
    if (trustScore.totalScore >= 60) return 'high';
    if (trustScore.totalScore >= 40) return 'medium';
    if (trustScore.totalScore >= 20) return 'low';
    return 'unverified';
}

function saveUserTrust(trust) {
    const trustPath = './user_trust.json';
    fs.writeFileSync(trustPath, JSON.stringify(trust, null, 2));
}

function isMonday() {
    // Check for admin override first
    const overridePath = './monday_override.json';
    if (fs.existsSync(overridePath)) {
        const override = JSON.parse(fs.readFileSync(overridePath));
        if (override.enabled) return true;
    }
    
    const today = new Date();
    return today.getDay() === 1; // Monday is 1
}

function getTrustLevel(userId, trustData) {
    const userTrust = trustData[userId] || { successfulPayments: 0, totalBorrowed: 0 };
    if (userTrust.successfulPayments >= 5) return 'high';
    if (userTrust.successfulPayments >= 2) return 'medium';
    return 'low';
}

async function getMaxLoanAmount(userId, trustLevel) {
    // Get user's respect-based loan cap
    const userData = await getUserData(userId);
    const respectLoanCap = getLoanCapFromRespect(userData.respect || 0);
    
    // Get trust multiplier
    const trustMultiplier = {
        'high': 1.0,    // Full respect-based limit
        'medium': 0.75, // 75% of respect limit
        'low': 0.5      // 50% of respect limit
    };
    
    const maxAmount = Math.floor(respectLoanCap * (trustMultiplier[trustLevel] || 0.5));
    return Math.max(maxAmount, 10); // Minimum $10 loan
}

async function handleFrontCommand(message, args) {
    const userId = message.author.id;
    const loans = loadLoans();
    const trust = loadUserTrust();
    const subCommand = args[0];
    const now = Date.now();

    if (subCommand === 'me') {
        // Check if it's Monday
        if (!isMonday()) {
            return message.reply('Yo, fronts only go down on Mondays! Come back when the week starts fresh. 📅');
        }

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Whatchu need? A chicken? A bird? Maybe a nickel? Dimebag? Drop a real number. 💰');
        }

        // Check for existing unpaid loans
        if (loans[userId] && !loans[userId].repaid) {
            return message.reply("You already owe the block. Pay up before askin' for more. No games! 💸");
        }

        // Check trust level and max amount (now includes respect)
        const trustLevel = getTrustLevel(userId, trust);
        const maxAmount = await getMaxLoanAmount(userId, trustLevel);
        const userData = await getUserData(userId);
        const userRank = getRankFromRespect(userData.respect || 0);
        
        if (amount > maxAmount) {
            return message.reply(`Hold up! Your rank (${userRank.rank}) and trust level (${trustLevel}) caps you at $${maxAmount}. Earn more respect and build trust to unlock bigger amounts! 🏆\n\nRespect-based cap: $${getLoanCapFromRespect(userData.respect || 0)} | Trust modifier: ${trustLevel === 'high' ? '100%' : trustLevel === 'medium' ? '75%' : '50%'}`);
        }

        loans[userId] = {
            amount,
            timestamp: now,
            dueDate: now + (5 * 24 * 60 * 60 * 1000), // 5 days from now
            repaid: false,
            trustLevel,
            userRank: userRank.rank
        };
        saveLoans(loans);
        
        const repayAmount = Math.floor(amount * 1.5); // 150% (50% interest)
        
        // Process loan issuance fee
        try {
            const paymentManager = new PaymentManager(message.client);
            await paymentManager.processLoanIssuanceFee(userId, amount, `loan_${now}`);
        } catch (error) {
            console.error('Error processing loan issuance fee:', error);
        }
        
        // Generate crypto tip instructions for the user
        const tipCommand = `$tip <@${userId}> ${amount}`;
        
        return message.reply(`You been fronted 💸 $${amount}! You got 5 days to bring me back $${repayAmount} (150%).

**💳 PROCESSING FEE:** $3 loan issuance fee will be charged via crypto payment
**PAYMENT METHOD:** Direct crypto tipping (no external APIs)
**Admin will send you:** \`${tipCommand}\`
**You repay with:** \`$tip <@ADMIN_ID> ${repayAmount}\`

*Powered by secure crypto wallets - no tip.cc required!*

Don't make me come lookin' for you... 🔫

*Rank: ${userRank.rank} | Trust: ${trustLevel} | Due: ${new Date(loans[userId].dueDate).toLocaleDateString()}*`);
    }

    if (subCommand === 'repay') {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply("How much you payin'? Type a real number. 💵\n\n**Remember:** Use crypto wallet to pay admin directly");
        }
        if (!loans[userId] || loans[userId].repaid) {
            return message.reply("You don't owe nothin'… yet. 😏");
        }

        const loan = loans[userId];
        const originalAmount = loan.amount;
        const totalDue = Math.floor(originalAmount * 1.5); // 150% repayment
        const isOverdue = now > loan.dueDate;
        
        if (isOverdue) {
            // Process late repayment fee
            try {
                const daysLate = Math.ceil((now - loan.dueDate) / (24 * 60 * 60 * 1000));
                const paymentManager = new PaymentManager(message.client);
                await paymentManager.processLateRepaymentFee(userId, `loan_${loan.timestamp}`, daysLate);
            } catch (error) {
                console.error('Error processing late repayment fee:', error);
            }
            
            // Add late fees - extra 25% if overdue
            const lateFee = Math.floor(originalAmount * 0.25);
            const totalWithLateFee = totalDue + lateFee;
            
            if (amount >= totalWithLateFee) {
                // Full payment with late fee
                loans[userId].repaid = true;
                loans[userId].paidDate = now;
                
                // Update trust - late payment doesn't build as much trust
                if (!trust[userId]) trust[userId] = { successfulPayments: 0, totalBorrowed: 0 };
                trust[userId].successfulPayments += 0.5; // Half credit for late payment
                trust[userId].totalBorrowed += originalAmount;
                
                saveLoans(loans);
                saveUserTrust(trust);
                return message.reply(`Bout time! You paid the full $${totalWithLateFee} (with late fees). **💳 Additional $3 late payment fee charged via crypto.** Don't be late next time! ⏰💸\n\n**CONFIRM PAYMENT:** Send via crypto: Contact admin for wallet address`);
            } else {
                return message.reply(`You're late! You owe $${totalWithLateFee} now (original $${totalDue} + $${lateFee} late fee). **💳 Additional $3 late payment fee will be charged via crypto.** Pay up! 🚨\n\n**PAY NOW:** Contact admin for crypto wallet address`);
            }
        }

        if (amount >= totalDue) {
            // Full payment on time
            loans[userId].repaid = true;
            loans[userId].paidDate = now;
            
            // Update trust - good payment builds trust
            if (!trust[userId]) trust[userId] = { successfulPayments: 0, totalBorrowed: 0 };
            trust[userId].successfulPayments += 1;
            trust[userId].totalBorrowed += originalAmount;
            
            saveLoans(loans);
            saveUserTrust(trust);
            
            const newTrustLevel = getTrustLevel(userId, trust);
            const newMaxAmount = await getMaxLoanAmount(userId, newTrustLevel);
            const userData = await getUserData(userId);
            const userRank = getRankFromRespect(userData.respect || 0);
            
            return message.reply(`Respect! 💯 You paid your dues in full ($${totalDue}). 

**New Status:**
🏆 Trust level: ${newTrustLevel} 
👑 Rank: ${userRank.rank}
💰 Max loan: $${newMaxAmount}

You got some fo me? That's okkk, I got more for you when you need it! 🤝

**CONFIRM PAYMENT:** Send via crypto: Contact admin for wallet address`);
        } else {
            return message.reply(`Partial payments ain't how we do business here. You owe $${totalDue} total. Bring the full amount! 💸\n\n**PAY FULL:** \`$tip <@ADMIN_ID> ${totalDue}\``);
        }
    }

    if (subCommand === 'check') {
        if (!loans[userId] || loans[userId].repaid) {
            const userTrust = trust[userId] || { successfulPayments: 0, totalBorrowed: 0 };
            const trustLevel = getTrustLevel(userId, userTrust);
            const maxAmount = await getMaxLoanAmount(userId, trustLevel);
            const userData = await getUserData(userId);
            const userRank = getRankFromRespect(userData.respect || 0);
            
            return message.reply(`You ain't got no fronts active.

**Your Status:**
👑 Rank: ${userRank.rank} (${userData.respect || 0} respect)
🏆 Trust: ${trustLevel} (${userTrust.successfulPayments} payments)
💰 Max loan: $${maxAmount}
📅 ${isMonday() ? 'It\'s Monday - ready for business! 🏪' : 'Come back Monday for fronts! 📅'}`);
        }

        const loan = loans[userId];
        const originalAmount = loan.amount;
        const totalDue = Math.floor(originalAmount * 1.5);
        const dueDate = new Date(loan.dueDate);
        const isOverdue = now > loan.dueDate;
        const timeLeft = Math.ceil((loan.dueDate - now) / (24 * 60 * 60 * 1000));

        if (isOverdue) {
            const daysLate = Math.ceil((now - loan.dueDate) / (24 * 60 * 60 * 1000));
            const lateFee = Math.floor(originalAmount * 0.25);
            const totalWithLateFee = totalDue + lateFee;
            return message.reply(`⚠️ YOU'RE LATE! You owe $${totalWithLateFee} (original $${totalDue} + $${lateFee} late fee). ${daysLate} day(s) overdue. 

**PAY NOW:** \`$tip <@ADMIN_ID> ${totalWithLateFee}\` 🚨`);
        }

        return message.reply(`You owe $${totalDue} for your $${originalAmount} front. ${timeLeft} day(s) left to pay.

**Due:** ${dueDate.toLocaleDateString()}
**Pay with:** \`$tip <@ADMIN_ID> ${totalDue}\`
⏰💸`);
    }

    if (subCommand === 'trust') {
        const userTrust = trust[userId] || { successfulPayments: 0, totalBorrowed: 0 };
        const trustLevel = getTrustLevel(userId, userTrust);
        const maxAmount = await getMaxLoanAmount(userId, trustLevel);
        const userData = await getUserData(userId);
        const userRank = getRankFromRespect(userData.respect || 0);
        const respectLoanCap = getLoanCapFromRespect(userData.respect || 0);
        
        return message.reply(`**Your Street Status** 🏆

👑 **Rank:** ${userRank.rank} (${userData.respect || 0} respect)
🏆 **Trust Level:** ${trustLevel} (${userTrust.successfulPayments} successful payments)
💰 **Max Loan:** $${maxAmount}

**Breakdown:**
• Respect-based cap: $${respectLoanCap}
• Trust modifier: ${trustLevel === 'high' ? '100%' : trustLevel === 'medium' ? '75%' : '50%'}
• Total borrowed: $${userTrust.totalBorrowed}

**Next Goals:**
${userRank.rank === 'Street Soldier' ? '• Earn 500+ respect to become Corner Boy' : ''}
${userRank.rank === 'Corner Boy' ? '• Earn 1000+ respect to become Hustler' : ''}
${userRank.rank === 'Hustler' ? '• Earn 2000+ respect to become Shot Caller' : ''}
${userRank.rank === 'Shot Caller' ? '• Earn 5000+ respect to become Boss' : ''}
${trustLevel === 'low' ? '• Make 2+ payments to reach medium trust' : ''}
${trustLevel === 'medium' ? '• Make 5+ payments to reach high trust' : ''}
${trustLevel === 'high' ? '• You got the keys to the kingdom! 👑' : ''}`);
    }

    if (subCommand === 'help' || subCommand === 'rules') {
        const helpMessage = `📋 **TONY MONTANA'S FRONTS - THE RULES** 📋

**What you need to know:**
🗓️ **Fronts only available on MONDAYS**
⏰ **5 days to repay**  
💰 **150% repayment** (borrow $20, repay $30)
🏆 **Respect + Trust system** - climb ranks for bigger amounts
💳 **Crypto payments** - all money via direct wallet transfers

**Commands:**
• \`!front me <amount>\` - Request a front (Mondays only)
• \`!front repay <amount>\` - Pay back your debt
• \`!front check\` - Check your current debt status
• \`!front trust\` - View your rank and limits

**Respect-Based Loan Caps:**
🥉 **Street Soldier** (0-499 respect): Max $20 (with trust)
🥈 **Corner Boy** (500-999 respect): Max $35 (with trust)
🥇 **Hustler** (1000-1999 respect): Max $50 (with trust)
💎 **Shot Caller** (2000-4999 respect): Max $75 (with trust)
👑 **Boss** (5000+ respect): Max $100 (with trust)

**Trust Multipliers:**
• Low trust (0-1 payments): 50% of respect cap
• Medium trust (2-4 payments): 75% of respect cap
• High trust (5+ payments): 100% of respect cap

**Payment Example:**
\`!front me 20\` → Admin sends: \`$tip @you 20\`
You repay: \`$tip @admin 30\` (within 5 days)

*Once you build trust with me, I will open the doors to bigger amounts!* 🚪`;
        return message.reply(helpMessage);
    }

    return message.reply('Invalid front command. Use `!front help` for all commands or `!front me <amount>`, `!front repay <amount>`, `!front check`, or `!front trust`');
}

module.exports = { 
    handleFrontCommand,
    
    // Enhanced casino trust system exports
    calculateEnhancedTrustScore,
    getEnhancedTrustLevel,
    verifyCasinoConnection,
    calculateEnhancedLoanAmount,
    processEnhancedLoan,
    loadCasinoConnections,
    saveCasinoConnections,
    
    // Casino verification functions
    verifyStakeAccount,
    verifyRollbitAccount,
    verifyShuffleAccount,
    verifyBCGameAccount,
    verifyMetaWinAccount,
    verifyDuelBitsAccount,
    
    // Configuration
    DEGEN_APPROVED_CASINOS,
    
    // Original system functions
    isEligibleForLoan,
    calculateLoanAmount,
    processLoan,
    loadUserTrust
};
