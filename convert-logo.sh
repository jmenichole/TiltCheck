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


# TiltCheck Logo Conversion Script
# Converts SVG logo to PNG format

echo "🔄 TiltCheck Logo Conversion"
echo "============================"

# Check if SVG exists
if [ ! -f "assets/tiltcheck-logo.svg" ]; then
    echo "❌ Source SVG not found: assets/tiltcheck-logo.svg"
    exit 1
fi

echo "✅ Found source: assets/tiltcheck-logo.svg"

# Method 1: ImageMagick (if available)
if command -v convert &> /dev/null; then
    echo "📦 Using ImageMagick..."
    convert assets/tiltcheck-logo.svg -background transparent -size 512x512 tiltchecklogo.png
    echo "✅ Converted with ImageMagick"
elif command -v magick &> /dev/null; then
    echo "📦 Using ImageMagick (magick)..."
    magick assets/tiltcheck-logo.svg -background transparent -size 512x512 tiltchecklogo.png
    echo "✅ Converted with ImageMagick"
else
    echo "⚠️  ImageMagick not found. Alternative methods:"
    echo ""
    echo "1. Online conversion:"
    echo "   - Go to https://cloudconvert.com/svg-to-png"
    echo "   - Upload assets/tiltcheck-logo.svg"
    echo "   - Set size to 512x512px"
    echo "   - Download as tiltchecklogo.png"
    echo ""
    echo "2. Install ImageMagick:"
    echo "   brew install imagemagick"
    echo "   Then run: ./convert-logo.sh"
    echo ""
    echo "3. Use design software:"
    echo "   - Open assets/tiltcheck-logo.svg in Inkscape/Illustrator"
    echo "   - Export as PNG at 512x512px"
    exit 1
fi

# Verify the conversion
if [ -f "tiltchecklogo.png" ]; then
    echo "✅ Logo created: tiltchecklogo.png"
    ls -la tiltchecklogo.png
    echo ""
    echo "🚀 Next: Run ./setup-extension.sh to install"
else
    echo "❌ Conversion failed"
    exit 1
fi
