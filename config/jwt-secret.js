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
 * 🔐 Production JWT Secret Generator
 * 
 * Generates and manages secure JWT secrets for production use
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

/**
 * Generate a secure JWT secret
 */
function generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Get or create JWT secret
 */
function getJWTSecret() {
    // Priority 1: Environment variable
    if (process.env.JWT_SECRET && process.env.JWT_SECRET !== 'your_jwt_secret') {
        return process.env.JWT_SECRET;
    }
    
    // Priority 2: Secrets file
    const secretsPath = path.join(__dirname, '../data/jwt-secret.txt');
    
    try {
        if (fs.existsSync(secretsPath)) {
            const secret = fs.readFileSync(secretsPath, 'utf8').trim();
            if (secret && secret.length >= 32) {
                return secret;
            }
        }
    } catch (error) {
        console.error('Error reading JWT secret file:', error.message);
    }
    
    // Priority 3: Generate new secret and save it
    console.log('⚠️  No JWT_SECRET found in environment or file');
    console.log('🔐 Generating new production JWT secret...');
    
    const newSecret = generateJWTSecret();
    
    try {
        fs.ensureDirSync(path.dirname(secretsPath));
        fs.writeFileSync(secretsPath, newSecret, { mode: 0o600 }); // Secure file permissions
        console.log('✅ JWT secret generated and saved to:', secretsPath);
        console.log('⚠️  Add this to your .env file for production:');
        console.log(`JWT_SECRET=${newSecret}`);
    } catch (error) {
        console.error('❌ Failed to save JWT secret:', error.message);
    }
    
    return newSecret;
}

/**
 * Validate JWT secret strength
 */
function validateJWTSecret(secret) {
    if (!secret) {
        return { valid: false, message: 'JWT secret is missing' };
    }
    
    if (secret === 'your_jwt_secret' || secret === 'change_me') {
        return { 
            valid: false, 
            message: 'JWT secret is using default/placeholder value - INSECURE!' 
        };
    }
    
    if (secret.length < 32) {
        return { 
            valid: false, 
            message: 'JWT secret is too short (minimum 32 characters)' 
        };
    }
    
    // Check for sufficient entropy
    const uniqueChars = new Set(secret).size;
    if (uniqueChars < 16) {
        return { 
            valid: false, 
            message: 'JWT secret lacks entropy (too few unique characters)' 
        };
    }
    
    return { valid: true, message: 'JWT secret is strong' };
}

/**
 * Rotate JWT secret (for production key rotation)
 */
function rotateJWTSecret() {
    const newSecret = generateJWTSecret();
    const secretsPath = path.join(__dirname, '../data/jwt-secret.txt');
    const backupPath = path.join(__dirname, '../data/jwt-secret-backup.txt');
    
    try {
        // Backup old secret
        if (fs.existsSync(secretsPath)) {
            const oldSecret = fs.readFileSync(secretsPath, 'utf8');
            fs.writeFileSync(backupPath, oldSecret);
            console.log('✅ Old JWT secret backed up');
        }
        
        // Save new secret
        fs.writeFileSync(secretsPath, newSecret, { mode: 0o600 });
        console.log('✅ New JWT secret generated');
        console.log('⚠️  Update your .env file:');
        console.log(`JWT_SECRET=${newSecret}`);
        console.log('\n⚠️  IMPORTANT: This will invalidate all existing JWT tokens!');
        
        return newSecret;
    } catch (error) {
        console.error('❌ Failed to rotate JWT secret:', error.message);
        throw error;
    }
}

module.exports = {
    generateJWTSecret,
    getJWTSecret,
    validateJWTSecret,
    rotateJWTSecret
};
