import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCog, 
  FaSlidersH, 
  FaBell, 
  FaSave,
  FaInfoCircle,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

const ConfigurationPanel = () => {
  const [config, setConfig] = useState({
    alertThresholds: {
      stakeIncrease: 200,
      timeAtTable: 180,
      lossSequence: 5,
      emotionalScore: 7,
      speedIncrease: 300
    },
    notifications: {
      email: true,
      sms: true,
      dashboard: true,
      sound: true
    },
    monitoring: {
      realTimeTracking: true,
      sessionRecording: true,
      behaviorAnalysis: true,
      predictiveAlerts: true
    },
    intervention: {
      autoBreakSuggestion: true,
      limitRecommendations: true,
      cooldownPeriods: true,
      supportReferral: true
    }
  });

  const [savedMessage, setSavedMessage] = useState('');

  const updateThreshold = (key, value) => {
    setConfig(prev => ({
      ...prev,
      alertThresholds: {
        ...prev.alertThresholds,
        [key]: parseInt(value) || 0
      }
    }));
  };

  const toggleSetting = (category, key) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const saveConfiguration = () => {
    // In a real app, this would save to backend
    setSavedMessage('Configuration saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const resetToDefaults = () => {
    setConfig({
      alertThresholds: {
        stakeIncrease: 200,
        timeAtTable: 180,
        lossSequence: 5,
        emotionalScore: 7,
        speedIncrease: 300
      },
      notifications: {
        email: true,
        sms: true,
        dashboard: true,
        sound: true
      },
      monitoring: {
        realTimeTracking: true,
        sessionRecording: true,
        behaviorAnalysis: true,
        predictiveAlerts: true
      },
      intervention: {
        autoBreakSuggestion: true,
        limitRecommendations: true,
        cooldownPeriods: true,
        supportReferral: true
      }
    });
    setSavedMessage('Configuration reset to defaults');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`text-2xl transition-colors ${
        enabled ? 'text-primary' : 'text-gray-500'
      }`}
    >
      {enabled ? <FaToggleOn /> : <FaToggleOff />}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-dark-light rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaCog className="text-primary text-xl" />
          <h2 className="text-2xl font-bold text-white">Configuration</h2>
        </div>
        <div className="flex items-center gap-4">
          {savedMessage && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-green-400 text-sm"
            >
              {savedMessage}
            </motion.span>
          )}
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={saveConfiguration}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded transition-colors"
          >
            <FaSave />
            Save Configuration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Thresholds */}
        <div className="bg-dark rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaSlidersH className="text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Alert Thresholds</h3>
            <FaInfoCircle className="text-gray-400 text-sm" title="Configure when alerts are triggered" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Stake Increase Threshold (%)
              </label>
              <input
                type="number"
                value={config.alertThresholds.stakeIncrease}
                onChange={(e) => updateThreshold('stakeIncrease', e.target.value)}
                className="w-full bg-dark-light text-white px-3 py-2 rounded border border-gray-600"
                min="50"
                max="1000"
              />
              <p className="text-gray-500 text-xs mt-1">Alert when bet size increases by this percentage</p>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Time at Table (minutes)
              </label>
              <input
                type="number"
                value={config.alertThresholds.timeAtTable}
                onChange={(e) => updateThreshold('timeAtTable', e.target.value)}
                className="w-full bg-dark-light text-white px-3 py-2 rounded border border-gray-600"
                min="30"
                max="480"
              />
              <p className="text-gray-500 text-xs mt-1">Alert for extended session duration</p>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Loss Sequence Limit
              </label>
              <input
                type="number"
                value={config.alertThresholds.lossSequence}
                onChange={(e) => updateThreshold('lossSequence', e.target.value)}
                className="w-full bg-dark-light text-white px-3 py-2 rounded border border-gray-600"
                min="3"
                max="15"
              />
              <p className="text-gray-500 text-xs mt-1">Alert after consecutive losses</p>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Emotional Score Threshold (1-10)
              </label>
              <input
                type="number"
                value={config.alertThresholds.emotionalScore}
                onChange={(e) => updateThreshold('emotionalScore', e.target.value)}
                className="w-full bg-dark-light text-white px-3 py-2 rounded border border-gray-600"
                min="1"
                max="10"
              />
              <p className="text-gray-500 text-xs mt-1">Alert when emotional indicators exceed threshold</p>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Speed Increase Threshold (%)
              </label>
              <input
                type="number"
                value={config.alertThresholds.speedIncrease}
                onChange={(e) => updateThreshold('speedIncrease', e.target.value)}
                className="w-full bg-dark-light text-white px-3 py-2 rounded border border-gray-600"
                min="100"
                max="1000"
              />
              <p className="text-gray-500 text-xs mt-1">Alert when play speed increases significantly</p>
            </div>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-dark rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBell className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
            </div>
            
            <div className="space-y-3">
              {Object.entries(config.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <ToggleSwitch 
                    enabled={value}
                    onToggle={() => toggleSetting('notifications', key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Features */}
          <div className="bg-dark rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaSlidersH className="text-green-400" />
              <h3 className="text-lg font-semibold text-white">Monitoring</h3>
            </div>
            
            <div className="space-y-3">
              {Object.entries(config.monitoring).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <ToggleSwitch 
                    enabled={value}
                    onToggle={() => toggleSetting('monitoring', key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Intervention Tools */}
          <div className="bg-dark rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaInfoCircle className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Intervention</h3>
            </div>
            
            <div className="space-y-3">
              {Object.entries(config.intervention).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <ToggleSwitch 
                    enabled={value}
                    onToggle={() => toggleSetting('intervention', key)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Preview */}
      <div className="mt-6 bg-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Configuration Summary</h3>
        <div className="bg-dark-light rounded p-4 font-mono text-sm text-gray-300 max-h-60 overflow-y-auto">
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfigurationPanel;