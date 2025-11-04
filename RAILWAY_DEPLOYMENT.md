# 🚂 Railway One-Click Deployment Guide

Complete guide for deploying TiltCheck to Railway with automatic GitHub Actions integration.

## 📋 Prerequisites

1. **GitHub Account** with this repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Railway CLI** (optional, for local deployment)

## 🚀 One-Click Deployment Setup

### Step 1: Connect Railway to GitHub

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select the `jmenichole/TiltCheck` repository
6. Railway will automatically detect the `railway.json` configuration

### Step 2: Configure Environment Variables

Railway will prompt you to set environment variables. Here are the **required** ones:

#### Essential Variables

```bash
# JWT Authentication (CRITICAL - Generate secure secret)
JWT_SECRET=your_128_character_production_secret

# Coinbase Payment Integration
COINBASE_APP_ID=ca8b3b06-99e0-4611-affd-b39c2e7ca273
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_API_SECRET=your_coinbase_api_secret
COINBASE_WALLET_SECRET=your_wallet_secret

# CORS Configuration (IMPORTANT FOR PRODUCTION)
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com

# Database (Optional - defaults to JSON)
DB_TYPE=postgresql  # or mongodb
DB_HOST=your_railway_postgres_host
DB_NAME=tiltcheck
DB_USER=postgres
DB_PASSWORD=your_db_password

# Discord Integration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_ALERT_WEBHOOK=your_discord_webhook_url

# Production Settings
NODE_ENV=production
RATE_LIMIT_ENABLED=true
SSL_ENABLED=true
```

#### Optional Variables

```bash
# Solana/Wallet Integration
SOLANA_WALLET_PRIVATE_KEY=your_solana_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# TipCC Integration
TIPCC_API_KEY=your_tipcc_key
TIPCC_SECRET_KEY=your_tipcc_secret

# JustTheTip Cross-Repo Secrets
JUSTTHETIP_SECRETS_PATH=../justthetip/config/secrets.json

# Email Service (Optional)
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your_email_key
EMAIL_FROM=noreply@yourdomain.com
```

### Step 3: Add PostgreSQL Database (Recommended)

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically create these environment variables:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
3. Update your service environment variables:
   ```bash
   DB_TYPE=postgresql
   DB_HOST=${{PGHOST}}
   DB_NAME=${{PGDATABASE}}
   DB_USER=${{PGUSER}}
   DB_PASSWORD=${{PGPASSWORD}}
   ```

### Step 4: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"** for free Railway subdomain (e.g., `tiltcheck.up.railway.app`)
3. Or click **"Custom Domain"** to add your own domain
4. Update DNS records as instructed by Railway
5. **Update CORS_ORIGIN** with your domain:
   ```bash
   CORS_ORIGIN=https://yourdomain.com
   ```

### Step 5: Enable SSL/HTTPS

Railway automatically provides SSL certificates for all domains. No configuration needed!

**Automatic SSL Features:**
- ✅ Free SSL certificates via Let's Encrypt
- ✅ Automatic certificate renewal
- ✅ HTTP to HTTPS redirect (built into our server)
- ✅ HSTS headers enabled

## 🔄 GitHub Actions Automatic Deployment

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add:

#### Required Secrets

```bash
# Railway Deployment
RAILWAY_TOKEN=your_railway_api_token
RAILWAY_PROJECT_ID=your_project_id

# Production JWT Secret (CRITICAL)
JWT_SECRET=your_128_character_secret

# Coinbase Configuration
COINBASE_APP_ID=ca8b3b06-99e0-4611-affd-b39c2e7ca273
COINBASE_API_KEY=your_key
COINBASE_API_SECRET=your_secret

# Discord Configuration
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret
DISCORD_ALERT_WEBHOOK=your_webhook

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Database Configuration
DB_TYPE=postgresql
DB_HOST=your_host
DB_NAME=tiltcheck
DB_USER=your_user
DB_PASSWORD=your_password
```

#### Get Your Railway Token

1. Go to [Railway Account Settings](https://railway.app/account/tokens)
2. Click **"Create Token"**
3. Copy the token and add it to GitHub Secrets as `RAILWAY_TOKEN`

#### Get Your Railway Project ID

1. Open your Railway project
2. Go to **Settings** → **General**
3. Copy the **Project ID**
4. Add it to GitHub Secrets as `RAILWAY_PROJECT_ID`

### Automatic Deployment Workflow

Once configured, the GitHub Actions workflow will automatically:

1. **On every push to `main` branch:**
   - ✅ Run tests on Node.js 18.x and 20.x
   - ✅ Check for security vulnerabilities
   - ✅ Build Docker image
   - ✅ Deploy to Railway
   - ✅ Set environment variables
   - ✅ Run database migrations
   - ✅ Perform health check
   - ✅ Send Discord notification

2. **On pull requests:**
   - ✅ Run tests
   - ✅ Validate configuration files
   - ✅ Check for security issues

## 🧪 Test Your Deployment

After deployment, test your endpoints:

### Health Check
```bash
curl https://your-domain.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "version": "2.0.0",
  "features": {
    "authentication": true,
    "profile": true,
    "onboarding": true,
    "payment": true,
    "justTheTip": true
  }
}
```

### API Documentation
```bash
curl https://your-domain.railway.app/api-docs
```

### Test Authentication
```bash
# Register a new user
curl -X POST https://your-domain.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123"
  }'
```

## 📊 Monitoring Your Deployment

### Railway Dashboard

1. **Metrics**: View CPU, Memory, Network usage
2. **Logs**: Real-time application logs
3. **Deployments**: History of all deployments
4. **Health**: Automatic health check monitoring

### Admin Dashboard

Access your admin dashboard at:
```
https://your-domain.railway.app/admin
```

Features:
- Real-time system metrics
- User management
- Payment tracking
- System logs
- API analytics

### Discord Notifications

Configure `DISCORD_ALERT_WEBHOOK` to receive:
- ✅ Successful deployment notifications
- ❌ Failed deployment alerts
- 🚨 Critical system errors
- 📊 Performance warnings

## 🔒 Security Best Practices

### 1. JWT Secret

**CRITICAL**: Never use a weak JWT secret in production.

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use the built-in generator:
```bash
node config/jwt-secret.js
```

### 2. CORS Configuration

**Development:**
```bash
CORS_ORIGIN=*
```

**Production (Single Domain):**
```bash
CORS_ORIGIN=https://yourdomain.com
```

**Production (Multiple Domains):**
```bash
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com,https://admin.yourdomain.com
```

### 3. Database Security

- ✅ Use Railway's PostgreSQL addon
- ✅ Enable SSL connections
- ✅ Use strong passwords
- ✅ Regular backups (automatic on Railway)

### 4. Environment Variables

- ❌ **NEVER** commit `.env` files to Git
- ✅ Use Railway's environment variable management
- ✅ Use GitHub Secrets for CI/CD
- ✅ Rotate secrets regularly

### 5. Rate Limiting

Configured and enabled by default:
- Auth endpoints: 5 attempts / 15 minutes
- API endpoints: 100 requests / 15 minutes
- Payment endpoints: 10 attempts / hour
- NFT minting: 3 / day

## 🐛 Troubleshooting

### Deployment Fails

1. **Check Railway logs:**
   - Go to your project → **Deployments** → Click on failed deployment
   - Review build and runtime logs

2. **Verify environment variables:**
   - Ensure all required variables are set
   - Check for typos in variable names

3. **Database connection issues:**
   - Verify PostgreSQL is running
   - Check `DB_HOST`, `DB_USER`, `DB_PASSWORD`
   - Test connection from Railway's shell

### Health Check Fails

1. **Check server startup:**
   ```bash
   # In Railway shell
   curl http://localhost:3000/health
   ```

2. **Verify PORT variable:**
   - Railway sets `PORT` automatically
   - Don't hardcode port in your app

3. **Check logs for errors:**
   - Look for startup errors
   - Verify all dependencies loaded

### CORS Errors

1. **Verify CORS_ORIGIN:**
   ```bash
   # Should match your frontend domain
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Include protocol:**
   - ✅ `https://yourdomain.com`
   - ❌ `yourdomain.com`

3. **Check browser console:**
   - Look for specific CORS error messages
   - Verify request origin matches allowed origin

### SSL Issues

Railway handles SSL automatically, but if you have issues:

1. **Custom domain SSL:**
   - Ensure DNS records are correct
   - Wait for SSL certificate provisioning (can take 5-10 minutes)

2. **Mixed content errors:**
   - Ensure all resources load via HTTPS
   - Update API URLs to use HTTPS

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [TiltCheck Implementation Guide](./LOGIN_PROFILE_IMPLEMENTATION.md)
- [Production Setup Guide](./PRODUCTION_SETUP.md)

## 🆘 Support

If you encounter issues:

1. Check Railway logs and GitHub Actions logs
2. Review this guide and documentation
3. Check Railway's status page: [status.railway.app](https://status.railway.app)
4. Contact Railway support via Discord or email

## 🎉 Success!

Once deployed, your TiltCheck instance will be:
- ✅ Accessible via HTTPS with automatic SSL
- ✅ Protected by rate limiting
- ✅ Monitored with health checks
- ✅ Automatically deployed on every push
- ✅ Scalable with Railway's infrastructure
- ✅ Backed up with database snapshots

**Your production-ready TiltCheck API is now live!** 🚀
