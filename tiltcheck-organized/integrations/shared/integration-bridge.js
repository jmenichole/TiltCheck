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

// TiltCheck <-> QualifyFirst Integration Bridge
// Handles communication between TiltCheck and QualifyFirst platforms

const express = require('express');
const cors = require('cors');
const axios = require('axios');

class TiltCheckQualifyFirstBridge {
    constructor() {
        this.app = express();
        this.port = 3002;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Log all integration requests
        this.app.use((req, res, next) => {
            console.log(`[Integration Bridge] ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                services: {
                    tiltcheck: 'connected',
                    qualifyfirst: 'connected'
                },
                timestamp: new Date().toISOString()
            });
        });

        // User intervention redirect
        this.app.post('/api/intervention/redirect', async (req, res) => {
            try {
                const { userId, tiltLevel, gamblingSession } = req.body;
                
                // Generate QualifyFirst survey opportunity
                const surveyOpportunity = await this.generateSurveyOpportunity(userId, tiltLevel);
                
                res.json({
                    success: true,
                    action: 'redirect_to_surveys',
                    surveyUrl: surveyOpportunity.url,
                    estimatedEarning: surveyOpportunity.earning,
                    intervention: {
                        message: "Take a break and earn some money with quick surveys!",
                        type: 'positive_alternative'
                    }
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Revenue tracking
        this.app.post('/api/revenue/track', async (req, res) => {
            try {
                const { userId, surveyCompleted, earningAmount } = req.body;
                
                // Calculate TiltCheck revenue share (25%)
                const tiltcheckShare = earningAmount * 0.25;
                
                // Log revenue
                console.log(`[Revenue] User ${userId}: $${earningAmount} earned, $${tiltcheckShare} to TiltCheck`);
                
                // Update TiltCheck user stats
                await this.updateTiltCheckStats(userId, {
                    alternativeEarning: earningAmount,
                    interventionSuccess: true
                });

                res.json({
                    success: true,
                    userEarning: earningAmount,
                    tiltcheckRevenue: tiltcheckShare
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Integration status
        this.app.get('/api/integration/status', (req, res) => {
            res.json({
                tiltcheck: {
                    webapp: 'http://localhost:3000',
                    backend: 'http://localhost:3001',
                    extension: 'active'
                },
                qualifyfirst: {
                    platform: 'http://localhost:3001',
                    cpxResearch: 'connected',
                    surveys: 'available'
                },
                bridge: {
                    port: this.port,
                    status: 'active',
                    uptime: process.uptime()
                }
            });
        });
    }

    async generateSurveyOpportunity(userId, tiltLevel) {
        // Generate appropriate survey based on user's tilt level
        const surveys = {
            low: { earning: '$2-5', duration: '5-10 min' },
            medium: { earning: '$5-10', duration: '10-15 min' },
            high: { earning: '$10-20', duration: '15-30 min' }
        };

        const survey = surveys[tiltLevel] || surveys.medium;
        
        return {
            url: `http://localhost:3001/surveys/available?user=${userId}&priority=intervention`,
            earning: survey.earning,
            duration: survey.duration
        };
    }

    async updateTiltCheckStats(userId, stats) {
        // Update user statistics in TiltCheck
        // This would connect to TiltCheck database/API
        console.log(`[Stats Update] User ${userId}:`, stats);
        return true;
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('\n🌉 TiltCheck <-> QualifyFirst Integration Bridge');
            console.log('==============================================');
            console.log(`🚀 Running on: http://localhost:${this.port}`);
            console.log('📊 Health Check: /health');
            console.log('🔗 Integration Status: /api/integration/status');
            console.log('💰 Revenue Tracking: /api/revenue/track');
            console.log('🚨 Intervention API: /api/intervention/redirect');
            console.log('\n✅ Integration bridge active and ready!');
        });
    }
}

// Start the integration bridge
if (require.main === module) {
    const bridge = new TiltCheckQualifyFirstBridge();
    bridge.start();
}

module.exports = TiltCheckQualifyFirstBridge;
