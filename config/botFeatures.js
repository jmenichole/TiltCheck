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

// Bot Feature Configuration
// This file controls which features are available to which bots

module.exports = {
    // Bot Type Constants
    BOT_TYPES: {
        TRAPHOUSE: 'TRAPHOUSE',
        JUSTTHETIP: 'JUSTTHETIP',
        DEGENS: 'DEGENS'
    },

    // Feature availability matrix
    FEATURES: {
        // Loan system - ONLY TrapHouse bot
        LOANS: {
            TRAPHOUSE: true,
            JUSTTHETIP: false,
            DEGENS: false,
            description: 'Loan feature is exclusively for TrapHouse bot'
        },

        // Collect Clock integration - ONLY JustTheTip bot
        COLLECTCLOCK: {
            TRAPHOUSE: false,
            JUSTTHETIP: true,
            DEGENS: false,
            description: 'Collect Clock integration only available to JustTheTip bot'
        },

        // TiltCheck integration - ONLY JustTheTip bot with enhanced verification
        TILTCHECK: {
            TRAPHOUSE: false,
            JUSTTHETIP: true,
            DEGENS: false,
            description: 'TiltCheck with comprehensive verification is only available to JustTheTip bot',
            features: [
                'wallet_verification',
                'casino_session_tracking',
                'bonus_collection_monitoring',
                'cross_platform_correlation',
                'real_time_pattern_detection',
                'collectclock_integration'
            ]
        },

        // Enhanced TiltCheck Verification System - JustTheTip only
        TILTCHECK_VERIFICATION: {
            TRAPHOUSE: false,
            JUSTTHETIP: true,
            DEGENS: false,
            description: 'Advanced verification system for accurate tilt detection',
            requirements: [
                'minimum_trust_score_50',
                'wallet_verification',
                'discord_session_validation'
            ]
        },

        // Degens Card Bot - Available to ALL bots
        DEGENS_CARDS: {
            TRAPHOUSE: true,
            JUSTTHETIP: true,
            DEGENS: true,
            description: 'Degens Card Bot is available to all bots'
        },

        // Respect system - TrapHouse and potentially others
        RESPECT: {
            TRAPHOUSE: true,
            JUSTTHETIP: false,
            DEGENS: false,
            description: 'Respect system primarily for TrapHouse bot'
        },

        // Payment system - TrapHouse primary, JustTheTip crypto-only
        PAYMENTS: {
            TRAPHOUSE: true,
            JUSTTHETIP: true,  // Crypto-only
            DEGENS: false,
            description: 'Payment system available to TrapHouse (full) and JustTheTip (crypto-only)'
        },

        // Vault recommendations - JustTheTip specific
        VAULTS: {
            TRAPHOUSE: false,
            JUSTTHETIP: true,
            DEGENS: false,
            description: 'Vault recommendations are JustTheTip exclusive'
        }
    },

    // Get current bot type from environment
    getCurrentBotType() {
        return process.env.BOT_TYPE || 'TRAPHOUSE';
    },

    // Check if a feature is enabled for the current bot
    isFeatureEnabled(featureName, botType = null) {
        const currentBotType = botType || this.getCurrentBotType();
        const feature = this.FEATURES[featureName];
        
        if (!feature) {
            console.warn(`Unknown feature: ${featureName}`);
            return false;
        }

        return feature[currentBotType] === true;
    },

    // Get all enabled features for a bot type
    getEnabledFeatures(botType = null) {
        const currentBotType = botType || this.getCurrentBotType();
        const enabledFeatures = [];

        for (const [featureName, feature] of Object.entries(this.FEATURES)) {
            if (feature[currentBotType] === true) {
                enabledFeatures.push({
                    name: featureName,
                    description: feature.description
                });
            }
        }

        return enabledFeatures;
    },

    // Feature guard for commands - throws error if feature not available
    requireFeature(featureName, botType = null) {
        if (!this.isFeatureEnabled(featureName, botType)) {
            const currentBotType = botType || this.getCurrentBotType();
            throw new Error(`Feature '${featureName}' is not available for ${currentBotType} bot`);
        }
    },

    // Get feature restriction message
    getFeatureRestrictionMessage(featureName, botType = null) {
        const currentBotType = botType || this.getCurrentBotType();
        const feature = this.FEATURES[featureName];
        
        if (!feature) {
            return `Unknown feature: ${featureName}`;
        }

        if (feature[currentBotType]) {
            return `Feature '${featureName}' is enabled for ${currentBotType} bot`;
        }

        // Find which bots have this feature
        const enabledBots = Object.entries(feature)
            .filter(([bot, enabled]) => enabled === true && bot !== 'description')
            .map(([bot]) => bot);

        if (enabledBots.length === 0) {
            return `Feature '${featureName}' is not available on any bot`;
        }

        return `Feature '${featureName}' is only available on: ${enabledBots.join(', ')} bot${enabledBots.length > 1 ? 's' : ''}`;
    }
};
