/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

/**
 * Vercel AI Gateway Demo for TiltCheck
 * 
 * This demo shows practical examples of using Vercel AI Gateway
 * for tilt detection and behavioral analysis.
 * 
 * Run with: node vercel-ai-gateway-demo.js
 */

// Mock implementation for demonstration purposes
// In production, replace with actual @ai-sdk/ai-gateway imports

class MockAIGateway {
  constructor() {
    this.stats = {
      totalRequests: 0,
      successRate: 0.98,
      avgResponseTime: 1200,
      totalCost: 0,
      modelDistribution: {},
      failoverEvents: 0
    };
  }

  model(modelName) {
    return {
      generateText: async (options) => {
        // Simulate API call
        await this.sleep(Math.random() * 1000 + 500);
        
        this.stats.totalRequests++;
        this.stats.totalCost += Math.random() * 0.02;
        
        const mockResponse = this.generateMockResponse(options.prompt, modelName);
        
        return {
          text: JSON.stringify(mockResponse),
          model: modelName,
          usage: {
            totalTokens: Math.floor(Math.random() * 500 + 200)
          },
          metadata: {
            responseTime: Math.random() * 2000 + 500
          }
        };
      }
    };
  }

  generateMockResponse(prompt, model) {
    const hasHighRisk = prompt.includes('loss') || prompt.includes('emotional');
    
    return {
      tiltDetected: hasHighRisk,
      riskScore: hasHighRisk ? Math.random() * 3 + 7 : Math.random() * 5 + 2,
      confidence: 0.85,
      primaryConcerns: hasHighRisk 
        ? ["Loss chasing behavior", "Emotional betting", "Increased stake size"]
        : ["Normal betting patterns"],
      recommendations: [
        {
          priority: hasHighRisk ? "high" : "low",
          action: hasHighRisk ? "Take a break immediately" : "Continue monitoring",
          reasoning: hasHighRisk 
            ? "Multiple high-risk indicators detected"
            : "Behavior within normal parameters"
        }
      ],
      patterns: {
        bettingPattern: hasHighRisk ? "escalating" : "consistent",
        emotionalState: hasHighRisk ? "stressed" : "calm",
        riskLevel: hasHighRisk ? "critical" : "low"
      }
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Demo implementation
class VercelAIGatewayDemo {
  constructor() {
    console.log('🚀 Initializing Vercel AI Gateway Demo for TiltCheck\n');
    
    // In production, use: import { createAIGateway } from '@ai-sdk/ai-gateway';
    this.gateway = new MockAIGateway();
    
    console.log('✅ Gateway initialized (using mock for demo)\n');
  }

  async runAllDemos() {
    console.log('='.repeat(80));
    console.log('VERCEL AI GATEWAY DEMO - TILTCHECK USE CASES');
    console.log('='.repeat(80) + '\n');

    try {
      await this.demo1_BasicAnalysis();
      await this.demo2_MultiModelConsensus();
      await this.demo3_CostOptimization();
      await this.demo4_RealTimeRecommendations();
      await this.demo5_FailoverResilience();
      await this.demo6_BatchProcessing();
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ ALL DEMOS COMPLETED SUCCESSFULLY');
      console.log('='.repeat(80) + '\n');
      
      await this.showGatewayStats();
      
    } catch (error) {
      console.error('❌ Demo error:', error);
    }
  }

  async demo1_BasicAnalysis() {
    console.log('DEMO 1: Basic Tilt Analysis with Automatic Model Selection');
    console.log('-'.repeat(70) + '\n');

    const sessionData = {
      playerId: 'demo_user_001',
      bettingHistory: [
        { amount: 50, outcome: 'loss', timestamp: Date.now() - 300000 },
        { amount: 100, outcome: 'loss', timestamp: Date.now() - 240000 },
        { amount: 200, outcome: 'loss', timestamp: Date.now() - 180000 },
        { amount: 400, outcome: 'win', timestamp: Date.now() - 120000 },
        { amount: 800, outcome: 'loss', timestamp: Date.now() - 60000 }
      ],
      currentStake: 650,
      sessionDuration: 45,
      emotionalIndicators: {
        betSpeedIncrease: true,
        stakeSizeEscalation: true,
        lossChasing: true
      }
    };

    console.log('📊 Session Data:');
    console.log(`   Player: ${sessionData.playerId}`);
    console.log(`   Bets: ${sessionData.bettingHistory.length}`);
    console.log(`   Current Stake: $${sessionData.currentStake}`);
    console.log(`   Session Duration: ${sessionData.sessionDuration}min\n`);

    console.log('🔍 Analyzing with AI Gateway...\n');

    const model = this.gateway.model('gpt-4');
    const prompt = this.constructPrompt(sessionData);
    
    const startTime = Date.now();
    const response = await model.generateText({ prompt });
    const duration = Date.now() - startTime;
    
    const analysis = JSON.parse(response.text);

    console.log('📈 Analysis Results:');
    console.log(`   Model Used: ${response.model}`);
    console.log(`   Response Time: ${duration}ms`);
    console.log(`   Tilt Detected: ${analysis.tiltDetected ? '⚠️ YES' : '✅ NO'}`);
    console.log(`   Risk Score: ${analysis.riskScore.toFixed(1)}/10`);
    console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
    console.log(`   Risk Level: ${analysis.patterns.riskLevel.toUpperCase()}\n`);

    console.log('💡 Recommendations:');
    analysis.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
      console.log(`      → ${rec.reasoning}`);
    });

    console.log('\n✅ Demo 1 Complete\n');
  }

  async demo2_MultiModelConsensus() {
    console.log('DEMO 2: Multi-Model Consensus for Higher Accuracy');
    console.log('-'.repeat(70) + '\n');

    const bettingHistory = [
      { bet: 50, time: '10:00', outcome: 'loss' },
      { bet: 100, time: '10:05', outcome: 'loss' },
      { bet: 200, time: '10:08', outcome: 'loss' },
      { bet: 400, time: '10:10', outcome: 'win' }
    ];

    console.log('📊 Using multiple AI models for consensus...\n');

    const models = [
      { name: 'gpt-4', model: this.gateway.model('gpt-4') },
      { name: 'claude-3-sonnet', model: this.gateway.model('claude-3-sonnet') },
      { name: 'gemini-pro', model: this.gateway.model('gemini-pro') }
    ];

    const analyses = [];

    for (const { name, model } of models) {
      console.log(`🤖 Analyzing with ${name}...`);
      const response = await model.generateText({
        prompt: `Analyze betting pattern: ${JSON.stringify(bettingHistory)}`
      });
      const analysis = JSON.parse(response.text);
      analyses.push({ model: name, analysis });
      console.log(`   Tilt Detected: ${analysis.tiltDetected ? '⚠️ YES' : '✅ NO'}`);
      console.log(`   Risk Score: ${analysis.riskScore.toFixed(1)}/10\n`);
    }

    // Calculate consensus
    const tiltVotes = analyses.filter(a => a.analysis.tiltDetected).length;
    const avgRiskScore = analyses.reduce((sum, a) => sum + a.analysis.riskScore, 0) / analyses.length;

    console.log('🎯 Consensus Results:');
    console.log(`   Tilt Votes: ${tiltVotes}/${analyses.length} models`);
    console.log(`   Average Risk Score: ${avgRiskScore.toFixed(1)}/10`);
    console.log(`   Consensus: ${tiltVotes > 1 ? '⚠️ TILT DETECTED' : '✅ NORMAL BEHAVIOR'}\n`);

    console.log('✅ Demo 2 Complete\n');
  }

  async demo3_CostOptimization() {
    console.log('DEMO 3: Cost Optimization through Smart Model Selection');
    console.log('-'.repeat(70) + '\n');

    const testCases = [
      {
        name: 'Simple Analysis (3 bets)',
        bets: 3,
        model: 'gpt-3.5-turbo',
        estimatedCost: 0.002
      },
      {
        name: 'Moderate Analysis (15 bets)',
        bets: 15,
        model: 'gpt-4',
        estimatedCost: 0.015
      },
      {
        name: 'Complex Analysis (50 bets)',
        bets: 50,
        model: 'gpt-4-turbo',
        estimatedCost: 0.010
      }
    ];

    console.log('💰 Cost Comparison:\n');

    let totalCost = 0;
    let totalOptimizedCost = 0;

    for (const testCase of testCases) {
      console.log(`📊 ${testCase.name}`);
      console.log(`   Optimal Model: ${testCase.model}`);
      console.log(`   Estimated Cost: $${testCase.estimatedCost.toFixed(4)}`);
      
      // Without optimization (always use GPT-4)
      const defaultCost = 0.030;
      console.log(`   Default Cost (GPT-4): $${defaultCost.toFixed(4)}`);
      
      const savings = ((defaultCost - testCase.estimatedCost) / defaultCost * 100).toFixed(0);
      console.log(`   Savings: ${savings}% 💵\n`);

      totalCost += defaultCost;
      totalOptimizedCost += testCase.estimatedCost;
    }

    console.log('📊 Total Savings:');
    console.log(`   Without Optimization: $${totalCost.toFixed(4)}`);
    console.log(`   With Optimization: $${totalOptimizedCost.toFixed(4)}`);
    console.log(`   Total Saved: $${(totalCost - totalOptimizedCost).toFixed(4)} (${((totalCost - totalOptimizedCost) / totalCost * 100).toFixed(0)}%)\n`);

    console.log('✅ Demo 3 Complete\n');
  }

  async demo4_RealTimeRecommendations() {
    console.log('DEMO 4: Real-time AI Recommendations');
    console.log('-'.repeat(70) + '\n');

    const scenarios = [
      {
        name: 'High Risk Scenario',
        riskScore: 8.5,
        winRate: 25,
        sessionDuration: 60,
        currentStake: 500
      },
      {
        name: 'Moderate Risk Scenario',
        riskScore: 5.5,
        winRate: 45,
        sessionDuration: 30,
        currentStake: 950
      },
      {
        name: 'Low Risk Scenario',
        riskScore: 2.5,
        winRate: 52,
        sessionDuration: 20,
        currentStake: 1100
      }
    ];

    for (const scenario of scenarios) {
      console.log(`\n📊 ${scenario.name}`);
      console.log(`   Risk Score: ${scenario.riskScore}/10`);
      console.log(`   Win Rate: ${scenario.winRate}%`);
      console.log(`   Session: ${scenario.sessionDuration}min`);
      console.log(`   Stake: $${scenario.currentStake}\n`);

      console.log('🤖 Generating recommendations...');
      
      const model = this.gateway.model('gpt-3.5-turbo');
      const response = await model.generateText({
        prompt: `Generate recommendations for risk score ${scenario.riskScore}`
      });
      
      const result = JSON.parse(response.text);
      
      console.log('💡 AI Recommendations:');
      result.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
      });
    }

    console.log('\n✅ Demo 4 Complete\n');
  }

  async demo5_FailoverResilience() {
    console.log('DEMO 5: Automatic Failover and Reliability');
    console.log('-'.repeat(70) + '\n');

    console.log('🔧 Simulating provider failure scenarios...\n');

    const scenarios = [
      { provider: 'OpenAI', status: 'failed', fallback: 'Anthropic' },
      { provider: 'Anthropic', status: 'rate-limited', fallback: 'Google' },
      { provider: 'Google', status: 'timeout', fallback: 'OpenAI' }
    ];

    for (const scenario of scenarios) {
      console.log(`❌ ${scenario.provider} - ${scenario.status}`);
      console.log(`🔄 Automatically failing over to ${scenario.fallback}...`);
      
      // Simulate failover
      await this.sleep(200);
      
      console.log(`✅ Successfully switched to ${scenario.fallback}`);
      console.log(`   Analysis completed without interruption\n`);
    }

    console.log('📊 Failover Statistics:');
    console.log(`   Total Failover Events: 3`);
    console.log(`   Success Rate: 100%`);
    console.log(`   Average Failover Time: 200ms`);
    console.log(`   Zero Downtime: ✅\n`);

    console.log('✅ Demo 5 Complete\n');
  }

  async demo6_BatchProcessing() {
    console.log('DEMO 6: Efficient Batch Processing');
    console.log('-'.repeat(70) + '\n');

    const batchSize = 5;
    console.log(`📦 Processing ${batchSize} sessions in batch...\n`);

    const sessions = Array.from({ length: batchSize }, (_, i) => ({
      id: `user_${i + 1}`,
      bets: Math.floor(Math.random() * 30 + 5)
    }));

    const startTime = Date.now();

    for (const session of sessions) {
      console.log(`🔍 Analyzing ${session.id} (${session.bets} bets)...`);
      
      const model = this.gateway.model(
        session.bets < 10 ? 'gpt-3.5-turbo' : 'gpt-4'
      );
      
      await model.generateText({
        prompt: `Analyze ${session.bets} bets`
      });
      
      console.log(`   ✅ Complete (Model: ${session.bets < 10 ? 'GPT-3.5' : 'GPT-4'})`);
    }

    const duration = Date.now() - startTime;

    console.log(`\n📊 Batch Results:`);
    console.log(`   Total Sessions: ${batchSize}`);
    console.log(`   Total Time: ${duration}ms`);
    console.log(`   Avg Time per Session: ${(duration / batchSize).toFixed(0)}ms`);
    console.log(`   Throughput: ${(batchSize / (duration / 1000)).toFixed(1)} sessions/sec\n`);

    console.log('✅ Demo 6 Complete\n');
  }

  async showGatewayStats() {
    console.log('GATEWAY STATISTICS AND MONITORING');
    console.log('-'.repeat(70) + '\n');

    const stats = this.gateway.stats;

    console.log('📊 Overall Statistics:');
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`   Avg Response Time: ${stats.avgResponseTime}ms`);
    console.log(`   Total Cost: $${stats.totalCost.toFixed(4)}`);
    console.log(`   Failover Events: ${stats.failoverEvents}\n`);

    console.log('💰 Cost Breakdown:');
    console.log(`   Per Request: $${(stats.totalCost / stats.totalRequests).toFixed(4)}`);
    console.log(`   Projected Monthly: $${(stats.totalCost * 30).toFixed(2)}\n`);

    console.log('🎯 Key Benefits Demonstrated:');
    console.log('   ✅ Unified API for multiple AI providers');
    console.log('   ✅ Automatic failover and high availability');
    console.log('   ✅ Cost optimization through smart model selection');
    console.log('   ✅ Real-time monitoring and analytics');
    console.log('   ✅ Simplified integration and management\n');
  }

  constructPrompt(sessionData) {
    return `Analyze gambling session: ${JSON.stringify(sessionData)}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the demo
if (require.main === module) {
  const demo = new VercelAIGatewayDemo();
  demo.runAllDemos().catch(console.error);
}

module.exports = VercelAIGatewayDemo;
