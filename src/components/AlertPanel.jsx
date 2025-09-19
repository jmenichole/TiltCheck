import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaCheckCircle, FaClock, FaUsers } from 'react-icons/fa';
import { generateRealTimeAlert } from '../utils/mockData';

const AlertPanel = ({ onNewAlert }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        const newAlert = generateRealTimeAlert();
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        if (onNewAlert) onNewAlert(newAlert);
      }, Math.random() * 8000 + 3000); // Random interval 3-11 seconds

      return () => clearInterval(interval);
    }
  }, [isLive, onNewAlert]);

  const resolveAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'text-red-400 border-red-500';
      case 'MEDIUM': return 'text-yellow-400 border-yellow-500';
      case 'LOW': return 'text-green-400 border-green-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-900/30';
      case 'MEDIUM': return 'bg-yellow-900/30';
      case 'LOW': return 'bg-green-900/30';
      default: return 'bg-gray-900/30';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-light rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-400 text-xl" />
          <h2 className="text-2xl font-bold text-white">Real-Time Alerts</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded transition-colors ${
              isLive 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {isLive ? 'Live' : 'Paused'}
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <FaClock />
            <span className="text-sm">Auto-refresh {isLive ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-red-400" />
            Active Alerts ({activeAlerts.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeAlerts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No active alerts</p>
            ) : (
              activeAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${getSeverityBg(alert.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{alert.playerId}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                      <p className="text-gray-500 text-xs">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="bg-primary hover:bg-primary-dark px-3 py-1 rounded text-sm transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Resolved Alerts */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-400" />
            Resolved ({resolvedAlerts.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {resolvedAlerts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No resolved alerts</p>
            ) : (
              resolvedAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg bg-gray-900/30 border border-gray-700 opacity-75"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{alert.playerId}</span>
                    <span className="text-xs px-2 py-1 rounded text-green-400 border border-green-400">
                      RESOLVED
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{alert.message}</p>
                  <p className="text-gray-500 text-xs">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertPanel;