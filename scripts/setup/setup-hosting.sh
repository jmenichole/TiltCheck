#!/bin/bash

# TiltCheck Cloud Deployment Options
# Multiple FREE hosting platforms for your pitch deck

echo "☁️ TiltCheck Cloud Hosting Options"
echo "=================================="
echo ""

echo "🆓 FREE OPTIONS (Recommended for pitch deck):"
echo ""

echo "1. 🐙 GITHUB PAGES (Best for static sites)"
echo "   ✅ Completely FREE"
echo "   ✅ Automatic deployment from git push"
echo "   ✅ Custom domain support (tiltcheck.it.com)"
echo "   ✅ SSL certificate included"
echo "   ✅ Global CDN"
echo "   → Run: ./setup-github-pages.sh"
echo ""

echo "2. 🔥 FIREBASE HOSTING"
echo "   ✅ FREE tier: 10GB storage, 10GB/month transfer"
echo "   ✅ Global CDN"
echo "   ✅ Custom domains"
echo "   → Commands:"
echo "     npm install -g firebase-tools"
echo "     firebase login"
echo "     firebase init hosting"
echo "     firebase deploy"
echo ""

echo "3. 📦 NETLIFY"
echo "   ✅ FREE tier: 100GB/month bandwidth"
echo "   ✅ Continuous deployment from GitHub"
echo "   ✅ Custom domains"
echo "   ✅ Forms and serverless functions"
echo "   → Go to: https://netlify.com"
echo "   → Connect GitHub repo"
echo "   → Auto-deploy on git push"
echo ""

echo "4. ⚡ VERCEL"
echo "   ✅ FREE tier: Unlimited static sites"
echo "   ✅ Global edge network"
echo "   ✅ GitHub integration"
echo "   → Commands:"
echo "     npm install -g vercel"
echo "     vercel --prod"
echo ""

echo "💰 PAID OPTIONS (For backend/API):"
echo ""

echo "5. 🌊 DIGITALOCEAN DROPLET"
echo "   💵 $6/month for 1GB RAM, 25GB SSD"
echo "   ✅ Full Linux server control"
echo "   ✅ Can run Node.js backend"
echo "   → Setup: SSH + PM2 for process management"
echo ""

echo "6. 🚂 RAILWAY"
echo "   💵 $5/month after free trial"
echo "   ✅ Automatic deployment from GitHub"
echo "   ✅ Databases included"
echo "   → Connect GitHub repo"
echo ""

echo "7. 🟣 HEROKU"
echo "   💵 $7/month for Eco dynos"
echo "   ✅ Easy deployment"
echo "   ✅ Add-ons for databases"
echo ""

echo ""
echo "🎯 RECOMMENDATION FOR TILTCHECK:"
echo "📋 For Pitch Deck: Use GitHub Pages (FREE)"
echo "🔧 For Full Platform: Use Railway or DigitalOcean ($5-6/month)"
echo ""

read -p "🚀 Which option would you like to set up? (github/firebase/netlify/vercel/digitalocean): " hosting_choice

case $hosting_choice in
    github)
        echo "🐙 Setting up GitHub Pages..."
        ./setup-github-pages.sh
        ;;
    firebase)
        echo "🔥 Setting up Firebase..."
        echo "Run: npm install -g firebase-tools && firebase login"
        ;;
    netlify)
        echo "📦 Setting up Netlify..."
        echo "Go to https://netlify.com and connect your GitHub repo"
        ;;
    vercel)
        echo "⚡ Setting up Vercel..."
        npm install -g vercel
        vercel --prod
        ;;
    digitalocean)
        echo "🌊 DigitalOcean setup requires manual server configuration"
        echo "Visit: https://digitalocean.com to create a droplet"
        ;;
    *)
        echo "ℹ️ Run this script again and choose an option"
        ;;
esac