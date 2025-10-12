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


# 🚀 TiltCheck Deployment Script - Complete Domain Setup
# Deploys TrapHouse ecosystem to tiltcheck.it.com with full DNS and SSL

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

DOMAIN="tiltcheck.it.com"

echo -e "${BLUE}"
echo "████████╗██████╗  █████╗ ██████╗ ██╗  ██╗ ██████╗ ██╗   ██╗███████╗███████╗"
echo "╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██║  ██║██╔═══██╗██║   ██║██╔════╝██╔════╝"
echo "   ██║   ██████╔╝███████║██████╔╝███████║██║   ██║██║   ██║███████╗█████╗"
echo "   ██║   ██╔══██╗██╔══██║██╔═══╝ ██╔══██║██║   ██║██║   ██║╚════██║██╔══╝"
echo "   ██║   ██║  ██║██║  ██║██║     ██║  ██║╚██████╔╝╚██████╔╝███████║███████╗"
echo "   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝╚══════╝"
echo -e "${NC}"
echo -e "${PURPLE}🏠 TiltCheck Deployment for ${DOMAIN} 🎯${NC}"
echo "============================================="

# Function to display banner
show_banner() {
    echo -e "\n${YELLOW}$1${NC}"
    echo "--------------------------------------------"
}

# Function to run DNS setup
deploy_dns() {
    show_banner "🌐 DNS Setup & SSL Configuration"
    
    if [ -f "./setup-tiltcheck-dns.sh" ]; then
        echo -e "${GREEN}✅ Found DNS setup script${NC}"
        
        # Ask user if they want to run on server
        echo -e "${YELLOW}Are you running this on your production server? (y/n)${NC}"
        read -r server_response
        
        if [[ $server_response =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}🚀 Running server deployment...${NC}"
            ./setup-tiltcheck-dns.sh --server
        else
            echo -e "${BLUE}💻 Running client-side configuration...${NC}"
            ./setup-tiltcheck-dns.sh
        fi
    else
        echo -e "${RED}❌ DNS setup script not found${NC}"
        return 1
    fi
}

# Function to test the deployment
test_deployment() {
    show_banner "🧪 Testing TiltCheck Deployment"
    
    # Open test dashboard
    if command -v open >/dev/null 2>&1; then
        echo -e "${BLUE}🌐 Opening test dashboard...${NC}"
        open "test-dashboard.html"
    elif command -v xdg-open >/dev/null 2>&1; then
        echo -e "${BLUE}🌐 Opening test dashboard...${NC}"
        xdg-open "test-dashboard.html"
    else
        echo -e "${YELLOW}📂 Open test-dashboard.html in your browser to test deployment${NC}"
    fi
    
    echo -e "\n${GREEN}🧪 Test URLs:${NC}"
    echo -e "• Dashboard Test: file://$(pwd)/test-dashboard.html"
    echo -e "• Main Site: https://$DOMAIN"
    echo -e "• Dashboard: https://dashboard.$DOMAIN"
    echo -e "• API: https://api.$DOMAIN"
    echo -e "• CollectClock: https://collectclock.$DOMAIN"
    echo -e "• Tilt Monitor: https://tilt.$DOMAIN"
    echo -e "• Admin Panel: https://admin.$DOMAIN"
    echo -e "• Vault System: https://vault.$DOMAIN"
    echo -e "• Portal: https://portal.$DOMAIN"
    echo -e "• Bot Dashboard: https://bot.$DOMAIN"
}

# Function to show completion info
show_completion() {
    show_banner "🎉 TiltCheck Deployment Complete!"
    
    echo -e "${GREEN}Your TrapHouse empire is ready for deployment:${NC}\n"
    
    echo -e "${BLUE}📋 What's Been Set Up:${NC}"
    echo -e "✅ Complete DNS configuration guide"
    echo -e "✅ SSL certificate setup with Let's Encrypt"
    echo -e "✅ Nginx reverse proxy configuration"
    echo -e "✅ Docker Compose for all services"
    echo -e "✅ Enhanced test dashboard with validation"
    echo -e "✅ Environment configuration templates"
    echo -e "✅ Automated deployment scripts"
    
    echo -e "\n${YELLOW}🔧 Next Steps:${NC}"
    echo -e "1. Configure DNS records at your domain provider"
    echo -e "2. Run the deployment script on your server"
    echo -e "3. Update Discord OAuth redirect URIs"
    echo -e "4. Configure API keys in .env.server"
    echo -e "5. Test all endpoints using the test dashboard"
    
    echo -e "\n${PURPLE}🏠 Welcome to the TiltCheck empire! 🎯${NC}"
    echo -e "${GREEN}Your TrapHouse is ready to dominate at ${DOMAIN}!${NC}"
}

# Main deployment flow
main() {
    case "${1:-deploy}" in
        "dns")
            deploy_dns
            ;;
        "test")
            test_deployment
            ;;
        "deploy")
            deploy_dns
            test_deployment
            show_completion
            ;;
        *)
            echo -e "${RED}Usage: $0 [dns|test|deploy]${NC}"
            echo -e "  dns    - Setup DNS and SSL only"
            echo -e "  test   - Open test dashboard"
            echo -e "  deploy - Full deployment (default)"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
