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
 * TrapHouse Bot Configuration Validator
 * Checks all required configuration before starting the bot
 */

require('dotenv').config();

const validationResults = [];

function validateConfig(key, value, required = false, description = '') {
    const result = {
        key,
        description,
        required,
        configured: false,
        valid: false,
        message: ''
    };

    if (!value || value.includes('your_') || value.includes('YOUR_')) {
        result.configured = false;
        result.message = required ? '🚨 REQUIRED - Not configured' : '⚠️ Optional - Not configured';
    } else {
        result.configured = true;
        result.valid = true;
        result.message = '✅ Configured';
    }

    validationResults.push(result);
    return result;
}

function validateDiscordToken(token) {
    const result = validateConfig('DISCORD_BOT_TOKEN', token, true, 'Discord Bot Authentication');
    
    if (token && !token.includes('your_')) {
        // Basic Discord token format validation
        if (token.length < 50) {
            result.valid = false;
            result.message = '🚨 INVALID - Token too short';
        } else if (!token.includes('.')) {
            result.valid = false;
            result.message = '🚨 INVALID - Invalid token format';
        }
    }
    
    return result;
}

function validateSolanaAddress(address) {
    const result = validateConfig('SOLANA_USDC_DESTINATION_ADDRESS', address, false, 'Solana USDC Deposits');
    
    if (address && !address.includes('your_')) {
        // Basic Solana address validation (base58, ~44 characters)
        if (address.length < 40 || address.length > 50) {
            result.valid = false;
            result.message = '⚠️ INVALID - Incorrect address length';
        }
    }
    
    return result;
}

console.log('🔍 TrapHouse Bot Configuration Validator');
console.log('=====================================\n');

// Critical configurations
console.log('🚨 CRITICAL CONFIGURATIONS:');
validateDiscordToken(process.env.DISCORD_BOT_TOKEN);

// Payment configurations
console.log('\n💰 PAYMENT CONFIGURATIONS:');
validateSolanaAddress(process.env.SOLANA_USDC_DESTINATION_ADDRESS);
validateConfig('ETH_RPC_URL', process.env.ETH_RPC_URL, false, 'Ethereum/ERC-20 Support');
validateConfig('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY, false, 'Fiat Payment Processing');

// Integration configurations
console.log('\n🔗 INTEGRATION CONFIGURATIONS:');
validateConfig('TILTCHECK_API_KEY', process.env.TILTCHECK_API_KEY, false, 'Gambling Protection Features');
validateConfig('STAKE_API_KEY', process.env.STAKE_API_KEY, false, 'Stake.com Integration');

// Security configurations
console.log('\n🔒 SECURITY CONFIGURATIONS:');
validateConfig('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY, false, 'Data Encryption');
validateConfig('STRIPE_WEBHOOK_SECRET', process.env.STRIPE_WEBHOOK_SECRET, false, 'Webhook Security');

// Display results
console.log('\n📊 VALIDATION SUMMARY:');
console.log('=====================');

validationResults.forEach(result => {
    const status = result.configured ? (result.valid ? '✅' : '❌') : (result.required ? '🚨' : '⚠️');
    console.log(`${status} ${result.key.padEnd(30)} - ${result.description}`);
    if (!result.valid && result.configured) {
        console.log(`    └─ ${result.message}`);
    }
});

// Summary
const criticalIssues = validationResults.filter(r => r.required && !r.valid);
const warnings = validationResults.filter(r => !r.required && r.configured && !r.valid);
const configured = validationResults.filter(r => r.valid);

console.log('\n📈 CONFIGURATION STATUS:');
console.log('========================');
console.log(`✅ Properly Configured: ${configured.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`🚨 Critical Issues: ${criticalIssues.length}`);

if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalIssues.forEach(issue => {
        console.log(`   • ${issue.key}: ${issue.message}`);
    });
    console.log('\n❌ Bot cannot start with critical issues!');
    console.log('📝 Please check CONFIGURATION_GUIDE.md for setup instructions.');
    process.exit(1);
} else {
    console.log('\n🎉 Configuration validation passed!');
    console.log('🚀 Bot is ready to start.');
    
    if (warnings.length > 0) {
        console.log('\n⚠️  Optional features with issues:');
        warnings.forEach(warning => {
            console.log(`   • ${warning.key}: ${warning.message}`);
        });
    }
    
    console.log('\n💡 Next steps:');
    console.log('   1. Run: node index.js');
    console.log('   2. Test with: !ping');
    console.log('   3. Try: !deposit crypto SOLUSDC');
    process.exit(0);
}
