/**
 * NFT Contract-Based User Trust System
 * Trust scores begin when NFT contract is signed and grow through verified actions
 * Users can report verified scam events to affect sus scores
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

class NFTUserTrustSystem {
    constructor() {
        this.dataPath = './data/nft_user_trust.json';
        this.scamReportsPath = './data/scam_reports.json';
        this.verificationLogsPath = './data/verification_logs.json';
        
        // Trust scoring starts when NFT contract is signed
        this.NFT_BASE_SCORE = 100;
        
        // Trust multipliers for verified actions
        this.TRUST_POINTS = {
            nft_contract_signed: 100,
            verified_wallet: 50,
            casino_verified: 75,
            degen_proof_action: 45,
            scam_report_verified: 60,
            community_help: 35,
            consistency_bonus: 25
        };
        
        // Sus score penalties
        this.SUS_PENALTIES = {
            scam_report_received: 200,
            verified_scam: 500,
            fake_verification: 100,
            harassment: 75
        };
        
        this.ensureDataFiles();
    }

    ensureDataFiles() {
        const dataDir = './data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        [this.dataPath, this.scamReportsPath, this.verificationLogsPath].forEach(file => {
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, JSON.stringify({}, null, 2));
            }
        });
    }

    // Check if user is beta approved
    isBetaApproved(userId) {
        return BETA_APPROVED_USERS.includes(userId);
    }

    // Initialize trust score when NFT contract is signed
    async initializeTrustScore(userId, nftTokenId) {
        try {
            // Check if user is beta approved
            if (!this.isBetaApproved(userId)) {
                return {
                    success: false,
                    message: 'Beta testing access required. Contact admin for approval.',
                    trustScore: 0
                };
            }

            const userData = {
                userId,
                nftTokenId: nftTokenId || `beta_token_${userId}`,
                nftContractSigned: true,
                baseScore: this.NFT_BASE_SCORE,
                verifiedLinks: [],
                degenProofActions: [],
                scamReports: { made: [], received: [] },
                totalTrustScore: this.NFT_BASE_SCORE,
                susScore: 0,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            
            this.saveUserData(userId, userData);
            
            return {
                success: true,
                message: 'Trust score initialized with NFT contract',
                trustScore: this.NFT_BASE_SCORE
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to initialize trust score',
                error: error.message
            };
        }
    }

    // Add verified link to increase trust score
    async addVerifiedLink(userId, linkType, linkData) {
        try {
            const userData = this.loadUserData(userId);
            if (!userData || !userData.nftContractSigned) {
                return {
                    success: false,
                    message: 'NFT contract must be signed first'
                };
            }

            const verifiedLink = {
                id: this.generateId(),
                type: linkType,
                data: linkData,
                verifiedAt: new Date().toISOString(),
                trustPoints: this.TRUST_POINTS.verified_wallet
            };

            userData.verifiedLinks.push(verifiedLink);
            userData.totalTrustScore += verifiedLink.trustPoints;
            userData.lastUpdated = new Date().toISOString();

            this.saveUserData(userId, userData);

            return {
                success: true,
                message: 'Verified link added',
                trustPointsAwarded: verifiedLink.trustPoints,
                newTotalScore: userData.totalTrustScore
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to add verified link',
                error: error.message
            };
        }
    }

    // Record degen proof action
    async recordDegenProofAction(userId, proofType, description, evidence) {
        try {
            const userData = this.loadUserData(userId);
            if (!userData || !userData.nftContractSigned) {
                return {
                    success: false,
                    message: 'NFT contract must be signed first'
                };
            }

            const degenProof = {
                id: this.generateId(),
                type: proofType,
                description,
                evidence,
                trustPoints: this.TRUST_POINTS.degen_proof_action,
                verifiedAt: new Date().toISOString()
            };

            userData.degenProofActions.push(degenProof);
            userData.totalTrustScore += degenProof.trustPoints;
            
            // Add consistency bonus
            if (userData.degenProofActions.length >= 3) {
                userData.totalTrustScore += this.TRUST_POINTS.consistency_bonus;
                degenProof.consistencyBonus = this.TRUST_POINTS.consistency_bonus;
            }

            userData.lastUpdated = new Date().toISOString();
            this.saveUserData(userId, userData);

            return {
                success: true,
                message: 'Degen proof action recorded',
                trustPointsAwarded: degenProof.trustPoints,
                consistencyBonus: degenProof.consistencyBonus || 0,
                newTotalScore: userData.totalTrustScore
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to record degen proof',
                error: error.message
            };
        }
    }

    // Report scam event to affect sus scores
    async reportScamEvent(reporterId, targetUserId, scamType, evidence, description) {
        try {
            const reporterData = this.loadUserData(reporterId);
            if (!reporterData || !reporterData.nftContractSigned) {
                return {
                    success: false,
                    message: 'NFT contract required to report scams'
                };
            }

            if (reporterData.totalTrustScore < 200) {
                return {
                    success: false,
                    message: 'Minimum trust score of 200 required to report scams'
                };
            }

            const scamReport = {
                reportId: this.generateId(),
                reporterId,
                targetUserId,
                scamType,
                description,
                evidence,
                reportedAt: new Date().toISOString(),
                status: 'under_review'
            };

            // Add to reporter's made reports
            reporterData.scamReports.made.push(scamReport.reportId);
            
            // Award trust points to reporter
            reporterData.totalTrustScore += this.TRUST_POINTS.scam_report_verified;
            reporterData.lastUpdated = new Date().toISOString();

            // Add to target's received reports and increase sus score
            const targetData = this.loadUserData(targetUserId);
            if (targetData) {
                targetData.scamReports.received.push(scamReport.reportId);
                targetData.susScore += this.SUS_PENALTIES.scam_report_received;
                targetData.lastUpdated = new Date().toISOString();
                this.saveUserData(targetUserId, targetData);
            }

            this.saveUserData(reporterId, reporterData);
            this.saveScamReport(scamReport);

            return {
                success: true,
                message: 'Scam report submitted',
                reportId: scamReport.reportId,
                trustPointsAwarded: this.TRUST_POINTS.scam_report_verified
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to submit scam report',
                error: error.message
            };
        }
    }

    // Calculate user trust score
    async calculateUserTrustScore(userId) {
        try {
            const userData = this.loadUserData(userId);
            if (!userData) {
                return {
                    totalScore: 0,
                    status: 'no_nft_contract',
                    message: 'Sign NFT contract to begin trust scoring'
                };
            }

            const baseScore = userData.nftContractSigned ? this.NFT_BASE_SCORE : 0;
            const verifiedLinksScore = userData.verifiedLinks.reduce((sum, link) => sum + link.trustPoints, 0);
            const degenProofScore = userData.degenProofActions.reduce((sum, proof) => sum + proof.trustPoints, 0);
            const scamReportingScore = userData.scamReports.made.length * 20 - userData.scamReports.received.length * 50;
            
            const totalScore = baseScore + verifiedLinksScore + degenProofScore + scamReportingScore;

            // Update total score
            userData.totalTrustScore = totalScore;
            userData.lastUpdated = new Date().toISOString();
            this.saveUserData(userId, userData);

            return {
                totalScore,
                status: this.getTrustStatus(totalScore),
                breakdown: {
                    nftContract: baseScore,
                    verifiedLinks: verifiedLinksScore,
                    degenProofActions: degenProofScore,
                    scamReporting: scamReportingScore
                },
                trustTier: this.getTrustTier(totalScore),
                susScore: userData.susScore
            };
        } catch (error) {
            return {
                totalScore: 0,
                status: 'error',
                message: 'Failed to calculate trust score'
            };
        }
    }

    // Get complete user trust summary
    async getUserTrustSummary(userId) {
        try {
            const trustScore = await this.calculateUserTrustScore(userId);
            const userData = this.loadUserData(userId);
            
            return {
                userId,
                userTrust: trustScore,
                susScore: userData?.susScore || 0,
                riskLevel: this.classifyRisk(trustScore.totalScore, userData?.susScore || 0),
                nftContractRequired: !userData || !userData.nftContractSigned,
                calculatedAt: new Date().toISOString()
            };
        } catch (error) {
            return {
                userId,
                error: error.message,
                nftContractRequired: true
            };
        }
    }

    // Utility methods
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getTrustStatus(score) {
        if (score >= 1000) return 'elite';
        if (score >= 750) return 'highly_trusted';
        if (score >= 500) return 'trusted';
        if (score >= 250) return 'developing';
        if (score >= 100) return 'new_user';
        return 'unverified';
    }

    getTrustTier(score) {
        if (score >= 1000) return 'ELITE';
        if (score >= 750) return 'HIGHLY_TRUSTED';
        if (score >= 500) return 'TRUSTED';
        if (score >= 250) return 'DEVELOPING';
        if (score >= 100) return 'NEW_USER';
        return 'UNVERIFIED';
    }

    classifyRisk(trustScore, susScore) {
        if (susScore >= 500) return 'CRITICAL';
        if (susScore >= 300) return 'HIGH_RISK';
        if (trustScore < 200 && susScore >= 100) return 'MODERATE_HIGH';
        if (susScore >= 100) return 'MODERATE_RISK';
        if (susScore >= 50) return 'LOW_RISK';
        return 'MINIMAL_RISK';
    }

    // Data persistence
    loadUserData(userId) {
        try {
            const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            return data[userId] || null;
        } catch (error) {
            return null;
        }
    }

    saveUserData(userId, userData) {
        try {
            const data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
            data[userId] = userData;
            fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Save user data error:', error);
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
}

module.exports = NFTUserTrustSystem;
