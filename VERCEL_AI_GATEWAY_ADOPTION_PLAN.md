# Vercel AI Gateway - Incremental Adoption Plan

## Overview

This document provides a phased approach for adopting Vercel AI Gateway in TiltCheck, minimizing risk while maximizing value delivery at each stage.

---

## Phase 0: Preparation (Week 1)

### Goals
- Set up infrastructure
- Train team
- Establish baselines

### Tasks

#### 0.1 Account Setup (Day 1-2)
- [ ] Create Vercel account (if not exists)
- [ ] Set up Vercel AI Gateway access
- [ ] Configure billing alerts and limits
- [ ] Document credentials securely

#### 0.2 Environment Setup (Day 2-3)
- [ ] Create development environment
- [ ] Create staging environment
- [ ] Set up monitoring dashboards
- [ ] Configure logging infrastructure

#### 0.3 Team Preparation (Day 3-5)
- [ ] Run demo for team: `npm run demo:vercel-ai`
- [ ] Review documentation with developers
- [ ] Identify pilot users/testers (50-100 users)
- [ ] Establish success metrics

### Deliverables
- ✅ Vercel AI Gateway account configured
- ✅ Development and staging environments ready
- ✅ Team trained on implementation
- ✅ Baseline metrics documented

### Success Criteria
- All team members complete demo walkthrough
- Environments pass connectivity tests
- Monitoring dashboards operational

---

## Phase 1: Parallel Testing (Week 2-3)

### Goals
- Run AI Gateway alongside existing system
- Validate accuracy and performance
- No impact on production users

### Implementation

#### 1.1 Shadow Mode Deployment (Day 6-8)
Deploy AI Gateway in shadow mode - analyzes sessions but doesn't affect user experience.

```javascript
// In existing tiltCheck.js
const existingAnalysis = await tiltChecker.analyzeTiltRisk();

// Shadow AI Gateway analysis (parallel, non-blocking)
if (process.env.ENABLE_AI_GATEWAY_SHADOW === 'true') {
  analyzeWithAIGateway(sessionData).catch(err => {
    // Log but don't fail
    logger.info('AI Gateway shadow analysis error:', err);
  });
}

// Continue with existing logic
return existingAnalysis;
```

#### 1.2 Comparison Metrics (Day 8-10)
Track both systems' outputs:

```javascript
async function analyzeWithAIGateway(sessionData) {
  const aiAnalysis = await aiGateway.analyzeBettingBehavior(sessionData);
  
  // Log for comparison
  metrics.record({
    type: 'shadow_analysis',
    existingScore: existingAnalysis.riskScore,
    aiScore: aiAnalysis.analysis.riskScore,
    agreement: Math.abs(existingScore - aiScore) < 1.0,
    timestamp: Date.now()
  });
  
  return aiAnalysis;
}
```

#### 1.3 Data Collection (Day 11-15)
- Collect 1,000+ parallel analyses
- Compare accuracy against known tilt cases
- Measure performance metrics
- Analyze cost per analysis

### Deliverables
- ✅ Shadow mode running in production
- ✅ 1,000+ comparison data points
- ✅ Performance metrics report
- ✅ Cost analysis report

### Success Criteria
- AI Gateway accuracy ≥ existing system
- Response time < 2 seconds
- Cost per analysis < $0.015
- Zero production incidents

### Rollback Plan
Simply disable shadow mode via environment variable - zero user impact.

---

## Phase 2: Limited Rollout (Week 4-5)

### Goals
- Test with real users
- Validate user experience
- Refine before full rollout

### Implementation

#### 2.1 Feature Flag Setup (Day 16-17)
```javascript
const featureFlags = {
  aiGatewayEnabled: {
    percentage: 5, // Start with 5% of users
    allowlist: ['user_beta_1', 'user_beta_2'], // Specific beta testers
    denylist: [] // High-value users to exclude initially
  }
};

function shouldUseAIGateway(userId) {
  // Allowlist always gets it
  if (featureFlags.aiGatewayEnabled.allowlist.includes(userId)) {
    return true;
  }
  
  // Denylist never gets it
  if (featureFlags.aiGatewayEnabled.denylist.includes(userId)) {
    return false;
  }
  
  // Percentage rollout
  const hash = hashUserId(userId);
  return (hash % 100) < featureFlags.aiGatewayEnabled.percentage;
}
```

#### 2.2 Gradual Rollout (Day 17-25)
Progressive rollout schedule:

| Days | Percentage | User Count (10k total) | Focus |
|------|------------|------------------------|-------|
| 16-18 | 5% | 500 | Beta testers only |
| 19-21 | 10% | 1,000 | Monitor for issues |
| 22-25 | 25% | 2,500 | Validate at scale |

#### 2.3 Hybrid Mode Implementation (Day 17-25)
```javascript
async function analyzeTilt(sessionData) {
  const userId = sessionData.playerId;
  
  if (shouldUseAIGateway(userId)) {
    try {
      // Use AI Gateway with fallback
      const aiAnalysis = await aiGateway.analyzeBettingBehavior(
        sessionData,
        { timeout: 3000 }
      );
      
      metrics.record('ai_gateway_success');
      return aiAnalysis;
      
    } catch (error) {
      // Automatic fallback to existing system
      metrics.record('ai_gateway_fallback');
      logger.warn('AI Gateway failed, using fallback:', error);
      return existingTiltChecker.analyze(sessionData);
    }
  }
  
  // Use existing system
  return existingTiltChecker.analyze(sessionData);
}
```

#### 2.4 User Feedback Collection (Day 18-25)
- Add survey for beta users
- Monitor support tickets
- Track engagement metrics
- Collect qualitative feedback

### Deliverables
- ✅ 25% of users on AI Gateway
- ✅ User feedback collected (50+ responses)
- ✅ Performance validated at scale
- ✅ Support ticket analysis

### Success Criteria
- User satisfaction ≥ existing system
- Support tickets no increase
- False positive rate ≤ 10.5%
- System reliability ≥ 99.5%

### Rollback Plan
Set percentage to 0% - users automatically revert to existing system.

---

## Phase 3: Advanced Features (Week 6-7)

### Goals
- Enable multi-model consensus
- Add streaming for better UX
- Deploy batch processing

### Implementation

#### 3.1 Multi-Model Consensus (Day 26-28)
Enable for high-stakes decisions (large bets, withdrawal approvals):

```javascript
async function highStakesAnalysis(sessionData) {
  if (sessionData.currentStake > 5000) {
    // Use multi-model consensus for high stakes
    const analyses = await aiGateway.detectPatternAnomalies(
      sessionData.bettingHistory
    );
    
    return {
      ...analyses,
      consensusUsed: true,
      confidence: analyses.confidence
    };
  }
  
  // Standard analysis for normal stakes
  return aiGateway.analyzeBettingBehavior(sessionData);
}
```

#### 3.2 Real-time Streaming (Day 29-30)
Progressive UI updates for better user experience:

```javascript
// In web dashboard
async function showLiveAnalysis() {
  const updateUI = (partial) => {
    document.getElementById('analysis-status').textContent = partial.text;
  };
  
  await aiGateway.streamLiveAnalysis(sessionData, (update) => {
    if (update.type === 'chunk') {
      updateUI(update);
    } else if (update.type === 'complete') {
      displayFinalResults(update.analysis);
    }
  });
}
```

#### 3.3 Batch Processing (Day 31-32)
For administrative reports and analytics:

```javascript
// Daily batch analysis for reports
async function generateDailyReport() {
  const sessions = await getYesterdaysSessions();
  
  const results = await aiGateway.batchAnalyze(sessions, {
    costOptimization: true,
    rateLimit: 100 // ms between requests
  });
  
  return {
    totalAnalyzed: results.results.length,
    totalCost: results.totalCost,
    highRiskUsers: results.results.filter(r => r.riskScore > 7).length
  };
}
```

### Deliverables
- ✅ Multi-model consensus for high-stakes decisions
- ✅ Streaming analysis in dashboard
- ✅ Batch processing for reports

### Success Criteria
- High-stakes accuracy > 95%
- Streaming improves perceived performance by 50%
- Batch reports run 5x faster

### Rollback Plan
Disable individual features via feature flags while keeping basic AI Gateway functionality.

---

## Phase 4: Full Production (Week 8)

### Goals
- Roll out to 100% of users
- Enable all features
- Monitor and optimize

### Implementation

#### 4.1 Complete Rollout (Day 33-35)
Progressive increase to 100%:

| Days | Percentage | Notes |
|------|------------|-------|
| 33 | 50% | Monitor closely |
| 34 | 75% | Check for issues |
| 35 | 100% | Full deployment |

#### 4.2 Existing System Deprecation (Day 36-40)
```javascript
// Keep existing system as fallback only
const config = {
  primaryAnalyzer: 'ai-gateway',
  fallbackAnalyzer: 'legacy-tilt-checker',
  
  fallbackConditions: {
    onAIGatewayError: true,
    onHighLatency: true, // > 5 seconds
    onCostLimitReached: true
  }
};
```

#### 4.3 Optimization (Day 36-40)
- Fine-tune model selection thresholds
- Optimize caching strategies
- Adjust rate limits
- Review and adjust cost limits

### Deliverables
- ✅ 100% of users on AI Gateway
- ✅ Legacy system deprecated (kept as fallback)
- ✅ Performance optimized
- ✅ Cost targets met

### Success Criteria
- All Phase 2 criteria maintained at 100% scale
- Cost per analysis < $0.011
- Customer satisfaction maintained or improved

### Rollback Plan
Emergency rollback to 50% if critical issues detected. Full rollback to legacy system if needed (< 1 hour downtime).

---

## Phase 5: Enhancement (Week 9-12)

### Goals
- Add multi-language support
- Implement predictive analytics
- Custom model fine-tuning

### Implementation

#### 5.1 Multi-language Support (Week 9)
```javascript
// Detect user language
const userLang = getUserLanguage(userId);

if (userLang !== 'en') {
  // Translate recommendations
  const translated = await aiGateway.translateRecommendations(
    analysis.recommendations,
    userLang
  );
  analysis.recommendations = translated;
}
```

#### 5.2 Predictive Analytics (Week 10-11)
```javascript
// Predict tilt before it happens
const prediction = await aiGateway.predictTiltRisk({
  currentSession: liveData,
  historicalPattern: last7Days,
  contextualFactors: {
    timeOfDay: hour,
    dayOfWeek: day,
    recentEvents: events
  }
});

if (prediction.tiltProbability > 0.7) {
  sendPreemptiveAlert(userId, prediction.triggers);
}
```

#### 5.3 A/B Testing Framework (Week 12)
```javascript
const experiments = {
  'model-selection-v2': {
    control: 'gpt-4',
    variant: 'claude-3-opus',
    traffic: 0.5,
    metrics: ['accuracy', 'cost', 'latency']
  }
};
```

### Deliverables
- ✅ Multi-language support (5 languages)
- ✅ Predictive tilt detection
- ✅ A/B testing framework

---

## Monitoring & Metrics

### Key Metrics to Track

#### Performance Metrics
```javascript
const metrics = {
  // Response time
  p50Latency: target < 1000, // ms
  p95Latency: target < 2000, // ms
  p99Latency: target < 3000, // ms
  
  // Accuracy
  truePositiveRate: target > 0.90,
  falsePositiveRate: target < 0.11,
  
  // Reliability
  uptime: target > 0.999,
  errorRate: target < 0.01,
  failoverRate: target < 0.05,
  
  // Cost
  costPerAnalysis: target < 0.011, // $
  dailyCost: target < 110, // $ for 10k analyses
  
  // User Experience
  userSatisfaction: target > 4.0, // /5
  supportTickets: target < baseline * 1.1
};
```

#### Dashboard Widgets
1. **Real-time Performance**
   - Current request rate
   - Average response time
   - Error rate
   - Active users on AI Gateway

2. **Cost Tracking**
   - Hourly spend
   - Daily spend trend
   - Cost per user
   - Projected monthly cost

3. **Accuracy Metrics**
   - True positive rate
   - False positive rate
   - Confidence distribution
   - Model usage breakdown

4. **Alerts Configuration**
   - Cost > $5/hour
   - Error rate > 5%
   - Latency p95 > 3s
   - Failover rate > 10%

---

## Risk Mitigation

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| High costs | Medium | High | Set hard cost limits, start with cheap models |
| Poor accuracy | Low | High | Shadow mode validation, multi-model consensus |
| Provider outage | Medium | Medium | Automatic failover, legacy fallback |
| User dissatisfaction | Low | Medium | Gradual rollout, feedback collection |
| Integration bugs | Medium | Low | Comprehensive testing, feature flags |

### Rollback Procedures

#### Level 1: Feature Rollback (< 5 minutes)
```bash
# Disable specific feature
curl -X POST https://api.tiltcheck.com/admin/feature-flags \
  -d '{"aiGatewayStreaming": false}'
```

#### Level 2: Percentage Rollback (< 5 minutes)
```bash
# Reduce to 50%
curl -X POST https://api.tiltcheck.com/admin/feature-flags \
  -d '{"aiGatewayPercentage": 50}'
```

#### Level 3: Complete Rollback (< 15 minutes)
```bash
# Disable AI Gateway entirely
curl -X POST https://api.tiltcheck.com/admin/feature-flags \
  -d '{"aiGatewayEnabled": false}'

# Verify all users on legacy system
curl https://api.tiltcheck.com/admin/status | jq '.aiGatewayActiveUsers'
# Should return: 0
```

---

## Cost Management

### Budget Allocation

#### Phase 1: Parallel Testing
- Budget: $100
- Expected: $50 (shadow mode, limited traffic)
- Buffer: 100%

#### Phase 2: Limited Rollout (25%)
- Budget: $500
- Expected: $270 (2,500 users × $0.011 × 10 analyses/day × 10 days)
- Buffer: 85%

#### Phase 3: Advanced Features
- Budget: $300
- Expected: $200 (testing features)
- Buffer: 50%

#### Phase 4: Full Production (100%)
- Budget: $4,000/month
- Expected: $3,240/month (10,000 users × $0.011 × 30 analyses/day)
- Buffer: 23%

### Cost Controls

```javascript
const costLimits = {
  perRequest: 0.10,     // $0.10 max per analysis
  perHour: 5.00,        // $5/hour max
  perDay: 110.00,       // $110/day max (~$3,300/month)
  perMonth: 4000.00,    // $4,000/month max
  
  actions: {
    onHourlyExceeded: 'downgrade-models', // Use cheaper models
    onDailyExceeded: 'throttle',          // Reduce usage
    onMonthlyExceeded: 'disable'          // Emergency stop
  }
};
```

---

## Success Criteria Summary

### Must-Have (Phase 4 Completion)
- ✅ 100% rollout completed
- ✅ Accuracy ≥ 95%
- ✅ False positives ≤ 10.5%
- ✅ Uptime ≥ 99.9%
- ✅ Cost ≤ $3,500/month
- ✅ User satisfaction maintained

### Nice-to-Have (Phase 5 Completion)
- ✅ Multi-language support (5+ languages)
- ✅ Predictive analytics operational
- ✅ A/B testing framework deployed
- ✅ Custom model fine-tuning explored

---

## Timeline Summary

```
Week 1:  Phase 0 - Preparation
Week 2-3: Phase 1 - Parallel Testing  
Week 4-5: Phase 2 - Limited Rollout (5% → 25%)
Week 6-7: Phase 3 - Advanced Features
Week 8:   Phase 4 - Full Production (100%)
Week 9-12: Phase 5 - Enhancement
```

**Total Time to Full Production: 8 weeks**
**Total Time to Enhanced System: 12 weeks**

---

## Communication Plan

### Weekly Updates
- **Mondays**: Phase kickoff, goals review
- **Wednesdays**: Mid-week progress check
- **Fridays**: Week summary, metrics review

### Stakeholder Reporting
- **Executive Summary**: Weekly (1 page)
- **Technical Details**: Bi-weekly (dashboard + notes)
- **Incident Reports**: As needed (< 2 hours)

### Team Communication
- **Slack Channel**: `#ai-gateway-rollout`
- **Daily Standups**: 15 min, rollout status
- **Demo Sessions**: End of each phase

---

## Contingency Plans

### Scenario 1: Costs Exceed Budget by 50%
- **Action**: Immediately downgrade all analyses to GPT-3.5-turbo
- **Expected Impact**: 70% cost reduction, minimal accuracy loss
- **Timeline**: < 1 hour

### Scenario 2: Accuracy Below 85%
- **Action**: Rollback to 25%, review model selection logic
- **Expected Impact**: Reduce user impact while investigating
- **Timeline**: < 30 minutes

### Scenario 3: Provider Outage (All Providers)
- **Action**: Automatic fallback to legacy system
- **Expected Impact**: No user-facing impact
- **Timeline**: Automatic (< 30 seconds)

### Scenario 4: User Complaints Spike
- **Action**: Reduce rollout to 10%, collect detailed feedback
- **Expected Impact**: Isolate issue, protect user experience
- **Timeline**: < 15 minutes

---

## Appendix: Quick Reference Commands

### Deploy to Staging
```bash
npm run build
npm run deploy:staging
npm run test:integration
```

### Enable Shadow Mode
```bash
export ENABLE_AI_GATEWAY_SHADOW=true
pm2 restart tiltcheck
```

### Adjust Rollout Percentage
```bash
curl -X POST https://api.tiltcheck.com/admin/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"aiGatewayPercentage": 25}'
```

### Check Current Status
```bash
curl https://api.tiltcheck.com/admin/ai-gateway/status | jq
```

### Emergency Rollback
```bash
curl -X POST https://api.tiltcheck.com/admin/feature-flags \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"aiGatewayEnabled": false}'
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-17  
**Owner**: TiltCheck Engineering Team  
**Review Frequency**: Weekly during rollout, monthly post-rollout

---

## Questions or Issues?

- **Technical Questions**: Slack `#ai-gateway-rollout`
- **Escalations**: Email engineering-leads@tiltcheck.com
- **Emergency**: Page on-call engineer

**Copyright (c) 2024-2025 JME (jmenichole). All Rights Reserved.**
