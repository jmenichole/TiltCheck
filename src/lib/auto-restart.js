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
 * TrapHouse Discord Bot Auto-Restart Manager (Node.js version)
 * Cross-platform auto-restart solution
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class AutoRestartManager {
    constructor() {
        this.botProcess = null;
        this.restartCount = 0;
        this.maxRestarts = 10;
        this.restartDelay = 3000; // 3 seconds
        this.isRunning = false;
        
        // Create logs directory
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        // Also log to file
        fs.appendFileSync('logs/auto-restart.log', logMessage + '\n');
    }

    async startBot() {
        if (this.isRunning) {
            this.log('⚠️  Bot is already running');
            return;
        }

        this.log('🤖 Starting TrapHouse Discord Bot...');
        this.isRunning = true;

        this.botProcess = spawn('node', ['index.js'], {
            stdio: ['inherit', 'pipe', 'pipe']
        });

        // Log bot output
        this.botProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                console.log(output);
                fs.appendFileSync('logs/bot-output.log', `${new Date().toISOString()} [OUT] ${output}\n`);
            }
        });

        this.botProcess.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (error) {
                console.error(error);
                fs.appendFileSync('logs/bot-errors.log', `${new Date().toISOString()} [ERR] ${error}\n`);
            }
        });

        this.botProcess.on('close', (code) => {
            this.isRunning = false;
            this.log(`🔄 Bot process exited with code ${code}`);
            
            if (code !== 0 && this.restartCount < this.maxRestarts) {
                this.restartCount++;
                this.log(`🔄 Scheduling restart #${this.restartCount}/${this.maxRestarts} in ${this.restartDelay/1000} seconds...`);
                
                setTimeout(() => {
                    this.startBot();
                }, this.restartDelay);
            } else if (this.restartCount >= this.maxRestarts) {
                this.log(`❌ Maximum restart limit (${this.maxRestarts}) reached. Stopping auto-restart.`);
                this.log('💡 Check logs for recurring errors. Use "node auto-restart.js" to restart manually.');
            } else {
                this.log('✅ Bot stopped gracefully (exit code 0)');
            }
        });

        this.botProcess.on('error', (error) => {
            this.log(`❌ Failed to start bot: ${error.message}`);
            this.isRunning = false;
        });
    }

    stopBot() {
        if (this.botProcess && !this.botProcess.killed) {
            this.log('🛑 Stopping bot...');
            this.botProcess.kill('SIGTERM');
            
            // Force kill if not stopped in 5 seconds
            setTimeout(() => {
                if (!this.botProcess.killed) {
                    this.log('🔨 Force killing bot process...');
                    this.botProcess.kill('SIGKILL');
                }
            }, 5000);
        }
    }

    watchFiles() {
        this.log('👀 Starting file watcher...');
        
        const filesToWatch = ['index.js', 'personalizedTiltProtection.js', 'enhancedSystemIntegration.js'];
        const dirsToWatch = ['commands', 'helpers', 'utils'];
        
        // Watch individual files
        filesToWatch.forEach(file => {
            if (fs.existsSync(file)) {
                fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
                    if (curr.mtime !== prev.mtime) {
                        this.log(`📝 File changed: ${file}`);
                        this.restartBot();
                    }
                });
            }
        });

        // Watch directories
        dirsToWatch.forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.watch(dir, { recursive: true }, (eventType, filename) => {
                    if (filename && filename.endsWith('.js')) {
                        this.log(`📝 File changed: ${dir}/${filename}`);
                        this.restartBot();
                    }
                });
            }
        });
    }

    restartBot() {
        this.log('🔄 Restarting bot due to file changes...');
        this.stopBot();
        
        setTimeout(() => {
            this.restartCount = 0; // Reset restart count for file-triggered restarts
            this.startBot();
        }, 2000);
    }

    showMenu() {
        console.clear();
        console.log('🤖 TrapHouse Discord Bot Auto-Restart Manager');
        console.log('='.repeat(50));
        console.log('');
        console.log('1) Start bot with auto-restart (crash recovery)');
        console.log('2) Start bot with file watching (auto-restart on changes)');
        console.log('3) Start bot normally (no auto-restart)');
        console.log('4) Install dependencies (nodemon, forever, pm2)');
        console.log('5) View recent logs');
        console.log('6) Clean logs');
        console.log('7) Exit');
        console.log('');
    }

    async installDependencies() {
        console.log('📦 Installing auto-restart dependencies...');
        
        return new Promise((resolve, reject) => {
            exec('npm install nodemon forever pm2 --save-dev', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Failed to install dependencies:', error);
                    reject(error);
                } else {
                    console.log('✅ Dependencies installed successfully!');
                    console.log(stdout);
                    resolve();
                }
            });
        });
    }

    viewLogs() {
        console.log('\n📋 Recent logs:');
        console.log('='.repeat(30));
        
        try {
            if (fs.existsSync('logs/auto-restart.log')) {
                const logs = fs.readFileSync('logs/auto-restart.log', 'utf8');
                const recentLogs = logs.split('\n').slice(-10).join('\n');
                console.log(recentLogs);
            } else {
                console.log('No logs found yet.');
            }
        } catch (error) {
            console.error('❌ Error reading logs:', error.message);
        }
        
        console.log('\n💡 Full logs available in:');
        console.log('   - logs/auto-restart.log (restart events)');
        console.log('   - logs/bot-output.log (bot output)');
        console.log('   - logs/bot-errors.log (bot errors)');
    }

    cleanLogs() {
        try {
            const logFiles = ['logs/auto-restart.log', 'logs/bot-output.log', 'logs/bot-errors.log'];
            logFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });
            console.log('✅ Logs cleaned successfully!');
        } catch (error) {
            console.error('❌ Error cleaning logs:', error.message);
        }
    }

    async run() {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = (question) => {
            return new Promise(resolve => readline.question(question, resolve));
        };

        while (true) {
            this.showMenu();
            const choice = await askQuestion('Enter your choice (1-7): ');

            switch (choice) {
                case '1':
                    console.log('🔄 Starting bot with crash recovery...');
                    this.startBot();
                    readline.close();
                    return;

                case '2':
                    console.log('👀 Starting bot with file watching...');
                    this.watchFiles();
                    this.startBot();
                    readline.close();
                    return;

                case '3':
                    console.log('▶️  Starting bot normally...');
                    exec('node index.js', (error, stdout, stderr) => {
                        if (stdout) console.log(stdout);
                        if (stderr) console.error(stderr);
                        if (error) console.error('Error:', error);
                    });
                    readline.close();
                    return;

                case '4':
                    await this.installDependencies();
                    await askQuestion('\nPress Enter to continue...');
                    break;

                case '5':
                    this.viewLogs();
                    await askQuestion('\nPress Enter to continue...');
                    break;

                case '6':
                    this.cleanLogs();
                    await askQuestion('\nPress Enter to continue...');
                    break;

                case '7':
                    console.log('👋 Goodbye!');
                    readline.close();
                    return;

                default:
                    console.log('❌ Invalid choice. Please try again.');
                    await askQuestion('Press Enter to continue...');
            }
        }
    }
}

// Handle graceful shutdown
const manager = new AutoRestartManager();

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
    manager.stopBot();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
    manager.stopBot();
    process.exit(0);
});

// Start the manager
if (require.main === module) {
    manager.run().catch(console.error);
}

module.exports = AutoRestartManager;
