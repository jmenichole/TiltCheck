#!/usr/bin/env node

/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * Security Scanner for TiltCheck
 * Scans for unprotected API keys, unsecured fetch calls, and security vulnerabilities
 */

const fs = require('fs');
const path = require('path');

class SecurityScanner {
    constructor() {
        this.issues = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };

        // Patterns to detect security issues
        this.patterns = {
            // API Keys and Secrets
            apiKeys: [
                /['"]?API[_-]?KEY['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
                /['"]?SECRET[_-]?KEY['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
                /['"]?PRIVATE[_-]?KEY['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
                /['"]?ACCESS[_-]?TOKEN['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
                /['"]?CLIENT[_-]?SECRET['"]?\s*[:=]\s*['"][^'"]+['"]/gi,
                /sk_live_[a-zA-Z0-9]+/g, // Stripe live keys
                /pk_live_[a-zA-Z0-9]+/g, // Stripe publishable keys
                /rk_live_[a-zA-Z0-9]+/g, // Restricted keys
            ],

            // Unsecured HTTP calls
            unsecuredFetch: [
                /fetch\s*\(\s*['"]http:\/\//gi,
                /axios\.get\s*\(\s*['"]http:\/\//gi,
                /axios\.post\s*\(\s*['"]http:\/\//gi,
                /request\s*\(\s*['"]http:\/\//gi,
            ],

            // Hardcoded credentials
            credentials: [
                /password\s*[:=]\s*['"][^'"]+['"]/gi,
                /pwd\s*[:=]\s*['"][^'"]+['"]/gi,
                /passwd\s*[:=]\s*['"][^'"]+['"]/gi,
                /admin[_-]?pass\s*[:=]\s*['"][^'"]+['"]/gi,
            ],

            // Insecure crypto
            weakCrypto: [
                /crypto\.createHash\s*\(\s*['"]md5['"]/gi,
                /crypto\.createHash\s*\(\s*['"]sha1['"]/gi,
                /Math\.random\(\)/gi, // For security-critical random generation
            ],

            // SQL injection vulnerabilities
            sqlInjection: [
                /query\s*\(\s*['"].*\$\{/gi,
                /exec\s*\(\s*['"].*\$\{/gi,
                /sql\s*=\s*['"].*\+/gi,
            ],

            // XSS vulnerabilities
            xss: [
                /innerHTML\s*=\s*[^;]+$/gm,
                /dangerouslySetInnerHTML/gi,
                /document\.write\s*\(/gi,
            ],

            // Exposed database connections
            dbConnections: [
                /mongodb:\/\/[^'"]+@/gi,
                /postgresql:\/\/[^'"]+@/gi,
                /mysql:\/\/[^'"]+@/gi,
            ],

            // Missing input validation
            noValidation: [
                /req\.body\.[a-zA-Z]+(?!\s*\.\s*(trim|validate|sanitize))/g,
                /req\.params\.[a-zA-Z]+(?!\s*\.\s*(trim|validate|sanitize))/g,
                /req\.query\.[a-zA-Z]+(?!\s*\.\s*(trim|validate|sanitize))/g,
            ]
        };

        // Files to exclude from scanning
        this.excludePatterns = [
            'node_modules',
            '.git',
            'dist',
            'build',
            '.next',
            'coverage',
            '*.min.js',
            '*.map'
        ];
    }

    shouldExclude(filePath) {
        return this.excludePatterns.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace('*', '.*'));
                return regex.test(filePath);
            }
            return filePath.includes(pattern);
        });
    }

    scanFile(filePath) {
        if (this.shouldExclude(filePath)) {
            return;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            // Check for API keys and secrets
            this.patterns.apiKeys.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    // Check if it's in a comment or .env.example
                    if (filePath.includes('.env.example') || 
                        filePath.includes('README') ||
                        filePath.includes('.md')) {
                        continue;
                    }

                    this.issues.critical.push({
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        issue: 'Potential exposed API key or secret',
                        snippet: match[0].substring(0, 50) + '...',
                        severity: 'CRITICAL'
                    });
                }
            });

            // Check for unsecured HTTP calls
            this.patterns.unsecuredFetch.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    this.issues.high.push({
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        issue: 'Unsecured HTTP request (should use HTTPS)',
                        snippet: match[0],
                        severity: 'HIGH'
                    });
                }
            });

            // Check for hardcoded credentials
            this.patterns.credentials.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    if (filePath.includes('.env.example') || filePath.includes('test')) {
                        continue;
                    }

                    this.issues.high.push({
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        issue: 'Hardcoded password or credential',
                        snippet: match[0].substring(0, 30) + '...',
                        severity: 'HIGH'
                    });
                }
            });

            // Check for weak cryptography
            this.patterns.weakCrypto.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    this.issues.medium.push({
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        issue: 'Weak cryptographic algorithm or random number generation',
                        snippet: match[0],
                        severity: 'MEDIUM'
                    });
                }
            });

            // Check for SQL injection risks
            this.patterns.sqlInjection.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    this.issues.high.push({
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        issue: 'Potential SQL injection vulnerability',
                        snippet: match[0],
                        severity: 'HIGH'
                    });
                }
            });

            // Check for XSS vulnerabilities
            this.patterns.xss.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    this.issues.medium.push({
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        issue: 'Potential XSS vulnerability',
                        snippet: match[0],
                        severity: 'MEDIUM'
                    });
                }
            });

            // Check for exposed database connections
            this.patterns.dbConnections.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    if (filePath.includes('.env.example')) {
                        continue;
                    }

                    this.issues.critical.push({
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        issue: 'Exposed database connection string',
                        snippet: match[0].substring(0, 30) + '...',
                        severity: 'CRITICAL'
                    });
                }
            });

            // Check for missing input validation
            if (filePath.endsWith('.js') && content.includes('express')) {
                this.patterns.noValidation.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(content)) !== null) {
                        // Check if there's validation nearby
                        const contextStart = Math.max(0, match.index - 200);
                        const contextEnd = Math.min(content.length, match.index + 200);
                        const context = content.substring(contextStart, contextEnd);

                        if (!context.includes('validate') && !context.includes('sanitize')) {
                            this.issues.medium.push({
                                file: filePath,
                                line: this.getLineNumber(content, match.index),
                                issue: 'Potentially unvalidated user input',
                                snippet: match[0],
                                severity: 'MEDIUM'
                            });
                        }
                    }
                });
            }

        } catch (error) {
            console.error(`Error scanning file ${filePath}:`, error.message);
        }
    }

    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    scanDirectory(dir) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (!this.shouldExclude(filePath)) {
                    this.scanDirectory(filePath);
                }
            } else if (stat.isFile()) {
                // Scan JavaScript, TypeScript, and config files
                if (/\.(js|jsx|ts|tsx|json|env)$/.test(file)) {
                    this.scanFile(filePath);
                }
            }
        });
    }

    generateReport() {
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║         TiltCheck Security Scan Report                     ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        const totalIssues = 
            this.issues.critical.length +
            this.issues.high.length +
            this.issues.medium.length +
            this.issues.low.length;

        console.log(`📊 Total Issues Found: ${totalIssues}\n`);
        console.log(`🔴 Critical: ${this.issues.critical.length}`);
        console.log(`🟠 High: ${this.issues.high.length}`);
        console.log(`🟡 Medium: ${this.issues.medium.length}`);
        console.log(`🔵 Low: ${this.issues.low.length}\n`);

        // Print critical issues
        if (this.issues.critical.length > 0) {
            console.log('\n🔴 CRITICAL ISSUES:\n');
            this.issues.critical.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.file}:${issue.line}`);
                console.log(`   Issue: ${issue.issue}`);
                console.log(`   Code: ${issue.snippet}`);
                console.log('');
            });
        }

        // Print high severity issues
        if (this.issues.high.length > 0) {
            console.log('\n🟠 HIGH SEVERITY ISSUES:\n');
            this.issues.high.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.file}:${issue.line}`);
                console.log(`   Issue: ${issue.issue}`);
                console.log(`   Code: ${issue.snippet}`);
                console.log('');
            });
        }

        // Print medium severity issues (limit to first 10)
        if (this.issues.medium.length > 0) {
            console.log('\n🟡 MEDIUM SEVERITY ISSUES (showing first 10):\n');
            this.issues.medium.slice(0, 10).forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.file}:${issue.line}`);
                console.log(`   Issue: ${issue.issue}`);
                console.log(`   Code: ${issue.snippet}`);
                console.log('');
            });

            if (this.issues.medium.length > 10) {
                console.log(`   ... and ${this.issues.medium.length - 10} more\n`);
            }
        }

        // Recommendations
        console.log('\n📋 RECOMMENDATIONS:\n');
        console.log('1. Move all API keys and secrets to .env files');
        console.log('2. Use HTTPS for all external API calls');
        console.log('3. Implement input validation for all user inputs');
        console.log('4. Use strong cryptographic algorithms (SHA-256 or better)');
        console.log('5. Sanitize all user inputs before database queries');
        console.log('6. Use Content Security Policy headers to prevent XSS');
        console.log('7. Review and fix all critical and high severity issues immediately\n');

        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: totalIssues,
                critical: this.issues.critical.length,
                high: this.issues.high.length,
                medium: this.issues.medium.length,
                low: this.issues.low.length
            },
            issues: this.issues
        };

        fs.writeFileSync(
            'security-scan-report.json',
            JSON.stringify(report, null, 2)
        );

        console.log('📄 Detailed report saved to: security-scan-report.json\n');

        return totalIssues;
    }

    scan(directory = '.') {
        console.log(`\n🔍 Scanning directory: ${directory}\n`);
        this.scanDirectory(directory);
        return this.generateReport();
    }
}

// CLI execution
if (require.main === module) {
    const scanner = new SecurityScanner();
    const targetDir = process.argv[2] || '.';
    const issueCount = scanner.scan(targetDir);

    // Exit with error code if critical or high severity issues found
    const criticalCount = scanner.issues.critical.length + scanner.issues.high.length;
    process.exit(criticalCount > 0 ? 1 : 0);
}

module.exports = SecurityScanner;
