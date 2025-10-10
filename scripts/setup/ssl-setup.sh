#!/bin/bash

# TiltCheck SSL Certificate Setup & Automation Script
# Supports both automated SSL (Let's Encrypt) and manual SSL (Positive SSL)

set -e

echo "🔒 TiltCheck SSL Certificate Setup"
echo "=================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="tiltcheck.it.com"
EMAIL="admin@tiltcheck.it.com"
SSL_DIR="/etc/ssl/tiltcheck"
NGINX_SITES_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

# Functions
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ This script must be run as root${NC}"
        echo "Please run: sudo $0"
        exit 1
    fi
}

install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Update package list
    apt update
    
    # Install nginx
    if ! command -v nginx &> /dev/null; then
        echo -e "${YELLOW}Installing nginx...${NC}"
        apt install -y nginx
    else
        echo -e "${GREEN}✅ nginx already installed${NC}"
    fi
    
    # Install openssl
    if ! command -v openssl &> /dev/null; then
        echo -e "${YELLOW}Installing openssl...${NC}"
        apt install -y openssl
    else
        echo -e "${GREEN}✅ openssl already installed${NC}"
    fi
    
    # Install certbot for Let's Encrypt
    if ! command -v certbot &> /dev/null; then
        echo -e "${YELLOW}Installing certbot...${NC}"
        apt install -y certbot python3-certbot-nginx
    else
        echo -e "${GREEN}✅ certbot already installed${NC}"
    fi
}

create_ssl_directories() {
    echo -e "${BLUE}📁 Creating SSL directories...${NC}"
    
    mkdir -p "$SSL_DIR"
    mkdir -p "$SSL_DIR/csr"
    mkdir -p "$SSL_DIR/private"
    mkdir -p "$SSL_DIR/certs"
    
    # Set proper permissions
    chmod 755 "$SSL_DIR"
    chmod 700 "$SSL_DIR/private"
    chmod 755 "$SSL_DIR/csr"
    chmod 755 "$SSL_DIR/certs"
    
    echo -e "${GREEN}✅ SSL directories created${NC}"
}

generate_csr_and_key() {
    echo -e "${PURPLE}🔑 Generating CSR and Private Key for manual SSL setup...${NC}"
    
    local key_file="$SSL_DIR/private/${DOMAIN}.key"
    local csr_file="$SSL_DIR/csr/${DOMAIN}.csr"
    local config_file="$SSL_DIR/${DOMAIN}.conf"
    
    # Create OpenSSL configuration
    cat > "$config_file" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=California
L=San Francisco
O=TiltCheck
OU=IT Department
CN=${DOMAIN}

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${DOMAIN}
DNS.2 = www.${DOMAIN}
DNS.3 = api.${DOMAIN}
DNS.4 = dashboard.${DOMAIN}
DNS.5 = admin.${DOMAIN}
DNS.6 = vault.${DOMAIN}
DNS.7 = portal.${DOMAIN}
DNS.8 = bot.${DOMAIN}
EOF

    # Generate private key
    echo -e "${CYAN}Generating private key...${NC}"
    openssl genrsa -out "$key_file" 2048
    
    # Generate CSR
    echo -e "${CYAN}Generating Certificate Signing Request (CSR)...${NC}"
    openssl req -new -key "$key_file" -out "$csr_file" -config "$config_file"
    
    # Set proper permissions
    chmod 600 "$key_file"
    chmod 644 "$csr_file"
    
    echo -e "${GREEN}✅ CSR and Private Key generated successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Files created:${NC}"
    echo "   Private Key: $key_file"
    echo "   CSR: $csr_file"
    echo "   Config: $config_file"
    echo ""
    echo -e "${CYAN}🔍 CSR Content (submit to your SSL provider):${NC}"
    echo "=============================================="
    cat "$csr_file"
    echo "=============================================="
    echo ""
    echo -e "${YELLOW}📤 Next steps for manual SSL:${NC}"
    echo "1. Copy the CSR content above"
    echo "2. Submit to your SSL certificate provider"
    echo "3. Download the certificate files when ready"
    echo "4. Run: sudo $0 --install-manual-ssl"
    
    # Save CSR to easily accessible file
    cp "$csr_file" "/tmp/${DOMAIN}.csr"
    echo -e "${GREEN}📄 CSR also saved to: /tmp/${DOMAIN}.csr${NC}"
}

install_manual_ssl() {
    echo -e "${PURPLE}📥 Installing manual SSL certificate...${NC}"
    
    local cert_file="$SSL_DIR/certs/${DOMAIN}.crt"
    local key_file="$SSL_DIR/private/${DOMAIN}.key"
    local bundle_file="$SSL_DIR/certs/${DOMAIN}_bundle.crt"
    
    # Check if private key exists
    if [[ ! -f "$key_file" ]]; then
        echo -e "${RED}❌ Private key not found. Please run CSR generation first.${NC}"
        echo "Run: sudo $0 --generate-csr"
        exit 1
    fi
    
    echo -e "${YELLOW}📁 Please place your SSL certificate files in:${NC}"
    echo "   Certificate: $cert_file"
    echo "   Intermediate/Bundle: $bundle_file"
    echo ""
    echo -e "${CYAN}Waiting for certificate files...${NC}"
    
    # Wait for certificate files
    while [[ ! -f "$cert_file" ]]; do
        echo -e "${YELLOW}Please place your certificate file at: $cert_file${NC}"
        read -p "Press Enter when certificate file is in place..."
    done
    
    while [[ ! -f "$bundle_file" ]]; do
        echo -e "${YELLOW}Please place your intermediate/bundle file at: $bundle_file${NC}"
        read -p "Press Enter when bundle file is in place..."
    done
    
    # Set proper permissions
    chmod 644 "$cert_file"
    chmod 644 "$bundle_file"
    
    # Verify certificate
    echo -e "${CYAN}🔍 Verifying certificate...${NC}"
    if openssl x509 -in "$cert_file" -text -noout > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Certificate verification successful${NC}"
    else
        echo -e "${RED}❌ Certificate verification failed${NC}"
        exit 1
    fi
    
    # Test private key and certificate match
    cert_modulus=$(openssl x509 -noout -modulus -in "$cert_file" | openssl md5)
    key_modulus=$(openssl rsa -noout -modulus -in "$key_file" | openssl md5)
    
    if [[ "$cert_modulus" == "$key_modulus" ]]; then
        echo -e "${GREEN}✅ Certificate and private key match${NC}"
    else
        echo -e "${RED}❌ Certificate and private key do not match${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Manual SSL certificate installed successfully!${NC}"
}

setup_automated_ssl() {
    echo -e "${PURPLE}🤖 Setting up automated SSL with Let's Encrypt...${NC}"
    
    # Stop nginx temporarily
    systemctl stop nginx
    
    # Get certificate
    echo -e "${CYAN}Obtaining SSL certificate from Let's Encrypt...${NC}"
    certbot certonly --standalone \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --domains "$DOMAIN,www.$DOMAIN,api.$DOMAIN,dashboard.$DOMAIN,admin.$DOMAIN"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}✅ Let's Encrypt certificate obtained successfully!${NC}"
        
        # Set up auto-renewal
        echo -e "${CYAN}Setting up auto-renewal...${NC}"
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        echo -e "${GREEN}✅ Auto-renewal configured${NC}"
    else
        echo -e "${RED}❌ Failed to obtain Let's Encrypt certificate${NC}"
        exit 1
    fi
}

create_nginx_config() {
    echo -e "${BLUE}🌐 Creating nginx configuration...${NC}"
    
    local ssl_type="$1"
    local config_file="$NGINX_SITES_DIR/tiltcheck"
    
    if [[ "$ssl_type" == "manual" ]]; then
        # Manual SSL paths
        local cert_path="$SSL_DIR/certs/${DOMAIN}.crt"
        local key_path="$SSL_DIR/private/${DOMAIN}.key"
        local bundle_path="$SSL_DIR/certs/${DOMAIN}_bundle.crt"
    else
        # Let's Encrypt paths
        local cert_path="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
        local key_path="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
    fi
    
    cat > "$config_file" << EOF
# TiltCheck SSL Configuration
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN} api.${DOMAIN} dashboard.${DOMAIN} admin.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL Configuration
    ssl_certificate ${cert_path};
    ssl_certificate_key ${key_path};
EOF

    if [[ "$ssl_type" == "manual" && -f "$bundle_path" ]]; then
        echo "    ssl_trusted_certificate ${bundle_path};" >> "$config_file"
    fi

    cat >> "$config_file" << EOF

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root directory for static files
    root /var/www/tiltcheck;
    index index.html;

    # Main site
    location / {
        try_files \$uri \$uri/ =404;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}

# API subdomain
server {
    listen 443 ssl http2;
    server_name api.${DOMAIN};

    # SSL Configuration (same as main)
    ssl_certificate ${cert_path};
    ssl_certificate_key ${key_path};
EOF

    if [[ "$ssl_type" == "manual" && -f "$bundle_path" ]]; then
        echo "    ssl_trusted_certificate ${bundle_path};" >> "$config_file"
    fi

    cat >> "$config_file" << EOF
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Proxy to TiltCheck API
    location / {
        proxy_pass http://localhost:4001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
    }
}

# Dashboard subdomain
server {
    listen 443 ssl http2;
    server_name dashboard.${DOMAIN};

    # SSL Configuration (same as main)
    ssl_certificate ${cert_path};
    ssl_certificate_key ${key_path};
EOF

    if [[ "$ssl_type" == "manual" && -f "$bundle_path" ]]; then
        echo "    ssl_trusted_certificate ${bundle_path};" >> "$config_file"
    fi

    cat >> "$config_file" << EOF
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Proxy to Dashboard
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
    }
}

# Admin subdomain
server {
    listen 443 ssl http2;
    server_name admin.${DOMAIN};

    # SSL Configuration (same as main)
    ssl_certificate ${cert_path};
    ssl_certificate_key ${key_path};
EOF

    if [[ "$ssl_type" == "manual" && -f "$bundle_path" ]]; then
        echo "    ssl_trusted_certificate ${bundle_path};" >> "$config_file"
    fi

    cat >> "$config_file" << EOF
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Proxy to Admin Dashboard (NFT protected)
    location / {
        proxy_pass http://localhost:3001/admin;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
    }
}
EOF

    # Enable the site
    ln -sf "$config_file" "$NGINX_ENABLED_DIR/"
    
    # Remove default nginx site
    rm -f "$NGINX_ENABLED_DIR/default"
    
    echo -e "${GREEN}✅ Nginx configuration created${NC}"
}

setup_web_directory() {
    echo -e "${BLUE}📁 Setting up web directory...${NC}"
    
    mkdir -p /var/www/tiltcheck
    
    # Copy TiltCheck files if they exist
    if [[ -f "/root/trap-house-discord-bot/index.html" ]]; then
        cp -r /root/trap-house-discord-bot/* /var/www/tiltcheck/
    elif [[ -f "/home/*/trap-house-discord-bot/index.html" ]]; then
        cp -r /home/*/trap-house-discord-bot/* /var/www/tiltcheck/
    else
        # Create basic index.html if no files found
        cat > /var/www/tiltcheck/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TiltCheck - Coming Soon</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #2c1810; color: #fff; }
        h1 { color: #ff6b00; font-size: 3rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin-bottom: 30px; }
        .logo { font-size: 2rem; margin-bottom: 40px; }
    </style>
</head>
<body>
    <div class="logo">TiltCheck ⚠️</div>
    <h1>TiltCheck is Coming Soon!</h1>
    <p>Gambling accountability and addiction prevention platform.</p>
    <p>Built by degens, for degens who learned the hard way.</p>
    <p><strong>SSL Certificate:</strong> ✅ Secured</p>
    <p><strong>Status:</strong> Deploying...</p>
</body>
</html>
EOF
    fi
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/tiltcheck
    chmod -R 755 /var/www/tiltcheck
    
    echo -e "${GREEN}✅ Web directory setup complete${NC}"
}

test_ssl_configuration() {
    echo -e "${CYAN}🧪 Testing SSL configuration...${NC}"
    
    # Test nginx configuration
    if nginx -t; then
        echo -e "${GREEN}✅ Nginx configuration test passed${NC}"
    else
        echo -e "${RED}❌ Nginx configuration test failed${NC}"
        exit 1
    fi
    
    # Restart nginx
    systemctl restart nginx
    
    # Test SSL connectivity
    sleep 3
    
    echo -e "${CYAN}Testing SSL certificate...${NC}"
    if curl -I "https://$DOMAIN" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SSL certificate is working${NC}"
    else
        echo -e "${YELLOW}⚠️ SSL test failed - this may be due to DNS propagation${NC}"
    fi
    
    # Display SSL information
    echo -e "${CYAN}SSL Certificate Information:${NC}"
    echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN":443 2>/dev/null | openssl x509 -noout -dates
}

show_completion_message() {
    echo ""
    echo -e "${GREEN}🎉 TiltCheck SSL Setup Complete!${NC}"
    echo "================================="
    echo ""
    echo -e "${CYAN}🌐 Your TiltCheck ecosystem is now secured with SSL:${NC}"
    echo "   Main Site: https://$DOMAIN"
    echo "   API: https://api.$DOMAIN"
    echo "   Dashboard: https://dashboard.$DOMAIN"
    echo "   Admin: https://admin.$DOMAIN"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "   1. Update DNS records to point to this server"
    echo "   2. Deploy TiltCheck application code"
    echo "   3. Start TiltCheck services (bot.js, dashboard, etc.)"
    echo "   4. Test all functionality"
    echo ""
    echo -e "${CYAN}🔧 Useful commands:${NC}"
    echo "   sudo systemctl status nginx"
    echo "   sudo certbot renew --dry-run (for Let's Encrypt)"
    echo "   sudo nginx -t"
    echo "   curl -I https://$DOMAIN"
}

# Main script logic
case "${1:-help}" in
    "--generate-csr"|"-g")
        check_root
        install_dependencies
        create_ssl_directories
        generate_csr_and_key
        ;;
    "--install-manual-ssl"|"-m")
        check_root
        install_dependencies
        create_ssl_directories
        install_manual_ssl
        create_nginx_config "manual"
        setup_web_directory
        test_ssl_configuration
        show_completion_message
        ;;
    "--setup-automated-ssl"|"-a")
        check_root
        install_dependencies
        create_ssl_directories
        setup_automated_ssl
        create_nginx_config "automated"
        setup_web_directory
        test_ssl_configuration
        show_completion_message
        ;;
    "--full-setup"|"-f")
        echo -e "${PURPLE}🔒 TiltCheck SSL Full Setup${NC}"
        echo "Which SSL method would you like to use?"
        echo "1) Manual SSL (use your Positive SSL certificate)"
        echo "2) Automated SSL (Let's Encrypt - free)"
        read -p "Choose option (1 or 2): " choice
        
        case $choice in
            1)
                $0 --generate-csr
                echo ""
                echo -e "${YELLOW}After obtaining your certificate, run:${NC}"
                echo "sudo $0 --install-manual-ssl"
                ;;
            2)
                $0 --setup-automated-ssl
                ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                exit 1
                ;;
        esac
        ;;
    *)
        echo -e "${PURPLE}TiltCheck SSL Certificate Setup${NC}"
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  -g, --generate-csr        Generate CSR and private key for manual SSL"
        echo "  -m, --install-manual-ssl  Install manual SSL certificate (Positive SSL)"
        echo "  -a, --setup-automated-ssl Setup automated SSL with Let's Encrypt"
        echo "  -f, --full-setup          Interactive full setup"
        echo ""
        echo "Examples:"
        echo "  sudo $0 --full-setup              # Interactive setup"
        echo "  sudo $0 --generate-csr            # Generate CSR for Positive SSL"
        echo "  sudo $0 --install-manual-ssl      # Install Positive SSL certificate"
        echo "  sudo $0 --setup-automated-ssl     # Use Let's Encrypt (free)"
        echo ""
        echo -e "${CYAN}Recommended workflow for Positive SSL:${NC}"
        echo "1. sudo $0 --generate-csr"
        echo "2. Submit CSR to your SSL provider"
        echo "3. Place certificate files in /etc/ssl/tiltcheck/certs/"
        echo "4. sudo $0 --install-manual-ssl"
        ;;
esac
