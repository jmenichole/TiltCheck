# 🌐 Custom DNS Setup for TiltCheck

## Current DNS Status:
- **Domain**: `tiltcheck.it.com` (working, resolves to 192.64.119.6)
- **Issue**: Points to Namecheap URL forwarding, not your VPS
- **Need**: Custom DNS records pointing to your actual server

## 🎯 Custom DNS Configuration Steps:

### 1. Access Namecheap DNS Management
1. Login to https://namecheap.com
2. Go to "Domain List" → Find `tiltcheck.it.com`
3. Click "Manage" → "Advanced DNS" tab

### 2. Clear Existing Records
**Remove these current records:**
```
Type: URL Redirect Record
Host: @
Value: [current forwarding]
```

### 3. Add Custom DNS Records

**For VPS Server:**
```
Type: A Record
Host: @
Value: [YOUR_VPS_IP_ADDRESS]
TTL: Automatic

Type: A Record  
Host: server1
Value: [YOUR_VPS_IP_ADDRESS]
TTL: Automatic

Type: CNAME
Host: www
Value: tiltcheck.it.com.
TTL: Automatic

Type: A Record
Host: api
Value: [YOUR_VPS_IP_ADDRESS]
TTL: Automatic

Type: A Record
Host: overlay
Value: [YOUR_VPS_IP_ADDRESS]
TTL: Automatic
```

**For Email (Optional):**
```
Type: MX Record
Host: @
Value: mail.tiltcheck.it.com
Priority: 10
TTL: Automatic
```

**For SSL Certificate Validation:**
```
Type: TXT Record
Host: @
Value: [Will be provided by Let's Encrypt during setup]
TTL: Automatic
```

### 4. Subdomain Setup for TiltCheck Services

**Recommended DNS Structure:**
```
tiltcheck.it.com          → Main website
www.tiltcheck.it.com      → Redirect to main
server1.tiltcheck.it.com  → VPS server access
api.tiltcheck.it.com      → API endpoints
overlay.tiltcheck.it.com  → AIM overlay system
admin.tiltcheck.it.com    → Admin panel
bot.tiltcheck.it.com      → Discord bot status
ssl.tiltcheck.it.com      → SSL management
```

## 🛠️ Custom DNS Implementation Options:

### Option A: Use Namecheap DNS
**Pros**: Simple, integrated with domain
**Cons**: Limited features
**Setup**: Use Advanced DNS tab in Namecheap

### Option B: Cloudflare DNS (Recommended)
**Pros**: Better performance, free SSL, analytics
**Cons**: Need to change nameservers
**Setup**:
1. Create Cloudflare account
2. Add `tiltcheck.it.com` to Cloudflare
3. Change nameservers in Namecheap to Cloudflare's
4. Configure DNS records in Cloudflare

### Option C: AWS Route 53
**Pros**: Advanced routing, high availability
**Cons**: Costs money ($0.50/month per zone)
**Setup**: Create hosted zone in AWS Route 53

## 🚀 Quick Setup Script

Create this file and run after getting your VPS:

```bash
#!/bin/bash
# custom-dns-setup.sh

# Your VPS IP address
VPS_IP="XXX.XXX.XXX.XXX"  # Replace with your actual IP

echo "🌐 Setting up custom DNS for TiltCheck..."

# Test current DNS
echo "Current DNS resolution:"
nslookup tiltcheck.it.com

echo ""
echo "🎯 Required DNS Records:"
echo "A     @              $VPS_IP"
echo "A     server1        $VPS_IP" 
echo "A     api            $VPS_IP"
echo "A     overlay        $VPS_IP"
echo "CNAME www            tiltcheck.it.com."

echo ""
echo "📋 Manual Steps Required:"
echo "1. Login to Namecheap DNS management"
echo "2. Delete URL redirect records"
echo "3. Add the A records shown above"
echo "4. Wait 5-30 minutes for propagation"

echo ""
echo "🧪 Test after setup:"
echo "nslookup tiltcheck.it.com"
echo "nslookup server1.tiltcheck.it.com"
echo "ping tiltcheck.it.com"
```

## 🔧 DNS Testing Commands

**After making changes, test with:**
```bash
# Check main domain
nslookup tiltcheck.it.com
dig tiltcheck.it.com

# Check subdomain
nslookup server1.tiltcheck.it.com
dig server1.tiltcheck.it.com

# Check from different DNS servers
nslookup tiltcheck.it.com 8.8.8.8
nslookup tiltcheck.it.com 1.1.1.1

# Test connectivity
ping tiltcheck.it.com
ping server1.tiltcheck.it.com

# Check propagation globally
# Visit: https://dnschecker.org
```

## 📋 Custom DNS Checklist:

### Before Setup:
- [ ] Get your VPS IP address
- [ ] Access to Namecheap account
- [ ] Backup current DNS settings

### DNS Records to Add:
- [ ] A record: @ → VPS_IP
- [ ] A record: server1 → VPS_IP
- [ ] A record: api → VPS_IP
- [ ] A record: overlay → VPS_IP
- [ ] CNAME: www → tiltcheck.it.com

### After Setup:
- [ ] Test DNS resolution
- [ ] Wait for propagation (5-30 minutes)
- [ ] Test SSH access to server1.tiltcheck.it.com
- [ ] Configure SSL certificates
- [ ] Deploy TiltCheck system

## 🎯 Next Steps After DNS Setup:

1. **Get VPS Server** (DigitalOcean, Linode, etc.)
2. **Update DNS** with VPS IP address
3. **Deploy TiltCheck** using our scripts:
   ```bash
   # Update with your real server info
   sshpass -p 'your_password' ssh user@server1.tiltcheck.it.com
   ```
4. **Install SSL Manager** with your JWT token
5. **Setup SSL certificates** for HTTPS

## 🔍 Troubleshooting:

**DNS not resolving?**
- Check TTL settings (should be low for testing)
- Wait up to 48 hours for full propagation
- Clear local DNS cache: `sudo dscacheutil -flushcache`

**Still seeing old IP?**
- DNS propagation delay
- Try different DNS server (8.8.8.8)
- Check from different location/network

Would you like me to help you with any specific part of the DNS setup?
