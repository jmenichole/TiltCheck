/**
 * TROUBLESHOOTING GUIDE FOR $MYTILT COMMAND
 */

console.log('🔧 TILT PROTECTION TROUBLESHOOTING GUIDE');
console.log('=' .repeat(50));

console.log('\n1️⃣ VERIFY CORRECT COMMAND FORMAT:');
console.log('   ✅ Correct: $mytilt setup');
console.log('   ✅ Correct: $mytilt emergency');  
console.log('   ✅ Correct: $mytilt patterns');
console.log('   ❌ Wrong: !mytilt setup');
console.log('   ❌ Wrong: mytilt setup');

console.log('\n2️⃣ STEPS TO DIAGNOSE THE ISSUE:');
console.log('   Step 1: Make sure your Discord bot is online');
console.log('   Step 2: Try a simple command first like: $help');
console.log('   Step 3: Check if other $ commands work (like $enhanced)');
console.log('   Step 4: Try in a DM with the bot');

console.log('\n3️⃣ COMMON ISSUES:');
console.log('   • Bot is offline/not running');
console.log('   • Wrong command prefix (! vs $)');
console.log('   • Bot lacks permissions in that channel');
console.log('   • Typo in command name');

console.log('\n4️⃣ QUICK TEST COMMANDS:');
console.log('   Try these in order:');
console.log('   1. $help          (basic bot response)');
console.log('   2. $enhanced      (enhanced systems)');
console.log('   3. $mytilt        (shows tilt help)');
console.log('   4. $mytilt setup  (creates your profile)');

console.log('\n5️⃣ IF NOTHING WORKS:');
console.log('   • Check bot console for errors');
console.log('   • Restart the bot with: node index.js');
console.log('   • Verify .env file has correct Discord token');

console.log('\n💡 The system is ready - just need to make sure Discord connection works!');
