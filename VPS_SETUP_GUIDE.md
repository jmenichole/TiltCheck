# 🚀 TrapHouse VPS + Docker Quick Start Guide

## 📋 **Prerequisites**
- Fresh Ubuntu 22.04 VPS (DigitalOcean, Linode, Vultr)
- Domain name pointed to your VPS IP
- SSH access to your server

## 🏗️ **Step-by-Step Deployment**

### **1. Initial VPS Setup**
```bash
# SSH into your VPS
ssh root@your-server-ip

# Create non-root user
adduser traphouse
usermod -aG sudo traphouse
su - traphouse

# Clone the project
git clone https://github.com/jmenichole/TiltCheck.git
cd TiltCheck

# Run VPS setup script
./scripts/vps-setup.sh yourdomain.com your@email.com
```

### **2. Configure Environment**
```bash
# Copy environment template
cp .env.docker .env

# Edit with your actual tokens
nano .env
```

**Required Environment Variables:**
```env
DISCORD_TOKEN=your_traphouse_bot_token
TIPCC_API_KEY=your_tipcc_api_key
TIPCC_WEBHOOK_SECRET=your_tipcc_webhook_secret
DEGENS_DISCORD_TOKEN=your_degens_bot_token
```

### **3. Deploy Application**
```bash
# Logout and login to apply docker group
exit
ssh traphouse@your-server-ip

# Navigate to project and deploy
cd TiltCheck
./scripts/vps-deploy.sh yourdomain.com your@email.com
```

### **4. Verify Deployment**
```bash
# Check status
./scripts/vps-monitor.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl https://yourdomain.com/health
```

## 🎛️ **Management Commands**

### **Interactive Dashboard**
```bash
./scripts/vps-dashboard.sh
```

### **Manual Commands**
```bash
# Monitor system
./scripts/vps-monitor.sh

# Create backup
./scripts/vps-backup.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update deployment
git pull && docker-compose -f docker-compose.prod.yml up -d --build
```

## 🔧 **Troubleshooting**

### **Common Issues**

**1. Docker Permission Denied**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

**2. SSL Certificate Issues**
```bash
# Manual certificate renewal
sudo certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

**3. Container Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Rebuild container
docker-compose -f docker-compose.prod.yml build --no-cache [service-name]
```

**4. Domain Not Resolving**
```bash
# Check DNS records
dig yourdomain.com

# Test local resolution
curl -H "Host: yourdomain.com" http://localhost
```

## 📊 **Monitoring URLs**

- **Website**: https://yourdomain.com
- **Health Check**: https://yourdomain.com/health
- **Bot API**: https://yourdomain.com/api/traphouse/
- **Webhooks**: https://yourdomain.com/webhooks/

## 💰 **Cost Breakdown**

### **Monthly Costs:**
- **VPS**: $12/month (DigitalOcean 2GB)
- **Domain**: $1/month ($12/year)
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$13/month

### **Recommended VPS Specs:**
- **CPU**: 1-2 vCPU
- **RAM**: 2GB minimum
- **Storage**: 50GB SSD
- **Bandwidth**: 2TB+

## 🔄 **Automatic Updates**

### **Enable Auto-Updates**
```bash
# Auto-restart on system reboot
sudo systemctl enable traphouse

# Auto-update containers (optional)
# Watchtower is included in docker-compose.prod.yml
```

### **Manual Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update application
cd TiltCheck
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🛡️ **Security Features**

- ✅ UFW Firewall configured
- ✅ Fail2Ban for SSH protection
- ✅ SSL/TLS encryption
- ✅ Non-root containers
- ✅ Automatic security updates
- ✅ Rate limiting on APIs

## 📞 **Support**

### **Get Help:**
1. Check logs: `./scripts/vps-monitor.sh`
2. Run dashboard: `./scripts/vps-dashboard.sh`
3. Create backup: `./scripts/vps-backup.sh`
4. GitHub Issues: https://github.com/jmenichole/TiltCheck/issues

### **Emergency Recovery:**
```bash
# Restore from backup
cd ~/traphouse-backups
tar -xzf latest_backup.tar.gz
cd extracted_backup
./restore.sh
```

---

## 🎉 **You're Ready!**

Your TrapHouse Discord bot ecosystem is now running on a professional VPS with:
- 🏠 TrapHouse lending bot
- 🎲 Degens card game bot  
- 🌐 Marketing website
- 🔒 SSL certificates
- 📊 Monitoring dashboard
- 💾 Automated backups

**Access your dashboard**: `./scripts/vps-dashboard.sh`
