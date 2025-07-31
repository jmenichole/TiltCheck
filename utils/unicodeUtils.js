/**
 * 🌐 Unicode Utilities for TrapHouse Bot
 * 
 * Provides unicode-resistant functions for:
 * - String processing
 * - User input sanitization
 * - Emoji handling
 * - File operations
 * - Database storage
 */

const fs = require('fs');
const path = require('path');

class UnicodeUtils {
    
    /**
     * Sanitize user input to be unicode-safe
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return String(input);
        
        return input
            // Normalize unicode characters
            .normalize('NFD')
            // Remove zero-width characters and control characters
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            // Limit length to prevent overflow
            .substring(0, 2000)
            .trim();
    }
    
    /**
     * Safe string comparison that handles unicode
     */
    static safeEquals(str1, str2) {
        if (typeof str1 !== 'string' || typeof str2 !== 'string') {
            return String(str1) === String(str2);
        }
        
        return str1.normalize('NFD') === str2.normalize('NFD');
    }
    
    /**
     * Extract username safely from Discord user
     */
    static getDisplayName(user) {
        try {
            const username = user.username || user.displayName || user.tag || 'Unknown User';
            return this.sanitizeInput(username);
        } catch (error) {
            console.error('Error getting display name:', error);
            return 'Unknown User';
        }
    }
    
    /**
     * Safe file writing with unicode support
     */
    static async writeFileUnicodeSafe(filePath, data) {
        try {
            const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            
            // Ensure directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Write with UTF-8 encoding
            await fs.promises.writeFile(filePath, jsonData, { 
                encoding: 'utf8',
                flag: 'w'
            });
            
            return true;
        } catch (error) {
            console.error('Error writing unicode-safe file:', error);
            return false;
        }
    }
    
    /**
     * Safe file reading with unicode support
     */
    static async readFileUnicodeSafe(filePath, defaultValue = {}) {
        try {
            if (!fs.existsSync(filePath)) {
                return defaultValue;
            }
            
            const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading unicode-safe file:', error);
            return defaultValue;
        }
    }
    
    /**
     * Clean emoji from strings for database storage
     */
    static stripEmojis(text) {
        if (typeof text !== 'string') return String(text);
        
        return text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
            .trim();
    }
    
    /**
     * Validate if string contains only safe characters
     */
    static isSafeString(text) {
        if (typeof text !== 'string') return false;
        
        // Check for dangerous unicode patterns
        const dangerousPatterns = [
            /[\u202A-\u202E]/g, // Bidirectional text override
            /[\u2066-\u2069]/g, // Directional isolates
            /[\uFFF0-\uFFFF]/g, // Specials block
            /[\u0000-\u001F]/g, // Control characters
            /[\u007F-\u009F]/g, // DEL and C1 controls
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(text));
    }
    
    /**
     * Format currency safely
     */
    static formatCurrency(amount) {
        try {
            const num = parseFloat(amount) || 0;
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(num);
        } catch (error) {
            return `$${parseFloat(amount) || 0}`;
        }
    }
    
    /**
     * Safe Discord message content extraction
     */
    static extractMessageContent(message) {
        try {
            let content = message.content || '';
            
            // Clean content
            content = this.sanitizeInput(content);
            
            // Extract mentions safely
            const mentions = {
                users: [],
                channels: [],
                roles: []
            };
            
            if (message.mentions) {
                if (message.mentions.users) {
                    mentions.users = message.mentions.users.map(user => ({
                        id: user.id,
                        username: this.getDisplayName(user)
                    }));
                }
                
                if (message.mentions.channels) {
                    mentions.channels = message.mentions.channels.map(channel => ({
                        id: channel.id,
                        name: this.sanitizeInput(channel.name || 'unknown')
                    }));
                }
                
                if (message.mentions.roles) {
                    mentions.roles = message.mentions.roles.map(role => ({
                        id: role.id,
                        name: this.sanitizeInput(role.name || 'unknown')
                    }));
                }
            }
            
            return {
                content,
                mentions,
                author: {
                    id: message.author.id,
                    username: this.getDisplayName(message.author)
                }
            };
        } catch (error) {
            console.error('Error extracting message content:', error);
            return {
                content: '',
                mentions: { users: [], channels: [], roles: [] },
                author: { id: 'unknown', username: 'Unknown User' }
            };
        }
    }
    
    /**
     * Log with unicode safety
     */
    static log(level, message, data = null) {
        try {
            const timestamp = new Date().toISOString();
            const safeMessage = this.sanitizeInput(String(message));
            
            let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${safeMessage}`;
            
            if (data) {
                try {
                    const safeData = JSON.stringify(data, null, 2);
                    logEntry += `\nData: ${safeData}`;
                } catch (e) {
                    logEntry += `\nData: [Unable to stringify data]`;
                }
            }
            
            console.log(logEntry);
            
            // Write to log file
            this.writeLogToFile(level, safeMessage, data);
            
        } catch (error) {
            console.error('Error in unicode-safe logging:', error);
        }
    }
    
    /**
     * Write log to file with unicode safety
     */
    static async writeLogToFile(level, message, data) {
        try {
            const logDir = './logs';
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            
            const date = new Date().toISOString().split('T')[0];
            const logFile = path.join(logDir, `traphouse-${date}.log`);
            
            const timestamp = new Date().toISOString();
            let logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
            
            if (data) {
                try {
                    logEntry += `Data: ${JSON.stringify(data, null, 2)}\n`;
                } catch (e) {
                    logEntry += `Data: [Unable to stringify data]\n`;
                }
            }
            
            await fs.promises.appendFile(logFile, logEntry, { encoding: 'utf8' });
        } catch (error) {
            console.error('Error writing to log file:', error);
        }
    }
    
    /**
     * Generate safe filename from user input
     */
    static safeFilename(input) {
        return this.sanitizeInput(input)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 100)
            .toLowerCase();
    }
    
    /**
     * Validate Discord ID format
     */
    static isValidDiscordId(id) {
        return typeof id === 'string' && /^\d{17,19}$/.test(id);
    }
    
    /**
     * Safe number parsing
     */
    static safeParseNumber(input, defaultValue = 0) {
        try {
            const cleaned = String(input).replace(/[^\d.-]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? defaultValue : parsed;
        } catch (error) {
            return defaultValue;
        }
    }
    
    /**
     * Create unicode-safe backup of data
     */
    static async createUnicodeSafeBackup(data, filename) {
        try {
            const backupDir = './backups';
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupDir, `${filename}-${timestamp}.json`);
            
            // Clean data before backup
            const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
                if (typeof value === 'string') {
                    return this.sanitizeInput(value);
                }
                return value;
            }));
            
            await this.writeFileUnicodeSafe(backupFile, cleanData);
            
            this.log('info', `Unicode-safe backup created: ${backupFile}`);
            return backupFile;
        } catch (error) {
            this.log('error', 'Error creating unicode-safe backup', error);
            return null;
        }
    }
}

module.exports = UnicodeUtils;
