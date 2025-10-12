# Quick Installation Reference

## Logo File
```bash
# Place tiltchecklogo.png in these locations:
cp tiltchecklogo.png ./           # Root directory (main site)
cp tiltchecklogo.png ./public/    # Extension directory
```

## Chrome Extension (Development)
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `public/` folder
5. Extension loads immediately

## Firefox Extension (Development)  
1. Open `about:debugging`
2. Click "This Firefox" (sidebar)
3. Click "Load Temporary Add-on"
4. Select `public/manifest.json`
5. Extension loads for current session

## Safari Extension (Development)
1. Install converter: `npm install -g safari-web-extension-converter`
2. Convert: `safari-web-extension-converter public/`
3. Safari → Develop → Allow Unsigned Extensions
4. Load the generated .app file

## Automated Setup
```bash
# Run the setup script
./setup-extension.sh

# It will:
# - Check for logo file
# - Copy logo to public/
# - Validate extension files
# - Provide next steps
```

## File Structure
```
tiltcheck/
├── tiltchecklogo.png          # Main logo
├── public/
│   ├── tiltchecklogo.png      # Extension logo
│   ├── manifest.json          # Extension config
│   ├── popup.html/js          # Extension popup
│   ├── overlay.html/js/css    # Website overlay
│   └── content-script.js      # Page injection
└── INSTALLATION_GUIDE.md      # Full instructions
```

## Testing
- **Chrome**: Click extension icon → Verify popup
- **Firefox**: Check toolbar → Verify functionality  
- **Safari**: Safari → Safari Extensions → Verify enabled

## Troubleshooting
- **Extension not loading**: Check manifest.json syntax
- **Logo not showing**: Verify file exists and permissions
- **Permissions denied**: Check manifest permissions match sites
