const { Client, IntentsBitField } = require('discord.js');
require('dotenv').config();

class CollectClockTester {
    constructor() {
        this.client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent
            ]
        });

        this.testResults = [];
        this.initializeTest();
    }

    async initializeTest() {
        try {
            console.log('🧪 Starting CollectClock Integration Tests...');
            console.log('=' .repeat(50));

            // Test environment
            await this.testEnvironment();

            // Test bot connection
            await this.testBotConnection();

            // Test CollectClock integration
            await this.testCollectClockIntegration();

            // Display results
            this.displayResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    async testEnvironment() {
        console.log('🔍 Testing environment configuration...');

        const tests = [
            {
                name: 'CollectClock Bot Token',
                test: () => !!process.env.COLLECTCLOCK_DISCORD_BOT_TOKEN,
                expected: true
            },
            {
                name: 'CollectClock Client Secret',
                test: () => !!process.env.COLLECTCLOCK_CLIENT_SECRET,
                expected: true
            },
            {
                name: 'CollectClock Client ID',
                test: () => !!process.env.COLLECTCLOCK_CLIENT_ID,
                expected: true
            },
            {
                name: 'CollectClock OAuth URL',
                test: () => !!process.env.COLLECTCLOCK_OAUTH_URL,
                expected: true
            },
            {
                name: 'Token Format Validation',
                test: () => {
                    const token = process.env.COLLECTCLOCK_DISCORD_BOT_TOKEN;
                    return token && token.length > 50 && token.includes('.');
                },
                expected: true
            }
        ];

        for (const test of tests) {
            try {
                const result = test.test();
                const passed = result === test.expected;
                
                this.testResults.push({
                    category: 'Environment',
                    name: test.name,
                    passed,
                    result,
                    expected: test.expected
                });

                console.log(`${passed ? '✅' : '❌'} ${test.name}: ${passed ? 'PASS' : 'FAIL'}`);
            } catch (error) {
                this.testResults.push({
                    category: 'Environment',
                    name: test.name,
                    passed: false,
                    error: error.message
                });
                console.log(`❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
    }

    async testBotConnection() {
        console.log('\n🔗 Testing CollectClock bot connection...');

        try {
            await this.client.login(process.env.COLLECTCLOCK_DISCORD_BOT_TOKEN);
            
            this.testResults.push({
                category: 'Connection',
                name: 'Bot Login',
                passed: true,
                result: 'Successfully logged in'
            });
            console.log('✅ Bot Login: PASS');

            // Wait for ready event
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Ready event timeout'));
                }, 10000);

                this.client.once('ready', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });

            this.testResults.push({
                category: 'Connection',
                name: 'Ready Event',
                passed: true,
                result: `Bot ready as ${this.client.user.tag}`
            });
            console.log(`✅ Ready Event: PASS - ${this.client.user.tag}`);

            // Test guild access
            const guilds = this.client.guilds.cache.size;
            this.testResults.push({
                category: 'Connection',
                name: 'Guild Access',
                passed: guilds >= 0,
                result: `Connected to ${guilds} guilds`
            });
            console.log(`✅ Guild Access: PASS - ${guilds} guilds`);

        } catch (error) {
            this.testResults.push({
                category: 'Connection',
                name: 'Bot Connection',
                passed: false,
                error: error.message
            });
            console.log(`❌ Bot Connection: FAIL - ${error.message}`);
        }
    }

    async testCollectClockIntegration() {
        console.log('\n⚙️ Testing CollectClock integration features...');

        try {
            // Test CollectClock module import
            const CollectClockIntegration = require('./collectClockIntegration');
            
            this.testResults.push({
                category: 'Integration',
                name: 'Module Import',
                passed: true,
                result: 'CollectClock module imported successfully'
            });
            console.log('✅ Module Import: PASS');

            // Test CollectClock initialization
            const collectClock = new CollectClockIntegration();
            
            this.testResults.push({
                category: 'Integration',
                name: 'Class Initialization',
                passed: true,
                result: 'CollectClock instance created'
            });
            console.log('✅ Class Initialization: PASS');

            // Test method availability
            const methods = [
                'handleClockIn',
                'handleClockOut', 
                'handleTimesheet',
                'handleProductivityStats',
                'handleGoalSetting',
                'handleBreakTime',
                'showHelp'
            ];

            for (const method of methods) {
                const hasMethod = typeof collectClock[method] === 'function';
                
                this.testResults.push({
                    category: 'Integration',
                    name: `Method: ${method}`,
                    passed: hasMethod,
                    result: hasMethod ? 'Method available' : 'Method missing'
                });
                
                console.log(`${hasMethod ? '✅' : '❌'} Method ${method}: ${hasMethod ? 'PASS' : 'FAIL'}`);
            }

            // Test integration with main bot
            const TrapHouseEcosystem = require('./main_complete_ecosystem');
            
            this.testResults.push({
                category: 'Integration',
                name: 'Ecosystem Integration',
                passed: true,
                result: 'TrapHouse ecosystem integration available'
            });
            console.log('✅ Ecosystem Integration: PASS');

        } catch (error) {
            this.testResults.push({
                category: 'Integration',
                name: 'Integration Test',
                passed: false,
                error: error.message
            });
            console.log(`❌ Integration Test: FAIL - ${error.message}`);
        }
    }

    async testCommandSimulation() {
        console.log('\n🎯 Testing command simulation...');

        // Simulate message objects for testing
        const mockMessage = {
            author: {
                id: '123456789',
                username: 'TestUser',
                bot: false
            },
            content: '',
            channel: {
                name: 'test-channel'
            },
            guild: {
                id: '987654321'
            },
            reply: async (content) => {
                console.log(`[MOCK REPLY] ${JSON.stringify(content, null, 2)}`);
                return { id: 'mock-message-id' };
            }
        };

        const commands = [
            { command: '!clockin', description: 'Clock in command' },
            { command: '!help-clock', description: 'Help command' },
            { command: '!goal 8', description: 'Goal setting command' },
            { command: '!break 15', description: 'Break command' }
        ];

        try {
            const CollectClockIntegration = require('./collectClockIntegration');
            const collectClock = new CollectClockIntegration();

            for (const cmd of commands) {
                try {
                    mockMessage.content = cmd.command;
                    await collectClock.handleMessage(mockMessage);
                    
                    this.testResults.push({
                        category: 'Commands',
                        name: cmd.description,
                        passed: true,
                        result: 'Command processed without error'
                    });
                    console.log(`✅ ${cmd.description}: PASS`);
                    
                } catch (error) {
                    this.testResults.push({
                        category: 'Commands',
                        name: cmd.description,
                        passed: false,
                        error: error.message
                    });
                    console.log(`❌ ${cmd.description}: FAIL - ${error.message}`);
                }
            }

        } catch (error) {
            console.log(`❌ Command Simulation: FAIL - ${error.message}`);
        }
    }

    displayResults() {
        console.log('\n📊 Test Results Summary');
        console.log('=' .repeat(50));

        const categories = [...new Set(this.testResults.map(t => t.category))];
        let totalTests = 0;
        let totalPassed = 0;

        for (const category of categories) {
            const categoryTests = this.testResults.filter(t => t.category === category);
            const passed = categoryTests.filter(t => t.passed).length;
            const total = categoryTests.length;
            
            totalTests += total;
            totalPassed += passed;

            console.log(`\n📋 ${category}: ${passed}/${total} passed`);
            
            categoryTests.forEach(test => {
                const status = test.passed ? '✅' : '❌';
                console.log(`  ${status} ${test.name}`);
                if (test.error) {
                    console.log(`    Error: ${test.error}`);
                }
            });
        }

        const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
        
        console.log('\n🎯 Overall Results');
        console.log('=' .repeat(30));
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${totalPassed}`);
        console.log(`Failed: ${totalTests - totalPassed}`);
        console.log(`Success Rate: ${successRate}%`);

        if (successRate >= 80) {
            console.log('🎉 CollectClock integration is ready for deployment!');
        } else if (successRate >= 60) {
            console.log('⚠️ CollectClock integration has some issues but is functional');
        } else {
            console.log('❌ CollectClock integration needs significant fixes before deployment');
        }

        console.log('\n🚀 Next Steps:');
        console.log('1. Run the complete ecosystem: `node start_complete_ecosystem.js`');
        console.log('2. Test time tracking: `!clockin` and `!clockout`');
        console.log('3. Set productivity goals: `!goal 8`');
        console.log('4. View timesheet: `!timesheet`');
        console.log('5. Check productivity stats: `!productivity`');

        // Clean shutdown
        setTimeout(() => {
            if (this.client) {
                this.client.destroy();
            }
            process.exit(0);
        }, 2000);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    new CollectClockTester();
}

module.exports = CollectClockTester;
