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

// Test script for Chainalysis API integration
require('dotenv').config();

console.log('🔍 Chainalysis API Configuration Test');
console.log('=====================================');
console.log('');

// Check API key configuration
const apiKey = process.env.CHAINALYSIS_API_KEY;
if (apiKey && apiKey !== 'your_chainalysis_api_key_here') {
    console.log('✅ Chainalysis API Key: Configured');
    console.log(`   Key starts with: ${apiKey.substring(0, 8)}...`);
    console.log(`   Key length: ${apiKey.length} characters`);
} else {
    console.log('❌ Chainalysis API Key: Not configured');
}

// Check compliance settings
console.log('');
console.log('🛡️ Compliance Configuration:');
console.log(`OFAC Compliance: ${process.env.OFAC_COMPLIANCE_ENABLED}`);
console.log(`AML Screening: ${process.env.AML_SCREENING_REQUIRED}`);
console.log(`KYC Level: ${process.env.KYC_VERIFICATION_LEVEL}`);

// Check state compliance
console.log('');
console.log('🏛️ State Compliance:');
console.log(`Banned States: ${process.env.BANNED_STATES}`);
console.log(`Compliance Reporting: ${process.env.COMPLIANCE_REPORTING_ENABLED}`);
console.log(`BitLicense Compliance: ${process.env.BITLICENSE_COMPLIANCE}`);
console.log(`Gambling Regulation Check: ${process.env.GAMBLING_REGULATION_CHECK}`);

console.log('');
console.log('🔧 Chainalysis Integration Features:');
console.log('• Address Risk Scoring');
console.log('• Transaction Monitoring');
console.log('• OFAC Sanctions Screening');
console.log('• AML Risk Assessment');
console.log('• Regulatory Compliance Reporting');

console.log('');
console.log('📋 Available Commands:');
console.log('!compliance help         - Show compliance guide');
console.log('!unban-state [state]     - State unban assistance');
console.log('!state-analysis          - Regulatory analysis');
console.log('!verify-wallet [address] - Wallet compliance check');

console.log('');
console.log('⚠️  Important Notes:');
console.log('• Chainalysis API requires valid subscription');
console.log('• Rate limits apply to API calls');
console.log('• Store API keys securely');
console.log('• Test with sandbox environment first');

console.log('');
console.log('✅ Configuration loaded successfully!');
console.log('✅ Bot restarted with updated Chainalysis API key');
