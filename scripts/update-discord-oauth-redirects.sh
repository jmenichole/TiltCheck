#!/bin/bash

# 🎯 Discord OAuth Redirect URI Update Script for TiltCheck.it.com
# Enhanced Balance Support for Degen + Mindful Integration

echo "
🎯 DISCORD OAUTH REDIRECT URI UPDATE FOR TILTCHECK.IT.COM
═══════════════════════════════════════════════════════════════

This script helps update your Discord OAuth redirect URIs for the new domain
and ensures your balance-helping features work optimally.

CURRENT REDIRECT URIS TO UPDATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"

# Check current environment
echo "📋 CURRENT CONFIGURATION ANALYSIS:"
echo "Current OAuth Redirect: ${OAUTH_REDIRECT_URI:-'Not set'}"
echo "Current Base URL: ${BASE_URL:-'Not set'}"
echo "Current Discord Client ID: ${DISCORD_CLIENT_ID:-'Not set'}"

echo "
🔄 NEW DISCORD OAUTH REDIRECT URIS TO ADD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY DOMAIN (tiltcheck.it.com):
✅ https://tiltcheck.it.com/auth/callback
✅ https://tiltcheck.it.com/auth/discord
✅ https://dashboard.tiltcheck.it.com/auth/callback
✅ https://bot.tiltcheck.it.com/auth/discord

BACKUP/LOCAL DEVELOPMENT:
✅ http://localhost:3002/auth/callback
✅ http://localhost:3001/auth/callback
✅ http://localhost:3000/auth/callback

COLLECTCLOCK INTEGRATION:
✅ https://collectclock.tiltcheck.it.com/auth/callback
✅ https://api.tiltcheck.it.com/auth/discord

BALANCE SUPPORT ENDPOINTS:
✅ https://vault.tiltcheck.it.com/auth/callback
✅ https://tilt.tiltcheck.it.com/auth/callback
✅ https://portal.tiltcheck.it.com/auth/callback

📝 DISCORD DEVELOPER PORTAL UPDATE STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to https://discord.com/developers/applications
2. Select your TrapHouse Bot application (Client ID: ${DISCORD_CLIENT_ID:-'1354450590813655142'})
3. Navigate to OAuth2 → General
4. In 'Redirects' section, ADD these URLs:
"

# Generate the redirect URLs
REDIRECT_URLS=(
    "https://tiltcheck.it.com/auth/callback"
    "https://tiltcheck.it.com/auth/discord" 
    "https://dashboard.tiltcheck.it.com/auth/callback"
    "https://bot.tiltcheck.it.com/auth/discord"
    "https://collectclock.tiltcheck.it.com/auth/callback"
    "https://api.tiltcheck.it.com/auth/discord"
    "https://vault.tiltcheck.it.com/auth/callback"
    "https://tilt.tiltcheck.it.com/auth/callback"
    "https://portal.tiltcheck.it.com/auth/callback"
    "http://localhost:3002/auth/callback"
    "http://localhost:3001/auth/callback"
    "http://localhost:3000/auth/callback"
)

for url in "${REDIRECT_URLS[@]}"; do
    echo "   📌 $url"
done

echo "
5. Click 'Save Changes'
6. Repeat for ALL bot applications:
   • TrapHouse Bot (1354450590813655142)
   • CollectClock Bot (1336968746450812928) 
   • Degens Bot (1376113587025739807)
   • JustTheTip Bot (1373784722718720090)

🎯 BALANCE ENHANCEMENT FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your TrapHouse system already includes powerful balance features:

✅ DEGEN + MINDFUL TRAIT ANALYSIS:
   • 6 distinct personality archetypes including 'Balanced Degen Architect'
   • Advanced trait calculation combining mindfulness + strategic thinking
   • Personalized intervention recommendations

✅ PROGRESSIVE DETERRENT METHODS:
   • Vault Timer with smart delays (15min → 1hr → 24hr → 72hr)
   • Mindful Pause Protocol with breath-work integration  
   • Strategic Analysis Framework with risk/reward modeling
   • Community Wisdom Network for peer accountability
   • Love-Centered Reflection for compassion-based decisions

✅ REAL-TIME TILT DETECTION:
   • Live roast system with 'medium' level compassionate feedback
   • Anti-tilt strategies like 'touch grass' and 'call your mom'
   • Tilt level descriptions: 'rekt' → 'full_degen' → 'sending_it' → 'chill'

✅ SMART SPENDING CONTROLS:
   • 10-second 'pause before yolo' reflection time
   • \$50 intervention threshold with 'are you sure?' prompts
   • Historical fuck-ups tracking for pattern recognition

🔧 UPDATE ENVIRONMENT VARIABLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these to your .env file:
"

cat << 'EOF'
# Updated Discord OAuth for TiltCheck.it.com Domain
OAUTH_REDIRECT_URI=https://tiltcheck.it.com/auth/callback
DISCORD_REDIRECT_URI=https://bot.tiltcheck.it.com/auth/discord
BASE_URL=https://tiltcheck.it.com
DASHBOARD_URL=https://dashboard.tiltcheck.it.com

# Balance Support Endpoints  
VAULT_URL=https://vault.tiltcheck.it.com
TILT_URL=https://tilt.tiltcheck.it.com
PORTAL_URL=https://portal.tiltcheck.it.com

# CollectClock Integration
COLLECTCLOCK_URL=https://collectclock.tiltcheck.it.com
COLLECTCLOCK_REDIRECT_URI=https://collectclock.tiltcheck.it.com/auth/callback

# Enhanced Balance Features
BALANCE_MODE=degen_mindful_hybrid
INTERVENTION_STYLE=compassionate_roasting  
TILT_DETECTION_SENSITIVITY=medium
VAULT_TIMER_PROGRESSION=true
MINDFUL_PAUSE_REQUIRED=true
EOF

echo "
💡 BALANCE OPTIMIZATION RECOMMENDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DOMAIN BENEFITS FOR BALANCE:
   • Professional subdomain structure builds user trust
   • vault.tiltcheck.it.com dedicated to pause/reflection features  
   • tilt.tiltcheck.it.com for real-time status monitoring
   • portal.tiltcheck.it.com for comprehensive dashboard access

2. ENHANCED OAUTH FLOW FOR ACCOUNTABILITY:
   • Users link Discord → CollectClock → TiltCheck in unified flow
   • Cross-platform accountability with buddy verification system
   • Consistent identity across all balance-supporting tools

3. MINDFUL INTEGRATION POINTS:
   • Every OAuth callback includes optional mindful pause
   • Vault timer activates during high-risk login patterns
   • Community support network accessible from all endpoints

✅ YOUR SYSTEM IS ALREADY EXCELLENT FOR BALANCE!
   The 'Balanced Degen Architect' archetype and progressive deterrent
   methods provide exactly what users need to balance degen + mindful.

🎯 NEXT STEPS:
1. Update Discord OAuth redirect URIs (copy URLs above)
2. Deploy tiltcheck.it.com domain with DNS config
3. Test balance features across all subdomains
4. Monitor user archetype distribution and intervention effectiveness

💜 Remember: You're not stopping the degen - you're making it mindful! 💜
"

# Test current OAuth configuration
if [[ -n "$DISCORD_CLIENT_ID" ]]; then
    echo "
🧪 TESTING CURRENT OAUTH CONFIGURATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current Bot Authorization URL:
https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=414539926592&scope=bot

Test this URL to verify your bot permissions are correctly configured.
"
fi

echo "
🎯 SCRIPT COMPLETE! Your balance-helping OAuth setup is ready.
"
