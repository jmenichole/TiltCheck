import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaClock, 
  FaDollarSign, 
  FaExclamationTriangle,
  FaChartLine,
  FaEye,
  FaPlay,
  FaPause
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { mockPlayers } from '../utils/mockData';

const PlayerDashboard = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(mockPlayers[0]);
  const [isLiveMode, setIsLiveMode] = useState(true);

  const getTiltRiskColor = (risk) => {
    if (risk >= 7) return 'text-red-400 bg-red-900/30';
    if (risk >= 4) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-green-400 bg-green-900/30';
  };

  const getTiltRiskLabel = (risk) => {
    if (risk >= 7) return 'HIGH RISK';
    if (risk >= 4) return 'MEDIUM RISK';
    return 'LOW RISK';
  };

  // Prepare chart data
  const last14Sessions = selectedPlayer.sessions.slice(0, 14).reverse();
  const tiltChart = last14Sessions.map((session, index) => ({
    day: `Day ${index + 1}`,
    tiltRisk: session.tiltRisk,
    duration: session.duration,
    betIncrease: session.betIncreaseStreak,
    lossStreak: session.lossStreak
  }));

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-dark-light rounded-xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FaUser className="text-primary text-xl" />
          <h2 className="text-2xl font-bold text-white">Player Monitoring</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              isLiveMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {isLiveMode ? <FaPause /> : <FaPlay />}
            {isLiveMode ? 'Live' : 'Paused'}
          </button>
          <select 
            value={selectedPlayer.playerId} 
            onChange={(e) => setSelectedPlayer(mockPlayers.find(p => p.playerId === e.target.value))}
            className="bg-dark text-white px-4 py-2 rounded border border-gray-600"
          >
            {mockPlayers.map(player => (
              <option key={player.playerId} value={player.playerId}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Overview */}
        <div className="bg-dark rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{selectedPlayer.name}</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getTiltRiskColor(selectedPlayer.averageTiltRisk)}`}>
              {getTiltRiskLabel(selectedPlayer.averageTiltRisk)}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaClock className="text-gray-400" />
              <div>
                <p className="text-gray-300 text-sm">Total Time Played</p>
                <p className="text-white font-semibold">{formatTime(selectedPlayer.totalTimeSpent)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FaDollarSign className="text-gray-400" />
              <div>
                <p className="text-gray-300 text-sm">Total Wagered</p>
                <p className="text-white font-semibold">{formatCurrency(selectedPlayer.totalWagered)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FaChartLine className="text-gray-400" />
              <div>
                <p className="text-gray-300 text-sm">Sessions Tracked</p>
                <p className="text-white font-semibold">{selectedPlayer.totalSessions}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-gray-400" />
              <div>
                <p className="text-gray-300 text-sm">Average Tilt Risk</p>
                <p className="text-white font-semibold">{selectedPlayer.averageTiltRisk.toFixed(1)}/10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tilt Risk Chart */}
        <div className="lg:col-span-2">
          <div className="bg-dark rounded-lg p-6 h-full">
            <h3 className="text-lg font-semibold text-white mb-4">Tilt Risk Trend (Last 14 Sessions)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tiltChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tiltRisk" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Session Analysis */}
      <div className="mt-6 bg-dark rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Session Indicators</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tiltChart.slice(-7)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Bar dataKey="betIncrease" fill="#EF4444" name="Bet Increase Streak" />
            <Bar dataKey="lossStreak" fill="#F97316" name="Loss Streak" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Current Session (if live) */}
      {isLiveMode && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-primary/10 border border-primary/30 rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FaEye className="text-primary" />
            <h3 className="text-lg font-semibold text-white">Live Session Monitor</h3>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-300 text-sm">Session Time</p>
              <p className="text-white font-bold text-xl">1h 23m</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Current Bet</p>
              <p className="text-white font-bold text-xl">$125</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Recent Streak</p>
              <p className="text-red-400 font-bold text-xl">4 Losses</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Tilt Risk</p>
              <p className="text-yellow-400 font-bold text-xl">6/10</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlayerDashboard;