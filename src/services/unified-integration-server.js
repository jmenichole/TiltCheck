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

// Unified TiltCheck Integration Server
// Combines screen reading, QualifyFirst, and DegensAgainstDecency

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

// Import integrations
const QualifyFirstIntegration = require('./integrations/QualifyFirstIntegration');
const DegensAgainstDecencyIntegration = require('./integrations/DegensAgainstDecencyIntegration');
const DatabaseManager = require('./core/DatabaseManager');

class UnifiedTiltCheckServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    
    // Initialize Discord client
    this.discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    // Initialize integrations
    this.database = new DatabaseManager();
    this.qualifyFirst = new QualifyFirstIntegration();
    this.degensIntegration = new DegensAgainstDecencyIntegration(this.discordClient);
    
    // Active user sessions
    this.activeSessions = new Map();
    this.interventionCooldowns = new Map();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSockets();
    this.setupDiscordBot();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' })); // For screenshot data
    this.app.use(express.static('public'));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        integrations: {
          database: this.database.isConnected,
          discord: this.discordClient.readyAt !== null,
          qualifyFirst: true,
          degensGaming: true
        }
      });
    });

    // Screen reading activity endpoint
    this.app.post('/api/screen-activity', async (req, res) => {
      try {
        const { eventType, data, gamblingData, platform, url, timestamp, userId } = req.body;
        
        // Store in database
        await this.database.recordScreenActivity(userId, {
          eventType,
          data,
          gamblingData,
          platform,
          url,
          timestamp
        });

        // Update active session
        this.updateActiveSession(userId, gamblingData);

        // Check for intervention triggers
        const interventionNeeded = await this.checkInterventionTriggers(userId, gamblingData);
        
        if (interventionNeeded) {
          const interventions = await this.triggerMultiModalIntervention(userId, gamblingData);
          res.json({ success: true, interventions });
        } else {
          res.json({ success: true });
        }

      } catch (error) {
        console.error('Screen activity processing error:', error);
        res.status(500).json({ error: 'Failed to process screen activity' });
      }
    });

    // Screenshot analysis endpoint
    this.app.post('/api/analyze-screenshot', async (req, res) => {
      try {
        const { screenshot, platform, url, timestamp } = req.body;
        
        // Analyze screenshot with AI (mock implementation)
        const analysis = await this.analyzeScreenshotWithAI(screenshot, platform);
        
        res.json({
          success: true,
          analysis: {
            gamblingDetected: analysis.gamblingDetected,
            extractedData: analysis.extractedData,
            emotionalState: analysis.emotionalState,
            confidence: analysis.confidence
          }
        });

      } catch (error) {
        console.error('Screenshot analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze screenshot' });
      }
    });

    // QualifyFirst intervention endpoint
    this.app.post('/api/qualifyfirst-intervention', async (req, res) => {
      try {
        const { userId, currentLoss, tiltLevel } = req.body;
        
        const intervention = await this.qualifyFirst.triggerTiltIntervention(userId, {
          tiltLevel,
          currentLoss,
          sessionTime: this.getSessionTime(userId),
          platform: this.getActivePlatform(userId)
        });

        res.json(intervention);

      } catch (error) {
        console.error('QualifyFirst intervention error:', error);
        res.status(500).json({ error: 'Failed to trigger QualifyFirst intervention' });
      }
    });

    // DegensAgainstDecency intervention endpoint  
    this.app.post('/api/degens-intervention', async (req, res) => {
      try {
        const { userId, tiltLevel } = req.body;
        
        const intervention = await this.degensIntegration.triggerSocialIntervention(userId, {
          tiltLevel,
          currentLoss: this.getActiveSession(userId)?.totalLost || 0,
          sessionTime: this.getSessionTime(userId),
          platform: this.getActivePlatform(userId)
        });

        res.json(intervention);

      } catch (error) {
        console.error('Degens intervention error:', error);
        res.status(500).json({ error: 'Failed to trigger social intervention' });
      }
    });

    // User session data endpoint
    this.app.get('/api/session/:userId', (req, res) => {
      const { userId } = req.params;
      const session = this.getActiveSession(userId);
      
      res.json({
        session: session || null,
        isActive: this.activeSessions.has(userId)
      });
    });

    // Manual intervention trigger (for testing)
    this.app.post('/api/trigger-intervention/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { interventionType = 'all' } = req.body;
        
        const session = this.getActiveSession(userId);
        if (!session) {
          return res.status(404).json({ error: 'No active session found' });
        }

        const interventions = await this.triggerMultiModalIntervention(userId, session, interventionType);
        res.json({ success: true, interventions });

      } catch (error) {
        console.error('Manual intervention error:', error);
        res.status(500).json({ error: 'Failed to trigger intervention' });
      }
    });
  }

  setupWebSockets() {
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          await this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection-established',
        message: 'Connected to TiltCheck Unified System',
        timestamp: new Date().toISOString()
      }));
    });
  }

  async handleWebSocketMessage(ws, data) {
    const { type, userId, payload } = data;

    switch (type) {
      case 'screen-gambling-activity':
        await this.processRealtimeGamblingActivity(userId, payload);
        this.broadcastToUser(userId, {
          type: 'activity-processed',
          data: payload
        });
        break;

      case 'request-intervention':
        const interventions = await this.triggerMultiModalIntervention(userId, payload.gamblingData);
        ws.send(JSON.stringify({
          type: 'interventions-available',
          interventions
        }));
        break;

      case 'intervention-response':
        await this.handleInterventionResponse(userId, payload);
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: `Unknown message type: ${type}`
        }));
    }
  }

  setupDiscordBot() {
    this.discordClient.once('ready', () => {
      console.log(`🤖 Discord bot ready! Logged in as ${this.discordClient.user.tag}`);
    });

    this.discordClient.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      // Handle TiltCheck commands
      if (message.content.startsWith('!tiltcheck')) {
        await this.handleDiscordTiltCheckCommand(message);
      }
    });

    // Login to Discord
    if (process.env.DISCORD_BOT_TOKEN) {
      this.discordClient.login(process.env.DISCORD_BOT_TOKEN);
    } else {
      console.warn('⚠️ Discord bot token not provided - Discord integration disabled');
    }
  }

  // Core intervention logic
  async checkInterventionTriggers(userId, gamblingData) {
    const { tiltLevel, totalLost, sessionTime } = gamblingData;
    
    // Check cooldown
    if (this.interventionCooldowns.has(userId)) {
      const lastIntervention = this.interventionCooldowns.get(userId);
      const timeSince = Date.now() - lastIntervention;
      if (timeSince < 300000) return false; // 5-minute cooldown
    }

    // Intervention triggers
    return (
      tiltLevel >= 6 ||                    // High tilt level
      totalLost >= 200 ||                 // Significant losses
      sessionTime >= 120 ||               // Long session (2+ hours)
      this.detectRapidBetting(userId) ||  // Betting pattern analysis
      this.detectEmotionalDistress(gamblingData)
    );
  }

  async triggerMultiModalIntervention(userId, gamblingData, type = 'all') {
    console.log(`🚨 Triggering intervention for user ${userId}, tilt level: ${gamblingData.tiltLevel}`);
    
    const interventions = [];
    
    try {
      // QualifyFirst intervention (earn money instead of losing)
      if (type === 'all' || type === 'qualifyfirst') {
        const qfIntervention = await this.qualifyFirst.triggerTiltIntervention(userId, gamblingData);
        if (qfIntervention.success) {
          interventions.push(qfIntervention.intervention);
        }
      }

      // Social gaming intervention
      if (type === 'all' || type === 'social') {
        const socialIntervention = await this.degensIntegration.triggerSocialIntervention(userId, gamblingData);
        if (socialIntervention.success) {
          interventions.push(socialIntervention.intervention);
        }
      }

      // Traditional TiltCheck interventions
      if (type === 'all' || type === 'traditional') {
        interventions.push(this.generateTraditionalIntervention(gamblingData));
      }

      // Set cooldown
      this.interventionCooldowns.set(userId, Date.now());

      // Notify user via WebSocket
      this.broadcastToUser(userId, {
        type: 'interventions-triggered',
        interventions,
        urgency: gamblingData.tiltLevel >= 8 ? 'high' : 'medium'
      });

      return interventions;

    } catch (error) {
      console.error('Multi-modal intervention error:', error);
      return [];
    }
  }

  generateTraditionalIntervention(gamblingData) {
    const { tiltLevel, totalLost, sessionTime } = gamblingData;
    
    let message = "🛑 TiltCheck Alert: ";
    let urgency = 'medium';
    let actions = [];

    if (tiltLevel >= 8) {
      message += "SEVERE TILT DETECTED! ";
      urgency = 'high';
      actions = [
        'Immediately close all gambling tabs',
        'Take 10 deep breaths',
        'Call the gambling helpline: 1-800-522-4700',
        'Contact your accountability buddy'
      ];
    } else if (tiltLevel >= 6) {
      message += "High tilt detected. ";
      actions = [
        'Take a 15-minute break',
        'Review your session losses',
        'Set a firm stop-loss limit',
        'Consider ending your session'
      ];
    } else {
      message += "Moderate concern detected. ";
      actions = [
        'Take a 5-minute break',
        'Drink some water',
        'Review your goals',
        'Consider smaller bets'
      ];
    }

    return {
      type: 'traditional-tiltcheck',
      title: 'TiltCheck Intervention',
      message,
      urgency,
      actions,
      sessionSummary: {
        totalLost,
        sessionTime: `${Math.floor(sessionTime / 60)}h ${sessionTime % 60}m`,
        tiltLevel
      }
    };
  }

  // AI screenshot analysis (mock implementation)
  async analyzeScreenshotWithAI(screenshot, platform) {
    // In a real implementation, this would use OCR and AI
    // For now, return mock analysis
    return {
      gamblingDetected: true,
      extractedData: {
        balance: Math.random() * 1000,
        lastBet: Math.random() * 100,
        gameType: 'slots'
      },
      emotionalState: 'neutral',
      confidence: 0.85
    };
  }

  // Session management
  updateActiveSession(userId, gamblingData) {
    const existing = this.activeSessions.get(userId) || {
      startTime: Date.now(),
      totalWagered: 0,
      totalWon: 0,
      totalLost: 0
    };

    this.activeSessions.set(userId, {
      ...existing,
      ...gamblingData,
      lastActivity: Date.now()
    });
  }

  getActiveSession(userId) {
    return this.activeSessions.get(userId);
  }

  getSessionTime(userId) {
    const session = this.getActiveSession(userId);
    return session ? Math.floor((Date.now() - session.startTime) / 60000) : 0;
  }

  getActivePlatform(userId) {
    return this.getActiveSession(userId)?.platform || 'unknown';
  }

  // WebSocket broadcasting
  broadcastToUser(userId, message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        // In a real implementation, you'd track which client belongs to which user
        client.send(JSON.stringify({ userId, ...message }));
      }
    });
  }

  // Utility functions
  detectRapidBetting(userId) {
    const session = this.getActiveSession(userId);
    return session?.betHistory && session.betHistory.length >= 10;
  }

  detectEmotionalDistress(gamblingData) {
    return gamblingData.rapidClicking > 5 || gamblingData.franticTyping > 10;
  }

  async processRealtimeGamblingActivity(userId, activityData) {
    // Process real-time activity from screen reader
    await this.database.recordScreenActivity(userId, activityData);
    this.updateActiveSession(userId, activityData.gamblingData);
  }

  async handleInterventionResponse(userId, response) {
    // Track user's response to interventions
    await this.database.recordInterventionResponse(userId, response);
  }

  async handleDiscordTiltCheckCommand(message) {
    const args = message.content.split(' ').slice(1);
    const command = args[0];

    switch (command) {
      case 'status':
        const userId = message.author.id;
        const session = this.getActiveSession(userId);
        if (session) {
          message.reply(`Session active: ${this.getSessionTime(userId)}m, Tilt: ${session.tiltLevel}/10`);
        } else {
          message.reply('No active gambling session detected.');
        }
        break;

      case 'intervention':
        await this.triggerMultiModalIntervention(message.author.id, {
          tiltLevel: 7,
          totalLost: 100,
          sessionTime: 60
        });
        message.reply('Intervention triggered! Check your browser for options.');
        break;

      default:
        message.reply('Available commands: `!tiltcheck status`, `!tiltcheck intervention`');
    }
  }

  async start(port = 3001) {
    await this.database.connect();
    
    this.server.listen(port, () => {
      console.log(`🚀 Unified TiltCheck Server running on port ${port}`);
      console.log(`📊 Screen Reading: Active`);
      console.log(`📝 QualifyFirst: Integrated`);
      console.log(`🎮 DegensAgainstDecency: Integrated`);
      console.log(`💾 Database: Connected`);
    });
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new UnifiedTiltCheckServer();
  server.start();
}

module.exports = UnifiedTiltCheckServer;