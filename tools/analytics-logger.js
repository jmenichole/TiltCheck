#!/usr/bin/env node

/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * Analytics Logger for TiltCheck
 * Logs user actions and tracks tilt events with timestamps and wallet IDs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AnalyticsLogger {
    constructor(config = {}) {
        this.logPath = config.logPath || './analytics/logs';
        this.dataPath = config.dataPath || './analytics/data';
        this.enablePII = config.enablePII || false; // PII protection by default
        
        // Ensure directories exist
        this.ensureDirectories();
        
        // Event types
        this.eventTypes = {
            // Session events
            SESSION_START: 'session_start',
            SESSION_END: 'session_end',
            SESSION_PAUSE: 'session_pause',
            SESSION_RESUME: 'session_resume',
            
            // Tilt events
            TILT_WARNING: 'tilt_warning',
            TILT_ALERT: 'tilt_alert',
            TILT_CRITICAL: 'tilt_critical',
            TILT_RECOVERY: 'tilt_recovery',
            
            // Betting events
            BET_PLACED: 'bet_placed',
            BET_WON: 'bet_won',
            BET_LOST: 'bet_lost',
            STAKE_INCREASED: 'stake_increased',
            STAKE_DECREASED: 'stake_decreased',
            
            // User actions
            WALLET_CONNECTED: 'wallet_connected',
            WALLET_DISCONNECTED: 'wallet_disconnected',
            PROFILE_UPDATED: 'profile_updated',
            SETTINGS_CHANGED: 'settings_changed',
            
            // Trust score events
            TRUST_SCORE_UPDATED: 'trust_score_updated',
            VERIFIED_ACTION: 'verified_action',
            SCAM_REPORTED: 'scam_reported',
            
            // Intervention events
            INTERVENTION_SHOWN: 'intervention_shown',
            INTERVENTION_DISMISSED: 'intervention_dismissed',
            INTERVENTION_ACCEPTED: 'intervention_accepted',
            
            // Game events
            GAME_SWITCHED: 'game_switched',
            BREAK_TAKEN: 'break_taken',
            VAULT_REMINDER: 'vault_reminder'
        };
    }

    ensureDirectories() {
        [this.logPath, this.dataPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Hash wallet ID for privacy protection
     */
    hashWalletId(walletId) {
        if (!this.enablePII) {
            return crypto.createHash('sha256').update(walletId).digest('hex').substring(0, 16);
        }
        return walletId;
    }

    /**
     * Generate unique event ID
     */
    generateEventId() {
        return `evt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    /**
     * Log a user action or tilt event
     */
    logEvent(eventType, userId, data = {}) {
        const event = {
            eventId: this.generateEventId(),
            eventType,
            userId: this.hashWalletId(userId),
            timestamp: new Date().toISOString(),
            timestampUnix: Date.now(),
            data: this.sanitizeData(data),
            session: {
                id: data.sessionId || null,
                startTime: data.sessionStartTime || null
            }
        };

        // Add wallet ID if provided
        if (data.walletId) {
            event.walletId = this.hashWalletId(data.walletId);
        }

        // Write to daily log file
        this.writeToLogFile(event);
        
        // Update aggregated metrics
        this.updateMetrics(event);
        
        return event;
    }

    /**
     * Remove PII from data
     */
    sanitizeData(data) {
        const sanitized = { ...data };
        
        // Remove sensitive fields
        const sensitiveFields = [
            'privateKey',
            'password',
            'email',
            'phone',
            'fullName',
            'address',
            'ssn',
            'creditCard'
        ];

        sensitiveFields.forEach(field => {
            if (field in sanitized) {
                delete sanitized[field];
            }
        });

        return sanitized;
    }

    /**
     * Write event to daily log file
     */
    writeToLogFile(event) {
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logPath, `events_${date}.jsonl`);
        
        try {
            // Append as JSON Lines format
            fs.appendFileSync(logFile, JSON.stringify(event) + '\n');
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }

    /**
     * Update aggregated metrics
     */
    updateMetrics(event) {
        const metricsFile = path.join(this.dataPath, 'daily_metrics.json');
        
        try {
            let metrics = {};
            if (fs.existsSync(metricsFile)) {
                metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
            }

            const date = new Date().toISOString().split('T')[0];
            if (!metrics[date]) {
                metrics[date] = {
                    totalEvents: 0,
                    eventsByType: {},
                    uniqueUsers: new Set(),
                    sessions: new Set()
                };
            }

            // Update metrics
            metrics[date].totalEvents++;
            metrics[date].eventsByType[event.eventType] = 
                (metrics[date].eventsByType[event.eventType] || 0) + 1;
            metrics[date].uniqueUsers.add(event.userId);
            
            if (event.session.id) {
                metrics[date].sessions.add(event.session.id);
            }

            // Convert Sets to arrays for JSON serialization
            const serializable = {
                ...metrics[date],
                uniqueUsers: Array.from(metrics[date].uniqueUsers),
                sessions: Array.from(metrics[date].sessions)
            };

            metrics[date] = serializable;

            fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
        } catch (error) {
            console.error('Error updating metrics:', error);
        }
    }

    /**
     * Log tilt event with specific details
     */
    logTiltEvent(userId, severity, data = {}) {
        const eventType = severity === 'critical' ? this.eventTypes.TILT_CRITICAL :
                         severity === 'warning' ? this.eventTypes.TILT_WARNING :
                         this.eventTypes.TILT_ALERT;

        return this.logEvent(eventType, userId, {
            ...data,
            severity,
            tiltScore: data.tiltScore || 0,
            triggers: data.triggers || [],
            interventionRecommended: data.interventionRecommended || false
        });
    }

    /**
     * Log session with start and end times
     */
    logSession(userId, walletId, sessionData) {
        return this.logEvent(this.eventTypes.SESSION_START, userId, {
            walletId,
            sessionId: sessionData.sessionId,
            sessionStartTime: sessionData.startTime || new Date().toISOString(),
            initialStake: sessionData.initialStake,
            gameType: sessionData.gameType
        });
    }

    /**
     * Log session end with statistics
     */
    logSessionEnd(userId, walletId, sessionData) {
        return this.logEvent(this.eventTypes.SESSION_END, userId, {
            walletId,
            sessionId: sessionData.sessionId,
            sessionStartTime: sessionData.startTime,
            sessionEndTime: new Date().toISOString(),
            duration: sessionData.duration,
            totalBets: sessionData.totalBets,
            totalWins: sessionData.totalWins,
            totalLosses: sessionData.totalLosses,
            netPL: sessionData.netPL,
            finalTiltScore: sessionData.tiltScore,
            interventionsShown: sessionData.interventions?.length || 0
        });
    }

    /**
     * Log betting action
     */
    logBet(userId, walletId, betData) {
        const eventType = betData.result === 'win' ? this.eventTypes.BET_WON :
                         betData.result === 'loss' ? this.eventTypes.BET_LOST :
                         this.eventTypes.BET_PLACED;

        return this.logEvent(eventType, userId, {
            walletId,
            sessionId: betData.sessionId,
            betAmount: betData.amount,
            betResult: betData.result,
            gameType: betData.gameType,
            currentStake: betData.currentStake,
            betNumber: betData.betNumber
        });
    }

    /**
     * Query events by date range
     */
    queryEvents(startDate, endDate, filters = {}) {
        const events = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Iterate through date range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const logFile = path.join(this.logPath, `events_${dateStr}.jsonl`);

            if (fs.existsSync(logFile)) {
                const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(l => l);
                lines.forEach(line => {
                    try {
                        const event = JSON.parse(line);
                        
                        // Apply filters
                        let matches = true;
                        if (filters.eventType && event.eventType !== filters.eventType) {
                            matches = false;
                        }
                        if (filters.userId && event.userId !== this.hashWalletId(filters.userId)) {
                            matches = false;
                        }
                        if (filters.walletId && event.walletId !== this.hashWalletId(filters.walletId)) {
                            matches = false;
                        }

                        if (matches) {
                            events.push(event);
                        }
                    } catch (error) {
                        // Skip malformed lines
                    }
                });
            }
        }

        return events;
    }

    /**
     * Get daily metrics
     */
    getDailyMetrics(date) {
        const metricsFile = path.join(this.dataPath, 'daily_metrics.json');
        
        if (fs.existsSync(metricsFile)) {
            const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
            return metrics[date] || null;
        }

        return null;
    }

    /**
     * Generate analytics report
     */
    generateReport(startDate, endDate) {
        const events = this.queryEvents(startDate, endDate);
        
        const report = {
            period: { startDate, endDate },
            summary: {
                totalEvents: events.length,
                uniqueUsers: new Set(events.map(e => e.userId)).size,
                uniqueSessions: new Set(events.map(e => e.session?.id).filter(Boolean)).size
            },
            eventBreakdown: {},
            tiltAnalysis: {
                warnings: 0,
                alerts: 0,
                critical: 0,
                recoveries: 0
            },
            sessionAnalysis: {
                totalSessions: 0,
                avgDuration: 0,
                avgBets: 0
            }
        };

        // Count event types
        events.forEach(event => {
            report.eventBreakdown[event.eventType] = 
                (report.eventBreakdown[event.eventType] || 0) + 1;

            // Tilt analysis
            if (event.eventType === this.eventTypes.TILT_WARNING) report.tiltAnalysis.warnings++;
            if (event.eventType === this.eventTypes.TILT_ALERT) report.tiltAnalysis.alerts++;
            if (event.eventType === this.eventTypes.TILT_CRITICAL) report.tiltAnalysis.critical++;
            if (event.eventType === this.eventTypes.TILT_RECOVERY) report.tiltAnalysis.recoveries++;
        });

        return report;
    }
}

// CLI usage
if (require.main === module) {
    const logger = new AnalyticsLogger();
    
    // Example usage
    console.log('Analytics Logger initialized');
    console.log('Log path:', logger.logPath);
    console.log('Data path:', logger.dataPath);
    
    // Demo event
    const demoEvent = logger.logEvent(
        logger.eventTypes.SESSION_START,
        'demo_user_123',
        {
            walletId: '7xKXtg2CW87d97TXJSDpLq2otBKHT8CveFmPY8gSZz',
            sessionId: 'session_demo_001',
            initialStake: 1000
        }
    );
    
    console.log('\nDemo event logged:');
    console.log(JSON.stringify(demoEvent, null, 2));
}

module.exports = AnalyticsLogger;
