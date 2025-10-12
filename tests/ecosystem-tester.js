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

const axios = require('axios');
const WebSocket = require('ws');

class EcosystemTester {
    constructor() {
        this.testResults = [];
        this.unifiedServerUrl = 'http://localhost:3001';
        this.wsUrl = 'ws://localhost:3001';
    }

    async runCompleteTest() {
        console.log('🧪 TiltCheck Ecosystem Integration Test');
        console.log('=====================================\n');

        // Test 1: Unified Server Health
        await this.testUnifiedServerHealth();

        // Test 2: Screen Reading Extension Mock
        await this.testScreenReadingExtension();

        // Test 3: QualifyFirst Integration
        await this.testQualifyFirstIntegration();

        // Test 4: DegensAgainstDecency Integration  
        await this.testDegensAgainstDecencyIntegration();

        // Test 5: Multi-Modal Interventions
        await this.testMultiModalInterventions();

        // Test 6: Real-time WebSocket Communication
        await this.testWebSocketCommunication();

        // Test 7: Business Analytics
        await this.testBusinessAnalytics();

        this.printTestResults();
    }

    async testUnifiedServerHealth() {
        console.log('🏥 Testing Unified Server Health...');
        try {
            const response = await axios.get(`${this.unifiedServerUrl}/health`);
            this.logTest('Unified Server Health', response.status === 200, response.data);
        } catch (error) {
            this.logTest('Unified Server Health', false, error.message);
        }
    }

    async testScreenReadingExtension() {
        console.log('📺 Testing Screen Reading Extension...');
        
        // Simulate gambling detection
        const mockGamblingData = {
            platform: 'stake.com',
            betAmount: 250,
            winLossStreak: -5,
            sessionDuration: 3600000, // 1 hour
            behaviorPattern: 'rapid_betting',
            emotionalState: 'frustrated',
            screenshot: 'base64_mock_screenshot_data'
        };

        try {
            const response = await axios.post(`${this.unifiedServerUrl}/api/screen-reading/detect`, mockGamblingData);
            this.logTest('Screen Reading Detection', response.status === 200, response.data);
        } catch (error) {
            this.logTest('Screen Reading Detection', false, error.message);
        }
    }

    async testQualifyFirstIntegration() {
        console.log('📝 Testing QualifyFirst Integration...');
        
        const tiltData = {
            userId: 'test_user_123',
            tiltLevel: 8,
            recentLosses: 500,
            platform: 'bovada.lv',
            demographics: {
                age: 28,
                interests: ['sports', 'crypto'],
                location: 'US'
            }
        };

        try {
            const response = await axios.post(`${this.unifiedServerUrl}/api/integrations/qualifyfirst/intervention`, tiltData);
            this.logTest('QualifyFirst Intervention', response.status === 200, response.data);
            
            // Test earnings calculation
            const earningsResponse = await axios.post(`${this.unifiedServerUrl}/api/integrations/qualifyfirst/earnings`, {
                userId: 'test_user_123',
                potentialLoss: 500
            });
            this.logTest('QualifyFirst Earnings Calculation', earningsResponse.status === 200, earningsResponse.data);
        } catch (error) {
            this.logTest('QualifyFirst Integration', false, error.message);
        }
    }

    async testDegensAgainstDecencyIntegration() {
        console.log('🎮 Testing DegensAgainstDecency Integration...');
        
        const socialData = {
            userId: 'test_user_123',
            tiltLevel: 9,
            interventionType: 'emergency',
            discordId: 'mockuser#1234',
            socialContext: {
                friends: ['friend1', 'friend2'],
                supportLevel: 'high'
            }
        };

        try {
            const response = await axios.post(`${this.unifiedServerUrl}/api/integrations/degens/social-intervention`, socialData);
            this.logTest('Degens Social Intervention', response.status === 200, response.data);
            
            // Test accountability game creation
            const gameResponse = await axios.post(`${this.unifiedServerUrl}/api/integrations/degens/create-game`, {
                userId: 'test_user_123',
                gameType: 'accountability_challenge'
            });
            this.logTest('Degens Game Creation', gameResponse.status === 200, gameResponse.data);
        } catch (error) {
            this.logTest('DegensAgainstDecency Integration', false, error.message);
        }
    }

    async testMultiModalInterventions() {
        console.log('🎯 Testing Multi-Modal Interventions...');
        
        const multiModalData = {
            userId: 'test_user_123',
            tiltLevel: 8,
            platform: 'stake.com',
            behaviorAnalysis: {
                rapid_betting: true,
                increasing_stakes: true,
                emotional_distress: true
            },
            userPreferences: {
                survey_interventions: true,
                social_interventions: true,
                traditional_interventions: true
            }
        };

        try {
            const response = await axios.post(`${this.unifiedServerUrl}/api/multi-modal-intervention`, multiModalData);
            this.logTest('Multi-Modal Intervention Trigger', response.status === 200, response.data);
            
            // Should return interventions from all three systems
            const expectedInterventions = ['qualifyfirst', 'degens', 'traditional'];
            const hasAllInterventions = expectedInterventions.every(type => 
                response.data.interventions.some(i => i.type === type)
            );
            this.logTest('Multi-Modal Coverage', hasAllInterventions, 'All intervention types present');
        } catch (error) {
            this.logTest('Multi-Modal Interventions', false, error.message);
        }
    }

    async testWebSocketCommunication() {
        console.log('🔌 Testing WebSocket Communication...');
        
        return new Promise((resolve) => {
            const ws = new WebSocket(this.wsUrl);
            let testPassed = false;

            ws.on('open', () => {
                console.log('   ✅ WebSocket connection established');
                
                // Send mock tilt detection
                ws.send(JSON.stringify({
                    type: 'tilt_detection',
                    data: {
                        userId: 'test_user_123',
                        tiltLevel: 7,
                        platform: 'bovada.lv'
                    }
                }));
            });

            ws.on('message', (data) => {
                const message = JSON.parse(data);
                if (message.type === 'intervention_triggered') {
                    testPassed = true;
                    this.logTest('WebSocket Real-time Communication', true, message);
                }
            });

            ws.on('error', (error) => {
                this.logTest('WebSocket Communication', false, error.message);
            });

            setTimeout(() => {
                ws.close();
                if (!testPassed) {
                    this.logTest('WebSocket Communication', false, 'No intervention message received');
                }
                resolve();
            }, 3000);
        });
    }

    async testBusinessAnalytics() {
        console.log('📊 Testing Business Analytics...');
        
        try {
            // Test revenue tracking
            const revenueResponse = await axios.get(`${this.unifiedServerUrl}/api/analytics/revenue`);
            this.logTest('Revenue Analytics', revenueResponse.status === 200, revenueResponse.data);
            
            // Test user engagement metrics
            const engagementResponse = await axios.get(`${this.unifiedServerUrl}/api/analytics/engagement`);
            this.logTest('Engagement Analytics', engagementResponse.status === 200, engagementResponse.data);
            
            // Test intervention effectiveness
            const effectivenessResponse = await axios.get(`${this.unifiedServerUrl}/api/analytics/intervention-effectiveness`);
            this.logTest('Intervention Effectiveness', effectivenessResponse.status === 200, effectivenessResponse.data);
        } catch (error) {
            this.logTest('Business Analytics', false, error.message);
        }
    }

    logTest(testName, passed, details) {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`   ${status}: ${testName}`);
        if (details && typeof details === 'object') {
            console.log(`      ${JSON.stringify(details, null, 2)}`);
        } else if (details) {
            console.log(`      ${details}`);
        }
        
        this.testResults.push({ testName, passed, details });
    }

    printTestResults() {
        console.log('\n📋 TEST SUMMARY');
        console.log('================');
        
        const passedTests = this.testResults.filter(t => t.passed).length;
        const totalTests = this.testResults.length;
        
        console.log(`\n✅ Passed: ${passedTests}/${totalTests} tests`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! Your TiltCheck ecosystem is ready!');
            console.log('\n💰 Revenue Stream Validation:');
            console.log('   ✅ Screen Reading Extension: Real-time monitoring');
            console.log('   ✅ QualifyFirst Integration: Survey commission revenue');
            console.log('   ✅ DegensAgainstDecency: Social gaming monetization');
            console.log('   ✅ Multi-Modal Interventions: Enhanced user retention');
            console.log('   ✅ Real-time Communication: Instant intervention delivery');
            console.log('   ✅ Business Analytics: Data-driven optimization');
            
            console.log('\n🚀 Next Steps:');
            console.log('   1. Deploy to production servers');
            console.log('   2. Submit Chrome extension to Web Store');
            console.log('   3. Launch beta with test users');
            console.log('   4. Scale infrastructure based on usage');
            console.log('   5. Implement premium features');
        } else {
            console.log('\n⚠️  Some tests failed. Check server setup and try again.');
            
            const failedTests = this.testResults.filter(t => !t.passed);
            console.log('\n❌ Failed Tests:');
            failedTests.forEach(test => {
                console.log(`   • ${test.testName}: ${test.details}`);
            });
        }
        
        console.log('\n💡 Business Impact:');
        console.log('   🎯 Target Market: $100B+ global online gambling');
        console.log('   💵 Revenue Potential: $50M+ ARR with scale');
        console.log('   🔒 Defensive Moats: Integrated ecosystem lock-in');
        console.log('   📈 Growth Vectors: B2B white-label + B2C subscriptions');
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new EcosystemTester();
    tester.runCompleteTest().catch(console.error);
}

module.exports = EcosystemTester;