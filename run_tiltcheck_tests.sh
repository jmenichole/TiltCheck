#!/bin/bash

echo "🧪 Running TiltCheck Test Suite"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

FAILED=0
PASSED=0

# Function to run a test
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo ""
    echo "Running: $test_name"
    echo "-------------------"
    
    if node "$test_file"; then
        echo -e "${GREEN}✅ PASSED${NC}: $test_name"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}: $test_name"
        ((FAILED++))
    fi
}

# Run tests that don't require dependencies
run_test "test_rtp_verification.js" "RTP Verification"

# Check if dependencies are installed
if [ -d "node_modules" ] && [ -f "node_modules/axios/package.json" ]; then
    echo ""
    echo "📦 Dependencies detected - running full test suite"
    run_test "test_casino_claims_analyzer.js" "Casino Claims Analyzer"
    
    if [ -f "node_modules/jsonwebtoken/package.json" ]; then
        run_test "test_mobile_integration.js" "Mobile Integration"
        run_test "test_compliance_monitoring.js" "Compliance Monitoring"
    fi
else
    echo ""
    echo "⚠️  Skipping tests requiring dependencies (run 'npm install' for full suite)"
    echo "   - Casino Claims Analyzer (needs axios)"
    echo "   - Mobile Integration (needs jsonwebtoken, axios)"
    echo "   - Compliance Monitoring (needs jsonwebtoken)"
fi

# Summary
echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi
