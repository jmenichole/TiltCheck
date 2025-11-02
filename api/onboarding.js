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
 * 🤖 AI-Powered Onboarding API
 * 
 * Provides intelligent onboarding guidance:
 * - Personalized recommendations based on user type
 * - Step-by-step guidance
 * - Contextual tips and help
 * - Progress tracking
 * - AI-generated suggestions
 */

const express = require('express');
const { requireAuth } = require('./auth');

const router = express.Router();

/**
 * Onboarding steps configuration
 */
const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to TiltCheck',
        description: 'Let\'s get your profile set up',
        required: true,
        order: 1
    },
    {
        id: 'basic_info',
        title: 'Basic Information',
        description: 'Tell us about yourself',
        required: true,
        order: 2,
        fields: ['displayName', 'email', 'username', 'avatar']
    },
    {
        id: 'interests',
        title: 'Your Interests',
        description: 'Help us personalize your experience',
        required: false,
        order: 3,
        fields: ['interests', 'experienceLevel']
    },
    {
        id: 'permissions',
        title: 'App Permissions',
        description: 'Enable features for the best experience',
        required: false,
        order: 4,
        fields: ['permissions']
    },
    {
        id: 'discord',
        title: 'Connect Discord',
        description: 'Join our community',
        required: false,
        order: 5,
        fields: ['connectedAccounts.discord']
    },
    {
        id: 'wallet',
        title: 'Connect Wallet',
        description: 'Link your Solana wallet for tips and rewards',
        required: false,
        order: 6,
        fields: ['connectedAccounts.wallet']
    },
    {
        id: 'nft',
        title: 'NFT Verification',
        description: 'Get verified with a DegenTrust NFT',
        required: false,
        order: 7,
        fields: ['nftMinted']
    },
    {
        id: 'complete',
        title: 'All Set!',
        description: 'You\'re ready to get started',
        required: true,
        order: 8
    }
];

/**
 * AI Personality templates for different user types
 */
const AI_PERSONALITIES = {
    beginner: {
        tone: 'friendly and educational',
        tips: [
            'Take your time exploring each feature',
            'Don\'t worry about getting everything perfect',
            'Our community is here to help you learn',
            'Start with the basics and build from there'
        ],
        recommendations: [
            'Complete your basic profile first',
            'Join Discord to connect with other beginners',
            'Check out our getting started guide',
            'Skip advanced features for now'
        ]
    },
    casual: {
        tone: 'casual and encouraging',
        tips: [
            'You know the drill - let\'s make this quick',
            'Most features are optional, pick what you like',
            'Discord community is pretty active if you\'re into that',
            'Wallet connection unlocks some cool perks'
        ],
        recommendations: [
            'Fill out what matters to you',
            'Connect Discord for community features',
            'Link wallet if you plan to use tips',
            'NFT verification is totally optional'
        ]
    },
    experienced: {
        tone: 'professional and direct',
        tips: [
            'You\'re familiar with these systems',
            'Wallet and Discord connections unlock advanced features',
            'NFT verification builds trust in the community',
            'Permissions enable real-time monitoring'
        ],
        recommendations: [
            'Complete full profile for maximum features',
            'Connect both Discord and wallet',
            'Consider NFT verification for credibility',
            'Enable all permissions for best experience'
        ]
    },
    professional: {
        tone: 'technical and comprehensive',
        tips: [
            'Full integration provides complete ecosystem access',
            'API access requires verified profile',
            'NFT verification enables enterprise features',
            'All connections can be managed granularly'
        ],
        recommendations: [
            'Complete entire onboarding for full access',
            'Link all accounts for unified dashboard',
            'Mint verification NFT for professional tier',
            'Review all permission settings carefully'
        ]
    }
};

/**
 * GET /api/onboarding/steps
 * Get onboarding steps and progress
 */
router.get('/steps', requireAuth, (req, res) => {
    try {
        // Get user to check progress
        const fs = require('fs-extra');
        const path = require('path');
        const USERS_FILE = path.join(__dirname, '../data/users.json');
        
        const data = fs.readJSONSync(USERS_FILE);
        const user = data.users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Determine completed steps based on user data
        const completedSteps = [];
        
        if (user.displayName && user.email && user.username && user.avatar) {
            completedSteps.push('welcome', 'basic_info');
        }
        
        if (user.interests && user.interests.length > 0 && user.experienceLevel) {
            completedSteps.push('interests');
        }
        
        if (user.permissions && Object.values(user.permissions).some(v => v)) {
            completedSteps.push('permissions');
        }
        
        if (user.connectedAccounts?.discord) {
            completedSteps.push('discord');
        }
        
        if (user.connectedAccounts?.wallet) {
            completedSteps.push('wallet');
        }
        
        if (user.nftMinted) {
            completedSteps.push('nft');
        }
        
        if (user.onboardingComplete) {
            completedSteps.push('complete');
        }
        
        // Calculate progress
        const totalSteps = ONBOARDING_STEPS.length;
        const completed = completedSteps.length;
        const progress = Math.round((completed / totalSteps) * 100);
        
        // Find current step
        const currentStep = ONBOARDING_STEPS.find(
            step => !completedSteps.includes(step.id)
        ) || ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
        
        res.json({
            success: true,
            data: {
                steps: ONBOARDING_STEPS,
                completedSteps,
                currentStep: currentStep.id,
                progress: {
                    percentage: progress,
                    completed,
                    total: totalSteps
                }
            }
        });
        
    } catch (error) {
        console.error('Get onboarding steps error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get onboarding steps'
        });
    }
});

/**
 * GET /api/onboarding/guidance
 * Get AI-powered guidance for current step
 */
router.get('/guidance', requireAuth, (req, res) => {
    try {
        const fs = require('fs-extra');
        const path = require('path');
        const USERS_FILE = path.join(__dirname, '../data/users.json');
        
        const data = fs.readJSONSync(USERS_FILE);
        const user = data.users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Determine user type
        const userType = user.experienceLevel || 'casual';
        const personality = AI_PERSONALITIES[userType] || AI_PERSONALITIES.casual;
        
        // Get current step
        const { step } = req.query;
        const currentStep = ONBOARDING_STEPS.find(s => s.id === step) || ONBOARDING_STEPS[0];
        
        // Generate contextual guidance
        const guidance = {
            step: currentStep.id,
            title: currentStep.title,
            description: currentStep.description,
            tone: personality.tone,
            message: generateStepMessage(currentStep, userType),
            tips: personality.tips.slice(0, 2),
            recommendations: personality.recommendations,
            nextSteps: getNextSteps(currentStep, user)
        };
        
        res.json({
            success: true,
            data: guidance
        });
        
    } catch (error) {
        console.error('Get guidance error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get guidance'
        });
    }
});

/**
 * Helper: Generate step-specific message
 */
function generateStepMessage(step, userType) {
    const messages = {
        welcome: {
            beginner: 'Welcome! We\'re excited to have you here. Let\'s start by setting up your profile together.',
            casual: 'Hey there! Quick profile setup ahead. We\'ll make this painless.',
            experienced: 'Welcome back to the ecosystem. Let\'s get your profile configured.',
            professional: 'Welcome to TiltCheck. Complete setup for full platform access.'
        },
        basic_info: {
            beginner: 'Let\'s start with the basics. Choose a display name and avatar that represents you.',
            casual: 'Pick a username and avatar. The usual stuff.',
            experienced: 'Set up your identity. You can change these later if needed.',
            professional: 'Configure your professional identity and contact information.'
        },
        interests: {
            beginner: 'Tell us what interests you. This helps us show you relevant content.',
            casual: 'Pick some interests so we can customize your feed.',
            experienced: 'Select your areas of interest for personalized features.',
            professional: 'Define your focus areas for optimized dashboard and alerts.'
        },
        permissions: {
            beginner: 'Some features work better with permissions. We\'ll explain what each one does.',
            casual: 'Enable permissions for features you want to use. All optional.',
            experienced: 'Configure app permissions for real-time monitoring and alerts.',
            professional: 'Grant necessary permissions for comprehensive system integration.'
        },
        discord: {
            beginner: 'Join our Discord community to connect with others and get support.',
            casual: 'Link Discord if you want community features and alerts.',
            experienced: 'Connect Discord for community integration and notifications.',
            professional: 'Discord integration enables team collaboration and alerts.'
        },
        wallet: {
            beginner: 'Connect a wallet to receive tips and participate in rewards (optional).',
            casual: 'Link your wallet for tips and crypto features.',
            experienced: 'Connect Solana wallet for full ecosystem participation.',
            professional: 'Wallet integration required for financial features and settlements.'
        },
        nft: {
            beginner: 'Get a verification badge! This NFT shows you\'re part of our community.',
            casual: 'Mint a verification NFT for some extra street cred.',
            experienced: 'NFT verification adds credibility and unlocks premium features.',
            professional: 'Verification NFT required for enterprise tier and advanced features.'
        },
        complete: {
            beginner: 'Congratulations! You\'re all set up and ready to explore.',
            casual: 'You\'re good to go! Check out the dashboard.',
            experienced: 'Setup complete. Access your full dashboard.',
            professional: 'Onboarding complete. Full platform access enabled.'
        }
    };
    
    return messages[step.id]?.[userType] || messages[step.id]?.casual || 'Continue with the next step.';
}

/**
 * Helper: Get next recommended steps
 */
function getNextSteps(currentStep, user) {
    const allSteps = ONBOARDING_STEPS;
    const currentIndex = allSteps.findIndex(s => s.id === currentStep.id);
    
    if (currentIndex === -1 || currentIndex >= allSteps.length - 1) {
        return [];
    }
    
    // Return next 2-3 steps
    return allSteps
        .slice(currentIndex + 1, currentIndex + 4)
        .map(step => ({
            id: step.id,
            title: step.title,
            required: step.required
        }));
}

/**
 * POST /api/onboarding/skip-step
 * Skip optional step
 */
router.post('/skip-step', requireAuth, (req, res) => {
    try {
        const { stepId } = req.body;
        
        const step = ONBOARDING_STEPS.find(s => s.id === stepId);
        
        if (!step) {
            return res.status(404).json({
                success: false,
                error: 'Step not found'
            });
        }
        
        if (step.required) {
            return res.status(400).json({
                success: false,
                error: 'Cannot skip required step'
            });
        }
        
        res.json({
            success: true,
            message: 'Step skipped successfully',
            data: {
                skipped: stepId
            }
        });
        
    } catch (error) {
        console.error('Skip step error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to skip step'
        });
    }
});

module.exports = router;
