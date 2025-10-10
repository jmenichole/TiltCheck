/**
 * Ko-fi Webhook Test Script
 * Tests the Ko-fi webhook integration by sending mock webhook data
 */

const axios = require('axios');

const WEBHOOK_URL = process.env.KOFI_WEBHOOK_URL || 'http://localhost:3002/webhook/kofi';
const VERIFICATION_TOKEN = process.env.KOFI_VERIFICATION_TOKEN || '02740ccf-8e39-4dce-b095-995f8d94bdbb';

// Mock Ko-fi webhook data for different scenarios
const testDonation = {
    verification_token: VERIFICATION_TOKEN,
    message_id: `test_${Date.now()}_donation`,
    timestamp: new Date().toISOString(),
    type: "Donation",
    is_public: true,
    from_name: "Test Supporter",
    message: "This is a test donation for the Ko-fi webhook integration! ☕",
    amount: "5.00",
    url: "https://ko-fi.com/jmenichole",
    email: "test@example.com",
    currency: "USD",
    is_subscription_payment: false,
    is_first_subscription_payment: false,
    kofi_transaction_id: `test_txn_${Date.now()}`,
    shop_items: null,
    tier_name: null,
    shipping: null
};

const testSubscription = {
    verification_token: VERIFICATION_TOKEN,
    message_id: `test_${Date.now()}_subscription`,
    timestamp: new Date().toISOString(),
    type: "Subscription",
    is_public: true,
    from_name: "Monthly Supporter",
    message: "Thanks for the amazing bot! Here's my monthly support! 🌟",
    amount: "10.00",
    url: "https://ko-fi.com/jmenichole",
    email: "monthly@example.com",
    currency: "USD",
    is_subscription_payment: true,
    is_first_subscription_payment: true,
    kofi_transaction_id: `test_sub_${Date.now()}`,
    shop_items: null,
    tier_name: "Gold Supporter",
    shipping: null
};

const testCommission = {
    verification_token: VERIFICATION_TOKEN,
    message_id: `test_${Date.now()}_commission`,
    timestamp: new Date().toISOString(),
    type: "Commission",
    is_public: false,
    from_name: "Commission Client",
    message: "I'd like to commission a custom Discord bot feature!",
    amount: "50.00",
    url: "https://ko-fi.com/jmenichole",
    email: "client@example.com",
    currency: "USD",
    is_subscription_payment: false,
    is_first_subscription_payment: false,
    kofi_transaction_id: `test_comm_${Date.now()}`,
    shop_items: null,
    tier_name: null,
    shipping: null
};

const testShopOrder = {
    verification_token: VERIFICATION_TOKEN,
    message_id: `test_${Date.now()}_shop`,
    timestamp: new Date().toISOString(),
    type: "Shop Order",
    is_public: true,
    from_name: "Shop Customer",
    message: "Excited for my purchase! 🛒",
    amount: "25.00",
    url: "https://ko-fi.com/jmenichole",
    email: "customer@example.com",
    currency: "USD",
    is_subscription_payment: false,
    is_first_subscription_payment: false,
    kofi_transaction_id: `test_shop_${Date.now()}`,
    shop_items: [
        {
            direct_link_code: "item123",
            variation_name: "Premium Bot Setup",
            quantity: 1
        }
    ],
    tier_name: null,
    shipping: {
        full_name: "John Doe",
        street_address: "123 Test Street",
        city: "Test City",
        state_or_province: "Test State",
        postal_code: "12345",
        country: "United States",
        country_code: "US",
        telephone: "555-0123"
    }
};

// Test with invalid verification token
const testInvalidToken = {
    ...testDonation,
    verification_token: "invalid-token-12345"
};

async function testKofiWebhook(testData, description) {
    try {
        console.log(`\n🧪 Testing: ${description}`);
        console.log(`📡 Sending to: ${WEBHOOK_URL}`);
        
        // Ko-fi sends data as form-encoded with 'data' parameter
        const formData = new URLSearchParams();
        formData.append('data', JSON.stringify(testData));
        
        const response = await axios.post(WEBHOOK_URL, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Ko-fi-Webhooks'
            },
            timeout: 10000
        });
        
        console.log(`✅ Success: ${response.status} ${response.statusText}`);
        console.log(`📝 Response:`, response.data);
        
        return true;
        
    } catch (error) {
        console.log(`❌ Failed: ${error.response?.status || 'Network Error'}`);
        console.log(`📝 Error:`, error.response?.data || error.message);
        
        return false;
    }
}

async function runAllTests() {
    console.log('☕ Ko-fi Webhook Integration Test');
    console.log('=================================');
    console.log(`🔗 Testing webhook endpoint: ${WEBHOOK_URL}`);
    console.log(`🔐 Using verification token: ${VERIFICATION_TOKEN.substring(0, 8)}...`);
    
    const tests = [
        { data: testDonation, description: 'Single Donation' },
        { data: testSubscription, description: 'First Subscription Payment' },
        { data: testCommission, description: 'Commission Request' },
        { data: testShopOrder, description: 'Shop Order with Shipping' },
        { data: testInvalidToken, description: 'Invalid Verification Token (should fail)' }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        const success = await testKofiWebhook(test.data, test.description);
        if (success) passed++;
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Test Results');
    console.log('================');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total - 1) { // -1 because invalid token test should fail
        console.log('🎉 All tests passed! Ko-fi integration is working correctly.');
    } else {
        console.log('⚠️ Some tests failed. Check your webhook configuration.');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Configure your Ko-fi webhook URL in the Ko-fi dashboard');
    console.log('2. Set up Discord webhook for notifications (optional)');
    console.log('3. Make a real test donation to verify end-to-end functionality');
    console.log('\n🔗 Ko-fi Dashboard: https://ko-fi.com/manage/webhooks');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
☕ Ko-fi Webhook Test Script

Usage:
  node test-kofi-webhook.js [options]

Options:
  --donation     Test donation webhook only
  --subscription Test subscription webhook only  
  --commission   Test commission webhook only
  --shop         Test shop order webhook only
  --invalid      Test invalid token (should fail)
  --help, -h     Show this help message

Environment Variables:
  KOFI_WEBHOOK_URL        Webhook endpoint (default: http://localhost:3002/webhook/kofi)
  KOFI_VERIFICATION_TOKEN Verification token (default: 02740ccf-8e39-4dce-b095-995f8d94bdbb)

Examples:
  node test-kofi-webhook.js                    # Run all tests
  node test-kofi-webhook.js --donation         # Test donation only
  node test-kofi-webhook.js --subscription     # Test subscription only
`);
    process.exit(0);
}

// Run specific tests based on arguments
if (args.length > 0) {
    console.log('☕ Ko-fi Webhook Single Test');
    console.log('============================');
    
    if (args.includes('--donation')) {
        testKofiWebhook(testDonation, 'Single Donation');
    } else if (args.includes('--subscription')) {
        testKofiWebhook(testSubscription, 'First Subscription Payment');
    } else if (args.includes('--commission')) {
        testKofiWebhook(testCommission, 'Commission Request');
    } else if (args.includes('--shop')) {
        testKofiWebhook(testShopOrder, 'Shop Order with Shipping');
    } else if (args.includes('--invalid')) {
        testKofiWebhook(testInvalidToken, 'Invalid Verification Token (should fail)');
    } else {
        console.log('❌ Unknown option. Use --help for usage information.');
        process.exit(1);
    }
} else {
    // Run all tests
    runAllTests();
}
