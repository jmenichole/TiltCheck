# 🚀 Cloudflare DNS Setup for TiltCheck (Recommended)

## Why Cloudflare DNS?
- ✅ **Free SSL certificates** (automatic)
- ✅ **Better performance** (faster DNS resolution)
- ✅ **DDoS protection** included
- ✅ **Analytics and monitoring** 
- ✅ **Caching and CDN** features

## 🎯 Setup Steps:

### 1. Create Cloudflare Account
1. Go to https://cloudflare.com
2. Sign up for free account
3. Click "Add a Site"
4. Enter: `tiltcheck.it.com`

### 2. Import Existing DNS Records
Cloudflare will scan and import your current DNS records automatically.

### 3. Add Custom DNS Records
In Cloudflare DNS management, add:

```
Type: A
Name: @
Content: [YOUR_VPS_IP]
Proxy: Orange cloud (proxied) ✅

Type: A  
Name: server1
Content: [YOUR_VPS_IP]
Proxy: Gray cloud (DNS only) for SSH access

Type: A
Name: overlay
Content: [YOUR_VPS_IP] 
Proxy: Orange cloud (proxied) ✅

Type: A
Name: api
Content: [YOUR_VPS_IP]
Proxy: Orange cloud (proxied) ✅

Type: CNAME
Name: www
Content: tiltcheck.it.com
Proxy: Orange cloud (proxied) ✅
```

### 4. Update Nameservers in Namecheap
1. Login to Namecheap
2. Go to Domain List → tiltcheck.it.com → Manage
3. Change "Nameservers" from "Namecheap BasicDNS" to "Custom DNS"
4. Enter Cloudflare nameservers (provided by Cloudflare):
   ```
   NS1: something.ns.cloudflare.com
   NS2: something.ns.cloudflare.com
   ```

### 5. Verify Setup
- Wait 5-30 minutes for propagation
- Cloudflare will email you when setup is complete
- Test DNS resolution

## 🔧 Benefits for TiltCheck:

### Automatic SSL
- No need for Let's Encrypt setup
- Automatic certificate renewal
- HTTPS forced redirect

### Performance
- Global CDN for faster loading
- Cached static files (CSS, JS, images)
- Optimized for gaming/gambling sites

### Security
- DDoS protection for your Discord bot
- Web Application Firewall (WAF)
- Bot protection

### Monitoring
- Real-time analytics
- Performance insights
- Uptime monitoring

## 📋 Cloudflare DNS Configuration Script:

```bash
#!/bin/bash
# cloudflare-dns-setup.sh

echo "🌥️ Cloudflare DNS Setup for TiltCheck"
echo "====================================="

VPS_IP="YOUR_VPS_IP_HERE"  # Replace with actual IP

echo "Required Cloudflare DNS Records:"
echo ""
echo "A     @        $VPS_IP     (Proxied ☁️)"
echo "A     server1  $VPS_IP     (DNS Only ⚪)"  
echo "A     overlay  $VPS_IP     (Proxied ☁️)"
echo "A     api      $VPS_IP     (Proxied ☁️)"
echo "CNAME www      tiltcheck.it.com (Proxied ☁️)"
echo ""
echo "📝 Notes:"
echo "- server1 should be DNS Only for SSH access"
echo "- All others should be Proxied for Cloudflare benefits"
echo ""
echo "🔄 After setup, test with:"
echo "curl -I https://tiltcheck.it.com"
echo "ping server1.tiltcheck.it.com"
```

## 🎯 Quick Setup Checklist:

### Phase 1: Cloudflare Setup
- [ ] Create Cloudflare account
- [ ] Add tiltcheck.it.com domain
- [ ] Configure DNS records
- [ ] Note the nameservers provided

### Phase 2: Namecheap Update  
- [ ] Login to Namecheap
- [ ] Change to Custom DNS
- [ ] Enter Cloudflare nameservers
- [ ] Save changes

### Phase 3: Verification
- [ ] Wait for email confirmation from Cloudflare
- [ ] Test DNS resolution
- [ ] Verify SSL certificate
- [ ] Test TiltCheck deployment

## 🚨 Important Notes:

### SSH Access
- Keep `server1.tiltcheck.it.com` as "DNS Only" (gray cloud)
- This allows direct SSH without Cloudflare proxy

### SSL Certificates
- Cloudflare provides free SSL automatically
- No need to run certbot or SSL manager on server
- HTTPS will work immediately

### Bot Deployment
- Use `server1.tiltcheck.it.com` for SSH deployment
- Use `overlay.tiltcheck.it.com` for AIM system
- Use `api.tiltcheck.it.com` for Discord bot API

This setup will give you professional-grade DNS with free SSL and performance benefits!
