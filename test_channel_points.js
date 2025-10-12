/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

#!/usr/bin/env node

// Test script for channel-specific point system
const { RESPECT_VALUES } = require('./respectManager');

console.log('🏠 TrapHouse Bot - Channel Point System Test');
console.log('==============================================');
console.log('');

console.log('📊 Point Values Configuration:');
console.log(`#showoff-your-hits: ${RESPECT_VALUES.SHOWOFF_POST} points`);
console.log(`#busted-and-disgusted: ${RESPECT_VALUES.BUSTED_POST} points`);
console.log(`🔥 Fire reactions: ${RESPECT_VALUES.FIRE_REACTION} points`);
console.log(`!work command: ${RESPECT_VALUES.WORK_COMMAND} points`);
console.log(`!respect @user: ${RESPECT_VALUES.RESPECT_GIVEN} points`);
console.log('');

console.log('✅ Point Differences:');
const difference = RESPECT_VALUES.BUSTED_POST - RESPECT_VALUES.SHOWOFF_POST;
const percentage = ((difference / RESPECT_VALUES.SHOWOFF_POST) * 100).toFixed(1);
console.log(`#busted-and-disgusted awards ${difference} more points than #showoff-your-hits`);
console.log(`That's a ${percentage}% bonus for posting in #busted-and-disgusted!`);
console.log('');

console.log('🎯 Channel Strategy:');
console.log('• #showoff-your-hits: For regular wins and good plays (+50)');
console.log('• #busted-and-disgusted: For losses, bad beats, learning moments (+75)');
console.log('');
console.log('💡 Why busted-and-disgusted gets more points:');
console.log('  - Encourages transparency about losses');
console.log('  - Rewards learning from mistakes');
console.log('  - Builds community trust through honesty');
console.log('  - Supports gambling accountability');
console.log('');

console.log('✅ Configuration loaded successfully!');
console.log('✅ Bot should now award different points based on channel');
console.log('');
console.log('🔧 Test Commands:');
console.log('1. Post a message in #showoff-your-hits → Should get +50 points');
console.log('2. Post a message in #busted-and-disgusted → Should get +75 points');
console.log('3. Use !help to see updated point information');
