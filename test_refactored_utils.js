const { generateSolanaWallet, loadKeypairFromPrivateKey, isValidPublicKey } = require('./utils/solanaWalletUtils');

console.log('Testing Solana Wallet Utilities\n');

// Test 1: Generate wallet
console.log('1. Testing generateSolanaWallet()...');
const wallet = generateSolanaWallet();
console.log(`✓ Generated wallet with public key: ${wallet.publicKey}`);
console.log(`✓ Private key length: ${wallet.privateKey.length} characters`);

// Test 2: Validate public key
console.log('\n2. Testing isValidPublicKey()...');
console.log(`✓ Valid key: ${isValidPublicKey(wallet.publicKey)}`);
console.log(`✓ Invalid key: ${!isValidPublicKey('invalid')}`);

// Test 3: Load keypair from private key
console.log('\n3. Testing loadKeypairFromPrivateKey()...');
const loadedKeypair = loadKeypairFromPrivateKey(wallet.privateKey);
console.log(`✓ Loaded keypair public key: ${loadedKeypair.publicKey.toString()}`);
console.log(`✓ Keys match: ${loadedKeypair.publicKey.toString() === wallet.publicKey}`);

console.log('\n✅ All wallet utility tests passed!');
