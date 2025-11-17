/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 */

/**
 * MCP Server for TiltCheck Ecosystem
 * 
 * Model Context Protocol (MCP) server that allows AI assistants (like Claude, GPT)
 * to interact with TiltCheck, JustTheTip, and QualifyFirst in real-time.
 * 
 * Use Cases:
 * - AI can query user tilt status in real-time
 * - AI can trigger vault recommendations
 * - AI can analyze trends and generate reports
 * - AI can provide personalized interventions
 * 
 * Why MCP vs Codespaces:
 * - MCP: Lets AI access your running services (runtime integration)
 * - Codespaces: Cloud dev environment (development only)
 * - This: Production service that AI tools can call
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Import our standalone services
const JustTheTipStandalone = require('./justthetip-standalone.js');
const UnifiedEcosystemHub = require('./unified-ecosystem-hub.js');

class TiltCheckMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'tiltcheck-ecosystem',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize services
    this.justTheTip = new JustTheTipStandalone({
      integrations: {
        tiltCheck: true,
        qualifyFirst: false,
        aiGateway: false,
        adminPanel: false
      }
    });

    this.ecosystemHub = new UnifiedEcosystemHub({
      aiGateway: { enabled: false }, // Don't use AI Gateway in MCP server to avoid loops
      tiltCheck: { enabled: true },
      justTheTip: { enabled: true },
      qualifyFirst: { enabled: false }
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // JustTheTip Tools
        {
          name: 'process_tip',
          description: 'Process a cryptocurrency tip with behavioral analysis',
          inputSchema: {
            type: 'object',
            properties: {
              fromUser: { type: 'string', description: 'User ID sending the tip' },
              toUser: { type: 'string', description: 'User ID receiving the tip' },
              amount: { type: 'number', description: 'Tip amount' },
              currency: { type: 'string', description: 'Currency (SOL, ETH, etc)', default: 'SOL' },
              message: { type: 'string', description: 'Optional message with tip' }
            },
            required: ['fromUser', 'toUser', 'amount']
          }
        },
        {
          name: 'create_vault',
          description: 'Create a savings vault for user (HODL, YOLO, Regret, GrassTouching, Therapy)',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'string', description: 'User ID' },
              vaultType: { 
                type: 'string', 
                enum: ['HODL', 'YOLO', 'Regret', 'GrassTouching', 'Therapy'],
                description: 'Type of vault to create'
              },
              amount: { type: 'number', description: 'Amount to lock in vault' }
            },
            required: ['userId', 'vaultType', 'amount']
          }
        },
        {
          name: 'get_user_vaults',
          description: 'Get all vaults for a user',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'string', description: 'User ID' }
            },
            required: ['userId']
          }
        },
        {
          name: 'check_vault_status',
          description: 'Check if a vault can be unlocked',
          inputSchema: {
            type: 'object',
            properties: {
              vaultId: { type: 'string', description: 'Vault ID' }
            },
            required: ['vaultId']
          }
        },

        // TiltCheck Tools
        {
          name: 'analyze_tilt_risk',
          description: 'Analyze user gambling behavior for tilt detection',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'string', description: 'User ID' },
              bettingHistory: {
                type: 'array',
                description: 'Array of recent bets',
                items: {
                  type: 'object',
                  properties: {
                    amount: { type: 'number' },
                    outcome: { type: 'string', enum: ['win', 'loss'] },
                    timestamp: { type: 'number' }
                  }
                }
              },
              currentStake: { type: 'number', description: 'Current balance' },
              sessionDuration: { type: 'number', description: 'Minutes in session' }
            },
            required: ['userId', 'bettingHistory']
          }
        },
        {
          name: 'generate_intervention',
          description: 'Generate personalized intervention strategy for at-risk user',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'string', description: 'User ID' },
              riskScore: { type: 'number', description: 'Risk score 0-10' },
              behaviorPatterns: {
                type: 'object',
                description: 'Observed behavior patterns'
              }
            },
            required: ['userId', 'riskScore']
          }
        },

        // Analytics Tools
        {
          name: 'get_analytics_report',
          description: 'Generate analytics report for admin panel',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: {
                type: 'string',
                enum: ['hourly', 'daily', 'weekly', 'monthly'],
                default: 'daily',
                description: 'Report timeframe'
              },
              userId: {
                type: 'string',
                description: 'Optional: Get report for specific user'
              }
            }
          }
        },
        {
          name: 'get_system_status',
          description: 'Get overall system status and health',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },

        // User Feedback Tools
        {
          name: 'record_feedback',
          description: 'Record user feedback on interventions',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              interventionId: { type: 'string' },
              rating: { type: 'number', minimum: 1, maximum: 5 },
              helpful: { type: 'boolean' },
              comment: { type: 'string' },
              actionTaken: { type: 'string' },
              outcome: { type: 'string', enum: ['positive', 'negative', 'neutral'] }
            },
            required: ['userId', 'rating']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'process_tip':
            return await this.handleProcessTip(args);
          
          case 'create_vault':
            return await this.handleCreateVault(args);
          
          case 'get_user_vaults':
            return await this.handleGetUserVaults(args);
          
          case 'check_vault_status':
            return await this.handleCheckVaultStatus(args);
          
          case 'analyze_tilt_risk':
            return await this.handleAnalyzeTiltRisk(args);
          
          case 'generate_intervention':
            return await this.handleGenerateIntervention(args);
          
          case 'get_analytics_report':
            return await this.handleGetAnalyticsReport(args);
          
          case 'get_system_status':
            return await this.handleGetSystemStatus(args);
          
          case 'record_feedback':
            return await this.handleRecordFeedback(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  // Tool Handlers

  async handleProcessTip(args) {
    const result = await this.justTheTip.processTip(args);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            tip: result,
            vaultSuggestion: result.vaultSuggestion,
            behaviorAnalysis: result.behaviorAnalysis
          }, null, 2)
        }
      ]
    };
  }

  async handleCreateVault(args) {
    const vault = await this.justTheTip.createVault(
      args.userId,
      args.vaultType,
      args.amount
    );
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            vault,
            message: `${vault.emoji} ${vault.name} created! Unlocks in ${Math.ceil(vault.lockPeriod / (24 * 60 * 60 * 1000))} days.`
          }, null, 2)
        }
      ]
    };
  }

  async handleGetUserVaults(args) {
    const vaults = this.justTheTip.getUserVaults(args.userId);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            vaults,
            count: vaults.length
          }, null, 2)
        }
      ]
    };
  }

  async handleCheckVaultStatus(args) {
    const canUnlock = this.justTheTip.canUnlockVault(args.vaultId);
    const vault = this.justTheTip.vaults.get(args.vaultId);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            vaultId: args.vaultId,
            canUnlock,
            status: vault?.status,
            unlockAt: vault?.unlockAt,
            timeRemaining: vault ? vault.unlockAt - Date.now() : null
          }, null, 2)
        }
      ]
    };
  }

  async handleAnalyzeTiltRisk(args) {
    const analysis = await this.ecosystemHub.analyzeSession({
      userId: args.userId,
      bettingHistory: args.bettingHistory || [],
      currentStake: args.currentStake,
      sessionDuration: args.sessionDuration
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            analysis: {
              riskScore: analysis.tiltCheck?.riskScore,
              tiltDetected: analysis.tiltCheck?.tiltDetected,
              emotionalIndicators: analysis.tiltCheck?.emotionalIndicators,
              vaultRecommendation: analysis.vaultRecommendation,
              aiInsights: analysis.aiAnalysis?.analysis
            }
          }, null, 2)
        }
      ]
    };
  }

  async handleGenerateIntervention(args) {
    const analysis = {
      userId: args.userId,
      tiltCheck: { riskScore: args.riskScore },
      behaviorPatterns: args.behaviorPatterns
    };
    
    const intervention = await this.ecosystemHub.generateIntervention(analysis);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            intervention
          }, null, 2)
        }
      ]
    };
  }

  async handleGetAnalyticsReport(args) {
    const report = await this.ecosystemHub.generateAnalyticsReport(
      args.timeframe || 'daily'
    );
    
    // If userId specified, filter to that user
    if (args.userId) {
      const userSessions = this.ecosystemHub.analytics.sessions.filter(
        s => s.userId === args.userId
      );
      report.userSpecific = {
        userId: args.userId,
        sessions: userSessions.length,
        avgRiskScore: userSessions.reduce((sum, s) => sum + (s.tiltCheck?.riskScore || 0), 0) / userSessions.length
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            report
          }, null, 2)
        }
      ]
    };
  }

  async handleGetSystemStatus() {
    const justTheTipStatus = this.justTheTip.getStatus();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            ecosystem: {
              justTheTip: justTheTipStatus,
              tiltCheck: { status: 'running' },
              totalSessions: this.ecosystemHub.analytics.sessions.length,
              totalInterventions: this.ecosystemHub.analytics.interventions.length,
              totalVaults: this.ecosystemHub.analytics.vaultActions.length
            }
          }, null, 2)
        }
      ]
    };
  }

  async handleRecordFeedback(args) {
    const feedback = await this.ecosystemHub.processFeedback(args);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            feedback,
            message: 'Feedback recorded. Thank you for helping us improve!'
          }, null, 2)
        }
      ]
    };
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('TiltCheck MCP Server running on stdio');
    console.error('Available tools: process_tip, create_vault, analyze_tilt_risk, and more');
  }
}

// Run server if called directly
if (require.main === module) {
  const server = new TiltCheckMCPServer();
  server.run().catch(console.error);
}

module.exports = TiltCheckMCPServer;
