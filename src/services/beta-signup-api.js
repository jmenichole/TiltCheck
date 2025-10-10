const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * TiltCheck Beta Signup API
 * Handles waitlist signups and email notifications
 */

class BetaSignupManager {
    constructor() {
        this.dataFile = path.join(__dirname, 'beta-signups.json');
        this.emailTemplate = path.join(__dirname, 'email-templates');
        this.ensureDataFile();
    }

    async ensureDataFile() {
        try {
            await fs.access(this.dataFile);
        } catch (error) {
            // File doesn't exist, create it
            await this.saveData({ signups: [], stats: { total: 0, lastUpdated: new Date().toISOString() } });
        }
    }

    async loadData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading beta signup data:', error);
            return { signups: [], stats: { total: 0, lastUpdated: new Date().toISOString() } };
        }
    }

    async saveData(data) {
        try {
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving beta signup data:', error);
            return false;
        }
    }

    generateId() {
        return crypto.randomBytes(16).toString('hex');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async addSignup(signupData) {
        const data = await this.loadData();
        
        // Validate required fields
        if (!signupData.email || !signupData.name) {
            throw new Error('Email and name are required');
        }

        if (!this.validateEmail(signupData.email)) {
            throw new Error('Invalid email format');
        }

        // Check for existing signup
        const existingSignup = data.signups.find(signup => 
            signup.email.toLowerCase() === signupData.email.toLowerCase()
        );

        if (existingSignup) {
            throw new Error('Email already registered for beta');
        }

        // Create signup record
        const signup = {
            id: this.generateId(),
            email: signupData.email.toLowerCase().trim(),
            name: signupData.name.trim(),
            company: signupData.company ? signupData.company.trim() : null,
            role: signupData.role || null,
            useCase: signupData.useCase || null,
            updates: signupData.updates === 'on' || signupData.updates === true,
            signupDate: new Date().toISOString(),
            status: 'pending',
            notified: false,
            source: 'beta-signup-page'
        };

        // Add to signups
        data.signups.push(signup);
        data.stats.total = data.signups.length;
        data.stats.lastUpdated = new Date().toISOString();

        // Save data
        const saved = await this.saveData(data);
        if (!saved) {
            throw new Error('Failed to save signup data');
        }

        // Send confirmation email (if email service is configured)
        await this.sendConfirmationEmail(signup);

        return signup;
    }

    async sendConfirmationEmail(signup) {
        // This is a placeholder for email functionality
        // In production, you'd integrate with SendGrid, Mailgun, etc.
        console.log(`📧 Beta signup confirmation for: ${signup.email}`);
        console.log(`Name: ${signup.name}`);
        console.log(`Company: ${signup.company || 'N/A'}`);
        console.log(`Role: ${signup.role || 'N/A'}`);
        console.log(`Use Case: ${signup.useCase || 'N/A'}`);
        
        // Example email integration (uncomment and configure for production):
        /*
        const emailService = require('./email-service');
        await emailService.send({
            to: signup.email,
            subject: 'Welcome to TiltCheck Beta Waitlist! 🚀',
            template: 'beta-confirmation',
            data: {
                name: signup.name,
                signupId: signup.id,
                estimatedLaunch: 'Q1 2025'
            }
        });
        */
    }

    async getSignups() {
        const data = await this.loadData();
        return data.signups;
    }

    async getStats() {
        const data = await this.loadData();
        
        const stats = {
            total: data.signups.length,
            pending: data.signups.filter(s => s.status === 'pending').length,
            notified: data.signups.filter(s => s.notified === true).length,
            byRole: {},
            byUseCase: {},
            recentSignups: data.signups
                .sort((a, b) => new Date(b.signupDate) - new Date(a.signupDate))
                .slice(0, 10)
        };

        // Count by role
        data.signups.forEach(signup => {
            const role = signup.role || 'unknown';
            stats.byRole[role] = (stats.byRole[role] || 0) + 1;
        });

        // Count by use case
        data.signups.forEach(signup => {
            const useCase = signup.useCase || 'unknown';
            stats.byUseCase[useCase] = (stats.byUseCase[useCase] || 0) + 1;
        });

        return stats;
    }

    async notifyAllBetaTesters(message) {
        const data = await this.loadData();
        const pendingSignups = data.signups.filter(s => s.status === 'pending' && !s.notified);
        
        console.log(`📢 Notifying ${pendingSignups.length} beta testers...`);
        
        for (const signup of pendingSignups) {
            await this.sendBetaReadyEmail(signup, message);
            signup.notified = true;
            signup.status = 'invited';
        }
        
        await this.saveData(data);
        return pendingSignups.length;
    }

    async sendBetaReadyEmail(signup, customMessage) {
        console.log(`🚀 Beta ready notification for: ${signup.email}`);
        console.log(`Message: ${customMessage}`);
        
        // In production, send actual email:
        /*
        const emailService = require('./email-service');
        await emailService.send({
            to: signup.email,
            subject: '🎉 TiltCheck Beta is Ready! Your Access is Live',
            template: 'beta-ready',
            data: {
                name: signup.name,
                accessLink: `https://tiltcheck.it.com/beta-access?token=${signup.id}`,
                message: customMessage,
                supportEmail: 'support@tiltcheck.io'
            }
        });
        */
    }
}

// API Routes
function createBetaSignupRouter() {
    const router = express.Router();
    const betaManager = new BetaSignupManager();

    // Handle beta signup
    router.post('/beta-signup', async (req, res) => {
        try {
            const signup = await betaManager.addSignup(req.body);
            
            res.json({
                success: true,
                message: 'Successfully joined beta waitlist!',
                signupId: signup.id
            });
            
        } catch (error) {
            console.error('Beta signup error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    });

    // Get beta stats (admin only)
    router.get('/beta-stats', async (req, res) => {
        try {
            // In production, add authentication check here
            const stats = await betaManager.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Error getting beta stats:', error);
            res.status(500).json({ error: 'Failed to get stats' });
        }
    });

    // Notify all beta testers (admin only)
    router.post('/notify-beta-testers', async (req, res) => {
        try {
            // In production, add authentication check here
            const { message } = req.body;
            const notifiedCount = await betaManager.notifyAllBetaTesters(message || 'TiltCheck Beta is now live!');
            
            res.json({
                success: true,
                notified: notifiedCount,
                message: `Notified ${notifiedCount} beta testers`
            });
        } catch (error) {
            console.error('Error notifying beta testers:', error);
            res.status(500).json({ error: 'Failed to notify beta testers' });
        }
    });

    return router;
}

module.exports = {
    BetaSignupManager,
    createBetaSignupRouter
};