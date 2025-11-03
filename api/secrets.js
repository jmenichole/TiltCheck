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
 * 🔐 Secrets Management API
 * 
 * Admin-only endpoints for managing cross-repository secrets
 * Requires authentication and admin role
 */

const express = require('express');
const { requireAuth } = require('./auth');
const secretsManager = require('../config/secrets-manager');

const router = express.Router();

/**
 * Middleware: Require admin role
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
}

/**
 * GET /api/secrets/summary
 * Get secrets summary (admin only)
 */
router.get('/summary', requireAuth, requireAdmin, (req, res) => {
    try {
        const summary = secretsManager.getSummary();
        
        res.json({
            success: true,
            data: summary
        });
        
    } catch (error) {
        console.error('Get secrets summary error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get secrets summary'
        });
    }
});

/**
 * GET /api/secrets/config/:service
 * Get service configuration (admin only)
 */
router.get('/config/:service', requireAuth, requireAdmin, (req, res) => {
    try {
        const { service } = req.params;
        
        let config;
        switch (service.toLowerCase()) {
            case 'coinbase':
                config = secretsManager.getCoinbaseConfig();
                break;
            case 'discord':
                config = secretsManager.getDiscordConfig();
                break;
            case 'solana':
                config = secretsManager.getSolanaConfig();
                break;
            case 'tipcc':
                config = secretsManager.getTipCCConfig();
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Unknown service'
                });
        }
        
        // Mask sensitive values
        const maskedConfig = {};
        Object.entries(config).forEach(([key, value]) => {
            if (value) {
                maskedConfig[key] = value.length > 10 
                    ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
                    : '***';
            } else {
                maskedConfig[key] = null;
            }
        });
        
        res.json({
            success: true,
            data: {
                service,
                config: maskedConfig,
                configured: Object.values(config).some(v => v !== null)
            }
        });
        
    } catch (error) {
        console.error('Get service config error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get service config'
        });
    }
});

/**
 * POST /api/secrets/validate
 * Validate required secrets (admin only)
 */
router.post('/validate', requireAuth, requireAdmin, (req, res) => {
    try {
        const { requiredSecrets } = req.body;
        
        if (!Array.isArray(requiredSecrets)) {
            return res.status(400).json({
                success: false,
                error: 'requiredSecrets must be an array'
            });
        }
        
        const validation = secretsManager.validate(requiredSecrets);
        
        res.json({
            success: true,
            data: validation
        });
        
    } catch (error) {
        console.error('Validate secrets error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate secrets'
        });
    }
});

/**
 * GET /api/secrets/health
 * Check secrets health and availability
 */
router.get('/health', requireAuth, (req, res) => {
    try {
        const criticalSecrets = [
            'coinbase.appId',
            'discord.clientId',
            'jwt.secret'
        ];
        
        const validation = secretsManager.validate(criticalSecrets);
        const summary = secretsManager.getSummary();
        
        res.json({
            success: true,
            data: {
                healthy: validation.valid,
                totalSecrets: summary.total,
                criticalSecretsMissing: validation.missing,
                categories: summary.categories.map(c => ({
                    name: c.name,
                    count: c.count
                }))
            }
        });
        
    } catch (error) {
        console.error('Secrets health check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check secrets health'
        });
    }
});

/**
 * POST /api/secrets/sync
 * Sync secrets from JustTheTip (admin only)
 */
router.post('/sync', requireAuth, requireAdmin, (req, res) => {
    try {
        // Reload secrets to pick up any changes
        secretsManager.loadJustTheTipSecrets();
        
        const summary = secretsManager.getSummary();
        
        res.json({
            success: true,
            message: 'Secrets synced successfully',
            data: {
                totalSecrets: summary.total
            }
        });
        
    } catch (error) {
        console.error('Sync secrets error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync secrets'
        });
    }
});

module.exports = router;
