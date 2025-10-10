# TiltCheck Beta NFT Contract System

## Overview
The TiltCheck Beta NFT system creates unique, non-transferable NFTs for verified beta users that serve as legally binding contract signatures. Each NFT is permanently linked to a Discord ID and provides verifiable proof of beta testing agreement.

## Key Features

### 🎮 NFT Contract Integration
- **Unique Token ID**: Generated from Discord ID + Contract ID + timestamp
- **Discord ID Binding**: Each NFT is permanently linked to the signer's Discord account
- **Contract Signature**: NFT metadata contains cryptographic proof of signed agreement
- **Device Fingerprinting**: Legal tracking through device identification
- **Non-Transferable**: Security-locked to prevent unauthorized access transfer

### 🔒 Legal Protection
- **Crypto Signature Verification**: Server-side HMAC + user signature + device fingerprint
- **Contract Storage**: All contracts stored with NFT references
- **Ownership Verification**: Real-time Discord ID validation
- **Revocation System**: NFTs can be burned if access is revoked

### 📊 NFT Metadata Structure
```json
{
  "tokenId": "sha256_hash",
  "name": "TiltCheck Beta Access #[6_digit_suffix]",
  "description": "Exclusive NFT representing verified beta testing access...",
  "image": "data:image/svg+xml;base64,... (generated SVG)",
  "animation_url": "data:text/html;base64,... (animated HTML)",
  "attributes": [
    { "trait_type": "Access Level", "value": "Beta Tester" },
    { "trait_type": "Discord ID", "value": "user_discord_id" },
    { "trait_type": "Contract ID", "value": "contract_uuid" },
    { "trait_type": "Contract Signature", "value": "crypto_signature_hash" },
    { "trait_type": "Device Fingerprint Hash", "value": "device_hash_16_chars" },
    { "trait_type": "Verification Status", "value": "Verified" }
  ],
  "properties": {
    "transferable": false,
    "burnable": true,
    "utility": ["Beta Access", "Legal Contract", "Discord Verification"]
  }
}
```

## API Endpoints

### Contract Signing with NFT Minting
```
POST /sign-contract
Body: {
  "contractId": "uuid",
  "discordId": "discord_user_id", 
  "userSignature": "user_digital_signature"
}
Response: {
  "success": true,
  "nft": {
    "tokenId": "nft_token_id",
    "verificationUrl": "/verify-nft/token_id"
  }
}
```

### NFT Verification
```
GET /verify-nft/:tokenId
Returns: HTML verification page with NFT details, ownership proof, and contract information
```

### NFT Metadata (OpenSea Compatible)
```
GET /api/nft/:tokenId
Returns: JSON metadata following OpenSea standards
```

### User NFT Dashboard
```
GET /my-nfts?discord_id=[discord_id]
Returns: HTML dashboard showing all user's TiltCheck Beta NFTs
```

### Ownership Verification
```
Internal: betaContract.verifyNFTOwnership(discordId)
Returns: {
  hasValidNFT: boolean,
  nfts: array,
  totalNFTs: number
}
```

## Implementation Details

### NFT Generation Process
1. **Contract Signing**: User signs beta testing contract
2. **Signature Verification**: Server validates crypto signatures
3. **NFT Minting**: Automatic NFT creation with contract details
4. **Metadata Generation**: SVG image + animated HTML creation
5. **Ownership Recording**: Discord ID linked to token permanently
6. **Storage**: NFT data saved to filesystem with registry update

### Security Features
- **Device Fingerprinting**: Tracks hardware/browser characteristics
- **Crypto Signatures**: HMAC-SHA256 server + user signature combination
- **Non-Transferable**: Prevents unauthorized access trading
- **Discord Verification**: Real-time ownership validation
- **Session Tracking**: 7-day limits with re-verification

### File Structure
```
data/
├── beta-nfts/
│   └── registry.json           # Master NFT registry
├── nft-metadata/
│   └── [tokenId].json         # Individual NFT metadata
├── nft-ownership/
│   └── [tokenId].json         # Ownership records
└── beta-contracts/
    └── contract-[discordId]-[contractId].json  # Contracts with NFT refs
```

## Visual Design

### NFT Image Features
- **Gradient Background**: Dark theme with TiltCheck branding
- **Access Badge**: "VERIFIED BETA ACCESS" prominently displayed
- **Discord ID**: Last 8 characters shown for identification
- **Token ID**: Last 8 characters for uniqueness
- **Mint Date**: Creation timestamp
- **Gaming Icon**: 🎮 emoji representing gaming/beta access

### Animated Version
- **Glowing Effects**: Pulsing green/blue glow animation
- **Rotating Icon**: Gaming emoji rotates continuously
- **Text Glow**: Animated text shadow effects
- **Responsive Design**: Scales properly on different screen sizes

## Legal Compliance

### Contract Terms Integration
- **Beta Testing Agreement**: Desktop-only access requirements
- **Gambling Disclaimers**: No guarantees, personal responsibility
- **Data Collection**: Monitoring and feedback requirements
- **Device Tracking**: Legal fingerprinting for protection
- **Crypto Requirements**: Wallet funding for JustTheTip features

### Verification Chain
1. Discord ID verification
2. Device fingerprint generation
3. Contract signature creation
4. NFT minting with embedded proof
5. Ownership verification system
6. Access control validation

## Usage Examples

### Check User's NFTs
```javascript
const nftInfo = await betaContract.verifyNFTOwnership('1155164907680043059');
console.log(nftInfo.hasValidNFT); // true/false
console.log(nftInfo.totalNFTs);   // number of NFTs owned
```

### Verify NFT Details
```javascript
const details = await betaContract.getNFTDetails(tokenId);
console.log(details.isValid);     // ownership validation
console.log(details.metadata);    // full NFT metadata
```

### Access Control
```javascript
const hasAccess = await betaContract.hasValidContract(discordId);
// Returns true only if user has valid signed contract AND valid NFT
```

## Benefits

### For Users
- **Proof of Access**: Verifiable beta testing rights
- **Legal Protection**: Contract signature embedded in NFT
- **Collectible Aspect**: Unique digital asset representing early access
- **Verification Tool**: Easy proof of legitimate beta participation

### For TiltCheck
- **Legal Security**: Cryptographic proof of user agreements
- **Access Control**: Non-transferable prevents unauthorized sharing
- **User Tracking**: Discord ID linking prevents abuse
- **Audit Trail**: Complete history of beta access grants

## Future Enhancements
- **Metadata Updates**: Dynamic attributes based on testing activity
- **Achievement System**: Additional NFT traits for testing milestones
- **Cross-Platform**: Integration with other TiltCheck services
- **Marketplace**: Potential future trading (if made transferable)

---

**Note**: This NFT system is specifically designed for legal protection and access control, not as a traditional collectible or investment vehicle. NFTs are bound to Discord accounts and cannot be transferred to maintain security and prevent unauthorized access sharing.
