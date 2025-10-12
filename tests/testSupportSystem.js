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
 * BetCollective Support System Test
 * Test the support system functionality
 */

const SupportIntegration = require('./supportIntegration');
const BetCollectiveSupportSystem = require('./supportSystem');

async function testSupportSystem() {
    console.log('🎫 Testing BetCollective Support System...\n');
    
    // Test environment variables
    console.log('🔧 Environment Configuration:');
    console.log(`Main Developer: ${process.env.BETCOLLECTIVE_MAIN_DEV || 'jmenichole'}`);
    console.log(`Primary Wallet: ${process.env.BETCOLLECTIVE_PRIMARY_WALLET || '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z'}`);
    console.log(`Phantom Wallet: ${process.env.BETCOLLECTIVE_PHANTOM_WALLET || '6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB'}`);
    console.log(`Transfer TX ID: ${process.env.BETCOLLECTIVE_TRANSFER_TXID || 'TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E'}`);
    console.log('');
    
    // Test wallet configuration
    console.log('💰 Wallet Configuration Verification:');
    const primaryWallet = process.env.SOLANA_SOL_RECEIVING_ADDRESS;
    const phantomWallet = process.env.PHANTOM_WALLET_ADDRESS;
    
    if (primaryWallet === '8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z') {
        console.log('✅ Primary receiving wallet correctly set to tip.cc transfer wallet');
    } else {
        console.log('⚠️ Primary wallet mismatch - should be 8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z');
    }
    
    if (phantomWallet === '6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB') {
        console.log('✅ Phantom wallet correctly configured');
    } else {
        console.log('⚠️ Phantom wallet configuration issue');
    }
    console.log('');
    
    // Test support system configuration
    console.log('🎫 Support System Configuration:');
    
    // Mock client for testing
    const mockClient = {
        guilds: {
            cache: new Map()
        },
        on: () => {},
        once: () => {}
    };
    
    try {
        const supportSystem = new BetCollectiveSupportSystem(mockClient);
        console.log('✅ Support system class instantiated successfully');
        
        // Test ticket categories
        const categories = supportSystem.supportConfig.ticketCategories;
        console.log(`✅ ${categories.length} ticket categories configured:`);
        categories.forEach(cat => {
            console.log(`   ${cat.emoji} ${cat.name}`);
        });
        
        // Test configuration
        console.log(`✅ Main developer: ${supportSystem.supportConfig.mainDev}`);
        console.log(`✅ Receiving wallet: ${supportSystem.supportConfig.receivingWallet}`);
        console.log(`✅ Phantom wallet: ${supportSystem.supportConfig.phantomWallet}`);
        
    } catch (error) {
        console.log('❌ Support system instantiation failed:', error.message);
    }
    console.log('');
    
    // Test integration
    console.log('🔗 Support Integration Test:');
    try {
        const integration = new SupportIntegration(mockClient);
        console.log('✅ Support integration class instantiated successfully');
        console.log('✅ Ready for Discord bot integration');
    } catch (error) {
        console.log('❌ Support integration failed:', error.message);
    }
    console.log('');
    
    // Display setup instructions
    console.log('📋 Setup Instructions for BetCollective Server:');
    console.log('');
    console.log('1. **Add the bot to your BetCollective Discord server**');
    console.log('2. **Give the bot these permissions:**');
    console.log('   • Manage Channels');
    console.log('   • Manage Messages');
    console.log('   • Send Messages');
    console.log('   • Embed Links');
    console.log('   • Read Message History');
    console.log('   • Add Reactions');
    console.log('   • Use Slash Commands');
    console.log('');
    console.log('3. **The bot will automatically create:**');
    console.log('   • 🎫 SUPPORT SYSTEM category');
    console.log('   • #create-ticket channel');
    console.log('   • #ticket-logs channel (staff only)');
    console.log('');
    console.log('4. **Available Commands:**');
    console.log('   • `$support` - Show support help');
    console.log('   • `$walletinfo` - Display wallet information');
    console.log('   • `$pingdev <reason>` - Ping @jmenichole');
    console.log('   • `$supportstats` - View ticket statistics (admin only)');
    console.log('');
    console.log('5. **When users create tickets:**');
    console.log('   • @jmenichole will be automatically pinged');
    console.log('   • Ticket categories: Payment, Technical, Crypto, Betting, Bug Reports, General');
    console.log('   • Priority levels: Low, Normal, High');
    console.log('   • Private ticket channels with user permissions');
    console.log('');
    console.log('6. **Wallet Information Displayed:**');
    console.log(`   • Primary: 8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z`);
    console.log(`   • Phantom: 6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB`);
    console.log(`   • Transfer: TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E`);
    console.log('');
    console.log('✅ BetCollective Support System Test Complete!');
    console.log('🚀 Ready for deployment to BetCollective server!');
}

// Run the test
if (require.main === module) {
    testSupportSystem();
}

module.exports = { testSupportSystem };
