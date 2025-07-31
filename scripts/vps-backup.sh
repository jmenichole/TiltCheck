#!/bin/bash
# VPS Backup Script for TrapHouse

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}💾 TrapHouse VPS Backup${NC}"
echo "======================="

PROJECT_DIR="$HOME/traphouse-production/trap-house-discord-bot"
BACKUP_DIR="$HOME/traphouse-backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="traphouse_backup_${DATE}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

cd "$PROJECT_DIR"

echo -e "${BLUE}📦 Creating backup: $BACKUP_NAME${NC}"

# Create temporary backup directory
TEMP_BACKUP="$BACKUP_DIR/temp_$BACKUP_NAME"
mkdir -p "$TEMP_BACKUP"

# Backup application data
echo -e "${BLUE}📂 Backing up application data...${NC}"
cp -r data "$TEMP_BACKUP/" 2>/dev/null || echo "   ⚠️  No data directory found"
cp -r logs "$TEMP_BACKUP/" 2>/dev/null || echo "   ⚠️  No logs directory found"

# Backup configuration files
echo -e "${BLUE}⚙️  Backing up configuration...${NC}"
cp .env "$TEMP_BACKUP/" 2>/dev/null || echo "   ⚠️  No .env file found"
cp docker-compose.prod.yml "$TEMP_BACKUP/"
cp -r nginx "$TEMP_BACKUP/"

# Backup SSL certificates
echo -e "${BLUE}🔒 Backing up SSL certificates...${NC}"
if [ -d "/etc/letsencrypt" ]; then
    sudo cp -r /etc/letsencrypt "$TEMP_BACKUP/" 2>/dev/null || echo "   ⚠️  Cannot backup SSL certificates"
fi

# Export Docker volumes
echo -e "${BLUE}🐳 Backing up Docker volumes...${NC}"
mkdir -p "$TEMP_BACKUP/volumes"

# Backup Redis data
if docker volume ls | grep -q redis; then
    docker run --rm \
        -v "$(docker volume ls | grep redis | awk '{print $2}'):/data" \
        -v "$TEMP_BACKUP/volumes:/backup" \
        alpine tar czf /backup/redis_data.tar.gz -C /data .
    echo "   ✅ Redis data backed up"
fi

# Create database dump if using external DB
echo -e "${BLUE}🗄️  Creating database dumps...${NC}"
# Add database backup commands here if using PostgreSQL/MongoDB

# Create system info snapshot
echo -e "${BLUE}📊 Creating system snapshot...${NC}"
cat > "$TEMP_BACKUP/system_info.txt" << EOF
Backup Date: $(date)
Hostname: $(hostname)
System: $(uname -a)
Docker Version: $(docker --version)
Docker Compose Version: $(docker-compose --version)
Disk Usage: $(df -h /)
Memory: $(free -h)
Running Containers:
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
EOF

# Create restoration script
echo -e "${BLUE}🔧 Creating restoration script...${NC}"
cat > "$TEMP_BACKUP/restore.sh" << 'EOF'
#!/bin/bash
# TrapHouse Restoration Script

set -e

echo "🔄 TrapHouse Restoration Script"
echo "==============================="

PROJECT_DIR="$HOME/traphouse-production/trap-house-discord-bot"
BACKUP_DIR=$(dirname "$0")

echo "📂 Restoring to: $PROJECT_DIR"
echo "📦 Restoring from: $BACKUP_DIR"

# Stop services
echo "🛑 Stopping services..."
cd "$PROJECT_DIR"
docker-compose -f docker-compose.prod.yml down || true

# Restore data
echo "📂 Restoring application data..."
cp -r "$BACKUP_DIR/data" "$PROJECT_DIR/" 2>/dev/null || echo "   ⚠️  No data to restore"
cp -r "$BACKUP_DIR/logs" "$PROJECT_DIR/" 2>/dev/null || echo "   ⚠️  No logs to restore"

# Restore configuration
echo "⚙️  Restoring configuration..."
cp "$BACKUP_DIR/.env" "$PROJECT_DIR/" 2>/dev/null || echo "   ⚠️  No .env to restore"
cp -r "$BACKUP_DIR/nginx" "$PROJECT_DIR/"

# Restore SSL certificates
echo "🔒 Restoring SSL certificates..."
if [ -d "$BACKUP_DIR/letsencrypt" ]; then
    sudo cp -r "$BACKUP_DIR/letsencrypt" /etc/ || echo "   ⚠️  Cannot restore SSL certificates"
fi

# Restore Docker volumes
echo "🐳 Restoring Docker volumes..."
if [ -f "$BACKUP_DIR/volumes/redis_data.tar.gz" ]; then
    docker volume create redis-data || true
    docker run --rm \
        -v redis-data:/data \
        -v "$BACKUP_DIR/volumes:/backup" \
        alpine tar xzf /backup/redis_data.tar.gz -C /data
    echo "   ✅ Redis data restored"
fi

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Restoration complete!"
echo "Please check service status with: docker-compose -f docker-compose.prod.yml ps"
EOF

chmod +x "$TEMP_BACKUP/restore.sh"

# Create compressed archive
echo -e "${BLUE}🗜️  Creating compressed archive...${NC}"
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "temp_$BACKUP_NAME"

# Remove temporary directory
rm -rf "temp_$BACKUP_NAME"

# Calculate backup size
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Backup Information:${NC}"
echo "   Name: ${BACKUP_NAME}.tar.gz"
echo "   Size: $BACKUP_SIZE"
echo "   Location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"

# Cleanup old backups (keep last 7)
echo ""
echo -e "${BLUE}🧹 Cleaning up old backups...${NC}"
cd "$BACKUP_DIR"
ls -t traphouse_backup_*.tar.gz 2>/dev/null | tail -n +8 | xargs rm -f || true
REMAINING=$(ls -1 traphouse_backup_*.tar.gz 2>/dev/null | wc -l)
echo "   Keeping $REMAINING most recent backups"

# Show restoration instructions
echo ""
echo -e "${BLUE}🔄 Restoration Instructions:${NC}"
echo "   1. Extract: tar -xzf ${BACKUP_NAME}.tar.gz"
echo "   2. Run: cd temp_${BACKUP_NAME} && ./restore.sh"

# Optional: Upload to remote storage
if [ -n "$BACKUP_REMOTE_PATH" ]; then
    echo ""
    echo -e "${BLUE}☁️  Uploading to remote storage...${NC}"
    # Add your remote backup commands here
    # Examples:
    # rsync -avz "${BACKUP_NAME}.tar.gz" "$BACKUP_REMOTE_PATH/"
    # aws s3 cp "${BACKUP_NAME}.tar.gz" "s3://your-bucket/backups/"
fi

echo ""
echo -e "${GREEN}💾 Backup process complete!${NC}"
