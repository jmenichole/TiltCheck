#!/bin/bash
# 🎯 TrapHouse Gist Manager
# Manage GitHub Gists for TrapHouse ecosystem

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Gist configurations
QUICKSTART_GIST_ID="d4aca3eea66ed40e48bcc9e7e5a3a63e"
QUICKSTART_GIST_URL="https://gist.github.com/${QUICKSTART_GIST_ID}.git"

echo -e "${BLUE}🎯 TrapHouse Gist Manager${NC}"
echo "=================================="

# Function to update Quickstart Gist
update_quickstart_gist() {
    echo -e "${YELLOW}📝 Updating TrapHouse Quick Start Gist...${NC}"
    
    # Create temp directory
    TEMP_DIR="/tmp/traphouse-gist-update"
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Clone the gist
    git clone "$QUICKSTART_GIST_URL" .
    
    # Copy updated content
    cp "$(pwd)/../../GIST_QUICKSTART.md" gistfile1.txt
    
    # Check if there are changes
    if git diff --exit-code gistfile1.txt > /dev/null; then
        echo -e "${GREEN}✅ Gist is already up to date!${NC}"
        cd - > /dev/null
        rm -rf "$TEMP_DIR"
        return 0
    fi
    
    # Commit and push changes
    git add gistfile1.txt
    git commit -m "🔄 Update TrapHouse ecosystem quick start guide

- Updated from local GIST_QUICKSTART.md
- Latest features and setup instructions
- Security fixes and best practices"
    
    echo -e "${BLUE}🚀 Pushing to GitHub Gist...${NC}"
    git push origin main
    
    echo -e "${GREEN}✅ Gist updated successfully!${NC}"
    echo -e "${BLUE}🔗 View at: https://gist.github.com/jmenichole/${QUICKSTART_GIST_ID}${NC}"
    
    # Clean up
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
}

# Function to create new security gist
create_security_gist() {
    echo -e "${YELLOW}🔐 Creating Security Best Practices Gist...${NC}"
    echo -e "${BLUE}📋 Please create manually at: https://gist.github.com/${NC}"
    echo -e "${BLUE}📄 Content source: GIST_SECURITY.md${NC}"
}

# Function to display gist info
show_gist_info() {
    echo -e "${BLUE}📊 TrapHouse Gist Information${NC}"
    echo "=================================="
    echo -e "${GREEN}🎯 Quick Start Gist:${NC}"
    echo "   ID: ${QUICKSTART_GIST_ID}"
    echo "   URL: https://gist.github.com/jmenichole/${QUICKSTART_GIST_ID}"
    echo "   Embed: <script src=\"https://gist.github.com/jmenichole/${QUICKSTART_GIST_ID}.js\"></script>"
    echo ""
    echo -e "${GREEN}📁 Local Files:${NC}"
    echo "   GIST_QUICKSTART.md - Quick start guide"
    echo "   GIST_SECURITY.md - Security best practices"
    echo ""
    echo -e "${GREEN}🚀 Usage Examples:${NC}"
    echo "   HTML: <script src=\"https://gist.github.com/jmenichole/${QUICKSTART_GIST_ID}.js\"></script>"
    echo "   Markdown: [TrapHouse Guide](https://gist.github.com/jmenichole/${QUICKSTART_GIST_ID})"
}

# Function to validate gist content
validate_gist_content() {
    echo -e "${YELLOW}🔍 Validating Gist content...${NC}"
    
    if [ ! -f "GIST_QUICKSTART.md" ]; then
        echo -e "${RED}❌ GIST_QUICKSTART.md not found!${NC}"
        exit 1
    fi
    
    if [ ! -f "GIST_SECURITY.md" ]; then
        echo -e "${RED}❌ GIST_SECURITY.md not found!${NC}"
        exit 1
    fi
    
    # Check for sensitive content
    if grep -q "MTMzNjk2ODc0NjQ1MDgx" GIST_QUICKSTART.md GIST_SECURITY.md; then
        echo -e "${RED}❌ Found potential Discord token in Gist content!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Gist content validation passed!${NC}"
}

# Main menu
case "${1:-help}" in
    "update")
        validate_gist_content
        update_quickstart_gist
        ;;
    "info")
        show_gist_info
        ;;
    "security")
        create_security_gist
        ;;
    "validate")
        validate_gist_content
        ;;
    "help"|*)
        echo -e "${GREEN}🎯 TrapHouse Gist Manager Commands:${NC}"
        echo ""
        echo "  ./gist-manager.sh update    - Update Quick Start Gist with local content"
        echo "  ./gist-manager.sh info      - Show Gist information and embed codes"
        echo "  ./gist-manager.sh security  - Instructions for creating Security Gist"
        echo "  ./gist-manager.sh validate  - Validate Gist content for security"
        echo "  ./gist-manager.sh help      - Show this help message"
        echo ""
        echo -e "${BLUE}🔗 Current Gists:${NC}"
        echo "  Quick Start: https://gist.github.com/jmenichole/${QUICKSTART_GIST_ID}"
        ;;
esac
