// Quick test script to verify bot functionality
const fs = require('fs');

console.log('🧪 TrapHouse Bot Test Suite\n');

// Test 1: Check if all main files exist
const requiredFiles = [
    'index.js',
    'tiltCheckIntegration.js', 
    'justTheTipBot.js',
    'cryptoUtils.js',
    'collectClockIntegration.js',
    'github-webhook-server.js'
];

console.log('📁 File System Test:');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Check package.json dependencies
console.log('\n📦 Dependencies Test:');
try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const criticalDeps = ['discord.js', 'express', 'axios'];
    
    criticalDeps.forEach(dep => {
        const version = pkg.dependencies[dep];
        console.log(`   ${version ? '✅' : '❌'} ${dep}: ${version || 'Missing'}`);
    });
    
    console.log(`\n🎯 Discord.js Version: ${pkg.dependencies['discord.js']}`);
} catch (error) {
    console.log('   ❌ Error reading package.json');
}

// Test 3: Basic syntax check
console.log('\n🔍 Syntax Check:');
const testFiles = ['tiltCheckIntegration.js', 'justTheTipBot.js'];

testFiles.forEach(file => {
    try {
        require(`./` + file);
        console.log(`   ✅ ${file} - No syntax errors`);
    } catch (error) {
        console.log(`   ❌ ${file} - ${error.message.split('\n')[0]}`);
    }
});

console.log('\n🚀 Bot Status: Ready for Discord testing!');
console.log('\n📋 Test these commands in Discord:');
console.log('   !tiltcheck help');
console.log('   !tip help'); 
console.log('   !vault help');
console.log('   !collectclock help');
console.log('   !respect @user +5');
