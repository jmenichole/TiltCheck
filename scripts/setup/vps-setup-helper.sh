#!/bin/bash

# TiltCheck VPS Setup Helper
# Quick commands to get IP and test deployment

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🎮 TiltCheck VPS Setup Helper${NC}"
echo "================================"
echo ""

# Function to get VPS IP
get_vps_ip() {
    echo -e "${BLUE}🌐 Getting VPS IP address...${NC}"
    
    # Try multiple methods to get IP
    VPS_IP=""
    
    # Method 1: curl ifconfig.me
    if command -v curl &> /dev/null; then
        VPS_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo "")
    fi
    
    # Method 2: curl ipinfo.io if first failed
    if [ -z "$VPS_IP" ] && command -v curl &> /dev/null; then
        VPS_IP=$(curl -s --max-time 5 ipinfo.io/ip 2>/dev/null || echo "")
    fi
    
    # Method 3: hostname -I
    if [ -z "$VPS_IP" ]; then
        VPS_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "")
    fi
    
    # Method 4: ip route
    if [ -z "$VPS_IP" ]; then
        VPS_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null || echo "")
    fi
    
    if [ -n "$VPS_IP" ]; then
        echo -e "${GREEN}✅ VPS IP Address: ${CYAN}$VPS_IP${NC}"
        echo ""
        echo -e "${YELLOW}📋 Copy this IP for Namecheap DNS configuration:${NC}"
        echo -e "${CYAN}$VPS_IP${NC}"
        echo ""
        
        # Save to file for later use
        echo "$VPS_IP" > /tmp/tiltcheck-vps-ip.txt
        echo -e "${GREEN}💾 IP saved to /tmp/tiltcheck-vps-ip.txt${NC}"
    else
        echo -e "${RED}❌ Could not determine VPS IP address${NC}"
        echo "Please run one of these commands manually:"
        echo "  curl ifconfig.me"
        echo "  curl ipinfo.io/ip"
        echo "  hostname -I"
    fi
}

# Function to test DNS configuration
test_dns() {
    echo -e "${BLUE}🔍 Testing DNS configuration...${NC}"
    
    DOMAIN="tiltcheck.it.com"
    
    # Test main domain
    echo -e "${YELLOW}Testing $DOMAIN...${NC}"
    RESOLVED_IP=$(dig +short $DOMAIN @8.8.8.8 2>/dev/null || echo "")
    
    if [ -n "$RESOLVED_IP" ]; then
        echo -e "${GREEN}✅ $DOMAIN resolves to: $RESOLVED_IP${NC}"
        
        # Compare with VPS IP if available
        if [ -f "/tmp/tiltcheck-vps-ip.txt" ]; then
            VPS_IP=$(cat /tmp/tiltcheck-vps-ip.txt)
            if [ "$RESOLVED_IP" = "$VPS_IP" ]; then
                echo -e "${GREEN}✅ DNS correctly points to your VPS!${NC}"
            else
                echo -e "${YELLOW}⚠️  DNS points to $RESOLVED_IP, but VPS is $VPS_IP${NC}"
                echo -e "${YELLOW}   DNS may still be propagating...${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ $DOMAIN does not resolve${NC}"
        echo -e "${YELLOW}   Please check Namecheap DNS configuration${NC}"
    fi
    
    # Test subdomains
    for subdomain in "www" "api" "dashboard" "admin"; do
        echo -e "${YELLOW}Testing $subdomain.$DOMAIN...${NC}"
        SUB_IP=$(dig +short $subdomain.$DOMAIN @8.8.8.8 2>/dev/null || echo "")
        if [ -n "$SUB_IP" ]; then
            echo -e "${GREEN}✅ $subdomain.$DOMAIN resolves to: $SUB_IP${NC}"
        else
            echo -e "${RED}❌ $subdomain.$DOMAIN does not resolve${NC}"
        fi
    done
}

# Function to test HTTP/HTTPS connectivity
test_connectivity() {
    echo -e "${BLUE}🌐 Testing HTTP/HTTPS connectivity...${NC}"
    
    DOMAIN="tiltcheck.it.com"
    
    # Test HTTP (should redirect to HTTPS)
    echo -e "${YELLOW}Testing HTTP redirect...${NC}"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$DOMAIN" 2>/dev/null || echo "000")
    if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
        echo -e "${GREEN}✅ HTTP correctly redirects to HTTPS${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTP status: $HTTP_STATUS${NC}"
    fi
    
    # Test HTTPS
    echo -e "${YELLOW}Testing HTTPS...${NC}"
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$DOMAIN" 2>/dev/null || echo "000")
    if [ "$HTTPS_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ HTTPS is working!${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS status: $HTTPS_STATUS${NC}"
    fi
    
    # Test SSL certificate
    echo -e "${YELLOW}Testing SSL certificate...${NC}"
    if command -v openssl &> /dev/null; then
        SSL_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
        if [ -n "$SSL_INFO" ]; then
            echo -e "${GREEN}✅ SSL certificate is valid${NC}"
            echo "$SSL_INFO"
        else
            echo -e "${YELLOW}⚠️  Could not verify SSL certificate${NC}"
        fi
    fi
}

# Function to show Namecheap DNS instructions
show_dns_instructions() {
    echo -e "${BLUE}📝 Namecheap DNS Configuration Instructions${NC}"
    echo "=========================================="
    echo ""
    echo -e "${YELLOW}1. Login to Namecheap.com${NC}"
    echo -e "${YELLOW}2. Go to Domain List${NC}"
    echo -e "${YELLOW}3. Click 'Manage' next to tiltcheck.it.com${NC}"
    echo -e "${YELLOW}4. Click 'Advanced DNS' tab${NC}"
    echo -e "${YELLOW}5. Add these A records:${NC}"
    echo ""
    
    if [ -f "/tmp/tiltcheck-vps-ip.txt" ]; then
        VPS_IP=$(cat /tmp/tiltcheck-vps-ip.txt)
        echo -e "${CYAN}Type: A Record    Host: @           Value: $VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: www         Value: $VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: api         Value: $VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: dashboard   Value: $VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: admin       Value: $VPS_IP    TTL: 300${NC}"
    else
        echo -e "${CYAN}Type: A Record    Host: @           Value: YOUR_VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: www         Value: YOUR_VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: api         Value: YOUR_VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: dashboard   Value: YOUR_VPS_IP    TTL: 300${NC}"
        echo -e "${CYAN}Type: A Record    Host: admin       Value: YOUR_VPS_IP    TTL: 300${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}6. Save all changes${NC}"
    echo -e "${YELLOW}7. Wait 5-10 minutes for DNS propagation${NC}"
}

# Function to prepare for deployment
prepare_deployment() {
    echo -e "${BLUE}🚀 Preparing for TiltCheck deployment...${NC}"
    
    # Download deployment script if not exists
    if [ ! -f "vps-deploy.sh" ]; then
        echo -e "${YELLOW}Downloading deployment script...${NC}"
        if command -v wget &> /dev/null; then
            wget -q https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh
        elif command -v curl &> /dev/null; then
            curl -s -o vps-deploy.sh https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh
        else
            echo -e "${RED}❌ Neither wget nor curl available${NC}"
            return 1
        fi
        
        if [ -f "vps-deploy.sh" ]; then
            chmod +x vps-deploy.sh
            echo -e "${GREEN}✅ Deployment script downloaded${NC}"
        else
            echo -e "${RED}❌ Failed to download deployment script${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}✅ Deployment script already exists${NC}"
    fi
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        echo -e "${YELLOW}📋 Ready to deploy! Run this command:${NC}"
        echo -e "${CYAN}sudo ./vps-deploy.sh${NC}"
    else
        echo -e "${YELLOW}📋 Ready to deploy! Run this command:${NC}"
        echo -e "${CYAN}./vps-deploy.sh${NC}"
    fi
}

# Main menu
show_menu() {
    echo -e "${PURPLE}Choose an option:${NC}"
    echo "1) Get VPS IP address"
    echo "2) Test DNS configuration"
    echo "3) Test connectivity (after DNS setup)"
    echo "4) Show Namecheap DNS instructions"
    echo "5) Prepare for deployment"
    echo "6) Run all checks"
    echo "7) Exit"
    echo ""
    read -p "Enter choice [1-7]: " choice
    
    case $choice in
        1) get_vps_ip ;;
        2) test_dns ;;
        3) test_connectivity ;;
        4) show_dns_instructions ;;
        5) prepare_deployment ;;
        6) 
            get_vps_ip
            echo ""
            show_dns_instructions
            echo ""
            test_dns
            echo ""
            test_connectivity
            echo ""
            prepare_deployment
            ;;
        7) echo -e "${GREEN}🎮 Good luck with your TiltCheck deployment!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Invalid option${NC}" ;;
    esac
}

# Run menu in loop
while true; do
    echo ""
    show_menu
    echo ""
    read -p "Press Enter to continue..."
    clear
done
