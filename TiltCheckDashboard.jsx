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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlay, 
  FaStop, 
  FaUser, 
  FaDollarSign, 
  FaClock, 
  FaGamepad,
  FaExclamationTriangle,
  FaChartBar,
  FaEye,
  FaCog,
  FaPiggyBank
} from 'react-icons/fa';
import TiltCheckUI from './TiltCheckUI.jsx';
import FairnessVerifier from './FairnessVerifier.jsx';

// Import TiltCheck class
const TiltCheck = window.TiltCheck || require('./tiltCheck.js');

const TiltCheckDashboard = () => {
  const [tiltChecker, setTiltChecker] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [playerForm, setPlayerForm] = useState({
    playerId: '',
    initialStake: 500,
    riskProfile: 'medium'
  });
  const [activeView, setActiveView] = useState('monitor');

  useEffect(() => {
    // Initialize TiltCheck
    const checker = new TiltCheck('demo-api-key');
    setTiltChecker(checker);

    return () => {
      if (currentPlayer) {
        checker.stopTracking(currentPlayer.id);
      }
    };
  }, []);

  const startMonitoring = () => {
    if (!tiltChecker || !playerForm.playerId) return;

    const player = tiltChecker.trackPlayer(playerForm.playerId, {
      initialStake: parseFloat(playerForm.initialStake),
      riskProfile: playerForm.riskProfile
    });

    setCurrentPlayer(player);
    setIsMonitoring(true);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const stopMonitoring = () => {
    if (tiltChecker && currentPlayer) {
      tiltChecker.stopTracking(currentPlayer.id);
      setCurrentPlayer(null);
      setIsMonitoring(false);
    }
  };

  const simulateActivity = (type) => {
    if (!tiltChecker || !currentPlayer) return;

    let activity;
    switch (type) {
      case 'smallBet':
        activity = {
          type: 'bet',
          amount: 10,
          gameType: 'slots',
          newStake: currentPlayer.currentStake - 10
        };
        break;
      case 'largeBet':
        activity = {
          type: 'bet',
          amount: 100,
          gameType: 'slots',
          newStake: currentPlayer.currentStake - 100
        };
        break;
      case 'win':
        activity = {
          type: 'win',
          amount: 150,
          newStake: currentPlayer.currentStake + 150
        };
        break;
      case 'loss':
        activity = {
          type: 'loss',
          amount: 50,
          newStake: currentPlayer.currentStake - 50
        };
        break;
      case 'switchToOriginals':
        activity = {
          type: 'gameSwitch',
          fromGame: 'slots',
          toGame: 'originals'
        };
        break;
    }

    tiltChecker.updatePlayerActivity(currentPlayer.id, activity);
    
    // Update current player state
    setCurrentPlayer(prev => ({
      ...prev,
      currentStake: activity.newStake || prev.currentStake
    }));
  };

  const renderMonitoringView = () => (
    <div className="space-y-6">
      {/* Player Setup */}
      {!isMonitoring ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FaUser /> Start Player Monitoring
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Player ID</label>
              <input
                type="text"
                value={playerForm.playerId}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, playerId: e.target.value }))}
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600"
                placeholder="player123"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Initial Stake ($)</label>
              <input
                type="number"
                value={playerForm.initialStake}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, initialStake: e.target.value }))}
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Risk Profile</label>
              <select
                value={playerForm.riskProfile}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, riskProfile: e.target.value }))}
                className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>
          <button
            onClick={startMonitoring}
            disabled={!playerForm.playerId}
            className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded font-semibold flex items-center gap-2 transition-colors"
          >
            <FaPlay /> Start Monitoring
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaEye className="text-green-400" /> Monitoring Active
            </h3>
            <button
              onClick={stopMonitoring}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 transition-colors"
            >
              <FaStop /> Stop
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center gap-2 text-gray-300 mb-1">
                <FaUser size={16} />
                <span className="text-sm">Player ID</span>
              </div>
              <div className="text-white font-semibold">{currentPlayer.id}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center gap-2 text-gray-300 mb-1">
                <FaDollarSign size={16} />
                <span className="text-sm">Current Stake</span>
              </div>
              <div className="text-white font-semibold">${currentPlayer.currentStake}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center gap-2 text-gray-300 mb-1">
                <FaClock size={16} />
                <span className="text-sm">Session Time</span>
              </div>
              <div className="text-white font-semibold">
                {Math.round((Date.now() - currentPlayer.sessionStart) / 60000)}m
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="flex items-center gap-2 text-gray-300 mb-1">
                <FaExclamationTriangle size={16} />
                <span className="text-sm">Loss Streak</span>
              </div>
              <div className={`font-semibold ${currentPlayer.lossSequence > 3 ? 'text-red-400' : 'text-white'}`}>
                {currentPlayer.lossSequence}
              </div>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-lg font-semibold text-white mb-3">Test Tilt Detection</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => simulateActivity('smallBet')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Small Bet ($10)
              </button>
              <button
                onClick={() => simulateActivity('largeBet')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Large Bet ($100)
              </button>
              <button
                onClick={() => simulateActivity('win')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Win (+$150)
              </button>
              <button
                onClick={() => simulateActivity('loss')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Loss (-$50)
              </button>
              <button
                onClick={() => simulateActivity('switchToOriginals')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                <FaGamepad className="inline mr-1" />
                Switch to Originals
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TiltCheck Dashboard
          </h1>
          <p className="text-gray-300">
            Advanced player behavior monitoring and tilt detection system
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('monitor')}
            className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
              activeView === 'monitor' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaChartBar /> Monitor
          </button>
          <button
            onClick={() => setActiveView('fairness')}
            className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
              activeView === 'fairness' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaCog /> Fairness Verifier
          </button>
        </div>

        {/* Content */}
        {activeView === 'monitor' && renderMonitoringView()}
        {activeView === 'fairness' && <FairnessVerifier />}

        {/* TiltCheck UI Overlay */}
        {isMonitoring && (
          <TiltCheckUI 
            tiltChecker={tiltChecker} 
            playerId={currentPlayer?.id} 
          />
        )}
      </div>
    </div>
  );
};

export default TiltCheckDashboard;