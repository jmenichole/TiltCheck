/**
 * TILT PROTECTION DIAGNOSTIC TOOL
 * Run this to diagnose why $mytilt isn't working in Discord
 */

const { EmbedBuilder } = require('discord.js');

async function runDiagnostics() {
    console.log('🔍 RUNNING TILT PROTECTION DIAGNOSTICS');
    console.log('=' .repeat(50));

    let allPassed = true;

    // Test 1: Module Loading
    console.log('\n1️⃣ Testing PersonalizedTiltProtection module...');
    try {
        const PersonalizedTiltProtection = require('./personalizedTiltProtection');
        const protection = new PersonalizedTiltProtection();
        console.log('   ✅ Module loads and instantiates correctly');
    } catch (error) {
        console.log('   ❌ Module loading failed:', error.message);
        allPassed = false;
    }

    // Test 2: Discord.js Integration
    console.log('\n2️⃣ Testing Discord.js integration...');
    try {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Test Embed')
            .setDescription('This is a test');
        console.log('   ✅ EmbedBuilder works correctly');
    } catch (error) {
        console.log('   ❌ Discord.js integration failed:', error.message);
        allPassed = false;
    }

    // Test 3: Main Bot Integration
    console.log('\n3️⃣ Testing main bot integration...');
    try {
        const fs = require('fs');
        const indexContent = fs.readFileSync('./index.js', 'utf8');
        
        if (indexContent.includes('handlePersonalizedTiltCommand')) {
            console.log('   ✅ Command handler function exists');
        } else {
            console.log('   ❌ Command handler function missing');
            allPassed = false;
        }

        if (indexContent.includes('$mytilt')) {
            console.log('   ✅ Command routing exists');
        } else {
            console.log('   ❌ Command routing missing');
            allPassed = false;
        }
    } catch (error) {
        console.log('   ❌ Failed to check main bot file:', error.message);
        allPassed = false;
    }

    // Test 4: Function Simulation
    console.log('\n4️⃣ Testing function execution...');
    try {
        const PersonalizedTiltProtection = require('./personalizedTiltProtection');
        const protection = new PersonalizedTiltProtection();
        
        // Test the pattern analysis
        const patterns = ['upwardsTilt', 'betEscalation'];
        const riskLevel = protection.calculateOverallRisk(patterns);
        console.log('   ✅ Function execution works');
        console.log(`   📊 Risk calculation result: ${riskLevel}`);
    } catch (error) {
        console.log('   ❌ Function execution failed:', error.message);
        allPassed = false;
    }

    console.log('\n' + '=' .repeat(50));
    
    if (allPassed) {
        console.log('✅ ALL DIAGNOSTICS PASSED!');
        console.log('\n🎯 The tilt protection system is working correctly.');
        console.log('\n💡 If $mytilt still doesn\'t work in Discord, the issue is likely:');
        console.log('   1. Bot is not online/running');
        console.log('   2. You\'re using wrong command format (!mytilt vs $mytilt)');
        console.log('   3. Bot lacks permissions in your Discord channel');
        console.log('   4. You need to restart the bot to load new changes');
        
        console.log('\n🔧 IMMEDIATE STEPS TO TRY:');
        console.log('   1. Restart your bot: ctrl+c then node index.js');
        console.log('   2. In Discord, type exactly: $mytilt');
        console.log('   3. If no response, try: $help or $enhanced first');
        console.log('   4. Try in a DM with the bot');
        
    } else {
        console.log('❌ SOME DIAGNOSTICS FAILED!');
        console.log('\nPlease fix the failing tests above before trying $mytilt in Discord.');
    }

    console.log('\n📋 QUICK REFERENCE:');
    console.log('   $mytilt           - Show help');
    console.log('   $mytilt setup     - Create your profile');
    console.log('   $mytilt emergency - Emergency protection');
    console.log('   $mytilt patterns  - View your tilt patterns');
    console.log('   $mytilt analyze   - Stake Originals explanation');
}

runDiagnostics();
