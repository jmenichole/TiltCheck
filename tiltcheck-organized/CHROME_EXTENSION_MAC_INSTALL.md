# 🛡️ TiltCheck Chrome Extension - Mac Installation Guide

## 📁 Extension Location
Your TiltCheck Chrome extension is ready at:
```
/Users/fullsail/tiltcheck/tiltcheck-organized/extension/
```

## 🚀 Step-by-Step Installation on Mac

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Open Chrome Browser**
   - Launch Google Chrome on your Mac

2. **Access Extensions Page**
   - Type in address bar: `chrome://extensions/`
   - OR: Chrome Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Look for "Developer mode" toggle in top-right corner
   - Click to enable it (should turn blue/on)

4. **Load Your Extension**
   - Click "Load unpacked" button (appears after enabling developer mode)
   - In Finder dialog, navigate to: `/Users/fullsail/tiltcheck/tiltcheck-organized/extension/`
   - Select the `extension` folder
   - Click "Open"

5. **Verify Installation**
   - Extension should appear in your extensions list
   - You should see "TiltCheck - Gambling Addiction Prevention" 
   - Extension icon may appear in Chrome toolbar

### Method 2: Access Extension Folder via Finder

1. **Open Finder**
   - Press `Cmd + Space` and type "Finder" OR click Finder in dock

2. **Navigate to Extension**
   - Press `Cmd + Shift + G` (Go to Folder)
   - Paste: `/Users/fullsail/tiltcheck/tiltcheck-organized/extension/`
   - Press Enter

3. **Verify Files Present**
   - You should see these files:
     - `manifest.json` (1,828 bytes)
     - `background.js` (7,497 bytes) 
     - `popup.html` (5,132 bytes)
     - `popup.js` (4,492 bytes)
     - `content-script-advanced.js` (12,880 bytes)
     - `tiltcheck-overlay.css` (5,154 bytes)
     - `icons/` folder with PNG files
     - `README.md` (installation guide)

4. **Keep This Folder Open**
   - Leave Finder window open to this location
   - Use this when Chrome asks you to "Select folder"

## 🔧 Troubleshooting

### If Extension Doesn't Load:
1. **Check File Permissions**
   ```bash
   cd /Users/fullsail/tiltcheck/tiltcheck-organized/extension/
   ls -la
   ```

2. **Verify manifest.json**
   - File should be present and readable
   - Should contain "manifest_version": 3

3. **Chrome Developer Tools**
   - After loading, click "Details" on extension
   - Check for any error messages
   - Look at "Inspect views" for debugging

### If Icons Don't Show:
- Icons are minimal PNGs for now
- Extension will still function without proper icons
- Can be updated later with better graphics

## 🎯 Testing Your Extension

1. **Visit a Test Site**
   - Try visiting any gambling-related website
   - Extension should inject content scripts
   - Overlay should appear if gambling behavior detected

2. **Check Extension Popup**
   - Click extension icon in Chrome toolbar
   - Should show TiltCheck dashboard with statistics
   - Settings should be accessible

3. **Console Testing**
   - Right-click on any webpage → "Inspect"
   - Go to "Console" tab
   - Look for TiltCheck-related messages

## 📱 Extension Features Active After Installation

- **Real-time Tilt Detection**: Monitors gambling behavior patterns
- **Intervention Overlay**: Shows calming interface when tilt detected  
- **QualifyFirst Integration**: Redirects users to earning opportunities
- **Statistics Dashboard**: Track intervention success and usage
- **Customizable Settings**: Adjust sensitivity and features

## 🔄 Development Mode Benefits

- **Live Debugging**: Console access and error reporting
- **Easy Updates**: Reload extension after code changes
- **Testing Environment**: Safe testing without affecting users
- **Full Chrome API Access**: All extension capabilities available

## 📞 Need Help?

If you encounter any issues:
1. Check Chrome's extension error messages
2. Ensure all files are in correct location
3. Verify Developer mode is enabled
4. Try reloading the extension

**Extension Path**: `/Users/fullsail/tiltcheck/tiltcheck-organized/extension/`
**Installation Method**: Load Unpacked
**Chrome URL**: `chrome://extensions/`

---

*Your TiltCheck extension is ready to help prevent gambling addiction and redirect users to earning opportunities through QualifyFirst integration! 🛡️*