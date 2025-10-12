#!/bin/bash
#
# Copyright (c) 2024-2025 JME (jmenichole)
# All Rights Reserved
# 
# PROPRIETARY AND CONFIDENTIAL
# Unauthorized copying of this file, via any medium, is strictly prohibited.
# 
# This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
# For licensing information, see LICENSE file in the root directory.
#


# TiltCheck Chrome Extension Icon Generator
# Creates proper PNG icons for Chrome extension

echo "🛡️ Creating TiltCheck Chrome Extension Icons"
echo "==========================================="

cd /Users/fullsail/tiltcheck/tiltcheck-organized/extension/icons

# Remove old text files
rm -f *.txt

echo "📐 Generating PNG icons..."

# Method 1: Try to use ImageMagick if available
if command -v convert >/dev/null 2>&1; then
    echo "   Using ImageMagick to create icons..."
    
    # Create 16x16 icon
    convert -size 16x16 xc:transparent -fill "#667eea" -draw "circle 8,8 8,2" \
            -fill white -pointsize 10 -gravity center -annotate +0+0 "🛡" icon16.png
    
    # Create 32x32 icon  
    convert -size 32x32 xc:transparent -fill "#667eea" -draw "circle 16,16 16,4" \
            -fill white -pointsize 20 -gravity center -annotate +0+0 "🛡" icon32.png
            
    # Create 48x48 icon
    convert -size 48x48 xc:transparent -fill "#667eea" -draw "circle 24,24 24,6" \
            -fill white -pointsize 30 -gravity center -annotate +0+0 "🛡" icon48.png
            
    # Create 128x128 icon
    convert -size 128x128 xc:transparent -fill "#667eea" -draw "circle 64,64 64,16" \
            -fill white -pointsize 80 -gravity center -annotate +0+0 "🛡" icon128.png
            
    echo "✅ Icons created with ImageMagick"

# Method 2: Download from a simple icon service or create base64 encoded PNGs
else
    echo "   Creating minimal PNG icons..."
    
    # Create minimal 1x1 transparent PNGs that Chrome will accept
    # These are base64 encoded 1-pixel transparent PNGs
    
    # 16x16 minimal PNG
    echo "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVDiNpZM9SwNBEIafgwQSCxsLwcJCG1sLG0uxsLBQsLCwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQsLGwsLBQ" | base64 -d > icon16.png
    
    # Create simple colored squares for now
    # 32x32
    python3 -c "
from PIL import Image
import os
# Create a simple colored icon
for size, name in [(16, 'icon16.png'), (32, 'icon32.png'), (48, 'icon48.png'), (128, 'icon128.png')]:
    img = Image.new('RGBA', (size, size), (102, 126, 234, 255))
    # Add a simple white circle or shield shape would be better, but this works
    img.save(name)
    print(f'Created {name}')
" 2>/dev/null || echo "   Python PIL not available, creating basic PNGs..."

    # If Python PIL fails, create very basic PNG files
    if [ ! -f "icon16.png" ]; then
        # Create minimal valid PNG files (these are tiny 1x1 transparent PNGs)
        echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > icon16.png
        cp icon16.png icon32.png
        cp icon16.png icon48.png 
        cp icon16.png icon128.png
        echo "   Created minimal PNG placeholders"
    fi
fi

# Verify icons were created
echo ""
echo "📋 Icon Status:"
for icon in icon16.png icon32.png icon48.png icon128.png; do
    if [ -f "$icon" ]; then
        size=$(wc -c < "$icon")
        echo "   ✅ $icon (${size} bytes)"
    else
        echo "   ❌ $icon (missing)"
    fi
done

echo ""
echo "🚀 Chrome Extension Ready!"
echo "========================="
echo "📁 Extension Location: /Users/fullsail/tiltcheck/tiltcheck-organized/extension/"
echo ""
echo "🔧 To Install:"
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (top-right toggle)"
echo "3. Click 'Load unpacked'"
echo "4. Select folder: /Users/fullsail/tiltcheck/tiltcheck-organized/extension/"
echo "5. Click 'Open' to install"
echo ""
echo "✅ Extension files ready for unpacked installation!"