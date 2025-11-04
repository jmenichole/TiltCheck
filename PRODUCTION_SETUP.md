# 🚀 TiltCheck Production Setup Guide

Complete guide for deploying TiltCheck to production with rate limiting, database migration, monitoring, and admin dashboard.

## 📋 Quick Start

```bash
# 1. Clone and install
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck
npm install

# 2. Configure environment
cp .env.example .env
nano .env

# 3. Generate JWT secret
node -e "console.log(require('./config/jwt-secret').getJWTSecret())"

# 4. Migrate to database (optional)
MIGRATE_TO=postgresql node scripts/migrate-to-database.js

# 5. Start server
NODE_ENV=production node api-server.js
```

## 🗄️ Database Migration

### PostgreSQL (Recommended)

```bash
# Install
sudo apt-get install postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE tiltcheck;
CREATE USER tiltcheck WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tiltcheck TO tiltcheck;

# Update .env
DB_TYPE=postgresql
DB_HOST=localhost
DB_NAME=tiltcheck
DB_USER=tiltcheck
DB_PASSWORD=secure_password

# Migrate
MIGRATE_TO=postgresql node scripts/migrate-to-database.js
```

## 🔐 Production JWT Secret

**Auto-generate:**
```bash
node config/jwt-secret.js
```

**Manual:**
```bash
SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "JWT_SECRET=$SECRET" >> .env
```

## 🛡️ Rate Limiting

Enabled by default:
- Auth: 5 attempts / 15 min
- API: 100 requests / 15 min  
- Payment: 10 attempts / hour
- NFT Mint: 3 / day

Configure in `config/rate-limit.js`

## 🔗 JustTheTip Integration

```env
JUSTTHETIP_SECRETS_PATH=../justthetip/config/secrets.json
```

Automatically shares: Coinbase, Solana, TipCC secrets

## 🚢 CI/CD Pipeline

Add to GitHub Secrets:
- `RAILWAY_TOKEN`
- `DOCKER_USERNAME` / `DOCKER_PASSWORD`
- `DISCORD_WEBHOOK`
- `VPS_HOST` / `VPS_SSH_KEY`

Push to trigger deployment:
```bash
git push origin main
```

## 📊 Monitoring & Logging

Logs saved to `logs/` directory:

```bash
# View logs
tail -f logs/info-$(date +%Y-%m-%d).log | jq

# Metrics
curl http://localhost:3000/api/admin/metrics \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Set alert webhook:
```env
DISCORD_ALERT_WEBHOOK=https://discord.com/api/webhooks/...
```

## 🎛️ Admin Dashboard

1. Create admin user:
```javascript
// Make first user admin
const users = require('./data/users.json');
users[0].role = 'admin';
fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
```

2. Access: `http://localhost:3000/admin`

Features:
- Real-time metrics
- User management
- Payment tracking
- System logs
- API analytics

## 🔒 Security Checklist

- [ ] Strong JWT_SECRET (128+ chars)
- [ ] NODE_ENV=production
- [ ] CORS to specific domain
- [ ] Database instead of JSON
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting active
- [ ] Monitoring configured
- [ ] Admin access restricted
- [ ] Secrets encrypted
- [ ] Backups scheduled

## 🚀 Deployment

### Railway
```bash
railway login
railway init
railway up
```

### Docker
```bash
docker build -t tiltcheck .
docker run -d -p 3000:3000 --env-file .env tiltcheck
```

### PM2
```bash
pm2 start api-server.js --name tiltcheck
pm2 save
pm2 startup
```

## 📚 Documentation

- [LOGIN_PROFILE_IMPLEMENTATION.md](./LOGIN_PROFILE_IMPLEMENTATION.md)
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- [README.md](./README.md)

---

**All features implemented and production-ready!** 🎉
