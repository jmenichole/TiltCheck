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
 * Example configuration for Vercel AI Gateway integration
 * Copy this file to vercel-ai-config.js and customize for your needs
 */

module.exports = {
  // Gateway authentication settings
  authentication: {
    // Option 1: Use Vercel's built-in authentication (recommended)
    useVercelAuth: true,
    vercelApiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
    
    // Option 2: Bring your own API keys (BYOK)
    useOwnKeys: false,
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_AI_API_KEY,
      cohere: process.env.COHERE_API_KEY
    }
  },

  // Model selection preferences
  modelPreferences: {
    // Quick analyses (< 5 bets)
    simple: {
      primary: 'gpt-3.5-turbo',
      fallback: 'claude-3-haiku',
      maxTokens: 500,
      temperature: 0.3
    },
    
    // Standard analyses (5-20 bets)
    moderate: {
      primary: 'gpt-4',
      fallback: 'claude-3-sonnet',
      maxTokens: 1000,
      temperature: 0.3
    },
    
    // Complex analyses (20-50 bets)
    complex: {
      primary: 'gpt-4-turbo',
      fallback: 'claude-3-opus',
      maxTokens: 2000,
      temperature: 0.2
    },
    
    // Deep analyses (50+ bets)
    deep: {
      primary: 'gpt-4-turbo',
      fallback: 'claude-3-opus',
      maxTokens: 3000,
      temperature: 0.2
    },
    
    // Real-time recommendations (fast, cheap)
    recommendations: {
      primary: 'gpt-3.5-turbo',
      fallback: 'gemini-pro',
      maxTokens: 500,
      temperature: 0.5
    },
    
    // Translation services
    translation: {
      primary: 'gpt-3.5-turbo',
      fallback: 'gemini-pro',
      maxTokens: 1000,
      temperature: 0.3
    }
  },

  // Automatic failover configuration
  failover: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000, // ms
    
    // Provider priority order for failover
    providerPriority: [
      'openai',
      'anthropic',
      'google',
      'cohere'
    ],
    
    // Conditions that trigger failover
    failoverConditions: {
      rateLimitErrors: true,
      timeoutErrors: true,
      serviceErrors: true,
      invalidResponseErrors: true
    }
  },

  // Cost optimization settings
  costOptimization: {
    enabled: true,
    
    // Auto-downgrade to cheaper models when possible
    autoDowngrade: true,
    
    // Cost limits
    limits: {
      perRequest: 0.10,      // Maximum cost per request ($)
      perHour: 5.00,         // Maximum hourly spending ($)
      perDay: 50.00,         // Maximum daily spending ($)
      perMonth: 1000.00      // Maximum monthly spending ($)
    },
    
    // Cache settings to reduce costs
    caching: {
      enabled: true,
      ttl: 300,              // Cache TTL in seconds (5 minutes)
      maxSize: 1000,         // Maximum cache entries
      keyPrefix: 'tiltcheck-ai-'
    },
    
    // Batch processing optimization
    batching: {
      enabled: true,
      maxBatchSize: 10,
      batchDelay: 100        // ms between batch requests
    }
  },

  // Rate limiting configuration
  rateLimiting: {
    enabled: true,
    
    // Requests per minute by model type
    limits: {
      'gpt-3.5-turbo': 100,
      'gpt-4': 20,
      'gpt-4-turbo': 30,
      'claude-3-haiku': 100,
      'claude-3-sonnet': 50,
      'claude-3-opus': 20,
      'gemini-pro': 60
    },
    
    // Global limit across all models
    globalLimit: 150,       // requests per minute
    
    // Behavior when limit reached
    onLimitReached: 'queue' // 'queue', 'reject', 'fallback'
  },

  // Monitoring and observability
  monitoring: {
    enabled: true,
    
    // Logging configuration
    logging: {
      level: 'info',        // 'debug', 'info', 'warn', 'error'
      logRequests: true,
      logResponses: false,  // Can be verbose
      logErrors: true,
      logPerformance: true
    },
    
    // Metrics collection
    metrics: {
      enabled: true,
      collectLatency: true,
      collectCosts: true,
      collectTokenUsage: true,
      collectFailoverEvents: true
    },
    
    // Alerts
    alerts: {
      enabled: true,
      
      // Cost alerts
      costThresholds: {
        hourly: 4.00,       // Alert at $4/hour
        daily: 40.00,       // Alert at $40/day
        monthly: 800.00     // Alert at $800/month
      },
      
      // Performance alerts
      performanceThresholds: {
        avgLatency: 5000,   // Alert if avg latency > 5s
        errorRate: 0.05,    // Alert if error rate > 5%
        failoverRate: 0.10  // Alert if failover rate > 10%
      },
      
      // Notification channels
      notificationChannels: {
        email: {
          enabled: false,
          recipients: ['admin@example.com']
        },
        discord: {
          enabled: true,
          webhookUrl: process.env.DISCORD_ALERT_WEBHOOK
        },
        slack: {
          enabled: false,
          webhookUrl: process.env.SLACK_WEBHOOK_URL
        }
      }
    }
  },

  // Context management
  context: {
    // Session context settings
    sessionContext: {
      enabled: true,
      maxHistoryLength: 50,  // Max bets to include in context
      includeTimestamps: true,
      includeMetadata: true
    },
    
    // User context
    userContext: {
      enabled: true,
      includePreferences: true,
      includeHistory: true,
      historyDays: 30
    }
  },

  // Advanced features
  advanced: {
    // Multi-model consensus
    consensus: {
      enabled: false,        // Disabled by default (higher cost)
      minModels: 2,
      maxModels: 3,
      agreementThreshold: 0.7 // 70% agreement required
    },
    
    // Streaming responses
    streaming: {
      enabled: true,
      chunkSize: 50,         // Characters per chunk
      updateInterval: 100    // ms between updates
    },
    
    // A/B testing
    abTesting: {
      enabled: false,
      experiments: [
        {
          name: 'model-comparison',
          variants: {
            control: 'gpt-4',
            variant: 'claude-3-sonnet'
          },
          traffic: 0.5         // 50/50 split
        }
      ]
    },
    
    // Custom prompts
    customPrompts: {
      enabled: false,
      templates: {
        // Custom prompt templates can be defined here
      }
    }
  },

  // Integration settings
  integration: {
    // Discord bot integration
    discord: {
      enabled: true,
      embedResults: true,
      includeMetadata: true,
      maxRecommendations: 3
    },
    
    // Web dashboard integration
    dashboard: {
      enabled: true,
      realTimeUpdates: true,
      includeCharts: true
    },
    
    // API endpoints
    api: {
      enabled: true,
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      endpoints: {
        analyze: '/api/ai/analyze',
        recommend: '/api/ai/recommend',
        stats: '/api/ai/stats'
      }
    }
  },

  // Development settings
  development: {
    // Use cheaper models in development
    useCheaperModels: process.env.NODE_ENV === 'development',
    
    // Mock responses for testing
    mockResponses: false,
    
    // Verbose logging
    verboseLogging: process.env.NODE_ENV === 'development',
    
    // Test mode
    testMode: false
  },

  // Production settings
  production: {
    // Use production-grade models
    useProductionModels: process.env.NODE_ENV === 'production',
    
    // Strict error handling
    strictErrorHandling: true,
    
    // Enhanced monitoring
    enhancedMonitoring: true,
    
    // Backup and recovery
    backupEnabled: true
  }
};
