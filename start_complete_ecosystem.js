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

#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class TrapHouseEcosystemLauncher {
    constructor() {
        this.processes = new Map();
        this.isShuttingDown = false;
        
        console.log('🚀 TrapHouse Ecosystem Launcher Starting...');
        console.log('=' .repeat(60));
        this.startEcosystem();
    }

    async startEcosystem() {
        try {
            // Verify environment configuration
            this.verifyEnvironment();

            // Start all components
            await this.startWebhookServer();
            await this.startMainEcosystem();
            
            // Set up graceful shutdown
            this.setupGracefulShutdown();

            console.log('=' .repeat(60));
            console.log('🏠 TrapHouse Ecosystem is fully operational!');
            console.log('🔗 All integrations active:');
            console.log('   • Main TrapHouse Bot (Discord)');
            console.log('   • CollectClock Integration (Time Tracking)');
            console.log('   • JustTheTip Integration (Multi-chain Crypto)');
            console.log('   • Webhook Server (GitHub, Crypto, Stripe)');
            console.log('   • OAuth Authentication System');
            console.log('=' .repeat(60));

        } catch (error) {
            console.error('❌ Failed to start TrapHouse Ecosystem:', error);
            process.exit(1);
        }
    }

    verifyEnvironment() {
        console.log('🔍 Verifying environment configuration...');

        const requiredVars = [
            'DISCORD_BOT_TOKEN',
            'COLLECTCLOCK_DISCORD_BOT_TOKEN',
            'COLLECTCLOCK_CLIENT_SECRET',
            'JUSTTHETIP_CLIENT_ID',
            'justthetip_client_secret',
            'JWT_SECRET',
            'JWT_REFRESH_SECRET'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('❌ Missing required environment variables:');
            missingVars.forEach(varName => console.error(`   • ${varName}`));
            throw new Error('Environment configuration incomplete');
        }

        console.log('✅ Environment configuration verified');

        // Verify critical files exist
        const criticalFiles = [
            'main_complete_ecosystem.js',
            'webhookServer.js',
            'collectClockIntegration.js',
            'justTheTipIntegration.js',
            'paymentManager.js',
            'respectManager.js',
            'loanManager.js'
        ];

        const missingFiles = criticalFiles.filter(file => 
            !fs.existsSync(path.join(__dirname, file))
        );

        if (missingFiles.length > 0) {
            console.error('❌ Missing critical files:');
            missingFiles.forEach(file => console.error(`   • ${file}`));
            throw new Error('Critical files missing');
        }

        console.log('✅ Critical files verified');
    }

    async startWebhookServer() {
        return new Promise((resolve, reject) => {
            console.log('🌐 Starting webhook server...');

            const webhookProcess = spawn('node', ['webhookServer.js'], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env }
            });

            let serverReady = false;

            webhookProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`[WEBHOOK] ${output.trim()}`);

                if (output.includes('Webhook server listening on port 3002')) {
                    serverReady = true;
                    resolve();
                }
            });

            webhookProcess.stderr.on('data', (data) => {
                console.error(`[WEBHOOK ERROR] ${data.toString().trim()}`);
            });

            webhookProcess.on('close', (code) => {
                console.log(`❌ Webhook server exited with code ${code}`);
                if (!this.isShuttingDown) {
                    setTimeout(() => this.startWebhookServer(), 5000);
                }
            });

            webhookProcess.on('error', (error) => {
                console.error('❌ Failed to start webhook server:', error);
                reject(error);
            });

            this.processes.set('webhook', webhookProcess);

            // Timeout if server doesn't start
            setTimeout(() => {
                if (!serverReady) {
                    reject(new Error('Webhook server failed to start within timeout'));
                }
            }, 10000);
        });
    }

    async startMainEcosystem() {
        return new Promise((resolve, reject) => {
            console.log('🏠 Starting main TrapHouse ecosystem...');

            const mainProcess = spawn('node', ['main_complete_ecosystem.js'], {
                cwd: __dirname,
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env }
            });

            let mainReady = false;
            let collectClockReady = false;
            let justTheTipReady = false;

            mainProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`[MAIN] ${output.trim()}`);

                // Check for ready states
                if (output.includes('TrapHouse Bot is online!')) {
                    mainReady = true;
                }
                if (output.includes('CollectClock Bot is online!')) {
                    collectClockReady = true;
                }
                if (output.includes('JustTheTip integration is ready')) {
                    justTheTipReady = true;
                }

                // Resolve when all components are ready
                if (mainReady && collectClockReady && justTheTipReady) {
                    resolve();
                }
            });

            mainProcess.stderr.on('data', (data) => {
                console.error(`[MAIN ERROR] ${data.toString().trim()}`);
            });

            mainProcess.on('close', (code) => {
                console.log(`❌ Main ecosystem exited with code ${code}`);
                if (!this.isShuttingDown) {
                    setTimeout(() => this.startMainEcosystem(), 5000);
                }
            });

            mainProcess.on('error', (error) => {
                console.error('❌ Failed to start main ecosystem:', error);
                reject(error);
            });

            this.processes.set('main', mainProcess);

            // Timeout if ecosystem doesn't start
            setTimeout(() => {
                if (!mainReady) {
                    reject(new Error('Main ecosystem failed to start within timeout'));
                }
            }, 30000);
        });
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            if (this.isShuttingDown) return;
            this.isShuttingDown = true;

            console.log(`\n🛑 Received ${signal}. Shutting down TrapHouse Ecosystem gracefully...`);

            // Shutdown all processes
            for (const [name, process] of this.processes) {
                console.log(`🔄 Stopping ${name}...`);
                try {
                    process.kill('SIGTERM');
                    
                    // Wait for graceful shutdown
                    await new Promise((resolve) => {
                        process.on('close', resolve);
                        setTimeout(resolve, 5000); // Force kill after 5 seconds
                    });
                    
                    console.log(`✅ ${name} stopped`);
                } catch (error) {
                    console.error(`❌ Error stopping ${name}:`, error);
                    process.kill('SIGKILL'); // Force kill
                }
            }

            console.log('✅ TrapHouse Ecosystem shutdown complete');
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            shutdown('uncaughtException');
        });
    }

    // Health monitoring
    async monitorHealth() {
        setInterval(async () => {
            if (this.isShuttingDown) return;

            try {
                // Check webhook server health
                const fetch = require('node-fetch');
                const response = await fetch('http://localhost:3002/webhook/health');
                
                if (!response.ok) {
                    console.warn('⚠️ Webhook server health check failed');
                }

                // Check process health
                for (const [name, process] of this.processes) {
                    if (process.killed) {
                        console.warn(`⚠️ ${name} process is not running`);
                    }
                }

            } catch (error) {
                console.warn('⚠️ Health check failed:', error.message);
            }
        }, 60000); // Check every minute
    }

    // Status display
    displayStatus() {
        console.log('\n📊 TrapHouse Ecosystem Status:');
        console.log('=' .repeat(40));
        
        for (const [name, process] of this.processes) {
            const status = process.killed ? '🔴 Stopped' : '🟢 Running';
            console.log(`${name.padEnd(20)} ${status}`);
        }
        
        console.log('=' .repeat(40));
        console.log(`Uptime: ${Math.floor(process.uptime() / 60)}m ${Math.floor(process.uptime() % 60)}s`);
        console.log(`Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    }
}

// Start the ecosystem if this file is run directly
if (require.main === module) {
    const launcher = new TrapHouseEcosystemLauncher();
    
    // Display status every 5 minutes
    setInterval(() => launcher.displayStatus(), 5 * 60 * 1000);

    // Start health monitoring
    setTimeout(() => launcher.monitorHealth(), 60000);
}

module.exports = TrapHouseEcosystemLauncher;
