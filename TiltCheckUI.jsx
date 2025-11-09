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
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaTimes, 
  FaChartLine,
  FaClock,
  FaGamepad,
  FaBell,
  FaPiggyBank
} from 'react-icons/fa';

const TiltCheckUI = ({ tiltChecker, playerId }) => {
  const [alerts, setAlerts] = useState([]);
  const [messengerVisible, setMessengerVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);

  useEffect(() => {
    // Set up global UI methods for TiltCheck to call
    window.TiltCheckUI = {
      showPopup: (alert) => {
        setActiveAlert(alert);
        setTimeout(() => setActiveAlert(null), 5000);
      },
      showMessenger: (alert) => {
        setAlerts(prev => [...prev, alert]);
        setMessengerVisible(true);
      }
    };

    // Update stats every 5 seconds
    const statsInterval = setInterval(() => {
      if (tiltChecker && playerId) {
        const playerStats = tiltChecker.getPlayerStats(playerId);
        setStats(playerStats);
      }
    }, 5000);

    return () => {
      clearInterval(statsInterval);
      delete window.TiltCheckUI;
    };
  }, [tiltChecker, playerId]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-600 border-red-500';
      case 'warning': return 'bg-yellow-600 border-yellow-500';
      case 'info': return 'bg-blue-600 border-blue-500';
      default: return 'bg-gray-600 border-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <FaExclamationTriangle className="text-red-300" />;
      case 'warning': return <FaExclamationTriangle className="text-yellow-300" />;
      case 'info': return <FaInfoCircle className="text-blue-300" />;
      default: return <FaInfoCircle className="text-gray-300" />;
    }
  };

  const getAdviceColor = (advice) => {
    switch (advice) {
      case 'foldEm': return 'text-red-300';
      case 'holdEm': return 'text-green-300';
      case 'vault': return 'text-yellow-300';
      default: return 'text-blue-300';
    }
  };

  const getAdviceMessage = (advice) => {
    switch (advice) {
      case 'foldEm': return "🃏 Time to Fold 'Em";
      case 'holdEm': return "🤝 Hold 'Em Strong";
      case 'vault': return "🏦 Vault Those Winnings";
      default: return "🎯 Stay Alert";
    }
  };

  return (
    <>
      {/* Popup Alert Overlay */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '100%' }}
            animate={{ opacity: 1, y: 0, x: '0%' }}
            exit={{ opacity: 0, y: -50, x: '100%' }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <div className={`${getSeverityColor(activeAlert.severity)} rounded-lg p-4 shadow-2xl border backdrop-blur-sm`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(activeAlert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">TiltCheck Alert</p>
                    <button
                      onClick={() => setActiveAlert(null)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-white/90">
                    {activeAlert.message}
                  </p>
                  {activeAlert.advice && (
                    <div className={`mt-2 text-xs font-semibold ${getAdviceColor(activeAlert.advice)}`}>
                      {getAdviceMessage(activeAlert.advice)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AOL-Style Messenger */}
      <AnimatePresence>
        {messengerVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            className="fixed bottom-4 right-4 z-40 w-80 max-h-96 bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg shadow-2xl border border-blue-500"
          >
            {/* Messenger Header */}
            <div className="flex items-center justify-between p-3 bg-blue-700 rounded-t-lg border-b border-blue-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm">TiltCheck Assistant</span>
              </div>
              <button
                onClick={() => setMessengerVisible(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="p-3 space-y-2 overflow-y-auto max-h-64">
              {alerts.slice(-5).map((alert, index) => (
                <motion.div
                  key={`${alert.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 rounded p-2 text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getSeverityIcon(alert.severity)}
                    <span className="text-white font-medium text-xs">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white/90 text-xs leading-relaxed">
                    {alert.message}
                  </p>
                  {alert.advice && (
                    <div className={`mt-1 text-xs font-semibold ${getAdviceColor(alert.advice)}`}>
                      {getAdviceMessage(alert.advice)}
                    </div>
                  )}
                </motion.div>
              ))}
              {alerts.length === 0 && (
                <div className="text-white/70 text-xs text-center py-4">
                  TiltCheck is monitoring your gameplay...
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="p-2 bg-blue-800 rounded-b-lg border-t border-blue-600">
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>🟢 Monitoring Active</span>
                <span>{alerts.length} alerts</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Dashboard Overlay */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-4 left-4 z-30 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 text-white text-sm max-w-xs"
        >
          <div className="flex items-center gap-2 mb-3">
            <FaChartLine className="text-green-400" />
            <span className="font-bold">TiltCheck Monitor</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Session:</span>
              <span>{Math.round(stats.sessionDuration / 60)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Emotional Score:</span>
              <span className={stats.emotionalScore > 5 ? 'text-red-400' : 'text-green-400'}>
                {stats.emotionalScore}/10
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Loss Streak:</span>
              <span className={stats.lossSequence > 3 ? 'text-red-400' : 'text-gray-300'}>
                {stats.lossSequence}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Slots/Originals:</span>
              <span>{Math.round(stats.slotsVsOriginalsRatio * 100)}%</span>
            </div>
          </div>

          {stats.recommendation && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className={`text-xs font-semibold ${getAdviceColor(stats.recommendation.action)}`}>
                {getAdviceMessage(stats.recommendation.action)}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {stats.recommendation.message}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Toggle Button for Messenger */}
      <button
        onClick={() => setMessengerVisible(!messengerVisible)}
        className="fixed bottom-4 right-96 z-30 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
      >
        <FaBell size={18} />
        {alerts.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {alerts.length > 9 ? '9+' : alerts.length}
          </span>
        )}
      </button>
    </>
  );
};

export default TiltCheckUI;