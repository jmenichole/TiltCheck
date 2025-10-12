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

const fs = require('fs');

console.log('🔍 Checking for syntax errors in main files...');

const filesToCheck = [
    'index.js',
    'package.json',
    '.env',
    'railway.json'
];

filesToCheck.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            if (file.endsWith('.js')) {
                // Check JavaScript syntax
                require(`./${file}`);
                console.log(`✅ ${file} - Syntax OK`);
            } else if (file.endsWith('.json')) {
                // Check JSON syntax
                JSON.parse(fs.readFileSync(file, 'utf8'));
                console.log(`✅ ${file} - Valid JSON`);
            } else {
                console.log(`✅ ${file} - File exists`);
            }
        } else {
            console.log(`❌ ${file} - File not found`);
        }
    } catch (error) {
        console.log(`❌ ${file} - Error: ${error.message}`);
    }
});