/**
 * Test script for Personalized Tilt Protection
 * Run this to verify the system works independently
 */

const PersonalizedTiltProtection = require('./personalizedTiltProtection');

// Mock Discord message object for testing
const mockMessage = {
    author: { id: 'test-user-123' },
    reply: async (content) => {
        console.log('\n📩 Bot Response:');
        if (content.embeds) {
            const embed = content.embeds[0];
            console.log(`🎯 Title: ${embed.title}`);
            console.log(`📝 Description: ${embed.description}`);
            if (embed.fields) {
                embed.fields.forEach(field => {
                    console.log(`\n🔹 ${field.name}:`);
                    console.log(`   ${field.value}`);
                });
            }
        } else {
            console.log(content);
        }
        console.log('\n' + '='.repeat(60));
    }
};

async function testPersonalizedTiltProtection() {
    console.log('🧪 TESTING PERSONALIZED TILT PROTECTION SYSTEM');
    console.log('='.repeat(60));
    
    const protection = new PersonalizedTiltProtection();
    
    try {
        console.log('\n1️⃣ Testing Profile Creation...');
        const userPatterns = [
            'upwardsTilt',
            'betEscalation', 
            'gameHopping',
            'ignoredWarnings',
            'frozenFundFrustration'
        ];
        
        await protection.createPersonalizedProfile(mockMessage, userPatterns);
        
        console.log('\n2️⃣ Testing Stake Originals Analysis...');
        await protection.analyzeStakeOriginalsPerception(mockMessage);
        
        console.log('\n3️⃣ Testing Upwards Tilt Detection...');
        const mockWin = { multiplier: 500 }; // 500x win
        const upwardsTiltAlert = await protection.checkForUpwardsTilt(
            'test-user-123', 
            {}, 
            mockWin
        );
        
        if (upwardsTiltAlert) {
            console.log('\n🚨 UPWARDS TILT ALERT TRIGGERED:');
            console.log(`Type: ${upwardsTiltAlert.type}`);
            console.log(`Message: ${upwardsTiltAlert.message}`);
            console.log(`Description: ${upwardsTiltAlert.description}`);
            console.log('\nInterventions:');
            upwardsTiltAlert.interventions.forEach(intervention => {
                console.log(`• ${intervention}`);
            });
        }
        
        console.log('\n4️⃣ Testing Bet Escalation Detection...');
        const mockSession = {
            bets: [
                { amount: 100 },
                { amount: 200 },
                { amount: 300 },
                { amount: 500 }
            ]
        };
        
        const escalationAlert = await protection.checkBetEscalation(
            'test-user-123',
            mockSession,
            { amount: 500 }
        );
        
        if (escalationAlert) {
            console.log('\n🚨 BET ESCALATION ALERT TRIGGERED:');
            console.log(`Type: ${escalationAlert.type}`);
            console.log(`Message: ${escalationAlert.message}`);
            console.log(`Description: ${escalationAlert.description}`);
        }
        
        console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!');
        console.log('\n💡 If this test worked but $mytilt doesn\'t work in Discord:');
        console.log('   1. Make sure your Discord bot is online');
        console.log('   2. Check you\'re typing: $mytilt setup (not !mytilt)');
        console.log('   3. Verify the bot has permission to respond in that channel');
        console.log('   4. Try in a DM with the bot first');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testPersonalizedTiltProtection();
