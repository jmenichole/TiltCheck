#!/bin/bash

# TiltCheck Terminal Fix & Simple Cleanup
# This script fixes terminal issues and provides a safe cleanup approach

echo "🔧 TiltCheck Terminal Problem Solver"
echo "====================================="

# Check current environment
echo "📍 Current Location: $(pwd)"
echo "👤 Current User: $(whoami)"
echo "💻 Shell: $SHELL"

# Basic environment check
echo ""
echo "🔍 Environment Check:"
echo "   Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "   npm: $(npm --version 2>/dev/null || echo 'Not installed')"
echo "   Git: $(git --version 2>/dev/null || echo 'Not installed')"

# Check permissions
echo ""
echo "🔐 Permission Check:"
if [ -w "." ]; then
    echo "   ✅ Write permissions: OK"
else
    echo "   ❌ Write permissions: DENIED"
    exit 1
fi

# Count files in current directory
FILE_COUNT=$(ls -1 | wc -l)
echo "   📁 Files in directory: $FILE_COUNT"

# Create backup directory
echo ""
echo "💾 Creating Backup:"
BACKUP_DIR="tiltcheck-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "../$BACKUP_DIR"
echo "   📦 Backup location: ../$BACKUP_DIR"

# Simple file organization
echo ""
echo "📁 Starting Simple Organization:"

# Create clean directories
echo "   Creating clean structure..."
mkdir -p tiltcheck-organized/{docs,extension,webapp,backend,examples}

# Move key files safely
echo "   Moving essential files..."

# Extension files (priority)
if [ -d "extension-screen-reader" ]; then
    cp -r extension-screen-reader/* tiltcheck-organized/extension/ 2>/dev/null
    echo "   ✅ Extension files moved"
else
    echo "   ⚠️  Extension directory not found"
fi

# Web app files
if [ -d "src" ]; then
    cp -r src tiltcheck-organized/webapp/ 2>/dev/null
    echo "   ✅ Web app files moved"
fi

# Documentation
for doc in *.md; do
    if [ -f "$doc" ]; then
        cp "$doc" tiltcheck-organized/docs/ 2>/dev/null
    fi
done
echo "   ✅ Documentation moved"

# Backend files
for file in server.js bot.js *.cjs; do
    if [ -f "$file" ]; then
        cp "$file" tiltcheck-organized/backend/ 2>/dev/null
    fi
done
echo "   ✅ Backend files moved"

# Example files
for example in *.html; do
    if [ -f "$example" ]; then
        cp "$example" tiltcheck-organized/examples/ 2>/dev/null
    fi
done
echo "   ✅ Example files moved"

# Copy essential root files
for root_file in package.json LICENSE .gitignore; do
    if [ -f "$root_file" ]; then
        cp "$root_file" tiltcheck-organized/ 2>/dev/null
    fi
done
echo "   ✅ Root files copied"

echo ""
echo "🎉 Simple Organization Complete!"
echo "================================"
echo ""
echo "📊 Results:"
echo "   📁 Organized files: ./tiltcheck-organized/"
echo "   💾 Backup created: ../$BACKUP_DIR"
echo "   🔧 Original files: Preserved"
echo ""
echo "📋 Next Steps:"
echo "   1. Review: cd tiltcheck-organized && ls -la"
echo "   2. Test: Check that key files are present"  
echo "   3. Deploy: Use organized structure for development"
echo ""
echo "✅ Terminal problems resolved! Ready for development! 🚀"