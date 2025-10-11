const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with proper database in production)
let trustDatabase = {
    users: new Map(),
    verifications: new Map(),
    nfts: new Map(),
    votes: new Map()
};

// Trust Score Configuration
const TRUST_CONFIG = {
    BASE_SCORE: 50,
    DISCORD_BONUS: 25,
    PLATFORM_BONUS: 20,
    NFT_BONUS: 35,
    COMMUNITY_VOTE_RANGE: [-10, 10],
    TRANSPARENCY_BONUS: 15,
    AGE_BONUS_MONTHLY: 1,
    VIOLATION_PENALTY: -25,
    MAX_SCORE: 1000,
    MIN_SCORE: 0
};

// Supported Gaming Platforms
const GAMING_PLATFORMS = {
    'stake': {
        name: 'Stake.com',
        verification: 'api',
        bonus: 25,
        requirements: ['api_key', 'user_id']
    },
    'rollbit': {
        name: 'Rollbit',
        verification: 'manual',
        bonus: 20,
        requirements: ['screenshots', 'username']
    },
    'roobet': {
        name: 'Roobet',
        verification: 'screenshot',
        bonus: 20,
        requirements: ['screenshots', 'profile_url']
    },
    'bcgame': {
        name: 'BC.Game',
        verification: 'coming_soon',
        bonus: 25,
        requirements: []
    }
};

// Utility Functions
function generateUserId() {
    return crypto.randomBytes(16).toString('hex');
}

function generateNFTId() {
    return Math.floor(Math.random() * 1000000);
}

function calculateTrustScore(userProfile) {
    let score = TRUST_CONFIG.BASE_SCORE;
    
    // Discord verification bonus
    if (userProfile.discord_verified) {
        score += TRUST_CONFIG.DISCORD_BONUS;
    }
    
    // Platform verification bonuses
    if (userProfile.verified_platforms) {
        userProfile.verified_platforms.forEach(platform => {
            if (GAMING_PLATFORMS[platform]) {
                score += GAMING_PLATFORMS[platform].bonus;
            }
        });
    }
    
    // NFT holding bonus
    if (userProfile.nft_id) {
        score += TRUST_CONFIG.NFT_BONUS;
    }
    
    // Community votes
    if (userProfile.community_votes) {
        score += userProfile.community_votes;
    }
    
    // Account age bonus (months)
    if (userProfile.account_age_months) {
        score += userProfile.account_age_months * TRUST_CONFIG.AGE_BONUS_MONTHLY;
    }
    
    // Violations penalty
    if (userProfile.violations) {
        score += userProfile.violations * TRUST_CONFIG.VIOLATION_PENALTY;
    }
    
    // Clamp score to valid range
    return Math.max(TRUST_CONFIG.MIN_SCORE, Math.min(TRUST_CONFIG.MAX_SCORE, score));
}

// API Routes

// 1. Wallet Connection & User Registration
app.post('/api/connect-wallet', async (req, res) => {
    try {
        const { wallet_address, signature } = req.body;
        
        if (!wallet_address || !signature) {
            return res.status(400).json({ error: 'Wallet address and signature required' });
        }
        
        // Verify wallet signature (simplified for demo)
        const isValidSignature = signature.length > 100; // Basic validation
        
        if (!isValidSignature) {
            return res.status(400).json({ error: 'Invalid wallet signature' });
        }
        
        // Create or update user profile
        let userId = generateUserId();
        let existingUser = null;
        
        // Check if wallet already registered
        for (let [id, user] of trustDatabase.users) {
            if (user.wallet_address === wallet_address) {
                existingUser = user;
                userId = id;
                break;
            }
        }
        
        const userProfile = existingUser || {
            wallet_address,
            created_at: new Date().toISOString(),
            wallet_verified: true,
            discord_verified: false,
            verified_platforms: [],
            community_votes: 0,
            violations: 0,
            account_age_months: 0,
            nft_id: null
        };
        
        userProfile.trust_score = calculateTrustScore(userProfile);
        trustDatabase.users.set(userId, userProfile);
        
        res.json({
            success: true,
            user_id: userId,
            trust_score: userProfile.trust_score,
            profile: userProfile
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Wallet connection failed' });
    }
});

// 2. Discord Integration
app.post('/api/connect-discord', async (req, res) => {
    try {
        const { user_id, discord_id, discord_username, oauth_code } = req.body;
        
        if (!user_id || !discord_id) {
            return res.status(400).json({ error: 'User ID and Discord ID required' });
        }
        
        const user = trustDatabase.users.get(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Simulate Discord OAuth verification
        const isValidDiscord = oauth_code && oauth_code.length > 20;
        
        if (isValidDiscord) {
            user.discord_verified = true;
            user.discord_id = discord_id;
            user.discord_username = discord_username;
            user.trust_score = calculateTrustScore(user);
            
            trustDatabase.users.set(user_id, user);
            
            res.json({
                success: true,
                trust_score: user.trust_score,
                discord_verified: true
            });
        } else {
            res.status(400).json({ error: 'Invalid Discord verification' });
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Discord connection failed' });
    }
});

// 3. Platform Verification
app.post('/api/verify-platform', async (req, res) => {
    try {
        const { user_id, platform, verification_data } = req.body;
        
        if (!user_id || !platform) {
            return res.status(400).json({ error: 'User ID and platform required' });
        }
        
        const user = trustDatabase.users.get(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const platformConfig = GAMING_PLATFORMS[platform];
        if (!platformConfig) {
            return res.status(400).json({ error: 'Unsupported platform' });
        }
        
        // Simulate platform verification based on type
        let verificationSuccess = false;
        
        switch (platformConfig.verification) {
            case 'api':
                verificationSuccess = verification_data.api_key && verification_data.user_id;
                break;
            case 'manual':
            case 'screenshot':
                verificationSuccess = verification_data.screenshots && verification_data.screenshots.length > 0;
                break;
            default:
                verificationSuccess = false;
        }
        
        if (verificationSuccess) {
            if (!user.verified_platforms.includes(platform)) {
                user.verified_platforms.push(platform);
            }
            
            // Store verification data
            const verificationId = generateUserId();
            trustDatabase.verifications.set(verificationId, {
                user_id,
                platform,
                verification_data,
                verified_at: new Date().toISOString(),
                status: 'verified'
            });
            
            user.trust_score = calculateTrustScore(user);
            trustDatabase.users.set(user_id, user);
            
            res.json({
                success: true,
                trust_score: user.trust_score,
                verified_platforms: user.verified_platforms,
                verification_id: verificationId
            });
        } else {
            res.status(400).json({ error: 'Platform verification failed' });
        }
        
    } catch (error) {
        res.status(500).json({ error: 'Platform verification failed' });
    }
});

// 4. NFT Minting
app.post('/api/mint-nft', async (req, res) => {
    try {
        const { user_id } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ error: 'User ID required' });
        }
        
        const user = trustDatabase.users.get(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check minimum requirements for NFT minting
        if (!user.wallet_verified || !user.discord_verified || user.verified_platforms.length === 0) {
            return res.status(400).json({ 
                error: 'Insufficient verification. Need wallet, Discord, and at least one platform.' 
            });
        }
        
        // Generate NFT
        const nftId = generateNFTId();
        const nftData = {
            id: nftId,
            user_id,
            wallet_address: user.wallet_address,
            discord_id: user.discord_id,
            trust_score: user.trust_score,
            verified_platforms: user.verified_platforms,
            minted_at: new Date().toISOString(),
            metadata: {
                name: `DegenTrust #${nftId}`,
                description: `Verified gaming community member with trust score ${user.trust_score}`,
                image: `https://api.tiltcheck.it.com/nft-image/${nftId}`,
                attributes: [
                    { trait_type: "Trust Score", value: user.trust_score },
                    { trait_type: "Platforms", value: user.verified_platforms.length },
                    { trait_type: "Discord Verified", value: user.discord_verified ? "Yes" : "No" },
                    { trait_type: "Wallet Verified", value: "Yes" }
                ]
            }
        };
        
        user.nft_id = nftId;
        user.trust_score = calculateTrustScore(user);
        
        trustDatabase.users.set(user_id, user);
        trustDatabase.nfts.set(nftId, nftData);
        
        res.json({
            success: true,
            nft_id: nftId,
            trust_score: user.trust_score,
            nft_data: nftData
        });
        
    } catch (error) {
        res.status(500).json({ error: 'NFT minting failed' });
    }
});

// 5. Community Voting
app.post('/api/community-vote', async (req, res) => {
    try {
        const { voter_id, target_user_id, vote_value, reason } = req.body;
        
        if (!voter_id || !target_user_id || vote_value === undefined) {
            return res.status(400).json({ error: 'Voter ID, target user ID, and vote value required' });
        }
        
        const voter = trustDatabase.users.get(voter_id);
        const targetUser = trustDatabase.users.get(target_user_id);
        
        if (!voter || !targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Validate voting eligibility
        if (!voter.nft_id) {
            return res.status(400).json({ error: 'NFT required for community voting' });
        }
        
        if (voter.trust_score < 100) {
            return res.status(400).json({ error: 'Minimum trust score of 100 required for voting' });
        }
        
        // Validate vote value
        const clampedVote = Math.max(
            TRUST_CONFIG.COMMUNITY_VOTE_RANGE[0],
            Math.min(TRUST_CONFIG.COMMUNITY_VOTE_RANGE[1], vote_value)
        );
        
        // Check for existing vote
        const voteKey = `${voter_id}-${target_user_id}`;
        const existingVote = trustDatabase.votes.get(voteKey);
        
        if (existingVote) {
            return res.status(400).json({ error: 'Already voted for this user' });
        }
        
        // Record vote
        trustDatabase.votes.set(voteKey, {
            voter_id,
            target_user_id,
            vote_value: clampedVote,
            reason,
            voted_at: new Date().toISOString()
        });
        
        // Update target user's community votes
        targetUser.community_votes = (targetUser.community_votes || 0) + clampedVote;
        targetUser.trust_score = calculateTrustScore(targetUser);
        
        trustDatabase.users.set(target_user_id, targetUser);
        
        res.json({
            success: true,
            target_trust_score: targetUser.trust_score,
            vote_applied: clampedVote
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Community voting failed' });
    }
});

// 6. Get User Profile
app.get('/api/user/:user_id', (req, res) => {
    try {
        const { user_id } = req.params;
        const user = trustDatabase.users.get(user_id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return public profile (hide sensitive data)
        const publicProfile = {
            trust_score: user.trust_score,
            wallet_verified: user.wallet_verified,
            discord_verified: user.discord_verified,
            verified_platforms: user.verified_platforms,
            nft_id: user.nft_id,
            created_at: user.created_at,
            community_votes: user.community_votes || 0
        };
        
        res.json({ success: true, profile: publicProfile });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// 7. Get NFT Metadata
app.get('/api/nft/:nft_id', (req, res) => {
    try {
        const { nft_id } = req.params;
        const nft = trustDatabase.nfts.get(parseInt(nft_id));
        
        if (!nft) {
            return res.status(404).json({ error: 'NFT not found' });
        }
        
        res.json(nft.metadata);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch NFT metadata' });
    }
});

// 8. Get Platform Statistics
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            total_users: trustDatabase.users.size,
            total_nfts: trustDatabase.nfts.size,
            total_verifications: trustDatabase.verifications.size,
            total_votes: trustDatabase.votes.size,
            platform_breakdown: {},
            average_trust_score: 0
        };
        
        let totalScore = 0;
        
        // Calculate platform breakdown and average score
        for (let [userId, user] of trustDatabase.users) {
            totalScore += user.trust_score;
            
            user.verified_platforms.forEach(platform => {
                stats.platform_breakdown[platform] = (stats.platform_breakdown[platform] || 0) + 1;
            });
        }
        
        if (stats.total_users > 0) {
            stats.average_trust_score = Math.round(totalScore / stats.total_users);
        }
        
        res.json({ success: true, stats });
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🛡️ DegenTrust API server running on port ${PORT}`);
    console.log(`📊 Stats available at: http://localhost:${PORT}/api/stats`);
    console.log(`💚 Health check at: http://localhost:${PORT}/health`);
});

module.exports = app;