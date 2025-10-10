# 🎯 User Trust & Suspicious Activity Scoring System

## 📊 **Two-Tier Trust Architecture**

### 🏛️ **Casino Trust Score** (External Verification)
**Range**: 0-100 points | **Purpose**: Loan eligibility & platform reliability

#### **Calculation Components:**
```javascript
Casino Trust Score = Payment History (40) + Casino Connections (35) + 
                    Compliance Bonus (10) + Diversity Bonus (10) + Respect Score (5)
```

#### **Key Factors:**
- **Regulatory Compliance**: License verification, audit status, payout reliability
- **Platform Verification**: Real casino account connections via API
- **Financial History**: Loan repayment track record
- **Risk Assessment**: 5 tiers (Very Low → Very High Risk)

### 👤 **User Trust Score** (Behavioral Analysis)
**Range**: 0-1000 points | **Purpose**: Community reliability & intervention targeting

#### **Calculation Components:**
```javascript
User Trust Score = Gambling Discipline (300) + Community Behavior (250) + 
                  Accountability Engagement (200) + Consistency Patterns (150) + 
                  Support Network Activity (100)
```

## 🧮 **Detailed Scoring Algorithms**

### 🎰 **Casino Trust Score Calculation**

#### **Payment History (0-40 points)**
```javascript
calculatePaymentHistory(userId) {
    const userTrust = loadUserTrust()[userId] || { successfulPayments: 0, defaulted: 0 };
    const baseScore = Math.min(userTrust.successfulPayments * 8, 40);
    const penaltyScore = userTrust.defaulted * 10; // -10 per default
    return Math.max(0, baseScore - penaltyScore);
}
```

#### **Casino Connections (0-35 points)**
```javascript
calculateCasinoConnections(userId) {
    const connections = loadCasinoConnections()[userId] || {};
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [casino, casinoData] of Object.entries(DEGEN_APPROVED_CASINOS)) {
        if (connections[casino]?.verified) {
            const connection = connections[casino];
            const baseWeight = casinoData.weight;
            
            // Compliance multiplier (0.3x to 1.5x)
            const complianceMultiplier = calculateComplianceMultiplier(casinoData);
            const adjustedWeight = baseWeight * complianceMultiplier;
            
            // Connection quality (account age, balance, activity)
            const connectionQuality = calculateConnectionQuality(connection, casinoData);
            
            totalScore += connectionQuality * adjustedWeight;
            totalWeight += adjustedWeight;
        }
    }
    
    return totalWeight > 0 ? Math.min((totalScore / totalWeight) * 35, 35) : 0;
}
```

### 👤 **User Trust Score Calculation**

#### **Gambling Discipline (0-300 points)**
```javascript
calculateGamblingDiscipline(userId) {
    const sessions = getUserGamblingSessions(userId);
    const tiltHistory = getUserTiltHistory(userId);
    
    let disciplineScore = 200; // Base score
    
    // Session quality analysis
    sessions.forEach(session => {
        const sessionGrade = calculateSessionGrade(session);
        switch(sessionGrade.letter) {
            case 'A+': disciplineScore += 15; break;
            case 'A':  disciplineScore += 10; break;
            case 'B+': disciplineScore += 5; break;
            case 'C':  disciplineScore -= 5; break;
            case 'D':  disciplineScore -= 10; break;
            case 'F':  disciplineScore -= 20; break;
        }
    });
    
    // Tilt management
    const tiltEvents = tiltHistory.filter(event => event.type === 'tilt_detected');
    const tiltRecovery = tiltHistory.filter(event => event.type === 'tilt_recovered');
    disciplineScore -= tiltEvents.length * 5;
    disciplineScore += tiltRecovery.length * 10;
    
    // Consistency bonuses
    const avgSessionLength = calculateAvgSessionLength(sessions);
    if (avgSessionLength < 120) disciplineScore += 20; // Under 2 hours
    
    const stakeConsistency = calculateStakeConsistency(sessions);
    if (stakeConsistency > 0.8) disciplineScore += 15; // Consistent stake sizing
    
    return Math.max(0, Math.min(300, disciplineScore));
}
```

#### **Community Behavior (0-250 points)**
```javascript
calculateCommunityBehavior(userId) {
    const respectPoints = getUserRespectPoints(userId);
    const helpingActions = getUserHelpingActions(userId);
    const reportedIncidents = getUserReportedIncidents(userId);
    
    let behaviorScore = 125; // Base score
    
    // Respect points conversion
    behaviorScore += Math.min(respectPoints / 10, 50); // Max 50 from respect
    
    // Helping other users
    behaviorScore += helpingActions.accountability_buddy * 15;
    behaviorScore += helpingActions.intervention_assists * 10;
    behaviorScore += helpingActions.support_provided * 5;
    
    // Negative behaviors
    behaviorScore -= reportedIncidents.spam * 20;
    behaviorScore -= reportedIncidents.harassment * 30;
    behaviorScore -= reportedIncidents.misinformation * 15;
    
    // Community engagement bonuses
    const discordActivity = getUserDiscordActivity(userId);
    if (discordActivity.helpful_messages > 50) behaviorScore += 25;
    if (discordActivity.constructive_feedback > 10) behaviorScore += 15;
    
    return Math.max(0, Math.min(250, behaviorScore));
}
```

#### **Accountability Engagement (0-200 points)**
```javascript
calculateAccountabilityEngagement(userId) {
    const tiltCheckUsage = getUserTiltCheckUsage(userId);
    const buddySystem = getUserBuddySystemActivity(userId);
    const selfReporting = getUserSelfReporting(userId);
    
    let engagementScore = 100; // Base score
    
    // TiltCheck system usage
    engagementScore += Math.min(tiltCheckUsage.sessions_logged, 50);
    engagementScore += tiltCheckUsage.breaks_taken * 5;
    engagementScore += tiltCheckUsage.limits_set * 10;
    
    // Buddy system participation
    engagementScore += buddySystem.buddy_connections * 15;
    engagementScore += buddySystem.interventions_received * 8;
    engagementScore += buddySystem.check_ins_completed * 3;
    
    // Self-reporting and transparency
    engagementScore += selfReporting.honest_loss_reports * 5;
    engagementScore += selfReporting.tilt_admissions * 10;
    engagementScore += selfReporting.goal_setting * 8;
    
    return Math.max(0, Math.min(200, engagementScore));
}
```

#### **Consistency Patterns (0-150 points)**
```javascript
calculateConsistencyPatterns(userId) {
    const behaviorHistory = getUserBehaviorHistory(userId, 90); // 90 days
    
    let consistencyScore = 75; // Base score
    
    // Time pattern analysis
    const timeConsistency = analyzeBettingTimePatterns(behaviorHistory);
    if (timeConsistency.variance < 0.3) consistencyScore += 25; // Consistent timing
    
    // Stake sizing consistency
    const stakeVariance = calculateStakeVariance(behaviorHistory);
    if (stakeVariance < 0.5) consistencyScore += 20; // Consistent stakes
    
    // Platform loyalty (not jumping between casinos during tilt)
    const platformSwitching = analyzePlatformSwitching(behaviorHistory);
    if (platformSwitching.tilt_switching < 3) consistencyScore += 15;
    
    // Goal adherence
    const goalAdherence = calculateGoalAdherence(behaviorHistory);
    consistencyScore += goalAdherence * 15; // 0-1 multiplier
    
    return Math.max(0, Math.min(150, consistencyScore));
}
```

#### **Support Network Activity (0-100 points)**
```javascript
calculateSupportNetworkActivity(userId) {
    const networkEngagement = getUserNetworkEngagement(userId);
    
    let networkScore = 50; // Base score
    
    // Active accountability partnerships
    networkScore += networkEngagement.active_buddies * 15;
    
    // Group participation
    networkScore += networkEngagement.group_sessions_attended * 3;
    networkScore += networkEngagement.community_challenges_joined * 5;
    
    // Mentorship (giving and receiving)
    networkScore += networkEngagement.mentoring_others * 10;
    networkScore += networkEngagement.being_mentored * 5;
    
    return Math.max(0, Math.min(100, networkScore));
}
```

## 🚨 **Suspicious Activity Detection**

### **Sus Score Calculation** (0-100, higher = more suspicious)
```javascript
calculateSusScore(userId) {
    let susScore = 0;
    
    // Rapid betting patterns
    const rapidBetting = detectRapidBetting(userId);
    susScore += rapidBetting.intensity * 20;
    
    // Loss chasing indicators
    const lossChasing = detectLossChasing(userId);
    susScore += lossChasing.severity * 25;
    
    // Multi-platform velocity
    const multiPlatform = detectMultiPlatformActivity(userId);
    susScore += multiPlatform.simultaneous_sessions * 15;
    
    // Stake escalation patterns
    const stakeEscalation = detectStakeEscalation(userId);
    susScore += stakeEscalation.aggression_level * 20;
    
    // Time-based red flags
    const timeRedFlags = detectTimeBasedRedFlags(userId);
    susScore += timeRedFlags.late_night_binges * 10;
    susScore += timeRedFlags.extended_sessions * 15;
    
    return Math.min(100, susScore);
}
```

### **Risk Level Classification**
```javascript
function classifyUserRisk(userTrustScore, susScore) {
    if (susScore >= 80) return 'CRITICAL_INTERVENTION';
    if (susScore >= 60) return 'HIGH_RISK';
    if (susScore >= 40) return 'MODERATE_RISK';
    if (userTrustScore >= 800) return 'HIGHLY_TRUSTED';
    if (userTrustScore >= 600) return 'TRUSTED';
    if (userTrustScore >= 400) return 'AVERAGE';
    if (userTrustScore >= 200) return 'DEVELOPING';
    return 'NEW_USER';
}
```

## 🎯 **Intervention Triggers**

### **Immediate Intervention (Sus Score 80+)**
- Disable betting commands
- Alert accountability buddies
- Trigger cooling-off period
- Admin notification

### **Warning Alerts (Sus Score 60-79)**
- TiltCheck reminders
- Buddy system activation
- Limit suggestions
- Progress check-ins

### **Proactive Support (Sus Score 40-59)**
- Gentle reminders
- Resource sharing
- Goal review prompts
- Community engagement encouragement

## 📊 **Score Integration Matrix**

| User Trust | Sus Score | Combined Risk | Actions |
|------------|-----------|---------------|---------|
| 800+ | 0-20 | Trusted Elite | Full access, mentor role eligible |
| 600-799 | 0-30 | Reliable User | Standard access, buddy eligible |
| 400-599 | 0-40 | Average User | Normal monitoring |
| 200-399 | 20-60 | Developing Risk | Enhanced monitoring |
| 0-199 | 40+ | High Risk | Restricted access, mandatory support |
| Any | 80+ | Crisis Mode | Emergency intervention protocols |

## 🔄 **Real-Time Updates**

### **Score Recalculation Triggers**
- Every betting session completion
- Weekly community behavior review
- Monthly comprehensive assessment
- Immediate for crisis events (Sus Score 80+)

### **Dynamic Weighting**
- Recent behavior weighted 2x
- Crisis recovery periods weighted 1.5x
- Long-term patterns provide stability baseline
- Seasonal adjustments for known trigger periods

This dual scoring system provides comprehensive user assessment while maintaining separate, specialized calculations for casino trust (financial reliability) and user trust (behavioral reliability), enabling targeted interventions and appropriate access controls.
