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

const Discord = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

class EcosystemManager {
    constructor() {
        this.ecosystemData = {
            trapHouseBot: {
                status: 'online',
                uptime: null,
                activeUsers: 0,
                totalLoans: 0,
                startTime: Date.now()
            },
            justTheTip: {
                status: 'active',
                totalTips: 0,
                vaultRecommendations: 0,
                buddyMatches: 0
            },
            collectClock: {
                status: 'synced',
                platformsTracked: 15,
                activeStreaks: 0,
                dailyCollections: 0
            },
            tiltCheck: {
                status: 'monitoring',
                alertsToday: 0,
                usersMonitored: 0,
                highRiskUsers: 0
            },
            github: {
                status: 'connected',
                recentCommits: 0,
                openIssues: 0,
                deployments: 0
            }
        };
        
        this.activityLog = [];
        this.maxLogEntries = 50;
    }

    // Calculate bot uptime
    getUptime() {
        const uptime = Date.now() - this.ecosystemData.trapHouseBot.startTime;
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    // Log activity across ecosystem
    logActivity(system, message, type = 'info') {
        const activity = {
            timestamp: Date.now(),
            system,
            message,
            type
        };
        
        this.activityLog.unshift(activity);
        if (this.activityLog.length > this.maxLogEntries) {
            this.activityLog.pop();
        }
    }

    // Update ecosystem stats
    updateStats(system, updates) {
        if (this.ecosystemData[system]) {
            Object.assign(this.ecosystemData[system], updates);
        }
    }

    // Get system health score
    getHealthScore() {
        const systems = Object.keys(this.ecosystemData);
        const onlineSystems = systems.filter(system => {
            const status = this.ecosystemData[system].status;
            return ['online', 'active', 'synced', 'monitoring', 'connected'].includes(status);
        });
        
        return Math.round((onlineSystems.length / systems.length) * 100);
    }

    // Create ecosystem status embed
    createStatusEmbed(guild) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('🏠 TrapHouse Ecosystem Status')
            .setDescription('Made for degens by degens - Complete system overview')
            .setColor('#9333EA')
            .setTimestamp();

        // System status overview
        const statusField = this.getSystemStatusField();
        embed.addFields(statusField);

        // Key metrics
        const metricsField = this.getKeyMetricsField();
        embed.addFields(metricsField);

        // Health score
        const healthScore = this.getHealthScore();
        const healthEmoji = healthScore >= 90 ? '🟢' : healthScore >= 70 ? '🟡' : '🔴';
        embed.addFields({
            name: `${healthEmoji} System Health`,
            value: `**${healthScore}%** - ${this.getHealthStatus(healthScore)}`,
            inline: true
        });

        // Uptime
        embed.addFields({
            name: '⏱️ Bot Uptime',
            value: this.getUptime(),
            inline: true
        });

        // Quick links
        embed.addFields({
            name: '🔗 Quick Links',
            value: '[CollectClock](https://jmenichole.github.io/CollectClock/) • [TrapHouse Site](https://traphousediscordbot.created.app) • [Portfolio](https://jmenichole.github.io/Portfolio/) • [GitHub](https://github.com/jmenichole/)',
            inline: false
        });

        return embed;
    }

    getSystemStatusField() {
        const systems = [
            { name: 'TrapHouse Bot', key: 'trapHouseBot', emoji: '🏠' },
            { name: 'JustTheTip', key: 'justTheTip', emoji: '💡' },
            { name: 'CollectClock', key: 'collectClock', emoji: '💧' },
            { name: 'TiltCheck', key: 'tiltCheck', emoji: '🎰' },
            { name: 'GitHub', key: 'github', emoji: '🐙' }
        ];

        const statusText = systems.map(system => {
            const data = this.ecosystemData[system.key];
            const statusEmoji = this.getStatusEmoji(data.status);
            return `${system.emoji} ${system.name}: ${statusEmoji} ${data.status}`;
        }).join('\n');

        return {
            name: '📊 System Status',
            value: statusText,
            inline: false
        };
    }

    getKeyMetricsField() {
        const metrics = [
            `💰 Total Loans: ${this.ecosystemData.trapHouseBot.totalLoans}`,
            `👥 Active Users: ${this.ecosystemData.trapHouseBot.activeUsers}`,
            `💡 Tips Given: ${this.ecosystemData.justTheTip.totalTips}`,
            `💧 Daily Collections: ${this.ecosystemData.collectClock.dailyCollections}`,
            `🎰 TiltCheck Alerts: ${this.ecosystemData.tiltCheck.alertsToday}`,
            `⚠️ High Risk Users: ${this.ecosystemData.tiltCheck.highRiskUsers}`
        ];

        return {
            name: '📈 Key Metrics',
            value: metrics.join('\n'),
            inline: false
        };
    }

    getStatusEmoji(status) {
        switch (status) {
            case 'online':
            case 'active':
            case 'synced':
            case 'monitoring':
            case 'connected':
                return '🟢';
            case 'paused':
                return '🟡';
            case 'offline':
            case 'inactive':
            case 'error':
            case 'disconnected':
                return '🔴';
            default:
                return '⚪';
        }
    }

    getHealthStatus(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        return 'Poor';
    }

    // Create recent activity embed
    createActivityEmbed() {
        const embed = new Discord.EmbedBuilder()
            .setTitle('📊 Recent Ecosystem Activity')
            .setColor('#059669')
            .setTimestamp();

        if (this.activityLog.length === 0) {
            embed.setDescription('No recent activity to display.');
            return embed;
        }

        const recentActivities = this.activityLog.slice(0, 10);
        const activityText = recentActivities.map(activity => {
            const timeAgo = this.getTimeAgo(activity.timestamp);
            const emoji = this.getActivityEmoji(activity.system);
            return `${emoji} **${activity.system}**: ${activity.message} *${timeAgo}*`;
        }).join('\n\n');

        embed.setDescription(activityText);
        return embed;
    }

    getActivityEmoji(system) {
        const emojis = {
            'trapHouseBot': '🏠',
            'justTheTip': '💡',
            'collectClock': '💧',
            'tiltCheck': '🎰',
            'github': '🐙'
        };
        return emojis[system] || '⚡';
    }

    getTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    // Handle ecosystem command
    async handleEcosystemCommand(message, args) {
        if (!args || args.length === 0) {
            // Show main status
            const embed = this.createStatusEmbed(message.guild);
            return message.reply({ embeds: [embed] });
        }

        const subcommand = args[0].toLowerCase();

        switch (subcommand) {
            case 'activity':
                const activityEmbed = this.createActivityEmbed();
                return message.reply({ embeds: [activityEmbed] });

            case 'links':
                return this.sendQuickLinks(message);

            case 'health':
                return this.sendHealthDetails(message);

            case 'stats':
                return this.sendDetailedStats(message);

            default:
                return message.reply('Available subcommands: `activity`, `links`, `health`, `stats`');
        }
    }

    async sendQuickLinks(message) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('🔗 TrapHouse Ecosystem Links')
            .setColor('#3B82F6')
            .addFields(
                {
                    name: '💧 CollectClock',
                    value: '[Daily Bonus Tracker](https://jmenichole.github.io/CollectClock/)\nTrack your daily collections across 15 platforms',
                    inline: true
                },
                {
                    name: '🏠 TrapHouse Site',
                    value: '[Main Website](https://traphousediscordbot.created.app)\nOfficial TrapHouse Discord bot homepage',
                    inline: true
                },
                {
                    name: '🌟 Portfolio',
                    value: '[Developer Portfolio](https://jmenichole.github.io/Portfolio/)\nShowcase of all TrapHouse projects',
                    inline: true
                },
                {
                    name: '🐙 GitHub',
                    value: '[Source Code](https://github.com/jmenichole/)\nAll repositories and development',
                    inline: true
                },
                {
                    name: '💡 JustTheTip Terms',
                    value: '[Legal Framework](https://github.com/jmenichole/JustTheTip-Terms)\nCompliance and privacy policies',
                    inline: true
                },
                {
                    name: '🎰 TiltCheck Audit',
                    value: '[Gambling Analysis](https://github.com/jmenichole/TiltCheck)\nBehavior monitoring system',
                    inline: true
                }
            )
            .setFooter({ text: 'Made for degens by degens' });

        return message.reply({ embeds: [embed] });
    }

    async sendHealthDetails(message) {
        const healthScore = this.getHealthScore();
        const embed = new Discord.EmbedBuilder()
            .setTitle('🏥 System Health Details')
            .setColor(healthScore >= 90 ? '#10B981' : healthScore >= 70 ? '#F59E0B' : '#EF4444')
            .addFields(
                {
                    name: '📊 Overall Health Score',
                    value: `**${healthScore}%** - ${this.getHealthStatus(healthScore)}`,
                    inline: false
                },
                {
                    name: '⏱️ Uptime',
                    value: this.getUptime(),
                    inline: true
                },
                {
                    name: '🔄 Last Update',
                    value: 'Just now',
                    inline: true
                }
            );

        // Add individual system health
        const systems = Object.keys(this.ecosystemData);
        const systemHealth = systems.map(system => {
            const data = this.ecosystemData[system];
            const emoji = this.getStatusEmoji(data.status);
            return `${emoji} ${system}: ${data.status}`;
        }).join('\n');

        embed.addFields({
            name: '🔧 Individual Systems',
            value: systemHealth,
            inline: false
        });

        return message.reply({ embeds: [embed] });
    }

    async sendDetailedStats(message) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('📈 Detailed Ecosystem Statistics')
            .setColor('#8B5CF6')
            .addFields(
                {
                    name: '🏠 TrapHouse Bot',
                    value: `Active Users: ${this.ecosystemData.trapHouseBot.activeUsers}\nTotal Loans: ${this.ecosystemData.trapHouseBot.totalLoans}\nUptime: ${this.getUptime()}`,
                    inline: true
                },
                {
                    name: '💡 JustTheTip',
                    value: `Total Tips: ${this.ecosystemData.justTheTip.totalTips}\nVault Recommendations: ${this.ecosystemData.justTheTip.vaultRecommendations}\nBuddy Matches: ${this.ecosystemData.justTheTip.buddyMatches}`,
                    inline: true
                },
                {
                    name: '💧 CollectClock',
                    value: `Platforms Tracked: ${this.ecosystemData.collectClock.platformsTracked}\nActive Streaks: ${this.ecosystemData.collectClock.activeStreaks}\nDaily Collections: ${this.ecosystemData.collectClock.dailyCollections}`,
                    inline: true
                },
                {
                    name: '🎰 TiltCheck',
                    value: `Users Monitored: ${this.ecosystemData.tiltCheck.usersMonitored}\nAlerts Today: ${this.ecosystemData.tiltCheck.alertsToday}\nHigh Risk Users: ${this.ecosystemData.tiltCheck.highRiskUsers}`,
                    inline: true
                },
                {
                    name: '🐙 GitHub',
                    value: `Recent Commits: ${this.ecosystemData.github.recentCommits}\nOpen Issues: ${this.ecosystemData.github.openIssues}\nDeployments: ${this.ecosystemData.github.deployments}`,
                    inline: true
                },
                {
                    name: '📊 Activity',
                    value: `Log Entries: ${this.activityLog.length}\nLast Activity: ${this.activityLog.length > 0 ? this.getTimeAgo(this.activityLog[0].timestamp) : 'None'}`,
                    inline: true
                }
            )
            .setFooter({ text: 'Stats updated in real-time' });

        return message.reply({ embeds: [embed] });
    }

    // Initialize ecosystem integration
    async initialize() {
        this.logActivity('trapHouseBot', 'Ecosystem manager initialized', 'success');
        
        // Set initial stats
        this.updateStats('trapHouseBot', { 
            status: 'online',
            uptime: this.getUptime()
        });

        console.log('🌐 Ecosystem Manager initialized successfully');
    }
}

module.exports = EcosystemManager;
