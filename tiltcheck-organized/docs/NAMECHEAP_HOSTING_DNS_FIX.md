# 🌐 Namecheap Hosting DNS Configuration for TiltCheck

## Current Situation Analysis:
- **Domain**: `tiltcheck.it.com` 
- **Hosting**: Namecheap Hosting with cPanel
- **Issue**: Domain using hosting nameservers (redirect mode)
- **Server**: kvmnode202 on port 6467
- **Need**: Point domain to your actual VPS server

## 🎯 Solution Options:

### Option A: Use cPanel Domain Redirect (Quick Fix)
Since you're using Namecheap hosting nameservers, you can redirect in cPanel:

1. **Login to cPanel**:
   - Access your Namecheap hosting cPanel
   - Look for "Redirects" or "Domain Redirects"

2. **Create Redirect**:
   ```
   From: tiltcheck.it.com
   To: http://[YOUR_ACTUAL_VPS_IP]:8080
   Type: Permanent (301)
   ```

3. **Add Subdomain Redirects**:
   ```
   From: server1.tiltcheck.it.com  
   To: ssh://kvmnode202@[VPS_IP]:6467
   
   From: overlay.tiltcheck.it.com
   To: http://[VPS_IP]:8080
   ```

### Option B: Switch to Pure DNS Control (Recommended)
Change from hosting nameservers to DNS nameservers:

1. **In Namecheap Account**:
   - Go to Domain List → tiltcheck.it.com → Manage
   - Change "Nameservers" from "Namecheap Hosting" to "Namecheap BasicDNS"
   - **Warning**: This will disable your hosting services

2. **Add DNS Records**:
   ```
   Type: A Record
   Host: @
   Value: [YOUR_VPS_IP]
   
   Type: A Record  
   Host: server1
   Value: [YOUR_VPS_IP]
   
   Type: A Record
   Host: overlay  
   Value: [YOUR_VPS_IP]
   ```

### Option C: Keep Both (Hybrid Solution)
Use a subdomain for your VPS while keeping main domain on hosting:

1. **Keep main domain** on Namecheap hosting
2. **Create subdomain** pointing to your VPS:
   ```
   Type: A Record
   Host: vps
   Value: [YOUR_VPS_IP]
   ```
3. **Access your server** via: `vps.tiltcheck.it.com`

## 🔧 What's Your Actual VPS IP Address?

You mentioned you gave me your IP, but I see these credentials:
```
server1.tiltcheck.it.com  (hostname - doesn't resolve)
kvmnode202               (username)
port 6467                (SSH port)  
password iVjgB6BM        (password)
```

**I need your actual IP address** like: `123.456.789.012`

## 🚀 Quick Test Script

Let me create a script to test your actual server:

```bash
#!/bin/bash
# Test TiltCheck Server Connection

echo "🔍 Testing TiltCheck Server Connection..."

# Test what we know
echo "Hostname: server1.tiltcheck.it.com"
echo "User: kvmnode202"  
echo "Port: 6467"

# Try to resolve hostname
if ip=$(nslookup server1.tiltcheck.it.com 2>/dev/null | grep "Address:" | tail -1 | cut -d' ' -f2); then
    echo "Resolved IP: $ip"
    
    # Test SSH connection
    echo "Testing SSH connection..."
    sshpass -p 'iVjgB6BM' ssh -p 6467 -o ConnectTimeout=10 kvmnode202@$ip "echo 'Connection successful!'" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ SSH connection works!"
        echo "🚀 Ready to deploy TiltCheck"
    else
        echo "❌ SSH connection failed"
    fi
else
    echo "❌ Hostname doesn't resolve"
    echo "📋 Need actual IP address for DNS setup"
fi
```

## 📋 Information Needed:

**Please provide your actual VPS IP address, such as:**
- `192.168.1.100` (if local)
- `45.123.456.789` (if cloud VPS)
- Or the real IP behind server1.tiltcheck.it.com

**Then I can:**
1. ✅ Update DNS records properly
2. ✅ Deploy TiltCheck with correct SSL setup  
3. ✅ Configure AIM overlay system
4. ✅ Install SSL manager with your JWT token

## 🎯 Next Steps:

1. **Get your VPS IP address**
2. **Choose DNS option** (A, B, or C above)
3. **Update DNS configuration**
4. **Deploy TiltCheck system**

What's your actual server IP address?
