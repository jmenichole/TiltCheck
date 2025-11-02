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
 * 👤 Profile Management API
 * 
 * Handles user profile operations:
 * - Profile creation and updates
 * - Permission management
 * - Connected accounts (Discord, Wallet)
 * - Profile completeness tracking
 * - NFT verification status
 */

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { requireAuth } = require('./auth');

const router = express.Router();

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Helper: Load users
 */
function loadUsers() {
    try {
        const data = fs.readJSONSync(USERS_FILE);
        return data.users || [];
    } catch (error) {
        return [];
    }
}

/**
 * Helper: Save users
 */
function saveUsers(users) {
    try {
        fs.writeJSONSync(USERS_FILE, { users }, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

/**
 * Helper: Calculate profile completeness
 */
function calculateProfileCompleteness(user) {
    const checks = {
        basicInfo: !!(user.displayName && user.email && user.username),
        avatar: !!user.avatar,
        bio: !!(user.bio && user.bio.length > 0),
        interests: !!(user.interests && user.interests.length > 0),
        experienceLevel: !!user.experienceLevel,
        discordLinked: !!(user.connectedAccounts && user.connectedAccounts.discord),
        walletLinked: !!(user.connectedAccounts && user.connectedAccounts.wallet),
        nftMinted: !!user.nftMinted,
        emailVerified: !!user.emailVerified,
        permissions: !!(user.permissions && Object.values(user.permissions).some(v => v))
    };
    
    const completed = Object.values(checks).filter(v => v).length;
    const total = Object.keys(checks).length;
    const percentage = Math.round((completed / total) * 100);
    
    return {
        percentage,
        completed,
        total,
        checks
    };
}

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        const completeness = calculateProfileCompleteness(user);
        
        res.json({
            success: true,
            data: {
                profile: userResponse,
                completeness
            }
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

/**
 * PUT /api/profile
 * Update user profile
 */
router.put('/', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = users[userIndex];
        const updates = req.body;
        
        // Allowed fields for update
        const allowedFields = [
            'displayName', 'bio', 'avatar', 'interests', 'experienceLevel',
            'profilePublic', 'emailNotifications', 'betaUpdates'
        ];
        
        // Apply updates
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                user[field] = updates[field];
            }
        });
        
        user.updatedAt = new Date().toISOString();
        
        // Recalculate profile completeness
        const completeness = calculateProfileCompleteness(user);
        user.profileComplete = completeness.percentage >= 70;
        
        users[userIndex] = user;
        saveUsers(users);
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                profile: userResponse,
                completeness
            }
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

/**
 * POST /api/profile/permissions
 * Update user permissions
 */
router.post('/permissions', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = users[userIndex];
        const { permissions } = req.body;
        
        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid permissions data'
            });
        }
        
        // Update permissions
        user.permissions = {
            ...user.permissions,
            ...permissions
        };
        
        user.updatedAt = new Date().toISOString();
        users[userIndex] = user;
        saveUsers(users);
        
        res.json({
            success: true,
            message: 'Permissions updated successfully',
            data: {
                permissions: user.permissions
            }
        });
        
    } catch (error) {
        console.error('Update permissions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update permissions'
        });
    }
});

/**
 * POST /api/profile/connect/discord
 * Connect Discord account
 */
router.post('/connect/discord', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = users[userIndex];
        const { discordId, discordUsername, discordAvatar, accessToken } = req.body;
        
        if (!discordId || !discordUsername) {
            return res.status(400).json({
                success: false,
                error: 'Discord ID and username are required'
            });
        }
        
        // Update Discord connection
        user.connectedAccounts = user.connectedAccounts || {};
        user.connectedAccounts.discord = {
            id: discordId,
            username: discordUsername,
            avatar: discordAvatar,
            connectedAt: new Date().toISOString()
        };
        
        // Store access token securely (in production, encrypt this)
        if (accessToken) {
            user.connectedAccounts.discord.accessToken = accessToken;
        }
        
        user.updatedAt = new Date().toISOString();
        users[userIndex] = user;
        saveUsers(users);
        
        res.json({
            success: true,
            message: 'Discord account connected successfully',
            data: {
                discord: {
                    id: discordId,
                    username: discordUsername,
                    avatar: discordAvatar
                }
            }
        });
        
    } catch (error) {
        console.error('Connect Discord error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to connect Discord account'
        });
    }
});

/**
 * POST /api/profile/connect/wallet
 * Connect Solana wallet
 */
router.post('/connect/wallet', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = users[userIndex];
        const { walletAddress, walletType, signature } = req.body;
        
        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }
        
        // Basic validation for Solana address (32-44 chars)
        if (walletAddress.length < 32 || walletAddress.length > 44) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Solana wallet address'
            });
        }
        
        // Update wallet connection
        user.connectedAccounts = user.connectedAccounts || {};
        user.connectedAccounts.wallet = {
            address: walletAddress,
            type: walletType || 'phantom',
            verified: !!signature,
            connectedAt: new Date().toISOString()
        };
        
        if (signature) {
            user.connectedAccounts.wallet.signature = signature;
        }
        
        user.updatedAt = new Date().toISOString();
        users[userIndex] = user;
        saveUsers(users);
        
        res.json({
            success: true,
            message: 'Wallet connected successfully',
            data: {
                wallet: {
                    address: walletAddress,
                    type: walletType,
                    verified: !!signature
                }
            }
        });
        
    } catch (error) {
        console.error('Connect wallet error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to connect wallet'
        });
    }
});

/**
 * POST /api/profile/onboarding/complete
 * Mark onboarding as complete
 */
router.post('/onboarding/complete', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = users[userIndex];
        user.onboardingComplete = true;
        user.onboardingCompletedAt = new Date().toISOString();
        user.updatedAt = new Date().toISOString();
        
        users[userIndex] = user;
        saveUsers(users);
        
        res.json({
            success: true,
            message: 'Onboarding completed successfully',
            data: {
                onboardingComplete: true
            }
        });
        
    } catch (error) {
        console.error('Complete onboarding error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete onboarding'
        });
    }
});

/**
 * POST /api/profile/nft/mint
 * Record NFT minting for user
 */
router.post('/nft/mint', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = users[userIndex];
        const { nftAddress, transactionHash, metadata } = req.body;
        
        if (!nftAddress) {
            return res.status(400).json({
                success: false,
                error: 'NFT address is required'
            });
        }
        
        user.nftMinted = true;
        user.nftData = {
            address: nftAddress,
            transactionHash,
            metadata,
            mintedAt: new Date().toISOString()
        };
        
        user.updatedAt = new Date().toISOString();
        users[userIndex] = user;
        saveUsers(users);
        
        res.json({
            success: true,
            message: 'NFT minting recorded successfully',
            data: {
                nftMinted: true,
                nftAddress
            }
        });
        
    } catch (error) {
        console.error('Record NFT minting error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record NFT minting'
        });
    }
});

module.exports = router;
