# 🌐 Namecheap DNS Setup for tiltcheck.it.com

## 🎯 **Step 1: Choose DNS Option**
**Select:** "I want to update Host Records" (with Namecheap BasicDNS)

## 📋 **Step 2: Add These Host Records**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 300 |
| A | www | YOUR_SERVER_IP | 300 |
| A | dashboard | YOUR_SERVER_IP | 300 |
| A | api | YOUR_SERVER_IP | 300 |
| A | collectclock | YOUR_SERVER_IP | 300 |
| A | tilt | YOUR_SERVER_IP | 300 |
| A | admin | YOUR_SERVER_IP | 300 |
| A | vault | YOUR_SERVER_IP | 300 |
| A | portal | YOUR_SERVER_IP | 300 |
| A | bot | YOUR_SERVER_IP | 300 |

## 🔧 **Step 3: In Namecheap Interface**

1. **Login to Namecheap**
2. **Go to Domain List** → Find `tiltcheck.it.com`
3. **Click "Manage"**
4. **Advanced DNS** tab
5. **Add New Record** for each entry above

### **Example Entry:**
```
Record Type: A Record
Host: dashboard
Value: 123.456.789.123  # Your actual server IP
TTL: 300 (or Automatic)
```

## 🚀 **Step 4: Get Your Server IP**

If you don't know your server IP:

```bash
# If you're on your server:
curl ifconfig.me

# Or check with your VPS provider dashboard
```

## ⏰ **Step 5: Wait for Propagation**

- **Propagation Time:** 15 minutes to 2 hours (usually fast with Namecheap)
- **Full Global Propagation:** Up to 48 hours maximum

## 🧪 **Step 6: Test DNS Propagation**

Use our test dashboard:

```bash
# Open test dashboard in browser
open public/test-dashboard.html

# Or test manually:
nslookup dashboard.tiltcheck.it.com
```

## 🎯 **Why Namecheap BasicDNS?**

✅ **Reliable** - Namecheap's default DNS is fast and stable
✅ **Simple** - Easy to manage through their interface  
✅ **Free** - No additional cost
✅ **Fast Updates** - Changes propagate quickly
✅ **Backup** - Automatic redundancy

## 🚫 **Don't Choose:**

- **Custom DNS** - Only if you have your own DNS servers
- **Web Hosting DNS** - Only if using Namecheap shared hosting
- **BackupDNS** - Secondary option, not primary

## 🔍 **After DNS Setup:**

1. **Run the deployment script:**
   ```bash
   ./deploy-tiltcheck.sh
   ```

2. **Test all subdomains:**
   - https://tiltcheck.it.com
   - https://dashboard.tiltcheck.it.com
   - https://api.tiltcheck.it.com
   - etc.

## 💡 **Pro Tips:**

- Set TTL to 300 (5 minutes) for faster updates during setup
- Use @ for the root domain (tiltcheck.it.com)
- All subdomains point to the same server IP
- Nginx will handle the routing internally

## 🆘 **If You Need Help:**

The DNS setup script will guide you through testing:

```bash
./setup-tiltcheck-dns.sh
```

Your TrapHouse empire will be live once DNS propagates! 🏠🎯
