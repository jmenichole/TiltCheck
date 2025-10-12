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

// Discord Bot Configuration
module.exports = {
  // Bot settings
  prefix: '!',
  botName: 'TiltCheck Assistant',
  
  // Colors for embeds
  colors: {
    success: 0x10B981,
    warning: 0xF59E0B,
    error: 0xEF4444,
    info: 0x3B82F6,
    primary: 0x8B5CF6
  },
  
  // Alert thresholds for Discord notifications
  alertThresholds: {
    highRisk: 3,        // Number of alerts before high risk notification
    criticalRisk: 5,    // Number of alerts before critical notification
    sessionTime: 120,   // Minutes before long session alert
    stakeChange: 500    // Dollar amount before stake change alert
  },
  
  // Responsible gaming resources
  resources: {
    helplines: [
      '🇺🇸 National Problem Gambling Helpline: 1-800-522-4700',
      '🇬🇧 GamCare: 0808 8020 133',
      '🇨🇦 Problem Gambling Help Line: 1-888-795-6111',
      '🇦🇺 Gambling Help Online: 1800 858 858'
    ],
    websites: [
      'https://www.ncpgambling.org',
      'https://www.gamcare.org.uk',
      'https://www.responsiblegambling.org',
      'https://www.gamblingtherapy.org'
    ]
  },
  
  // Bot permissions required
  permissions: [
    'SendMessages',
    'EmbedLinks',
    'ReadMessageHistory',
    'UseSlashCommands',
    'ManageMessages'
  ]
};