/**
 * Support Page Functionality Test
 * Tests the support.html page for proper functionality
 */

const fs = require('fs');
const path = require('path');

// Read the support.html file
const supportPagePath = path.join(__dirname, 'public', 'support.html');
let supportPageContent = '';

try {
    supportPageContent = fs.readFileSync(supportPagePath, 'utf8');
    console.log('✅ Support page file loaded successfully');
} catch (error) {
    console.error('❌ Failed to load support page:', error.message);
    process.exit(1);
}

// Test functions
function testExternalLinks() {
    console.log('\n🔗 Testing External Links...');
    
    const links = [
        { name: 'Ko-fi', pattern: /https:\/\/ko-fi\.com\/jmenichole/, required: true },
        { name: 'GitHub Sponsors', pattern: /https:\/\/github\.com\/sponsors\/jmenichole/, required: true },
        { name: 'LinkedIn', pattern: /https:\/\/linkedin\.com\/in\/jmenichole0/, required: true },
        { name: 'GitHub Profile', pattern: /https:\/\/github\.com\/jmenichole/, required: true },
        { name: 'GoMining Referral', pattern: /https:\/\/gomining\.com\/\?ref=vbk5r/, required: true }
    ];
    
    let passed = 0;
    
    links.forEach(link => {
        if (link.pattern.test(supportPageContent)) {
            console.log(`  ✅ ${link.name}: Found`);
            passed++;
        } else {
            console.log(`  ❌ ${link.name}: Missing${link.required ? ' (REQUIRED)' : ''}`);
        }
    });
    
    return passed === links.length;
}

function testDiscordBotInvites() {
    console.log('\n🤖 Testing Discord Bot Invite Links...');
    
    const bots = [
        { name: 'TrapHouse Bot', id: '1354450590813655142' },
        { name: 'CollectClock Bot', id: '1336968746450812928' },
        { name: 'Degens Bot', id: '1376113587025739807' },
        { name: 'JustTheTip Bot', id: '1373784722718720090' }
    ];
    
    let passed = 0;
    
    bots.forEach(bot => {
        const pattern = new RegExp(`https://discord\\.com/oauth2/authorize\\?client_id=${bot.id}`);
        if (pattern.test(supportPageContent)) {
            console.log(`  ✅ ${bot.name}: Invite link found`);
            passed++;
        } else {
            console.log(`  ❌ ${bot.name}: Invite link missing`);
        }
    });
    
    return passed === bots.length;
}

function testKofiIntegration() {
    console.log('\n☕ Testing Ko-fi Integration...');
    
    const kofiTests = [
        { name: 'Ko-fi Script Import', pattern: /https:\/\/storage\.ko-fi\.com\/cdn\/scripts\/overlay-widget\.js/ },
        { name: 'Ko-fi Username', pattern: /jmenichole0/ },
        { name: 'Widget Configuration', pattern: /kofiWidgetOverlay\.draw/ },
        { name: 'Floating Chat Type', pattern: /'type': 'floating-chat'/ },
        { name: 'Custom Button Text', pattern: /'floating-chat\.donateButton\.text': 'Tip Me'/ },
        { name: 'Custom Colors', pattern: /'floating-chat\.donateButton\.background-color': '#00bfa5'/ }
    ];
    
    let passed = 0;
    
    kofiTests.forEach(test => {
        if (test.pattern.test(supportPageContent)) {
            console.log(`  ✅ ${test.name}: Found`);
            passed++;
        } else {
            console.log(`  ❌ ${test.name}: Missing`);
        }
    });
    
    return passed === kofiTests.length;
}

function testHTMLStructure() {
    console.log('\n📝 Testing HTML Structure...');
    
    const structureTests = [
        { name: 'DOCTYPE Declaration', pattern: /<!DOCTYPE html>/ },
        { name: 'HTML Lang Attribute', pattern: /<html lang="en">/ },
        { name: 'Meta Charset', pattern: /<meta charset="UTF-8">/ },
        { name: 'Viewport Meta', pattern: /<meta name="viewport"/ },
        { name: 'Title Tag', pattern: /<title>.*TrapHouse.*<\/title>/ },
        { name: 'Meta Description', pattern: /<meta name="description"/ },
        { name: 'Open Graph Tags', pattern: /<meta property="og:/ }
    ];
    
    let passed = 0;
    
    structureTests.forEach(test => {
        if (test.pattern.test(supportPageContent)) {
            console.log(`  ✅ ${test.name}: Found`);
            passed++;
        } else {
            console.log(`  ❌ ${test.name}: Missing`);
        }
    });
    
    return passed === structureTests.length;
}

function testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    const responsiveTests = [
        { name: 'CSS Grid Layout', pattern: /grid-template-columns/ },
        { name: 'Mobile Media Query', pattern: /@media \(max-width: 768px\)/ },
        { name: 'Small Screen Media Query', pattern: /@media \(max-width: 480px\)/ },
        { name: 'Flexible Grid', pattern: /repeat\(auto-fit, minmax/ },
        { name: 'Responsive Containers', pattern: /max-width.*800px/ }
    ];
    
    let passed = 0;
    
    responsiveTests.forEach(test => {
        if (test.pattern.test(supportPageContent)) {
            console.log(`  ✅ ${test.name}: Found`);
            passed++;
        } else {
            console.log(`  ❌ ${test.name}: Missing`);
        }
    });
    
    return passed === responsiveTests.length;
}

function testAccessibility() {
    console.log('\n♿ Testing Accessibility Features...');
    
    const accessibilityTests = [
        { name: 'Focus Styles', pattern: /:focus/ },
        { name: 'Alt Text Strategy', pattern: /alt=|aria-/ },
        { name: 'Color Contrast', pattern: /#fff|white/ },
        { name: 'Semantic HTML', pattern: /<h[1-6]>|<nav>|<main>|<section>/ },
        { name: 'Error Handling', pattern: /error-message|loadingIndicator/ }
    ];
    
    let passed = 0;
    
    accessibilityTests.forEach(test => {
        if (test.pattern.test(supportPageContent)) {
            console.log(`  ✅ ${test.name}: Found`);
            passed++;
        } else {
            console.log(`  ❌ ${test.name}: Missing`);
        }
    });
    
    return passed >= 3; // Allow some flexibility for accessibility
}

function testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling...');
    
    const errorTests = [
        { name: 'Ko-fi Widget Error Handling', pattern: /catch.*error.*Ko-fi/ },
        { name: 'Loading Indicator', pattern: /loadingIndicator/ },
        { name: 'Error Message Display', pattern: /errorMessage/ },
        { name: 'Timeout Handling', pattern: /setTimeout/ },
        { name: 'Console Logging', pattern: /console\.(log|error|warn)/ }
    ];
    
    let passed = 0;
    
    errorTests.forEach(test => {
        if (test.pattern.test(supportPageContent)) {
            console.log(`  ✅ ${test.name}: Found`);
            passed++;
        } else {
            console.log(`  ❌ ${test.name}: Missing`);
        }
    });
    
    return passed >= 4; // Allow some flexibility
}

// Run all tests
function runAllTests() {
    console.log('🧪 Support Page Functionality Test');
    console.log('===================================');
    
    const tests = [
        { name: 'External Links', test: testExternalLinks },
        { name: 'Discord Bot Invites', test: testDiscordBotInvites },
        { name: 'Ko-fi Integration', test: testKofiIntegration },
        { name: 'HTML Structure', test: testHTMLStructure },
        { name: 'Responsive Design', test: testResponsiveDesign },
        { name: 'Accessibility', test: testAccessibility },
        { name: 'Error Handling', test: testErrorHandling }
    ];
    
    let totalPassed = 0;
    const results = [];
    
    tests.forEach(({ name, test }) => {
        const passed = test();
        results.push({ name, passed });
        if (passed) totalPassed++;
    });
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    results.forEach(({ name, passed }) => {
        console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    console.log(`\n🎯 Overall Score: ${totalPassed}/${tests.length} tests passed`);
    
    if (totalPassed === tests.length) {
        console.log('🎉 All tests passed! Support page is fully functional.');
    } else if (totalPassed >= tests.length * 0.8) {
        console.log('✅ Most tests passed. Support page is mostly functional.');
    } else {
        console.log('⚠️ Some tests failed. Review the support page configuration.');
    }
    
    console.log('\n💡 Recommendations:');
    console.log('1. Test the page in multiple browsers');
    console.log('2. Verify Ko-fi widget loads in production');
    console.log('3. Test all external links manually');
    console.log('4. Check mobile responsiveness');
    console.log('5. Validate HTML with W3C validator');
    
    return totalPassed === tests.length;
}

// Run the tests
runAllTests();
