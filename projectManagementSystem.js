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
 * Enhanced Project Management System with Scrum Integration
 * Keeps the team organized with sprints, backlogs, and accountability
 */

const { EmbedBuilder } = require('discord.js');

class ProjectManagementSystem {
    constructor() {
        this.projects = new Map(); // projectId -> project data
        this.sprints = new Map(); // sprintId -> sprint data
        this.userTasks = new Map(); // userId -> tasks
        this.teamMembers = new Map(); // userId -> team member data
        this.dailyStandups = new Map(); // date -> standup data
        this.retrospectives = new Map(); // sprintId -> retro data
    }

    // Initialize or join a project
    async createProject(message, args) {
        if (args.length < 1) {
            return await message.reply(`❌ **Usage:** \`$scrum create <project_name> [description]\`

**Examples:**
• \`$scrum create "TrapHouse Bot v2" "Discord bot ecosystem expansion"\`
• \`$scrum create "Crypto Trading Tools" "DeFi integration project"\`
• \`$scrum create "Support System" "Customer support infrastructure"\``);
        }

        const projectName = args[0];
        const description = args.slice(1).join(' ') || 'No description provided';
        const userId = message.author.id;
        const projectId = Date.now().toString();

        const project = {
            id: projectId,
            name: projectName,
            description: description,
            owner: userId,
            teamMembers: [userId],
            created: new Date(),
            status: 'active',
            currentSprint: null,
            backlog: [],
            completed: [],
            velocity: []
        };

        this.projects.set(projectId, project);

        // Add user as team member
        if (!this.teamMembers.has(userId)) {
            this.teamMembers.set(userId, {
                projects: [],
                role: 'Product Owner',
                totalStoryPoints: 0,
                completedTasks: 0
            });
        }
        this.teamMembers.get(userId).projects.push(projectId);

        const embed = new EmbedBuilder()
            .setColor('#28a745')
            .setTitle('📋 Project Created!')
            .setDescription(`**${projectName}** is ready for action!`)
            .addFields(
                {
                    name: '📝 Description',
                    value: description,
                    inline: false
                },
                {
                    name: '👥 Team',
                    value: `<@${userId}> (Product Owner)`,
                    inline: true
                },
                {
                    name: '🎯 Next Steps',
                    value: `• Add team members: \`$scrum invite @user\`\n• Create backlog items: \`$scrum backlog add\`\n• Start first sprint: \`$scrum sprint start\``,
                    inline: false
                }
            )
            .setFooter({ text: `Project ID: ${projectId} • Agile = Adaptive` });

        await message.reply({ embeds: [embed] });
    }

    // Add items to product backlog
    async addBacklogItem(message, args) {
        if (args.length < 2) {
            return await message.reply(`❌ **Usage:** \`$scrum backlog add <story_points> <description>\`

**Examples:**
• \`$scrum backlog add 5 "User authentication system"\`
• \`$scrum backlog add 8 "Payment processing integration"\`
• \`$scrum backlog add 3 "Update help documentation"\`

**Story Points Guide:**
• **1-2**: Quick fixes, small updates
• **3-5**: Standard features, moderate complexity
• **8-13**: Complex features, significant work
• **21+**: Epic tasks (should be broken down)`);
        }

        const storyPoints = parseInt(args[0]);
        const description = args.slice(1).join(' ');
        const userId = message.author.id;

        if (isNaN(storyPoints) || storyPoints <= 0) {
            return await message.reply('❌ Please provide valid story points (positive number)!');
        }

        // Find user's active project
        const userProjects = Array.from(this.projects.values()).filter(p => 
            p.teamMembers.includes(userId) && p.status === 'active'
        );

        if (userProjects.length === 0) {
            return await message.reply('❌ You\'re not part of any active projects! Create one with `$scrum create`');
        }

        const project = userProjects[0]; // Use first active project for now

        const backlogItem = {
            id: Date.now(),
            description: description,
            storyPoints: storyPoints,
            priority: this.calculatePriority(description, storyPoints),
            assignee: null,
            status: 'backlog',
            createdBy: userId,
            created: new Date(),
            acceptance: this.generateAcceptanceCriteria(description)
        };

        project.backlog.push(backlogItem);

        const embed = new EmbedBuilder()
            .setColor('#17a2b8')
            .setTitle('📋 Backlog Item Added!')
            .setDescription(`**${description}**`)
            .addFields(
                {
                    name: '📊 Details',
                    value: `**Story Points:** ${storyPoints}\n**Priority:** ${backlogItem.priority}\n**Status:** Backlog`,
                    inline: true
                },
                {
                    name: '✅ Acceptance Criteria',
                    value: backlogItem.acceptance.slice(0, 3).map(c => `• ${c}`).join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: `Project: ${project.name} • Ready for sprint planning` });

        await message.reply({ embeds: [embed] });
    }

    // Start a new sprint
    async startSprint(message, args) {
        const userId = message.author.id;
        const duration = parseInt(args[0]) || 14; // Default 2 weeks

        if (duration < 7 || duration > 30) {
            return await message.reply('❌ Sprint duration must be between 7-30 days!');
        }

        const userProjects = Array.from(this.projects.values()).filter(p => 
            p.teamMembers.includes(userId) && p.status === 'active'
        );

        if (userProjects.length === 0) {
            return await message.reply('❌ No active projects found!');
        }

        const project = userProjects[0];

        if (project.currentSprint) {
            return await message.reply('❌ A sprint is already active! End it first with `$scrum sprint end`');
        }

        const sprintId = `${project.id}_${Date.now()}`;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        const sprint = {
            id: sprintId,
            projectId: project.id,
            name: `Sprint ${this.getSprintNumber(project.id)}`,
            startDate: new Date(),
            endDate: endDate,
            duration: duration,
            status: 'active',
            items: [],
            burndown: [],
            dailyStandups: []
        };

        this.sprints.set(sprintId, sprint);
        project.currentSprint = sprintId;

        const embed = new EmbedBuilder()
            .setColor('#ffc107')
            .setTitle('🚀 Sprint Started!')
            .setDescription(`**${sprint.name}** is now active!`)
            .addFields(
                {
                    name: '📅 Timeline',
                    value: `**Start:** ${sprint.startDate.toLocaleDateString()}\n**End:** ${endDate.toLocaleDateString()}\n**Duration:** ${duration} days`,
                    inline: true
                },
                {
                    name: '📋 Sprint Backlog',
                    value: 'Empty - Add items with `$scrum sprint add`',
                    inline: true
                },
                {
                    name: '🎯 Sprint Goals',
                    value: `• Plan sprint backlog\n• Conduct daily standups\n• Deliver working increment\n• Hold retrospective`,
                    inline: false
                }
            )
            .setFooter({ text: `Project: ${project.name} • Sprint velocity tracking active` });

        await message.reply({ embeds: [embed] });
    }

    // Daily standup
    async dailyStandup(message, args) {
        if (args.length < 1) {
            return await message.reply(`❌ **Daily Standup Format:**

\`$scrum standup "What I did yesterday" "What I'll do today" "Any blockers"\`

**Example:**
\`$scrum standup "Fixed user auth bug, updated docs" "Work on payment integration" "Need API keys from DevOps"\`

**Quick Standup:**
\`$scrum standup quick\` - Use guided questions`);
        }

        const userId = message.author.id;
        const today = new Date().toDateString();

        if (args[0] === 'quick') {
            return await this.quickStandup(message);
        }

        // Parse standup answers
        const standupText = args.join(' ');
        const answers = this.parseStandupAnswers(standupText);

        if (!this.dailyStandups.has(today)) {
            this.dailyStandups.set(today, []);
        }

        const standup = {
            userId: userId,
            date: today,
            yesterday: answers.yesterday,
            today: answers.today,
            blockers: answers.blockers,
            timestamp: new Date()
        };

        this.dailyStandups.get(today).push(standup);

        const embed = new EmbedBuilder()
            .setColor('#6f42c1')
            .setTitle('🗣️ Daily Standup Recorded!')
            .setDescription(`Thanks for the update, <@${userId}>!`)
            .addFields(
                {
                    name: '✅ Yesterday',
                    value: answers.yesterday || 'Nothing specified',
                    inline: false
                },
                {
                    name: '🎯 Today',
                    value: answers.today || 'Nothing planned',
                    inline: false
                },
                {
                    name: '🚧 Blockers',
                    value: answers.blockers || 'No blockers',
                    inline: false
                }
            )
            .setFooter({ text: 'Daily transparency = Team success' });

        await message.reply({ embeds: [embed] });

        // Check if all team members have reported
        await this.checkStandupCompleteness(message, today);
    }

    // Sprint review and retrospective
    async sprintRetrospective(message, args) {
        const userId = message.author.id;
        
        const userProjects = Array.from(this.projects.values()).filter(p => 
            p.teamMembers.includes(userId) && p.status === 'active'
        );

        if (userProjects.length === 0) {
            return await message.reply('❌ No active projects found!');
        }

        const project = userProjects[0];
        const sprintId = project.currentSprint;

        if (!sprintId) {
            return await message.reply('❌ No active sprint to review!');
        }

        const sprint = this.sprints.get(sprintId);
        const velocity = this.calculateSprintVelocity(sprint);
        
        const retro = {
            sprintId: sprintId,
            date: new Date(),
            velocity: velocity,
            completed: sprint.items.filter(item => item.status === 'done').length,
            total: sprint.items.length,
            whatWentWell: [],
            whatCouldImprove: [],
            actionItems: []
        };

        this.retrospectives.set(sprintId, retro);
        project.velocity.push(velocity);

        const embed = new EmbedBuilder()
            .setColor('#dc3545')
            .setTitle('🔄 Sprint Retrospective')
            .setDescription(`**${sprint.name}** Review & Planning`)
            .addFields(
                {
                    name: '📊 Sprint Metrics',
                    value: `**Velocity:** ${velocity} story points\n**Completed:** ${retro.completed}/${retro.total} items\n**Success Rate:** ${((retro.completed/retro.total)*100).toFixed(1)}%`,
                    inline: true
                },
                {
                    name: '📈 Team Performance',
                    value: `**Average Velocity:** ${this.getAverageVelocity(project.velocity)}\n**Trending:** ${this.getVelocityTrend(project.velocity)}\n**Predictability:** ${this.getPredictability(project.velocity)}`,
                    inline: true
                },
                {
                    name: '🎯 Next Sprint Planning',
                    value: `Based on velocity, plan for **${Math.round(velocity * 0.9)}-${Math.round(velocity * 1.1)}** story points`,
                    inline: false
                }
            );

        // End current sprint
        sprint.status = 'completed';
        project.currentSprint = null;

        await message.reply({ embeds: [embed] });
    }

    // Show project dashboard
    async showDashboard(message) {
        const userId = message.author.id;
        
        const userProjects = Array.from(this.projects.values()).filter(p => 
            p.teamMembers.includes(userId)
        );

        if (userProjects.length === 0) {
            return await message.reply(`📋 **No projects found!**

**Get started with Scrum:**
• \`$scrum create "Project Name"\` - Create new project
• \`$scrum join <project_id>\` - Join existing project
• \`$scrum help\` - Learn all commands

**Why use Scrum?**
• Organized development cycles
• Clear accountability and progress tracking
• Team collaboration and transparency
• Predictable delivery timelines`);
        }

        const project = userProjects[0]; // Show first project
        const currentSprint = project.currentSprint ? this.sprints.get(project.currentSprint) : null;
        
        const embed = new EmbedBuilder()
            .setColor('#007bff')
            .setTitle(`📊 Project Dashboard: ${project.name}`)
            .setDescription(project.description);

        // Project overview
        embed.addFields({
            name: '👥 Team',
            value: `${project.teamMembers.length} members\n**Owner:** <@${project.owner}>`,
            inline: true
        });

        // Current sprint info
        if (currentSprint) {
            const daysLeft = Math.ceil((currentSprint.endDate - new Date()) / (1000 * 60 * 60 * 24));
            embed.addFields({
                name: '🚀 Current Sprint',
                value: `**${currentSprint.name}**\n${daysLeft} days remaining\n${currentSprint.items.length} items in progress`,
                inline: true
            });
        } else {
            embed.addFields({
                name: '🚀 Sprint Status',
                value: 'No active sprint\nUse `$scrum sprint start` to begin',
                inline: true
            });
        }

        // Backlog status
        embed.addFields({
            name: '📋 Product Backlog',
            value: `${project.backlog.length} items ready\n${project.completed.length} items completed`,
            inline: true
        });

        // Velocity chart (if available)
        if (project.velocity.length > 0) {
            const avgVelocity = this.getAverageVelocity(project.velocity);
            embed.addFields({
                name: '📈 Team Velocity',
                value: `**Average:** ${avgVelocity} points/sprint\n**Last Sprint:** ${project.velocity[project.velocity.length - 1]} points\n**Trend:** ${this.getVelocityTrend(project.velocity)}`,
                inline: false
            });
        }

        embed.setFooter({ text: `Project ID: ${project.id} • Agile methodology in action` });

        await message.reply({ embeds: [embed] });
    }

    // Helper methods
    calculatePriority(description, storyPoints) {
        const descLower = description.toLowerCase();
        const urgentKeywords = ['bug', 'critical', 'urgent', 'security', 'fix'];
        const highKeywords = ['user', 'payment', 'auth', 'core', 'main'];
        
        if (urgentKeywords.some(keyword => descLower.includes(keyword))) return 'Critical';
        if (highKeywords.some(keyword => descLower.includes(keyword)) || storyPoints >= 8) return 'High';
        if (storyPoints >= 5) return 'Medium';
        return 'Low';
    }

    generateAcceptanceCriteria(description) {
        // Basic acceptance criteria generation based on description
        const criteria = [
            'Feature functions as described',
            'No breaking changes to existing functionality',
            'Code follows team standards'
        ];

        const descLower = description.toLowerCase();
        if (descLower.includes('user')) criteria.push('User experience is intuitive');
        if (descLower.includes('api')) criteria.push('API endpoints return correct responses');
        if (descLower.includes('test')) criteria.push('Unit tests cover new functionality');
        if (descLower.includes('auth')) criteria.push('Security requirements are met');

        return criteria;
    }

    getSprintNumber(projectId) {
        const sprintsForProject = Array.from(this.sprints.values())
            .filter(s => s.projectId === projectId).length;
        return sprintsForProject + 1;
    }

    parseStandupAnswers(text) {
        // Simple parsing - could be enhanced with better NLP
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
        
        return {
            yesterday: sentences[0] || '',
            today: sentences[1] || '',
            blockers: sentences[2] || ''
        };
    }

    calculateSprintVelocity(sprint) {
        return sprint.items
            .filter(item => item.status === 'done')
            .reduce((sum, item) => sum + item.storyPoints, 0);
    }

    getAverageVelocity(velocities) {
        if (velocities.length === 0) return 0;
        const sum = velocities.reduce((a, b) => a + b, 0);
        return Math.round(sum / velocities.length);
    }

    getVelocityTrend(velocities) {
        if (velocities.length < 2) return 'Not enough data';
        const recent = velocities.slice(-3);
        const older = velocities.slice(-6, -3);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
        
        if (recentAvg > olderAvg * 1.1) return '📈 Improving';
        if (recentAvg < olderAvg * 0.9) return '📉 Declining';
        return '➡️ Stable';
    }

    getPredictability(velocities) {
        if (velocities.length < 3) return 'Not enough data';
        const avg = this.getAverageVelocity(velocities);
        const variance = velocities.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / velocities.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev < avg * 0.2) return 'High';
        if (stdDev < avg * 0.4) return 'Medium';
        return 'Low';
    }

    async quickStandup(message) {
        // Interactive standup flow - placeholder for implementation
        await message.reply('🗣️ **Quick Standup Guide:**\n\nReply with: `$scrum standup "yesterday work" "today plans" "any blockers"`');
    }

    async checkStandupCompleteness(message, date) {
        const standups = this.dailyStandups.get(date) || [];
        const totalTeamMembers = new Set();
        
        // Count unique team members across all projects
        for (const project of this.projects.values()) {
            project.teamMembers.forEach(member => totalTeamMembers.add(member));
        }

        if (standups.length >= totalTeamMembers.size) {
            await message.channel.send('✅ **All team members have completed their daily standup!** Great team discipline! 🎉');
        }
    }
}

module.exports = ProjectManagementSystem;
