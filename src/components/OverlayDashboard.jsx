import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaExpand, 
  FaCompress, 
  FaUsers, 
  FaComments, 
  FaEye,
  FaChartLine,
  FaCog,
  FaDiscord,
  FaCamera,
  FaPaperPlane,
  FaExclamationTriangle,
  FaDollarSign,
  FaClock,
  FaGamepad,
  FaBell,
  FaMinus
} from 'react-icons/fa';

const OverlayDashboard = ({ 
  isVisible, 
  onClose, 
  position = 'right',
  isMinimized,
  onMinimize,
  currentPlayer 
}) => {
  const [activeTab, setActiveTab] = useState('monitor');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'TiltBot', message: 'Welcome to TiltCheck monitoring!', timestamp: Date.now() - 60000, type: 'system' },
    { id: 2, user: 'Player123', message: 'Anyone else seeing increased volatility today?', timestamp: Date.now() - 30000, type: 'user' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers] = useState(['TiltBot', 'Player123', 'GamerPro', 'LuckyGuy88']);
  const [apiKey, setApiKey] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const chatEndRef = useRef(null);

  const overlayWidth = isMinimized ? 'w-16' : 'w-96';
  const overlayHeight = isMinimized ? 'h-16' : 'h-[calc(100vh-2rem)]';

  const positionClasses = {
    right: 'right-4 top-4',
    left: 'left-4 top-4',
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'You',
        message: newMessage,
        timestamp: Date.now(),
        type: 'user'
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // In a real implementation, this would integrate with screen sharing APIs
  };

  const sendToDiscord = (message) => {
    // Simulate Discord integration
    const discordMessage = {
      id: Date.now(),
      user: 'Discord Bot',
      message: `Shared to Discord: "${message}"`,
      timestamp: Date.now(),
      type: 'system'
    };
    setChatMessages(prev => [...prev, discordMessage]);
  };

  const tabs = [
    { id: 'monitor', name: 'Monitor', icon: FaEye },
    { id: 'chat', name: 'Chat', icon: FaComments },
    { id: 'settings', name: 'Config', icon: FaCog },
  ];

  const renderMonitorTab = () => (
    <div className="p-4 space-y-4">
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          Live Analytics
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-300">Session Time:</span>
            <span className="text-green-400">45m 23s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Current Stake:</span>
            <span className="text-yellow-400">$1,245</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Tilt Risk:</span>
            <span className="text-red-400">Medium</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Bet Pattern:</span>
            <span className="text-orange-400">Increasing</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <FaBell className="text-yellow-400" />
          Recent Alerts
        </h3>
        <div className="space-y-2">
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <FaExclamationTriangle className="text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Bet Increase</span>
            </div>
            <p className="text-gray-300">Stakes increased 3x in last 10 minutes</p>
          </div>
          <div className="bg-orange-900/30 border border-orange-500/30 rounded p-2 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <FaClock className="text-orange-400" />
              <span className="text-orange-400 font-semibold">Session Length</span>
            </div>
            <p className="text-gray-300">Consider taking a break</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <FaDiscord className="text-purple-400" />
          Discord Integration
        </h3>
        <div className="space-y-2">
          <button
            onClick={handleScreenShare}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
              isScreenSharing 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            <FaCamera />
            {isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          </button>
          <button
            onClick={() => sendToDiscord('Requesting accountability check')}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors"
          >
            <FaExclamationTriangle />
            Post Tilt Alert
          </button>
        </div>
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <FaUsers className="text-green-400" />
          Online Users ({onlineUsers.length})
        </h3>
        <div className="flex flex-wrap gap-1 mt-2">
          {onlineUsers.map((user, index) => (
            <span
              key={index}
              className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full"
            >
              {user}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg text-xs ${
              msg.type === 'system'
                ? 'bg-blue-900/30 border border-blue-500/30'
                : msg.user === 'You'
                ? 'bg-green-900/30 border border-green-500/30 ml-4'
                : 'bg-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-semibold ${
                msg.type === 'system' ? 'text-blue-400' :
                msg.user === 'You' ? 'text-green-400' : 'text-gray-300'
              }`}>
                {msg.user}
              </span>
              <span className="text-gray-500 text-xs">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-200">{msg.message}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <FaPaperPlane size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="p-4 space-y-4">
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-white mb-2">API Configuration</h3>
        <div className="space-y-2">
          <label className="text-xs text-gray-300">Casino API Key:</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your casino API key..."
            className="w-full bg-gray-700 text-white px-3 py-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400">
            Connect to your gambling platform for real-time analysis
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-white mb-2">Monitoring Settings</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span className="text-xs text-gray-300">Auto-detect tilt patterns</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" defaultChecked />
            <span className="text-xs text-gray-300">Send Discord alerts</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-xs text-gray-300">Screen recording</span>
          </label>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-white mb-2">Overlay Position</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {/* Position change logic */}}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs"
          >
            Left Side
          </button>
          <button
            onClick={() => {/* Position change logic */}}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs"
          >
            Right Side
          </button>
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: position === 'right' ? 300 : -300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: position === 'right' ? 300 : -300 }}
        className={`fixed ${positionClasses[position]} ${overlayWidth} ${overlayHeight} bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          {!isMinimized && (
            <>
              <h2 className="text-sm font-bold text-white">TiltCheck Overlay</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={onMinimize}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaMinus size={12} />
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            </>
          )}
          {isMinimized && (
            <button
              onClick={onMinimize}
              className="w-full flex items-center justify-center text-blue-400 hover:text-white transition-colors"
            >
              <FaEye size={16} />
            </button>
          )}
        </div>

        {!isMinimized && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'monitor' && renderMonitorTab()}
              {activeTab === 'chat' && renderChatTab()}
              {activeTab === 'settings' && renderSettingsTab()}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OverlayDashboard;