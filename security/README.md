# 🔐 TiltCheck Security System

## Overview
This security system provides enterprise-grade encryption for all sensitive data in your TiltCheck ecosystem using AES-256-GCM encryption.

## 🔧 Installation & Setup

```bash
# Install dependencies
npm install crypto-js dotenv

# Make scripts executable
chmod +x security/encrypt-secrets.js
chmod +x security/decrypt-secrets.js
```

## 🔒 Encryption Process

### Encrypt All Secrets
```bash
# Encrypt all environment files and sensitive data
node security/encrypt-secrets.js
```

**What gets encrypted:**
- Discord bot tokens
- API keys (Stripe, CoinMarketCap, etc.)
- Webhook secrets
- JWT secrets
- Database passwords
- VPS credentials
- SSL certificates
- Any value matching secret patterns

**Files processed:**
- `.env*` files
- `.vps-config`
- `ssl-manager-token.txt`
- `package.json` (if contains secrets)
- `degens_bot/.env*`
- Configuration JSON files

## 🔓 Decryption Process

### Decrypt All Secrets
```bash
# Decrypt all encrypted files
node security/decrypt-secrets.js
```

### Decrypt Single Value
```bash
# Decrypt a specific encrypted value
node security/decrypt-secrets.js "ENC[U2FsdGVkX1+abc123...]"
```

## 🚀 Runtime Environment Loading

### Using the Environment Secret Manager

```javascript
// Automatically loads and decrypts environment variables
const secretManager = require('./security/env-secret-manager');

// Get decrypted values
const discordToken = secretManager.get('DISCORD_TOKEN');
const stripeKey = secretManager.get('STRIPE_SECRET_KEY');

// Check if a value is encrypted
if (secretManager.isEncrypted(process.env.SOME_VALUE)) {
    console.log('Value is encrypted');
}
```

### Integration with Existing Code

```javascript
// Replace this:
// require('dotenv').config();

// With this:
require('./security/env-secret-manager');

// All your existing process.env calls will work normally
const token = process.env.DISCORD_TOKEN; // Automatically decrypted
```

## 📁 File Structure

```
security/
├── encrypt-secrets.js      # Encryption script
├── decrypt-secrets.js      # Decryption script
├── env-secret-manager.js   # Runtime environment loader
├── .master.key            # Master encryption key (KEEP SECURE!)
└── README.md              # This file
```

## 🔑 Master Key Management

### Security Best Practices
- **Never commit `.master.key` to version control**
- **Store master key in multiple secure locations**
- **Use different keys for different environments**

### Key Backup & Recovery
```bash
# Backup master key
cp security/.master.key ~/secure-backup/tiltcheck-master.key

# Restore master key
cp ~/secure-backup/tiltcheck-master.key security/.master.key
```

### Environment-Specific Keys
```bash
# Production key
cp security/.master.key.production security/.master.key

# Development key
cp security/.master.key.development security/.master.key
```

## 🛡️ Security Features

### Encryption Details
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with random salt
- **Format**: `ENC[encrypted_data]`
- **Master Key**: 256-bit randomly generated

### Automatic Detection
The system automatically detects secrets based on:
- Key name patterns (token, key, secret, password, etc.)
- Value characteristics (length, format, prefixes)
- Common patterns (JWT, API keys, hashes)

### File Backups
- Original files backed up before encryption
- Encrypted files backed up before decryption
- Rollback capability maintained

## 📊 Usage Examples

### Development Environment
```bash
# 1. Encrypt secrets before committing
node security/encrypt-secrets.js

# 2. Commit encrypted files
git add .env.deployment .vps-config
git commit -m "Add encrypted configuration"

# 3. On deployment, secrets auto-decrypt at runtime
npm start  # Uses env-secret-manager automatically
```

### Production Deployment
```bash
# 1. Transfer master key securely
scp security/.master.key user@server:/secure/location/

# 2. Deploy application
git clone repo && npm install

# 3. Copy master key to security directory
cp /secure/location/.master.key security/

# 4. Start application (auto-decrypts)
npm start
```

### VPS Deployment Integration
```bash
# In your deployment script
echo "🔐 Setting up secret management..."

# Copy master key from secure location
cp /root/.secrets/tiltcheck-master.key /var/www/tiltcheck/security/.master.key

# Verify permissions
chmod 600 /var/www/tiltcheck/security/.master.key

# Application will auto-decrypt on startup
systemctl start tiltcheck-main
```

## 🔄 Maintenance Commands

### Re-encrypt with New Key
```bash
# 1. Decrypt with old key
node security/decrypt-secrets.js

# 2. Remove old master key
rm security/.master.key

# 3. Encrypt with new key
node security/encrypt-secrets.js
```

### Verify Encryption Status
```bash
# Check which files contain encrypted data
grep -r "ENC\[" . --include="*.env*" --include="*.config"
```

### Security Audit
```bash
# Find unencrypted potential secrets
grep -r "token\|key\|secret\|password" . --include="*.env*" | grep -v "ENC\["
```

## ⚠️ Important Notes

1. **Master Key Security**: The `.master.key` file is critical - if lost, encrypted data cannot be recovered
2. **Environment Separation**: Use different master keys for dev/staging/production
3. **Backup Strategy**: Always backup the master key in multiple secure locations
4. **Access Control**: Limit access to the master key file (chmod 600)
5. **Rotation**: Regularly rotate master keys and re-encrypt secrets

## 🚨 Emergency Recovery

### If Master Key is Lost
```bash
# 1. Restore from backup files
cp .env.deployment.backup .env.deployment
cp .vps-config.backup .vps-config

# 2. Re-enter secrets manually
nano .env.deployment

# 3. Generate new master key and encrypt
rm security/.master.key
node security/encrypt-secrets.js
```

### If Encryption is Corrupted
```bash
# 1. Restore from backups
find . -name "*.backup" -exec sh -c 'cp "$1" "${1%.backup}"' _ {} \;

# 2. Verify restoration
node security/decrypt-secrets.js
```

## 🔧 Integration Examples

### Express.js Application
```javascript
// app.js
require('./security/env-secret-manager');

const express = require('express');
const app = express();

// Secrets are automatically decrypted
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL; // Auto-decrypted if encrypted

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

### Discord Bot Integration
```javascript
// bot.js
require('./security/env-secret-manager');

const { Client } = require('discord.js');

// Token is automatically decrypted
const client = new Client({ intents: ['Guilds', 'GuildMessages'] });

client.login(process.env.DISCORD_TOKEN); // Auto-decrypted
```

### Docker Integration
```dockerfile
# Dockerfile
FROM node:18

WORKDIR /app
COPY . .

# Install dependencies
RUN npm install

# Copy master key at runtime (not build time)
# COPY security/.master.key security/.master.key

# Application auto-decrypts on startup
CMD ["npm", "start"]
```

Your TiltCheck ecosystem is now protected with enterprise-grade encryption! 🛡️
