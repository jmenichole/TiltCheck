#!/usr/bin/env node

/**
 * Configuration Setup Helper
 * Run this script to help configure Discord Server IDs and Crypto Addresses
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 TrapHouse Discord Bot Configuration Helper\n');

// Configuration templates
const configs = {
    discord: {
        title: '🤖 Discord Server Configuration',
        instructions: `
To get Discord IDs:
1. Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
2. Right-click on servers, channels, or roles
3. Select "Copy ID"
        `,
        fields: [
            { key: 'DISCORD_GUILD_ID', description: 'Main Discord Server ID' },
            { key: 'ADMIN_ROLE_ID', description: 'Admin Role ID' },
            { key: 'MODERATOR_ROLE_ID', description: 'Moderator Role ID' },
            { key: 'PAYMENT_CHANNEL_ID', description: 'Payment Notifications Channel ID' },
            { key: 'LOG_CHANNEL_ID', description: 'Bot Logs Channel ID' },
            { key: 'GENERAL_CHANNEL_ID', description: 'General Chat Channel ID' },
            { key: 'CRYPTO_TIPS_CHANNEL_ID', description: 'Crypto Tips Channel ID' },
            { key: 'NOTIFICATIONS_CHANNEL_ID', description: 'General Notifications Channel ID' }
        ]
    },
    crypto: {
        title: '💰 Crypto Receiving Addresses',
        instructions: `
Set up your crypto receiving addresses for each network.
⚠️  IMPORTANT: Use addresses you control and have verified!
        `,
        networks: [
            {
                name: 'Ethereum',
                fields: [
                    { key: 'ETH_RECEIVING_ADDRESS', description: 'Ethereum (ETH) address' },
                    { key: 'USDC_ETH_RECEIVING_ADDRESS', description: 'USDC on Ethereum address' },
                    { key: 'USDT_ETH_RECEIVING_ADDRESS', description: 'USDT on Ethereum address' }
                ]
            },
            {
                name: 'Polygon',
                fields: [
                    { key: 'POLYGON_RECEIVING_ADDRESS', description: 'Polygon (MATIC) address' },
                    { key: 'USDC_POLYGON_RECEIVING_ADDRESS', description: 'USDC on Polygon address' },
                    { key: 'USDT_POLYGON_RECEIVING_ADDRESS', description: 'USDT on Polygon address' }
                ]
            },
            {
                name: 'Binance Smart Chain',
                fields: [
                    { key: 'BSC_RECEIVING_ADDRESS', description: 'BNB (BSC) address' },
                    { key: 'USDT_BSC_RECEIVING_ADDRESS', description: 'USDT on BSC address' },
                    { key: 'BUSD_BSC_RECEIVING_ADDRESS', description: 'BUSD on BSC address' }
                ]
            },
            {
                name: 'Avalanche',
                fields: [
                    { key: 'AVAX_RECEIVING_ADDRESS', description: 'Avalanche (AVAX) address' },
                    { key: 'USDC_AVAX_RECEIVING_ADDRESS', description: 'USDC on Avalanche address' },
                    { key: 'USDT_AVAX_RECEIVING_ADDRESS', description: 'USDT on Avalanche address' }
                ]
            },
            {
                name: 'Arbitrum',
                fields: [
                    { key: 'ARBITRUM_RECEIVING_ADDRESS', description: 'Arbitrum ETH address' },
                    { key: 'USDC_ARBITRUM_RECEIVING_ADDRESS', description: 'USDC on Arbitrum address' },
                    { key: 'USDT_ARBITRUM_RECEIVING_ADDRESS', description: 'USDT on Arbitrum address' }
                ]
            },
            {
                name: 'Solana',
                fields: [
                    { key: 'SOLANA_SOL_RECEIVING_ADDRESS', description: 'Solana (SOL) address' },
                    { key: 'SOLANA_USDC_RECEIVING_ADDRESS', description: 'USDC on Solana address' }
                ]
            },
            {
                name: 'Tron',
                fields: [
                    { key: 'TRON_TRX_RECEIVING_ADDRESS', description: 'Tron (TRX) address' },
                    { key: 'TRON_USDT_RECEIVING_ADDRESS', description: 'USDT on Tron address' }
                ]
            }
        ]
    }
};

// Display configuration info
function displayConfigInfo() {
    console.log(configs.discord.title);
    console.log(configs.discord.instructions);
    console.log('\nRequired Discord IDs:');
    configs.discord.fields.forEach(field => {
        console.log(`• ${field.key}: ${field.description}`);
    });

    console.log('\n' + configs.crypto.title);
    console.log(configs.crypto.instructions);
    console.log('\nCrypto Networks and Addresses:');
    configs.crypto.networks.forEach(network => {
        console.log(`\n📍 ${network.name}:`);
        network.fields.forEach(field => {
            console.log(`• ${field.key}: ${field.description}`);
        });
    });
}

// Check current .env configuration
function checkCurrentConfig() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('\n🔍 Current Configuration Status:\n');
    
    // Check Discord configs
    console.log('🤖 Discord Configuration:');
    configs.discord.fields.forEach(field => {
        const regex = new RegExp(`${field.key}=(.+)`);
        const match = envContent.match(regex);
        const configured = match && match[1] && !match[1].includes('your_') && !match[1].includes('_here');
        console.log(`${configured ? '✅' : '❌'} ${field.key}: ${configured ? 'Configured' : 'Not configured'}`);
    });

    // Check Crypto configs
    console.log('\n💰 Crypto Address Configuration:');
    configs.crypto.networks.forEach(network => {
        console.log(`\n📍 ${network.name}:`);
        network.fields.forEach(field => {
            const regex = new RegExp(`${field.key}=(.+)`);
            const match = envContent.match(regex);
            const configured = match && match[1] && !match[1].includes('your_') && !match[1].includes('_here');
            console.log(`${configured ? '✅' : '❌'} ${field.key}: ${configured ? 'Configured' : 'Not configured'}`);
        });
    });
}

// Main execution
function main() {
    displayConfigInfo();
    checkCurrentConfig();
    
    console.log('\n📝 Next Steps:');
    console.log('1. Get your Discord Server IDs using Developer Mode');
    console.log('2. Set up crypto wallets for each network you want to support');
    console.log('3. Update the .env file with your actual values');
    console.log('4. Run this script again to verify configuration');
    console.log('\n⚠️  Security Warning:');
    console.log('• Never share your private keys');
    console.log('• Only use addresses you control');
    console.log('• Test with small amounts first');
    console.log('• Keep backups of your configuration');
}

main();
