#!/usr/bin/env node

/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * This script adds copyright headers to all source files in the repository.
 * For licensing information, see LICENSE file in the root directory.
 */

const fs = require('fs');
const path = require('path');

// Copyright header templates
const headers = {
    javascript: `/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

`,
    typescript: `/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

`,
    html: `<!--
  Copyright (c) 2024-2025 JME (jmenichole)
  All Rights Reserved
  
  PROPRIETARY AND CONFIDENTIAL
  Unauthorized copying of this file, via any medium, is strictly prohibited.
  
  This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
  For licensing information, see LICENSE file in the root directory.
-->

`,
    shell: `#!/bin/bash
#
# Copyright (c) 2024-2025 JME (jmenichole)
# All Rights Reserved
# 
# PROPRIETARY AND CONFIDENTIAL
# Unauthorized copying of this file, via any medium, is strictly prohibited.
# 
# This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
# For licensing information, see LICENSE file in the root directory.
#

`
};

// Directories to skip
const skipDirs = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'public/assets',
    'assets',
    'data',
    'analytics'
];

// Files to skip
const skipFiles = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    '.gitignore',
    '.env',
    '.env.example',
    'LICENSE',
    'COPYRIGHT',
    'add-copyright-headers.js'
];

function shouldSkipPath(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Skip if in excluded directory
    for (const dir of skipDirs) {
        if (relativePath.includes(dir)) {
            return true;
        }
    }
    
    // Skip if excluded file
    const basename = path.basename(filePath);
    if (skipFiles.includes(basename)) {
        return true;
    }
    
    return false;
}

function hasExistingCopyright(content) {
    const copyrightPatterns = [
        /Copyright.*jmenichole/i,
        /All Rights Reserved/i,
        /PROPRIETARY AND CONFIDENTIAL/i
    ];
    
    // Check first 500 characters for existing copyright
    const firstChars = content.substring(0, 500);
    return copyrightPatterns.some(pattern => pattern.test(firstChars));
}

function addCopyrightHeader(filePath) {
    if (shouldSkipPath(filePath)) {
        return { skipped: true, reason: 'excluded path' };
    }
    
    const ext = path.extname(filePath);
    let headerType = null;
    
    // Determine header type based on file extension
    if (['.js', '.cjs', '.mjs'].includes(ext)) {
        headerType = 'javascript';
    } else if (['.ts', '.tsx'].includes(ext)) {
        headerType = 'typescript';
    } else if (['.html', '.htm'].includes(ext)) {
        headerType = 'html';
    } else if (['.sh'].includes(ext)) {
        headerType = 'shell';
    } else {
        return { skipped: true, reason: 'unsupported file type' };
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already has copyright
        if (hasExistingCopyright(content)) {
            return { skipped: true, reason: 'already has copyright' };
        }
        
        let header = headers[headerType];
        let newContent;
        
        if (headerType === 'shell') {
            // For shell scripts, handle shebang
            if (content.startsWith('#!/')) {
                const lines = content.split('\n');
                const shebang = lines[0];
                const rest = lines.slice(1).join('\n');
                // Remove the shebang from header since file already has one
                const headerWithoutShebang = header.replace(/^#!\/bin\/bash\n/, '');
                newContent = shebang + '\n' + headerWithoutShebang + rest;
            } else {
                newContent = header + content;
            }
        } else {
            newContent = header + content;
        }
        
        fs.writeFileSync(filePath, newContent, 'utf8');
        return { success: true };
    } catch (error) {
        return { error: error.message };
    }
}

function processDirectory(dirPath, stats = { processed: 0, skipped: 0, errors: 0 }) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
            if (!shouldSkipPath(fullPath)) {
                processDirectory(fullPath, stats);
            }
        } else if (item.isFile()) {
            const result = addCopyrightHeader(fullPath);
            
            if (result.success) {
                stats.processed++;
                console.log(`✓ Added copyright to: ${path.relative(process.cwd(), fullPath)}`);
            } else if (result.skipped) {
                stats.skipped++;
                if (process.env.VERBOSE) {
                    console.log(`- Skipped (${result.reason}): ${path.relative(process.cwd(), fullPath)}`);
                }
            } else if (result.error) {
                stats.errors++;
                console.error(`✗ Error processing ${path.relative(process.cwd(), fullPath)}: ${result.error}`);
            }
        }
    }
    
    return stats;
}

// Main execution
console.log('Adding copyright headers to source files...\n');

const rootDir = process.cwd();
const stats = processDirectory(rootDir);

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log(`  Files processed: ${stats.processed}`);
console.log(`  Files skipped: ${stats.skipped}`);
console.log(`  Errors: ${stats.errors}`);
console.log('='.repeat(60));

if (stats.errors > 0) {
    process.exit(1);
}
