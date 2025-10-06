const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  name: 'help',
  description: 'Show all available TiltCheck commands',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle('🤖 TiltCheck Bot Commands')
      .setDescription('Here are all the available commands for the TiltCheck monitoring system:')
      .addFields(
        {
          name: '📊 Monitoring Commands',
          value: '`/tilt-status` - Check current monitoring status\n`/player-stats <playerid>` - Get detailed player statistics\n`/active-alerts` - View all active alerts',
          inline: false
        },
        {
          name: '⚙️ Configuration Commands',
          value: '`/set-alert <type> <threshold>` - Configure alert thresholds\n`/get-config` - View current configuration\n`/reset-config` - Reset to default settings',
          inline: false
        },
        {
          name: '🛡️ Responsible Gaming',
          value: '`/gaming-tip` - Get a responsible gaming tip\n`/vault-reminder` - Send vault reminders\n`/help-resources` - Get support resources',
          inline: false
        },
        {
          name: '🔧 Utility Commands',
          value: '`/ping` - Check bot responsiveness\n`/uptime` - Show bot uptime\n`/version` - Show bot version',
          inline: false
        }
      )
      .setFooter({ 
        text: 'TiltCheck - Promoting Responsible Gaming',
        iconURL: 'https://via.placeholder.com/32x32/3B82F6/ffffff?text=TC'
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};