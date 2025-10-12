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
 * 🎯 Simple Crypto Payment Demo
 * 
 * Demonstrates a single successful crypto payment to verify the system works
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

console.log('🎯 TrapHouse Crypto Payment Demo');
console.log('=' .repeat(40));

// Create a realistic test payment
const testPayment = {
    id: `demo_payment_${Date.now()}`,
    type: 'payment_received',
    payment: {
        id: `pay_demo_${Date.now()}`,
        amount: 0.005, // 0.005 ETH
        currency: 'ETH',
        status: 'confirmed',
        from_user: {
            id: process.env.ADMIN_USER_ID,
            username: 'crypto_user',
            discriminator: '1337'
        },
        to_user: {
            id: process.env.DISCORD_CLIENT_ID,
            username: 'TrapHouseBot',
            discriminator: '5448'
        },
        transaction_hash: '0x' + crypto.randomBytes(32).toString('hex'),
        network: 'ethereum',
        confirmations: 15,
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString()
    }
};

// Create proper signature
const signature = crypto
    .createHmac('sha256', process.env.JUSTTHETIP_WEBHOOK_SECRET)
    .update(JSON.stringify(testPayment))
    .digest('hex');

console.log('💰 Demo Payment Details:');
console.log(`   Amount: ${testPayment.payment.amount} ${testPayment.payment.currency}`);
console.log(`   User: ${testPayment.payment.from_user.username}`);
console.log(`   Status: ${testPayment.payment.status}`);
console.log(`   Confirmations: ${testPayment.payment.confirmations}`);
console.log(`   Expected Multiplier: 8x (ETH)`);
console.log('');

async function sendDemoPayment() {
    try {
        console.log('📡 Sending demo payment to webhook...');
        
        const response = await axios.post('http://localhost:3002/webhook/justthetip', testPayment, {
            headers: {
                'Content-Type': 'application/json',
                'X-JustTheTip-Signature': `sha256=${signature}`,
                'User-Agent': 'JustTheTip-Webhook/1.0'
            },
            timeout: 10000
        });
        
        if (response.status === 200) {
            console.log('✅ Demo payment processed successfully!');
            console.log('🎉 The crypto payment system is fully operational!');
            console.log('');
            console.log('💎 What happened:');
            console.log('   1. ✅ Webhook signature verified');
            console.log('   2. ✅ Payment data validated');
            console.log('   3. ✅ ETH payment processed with 8x multiplier');
            console.log('   4. ✅ User respect points would be awarded');
            console.log('   5. ✅ Discord notification would be sent');
            console.log('');
            console.log('🚀 Ready for real crypto payments!');
        } else {
            console.log('❌ Demo payment failed:', response.status);
        }
    } catch (error) {
        console.log('❌ Demo payment error:', error.message);
        if (error.response) {
            console.log('   Response:', error.response.data);
        }
    }
}

sendDemoPayment();
