# NFT Contract-Based User Trust System

## Overview

The NFT Contract-Based User Trust System implements a revolutionary approach to community trust scoring where **user trust scores begin when NFT contracts are signed and increase with every verified link and degen proof action**. Users can report verified scam events to affect sus scores, creating a comprehensive behavioral trust framework built by degens, for degens.

## 🎫 NFT Contract Foundation

### Trust Score Initialization
- **Requirement**: Valid NFT contract signature
- **Base Score**: 100 points upon contract verification
- **Entry Point**: All trust scoring begins with NFT contract signing
- **Verification**: Integrated with existing `beta-verification-contract.js` system

### Contract Integration
```javascript
// Trust scoring requires NFT contract
const hasContract = await nftContract.hasValidContract(userId);
if (!hasContract) {
    return { success: false, message: 'NFT contract required' };
}
```

## 📊 Trust Scoring Components

### 1. NFT Contract Base (100 points)
- **Activation**: Signing NFT contract
- **Purpose**: Entry requirement for all trust features
- **Verification**: Blockchain-backed proof of commitment

### 2. Verified Links (50 points each)
- **Wallet Addresses**: Cryptocurrency wallet verification
- **Casino Accounts**: Gaming platform connections
- **Social Media**: Social platform verification
- **Gaming Platforms**: Additional gaming service links

### 3. Degen Proof Actions (45 points each)
- **Loss Transparency**: Honest loss reporting
- **Tilt Recovery**: Documented recovery from tilt
- **Limit Adherence**: Sticking to preset limits
- **Profit Withdrawal**: Taking profits at goals
- **Community Help**: Assisting other users

### 4. Scam Reporting (60 points each)
- **Requirement**: 200+ trust score to report
- **Evidence**: Solid proof required
- **Impact**: Increases reporter trust, adds sus score to target
- **Verification**: Multi-level evidence checking

### 5. Consistency Bonus (25 points)
- **Trigger**: 3+ actions of same type
- **Purpose**: Reward consistent behavior
- **Application**: Applied to degen proof actions

## 🚨 Sus Score System

### Penalties Applied
- **Scam Report Received**: +200 sus score
- **Verified Scam Activity**: +500 sus score
- **Fake Verification**: +100 sus score
- **Harassment Reports**: +75 sus score

### Risk Classification
```javascript
CRITICAL: 500+ sus score
HIGH_RISK: 300+ sus score
MODERATE_HIGH: 200+ sus score (with low trust)
MODERATE_RISK: 100+ sus score
LOW_RISK: 50+ sus score
MINIMAL_RISK: <50 sus score
```

## 🎯 Trust Tiers

### Tier Classifications
- **ELITE**: 1000+ points - Maximum trust level
- **HIGHLY_TRUSTED**: 750+ points - High community standing
- **TRUSTED**: 500+ points - Established community member
- **DEVELOPING**: 250+ points - Growing trust profile
- **NEW_USER**: 100+ points - NFT contract signed
- **UNVERIFIED**: 0 points - No NFT contract

### Benefits by Tier
- **NEW_USER+**: Can add verified links, record proof actions
- **DEVELOPING+**: Can report scams (200+ score requirement)
- **TRUSTED+**: Community mentoring capabilities
- **HIGHLY_TRUSTED+**: Scam report verification assistance
- **ELITE**: Full system privileges and recognition

## 🔧 Discord Commands

### `/trust init`
Initialize trust score with NFT contract verification
- Checks for valid NFT contract
- Creates base trust profile
- Awards 100 base points

### `/trust score [user]`
View trust score breakdown
- Total score and tier
- Component breakdown
- Growth recommendations
- Sus score display

### `/trust verify-link <type> <link>`
Add verified link for trust points
- Wallet addresses (+50 points)
- Casino accounts (+50 points)
- Social media (+50 points)

### `/trust degen-proof <type> <description> [evidence]`
Record degen proof action
- Loss transparency (+45 points)
- Tilt recovery (+45 points)
- Limit adherence (+45 points)
- Profit withdrawal (+45 points)
- Community help (+45 points)
- Consistency bonus (+25 points for 3+ actions)

### `/trust report-scam <user> <type> <evidence> <description>`
Report verified scam event
- Requires 200+ trust score
- Awards 60 points for verified reports
- Adds 200 sus score to target
- Creates permanent report record

### `/trust summary [user]`
Complete trust assessment
- Full trust breakdown
- Risk level analysis
- Sus score impact
- Improvement recommendations

## 📁 Data Structure

### User Trust Profile
```json
{
  "userId": "discord_user_id",
  "nftTokenId": "blockchain_token_id",
  "nftContractSigned": true,
  "baseScore": 100,
  "verifiedLinks": [
    {
      "id": "link_id",
      "type": "wallet",
      "data": "wallet_address",
      "trustPoints": 50,
      "verifiedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "degenProofActions": [
    {
      "id": "proof_id",
      "type": "loss_transparency",
      "description": "Reported $500 loss with screenshots",
      "trustPoints": 45,
      "consistencyBonus": 25,
      "verifiedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "scamReports": {
    "made": ["report_id_1", "report_id_2"],
    "received": ["report_id_3"]
  },
  "totalTrustScore": 220,
  "susScore": 0,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### Scam Report Structure
```json
{
  "reportId": "unique_report_id",
  "reporterId": "discord_user_id",
  "targetUserId": "target_discord_id",
  "scamType": "fake_giveaway",
  "description": "Detailed scam description",
  "evidence": "Evidence URLs and data",
  "reportedAt": "2024-01-01T00:00:00Z",
  "status": "under_review"
}
```

## 🔄 Integration Points

### NFT Contract System
- **File**: `beta-verification-contract.js`
- **Methods**: `hasValidContract()`, `verifyNFTOwnership()`
- **Purpose**: Blockchain verification for trust initialization

### Casino Trust System
- **Integration**: Casino scores benefit from user trust
- **Bonus**: 500+ user trust = +20 casino trust bonus
- **Cross-reference**: User trust influences loan eligibility

### TiltCheck System
- **Connection**: Completed sessions award trust points
- **Behavioral**: Tilt recovery proof actions
- **Intervention**: Sus scores trigger support protocols

## 🚀 Implementation Steps

### Phase 1: Core System
1. ✅ NFT contract integration
2. ✅ Basic trust scoring
3. ✅ Discord command interface
4. ✅ Data persistence

### Phase 2: Advanced Features
1. 🔄 Evidence verification system
2. 🔄 Automated consistency bonuses
3. 🔄 Cross-system integration
4. 🔄 Advanced risk algorithms

### Phase 3: Community Features
1. 📋 Trust mentoring system
2. 📋 Community moderation tools
3. 📋 Advanced scam detection
4. 📋 Reputation marketplace

## 💡 Usage Examples

### New User Journey
1. **Sign NFT Contract** → Base 100 trust points
2. **Verify Wallet** → +50 points (150 total)
3. **Record Loss Transparency** → +45 points (195 total)
4. **Verify Casino Account** → +50 points (245 total)
5. **Report Scam** → +60 points (305 total) - Now eligible at 200+
6. **Consistency Bonus** → +25 points (330 total) - 3+ actions

### Scam Reporting Flow
1. User achieves 200+ trust score
2. Discovers scam activity with evidence
3. Uses `/trust report-scam` command
4. Evidence verification process
5. Reporter gets +60 trust points
6. Target gets +200 sus score
7. Report enters review queue

### Trust Growth Strategy
- **Fast Track**: Verify multiple links quickly
- **Proof Path**: Focus on degen proof actions
- **Community**: Help others and report scams
- **Consistency**: Maintain regular verified activities

## 🔒 Security Features

### Anti-Gaming Measures
- NFT contract requirement prevents multi-account abuse
- Evidence verification for all proof actions
- Minimum trust requirements for scam reporting
- Blockchain-backed identity verification

### Fraud Prevention
- Cross-verification of reported evidence
- Community validation of scam reports
- Penalty system for false reports
- Immutable blockchain record keeping

## 📈 Success Metrics

### Trust Building
- Average time to reach 500+ trust score
- Number of verified links per user
- Degen proof action completion rates
- Community help participation

### Scam Prevention
- Number of verified scam reports
- Response time to community threats
- False positive rate on reports
- Community safety improvement

### User Engagement
- Daily active trust system users
- Trust score growth trajectories
- Cross-system feature utilization
- Community trust distribution

This NFT contract-based trust system creates a comprehensive behavioral framework where **trust scores begin with blockchain commitment and grow through verified community actions**, establishing unprecedented accountability in the degen community.
