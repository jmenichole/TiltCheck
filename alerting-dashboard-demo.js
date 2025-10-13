/**
 * Complete Alerting & Dashboard System Demo
 * Shows end-to-end functionality: events → tilt computation → alerting → dashboard
 */

// Mock the ES modules for CommonJS environment
const TiltLevels = {
    LOW: 'Low',
    MEDIUM: 'Medium', 
    HIGH: 'High'
};

const TILT_THRESHOLDS = {
    medium: 4,
    high: 7
};

// Simplified tilt computation for demo
function computeTiltScore(events) {
    if (!events || events.length === 0) {
        return { score: 0, level: TiltLevels.LOW, eventCount: 0 };
    }

    let score = 0;
    
    events.forEach(event => {
        if (event.type === 'bet' && event.amount > 1000) score += 2;
        if (event.type === 'all_in') score += 3;
        if (event.decision_time && event.decision_time < 1000) score += 1;
        if (event.sentiment === 'negative') score += 2;
    });

    let level = TiltLevels.LOW;
    if (score >= TILT_THRESHOLDS.high) level = TiltLevels.HIGH;
    else if (score >= TILT_THRESHOLDS.medium) level = TiltLevels.MEDIUM;

    return { score, level, eventCount: events.length };
}

function createPlayerEvent(type, data = {}) {
    return {
        type,
        timestamp: Date.now(),
        ...data
    };
}

// Alerting Engine Implementation
class AlertingEngine {
    constructor(options = {}) {
        this.adapters = new Map();
        this.alertConfigs = new Map();
        this.alertHistory = new Map();
        this.options = {
            defaultCooldownMs: 2000, // 2 seconds for demo
            maxAlertsPerPlayer: 10,
            ...options
        };
    }

    registerAdapter(name, adapter) {
        this.adapters.set(name, adapter);
    }

    setPlayerAlertConfig(playerId, config) {
        const defaultConfig = {
            enabledLevels: [TiltLevels.MEDIUM, TiltLevels.HIGH],
            enabledAdapters: Array.from(this.adapters.keys()),
            cooldownMs: this.options.defaultCooldownMs
        };
        this.alertConfigs.set(playerId, { ...defaultConfig, ...config });
    }

    async processTiltResult(playerId, tiltResult, playerInfo = {}) {
        const config = this.getPlayerConfig(playerId);
        
        // Check if should alert
        if (!config.enabledLevels.includes(tiltResult.level)) {
            return { playerId, alertTriggered: false, reason: 'Tilt level not enabled' };
        }

        // Check cooldown
        const history = this.alertHistory.get(playerId) || [];
        const now = Date.now();
        const recentAlert = history.find(alert => now - alert.timestamp < config.cooldownMs);
        
        if (recentAlert) {
            return { playerId, alertTriggered: false, reason: 'Cooldown active' };
        }

        // Record alert
        history.push({ timestamp: now, tiltLevel: tiltResult.level, tiltScore: tiltResult.score });
        this.alertHistory.set(playerId, history);

        // Send alerts
        const results = [];
        for (const adapterName of config.enabledAdapters) {
            const adapter = this.adapters.get(adapterName);
            if (adapter) {
                try {
                    await adapter.sendTiltAlert(tiltResult, { ...playerInfo, id: playerId });
                    results.push({ adapter: adapterName, success: true });
                } catch (error) {
                    results.push({ adapter: adapterName, success: false, error: error.message });
                }
            }
        }

        return {
            playerId,
            alertTriggered: true,
            tiltLevel: tiltResult.level,
            tiltScore: tiltResult.score,
            adaptersNotified: results.filter(r => r.success).length,
            totalAdapters: results.length,
            results
        };
    }

    getPlayerConfig(playerId) {
        return this.alertConfigs.get(playerId) || {
            enabledLevels: [TiltLevels.MEDIUM, TiltLevels.HIGH],
            enabledAdapters: Array.from(this.adapters.keys()),
            cooldownMs: this.options.defaultCooldownMs
        };
    }

    getPlayerAlertStats(playerId) {
        const history = this.alertHistory.get(playerId) || [];
        return {
            totalAlerts: history.length,
            alertsLastHour: history.length,
            alertsLast24h: history.length,
            lastAlert: history.length > 0 ? history[history.length - 1] : null
        };
    }

    getActiveAlerts() {
        const activeAlerts = {};
        for (const [playerId, history] of this.alertHistory.entries()) {
            if (history.length > 0) {
                activeAlerts[playerId] = {
                    recentAlerts: history,
                    lastAlert: history[history.length - 1],
                    alertCount: history.length
                };
            }
        }
        return activeAlerts;
    }
}

// Dashboard Implementation
class TiltDashboard {
    constructor(options = {}) {
        this.playerData = new Map();
        this.sessionData = new Map();
        this.alertingEngine = options.alertingEngine || null;
    }

    registerPlayer(playerId, playerInfo = {}) {
        if (!this.playerData.has(playerId)) {
            this.playerData.set(playerId, {
                id: playerId,
                name: playerInfo.name || `Player ${playerId}`,
                email: playerInfo.email || '',
                currentTiltScore: 0,
                currentTiltLevel: TiltLevels.LOW,
                sessionCount: 0,
                totalEvents: 0,
                tiltHistory: [],
                lastActivity: Date.now(),
                ...playerInfo
            });
        }
    }

    updatePlayerTilt(playerId, tiltResult, events = []) {
        this.registerPlayer(playerId);
        const player = this.playerData.get(playerId);
        
        player.currentTiltScore = tiltResult.score;
        player.currentTiltLevel = tiltResult.level;
        player.totalEvents += events.length;
        player.lastActivity = Date.now();
        
        player.tiltHistory.push({
            timestamp: Date.now(),
            tiltScore: tiltResult.score,
            tiltLevel: tiltResult.level,
            eventCount: events.length
        });
    }

    startPlayerSession(playerId, sessionInfo = {}) {
        this.registerPlayer(playerId);
        const player = this.playerData.get(playerId);
        player.sessionCount++;
        
        const sessionId = `${playerId}_${Date.now()}`;
        this.sessionData.set(sessionId, {
            id: sessionId,
            playerId,
            startTime: Date.now(),
            ...sessionInfo
        });
        return sessionId;
    }

    endPlayerSession(sessionId) {
        const session = this.sessionData.get(sessionId);
        if (session) {
            session.endTime = Date.now();
        }
    }

    getDashboardData() {
        const players = Array.from(this.playerData.values());
        
        const summary = {
            totalPlayers: players.length,
            activePlayers: players.filter(p => Date.now() - p.lastActivity < 60000).length,
            highRiskPlayers: players.filter(p => p.currentTiltLevel !== TiltLevels.LOW).length,
            tiltLevelBreakdown: {}
        };

        // Calculate tilt level breakdown
        Object.values(TiltLevels).forEach(level => {
            summary.tiltLevelBreakdown[level] = players.filter(p => p.currentTiltLevel === level).length;
        });

        const formattedPlayers = players.map(player => ({
            ...player,
            riskLevel: this.calculateRiskLevel(player),
            status: this.getPlayerStatus(player)
        }));

        return {
            timestamp: Date.now(),
            totalPlayers: players.length,
            summary,
            players: formattedPlayers,
            activeAlerts: this.getActiveAlertsData()
        };
    }

    calculateRiskLevel(player) {
        if (player.currentTiltLevel === TiltLevels.HIGH) return 'Critical';
        if (player.currentTiltLevel === TiltLevels.MEDIUM) return 'High';
        return 'Normal';
    }

    getPlayerStatus(player) {
        const timeSince = Date.now() - player.lastActivity;
        if (timeSince < 5000) return 'Active';
        if (timeSince < 60000) return 'Recent';
        return 'Inactive';
    }

    getActiveAlertsData() {
        if (!this.alertingEngine) {
            return { available: false };
        }
        
        const activeAlerts = this.alertingEngine.getActiveAlerts();
        return {
            available: true,
            count: Object.keys(activeAlerts).length,
            alerts: activeAlerts
        };
    }
}

// Demo Adapters
class ConsoleAdapter {
    async sendTiltAlert(tiltResult, playerInfo) {
        console.log(`🚨 ALERT: ${playerInfo.name || playerInfo.id} - ${tiltResult.level} Tilt (Score: ${tiltResult.score})`);
        return true;
    }
}

class EmailAdapter {
    constructor() {
        this.emailsSent = [];
    }

    async sendTiltAlert(tiltResult, playerInfo) {
        const email = {
            to: playerInfo.email || 'admin@casino.com',
            subject: `Tilt Alert: ${playerInfo.name || playerInfo.id}`,
            body: `Player has reached ${tiltResult.level} tilt level with score ${tiltResult.score}`
        };
        this.emailsSent.push(email);
        console.log(`📧 EMAIL: ${email.subject} sent to ${email.to}`);
        return true;
    }
}

class WebhookAdapter {
    constructor() {
        this.webhookCalls = [];
    }

    async sendTiltAlert(tiltResult, playerInfo) {
        const payload = {
            event: 'tilt_alert',
            player: playerInfo.id,
            tilt: { score: tiltResult.score, level: tiltResult.level },
            timestamp: Date.now()
        };
        this.webhookCalls.push(payload);
        console.log(`🌐 WEBHOOK: ${JSON.stringify(payload)}`);
        return true;
    }
}

// Main Demo
async function runAlertingDashboardDemo() {
    console.log('🎯 TILTCHECK ALERTING & DASHBOARD DEMO');
    console.log('═'.repeat(50));
    console.log();

    // 1. Setup System
    console.log('🚀 Setting up integrated system...');
    
    const alertingEngine = new AlertingEngine();
    const dashboard = new TiltDashboard({ alertingEngine });

    // Register adapters
    const adapters = {
        console: new ConsoleAdapter(),
        email: new EmailAdapter(), 
        webhook: new WebhookAdapter()
    };

    Object.entries(adapters).forEach(([name, adapter]) => {
        alertingEngine.registerAdapter(name, adapter);
    });

    console.log('✅ Registered adapters: Console, Email, Webhook\n');

    // 2. Register Players
    console.log('👥 Registering players...');
    
    const players = [
        { id: 'alice', name: 'Alice Johnson', email: 'alice@casino.com', profile: 'conservative' },
        { id: 'bob', name: 'Bob Smith', email: 'bob@casino.com', profile: 'aggressive' },
        { id: 'carol', name: 'Carol Davis', email: 'carol@casino.com', profile: 'tilting' }
    ];

    players.forEach(player => {
        dashboard.registerPlayer(player.id, player);
        
        // Configure different alerting per player
        if (player.profile === 'conservative') {
            alertingEngine.setPlayerAlertConfig(player.id, {
                enabledLevels: [TiltLevels.HIGH],
                enabledAdapters: ['email']
            });
        } else if (player.profile === 'aggressive') {
            alertingEngine.setPlayerAlertConfig(player.id, {
                enabledLevels: [TiltLevels.MEDIUM, TiltLevels.HIGH],
                enabledAdapters: ['console', 'webhook']
            });
        } else {
            alertingEngine.setPlayerAlertConfig(player.id, {
                enabledLevels: [TiltLevels.MEDIUM, TiltLevels.HIGH],
                enabledAdapters: ['console', 'email', 'webhook']
            });
        }
    });

    console.log(`✅ Registered ${players.length} players with custom alert configs\n`);

    // 3. Simulate Game Sessions
    console.log('🎮 Simulating game sessions...\n');

    for (const player of players) {
        console.log(`--- ${player.name} (${player.profile} player) ---`);
        
        const sessionId = dashboard.startPlayerSession(player.id, { gameType: 'poker' });
        
        let events;
        if (player.profile === 'conservative') {
            events = [
                createPlayerEvent('bet', { amount: 50, decision_time: 3000 }),
                createPlayerEvent('call', { decision_time: 2500 })
            ];
        } else if (player.profile === 'aggressive') {
            events = [
                createPlayerEvent('bet', { amount: 300, decision_time: 1200 }),
                createPlayerEvent('raise', { amount: 500, decision_time: 1000 }),
                createPlayerEvent('bet', { amount: 400, decision_time: 800 })
            ];
        } else {
            events = [
                createPlayerEvent('bet', { amount: 1500, decision_time: 300 }),
                createPlayerEvent('all_in', { amount: 3000, decision_time: 100 }),
                createPlayerEvent('chat', { message: 'this is rigged!', sentiment: 'negative' }),
                createPlayerEvent('all_in', { amount: 2500, decision_time: 150 })
            ];
        }

        // Compute tilt and process
        const tiltResult = computeTiltScore(events);
        console.log(`Tilt computed: ${tiltResult.level} (Score: ${tiltResult.score})`);

        // Update dashboard
        dashboard.updatePlayerTilt(player.id, tiltResult, events);

        // Process alerts
        const alertResult = await alertingEngine.processTiltResult(player.id, tiltResult, player);
        console.log(`Alert triggered: ${alertResult.alertTriggered ? '✅ Yes' : '❌ No'}`);
        
        if (alertResult.alertTriggered) {
            console.log(`Adapters notified: ${alertResult.adaptersNotified}/${alertResult.totalAdapters}`);
        } else {
            console.log(`Reason: ${alertResult.reason}`);
        }

        dashboard.endPlayerSession(sessionId);
        console.log();

        // Small delay between players
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. Dashboard Summary
    console.log('📊 DASHBOARD SUMMARY');
    console.log('─'.repeat(30));
    
    const dashboardData = dashboard.getDashboardData();
    console.log(`Total Players: ${dashboardData.summary.totalPlayers}`);
    console.log(`Active Players: ${dashboardData.summary.activePlayers}`);
    console.log(`High Risk Players: ${dashboardData.summary.highRiskPlayers}`);
    
    console.log('\nTilt Level Breakdown:');
    Object.entries(dashboardData.summary.tiltLevelBreakdown).forEach(([level, count]) => {
        const emoji = level === 'Low' ? '🟢' : level === 'Medium' ? '🟡' : '🔴';
        console.log(`  ${emoji} ${level}: ${count}`);
    });

    console.log('\nPlayer Status:');
    dashboardData.players.forEach(player => {
        const emoji = player.riskLevel === 'Critical' ? '🚨' : 
                     player.riskLevel === 'High' ? '⚠️' : '✅';
        console.log(`  ${emoji} ${player.name}: ${player.currentTiltLevel} (${player.currentTiltScore}) - ${player.status}`);
    });

    // 5. Alert Statistics  
    console.log('\n🚨 ALERT STATISTICS');
    console.log('─'.repeat(30));
    
    players.forEach(player => {
        const stats = alertingEngine.getPlayerAlertStats(player.id);
        console.log(`${player.name}: ${stats.totalAlerts} alerts`);
    });

    console.log(`\nAdapter Performance:`);
    console.log(`📧 Emails sent: ${adapters.email.emailsSent.length}`);
    console.log(`🌐 Webhook calls: ${adapters.webhook.webhookCalls.length}`);

    // 6. Active Alerts
    const activeAlerts = alertingEngine.getActiveAlerts();
    console.log(`\n🔥 Active Alerts: ${Object.keys(activeAlerts).length}`);
    Object.entries(activeAlerts).forEach(([playerId, alertData]) => {
        const player = players.find(p => p.id === playerId);
        console.log(`  • ${player.name}: ${alertData.alertCount} recent alerts`);
    });

    console.log('\n🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('\nKey Features Demonstrated:');
    console.log('✅ End-to-end tilt detection flow');
    console.log('✅ Multi-adapter alerting system'); 
    console.log('✅ Real-time dashboard monitoring');
    console.log('✅ Player-specific alert configurations');
    console.log('✅ Session management');
    console.log('✅ Risk level assessment');
    console.log('✅ Alert statistics and tracking');
}

// Execute demo
runAlertingDashboardDemo().catch(console.error);