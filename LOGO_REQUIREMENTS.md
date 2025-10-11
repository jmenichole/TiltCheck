# TiltCheck Logo File Requirements

## File: tiltchecklogo.png

### Status: ❌ MISSING - Needs to be added

### Required Specifications:
- **Format**: PNG
- **Minimum Size**: 512x512px
- **Aspect Ratio**: Square (1:1)
- **Background**: Transparent preferred
- **Color Space**: RGB or RGBA

### Required Locations:
1. **Root directory**: `/tiltchecklogo.png`
   - Used for: Main website favicon, header logo, landing pages
   
2. **Extension directory**: `public/tiltchecklogo.png`  
   - Used for: Browser extension icons, popups, overlays

### How to Add the Logo:

#### Option 1: Create from existing SVG
```bash
# If you have design software (Inkscape, Adobe Illustrator, etc.)
# Open assets/tiltcheck-logo.svg and export as PNG at 512x512px
```

#### Option 2: Use online converter
```bash
# Convert SVG to PNG online, then save as tiltchecklogo.png
```

#### Option 3: Create new logo
```bash
# Design a new PNG logo meeting the specifications above
```

### Installation Steps:
```bash
# 1. Place the file in root directory
cp tiltchecklogo.png ./

# 2. Run setup script (copies to extension directory)
./setup-extension.sh

# 3. Verify installation
ls -la tiltchecklogo.png public/tiltchecklogo.png
```

### Current Project Logo Files:
- `assets/tiltcheck-logo.svg` - Main SVG logo
- `assets/tiltcheck-icon-32.svg` - Small icon SVG  
- `assets/tiltcheck-favicon.svg` - Favicon SVG

### Next Steps:
1. Create/obtain `tiltchecklogo.png`
2. Add to project root directory
3. Run `./setup-extension.sh`
4. Test in browsers

---
*Note: The PNG logo will be automatically scaled for different uses (favicon, extension icons, etc.)*
