#!/bin/bash

# TiltCheck Automated VPS Deployment
# Creates VPS, configures DNS, and deploys TiltCheck automatically

set -e

# Load configuration
if [ -f ".vps-config" ]; then
    source .vps-config
else
    echo "❌ .vps-config file not found"
    exit 1
fi

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🚀 TiltCheck Automated VPS Deployment${NC}"
echo "======================================"
echo ""

# Function to make API calls
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $VPS_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$VPS_API_BASE_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $VPS_API_KEY" \
            "$VPS_API_BASE_URL$endpoint"
    fi
}

# Function to create VPS instance
create_vps() {
    echo -e "${BLUE}🏗️ Creating VPS instance...${NC}"
    
    local data="{
        \"region\": \"$VPS_REGION\",
        \"plan\": \"$VPS_PLAN\",
        \"os_id\": $VPS_OS_ID,
        \"label\": \"$VPS_LABEL\",
        \"tag\": \"$PROJECT_NAME\",
        \"hostname\": \"$PROJECT_NAME\",
        \"enable_ipv6\": false,
        \"enable_private_network\": false,
        \"notify_activate\": false,
        \"ddos_protection\": false,
        \"activation_email\": false
    }"
    
    response=$(api_call "POST" "/instances" "$data")
    
    if echo "$response" | jq -e '.instance.id' > /dev/null 2>&1; then
        VPS_ID=$(echo "$response" | jq -r '.instance.id')
        echo -e "${GREEN}✅ VPS created with ID: $VPS_ID${NC}"
        echo "$VPS_ID" > .vps-id
        return 0
    else
        echo -e "${RED}❌ Failed to create VPS${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to wait for VPS to be ready
wait_for_vps() {
    echo -e "${BLUE}⏳ Waiting for VPS to be ready...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Checking status... (attempt $attempt/$max_attempts)${NC}"
        
        response=$(api_call "GET" "/instances/$VPS_ID")
        status=$(echo "$response" | jq -r '.instance.status')
        
        if [ "$status" = "active" ]; then
            VPS_IP=$(echo "$response" | jq -r '.instance.main_ip')
            echo -e "${GREEN}✅ VPS is ready! IP: $VPS_IP${NC}"
            echo "$VPS_IP" > .vps-ip
            return 0
        elif [ "$status" = "pending" ]; then
            echo -e "${YELLOW}Status: $status - waiting...${NC}"
            sleep 30
        else
            echo -e "${RED}❌ Unexpected status: $status${NC}"
            return 1
        fi
        
        ((attempt++))
    done
    
    echo -e "${RED}❌ Timeout waiting for VPS${NC}"
    return 1
}

# Function to generate DNS instructions
generate_dns_instructions() {
    echo -e "${BLUE}📝 Generating DNS configuration...${NC}"
    
    cat > dns-configuration.md << EOF
# DNS Configuration for TiltCheck

## Namecheap DNS Setup

1. Login to [Namecheap.com](https://namecheap.com)
2. Go to Domain List
3. Click "Manage" next to \`$DOMAIN\`
4. Click "Advanced DNS" tab
5. Delete existing A records
6. Add these new A records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | $VPS_IP | 300 |
| A Record | www | $VPS_IP | 300 |
| A Record | api | $VPS_IP | 300 |
| A Record | dashboard | $VPS_IP | 300 |
| A Record | admin | $VPS_IP | 300 |

6. Click "Save All Changes"
7. Wait 5-10 minutes for DNS propagation

## Verification Commands

\`\`\`bash
# Check DNS propagation
dig $DOMAIN
dig www.$DOMAIN
dig api.$DOMAIN

# Test connectivity
curl -I http://$VPS_IP
\`\`\`

## After DNS Propagation

Your TiltCheck ecosystem will be available at:
- Main Site: https://$DOMAIN
- API: https://api.$DOMAIN
- Dashboard: https://dashboard.$DOMAIN
- Admin: https://admin.$DOMAIN
EOF

    echo -e "${GREEN}✅ DNS instructions saved to dns-configuration.md${NC}"
}

# Function to generate deployment commands
generate_deployment_commands() {
    echo -e "${BLUE}📋 Generating deployment commands...${NC}"
    
    cat > deploy-to-vps.sh << 'EOF'
#!/bin/bash

# TiltCheck VPS Deployment Commands
# Run this script on your VPS after DNS configuration

echo "🚀 TiltCheck VPS Deployment"
echo "=========================="
echo ""

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Download deployment script
echo "📥 Downloading TiltCheck deployment script..."
wget https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh

# Make executable
chmod +x vps-deploy.sh

# Run deployment
echo "🚀 Starting TiltCheck deployment..."
sudo ./vps-deploy.sh

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Your TiltCheck ecosystem should now be available at:"
echo "   Main Site: https://tiltcheck.it.com"
echo "   API: https://api.tiltcheck.it.com"
echo "   Dashboard: https://dashboard.tiltcheck.it.com"
echo "   Admin: https://admin.tiltcheck.it.com"
echo ""
echo "🔧 Next steps:"
echo "1. Update Discord tokens in /var/www/tiltcheck/.env"
echo "2. Test all endpoints"
echo "3. Configure any additional settings"
EOF

    chmod +x deploy-to-vps.sh
    echo -e "${GREEN}✅ Deployment script saved to deploy-to-vps.sh${NC}"
}

# Function to generate SSH connection script
generate_ssh_script() {
    echo -e "${BLUE}🔗 Generating SSH connection script...${NC}"
    
    cat > connect-to-vps.sh << EOF
#!/bin/bash

# Connect to TiltCheck VPS
# VPS IP: $VPS_IP
# VPS ID: $VPS_ID

echo "🔗 Connecting to TiltCheck VPS..."
echo "VPS IP: $VPS_IP"
echo "VPS ID: $VPS_ID"
echo ""

# Try to connect
ssh root@$VPS_IP

# If connection fails, show troubleshooting
if [ \$? -ne 0 ]; then
    echo ""
    echo "❌ SSH connection failed. Troubleshooting:"
    echo ""
    echo "1. Make sure the VPS is running:"
    echo "   Check VPS status in your provider dashboard"
    echo ""
    echo "2. Check if SSH is enabled:"
    echo "   Some VPS providers require SSH key setup"
    echo ""
    echo "3. Try with ubuntu user instead:"
    echo "   ssh ubuntu@$VPS_IP"
    echo ""
    echo "4. Check firewall settings:"
    echo "   Make sure port 22 is open"
    echo ""
    echo "5. Wait a few more minutes:"
    echo "   VPS might still be initializing"
fi
EOF

    chmod +x connect-to-vps.sh
    echo -e "${GREEN}✅ SSH connection script saved to connect-to-vps.sh${NC}"
}

# Function to create deployment summary
create_deployment_summary() {
    echo -e "${BLUE}📋 Creating deployment summary...${NC}"
    
    cat > deployment-summary.md << EOF
# TiltCheck VPS Deployment Summary

## VPS Information
- **VPS ID**: $VPS_ID
- **VPS IP**: $VPS_IP
- **Domain**: $DOMAIN
- **Created**: $(date)

## Deployment Status
- ✅ VPS Instance Created
- ✅ IP Address Assigned
- ✅ DNS Configuration Generated
- ✅ Deployment Scripts Created
- ⏳ Waiting for DNS Configuration
- ⏳ Waiting for TiltCheck Deployment

## Next Steps

### 1. Configure DNS (5 minutes)
Follow instructions in \`dns-configuration.md\`

### 2. Connect to VPS
\`\`\`bash
./connect-to-vps.sh
\`\`\`

### 3. Deploy TiltCheck
On the VPS, run:
\`\`\`bash
# Copy and run on VPS
wget https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh
chmod +x vps-deploy.sh
sudo ./vps-deploy.sh
\`\`\`

### 4. Configure Discord Bot
After deployment, update Discord tokens:
\`\`\`bash
sudo nano /var/www/tiltcheck/.env
# Add your Discord bot tokens
sudo systemctl restart tiltcheck
\`\`\`

## Final URLs
After DNS propagation and deployment:
- **Main Site**: https://$DOMAIN
- **API**: https://api.$DOMAIN
- **Dashboard**: https://dashboard.$DOMAIN
- **Admin**: https://admin.$DOMAIN

## Management Commands
Once deployed, use these commands on the VPS:
- \`tiltcheck-status\` - Check service status
- \`tiltcheck-restart\` - Restart all services
- \`tiltcheck-logs\` - View recent logs

## Support
If you encounter issues:
1. Check \`deployment-summary.md\` for troubleshooting
2. Review VPS provider documentation
3. Verify DNS propagation with \`dig $DOMAIN\`
4. Check VPS logs: \`ssh root@$VPS_IP\` then \`tiltcheck-logs\`

---
Generated on $(date) by TiltCheck Automated Deployment
EOF

    echo -e "${GREEN}✅ Deployment summary saved to deployment-summary.md${NC}"
}

# Main deployment process
main() {
    echo -e "${PURPLE}Starting automated VPS deployment for TiltCheck...${NC}"
    echo ""
    
    # Check if VPS already exists
    if [ -f ".vps-id" ]; then
        VPS_ID=$(cat .vps-id)
        echo -e "${YELLOW}⚠️ Existing VPS ID found: $VPS_ID${NC}"
        read -p "Do you want to use existing VPS? (y/n): " use_existing
        
        if [ "$use_existing" != "y" ]; then
            echo -e "${BLUE}Creating new VPS...${NC}"
            create_vps || exit 1
            wait_for_vps || exit 1
        else
            echo -e "${BLUE}Using existing VPS...${NC}"
            if [ -f ".vps-ip" ]; then
                VPS_IP=$(cat .vps-ip)
                echo -e "${GREEN}VPS IP: $VPS_IP${NC}"
            else
                # Get IP from API
                response=$(api_call "GET" "/instances/$VPS_ID")
                VPS_IP=$(echo "$response" | jq -r '.instance.main_ip')
                echo "$VPS_IP" > .vps-ip
                echo -e "${GREEN}VPS IP: $VPS_IP${NC}"
            fi
        fi
    else
        create_vps || exit 1
        wait_for_vps || exit 1
    fi
    
    # Generate all deployment files
    generate_dns_instructions
    generate_deployment_commands
    generate_ssh_script
    create_deployment_summary
    
    echo ""
    echo -e "${GREEN}🎉 VPS Deployment Preparation Complete!${NC}"
    echo ""
    echo -e "${CYAN}📋 Files Created:${NC}"
    echo "  - dns-configuration.md (DNS setup instructions)"
    echo "  - deploy-to-vps.sh (deployment script for VPS)"
    echo "  - connect-to-vps.sh (SSH connection script)"
    echo "  - deployment-summary.md (complete guide)"
    echo ""
    echo -e "${YELLOW}🎯 Next Steps:${NC}"
    echo "1. Configure DNS using dns-configuration.md"
    echo "2. Wait 5-10 minutes for DNS propagation"
    echo "3. Connect to VPS: ./connect-to-vps.sh"
    echo "4. Deploy TiltCheck on VPS using the deployment script"
    echo ""
    echo -e "${PURPLE}🎮 Your TiltCheck VPS is ready for deployment!${NC}"
}

# Check dependencies
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Installing jq...${NC}"
    if command -v brew &> /dev/null; then
        brew install jq
    elif command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y jq
    else
        echo -e "${RED}❌ Please install jq manually${NC}"
        exit 1
    fi
fi

# Run main function
main "$@"
