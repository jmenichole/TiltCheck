#!/bin/bash

# TiltCheck Chrome Extension - Quick Install Helper
# Run this script to open the extension folder and Chrome extensions page

echo "🛡️ TiltCheck Chrome Extension - Quick Install"
echo "=============================================="
echo ""

# Open the extension folder in Finder
echo "📁 Opening extension folder in Finder..."
open /Users/fullsail/tiltcheck/tiltcheck-organized/extension/

# Wait a moment
sleep 2

# Open Chrome extensions page
echo "🌐 Opening Chrome extensions page..."
open -a "Google Chrome" "chrome://extensions/"

echo ""
echo "🔧 Next Steps:"
echo "1. Enable 'Developer mode' in Chrome (top-right toggle)"
echo "2. Click 'Load unpacked' button"
echo "3. Select the extension folder that just opened in Finder"
echo "4. Click 'Open' to install"
echo ""
echo "✅ Both windows should now be open for easy installation!"
echo ""
echo "📍 Extension folder: /Users/fullsail/tiltcheck/tiltcheck-organized/extension/"
echo "🌐 Chrome URL: chrome://extensions/"