#!/usr/bin/env node

/**
 * Crypto Address Setup Helper
 * Interactive script to help set up crypto receiving addresses
 */

console.log('💰 Crypto Address Setup Helper\n');

console.log('🔧 Quick Setup Options:\n');

console.log('1. 🚀 QUICK START (Recommended for testing):');
console.log('   Set up just Solana USDC for fast, cheap testing');
console.log('   • Low fees (~$0.001)');
console.log('   • Fast confirmations (1-2 seconds)');
console.log('   • Perfect for testing your bot\n');

console.log('2. 🌐 MULTI-CHAIN SETUP:');
console.log('   Set up multiple networks for full functionality');
console.log('   • Ethereum (high fees, but most popular)');
console.log('   • Polygon (low fees, fast)');
console.log('   • BSC (very low fees)');
console.log('   • Avalanche (moderate fees)');
console.log('   • Arbitrum (lower ETH fees)\n');

console.log('3. 💸 EXCHANGE ADDRESSES:');
console.log('   Use your exchange deposit addresses');
console.log('   • Coinbase, Binance, Kraken, etc.');
console.log('   • Easier to manage');
console.log('   • Built-in fiat conversion\n');

console.log('🎯 RECOMMENDATION:');
console.log('Start with Solana USDC for testing, then add more networks as needed.\n');

console.log('📋 Solana USDC Quick Setup:');
console.log('1. Download Phantom wallet (phantom.app)');
console.log('2. Create a new wallet or import existing');
console.log('3. Copy your Solana address');
console.log('4. Update these in your .env file:');
console.log('   SOLANA_SOL_RECEIVING_ADDRESS=your_solana_address_here');
console.log('   SOLANA_USDC_RECEIVING_ADDRESS=your_solana_address_here');
console.log('   (Same address works for both SOL and USDC on Solana)\n');

console.log('🧪 After setup, test with:');
console.log('   node main.js');
console.log('   Then in Discord: $solusdc add 100');
console.log('   And: $solusdc send @user 10');
