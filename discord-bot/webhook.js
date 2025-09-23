const { WebhookClient, EmbedBuilder } = require('discord.js');
const config = require('./config');

class TiltCheckWebhookManager {
  constructor(webhookUrl) {
    this.webhook = new WebhookClient({ url: webhookUrl });
    this.alertQueue = [];
    this.isProcessing = false;
  }

  /**
   * Send a tilt alert through Discord webhook
   * @param {Object} alert - Alert object from TiltCheck
   */
  async sendTiltAlert(alert) {
    const embed = this.createAlertEmbed(alert);
    
    try {
      await this.webhook.send({
        username: 'TiltCheck Monitor',
        avatarURL: 'https://via.placeholder.com/64x64/EF4444/ffffff?text=⚠️',
        embeds: [embed]
      });
      
      console.log(`✅ Alert sent for player ${alert.playerId}`);
    } catch (error) {
      console.error('❌ Failed to send webhook alert:', error);
    }
  }

  /**
   * Send batch alerts to avoid spam
   * @param {Array} alerts - Array of alert objects
   */
  async sendBatchAlerts(alerts) {
    if (alerts.length === 0) return;

    const embed = new EmbedBuilder()
      .setColor(config.colors.warning)
      .setTitle('🚨 Multiple TiltCheck Alerts')
      .setDescription(`${alerts.length} new alerts detected`)
      .addFields(
        alerts.slice(0, 10).map(alert => ({
          name: `👤 ${alert.playerId}`,
          value: `${this.getAlertEmoji(alert.severity)} ${alert.message}`,
          inline: true
        }))
      )
      .setFooter({ 
        text: alerts.length > 10 ? `Showing 10 of ${alerts.length} alerts` : `${alerts.length} alerts total`
      })
      .setTimestamp();

    try {
      await this.webhook.send({
        username: 'TiltCheck Monitor',
        avatarURL: 'https://via.placeholder.com/64x64/F59E0B/ffffff?text=📊',
        embeds: [embed]
      });
    } catch (error) {
      console.error('❌ Failed to send batch alerts:', error);
    }
  }

  /**
   * Send system status update
   * @param {Object} status - System status object
   */
  async sendStatusUpdate(status) {
    const embed = new EmbedBuilder()
      .setColor(status.online ? config.colors.success : config.colors.error)
      .setTitle('🖥️ TiltCheck System Status')
      .addFields(
        { name: '📊 Status', value: status.online ? '🟢 Online' : '🔴 Offline', inline: true },
        { name: '👥 Players Monitored', value: status.playersMonitored.toString(), inline: true },
        { name: '🚨 Active Alerts', value: status.activeAlerts.toString(), inline: true },
        { name: '⏱️ Uptime', value: status.uptime, inline: true },
        { name: '💾 Memory Usage', value: `${status.memoryUsage}%`, inline: true },
        { name: '🔄 Last Update', value: new Date().toLocaleString(), inline: true }
      )
      .setTimestamp();

    try {
      await this.webhook.send({
        username: 'TiltCheck System',
        avatarURL: 'https://via.placeholder.com/64x64/10B981/ffffff?text=🖥️',
        embeds: [embed]
      });
    } catch (error) {
      console.error('❌ Failed to send status update:', error);
    }
  }

  /**
   * Send daily report
   * @param {Object} report - Daily report data
   */
  async sendDailyReport(report) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.info)
      .setTitle('📈 TiltCheck Daily Report')
      .setDescription(`Summary for ${new Date().toDateString()}`)
      .addFields(
        { name: '👥 Total Players', value: report.totalPlayers.toString(), inline: true },
        { name: '🚨 Total Alerts', value: report.totalAlerts.toString(), inline: true },
        { name: '⚠️ High Risk Players', value: report.highRiskPlayers.toString(), inline: true },
        { name: '💰 Total Stakes Monitored', value: `$${report.totalStakes.toLocaleString()}`, inline: true },
        { name: '⏱️ Avg Session Time', value: `${report.avgSessionTime} min`, inline: true },
        { name: '📊 Detection Accuracy', value: `${report.accuracy}%`, inline: true },
        { 
          name: '🏆 Top Interventions', 
          value: report.topInterventions.map(i => `• ${i.type}: ${i.count}`).join('\n') || 'None',
          inline: false 
        }
      )
      .setFooter({ text: 'Generated automatically by TiltCheck' })
      .setTimestamp();

    try {
      await this.webhook.send({
        username: 'TiltCheck Reports',
        avatarURL: 'https://via.placeholder.com/64x64/8B5CF6/ffffff?text=📊',
        embeds: [embed]
      });
    } catch (error) {
      console.error('❌ Failed to send daily report:', error);
    }
  }

  /**
   * Create embed for individual alert
   * @param {Object} alert - Alert object
   * @returns {EmbedBuilder} Discord embed
   */
  createAlertEmbed(alert) {
    const severityColors = {
      low: config.colors.info,
      medium: config.colors.warning,
      high: config.colors.error,
      critical: 0x991B1B // Dark red
    };

    const embed = new EmbedBuilder()
      .setColor(severityColors[alert.severity] || config.colors.warning)
      .setTitle(`${this.getAlertEmoji(alert.severity)} TiltCheck Alert`)
      .setDescription(alert.message)
      .addFields(
        { name: '👤 Player ID', value: alert.playerId, inline: true },
        { name: '📊 Severity', value: alert.severity.toUpperCase(), inline: true },
        { name: '🎯 Alert Type', value: alert.type, inline: true }
      );

    // Add additional fields based on alert type
    if (alert.currentStake) {
      embed.addFields({ name: '💰 Current Stake', value: `$${alert.currentStake}`, inline: true });
    }

    if (alert.sessionTime) {
      embed.addFields({ name: '⏱️ Session Time', value: `${alert.sessionTime} min`, inline: true });
    }

    if (alert.advice) {
      embed.addFields({ 
        name: '💡 Recommendation', 
        value: this.getAdviceMessage(alert.advice), 
        inline: false 
      });
    }

    embed.setFooter({ text: 'TiltCheck Real-time Monitoring' })
         .setTimestamp();

    return embed;
  }

  /**
   * Get emoji for alert severity
   * @param {string} severity - Alert severity level
   * @returns {string} Appropriate emoji
   */
  getAlertEmoji(severity) {
    const emojis = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🔴'
    };
    return emojis[severity] || '⚠️';
  }

  /**
   * Get advice message
   * @param {string} advice - Advice type
   * @returns {string} Human-readable advice
   */
  getAdviceMessage(advice) {
    const messages = {
      foldEm: '🃏 **Time to Fold \'Em** - Consider taking a break',
      holdEm: '🤝 **Hold \'Em Strong** - Monitor closely but continue',
      vault: '🏦 **Vault Those Winnings** - Secure your profits',
      break: '☕ **Take a Break** - Step away for a few minutes'
    };
    return messages[advice] || '🎯 Stay alert and play responsibly';
  }

  /**
   * Test webhook connection
   */
  async testConnection() {
    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('✅ TiltCheck Webhook Test')
      .setDescription('Webhook connection is working properly!')
      .setTimestamp();

    try {
      await this.webhook.send({
        username: 'TiltCheck Test',
        avatarURL: 'https://via.placeholder.com/64x64/10B981/ffffff?text=✅',
        embeds: [embed]
      });
      return true;
    } catch (error) {
      console.error('❌ Webhook test failed:', error);
      return false;
    }
  }
}

module.exports = TiltCheckWebhookManager;