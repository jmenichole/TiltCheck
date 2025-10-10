/**
 * 🐙 GitHub Integration Module for TrapHouse Bot
 * 
 * Handles GitHub organization webhooks and events:
 * - Repository updates
 * - Pull requests
 * - Issues tracking
 * - Release notifications
 * - Code commits
 */

const axios = require('axios');
const crypto = require('crypto');

class GitHubIntegration {
    constructor(unicodeSafeStorage) {
        this.storage = unicodeSafeStorage;
        this.webhookUrl = process.env.GITHUB_WEBHOOK_URL;
        this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
        this.organization = process.env.GITHUB_ORGANIZATION || 'jmenichole';
        this.enabledEvents = (process.env.GITHUB_WEBHOOK_EVENTS || 'push,pull_request,issues,release').split(',');
        this.webhookFormat = process.env.GITHUB_WEBHOOK_FORMAT || 'json';
        
        console.log('🐙 GitHub Integration initialized');
    }
    
    /**
     * Initialize GitHub webhook integration
     */
    async initialize() {
        try {
            if (!this.webhookUrl) {
                console.log('⚠️ GitHub webhook URL not configured');
                return false;
            }
            
            // Setup webhook verification
            this.setupWebhookVerification();
            
            console.log('✅ GitHub integration ready');
            console.log(`🏢 Organization: ${this.organization}`);
            console.log(`📡 Events: ${this.enabledEvents.join(', ')}`);
            
            return true;
        } catch (error) {
            console.error('❌ GitHub integration failed:', error);
            return false;
        }
    }
    
    /**
     * Setup GitHub webhook verification
     */
    setupWebhookVerification() {
        this.verifyGitHubSignature = (payload, signature) => {
            if (!this.webhookSecret) {
                console.warn('⚠️ GitHub webhook secret not configured');
                return true; // Allow without verification if no secret
            }
            
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload, 'utf8')
                .digest('hex');
            
            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        };
        
        console.log('🔒 GitHub webhook verification ready');
    }
    
    /**
     * Handle GitHub webhook event
     */
    async handleGitHubWebhook(event, payload, signature) {
        try {
            // Verify webhook signature
            if (!this.verifyGitHubSignature(payload, signature)) {
                console.error('❌ Invalid GitHub webhook signature');
                return { success: false, error: 'invalid_signature' };
            }
            
            const data = JSON.parse(payload);
            
            // Check if event is enabled
            if (!this.enabledEvents.includes(event)) {
                console.log(`📝 GitHub event ignored: ${event}`);
                return { success: true, message: 'event_ignored' };
            }
            
            // Process different GitHub events
            switch (event) {
                case 'push':
                    return await this.handlePushEvent(data);
                    
                case 'pull_request':
                    return await this.handlePullRequestEvent(data);
                    
                case 'issues':
                    return await this.handleIssuesEvent(data);
                    
                case 'release':
                    return await this.handleReleaseEvent(data);
                    
                case 'repository':
                    return await this.handleRepositoryEvent(data);
                    
                case 'star':
                    return await this.handleStarEvent(data);
                    
                default:
                    console.log(`📝 Unknown GitHub event: ${event}`);
                    return await this.handleGenericEvent(event, data);
            }
            
        } catch (error) {
            console.error('❌ GitHub webhook processing error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle push events (commits)
     */
    async handlePushEvent(data) {
        try {
            const { repository, pusher, commits, compare } = data;
            const branch = data.ref.replace('refs/heads/', '');
            
            // Skip if no commits
            if (!commits || commits.length === 0) {
                return { success: true, message: 'no_commits' };
            }
            
            // Create Discord embed for push
            const embed = {
                color: 0x28A745, // Green for pushes
                title: `🚀 New commits to ${repository.name}`,
                url: compare,
                description: `**${commits.length}** commit${commits.length > 1 ? 's' : ''} pushed to \`${branch}\``,
                fields: [
                    {
                        name: '👤 Pushed by',
                        value: pusher.name,
                        inline: true
                    },
                    {
                        name: '🌿 Branch',
                        value: branch,
                        inline: true
                    },
                    {
                        name: '📝 Commits',
                        value: commits.slice(0, 3).map(commit => 
                            `[\`${commit.id.substring(0, 7)}\`](${commit.url}) ${commit.message.split('\n')[0]}`
                        ).join('\n') + (commits.length > 3 ? `\n... and ${commits.length - 3} more` : ''),
                        inline: false
                    }
                ],
                footer: {
                    text: `${repository.full_name} • GitHub`,
                    icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                },
                timestamp: new Date().toISOString()
            };
            
            await this.sendToDiscord(embed);
            
            // Update repository stats
            await this.updateRepositoryStats(repository.name, 'push', commits.length);
            
            return { success: true, event: 'push', commits: commits.length };
            
        } catch (error) {
            console.error('Error handling push event:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle pull request events
     */
    async handlePullRequestEvent(data) {
        try {
            const { action, pull_request, repository } = data;
            
            // Different colors for different actions
            const colors = {
                opened: 0x28A745,     // Green
                closed: 0xDC3545,     // Red
                merged: 0x6F42C1,     // Purple
                ready_for_review: 0xFFC107, // Yellow
                draft: 0x6C757D       // Gray
            };
            
            const color = colors[action] || 0x007BFF; // Default blue
            
            const embed = {
                color,
                title: `🔄 Pull Request ${action}: #${pull_request.number}`,
                url: pull_request.html_url,
                description: pull_request.title,
                fields: [
                    {
                        name: '👤 Author',
                        value: `[${pull_request.user.login}](${pull_request.user.html_url})`,
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
                    text: `${repository.full_name} • GitHub`,
                    icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                },
                timestamp: new Date().toISOString()
            };
            
            // Add body if available and not too long
            if (pull_request.body && pull_request.body.length > 0) {
                embed.fields.push({
                    name: '📝 Description',
                    value: pull_request.body.length > 200 
                        ? pull_request.body.substring(0, 200) + '...'
                        : pull_request.body,
                    inline: false
                });
            }
            
            await this.sendToDiscord(embed);
            
            // Update repository stats
            await this.updateRepositoryStats(repository.name, 'pull_request', 1);
            
            return { success: true, event: 'pull_request', action };
            
        } catch (error) {
            console.error('Error handling pull request event:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle issues events
     */
    async handleIssuesEvent(data) {
        try {
            const { action, issue, repository } = data;
            
            const colors = {
                opened: 0x28A745,     // Green
                closed: 0xDC3545,     // Red
                reopened: 0xFFC107    // Yellow
            };
            
            const color = colors[action] || 0x007BFF;
            
            const embed = {
                color,
                title: `🐛 Issue ${action}: #${issue.number}`,
                url: issue.html_url,
                description: issue.title,
                fields: [
                    {
                        name: '👤 Author',
                        value: `[${issue.user.login}](${issue.user.html_url})`,
                        inline: true
                    },
                    {
                        name: '🏷️ Labels',
                        value: issue.labels.length > 0 
                            ? issue.labels.map(label => `\`${label.name}\``).join(', ')
                            : 'None',
                        inline: true
                    }
                ],
                footer: {
                    text: `${repository.full_name} • GitHub`,
                    icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                },
                timestamp: new Date().toISOString()
            };
            
            await this.sendToDiscord(embed);
            
            return { success: true, event: 'issues', action };
            
        } catch (error) {
            console.error('Error handling issues event:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle release events
     */
    async handleReleaseEvent(data) {
        try {
            const { action, release, repository } = data;
            
            if (action !== 'published') {
                return { success: true, message: 'release_not_published' };
            }
            
            const embed = {
                color: 0x6F42C1, // Purple for releases
                title: `🎉 New Release: ${release.name || release.tag_name}`,
                url: release.html_url,
                description: release.body ? 
                    (release.body.length > 300 ? release.body.substring(0, 300) + '...' : release.body) :
                    'No release notes provided.',
                fields: [
                    {
                        name: '🏷️ Tag',
                        value: release.tag_name,
                        inline: true
                    },
                    {
                        name: '👤 Author',
                        value: `[${release.author.login}](${release.author.html_url})`,
                        inline: true
                    },
                    {
                        name: '🔗 Assets',
                        value: release.assets.length > 0 
                            ? `${release.assets.length} file${release.assets.length > 1 ? 's' : ''}`
                            : 'No assets',
                        inline: true
                    }
                ],
                footer: {
                    text: `${repository.full_name} • GitHub`,
                    icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                },
                timestamp: new Date().toISOString()
            };
            
            await this.sendToDiscord(embed);
            
            return { success: true, event: 'release', action };
            
        } catch (error) {
            console.error('Error handling release event:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle repository events
     */
    async handleRepositoryEvent(data) {
        try {
            const { action, repository } = data;
            
            const embed = {
                color: 0x007BFF,
                title: `📚 Repository ${action}: ${repository.name}`,
                url: repository.html_url,
                description: repository.description || 'No description provided.',
                fields: [
                    {
                        name: '👤 Owner',
                        value: `[${repository.owner.login}](${repository.owner.html_url})`,
                        inline: true
                    },
                    {
                        name: '👁️ Visibility',
                        value: repository.private ? 'Private' : 'Public',
                        inline: true
                    }
                ],
                footer: {
                    text: `GitHub • ${this.organization}`,
                    icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                },
                timestamp: new Date().toISOString()
            };
            
            await this.sendToDiscord(embed);
            
            return { success: true, event: 'repository', action };
            
        } catch (error) {
            console.error('Error handling repository event:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle star events
     */
    async handleStarEvent(data) {
        try {
            const { action, repository, starred_at } = data;
            
            if (action === 'created') {
                const embed = {
                    color: 0xFFD700, // Gold for stars
                    title: `⭐ New Star!`,
                    url: repository.html_url,
                    description: `${repository.name} received a new star!`,
                    fields: [
                        {
                            name: '⭐ Total Stars',
                            value: repository.stargazers_count.toString(),
                            inline: true
                        },
                        {
                            name: '📈 Growth',
                            value: '+1',
                            inline: true
                        }
                    ],
                    footer: {
                        text: `${repository.full_name} • GitHub`,
                        icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                    },
                    timestamp: new Date().toISOString()
                };
                
                await this.sendToDiscord(embed);
            }
            
            return { success: true, event: 'star', action };
            
        } catch (error) {
            console.error('Error handling star event:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Handle generic GitHub events
     */
    async handleGenericEvent(event, data) {
        try {
            const { repository } = data;
            
            const embed = {
                color: 0x6C757D, // Gray for generic events
                title: `📡 GitHub Event: ${event}`,
                url: repository?.html_url,
                description: `Event received from ${repository?.full_name || 'GitHub'}`,
                footer: {
                    text: 'GitHub Integration',
                    icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                },
                timestamp: new Date().toISOString()
            };
            
            await this.sendToDiscord(embed);
            
            return { success: true, event, action: 'generic' };
            
        } catch (error) {
            console.error('Error handling generic event:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Send embed to Discord webhook
     */
    async sendToDiscord(embed) {
        try {
            if (!this.webhookUrl) {
                console.warn('⚠️ GitHub webhook URL not configured');
                return;
            }
            
            await axios.post(this.webhookUrl, { embeds: [embed] });
            console.log('📤 GitHub event sent to Discord');
            
        } catch (error) {
            console.error('Error sending to Discord:', error);
        }
    }
    
    /**
     * Update repository statistics
     */
    async updateRepositoryStats(repoName, eventType, count = 1) {
        try {
            const statsData = await this.storage.loadData('github_stats', { repositories: {} });
            
            if (!statsData.repositories[repoName]) {
                statsData.repositories[repoName] = {
                    name: repoName,
                    pushes: 0,
                    pullRequests: 0,
                    issues: 0,
                    releases: 0,
                    totalCommits: 0,
                    lastActivity: null
                };
            }
            
            const repo = statsData.repositories[repoName];
            
            switch (eventType) {
                case 'push':
                    repo.pushes += 1;
                    repo.totalCommits += count;
                    break;
                case 'pull_request':
                    repo.pullRequests += count;
                    break;
                case 'issues':
                    repo.issues += count;
                    break;
                case 'release':
                    repo.releases += count;
                    break;
            }
            
            repo.lastActivity = new Date().toISOString();
            
            await this.storage.saveData('github_stats', statsData);
            
        } catch (error) {
            console.error('Error updating repository stats:', error);
        }
    }
    
    /**
     * Get GitHub integration status
     */
    getStatus() {
        return {
            webhookUrl: !!this.webhookUrl,
            organization: this.organization,
            enabledEvents: this.enabledEvents,
            webhookFormat: this.webhookFormat,
            webhookSecretConfigured: !!this.webhookSecret
        };
    }
    
    /**
     * Get repository statistics
     */
    async getRepositoryStats() {
        try {
            const statsData = await this.storage.loadData('github_stats', { repositories: {} });
            return statsData.repositories;
        } catch (error) {
            console.error('Error getting repository stats:', error);
            return {};
        }
    }
}

module.exports = GitHubIntegration;
