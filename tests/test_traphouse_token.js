require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

console.log('🏠 Testing TrapHouse Bot Token...');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log('✅ TRAPHOUSE BOT IS ONLINE!');
    console.log(`🤖 Logged in as: ${client.user.tag}`);
    console.log(`🌐 Serving ${client.guilds.cache.size} servers`);
    
    // Test and exit
    setTimeout(() => {
        console.log('🔥 TrapHouse bot token test successful!');
        process.exit(0);
    }, 2000);
});

client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('❌ Missing DISCORD_BOT_TOKEN in .env');
    process.exit(1);
}

console.log('🔄 Connecting TrapHouse bot to Discord...');
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
    console.error('❌ Login failed:', error);
    process.exit(1);
});
