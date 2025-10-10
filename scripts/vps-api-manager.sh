#!/bin/bash

# TiltCheck VPS Management Script
# Uses VPS API to manage server operations

set -e

# VPS API Configuration
VPS_API_KEY="S9LW9-8JW9R-E0FVM"
VPS_API_HASH="4917a66bb8446173b4940c837a0d3ac43ac40d9a"
VPS_API_BASE_URL="https://api.vultr.com/v2"  # Adjust based on your VPS provider

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${PURPLE}🎮 TiltCheck VPS Management${NC}"
echo "========================="
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

# Function to list VPS instances
list_vps_instances() {
    echo -e "${BLUE}📋 Listing VPS instances...${NC}"
    
    response=$(api_call "GET" "/instances")
    
    if echo "$response" | jq -e '.instances' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ VPS Instances:${NC}"
        echo "$response" | jq -r '.instances[] | "ID: \(.id) | Label: \(.label) | IP: \(.main_ip) | Status: \(.status) | Region: \(.region)"'
    else
        echo -e "${RED}❌ Failed to list VPS instances${NC}"
        echo "Response: $response"
    fi
}

# Function to get VPS details
get_vps_details() {
    local vps_id="$1"
    
    if [ -z "$vps_id" ]; then
        echo -e "${RED}❌ VPS ID required${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔍 Getting VPS details for ID: $vps_id${NC}"
    
    response=$(api_call "GET" "/instances/$vps_id")
    
    if echo "$response" | jq -e '.instance' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ VPS Details:${NC}"
        echo "$response" | jq -r '.instance | "ID: \(.id)\nLabel: \(.label)\nIP: \(.main_ip)\nStatus: \(.status)\nRegion: \(.region)\nPlan: \(.plan)\nOS: \(.os)\nRAM: \(.ram)MB\nDisk: \(.disk)GB\nCPUs: \(.vcpu_count)"'
        
        # Save IP for deployment
        vps_ip=$(echo "$response" | jq -r '.instance.main_ip')
        echo "$vps_ip" > /tmp/tiltcheck-vps-ip.txt
        echo -e "${CYAN}💾 VPS IP saved: $vps_ip${NC}"
    else
        echo -e "${RED}❌ Failed to get VPS details${NC}"
        echo "Response: $response"
    fi
}

# Function to create new VPS instance
create_vps_instance() {
    echo -e "${BLUE}🚀 Creating new VPS instance for TiltCheck...${NC}"
    
    # Default configuration for TiltCheck
    local data='{
        "region": "ewr",
        "plan": "vc2-1c-2gb",
        "os_id": 387,
        "label": "tiltcheck-production",
        "tag": "tiltcheck",
        "hostname": "tiltcheck",
        "enable_ipv6": false,
        "enable_private_network": false,
        "notify_activate": false,
        "ddos_protection": false,
        "activation_email": false
    }'
    
    echo -e "${YELLOW}Creating VPS with configuration:${NC}"
    echo "- Region: New Jersey (ewr)"
    echo "- Plan: 1 CPU, 2GB RAM, 55GB SSD"
    echo "- OS: Ubuntu 20.04 LTS"
    echo "- Label: tiltcheck-production"
    echo ""
    
    response=$(api_call "POST" "/instances" "$data")
    
    if echo "$response" | jq -e '.instance.id' > /dev/null 2>&1; then
        vps_id=$(echo "$response" | jq -r '.instance.id')
        echo -e "${GREEN}✅ VPS instance created!${NC}"
        echo -e "${CYAN}VPS ID: $vps_id${NC}"
        echo -e "${YELLOW}⏳ Instance is being provisioned... This may take a few minutes.${NC}"
        
        # Wait for instance to be ready
        echo -e "${BLUE}⏳ Waiting for instance to be ready...${NC}"
        wait_for_vps_ready "$vps_id"
    else
        echo -e "${RED}❌ Failed to create VPS instance${NC}"
        echo "Response: $response"
    fi
}

# Function to wait for VPS to be ready
wait_for_vps_ready() {
    local vps_id="$1"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Checking status... (attempt $attempt/$max_attempts)${NC}"
        
        response=$(api_call "GET" "/instances/$vps_id")
        status=$(echo "$response" | jq -r '.instance.status')
        
        if [ "$status" = "active" ]; then
            echo -e "${GREEN}✅ VPS is ready!${NC}"
            get_vps_details "$vps_id"
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
    
    echo -e "${RED}❌ Timeout waiting for VPS to be ready${NC}"
    return 1
}

# Function to start VPS instance
start_vps_instance() {
    local vps_id="$1"
    
    if [ -z "$vps_id" ]; then
        echo -e "${RED}❌ VPS ID required${NC}"
        return 1
    fi
    
    echo -e "${BLUE}▶️ Starting VPS instance: $vps_id${NC}"
    
    response=$(api_call "POST" "/instances/$vps_id/start")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ VPS start command sent${NC}"
        sleep 5
        get_vps_details "$vps_id"
    else
        echo -e "${RED}❌ Failed to start VPS instance${NC}"
    fi
}

# Function to stop VPS instance
stop_vps_instance() {
    local vps_id="$1"
    
    if [ -z "$vps_id" ]; then
        echo -e "${RED}❌ VPS ID required${NC}"
        return 1
    fi
    
    echo -e "${BLUE}⏹️ Stopping VPS instance: $vps_id${NC}"
    
    response=$(api_call "POST" "/instances/$vps_id/halt")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ VPS stop command sent${NC}"
        sleep 5
        get_vps_details "$vps_id"
    else
        echo -e "${RED}❌ Failed to stop VPS instance${NC}"
    fi
}

# Function to reboot VPS instance
reboot_vps_instance() {
    local vps_id="$1"
    
    if [ -z "$vps_id" ]; then
        echo -e "${RED}❌ VPS ID required${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔄 Rebooting VPS instance: $vps_id${NC}"
    
    response=$(api_call "POST" "/instances/$vps_id/reboot")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ VPS reboot command sent${NC}"
        sleep 10
        get_vps_details "$vps_id"
    else
        echo -e "${RED}❌ Failed to reboot VPS instance${NC}"
    fi
}

# Function to delete VPS instance
delete_vps_instance() {
    local vps_id="$1"
    
    if [ -z "$vps_id" ]; then
        echo -e "${RED}❌ VPS ID required${NC}"
        return 1
    fi
    
    echo -e "${RED}⚠️ WARNING: This will permanently delete VPS instance: $vps_id${NC}"
    read -p "Are you sure? Type 'DELETE' to confirm: " confirmation
    
    if [ "$confirmation" != "DELETE" ]; then
        echo -e "${YELLOW}❌ Deletion cancelled${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🗑️ Deleting VPS instance: $vps_id${NC}"
    
    response=$(api_call "DELETE" "/instances/$vps_id")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ VPS instance deleted${NC}"
    else
        echo -e "${RED}❌ Failed to delete VPS instance${NC}"
    fi
}

# Function to deploy TiltCheck to VPS
deploy_tiltcheck() {
    local vps_id="$1"
    local ssh_key="$2"
    
    if [ -z "$vps_id" ]; then
        echo -e "${RED}❌ VPS ID required${NC}"
        return 1
    fi
    
    # Get VPS IP
    get_vps_details "$vps_id"
    
    if [ ! -f "/tmp/tiltcheck-vps-ip.txt" ]; then
        echo -e "${RED}❌ Could not get VPS IP address${NC}"
        return 1
    fi
    
    vps_ip=$(cat /tmp/tiltcheck-vps-ip.txt)
    
    echo -e "${BLUE}🚀 Deploying TiltCheck to VPS: $vps_ip${NC}"
    
    # Generate deployment commands
    echo -e "${YELLOW}📋 Run these commands on your VPS:${NC}"
    echo ""
    echo -e "${CYAN}# Connect to VPS${NC}"
    echo "ssh root@$vps_ip"
    echo ""
    echo -e "${CYAN}# Download and run deployment script${NC}"
    echo "wget https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh"
    echo "chmod +x vps-deploy.sh"
    echo "sudo ./vps-deploy.sh"
    echo ""
    echo -e "${CYAN}# Or use quick start${NC}"
    echo "wget https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/quick-start.sh"
    echo "chmod +x quick-start.sh"
    echo "./quick-start.sh"
    echo ""
    
    # Create deployment file with IP
    cat > tiltcheck-deployment.txt << EOF
TiltCheck VPS Deployment Information
==================================

VPS ID: $vps_id
VPS IP: $vps_ip
Domain: tiltcheck.it.com

Namecheap DNS Configuration:
Type: A Record    Host: @           Value: $vps_ip    TTL: 300
Type: A Record    Host: www         Value: $vps_ip    TTL: 300
Type: A Record    Host: api         Value: $vps_ip    TTL: 300
Type: A Record    Host: dashboard   Value: $vps_ip    TTL: 300
Type: A Record    Host: admin       Value: $vps_ip    TTL: 300

SSH Connection:
ssh root@$vps_ip

Deployment Commands:
wget https://raw.githubusercontent.com/jmenichole/trap-house-discord-bot/main/vps-deploy.sh
chmod +x vps-deploy.sh
sudo ./vps-deploy.sh

After Deployment:
- Main Site: https://tiltcheck.it.com
- API: https://api.tiltcheck.it.com
- Dashboard: https://dashboard.tiltcheck.it.com
- Admin: https://admin.tiltcheck.it.com
EOF
    
    echo -e "${GREEN}💾 Deployment info saved to: tiltcheck-deployment.txt${NC}"
}

# Function to show account information
show_account_info() {
    echo -e "${BLUE}👤 Getting account information...${NC}"
    
    response=$(api_call "GET" "/account")
    
    if echo "$response" | jq -e '.account' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Account Information:${NC}"
        echo "$response" | jq -r '.account | "Name: \(.name)\nEmail: \(.email)\nBalance: $\(.balance)\nPending Charges: $\(.pending_charges)\nLast Payment Date: \(.last_payment_date)"'
    else
        echo -e "${RED}❌ Failed to get account information${NC}"
        echo "Response: $response"
    fi
}

# Function to show available plans
show_plans() {
    echo -e "${BLUE}📋 Getting available VPS plans...${NC}"
    
    response=$(api_call "GET" "/plans")
    
    if echo "$response" | jq -e '.plans' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Available Plans:${NC}"
        echo "$response" | jq -r '.plans[] | select(.type == "vc2") | "ID: \(.id) | \(.vcpu_count) CPU, \(.ram)MB RAM, \(.disk)GB SSD | $\(.monthly_cost)/month | \(.locations | length) locations"'
    else
        echo -e "${RED}❌ Failed to get plans${NC}"
        echo "Response: $response"
    fi
}

# Function to show main menu
show_menu() {
    echo -e "${PURPLE}VPS Management Options:${NC}"
    echo "1) List VPS instances"
    echo "2) Get VPS details"
    echo "3) Create new VPS for TiltCheck"
    echo "4) Start VPS instance"
    echo "5) Stop VPS instance"
    echo "6) Reboot VPS instance"
    echo "7) Delete VPS instance"
    echo "8) Deploy TiltCheck to VPS"
    echo "9) Show account information"
    echo "10) Show available plans"
    echo "11) Exit"
    echo ""
    read -p "Enter choice [1-11]: " choice
    
    case $choice in
        1) list_vps_instances ;;
        2) 
            read -p "Enter VPS ID: " vps_id
            get_vps_details "$vps_id"
            ;;
        3) create_vps_instance ;;
        4) 
            read -p "Enter VPS ID to start: " vps_id
            start_vps_instance "$vps_id"
            ;;
        5) 
            read -p "Enter VPS ID to stop: " vps_id
            stop_vps_instance "$vps_id"
            ;;
        6) 
            read -p "Enter VPS ID to reboot: " vps_id
            reboot_vps_instance "$vps_id"
            ;;
        7) 
            read -p "Enter VPS ID to delete: " vps_id
            delete_vps_instance "$vps_id"
            ;;
        8) 
            read -p "Enter VPS ID for deployment: " vps_id
            deploy_tiltcheck "$vps_id"
            ;;
        9) show_account_info ;;
        10) show_plans ;;
        11) echo -e "${GREEN}🎮 VPS management complete!${NC}"; exit 0 ;;
        *) echo -e "${RED}❌ Invalid option${NC}" ;;
    esac
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️ Installing jq for JSON parsing...${NC}"
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y jq
    elif command -v yum &> /dev/null; then
        sudo yum install -y jq
    elif command -v brew &> /dev/null; then
        brew install jq
    else
        echo -e "${RED}❌ Please install jq manually${NC}"
        exit 1
    fi
fi

# Main loop
while true; do
    echo ""
    show_menu
    echo ""
    read -p "Press Enter to continue..."
    clear
done
