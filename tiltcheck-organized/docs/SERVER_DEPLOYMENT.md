# TiltCheck Server Deployment Instructions

## Server Credentials
- **Host**: server1.tiltcheck.it.com
- **User**: kvmnode202  
- **Port**: 6467
- **Password**: iVjgB6BM

## Quick Deployment

### 1. Install sshpass (if not already installed)

**macOS:**
```bash
brew install hudochenkov/sshpass/sshpass
```

**Linux:**
```bash
sudo apt-get install sshpass
```

### 2. Run Deployment Script

```bash
# Make the script executable
chmod +x scripts/deploy-to-tiltcheck-server.sh

# Run the deployment
./scripts/deploy-to-tiltcheck-server.sh
```

Or use the quick deploy script:

```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## What Gets Deployed

The deployment script will:

1. ✅ **SSL Manager**: Install with JWT token `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
2. ✅ **TiltCheck Bot**: Main Discord bot application
3. ✅ **AIM Messenger**: Complete overlay system with .wav sounds
4. ✅ **Encryption System**: Master key and secret encryption
5. ✅ **SSL Certificates**: Let's Encrypt certificates for HTTPS
6. ✅ **Nginx**: Web server configuration
7. ✅ **Systemd Services**: Auto-start services

## Server Management

### Connect to Server
```bash
chmod +x scripts/connect-to-server.sh
./scripts/connect-to-server.sh
```

### Manage Services
```bash
chmod +x scripts/manage-server.sh

# Check status
./scripts/manage-server.sh status

# Start services
./scripts/manage-server.sh start

# Restart services  
./scripts/manage-server.sh restart

# View logs
./scripts/manage-server.sh logs

# Test AIM messenger
./scripts/manage-server.sh aim-test
```

## Access Points After Deployment

- **Main Site**: https://server1.tiltcheck.it.com
- **AIM Overlay**: https://server1.tiltcheck.it.com:8080
- **SSH Access**: `ssh -p 6467 kvmnode202@server1.tiltcheck.it.com`

## Post-Deployment Configuration

1. **Update Discord Bot Token**:
   ```bash
   ssh -p 6467 kvmnode202@server1.tiltcheck.it.com
   cd /home/kvmnode202/tiltcheck
   nano .env
   # Update DISCORD_TOKEN with your bot token
   ```

2. **Encrypt Secrets**:
   ```bash
   node security/encrypt-secrets.js
   ```

3. **Test AIM Messenger**:
   ```bash
   curl https://server1.tiltcheck.it.com:8080
   ```

## Manual SSH Commands

If you prefer manual deployment:

```bash
# Connect to server
sshpass -p "iVjgB6BM" ssh -p 6467 kvmnode202@server1.tiltcheck.it.com

# Once connected, run:
curl -sL 'https://ssl-manager.s3.amazonaws.com/external/sh/installer.sh' | sh
echo 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZmODYyN2ZjOGE1NjAwMWM3YzY3ZTQiLCJpYXQiOjE3MzUzMDA2NDcsImV4cCI6MTczNTkwNTQ0N30.m8VlRwSfUJmLFb4MWayJNJ0WLbT7p_FyggkdX4bH_iE' | ssl-manager register
```

## Troubleshooting

- **Connection Issues**: Verify server credentials and port 6467 access
- **SSL Issues**: Check `ssl-manager status` and certificate renewal
- **Service Issues**: Use `./scripts/manage-server.sh logs` to view error logs
- **AIM Sounds**: Ensure `55817__sergenious__bloop2.wav` file is accessible

## Files Deployed

- ✅ `security/encrypt-secrets.js` - Encryption system
- ✅ `dashboard/aim-messenger.js` - AIM interface (841 lines)
- ✅ `dashboard/overlay.html` - Main overlay page
- ✅ `55817__sergenious__bloop2.wav` - AIM notification sound
- ✅ `src/bot.js` - Discord bot
- ✅ `package.json` - Dependencies
- ✅ `nginx/nginx.conf` - Web server config
- ✅ `compose.yaml` - Docker configuration
