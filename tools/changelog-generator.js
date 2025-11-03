#!/usr/bin/env node

/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * Changelog Generator
 * Generates changelog from git commits since last release
 */

const { execSync } = require('child_process');
const fs = require('fs');

class ChangelogGenerator {
    constructor() {
        this.categories = {
            feat: { title: '✨ Features', commits: [] },
            fix: { title: '🐛 Bug Fixes', commits: [] },
            docs: { title: '📚 Documentation', commits: [] },
            style: { title: '💎 Styles', commits: [] },
            refactor: { title: '♻️ Code Refactoring', commits: [] },
            perf: { title: '⚡ Performance Improvements', commits: [] },
            test: { title: '✅ Tests', commits: [] },
            build: { title: '🏗️ Build System', commits: [] },
            ci: { title: '👷 CI/CD', commits: [] },
            chore: { title: '🔧 Chores', commits: [] },
            revert: { title: '⏪ Reverts', commits: [] },
            security: { title: '🔒 Security', commits: [] },
            other: { title: '📦 Other Changes', commits: [] }
        };
    }

    /**
     * Get commits since last tag or from specified date
     */
    getCommits(since = null) {
        try {
            let command;
            
            if (since) {
                command = `git log --since="${since}" --pretty=format:"%H|%s|%an|%ad" --date=short`;
            } else {
                // Get commits since last tag
                try {
                    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', {
                        encoding: 'utf-8'
                    }).trim();
                    command = `git log ${lastTag}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short`;
                } catch (error) {
                    // No tags found, get all commits from last 30 days
                    command = 'git log --since="30 days ago" --pretty=format:"%H|%s|%an|%ad" --date=short';
                }
            }

            const output = execSync(command, { encoding: 'utf-8' });
            
            if (!output) {
                return [];
            }

            return output.split('\n').map(line => {
                const [hash, message, author, date] = line.split('|');
                return { hash, message, author, date };
            });
        } catch (error) {
            console.error('Error getting commits:', error.message);
            return [];
        }
    }

    /**
     * Parse commit message to extract type and description
     */
    parseCommit(commit) {
        const message = commit.message;
        
        // Check for conventional commit format: type(scope): description
        const conventionalRegex = /^(\w+)(\([^)]+\))?: (.+)$/;
        const match = message.match(conventionalRegex);

        if (match) {
            const [, type, scope, description] = match;
            return {
                type: type.toLowerCase(),
                scope: scope ? scope.slice(1, -1) : null,
                description,
                breaking: message.includes('BREAKING CHANGE'),
                ...commit
            };
        }

        // Try to detect type from message content
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('fix') || lowerMessage.includes('bug')) {
            return { type: 'fix', description: message, ...commit };
        } else if (lowerMessage.includes('feat') || lowerMessage.includes('add')) {
            return { type: 'feat', description: message, ...commit };
        } else if (lowerMessage.includes('doc')) {
            return { type: 'docs', description: message, ...commit };
        } else if (lowerMessage.includes('test')) {
            return { type: 'test', description: message, ...commit };
        } else if (lowerMessage.includes('security')) {
            return { type: 'security', description: message, ...commit };
        }

        return { type: 'other', description: message, ...commit };
    }

    /**
     * Categorize commits by type
     */
    categorizeCommits(commits) {
        // Reset categories
        Object.keys(this.categories).forEach(key => {
            this.categories[key].commits = [];
        });

        commits.forEach(commit => {
            const parsed = this.parseCommit(commit);
            const category = this.categories[parsed.type] ? parsed.type : 'other';
            this.categories[category].commits.push(parsed);
        });
    }

    /**
     * Generate markdown changelog
     */
    generateMarkdown(version = 'Unreleased', date = new Date().toISOString().split('T')[0]) {
        let markdown = `# Changelog\n\n`;
        markdown += `## [${version}] - ${date}\n\n`;

        // Add summary
        const totalCommits = Object.values(this.categories)
            .reduce((sum, cat) => sum + cat.commits.length, 0);
        
        markdown += `**Summary**: ${totalCommits} changes\n\n`;

        // Add each category
        Object.entries(this.categories).forEach(([key, category]) => {
            if (category.commits.length === 0) return;

            markdown += `### ${category.title}\n\n`;

            category.commits.forEach(commit => {
                const scope = commit.scope ? `**${commit.scope}**: ` : '';
                const breaking = commit.breaking ? ' ⚠️ BREAKING' : '';
                markdown += `- ${scope}${commit.description}${breaking} ([${commit.hash.substring(0, 7)}](../../commit/${commit.hash}))\n`;
            });

            markdown += '\n';
        });

        // Add contributors
        const contributors = this.getContributors();
        if (contributors.length > 0) {
            markdown += `### 👥 Contributors\n\n`;
            contributors.forEach(contributor => {
                markdown += `- ${contributor.name} (${contributor.commits} commits)\n`;
            });
            markdown += '\n';
        }

        return markdown;
    }

    /**
     * Generate compact format for release notes
     */
    generateCompact(version = 'Unreleased') {
        let output = `## ${version}\n\n`;

        // Highlights
        const features = this.categories.feat.commits;
        const fixes = this.categories.fix.commits;
        const breaking = [];

        Object.values(this.categories).forEach(category => {
            category.commits.forEach(commit => {
                if (commit.breaking) breaking.push(commit);
            });
        });

        if (breaking.length > 0) {
            output += `### ⚠️ Breaking Changes\n`;
            breaking.forEach(commit => {
                output += `- ${commit.description}\n`;
            });
            output += '\n';
        }

        if (features.length > 0) {
            output += `### ✨ New Features\n`;
            features.slice(0, 5).forEach(commit => {
                output += `- ${commit.description}\n`;
            });
            if (features.length > 5) {
                output += `- ...and ${features.length - 5} more\n`;
            }
            output += '\n';
        }

        if (fixes.length > 0) {
            output += `### 🐛 Bug Fixes\n`;
            fixes.slice(0, 5).forEach(commit => {
                output += `- ${commit.description}\n`;
            });
            if (fixes.length > 5) {
                output += `- ...and ${fixes.length - 5} more\n`;
            }
            output += '\n';
        }

        return output;
    }

    /**
     * Get unique contributors with commit counts
     */
    getContributors() {
        const contributorMap = new Map();

        Object.values(this.categories).forEach(category => {
            category.commits.forEach(commit => {
                const author = commit.author;
                if (contributorMap.has(author)) {
                    contributorMap.set(author, contributorMap.get(author) + 1);
                } else {
                    contributorMap.set(author, 1);
                }
            });
        });

        return Array.from(contributorMap.entries())
            .map(([name, commits]) => ({ name, commits }))
            .sort((a, b) => b.commits - a.commits);
    }

    /**
     * Generate full changelog
     */
    generate(options = {}) {
        const {
            since = null,
            version = 'Unreleased',
            format = 'markdown', // 'markdown' or 'compact'
            output = null
        } = options;

        console.log('📝 Generating changelog...\n');

        // Get commits
        const commits = this.getCommits(since);
        console.log(`Found ${commits.length} commits\n`);

        if (commits.length === 0) {
            console.log('No commits found. Changelog not generated.');
            return;
        }

        // Categorize
        this.categorizeCommits(commits);

        // Generate output
        const changelog = format === 'compact' 
            ? this.generateCompact(version)
            : this.generateMarkdown(version);

        // Output
        if (output) {
            fs.writeFileSync(output, changelog);
            console.log(`✅ Changelog written to: ${output}\n`);
        } else {
            console.log(changelog);
        }

        // Statistics
        console.log('\n📊 Statistics:');
        Object.entries(this.categories).forEach(([key, category]) => {
            if (category.commits.length > 0) {
                console.log(`  ${category.title}: ${category.commits.length}`);
            }
        });

        const contributors = this.getContributors();
        console.log(`\n👥 Contributors: ${contributors.length}`);
        contributors.forEach(c => {
            console.log(`  - ${c.name}: ${c.commits} commits`);
        });
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const generator = new ChangelogGenerator();

    // Parse CLI arguments
    const options = {
        since: null,
        version: 'Unreleased',
        format: 'markdown',
        output: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--since' && args[i + 1]) {
            options.since = args[i + 1];
            i++;
        } else if (arg === '--version' && args[i + 1]) {
            options.version = args[i + 1];
            i++;
        } else if (arg === '--format' && args[i + 1]) {
            options.format = args[i + 1];
            i++;
        } else if (arg === '--output' && args[i + 1]) {
            options.output = args[i + 1];
            i++;
        } else if (arg === '--help') {
            console.log(`
Changelog Generator

Usage: node changelog-generator.js [options]

Options:
  --since <date>      Generate changelog since date (e.g., "2024-01-01")
  --version <version> Version number for the changelog (default: "Unreleased")
  --format <format>   Output format: "markdown" or "compact" (default: "markdown")
  --output <file>     Write to file instead of stdout
  --help              Show this help message

Examples:
  node changelog-generator.js --since "2024-01-01" --output CHANGELOG.md
  node changelog-generator.js --version "2.1.0" --format compact
  node changelog-generator.js --output RELEASE_NOTES.md
            `);
            process.exit(0);
        }
    }

    generator.generate(options);
}

module.exports = ChangelogGenerator;
