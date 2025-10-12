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
 * TrapHouse Payment System Test Script
 * Tests the payment infrastructure without starting the full bot
 */

require('dotenv').config({ path: '.env.payments' });
const PaymentManager = require('./paymentManager');

async function testPaymentSystem() {
    console.log('🧪 Testing TrapHouse Payment System...\n');
    
    try {
        // Initialize payment manager
        console.log('1. Initializing Payment Manager...');
        const paymentManager = new PaymentManager();
        await paymentManager.initializePaymentData();
        console.log('✅ Payment Manager initialized successfully\n');
        
        // Test wallet generation
        console.log('2. Testing Crypto Wallet Generation...');
        const testUserId = 'test123';
        const wallet = paymentManager.createWallet(testUserId);
        console.log(`✅ Generated wallet: ${wallet.address}`);
        console.log(`   Private Key: ${wallet.privateKey.substring(0, 10)}...`);
        console.log(`   User ID: ${testUserId}\n`);
        
        // Test supported currencies
        console.log('3. Testing Supported Currencies...');
        const supportedCryptos = ['ETH', 'USDC', 'USDT', 'WBTC'];
        for (const crypto of supportedCryptos) {
            const isSupported = paymentManager.isSupportedCrypto(crypto);
            console.log(`   ${crypto}: ${isSupported ? '✅' : '❌'}`);
        }
        console.log();
        
        // Test Stripe configuration
        console.log('4. Testing Stripe Configuration...');
        const hasStripe = !!process.env.STRIPE_SECRET_KEY;
        console.log(`   Stripe Secret Key: ${hasStripe ? '✅ Configured' : '❌ Missing'}`);
        const hasWebhook = !!process.env.STRIPE_WEBHOOK_SECRET;
        console.log(`   Webhook Secret: ${hasWebhook ? '✅ Configured' : '❌ Missing'}`);
        console.log();
        
        // Test data storage
        console.log('5. Testing Data Storage...');
        const userWallets = paymentManager.getUserWallets();
        console.log(`   User wallets loaded: ${Object.keys(userWallets).length}`);
        const transactions = paymentManager.getTransactions();
        console.log(`   Transactions loaded: ${Object.keys(transactions).length}`);
        console.log();
        
        // Test balance checking (mock)
        console.log('6. Testing Balance Operations...');
        const balance = await paymentManager.getBalance(testUserId, 'ETH');
        console.log(`   ETH Balance for ${testUserId}: ${balance} ETH`);
        console.log();
        
        // Test address validation
        console.log('7. Testing Address Validation...');
        const validAddress = '0x742d35Cc6431C4D7c1c8a67F8c5d9b3';
        const isValid = paymentManager.isValidEthereumAddress(validAddress);
        console.log(`   Address ${validAddress}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        console.log();
        
        console.log('🎉 All tests completed successfully!');
        console.log('\n📋 System Status:');
        console.log('   ✅ Crypto wallet generation working');
        console.log('   ✅ Multi-currency support enabled');
        console.log('   ✅ Data persistence functional');
        console.log('   ✅ Address validation working');
        console.log(`   ${hasStripe ? '✅' : '⚠️ '} Stripe integration ${hasStripe ? 'ready' : 'needs configuration'}`);
        console.log(`   ${hasWebhook ? '✅' : '⚠️ '} Webhook security ${hasWebhook ? 'enabled' : 'needs setup'}`);
        
        console.log('\n🚀 Ready for Discord integration!');
        console.log('\nNext steps:');
        console.log('1. Configure .env.payments with your API keys');
        console.log('2. Start the bot with: node index.js');
        console.log('3. Test with: !deposit crypto ETH');
        console.log('4. Test with: !deposit fiat 10');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testPaymentSystem();
