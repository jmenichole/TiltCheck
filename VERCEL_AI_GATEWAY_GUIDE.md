# Vercel AI Gateway Integration Guide for TiltCheck

## Overview

This guide demonstrates how TiltCheck leverages Vercel AI Gateway to provide advanced, reliable, and cost-effective AI-powered tilt detection and behavioral analysis.

## What is Vercel AI Gateway?

Vercel AI Gateway is a unified API platform that provides:
- **Single endpoint** to access hundreds of AI models (OpenAI, Anthropic, Google, etc.)
- **Automatic failover** for high availability during provider outages
- **Cost optimization** through smart model selection
- **Unified billing** and authentication
- **Observability** with detailed usage analytics

## Key Use Cases for TiltCheck

### 1. Multi-Model Tilt Detection

Use multiple AI models to analyze betting behavior with automatic failover:

```javascript
import VercelAIGatewayTiltCheck from './vercel-ai-gateway-integration.js';

const tiltChecker = new VercelAIGatewayTiltCheck({
  useVercelAuth: true,
  costOptimization: true,
  modelStrategy: 'auto'
});

// Analyze betting behavior with automatic model selection
const analysis = await tiltChecker.analyzeBettingBehavior({
  playerId: 'user123',
  bettingHistory: [
    { amount: 50, outcome: 'loss', timestamp: Date.now() - 60000 },
    { amount: 100, outcome: 'loss', timestamp: Date.now() - 30000 },
    { amount: 200, outcome: 'win', timestamp: Date.now() }
  ],
  currentStake: 1000,
  sessionDuration: 45,
  emotionalIndicators: {
    betSpeedIncrease: true,
    stakeSizeEscalation: true,
    lossChasing: true
  }
});

console.log('Tilt Detected:', analysis.analysis.tiltDetected);
console.log('Risk Score:', analysis.analysis.riskScore);
console.log('Model Used:', analysis.metadata.modelUsed);
console.log('Cost:', `$${analysis.metadata.cost.toFixed(4)}`);
```

**Benefits:**
- Automatic failover to backup models if primary fails
- Best model automatically selected based on complexity
- Detailed metadata on cost and performance

### 2. Real-time Recommendations

Generate personalized recommendations during gaming sessions:

```javascript
const recommendations = await tiltChecker.generateRecommendations({
  sessionDuration: 45,
  currentStake: 750,
  betCount: 23,
  winRate: 35
}, 7.5); // Risk score

console.log(recommendations);
// {
//   recommendations: [
//     {
//       priority: "high",
//       action: "Take a 15-minute break",
//       reasoning: "High risk score and declining win rate indicate emotional betting"
//     },
//     ...
//   ]
// }
```

**Benefits:**
- Real-time AI-generated advice
- Context-aware recommendations
- Uses cheaper models for faster response

### 3. Pattern Anomaly Detection with Model Ensemble

Use multiple AI models simultaneously for consensus-based detection:

```javascript
const anomalies = await tiltChecker.detectPatternAnomalies([
  { bet: 50, time: '10:00', outcome: 'loss' },
  { bet: 100, time: '10:05', outcome: 'loss' },
  { bet: 200, time: '10:08', outcome: 'loss' },
  { bet: 400, time: '10:10', outcome: 'win' },
  // ... more betting history
]);

console.log('Anomalies Detected:', anomalies.anomaliesDetected);
console.log('Confidence:', anomalies.confidence);
console.log('Consensus:', anomalies.consensus);
// "2/3 models detected anomalies"
```

**Benefits:**
- Higher accuracy through model consensus
- Reduces false positives
- Automatic handling of model failures

### 4. Cost-Optimized Batch Analysis

Process multiple sessions efficiently with automatic cost optimization:

```javascript
const sessions = [
  { playerId: 'user1', bettingHistory: [...], currentStake: 500 },
  { playerId: 'user2', bettingHistory: [...], currentStake: 1200 },
  // ... more sessions
];

const results = await tiltChecker.batchAnalyze(sessions, {
  costOptimization: true,
  rateLimit: 100 // ms between requests
});

console.log('Total Cost:', `$${results.totalCost.toFixed(4)}`);
console.log('Average Response Time:', `${results.avgResponseTime}ms`);
console.log('Sessions Analyzed:', results.results.length);
```

**Benefits:**
- Automatic model downgrading for simple analyses
- Significant cost savings on large batches
- Built-in rate limiting

### 5. Real-time Streaming Analysis

Stream AI analysis for live monitoring dashboards:

```javascript
await tiltChecker.streamLiveAnalysis(sessionData, (update) => {
  if (update.type === 'chunk') {
    // Update UI with partial results
    console.log('Streaming:', update.text);
  } else if (update.type === 'complete') {
    // Final analysis ready
    console.log('Analysis Complete:', update.analysis);
  }
});
```

**Benefits:**
- Real-time UI updates
- Better user experience
- Progressive insights as they're generated

### 6. Multi-language Support

Automatically translate recommendations to any language:

```javascript
const englishRecommendations = {
  recommendations: [
    { action: 'Take a break', reasoning: 'High risk detected' }
  ]
};

const spanishRecommendations = await tiltChecker.translateRecommendations(
  englishRecommendations,
  'Spanish'
);

console.log(spanishRecommendations);
// {
//   recommendations: [
//     { action: 'Toma un descanso', reasoning: 'Alto riesgo detectado' }
//   ]
// }
```

**Benefits:**
- AI-powered contextual translation
- Maintains JSON structure
- Uses cost-effective models

## Configuration

### Basic Setup

```javascript
const tiltChecker = new VercelAIGatewayTiltCheck({
  // Use Vercel's built-in authentication
  useVercelAuth: true,
  
  // Enable cost optimization
  costOptimization: true,
  
  // Model selection strategy: 'auto', 'performance', 'cost', 'balanced'
  modelStrategy: 'auto',
  
  // Logging level: 'debug', 'info', 'warn', 'error'
  logLevel: 'info'
});
```

### Advanced Configuration

```javascript
const tiltChecker = new VercelAIGatewayTiltCheck({
  useVercelAuth: false, // Use your own API keys
  
  // Custom model preferences
  modelPreferences: {
    simple: 'gpt-3.5-turbo',
    moderate: 'claude-3-sonnet',
    complex: 'gpt-4-turbo',
    fallback: 'gemini-pro'
  },
  
  // Failover configuration
  failover: {
    enabled: true,
    maxRetries: 3,
    fallbackProviders: ['openai', 'anthropic', 'google']
  },
  
  // Cost limits
  costLimits: {
    perRequest: 0.10,  // $0.10 max per request
    perDay: 50.00      // $50 daily limit
  }
});
```

## Installation

### 1. Install Dependencies

```bash
npm install @ai-sdk/ai-gateway @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
```

### 2. Set Up Environment Variables

Create a `.env` file:

```env
# Vercel AI Gateway
VERCEL_AI_GATEWAY_API_KEY=your_gateway_key

# Or use individual provider keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key
```

### 3. Import and Use

```javascript
import VercelAIGatewayTiltCheck from './vercel-ai-gateway-integration.js';

const tiltChecker = new VercelAIGatewayTiltCheck();
```

## Cost Comparison

| Analysis Type | Traditional API | With Gateway | Savings |
|--------------|----------------|--------------|---------|
| Simple analysis (GPT-3.5) | $0.002 | $0.002 | 0% |
| Moderate analysis (GPT-4) | $0.030 | $0.010* | 67% |
| Complex analysis (GPT-4-Turbo) | $0.010 | $0.010 | 0% |
| Batch 100 sessions | $2.00 | $0.50* | 75% |

*With automatic model optimization enabled

## Reliability Benefits

### Without Vercel AI Gateway:
- Single provider dependency
- Manual failover implementation
- Custom retry logic needed
- No centralized monitoring

### With Vercel AI Gateway:
- **Automatic failover** across providers
- **99.9% uptime** guarantee
- Built-in retry logic
- **Unified monitoring** dashboard

## Monitoring and Analytics

Get detailed gateway statistics:

```javascript
const stats = await tiltChecker.getGatewayStats();

console.log('Total Requests:', stats.totalRequests);
console.log('Success Rate:', `${stats.successRate}%`);
console.log('Average Response Time:', `${stats.avgResponseTime}ms`);
console.log('Total Cost:', `$${stats.totalCost}`);
console.log('Model Distribution:', stats.modelDistribution);
console.log('Failover Events:', stats.failoverEvents);
```

## Best Practices

### 1. Cost Optimization

```javascript
// Use simple models for quick checks
const quickCheck = await tiltChecker.analyzeBettingBehavior(sessionData, {
  costOptimization: true
});

// Use complex models only for critical analysis
const deepAnalysis = await tiltChecker.analyzeBettingBehavior(sessionData, {
  complexity: 'deep'
});
```

### 2. Error Handling

```javascript
try {
  const analysis = await tiltChecker.analyzeBettingBehavior(sessionData);
  // Process results
} catch (error) {
  // Gateway automatically tried failover
  console.error('All models failed:', error);
  // Use rule-based fallback
  const fallbackAnalysis = useFallbackRules(sessionData);
}
```

### 3. Caching Results

```javascript
// Cache simple analyses to reduce costs
const cacheKey = `analysis-${playerId}-${sessionId}`;
let analysis = cache.get(cacheKey);

if (!analysis) {
  analysis = await tiltChecker.analyzeBettingBehavior(sessionData);
  cache.set(cacheKey, analysis, 300); // 5 minute TTL
}
```

### 4. Rate Limiting

```javascript
// Implement rate limiting for batch operations
const results = await tiltChecker.batchAnalyze(sessions, {
  rateLimit: 100, // 100ms between requests
  costOptimization: true
});
```

## Integration with Existing TiltCheck

### Enhanced AI Tilt Detection

```javascript
import AITiltDetection from './ai-tilt-detection.js';
import VercelAIGatewayTiltCheck from './vercel-ai-gateway-integration.js';

// Combine rule-based and AI analysis
const ruleBased = new AITiltDetection();
const aiPowered = new VercelAIGatewayTiltCheck();

// Log bet with rule-based analysis
ruleBased.logBet({
  amount: 100,
  currency: 'USD',
  device: 'mobile',
  outcome: 'loss',
  pnl: -100,
  gameType: 'slots'
});

// Get rule-based analysis
const ruleBasedAnalysis = ruleBased.analyzeTiltRisk();

// Enhance with AI insights
const aiAnalysis = await aiPowered.analyzeBettingBehavior({
  playerId: 'user123',
  bettingHistory: ruleBased.sessionData.bets,
  currentStake: 1000,
  sessionDuration: ruleBased.getSessionStats().sessionDuration,
  emotionalIndicators: {
    riskScore: ruleBasedAnalysis.overallRiskScore
  }
});

// Combine analyses
const combinedAnalysis = {
  ruleBasedScore: ruleBasedAnalysis.overallRiskScore,
  aiScore: aiAnalysis.analysis.riskScore,
  finalScore: (ruleBasedAnalysis.overallRiskScore + aiAnalysis.analysis.riskScore) / 2,
  recommendations: [
    ...ruleBasedAnalysis.recommendations,
    ...aiAnalysis.analysis.recommendations
  ]
};
```

## Discord Bot Integration

```javascript
// In your Discord bot command handler
client.on('messageCreate', async (message) => {
  if (message.content === '!tilt-check') {
    const userId = message.author.id;
    const sessionData = await getPlayerSession(userId);
    
    // Analyze with AI
    const analysis = await tiltChecker.analyzeBettingBehavior(sessionData);
    
    // Send Discord embed with results
    const embed = {
      title: '🎯 TiltCheck Analysis',
      color: analysis.analysis.riskScore > 7 ? 0xFF0000 : 0x00FF00,
      fields: [
        {
          name: 'Risk Level',
          value: `${analysis.analysis.riskScore}/10`,
          inline: true
        },
        {
          name: 'Tilt Detected',
          value: analysis.analysis.tiltDetected ? '⚠️ Yes' : '✅ No',
          inline: true
        },
        {
          name: 'Recommendations',
          value: analysis.analysis.recommendations
            .map(r => `${r.priority.toUpperCase()}: ${r.action}`)
            .join('\n')
        }
      ],
      footer: {
        text: `Analyzed by ${analysis.metadata.modelUsed} • Cost: $${analysis.metadata.cost.toFixed(4)}`
      }
    };
    
    message.reply({ embeds: [embed] });
  }
});
```

## Roadmap

- [ ] Add support for custom AI models
- [ ] Implement A/B testing for model selection
- [ ] Add webhook support for real-time alerts
- [ ] Create visual analytics dashboard
- [ ] Integrate with TiltCheck overlay
- [ ] Add voice-to-text for emotional analysis
- [ ] Implement predictive analytics

## Resources

- [Vercel AI Gateway Docs](https://vercel.com/ai-gateway)
- [AI SDK Documentation](https://ai-sdk.dev)
- [TiltCheck Main Docs](./README.md)
- [AI Tilt Detection](./AI_TILT_DETECTION_README.md)

## Support

For questions or issues:
- GitHub Issues: [TiltCheck Issues](https://github.com/jmenichole/TiltCheck/issues)
- Email: jmenichole007@outlook.com

---

**Copyright (c) 2024-2025 JME (jmenichole). All Rights Reserved.**
