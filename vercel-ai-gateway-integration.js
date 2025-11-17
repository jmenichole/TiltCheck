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
 * Vercel AI Gateway Integration for TiltCheck
 * 
 * This module demonstrates how to integrate Vercel AI Gateway for:
 * - Multi-model AI tilt detection
 * - Automatic failover for reliability
 * - Cost optimization through smart model selection
 * - Real-time behavioral analysis and recommendations
 */

import { createAIGateway } from '@ai-sdk/ai-gateway';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

class VercelAIGatewayTiltCheck {
  constructor(config = {}) {
    // Initialize AI Gateway with custom configuration
    this.gateway = createAIGateway({
      // Use Vercel's built-in authentication or bring your own keys
      useVercelAuth: config.useVercelAuth ?? true,
      
      // Automatic failover configuration
      failover: {
        enabled: true,
        maxRetries: 3,
        fallbackProviders: ['openai', 'anthropic', 'google']
      },
      
      // Cost optimization settings
      costOptimization: {
        enabled: config.costOptimization ?? true,
        preferredModels: {
          simple: 'gpt-3.5-turbo',      // For quick analysis
          moderate: 'gpt-4',             // For standard detection
          complex: 'gpt-4-turbo',        // For deep behavioral analysis
          fallback: 'claude-3-sonnet'    // Backup model
        }
      },
      
      // Observability and monitoring
      monitoring: {
        enabled: true,
        logLevel: config.logLevel || 'info'
      }
    });
    
    // Model selection strategy
    this.modelStrategy = config.modelStrategy || 'auto';
    
    // Store session data for context
    this.sessionContext = new Map();
  }

  /**
   * Select the best model based on analysis complexity
   */
  selectModel(complexity = 'moderate', context = {}) {
    const { costOptimization, userPreference } = context;
    
    // User-specified model takes precedence
    if (userPreference) {
      return this.gateway.model(userPreference);
    }
    
    // Auto-select based on complexity
    const modelMap = {
      simple: 'gpt-3.5-turbo',
      moderate: 'gpt-4',
      complex: 'gpt-4-turbo',
      deep: 'claude-3-opus'
    };
    
    let selectedModel = modelMap[complexity] || modelMap.moderate;
    
    // Cost optimization: downgrade to cheaper model if enabled
    if (costOptimization && complexity === 'moderate') {
      selectedModel = 'gpt-3.5-turbo';
    }
    
    return this.gateway.model(selectedModel);
  }

  /**
   * Analyze betting behavior with AI-powered insights
   * Use Case #1: Enhanced Tilt Detection with Multi-Model Analysis
   */
  async analyzeBettingBehavior(sessionData, options = {}) {
    const {
      playerId,
      bettingHistory,
      currentStake,
      sessionDuration,
      emotionalIndicators
    } = sessionData;
    
    const complexity = this.assessAnalysisComplexity(bettingHistory);
    const model = this.selectModel(complexity, options);
    
    const prompt = this.constructAnalysisPrompt(sessionData);
    
    try {
      // Primary analysis with automatic failover
      const response = await model.generateText({
        prompt,
        temperature: 0.3,  // Lower temperature for more consistent analysis
        maxTokens: 1000,
        stream: options.stream ?? false
      });
      
      const analysis = this.parseAIResponse(response.text);
      
      return {
        success: true,
        analysis,
        model: response.model,
        confidence: analysis.confidence,
        recommendations: analysis.recommendations,
        metadata: {
          modelUsed: response.model,
          tokensUsed: response.usage.totalTokens,
          responseTime: response.metadata.responseTime,
          cost: this.estimateCost(response)
        }
      };
      
    } catch (error) {
      // Automatic failover kicks in through the gateway
      console.error('AI analysis error, failover in progress:', error.message);
      throw error;
    }
  }

  /**
   * Generate real-time recommendations
   * Use Case #2: Real-time AI Recommendations
   */
  async generateRecommendations(sessionData, riskScore) {
    const model = this.selectModel('simple'); // Use faster model for recommendations
    
    const prompt = `
Based on the following gaming session data and risk score, provide 3 specific, actionable recommendations:

Risk Score: ${riskScore}/10
Session Duration: ${sessionData.sessionDuration} minutes
Current Stake: $${sessionData.currentStake}
Bet Count: ${sessionData.betCount}
Win Rate: ${sessionData.winRate}%

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "string",
      "reasoning": "string"
    }
  ]
}
`;
    
    try {
      const response = await model.generateText({
        prompt,
        temperature: 0.5,
        maxTokens: 500
      });
      
      return JSON.parse(response.text);
    } catch (error) {
      // Return default recommendations if AI fails
      return this.getDefaultRecommendations(riskScore);
    }
  }

  /**
   * Detect pattern anomalies across multiple models
   * Use Case #3: Pattern Recognition with Model Ensemble
   */
  async detectPatternAnomalies(bettingHistory) {
    // Use multiple models for consensus
    const models = [
      this.gateway.model('gpt-4'),
      this.gateway.model('claude-3-sonnet'),
      this.gateway.model('gemini-pro')
    ];
    
    const prompt = this.constructPatternAnalysisPrompt(bettingHistory);
    
    // Run parallel analysis with multiple models
    const analyses = await Promise.allSettled(
      models.map(model => 
        model.generateText({
          prompt,
          temperature: 0.2,
          maxTokens: 300
        })
      )
    );
    
    // Aggregate results for consensus
    const validAnalyses = analyses
      .filter(result => result.status === 'fulfilled')
      .map(result => this.parseAIResponse(result.value.text));
    
    return this.aggregatePatternAnalyses(validAnalyses);
  }

  /**
   * Cost-optimized batch analysis
   * Use Case #4: Cost Optimization through Smart Model Selection
   */
  async batchAnalyze(sessions, options = {}) {
    const results = [];
    
    for (const session of sessions) {
      // Simple sessions use cheaper models
      const complexity = this.assessAnalysisComplexity(session.bettingHistory);
      const useCheaperModel = complexity === 'simple' || options.costOptimization;
      
      const analysis = await this.analyzeBettingBehavior(session, {
        costOptimization: useCheaperModel
      });
      
      results.push(analysis);
      
      // Rate limiting
      if (options.rateLimit) {
        await this.sleep(options.rateLimit);
      }
    }
    
    return {
      results,
      totalCost: results.reduce((sum, r) => sum + r.metadata.cost, 0),
      avgResponseTime: results.reduce((sum, r) => sum + r.metadata.responseTime, 0) / results.length
    };
  }

  /**
   * Real-time streaming analysis for live monitoring
   * Use Case #5: Streaming Real-time Insights
   */
  async streamLiveAnalysis(sessionData, callback) {
    const model = this.selectModel('moderate');
    const prompt = this.constructAnalysisPrompt(sessionData);
    
    const stream = await model.generateText({
      prompt,
      temperature: 0.3,
      maxTokens: 1000,
      stream: true
    });
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      fullResponse += chunk.text;
      
      // Callback for real-time UI updates
      if (callback) {
        callback({
          type: 'chunk',
          text: chunk.text,
          accumulated: fullResponse
        });
      }
    }
    
    const analysis = this.parseAIResponse(fullResponse);
    
    if (callback) {
      callback({
        type: 'complete',
        analysis
      });
    }
    
    return analysis;
  }

  /**
   * Multi-language support with AI translation
   * Use Case #6: AI-Powered Localization
   */
  async translateRecommendations(recommendations, targetLanguage) {
    const model = this.gateway.model('gpt-3.5-turbo'); // Use cheaper model for translation
    
    const prompt = `Translate the following gaming recommendations to ${targetLanguage}. Maintain the JSON structure:
${JSON.stringify(recommendations, null, 2)}`;
    
    const response = await model.generateText({
      prompt,
      temperature: 0.3,
      maxTokens: 1000
    });
    
    return JSON.parse(response.text);
  }

  /**
   * Helper: Assess analysis complexity
   */
  assessAnalysisComplexity(bettingHistory) {
    if (!bettingHistory || bettingHistory.length < 5) {
      return 'simple';
    }
    
    if (bettingHistory.length < 20) {
      return 'moderate';
    }
    
    if (bettingHistory.length < 50) {
      return 'complex';
    }
    
    return 'deep';
  }

  /**
   * Helper: Construct analysis prompt
   */
  constructAnalysisPrompt(sessionData) {
    return `Analyze the following gambling session data and identify tilt indicators:

Player ID: ${sessionData.playerId}
Session Duration: ${sessionData.sessionDuration} minutes
Current Stake: $${sessionData.currentStake}
Betting History: ${JSON.stringify(sessionData.bettingHistory.slice(-10))}
Emotional Indicators: ${JSON.stringify(sessionData.emotionalIndicators)}

Provide analysis in JSON format:
{
  "tiltDetected": boolean,
  "riskScore": number (0-10),
  "confidence": number (0-1),
  "primaryConcerns": ["string"],
  "recommendations": [
    {
      "priority": "critical|high|medium|low",
      "action": "string",
      "reasoning": "string"
    }
  ],
  "patterns": {
    "bettingPattern": "string",
    "emotionalState": "string",
    "riskLevel": "low|medium|high|critical"
  }
}`;
  }

  /**
   * Helper: Construct pattern analysis prompt
   */
  constructPatternAnalysisPrompt(bettingHistory) {
    return `Analyze this betting pattern for anomalies:
${JSON.stringify(bettingHistory)}

Identify:
1. Unusual betting sequences
2. Loss chasing behavior
3. Emotional betting indicators
4. Time-based patterns

Return JSON with detected anomalies and confidence scores.`;
  }

  /**
   * Helper: Parse AI response
   */
  parseAIResponse(text) {
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return structured text
      return {
        tiltDetected: text.toLowerCase().includes('tilt'),
        riskScore: this.extractRiskScore(text),
        confidence: 0.7,
        rawResponse: text
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        error: true,
        rawResponse: text
      };
    }
  }

  /**
   * Helper: Extract risk score from text
   */
  extractRiskScore(text) {
    const scoreMatch = text.match(/risk[:\s]*(\d+(?:\.\d+)?)/i);
    return scoreMatch ? parseFloat(scoreMatch[1]) : 5;
  }

  /**
   * Helper: Aggregate pattern analyses from multiple models
   */
  aggregatePatternAnalyses(analyses) {
    if (analyses.length === 0) {
      return { anomaliesDetected: false, confidence: 0 };
    }
    
    // Calculate consensus
    const avgConfidence = analyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / analyses.length;
    const anomalyVotes = analyses.filter(a => a.anomalyDetected || a.tiltDetected).length;
    
    return {
      anomaliesDetected: anomalyVotes > analyses.length / 2,
      confidence: avgConfidence,
      consensus: `${anomalyVotes}/${analyses.length} models detected anomalies`,
      details: analyses
    };
  }

  /**
   * Helper: Get default recommendations
   */
  getDefaultRecommendations(riskScore) {
    const templates = {
      high: [
        { priority: 'high', action: 'Take a break', reasoning: 'High risk detected' },
        { priority: 'high', action: 'Set hard limits', reasoning: 'Prevent further losses' },
        { priority: 'medium', action: 'Review session', reasoning: 'Analyze patterns' }
      ],
      medium: [
        { priority: 'medium', action: 'Reduce bet size', reasoning: 'Moderate risk detected' },
        { priority: 'medium', action: 'Monitor closely', reasoning: 'Watch for escalation' },
        { priority: 'low', action: 'Consider break', reasoning: 'Preventive measure' }
      ],
      low: [
        { priority: 'low', action: 'Continue monitoring', reasoning: 'Low risk' },
        { priority: 'low', action: 'Maintain limits', reasoning: 'Good practices' }
      ]
    };
    
    const category = riskScore > 7 ? 'high' : riskScore > 4 ? 'medium' : 'low';
    return { recommendations: templates[category] };
  }

  /**
   * Helper: Estimate cost
   */
  estimateCost(response) {
    // Simplified cost estimation (actual costs vary by model)
    const costPerToken = {
      'gpt-3.5-turbo': 0.0000015,
      'gpt-4': 0.00003,
      'gpt-4-turbo': 0.00001,
      'claude-3-sonnet': 0.000015,
      'gemini-pro': 0.0000005
    };
    
    const modelCost = costPerToken[response.model] || 0.00001;
    return response.usage.totalTokens * modelCost;
  }

  /**
   * Helper: Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get gateway statistics and monitoring data
   */
  async getGatewayStats() {
    return {
      totalRequests: this.gateway.stats.totalRequests,
      successRate: this.gateway.stats.successRate,
      avgResponseTime: this.gateway.stats.avgResponseTime,
      totalCost: this.gateway.stats.totalCost,
      modelDistribution: this.gateway.stats.modelDistribution,
      failoverEvents: this.gateway.stats.failoverEvents
    };
  }
}

// Export for use in both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VercelAIGatewayTiltCheck;
}

if (typeof window !== 'undefined') {
  window.VercelAIGatewayTiltCheck = VercelAIGatewayTiltCheck;
}
