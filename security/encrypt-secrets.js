#!/usr/bin/env node

/**
 * 🔐 TiltCheck Secret Encryption System
 * Encrypts all sensitive data using AES-256-GCM
 */

const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecretEncryption {
    constructor() {
        this.masterKey = this.generateMasterKey();
        this.encryptedFiles = [];
        this.secretPatterns = [
            /token/i,
            /key/i,
            /secret/i,
            /password/i,
            /api_key/i,
            /private/i,
            /credential/i,
            /webhook/i,
            /jwt/i,
            /stripe/i,
            /discord/i,
            /github/i
        ];
    }

    generateMasterKey() {
        // Generate or load master key
        const keyFile = path.join(__dirname, '.master.key');
        
        if (fs.existsSync(keyFile)) {
            console.log('🔑 Loading existing master key...');
            return fs.readFileSync(keyFile, 'utf8').trim();
        } else {
            console.log('🔑 Generating new master key...');
            const newKey = crypto.randomBytes(32).toString('hex');
            fs.writeFileSync(keyFile, newKey, { mode: 0o600 });
            console.log('✅ Master key saved to .master.key');
            return newKey;
        }
    }

    encrypt(plaintext) {
        try {
            const encrypted = CryptoJS.AES.encrypt(plaintext, this.masterKey).toString();
            return `ENC[${encrypted}]`;
        } catch (error) {
            console.error('❌ Encryption failed:', error.message);
            return plaintext;
        }
    }

    decrypt(encryptedText) {
        try {
            if (!encryptedText.startsWith('ENC[') || !encryptedText.endsWith(']')) {
                return encryptedText; // Not encrypted
            }
            
            const encrypted = encryptedText.slice(4, -1);
            const decrypted = CryptoJS.AES.decrypt(encrypted, this.masterKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('❌ Decryption failed:', error.message);
            return encryptedText;
        }
    }

    isSecret(key, value) {
        // Check if this looks like a secret
        const keyLower = key.toLowerCase();
        const valueLower = (value || '').toLowerCase();
        
        // Pattern matching
        const keyMatches = this.secretPatterns.some(pattern => pattern.test(keyLower));
        
        // Value heuristics
        const looksLikeToken = value && value.length > 20 && /^[a-zA-Z0-9._-]+$/.test(value);
        const looksLikeKey = value && (value.includes('pk_') || value.includes('sk_') || value.includes('whsec_'));
        const looksLikeJWT = value && value.includes('eyJ');
        const looksLikeHash = value && value.length >= 32 && /^[a-fA-F0-9]+$/.test(value);
        
        return keyMatches || looksLikeToken || looksLikeKey || looksLikeJWT || looksLikeHash;
    }

    encryptEnvFile(filePath) {
        console.log(`🔍 Processing: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const encryptedLines = [];
        let encryptedCount = 0;

        for (const line of lines) {
            if (line.trim() === '' || line.trim().startsWith('#')) {
                encryptedLines.push(line);
                continue;
            }

            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const [, key, value] = match;
                
                if (this.isSecret(key.trim(), value.trim()) && !value.startsWith('ENC[')) {
                    const encrypted = this.encrypt(value.trim());
                    encryptedLines.push(`${key}=${encrypted}`);
                    encryptedCount++;
                    console.log(`  🔒 Encrypted: ${key}`);
                } else {
                    encryptedLines.push(line);
                }
            } else {
                encryptedLines.push(line);
            }
        }

        if (encryptedCount > 0) {
            // Create backup
            const backupPath = `${filePath}.backup`;
            fs.copyFileSync(filePath, backupPath);
            
            // Write encrypted version
            fs.writeFileSync(filePath, encryptedLines.join('\n'));
            
            this.encryptedFiles.push({
                file: filePath,
                encryptedCount,
                backup: backupPath
            });
            
            console.log(`✅ Encrypted ${encryptedCount} secrets in ${filePath}`);
        } else {
            console.log(`ℹ️  No secrets found in ${filePath}`);
        }
    }

    encryptJsonFile(filePath) {
        console.log(`🔍 Processing JSON: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let encryptedCount = 0;
            
            const encryptObject = (obj, path = '') => {
                for (const [key, value] of Object.entries(obj)) {
                    const fullPath = path ? `${path}.${key}` : key;
                    
                    if (typeof value === 'object' && value !== null) {
                        encryptObject(value, fullPath);
                    } else if (typeof value === 'string' && this.isSecret(key, value) && !value.startsWith('ENC[')) {
                        obj[key] = this.encrypt(value);
                        encryptedCount++;
                        console.log(`  🔒 Encrypted: ${fullPath}`);
                    }
                }
            };
            
            encryptObject(content);
            
            if (encryptedCount > 0) {
                // Create backup
                const backupPath = `${filePath}.backup`;
                fs.copyFileSync(filePath, backupPath);
                
                // Write encrypted version
                fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
                
                this.encryptedFiles.push({
                    file: filePath,
                    encryptedCount,
                    backup: backupPath
                });
                
                console.log(`✅ Encrypted ${encryptedCount} secrets in ${filePath}`);
            } else {
                console.log(`ℹ️  No secrets found in ${filePath}`);
            }
        } catch (error) {
            console.error(`❌ Failed to process JSON file ${filePath}:`, error.message);
        }
    }

    encryptAllSecrets() {
        console.log('🔐 TiltCheck Secret Encryption System');
        console.log('=====================================\n');

        const secretFiles = [
            // Environment files
            '.env',
            '.env.deployment',
            '.env.docker',
            '.env.example',
            '.env.github.example',
            '.env.oauth.example',
            '.env.template',
            '.vps-config',
            'ssl-manager-token.txt',
            
            // Config files
            'config/secrets.json',
            'config/api-keys.json',
            'package.json',
            'beta-package.json',
            
            // Degens bot
            'degens_bot/.env',
            'degens_bot/.env.example',
            
            // Any other .env files
            'webapp/.env',
            'analytics/.env',
            'dashboard/.env'
        ];

        for (const file of secretFiles) {
            const fullPath = path.resolve(file);
            
            if (file.endsWith('.json')) {
                this.encryptJsonFile(fullPath);
            } else {
                this.encryptEnvFile(fullPath);
            }
        }

        this.generateReport();
    }

    generateReport() {
        console.log('\n📊 ENCRYPTION REPORT');
        console.log('====================');
        
        if (this.encryptedFiles.length === 0) {
            console.log('ℹ️  No files were encrypted (no unencrypted secrets found)');
            return;
        }

        console.log(`✅ Successfully encrypted secrets in ${this.encryptedFiles.length} files:\n`);
        
        for (const file of this.encryptedFiles) {
            console.log(`📁 ${file.file}`);
            console.log(`   🔒 ${file.encryptedCount} secrets encrypted`);
            console.log(`   💾 Backup: ${file.backup}\n`);
        }

        console.log('🔑 Master Key Location: security/.master.key');
        console.log('⚠️  IMPORTANT: Keep the master key secure and backed up!');
        console.log('🔄 To decrypt: Use the decrypt-secrets.js script');
    }
}

// CLI usage
if (require.main === module) {
    const encryptor = new SecretEncryption();
    encryptor.encryptAllSecrets();
}

module.exports = SecretEncryption;
