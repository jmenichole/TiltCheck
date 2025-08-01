#!/usr/bin/env node

/**
 * 🔓 TiltCheck Secret Decryption System
 * Decrypts secrets encrypted with encrypt-secrets.js
 */

const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

class SecretDecryption {
    constructor() {
        this.masterKey = this.loadMasterKey();
        this.decryptedFiles = [];
    }

    loadMasterKey() {
        const keyFile = path.join(__dirname, '.master.key');
        
        if (!fs.existsSync(keyFile)) {
            console.error('❌ Master key not found! Please run encrypt-secrets.js first.');
            process.exit(1);
        }
        
        console.log('🔑 Loading master key...');
        return fs.readFileSync(keyFile, 'utf8').trim();
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

    decryptEnvFile(filePath) {
        console.log(`🔍 Processing: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const decryptedLines = [];
        let decryptedCount = 0;

        for (const line of lines) {
            if (line.trim() === '' || line.trim().startsWith('#')) {
                decryptedLines.push(line);
                continue;
            }

            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const [, key, value] = match;
                
                if (value.trim().startsWith('ENC[')) {
                    const decrypted = this.decrypt(value.trim());
                    decryptedLines.push(`${key}=${decrypted}`);
                    decryptedCount++;
                    console.log(`  🔓 Decrypted: ${key}`);
                } else {
                    decryptedLines.push(line);
                }
            } else {
                decryptedLines.push(line);
            }
        }

        if (decryptedCount > 0) {
            // Create backup of encrypted version
            const backupPath = `${filePath}.encrypted`;
            fs.copyFileSync(filePath, backupPath);
            
            // Write decrypted version
            fs.writeFileSync(filePath, decryptedLines.join('\n'));
            
            this.decryptedFiles.push({
                file: filePath,
                decryptedCount,
                encryptedBackup: backupPath
            });
            
            console.log(`✅ Decrypted ${decryptedCount} secrets in ${filePath}`);
        } else {
            console.log(`ℹ️  No encrypted secrets found in ${filePath}`);
        }
    }

    decryptJsonFile(filePath) {
        console.log(`🔍 Processing JSON: ${filePath}`);
        
        if (!fs.existsExists(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            return;
        }

        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let decryptedCount = 0;
            
            const decryptObject = (obj, path = '') => {
                for (const [key, value] of Object.entries(obj)) {
                    const fullPath = path ? `${path}.${key}` : key;
                    
                    if (typeof value === 'object' && value !== null) {
                        decryptObject(value, fullPath);
                    } else if (typeof value === 'string' && value.startsWith('ENC[')) {
                        obj[key] = this.decrypt(value);
                        decryptedCount++;
                        console.log(`  🔓 Decrypted: ${fullPath}`);
                    }
                }
            };
            
            decryptObject(content);
            
            if (decryptedCount > 0) {
                // Create backup of encrypted version
                const backupPath = `${filePath}.encrypted`;
                fs.copyFileSync(filePath, backupPath);
                
                // Write decrypted version
                fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
                
                this.decryptedFiles.push({
                    file: filePath,
                    decryptedCount,
                    encryptedBackup: backupPath
                });
                
                console.log(`✅ Decrypted ${decryptedCount} secrets in ${filePath}`);
            } else {
                console.log(`ℹ️  No encrypted secrets found in ${filePath}`);
            }
        } catch (error) {
            console.error(`❌ Failed to process JSON file ${filePath}:`, error.message);
        }
    }

    decryptAllSecrets() {
        console.log('🔓 TiltCheck Secret Decryption System');
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
                this.decryptJsonFile(fullPath);
            } else {
                this.decryptEnvFile(fullPath);
            }
        }

        this.generateReport();
    }

    generateReport() {
        console.log('\n📊 DECRYPTION REPORT');
        console.log('====================');
        
        if (this.decryptedFiles.length === 0) {
            console.log('ℹ️  No files were decrypted (no encrypted secrets found)');
            return;
        }

        console.log(`✅ Successfully decrypted secrets in ${this.decryptedFiles.length} files:\n`);
        
        for (const file of this.decryptedFiles) {
            console.log(`📁 ${file.file}`);
            console.log(`   🔓 ${file.decryptedCount} secrets decrypted`);
            console.log(`   💾 Encrypted backup: ${file.encryptedBackup}\n`);
        }

        console.log('⚠️  IMPORTANT: Secrets are now in plain text!');
        console.log('🔒 Re-encrypt with: node security/encrypt-secrets.js');
    }

    // Decrypt a single value
    decryptValue(encryptedValue) {
        return this.decrypt(encryptedValue);
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 1 && args[0].startsWith('ENC[')) {
        // Decrypt a single value
        const decryptor = new SecretDecryption();
        console.log('Decrypted value:', decryptor.decryptValue(args[0]));
    } else {
        // Decrypt all files
        const decryptor = new SecretDecryption();
        decryptor.decryptAllSecrets();
    }
}

module.exports = SecretDecryption;
