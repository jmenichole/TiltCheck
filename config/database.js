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
 * 🗄️ Database Configuration
 * 
 * Supports both PostgreSQL and MongoDB with automatic fallback to JSON files
 * for development
 */

const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const fs = require('fs-extra');
const path = require('path');

// Database type from environment
const DB_TYPE = process.env.DB_TYPE || 'json'; // 'postgresql', 'mongodb', or 'json'

// PostgreSQL configuration
const pgConfig = {
    user: process.env.DB_USER || 'tiltcheck',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'tiltcheck',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// MongoDB configuration
const mongoConfig = {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'tiltcheck',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
    }
};

// JSON file storage paths
const dataDir = path.join(__dirname, '../data');
const jsonFiles = {
    users: path.join(dataDir, 'users.json'),
    payments: path.join(dataDir, 'payments.json'),
    tips: path.join(dataDir, 'tips.json'),
    vaults: path.join(dataDir, 'vaults.json'),
    accountability_buddies: path.join(dataDir, 'accountability_buddies.json'),
    degen_metrics: path.join(dataDir, 'degen_metrics.json'),
};

// Database clients
let pgPool = null;
let mongoClient = null;
let mongoDb = null;

/**
 * Initialize database connection
 */
async function initializeDatabase() {
    try {
        if (DB_TYPE === 'postgresql') {
            console.log('🔌 Connecting to PostgreSQL...');
            pgPool = new Pool(pgConfig);
            
            // Test connection
            const client = await pgPool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            console.log('✅ PostgreSQL connected successfully');
            
            // Create tables if they don't exist
            await createPostgreSQLTables();
            
            return { type: 'postgresql', client: pgPool };
        } else if (DB_TYPE === 'mongodb') {
            console.log('🔌 Connecting to MongoDB...');
            mongoClient = new MongoClient(mongoConfig.url, mongoConfig.options);
            await mongoClient.connect();
            mongoDb = mongoClient.db(mongoConfig.dbName);
            
            // Test connection
            await mongoDb.command({ ping: 1 });
            
            console.log('✅ MongoDB connected successfully');
            
            // Create collections and indexes
            await createMongoDBCollections();
            
            return { type: 'mongodb', client: mongoDb };
        } else {
            console.log('📁 Using JSON file storage (development mode)');
            
            // Ensure data directory exists
            await fs.ensureDir(dataDir);
            
            // Initialize JSON files if they don't exist
            for (const [key, filePath] of Object.entries(jsonFiles)) {
                if (!await fs.pathExists(filePath)) {
                    await fs.writeJson(filePath, []);
                }
            }
            
            return { type: 'json', files: jsonFiles };
        }
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.log('⚠️ Falling back to JSON file storage');
        
        // Fallback to JSON
        await fs.ensureDir(dataDir);
        for (const [key, filePath] of Object.entries(jsonFiles)) {
            if (!await fs.pathExists(filePath)) {
                await fs.writeJson(filePath, []);
            }
        }
        
        return { type: 'json', files: jsonFiles };
    }
}

/**
 * Create PostgreSQL tables
 */
async function createPostgreSQLTables() {
    const queries = [
        // Users table
        `CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            display_name VARCHAR(100),
            bio TEXT,
            avatar VARCHAR(50),
            interests TEXT[], -- Array of interest tags
            experience_level VARCHAR(50),
            role VARCHAR(50) DEFAULT 'user',
            permissions JSONB DEFAULT '{}',
            connected_accounts JSONB DEFAULT '{}',
            nft_minted BOOLEAN DEFAULT FALSE,
            profile_complete BOOLEAN DEFAULT FALSE,
            onboarding_completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )`,
        
        // Payments table
        `CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'USD',
            status VARCHAR(50) NOT NULL,
            wallet_address VARCHAR(255),
            nft_minted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            expires_at TIMESTAMP
        )`,
        
        // Tips table
        `CREATE TABLE IF NOT EXISTS tips (
            id SERIAL PRIMARY KEY,
            sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(18, 8) NOT NULL,
            message TEXT,
            tilt_detected BOOLEAN DEFAULT FALSE,
            tilt_score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Vaults table
        `CREATE TABLE IF NOT EXISTS vaults (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            vault_type VARCHAR(50) NOT NULL,
            amount DECIMAL(18, 8) NOT NULL,
            locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            unlock_at TIMESTAMP NOT NULL,
            unlocked BOOLEAN DEFAULT FALSE,
            reason TEXT
        )`,
        
        // Accountability buddies table
        `CREATE TABLE IF NOT EXISTS accountability_buddies (
            id SERIAL PRIMARY KEY,
            user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            roast_mode BOOLEAN DEFAULT FALSE,
            interventions_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user1_id, user2_id)
        )`,
        
        // Degen metrics table
        `CREATE TABLE IF NOT EXISTS degen_metrics (
            id SERIAL PRIMARY KEY,
            user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            degen_level INTEGER DEFAULT 0,
            personality_type VARCHAR(50),
            impulse_transactions INTEGER DEFAULT 0,
            late_night_activity INTEGER DEFAULT 0,
            grass_touching_score INTEGER DEFAULT 100,
            rug_pull_count INTEGER DEFAULT 0,
            total_tips_sent DECIMAL(18, 8) DEFAULT 0,
            total_tips_received DECIMAL(18, 8) DEFAULT 0,
            total_vaulted DECIMAL(18, 8) DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Create indexes
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
        `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
        `CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(session_id)`,
        `CREATE INDEX IF NOT EXISTS idx_tips_sender ON tips(sender_id)`,
        `CREATE INDEX IF NOT EXISTS idx_tips_recipient ON tips(recipient_id)`,
        `CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id)`,
    ];
    
    for (const query of queries) {
        try {
            await pgPool.query(query);
        } catch (error) {
            console.error('Error creating table:', error.message);
        }
    }
    
    console.log('✅ PostgreSQL tables created');
}

/**
 * Create MongoDB collections and indexes
 */
async function createMongoDBCollections() {
    const collections = [
        'users',
        'payments',
        'tips',
        'vaults',
        'accountability_buddies',
        'degen_metrics'
    ];
    
    // Create collections
    for (const collectionName of collections) {
        try {
            await mongoDb.createCollection(collectionName);
        } catch (error) {
            // Collection might already exist
            if (!error.message.includes('already exists')) {
                console.error(`Error creating collection ${collectionName}:`, error.message);
            }
        }
    }
    
    // Create indexes
    try {
        await mongoDb.collection('users').createIndexes([
            { key: { email: 1 }, unique: true },
            { key: { username: 1 }, unique: true },
            { key: { created_at: -1 } }
        ]);
        
        await mongoDb.collection('payments').createIndexes([
            { key: { user_id: 1 } },
            { key: { session_id: 1 }, unique: true },
            { key: { status: 1 } },
            { key: { created_at: -1 } }
        ]);
        
        await mongoDb.collection('tips').createIndexes([
            { key: { sender_id: 1 } },
            { key: { recipient_id: 1 } },
            { key: { created_at: -1 } }
        ]);
        
        await mongoDb.collection('vaults').createIndexes([
            { key: { user_id: 1 } },
            { key: { unlock_at: 1 } },
            { key: { unlocked: 1 } }
        ]);
        
        await mongoDb.collection('degen_metrics').createIndexes([
            { key: { user_id: 1 }, unique: true }
        ]);
        
        console.log('✅ MongoDB indexes created');
    } catch (error) {
        console.error('Error creating indexes:', error.message);
    }
}

/**
 * Get database client
 */
function getDatabase() {
    if (DB_TYPE === 'postgresql') {
        return { type: 'postgresql', client: pgPool };
    } else if (DB_TYPE === 'mongodb') {
        return { type: 'mongodb', client: mongoDb };
    } else {
        return { type: 'json', files: jsonFiles };
    }
}

/**
 * Close database connection
 */
async function closeDatabase() {
    try {
        if (pgPool) {
            await pgPool.end();
            console.log('PostgreSQL connection closed');
        }
        if (mongoClient) {
            await mongoClient.close();
            console.log('MongoDB connection closed');
        }
    } catch (error) {
        console.error('Error closing database:', error.message);
    }
}

/**
 * Health check for database
 */
async function databaseHealthCheck() {
    try {
        if (DB_TYPE === 'postgresql' && pgPool) {
            const client = await pgPool.connect();
            await client.query('SELECT 1');
            client.release();
            return { status: 'healthy', type: 'postgresql' };
        } else if (DB_TYPE === 'mongodb' && mongoDb) {
            await mongoDb.command({ ping: 1 });
            return { status: 'healthy', type: 'mongodb' };
        } else {
            // Check if JSON files are accessible
            await fs.access(dataDir);
            return { status: 'healthy', type: 'json' };
        }
    } catch (error) {
        return { status: 'unhealthy', type: DB_TYPE, error: error.message };
    }
}

module.exports = {
    initializeDatabase,
    getDatabase,
    closeDatabase,
    databaseHealthCheck,
    DB_TYPE
};
