#!/usr/bin/env node

/**
 * 🌐 TrapHouse Bot - Public Webhook URL Generator
 * 
 * Generates public-facing webhook URLs for production deployment
 */

require('dotenv').config();

console.log('🌐 TrapHouse Bot Webhook URL Configuration');
console.log('=' .repeat(60));

const domain = process.env.DOMAIN || 'yourdomain.com';
const webhookPort = process.env.WEBHOOK_PORT || '3002';

console.log('\n🔗 LOCAL DEVELOPMENT URLs (current setup):');
console.log(`   JustTheTip: http://localhost:${webhookPort}/webhook/justthetip`);
console.log(`   GitHub:     http://localhost:${webhookPort}/webhook/github`);
console.log(`   Stripe:     http://localhost:${webhookPort}/webhook/stripe`);
console.log(`   Health:     http://localhost:${webhookPort}/webhook/health`);

console.log('\n🌍 PRODUCTION URLs (when deployed):');
console.log(`   JustTheTip: https://${domain}/webhook/justthetip`);
console.log(`   GitHub:     https://${domain}/webhook/github`);
console.log(`   Stripe:     https://${domain}/webhook/stripe`);
console.log(`   Health:     https://${domain}/webhook/health`);

console.log('\n🔒 WEBHOOK SECRETS (for external services):');
console.log(`   JustTheTip Secret: ${process.env.JUSTTHETIP_WEBHOOK_SECRET || 'Not set'}`);
console.log(`   GitHub Secret:     ${process.env.GITHUB_WEBHOOK_SECRET || 'Not set'}`);
console.log(`   Stripe Secret:     ${process.env.STRIPE_WEBHOOK_SECRET || 'Not set'}`);

console.log('\n📤 DISCORD NOTIFICATION URLs:');
console.log(`   Main Notifications: ${process.env.WEBHOOK_URL ? 'Configured' : 'Not set'}`);
console.log(`   JustTheTip Alerts:  ${process.env.JUSTTHETIP_WEBHOOK_URL ? 'Configured' : 'Not set'}`);
console.log(`   GitHub Alerts:      ${process.env.GITHUB_WEBHOOK_URL ? 'Configured' : 'Not set'}`);

console.log('\n🛠️ SETUP INSTRUCTIONS:');
console.log('   1. For local testing: Use localhost URLs above');
console.log('   2. For production: Deploy to VPS and use domain URLs');
console.log('   3. Configure external services with appropriate payload URLs');
console.log('   4. Set webhook secrets for security verification');

console.log('\n🚀 NGROK (for testing with external services):');
console.log('   Install: npm install -g ngrok');
console.log(`   Run: ngrok http ${webhookPort}`);
console.log('   Use the HTTPS URL provided by ngrok as your payload URL');

console.log('');
