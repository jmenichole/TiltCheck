/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 */

/**
 * JustTheTip Standalone Launch Point
 * 
 * This is a complete, independent version of JustTheTip that can launch
 * without dependencies on TiltCheck, QualifyFirst, or Vercel AI Gateway.
 * 
 * Optional integrations are loaded dynamically only if available.
 */

class JustTheTipStandalone {
  constructor(config = {}) {
    this.config = {
      // Core JustTheTip settings
      botToken: config.botToken || process.env.JUSTTHETIP_BOT_TOKEN,
      solanaRpc: config.solanaRpc || process.env.SOLANA_RPC_URL,
      vaultEnabled: config.vaultEnabled ?? true,
      
      // Optional integrations (gracefully degrade if not available)
      integrations: {
        tiltCheck: config.integrations?.tiltCheck ?? false,
        qualifyFirst: config.integrations?.qualifyFirst ?? false,
        aiGateway: config.integrations?.aiGateway ?? false,
        adminPanel: config.integrations?.adminPanel ?? false
      }
    };

    this.status = {
      core: 'ready',
      integrations: {}
    };

    // Initialize core functionality
    this.initializeCore();
    
    // Try to load integrations (non-blocking)
    this.loadIntegrations();
  }

  /**
   * Initialize core JustTheTip functionality
   * This works independently without any external dependencies
   */
  initializeCore() {
    console.log('🚀 Initializing JustTheTip Standalone...');
    
    // Core vault types
    this.vaultTypes = {
      HODL: {
        name: 'HODL Vault',
        description: 'For when dopamine hits aren\'t worth your ETH',
        emoji: '💎',
        lockPeriod: 30 * 24 * 60 * 60 * 1000 // 30 days
      },
      YOLO: {
        name: 'YOLO Vault',
        description: 'Maximum degen energy, safely contained',
        emoji: '🚀',
        lockPeriod: 7 * 24 * 60 * 60 * 1000 // 7 days
      },
      Regret: {
        name: 'Regret Vault',
        description: 'Put it here before you buy another dog coin',
        emoji: '🛡️',
        lockPeriod: 14 * 24 * 60 * 60 * 1000 // 14 days
      },
      GrassTouching: {
        name: 'Grass Touching Vault',
        description: 'Mandatory outdoor time funding',
        emoji: '🌱',
        lockPeriod: 3 * 24 * 60 * 60 * 1000 // 3 days
      },
      Therapy: {
        name: 'Therapy Vault',
        description: 'Self-care is the ultimate alpha',
        emoji: '🧘‍♂️',
        lockPeriod: 60 * 24 * 60 * 60 * 1000 // 60 days
      }
    };

    // In-memory storage (would be replaced with database in production)
    this.vaults = new Map();
    this.tips = [];
    this.users = new Map();

    console.log('✅ JustTheTip Core initialized');
    this.status.core = 'running';
  }

  /**
   * Load optional integrations dynamically
   * Failures don't crash the system
   */
  async loadIntegrations() {
    console.log('🔌 Loading optional integrations...');

    // Try TiltCheck integration
    if (this.config.integrations.tiltCheck) {
      try {
        const TiltCheckModule = await import('./tiltCheck.js').catch(() => null);
        if (TiltCheckModule) {
          this.tiltCheck = new TiltCheckModule.default();
          this.status.integrations.tiltCheck = 'connected';
          console.log('✅ TiltCheck integration loaded');
        }
      } catch (error) {
        console.log('⚠️  TiltCheck not available, continuing without it');
        this.status.integrations.tiltCheck = 'unavailable';
      }
    }

    // Try QualifyFirst integration
    if (this.config.integrations.qualifyFirst) {
      try {
        const QualifyFirstModule = await import('./qualifyfirst-integration.js').catch(() => null);
        if (QualifyFirstModule) {
          this.qualifyFirst = new QualifyFirstModule.default();
          this.status.integrations.qualifyFirst = 'connected';
          console.log('✅ QualifyFirst integration loaded');
        }
      } catch (error) {
        console.log('⚠️  QualifyFirst not available, continuing without it');
        this.status.integrations.qualifyFirst = 'unavailable';
      }
    }

    // Try AI Gateway integration
    if (this.config.integrations.aiGateway) {
      try {
        const AIGatewayModule = await import('./vercel-ai-gateway-integration.js').catch(() => null);
        if (AIGatewayModule) {
          this.aiGateway = new AIGatewayModule.default();
          this.status.integrations.aiGateway = 'connected';
          console.log('✅ AI Gateway integration loaded');
        }
      } catch (error) {
        console.log('⚠️  AI Gateway not available, continuing without it');
        this.status.integrations.aiGateway = 'unavailable';
      }
    }

    // Try Admin Panel integration
    if (this.config.integrations.adminPanel) {
      try {
        const AdminPanelModule = await import('./admin-panel-backend.js').catch(() => null);
        if (AdminPanelModule) {
          this.adminPanel = new AdminPanelModule.default();
          this.status.integrations.adminPanel = 'connected';
          console.log('✅ Admin Panel integration loaded');
        }
      } catch (error) {
        console.log('⚠️  Admin Panel not available, continuing without it');
        this.status.integrations.adminPanel = 'unavailable';
      }
    }

    console.log('🎯 JustTheTip ready with available integrations');
  }

  /**
   * Process a tip - core functionality
   */
  async processTip(tipData) {
    const { fromUser, toUser, amount, currency, message } = tipData;

    // Basic tip processing (always works)
    const tip = {
      id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUser,
      toUser,
      amount,
      currency: currency || 'SOL',
      message,
      timestamp: Date.now(),
      status: 'pending',
      behaviorAnalysis: null,
      vaultSuggestion: null
    };

    // Enhanced analysis if integrations available
    if (this.tiltCheck) {
      try {
        tip.behaviorAnalysis = await this.analyzeTipBehavior(tipData);
      } catch (error) {
        console.log('⚠️  Behavior analysis failed, continuing without it');
      }
    }

    // Vault suggestion if behavior indicates need
    if (tip.behaviorAnalysis?.impulsive) {
      tip.vaultSuggestion = this.suggestVault(tip.behaviorAnalysis);
    }

    // Store tip
    this.tips.push(tip);

    // Send to admin panel if available
    if (this.adminPanel) {
      try {
        await this.adminPanel.recordTip(tip);
      } catch (error) {
        console.log('⚠️  Admin panel recording failed');
      }
    }

    return tip;
  }

  /**
   * Analyze tip behavior (enhanced with TiltCheck if available)
   */
  async analyzeTipBehavior(tipData) {
    // Get user's recent tipping history
    const userTips = this.tips.filter(t => t.fromUser === tipData.fromUser);
    const recentTips = userTips.slice(-10);

    // Basic analysis (always available)
    const analysis = {
      tipCount: recentTips.length,
      totalAmount: recentTips.reduce((sum, t) => sum + t.amount, 0),
      avgAmount: recentTips.length > 0 ? recentTips.reduce((sum, t) => sum + t.amount, 0) / recentTips.length : 0,
      impulsive: false,
      rapidFire: false
    };

    // Check for impulsive behavior
    if (recentTips.length >= 3) {
      const lastThreeTips = recentTips.slice(-3);
      const timeDiffs = [];
      for (let i = 1; i < lastThreeTips.length; i++) {
        timeDiffs.push(lastThreeTips[i].timestamp - lastThreeTips[i-1].timestamp);
      }
      const avgTimeDiff = timeDiffs.reduce((sum, t) => sum + t, 0) / timeDiffs.length;
      analysis.rapidFire = avgTimeDiff < 60000; // < 1 minute between tips
    }

    // Check for escalating amounts
    if (recentTips.length >= 2) {
      const lastAmount = recentTips[recentTips.length - 1].amount;
      const secondLastAmount = recentTips[recentTips.length - 2].amount;
      analysis.impulsive = lastAmount > secondLastAmount * 2;
    }

    // Enhanced analysis with TiltCheck (if available)
    if (this.tiltCheck) {
      try {
        const tiltAnalysis = await this.tiltCheck.analyzeTiltRisk({
          userId: tipData.fromUser,
          activityType: 'tipping',
          recentActivity: recentTips
        });
        analysis.tiltRisk = tiltAnalysis.riskScore;
        analysis.tiltDetected = tiltAnalysis.tiltDetected;
      } catch (error) {
        console.log('⚠️  TiltCheck analysis failed');
      }
    }

    return analysis;
  }

  /**
   * Suggest appropriate vault based on behavior
   */
  suggestVault(behaviorAnalysis) {
    if (behaviorAnalysis.tiltRisk >= 8 || behaviorAnalysis.impulsive) {
      return {
        type: 'Therapy',
        urgency: 'high',
        message: '🧘‍♂️ Hey king, maybe lock some away for self-care? You\'re tipping hot.',
        ...this.vaultTypes.Therapy
      };
    } else if (behaviorAnalysis.rapidFire) {
      return {
        type: 'GrassTouching',
        urgency: 'medium',
        message: '🌱 Rapid fire tipping detected. Time to touch some grass?',
        ...this.vaultTypes.GrassTouching
      };
    } else if (behaviorAnalysis.tiltRisk >= 5) {
      return {
        type: 'HODL',
        urgency: 'medium',
        message: '💎 Lock in those gains before the next impulse hits.',
        ...this.vaultTypes.HODL
      };
    }

    return null;
  }

  /**
   * Create vault
   */
  async createVault(userId, vaultType, amount) {
    if (!this.vaultTypes[vaultType]) {
      throw new Error(`Invalid vault type: ${vaultType}`);
    }

    const vault = {
      id: `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: vaultType,
      amount,
      currency: 'SOL',
      createdAt: Date.now(),
      unlockAt: Date.now() + this.vaultTypes[vaultType].lockPeriod,
      status: 'locked',
      ...this.vaultTypes[vaultType]
    };

    this.vaults.set(vault.id, vault);

    // Record in admin panel if available
    if (this.adminPanel) {
      try {
        await this.adminPanel.recordVault(vault);
      } catch (error) {
        console.log('⚠️  Admin panel recording failed');
      }
    }

    return vault;
  }

  /**
   * Get user's vaults
   */
  getUserVaults(userId) {
    return Array.from(this.vaults.values()).filter(v => v.userId === userId);
  }

  /**
   * Check if vault is unlocked
   */
  canUnlockVault(vaultId) {
    const vault = this.vaults.get(vaultId);
    if (!vault) return false;
    
    return Date.now() >= vault.unlockAt;
  }

  /**
   * Unlock vault
   */
  async unlockVault(vaultId) {
    const vault = this.vaults.get(vaultId);
    
    if (!vault) {
      throw new Error('Vault not found');
    }

    if (!this.canUnlockVault(vaultId)) {
      const timeRemaining = vault.unlockAt - Date.now();
      const hoursRemaining = Math.ceil(timeRemaining / (60 * 60 * 1000));
      throw new Error(`Vault locked for ${hoursRemaining} more hours`);
    }

    vault.status = 'unlocked';
    vault.unlockedAt = Date.now();

    // Record in admin panel if available
    if (this.adminPanel) {
      try {
        await this.adminPanel.recordVaultUnlock(vault);
      } catch (error) {
        console.log('⚠️  Admin panel recording failed');
      }
    }

    return vault;
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      service: 'JustTheTip',
      version: '1.0.0-standalone',
      status: this.status.core,
      integrations: this.status.integrations,
      stats: {
        totalTips: this.tips.length,
        totalVaults: this.vaults.size,
        activeUsers: this.users.size
      }
    };
  }

  /**
   * Health check endpoint
   */
  async healthCheck() {
    return {
      healthy: this.status.core === 'running',
      timestamp: Date.now(),
      ...this.getStatus()
    };
  }
}

// Express server setup for standalone launch
if (require.main === module) {
  const express = require('express');
  const app = express();
  app.use(express.json());

  // Initialize JustTheTip standalone
  const justTheTip = new JustTheTipStandalone({
    integrations: {
      // Start with everything disabled
      tiltCheck: false,
      qualifyFirst: false,
      aiGateway: false,
      adminPanel: false
    }
  });

  // Health check
  app.get('/health', async (req, res) => {
    const health = await justTheTip.healthCheck();
    res.json(health);
  });

  // Status
  app.get('/status', (req, res) => {
    res.json(justTheTip.getStatus());
  });

  // Process tip
  app.post('/api/tip', async (req, res) => {
    try {
      const tip = await justTheTip.processTip(req.body);
      res.json({ success: true, tip });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Create vault
  app.post('/api/vault/create', async (req, res) => {
    try {
      const { userId, vaultType, amount } = req.body;
      const vault = await justTheTip.createVault(userId, vaultType, amount);
      res.json({ success: true, vault });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Get user vaults
  app.get('/api/vault/:userId', (req, res) => {
    const vaults = justTheTip.getUserVaults(req.params.userId);
    res.json({ success: true, vaults });
  });

  // Unlock vault
  app.post('/api/vault/unlock/:vaultId', async (req, res) => {
    try {
      const vault = await justTheTip.unlockVault(req.params.vaultId);
      res.json({ success: true, vault });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  const PORT = process.env.JUSTTHETIP_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🚀 JustTheTip Standalone Server                 ║
║                                                           ║
║  Status: RUNNING (Independent Mode)                      ║
║  Port: ${PORT}                                           ║
║                                                           ║
║  Endpoints:                                              ║
║    GET  /health           - Health check                 ║
║    GET  /status           - System status                ║
║    POST /api/tip          - Process tip                  ║
║    POST /api/vault/create - Create vault                 ║
║    GET  /api/vault/:id    - Get vaults                   ║
║    POST /api/vault/unlock - Unlock vault                 ║
║                                                           ║
║  Integrations: All optional, load as needed              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
}

module.exports = JustTheTipStandalone;
