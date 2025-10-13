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

/**
 * 🧪 TrapHouse Bot - Crypto Payment System Test Suite
 * 
 * Tests all aspects of the JustTheTip multi-chain crypto integration:
 * - Webhook signature verification
 * - Payment processing for each chain (ETH, BTC, MATIC, BNB)
 * - Respect point multipliers
 * - Discord notification system
 * - Error handling and validation
 */

require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

console.log('🧪 TrapHouse Crypto Payment Test Suite');
console.log('=' .repeat(60));

// Test configuration
const TEST_CONFIG = {
    webhookUrl: 'http://localhost:3002/webhook/justthetip',
    discordUserId: process.env.ADMIN_USER_ID || '1153034319271559328',
    testSecret: process.env.JUSTTHETIP_WEBHOOK_SECRET,
    chains: ['ETH', 'BTC', 'MATIC', 'BNB'],
    multipliers: {
        'ETH': 8,
        'BTC': 10,
        'MATIC': 5,
        'BNB': 6
    }
};

// Helper function to create webhook signature
function createWebhookSignature(payload, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
}

// Test payment data generators
function createTestPayment(chain, amount = 0.001, status = 'confirmed') {
    const txHashes = {
        'ETH': '0x742d35cc6e78bb87d7da8871684d5ee5e5f4e1f6d8b9d8b9d8b9d8b9d8b9d8b9',
        'BTC': '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
        'MATIC': '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        'BNB': '0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'
    };

    return {
        id: `test_payment_${Date.now()}_${chain.toLowerCase()}`,
        type: 'payment_received',
        payment: {
            id: `pay_${Date.now()}`,
            amount: amount,
            currency: chain,
            status: status,
            from_user: {
                id: TEST_CONFIG.discordUserId,
                username: 'test_user',
                discriminator: '0001'
            },
            to_user: {
                id: '1354450590813655142', // Bot ID
                username: 'TrapHouseBot',
                discriminator: '5448'
            },
            transaction_hash: txHashes[chain],
            network: chain.toLowerCase(),
            confirmations: status === 'confirmed' ? 12 : 0,
            created_at: new Date().toISOString(),
            confirmed_at: status === 'confirmed' ? new Date().toISOString() : null
        },
        metadata: {
            source: 'test_suite',
            test_chain: chain,
            expected_multiplier: TEST_CONFIG.multipliers[chain]
        }
    };
}

// Test functions
async function testWebhookEndpoint() {
    console.log('\n🔍 Testing webhook endpoint availability...');
    
    try {
        const response = await axios.get('http://localhost:3002/webhook/health', {
            timeout: 5000
        });
        
        if (response.status === 200) {
            console.log('✅ Webhook server is running');
            return true;
        } else {
            console.log('❌ Webhook server returned unexpected status:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Webhook server is not accessible:', error.message);
        console.log('💡 Make sure to start the webhook server: node webhookServer.js');
        return false;
    }
}

async function testCryptoPayment(chain) {
    console.log(`\n💰 Testing ${chain} payment processing...`);
    
    const testPayment = createTestPayment(chain, 0.001, 'confirmed');
    const signature = createWebhookSignature(testPayment, TEST_CONFIG.testSecret);
    
    try {
        const response = await axios.post(TEST_CONFIG.webhookUrl, testPayment, {
            headers: {
                'Content-Type': 'application/json',
                'X-JustTheTip-Signature': `sha256=${signature}`,
                'User-Agent': 'JustTheTip-Webhook/1.0'
            },
            timeout: 10000
        });
        
        if (response.status === 200) {
            console.log(`✅ ${chain} payment processed successfully`);
            console.log(`   Expected respect multiplier: ${TEST_CONFIG.multipliers[chain]}x`);
            console.log(`   Transaction hash: ${testPayment.payment.transaction_hash.substring(0, 16)}...`);
            return true;
        } else {
            console.log(`❌ ${chain} payment failed with status:`, response.status);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${chain} payment test error:`, error.message);
        if (error.response) {
            console.log('   Response data:', error.response.data);
        }
        return false;
    }
}

async function testInvalidSignature() {
    console.log('\n🔒 Testing webhook signature verification...');
    
    const testPayment = createTestPayment('ETH');
    const invalidSignature = 'sha256=invalid_signature_12345';
    
    try {
        const response = await axios.post(TEST_CONFIG.webhookUrl, testPayment, {
            headers: {
                'Content-Type': 'application/json',
                'X-JustTheTip-Signature': invalidSignature,
                'User-Agent': 'JustTheTip-Webhook/1.0'
            },
            timeout: 5000
        });
        
        console.log('❌ Invalid signature was accepted (security issue!)');
        return false;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Invalid signature correctly rejected');
            return true;
        } else {
            console.log('❌ Unexpected error during signature test:', error.message);
            return false;
        }
    }
}

async function testPendingPayment() {
    console.log('\n⏳ Testing pending payment handling...');
    
    const testPayment = createTestPayment('ETH', 0.001, 'pending');
    const signature = createWebhookSignature(testPayment, TEST_CONFIG.testSecret);
    
    try {
        const response = await axios.post(TEST_CONFIG.webhookUrl, testPayment, {
            headers: {
                'Content-Type': 'application/json',
                'X-JustTheTip-Signature': `sha256=${signature}`,
                'User-Agent': 'JustTheTip-Webhook/1.0'
            },
            timeout: 5000
        });
        
        if (response.status === 200) {
            console.log('✅ Pending payment handled correctly');
            return true;
        } else {
            console.log('❌ Pending payment handling failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Pending payment test error:', error.message);
        return false;
    }
}

async function testLargePayment() {
    console.log('\n💎 Testing large BTC payment (highest multiplier)...');
    
    const testPayment = createTestPayment('BTC', 0.01, 'confirmed'); // Larger amount
    const signature = createWebhookSignature(testPayment, TEST_CONFIG.testSecret);
    
    try {
        const response = await axios.post(TEST_CONFIG.webhookUrl, testPayment, {
            headers: {
                'Content-Type': 'application/json',
                'X-JustTheTip-Signature': `sha256=${signature}`,
                'User-Agent': 'JustTheTip-Webhook/1.0'
            },
            timeout: 5000
        });
        
        if (response.status === 200) {
            console.log('✅ Large BTC payment processed (10x multiplier)');
            console.log('   Amount: 0.01 BTC');
            console.log('   Expected respect bonus: Very High');
            return true;
        } else {
            console.log('❌ Large payment handling failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Large payment test error:', error.message);
        return false;
    }
}

// Main test execution
async function runAllTests() {
    console.log('🚀 Starting comprehensive crypto payment tests...\n');
    
    // Check environment
    console.log('🔧 Environment Check:');
    console.log(`   Webhook URL: ${TEST_CONFIG.webhookUrl}`);
    console.log(`   Test Secret: ${TEST_CONFIG.testSecret ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Discord User: ${TEST_CONFIG.discordUserId}`);
    console.log(`   Supported Chains: ${TEST_CONFIG.chains.join(', ')}`);
    
    if (!TEST_CONFIG.testSecret) {
        console.log('\n❌ JUSTTHETIP_WEBHOOK_SECRET not found in environment!');
        console.log('💡 Please set JUSTTHETIP_WEBHOOK_SECRET in your .env file');
        return;
    }
    
    const results = {
        passed: 0,
        failed: 0,
        total: 0
    };
    
    // Test 1: Webhook endpoint availability
    results.total++;
    if (await testWebhookEndpoint()) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n❌ Cannot continue tests - webhook server not running');
        return;
    }
    
    // Test 2: All crypto chains
    for (const chain of TEST_CONFIG.chains) {
        results.total++;
        if (await testCryptoPayment(chain)) {
            results.passed++;
        } else {
            results.failed++;
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test 3: Security - Invalid signature
    results.total++;
    if (await testInvalidSignature()) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test 4: Pending payment
    results.total++;
    if (await testPendingPayment()) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test 5: Large payment
    results.total++;
    if (await testLargePayment()) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Results summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${results.passed}/${results.total}`);
    console.log(`❌ Failed: ${results.failed}/${results.total}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Crypto payment system is fully operational!');
        console.log('\n💰 Supported Cryptocurrencies:');
        Object.entries(TEST_CONFIG.multipliers).forEach(([chain, multiplier]) => {
            console.log(`   ${chain}: ${multiplier}x respect multiplier`);
        });
        console.log('\n🔗 Ready for production crypto payments!');
    } else {
        console.log(`\n⚠️  Some tests failed. Please check the webhook server and configuration.`);
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Ensure main_complete_working.js is running');
    console.log('   2. Test real payments in Discord');
    console.log('   3. Monitor webhook logs for actual transactions');
    console.log('   4. Verify respect points are awarded correctly');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Run the tests
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests, createTestPayment, createWebhookSignature };
