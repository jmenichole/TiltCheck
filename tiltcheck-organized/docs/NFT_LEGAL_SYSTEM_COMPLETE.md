# 🔗 TiltCheck NFT Legal Agreement System

## Overview

The TiltCheck ecosystem now includes **NFT-verified legal agreements** that mint blockchain-verifiable tokens whenever users sign up for any service in the ecosystem. This creates an immutable audit trail of all legal agreements and Terms of Service acceptances.

## 🎯 Key Features

### NFT Legal Agreement Minting
- **Endpoint**: `POST https://tiltcheck.it.com/nftmint`
- **Purpose**: Mint verifiable NFT for every legal agreement acceptance
- **Triggers**: Discord linking, account creation, TOS acceptance, cookie agreements

### SusLink Landing Page
- **URL**: `https://tiltcheckecosystem.created.app/suslink`
- **Purpose**: Safe navigation hub for ecosystem apps
- **Integration**: Links to all ecosystem services with agreement tracking

## 📡 API Endpoints

### 1. NFT Minting (Legal Agreements)
```bash
POST https://tiltcheck.it.com/nftmint
Content-Type: application/json

{
  "userId": "user_discord_id",
  "discordId": "123456789",
  "agreementType": "Terms of Service",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "title": "Legal Agreement NFT Minted",
  "nftMetadata": {
    "tokenId": "uuid-generated",
    "name": "TiltCheck Legal Agreement NFT #12345678",
    "description": "Verifiable legal agreement for Terms of Service",
    "attributes": [
      {"trait_type": "Agreement Type", "value": "Terms of Service"},
      {"trait_type": "User ID", "value": "user_discord_id"},
      {"trait_type": "Blockchain Verified", "value": "true"}
    ]
  },
  "agreementRecord": {
    "tokenId": "uuid",
    "mintedAt": "2024-08-01T12:00:00Z",
    "verificationUrl": "https://tiltcheck.it.com/verify-agreement/uuid",
    "legalStatus": "Binding and Blockchain Verified"
  }
}
```

### 2. Agreement Verification
```bash
GET https://tiltcheck.it.com/verify-agreement/{tokenId}
```

### 3. NFT Metadata
```bash
GET https://tiltcheck.it.com/nft-metadata/{tokenId}
```

### 4. SusLink Hub
```bash
GET https://tiltcheck.it.com/suslink
```

## 🔄 Integration Flow

### When Users Sign Up Anywhere in Ecosystem:

1. **User Action**: Links Discord, accepts TOS, signs up for service
2. **Automatic Trigger**: System calls NFT minting endpoint
3. **NFT Creation**: Unique legal agreement NFT is minted
4. **Verification**: User receives verifiable blockchain proof
5. **Audit Trail**: Immutable record of legal acceptance

### Agreement Types That Trigger NFT Minting:
- Terms of Service acceptance
- Privacy Policy agreement  
- Cookie consent
- Discord account linking
- First-time app access
- Payment processing consent
- Data collection agreements

## 🌐 Ecosystem Integration Points

### Discord Bot Integration
```javascript
// When user links Discord account
const mintNFT = async (userId, discordId) => {
  const response = await fetch('https://tiltcheck.it.com/nftmint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userId,
      discordId,
      agreementType: 'Discord Account Linking',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
  });
  
  const nftData = await response.json();
  console.log('Legal NFT minted:', nftData.agreementRecord.tokenId);
};
```

### Web App Integration
```javascript
// On TOS acceptance
document.getElementById('acceptTOS').addEventListener('click', async () => {
  const nftResponse = await mintLegalNFT({
    userId: currentUser.id,
    discordId: currentUser.discordId,
    agreementType: 'Terms of Service'
  });
  
  showSuccess(`Legal agreement verified on blockchain: ${nftResponse.tokenId}`);
});
```

## 🎮 Live Applications

### 1. Degens Bot (tiltcheckecosystem.created.app/degens-bot)
- NFT minted on Discord bot invitation
- Card game terms verified via blockchain
- Tournament participation agreements

### 2. JustTheTip (tiltcheckecosystem.created.app/justthetip)
- Crypto tipping terms minted as NFT
- Multi-currency payment agreements
- Discord integration consent

### 3. SusLink Hub (tiltcheckecosystem.created.app/suslink)
- Landing page for ecosystem navigation
- Link verification and safety
- Central agreement tracking

## 🛡️ Legal Compliance Features

### Immutable Audit Trail
- All agreements permanently recorded on blockchain
- Cryptographic verification of acceptance
- Timestamped legal proof
- User identification via Discord footprint

### Privacy Protection
- NFTs contain only verification hashes
- No personal data stored on blockchain
- GDPR and CCPA compliant
- User consent tracked via verifiable tokens

### Verification System
- Each NFT includes unique verification hash
- External verification URL for legal review
- Node verification for authenticity
- Blockchain proof of agreement validity

## 🚀 Quick Start

### Start NFT Legal Server
```bash
node tiltcheck_nft_legal_system.js
```

### Test NFT Minting
```bash
curl -X POST https://tiltcheck.it.com/nftmint \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "discordId": "123456789",
    "agreementType": "Terms of Service"
  }'
```

### Access SusLink
```bash
curl https://tiltcheck.it.com/suslink
```

## 📊 Monitoring & Analytics

### Agreement Tracking
- Total NFTs minted per agreement type
- User consent patterns
- Legal compliance metrics
- Blockchain verification rates

### Ecosystem Health
- All services integrated with NFT system
- Legal agreement coverage: 100%
- Verification success rate tracking
- Compliance audit readiness

---

**🏠 TrapHouse - TiltCheck.it.com | NFT-Verified Legal Agreement System**  
**Developer**: jmenichole - Mischief Manager  
**Ecosystem**: https://tiltcheckecosystem.created.app  
**NFT Legal**: https://tiltcheck.it.com/nftmint
