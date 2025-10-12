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


# TiltCheck GitHub Pages Deployment Script
# This will set up your pitch deck to run 24/7 for FREE on GitHub Pages

echo "🚀 Setting up TiltCheck GitHub Pages deployment..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from your TiltCheck project root."
    exit 1
fi

echo "📋 GitHub Pages Setup Steps:"
echo ""
echo "1. 🌐 Enable GitHub Pages:"
echo "   → Go to: https://github.com/jmenichole/TiltCheck/settings/pages"
echo "   → Source: Deploy from a branch"
echo "   → Branch: main"
echo "   → Folder: / (root)"
echo "   → Click Save"
echo ""

echo "2. 🔗 Your sites will be available at:"
echo "   → Main site: https://jmenichole.github.io/TiltCheck/"
echo "   → Pitch deck: https://jmenichole.github.io/TiltCheck/pitchdeck.html"
echo "   → JustTheTip: https://jmenichole.github.io/TiltCheck/justthetip-landing.html"
echo "   → QualifyFirst: https://jmenichole.github.io/TiltCheck/qualifyfirst-landing.html"
echo ""

echo "3. 🎯 Custom Domain Setup (Optional):"
echo "   → Add CNAME file with your domain (tiltcheck.it.com)"
echo "   → Configure DNS A records to GitHub Pages IPs"
echo ""

echo "4. ✅ Verification:"
echo "   → Wait 5-10 minutes after enabling"
echo "   → Check https://jmenichole.github.io/TiltCheck/pitchdeck.html"
echo ""

# Create CNAME file for custom domain
read -p "🤔 Do you want to set up custom domain (tiltcheck.it.com)? (y/n): " setup_domain

if [ "$setup_domain" = "y" ] || [ "$setup_domain" = "Y" ]; then
    echo "tiltcheck.it.com" > CNAME
    echo "✅ Created CNAME file for tiltcheck.it.com"
    echo ""
    echo "📝 DNS Setup Required:"
    echo "   Add these A records to your DNS:"
    echo "   185.199.108.153"
    echo "   185.199.109.153" 
    echo "   185.199.110.153"
    echo "   185.199.111.153"
    echo ""
    
    # Commit the CNAME file
    git add CNAME
    git commit -m "Add CNAME for custom domain tiltcheck.it.com"
    git push origin main
    echo "🚀 Pushed CNAME file to GitHub"
fi

echo ""
echo "🎉 GitHub Pages setup complete!"
echo "💡 Your pitch deck will be running 24/7 for FREE!"
echo "🔄 Any git pushes will automatically update the live site"