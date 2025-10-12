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

// DegensAgainstDecency Integration for TiltCheck
// Social gaming intervention and accountability through community

const { EmbedBuilder } = require('discord.js');

class DegensAgainstDecencyTiltCheckIntegration {
  constructor(discordClient) {
    this.discordClient = discordClient;
    this.gameArenaAPI = 'http://localhost:3000'; // DegensAgainstDecency server
    this.interventionGames = new Map();
    this.accountabilityGroups = new Map();
    this.setupInterventionGames();
  }

  setupInterventionGames() {
    // Define intervention games for different tilt levels
    this.interventionGames.set('low-tilt', {
      games: ['2-truths-and-a-lie', 'degens-against-decency'],
      maxPlayers: 6,
      duration: 15, // minutes
      message: "🎮 Take a fun break with friends!"
    });

    this.interventionGames.set('medium-tilt', {
      games: ['accountability-challenge', 'truth-or-dare-accountability'],
      maxPlayers: 4,
      duration: 30,
      message: "🛑 Join an accountability game with supportive friends"
    });

    this.interventionGames.set('high-tilt', {
      games: ['emergency-support-circle', 'guided-meditation-game'],
      maxPlayers: 8,
      duration: 45,
      message: "🚨 URGENT: Connect with your support network immediately",
      priority: true
    });
  }

  // Main intervention trigger from TiltCheck
  async triggerSocialIntervention(userId, tiltData) {
    const { tiltLevel, currentLoss, sessionTime, platform } = tiltData;
    
    // Determine intervention type
    const interventionType = this.selectInterventionType(tiltLevel, currentLoss);
    
    // Find or create appropriate game
    const gameSession = await this.findOrCreateInterventionGame(userId, interventionType);
    
    // Create Discord invite and accountability buddy assignment
    const socialSupport = await this.setupSocialSupport(userId, interventionType);
    
    // Generate personalized intervention message
    const message = this.generateInterventionMessage(userId, tiltData, gameSession);

    // Log intervention
    await this.logSocialIntervention(userId, {
      tiltLevel,
      interventionType: interventionType.name,
      gameId: gameSession?.id,
      socialSupport,
      currentLoss,
      platform
    });

    return {
      success: true,
      intervention: {
        type: 'social-gaming-redirect',
        urgency: interventionType.priority || false,
        title: interventionType.message,
        gameSession,
        socialSupport,
        message,
        discordInvite: socialSupport.discordInvite,
        gameUrl: this.buildGameUrl(gameSession?.id),
        estimatedTime: interventionType.duration
      }
    };
  }

  selectInterventionType(tiltLevel, currentLoss) {
    if (tiltLevel >= 8 || currentLoss >= 500) {
      return { ...this.interventionGames.get('high-tilt'), name: 'high-tilt' };
    } else if (tiltLevel >= 5 || currentLoss >= 200) {
      return { ...this.interventionGames.get('medium-tilt'), name: 'medium-tilt' };
    } else {
      return { ...this.interventionGames.get('low-tilt'), name: 'low-tilt' };
    }
  }

  // Find existing game or create new intervention game
  async findOrCreateInterventionGame(userId, interventionType) {
    try {
      // First, try to find existing games user can join
      const existingGames = await this.getAvailableGames(interventionType.games);
      
      if (existingGames.length > 0) {
        // Join existing game with space available
        const suitableGame = existingGames.find(game => 
          game.currentPlayers < game.maxPlayers &&
          game.type === interventionType.games[0] &&
          game.status === 'waiting'
        );

        if (suitableGame) {
          await this.joinGame(suitableGame.id, userId);
          return suitableGame;
        }
      }

      // Create new intervention game
      return await this.createInterventionGame(userId, interventionType);

    } catch (error) {
      console.error('Error finding/creating intervention game:', error);
      return null;
    }
  }

  // Create specialized accountability games
  async createInterventionGame(userId, interventionType) {
    const gameConfig = {
      creator: userId,
      type: interventionType.games[0],
      maxPlayers: interventionType.maxPlayers,
      isPrivate: false,
      interventionMode: true,
      specialRules: this.getInterventionRules(interventionType.name),
      autoStart: true,
      duration: interventionType.duration
    };

    try {
      const response = await fetch(`${this.gameArenaAPI}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameConfig)
      });

      const game = await response.json();
      
      // Notify Discord community about intervention game
      await this.announceInterventionGame(game, interventionType);
      
      return game;
    } catch (error) {
      console.error('Error creating intervention game:', error);
      return null;
    }
  }

  // Get special rules for intervention games
  getInterventionRules(interventionType) {
    switch (interventionType) {
      case 'high-tilt':
        return {
          title: 'Emergency Support Circle',
          description: 'Supportive accountability game for high-tilt situations',
          cards: {
            questions: [
              "What's the real reason you're gambling right now?",
              "How would your future self feel about this session?", 
              "What healthy activity could you do instead?",
              "Who could you call right now for support?"
            ],
            supportiveResponses: [
              "Take 5 deep breaths with us",
              "Share one thing you're grateful for",
              "Set a firm stop-loss limit right now",
              "Promise to check in tomorrow"
            ]
          }
        };
        
      case 'medium-tilt':
        return {
          title: 'Accountability Challenge', 
          description: 'Truth or dare focused on gambling awareness',
          cards: {
            truthQuestions: [
              "What's your biggest gambling loss this month?",
              "How many hours did you gamble this week?",
              "What would you do with your gambling budget instead?",
              "When do you feel most tempted to gamble?"
            ],
            accountabilityDares: [
              "Set a $50 daily limit right now",
              "Block your favorite casino for 24 hours",
              "Send your current winnings to savings",
              "Write down why you want to stop gambling"
            ]
          }
        };
        
      default:
        return {
          title: 'Fun Social Break',
          description: 'Light-hearted games to break gambling focus',
          cards: {
            questions: [
              "What's your favorite non-gambling hobby?",
              "If you had $1000 guaranteed, what would you buy?",
              "What makes you laugh the most?",
              "Describe your perfect day without screens"
            ]
          }
        };
    }
  }

  // Setup social support network
  async setupSocialSupport(userId, interventionType) {
    try {
      // Get user's Discord info
      const discordUser = await this.getDiscordUser(userId);
      
      // Find accountability buddies
      const accountabilityBuddies = await this.findAccountabilityBuddies(userId, interventionType);
      
      // Create Discord intervention channel if high tilt
      let interventionChannel = null;
      if (interventionType.priority) {
        interventionChannel = await this.createInterventionChannel(discordUser, accountabilityBuddies);
      }

      // Generate Discord invite
      const discordInvite = await this.generateDiscordInvite(interventionChannel?.id);

      return {
        discordUser,
        accountabilityBuddies,
        interventionChannel,
        discordInvite,
        supportMessage: this.generateSupportMessage(discordUser, interventionType)
      };

    } catch (error) {
      console.error('Error setting up social support:', error);
      return { error: 'Failed to setup social support' };
    }
  }

  // Find accountability buddies from user's network
  async findAccountabilityBuddies(userId, interventionType) {
    // This would integrate with your user database to find:
    // 1. Users who've opted in to be accountability buddies
    // 2. Users in similar recovery stages  
    // 3. Users currently online and available
    
    // Mock implementation - replace with real database query
    return [
      {
        id: 'buddy-1',
        username: 'SupportiveFriend',
        status: 'online',
        relationshipType: 'mutual-accountability',
        experienceLevel: 'experienced-supporter'
      },
      {
        id: 'buddy-2', 
        username: 'RecoveryMentor',
        status: 'online',
        relationshipType: 'mentor',
        experienceLevel: 'recovery-veteran'
      }
    ];
  }

  // Create private Discord channel for emergency support
  async createInterventionChannel(discordUser, accountabilityBuddies) {
    try {
      if (!this.discordClient.guilds.cache.size) {
        throw new Error('Discord client not connected to any guilds');
      }

      const guild = this.discordClient.guilds.cache.first();
      const channelName = `intervention-${discordUser.username}-${Date.now()}`;

      const channel = await guild.channels.create({
        name: channelName,
        type: 0, // Text channel
        permissionOverwrites: [
          {
            id: guild.id,
            deny: ['ViewChannel'] // Hide from everyone by default
          },
          {
            id: discordUser.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
          },
          // Add accountability buddies
          ...accountabilityBuddies.map(buddy => ({
            id: buddy.id,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
          }))
        ]
      });

      // Send initial support message
      await this.sendInitialSupportMessage(channel, discordUser);

      return channel;
    } catch (error) {
      console.error('Error creating intervention channel:', error);
      return null;
    }
  }

  // Send supportive message to intervention channel
  async sendInitialSupportMessage(channel, discordUser) {
    const embed = new EmbedBuilder()
      .setColor(0xff6b6b)
      .setTitle('🛡️ TiltCheck Emergency Support')
      .setDescription(`Hey ${discordUser.username}, we're here to help you through this tough moment.`)
      .addFields(
        { 
          name: '💪 You\'ve got this!', 
          value: 'Take a deep breath. You\'re not alone in this.' 
        },
        { 
          name: '🎯 Next steps:', 
          value: '• Close gambling tabs\n• Take 5 deep breaths\n• Talk to us here\n• Join the accountability game' 
        },
        { 
          name: '☎️ Crisis support:', 
          value: 'National Problem Gambling Helpline: 1-800-522-4700' 
        }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  }

  // Generate personalized intervention message
  generateInterventionMessage(userId, tiltData, gameSession) {
    const { tiltLevel, currentLoss, sessionTime } = tiltData;
    
    let message = `Hey! TiltCheck detected you might be having a tough gambling session. `;

    if (currentLoss > 0) {
      message += `You've lost $${currentLoss} so far. `;
    }

    message += `Instead of continuing, how about joining a fun social game? `;

    if (gameSession) {
      message += `We've got a "${gameSession.type.replace('-', ' ')}" game starting with ${gameSession.currentPlayers} players. `;
    }

    message += `Your mental health is more important than any potential win. Let's have some laughs instead! 🎮❤️`;

    return message;
  }

  // Announce intervention game to Discord community
  async announceInterventionGame(game, interventionType) {
    try {
      if (!this.discordClient.guilds.cache.size) return;

      const guild = this.discordClient.guilds.cache.first();
      const announcementChannel = guild.channels.cache.find(
        channel => channel.name.includes('general') || channel.name.includes('games')
      );

      if (!announcementChannel) return;

      let message = '';
      if (interventionType.priority) {
        message = '🚨 **Emergency Support Game Starting** 🚨\n';
        message += 'Someone needs our community support right now.\n';
      } else {
        message = '🎮 **Intervention Game Available** 🎮\n';
        message += 'Join to help a community member take a healthy gaming break!\n';
      }

      message += `**Game:** ${game.type.replace('-', ' ')}\n`;
      message += `**Players:** ${game.currentPlayers}/${game.maxPlayers}\n`;
      message += `**Join:** React with 🎮 or visit ${this.buildGameUrl(game.id)}`;

      const sentMessage = await announcementChannel.send(message);
      await sentMessage.react('🎮');

      return sentMessage;
    } catch (error) {
      console.error('Error announcing intervention game:', error);
    }
  }

  // Generate Discord invite
  async generateDiscordInvite(channelId = null) {
    try {
      if (!this.discordClient.guilds.cache.size) return null;

      const guild = this.discordClient.guilds.cache.first();
      const targetChannel = channelId ? 
        guild.channels.cache.get(channelId) :
        guild.channels.cache.find(ch => ch.name.includes('general'));

      if (!targetChannel) return null;

      const invite = await targetChannel.createInvite({
        maxAge: 3600, // 1 hour
        maxUses: 10,
        unique: true,
        reason: 'TiltCheck intervention support'
      });

      return invite.url;
    } catch (error) {
      console.error('Error generating Discord invite:', error);
      return null;
    }
  }

  // Utility functions
  buildGameUrl(gameId) {
    return gameId ? `${this.gameArenaAPI}/game/${gameId}` : this.gameArenaAPI;
  }

  async getAvailableGames(gameTypes) {
    try {
      const response = await fetch(`${this.gameArenaAPI}/api/games`);
      const allGames = await response.json();
      
      return allGames.filter(game => 
        gameTypes.includes(game.type) && 
        game.status === 'waiting' &&
        game.currentPlayers < game.maxPlayers
      );
    } catch (error) {
      console.error('Error getting available games:', error);
      return [];
    }
  }

  async joinGame(gameId, userId) {
    try {
      const response = await fetch(`${this.gameArenaAPI}/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error joining game:', error);
      return null;
    }
  }

  async getDiscordUser(userId) {
    // This would lookup the Discord user from your database
    // Mock implementation:
    return {
      id: userId,
      username: 'TiltCheckUser',
      discriminator: '0001'
    };
  }

  generateSupportMessage(discordUser, interventionType) {
    if (interventionType.priority) {
      return `${discordUser.username}, your TiltCheck community is here for you. You're not alone in this struggle. 💪`;
    } else {
      return `Hey ${discordUser.username}! Time for a fun break with friends? 🎮`;
    }
  }

  // Log social intervention for analytics
  async logSocialIntervention(userId, interventionData) {
    try {
      // This would save to your database
      console.log('Social intervention logged:', {
        userId,
        timestamp: new Date().toISOString(),
        ...interventionData
      });
    } catch (error) {
      console.error('Error logging social intervention:', error);
    }
  }

  // Track intervention success
  async trackInterventionSuccess(userId, interventionId, outcome) {
    try {
      // Track metrics like:
      // - Did user stop gambling after intervention?
      // - How long did they play social games?
      // - Did they return to gambling later?
      // - Social engagement metrics
      
      console.log('Intervention outcome tracked:', {
        userId,
        interventionId, 
        outcome,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking intervention success:', error);
    }
  }
}

module.exports = DegensAgainstDecencyTiltCheckIntegration;