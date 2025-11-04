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
 * 📊 Monitoring and Metrics Configuration
 * 
 * Comprehensive monitoring, logging, and alerting system
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Metrics storage
const metricsData = {
    requests: {
        total: 0,
        success: 0,
        errors: 0,
        by_endpoint: {}
    },
    auth: {
        logins: 0,
        registrations: 0,
        failed_logins: 0,
        token_refreshes: 0
    },
    payments: {
        total: 0,
        completed: 0,
        failed: 0,
        total_amount: 0
    },
    tips: {
        total: 0,
        total_amount: 0,
        tilt_detected: 0
    },
    vaults: {
        created: 0,
        unlocked: 0,
        total_locked: 0
    },
    system: {
        uptime: 0,
        memory_usage: 0,
        cpu_usage: 0,
        active_connections: 0
    }
};

// Logs directory
const logsDir = path.join(__dirname, '../logs');

/**
 * Initialize monitoring
 */
async function initializeMonitoring() {
    try {
        await fs.ensureDir(logsDir);
        console.log('📊 Monitoring initialized');
        
        // Start periodic metrics collection
        setInterval(collectSystemMetrics, 60000); // Every minute
        
        // Save metrics periodically
        setInterval(saveMetrics, 5 * 60000); // Every 5 minutes
        
    } catch (error) {
        console.error('Failed to initialize monitoring:', error.message);
    }
}

/**
 * Collect system metrics
 */
function collectSystemMetrics() {
    try {
        metricsData.system.uptime = process.uptime();
        metricsData.system.memory_usage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
        metricsData.system.cpu_usage = process.cpuUsage();
        
        // Log if memory usage is high
        if (metricsData.system.memory_usage > 500) {
            logWarning('High memory usage detected', {
                memory_mb: metricsData.system.memory_usage
            });
        }
    } catch (error) {
        console.error('Error collecting system metrics:', error.message);
    }
}

/**
 * Track request
 */
function trackRequest(req, res, startTime) {
    const duration = Date.now() - startTime;
    const endpoint = `${req.method} ${req.path}`;
    
    metricsData.requests.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
        metricsData.requests.success++;
    } else if (res.statusCode >= 400) {
        metricsData.requests.errors++;
    }
    
    // Track by endpoint
    if (!metricsData.requests.by_endpoint[endpoint]) {
        metricsData.requests.by_endpoint[endpoint] = {
            count: 0,
            total_duration: 0,
            errors: 0
        };
    }
    
    metricsData.requests.by_endpoint[endpoint].count++;
    metricsData.requests.by_endpoint[endpoint].total_duration += duration;
    
    if (res.statusCode >= 400) {
        metricsData.requests.by_endpoint[endpoint].errors++;
    }
    
    // Log slow requests
    if (duration > 5000) {
        logWarning('Slow request detected', {
            endpoint,
            duration_ms: duration,
            status: res.statusCode
        });
    }
}

/**
 * Track authentication event
 */
function trackAuth(event, success = true, details = {}) {
    switch (event) {
        case 'login':
            if (success) {
                metricsData.auth.logins++;
            } else {
                metricsData.auth.failed_logins++;
            }
            break;
        case 'register':
            metricsData.auth.registrations++;
            break;
        case 'refresh':
            metricsData.auth.token_refreshes++;
            break;
    }
    
    logInfo('Authentication event', { event, success, ...details });
}

/**
 * Track payment
 */
function trackPayment(amount, status, details = {}) {
    metricsData.payments.total++;
    
    if (status === 'completed') {
        metricsData.payments.completed++;
        metricsData.payments.total_amount += amount;
    } else if (status === 'failed') {
        metricsData.payments.failed++;
    }
    
    logInfo('Payment tracked', { amount, status, ...details });
}

/**
 * Track tip
 */
function trackTip(amount, tiltDetected = false, details = {}) {
    metricsData.tips.total++;
    metricsData.tips.total_amount += amount;
    
    if (tiltDetected) {
        metricsData.tips.tilt_detected++;
        logWarning('Tilt detected in tip', { amount, ...details });
    }
    
    logInfo('Tip tracked', { amount, tilt_detected: tiltDetected, ...details });
}

/**
 * Track vault
 */
function trackVault(event, amount = 0, details = {}) {
    if (event === 'created') {
        metricsData.vaults.created++;
        metricsData.vaults.total_locked += amount;
    } else if (event === 'unlocked') {
        metricsData.vaults.unlocked++;
    }
    
    logInfo('Vault event', { event, amount, ...details });
}

/**
 * Log info message
 */
function logInfo(message, data = {}) {
    const logEntry = {
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message,
        data
    };
    
    writeLog('info', logEntry);
}

/**
 * Log warning message
 */
function logWarning(message, data = {}) {
    const logEntry = {
        level: 'WARNING',
        timestamp: new Date().toISOString(),
        message,
        data
    };
    
    writeLog('warning', logEntry);
    
    // Send alert if configured
    sendAlert('warning', message, data);
}

/**
 * Log error message
 */
function logError(message, error = null, data = {}) {
    const logEntry = {
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        error: error ? {
            message: error.message,
            stack: error.stack
        } : null,
        data
    };
    
    writeLog('error', logEntry);
    
    // Send alert
    sendAlert('error', message, { error: error?.message, ...data });
}

/**
 * Write log to file
 */
async function writeLog(level, entry) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `${level}-${today}.log`);
        
        await fs.appendFile(logFile, JSON.stringify(entry) + '\n');
    } catch (error) {
        console.error('Failed to write log:', error.message);
    }
}

/**
 * Save metrics to file
 */
async function saveMetrics() {
    try {
        const metricsFile = path.join(logsDir, 'metrics.json');
        await fs.writeJson(metricsFile, {
            timestamp: new Date().toISOString(),
            metrics: metricsData
        }, { spaces: 2 });
    } catch (error) {
        console.error('Failed to save metrics:', error.message);
    }
}

/**
 * Get current metrics
 */
function getMetrics() {
    return {
        ...metricsData,
        system: {
            ...metricsData.system,
            hostname: os.hostname(),
            platform: os.platform(),
            node_version: process.version,
            free_memory_mb: os.freemem() / 1024 / 1024,
            total_memory_mb: os.totalmem() / 1024 / 1024,
            load_average: os.loadavg()
        }
    };
}

/**
 * Send alert (Discord webhook, email, etc.)
 */
async function sendAlert(level, message, data) {
    try {
        const webhookUrl = process.env.DISCORD_ALERT_WEBHOOK;
        
        if (!webhookUrl) return;
        
        const axios = require('axios');
        
        const color = level === 'error' ? 15158332 : 16776960; // Red or yellow
        
        await axios.post(webhookUrl, {
            embeds: [{
                title: `🚨 ${level.toUpperCase()} Alert`,
                description: message,
                color,
                fields: Object.entries(data).map(([key, value]) => ({
                    name: key,
                    value: String(value),
                    inline: true
                })),
                timestamp: new Date().toISOString()
            }]
        });
    } catch (error) {
        console.error('Failed to send alert:', error.message);
    }
}

/**
 * Monitoring middleware
 */
function monitoringMiddleware(req, res, next) {
    const startTime = Date.now();
    
    // Track when response finishes
    res.on('finish', () => {
        trackRequest(req, res, startTime);
    });
    
    next();
}

/**
 * Get health status
 */
function getHealthStatus() {
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const uptime = process.uptime();
    
    const isHealthy = 
        memUsage < 1000 && // Less than 1GB
        metricsData.requests.errors / Math.max(metricsData.requests.total, 1) < 0.1; // Less than 10% errors
    
    return {
        status: isHealthy ? 'healthy' : 'degraded',
        uptime_seconds: uptime,
        memory_usage_mb: memUsage,
        total_requests: metricsData.requests.total,
        error_rate: metricsData.requests.errors / Math.max(metricsData.requests.total, 1),
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    initializeMonitoring,
    trackRequest,
    trackAuth,
    trackPayment,
    trackTip,
    trackVault,
    logInfo,
    logWarning,
    logError,
    getMetrics,
    getHealthStatus,
    monitoringMiddleware
};
