# TiltCheck Chrome Extension - Installation Guide

## 📦 Extension Package Contents

This folder contains your complete TiltCheck Chrome extension ready for installation:

### Core Files:
- `manifest.json` - Extension configuration and permissions
- `background.js` - Service worker for monitoring and interventions  
- `content-script-advanced.js` - Gambling site monitoring script
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality and settings
- `tiltcheck-overlay.css` - Warning overlay styles

### Icons:
- `icons/icon16.png` - 16x16 toolbar icon
- `icons/icon32.png` - 32x32 interface icon  
- `icons/icon48.png` - 48x48 extension management icon
- `icons/icon128.png` - 128x128 Chrome Web Store icon

## 🚀 Installation Instructions

### Method 1: Load Unpacked (Recommended for Testing)

1. **Open Chrome Extensions Page**:
   - Type in address bar: `chrome://extensions/`
   - Or go to Chrome Menu > More Tools > Extensions

2. **Enable Developer Mode**:
   - Toggle "Developer mode" switch in top-right corner

3. **Load Extension**:
   - Click "Load unpacked" button
   - Navigate to this folder: `/Users/fullsail/tiltcheck/tiltcheck-organized/extension/`
   - Select the folder and click "Open"

4. **Verify Installation**:
   - Extension should appear in your extensions list
   - TiltCheck icon should appear in Chrome toolbar
   - Click icon to see popup interface

### Method 2: Pack Extension (For Distribution)

1. **Pack the Extension**:
   - In `chrome://extensions/` (with Developer mode on)
   - Click "Pack extension"
   - Select this extension folder
   - Chrome creates `.crx` file

2. **Install Packed Extension**:
   - Drag `.crx` file into Chrome
   - Click "Add extension" to confirm

## 🧪 Testing the Extension

1. **Visit Gambling Site**: Go to https://stake.us or similar
2. **Check Detection**: Extension should automatically detect gambling site
3. **Trigger Intervention**: Simulate tilt behavior (rapid clicking, large bets)
4. **Verify Popup**: Should see TiltCheck warning overlay
5. **Test Redirection**: Click survey button to redirect to QualifyFirst

## ⚙️ Extension Features

- **Real-time Monitoring**: Tracks user behavior on gambling sites
- **Tilt Detection**: AI-powered analysis of risky patterns
- **Instant Interventions**: Pop-up warnings when tilt detected
- **Survey Integration**: Redirects to QualifyFirst earning opportunities
- **Settings Control**: Configure intervention sensitivity
- **Statistics Tracking**: Monitor prevented losses and earnings

## 🔒 Privacy & Permissions

The extension requests these permissions:
- `activeTab` - Monitor current gambling site
- `storage` - Save settings and statistics
- `tabs` - Open survey redirection tabs
- `notifications` - Show tilt warnings
- `host_permissions` - Access gambling sites for monitoring

## 📞 Support

If you experience issues:
1. Check that Developer mode is enabled
2. Verify all files are in the extension folder
3. Look for errors in Chrome's extension console
4. Ensure gambling sites are not blocked by other extensions

## 🎯 Success Indicators

Extension is working correctly when:
- ✅ Icon appears in Chrome toolbar
- ✅ Popup opens with statistics and settings
- ✅ Gambling sites trigger automatic monitoring
- ✅ Tilt warnings appear during risky behavior
- ✅ Survey redirection works to localhost:3001

**Version**: 1.0.0  
**Manifest**: Version 3  
**Compatible**: Chrome 88+ and all Chromium browsers