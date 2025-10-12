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
 * 🎯 Enhanced Balance Helper for Degen + Mindful Integration
 * 
 * This module helps users find the perfect balance between their degen nature
 * and mindful decision-making. It's not about stopping the mischief - it's about
 * making it conscious, intentional, and sustainable.
 */

class DegenMindfulBalanceHelper {
    constructor() {
        this.balanceTypes = {
            'Recovering Perfectionist': {
                degenTendency: 'All-or-nothing extremes',
                mindfulAntidote: 'Practice "good enough" and gentle progress',
                balanceStrategy: 'Set micro-goals and celebrate small wins',
                interventionStyle: 'Supportive reality checks',
                tiltTriggers: ['perfectionism', 'comparison', 'overthinking'],
                strengths: ['attention to detail', 'high standards', 'analytical thinking']
            },
            'Impatient Action Hero': {
                degenTendency: 'Quick decisions without full information',
                mindfulAntidote: 'Strategic pause and breath-work integration',
                balanceStrategy: 'Channel urgency into focused preparation',
                interventionStyle: 'Gentle speed bumps with quick wins',
                tiltTriggers: ['waiting', 'slow progress', 'complex analysis'],
                strengths: ['quick execution', 'adaptability', 'high energy']
            },
            'Analytical Overthinker': {
                degenTendency: 'Analysis paralysis and missed opportunities',
                mindfulAntidote: 'Trust intuition and embrace "trial runs"',
                balanceStrategy: 'Time-boxed analysis with action deadlines',
                interventionStyle: 'Structured decision frameworks',
                tiltTriggers: ['incomplete information', 'uncertainty', 'time pressure'],
                strengths: ['thorough analysis', 'risk awareness', 'pattern recognition']
            },
            'Emotional Reactor': {
                degenTendency: 'Decisions driven by immediate emotional state',
                mindfulAntidote: 'Emotional awareness and regulation practices',
                balanceStrategy: 'Emotion as data, not director',
                interventionStyle: 'Compassionate pause and reframe',
                tiltTriggers: ['strong emotions', 'interpersonal conflict', 'rejection'],
                strengths: ['empathy', 'authenticity', 'intuitive insights']
            },
            'Social Validation Seeker': {
                degenTendency: 'Decisions based on external approval',
                mindfulAntidote: 'Self-compassion and internal validation',
                balanceStrategy: 'Clarify personal values and boundaries',
                interventionStyle: 'Gentle independence building',
                tiltTriggers: ['criticism', 'rejection', 'being misunderstood'],
                strengths: ['social awareness', 'collaboration', 'communication']
            },
            'Balanced Degen Architect': {
                degenTendency: 'Occasionally overconfident in balance abilities',
                mindfulAntidote: 'Maintain beginner\'s mind and continuous learning',
                balanceStrategy: 'Model balance for community and stay humble',
                interventionStyle: 'Peer-level wisdom sharing',
                tiltTriggers: ['complacency', 'overconfidence', 'isolation'],
                strengths: ['consistency', 'mentorship', 'sustainable growth']
            }
        };

        this.interventionMethods = {
            vault_timer: {
                name: 'Progressive Vault Timer',
                description: 'Smart delays that scale with decision significance',
                implementation: {
                    quick_decisions: '3-minute mindful pause',
                    medium_stakes: '15-minute reflection period',
                    high_stakes: '1-hour wisdom integration',
                    emergency_mode: '24-hour circuit breaker',
                    crisis_mode: '72-hour full stop with support'
                },
                user_message: 'Your future self will thank you for this pause ⏰'
            },
            mindful_pause: {
                name: 'Conscious Breathing Protocol',
                description: 'Breath-work integration before all decisions',
                implementation: {
                    micro_pause: '3 conscious breaths',
                    standard_pause: '1-minute body scan + intention setting',
                    deep_pause: '5-minute meditation + values alignment',
                    emergency_pause: '10-minute grounding + support call'
                },
                user_message: 'Let\'s take a breath and check in with ourselves 🌬️'
            },
            strategic_analysis: {
                name: 'Degen Decision Framework',
                description: 'Quick but thorough risk/reward analysis',
                implementation: {
                    quick_check: 'Expected value calculation',
                    standard_analysis: 'Historical pattern review + probability modeling',
                    deep_analysis: 'Comprehensive risk assessment + scenario planning',
                    emergency_analysis: 'Full financial audit + third-party consultation'
                },
                user_message: 'What would your smartest self do right now? 🧠'
            },
            community_wisdom: {
                name: 'Buddy Verification System',
                description: 'Peer accountability and collective wisdom',
                implementation: {
                    quick_check: 'Text your accountability buddy',
                    standard_check: 'Group chat reality check',
                    deep_check: 'Schedule wisdom circle call',
                    emergency_check: 'Activate full support network'
                },
                user_message: 'Your crew has your back - let them help 🤝'
            },
            love_reflection: {
                name: 'Self-Compassion Activation',
                description: 'Heart-centered decision making with kindness',
                implementation: {
                    quick_check: 'Self-compassion check-in',
                    standard_check: 'Values alignment verification',
                    deep_check: 'Future self visualization + forgiveness practice',
                    emergency_check: 'Professional support + healing plan'
                },
                user_message: 'You deserve the same kindness you\'d show a friend 💜'
            }
        };
    }

    /**
     * 🎯 Generate personalized balance guidance based on user's archetype and current state
     */
    generateBalanceGuidance(userArchetype, currentTiltLevel, recentPatterns) {
        const balanceType = this.balanceTypes[userArchetype] || this.balanceTypes['Balanced Degen Architect'];
        const urgencyLevel = this.calculateInterventionUrgency(currentTiltLevel, recentPatterns);
        
        return {
            currentAssessment: {
                archetype: userArchetype,
                tiltLevel: currentTiltLevel,
                urgencyLevel: urgencyLevel,
                primaryTriggers: balanceType.tiltTriggers,
                activeStrengths: balanceType.strengths
            },
            balanceStrategy: {
                degenTendency: balanceType.degenTendency,
                mindfulAntidote: balanceType.mindfulAntidote,
                actionPlan: balanceType.balanceStrategy,
                interventionStyle: balanceType.interventionStyle
            },
            recommendedInterventions: this.selectOptimalInterventions(urgencyLevel, balanceType),
            encouragement: this.generatePersonalizedEncouragement(userArchetype, currentTiltLevel),
            nextSteps: this.generateActionableNextSteps(balanceType, urgencyLevel)
        };
    }

    /**
     * 🎯 Calculate how urgently intervention is needed
     */
    calculateInterventionUrgency(tiltLevel, recentPatterns) {
        const tiltScores = {
            'chill': 0,
            'sending_it': 25,
            'full_degen': 60,
            'rekt': 90
        };

        let urgencyScore = tiltScores[tiltLevel] || 0;
        
        // Factor in recent patterns
        if (recentPatterns.escalatingBehavior) urgencyScore += 20;
        if (recentPatterns.ignoredWarnings) urgencyScore += 15;
        if (recentPatterns.supportNetworkAvoidance) urgencyScore += 10;
        if (recentPatterns.selfCareNeglect) urgencyScore += 10;
        
        if (urgencyScore >= 80) return 'emergency';
        if (urgencyScore >= 60) return 'high';
        if (urgencyScore >= 30) return 'medium';
        return 'low';
    }

    /**
     * 🎯 Select the most effective interventions for current situation
     */
    selectOptimalInterventions(urgencyLevel, balanceType) {
        const interventions = [];
        
        switch(urgencyLevel) {
            case 'emergency':
                interventions.push(
                    this.formatIntervention('vault_timer', 'crisis_mode'),
                    this.formatIntervention('community_wisdom', 'emergency_check'),
                    this.formatIntervention('love_reflection', 'emergency_check')
                );
                break;
                
            case 'high':
                interventions.push(
                    this.formatIntervention('vault_timer', 'emergency_mode'),
                    this.formatIntervention('mindful_pause', 'deep_pause'),
                    this.formatIntervention('strategic_analysis', 'deep_analysis')
                );
                break;
                
            case 'medium':
                interventions.push(
                    this.formatIntervention('vault_timer', 'high_stakes'),
                    this.formatIntervention('mindful_pause', 'standard_pause'),
                    this.formatIntervention('community_wisdom', 'standard_check')
                );
                break;
                
            case 'low':
                interventions.push(
                    this.formatIntervention('mindful_pause', 'micro_pause'),
                    this.formatIntervention('strategic_analysis', 'quick_check'),
                    this.formatIntervention('love_reflection', 'quick_check')
                );
                break;
        }
        
        return interventions;
    }

    /**
     * 🎯 Format intervention with specific implementation details
     */
    formatIntervention(method, intensity) {
        const intervention = this.interventionMethods[method];
        return {
            name: intervention.name,
            description: intervention.description,
            action: intervention.implementation[intensity],
            userMessage: intervention.user_message,
            estimatedTime: this.getEstimatedTime(method, intensity)
        };
    }

    /**
     * 🎯 Generate personalized encouragement based on archetype and state
     */
    generatePersonalizedEncouragement(archetype, tiltLevel) {
        const encouragements = {
            'Recovering Perfectionist': {
                'chill': 'You\'re doing great! Your attention to detail is a superpower when balanced with self-compassion.',
                'sending_it': 'Remember: progress over perfection. You don\'t need to nail everything on the first try.',
                'full_degen': 'Your perfectionist energy is strong right now. Let\'s channel it into one small, achievable goal.',
                'rekt': 'Hey, even the most successful people have messy moments. This doesn\'t define you - your response does.'
            },
            'Impatient Action Hero': {
                'chill': 'Your energy and quick thinking are incredible assets. You\'re finding great balance right now!',
                'sending_it': 'That urgency you feel? It\'s a superpower when paired with just a tiny bit of planning.',
                'full_degen': 'Channel that action hero energy! Sometimes the most heroic thing is a strategic pause.',
                'rekt': 'Every action hero needs a moment to regroup. This is your "gathering intel" phase.'
            },
            'Analytical Overthinker': {
                'chill': 'Your thorough thinking is serving you well. Trust yourself - you have great judgment.',
                'sending_it': 'Your analysis is valuable, but so is your intuition. What does your gut say?',
                'full_degen': 'All that thinking energy? Let\'s give it a deadline and see what emerges.',
                'rekt': 'Sometimes the best analysis is recognizing when we\'re stuck in analysis. You\'re self-aware!'
            },
            'Emotional Reactor': {
                'chill': 'Your emotional intelligence and authenticity are beautiful. You\'re in a great space right now.',
                'sending_it': 'Those feelings are valid and important data. Let\'s just make sure they inform rather than drive.',
                'full_degen': 'Big emotions = big information. What are they trying to tell you?',
                'rekt': 'Feeling everything deeply is a gift, even when it hurts. You\'re human, and that\'s perfect.'
            },
            'Social Validation Seeker': {
                'chill': 'Your social awareness and care for others is a strength. You\'re finding good balance!',
                'sending_it': 'You matter regardless of what others think. What feels true for YOU right now?',
                'full_degen': 'Your need for connection is beautiful. Can we connect with yourself first, then others?',
                'rekt': 'External validation is nice, but self-acceptance is everything. You\'re worthy as you are.'
            },
            'Balanced Degen Architect': {
                'chill': 'You\'re modeling what sustainable growth looks like. The community sees and appreciates you.',
                'sending_it': 'Even architects need recalibration sometimes. Your awareness is your greatest tool.',
                'full_degen': 'Remember: being balanced doesn\'t mean being perfect. What would you tell a friend right now?',
                'rekt': 'Leaders stumble too - it\'s how they get back up that inspires others. You\'ve got this.'
            }
        };

        return encouragements[archetype]?.[tiltLevel] || 
               'You\'re doing your best with the information and energy you have right now. That\'s enough. 💜';
    }

    /**
     * 🎯 Generate specific, actionable next steps
     */
    generateActionableNextSteps(balanceType, urgencyLevel) {
        const steps = [];
        
        switch(urgencyLevel) {
            case 'emergency':
                steps.push(
                    '🛑 IMMEDIATE: Activate your crisis support plan',
                    '📞 NEXT: Contact your accountability buddy or trusted friend',
                    '🏥 IF NEEDED: Professional support is available and brave to seek',
                    '⏰ TIMELINE: Take this one hour at a time'
                );
                break;
                
            case 'high':
                steps.push(
                    '⏸️ PAUSE: Activate 24-hour vault timer',
                    '🧘 BREATHE: 10-minute grounding meditation',
                    '🤝 CONNECT: Reach out to support network',
                    '📝 PLAN: Write out what happened and what you learned'
                );
                break;
                
            case 'medium':
                steps.push(
                    '⏰ WAIT: 1-hour reflection period',
                    '🎯 FOCUS: Identify the one most important thing right now',
                    '💪 STRENGTH: Use your natural strengths (' + balanceType.strengths.join(', ') + ')',
                    '🔄 CHECK-IN: How do you feel after the pause?'
                );
                break;
                
            case 'low':
                steps.push(
                    '🌬️ BREATHE: Three conscious breaths',
                    '✅ ALIGN: Does this match your values?',
                    '🚀 ACT: Move forward with awareness',
                    '📊 TRACK: Note what worked for next time'
                );
                break;
        }
        
        return steps;
    }

    /**
     * 🎯 Estimate time needed for intervention
     */
    getEstimatedTime(method, intensity) {
        const timeEstimates = {
            vault_timer: {
                crisis_mode: '72 hours',
                emergency_mode: '24 hours', 
                high_stakes: '1 hour',
                medium_stakes: '15 minutes',
                quick_decisions: '3 minutes'
            },
            mindful_pause: {
                emergency_pause: '10 minutes',
                deep_pause: '5 minutes',
                standard_pause: '1 minute',
                micro_pause: '30 seconds'
            },
            strategic_analysis: {
                emergency_analysis: '30 minutes',
                deep_analysis: '15 minutes',
                standard_analysis: '5 minutes',
                quick_check: '2 minutes'
            },
            community_wisdom: {
                emergency_check: '20 minutes',
                deep_check: '15 minutes',
                standard_check: '5 minutes',
                quick_check: '2 minutes'
            },
            love_reflection: {
                emergency_check: '15 minutes',
                deep_check: '10 minutes',
                standard_check: '5 minutes',
                quick_check: '2 minutes'
            }
        };

        return timeEstimates[method]?.[intensity] || '5 minutes';
    }

    /**
     * 🎯 Generate a comprehensive balance report
     */
    generateBalanceReport(userData) {
        const guidance = this.generateBalanceGuidance(
            userData.archetype || 'Balanced Degen Architect',
            userData.currentTiltLevel || 'chill',
            userData.recentPatterns || {}
        );

        return `
🎯 DEGEN + MINDFUL BALANCE GUIDANCE
═══════════════════════════════════════════════════════════════

CURRENT ASSESSMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Archetype: ${guidance.currentAssessment.archetype}
• Tilt Level: ${guidance.currentAssessment.tiltLevel}
• Intervention Urgency: ${guidance.currentAssessment.urgencyLevel}
• Active Strengths: ${guidance.currentAssessment.activeStrengths.join(', ')}

BALANCE STRATEGY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎲 Degen Tendency: ${guidance.balanceStrategy.degenTendency}
🧘 Mindful Antidote: ${guidance.balanceStrategy.mindfulAntidote}
🎯 Action Plan: ${guidance.balanceStrategy.actionPlan}

RECOMMENDED INTERVENTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guidance.recommendedInterventions.map(intervention => 
    `• ${intervention.name} (${intervention.estimatedTime})\n  Action: ${intervention.action}\n  Message: ${intervention.userMessage}`
).join('\n\n')}

ENCOURAGEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💜 ${guidance.encouragement}

NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guidance.nextSteps.map(step => `${step}`).join('\n')}

═══════════════════════════════════════════════════════════════
Remember: You're not broken. You're not addicted. You're learning.
Balance isn't perfection - it's conscious awareness + kind action.
💜 You've got this, one decision at a time. 💜
        `;
    }
}

module.exports = DegenMindfulBalanceHelper;
