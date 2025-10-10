# Discord Server IDs & Crypto Addresses Setup Guide

## 🤖 How to Get Discord Server IDs

### Step 1: Enable Developer Mode
1. Open Discord
2. Go to Settings (gear icon)
3. Navigate to Advanced
4. Enable "Developer Mode"

### Step 2: Get Server ID
1. Right-click on your server name
2. Select "Copy Server ID"
3. Paste this as `DISCORD_GUILD_ID`

### Step 3: Get Channel IDs
1. Right-click on any channel
2. Select "Copy Channel ID"
3. Use for respective channel variables:
   - `PAYMENT_CHANNEL_ID` - Where payment notifications go
   - `LOG_CHANNEL_ID` - Where bot logs go
   - `GENERAL_CHANNEL_ID` - Main chat channel
   - `CRYPTO_TIPS_CHANNEL_ID` - Where crypto tips are posted

### Step 4: Get Role IDs
1. Right-click on a role in member list or role settings
2. Select "Copy Role ID"
3. Use for:
   - `ADMIN_ROLE_ID` - Your admin role
   - `MODERATOR_ROLE_ID` - Your moderator role

## 💰 Crypto Receiving Addresses Setup

### Recommended Wallet Setup
For maximum security and compatibility, consider using:

#### Multi-Chain Wallets:
- **MetaMask** - For Ethereum, Polygon, BSC, Avalanche, Arbitrum
- **Phantom** - For Solana
- **TronLink** - For Tron

#### Exchange Addresses (Alternative):
- Coinbase, Binance, Kraken deposit addresses
- ⚠️ Make sure exchange supports the specific token on that network

### Address Format Examples:

#### Ethereum-Compatible Networks (ETH, Polygon, BSC, Avalanche, Arbitrum):
```
Format: 0x1234567890123456789012345678901234567890
Length: 42 characters starting with 0x
```

#### Solana:
```
Format: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Length: 32-44 characters (base58)
```

#### Tron:
```
Format: TLEcanB7dL7RrTtySxSYPJJnBFc6Tz1dF
Length: 34 characters starting with T
```

## 🔧 Configuration Template

Copy and paste this into your `.env` file, replacing the placeholder values:

```properties
# Discord Server Configuration
DISCORD_GUILD_ID=123456789012345678
ADMIN_ROLE_ID=123456789012345678
MODERATOR_ROLE_ID=123456789012345678
PAYMENT_CHANNEL_ID=123456789012345678
LOG_CHANNEL_ID=123456789012345678
GENERAL_CHANNEL_ID=123456789012345678
CRYPTO_TIPS_CHANNEL_ID=123456789012345678
NOTIFICATIONS_CHANNEL_ID=123456789012345678

# Ethereum Network
ETH_RECEIVING_ADDRESS=0x1234567890123456789012345678901234567890
USDC_ETH_RECEIVING_ADDRESS=0x1234567890123456789012345678901234567890
USDT_ETH_RECEIVING_ADDRESS=0x1234567890123456789012345678901234567890

# Polygon Network
POLYGON_RECEIVING_ADDRESS=0x1234567890123456789012345678901234567890
USDC_POLYGON_RECEIVING_ADDRESS=0x1234567890123456789012345678901234567890
USDT_POLYGON_RECEIVING_ADDRESS=0x1234567890123456789012345678901234567890

# Add more networks as needed...
```

## 🚨 Security Best Practices

### For Discord:
- Only give admin roles to trusted users
- Use dedicated channels for bot operations
- Monitor logs channel regularly

### For Crypto:
- **Never share private keys** - Only use receiving addresses
- **Test with small amounts** first
- **Use hardware wallets** for large amounts
- **Verify addresses** before configuring
- **Keep backups** of your wallet seeds

### For Production:
- Use different addresses for testing vs production
- Monitor incoming transactions
- Set up alerts for large deposits
- Keep transaction records

## 🧪 Testing Configuration

After setup, test with:
```bash
node setup_config.js
```

This will show you which configurations are set up correctly.

## 🔄 Regular Maintenance

1. **Weekly**: Check transaction logs
2. **Monthly**: Verify all addresses still work
3. **Quarterly**: Update any changed IDs or addresses
4. **As needed**: Add new channels/roles to configuration
