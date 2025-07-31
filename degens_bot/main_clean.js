/**
 * 🃏 Degens Against Decency - Main Bot File
 * 
 * A Cards Against Humanity inspired Discord bot for the most degenerate
 * communities on the internet. Proceed with caution.
 */

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const GameManager = require('./gameManager');

console.log('🃏 Starting Degens Against Decency Bot...');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});

// Initialize game manager
const gameManager = new GameManager();

const prefix = '!dad';

// Bot ready event
client.once('ready', () => {
    console.log('');
    console.log('🃏===============================================🃏');
    console.log('   DEGENS AGAINST DECENCY BOT - ONLINE');
    console.log('🃏===============================================🃏');
    console.log(`🤖 Logged in as: ${client.user.tag}`);
    console.log(`🌐 Serving ${client.guilds.cache.size} servers`);
    console.log(`👥 Watching ${client.users.cache.size} users`);
    console.log('');
    console.log('⚠️  WARNING: This bot contains highly offensive content');
    console.log('📜 Use !dad help for commands');
    console.log('🃏===============================================🃏');
    
    // Set bot activity
    client.user.setActivity('Cards Against Humanity | !dad help', { type: 'PLAYING' });
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check if message starts with prefix
    if (!message.content.startsWith(prefix)) return;
    
    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    const guildId = message.guild?.id;
    
    try {
        switch (command) {
            case 'start':
                await gameManager.startGame(message, guildId);
                break;
                
            case 'join':
                await gameManager.joinGame(message, guildId);
                break;
                
            case 'begin':
                await gameManager.beginRound(message, guildId);
                break;
                
            case 'hand':
                await gameManager.showHand(message, guildId);
                break;
                
            case 'play':
                await gameManager.playCards(message, args, guildId);
                break;
                
            case 'judge':
                await gameManager.judgeRound(message, args, guildId);
                break;
                
            case 'scores':
                await gameManager.showScores(message, guildId);
                break;
                
            case 'status':
                await gameManager.showGameStatus(message, guildId);
                break;
                
            case 'stop':
            case 'end':
                await gameManager.endGame(message, guildId);
                break;
                
            case 'addblack':
                const blackCardText = args.join(' ');
                await gameManager.addCustomBlackCard(message, blackCardText);
                break;
                
            case 'addwhite':
                const whiteCardText = args.join(' ');
                await gameManager.addCustomWhiteCard(message, whiteCardText);
                break;
                
            case 'help':
                await showHelp(message);
                break;
                
            case 'rules':
                await showRules(message);
                break;
                
            case 'about':
                await showAbout(message);
                break;
                
            default:
                await message.reply('❓ Unknown command. Use `!dad help` for available commands.');
        }
    } catch (error) {
        console.error('Error handling command:', error);
        await message.reply('❌ An error occurred while processing your command. Please try again.');
    }
});

// Helper functions
async function showHelp(message) {
    const embed = new EmbedBuilder()
        .setColor(0x800080)
        .setTitle('🃏 Degens Against Decency - Commands')
        .setDescription('*A Cards Against Humanity inspired Discord bot*')
        .addFields(
            {
                name: '🎮 Game Commands',
                value: '`!dad start` - Start a new game\n`!dad join` - Join current game\n`!dad hand` - View your cards (DM)\n`!dad play [numbers]` - Play cards (e.g., `!dad play 1 3`)\n`!dad judge [number]` - Judge picks winner\n`!dad scores` - Show current scores\n`!dad status` - Show game status\n`!dad stop` - End current game',
                inline: false
            },
            {
                name: '🃏 Custom Cards',
                value: '`!dad addblack [text]` - Add custom black card\n`!dad addwhite [text]` - Add custom white card\n*Black cards need underscores (_) for blanks*',
                inline: false
            },
            {
                name: '📚 Info Commands',
                value: '`!dad help` - Show this help\n`!dad rules` - Show game rules\n`!dad about` - About the bot',
                inline: false
            }
        )
        .setFooter({ text: '⚠️ Contains highly offensive content - Use at your own risk' });
        
    await message.reply({ embeds: [embed] });
}

async function showRules(message) {
    const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle('📜 How to Play - Degens Against Decency')
        .setDescription('*Cards Against Humanity Rules for Discord*')
        .addFields(
            {
                name: '🎯 Objective',
                value: 'Be the first player to reach **5 points** by creating the funniest, most inappropriate combinations',
                inline: false
            },
            {
                name: '🎮 Gameplay',
                value: '1. **Join**: Use `!dad join` to enter the game\n2. **Cards**: Get 7 white cards dealt to you\n3. **Judge**: One player judges each round (rotates)\n4. **Play**: Submit white cards to fill black card blanks\n5. **Judge**: Judge picks the funniest combination\n6. **Win**: Winner gets a point, first to 5 wins!',
                inline: false
            },
            {
                name: '⚫ Black Cards',
                value: 'Prompts or fill-in-the-blank statements that players respond to',
                inline: true
            },
            {
                name: '⚪ White Cards',
                value: 'Responses, nouns, or phrases used to complete black cards',
                inline: true
            },
            {
                name: '👨‍⚖️ Judging',
                value: 'Pick the funniest, most creative, or most offensive combination. Be a degenerate!',
                inline: false
            },
            {
                name: '⚠️ Content Warning',
                value: 'This game contains **highly offensive**, **inappropriate**, and **NSFW** content. Play responsibly.',
                inline: false
            }
        )
        .setFooter({ text: 'Use !dad start to begin the degeneracy' });
        
    await message.reply({ embeds: [embed] });
}

async function showAbout(message) {
    const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🃏 About Degens Against Decency')
        .setDescription('*The most inappropriate Discord bot you\'ll ever play*')
        .addFields(
            {
                name: '🎲 What is this?',
                value: 'A Discord adaptation of Cards Against Humanity, designed for communities that embrace dark humor and offensive content.',
                inline: false
            },
            {
                name: '⚠️ Content Warning',
                value: '**This bot contains:**\n• Highly offensive humor\n• NSFW content\n• Dark themes\n• Inappropriate jokes\n\n*Use only in appropriate channels and communities*',
                inline: false
            },
            {
                name: '🛠️ Features',
                value: '• Full Cards Against Humanity gameplay\n• Custom card additions\n• DM-based hand management\n• Score tracking\n• Multiple game support',
                inline: false
            },
            {
                name: '👨‍💻 Developer',
                value: 'Created for degenerate Discord communities\nVersion 1.0.0',
                inline: false
            }
        )
        .setFooter({ text: 'Proceed with caution - You have been warned!' });
        
    await message.reply({ embeds: [embed] });
}

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Degens Against Decency Bot...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Degens Against Decency Bot...');
    client.destroy();
    process.exit(0);
});

// Login with bot token
if (!process.env.DEGENS_BOT_TOKEN) {
    console.error('❌ Missing DEGENS_BOT_TOKEN in environment variables');
    process.exit(1);
}

client.login(process.env.DEGENS_BOT_TOKEN);
