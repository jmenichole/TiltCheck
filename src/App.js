import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaShieldAlt, 
  FaUsers, 
  FaBell, 
  FaCog, 
  FaChartBar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBars,
  FaTimes
} from 'react-icons/fa';

import PlayerDashboard from './components/PlayerDashboard';
import AlertPanel from './components/AlertPanel';
import ConfigurationPanel from './components/ConfigurationPanel';
import FairnessVerifier from './components/FairnessVerifier';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alertCount, setAlertCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewAlert = (alert) => {
    setAlertCount(prev => prev + 1);
  };

  const tabs = [
    { id: 'dashboard', name: 'Player Dashboard', icon: FaUsers },
    { id: 'alerts', name: 'Real-Time Alerts', icon: FaBell, badge: alertCount },
    { id: 'configuration', name: 'Configuration', icon: FaCog },
    { id: 'fairness', name: 'Fairness Verifier', icon: FaCheckCircle }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <PlayerDashboard />;
      case 'alerts':
        return <AlertPanel onNewAlert={handleNewAlert} />;
      case 'configuration':
        return <ConfigurationPanel />;
      case 'fairness':
        return <FairnessVerifier />;
      default:
        return <PlayerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-dark-light shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white p-2"
              >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
              </button>
              <FaShieldAlt className="text-primary text-2xl" />
              <div>
                <h1 className="text-xl font-bold text-white">TiltCheck</h1>
                <p className="text-xs text-gray-400">Responsible Gaming Monitor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Monitoring Active</span>
              </div>
              
              <div className="text-right">
                <p className="text-white text-sm font-semibold">Demo Version</p>
                <p className="text-xs text-gray-400">For Funding Presentation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className={`lg:col-span-3 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-dark-light rounded-xl p-6 sticky top-8"
            >
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-300 hover:bg-dark hover:text-white'
                      }`}
                    >
                      <Icon className="text-lg" />
                      <span className="font-medium">{tab.name}</span>
                      {tab.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* System Status */}
              <div className="mt-8 p-4 bg-dark rounded-lg">
                <h3 className="text-white font-semibold mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Players Monitored</span>
                    <span className="text-green-400 font-semibold">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Active Alerts</span>
                    <span className="text-yellow-400 font-semibold">{alertCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Uptime</span>
                    <span className="text-green-400 font-semibold">99.9%</span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaInfoCircle className="text-primary" />
                  <h4 className="text-white font-semibold text-sm">Demo Features</h4>
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Real-time tilt monitoring</li>
                  <li>• Behavioral pattern analysis</li>
                  <li>• Predictive alerts system</li>
                  <li>• Intervention recommendations</li>
                  <li>• Fairness verification</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 mt-8 lg:mt-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderActiveComponent()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark-light border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaShieldAlt className="text-primary text-xl" />
                <h3 className="text-lg font-bold text-white">TiltCheck</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced player behavior monitoring system designed to promote responsible gaming 
                through real-time tilt detection and intervention.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Key Features</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Betting pattern analysis</li>
                <li>• Session time tracking</li>
                <li>• Emotional indicator monitoring</li>
                <li>• Real-time alert system</li>
                <li>• Intervention recommendations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Contact & Support</h4>
              <div className="text-gray-400 text-sm space-y-2">
                <p>Email: j.chapman7@yahoo.com</p>
                <p>Support: 24/7 Technical Support</p>
                <p>Integration: API & Custom Solutions</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 TiltCheck. Promoting responsible gaming through intelligent monitoring.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;