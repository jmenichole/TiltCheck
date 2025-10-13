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

require('dotenv').config();

console.log('🚂 Railway Startup Script');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 3000);
console.log('Bot Type:', process.env.CURRENT_BOT || 'TRAPHOUSE');

// Start the main application
try {
    require('./index.js');
} catch (error) {
    console.error('❌ Failed to start main application:', error);
    process.exit(1);
}