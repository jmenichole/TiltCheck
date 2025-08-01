#!/usr/bin/env node

/**
 * 🔐 Environment Secret Manager
 * Loads encrypted environment variables at runtime
 */

const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

class EnvironmentSecretManager {
    constructor() {
        this.masterKey = this.loadMasterKey();
        this.originalEnv = { ...process.env };
    }

    loadMasterKey() {
        const keyFiles = [
            path.join(__dirname, '.master.key'),
            path.join(process.cwd(), 'security', '.master.key'),
            path.join(process.cwd(), '.master.key')
        ];
        
        for (const keyFile of keyFiles) {
            if (fs.existsSync(keyFile)) {
                return fs.readFileSync(keyFile, 'utf8').trim();
            }
        }
        
        console.warn('⚠️  Master key not found. Encrypted values will not be decrypted.');
        return null;
    }

    decrypt(encryptedText) {
        if (!this.masterKey) {
            return encryptedText;
        }

        try {
            if (!encryptedText.startsWith('ENC[') || !encryptedText.endsWith(']')) {
                return encryptedText; // Not encrypted
            }
            
            const encrypted = encryptedText.slice(4, -1);
            const decrypted = CryptoJS.AES.decrypt(encrypted, this.masterKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.warn(`⚠️  Failed to decrypt value: ${error.message}`);
            return encryptedText;
        }
    }

    loadEnvironment(envFile = '.env') {
        const envPath = path.resolve(envFile);
        
        if (!fs.existsSync(envPath)) {
            console.warn(`⚠️  Environment file not found: ${envPath}`);
            return;
        }

        console.log(`🔍 Loading environment from: ${envPath}`);
        
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        let decryptedCount = 0;

        for (const line of lines) {
            if (line.trim() === '' || line.trim().startsWith('#')) {
                continue;
            }

            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const [, key, value] = match;
                const cleanKey = key.trim();
                const cleanValue = value.trim();
                
                if (cleanValue.startsWith('ENC[')) {
                    const decrypted = this.decrypt(cleanValue);
                    process.env[cleanKey] = decrypted;
                    decryptedCount++;
                } else {
                    process.env[cleanKey] = cleanValue;
                }
            }
        }

        if (decryptedCount > 0) {
            console.log(`🔓 Decrypted ${decryptedCount} environment variables`);
        }
    }

    // Get a decrypted environment variable
    get(key, defaultValue = undefined) {
        const value = process.env[key];
        
        if (value && value.startsWith('ENC[')) {
            return this.decrypt(value);
        }
        
        return value || defaultValue;
    }

    // Check if a value is encrypted
    isEncrypted(value) {
        return value && typeof value === 'string' && value.startsWith('ENC[') && value.endsWith(']');
    }

    // Restore original environment
    restore() {
        process.env = { ...this.originalEnv };
        console.log('🔄 Environment restored to original state');
    }
}

// Auto-load environment on require
const secretManager = new EnvironmentSecretManager();

// Load default .env file if it exists
try {
    secretManager.loadEnvironment();
} catch (error) {
    console.warn('⚠️  Failed to auto-load environment:', error.message);
}

module.exports = secretManager;
