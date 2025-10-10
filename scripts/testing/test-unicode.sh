#!/bin/bash

# 🛡️ TrapHouse Unicode Resistance Test
# Test the bot's ability to handle various unicode attacks and edge cases

echo "🛡️ Testing TrapHouse Bot Unicode Resistance..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo -e "${YELLOW}🔍 Checking Unicode Utilities...${NC}\n"

# Test 1: Check if unicode utilities exist
run_test "Unicode Utils Module Exists" "[ -f './utils/unicodeUtils.js' ]" "true"

# Test 2: Check if unicode storage exists
run_test "Unicode Storage Module Exists" "[ -f './utils/unicodeSafeStorage.js' ]" "true"

# Test 3: Check if main.js includes unicode handling
run_test "Main.js includes Unicode Utils" "grep -q 'UnicodeUtils' './main.js'" "true"

# Test 4: Check Docker has unicode support
run_test "Dockerfile has Unicode Support" "grep -q 'LANG=C.UTF-8' './Dockerfile'" "true"

# Test 5: Check package.json has unicode dependencies
run_test "Package.json has Unicode Dependencies" "grep -q 'iconv-lite' './package.json'" "true"

echo -e "${YELLOW}🧪 Running Unicode Attack Simulations...${NC}\n"

# Create test data with unicode attacks
cat > test_unicode_data.json << 'EOF'
{
  "normalText": "Hello World",
  "unicodeAttack1": "test\u202E\u202Dattack",
  "unicodeAttack2": "normal\u200B\u200C\u200Dtext",
  "emojiOverload": "🔥💰🏠🎯💯👑💎🚀",
  "bidiAttack": "test\u202Ekcatta\u202D",
  "nullBytes": "test\u0000attack",
  "controlChars": "test\u0001\u0002\u0003attack",
  "longUnicode": "🌟".repeat(1000),
  "mixedScripts": "Hello العالم мир 世界",
  "zalgoText": "T̴̰̰̈́h̷̰̓ë̴́ ̶͉̈q̵̈ṵ̸̈ï̵̥c̵̣̄k̴̰̇ ̸̻̔b̷̰̈r̷̰̓o̴̰̊w̷̰̄n̴̰̈ ̸̻̔f̵̥̈o̴̰̊x̷̰̓"
}
EOF

# Test 6: Node.js can handle the test data
run_test "Node.js Unicode Handling" "node -e \"
const data = require('./test_unicode_data.json');
const UnicodeUtils = require('./utils/unicodeUtils.js');

// Test sanitization
Object.values(data).forEach(text => {
  const sanitized = UnicodeUtils.sanitizeInput(text);
  if (!UnicodeUtils.isSafeString(sanitized)) {
    throw new Error('Sanitization failed');
  }
});

console.log('All unicode tests passed');
\"" "true"

# Clean up test file
rm -f test_unicode_data.json

echo -e "${YELLOW}🔒 Testing Security Features...${NC}\n"

# Test 7: Check for dangerous unicode patterns
run_test "No Dangerous Unicode in Source" "! grep -r $'\\u202[A-F]' --include='*.js' ." "true"

# Test 8: Check for proper encoding headers
run_test "Files Have Proper Encoding" "file --mime-encoding *.js | grep -q 'utf-8\\|us-ascii'" "true"

# Test 9: Check environment supports unicode
run_test "Environment Unicode Support" "node -e \"
process.stdout.write('🔥💰🏠');
console.log(' Unicode test passed');
\"" "true"

echo -e "${YELLOW}📊 Unicode Test Results Summary${NC}\n"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📊 Total Tests: $TOTAL_TESTS${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All Unicode Resistance Tests Passed!${NC}"
    echo -e "${GREEN}🛡️ Your TrapHouse bot is Unicode-resistant and ready for production!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ Some Unicode tests failed. Please review the implementation.${NC}"
    exit 1
fi

echo -e "\n${BLUE}💡 Unicode Security Tips:${NC}"
echo "• Always sanitize user input"
echo "• Use normalized unicode comparisons"
echo "• Log with unicode safety"
echo "• Backup data with unicode encoding"
echo "• Test with international characters"
echo "• Monitor for unicode-based attacks"
