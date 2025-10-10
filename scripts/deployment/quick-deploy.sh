#!/bin/bash
# Quick Deploy Script for TiltCheck Server
# Run this locally to deploy everything to server1.tiltcheck.it.com

# Check if sshpass is installed (needed for automated SSH)
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install hudochenkov/sshpass/sshpass
        else
            echo "Please install Homebrew first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    else
        # Linux
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

# Make the deployment script executable
chmod +x scripts/deploy-to-tiltcheck-server.sh

echo "🚀 Starting TiltCheck deployment to server1.tiltcheck.it.com..."
echo "This will deploy:"
echo "  ✅ SSL Manager with JWT token"
echo "  ✅ TiltCheck Discord Bot"
echo "  ✅ AIM Messenger Overlay"
echo "  ✅ Encryption system"
echo "  ✅ SSL certificates"
echo ""

# Run the deployment
./scripts/deploy-to-tiltcheck-server.sh

echo ""
echo "🎉 Deployment initiated!"
echo "The server should now be accessible at:"
echo "  🌐 https://server1.tiltcheck.it.com"
echo "  🎮 AIM Overlay: https://server1.tiltcheck.it.com:8080"
