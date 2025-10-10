# TiltCheck GitHub Pages Deployment Guide

## 🚀 GitHub Pages Setup Complete!

### ✅ Files Ready for Deployment:
- **CNAME**: Configured for tiltcheck.it.com
- **Landing Pages**: Available in `/landing-pages/` directory
- **Index Page**: Main TiltCheck landing page ready

### 📋 Required Actions:

#### **1. Enable GitHub Pages in Repository Settings:**
```
1. Go to your GitHub repository
2. Click "Settings" tab
3. Scroll to "Pages" section (left sidebar)
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
```

#### **2. Update Namecheap DNS Settings:**
```
Log into Namecheap → Domain List → Manage → Advanced DNS
Add these records:

A Record:
Host: @
Value: 185.199.108.153
TTL: 300

A Record:
Host: @
Value: 185.199.109.153
TTL: 300

A Record:
Host: @
Value: 185.199.110.153
TTL: 300

A Record:
Host: @
Value: 185.199.111.153
TTL: 300

CNAME Record:
Host: www
Value: jmenichole.github.io
TTL: 300
```

#### **3. Verify Setup:**
- GitHub Pages will build and deploy automatically
- Check repository "Actions" tab for build status
- Domain will be live at: https://tiltcheck.it.com
- May take 24-48 hours for DNS propagation

### 🌐 Landing Pages Structure:
```
/ (root)                → Main TiltCheck landing
/landing-pages/beta     → Beta testing page
/landing-pages/justthetip → Crypto payment system
/dashboard/             → Ecosystem dashboard
/public/               → Static assets
```

### 🎯 Expected URLs After Deployment:
- **Main Site**: https://tiltcheck.it.com
- **Beta Access**: https://tiltcheck.it.com/landing-pages/beta.html
- **JustTheTip**: https://tiltcheck.it.com/landing-pages/justthetip.html
- **Developer Portfolio**: https://tiltcheck.it.com/landing-pages/developer-portfolio.html

### 🔧 Troubleshooting:
- If domain shows 404: Check GitHub Pages settings
- If DNS not resolving: Wait 24-48 hours for propagation
- If HTTPS not working: GitHub provides SSL automatically

### 📱 What's Deployed:
✅ **TiltCheck Main Landing** - Gambling accountability platform  
✅ **Beta Testing Page** - Access to beta features  
✅ **JustTheTip Crypto** - Payment and tipping system  
✅ **Casino Transparency** - 21+ casino analysis  
✅ **Strategy Coach** - AI gambling coaching  
✅ **Admin Dashboard** - NFT-protected admin access  

## 🎉 Next Steps:
1. Enable GitHub Pages in repository settings
2. Update DNS records in Namecheap
3. Wait for deployment (5-10 minutes)
4. Test the live site at tiltcheck.it.com

The TiltCheck ecosystem will be live and accessible once DNS propagates!
