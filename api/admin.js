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
 * 🛡️ Admin API Routes
 * 
 * Administrative endpoints for system management and monitoring
 */

const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const { authenticateToken } = require('./auth');
const { getMetrics, getHealthStatus, logInfo } = require('../config/monitoring');
const { databaseHealthCheck } = require('../config/database');

// Admin authentication middleware
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }
    next();
}

/**
 * GET /api/admin/metrics
 * Get comprehensive system metrics
 */
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const metrics = getMetrics();
        
        // Add user count from data
        const usersFile = path.join(__dirname, '../data/users.json');
        if (await fs.pathExists(usersFile)) {
            const users = await fs.readJson(usersFile);
            metrics.users = {
                total: users.length,
                active: users.filter(u => u.lastLogin && 
                    new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
            };
        }
        
        logInfo('Admin accessed metrics', { admin: req.user.email });
        
        res.json(metrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({
            error: 'Failed to fetch metrics',
            message: error.message
        });
    }
});

/**
 * GET /api/admin/health
 * Get detailed health status
 */
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const appHealth = getHealthStatus();
        const dbHealth = await databaseHealthCheck();
        
        const overallStatus = 
            appHealth.status === 'healthy' && dbHealth.status === 'healthy'
                ? 'healthy'
                : 'degraded';
        
        res.json({
            status: overallStatus,
            components: {
                application: appHealth,
                database: dbHealth
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error checking health:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/users
 * Get all users (paginated)
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        
        const usersFile = path.join(__dirname, '../data/users.json');
        let users = await fs.readJson(usersFile);
        
        // Filter by search
        if (search) {
            users = users.filter(u =>
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.username.toLowerCase().includes(search.toLowerCase()) ||
                (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
            );
        }
        
        const total = users.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        
        // Remove sensitive data
        const sanitized = users.slice(start, end).map(u => ({
            id: u.id,
            email: u.email,
            username: u.username,
            displayName: u.displayName,
            role: u.role,
            profileComplete: u.profileComplete,
            nftMinted: u.nftMinted,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin
        }));
        
        res.json({
            users: sanitized,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            message: error.message
        });
    }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 */
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        if (!['user', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
                message: 'Role must be user, admin, or moderator'
            });
        }
        
        const usersFile = path.join(__dirname, '../data/users.json');
        const users = await fs.readJson(usersFile);
        
        const userIndex = users.findIndex(u => u.id === parseInt(id));
        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        users[userIndex].role = role;
        users[userIndex].updatedAt = new Date().toISOString();
        
        await fs.writeJson(usersFile, users, { spaces: 2 });
        
        logInfo('User role updated', {
            admin: req.user.email,
            targetUser: users[userIndex].email,
            newRole: role
        });
        
        res.json({
            message: 'User role updated',
            user: {
                id: users[userIndex].id,
                email: users[userIndex].email,
                role: users[userIndex].role
            }
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            error: 'Failed to update user role',
            message: error.message
        });
    }
});

/**
 * GET /api/admin/payments
 * Get all payments
 */
router.get('/payments', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const paymentsFile = path.join(__dirname, '../data/payments.json');
        
        if (!await fs.pathExists(paymentsFile)) {
            return res.json({ payments: [] });
        }
        
        const payments = await fs.readJson(paymentsFile);
        
        res.json({
            payments,
            summary: {
                total: payments.length,
                completed: payments.filter(p => p.status === 'completed').length,
                pending: payments.filter(p => p.status === 'pending').length,
                failed: payments.filter(p => p.status === 'failed').length,
                total_amount: payments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            error: 'Failed to fetch payments',
            message: error.message
        });
    }
});

/**
 * GET /api/admin/logs
 * Get system logs
 */
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const level = req.query.level || 'info';
        const date = req.query.date || new Date().toISOString().split('T')[0];
        
        const logFile = path.join(__dirname, '../logs', `${level}-${date}.log`);
        
        if (!await fs.pathExists(logFile)) {
            return res.json({ logs: [] });
        }
        
        const content = await fs.readFile(logFile, 'utf8');
        const logs = content
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return { raw: line };
                }
            })
            .reverse(); // Most recent first
        
        res.json({
            logs,
            count: logs.length,
            level,
            date
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({
            error: 'Failed to fetch logs',
            message: error.message
        });
    }
});

/**
 * POST /api/admin/broadcast
 * Broadcast message to all users (Discord/email)
 */
router.post('/broadcast', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { message, channel } = req.body;
        
        if (!message) {
            return res.status(400).json({
                error: 'Message is required'
            });
        }
        
        logInfo('Admin broadcast initiated', {
            admin: req.user.email,
            channel: channel || 'all',
            message: message.substring(0, 100)
        });
        
        // TODO: Implement actual broadcasting
        // This would send via Discord webhooks, email, etc.
        
        res.json({
            message: 'Broadcast queued',
            recipients: 'all',
            channel: channel || 'all'
        });
    } catch (error) {
        console.error('Error broadcasting:', error);
        res.status(500).json({
            error: 'Failed to broadcast',
            message: error.message
        });
    }
});

/**
 * POST /api/admin/clear-cache
 * Clear application cache
 */
router.post('/clear-cache', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Clear any in-memory caches here
        
        logInfo('Cache cleared', { admin: req.user.email });
        
        res.json({
            message: 'Cache cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({
            error: 'Failed to clear cache',
            message: error.message
        });
    }
});

/**
 * GET /api/admin/system-info
 * Get detailed system information
 */
router.get('/system-info', authenticateToken, requireAdmin, (req, res) => {
    const os = require('os');
    
    res.json({
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        total_memory: Math.floor(os.totalmem() / 1024 / 1024) + ' MB',
        free_memory: Math.floor(os.freemem() / 1024 / 1024) + ' MB',
        uptime: Math.floor(os.uptime()) + ' seconds',
        node_version: process.version,
        process_uptime: Math.floor(process.uptime()) + ' seconds',
        env: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;
