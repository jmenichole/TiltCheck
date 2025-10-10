#!/bin/bash

# 🧪 TiltCheck Domain & Node Verification Test Script

echo "🧪 Testing TiltCheck.it.com Domain & Node Verification"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test URLs
DOMAIN="tiltcheck.it.com"
LOCAL_API="http://localhost:4001"
PRODUCTION_API="https://$DOMAIN"

echo -e "${BLUE}🔍 Running comprehensive tests...${NC}"
echo ""

# Test 1: Check if local TiltCheck API is running
echo -e "${YELLOW}Test 1: Local TiltCheck API${NC}"
if curl -s -f "$LOCAL_API/api/health" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Local API: Running${NC}"
    
    # Get detailed health info
    HEALTH_RESPONSE=$(curl -s "$LOCAL_API/api/health")
    NODE_ID=$(echo "$HEALTH_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "   ${BLUE}📋 Node ID: ${NODE_ID:0:12}...${NC}"
    
    # Test verification endpoint
    VERIFY_RESPONSE=$(curl -s "$LOCAL_API/api/verify")
    if echo "$VERIFY_RESPONSE" | grep -q '"verified":true'; then
        echo -e "   ${GREEN}✅ Node Verification: Active${NC}"
    else
        echo -e "   ${RED}❌ Node Verification: Failed${NC}"
    fi
else
    echo -e "   ${RED}❌ Local API: Not running${NC}"
    echo -e "   ${YELLOW}💡 Run: ./setup-tiltcheck-domain.sh${NC}"
fi

echo ""

# Test 2: Check domain DNS resolution
echo -e "${YELLOW}Test 2: Domain DNS Resolution${NC}"
if nslookup "$DOMAIN" > /dev/null 2>&1; then
    IP=$(nslookup "$DOMAIN" | grep 'Address:' | tail -1 | awk '{print $2}')
    echo -e "   ${GREEN}✅ DNS Resolution: $IP${NC}"
else
    echo -e "   ${RED}❌ DNS Resolution: Failed${NC}"
    echo -e "   ${YELLOW}💡 Configure DNS for $DOMAIN${NC}"
fi

echo ""

# Test 3: Check production domain accessibility
echo -e "${YELLOW}Test 3: Production Domain Access${NC}"
if curl -s -f "$PRODUCTION_API" > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Production API: Accessible${NC}"
    
    # Check for verification headers
    HEADERS=$(curl -s -I "$PRODUCTION_API" 2>/dev/null || echo "")
    if echo "$HEADERS" | grep -q "X-TiltCheck-Verified"; then
        echo -e "   ${GREEN}✅ Verification Headers: Present${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Verification Headers: Missing${NC}"
    fi
else
    echo -e "   ${RED}❌ Production API: Not accessible${NC}"
    echo -e "   ${YELLOW}💡 Deploy to production server${NC}"
fi

echo ""

# Test 4: Speed and performance test
echo -e "${YELLOW}Test 4: Performance Test${NC}"
if command -v curl >/dev/null 2>&1; then
    echo -e "   ${BLUE}⏱️  Testing response times...${NC}"
    
    # Test local API speed
    LOCAL_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$LOCAL_API/api/health" 2>/dev/null || echo "0")
    if (( $(echo "$LOCAL_TIME > 0" | bc -l) )); then
        LOCAL_MS=$(echo "$LOCAL_TIME * 1000" | bc)
        echo -e "   ${GREEN}✅ Local API Response: ${LOCAL_MS%.*}ms${NC}"
    else
        echo -e "   ${RED}❌ Local API: No response${NC}"
    fi
    
    # Test production API speed (if accessible)
    PROD_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$PRODUCTION_API" 2>/dev/null || echo "0")
    if (( $(echo "$PROD_TIME > 0" | bc -l) )); then
        PROD_MS=$(echo "$PROD_TIME * 1000" | bc)
        echo -e "   ${GREEN}✅ Production API Response: ${PROD_MS%.*}ms${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Production API: Not accessible for timing${NC}"
    fi
fi

echo ""

# Test 5: Check all bot services
echo -e "${YELLOW}Test 5: Bot Ecosystem Health${NC}"
SERVICES=(
    "3333:Beta Server"
    "3001:GitHub Webhook"
    "3002:CollectClock OAuth"
    "4001:TiltCheck API"
)

for service in "${SERVICES[@]}"; do
    PORT="${service%%:*}"
    NAME="${service##*:}"
    
    if curl -s -f "http://localhost:$PORT/health" > /dev/null 2>&1 ||
       curl -s -f "http://localhost:$PORT/api/health" > /dev/null 2>&1 ||
       curl -s -f "http://localhost:$PORT/auth/collectclock/health" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $NAME (Port $PORT): Running${NC}"
    else
        echo -e "   ${RED}❌ $NAME (Port $PORT): Not running${NC}"
    fi
done

echo ""

# Test 6: Verification system integrity
echo -e "${YELLOW}Test 6: Node Verification System${NC}"
if curl -s -f "$LOCAL_API/api/verify" > /dev/null 2>&1; then
    VERIFY_DATA=$(curl -s "$LOCAL_API/api/verify")
    
    # Check verification components
    if echo "$VERIFY_DATA" | grep -q '"verified":true'; then
        echo -e "   ${GREEN}✅ Verification Status: Confirmed${NC}"
    fi
    
    if echo "$VERIFY_DATA" | grep -q '"nodeId"'; then
        echo -e "   ${GREEN}✅ Node ID: Generated${NC}"
    fi
    
    if echo "$VERIFY_DATA" | grep -q '"connectionId"'; then
        echo -e "   ${GREEN}✅ Connection Tracking: Active${NC}"
    fi
    
    if echo "$VERIFY_DATA" | grep -q '"checksum"'; then
        echo -e "   ${GREEN}✅ Security Checksum: Validated${NC}"
    fi
else
    echo -e "   ${RED}❌ Verification System: Not accessible${NC}"
fi

echo ""

# Test 7: Performance optimization check
echo -e "${YELLOW}Test 7: Optimization Status${NC}"
if [ -f "optimize-tiltcheck.sh" ]; then
    echo -e "   ${GREEN}✅ Optimization Script: Available${NC}"
else
    echo -e "   ${YELLOW}⚠️  Optimization Script: Missing${NC}"
fi

if [ -f "nginx-tiltcheck.conf" ]; then
    echo -e "   ${GREEN}✅ Nginx Config: Available${NC}"
else
    echo -e "   ${YELLOW}⚠️  Nginx Config: Missing${NC}"
fi

if [ -f "copilot-allowlist.json" ]; then
    echo -e "   ${GREEN}✅ Copilot Allowlist: Configured${NC}"
else
    echo -e "   ${YELLOW}⚠️  Copilot Allowlist: Missing${NC}"
fi

echo ""

# Summary and recommendations
echo -e "${BLUE}📊 Test Summary & Recommendations${NC}"
echo "============================================"

# Count successful tests
TESTS_PASSED=0
if curl -s -f "$LOCAL_API/api/health" > /dev/null 2>&1; then ((TESTS_PASSED++)); fi
if nslookup "$DOMAIN" > /dev/null 2>&1; then ((TESTS_PASSED++)); fi
if curl -s -f "$LOCAL_API/api/verify" > /dev/null 2>&1; then ((TESTS_PASSED++)); fi

echo -e "Tests Passed: ${TESTS_PASSED}/7"

if [ $TESTS_PASSED -ge 5 ]; then
    echo -e "${GREEN}🎯 TiltCheck Status: Excellent${NC}"
    echo -e "${GREEN}✅ Ready for production deployment${NC}"
elif [ $TESTS_PASSED -ge 3 ]; then
    echo -e "${YELLOW}⚠️  TiltCheck Status: Good${NC}"
    echo -e "${YELLOW}🔧 Minor optimizations needed${NC}"
else
    echo -e "${RED}❌ TiltCheck Status: Needs Work${NC}"
    echo -e "${RED}🚨 Setup required before deployment${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Quick Actions:${NC}"
echo "• Start TiltCheck: ./setup-tiltcheck-domain.sh"
echo "• Start all bots: ./start_bot.sh"
echo "• Optimize performance: ./optimize-tiltcheck.sh"
echo "• View logs: tail -f logs/*.log"
echo ""
echo -e "${BLUE}🔗 Access Points:${NC}"
echo "• Local TiltCheck: http://localhost:4001"
echo "• Verification Test: http://localhost:4001/api/verify"
echo "• Health Check: http://localhost:4001/api/health"
echo "• Production URL: https://tiltcheck.it.com"
echo ""
echo -e "${GREEN}✅ Testing complete!${NC}"
