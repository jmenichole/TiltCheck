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

# Run tests
run_test "test_rtp_verification.js" "RTP Verification"
run_test "test_casino_claims_analyzer.js" "Casino Claims Analyzer"

# Note: Mobile integration test requires jsonwebtoken to be installed
if command -v npm &> /dev/null && [ -d "node_modules/jsonwebtoken" ]; then
    run_test "test_mobile_integration.js" "Mobile Integration"
    run_test "test_compliance_monitoring.js" "Compliance Monitoring"
else
    echo ""
    echo "⚠️  Skipping mobile integration tests (requires: npm install)"
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
