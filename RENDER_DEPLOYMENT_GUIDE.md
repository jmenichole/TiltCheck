# 🚀 Render Deployment Guide for TiltCheck

This guide explains how to deploy TiltCheck to Render.com with the complete production infrastructure.

## 📋 Prerequisites

- Render account (free tier available)
- GitHub repository connected to Render
- Environment variables configured

## 🎯 Quick Deploy

### Option 1: One-Click Deploy (Recommended)

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/jmenichole/TiltCheck.git
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

3. **Configure Environment Variables**
   
   Render will prompt you to set these secrets:
   
   **Required:**
   - `JWT_SECRET` - Generate with: `node config/jwt-secret.js`
   - `DISCORD_BOT_TOKEN` - From Discord Developer Portal
   - `COINBASE_API_KEY` - From Coinbase Developer Platform
   
   **Optional but Recommended:**
   - `DATABASE_URL` - PostgreSQL connection string (Render provides free DB)
   - `DISCORD_CLIENT_ID` - For OAuth
   - `DISCORD_CLIENT_SECRET` - For OAuth
   - `DISCORD_WEBHOOK_URL` - For monitoring alerts
   - `CORS_ORIGIN` - Your frontend domain(s)

4. **Deploy**
   - Click "Apply" to create services
   - Render deploys automatically
   - Services available at `*.onrender.com` URLs

### Option 2: Manual Deploy

#### Step 1: Create Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name:** `tiltcheck-web`
   - **Runtime:** Node
   - **Build Command:** `npm install --legacy-peer-deps`
   - **Start Command:** `node api-server.js`
   - **Plan:** Free

#### Step 2: Set Environment Variables

Add these in the Environment tab:

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your_128_char_secret
CORS_ORIGIN=https://your-domain.com
DATABASE_URL=postgres://user:pass@host:5432/db
COINBASE_APP_ID=ca8b3b06-99e0-4611-affd-b39c2e7ca273
COINBASE_API_KEY=your_coinbase_key
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_secret
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
DISCORD_WEBHOOK_URL=your_webhook_url
```

#### Step 3: Add PostgreSQL Database (Optional)

1. Dashboard → New → PostgreSQL
2. **Name:** `tiltcheck-db`
3. **Plan:** Free (100MB)
4. Copy internal connection string
5. Add to `DATABASE_URL` in web service

#### Step 4: Create Discord Bot Worker (Optional)

1. Dashboard → New → Background Worker
2. Configure:
   - **Name:** `tiltcheck-discord-bot`
   - **Build Command:** `npm install --legacy-peer-deps`
   - **Start Command:** `node bot.js --mode integrated`
3. Add environment variables (same as web service)

#### Step 5: Configure Custom Domain (Optional)

1. Go to your web service → Settings → Custom Domain
2. Add your domain (e.g., `tiltcheck.com`)
3. Render provides free SSL via Let's Encrypt
4. Update DNS:
   ```
   CNAME @ your-service.onrender.com
   ```

## 🔧 Configuration Details

### render.yaml Structure

```yaml
services:
  - type: web
    name: tiltcheck-web
    runtime: node
    buildCommand: npm install --legacy-peer-deps
    startCommand: node api-server.js
    healthCheckPath: /health
    envVars:
      # Set these in Render Dashboard
```

### Port Configuration

Render automatically assigns a port (usually 10000). The app reads from `process.env.PORT`.

### Health Checks

Render monitors `/health` endpoint:
```javascript
// Already implemented in api-server.js
GET /health
Response: { status: 'healthy', uptime: 12345, ... }
```

## 🌐 CORS Configuration

Update CORS_ORIGIN with your domains:

**Single Domain:**
```bash
CORS_ORIGIN=https://tiltcheck.com
```

**Multiple Domains:**
```bash
CORS_ORIGIN=https://tiltcheck.com,https://app.tiltcheck.com,https://admin.tiltcheck.com
```

**Development:**
```bash
CORS_ORIGIN=*
```

## 🔒 SSL/HTTPS

Render provides **free automatic SSL** for all services:
- Let's Encrypt certificates
- Automatic renewal
- Custom domain support
- Wildcard certificates
- HTTP → HTTPS redirect built-in

No configuration needed!

## 📊 Monitoring

### Built-in Monitoring

Render provides:
- Service logs (7 days retention on free tier)
- Metrics dashboard (CPU, memory, requests)
- Health check monitoring
- Auto-restart on crashes

### TiltCheck Monitoring

Access admin dashboard at:
```
https://your-service.onrender.com/admin
```

Features:
- Real-time metrics
- User analytics
- Payment tracking
- System logs
- API endpoint stats

### Discord Alerts

Set `DISCORD_WEBHOOK_URL` to receive alerts for:
- Deployment success/failure
- System errors
- High memory usage
- Slow requests
- Authentication failures

## 🔄 Deployment Workflow

### Auto-Deploy on Git Push

Render automatically deploys when you push to main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Render deploys automatically
```

### Manual Deploy

1. Go to Render Dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

### Rollback

1. Go to service → "Events"
2. Find previous successful deploy
3. Click "Rollback to this version"

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-service.onrender.com/health
```

Expected:
```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2024-..."
}
```

### 2. API Test
```bash
curl -X POST https://your-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234"
  }'
```

### 3. CORS Test
```bash
curl -X OPTIONS https://your-service.onrender.com/api/auth/login \
  -H "Origin: https://yourdomain.com" \
  -v
```

Look for `Access-Control-Allow-Origin` header.

### 4. SSL Test
```bash
curl -vI https://your-service.onrender.com
```

Should show TLS 1.3 and Let's Encrypt certificate.

## 🐛 Troubleshooting

### Issue: Build Fails

**Error:** `npm install` fails

**Solution:**
```yaml
buildCommand: npm install --legacy-peer-deps --no-optional
```

### Issue: Port Not Found

**Error:** `Error: listen EADDRINUSE`

**Solution:** Render sets `PORT` automatically. Ensure:
```javascript
const PORT = process.env.PORT || 3000;
```

### Issue: Database Connection Fails

**Error:** `ECONNREFUSED` or timeout

**Solution:**
1. Use Render's internal connection string
2. Check `DATABASE_URL` is set correctly
3. Ensure PostgreSQL service is running
4. Verify firewall settings

### Issue: CORS Errors

**Error:** `Access-Control-Allow-Origin` missing

**Solution:**
```bash
# Set in Render environment variables
CORS_ORIGIN=https://your-frontend.com
```

### Issue: 502 Bad Gateway

**Causes:**
1. App crashed on startup
2. Port not listening
3. Health check failing

**Solution:**
1. Check logs in Render Dashboard
2. Verify `startCommand: node api-server.js`
3. Test locally first: `npm start`

### Issue: Environment Variables Not Loading

**Solution:**
1. Set in Render Dashboard (not .env file)
2. Restart service after adding variables
3. Use "Sync" option for secret variables

## 📈 Performance Optimization

### Free Tier Limits

Render free tier includes:
- 750 hours/month runtime
- 512 MB RAM
- Shared CPU
- Auto-sleep after 15 min inactivity
- 100 GB bandwidth/month

### Optimize for Free Tier

1. **Enable Sleep Prevention (Optional):**
   Use a service like UptimeRobot to ping every 10 minutes

2. **Reduce Memory Usage:**
   - Enable compression
   - Limit log file sizes
   - Use database instead of in-memory storage

3. **Optimize Build:**
   ```yaml
   buildCommand: npm install --production --legacy-peer-deps
   ```

### Upgrade Options

**Starter Plan ($7/month):**
- 2 GB RAM
- No auto-sleep
- Priority support
- Faster builds

## 🎯 Production Checklist

Before going live:

- [ ] Set strong `JWT_SECRET` (128 characters)
- [ ] Configure `CORS_ORIGIN` with actual domains
- [ ] Set up PostgreSQL database
- [ ] Add Discord OAuth credentials
- [ ] Add Coinbase API keys
- [ ] Set Discord webhook for alerts
- [ ] Test all API endpoints
- [ ] Verify SSL certificate active
- [ ] Configure custom domain
- [ ] Set up monitoring/alerts
- [ ] Test user registration flow
- [ ] Test payment integration
- [ ] Review logs for errors
- [ ] Enable database backups

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **TiltCheck Docs:** See `PRODUCTION_SETUP.md`
- **Support:** https://community.render.com

## 🆘 Getting Help

1. **Check Logs:**
   - Render Dashboard → Your Service → Logs

2. **Review Health:**
   - `https://your-service.onrender.com/health`
   - `https://your-service.onrender.com/api/admin/health`

3. **Discord Alerts:**
   - Check your Discord webhook channel
   - Review monitoring notifications

4. **Community:**
   - Render Community Forum
   - GitHub Issues
   - Discord Support Server

## ✅ Success!

Once deployed, your TiltCheck instance is available at:
- **API:** `https://tiltcheck-web.onrender.com`
- **Admin:** `https://tiltcheck-web.onrender.com/admin`
- **Health:** `https://tiltcheck-web.onrender.com/health`

Features:
- ✅ Complete authentication system
- ✅ AI-powered onboarding
- ✅ Coinbase payment integration
- ✅ JustTheTip behavioral analysis
- ✅ Admin dashboard
- ✅ Rate limiting active
- ✅ Free SSL/HTTPS
- ✅ Monitoring & logging
- ✅ Auto-deploy on push

**Your TiltCheck is production-ready!** 🚀✨
