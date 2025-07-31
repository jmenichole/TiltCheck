'use client';

import React, { useState, useEffect } from 'react';

interface EcosystemStats {
  trapHouseBot: {
    status: 'online' | 'offline';
    uptime: string;
    activeUsers: number;
    totalLoans: number;
  };
  justTheTip: {
    status: 'active' | 'inactive';
    totalTips: number;
    vaultRecommendations: number;
    buddyMatches: number;
  };
  collectClock: {
    status: 'synced' | 'error';
    platformsTracked: number;
    activeStreaks: number;
    dailyCollections: number;
  };
  tiltCheck: {
    status: 'monitoring' | 'paused';
    alertsToday: number;
    usersMonitored: number;
    highRiskUsers: number;
  };
  github: {
    status: 'connected' | 'disconnected';
    recentCommits: number;
    openIssues: number;
    deployments: number;
  };
}

export default function EcosystemDashboard() {
  const [stats, setStats] = useState<EcosystemStats>({
    trapHouseBot: {
      status: 'online',
      uptime: '72h 15m',
      activeUsers: 234,
      totalLoans: 1580
    },
    justTheTip: {
      status: 'active',
      totalTips: 4672,
      vaultRecommendations: 1205,
      buddyMatches: 89
    },
    collectClock: {
      status: 'synced',
      platformsTracked: 15,
      activeStreaks: 67,
      dailyCollections: 342
    },
    tiltCheck: {
      status: 'monitoring',
      alertsToday: 12,
      usersMonitored: 156,
      highRiskUsers: 3
    },
    github: {
      status: 'connected',
      recentCommits: 23,
      openIssues: 4,
      deployments: 8
    }
  });

  const [selectedSystem, setSelectedSystem] = useState<string>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'synced':
      case 'monitoring':
      case 'connected':
        return 'text-green-400';
      case 'paused':
        return 'text-yellow-400';
      case 'offline':
      case 'inactive':
      case 'error':
      case 'disconnected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'online':
      case 'active':
      case 'synced':
      case 'monitoring':
      case 'connected':
        return `${baseClasses} bg-green-900/30 text-green-400 border border-green-700/50`;
      case 'paused':
        return `${baseClasses} bg-yellow-900/30 text-yellow-400 border border-yellow-700/50`;
      case 'offline':
      case 'inactive':
      case 'error':
      case 'disconnected':
        return `${baseClasses} bg-red-900/30 text-red-400 border border-red-700/50`;
      default:
        return `${baseClasses} bg-gray-900/30 text-gray-400 border border-gray-700/50`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏠 TrapHouse Ecosystem Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Made for degens by degens - Complete system overview
          </p>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {/* TrapHouse Bot */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🏠 TrapHouse Bot</h3>
              <span className={getStatusBadge(stats.trapHouseBot.status)}>
                {stats.trapHouseBot.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-white">{stats.trapHouseBot.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Users:</span>
                <span className="text-white">{stats.trapHouseBot.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Loans:</span>
                <span className="text-white">{stats.trapHouseBot.totalLoans}</span>
              </div>
            </div>
          </div>

          {/* JustTheTip */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">💡 JustTheTip</h3>
              <span className={getStatusBadge(stats.justTheTip.status)}>
                {stats.justTheTip.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tips:</span>
                <span className="text-white">{stats.justTheTip.totalTips}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Vault Suggestions:</span>
                <span className="text-white">{stats.justTheTip.vaultRecommendations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Buddy Matches:</span>
                <span className="text-white">{stats.justTheTip.buddyMatches}</span>
              </div>
            </div>
          </div>

          {/* CollectClock */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">💧 CollectClock</h3>
              <span className={getStatusBadge(stats.collectClock.status)}>
                {stats.collectClock.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Platforms:</span>
                <span className="text-white">{stats.collectClock.platformsTracked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Streaks:</span>
                <span className="text-white">{stats.collectClock.activeStreaks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Collections:</span>
                <span className="text-white">{stats.collectClock.dailyCollections}</span>
              </div>
            </div>
          </div>

          {/* TiltCheck */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🎰 TiltCheck</h3>
              <span className={getStatusBadge(stats.tiltCheck.status)}>
                {stats.tiltCheck.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Users Monitored:</span>
                <span className="text-white">{stats.tiltCheck.usersMonitored}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Alerts Today:</span>
                <span className="text-white">{stats.tiltCheck.alertsToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">High Risk Users:</span>
                <span className="text-red-400">{stats.tiltCheck.highRiskUsers}</span>
              </div>
            </div>
          </div>

          {/* GitHub Integration */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🐙 GitHub</h3>
              <span className={getStatusBadge(stats.github.status)}>
                {stats.github.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Recent Commits:</span>
                <span className="text-white">{stats.github.recentCommits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Open Issues:</span>
                <span className="text-white">{stats.github.openIssues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deployments:</span>
                <span className="text-white">{stats.github.deployments}</span>
              </div>
            </div>
          </div>

          {/* Overall Health */}
          <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🎯 System Health</h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
                Excellent
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-green-400">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Performance:</span>
                <span className="text-green-400">95/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Degen Score:</span>
                <span className="text-purple-400">Maximum</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">🔗 Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href="https://jmenichole.github.io/CollectClock/" 
              target="_blank"
              className="flex items-center space-x-2 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50 hover:bg-blue-800/40 transition-colors"
            >
              <span>💧</span>
              <span className="text-white">CollectClock</span>
            </a>
            <a 
              href="https://traphousediscordbot.created.app" 
              target="_blank"
              className="flex items-center space-x-2 p-3 bg-purple-900/30 rounded-lg border border-purple-700/50 hover:bg-purple-800/40 transition-colors"
            >
              <span>🏠</span>
              <span className="text-white">TrapHouse Site</span>
            </a>
            <a 
              href="https://github.com/jmenichole/trap-house-discord-bot" 
              target="_blank"
              className="flex items-center space-x-2 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/40 transition-colors"
            >
              <span>🐙</span>
              <span className="text-white">GitHub</span>
            </a>
            <a 
              href="https://jmenichole.github.io/Portfolio/" 
              target="_blank"
              className="flex items-center space-x-2 p-3 bg-green-900/30 rounded-lg border border-green-700/50 hover:bg-green-800/40 transition-colors"
            >
              <span>🌟</span>
              <span className="text-white">Portfolio</span>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">📊 Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-green-400">✅</span>
                <span className="text-white">TiltCheck detected high-risk user and triggered THERAPY vault</span>
              </div>
              <span className="text-gray-400 text-sm">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">💧</span>
                <span className="text-white">CollectClock: 15 users completed daily collections</span>
              </div>
              <span className="text-gray-400 text-sm">5 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-purple-400">💡</span>
                <span className="text-white">JustTheTip matched 3 new accountability buddy pairs</span>
              </div>
              <span className="text-gray-400 text-sm">12 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-yellow-400">🏠</span>
                <span className="text-white">TrapHouse: $2,500 loan approved for Street Lieutenant</span>
              </div>
              <span className="text-gray-400 text-sm">18 min ago</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>Made for degens by degens • TrapHouse Ecosystem 2025</p>
          <p className="text-sm mt-1">Turning degeneracy into disciplined gains since day one</p>
        </div>
      </div>
    </div>
  );
}
