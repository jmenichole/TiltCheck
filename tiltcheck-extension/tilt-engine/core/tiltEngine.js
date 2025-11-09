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
 * TiltCheck Tilt Detection Engine - Core Module
 */

const EventTypes = {
    RAPID_CLICKING: 'rapid_clicking',
    LOSS_DETECTED: 'loss_detected',
    EXTENDED_SESSION: 'extended_session',
    BIG_BET: 'big_bet',
    BALANCE_DROP: 'balance_drop',
    REPEATED_LOSSES: 'repeated_losses',
    EMOTIONAL_LANGUAGE: 'emotional_language'
};

const TiltLevels = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High'
};

const DEFAULT_CONFIG = {
    thresholds: { low: 3, medium: 6, high: 8 },
    eventWeights: {
        'rapid_clicking': 2,
        'loss_detected': 3,
        'extended_session': 1,
        'big_bet': 2,
        'balance_drop': 4,
        'repeated_losses': 5,
        'emotional_language': 3
    },
    timeWindowMinutes: 10
};

function computeTiltScore(playerEvents = [], options = {}) {
    if (!Array.isArray(playerEvents) || playerEvents.length === 0) {
        return {
            score: 0,
            level: TiltLevels.LOW,
            eventCount: 0,
            recentEventCount: 0,
            breakdown: {},
            timestamp: Date.now()
        };
    }

    const config = Object.assign({}, DEFAULT_CONFIG, options.config || {});
    
    const cutoffTime = Date.now() - (config.timeWindowMinutes * 60 * 1000);
    const recentEvents = playerEvents.filter(event => event.timestamp >= cutoffTime);

    let baseScore = 0;
    const breakdown = {};
    
    for (const event of recentEvents) {
        const weight = config.eventWeights[event.type] || 1;
        const intensity = event.intensity || 1;
        const eventScore = weight * intensity;
        
        baseScore += eventScore;
        
        if (!breakdown[event.type]) {
            breakdown[event.type] = { count: 0, score: 0, weight: weight };
        }
        breakdown[event.type].count++;
        breakdown[event.type].score += eventScore;
    }

    let sessionMultiplier = 1;
    if (options.sessionStartTime) {
        const sessionMinutes = (Date.now() - options.sessionStartTime) / (1000 * 60);
        if (sessionMinutes >= 180) sessionMultiplier = 2.5;
        else if (sessionMinutes >= 120) sessionMultiplier = 2.0;
        else if (sessionMinutes >= 60) sessionMultiplier = 1.5;
    }

    const finalScore = Math.min(baseScore * sessionMultiplier, 10);
    
    let level = TiltLevels.LOW;
    if (finalScore >= config.thresholds.high) level = TiltLevels.HIGH;
    else if (finalScore >= config.thresholds.medium) level = TiltLevels.MEDIUM;

    return {
        score: finalScore,
        level: level,
        eventCount: playerEvents.length,
        recentEventCount: recentEvents.length,
        sessionMultiplier: sessionMultiplier,
        breakdown: breakdown,
        timestamp: Date.now()
    };
}

function createPlayerEvent(type, intensity, metadata) {
    intensity = intensity || 1;
    metadata = metadata || {};
    
    if (!Object.values(EventTypes).includes(type)) {
        throw new Error('Invalid event type: ' + type);
    }

    return {
        type: type,
        timestamp: Date.now(),
        intensity: Math.max(1, Math.min(10, intensity)),
        metadata: metadata,
        id: type + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    };
}

function analyzeEventPatterns(events) {
    if (!Array.isArray(events) || events.length === 0) {
        return { patterns: [], riskFactors: [] };
    }

    const patterns = [];
    const riskFactors = [];

    const lossEvents = events.filter(function(e) {
        return e.type === EventTypes.LOSS_DETECTED || e.type === EventTypes.BALANCE_DROP;
    });

    if (lossEvents.length >= 3) {
        patterns.push('rapid_loss_streak');
        riskFactors.push('Multiple losses in short time frame');
    }

    const betEvents = events.filter(function(e) {
        return e.type === EventTypes.BIG_BET;
    }).sort(function(a, b) {
        return a.timestamp - b.timestamp;
    });
    
    if (betEvents.length >= 2) {
        let increasing = true;
        for (let i = 1; i < betEvents.length; i++) {
            if (betEvents[i].intensity < betEvents[i-1].intensity) {
                increasing = false;
                break;
            }
        }
        
        if (increasing) {
            patterns.push('escalating_bets');
            riskFactors.push('Bet sizes are increasing over time');
        }
    }

    return { patterns: patterns, riskFactors: riskFactors };
}

module.exports = {
    computeTiltScore: computeTiltScore,
    createPlayerEvent: createPlayerEvent,
    analyzeEventPatterns: analyzeEventPatterns,
    EventTypes: EventTypes,
    TiltLevels: TiltLevels
};
