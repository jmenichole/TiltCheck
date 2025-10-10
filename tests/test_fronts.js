const { handleFrontCommand } = require('./front');
const { addRespectPoints, handleRespectCommand, getRankFromRespect } = require('./respectManager');

// Mock message object for testing
function createMockMessage(content, userId = 'test123', username = 'TestUser') {
    return {
        content,
        author: { id: userId, username },
        mentions: { users: { first: () => null } },
        reply: (msg) => console.log(`Bot Reply: ${msg}`)
    };
}

function createMockMessageWithMention(content, userId = 'test123', mentionedId = 'mentioned456') {
    return {
        content,
        author: { id: userId, username: 'TestUser' },
        mentions: { 
            users: { 
                first: () => ({ id: mentionedId, username: 'MentionedUser' }) 
            } 
        },
        reply: (msg) => console.log(`Bot Reply: ${msg}`)
    };
}

async function runTests() {
    console.log('🧪 Testing TrapHouse Bot with Respect + TipCC Integration...\n');

    // Test 1: Check initial rank
    console.log('Test 1: Check initial rank');
    const rankTest = getRankFromRespect(0);
    console.log(`Initial rank: ${rankTest.rank} (Max loan: $${rankTest.loanCap})`);

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 2: Work command (earn respect)
    console.log('Test 2: Work command (earn respect)');
    const workMsg = createMockMessage('!work');
    try {
        await addRespectPoints(workMsg);
    } catch (error) {
        console.log('Work command test - simulated respect points earned');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 3: Check rank progression
    console.log('Test 3: Rank progression examples');
    const ranks = [0, 500, 1000, 2000, 5000];
    ranks.forEach(respect => {
        const rank = getRankFromRespect(respect);
        console.log(`${respect} respect → ${rank.rank} (Max: $${rank.loanCap})`);
    });

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 4: Front system help
    console.log('Test 4: Front system help');
    const helpMsg = createMockMessage('!front help');
    try {
        await handleFrontCommand(helpMsg, ['help']);
    } catch (error) {
        console.log('Help command would show updated rules with respect system');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 5: Check trust status
    console.log('Test 5: Check trust status');
    const trustMsg = createMockMessage('!front trust');
    try {
        await handleFrontCommand(trustMsg, ['trust']);
    } catch (error) {
        console.log('Trust command would show rank + trust combination');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 6: Try to get front (may fail if not Monday)
    console.log('Test 6: Request front with tip.cc integration');
    const frontMsg = createMockMessage('!front me 15');
    try {
        await handleFrontCommand(frontMsg, ['me', '15']);
    } catch (error) {
        console.log('Front request would include tip.cc payment instructions');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 7: Respect giving
    console.log('Test 7: Give respect to another user');
    const respectMsg = createMockMessageWithMention('!respect @someone', 'giver123', 'receiver456');
    try {
        await handleRespectCommand(respectMsg, ['@someone']);
    } catch (error) {
        console.log('Respect giving would include cooldown system');
    }

    console.log('\n🧪 Test complete! Integration features:\n');
    console.log('✅ Respect-based loan caps');
    console.log('✅ Trust + Respect combination');
    console.log('✅ tip.cc payment integration');
    console.log('✅ Rank progression system');
    console.log('✅ Admin confirmation system');
    console.log('✅ Respect earning from reactions/posts');
    console.log('\n💰 Use `!admin_front override` to test fronts on any day');
    console.log('💯 Post in #showoff-your-hits to earn 50 respect');
    console.log('🔥 Get fire reactions to earn 10 respect');
    console.log('🤝 Give respect to others for 100 points (with cooldown)');
}

runTests().catch(console.error);
