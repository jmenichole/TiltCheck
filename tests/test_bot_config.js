#!/usr/bin/env node

/**
 * Test script to verify bot configuration and crypto command restrictions
 */

console.log('🧪 Testing Bot Configuration...');
console.log('');

// Check environment variables
console.log('📋 Environment Configuration:');
console.log(`   CURRENT_BOT: ${process.env.CURRENT_BOT || 'NOT SET'}`);
console.log(`   DISCORD_BOT_TOKEN: ${process.env.DISCORD_BOT_TOKEN ? 'SET' : 'NOT SET'}`);
console.log(`   PAYMENT_SIGNER: ${process.env.PAYMENT_SIGNER ? 'SET' : 'NOT SET'}`);
console.log('');

// Test the restriction logic
console.log('🔐 Testing Crypto Command Restrictions:');

const isJustTheTip = process.env.CURRENT_BOT === 'JUSTTHETIP';
console.log(`   Is JustTheTip Bot: ${isJustTheTip ? '✅ YES' : '❌ NO'}`);
console.log(`   Crypto Commands Allowed: ${isJustTheTip ? '✅ YES' : '❌ NO'}`);
console.log('');

if (isJustTheTip) {
    console.log('🎯 CORRECT CONFIGURATION:');
    console.log('   ✅ JustTheTip bot is running');
    console.log('   ✅ $balance command will work');
    console.log('   ✅ $tip commands will work');
    console.log('   ✅ $solusdc commands will work');
    console.log('   ✅ !tip-admin commands will work');
    console.log('');
    console.log('💡 Your Discord ID 1153034319271559328 can now:');
    console.log('   • Use $balance to check crypto balances');
    console.log('   • Receive tips via $tip @<1153034319271559328> amount SOLUSDC');
    console.log('   • Use $history to view transactions');
} else {
    console.log('⚠️  WRONG CONFIGURATION:');
    console.log('   ❌ TrapHouse bot is running (crypto commands disabled)');
    console.log('   ❌ $balance command will be blocked');
    console.log('   ❌ $tip commands will be blocked');
    console.log('');
    console.log('🔧 TO FIX: Run JustTheTip bot instead');
    console.log('   Command: node launcher.js justthetip');
}

console.log('');
console.log('🎮 Test Your Setup:');
console.log('   1. Go to Discord');
console.log('   2. Type: $balance');
console.log('   3. Should show your crypto balances (on JustTheTip)');
console.log('   4. Should show restriction message (on TrapHouse)');
console.log('');
