#!/bin/bash

# TrapHouse Discord Server Template - Production Deployment Script
# This script sets up a complete Discord bot ecosystem with Docker

set -e

echo "🏠 TrapHouse Discord Server Template - Production Setup"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="traphouse-discord-ecosystem"
DOMAIN="${DOMAIN:-traphouse.dev}"
EMAIL="${EMAIL:-admin@traphouse.com}"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please configure your environment variables first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Setup SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    mkdir -p nginx/ssl
    
    if [ ! -f "nginx/ssl/traphouse.crt" ]; then
        print_status "Generating self-signed SSL certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/traphouse.key \
            -out nginx/ssl/traphouse.crt \
            -subj "/C=US/ST=State/L=City/O=TrapHouse/CN=${DOMAIN}"
        
        print_warning "Using self-signed certificate. For production, use Let's Encrypt or a valid SSL certificate."
    fi
    
    print_success "SSL certificates ready!"
}

# Setup monitoring configuration
setup_monitoring() {
    print_status "Setting up monitoring configuration..."
    
    mkdir -p monitoring
    
    # Prometheus configuration
    cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'traphouse-bots'
    static_configs:
      - targets: 
        - 'traphouse-bot:3001'
        - 'justthetip-bot:3002'
        - 'collectclock-bot:3003'
        - 'degens-bot:3004'

  - job_name: 'webhook-server'
    static_configs:
      - targets: ['webhook-server:3000']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
EOF

    print_success "Monitoring configuration ready!"
}

# Setup database initialization
setup_database() {
    print_status "Setting up database initialization..."
    
    mkdir -p scripts
    
    cat > scripts/init.sql << 'EOF'
-- TrapHouse Discord Bot Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    discord_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    respect_points INTEGER DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    id BIGSERIAL PRIMARY KEY,
    lender_id BIGINT REFERENCES users(id),
    borrower_id BIGINT REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 0.00,
    due_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bot statistics
CREATE TABLE IF NOT EXISTS bot_stats (
    id BIGSERIAL PRIMARY KEY,
    bot_name VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_bot_stats_bot_name ON bot_stats(bot_name);

-- Insert default admin user (optional)
INSERT INTO users (discord_id, username, respect_points, balance) 
VALUES ('YOUR_DISCORD_ID', 'Admin', 1000, 100.00) 
ON CONFLICT (discord_id) DO NOTHING;
EOF

    print_success "Database initialization script ready!"
}

# Create environment template for server
create_server_env() {
    print_status "Creating server environment template..."
    
    cat > .env.server << 'EOF'
# TrapHouse Discord Server Template - Production Environment

# Bot Tokens (Configure these in Discord Developer Portal)
TRAPHOUSE_BOT_TOKEN=your_traphouse_bot_token_here
JUSTTHETIP_BOT_TOKEN=your_justthetip_bot_token_here
COLLECTCLOCK_BOT_TOKEN=your_collectclock_bot_token_here
DEGENS_BOT_TOKEN=your_degens_bot_token_here

# Database Configuration
DB_PASSWORD=your_secure_database_password_here
DB_HOST=postgres
DB_PORT=5432
DB_NAME=traphouse
DB_USER=traphouse

# Redis Configuration
REDIS_URL=redis://redis:6379

# Monitoring
GRAFANA_PASSWORD=your_grafana_admin_password_here

# Domain and SSL
DOMAIN=traphouse.dev
EMAIL=admin@traphouse.com

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Discord OAuth (from your main .env)
DISCORD_CLIENT_ID=1373784722718720090
DISCORD_CLIENT_SECRET=d0Om40g-SURaTuor8BNwUFuvDyQ1Qxqh
OAUTH_REDIRECT_URI=https://traphouse.dev/auth/callback
BASE_URL=https://traphouse.dev

# Payment Integration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_USDC_DESTINATION_ADDRESS=your_solana_usdc_destination_address_here

# TiltCheck & Stake Integration
TILTCHECK_API_KEY=your_tiltcheck_api_key_here
STAKE_API_KEY=your_stake_api_key_here

# Feature Flags
ENABLE_CRYPTO_DEPOSITS=true
ENABLE_FIAT_DEPOSITS=true
ENABLE_WITHDRAWALS=true
ENABLE_MONITORING=true
EOF

    print_success "Server environment template created!"
}

# Build and deploy
deploy_ecosystem() {
    print_status "Building and deploying TrapHouse ecosystem..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.server.yml down
    
    # Build images
    print_status "Building Docker images..."
    docker-compose -f docker-compose.server.yml build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose -f docker-compose.server.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    docker-compose -f docker-compose.server.yml ps
    
    print_success "TrapHouse ecosystem deployed successfully!"
}

# Display access information
show_access_info() {
    print_success "🎉 TrapHouse Discord Server Template - Deployment Complete!"
    echo ""
    echo "📊 Access Information:"
    echo "===================="
    echo "🌐 Main Site: https://${DOMAIN}"
    echo "📈 Grafana Dashboard: https://dashboard.${DOMAIN}"
    echo "🔧 Prometheus Metrics: https://${DOMAIN}/metrics"
    echo ""
    echo "🤖 Bot API Endpoints:"
    echo "===================="
    echo "🏠 TrapHouse Bot: https://${DOMAIN}/api/traphouse/"
    echo "💡 JustTheTip Bot: https://${DOMAIN}/api/justthetip/"
    echo "💧 CollectClock Bot: https://${DOMAIN}/api/collectclock/"
    echo "🎰 Degens Bot: https://${DOMAIN}/api/degens/"
    echo ""
    echo "🔗 OAuth & Webhooks:"
    echo "==================="
    echo "🔐 Discord OAuth: https://${DOMAIN}/auth/discord"
    echo "🪝 GitHub Webhooks: https://${DOMAIN}/webhooks/"
    echo ""
    echo "📋 Next Steps:"
    echo "============="
    echo "1. Update DNS records to point to your server IP"
    echo "2. Configure Discord OAuth redirect URIs"
    echo "3. Set up SSL certificates (Let's Encrypt recommended)"
    echo "4. Configure payment providers (Stripe, etc.)"
    echo "5. Test all bot functionalities"
    echo ""
    echo "🛟 Support Commands:"
    echo "==================="
    echo "View logs: docker-compose -f docker-compose.server.yml logs -f"
    echo "Restart service: docker-compose -f docker-compose.server.yml restart [service]"
    echo "Scale bots: docker-compose -f docker-compose.server.yml up -d --scale traphouse-bot=3"
    echo ""
    print_success "Your professional Discord bot ecosystem is now live! 🚀"
}

# Main execution
main() {
    echo "Starting TrapHouse Discord Server Template deployment..."
    echo ""
    
    check_prerequisites
    setup_ssl
    setup_monitoring
    setup_database
    create_server_env
    deploy_ecosystem
    show_access_info
}

# Run main function
main "$@"
