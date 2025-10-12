# TiltCheck Installation Guide

## Logo File Installation

### Step 1: Prepare the Logo File
Create or obtain your `tiltchecklogo.png` file. Requirements:
- Format: PNG
- Recommended size: 512x512px or larger
- Square aspect ratio
- Transparent background preferred

### Step 2: Install Logo Files
Copy the logo file to these locations:

```bash
# For main website favicon and logos
cp tiltchecklogo.png /path/to/tiltcheck/

# For browser extension icons  
cp tiltchecklogo.png /path/to/tiltcheck/public/
```

## Chrome Extension Installation

### Method 1: Load Unpacked Extension (Development)

1. **Open Chrome** and go to: `chrome://extensions/`
2. **Enable Developer Mode** (toggle in top right)
3. **Click "Load unpacked"**
4. **Navigate to and select** the `public/` folder in your TiltCheck project
5. **Click "Select Folder"**
6. The extension should now appear in your extensions list

### Method 2: Pack Extension (Production)

1. **Open Chrome** and go to: `chrome://extensions/`
2. **Enable Developer Mode**
3. **Click "Pack extension"**
4. **Select the `public/` folder** as the extension root
5. **Choose output location** for the .crx file
6. **Click "Pack extension"**
7. The .crx file can be distributed and installed

### Method 3: Install from Chrome Web Store (if published)

1. Go to the Chrome Web Store
2. Search for "TiltCheck"
3. Click "Add to Chrome"
4. Confirm installation

## Safari Extension Installation

### Prerequisites
- macOS with Safari 14+
- Xcode 12+ (for development)
- Apple Developer Account (for distribution)

### Method 1: Development Installation

1. **Open Safari** and enable Developer menu:
   - Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"

2. **Enable "Allow unsigned extensions"**:
   - Develop menu → Allow Unsigned Extensions
   - Note: This is temporary and resets on restart

3. **Convert Chrome extension to Safari format**:
   ```bash
   # Install safari-web-extension-converter if needed
   npm install -g safari-web-extension-converter
   
   # Convert the extension
   safari-web-extension-converter public/
   ```

4. **Load the converted extension**:
   - Develop menu → Web Extension → Allow Unsigned Extensions
   - Select the converted .app file

### Method 2: Xcode Development

1. **Open the project in Xcode**
2. **Build and run** the Safari extension target
3. **Enable the extension** in Safari preferences

### Method 3: Install from App Store (Production)

1. **Open Safari**
2. **Go to Safari → Safari Extensions**
3. **Search for "TiltCheck"**
4. **Click "Install"**

## Firefox Extension Installation

### Method 1: Load Temporary Add-on (Development)

1. **Open Firefox** and go to: `about:debugging`
2. **Click "This Firefox"** (left sidebar)
3. **Click "Load Temporary Add-on"**
4. **Navigate to the `public/manifest.json` file**
5. **Click "Open"**
6. The extension will be installed temporarily

### Method 2: Package Extension

1. **Create a ZIP file** of the `public/` folder
2. **Rename to .xpi** extension
3. **Drag and drop** the .xpi file into Firefox
4. **Confirm installation**

## Testing Installation

### Chrome Extension Testing
1. **Click the extension icon** in Chrome toolbar
2. **Verify popup appears** with TiltCheck branding
3. **Test overlay functionality** on supported websites

### Safari Extension Testing  
1. **Check Safari toolbar** for extension icon
2. **Verify extension appears** in Safari → Safari Extensions
3. **Test functionality** on supported websites

## Troubleshooting

### Extension Not Loading
- **Check manifest.json** syntax (validate with JSON validator)
- **Verify file paths** in manifest are correct
- **Check browser console** for errors

### Logo Not Displaying
- **Verify file exists** in correct locations
- **Check file permissions** (should be readable)
- **Clear browser cache** and reload

### Permission Issues
- **Check extension permissions** in manifest.json
- **Verify host permissions** match target websites
- **Reinstall extension** after manifest changes

## Development Workflow

1. **Make changes** to extension files
2. **Reload extension** in browser developer tools
3. **Test functionality**
4. **Update version** in manifest.json for production builds

## Distribution

### Chrome Web Store
1. **Create developer account** at Chrome Web Store
2. **Pack extension** as .crx or .zip
3. **Upload and submit** for review
4. **Publish** once approved

### Safari App Store
1. **Create Apple Developer account**
2. **Package extension** for App Store
3. **Submit for review**
4. **Publish** once approved

### Firefox Add-ons
1. **Create Mozilla developer account**
2. **Package as .xpi**
3. **Submit to AMO** (addons.mozilla.org)
4. **Publish** after review
