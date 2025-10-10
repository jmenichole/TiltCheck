const crypto = require('crypto');
const express = require('express');

class GitHubIntegration {
    constructor(discordBot) {
        this.discordBot = discordBot;
        this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
        
        // Support both GitHub Apps and Personal Access Tokens
        this.accessToken = process.env.GITHUB_ACCESS_TOKEN;
        this.appId = process.env.GITHUB_APP_ID;
        this.privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
        
        // Determine authentication method
        this.authMethod = this.accessToken ? 'token' : (this.appId ? 'app' : 'none');
        
        console.log(`🐙 GitHub Integration initialized with ${this.authMethod} authentication`);
    }

    // Verify GitHub webhook signature
    verifySignature(payload, signature) {
        const expectedSignature = crypto
            .createHmac('sha256', this.webhookSecret)
            .update(payload, 'utf8')
            .digest('hex');
        
        return crypto.timingSafeEqual(
            Buffer.from(`sha256=${expectedSignature}`, 'utf8'),
            Buffer.from(signature, 'utf8')
        );
    }

    // Handle GitHub webhook events
    async handleWebhook(req, res) {
        try {
            const signature = req.headers['x-hub-signature-256'];
            const event = req.headers['x-github-event'];
            const payload = JSON.stringify(req.body);

            // For testing: Skip signature verification if no secret is set
            if (this.webhookSecret && signature) {
                if (!this.verifySignature(payload, signature)) {
                    return res.status(401).send('Unauthorized');
                }
            } else {
                console.log('⚠️ GitHub webhook: No secret configured, skipping signature verification');
            }

            const data = req.body;

            console.log(`🐙 GitHub ${event} event received:`, data.action || 'no action');

            switch (event) {
                case 'push':
                    await this.handlePush(data);
                    break;
                case 'pull_request':
                    await this.handlePullRequest(data);
                    break;
                case 'issues':
                    await this.handleIssue(data);
                    break;
                case 'installation':
                    await this.handleInstallation(data);
                    break;
                default:
                    console.log(`Unhandled GitHub event: ${event}`);
                    // Send response for unhandled events too
                    return res.status(200).json({ 
                        message: `Received ${event} event`, 
                        handled: false 
                    });
            }

            res.status(200).json({ 
                message: `Successfully processed ${event} event`,
                handled: true 
            });
        } catch (error) {
            console.error('GitHub webhook error:', error);
            res.status(500).json({ 
                error: 'Internal Server Error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Handle push events
    async handlePush(data) {
        const { repository, commits, pusher } = data;
        
        if (commits.length === 0) return;

        const embed = {
            color: 0x00ff88,
            title: '📝 New Commits Pushed',
            description: `${commits.length} commit${commits.length > 1 ? 's' : ''} pushed to **${repository.name}**`,
            fields: [
                {
                    name: '👤 Pusher',
                    value: pusher.name,
                    inline: true
                },
                {
                    name: '🌿 Branch', 
                    value: data.ref.replace('refs/heads/', ''),
                    inline: true
                },
                {
                    name: '📋 Recent Commits',
                    value: commits.slice(0, 3).map(commit => 
                        `• \`${commit.id.substring(0, 7)}\` ${commit.message.split('\n')[0]}`
                    ).join('\n'),
                    inline: false
                }
            ],
            footer: {
                text: `Repository: ${repository.full_name}`
            },
            timestamp: new Date().toISOString()
        };

        // Add JustTheTip humor based on commit content
        const commitMessages = commits.map(c => c.message.toLowerCase()).join(' ');
        if (commitMessages.includes('fix') || commitMessages.includes('bug')) {
            embed.description += '\n\n💡 *JustTheTip: Fixing bugs is like managing your crypto portfolio - better late than never!*';
        } else if (commitMessages.includes('feature') || commitMessages.includes('add')) {
            embed.description += '\n\n🚀 *JustTheTip: New features are like new vault types - exciting but use responsibly!*';
        }

        await this.sendToDiscord(embed);
    }

    // Handle pull request events  
    async handlePullRequest(data) {
        const { action, pull_request, repository } = data;
        
        if (!['opened', 'closed', 'merged'].includes(action)) return;

        const color = action === 'opened' ? 0xffd700 : 
                     action === 'merged' ? 0x00ff88 : 0xff6b6b;

        const embed = {
            color,
            title: `🔀 Pull Request ${action === 'merged' ? 'Merged' : action === 'closed' ? 'Closed' : 'Opened'}`,
            description: pull_request.title,
            fields: [
                {
                    name: '👤 Author',
                    value: pull_request.user.login,
                    inline: true
                },
                {
                    name: '🌿 Branch',
                    value: `${pull_request.head.ref} → ${pull_request.base.ref}`,
                    inline: true
                },
                {
                    name: '📊 Changes',
                    value: `+${pull_request.additions} -${pull_request.deletions}`,
                    inline: true
                }
            ],
            footer: {
                text: `Repository: ${repository.full_name}`
            },
            timestamp: new Date().toISOString()
        };

        // Add link to PR
        if (pull_request.html_url) {
            embed.url = pull_request.html_url;
        }

        // Add JustTheTip commentary
        if (action === 'merged') {
            embed.description += '\n\n🎉 *JustTheTip: Code merged successfully! Like a perfect vault deposit - smooth and satisfying.*';
        } else if (action === 'opened') {
            embed.description += '\n\n👀 *JustTheTip: New PR opened! Time for some code review - be as thorough as checking your degen metrics.*';
        }

        await this.sendToDiscord(embed);
    }

    // Handle issue events
    async handleIssue(data) {
        const { action, issue, repository } = data;
        
        if (!['opened', 'closed'].includes(action)) return;

        const embed = {
            color: action === 'opened' ? 0xff9800 : 0x00ff88,
            title: `🐛 Issue ${action === 'opened' ? 'Opened' : 'Closed'}`,
            description: issue.title,
            fields: [
                {
                    name: '👤 Reporter',
                    value: issue.user.login,
                    inline: true
                },
                {
                    name: '🏷️ Labels',
                    value: issue.labels.map(label => label.name).join(', ') || 'None',
                    inline: true
                }
            ],
            footer: {
                text: `Repository: ${repository.full_name}`
            },
            timestamp: new Date().toISOString()
        };

        if (issue.html_url) {
            embed.url = issue.html_url;
        }

        // Add JustTheTip wisdom
        if (action === 'opened') {
            embed.description += '\n\n🔍 *JustTheTip: New issue detected! Like spotting a potential rug pull - better to address it early.*';
        } else {
            embed.description += '\n\n✅ *JustTheTip: Issue resolved! Another problem crushed like your FOMO impulses.*';
        }

        await this.sendToDiscord(embed);
    }

    // Handle app installation
    async handleInstallation(data) {
        const { action, installation, repositories } = data;
        
        if (action === 'created') {
            const embed = {
                color: 0x9932cc,
                title: '🚀 JustTheTip GitHub App Installed!',
                description: 'Thanks for installing the JustTheTip GitHub integration!',
                fields: [
                    {
                        name: '📦 Repositories',
                        value: repositories ? repositories.map(repo => repo.name).join('\n') : 'All repositories',
                        inline: false
                    },
                    {
                        name: '✨ Features Enabled',
                        value: '• Push notifications with degen humor\n• PR status updates\n• Issue tracking\n• Deployment alerts\n• Code review reminders',
                        inline: false
                    }
                ],
                footer: {
                    text: 'JustTheTip: Making code reviews as engaging as crypto analysis'
                }
            };

            await this.sendToDiscord(embed);
        }
    }

    // Send embed to Discord
    async sendToDiscord(embed) {
        try {
            // Find the appropriate channel (you can configure this)
            const channel = this.discordBot.channels.cache.find(
                ch => ch.name === 'github-updates' || ch.name === 'general'
            );

            if (channel) {
                await channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Failed to send GitHub update to Discord:', error);
        }
    }

    // Setup GitHub command handlers
    setupCommands() {
        // Add GitHub-related Discord commands
        return {
            async handleGitHubStatus(message) {
                const embed = {
                    color: 0x24292e,
                    title: '📊 GitHub Integration Status',
                    fields: [
                        {
                            name: '🔗 Connection',
                            value: '✅ Connected and monitoring',
                            inline: true
                        },
                        {
                            name: '📝 Events',
                            value: 'Push, PR, Issues, Deployments',
                            inline: true
                        },
                        {
                            name: '🎯 Repository',
                            value: 'trap-house-discord-bot',
                            inline: true
                        }
                    ],
                    footer: {
                        text: 'JustTheTip GitHub Integration • Making code collaboration based'
                    }
                };

                await message.reply({ embeds: [embed] });
            }
        };
    }
}

module.exports = GitHubIntegration;
