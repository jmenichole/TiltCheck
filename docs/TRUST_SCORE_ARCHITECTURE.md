# Trust Score System Architecture

## 🎯 Overview

The TiltCheck Trust Score system is a sophisticated, multi-layered reputation mechanism that combines blockchain-based verification with behavioral analysis to create a comprehensive trust profile for users. The system starts with NFT contract signing as the base trust level and grows through verified actions while penalizing malicious behavior.

---

## 🏗️ System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                   Trust Score Engine                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ NFT Contract │  │   Verified   │  │    Scam      │ │
│  │   System     │  │   Actions    │  │   Reports    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                          ↓                               │
│            ┌─────────────────────────┐                  │
│            │  Score Calculation      │                  │
│            │  Trust + Sus Tracking   │                  │
│            └─────────────────────────┘                  │
│                          ↓                               │
│            ┌─────────────────────────┐                  │
│            │  Blockchain Storage     │                  │
│            │  NFT Metadata Update    │                  │
│            └─────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## 💯 Trust Score Calculation

### Base Score Initialization

When a user signs the NFT contract, they receive a base trust score:

```javascript
NFT_CONTRACT_BASE_SCORE = 100
```

This activation of trust scoring signals:
- User commitment to the community
- Willingness to be held accountable
- Initial credibility established

### Trust Score Formula

```javascript
Total Trust Score = Base Score (100) 
                   + Σ(Verified Actions × Multipliers)
                   - Σ(Sus Penalties)
                   + Consistency Bonuses
```

---

## ✅ Verified Actions & Trust Multipliers

### Action-Based Scoring

| Action | Points | Description |
|--------|--------|-------------|
| **NFT Contract Signed** | +100 | Base trust activation |
| **Verified Wallet Link** | +50 | Blockchain identity verified |
| **Casino Account Verified** | +75 | Gaming platform connection |
| **Successful Loan Repayment** | +100 | Financial reliability |
| **TiltCheck Session Completed** | +25 | Gambling discipline |
| **Accountability Buddy Active** | +40 | Community engagement |
| **Beta Feedback Submitted** | +30 | Product contribution |
| **Community Help Provided** | +35 | Helping others |
| **Scam Report Verified** | +60 | Community protection |
| **Degen Proof Milestone** | +45 | Achievement tracking |

### Implementation Example

```javascript
// From userTrustSystem.js
this.TRUST_MULTIPLIERS = {
    nft_contract_signed: 100,
    verified_wallet_link: 50,
    casino_account_verified: 75,
    successful_loan_repayment: 100,
    tiltcheck_session_completed: 25,
    accountability_buddy_active: 40,
    beta_feedback_submitted: 30,
    community_help_provided: 35,
    scam_report_verified: 60,
    degen_proof_milestone: 45
};
```

---

## 🚨 Sus Score System

### Penalty Structure

The "Sus Score" tracks negative behaviors and potential scam activities:

| Violation | Penalty | Description |
|-----------|---------|-------------|
| **Scam Report Against** | +200 | Being reported for scamming |
| **Verified Scam Activity** | +500 | Confirmed scamming |
| **Multi-Account Abuse** | +150 | Multiple fake accounts |
| **Fake Verification Attempt** | +100 | Fraudulent proof |
| **Harassment Reported** | +75 | Community harassment |
| **Suspicious Link Sharing** | +50 | Malicious links |

### Implementation

```javascript
// From userTrustSystem.js
this.SUS_PENALTIES = {
    scam_report_against: 200,
    verified_scam_activity: 500,
    multi_account_abuse: 150,
    fake_verification_attempt: 100,
    harassment_reported: 75,
    suspicious_link_sharing: 50
};
```

---

## 🎖️ Degen Proof System

### Proof Types & Points

The Degen Proof system rewards disciplined gambling behavior:

| Proof Type | Points | Description |
|------------|--------|-------------|
| **Loss Transparency** | +30 | Honest loss reporting |
| **Tilt Recovery** | +50 | Documented recovery |
| **Limit Adherence** | +40 | Respecting set limits |
| **Profit Withdrawal** | +35 | Taking profit |
| **Accountability Milestone** | +60 | Long-term tracking |
| **Community Mentoring** | +70 | Teaching others |
| **Long-term Discipline** | +80 | Consistent behavior |
| **Crisis Intervention** | +90 | Helping in crises |

### Implementation

```javascript
this.DEGEN_PROOF_TYPES = {
    loss_transparency: { points: 30, description: 'Transparent loss reporting' },
    tilt_recovery: { points: 50, description: 'Documented tilt recovery' },
    limit_adherence: { points: 40, description: 'Sticking to set limits' },
    profit_withdrawal: { points: 35, description: 'Taking profit at goals' },
    accountability_milestone: { points: 60, description: 'Accountability milestones' },
    community_mentoring: { points: 70, description: 'Mentoring other users' },
    long_term_discipline: { points: 80, description: 'Long-term discipline' },
    crisis_intervention: { points: 90, description: 'Helping in crisis situations' }
};
```

---

## 🔗 Data Flow & Storage

### Trust Score Lifecycle

```
1. User Interaction
   ↓
2. Action Verification
   ↓
3. Score Calculation
   ↓
4. Database Update (JSON + MongoDB)
   ↓
5. NFT Metadata Sync
   ↓
6. Blockchain Update (Solana)
   ↓
7. User Notification
```

### Data Storage Structure

#### Local JSON Storage (`./data/user_trust_scores.json`)

```json
{
  "userId": "123456789",
  "trustScore": 450,
  "susScore": 0,
  "nftTokenId": "ABC123XYZ",
  "verifiedActions": [
    {
      "type": "nft_contract_signed",
      "points": 100,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "type": "verified_wallet_link",
      "points": 50,
      "timestamp": "2024-01-15T11:00:00Z"
    }
  ],
  "degenProofs": [
    {
      "type": "limit_adherence",
      "points": 40,
      "timestamp": "2024-01-20T18:45:00Z",
      "proof": "Screenshot of limit settings"
    }
  ],
  "scamReports": [],
  "lastUpdated": "2024-01-20T18:45:00Z"
}
```

#### Behavior History (`./data/user_behavior_history.json`)

```json
{
  "userId": "123456789",
  "sessions": [
    {
      "sessionId": "session_abc123",
      "startTime": "2024-01-20T18:00:00Z",
      "endTime": "2024-01-20T20:30:00Z",
      "duration": 9000,
      "activities": [
        {
          "type": "bet",
          "amount": 50,
          "gameType": "slots",
          "timestamp": "2024-01-20T18:15:00Z"
        }
      ],
      "tiltScore": 3,
      "interventions": []
    }
  ]
}
```

---

## 🔄 Trust Score Methods

### Core Operations

#### 1. Initialize Trust Score

```javascript
async initializeTrustScore(userId, nftTokenId) {
    // Check beta approval
    if (!this.isBetaApproved(userId)) {
        return { success: false, message: 'Beta testing access required' };
    }

    // Create initial trust profile
    const userData = {
        userId,
        nftTokenId,
        trustScore: this.NFT_BASE_SCORE,
        susScore: 0,
        verifiedActions: [{
            type: 'nft_contract_signed',
            points: this.TRUST_MULTIPLIERS.nft_contract_signed,
            timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString()
    };

    // Save and return
    return this.saveUserData(userData);
}
```

#### 2. Add Verified Action

```javascript
async addVerifiedAction(userId, actionType, proof = null) {
    const userData = await this.getUserData(userId);
    
    // Validate action type
    if (!this.TRUST_MULTIPLIERS[actionType]) {
        throw new Error('Invalid action type');
    }

    // Add action to history
    const action = {
        type: actionType,
        points: this.TRUST_MULTIPLIERS[actionType],
        timestamp: new Date().toISOString(),
        proof
    };

    userData.verifiedActions.push(action);
    userData.trustScore += action.points;

    // Update NFT metadata on blockchain
    await this.updateNFTMetadata(userData.nftTokenId, userData.trustScore);

    return this.saveUserData(userData);
}
```

#### 3. Report Scam

```javascript
async reportScam(reporterId, targetUserId, evidence) {
    const report = {
        reporterId,
        targetUserId,
        evidence,
        timestamp: new Date().toISOString(),
        status: 'pending',
        verified: false
    };

    // Save report for review
    const reports = this.loadScamReports();
    reports.push(report);
    this.saveScamReports(reports);

    // Add initial penalty to target's sus score
    const targetData = await this.getUserData(targetUserId);
    targetData.susScore += this.SUS_PENALTIES.scam_report_against;

    return this.saveUserData(targetData);
}
```

#### 4. Verify Scam Report

```javascript
async verifyScamReport(reportId, isVerified) {
    const reports = this.loadScamReports();
    const report = reports.find(r => r.id === reportId);

    if (isVerified) {
        // Apply full penalty
        const targetData = await this.getUserData(report.targetUserId);
        targetData.susScore += this.SUS_PENALTIES.verified_scam_activity;
        await this.saveUserData(targetData);

        // Reward reporter
        const reporterData = await this.getUserData(report.reporterId);
        await this.addVerifiedAction(report.reporterId, 'scam_report_verified');
    }

    report.verified = isVerified;
    report.status = 'reviewed';
    this.saveScamReports(reports);
}
```

---

## 🎨 Trust Score Display

### Score Tiers

| Trust Score | Tier | Badge | Description |
|-------------|------|-------|-------------|
| 0-99 | 🥚 New | Egg | Unverified user |
| 100-299 | 🌱 Seedling | Sprout | Contract signed, building trust |
| 300-599 | 🌿 Growing | Plant | Active participant |
| 600-999 | 🌳 Established | Tree | Trusted community member |
| 1000-1999 | ⭐ Star | Star | Highly trusted contributor |
| 2000+ | 💎 Diamond | Diamond | Elite trusted member |

### Sus Score Warnings

| Sus Score | Warning Level | Action |
|-----------|---------------|--------|
| 0-49 | ✅ Clean | No restrictions |
| 50-149 | ⚠️ Caution | Monitoring increased |
| 150-299 | 🚨 Warning | Limited privileges |
| 300-499 | 🔴 Danger | Restricted access |
| 500+ | 🚫 Banned | Account suspended |

---

## 🔐 Security & Privacy

### Data Protection

1. **Encryption**
   - All trust data encrypted at rest
   - Secure transmission protocols (HTTPS/WSS)

2. **Access Control**
   - Role-based permissions
   - Admin-only verification rights
   - User can only view own scores

3. **Privacy**
   - Minimal PII collection
   - Anonymized analytics
   - GDPR compliance

4. **Audit Trail**
   - All score changes logged
   - Tamper-proof blockchain records
   - Admin action tracking

### Anti-Gaming Measures

1. **Verification Requirements**
   - Proof required for high-value actions
   - Admin review for suspicious patterns
   - Time-based cooldowns

2. **Multi-Account Detection**
   - IP tracking
   - Device fingerprinting
   - Behavioral analysis

3. **Scam Report Validation**
   - Evidence requirements
   - Community voting system
   - Admin final review

---

## 📊 Analytics & Insights

### Trust Score Metrics

- **Average Trust Score**: Community health indicator
- **Score Distribution**: User tier breakdown
- **Growth Rate**: Trust building velocity
- **Sus Score Trend**: Community safety metric

### User Insights

- **Trust Journey**: Individual progress tracking
- **Action Breakdown**: Points by category
- **Engagement Level**: Activity frequency
- **Risk Profile**: Behavioral assessment

---

## 🚀 Future Enhancements

### Planned Features

1. **Machine Learning Integration**
   - Automated scam detection
   - Behavioral pattern recognition
   - Predictive trust scoring

2. **Cross-Platform Trust**
   - Trust score portability
   - Multi-dApp integration
   - Universal reputation system

3. **Dynamic NFT Metadata**
   - Real-time trust updates on-chain
   - Visual trust level indicators
   - Animated NFT progression

4. **Community Governance**
   - DAO-based score adjustments
   - Community-driven policies
   - Transparent appeal process

---

## 📞 Support

For questions about the trust score system:
- Technical: Review `userTrustSystem.js` and `nftUserTrustSystem.js`
- Usage: See Discord bot commands (`!trust-score`, `!verify-action`)
- Issues: GitHub Issues with label `trust-system`

---

*Last Updated: November 2024*
*Version: 2.0.0*
