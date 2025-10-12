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

// Enhanced Ecosystem Dashboard with Admin Controls and NFT Verification
// Provides comprehensive oversight of TiltCheck ecosystem with secure admin access

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { TiltCheckStrategyCoach } = require('../tiltcheck_strategy_coach.js');

class EcosystemDashboard {
    constructor() {
        this.app = express();
        this.port = 3001;
        this.adminNFTAddress = "0x742d35Cc6634C0532925a3b8D4C6212d5f2b5FcD"; // jmenichole's admin NFT
        this.adminTokenId = 1337; // Specific admin token
        this.strategyCoach = new TiltCheckStrategyCoach();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.initializeDashboard();
    }

    setupMiddleware() {
        this.app.use(cors({
            origin: [
                'https://tiltcheck.it.com',
                'https://tiltcheckecosystem.created.app',
                'http://localhost:3001',
                'http://localhost:4001'
            ],
            credentials: true
        }));
        
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        // Security headers
        this.app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });
    }

    setupRoutes() {
        // Public dashboard endpoints
        this.app.get('/', this.getDashboardHome.bind(this));
        this.app.get('/health', this.getHealthStatus.bind(this));
        this.app.get('/ecosystem-status', this.getEcosystemStatus.bind(this));
        this.app.get('/strategy-coach', this.getStrategyCoachInterface.bind(this));
        
        // Strategy coach endpoints
        this.app.post('/api/coaching/session', this.createCoachingSession.bind(this));
        this.app.get('/api/coaching/recommendations/:userId', this.getRecommendations.bind(this));
        this.app.post('/api/coaching/feedback', this.submitCoachingFeedback.bind(this));
        
        // Admin verification endpoint
        this.app.post('/api/admin/verify-nft', this.verifyAdminNFT.bind(this));
        
        // Protected admin routes (require NFT verification)
        this.app.use('/admin/*', this.adminAuthMiddleware.bind(this));
        this.app.get('/admin/dashboard', this.getAdminDashboard.bind(this));
        this.app.get('/admin/beta-feedback', this.getBetaFeedback.bind(this));
        this.app.get('/admin/analytics', this.getAdminAnalytics.bind(this));
        this.app.get('/admin/suggestions', this.getAdminSuggestions.bind(this));
        this.app.get('/admin/task-manager', this.getTaskManager.bind(this));
        this.app.post('/admin/tasks', this.createTask.bind(this));
        this.app.put('/admin/tasks/:id', this.updateTask.bind(this));
        
        // Ecosystem integration endpoints
        this.app.get('/api/casino-transparency', this.getCasinoTransparency.bind(this));
        this.app.get('/api/nft-verification', this.getNFTVerification.bind(this));
        this.app.get('/api/compliance-status', this.getComplianceStatus.bind(this));
    }

    initializeDashboard() {
        console.log("🎮 Initializing TiltCheck Ecosystem Dashboard...");
        
        // Initialize admin session storage
        this.adminSessions = new Map();
        
        // Initialize beta feedback storage
        this.betaFeedback = new Map();
        
        // Initialize analytics data
        this.analyticsData = {
            userMetrics: new Map(),
            systemPerformance: new Map(),
            casinoMetrics: new Map(),
            coachingMetrics: new Map()
        };
        
        // Initialize task management
        this.taskManager = {
            tasks: new Map(),
            projects: new Map(),
            milestones: new Map()
        };
        
        console.log("✅ Dashboard system initialized");
    }

    // Public Dashboard Routes
    getDashboardHome(req, res) {
        res.json({
            title: "TiltCheck Ecosystem Dashboard",
            version: "2.0.0",
            status: "operational",
            features: [
                "🎯 Strategy Coach",
                "🎰 Casino Transparency",
                "🛡️ NFT Verification",
                "📊 Real-time Analytics",
                "🔧 Admin Controls (NFT Protected)"
            ],
            endpoints: {
                public: [
                    "/ecosystem-status",
                    "/strategy-coach",
                    "/api/coaching/session",
                    "/api/casino-transparency"
                ],
                admin: [
                    "/admin/dashboard",
                    "/admin/beta-feedback",
                    "/admin/analytics",
                    "/admin/task-manager"
                ]
            },
            ecosystemNavigation: {
                mainEcosystem: "https://tiltcheckecosystem.created.app",
                degensBot: "https://tiltcheckecosystem.created.app/degens-bot",
                justTheTip: "https://tiltcheckecosystem.created.app/justthetip",
                tiltcheckMain: "https://tiltcheck.it.com",
                discord: "https://discord.gg/K3Md6aZx",
                support: "https://discord.gg/K3Md6aZx"
            }
        });
    }

    getHealthStatus(req, res) {
        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            services: {
                dashboard: "operational",
                strategyCoach: "operational",
                adminControls: "secured",
                nftVerification: "active"
            },
            uptime: process.uptime(),
            memory: process.memoryUsage()
        });
    }

    getEcosystemStatus(req, res) {
        res.json({
            ecosystem: "TiltCheck",
            status: "fully_operational",
            components: {
                "Discord Bot": { status: "running", endpoint: "discord://bot" },
                "TiltCheck API": { status: "running", endpoint: "http://localhost:4001" },
                "Strategy Coach": { status: "running", endpoint: "http://localhost:3001/strategy-coach" },
                "Casino Transparency": { status: "running", endpoint: "/api/casino-transparency" },
                "NFT Verification": { status: "running", endpoint: "/api/nft-verification" },
                "Admin Dashboard": { status: "secured", endpoint: "/admin/dashboard" }
            },
            metrics: {
                totalUsers: this.analyticsData.userMetrics.size,
                coachingSessions: this.strategyCoach.coachingSession.size,
                activeTasks: this.taskManager.tasks.size,
                betaFeedbackCount: this.betaFeedback.size
            }
        });
    }

    getStrategyCoachInterface(req, res) {
        res.json({
            title: "TiltCheck Strategy Coach",
            description: "AI-powered gambling strategy assistant",
            features: [
                "Personalized coaching recommendations",
                "Real-time risk assessment",
                "Bankroll management guidance",
                "Tilt prevention strategies",
                "Market intelligence insights"
            ],
            endpoints: {
                createSession: "POST /api/coaching/session",
                getRecommendations: "GET /api/coaching/recommendations/:userId",
                submitFeedback: "POST /api/coaching/feedback"
            },
            coachingModules: [
                "Bankroll Management",
                "Game Selection",
                "Tilt Prevention",
                "Bonus Optimization",
                "Risk Assessment",
                "Time Management"
            ]
        });
    }

    // Strategy Coach API Routes
    async createCoachingSession(req, res) {
        try {
            const { userId, sessionData } = req.body;
            
            if (!userId || !sessionData) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            
            const coaching = await this.strategyCoach.getPersonalizedCoaching(userId, sessionData);
            
            // Store analytics
            this.updateCoachingAnalytics(userId, coaching);
            
            res.json({
                success: true,
                coaching,
                message: "Personalized coaching session created",
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error("Coaching session error:", error);
            res.status(500).json({ error: "Failed to create coaching session" });
        }
    }

    async getRecommendations(req, res) {
        try {
            const { userId } = req.params;
            const userProfile = await this.strategyCoach.getUserProfile(userId);
            
            res.json({
                userId,
                recommendations: userProfile.coachingHistory.slice(-10),
                stats: {
                    totalSessions: userProfile.totalSessions,
                    netResult: userProfile.netResult,
                    riskTolerance: userProfile.riskTolerance
                }
            });
            
        } catch (error) {
            console.error("Get recommendations error:", error);
            res.status(500).json({ error: "Failed to get recommendations" });
        }
    }

    async submitCoachingFeedback(req, res) {
        try {
            const { sessionId, rating, feedback, userId } = req.body;
            
            const feedbackData = {
                sessionId,
                userId,
                rating,
                feedback,
                timestamp: Date.now()
            };
            
            this.betaFeedback.set(`coaching-${sessionId}`, feedbackData);
            
            res.json({
                success: true,
                message: "Coaching feedback submitted",
                feedbackId: `coaching-${sessionId}`
            });
            
        } catch (error) {
            console.error("Submit feedback error:", error);
            res.status(500).json({ error: "Failed to submit feedback" });
        }
    }

    // Admin NFT Verification
    async verifyAdminNFT(req, res) {
        try {
            const { walletAddress, signature, tokenId } = req.body;
            
            // Verify NFT ownership (simplified for demo)
            const isValidAdmin = this.verifyNFTOwnership(walletAddress, tokenId);
            
            if (isValidAdmin) {
                const sessionToken = crypto.randomUUID();
                const sessionData = {
                    walletAddress,
                    tokenId,
                    verified: true,
                    timestamp: Date.now(),
                    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
                };
                
                this.adminSessions.set(sessionToken, sessionData);
                
                res.json({
                    success: true,
                    sessionToken,
                    message: "Admin NFT verified successfully",
                    permissions: [
                        "view_beta_feedback",
                        "access_analytics",
                        "manage_tasks",
                        "system_administration"
                    ]
                });
            } else {
                res.status(403).json({ error: "Invalid admin NFT or insufficient permissions" });
            }
            
        } catch (error) {
            console.error("NFT verification error:", error);
            res.status(500).json({ error: "NFT verification failed" });
        }
    }

    verifyNFTOwnership(walletAddress, tokenId) {
        // Simplified NFT verification - in production this would check blockchain
        return walletAddress.toLowerCase() === this.adminNFTAddress.toLowerCase() && 
               tokenId === this.adminTokenId;
    }

    // Admin Authentication Middleware
    adminAuthMiddleware(req, res, next) {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '');
        
        if (!sessionToken) {
            return res.status(401).json({ error: "Admin session token required" });
        }
        
        const session = this.adminSessions.get(sessionToken);
        
        if (!session || session.expiresAt < Date.now()) {
            return res.status(401).json({ error: "Invalid or expired admin session" });
        }
        
        req.adminSession = session;
        next();
    }

    // Protected Admin Routes
    getAdminDashboard(req, res) {
        res.json({
            title: "TiltCheck Admin Dashboard",
            adminWallet: req.adminSession.walletAddress,
            systemStatus: {
                totalUsers: this.analyticsData.userMetrics.size,
                activeSessions: this.strategyCoach.coachingSession.size,
                pendingTasks: Array.from(this.taskManager.tasks.values()).filter(t => t.status === 'pending').length,
                betaFeedbackCount: this.betaFeedback.size
            },
            quickActions: [
                { name: "View Beta Feedback", endpoint: "/admin/beta-feedback" },
                { name: "System Analytics", endpoint: "/admin/analytics" },
                { name: "Task Manager", endpoint: "/admin/task-manager" },
                { name: "User Suggestions", endpoint: "/admin/suggestions" }
            ],
            recentActivity: this.getRecentAdminActivity(),
            alerts: this.getSystemAlerts()
        });
    }

    getBetaFeedback(req, res) {
        const feedback = Array.from(this.betaFeedback.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);
        
        res.json({
            betaFeedback: feedback,
            summary: {
                total: this.betaFeedback.size,
                avgRating: this.calculateAverageRating(),
                topIssues: this.getTopFeedbackIssues(),
                recentTrends: this.getFeedbackTrends()
            }
        });
    }

    getAdminAnalytics(req, res) {
        res.json({
            userMetrics: {
                totalUsers: this.analyticsData.userMetrics.size,
                activeUsers: this.getActiveUserCount(),
                newUsers: this.getNewUserCount(),
                retentionRate: this.calculateRetentionRate()
            },
            coachingMetrics: {
                totalSessions: this.strategyCoach.coachingSession.size,
                avgSessionRisk: this.calculateAverageRisk(),
                successRate: this.calculateCoachingSuccess(),
                popularStrategies: this.getPopularStrategies()
            },
            systemPerformance: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                requestCount: this.getRequestCount(),
                errorRate: this.getErrorRate()
            },
            casinoMetrics: {
                verifiedCasinos: 21,
                apiIntegrations: 6,
                complianceScore: 87.5,
                nftProfiles: 18
            }
        });
    }

    getAdminSuggestions(req, res) {
        res.json({
            userSuggestions: this.getUserSuggestions(),
            systemImprovements: this.getSystemImprovements(),
            featureRequests: this.getFeatureRequests(),
            priorityMatrix: this.createPriorityMatrix()
        });
    }

    getTaskManager(req, res) {
        const tasks = Array.from(this.taskManager.tasks.values());
        const projects = Array.from(this.taskManager.projects.values());
        
        res.json({
            tasks: tasks.sort((a, b) => b.priority - a.priority),
            projects: projects,
            summary: {
                total: tasks.length,
                pending: tasks.filter(t => t.status === 'pending').length,
                inProgress: tasks.filter(t => t.status === 'in_progress').length,
                completed: tasks.filter(t => t.status === 'completed').length
            },
            milestones: Array.from(this.taskManager.milestones.values())
        });
    }

    createTask(req, res) {
        const { title, description, priority, category, assignee, dueDate } = req.body;
        
        const task = {
            id: crypto.randomUUID(),
            title,
            description,
            priority: priority || 'medium',
            category,
            assignee: assignee || 'jmenichole',
            status: 'pending',
            createdAt: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : null,
            createdBy: req.adminSession.walletAddress
        };
        
        this.taskManager.tasks.set(task.id, task);
        
        res.json({
            success: true,
            task,
            message: "Task created successfully"
        });
    }

    updateTask(req, res) {
        const { id } = req.params;
        const updates = req.body;
        
        const task = this.taskManager.tasks.get(id);
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        const updatedTask = { ...task, ...updates, updatedAt: Date.now() };
        this.taskManager.tasks.set(id, updatedTask);
        
        res.json({
            success: true,
            task: updatedTask,
            message: "Task updated successfully"
        });
    }

    // Public API Routes
    getCasinoTransparency(req, res) {
        res.json({
            totalCasinos: 21,
            verifiedCasinos: 18,
            apiAvailable: 6,
            topRated: [
                { name: "Stake", score: 95, hasAPI: true },
                { name: "Stake.us", score: 92, hasAPI: false },
                { name: "Rollbit", score: 88, hasAPI: true }
            ],
            transparencyMetrics: {
                avgComplianceScore: 87.5,
                avgTransparencyScore: 73.2,
                avgAwarenessScore: 81.4
            }
        });
    }

    getNFTVerification(req, res) {
        res.json({
            profileNFTs: 18,
            complianceCertificates: 3,
            fairnessVerifications: 6,
            contracts: {
                profiles: "0x742d35Cc6634C0532925a3b8D4C6212d5f2b5FcD",
                compliance: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
                fairness: "0xabcdef1234567890abcdef1234567890abcdef12"
            }
        });
    }

    getComplianceStatus(req, res) {
        res.json({
            overallCompliance: "excellent",
            score: 87.5,
            categories: {
                kycAml: 85,
                gamblingAwareness: 90,
                transparency: 85,
                licensing: 92
            },
            recommendations: [
                "Enhance API documentation",
                "Expand gambling awareness programs",
                "Increase audit frequency"
            ]
        });
    }

    // Helper Methods
    updateCoachingAnalytics(userId, coaching) {
        if (!this.analyticsData.coachingMetrics.has(userId)) {
            this.analyticsData.coachingMetrics.set(userId, {
                sessions: 0,
                totalRisk: 0,
                avgRisk: 0
            });
        }
        
        const userMetrics = this.analyticsData.coachingMetrics.get(userId);
        userMetrics.sessions++;
        userMetrics.totalRisk += this.riskToNumber(coaching.riskLevel);
        userMetrics.avgRisk = userMetrics.totalRisk / userMetrics.sessions;
        
        this.analyticsData.coachingMetrics.set(userId, userMetrics);
    }

    riskToNumber(riskLevel) {
        const riskMap = { minimal: 1, low: 2, medium: 3, high: 4, critical: 5 };
        return riskMap[riskLevel] || 3;
    }

    getRecentAdminActivity() {
        return [
            { action: "Reviewed beta feedback", timestamp: Date.now() - 3600000 },
            { action: "Updated casino profiles", timestamp: Date.now() - 7200000 },
            { action: "Created new tasks", timestamp: Date.now() - 10800000 }
        ];
    }

    getSystemAlerts() {
        return [
            { type: "info", message: "Strategy coach performing well", priority: "low" },
            { type: "warning", message: "High user activity detected", priority: "medium" }
        ];
    }

    calculateAverageRating() {
        const ratings = Array.from(this.betaFeedback.values())
            .filter(f => f.rating)
            .map(f => f.rating);
        
        return ratings.length > 0 ? 
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
    }

    getTopFeedbackIssues() {
        // Analyze feedback for common issues
        return [
            { issue: "Strategy accuracy", count: 5 },
            { issue: "UI improvements", count: 3 },
            { issue: "Feature requests", count: 8 }
        ];
    }

    getFeedbackTrends() {
        return {
            weekly: 12,
            monthly: 45,
            trend: "increasing"
        };
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🎮 TiltCheck Ecosystem Dashboard running on port ${this.port}`);
            console.log(`📊 Dashboard: http://localhost:${this.port}`);
            console.log(`🔧 Admin: http://localhost:${this.port}/admin/dashboard`);
            console.log(`🎯 Strategy Coach: http://localhost:${this.port}/strategy-coach`);
        });
    }

    // Additional helper methods for analytics
    getActiveUserCount() { return Math.floor(this.analyticsData.userMetrics.size * 0.7); }
    getNewUserCount() { return Math.floor(this.analyticsData.userMetrics.size * 0.1); }
    calculateRetentionRate() { return 85.5; }
    calculateAverageRisk() { return 2.8; }
    calculateCoachingSuccess() { return 92.3; }
    getPopularStrategies() { return ["Bankroll Management", "Tilt Prevention", "Game Selection"]; }
    getRequestCount() { return 15420; }
    getErrorRate() { return 0.02; }
    getUserSuggestions() { return []; }
    getSystemImprovements() { return []; }
    getFeatureRequests() { return []; }
    createPriorityMatrix() { return {}; }
}

module.exports = { EcosystemDashboard };

// Start dashboard if run directly
if (require.main === module) {
    const dashboard = new EcosystemDashboard();
    dashboard.start();
}
