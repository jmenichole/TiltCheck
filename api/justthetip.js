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
 * 💸 JustTheTip Integration API
 * 
 * Smart crypto tipping + accountability + vault system integrated with TiltCheck:
 * - Behavioral analysis for responsible tipping
 * - Vault recommendations based on degen metrics
 * - Accountability buddy pairing
 * - Tilt detection integration
 * - Tip history and analytics
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { requireAuth } = require('./auth');

const router = express.Router();

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const TIPS_FILE = path.join(DATA_DIR, 'tips.json');
const VAULTS_FILE = path.join(DATA_DIR, 'vaults.json');
const BUDDIES_FILE = path.join(DATA_DIR, 'accountability_buddies.json');
const DEGEN_METRICS_FILE = path.join(DATA_DIR, 'degen_metrics.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data files exist
fs.ensureDirSync(DATA_DIR);
[TIPS_FILE, VAULTS_FILE, BUDDIES_FILE, DEGEN_METRICS_FILE].forEach(file => {
    if (!fs.existsSync(file)) {
        const key = path.basename(file, '.json');
        fs.writeJSONSync(file, { [key]: [] }, { spaces: 2 });
    }
});

/**
 * Vault Types Configuration
 */
const VAULT_TYPES = {
    'hodl-vault': {
        name: 'HODL Vault',
        risk: 'low',
        emoji: '🏦',
        humor: 'For when you need to touch grass instead of charts',
        minAmount: 10,
        lockPeriod: '7 days',
        benefits: ['Peace of mind', 'No rugpull anxiety', 'Actual financial stability']
    },
    'yolo-vault': {
        name: 'YOLO Vault',
        risk: 'high',
        emoji: '🚀',
        humor: 'Maximum degen energy contained safely',
        minAmount: 50,
        lockPeriod: '3 days',
        benefits: ['High risk tolerance', 'Moon mission ready', 'Regulated chaos']
    },
    'regret-vault': {
        name: 'Regret Vault',
        risk: 'medium',
        emoji: '😬',
        humor: 'Lock it up before you buy another dog coin',
        minAmount: 25,
        lockPeriod: '5 days',
        benefits: ['Prevents impulse buys', 'Future you says thanks', 'Wisdom storage']
    },
    'grass-touching-vault': {
        name: 'Grass Touching Vault',
        risk: 'ultra-low',
        emoji: '🌱',
        humor: 'Mandatory outdoor time funding',
        minAmount: 5,
        lockPeriod: '1 day',
        benefits: ['Touch grass daily', 'Vitamin D funding', 'Reality connection']
    },
    'therapy-vault': {
        name: 'Therapy Vault',
        risk: 'emotional',
        emoji: '🧠',
        humor: 'Self-care is the ultimate alpha move',
        minAmount: 20,
        lockPeriod: '14 days',
        benefits: ['Mental health first', 'Emotional stability', 'True alpha energy']
    }
};

/**
 * Helper: Load data from file
 */
function loadData(file) {
    try {
        const data = fs.readJSONSync(file);
        const key = Object.keys(data)[0];
        return data[key] || [];
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
        return [];
    }
}

/**
 * Helper: Save data to file
 */
function saveData(file, data) {
    try {
        const key = path.basename(file, '.json');
        fs.writeJSONSync(file, { [key]: data }, { spaces: 2 });
        return true;
    } catch (error) {
        console.error(`Error saving ${file}:`, error);
        return false;
    }
}

/**
 * Helper: Calculate degen level (0-100)
 */
function calculateDegenLevel(metrics) {
    let degenLevel = 0;
    degenLevel += Math.min((metrics.impulseTransactions || 0) * 5, 30);
    degenLevel += Math.min((metrics.lateNightActivity || 0) * 3, 25);
    degenLevel += Math.min((metrics.rugPullCount || 0) * 10, 25);
    degenLevel += Math.max(0, 20 - (metrics.grassTouchingScore || 100));
    
    return Math.min(100, degenLevel);
}

/**
 * Helper: Get vault suggestion based on degen level
 */
function suggestVault(degenLevel, amount) {
    if (degenLevel >= 80) return VAULT_TYPES['therapy-vault'];
    if (degenLevel >= 60) return VAULT_TYPES['regret-vault'];
    if (degenLevel >= 40) return VAULT_TYPES['yolo-vault'];
    if (degenLevel <= 20) return VAULT_TYPES['grass-touching-vault'];
    return VAULT_TYPES['hodl-vault'];
}

/**
 * Helper: Get degen personality
 */
function getDegenPersonality(degenLevel) {
    if (degenLevel >= 90) return { type: 'Maximum Overdegen', emoji: '🔥💀', advice: 'Therapy vault NOW' };
    if (degenLevel >= 70) return { type: 'High Energy Degen', emoji: '🚀😤', advice: 'Consider touching grass' };
    if (degenLevel >= 50) return { type: 'Moderate Degen', emoji: '🎲😎', advice: 'Balance your chaos' };
    if (degenLevel >= 30) return { type: 'Casual Degen', emoji: '🎮😌', advice: 'You\'re doing okay' };
    return { type: 'Zen Degen', emoji: '🧘‍♂️✨', advice: 'Living the dream' };
}

/**
 * GET /api/justthetip/metrics
 * Get user's degen metrics and personality
 */
router.get('/metrics', requireAuth, (req, res) => {
    try {
        const allMetrics = loadData(DEGEN_METRICS_FILE);
        let userMetrics = allMetrics.find(m => m.userId === req.user.id);
        
        if (!userMetrics) {
            userMetrics = {
                userId: req.user.id,
                impulseTransactions: 0,
                lateNightActivity: 0,
                chartScreenTime: 0,
                rugPullCount: 0,
                grassTouchingScore: 100,
                totalTips: 0,
                totalVaulted: 0,
                lastActivity: new Date().toISOString()
            };
        }
        
        const degenLevel = calculateDegenLevel(userMetrics);
        const personality = getDegenPersonality(degenLevel);
        const suggestedVault = suggestVault(degenLevel, 0);
        
        res.json({
            success: true,
            data: {
                metrics: {
                    degenLevel,
                    personality,
                    impulseTransactions: userMetrics.impulseTransactions,
                    lateNightActivity: userMetrics.lateNightActivity,
                    grassTouchingScore: userMetrics.grassTouchingScore,
                    totalTips: userMetrics.totalTips,
                    totalVaulted: userMetrics.totalVaulted,
                    rugPullCount: userMetrics.rugPullCount
                },
                suggestions: {
                    vault: suggestedVault,
                    advice: personality.advice
                }
            }
        });
        
    } catch (error) {
        console.error('Get metrics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get metrics'
        });
    }
});

/**
 * POST /api/justthetip/tip
 * Create a tip with behavioral analysis
 */
router.post('/tip', requireAuth, async (req, res) => {
    try {
        const { recipientId, amount, currency, message, walletAddress } = req.body;
        
        if (!recipientId || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Recipient and amount are required'
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be greater than 0'
            });
        }
        
        // Track degen behavior
        const allMetrics = loadData(DEGEN_METRICS_FILE);
        let userMetrics = allMetrics.find(m => m.userId === req.user.id);
        
        if (!userMetrics) {
            userMetrics = {
                userId: req.user.id,
                impulseTransactions: 0,
                lateNightActivity: 0,
                grassTouchingScore: 100,
                totalTips: 0,
                totalVaulted: 0
            };
            allMetrics.push(userMetrics);
        }
        
        // Update metrics
        userMetrics.impulseTransactions++;
        userMetrics.totalTips++;
        
        const hour = new Date().getHours();
        if (hour >= 23 || hour <= 5) {
            userMetrics.lateNightActivity++;
        }
        
        userMetrics.lastActivity = new Date().toISOString();
        saveData(DEGEN_METRICS_FILE, allMetrics);
        
        // Calculate degen level
        const degenLevel = calculateDegenLevel(userMetrics);
        
        // Create tip record
        const tip = {
            id: crypto.randomBytes(16).toString('hex'),
            senderId: req.user.id,
            senderEmail: req.user.email,
            recipientId,
            amount,
            currency: currency || 'SOL',
            message,
            walletAddress,
            degenLevelAtTime: degenLevel,
            timestamp: new Date().toISOString(),
            status: 'pending',
            tiltDetected: degenLevel > 70
        };
        
        const allTips = loadData(TIPS_FILE);
        allTips.push(tip);
        saveData(TIPS_FILE, allTips);
        
        // Generate vault suggestion if high degen level
        let vaultSuggestion = null;
        if (degenLevel > 50) {
            const suggestedVault = suggestVault(degenLevel, amount * 2);
            vaultSuggestion = {
                type: suggestedVault,
                recommendedAmount: amount * 2,
                reason: `Your degen level is ${degenLevel}. Consider locking 2x this amount to balance your chaos.`
            };
        }
        
        res.json({
            success: true,
            message: 'Tip created successfully',
            data: {
                tip: {
                    id: tip.id,
                    amount: tip.amount,
                    currency: tip.currency,
                    recipientId: tip.recipientId,
                    timestamp: tip.timestamp
                },
                behavioralAnalysis: {
                    degenLevel,
                    tiltDetected: tip.tiltDetected,
                    vaultSuggestion
                }
            }
        });
        
    } catch (error) {
        console.error('Create tip error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create tip'
        });
    }
});

/**
 * GET /api/justthetip/tips
 * Get user's tip history
 */
router.get('/tips', requireAuth, (req, res) => {
    try {
        const allTips = loadData(TIPS_FILE);
        const userTips = allTips
            .filter(t => t.senderId === req.user.id || t.recipientId === req.user.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        const sent = userTips.filter(t => t.senderId === req.user.id);
        const received = userTips.filter(t => t.recipientId === req.user.id);
        
        res.json({
            success: true,
            data: {
                tips: userTips,
                summary: {
                    totalSent: sent.length,
                    totalReceived: received.length,
                    totalAmountSent: sent.reduce((sum, t) => sum + t.amount, 0),
                    totalAmountReceived: received.reduce((sum, t) => sum + t.amount, 0)
                }
            }
        });
        
    } catch (error) {
        console.error('Get tips error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get tips'
        });
    }
});

/**
 * POST /api/justthetip/vault
 * Create a vault with smart suggestions
 */
router.post('/vault', requireAuth, (req, res) => {
    try {
        const { amount, vaultType, lockPeriod } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid amount is required'
            });
        }
        
        // Get user metrics
        const allMetrics = loadData(DEGEN_METRICS_FILE);
        let userMetrics = allMetrics.find(m => m.userId === req.user.id);
        
        if (!userMetrics) {
            userMetrics = {
                userId: req.user.id,
                impulseTransactions: 0,
                lateNightActivity: 0,
                grassTouchingScore: 100,
                totalVaulted: 0
            };
            allMetrics.push(userMetrics);
        }
        
        // Update metrics
        userMetrics.totalVaulted += amount;
        userMetrics.grassTouchingScore = Math.min(100, userMetrics.grassTouchingScore + 5);
        saveData(DEGEN_METRICS_FILE, allMetrics);
        
        // Determine vault type
        const degenLevel = calculateDegenLevel(userMetrics);
        const selectedVault = vaultType ? VAULT_TYPES[vaultType] : suggestVault(degenLevel, amount);
        
        if (!selectedVault) {
            return res.status(400).json({
                success: false,
                error: 'Invalid vault type'
            });
        }
        
        // Create vault
        const vault = {
            id: crypto.randomBytes(16).toString('hex'),
            userId: req.user.id,
            type: vaultType || Object.keys(VAULT_TYPES).find(k => VAULT_TYPES[k] === selectedVault),
            amount,
            lockPeriod: lockPeriod || selectedVault.lockPeriod,
            createdAt: new Date().toISOString(),
            unlocksAt: new Date(Date.now() + parseLockPeriod(lockPeriod || selectedVault.lockPeriod)).toISOString(),
            status: 'locked'
        };
        
        const allVaults = loadData(VAULTS_FILE);
        allVaults.push(vault);
        saveData(VAULTS_FILE, allVaults);
        
        res.json({
            success: true,
            message: `${selectedVault.emoji} Vault created! ${selectedVault.humor}`,
            data: {
                vault: {
                    id: vault.id,
                    type: selectedVault.name,
                    emoji: selectedVault.emoji,
                    amount: vault.amount,
                    lockPeriod: vault.lockPeriod,
                    unlocksAt: vault.unlocksAt,
                    benefits: selectedVault.benefits
                },
                degenLevel
            }
        });
        
    } catch (error) {
        console.error('Create vault error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create vault'
        });
    }
});

/**
 * Helper: Parse lock period to milliseconds
 */
function parseLockPeriod(period) {
    const match = period.match(/(\d+)\s*(day|hour|week)/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 'hour': return value * 60 * 60 * 1000;
        case 'day': return value * 24 * 60 * 60 * 1000;
        case 'week': return value * 7 * 24 * 60 * 60 * 1000;
        default: return 7 * 24 * 60 * 60 * 1000;
    }
}

/**
 * GET /api/justthetip/vaults
 * Get user's vaults
 */
router.get('/vaults', requireAuth, (req, res) => {
    try {
        const allVaults = loadData(VAULTS_FILE);
        const userVaults = allVaults
            .filter(v => v.userId === req.user.id)
            .map(v => {
                const vaultType = VAULT_TYPES[v.type] || {};
                const isUnlocked = new Date(v.unlocksAt) <= new Date();
                
                return {
                    id: v.id,
                    type: vaultType.name,
                    emoji: vaultType.emoji,
                    amount: v.amount,
                    status: isUnlocked ? 'unlocked' : 'locked',
                    createdAt: v.createdAt,
                    unlocksAt: v.unlocksAt,
                    benefits: vaultType.benefits
                };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const totalLocked = userVaults
            .filter(v => v.status === 'locked')
            .reduce((sum, v) => sum + v.amount, 0);
        
        res.json({
            success: true,
            data: {
                vaults: userVaults,
                summary: {
                    total: userVaults.length,
                    locked: userVaults.filter(v => v.status === 'locked').length,
                    unlocked: userVaults.filter(v => v.status === 'unlocked').length,
                    totalLocked
                }
            }
        });
        
    } catch (error) {
        console.error('Get vaults error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get vaults'
        });
    }
});

/**
 * POST /api/justthetip/buddy/pair
 * Pair with accountability buddy
 */
router.post('/buddy/pair', requireAuth, async (req, res) => {
    try {
        const { buddyUserId, roastMode } = req.body;
        
        if (!buddyUserId) {
            return res.status(400).json({
                success: false,
                error: 'Buddy user ID is required'
            });
        }
        
        if (buddyUserId === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'You cannot be your own accountability buddy'
            });
        }
        
        // Check if pairing already exists
        const allBuddies = loadData(BUDDIES_FILE);
        const existing = allBuddies.find(
            b => (b.user1Id === req.user.id && b.user2Id === buddyUserId) ||
                 (b.user2Id === req.user.id && b.user1Id === buddyUserId)
        );
        
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Buddy pairing already exists'
            });
        }
        
        // Create buddy pairing
        const pairing = {
            id: crypto.randomBytes(16).toString('hex'),
            user1Id: req.user.id,
            user2Id: buddyUserId,
            roastMode: roastMode || false,
            interventionCount: 0,
            pairingDate: new Date().toISOString(),
            status: 'active'
        };
        
        allBuddies.push(pairing);
        saveData(BUDDIES_FILE, allBuddies);
        
        res.json({
            success: true,
            message: '🤝 Accountability buddy paired!',
            data: {
                pairing: {
                    id: pairing.id,
                    buddyUserId,
                    roastMode: pairing.roastMode,
                    pairingDate: pairing.pairingDate
                }
            }
        });
        
    } catch (error) {
        console.error('Pair buddy error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to pair buddy'
        });
    }
});

/**
 * GET /api/justthetip/buddy
 * Get accountability buddy info
 */
router.get('/buddy', requireAuth, (req, res) => {
    try {
        const allBuddies = loadData(BUDDIES_FILE);
        const buddy = allBuddies.find(
            b => b.user1Id === req.user.id || b.user2Id === req.user.id
        );
        
        if (!buddy) {
            return res.json({
                success: true,
                data: {
                    hasBuddy: false,
                    message: 'No accountability buddy paired yet'
                }
            });
        }
        
        const buddyUserId = buddy.user1Id === req.user.id ? buddy.user2Id : buddy.user1Id;
        
        res.json({
            success: true,
            data: {
                hasBuddy: true,
                buddy: {
                    id: buddy.id,
                    buddyUserId,
                    roastMode: buddy.roastMode,
                    interventionCount: buddy.interventionCount,
                    pairingDate: buddy.pairingDate,
                    status: buddy.status
                }
            }
        });
        
    } catch (error) {
        console.error('Get buddy error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get buddy info'
        });
    }
});

/**
 * GET /api/justthetip/dashboard
 * Get complete JustTheTip dashboard data
 */
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        // Get all user data
        const allMetrics = loadData(DEGEN_METRICS_FILE);
        const allTips = loadData(TIPS_FILE);
        const allVaults = loadData(VAULTS_FILE);
        const allBuddies = loadData(BUDDIES_FILE);
        
        const userMetrics = allMetrics.find(m => m.userId === req.user.id) || {
            impulseTransactions: 0,
            lateNightActivity: 0,
            grassTouchingScore: 100,
            totalTips: 0,
            totalVaulted: 0
        };
        
        const degenLevel = calculateDegenLevel(userMetrics);
        const personality = getDegenPersonality(degenLevel);
        const suggestedVault = suggestVault(degenLevel, 0);
        
        const userTips = allTips.filter(t => t.senderId === req.user.id || t.recipientId === req.user.id);
        const userVaults = allVaults.filter(v => v.userId === req.user.id);
        const userBuddy = allBuddies.find(b => b.user1Id === req.user.id || b.user2Id === req.user.id);
        
        res.json({
            success: true,
            data: {
                metrics: {
                    degenLevel,
                    personality,
                    ...userMetrics
                },
                stats: {
                    totalTips: userTips.length,
                    totalVaults: userVaults.length,
                    totalTipped: userTips.filter(t => t.senderId === req.user.id).reduce((s, t) => s + t.amount, 0),
                    totalVaulted: userVaults.reduce((s, v) => s + v.amount, 0),
                    hasBuddy: !!userBuddy
                },
                suggestions: {
                    vault: suggestedVault,
                    advice: personality.advice
                },
                recentActivity: {
                    tips: userTips.slice(0, 5),
                    vaults: userVaults.slice(0, 5)
                }
            }
        });
        
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard'
        });
    }
});

module.exports = router;
