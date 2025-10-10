# 🚀 TiltCheck VPS Deployment Guide

## Step 1: Get Your VPS IP Address

### Find Your VPS IP:
```bash
# On your VPS server, run one of these commands:
curl ifconfig.me
# OR
curl ipinfo.io/ip
# OR
hostname -I | awk '{print $1}'
# OR
ip route get 8.8.8.8 | awk '{print $7; exit}'
```

### Expected Output:
```
123.456.789.012  # Your actual public IP
```

**📝 Write down this IP address - you'll need it for DNS configuration!**

---

## Step 2: Update DNS in Namecheap

### Login to Namecheap:
1. Go to [namecheap.com](https://namecheap.com)
2. Login to your account
3. Go to "Domain List"
4. Click "Manage" next to `tiltcheck.it.com`

### Configure DNS Records:
1. Click on "Advanced DNS" tab
2. Delete any existing A records or CNAME records
3. Add these new records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | YOUR_VPS_IP | 300 |
| A Record | www | YOUR_VPS_IP | 300 |
| A Record | api | YOUR_VPS_IP | 300 |
| A Record | dashboard | YOUR_VPS_IP | 300 |
| A Record | admin | YOUR_VPS_IP | 300 |

### Example Configuration:
```
Type: A Record    Host: @           Value: 123.456.789.012    TTL: 300
Type: A Record    Host: www         Value: 123.456.789.012    TTL: 300
Type: A Record    Host: api         Value: 123.456.789.012    TTL: 300
Type: A Record    Host: dashboard   Value: 123.456.789.012    TTL: 300
Type: A Record    Host: admin       Value: 123.456.789.012    TTL: 300
```

### Save Changes:
- Click "Save All Changes"
- DNS propagation takes 5-10 minutes (TTL is set to 300 seconds)

---

## Step 3: Prepare VPS for Deployment

### Connect to Your VPS:
```bash
# Replace with your VPS details
ssh root@YOUR_VPS_IP
# OR
ssh ubuntu@YOUR_VPS_IP
```

### Make Script Executable:
```bash
# Download the deployment script
wget https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh

# Make it executable
chmod +x vps-deploy.sh

# Check the script
ls -la vps-deploy.sh
```

---

## Step 4: Run Deployment Script

### Execute as Root:
```bash
# Run the deployment script
sudo ./vps-deploy.sh
```

### What the Script Does:
1. ✅ Updates system packages
2. ✅ Installs Node.js and npm
3. ✅ Installs PM2 process manager
4. ✅ Installs and configures Nginx
5. ✅ Installs Certbot for SSL
6. ✅ Configures firewall
7. ✅ Clones TiltCheck repository
8. ✅ Installs dependencies
9. ✅ Creates environment configuration
10. ✅ Configures Nginx with SSL
11. ✅ Obtains Let's Encrypt SSL certificate
12. ✅ Sets up PM2 for process management
13. ✅ Creates systemd service
14. ✅ Starts all services
15. ✅ Creates management scripts

### Expected Runtime: 5-10 minutes

---

## Step 5: Verify Deployment

### Check Services:
```bash
# Check PM2 processes
pm2 list

# Check Nginx status
systemctl status nginx

# Check SSL certificates
certbot certificates

# Use the management script
tiltcheck-status
```

### Test URLs:
```bash
# Test main site
curl -I https://tiltcheck.it.com

# Test API
curl -I https://api.tiltcheck.it.com

# Test dashboard
curl -I https://dashboard.tiltcheck.it.com
```

### Expected Response:
```
HTTP/2 200
server: nginx
```

---

## Step 6: Configure Discord Bot

### Update Environment Variables:
```bash
# Edit the environment file
sudo nano /var/www/tiltcheck/.env
```

### Add Your Discord Tokens:
```env
# Discord Configuration (UPDATE THESE)
DISCORD_BOT_TOKEN=your_actual_bot_token_here
DISCORD_CLIENT_ID=your_actual_client_id_here
DISCORD_CLIENT_SECRET=your_actual_client_secret_here
```

### Restart Services:
```bash
# Restart TiltCheck services
tiltcheck-restart

# Or restart individual services
pm2 restart tiltcheck-api
pm2 restart tiltcheck-dashboard
```

---

## Step 7: Test Live Site

### Open in Browser:
- **Main Site**: https://tiltcheck.it.com
- **API**: https://api.tiltcheck.it.com
- **Dashboard**: https://dashboard.tiltcheck.it.com
- **Admin**: https://admin.tiltcheck.it.com

### Expected Results:
✅ SSL certificate shows as valid  
✅ All subdomains load correctly  
✅ No security warnings  
✅ Fast loading times  

---

## Troubleshooting

### DNS Not Propagating:
```bash
# Check DNS propagation
dig tiltcheck.it.com
nslookup tiltcheck.it.com

# Force DNS refresh (local)
sudo systemctl flush-dns  # Linux
sudo dscacheutil -flushcache  # macOS
```

### SSL Certificate Issues:
```bash
# Check certificate status
certbot certificates

# Renew certificate manually
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

### Service Not Starting:
```bash
# Check logs
tiltcheck-logs

# Check individual service logs
pm2 logs tiltcheck-api
pm2 logs tiltcheck-dashboard

# Restart services
tiltcheck-restart
```

### Port Issues:
```bash
# Check what's using ports
sudo netstat -tulpn | grep :4001
sudo netstat -tulpn | grep :3001

# Check firewall
sudo ufw status
```

---

## Management Commands

### Daily Operations:
```bash
# Check status of all services
tiltcheck-status

# Restart all services
tiltcheck-restart

# View recent logs
tiltcheck-logs

# Check PM2 processes
pm2 list

# Monitor logs in real-time
pm2 logs
```

### Updates:
```bash
# Update code from GitHub
cd /var/www/tiltcheck
git pull origin main
npm install
tiltcheck-restart
```

---

## Security Notes

### Firewall Configuration:
- ✅ SSH (port 22) - Restricted to your IP
- ✅ HTTP (port 80) - Redirects to HTTPS
- ✅ HTTPS (port 443) - Main traffic
- ✅ API (port 4001) - Internal only
- ✅ Dashboard (port 3001) - Internal only

### SSL Certificate:
- ✅ Let's Encrypt certificate
- ✅ Auto-renewal configured
- ✅ A+ SSL rating configuration
- ✅ HSTS headers enabled

### File Permissions:
- ✅ www-data user owns application files
- ✅ Environment file has restricted permissions (600)
- ✅ Log files are properly configured

---

## Success Indicators

When deployment is complete, you should see:

```
🎉 TiltCheck VPS Deployment Complete!

📱 Your TiltCheck ecosystem is now live at:
   Main Site: https://tiltcheck.it.com
   API: https://api.tiltcheck.it.com
   Dashboard: https://dashboard.tiltcheck.it.com
   Admin: https://admin.tiltcheck.it.com

🔧 Management Commands:
   tiltcheck-status   → Check all services
   tiltcheck-restart  → Restart services
   tiltcheck-logs     → View recent logs
```

**🎮 Your TiltCheck ecosystem is now live and ready to help users build better gambling habits!**
