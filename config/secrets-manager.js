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
 * 🔐 Unified Secrets Manager
 * 
 * Manages secrets across TiltCheck and JustTheTip repositories
 * Allows cross-repository secret sharing for:
 * - Coinbase wallet secrets
 * - API keys (Coinbase, Discord, OpenAI)
 * - Blockchain keys (Solana, Ethereum)
 * - Database credentials
 * - Service tokens
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

class SecretsManager {
    constructor() {
        this.secrets = new Map();
        this.configDir = path.join(__dirname);
        this.secretsFile = path.join(this.configDir, 'secrets.json');
        this.encryptionKey = process.env.SECRETS_ENCRYPTION_KEY || this.generateKey();
        
        // Ensure config directory exists
        fs.ensureDirSync(this.configDir);
        
        // Load secrets from various sources
        this.loadSecrets();
    }
    
    /**
     * Generate encryption key if not provided
     */
    generateKey() {
        const key = crypto.randomBytes(32).toString('hex');
        console.warn('⚠️  No SECRETS_ENCRYPTION_KEY found. Generated temporary key. Set in .env for persistence.');
        return key;
    }
    
    /**
     * Load secrets from all sources
     */
    loadSecrets() {
        // Priority order: Environment Variables > Secrets File > Defaults
        
        // 1. Load from environment variables
        this.loadFromEnv();
        
        // 2. Load from secrets file (if exists)
        this.loadFromFile();
        
        // 3. Load JustTheTip secrets (if accessible)
        this.loadJustTheTipSecrets();
        
        console.log(`✅ Secrets Manager initialized with ${this.secrets.size} secrets`);
    }
    
    /**
     * Load secrets from environment variables
     */
    loadFromEnv() {
        const envSecrets = {
            // Coinbase
            'coinbase.appId': process.env.COINBASE_APP_ID,
            'coinbase.apiKey': process.env.COINBASE_API_KEY,
            'coinbase.apiSecret': process.env.COINBASE_API_SECRET,
            'coinbase.walletSecret': process.env.COINBASE_WALLET_SECRET,
            
            // Discord
            'discord.clientId': process.env.DISCORD_CLIENT_ID || process.env.APPLICATION_ID,
            'discord.clientSecret': process.env.DISCORD_CLIENT_SECRET,
            'discord.botToken': process.env.DISCORD_TOKEN,
            'discord.publicKey': process.env.DISCORD_PUBLIC_KEY,
            
            // OpenAI
            'openai.apiKey': process.env.OPENAI_API_KEY,
            'openai.orgId': process.env.OPENAI_ORG_ID,
            
            // Solana
            'solana.rpcUrl': process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
            'solana.walletPrivateKey': process.env.SOLANA_WALLET_PRIVATE_KEY,
            'solana.programId': process.env.SOLANA_PROGRAM_ID,
            
            // Database
            'mongodb.uri': process.env.MONGODB_URI,
            'mongodb.database': process.env.MONGODB_DATABASE,
            
            // JWT
            'jwt.secret': process.env.JWT_SECRET,
            'jwt.expiresIn': process.env.JWT_EXPIRES_IN || '7d',
            
            // OAuth
            'oauth.redirectUri': process.env.OAUTH_REDIRECT_URI,
            'oauth.baseUrl': process.env.BASE_URL,
            
            // Server
            'server.port': process.env.PORT || '3000',
            'server.corsOrigin': process.env.CORS_ORIGIN || '*',
            
            // TipCC
            'tipcc.apiKey': process.env.TIPCC_API_KEY,
            'tipcc.secretKey': process.env.TIPCC_SECRET_KEY,
            
            // Stripe
            'stripe.publicKey': process.env.STRIPE_PUBLIC_KEY,
            'stripe.secretKey': process.env.STRIPE_SECRET_KEY,
            
            // Email
            'email.service': process.env.EMAIL_SERVICE,
            'email.apiKey': process.env.EMAIL_API_KEY,
            'email.from': process.env.EMAIL_FROM
        };
        
        Object.entries(envSecrets).forEach(([key, value]) => {
            if (value) {
                this.secrets.set(key, value);
            }
        });
    }
    
    /**
     * Load secrets from encrypted file
     */
    loadFromFile() {
        if (!fs.existsSync(this.secretsFile)) {
            return;
        }
        
        try {
            const encryptedData = fs.readJSONSync(this.secretsFile);
            
            // If file is encrypted
            if (encryptedData.encrypted) {
                const decrypted = this.decrypt(encryptedData.data);
                const secrets = JSON.parse(decrypted);
                
                Object.entries(secrets).forEach(([key, value]) => {
                    if (!this.secrets.has(key)) {
                        this.secrets.set(key, value);
                    }
                });
            } else {
                // Unencrypted file (for development)
                Object.entries(encryptedData).forEach(([key, value]) => {
                    if (!this.secrets.has(key)) {
                        this.secrets.set(key, value);
                    }
                });
            }
            
            console.log('📁 Loaded secrets from file');
        } catch (error) {
            console.error('Error loading secrets file:', error.message);
        }
    }
    
    /**
     * Load JustTheTip secrets from shared location
     */
    loadJustTheTipSecrets() {
        // Attempt to load from JustTheTip directory (if accessible)
        const justTheTipPaths = [
            path.join(__dirname, '../../justthetip/config/secrets.json'),
            path.join(__dirname, '../../../justthetip/config/secrets.json'),
            process.env.JUSTTHETIP_SECRETS_PATH
        ].filter(p => p);
        
        for (const secretsPath of justTheTipPaths) {
            if (fs.existsSync(secretsPath)) {
                try {
                    const jttSecrets = fs.readJSONSync(secretsPath);
                    
                    // Map JustTheTip secrets to TiltCheck namespace
                    const mappedSecrets = {
                        'justthetip.coinbase.walletSecret': jttSecrets['coinbase.walletSecret'],
                        'justthetip.coinbase.apiKey': jttSecrets['coinbase.apiKey'],
                        'justthetip.tipcc.apiKey': jttSecrets['tipcc.apiKey'],
                        'justthetip.solana.walletPrivateKey': jttSecrets['solana.walletPrivateKey']
                    };
                    
                    Object.entries(mappedSecrets).forEach(([key, value]) => {
                        if (value && !this.secrets.has(key)) {
                            this.secrets.set(key, value);
                        }
                    });
                    
                    console.log('🔗 Loaded JustTheTip secrets');
                    break;
                } catch (error) {
                    console.error(`Error loading JustTheTip secrets from ${secretsPath}:`, error.message);
                }
            }
        }
    }
    
    /**
     * Get secret by key
     */
    get(key, defaultValue = null) {
        return this.secrets.get(key) || defaultValue;
    }
    
    /**
     * Get secret with fallback keys
     */
    getWithFallback(keys, defaultValue = null) {
        for (const key of keys) {
            const value = this.secrets.get(key);
            if (value) return value;
        }
        return defaultValue;
    }
    
    /**
     * Set secret
     */
    set(key, value) {
        this.secrets.set(key, value);
    }
    
    /**
     * Check if secret exists
     */
    has(key) {
        return this.secrets.has(key);
    }
    
    /**
     * Get all secrets (for debugging - use carefully)
     */
    getAll() {
        const secrets = {};
        this.secrets.forEach((value, key) => {
            // Mask sensitive values
            if (key.includes('secret') || key.includes('key') || key.includes('token')) {
                secrets[key] = value ? '***HIDDEN***' : null;
            } else {
                secrets[key] = value;
            }
        });
        return secrets;
    }
    
    /**
     * Save secrets to file (encrypted)
     */
    saveToFile(encrypt = true) {
        try {
            const secretsObj = {};
            this.secrets.forEach((value, key) => {
                secretsObj[key] = value;
            });
            
            let dataToSave;
            if (encrypt) {
                const encrypted = this.encrypt(JSON.stringify(secretsObj));
                dataToSave = {
                    encrypted: true,
                    data: encrypted,
                    updatedAt: new Date().toISOString()
                };
            } else {
                dataToSave = {
                    ...secretsObj,
                    encrypted: false,
                    updatedAt: new Date().toISOString()
                };
            }
            
            fs.writeJSONSync(this.secretsFile, dataToSave, { spaces: 2 });
            console.log('💾 Secrets saved to file');
            return true;
        } catch (error) {
            console.error('Error saving secrets:', error);
            return false;
        }
    }
    
    /**
     * Encrypt data
     */
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const key = Buffer.from(this.encryptionKey.slice(0, 32));
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    }
    
    /**
     * Decrypt data
     */
    decrypt(text) {
        const parts = text.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];
        const key = Buffer.from(this.encryptionKey.slice(0, 32));
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    /**
     * Get Coinbase configuration
     */
    getCoinbaseConfig() {
        return {
            appId: this.getWithFallback([
                'coinbase.appId',
                'justthetip.coinbase.appId'
            ], 'ca8b3b06-99e0-4611-affd-b39c2e7ca273'),
            apiKey: this.getWithFallback([
                'coinbase.apiKey',
                'justthetip.coinbase.apiKey'
            ]),
            apiSecret: this.getWithFallback([
                'coinbase.apiSecret',
                'justthetip.coinbase.apiSecret'
            ]),
            walletSecret: this.getWithFallback([
                'coinbase.walletSecret',
                'justthetip.coinbase.walletSecret'
            ])
        };
    }
    
    /**
     * Get Discord configuration
     */
    getDiscordConfig() {
        return {
            clientId: this.get('discord.clientId'),
            clientSecret: this.get('discord.clientSecret'),
            botToken: this.get('discord.botToken'),
            publicKey: this.get('discord.publicKey')
        };
    }
    
    /**
     * Get Solana configuration
     */
    getSolanaConfig() {
        return {
            rpcUrl: this.get('solana.rpcUrl'),
            walletPrivateKey: this.getWithFallback([
                'solana.walletPrivateKey',
                'justthetip.solana.walletPrivateKey'
            ]),
            programId: this.get('solana.programId')
        };
    }
    
    /**
     * Get TipCC configuration
     */
    getTipCCConfig() {
        return {
            apiKey: this.getWithFallback([
                'tipcc.apiKey',
                'justthetip.tipcc.apiKey'
            ]),
            secretKey: this.getWithFallback([
                'tipcc.secretKey',
                'justthetip.tipcc.secretKey'
            ])
        };
    }
    
    /**
     * Validate required secrets
     */
    validate(requiredSecrets = []) {
        const missing = requiredSecrets.filter(key => !this.has(key));
        
        if (missing.length > 0) {
            console.warn('⚠️  Missing required secrets:', missing);
            return {
                valid: false,
                missing
            };
        }
        
        return {
            valid: true,
            missing: []
        };
    }
    
    /**
     * Get secrets summary
     */
    getSummary() {
        const categories = {
            coinbase: [],
            discord: [],
            solana: [],
            database: [],
            jwt: [],
            other: []
        };
        
        this.secrets.forEach((value, key) => {
            const category = key.split('.')[0];
            if (categories[category]) {
                categories[category].push(key);
            } else {
                categories.other.push(key);
            }
        });
        
        return {
            total: this.secrets.size,
            categories: Object.entries(categories).map(([name, keys]) => ({
                name,
                count: keys.length,
                keys: keys.map(k => k.includes('secret') || k.includes('key') ? k + ' (hidden)' : k)
            }))
        };
    }
}

// Create singleton instance
const secretsManager = new SecretsManager();

module.exports = secretsManager;
