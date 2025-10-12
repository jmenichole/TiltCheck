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


# TiltCheck Extension Setup Script
# This script helps set up the logo file and prepares the extension for installation

echo "🔧 TiltCheck Extension Setup"
echo "============================"

# Check if logo file exists
if [ ! -f "tiltchecklogo.png" ]; then
    echo "⚠️  tiltchecklogo.png not found in root directory"
    echo "   Please add your logo file to the project root"
    echo "   Recommended: 512x512px PNG with transparent background"
    echo ""
    read -p "Do you want to continue without the logo file? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Logo file found: tiltchecklogo.png"
    
    # Copy logo to public directory for extension
    cp tiltchecklogo.png public/
    echo "✅ Logo copied to public/ directory for extension use"
fi

# Check extension files
echo ""
echo "📁 Checking extension files..."

REQUIRED_FILES=(
    "public/manifest.json"
    "public/popup.html"
    "public/popup.js"
    "public/overlay.html"
    "public/overlay.js"
    "public/overlay.css"
    "public/background.js"
    "public/content-script.js"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ All extension files present"
else
    echo "❌ Missing extension files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
fi

# Validate manifest.json
echo ""
echo "🔍 Validating manifest.json..."
if command -v jq &> /dev/null; then
    if jq empty public/manifest.json 2>/dev/null; then
        echo "✅ manifest.json is valid JSON"
    else
        echo "❌ manifest.json contains invalid JSON"
    fi
else
    echo "⚠️  jq not installed - skipping JSON validation"
fi

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. For Chrome: Open chrome://extensions/ → Enable Developer Mode → Load unpacked → Select 'public/' folder"
echo "2. For Firefox: Open about:debugging → Load Temporary Add-on → Select 'public/manifest.json'"
echo "3. For Safari: Use safari-web-extension-converter or Xcode"
echo ""
echo "📖 See INSTALLATION_GUIDE.md for detailed instructions"
