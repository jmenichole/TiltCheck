/**
 * 🛡️ Unicode-Safe Storage Module for TrapHouse Bot
 * 
 * Provides unicode-resistant file operations for:
 * - User data storage
 * - Loan records
 * - Payment tracking
 * - Backup management
 */

const fs = require('fs');
const path = require('path');
const UnicodeUtils = require('./unicodeUtils');

class UnicodeSafeStorage {
    
    constructor(dataDir = './data') {
        this.dataDir = dataDir;
        this.ensureDataDirectory();
    }
    
    /**
     * Ensure data directory exists
     */
    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            UnicodeUtils.log('info', `Created data directory: ${this.dataDir}`);
        }
    }
    
    /**
     * Get file path for data type
     */
    getFilePath(dataType) {
        const filename = UnicodeUtils.safeFilename(dataType);
        return path.join(this.dataDir, `${filename}.json`);
    }
    
    /**
     * Load data with unicode safety
     */
    async loadData(dataType, defaultValue = {}) {
        try {
            const filePath = this.getFilePath(dataType);
            return await UnicodeUtils.readFileUnicodeSafe(filePath, defaultValue);
        } catch (error) {
            UnicodeUtils.log('error', `Error loading ${dataType} data`, error);
            return defaultValue;
        }
    }
    
    /**
     * Save data with unicode safety
     */
    async saveData(dataType, data) {
        try {
            const filePath = this.getFilePath(dataType);
            
            // Clean data before saving
            const cleanData = this.cleanDataForStorage(data);
            
            // Create backup before saving
            await this.createBackup(dataType, cleanData);
            
            const success = await UnicodeUtils.writeFileUnicodeSafe(filePath, cleanData);
            
            if (success) {
                UnicodeUtils.log('info', `Successfully saved ${dataType} data`);
            } else {
                UnicodeUtils.log('error', `Failed to save ${dataType} data`);
            }
            
            return success;
        } catch (error) {
            UnicodeUtils.log('error', `Error saving ${dataType} data`, error);
            return false;
        }
    }
    
    /**
     * Clean data object for safe storage
     */
    cleanDataForStorage(data) {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            if (typeof value === 'string') {
                return UnicodeUtils.sanitizeInput(value);
            }
            return value;
        }));
    }
    
    /**
     * Get user data safely
     */
    async getUserData(userId) {
        try {
            if (!UnicodeUtils.isValidDiscordId(userId)) {
                UnicodeUtils.log('warn', `Invalid Discord ID: ${userId}`);
                return this.getDefaultUserData(userId);
            }
            
            const userData = await this.loadData('users', {});
            
            if (!userData[userId]) {
                userData[userId] = this.getDefaultUserData(userId);
                await this.saveData('users', userData);
            }
            
            return userData[userId];
        } catch (error) {
            UnicodeUtils.log('error', `Error getting user data for ${userId}`, error);
            return this.getDefaultUserData(userId);
        }
    }
    
    /**
     * Save user data safely
     */
    async saveUserData(userId, data) {
        try {
            if (!UnicodeUtils.isValidDiscordId(userId)) {
                UnicodeUtils.log('warn', `Invalid Discord ID for save: ${userId}`);
                return false;
            }
            
            const userData = await this.loadData('users', {});
            userData[userId] = this.cleanDataForStorage(data);
            
            return await this.saveData('users', userData);
        } catch (error) {
            UnicodeUtils.log('error', `Error saving user data for ${userId}`, error);
            return false;
        }
    }
    
    /**
     * Get default user data structure
     */
    getDefaultUserData(userId) {
        return {
            id: userId,
            respect: 0,
            totalBorrowed: 0,
            totalRepaid: 0,
            loansCount: 0,
            trustLevel: 'low',
            rank: 'Street Soldier',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            payments: [],
            subscriptions: []
        };
    }
    
    /**
     * Get loan data safely
     */
    async getLoanData() {
        try {
            return await this.loadData('loans', {});
        } catch (error) {
            UnicodeUtils.log('error', 'Error getting loan data', error);
            return {};
        }
    }
    
    /**
     * Save loan data safely
     */
    async saveLoanData(data) {
        try {
            return await this.saveData('loans', data);
        } catch (error) {
            UnicodeUtils.log('error', 'Error saving loan data', error);
            return false;
        }
    }
    
    /**
     * Get payment data safely
     */
    async getPaymentData() {
        try {
            return await this.loadData('payments', { payments: [], subscriptions: [] });
        } catch (error) {
            UnicodeUtils.log('error', 'Error getting payment data', error);
            return { payments: [], subscriptions: [] };
        }
    }
    
    /**
     * Save payment data safely
     */
    async savePaymentData(data) {
        try {
            return await this.saveData('payments', data);
        } catch (error) {
            UnicodeUtils.log('error', 'Error saving payment data', error);
            return false;
        }
    }
    
    /**
     * Create backup of data
     */
    async createBackup(dataType, data) {
        try {
            const backupDir = path.join(this.dataDir, 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupDir, `${dataType}-backup-${timestamp}.json`);
            
            await UnicodeUtils.writeFileUnicodeSafe(backupFile, data);
            
            // Keep only last 10 backups
            await this.cleanOldBackups(dataType, backupDir);
            
            return backupFile;
        } catch (error) {
            UnicodeUtils.log('error', `Error creating backup for ${dataType}`, error);
            return null;
        }
    }
    
    /**
     * Clean old backup files
     */
    async cleanOldBackups(dataType, backupDir) {
        try {
            const files = fs.readdirSync(backupDir)
                .filter(file => file.startsWith(`${dataType}-backup-`))
                .map(file => ({
                    name: file,
                    path: path.join(backupDir, file),
                    time: fs.statSync(path.join(backupDir, file)).mtime
                }))
                .sort((a, b) => b.time - a.time);
            
            // Keep only the latest 10 backups
            if (files.length > 10) {
                const filesToDelete = files.slice(10);
                for (const file of filesToDelete) {
                    fs.unlinkSync(file.path);
                    UnicodeUtils.log('info', `Deleted old backup: ${file.name}`);
                }
            }
        } catch (error) {
            UnicodeUtils.log('error', 'Error cleaning old backups', error);
        }
    }
    
    /**
     * Migrate data to new format if needed
     */
    async migrateData() {
        try {
            UnicodeUtils.log('info', 'Starting data migration...');
            
            // Check for old format files and migrate them
            const oldFiles = [
                { old: './user_trust.json', new: 'users' },
                { old: './loans.json', new: 'loans' },
                { old: './userData.json', new: 'users' }
            ];
            
            for (const { old, new: newType } of oldFiles) {
                if (fs.existsSync(old)) {
                    UnicodeUtils.log('info', `Migrating ${old} to new format...`);
                    
                    const oldData = await UnicodeUtils.readFileUnicodeSafe(old, {});
                    await this.saveData(newType, oldData);
                    
                    // Backup old file
                    const backupPath = `${old}.backup-${Date.now()}`;
                    fs.renameSync(old, backupPath);
                    
                    UnicodeUtils.log('info', `Migration complete: ${old} -> ${this.getFilePath(newType)}`);
                }
            }
            
            UnicodeUtils.log('info', 'Data migration completed successfully');
        } catch (error) {
            UnicodeUtils.log('error', 'Error during data migration', error);
        }
    }
    
    /**
     * Validate data integrity
     */
    async validateDataIntegrity() {
        try {
            UnicodeUtils.log('info', 'Validating data integrity...');
            
            const dataTypes = ['users', 'loans', 'payments'];
            const results = {};
            
            for (const dataType of dataTypes) {
                const data = await this.loadData(dataType, {});
                
                results[dataType] = {
                    exists: true,
                    recordCount: Object.keys(data).length,
                    lastModified: this.getFileLastModified(dataType),
                    sizeBytes: JSON.stringify(data).length
                };
                
                // Validate specific data structures
                if (dataType === 'users') {
                    results[dataType].validUsers = Object.keys(data).filter(id => 
                        UnicodeUtils.isValidDiscordId(id)
                    ).length;
                }
            }
            
            UnicodeUtils.log('info', 'Data integrity validation complete', results);
            return results;
        } catch (error) {
            UnicodeUtils.log('error', 'Error validating data integrity', error);
            return null;
        }
    }
    
    /**
     * Get file last modified time
     */
    getFileLastModified(dataType) {
        try {
            const filePath = this.getFilePath(dataType);
            if (fs.existsSync(filePath)) {
                return fs.statSync(filePath).mtime.toISOString();
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Export all data for backup
     */
    async exportAllData() {
        try {
            const allData = {
                timestamp: new Date().toISOString(),
                users: await this.loadData('users', {}),
                loans: await this.loadData('loans', {}),
                payments: await this.loadData('payments', { payments: [], subscriptions: [] })
            };
            
            const exportFile = path.join(this.dataDir, `export-${Date.now()}.json`);
            await UnicodeUtils.writeFileUnicodeSafe(exportFile, allData);
            
            UnicodeUtils.log('info', `Data export complete: ${exportFile}`);
            return exportFile;
        } catch (error) {
            UnicodeUtils.log('error', 'Error exporting data', error);
            return null;
        }
    }
}

module.exports = UnicodeSafeStorage;
