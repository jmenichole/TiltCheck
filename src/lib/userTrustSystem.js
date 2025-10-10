/**
 * NFT Contract-Based User Trust System
 * Trust scores begin when NFT contract is signed and grow through verified actions
 * Users can report verified scam events to affect sus scores
 * Built for degens by degens who learned the hard way
 */

const fs = require('fs');
const path = require('path');

// Beta testing approved user IDs
const BETA_APPROVED_USERS = [
    '528700741779718144',
    '109492431082266624', 
    '1148139976278691860',
    '1062363876903100447',
    '1179959306733506630',
    '888170729999319070',
    '425057711898624000',
    '1246977794844659795',
    '634450042626768897',
    '741731523958407211',
    '975734136104964106',
    '554845002002595881',
    '356617927803404299'
];

class UserTrustSystem {
    constructor() {
        this.userTrustDataPath = './data/user_trust_scores.json';
        this.behaviorHistoryPath = './data/user_behavior_history.json';
        this.interventionLogPath = './data/intervention_log.json';
        this.verifiedLinksPath = './data/verified_links.json';
        this.degenProofActionsPath = './data/degen_proof_actions.json';
        this.scamReportsPath = './data/scam_reports.json';
        
        // Initialize NFT contract system
        this.betaContract = new BetaVerificationContract();
        
        // Trust scoring starts when NFT contract is signed
        this.NFT_CONTRACT_BASE_SCORE = 100; // Starting trust score for signed NFT contract
        
        // Score weights for verified actions
        this.TRUST_MULTIPLIERS = {
            nft_contract_signed: 100,          // Base trust score activation
            verified_wallet_link: 50,          // Wallet verification
            casino_account_verified: 75,       // Casino account connections
            successful_loan_repayment: 100,    // Payment history
            tiltcheck_session_completed: 25,   // Gambling discipline
            accountability_buddy_active: 40,   // Community engagement
            beta_feedback_submitted: 30,       // Beta testing participation
            community_help_provided: 35,       // Helping others
            scam_report_verified: 60,          // Verified scam reporting
            degen_proof_milestone: 45          // Degen proof achievements
        };
        
        // Sus score penalties for reported activities
        this.SUS_PENALTIES = {
            scam_report_against: 200,          // Being reported for scamming
            verified_scam_activity: 500,       // Confirmed scamming
            multi_account_abuse: 150,          // Multiple accounts
            fake_verification_attempt: 100,    // Fake proof attempts
            harassment_reported: 75,           // Community harassment
            suspicious_link_sharing: 50        // Sharing suspicious links
        };
        
        this.DEGEN_PROOF_TYPES = {
            loss_transparency: { points: 30, description: 'Transparent loss reporting' },
            tilt_recovery: { points: 50, description: 'Documented tilt recovery' },
            limit_adherence: { points: 40, description: 'Sticking to set limits' },
            profit_withdrawal: { points: 35, description: 'Taking profit at goals' },
            accountability_milestone: { points: 60, description: 'Accountability milestones' },
            community_mentoring: { points: 70, description: 'Mentoring other users' },
            long_term_discipline: { points: 80, description: 'Long-term discipline' },
            crisis_intervention: { points: 90, description: 'Helping in crisis situations' }
        };
        
        this.ensureDataDirectories();
    }

    ensureDataDirectories() {
        const dataDir = './data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Initialize data files if they don't exist
        [
            this.userTrustDataPath, 
            this.behaviorHistoryPath, 
            this.interventionLogPath,
            this.verifiedLinksPath,
            this.degenProofActionsPath,
            this.scamReportsPath
        ].forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
            }
        });
    }

    // ===== NFT CONTRACT-BASED TRUST INITIALIZATION =====
    
    /**
     * Initialize user trust score when NFT contract is signed
     * This is the entry point for all trust scoring
     */
    async initializeTrustWithNFTContract(userId) {
        try {
            // Check if user has valid NFT contract
            const hasValidContract = await this.betaContract.hasValidContract(userId);
            
            if (!hasValidContract) {
                return {
                    success: false,
                    message: 'No valid NFT contract found. Trust scoring requires signed NFT contract.',
                    trustScore: 0
                };
            }
            
            // Get NFT ownership details
            const nftInfo = await this.betaContract.verifyNFTOwnership(userId);
            
            if (!nftInfo.hasValidNFT) {
                return {
                    success: false,
                    message: 'NFT verification failed. Cannot initialize trust score.',
                    trustScore: 0
                };
            }
            
            // Initialize base trust score
            const initialTrustScore = {
                userId,
                baseScore: this.NFT_CONTRACT_BASE_SCORE,
                nftContractVerified: true,
                nftTokenIds: nftInfo.nfts.map(nft => nft.tokenId),
                contractSignedAt: nftInfo.nfts[0]?.mintedAt || Date.now(),
                verifiedLinks: [],
                degenProofActions: [],
                scamReports: { made: [], received: [] },
                totalTrustScore: this.NFT_CONTRACT_BASE_SCORE,
                lastUpdated: new Date().toISOString(),
                status: 'active'
            };
            
            // Save initial trust score
            this.saveUserTrustScore(userId, initialTrustScore);
            
            return {
                success: true,
                message: 'Trust scoring initialized with NFT contract verification',
                trustScore: initialTrustScore
            };
            
        } catch (error) {
            console.error('Trust initialization error:', error);
            return {
                success: false,
                message: 'Failed to initialize trust score',
                error: error.message,
                trustScore: 0
            };
        }
    }

    // ===== VERIFIED LINK SYSTEM =====
    
    /**
     * Add verified link to increase trust score
     * Links include: wallets, casino accounts, social media, etc.
     */
    async addVerifiedLink(userId, linkType, linkData, verificationProof) {
        try {
            const userTrust = this.loadUserTrustScore(userId);
            
            if (!userTrust || !userTrust.nftContractVerified) {
                return {
                    success: false,
                    message: 'NFT contract must be signed before adding verified links'
                };
            }
            
            // Verify the link based on type
            const verification = await this.verifyLinkAuthenticity(linkType, linkData, verificationProof);
            
            if (!verification.isValid) {
                return {
                    success: false,
                    message: `Link verification failed: ${verification.reason}`
                };
            }
            
            // Create verified link record
            const verifiedLink = {
                linkId: this.generateLinkId(),
                type: linkType,
                data: linkData,
                verificationProof,
                verifiedAt: new Date().toISOString(),
                trustPointsAwarded: this.TRUST_MULTIPLIERS[`${linkType}_verified`] || 25,
                status: 'active'
            };
            
            // Add to user's verified links
            userTrust.verifiedLinks.push(verifiedLink);
            userTrust.totalTrustScore += verifiedLink.trustPointsAwarded;
            userTrust.lastUpdated = new Date().toISOString();
            
            // Save updated trust score
            this.saveUserTrustScore(userId, userTrust);
            
            // Log the verification
            this.logVerifiedAction(userId, 'verified_link_added', verifiedLink);
            
            return {
                success: true,
                message: `Verified link added successfully`,
                trustPointsAwarded: verifiedLink.trustPointsAwarded,
                newTotalScore: userTrust.totalTrustScore
            };
            
        } catch (error) {
            console.error('Add verified link error:', error);
            return {
                success: false,
                message: 'Failed to add verified link',
                error: error.message
            };
        }
    }

    // ===== DEGEN PROOF ACTIONS =====
    
    /**
     * Record degen proof action to increase trust score
     * Proof actions include: loss transparency, tilt recovery, discipline milestones
     */
    async recordDegenProofAction(userId, proofType, proofData, evidenceLinks = []) {
        try {
            const userTrust = this.loadUserTrustScore(userId);
            
            if (!userTrust || !userTrust.nftContractVerified) {
                return {
                    success: false,
                    message: 'NFT contract must be signed before recording degen proof actions'
                };
            }
            
            // Validate proof type
            const proofConfig = this.DEGEN_PROOF_TYPES[proofType];
            if (!proofConfig) {
                return {
                    success: false,
                    message: `Invalid proof type: ${proofType}`
                };
            }
            
            // Verify proof evidence
            const verification = await this.verifyDegenProofEvidence(proofType, proofData, evidenceLinks);
            
            if (!verification.isValid) {
                return {
                    success: false,
                    message: `Proof verification failed: ${verification.reason}`
                };
            }
            
            // Create degen proof record
            const degenProof = {
                proofId: this.generateProofId(),
                type: proofType,
                description: proofConfig.description,
                data: proofData,
                evidenceLinks,
                trustPointsAwarded: proofConfig.points,
                verifiedAt: new Date().toISOString(),
                verificationHash: this.generateVerificationHash(userId, proofType, proofData),
                status: 'verified'
            };
            
            // Add to user's degen proof actions
            userTrust.degenProofActions.push(degenProof);
            userTrust.totalTrustScore += degenProof.trustPointsAwarded;
            userTrust.lastUpdated = new Date().toISOString();
            
            // Apply bonus for consistency
            const consistencyBonus = this.calculateConsistencyBonus(userTrust.degenProofActions, proofType);
            if (consistencyBonus > 0) {
                userTrust.totalTrustScore += consistencyBonus;
                degenProof.consistencyBonus = consistencyBonus;
            }
            
            // Save updated trust score
            this.saveUserTrustScore(userId, userTrust);
            
            // Log the action
            this.logVerifiedAction(userId, 'degen_proof_recorded', degenProof);
            
            return {
                success: true,
                message: `Degen proof action recorded: ${proofConfig.description}`,
                trustPointsAwarded: degenProof.trustPointsAwarded,
                consistencyBonus,
                newTotalScore: userTrust.totalTrustScore
            };
            
        } catch (error) {
            console.error('Record degen proof error:', error);
            return {
                success: false,
                message: 'Failed to record degen proof action',
                error: error.message
            };
        }
    }

    // ===== SCAM REPORTING SYSTEM =====
    
    /**
     * Report verified scam event to affect user sus scores
     */
    async reportScamEvent(reporterId, targetUserId, scamType, evidence, description) {
        try {
            const reporterTrust = this.loadUserTrustScore(reporterId);
            
            if (!reporterTrust || !reporterTrust.nftContractVerified) {
                return {
                    success: false,
                    message: 'NFT contract required to submit scam reports'
                };
            }
            
            // Minimum trust score required to report scams
            if (reporterTrust.totalTrustScore < 200) {
                return {
                    success: false,
                    message: 'Minimum trust score of 200 required to report scams'
                };
            }
            
            // Verify evidence
            const evidenceVerification = await this.verifyScamEvidence(scamType, evidence);
            
            if (!evidenceVerification.isValid) {
                return {
                    success: false,
                    message: `Evidence verification failed: ${evidenceVerification.reason}`
                };
            }
            
            // Create scam report
            const scamReport = {
                reportId: this.generateReportId(),
                reporterId,
                targetUserId,
                scamType,
                description,
                evidence,
                reportedAt: new Date().toISOString(),
                status: 'under_review',
                verificationLevel: evidenceVerification.level,
                trustImpact: this.calculateScamTrustImpact(scamType, evidenceVerification.level)
            };
            
            // Add to reporter's reports
            reporterTrust.scamReports.made.push(scamReport.reportId);
            
            // If target user exists, add to their received reports
            const targetTrust = this.loadUserTrustScore(targetUserId);
            if (targetTrust) {
                targetTrust.scamReports.received.push(scamReport.reportId);
                
                // Apply sus score penalty if evidence is strong
                if (evidenceVerification.level >= 3) {
                    const susScore = await this.calculateSusScore(targetUserId);
                    const penalty = this.SUS_PENALTIES.scam_report_against;
                    
                    // Log sus score increase
                    this.logSuspiciousActivity(targetUserId, susScore + penalty, {
                        reason: 'scam_report_received',
                        reportId: scamReport.reportId,
                        penalty
                    });
                }
                
                this.saveUserTrustScore(targetUserId, targetTrust);
            }
            
            // Award trust points to reporter for verified report
            if (evidenceVerification.level >= 2) {
                reporterTrust.totalTrustScore += this.TRUST_MULTIPLIERS.scam_report_verified;
            }
            
            // Save all updates
            this.saveUserTrustScore(reporterId, reporterTrust);
            this.saveScamReport(scamReport);
            
            return {
                success: true,
                message: 'Scam report submitted successfully',
                reportId: scamReport.reportId,
                trustPointsAwarded: evidenceVerification.level >= 2 ? this.TRUST_MULTIPLIERS.scam_report_verified : 0,
                verificationLevel: evidenceVerification.level
            };
            
        } catch (error) {
            console.error('Report scam error:', error);
            return {
                success: false,
                message: 'Failed to submit scam report',
                error: error.message
            };
        }
    }

    // ===== TRUST SCORE CALCULATION =====
    
    /**
     * Calculate comprehensive user trust score
     * Builds upon NFT contract base score with verified actions
     */
    async calculateUserTrustScore(userId) {
        try {
            const userTrust = this.loadUserTrustScore(userId);
            
            if (!userTrust) {
                return {
                    totalScore: 0,
                    status: 'no_nft_contract',
                    message: 'Sign NFT contract to begin trust scoring',
                    breakdown: {
                        nftContract: 0,
                        verifiedLinks: 0,
                        degenProofActions: 0,
                        scamReporting: 0,
                        consistencyBonus: 0
                    }
                };
            }
            
            // Calculate component scores
            const nftContractScore = userTrust.nftContractVerified ? this.NFT_CONTRACT_BASE_SCORE : 0;
            
            const verifiedLinksScore = userTrust.verifiedLinks.reduce((total, link) => {
                return total + (link.status === 'active' ? this.getLinkTrustValue(link) : 0);
            }, 0);
            
            const degenProofScore = userTrust.degenProofActions.reduce((total, proof) => {
                return total + (proof.status === 'verified' ? proof.trustPointsAwarded : 0);
            }, 0);
            
            const scamReportingScore = this.calculateScamReportingScore(userTrust.scamReports);
            
            const consistencyBonus = this.calculateOverallConsistencyBonus(userTrust);
            
            // Calculate final score
            const totalScore = nftContractScore + verifiedLinksScore + degenProofScore + 
                             scamReportingScore + consistencyBonus;
            
            // Update and save score
            userTrust.totalTrustScore = totalScore;
            userTrust.lastUpdated = new Date().toISOString();
            this.saveUserTrustScore(userId, userTrust);
            
            return {
                totalScore,
                status: this.getTrustScoreStatus(totalScore),
                breakdown: {
                    nftContract: nftContractScore,
                    verifiedLinks: verifiedLinksScore,
                    degenProofActions: degenProofScore,
                    scamReporting: scamReportingScore,
                    consistencyBonus
                },
                trustTier: this.classifyUserTrust(totalScore),
                calculatedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Trust score calculation error:', error);
            return {
                totalScore: 0,
                status: 'error',
                message: 'Failed to calculate trust score',
                error: error.message
            };
        }
    }

    // ===== HELPER METHODS =====
    
    generateLinkId() {
        return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateProofId() {
        return `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateVerificationHash(userId, type, data) {
        return require('crypto')
            .createHash('sha256')
            .update(`${userId}:${type}:${JSON.stringify(data)}:${Date.now()}`)
            .digest('hex');
    }

    // ===== DATA PERSISTENCE =====
    
    loadUserTrustScore(userId) {
        try {
            const data = JSON.parse(fs.readFileSync(this.userTrustDataPath, 'utf8'));
            return data[userId] || null;
        } catch (error) {
            return null;
        }
    }
    
    saveUserTrustScore(userId, trustScore) {
        try {
            const data = JSON.parse(fs.readFileSync(this.userTrustDataPath, 'utf8'));
            data[userId] = trustScore;
            fs.writeFileSync(this.userTrustDataPath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Save trust score error:', error);
            return false;
        }
    }
    
    saveScamReport(report) {
        try {
            const reports = JSON.parse(fs.readFileSync(this.scamReportsPath, 'utf8'));
            reports[report.reportId] = report;
            fs.writeFileSync(this.scamReportsPath, JSON.stringify(reports, null, 2));
            return true;
        } catch (error) {
            console.error('Save scam report error:', error);
            return false;
        }
    }

    logVerifiedAction(userId, actionType, actionData) {
        try {
            const log = {
                userId,
                actionType,
                actionData,
                timestamp: new Date().toISOString()
            };
            
            // Append to verification log
            const logPath = './data/verification_actions.json';
            let logs = [];
            
            try {
                logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            } catch (error) {
                // File doesn't exist, start with empty array
            }
            
            logs.push(log);
            
            // Keep last 1000 entries
            if (logs.length > 1000) {
                logs = logs.slice(-1000);
            }
            
            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Log verified action error:', error);
        }
    }

    // ===== PLACEHOLDER METHODS FOR FUTURE IMPLEMENTATION =====
    
    async verifyLinkAuthenticity(linkType, linkData, verificationProof) {
        // Implement specific verification logic for different link types
        // For now, return basic validation
        return {
            isValid: true,
            level: 3,
            reason: 'Verification successful'
        };
    }
    
    async verifyDegenProofEvidence(proofType, proofData, evidenceLinks) {
        // Implement proof verification logic
        return {
            isValid: true,
            level: 3,
            reason: 'Evidence verified'
        };
    }
    
    async verifyScamEvidence(scamType, evidence) {
        // Implement evidence verification
        return {
            isValid: true,
            level: 3,
            reason: 'Evidence verified'
        };
    }
    
    calculateConsistencyBonus(actions, type) {
        // Calculate bonus for consistent actions of same type
        const sameTypeActions = actions.filter(action => action.type === type);
        return sameTypeActions.length >= 3 ? 10 : 0;
    }
    
    calculateOverallConsistencyBonus(userTrust) {
        // Calculate overall consistency bonus
        const totalActions = userTrust.verifiedLinks.length + userTrust.degenProofActions.length;
        if (totalActions >= 10) return 50;
        if (totalActions >= 5) return 25;
        return 0;
    }
    
    getLinkTrustValue(link) {
        // Return trust value based on link type and verification level
        return this.TRUST_MULTIPLIERS[`${link.type}_verified`] || 25;
    }
    
    calculateScamReportingScore(scamReports) {
        // Calculate score based on scam reporting activity
        const madeReports = scamReports.made.length;
        const receivedReports = scamReports.received.length;
        
        // Positive points for making verified reports, negative for receiving them
        return (madeReports * 20) - (receivedReports * 50);
    }
    
    calculateScamTrustImpact(scamType, evidenceLevel) {
        // Calculate trust impact based on scam type and evidence quality
        const baseImpact = this.SUS_PENALTIES.scam_report_against;
        const multiplier = evidenceLevel / 3; // Scale by evidence quality
        return Math.round(baseImpact * multiplier);
    }
    
    getTrustScoreStatus(score) {
        if (score >= 1000) return 'elite';
        if (score >= 750) return 'highly_trusted';
        if (score >= 500) return 'trusted';
        if (score >= 250) return 'developing';
        if (score >= 100) return 'new_user';
        return 'unverified';
    }
    
    classifyUserTrust(score) {
        if (score >= 1000) return 'ELITE';
        if (score >= 750) return 'HIGHLY_TRUSTED';
        if (score >= 500) return 'TRUSTED';
        if (score >= 250) return 'DEVELOPING';
        if (score >= 100) return 'NEW_USER';
        return 'UNVERIFIED';
    }

    // ===== EXISTING METHODS (PRESERVED) =====
    
    async calculateSusScore(userId) {
        try {
            const userTrust = this.loadUserTrustScore(userId);
            if (!userTrust) return 0;
            
            let susScore = 0;
            
            // Add penalties from scam reports received
            const reportsReceived = userTrust.scamReports?.received || [];
            susScore += reportsReceived.length * this.SUS_PENALTIES.scam_report_against;
            
            // Add other suspicious activity penalties
            // TODO: Integrate with existing suspicious activity tracking
            
            return Math.min(susScore, 1000); // Cap at 1000
        } catch (error) {
            console.error('Sus score calculation error:', error);
            return 0;
        }
    }
    
    async calculateCasinoTrustScore(userId) {
        try {
            // Existing casino trust score calculation
            const userTrust = this.loadUserTrustScore(userId);
            if (!userTrust || !userTrust.nftContractVerified) {
                return this.getDefaultCasinoTrustScore();
            }
            
            // Calculate casino-specific trust components
            const paymentHistory = this.calculatePaymentHistory(userId);
            const casinoConnections = this.calculateCasinoConnections(userId);
            const complianceBonus = userTrust.totalTrustScore > 500 ? 20 : 0;
            const diversityBonus = userTrust.verifiedLinks.length >= 3 ? 15 : 0;
            const respectScore = Math.min(userTrust.totalTrustScore / 10, 50);
            
            const totalScore = paymentHistory + casinoConnections + complianceBonus + 
                             diversityBonus + respectScore;
            
            return {
                totalScore: Math.min(totalScore, 100),
                breakdown: {
                    paymentHistory,
                    casinoConnections,
                    complianceBonus,
                    diversityBonus,
                    respectScore
                },
                riskLevel: this.classifyRiskLevel(totalScore),
                calculatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Casino trust score calculation error:', error);
            return this.getDefaultCasinoTrustScore();
        }
    }
    
    getDefaultCasinoTrustScore() {
        return {
            totalScore: 0,
            breakdown: {
                paymentHistory: 0,
                casinoConnections: 0,
                complianceBonus: 0,
                diversityBonus: 0,
                respectScore: 0
            },
            riskLevel: 'very_high',
            calculatedAt: new Date().toISOString()
        };
    }
    
    calculatePaymentHistory(userId) {
        // Calculate payment history score (0-30 points)
        // TODO: Integrate with existing payment tracking
        return 0;
    }
    
    calculateCasinoConnections(userId) {
        // Calculate casino connections score (0-25 points)
        const userTrust = this.loadUserTrustScore(userId);
        if (!userTrust) return 0;
        
        const casinoLinks = userTrust.verifiedLinks.filter(link => 
            link.type === 'casino_account' && link.status === 'active'
        );
        
        return Math.min(casinoLinks.length * 8, 25);
    }
    
    classifyRiskLevel(score) {
        if (score >= 80) return 'very_low';
        if (score >= 60) return 'low';
        if (score >= 40) return 'moderate';
        if (score >= 20) return 'high';
        return 'very_high';
    }
    
    logSuspiciousActivity(userId, susScore, activityData) {
        try {
            const log = {
                userId,
                susScore,
                activityData,
                timestamp: new Date().toISOString()
            };
            
            // Log suspicious activity
            const logPath = './data/suspicious_activity_log.json';
            let logs = [];
            
            try {
                logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            } catch (error) {
                // File doesn't exist, start with empty array
            }
            
            logs.push(log);
            
            // Keep last 500 entries
            if (logs.length > 500) {
                logs = logs.slice(-500);
            }
            
            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Log suspicious activity error:', error);
        }
    }
    
    // ===== UTILITY METHODS =====
    
    classifyUserRisk(userTrustScore, susScore) {
        if (susScore >= 80) return 'CRITICAL';
        if (susScore >= 60) return 'HIGH_RISK';
        if (userTrustScore < 200 && susScore >= 40) return 'MODERATE_HIGH';
        if (susScore >= 40) return 'MODERATE_RISK';
        if (susScore >= 20) return 'LOW_RISK';
        return 'MINIMAL_RISK';
    }
    
    getInterventionLevel(userTrustScore, susScore) {
        const riskLevel = this.classifyUserRisk(userTrustScore, susScore);
        
        switch (riskLevel) {
            case 'CRITICAL':
                return 'immediate_intervention';
            case 'HIGH_RISK':
                return 'urgent_support';
            case 'MODERATE_HIGH':
            case 'MODERATE_RISK':
                return 'proactive_outreach';
            case 'LOW_RISK':
                return 'gentle_guidance';
            default:
                return 'none';
        }
    }
    
    async getUserTrustSummary(userId) {
        try {
            const userTrust = await this.calculateUserTrustScore(userId);
            const casinoTrust = await this.calculateCasinoTrustScore(userId);
            const susScore = await this.calculateSusScore(userId);
            const riskLevel = this.classifyUserRisk(userTrust.totalScore, susScore);
            const interventionLevel = this.getInterventionLevel(userTrust.totalScore, susScore);
            
            return {
                userId,
                userTrust,
                casinoTrust,
                susScore,
                riskLevel,
                interventionLevel,
                nftContractRequired: !userTrust || userTrust.totalScore === 0,
                calculatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Get user trust summary error:', error);
            return {
                userId,
                error: error.message,
                nftContractRequired: true
            };
        }
    }
}

module.exports = UserTrustSystem;

    ensureDataDirectories() {
        const dataDir = './data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Initialize data files if they don't exist
        [this.userTrustDataPath, this.behaviorHistoryPath, this.interventionLogPath].forEach(filePath => {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
            }
        });
    }

    // ===== CASINO TRUST SCORE (External Verification) =====
    
    /**
     * Calculate casino trust score for loan eligibility
     * Range: 0-100 points
     */
    async calculateCasinoTrustScore(userId) {
        try {
            const paymentHistory = this.calculatePaymentHistory(userId);
            const casinoConnections = this.calculateCasinoConnections(userId);
            const complianceBonus = this.calculateComplianceBonus(userId);
            const diversityBonus = this.calculateDiversityBonus(userId);
            const respectScore = this.calculateRespectScore(userId);
            
            const totalScore = paymentHistory + casinoConnections + complianceBonus + diversityBonus + respectScore;
            
            const riskLevel = this.classifyCasinoRisk(totalScore);
            
            return {
                totalScore: Math.round(totalScore),
                breakdown: {
                    paymentHistory: Math.round(paymentHistory),
                    casinoConnections: Math.round(casinoConnections),
                    complianceBonus: Math.round(complianceBonus),
                    diversityBonus: Math.round(diversityBonus),
                    respectScore: Math.round(respectScore)
                },
                riskLevel,
                calculatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Casino trust score calculation error:', error);
            return this.getDefaultCasinoTrustScore();
        }
    }

    calculatePaymentHistory(userId) {
        // Load from existing user trust system
        const userTrust = this.loadUserTrust()[userId] || { successfulPayments: 0, defaulted: 0 };
        const baseScore = Math.min(userTrust.successfulPayments * 8, 40);
        const penalty = userTrust.defaulted * 10;
        return Math.max(0, baseScore - penalty);
    }

    calculateCasinoConnections(userId) {
        // Integrate with existing casino verification system
        const connections = this.loadCasinoConnections()[userId] || {};
        let totalScore = 0;
        let totalWeight = 0;
        
        // This would integrate with existing DEGEN_APPROVED_CASINOS
        const verifiedCasinos = Object.keys(connections).filter(casino => connections[casino]?.verified);
        
        verifiedCasinos.forEach(casino => {
            const connection = connections[casino];
            const quality = this.calculateConnectionQuality(connection);
            totalScore += quality;
            totalWeight += 1;
        });
        
        return totalWeight > 0 ? Math.min((totalScore / totalWeight) * 35, 35) : 0;
    }

    // ===== USER TRUST SCORE (Behavioral Analysis) =====
    
    /**
     * Calculate comprehensive user trust score
     * Range: 0-1000 points
     */
    async calculateUserTrustScore(userId) {
        try {
            const gamblingDiscipline = await this.calculateGamblingDiscipline(userId);
            const communityBehavior = await this.calculateCommunityBehavior(userId);
            const accountabilityEngagement = await this.calculateAccountabilityEngagement(userId);
            const consistencyPatterns = await this.calculateConsistencyPatterns(userId);
            const supportNetworkActivity = await this.calculateSupportNetworkActivity(userId);
            
            const totalScore = gamblingDiscipline + communityBehavior + accountabilityEngagement + 
                             consistencyPatterns + supportNetworkActivity;
            
            const trustTier = this.classifyUserTrust(totalScore);
            
            const userTrustScore = {
                totalScore: Math.round(totalScore),
                breakdown: {
                    gamblingDiscipline: Math.round(gamblingDiscipline),
                    communityBehavior: Math.round(communityBehavior),
                    accountabilityEngagement: Math.round(accountabilityEngagement),
                    consistencyPatterns: Math.round(consistencyPatterns),
                    supportNetworkActivity: Math.round(supportNetworkActivity)
                },
                trustTier,
                calculatedAt: new Date().toISOString()
            };
            
            // Store the score
            this.saveUserTrustScore(userId, userTrustScore);
            
            return userTrustScore;
        } catch (error) {
            console.error('User trust score calculation error:', error);
            return this.getDefaultUserTrustScore();
        }
    }

    async calculateGamblingDiscipline(userId) {
        const sessions = await this.getUserGamblingSessions(userId);
        const tiltHistory = await this.getUserTiltHistory(userId);
        
        let disciplineScore = 200; // Base score
        
        // Session quality analysis
        sessions.forEach(session => {
            const grade = this.calculateSessionGrade(session);
            switch(grade.letter) {
                case 'A+': disciplineScore += 15; break;
                case 'A':  disciplineScore += 10; break;
                case 'B+': disciplineScore += 5; break;
                case 'C':  disciplineScore -= 5; break;
                case 'D':  disciplineScore -= 10; break;
                case 'F':  disciplineScore -= 20; break;
            }
        });
        
        // Tilt management
        const tiltEvents = tiltHistory.filter(event => event.type === 'tilt_detected');
        const tiltRecovery = tiltHistory.filter(event => event.type === 'tilt_recovered');
        disciplineScore -= tiltEvents.length * 5;
        disciplineScore += tiltRecovery.length * 10;
        
        // Consistency bonuses
        const avgSessionLength = this.calculateAvgSessionLength(sessions);
        if (avgSessionLength < 120) disciplineScore += 20; // Under 2 hours
        
        const stakeConsistency = this.calculateStakeConsistency(sessions);
        if (stakeConsistency > 0.8) disciplineScore += 15; // Consistent stake sizing
        
        return Math.max(0, Math.min(300, disciplineScore));
    }

    async calculateCommunityBehavior(userId) {
        const respectPoints = await this.getUserRespectPoints(userId);
        const helpingActions = await this.getUserHelpingActions(userId);
        const reportedIncidents = await this.getUserReportedIncidents(userId);
        
        let behaviorScore = 125; // Base score
        
        // Respect points conversion
        behaviorScore += Math.min(respectPoints / 10, 50); // Max 50 from respect
        
        // Helping other users
        behaviorScore += (helpingActions.accountability_buddy || 0) * 15;
        behaviorScore += (helpingActions.intervention_assists || 0) * 10;
        behaviorScore += (helpingActions.support_provided || 0) * 5;
        
        // Negative behaviors
        behaviorScore -= (reportedIncidents.spam || 0) * 20;
        behaviorScore -= (reportedIncidents.harassment || 0) * 30;
        behaviorScore -= (reportedIncidents.misinformation || 0) * 15;
        
        // Community engagement bonuses
        const discordActivity = await this.getUserDiscordActivity(userId);
        if (discordActivity.helpful_messages > 50) behaviorScore += 25;
        if (discordActivity.constructive_feedback > 10) behaviorScore += 15;
        
        return Math.max(0, Math.min(250, behaviorScore));
    }

    async calculateAccountabilityEngagement(userId) {
        const tiltCheckUsage = await this.getUserTiltCheckUsage(userId);
        const buddySystem = await this.getUserBuddySystemActivity(userId);
        const selfReporting = await this.getUserSelfReporting(userId);
        
        let engagementScore = 100; // Base score
        
        // TiltCheck system usage
        engagementScore += Math.min(tiltCheckUsage.sessions_logged || 0, 50);
        engagementScore += (tiltCheckUsage.breaks_taken || 0) * 5;
        engagementScore += (tiltCheckUsage.limits_set || 0) * 10;
        
        // Buddy system participation
        engagementScore += (buddySystem.buddy_connections || 0) * 15;
        engagementScore += (buddySystem.interventions_received || 0) * 8;
        engagementScore += (buddySystem.check_ins_completed || 0) * 3;
        
        // Self-reporting and transparency
        engagementScore += (selfReporting.honest_loss_reports || 0) * 5;
        engagementScore += (selfReporting.tilt_admissions || 0) * 10;
        engagementScore += (selfReporting.goal_setting || 0) * 8;
        
        return Math.max(0, Math.min(200, engagementScore));
    }

    async calculateConsistencyPatterns(userId) {
        const behaviorHistory = await this.getUserBehaviorHistory(userId, 90); // 90 days
        
        let consistencyScore = 75; // Base score
        
        // Time pattern analysis
        const timeConsistency = this.analyzeBettingTimePatterns(behaviorHistory);
        if (timeConsistency.variance < 0.3) consistencyScore += 25; // Consistent timing
        
        // Stake sizing consistency
        const stakeVariance = this.calculateStakeVariance(behaviorHistory);
        if (stakeVariance < 0.5) consistencyScore += 20; // Consistent stakes
        
        // Platform loyalty (not jumping between casinos during tilt)
        const platformSwitching = this.analyzePlatformSwitching(behaviorHistory);
        if (platformSwitching.tilt_switching < 3) consistencyScore += 15;
        
        // Goal adherence
        const goalAdherence = this.calculateGoalAdherence(behaviorHistory);
        consistencyScore += goalAdherence * 15; // 0-1 multiplier
        
        return Math.max(0, Math.min(150, consistencyScore));
    }

    async calculateSupportNetworkActivity(userId) {
        const networkEngagement = await this.getUserNetworkEngagement(userId);
        
        let networkScore = 50; // Base score
        
        // Active accountability partnerships
        networkScore += (networkEngagement.active_buddies || 0) * 15;
        
        // Group participation
        networkScore += (networkEngagement.group_sessions_attended || 0) * 3;
        networkScore += (networkEngagement.community_challenges_joined || 0) * 5;
        
        // Mentorship (giving and receiving)
        networkScore += (networkEngagement.mentoring_others || 0) * 10;
        networkScore += (networkEngagement.being_mentored || 0) * 5;
        
        return Math.max(0, Math.min(100, networkScore));
    }

    // ===== SUSPICIOUS ACTIVITY DETECTION =====
    
    /**
     * Calculate suspicious activity score
     * Range: 0-100 (higher = more suspicious)
     */
    async calculateSusScore(userId) {
        try {
            let susScore = 0;
            
            // Rapid betting patterns
            const rapidBetting = await this.detectRapidBetting(userId);
            susScore += rapidBetting.intensity * 20;
            
            // Loss chasing indicators
            const lossChasing = await this.detectLossChasing(userId);
            susScore += lossChasing.severity * 25;
            
            // Multi-platform velocity
            const multiPlatform = await this.detectMultiPlatformActivity(userId);
            susScore += multiPlatform.simultaneous_sessions * 15;
            
            // Stake escalation patterns
            const stakeEscalation = await this.detectStakeEscalation(userId);
            susScore += stakeEscalation.aggression_level * 20;
            
            // Time-based red flags
            const timeRedFlags = await this.detectTimeBasedRedFlags(userId);
            susScore += timeRedFlags.late_night_binges * 10;
            susScore += timeRedFlags.extended_sessions * 15;
            
            const finalSusScore = Math.min(100, susScore);
            
            // Log high sus scores
            if (finalSusScore >= this.SUS_THRESHOLDS.HIGH_RISK) {
                this.logSuspiciousActivity(userId, finalSusScore, {
                    rapidBetting, lossChasing, multiPlatform, stakeEscalation, timeRedFlags
                });
            }
            
            return finalSusScore;
        } catch (error) {
            console.error('Sus score calculation error:', error);
            return 0;
        }
    }

    // ===== RISK CLASSIFICATION =====
    
    classifyUserRisk(userTrustScore, susScore) {
        if (susScore >= this.SUS_THRESHOLDS.CRITICAL) return 'CRITICAL_INTERVENTION';
        if (susScore >= this.SUS_THRESHOLDS.HIGH_RISK) return 'HIGH_RISK';
        if (susScore >= this.SUS_THRESHOLDS.MODERATE_RISK) return 'MODERATE_RISK';
        if (userTrustScore >= this.TRUST_TIERS.ELITE) return 'HIGHLY_TRUSTED';
        if (userTrustScore >= this.TRUST_TIERS.TRUSTED) return 'TRUSTED';
        if (userTrustScore >= this.TRUST_TIERS.AVERAGE) return 'AVERAGE';
        if (userTrustScore >= this.TRUST_TIERS.DEVELOPING) return 'DEVELOPING';
        return 'NEW_USER';
    }

    classifyCasinoRisk(casinoScore) {
        if (casinoScore >= 85) return 'very_low';
        if (casinoScore >= 70) return 'low';
        if (casinoScore >= 50) return 'medium';
        if (casinoScore >= 30) return 'high';
        return 'very_high';
    }

    classifyUserTrust(userScore) {
        if (userScore >= this.TRUST_TIERS.ELITE) return 'ELITE';
        if (userScore >= this.TRUST_TIERS.TRUSTED) return 'TRUSTED';
        if (userScore >= this.TRUST_TIERS.AVERAGE) return 'AVERAGE';
        if (userScore >= this.TRUST_TIERS.DEVELOPING) return 'DEVELOPING';
        return 'NEW_USER';
    }

    // ===== INTERVENTION SYSTEM =====
    
    async triggerIntervention(userId, riskLevel, susScore, userTrustScore) {
        const intervention = {
            userId,
            riskLevel,
            susScore,
            userTrustScore,
            timestamp: new Date().toISOString(),
            actions: []
        };

        switch (riskLevel) {
            case 'CRITICAL_INTERVENTION':
                intervention.actions = [
                    'disable_betting_commands',
                    'alert_accountability_buddies',
                    'trigger_cooling_off_period',
                    'admin_notification',
                    'crisis_support_contact'
                ];
                break;
                
            case 'HIGH_RISK':
                intervention.actions = [
                    'tiltcheck_reminders',
                    'buddy_system_activation',
                    'limit_suggestions',
                    'progress_check_ins',
                    'enhanced_monitoring'
                ];
                break;
                
            case 'MODERATE_RISK':
                intervention.actions = [
                    'gentle_reminders',
                    'resource_sharing',
                    'goal_review_prompts',
                    'community_engagement_encouragement'
                ];
                break;
        }

        this.logIntervention(intervention);
        return intervention;
    }

    // ===== DATA PERSISTENCE =====
    
    saveUserTrustScore(userId, score) {
        const data = this.loadUserTrustData();
        data[userId] = score;
        fs.writeFileSync(this.userTrustDataPath, JSON.stringify(data, null, 2));
    }

    loadUserTrustData() {
        try {
            return JSON.parse(fs.readFileSync(this.userTrustDataPath, 'utf8'));
        } catch (error) {
            return {};
        }
    }

    logSuspiciousActivity(userId, susScore, details) {
        const log = {
            userId,
            susScore,
            details,
            timestamp: new Date().toISOString()
        };
        
        // Append to log file
        const logs = this.loadSuspiciousActivityLogs();
        logs.push(log);
        
        // Keep last 1000 entries
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        fs.writeFileSync('./data/suspicious_activity_log.json', JSON.stringify(logs, null, 2));
    }

    logIntervention(intervention) {
        const interventions = this.loadInterventionLogs();
        interventions.push(intervention);
        
        // Keep last 500 interventions
        if (interventions.length > 500) {
            interventions.splice(0, interventions.length - 500);
        }
        
        fs.writeFileSync(this.interventionLogPath, JSON.stringify(interventions, null, 2));
    }

    // ===== HELPER METHODS (to be implemented with actual data sources) =====
    
    async getUserGamblingSessions(userId) {
        // Integrate with existing TiltCheck system
        return [];
    }

    async getUserTiltHistory(userId) {
        // Integrate with existing tilt detection
        return [];
    }

    async getUserRespectPoints(userId) {
        // Integrate with existing respect system
        return 0;
    }

    // ... Additional helper methods would integrate with existing systems

    // ===== DEFAULT SCORES =====
    
    getDefaultCasinoTrustScore() {
        return {
            totalScore: 0,
            breakdown: {
                paymentHistory: 0,
                casinoConnections: 0,
                complianceBonus: 0,
                diversityBonus: 0,
                respectScore: 0
            },
            riskLevel: 'very_high',
            calculatedAt: new Date().toISOString()
        };
    }

    getDefaultUserTrustScore() {
        return {
            totalScore: 100,
            breakdown: {
                gamblingDiscipline: 50,
                communityBehavior: 25,
                accountabilityEngagement: 15,
                consistencyPatterns: 10,
                supportNetworkActivity: 0
            },
            trustTier: 'NEW_USER',
            calculatedAt: new Date().toISOString()
        };
    }

    // ===== INTEGRATION METHODS =====
    
    loadUserTrust() {
        try {
            return JSON.parse(fs.readFileSync('./user_trust.json', 'utf8'));
        } catch (error) {
            return {};
        }
    }

    loadCasinoConnections() {
        try {
            return JSON.parse(fs.readFileSync('./casino_connections.json', 'utf8'));
        } catch (error) {
            return {};
        }
    }

    loadSuspiciousActivityLogs() {
        try {
            return JSON.parse(fs.readFileSync('./data/suspicious_activity_log.json', 'utf8'));
        } catch (error) {
            return [];
        }
    }

    loadInterventionLogs() {
        try {
            return JSON.parse(fs.readFileSync(this.interventionLogPath, 'utf8'));
        } catch (error) {
            return [];
        }
    }
}

module.exports = UserTrustSystem;
