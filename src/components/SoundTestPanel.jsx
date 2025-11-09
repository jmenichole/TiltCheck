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
import { FaVolumeUp, FaPlay, FaCheckCircle } from 'react-icons/fa';
import soundManager from '../utils/soundManager';

const SoundTestPanel = () => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.getEnabled());
  const [lastPlayed, setLastPlayed] = useState('');

  const playSound = (soundType, description) => {
    setLastPlayed(description);
    
    switch(soundType) {
      case 'redeem':
        soundManager.playRedeemAlert();
        break;
      case 'tilt':
        soundManager.playTiltWarning();
        break;
      case 'success':
        soundManager.playInterventionSuccess();
        break;
      case 'notification':
        soundManager.playNotification();
        break;
      default:
        console.warn('Unknown sound type:', soundType);
    }
  };

  const testAllSounds = () => {
    soundManager.testAllSounds();
    setLastPlayed('All sounds test sequence');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-light rounded-xl p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaVolumeUp className="text-purple-400 text-xl" />
          <h3 className="text-xl font-bold text-white">TiltCheck Sound System</h3>
        </div>
        
        <button
          onClick={() => {
            const newState = !soundEnabled;
            setSoundEnabled(newState);
            soundManager.setEnabled(newState);
          }}
          className={`px-4 py-2 rounded transition-colors ${
            soundEnabled 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-600 text-gray-300'
          }`}
        >
          {soundEnabled ? 'Sounds ON' : 'Sounds OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => playSound('redeem', 'Redeem Alert by blackjackson')}
          disabled={!soundEnabled}
          className="bg-gradient-to-r from-green-600 to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white p-4 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center gap-2">
            <FaCheckCircle className="text-2xl" />
            <span className="font-semibold">Redeem Alert</span>
            <span className="text-xs opacity-80">by blackjackson 🎉</span>
          </div>
        </button>

        <button
          onClick={() => playSound('tilt', 'Tilt Warning Sound')}
          disabled={!soundEnabled}
          className="bg-gradient-to-r from-red-600 to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white p-4 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <span className="font-semibold">Tilt Warning</span>
            <span className="text-xs opacity-80">Alert sound</span>
          </div>
        </button>

        <button
          onClick={() => playSound('success', 'Intervention Success')}
          disabled={!soundEnabled}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white p-4 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">Success Sound</span>
            <span className="text-xs opacity-80">Intervention</span>
          </div>
        </button>

        <button
          onClick={() => playSound('notification', 'General Notification')}
          disabled={!soundEnabled}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 disabled:from-gray-600 disabled:to-gray-700 text-white p-4 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl">🔔</span>
            <span className="font-semibold">Notification</span>
            <span className="text-xs opacity-80">General alert</span>
          </div>
        </button>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={testAllSounds}
          disabled={!soundEnabled}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-lg transition-all hover:scale-[1.02] active:scale-98 disabled:cursor-not-allowed mb-4"
        >
          <div className="flex items-center justify-center gap-2">
            <FaPlay />
            <span className="font-semibold">Test All Sounds</span>
          </div>
        </button>
        
        {lastPlayed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-gray-400"
          >
            🎵 Last played: <span className="text-purple-400">{lastPlayed}</span>
          </motion.div>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-800 rounded-lg">
        <h4 className="text-white font-semibold mb-2">🎉 Special Thanks</h4>
        <p className="text-gray-300 text-sm">
          The <span className="text-green-400 font-semibold">redeem alert sound</span> was created by Discord user{' '}
          <span className="text-purple-400 font-semibold">blackjackson</span> as a degen contribution to the TiltCheck project!
        </p>
        <p className="text-gray-400 text-xs mt-2">
          💡 Tip: Try resolving alerts in the Alert Panel to hear the epic redeem sound in action!
        </p>
      </div>
    </motion.div>
  );
};

export default SoundTestPanel;