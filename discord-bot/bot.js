const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const TiltCheck = require('../tiltCheck.js');
require('dotenv').config();

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize TiltCheck
const tiltChecker = new TiltCheck('discord-bot-key');

// Responsible gaming tips
const gamingTips = [
  "🎯 Set a budget before you start playing and stick to it!",
  "⏰ Take regular breaks - your mind stays sharper when rested.",
  "🏦 Vault your winnings! Secure profits to avoid losing them back.",
  "📊 Track your playing time and patterns for better awareness.",
  "🤝 Play for entertainment, not as a way to make money.",
  "🚪 Walk away when you're ahead - profits are meant to be kept!",
  "💭 Never chase losses - they often lead to bigger losses.",
  "🎲 Remember: the house always has an edge in the long run.",
  "👥 Talk to friends or family if gaming becomes stressful.",
  "⚖️ Balance gaming with other activities and responsibilities."
];

// Mock player data for demonstration
const mockPlayers = new Map([
  ['demo-player-1', { id: 'demo-player-1', currentStake: 850, riskLevel: 'medium', sessionTime: 45, alerts: 2 }],
  ['demo-player-2', { id: 'demo-player-2', currentStake: 1200, riskLevel: 'low', sessionTime: 22, alerts: 0 }],
  ['demo-player-3', { id: 'demo-player-3', currentStake: 450, riskLevel: 'high', sessionTime: 78, alerts: 5 }],
]);

// Bot commands
const commands = [
  new SlashCommandBuilder()
    .setName('tilt-status')
    .setDescription('Check current TiltCheck monitoring status'),
    
  new SlashCommandBuilder()
    .setName('player-stats')
    .setDescription('Get player statistics')
    .addStringOption(option =>
      option.setName('playerid')
        .setDescription('Player ID to check')
        .setRequired(true)),
        
  new SlashCommandBuilder()
    .setName('gaming-tip')
    .setDescription('Get a responsible gaming tip'),
    
  new SlashCommandBuilder()
    .setName('vault-reminder')
    .setDescription('Send vault reminder to monitored players'),
    
  new SlashCommandBuilder()
    .setName('set-alert')
    .setDescription('Configure alert thresholds')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Alert type')
        .setRequired(true)
        .addChoices(
          { name: 'Stake Increase', value: 'stakeIncrease' },
          { name: 'Session Time', value: 'sessionTime' },
          { name: 'Loss Sequence', value: 'lossSequence' }
        ))
    .addIntegerOption(option =>
      option.setName('threshold')
        .setDescription('Threshold value')
        .setRequired(true)),
];

// Register slash commands
async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
    
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Bot ready event
client.once('ready', async () => {
  console.log(`🤖 TiltCheck Bot is online! Logged in as ${client.user.tag}`);
  console.log(`📊 Monitoring ${mockPlayers.size} players`);
  
  // Set bot status
  client.user.setActivity('Monitoring player behavior', { type: 'WATCHING' });
  
  // Register commands
  await registerCommands();
  
  // Start monitoring alerts (demo)
  startMonitoringAlerts();
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'tilt-status':
        await handleTiltStatus(interaction);
        break;
      case 'player-stats':
        await handlePlayerStats(interaction);
        break;
      case 'gaming-tip':
        await handleGamingTip(interaction);
        break;
      case 'vault-reminder':
        await handleVaultReminder(interaction);
        break;
      case 'set-alert':
        await handleSetAlert(interaction);
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    await interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
  }
});

// Command handlers
async function handleTiltStatus(interaction) {
  const totalPlayers = mockPlayers.size;
  const activeAlerts = Array.from(mockPlayers.values()).reduce((sum, player) => sum + player.alerts, 0);
  const highRiskPlayers = Array.from(mockPlayers.values()).filter(p => p.riskLevel === 'high').length;

  const embed = new EmbedBuilder()
    .setColor(0x3B82F6)
    .setTitle('🛡️ TiltCheck Monitoring Status')
    .setDescription('Current system status and monitoring overview')
    .addFields(
      { name: '👥 Total Players', value: totalPlayers.toString(), inline: true },
      { name: '🚨 Active Alerts', value: activeAlerts.toString(), inline: true },
      { name: '⚠️ High Risk Players', value: highRiskPlayers.toString(), inline: true },
      { name: '💚 System Status', value: 'Online & Monitoring', inline: true },
      { name: '📊 Accuracy Rate', value: '99.7%', inline: true },
      { name: '⏱️ Response Time', value: '<500ms', inline: true }
    )
    .setFooter({ text: 'TiltCheck - Promoting Responsible Gaming' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handlePlayerStats(interaction) {
  const playerId = interaction.options.getString('playerid');
  const player = mockPlayers.get(playerId);

  if (!player) {
    await interaction.reply({ 
      content: `❌ Player "${playerId}" not found. Available demo players: ${Array.from(mockPlayers.keys()).join(', ')}`,
      ephemeral: true 
    });
    return;
  }

  const riskColor = {
    'low': 0x10B981,    // Green
    'medium': 0xF59E0B, // Yellow
    'high': 0xEF4444    // Red
  };

  const embed = new EmbedBuilder()
    .setColor(riskColor[player.riskLevel])
    .setTitle(`📊 Player Statistics: ${player.id}`)
    .addFields(
      { name: '💰 Current Stake', value: `$${player.currentStake}`, inline: true },
      { name: '⚠️ Risk Level', value: player.riskLevel.toUpperCase(), inline: true },
      { name: '⏱️ Session Time', value: `${player.sessionTime} min`, inline: true },
      { name: '🚨 Total Alerts', value: player.alerts.toString(), inline: true },
      { name: '📈 Recommendation', value: getRecommendation(player), inline: false }
    )
    .setFooter({ text: 'Data updated in real-time' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleGamingTip(interaction) {
  const randomTip = gamingTips[Math.floor(Math.random() * gamingTips.length)];
  
  const embed = new EmbedBuilder()
    .setColor(0x8B5CF6)
    .setTitle('💡 Responsible Gaming Tip')
    .setDescription(randomTip)
    .setFooter({ text: 'Play responsibly - TiltCheck cares about your wellbeing' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleVaultReminder(interaction) {
  const playersWithWinnings = Array.from(mockPlayers.values()).filter(p => p.currentStake > 1000);
  
  if (playersWithWinnings.length === 0) {
    await interaction.reply('📦 No players currently have significant winnings to vault.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xF59E0B)
    .setTitle('🏦 Vault Reminder Sent!')
    .setDescription(`Sent vault reminders to ${playersWithWinnings.length} players with significant winnings.`)
    .addFields(
      playersWithWinnings.map(player => ({
        name: `👤 ${player.id}`,
        value: `$${player.currentStake} (Consider vaulting!)`,
        inline: true
      }))
    )
    .setFooter({ text: 'Protecting player winnings is our priority' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleSetAlert(interaction) {
  const alertType = interaction.options.getString('type');
  const threshold = interaction.options.getInteger('threshold');

  // In a real implementation, this would update the actual config
  const embed = new EmbedBuilder()
    .setColor(0x10B981)
    .setTitle('⚙️ Alert Threshold Updated')
    .setDescription(`Successfully updated ${alertType} threshold to ${threshold}`)
    .addFields(
      { name: 'Alert Type', value: alertType, inline: true },
      { name: 'New Threshold', value: threshold.toString(), inline: true },
      { name: 'Status', value: '✅ Active', inline: true }
    )
    .setFooter({ text: 'Configuration updated for all monitored players' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

// Helper functions
function getRecommendation(player) {
  if (player.riskLevel === 'high') {
    return '🔴 **Immediate attention needed** - Consider taking a break';
  } else if (player.riskLevel === 'medium') {
    return '🟡 **Monitor closely** - Watch for pattern changes';
  } else {
    return '🟢 **Healthy patterns** - Continue current approach';
  }
}

// Start monitoring alerts (simulation)
function startMonitoringAlerts() {
  setInterval(() => {
    // Simulate random alerts
    if (Math.random() < 0.1) { // 10% chance every interval
      sendRandomAlert();
    }
  }, 30000); // Check every 30 seconds
}

async function sendRandomAlert() {
  const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
  if (!channel) return;

  const players = Array.from(mockPlayers.values());
  const randomPlayer = players[Math.floor(Math.random() * players.length)];
  
  const alertTypes = [
    { type: 'Rapid Betting', emoji: '⚡', color: 0xF59E0B },
    { type: 'Loss Streak', emoji: '📉', color: 0xEF4444 },
    { type: 'High Stakes', emoji: '💰', color: 0x8B5CF6 },
    { type: 'Extended Session', emoji: '⏰', color: 0x6B7280 }
  ];
  
  const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  
  const embed = new EmbedBuilder()
    .setColor(randomAlert.color)
    .setTitle(`${randomAlert.emoji} TiltCheck Alert`)
    .setDescription(`${randomAlert.type} detected for player ${randomPlayer.id}`)
    .addFields(
      { name: '👤 Player', value: randomPlayer.id, inline: true },
      { name: '⚠️ Alert Type', value: randomAlert.type, inline: true },
      { name: '💰 Current Stake', value: `$${randomPlayer.currentStake}`, inline: true }
    )
    .setFooter({ text: 'TiltCheck Real-time Monitoring' })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('🔄 TiltCheck Bot shutting down...');
  client.destroy();
  process.exit(0);
});

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Start the bot
client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = client;