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

// Quick debug for Solana wallet validation

const address = 'TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E';

console.log('Debugging Solana wallet validation:');
console.log(`Address: ${address}`);
console.log(`Length: ${address.length}`);
console.log(`Length check (32-44): ${address.length >= 32 && address.length <= 44}`);
console.log(`Base58 regex test: ${/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)}`);

// Check what characters are causing issues
const invalidChars = address.split('').filter(char => !/[1-9A-HJ-NP-Za-km-z]/.test(char));
console.log(`Invalid characters: ${invalidChars.length > 0 ? invalidChars.join(', ') : 'None'}`);

// Fixed validation
function isValidSolanaAddress(address) {
    if (!address) return false;
    // Solana addresses are 32-44 chars and base58 encoded (but 0, O, I, l are excluded from base58)
    return address.length >= 32 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address);
}

console.log(`Fixed validation result: ${isValidSolanaAddress(address)}`);
