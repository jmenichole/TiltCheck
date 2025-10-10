# 🚀 TiltCheck VPS Deployment - Ready to Deploy!

## ✅ Your Server Details:
- **IP**: 203.161.58.173
- **Port**: 22 (standard SSH)
- **User**: root
- **Password**: VvKugq08S7o1z5J1ZE (temporary - will change on login)

## 🎯 Quick Deployment Steps:

### 1. First Login & Password Change
```bash
ssh root@203.161.58.173
# Enter temporary password: VvKugq08S7o1z5J1ZE
# Server will prompt you to change password
# Choose a strong new password and remember it
```

### 2. Run Automated Deployment
After password change, run the deployment script:
```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

### 3. Configure DNS in Namecheap
1. Login to Namecheap
2. Go to Domain List → tiltcheck.it.com → Manage
3. Change from "Namecheap Hosting" to "Namecheap BasicDNS"
4. Add these DNS records:
   ```
   A Record: @        → 203.161.58.173
   A Record: server1  → 203.161.58.173
   A Record: overlay  → 203.161.58.173
   CNAME:    www      → tiltcheck.it.com
   ```

### 4. Deploy TiltCheck Files
After DNS propagation (5-30 minutes):
```bash
ssh root@203.161.58.173
cd /root/tiltcheck
./deploy-tiltcheck.sh
```

## 🎵 What Gets Deployed:
- ✅ SSL Manager with your JWT token
- ✅ TiltCheck AIM messenger system
- ✅ .wav sound alerts (bloop for messages, jaw-harp for tilt)
- ✅ Encryption system
- ✅ SSL certificates
- ✅ Firewall configuration

## 🌐 After Deployment Access:
- **Main Site**: https://tiltcheck.it.com
- **AIM Overlay**: https://overlay.tiltcheck.it.com:8080
- **SSH Access**: ssh root@203.161.58.173

## 🔧 Server Management:
```bash
# Start TiltCheck services
./manage.sh start

# Stop services
./manage.sh stop

# Check status
./manage.sh status

# View logs
./manage.sh logs
```

Ready to deploy! Just connect to your server first to change the password, then run the deployment script.
