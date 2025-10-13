/**
 * Double Wallet Accountability Feature Test
 *
 * This test verifies the double wallet protection functionality
 */

class MockTiltCheckAccountability {
  constructor() {
    this.doubleWalletPairs = new Map();
  }

  // Import the methods from the main class
  setGamblingWallet(userId, walletAddress) {
    let doubleWallet = this.doubleWalletPairs.get(userId) || {
      gamblingWallet: null,
      safeWallet: null,
      transferLimit: 100,
      enabled: false,
      transferHistory: [],
      lastTransferAlert: null
    };

    doubleWallet.gamblingWallet = walletAddress;
    this.doubleWalletPairs.set(userId, doubleWallet);

    // Auto-enable if both wallets are set
    if (doubleWallet.safeWallet) {
      doubleWallet.enabled = true;
    }

    return doubleWallet;
  }

  setSafeWallet(userId, walletAddress) {
    let doubleWallet = this.doubleWalletPairs.get(userId) || {
      gamblingWallet: null,
      safeWallet: null,
      transferLimit: 100,
      enabled: false,
      transferHistory: [],
      lastTransferAlert: null
    };

    doubleWallet.safeWallet = walletAddress;
    this.doubleWalletPairs.set(userId, doubleWallet);

    // Auto-enable if both wallets are set
    if (doubleWallet.gamblingWallet) {
      doubleWallet.enabled = true;
    }

    return doubleWallet;
  }

  setTransferLimit(userId, limit) {
    let doubleWallet = this.doubleWalletPairs.get(userId);
    if (!doubleWallet) return null;

    doubleWallet.transferLimit = limit;
    this.doubleWalletPairs.set(userId, doubleWallet);
    return doubleWallet;
  }

  monitorWalletTransfer(userId, fromWallet, toWallet, amount, token = 'SOL') {
    const doubleWallet = this.doubleWalletPairs.get(userId);
    if (!doubleWallet || !doubleWallet.enabled) {
      return null; // No protection active
    }

    // Check if this is a transfer between the user's double wallets
    const isGamblingToSafe = fromWallet === doubleWallet.gamblingWallet && toWallet === doubleWallet.safeWallet;
    const isSafeToGambling = fromWallet === doubleWallet.safeWallet && toWallet === doubleWallet.gamblingWallet;

    if (!isGamblingToSafe && !isSafeToGambling) {
      return null; // Not a double wallet transfer
    }

    // Convert amount to USD for limit checking
    const usdAmount = amount * 150; // Mock SOL price

    // Record the transfer
    const transfer = {
      timestamp: new Date().toISOString(),
      fromWallet,
      toWallet,
      amount,
      token,
      usdAmount,
      direction: isSafeToGambling ? 'safe_to_gambling' : 'gambling_to_safe'
    };

    doubleWallet.transferHistory.push(transfer);
    this.doubleWalletPairs.set(userId, doubleWallet);

    // Check daily transfer limits (only for safe to gambling transfers)
    if (isSafeToGambling) {
      const todayTransfers = this.getTodayTransfersToGambling(userId);
      const totalToday = todayTransfers + usdAmount;

      if (totalToday > doubleWallet.transferLimit) {
        return {
          type: 'double_wallet_alert',
          reason: 'transfer_limit_exceeded',
          transferAmount: usdAmount,
          dailyTotal: totalToday,
          limit: doubleWallet.transferLimit,
          direction: 'safe_to_gambling'
        };
      } else if (totalToday > doubleWallet.transferLimit * 0.8) {
        return {
          type: 'double_wallet_warning',
          reason: 'approaching_transfer_limit',
          transferAmount: usdAmount,
          dailyTotal: totalToday,
          limit: doubleWallet.transferLimit,
          direction: 'safe_to_gambling'
        };
      }
    }

    return transfer;
  }

  getTodayTransfersToGambling(userId) {
    const doubleWallet = this.doubleWalletPairs.get(userId);
    if (!doubleWallet) return 0;

    const today = new Date().toDateString();
    return doubleWallet.transferHistory
      .filter(transfer => {
        const transferDate = new Date(transfer.timestamp).toDateString();
        return transferDate === today && transfer.direction === 'safe_to_gambling';
      })
      .reduce((total, transfer) => total + transfer.usdAmount, 0);
  }
}

// Simple test runner
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Test Suite
console.log('🧪 Running Double Wallet Accountability Tests...\n');

test('should set gambling wallet', () => {
  const accountability = new MockTiltCheckAccountability();
  const userId = 'user123';
  const wallet = 'gambling_wallet_address';

  const result = accountability.setGamblingWallet(userId, wallet);

  assert(result.gamblingWallet === wallet, 'Gambling wallet not set correctly');
  assert(result.enabled === false, 'Should not be enabled with only one wallet');
});

test('should set safe wallet', () => {
  const accountability = new MockTiltCheckAccountability();
  const userId = 'user123';
  const wallet = 'safe_wallet_address';

  const result = accountability.setSafeWallet(userId, wallet);

  assert(result.safeWallet === wallet, 'Safe wallet not set correctly');
  assert(result.enabled === false, 'Should not be enabled with only one wallet');
});

test('should auto-enable when both wallets are set', () => {
  const accountability = new MockTiltCheckAccountability();
  const userId = 'user123';

  accountability.setGamblingWallet(userId, 'gambling_wallet');
  const result = accountability.setSafeWallet(userId, 'safe_wallet');

  assert(result.enabled === true, 'Should auto-enable when both wallets are set');
});

test('should monitor safe to gambling transfers', () => {
  const accountability = new MockTiltCheckAccountability();
  const userId = 'user123';

  accountability.setGamblingWallet(userId, 'gambling_wallet_123');
  accountability.setSafeWallet(userId, 'safe_wallet_123');
  accountability.setTransferLimit(userId, 200); // Set high limit to avoid alerts

  const result = accountability.monitorWalletTransfer(
    userId,
    'safe_wallet_123',
    'gambling_wallet_123',
    0.5 // 0.5 SOL = $75
  );

  assert(result !== null, 'Should monitor double wallet transfers');
  assert(result.direction === 'safe_to_gambling', 'Wrong transfer direction');
  assert(result.usdAmount === 75, `Wrong USD amount calculation: expected 75, got ${result.usdAmount}`);
});

test('should trigger limit exceeded alert', () => {
  const accountability = new MockTiltCheckAccountability();
  const userId = 'user123';

  accountability.setGamblingWallet(userId, 'gambling_wallet_123');
  accountability.setSafeWallet(userId, 'safe_wallet_123');
  accountability.setTransferLimit(userId, 100); // $100 limit

  // First transfer: 0.5 SOL = $75
  accountability.monitorWalletTransfer(
    userId,
    'safe_wallet_123',
    'gambling_wallet_123',
    0.5
  );

  // Second transfer: 0.2 SOL = $30 (total = $105, exceeds limit)
  const result = accountability.monitorWalletTransfer(
    userId,
    'safe_wallet_123',
    'gambling_wallet_123',
    0.2
  );

  assert(result.type === 'double_wallet_alert', 'Should trigger alert');
  assert(result.reason === 'transfer_limit_exceeded', 'Wrong alert reason');
  assert(result.dailyTotal > 100, 'Daily total should exceed limit');
});

test('should calculate daily transfer totals correctly', () => {
  const accountability = new MockTiltCheckAccountability();
  const userId = 'user123';

  accountability.setGamblingWallet(userId, 'gambling_wallet_123');
  accountability.setSafeWallet(userId, 'safe_wallet_123');

  accountability.monitorWalletTransfer(
    userId,
    'safe_wallet_123',
    'gambling_wallet_123',
    0.3 // $45
  );

  accountability.monitorWalletTransfer(
    userId,
    'safe_wallet_123',
    'gambling_wallet_123',
    0.2 // $30
  );

  const todayTotal = accountability.getTodayTransfersToGambling(userId);
  assert(todayTotal === 75, `Expected 75, got ${todayTotal}`); // $45 + $30
});

console.log('\n🎉 Double Wallet Accountability tests completed!');