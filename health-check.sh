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


# TrapHouse Discord Server Template - Health Check Script
# Comprehensive health monitoring for the entire ecosystem

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

# Check if Docker containers are running
check_containers() {
    print_header "Docker Container Status"
    
    containers=("traphouse-main" "justthetip-bot" "collectclock-bot" "degens-bot" "traphouse-webhooks" "traphouse-redis" "traphouse-db" "traphouse-proxy")
    
    for container in "${containers[@]}"; do
        if docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
            print_success "$container is running"
        else
            print_error "$container is not running"
        fi
    done
}

# Check service health endpoints
check_health_endpoints() {
    print_header "Service Health Endpoints"
    
    endpoints=(
        "http://localhost:3001/health:TrapHouse Bot"
        "http://localhost:3002/health:JustTheTip Bot"  
        "http://localhost:3003/health:CollectClock Bot"
        "http://localhost:3004/health:Degens Bot"
        "http://localhost:3000/health:Webhook Server"
        "http://localhost:80/health:Nginx Proxy"
    )
    
    for endpoint in "${endpoints[@]}"; do
        url=$(echo $endpoint | cut -d: -f1)
        name=$(echo $endpoint | cut -d: -f2)
        
        if curl -f -s "$url" > /dev/null 2>&1; then
            print_success "$name health check passed"
        else
            print_error "$name health check failed"
        fi
    done
}

# Check database connectivity
check_database() {
    print_header "Database Connectivity"
    
    # PostgreSQL
    if docker exec traphouse-db pg_isready -U traphouse > /dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL is not ready"
    fi
    
    # Redis
    if docker exec traphouse-redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is responding"
    else
        print_error "Redis is not responding"
    fi
}

# Check Discord bot connectivity
check_discord_connectivity() {
    print_header "Discord Bot Connectivity"
    
    bots=("traphouse-main:3001" "justthetip-bot:3002" "collectclock-bot:3003" "degens-bot:3004")
    
    for bot in "${bots[@]}"; do
        container=$(echo $bot | cut -d: -f1)
        port=$(echo $bot | cut -d: -f2)
        
        # Check if bot is connected to Discord
        if docker logs "$container" 2>&1 | tail -20 | grep -q "Ready"; then
            print_success "$container is connected to Discord"
        else
            print_warning "$container Discord connection status unknown"
        fi
    done
}

# Check resource usage
check_resource_usage() {
    print_header "Resource Usage"
    
    # CPU usage
    cpu_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" | grep -E "(traphouse|justthetip|collectclock|degens)" | awk '{print $2}' | sed 's/%//' | awk '{sum+=$1} END {print sum}')
    
    if [ -n "$cpu_usage" ]; then
        if (( $(echo "$cpu_usage < 80" | bc -l) )); then
            print_success "CPU usage: ${cpu_usage}%"
        else
            print_warning "High CPU usage: ${cpu_usage}%"
        fi
    fi
    
    # Memory usage
    memory_stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | grep -E "(traphouse|justthetip|collectclock|degens)")
    echo "Memory Usage:"
    echo "$memory_stats"
}

# Check SSL certificates
check_ssl() {
    print_header "SSL Certificate Status"
    
    if [ -f "nginx/ssl/traphouse.crt" ] && [ -f "nginx/ssl/traphouse.key" ]; then
        # Check certificate expiry
        expiry_date=$(openssl x509 -in nginx/ssl/traphouse.crt -noout -dates | grep "notAfter" | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ $days_until_expiry -gt 30 ]; then
            print_success "SSL certificate valid for $days_until_expiry days"
        elif [ $days_until_expiry -gt 0 ]; then
            print_warning "SSL certificate expires in $days_until_expiry days"
        else
            print_error "SSL certificate has expired"
        fi
    else
        print_error "SSL certificate files not found"
    fi
}

# Check logs for errors
check_logs() {
    print_header "Recent Error Logs"
    
    containers=("traphouse-main" "justthetip-bot" "collectclock-bot" "degens-bot")
    
    for container in "${containers[@]}"; do
        error_count=$(docker logs "$container" --since="1h" 2>&1 | grep -i error | wc -l)
        
        if [ "$error_count" -eq 0 ]; then
            print_success "$container: No errors in last hour"
        elif [ "$error_count" -lt 5 ]; then
            print_warning "$container: $error_count errors in last hour"
        else
            print_error "$container: $error_count errors in last hour (check logs)"
        fi
    done
}

# Check OAuth endpoints
check_oauth() {
    print_header "OAuth Endpoints"
    
    # Check Discord OAuth initiation
    if curl -f -s "http://localhost:3002/auth/discord" | grep -q "Redirecting"; then
        print_success "Discord OAuth initiation endpoint working"
    else
        print_error "Discord OAuth initiation endpoint failed"
    fi
    
    # Check callback endpoint (without completing OAuth)
    if curl -f -s -I "http://localhost:3002/auth/callback" | grep -q "400\|200"; then
        print_success "OAuth callback endpoint accessible"
    else
        print_error "OAuth callback endpoint not accessible"
    fi
}

# Generate summary report
generate_summary() {
    print_header "Health Check Summary"
    
    echo "Timestamp: $(date)"
    echo "Environment: Production"
    echo "Services: 8 containers + infrastructure"
    echo ""
    
    # Count running containers
    running_containers=$(docker ps --filter "name=traphouse" | wc -l)
    echo "Running containers: $((running_containers - 1))"
    
    # Uptime
    if docker ps --filter "name=traphouse-main" --format "{{.Status}}" | grep -q "Up"; then
        uptime=$(docker ps --filter "name=traphouse-main" --format "{{.Status}}" | sed 's/Up //')
        echo "System uptime: $uptime"
    fi
    
    echo ""
    echo "🔗 Quick Access Links:"
    echo "   Main Site: http://localhost"
    echo "   Grafana: http://localhost:3010"
    echo "   Prometheus: http://localhost:9090"
    echo ""
    echo "📋 Maintenance Commands:"
    echo "   Restart: docker-compose -f docker-compose.server.yml restart"
    echo "   Logs: docker-compose -f docker-compose.server.yml logs -f"
    echo "   Scale: docker-compose -f docker-compose.server.yml up -d --scale traphouse-bot=3"
}

# Main execution
main() {
    echo "🏠 TrapHouse Discord Server Template - Health Check"
    echo "=================================================="
    echo ""
    
    check_containers
    echo ""
    
    check_health_endpoints
    echo ""
    
    check_database
    echo ""
    
    check_discord_connectivity
    echo ""
    
    check_resource_usage
    echo ""
    
    check_ssl
    echo ""
    
    check_logs
    echo ""
    
    check_oauth
    echo ""
    
    generate_summary
    
    echo ""
    print_success "Health check completed! 🎉"
}

# Run health check
main "$@"
