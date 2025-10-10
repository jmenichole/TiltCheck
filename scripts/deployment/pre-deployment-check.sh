#!/bin/bash

# TrapHouse Discord Server Template - Local Health Check
# Quick health monitoring without requiring Docker

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check deployment files
check_deployment_files() {
    print_header "Deployment Files Status"
    
    files=(".env.server" "docker-compose.server.yml" "Dockerfile" "nginx/nginx.conf" "deploy-server.sh")
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file missing"
        fi
    done
}

# Check environment configuration
check_environment() {
    print_header "Environment Configuration"
    
    if [ -f ".env.server" ]; then
        # Check critical variables
        while IFS= read -r line; do
            if [[ $line == DISCORD_CLIENT_ID=* ]]; then
                client_id=$(echo $line | cut -d'=' -f2)
                if [ -n "$client_id" ] && [ "$client_id" != "your_client_id_here" ]; then
                    print_success "Discord Client ID configured"
                else
                    print_warning "Discord Client ID needs configuration"
                fi
            fi
            
            if [[ $line == DOMAIN=* ]]; then
                domain=$(echo $line | cut -d'=' -f2)
                if [ -n "$domain" ]; then
                    print_success "Domain configured: $domain"
                else
                    print_warning "Domain needs configuration"
                fi
            fi
            
            if [[ $line == DB_PASSWORD=* ]]; then
                if [[ $line != *"your_"* ]]; then
                    print_success "Database password configured"
                else
                    print_warning "Database password needs configuration"
                fi
            fi
        done < .env.server
    else
        print_error ".env.server not found"
    fi
}

# Check Docker installation
check_docker() {
    print_header "Docker Environment"
    
    if command -v docker &> /dev/null; then
        docker_version=$(docker --version)
        print_success "Docker installed: $docker_version"
        
        # Check if Docker is running
        if docker ps &> /dev/null; then
            print_success "Docker daemon is running"
            
            # Check if containers exist
            containers=$(docker ps -a --filter "name=traphouse" --format "{{.Names}}" 2>/dev/null || echo "")
            if [ -n "$containers" ]; then
                print_success "TrapHouse containers found:"
                echo "$containers" | while read container; do
                    status=$(docker ps --filter "name=$container" --format "{{.Status}}" 2>/dev/null || echo "Not running")
                    if [[ $status == Up* ]]; then
                        print_success "  $container: $status"
                    else
                        print_warning "  $container: Stopped"
                    fi
                done
            else
                print_warning "No TrapHouse containers found (deployment needed)"
            fi
        else
            print_warning "Docker daemon not running (start Docker Desktop)"
        fi
    else
        print_error "Docker not installed"
    fi
}

# Check SSL certificates
check_ssl() {
    print_header "SSL Certificate Status"
    
    if [ -f "nginx/ssl/traphouse.crt" ] && [ -f "nginx/ssl/traphouse.key" ]; then
        # Check certificate validity
        if openssl x509 -in nginx/ssl/traphouse.crt -noout -checkend 86400 &> /dev/null; then
            expiry_date=$(openssl x509 -in nginx/ssl/traphouse.crt -noout -dates | grep "notAfter" | cut -d= -f2)
            print_success "SSL certificate valid until: $expiry_date"
        else
            print_warning "SSL certificate expires within 24 hours or is invalid"
        fi
    else
        print_warning "SSL certificate files not found (will be generated during deployment)"
    fi
}

# Check network connectivity
check_connectivity() {
    print_header "Network Connectivity"
    
    # Check if ports are available
    ports=(3000 3001 3002 3003 3004 5432 6379 9090 3010)
    
    for port in "${ports[@]}"; do
        if lsof -i :$port &> /dev/null; then
            process=$(lsof -i :$port | tail -1 | awk '{print $1}')
            print_warning "Port $port in use by $process"
        else
            print_success "Port $port available"
        fi
    done
}

# Check Discord OAuth configuration
check_oauth() {
    print_header "Discord OAuth Configuration"
    
    if [ -f ".env.server" ]; then
        client_id=$(grep "DISCORD_CLIENT_ID=" .env.server | cut -d'=' -f2)
        redirect_uri=$(grep "OAUTH_REDIRECT_URI=" .env.server | cut -d'=' -f2)
        
        if [ -n "$client_id" ] && [ "$client_id" != "your_client_id_here" ]; then
            print_success "Client ID: $client_id"
            
            if [ -n "$redirect_uri" ]; then
                print_success "Redirect URI: $redirect_uri"
                
                # Generate custom install link
                install_link="https://discord.com/oauth2/authorize?client_id=${client_id}&permissions=414539926592&scope=bot&redirect_uri=${redirect_uri}&response_type=code"
                echo ""
                echo "🔗 Custom Install Link:"
                echo "$install_link"
            else
                print_warning "Redirect URI not configured"
            fi
        else
            print_warning "Discord Client ID not configured"
        fi
    fi
}

# Generate deployment status
generate_status() {
    print_header "Deployment Status Summary"
    
    echo "Timestamp: $(date)"
    echo "System: $(uname -s) $(uname -r)"
    echo ""
    
    # Check readiness
    echo "📋 Deployment Readiness:"
    
    if [ -f ".env.server" ]; then
        echo "✅ Environment configured"
    else
        echo "❌ Environment needs configuration"
    fi
    
    if [ -f "docker-compose.server.yml" ]; then
        echo "✅ Docker orchestration ready"
    else
        echo "❌ Docker compose file missing"
    fi
    
    if command -v docker &> /dev/null; then
        echo "✅ Docker installed"
    else
        echo "❌ Docker installation required"
    fi
    
    if [ -f "nginx/ssl/traphouse.crt" ]; then
        echo "✅ SSL certificates ready"
    else
        echo "⚠️  SSL certificates will be generated"
    fi
    
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Start Docker Desktop"
    echo "2. Run: ./deploy-server.sh"
    echo "3. Configure DNS and SSL"
    echo "4. Update Discord OAuth redirect URIs"
    echo ""
    echo "📖 Guides Available:"
    echo "- DEPLOYMENT_STEPS.md - Step-by-step deployment"
    echo "- DNS_SSL_GUIDE.md - Domain and SSL setup"
    echo "- README_SERVER_TEMPLATE.md - Complete documentation"
}

# Main execution
main() {
    echo "🏠 TrapHouse Discord Server Template - Pre-Deployment Check"
    echo "=========================================================="
    echo ""
    
    check_deployment_files
    echo ""
    
    check_environment
    echo ""
    
    check_docker
    echo ""
    
    check_ssl
    echo ""
    
    check_connectivity
    echo ""
    
    check_oauth
    echo ""
    
    generate_status
    
    echo ""
    print_success "Pre-deployment health check completed! 🎉"
    echo ""
    echo "💡 To deploy: Start Docker Desktop, then run ./deploy-server.sh"
}

# Run health check
main "$@"
