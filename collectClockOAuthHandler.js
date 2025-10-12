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

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

class CollectClockOAuthHandler {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Enable CORS for GitHub Pages
        this.app.use(cors({
            origin: [
                'https://jmenichole.github.io',
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002'
            ],
            credentials: true
        }));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        // CollectClock OAuth callback endpoint
        this.app.get('/auth/collectclock/callback', async (req, res) => {
            try {
                const { code, state } = req.query;

                if (!code) {
                    return res.status(400).json({ 
                        error: 'Missing authorization code',
                        redirect: 'https://jmenichole.github.io/CollectClock/?error=missing_code'
                    });
                }

                // Exchange code for access token
                const tokenData = await this.exchangeCodeForToken(code);

                if (!tokenData.access_token) {
                    return res.status(400).json({ 
                        error: 'Failed to obtain access token',
                        redirect: 'https://jmenichole.github.io/CollectClock/?error=token_exchange_failed'
                    });
                }

                // Get user information
                const userInfo = await this.getUserInfo(tokenData.access_token);

                // Store user session/data
                await this.storeUserSession(userInfo, tokenData);

                // Redirect back to CollectClock with success
                const redirectUrl = `https://jmenichole.github.io/CollectClock/?success=true&user=${encodeURIComponent(userInfo.username)}&id=${userInfo.id}`;
                
                res.redirect(redirectUrl);

            } catch (error) {
                console.error('CollectClock OAuth callback error:', error);
                res.redirect(`https://jmenichole.github.io/CollectClock/?error=oauth_failed&message=${encodeURIComponent(error.message)}`);
            }
        });

        // CollectClock webhook endpoint for time tracking events
        this.app.post('/webhook/collectclock', async (req, res) => {
            try {
                const { event, data } = req.body;

                console.log('CollectClock webhook received:', { event, data });

                // Process different event types
                switch (event) {
                    case 'clock_in':
                        await this.handleClockInEvent(data);
                        break;
                    case 'clock_out':
                        await this.handleClockOutEvent(data);
                        break;
                    case 'productivity_goal_met':
                        await this.handleGoalMetEvent(data);
                        break;
                    case 'timesheet_summary':
                        await this.handleTimesheetSummary(data);
                        break;
                    default:
                        console.log('Unknown CollectClock event:', event);
                }

                res.status(200).json({ status: 'success', event, processed: true });

            } catch (error) {
                console.error('CollectClock webhook error:', error);
                res.status(500).json({ error: 'Webhook processing failed' });
            }
        });

        // Health check endpoint
        this.app.get('/auth/collectclock/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                service: 'CollectClock OAuth Handler',
                timestamp: new Date().toISOString()
            });
        });

        // CORS preflight handler
        this.app.options('*', cors());
    }

    async exchangeCodeForToken(code) {
        try {
            const response = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
                client_id: process.env.COLLECTCLOCK_CLIENT_ID,
                client_secret: process.env.COLLECTCLOCK_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: `${process.env.BASE_URL || 'http://localhost:3002'}/auth/collectclock/callback`
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Token exchange error:', error.response?.data || error.message);
            throw new Error('Failed to exchange authorization code for token');
        }
    }

    async getUserInfo(accessToken) {
        try {
            const response = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('User info error:', error.response?.data || error.message);
            throw new Error('Failed to get user information');
        }
    }

    async storeUserSession(userInfo, tokenData) {
        try {
            // Store user session data (integrate with your existing storage system)
            const sessionData = {
                userId: userInfo.id,
                username: userInfo.username,
                discriminator: userInfo.discriminator,
                avatar: userInfo.avatar,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: Date.now() + (tokenData.expires_in * 1000),
                createdAt: new Date().toISOString(),
                service: 'collectclock'
            };

            // TODO: Integrate with your storage system
            console.log('Storing CollectClock user session:', sessionData);

            return sessionData;
        } catch (error) {
            console.error('Error storing user session:', error);
            throw error;
        }
    }

    async handleClockInEvent(data) {
        try {
            console.log('Processing clock-in event:', data);
            
            // Award respect points for clocking in (integrate with TrapHouse respect system)
            // TODO: Call your respect manager to award points
            
            // Notify Discord channel if configured
            // TODO: Send Discord notification about clock-in
            
        } catch (error) {
            console.error('Clock-in event error:', error);
        }
    }

    async handleClockOutEvent(data) {
        try {
            console.log('Processing clock-out event:', data);
            
            // Calculate work duration and award respect based on hours worked
            const hoursWorked = data.duration ? data.duration / (1000 * 60 * 60) : 0;
            
            // Award respect points (integrate with TrapHouse respect system)
            // TODO: Call your respect manager to award points based on hours
            
            // Send productivity summary to Discord
            // TODO: Send Discord notification with work summary
            
        } catch (error) {
            console.error('Clock-out event error:', error);
        }
    }

    async handleGoalMetEvent(data) {
        try {
            console.log('Processing goal met event:', data);
            
            // Award bonus respect for meeting productivity goals
            // TODO: Call your respect manager to award bonus points
            
            // Send congratulations message
            // TODO: Send Discord notification celebrating goal achievement
            
        } catch (error) {
            console.error('Goal met event error:', error);
        }
    }

    async handleTimesheetSummary(data) {
        try {
            console.log('Processing timesheet summary:', data);
            
            // Process weekly/monthly timesheet data
            // TODO: Store timesheet data and generate reports
            
        } catch (error) {
            console.error('Timesheet summary error:', error);
        }
    }

    start(port = 3003) {
        this.app.listen(port, () => {
            console.log(`🕒 CollectClock OAuth Handler listening on port ${port}`);
            console.log(`📋 OAuth Callback: http://localhost:${port}/auth/collectclock/callback`);
            console.log(`🔗 Webhook URL: http://localhost:${port}/webhook/collectclock`);
            console.log(`🌐 GitHub Pages Integration: https://jmenichole.github.io/CollectClock/`);
        });
    }
}

module.exports = CollectClockOAuthHandler;

// Start the OAuth handler if this file is run directly
if (require.main === module) {
    const handler = new CollectClockOAuthHandler();
    handler.start();
}
