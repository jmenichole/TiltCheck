#!/usr/bin/env node

/**
 * 🌐 TrapHouse Bot Webhook Server Starter
 * 
 * Standalone script to start the webhook server for testing
 */

require('dotenv').config();
const WebhookServer = require('./webhookServer.js');

console.log('🚀 Starting TrapHouse Bot Webhook Server...');

// Create and start the webhook server
const webhookServer = new WebhookServer();

// Start the server
const server = webhookServer.start(process.env.WEBHOOK_PORT || 3002);

console.log('✅ Webhook server started successfully!');
console.log('');
console.log('📡 Available endpoints:');
console.log('   GET  http://localhost:3002/webhook/health');
console.log('   GET  http://localhost:3002/webhook/status');
console.log('   GET  http://localhost:3002/webhook/test');
console.log('   POST http://localhost:3002/webhook/justthetip');
console.log('   POST http://localhost:3002/webhook/github');
console.log('   POST http://localhost:3002/webhook/stripe');
console.log('');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping webhook server...');
    webhookServer.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping webhook server...');
    webhookServer.stop();
    process.exit(0);
});
