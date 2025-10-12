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

// Mock data generator for tilt monitoring demo
export const generateMockPlayerData = (playerId) => {
  const now = new Date();
  const sessions = [];
  
  // Generate last 30 sessions
  for (let i = 0; i < 30; i++) {
    const sessionDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const sessionDuration = Math.random() * 240 + 30; // 30-270 minutes
    const totalBets = Math.floor(Math.random() * 100) + 20;
    const averageBet = Math.random() * 100 + 10;
    const maxBet = averageBet + (Math.random() * 200);
    const winRate = 0.45 + (Math.random() * 0.1); // 45-55% win rate
    const totalWagered = totalBets * averageBet;
    const netResult = totalWagered * (winRate - 0.48); // House edge simulation
    
    // Tilt indicators
    const betIncreaseStreak = Math.floor(Math.random() * 8);
    const lossStreak = Math.floor(Math.random() * 10);
    const emotionalScore = Math.random() * 10; // 0-10 scale
    const speedOfPlay = Math.random() * 5 + 1; // bets per minute
    
    sessions.push({
      id: `session_${i}`,
      date: sessionDate,
      duration: sessionDuration,
      totalBets,
      averageBet,
      maxBet,
      winRate,
      totalWagered,
      netResult,
      betIncreaseStreak,
      lossStreak,
      emotionalScore,
      speedOfPlay,
      tiltRisk: calculateTiltRisk(sessionDuration, betIncreaseStreak, lossStreak, emotionalScore, speedOfPlay)
    });
  }
  
  return {
    playerId,
    name: `Player ${playerId}`,
    totalSessions: sessions.length,
    totalTimeSpent: sessions.reduce((sum, s) => sum + s.duration, 0),
    totalWagered: sessions.reduce((sum, s) => sum + s.totalWagered, 0),
    averageTiltRisk: sessions.reduce((sum, s) => sum + s.tiltRisk, 0) / sessions.length,
    sessions: sessions.reverse() // Most recent first
  };
};

const calculateTiltRisk = (duration, betIncrease, lossStreak, emotional, speed) => {
  let risk = 0;
  
  // Duration factor (longer sessions = higher risk)
  if (duration > 180) risk += 2;
  else if (duration > 120) risk += 1;
  
  // Bet increase factor
  if (betIncrease > 5) risk += 3;
  else if (betIncrease > 3) risk += 2;
  else if (betIncrease > 0) risk += 1;
  
  // Loss streak factor
  if (lossStreak > 7) risk += 3;
  else if (lossStreak > 4) risk += 2;
  else if (lossStreak > 2) risk += 1;
  
  // Emotional score factor (higher = more tilted)
  if (emotional > 7) risk += 2;
  else if (emotional > 5) risk += 1;
  
  // Speed factor (playing too fast can indicate tilt)
  if (speed > 4) risk += 1;
  
  return Math.min(risk, 10); // Cap at 10
};

export const generateRealTimeAlert = () => {
  const alertTypes = [
    'RAPID_BET_INCREASE',
    'EXTENDED_SESSION',
    'LOSS_STREAK',
    'EMOTIONAL_INDICATORS',
    'SPEED_INCREASE'
  ];
  
  const playerIds = ['P001', 'P002', 'P003', 'P004', 'P005'];
  
  return {
    id: `alert_${Date.now()}`,
    playerId: playerIds[Math.floor(Math.random() * playerIds.length)],
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
    message: generateAlertMessage(),
    timestamp: new Date(),
    resolved: false
  };
};

const generateAlertMessage = () => {
  const messages = [
    'Player showing signs of tilt - bet sizes increased 300% in last 10 minutes',
    'Extended session detected - player active for over 3 hours',
    'Loss streak of 8 consecutive hands detected',
    'Emotional indicators suggest player frustration',
    'Playing speed increased significantly - potential chase behavior'
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

export const mockPlayers = ['P001', 'P002', 'P003', 'P004', 'P005'].map(generateMockPlayerData);