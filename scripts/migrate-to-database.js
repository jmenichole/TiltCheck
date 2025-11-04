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
 * 🔄 Database Migration Script
 * 
 * Migrates data from JSON files to PostgreSQL or MongoDB
 */

const fs = require('fs-extra');
const path = require('path');
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Determine target database
const TARGET_DB = process.env.MIGRATE_TO || 'postgresql'; // 'postgresql' or 'mongodb'

// JSON data directory
const dataDir = path.join(__dirname, '../data');

// PostgreSQL configuration
const pgConfig = {
    user: process.env.DB_USER || 'tiltcheck',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'tiltcheck',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// MongoDB configuration
const mongoConfig = {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'tiltcheck',
};

/**
 * Load JSON data
 */
async function loadJSONData() {
    console.log('📂 Loading JSON data...');
    
    const data = {
        users: [],
        payments: [],
        tips: [],
        vaults: [],
        accountability_buddies: [],
        degen_metrics: []
    };
    
    for (const [key, value] of Object.entries(data)) {
        const filePath = path.join(dataDir, `${key}.json`);
        if (await fs.pathExists(filePath)) {
            try {
                const fileData = await fs.readJson(filePath);
                data[key] = Array.isArray(fileData) ? fileData : [];
                console.log(`  ✓ Loaded ${data[key].length} ${key}`);
            } catch (error) {
                console.error(`  ✗ Error loading ${key}:`, error.message);
            }
        } else {
            console.log(`  ⊘ File not found: ${key}.json`);
        }
    }
    
    return data;
}

/**
 * Migrate to PostgreSQL
 */
async function migrateToPostgreSQL(data) {
    console.log('\n🐘 Migrating to PostgreSQL...');
    
    const pool = new Pool(pgConfig);
    
    try {
        // Test connection
        const client = await pool.connect();
        console.log('✓ Connected to PostgreSQL');
        client.release();
        
        // Migrate users
        if (data.users.length > 0) {
            console.log('\nMigrating users...');
            for (const user of data.users) {
                try {
                    await pool.query(
                        `INSERT INTO users (
                            id, email, username, password_hash, display_name, bio, avatar,
                            interests, experience_level, role, permissions, connected_accounts,
                            nft_minted, profile_complete, onboarding_completed,
                            created_at, updated_at, last_login
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                        ON CONFLICT (id) DO UPDATE SET
                            email = EXCLUDED.email,
                            updated_at = EXCLUDED.updated_at`,
                        [
                            user.id, user.email, user.username, user.password,
                            user.displayName, user.bio, user.avatar,
                            user.interests || [], user.experienceLevel, user.role || 'user',
                            JSON.stringify(user.permissions || {}),
                            JSON.stringify(user.connectedAccounts || {}),
                            user.nftMinted || false, user.profileComplete || false,
                            user.onboardingCompleted || false,
                            user.createdAt || new Date(), user.updatedAt || new Date(),
                            user.lastLogin || null
                        ]
                    );
                    console.log(`  ✓ Migrated user: ${user.username}`);
                } catch (error) {
                    console.error(`  ✗ Error migrating user ${user.username}:`, error.message);
                }
            }
        }
        
        // Migrate payments
        if (data.payments.length > 0) {
            console.log('\nMigrating payments...');
            for (const payment of data.payments) {
                try {
                    await pool.query(
                        `INSERT INTO payments (
                            user_id, session_id, amount, currency, status,
                            wallet_address, nft_minted, created_at, completed_at, expires_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT (session_id) DO NOTHING`,
                        [
                            payment.userId, payment.sessionId, payment.amount,
                            payment.currency || 'USD', payment.status,
                            payment.walletAddress, payment.nftMinted || false,
                            payment.createdAt || new Date(),
                            payment.completedAt || null,
                            payment.expiresAt || null
                        ]
                    );
                    console.log(`  ✓ Migrated payment: ${payment.sessionId}`);
                } catch (error) {
                    console.error(`  ✗ Error migrating payment:`, error.message);
                }
            }
        }
        
        // Migrate tips
        if (data.tips.length > 0) {
            console.log('\nMigrating tips...');
            for (const tip of data.tips) {
                try {
                    await pool.query(
                        `INSERT INTO tips (
                            sender_id, recipient_id, amount, message,
                            tilt_detected, tilt_score, created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            tip.senderId, tip.recipientId, tip.amount,
                            tip.message, tip.tiltDetected || false,
                            tip.tiltScore || 0, tip.createdAt || new Date()
                        ]
                    );
                } catch (error) {
                    console.error(`  ✗ Error migrating tip:`, error.message);
                }
            }
            console.log(`  ✓ Migrated ${data.tips.length} tips`);
        }
        
        // Migrate vaults
        if (data.vaults.length > 0) {
            console.log('\nMigrating vaults...');
            for (const vault of data.vaults) {
                try {
                    await pool.query(
                        `INSERT INTO vaults (
                            user_id, vault_type, amount, locked_at,
                            unlock_at, unlocked, reason
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            vault.userId, vault.type, vault.amount,
                            vault.lockedAt || new Date(),
                            vault.unlockAt, vault.unlocked || false,
                            vault.reason
                        ]
                    );
                } catch (error) {
                    console.error(`  ✗ Error migrating vault:`, error.message);
                }
            }
            console.log(`  ✓ Migrated ${data.vaults.length} vaults`);
        }
        
        // Migrate accountability buddies
        if (data.accountability_buddies.length > 0) {
            console.log('\nMigrating accountability buddies...');
            for (const buddy of data.accountability_buddies) {
                try {
                    await pool.query(
                        `INSERT INTO accountability_buddies (
                            user1_id, user2_id, roast_mode, interventions_count, created_at
                        ) VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (user1_id, user2_id) DO NOTHING`,
                        [
                            buddy.user1Id, buddy.user2Id, buddy.roastMode || false,
                            buddy.interventionsCount || 0, buddy.createdAt || new Date()
                        ]
                    );
                } catch (error) {
                    console.error(`  ✗ Error migrating buddy pair:`, error.message);
                }
            }
            console.log(`  ✓ Migrated ${data.accountability_buddies.length} buddy pairs`);
        }
        
        // Migrate degen metrics
        if (data.degen_metrics.length > 0) {
            console.log('\nMigrating degen metrics...');
            for (const metrics of data.degen_metrics) {
                try {
                    await pool.query(
                        `INSERT INTO degen_metrics (
                            user_id, degen_level, personality_type,
                            impulse_transactions, late_night_activity, grass_touching_score,
                            rug_pull_count, total_tips_sent, total_tips_received,
                            total_vaulted, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (user_id) DO UPDATE SET
                            degen_level = EXCLUDED.degen_level,
                            updated_at = EXCLUDED.updated_at`,
                        [
                            metrics.userId, metrics.degenLevel, metrics.personalityType,
                            metrics.impulseTransactions, metrics.lateNightActivity,
                            metrics.grassTouchingScore, metrics.rugPullCount,
                            metrics.totalTipsSent, metrics.totalTipsReceived,
                            metrics.totalVaulted, metrics.updatedAt || new Date()
                        ]
                    );
                } catch (error) {
                    console.error(`  ✗ Error migrating metrics:`, error.message);
                }
            }
            console.log(`  ✓ Migrated ${data.degen_metrics.length} degen metrics`);
        }
        
        console.log('\n✅ PostgreSQL migration completed!');
        
    } catch (error) {
        console.error('❌ PostgreSQL migration failed:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

/**
 * Migrate to MongoDB
 */
async function migrateToMongoDB(data) {
    console.log('\n🍃 Migrating to MongoDB...');
    
    const client = new MongoClient(mongoConfig.url);
    
    try {
        await client.connect();
        const db = client.db(mongoConfig.dbName);
        console.log('✓ Connected to MongoDB');
        
        // Migrate users
        if (data.users.length > 0) {
            const usersCollection = db.collection('users');
            await usersCollection.deleteMany({}); // Clear existing
            await usersCollection.insertMany(data.users);
            console.log(`✓ Migrated ${data.users.length} users`);
        }
        
        // Migrate payments
        if (data.payments.length > 0) {
            const paymentsCollection = db.collection('payments');
            await paymentsCollection.deleteMany({});
            await paymentsCollection.insertMany(data.payments);
            console.log(`✓ Migrated ${data.payments.length} payments`);
        }
        
        // Migrate tips
        if (data.tips.length > 0) {
            const tipsCollection = db.collection('tips');
            await tipsCollection.deleteMany({});
            await tipsCollection.insertMany(data.tips);
            console.log(`✓ Migrated ${data.tips.length} tips`);
        }
        
        // Migrate vaults
        if (data.vaults.length > 0) {
            const vaultsCollection = db.collection('vaults');
            await vaultsCollection.deleteMany({});
            await vaultsCollection.insertMany(data.vaults);
            console.log(`✓ Migrated ${data.vaults.length} vaults`);
        }
        
        // Migrate accountability buddies
        if (data.accountability_buddies.length > 0) {
            const buddiesCollection = db.collection('accountability_buddies');
            await buddiesCollection.deleteMany({});
            await buddiesCollection.insertMany(data.accountability_buddies);
            console.log(`✓ Migrated ${data.accountability_buddies.length} buddy pairs`);
        }
        
        // Migrate degen metrics
        if (data.degen_metrics.length > 0) {
            const metricsCollection = db.collection('degen_metrics');
            await metricsCollection.deleteMany({});
            await metricsCollection.insertMany(data.degen_metrics);
            console.log(`✓ Migrated ${data.degen_metrics.length} degen metrics`);
        }
        
        console.log('\n✅ MongoDB migration completed!');
        
    } catch (error) {
        console.error('❌ MongoDB migration failed:', error.message);
        throw error;
    } finally {
        await client.close();
    }
}

/**
 * Main migration function
 */
async function migrate() {
    console.log('🚀 Starting database migration...');
    console.log(`Target: ${TARGET_DB.toUpperCase()}\n`);
    
    try {
        // Load JSON data
        const data = await loadJSONData();
        
        // Migrate to target database
        if (TARGET_DB === 'postgresql') {
            await migrateToPostgreSQL(data);
        } else if (TARGET_DB === 'mongodb') {
            await migrateToMongoDB(data);
        } else {
            console.error('❌ Invalid target database. Use "postgresql" or "mongodb"');
            process.exit(1);
        }
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Update .env file with DB_TYPE=' + TARGET_DB);
        console.log('2. Backup JSON files to a safe location');
        console.log('3. Restart the application');
        console.log('4. Verify data integrity');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    migrate();
}

module.exports = { migrate };
