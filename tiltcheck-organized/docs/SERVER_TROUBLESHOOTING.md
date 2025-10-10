# TiltCheck Server Connection Troubleshooting

## 🚨 CONNECTION ISSUE DETECTED

**Problem:** Cannot connect to server1.tiltcheck.it.com:6467
**Root Cause:** DNS resolution and connectivity issues

## 🔍 Diagnostic Results:

✅ **Main Domain**: `tiltcheck.it.com` → `192.64.119.6`  
❌ **Subdomain**: `server1.tiltcheck.it.com` → NXDOMAIN (doesn't exist)  
❌ **SSH Port 22**: Connection timeout  
❌ **SSH Port 6467**: Connection timeout  

## 🛠️ Troubleshooting Steps:

### 1. Verify Server Credentials
Double-check with your hosting provider:
- Server hostname/IP
- SSH port number
- Username and password
- SSH key requirements

### 2. Try Alternative Connection Methods

**A. Direct IP Connection:**
```bash
# Try with the resolved IP
ssh -p 6467 kvmnode202@192.64.119.6
ssh -p 22 kvmnode202@192.64.119.6
```

**B. Main Domain Connection:**
```bash
ssh -p 6467 kvmnode202@tiltcheck.it.com
ssh -p 22 kvmnode202@tiltcheck.it.com
```

**C. Test Different Ports:**
```bash
# Common SSH ports
for port in 22 2222 6467 8022; do
    echo "Testing port $port..."
    nc -z -v 192.64.119.6 $port
done
```

### 3. Network Connectivity Tests

**Ping Test:**
```bash
ping -c 4 192.64.119.6
ping -c 4 tiltcheck.it.com
```

**Port Scan:**
```bash
nmap -p 22,6467,80,443 192.64.119.6
```

**Traceroute:**
```bash
traceroute 192.64.119.6
```

### 4. DNS Configuration Issues

The subdomain `server1.tiltcheck.it.com` doesn't exist. You may need to:

1. **Contact your hosting provider** to set up the subdomain
2. **Use the main domain** `tiltcheck.it.com` instead
3. **Use the direct IP** `192.64.119.6`

### 5. Firewall/Security Issues

The server might be:
- Behind a firewall blocking external SSH access
- Using key-based authentication instead of passwords
- Requiring VPN access
- Using a different SSH port

## 🔧 Immediate Solutions:

### Option 1: Contact Hosting Provider
Ask them to verify:
- Server status and accessibility
- Correct SSH credentials and port
- Firewall configuration
- DNS setup for server1.tiltcheck.it.com

### Option 2: Alternative Server Setup
If you have access to another server, we can deploy there instead.

### Option 3: Local Development
Set up the TiltCheck system locally first:

```bash
# Install SSL Manager locally (if compatible)
curl -sL 'https://ssl-manager.s3.amazonaws.com/external/sh/installer.sh' | sh

# Register with JWT token
echo 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZmODYyN2ZjOGE1NjAwMWM3YzY3ZTQiLCJpYXQiOjE3MzUzMDA2NDcsImV4cCI6MTczNTkwNTQ0N30.m8VlRwSfUJmLFb4MWayJNJ0WLbT7p_FyggkdX4bH_iE' | ssl-manager register

# Test AIM overlay locally
cd dashboard
python3 -m http.server 8080
# Access at http://localhost:8080
```

## 📞 Next Steps:

1. **Verify server credentials** with your hosting provider
2. **Check if server1 subdomain exists** or needs to be created
3. **Confirm SSH access method** (password vs key-based)
4. **Test connectivity** from a different network/location

Would you like me to help you with any of these troubleshooting steps?
