# 🎫 BetCollective Support System - Complete Setup

## 📋 System Overview

The BetCollective Support System has been successfully created with the following features:

### 👨‍💻 Main Developer Configuration
- **Main Developer**: @jmenichole
- **Auto-ping on tickets**: ✅ Enabled
- **Admin permissions**: Full support management

### 💰 Wallet Configuration (Updated)
- **Primary Receiving Wallet**: `8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z`
  - This is now the main receiving address (funds moved from tip.cc)
  - Updated in .env file: `SOLANA_SOL_RECEIVING_ADDRESS` and `SOLANA_USDC_RECEIVING_ADDRESS`
- **Phantom Wallet**: `6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB`
  - User withdrawal destination
- **Transfer Transaction**: `TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E`
  - Documented transaction of funds movement from tip.cc

## 🎯 Features Implemented

### 1. Automatic Support Infrastructure
- **Support Category**: `🎫 SUPPORT SYSTEM`
- **Ticket Creation Channel**: `#create-ticket`
- **Ticket Logs**: `#ticket-logs` (staff only)
- **Automatic channel creation** for each ticket

### 2. Ticket Categories
- 💰 **Payment Issues** - For deposit/withdrawal problems
- 🔧 **Technical Support** - Bot and system issues
- ₿ **Crypto Support** - Cryptocurrency help
- 🎲 **Betting Questions** - Gaming and betting queries
- 🐛 **Bug Report** - Bug reports and issues
- ❓ **General Help** - Other questions

### 3. Priority System
- **High Priority** - Urgent issues (1 hour response)
- **Normal Priority** - Standard issues (4 hour response)
- **Low Priority** - Non-urgent (24 hour response)

### 4. Developer Ping System
- **Automatic ping** for @jmenichole on new tickets
- **Manual ping command**: `$pingdev <reason>`
- **Priority-based alerts** with color coding

### 5. Discord Commands
- `$support` - Display support information
- `$walletinfo` - Show wallet addresses and info
- `$pingdev <reason>` - Contact main developer
- `$supportstats` - View ticket statistics (admin only)

## 📁 Files Created/Updated

### New Files:
1. **`supportSystem.js`** - Main support system class
2. **`supportIntegration.js`** - Discord bot integration
3. **`testSupportSystem.js`** - Testing and verification
4. **This README file** - Documentation

### Updated Files:
1. **`.env`** - Updated wallet addresses and support config
2. **`index.js`** - Added support system integration
3. **`link_crypto_tipcc_phantom.js`** - Updated with transfer instructions

## 🚀 Deployment Instructions

### 1. Bot Permissions Required
When adding the bot to BetCollective server, ensure these permissions:
- ✅ **Manage Channels** - Create ticket channels
- ✅ **Manage Messages** - Pin messages, manage tickets
- ✅ **Send Messages** - Basic functionality
- ✅ **Embed Links** - Rich message formatting
- ✅ **Read Message History** - Access previous messages
- ✅ **Add Reactions** - Interactive elements
- ✅ **Use Slash Commands** - Modern Discord commands

### 2. Automatic Setup
When the bot starts, it will automatically:
1. Create the support category and channels
2. Set up proper permissions
3. Send the support interface with buttons
4. Initialize the ticket system

### 3. Manual Commands to Test
```bash
# Test the support system
$support

# Show wallet information
$walletinfo

# Ping the developer
$pingdev Testing the new support system

# View statistics (admin only)
$supportstats
```

## 🎫 How the Ticket System Works

### For Users:
1. Click "🎫 Create Support Ticket" button in #create-ticket
2. Select a category (Payment, Technical, Crypto, etc.)
3. Fill out the modal with title, description, priority
4. Private ticket channel is created automatically
5. @jmenichole is pinged for assistance

### For @jmenichole:
1. Receive automatic ping when tickets are created
2. Claim tickets using the "🙋‍♂️ Claim Ticket" button
3. Change priority with "⚡ Change Priority" button
4. Close tickets with "🔒 Close Ticket" button
5. View all ticket logs in #ticket-logs

## 💰 Wallet Information Display

The system automatically shows users:
- **Primary Deposit Address**: `8WpJPzTKFU6TRmVqUUd4R8qw1Pa4ZdnqepFzx7Yd3f6Z`
- **Withdrawal Destination**: `6VP8eBikxrkK7rfNgsUqZWwGAb31XymBdPjrhRwbAoCB`
- **Recent Transfer**: Reference to tip.cc fund movement
- **Supported Networks**: Solana (SOL, USDC)

## 🔧 Customization Options

### Adding More Support Staff:
Edit `supportSystem.js` line 15:
```javascript
supportTeam: ['jmenichole', 'newstaffuser', 'anotherstaffuser'],
```

### Adding New Ticket Categories:
Edit `supportSystem.js` lines 25-32:
```javascript
{ id: 'newcategory', name: '🔥 New Category', emoji: '🔥' },
```

### Changing Response Times:
Edit the response time text in `supportSystem.js` around line 40.

## ✅ System Status

- **Support System**: ✅ Ready
- **Developer Pinging**: ✅ Configured for @jmenichole
- **Wallet Integration**: ✅ Updated with correct addresses
- **Ticket Categories**: ✅ 6 categories ready
- **Discord Commands**: ✅ 4 commands available
- **Auto-infrastructure**: ✅ Channels created automatically

## 🚀 Next Steps

1. **Start your Discord bot** with `node index.js`
2. **Add bot to BetCollective server** with proper permissions
3. **Test the support system** using the commands above
4. **Verify @jmenichole pinging** works correctly
5. **Train support staff** on the ticket system

The BetCollective Support System is now fully configured and ready for deployment! 🎉
