'use client';

import { useState, useEffect } from 'react';

interface UserStats {
  degenLevel: number;
  grassTouchingScore: number;
  totalTips: number;
  vaultSuggestions: number;
  accountabilityBuddy: string | null;
}

interface VaultRecommendation {
  name: string;
  description: string;
  risk: string;
  apy: string;
  match: string;
  color: string;
}

export default function JustTheTipDashboard() {
  const [userStats, setUserStats] = useState<UserStats>({
    degenLevel: 45,
    grassTouchingScore: 67,
    totalTips: 12,
    vaultSuggestions: 8,
    accountabilityBuddy: null
  });

  const [vaultRecommendations] = useState<VaultRecommendation[]>([
    {
      name: 'HODL Vault',
      description: 'For when you need to touch grass instead of charts',
      risk: 'Low',
      apy: '5-8%',
      match: '78%',
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Regret Vault', 
      description: 'Lock it up before you buy another dog coin',
      risk: 'Medium',
      apy: '8-15%', 
      match: '85%',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'Therapy Vault',
      description: 'Self-care is the ultimate alpha move',
      risk: 'Emotional',
      apy: '4-6%',
      match: '62%',
      color: 'from-purple-400 to-pink-500'
    }
  ]);

  const getDegenLevelColor = (level: number): string => {
    if (level >= 80) return 'from-red-500 to-red-700';
    if (level >= 60) return 'from-orange-500 to-red-500';
    if (level >= 40) return 'from-yellow-500 to-orange-500';
    if (level >= 20) return 'from-green-500 to-yellow-500';
    return 'from-blue-500 to-green-500';
  };

  const getDegenTitle = (level: number): string => {
    if (level >= 90) return 'Transcendent Degen';
    if (level >= 80) return 'Maximum Overdegen';
    if (level >= 70) return 'Professional Degen';
    if (level >= 60) return 'Advanced Degen';
    if (level >= 50) return 'Intermediate Degen';
    if (level >= 40) return 'Casual Degen';
    if (level >= 30) return 'Degen Apprentice';
    if (level >= 20) return 'Reformed Degen';
    if (level >= 10) return 'Degen in Training';
    return 'Normie (Honorary Degen)';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            💡 JustTheTip Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Your smart crypto accountability assistant - <span className="italic">made for degens by degens</span>
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Degen Level */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${getDegenLevelColor(userStats.degenLevel)} bg-clip-text text-transparent`}>
                {userStats.degenLevel}/100
              </div>
              <h3 className="text-lg font-semibold mb-1">Degen Level</h3>
              <p className="text-sm text-gray-400">{getDegenTitle(userStats.degenLevel)}</p>
              <div className="mt-4 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${getDegenLevelColor(userStats.degenLevel)} transition-all duration-500`}
                  style={{ width: `${userStats.degenLevel}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Grass Touching Score */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {userStats.grassTouchingScore}/100
              </div>
              <h3 className="text-lg font-semibold mb-1">Grass Touching</h3>
              <p className="text-sm text-gray-400">Outdoor Activity Score</p>
              <div className="mt-4 bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${userStats.grassTouchingScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Total Tips */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {userStats.totalTips}
              </div>
              <h3 className="text-lg font-semibold mb-1">Smart Tips</h3>
              <p className="text-sm text-gray-400">AI-Powered Transfers</p>
            </div>
          </div>

          {/* Vault Suggestions */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {userStats.vaultSuggestions}
              </div>
              <h3 className="text-lg font-semibold mb-1">Vault Suggestions</h3>
              <p className="text-sm text-gray-400">Behavioral Analysis</p>
            </div>
          </div>
        </div>

        {/* Vault Recommendations */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">🏦 Personalized Vault Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vaultRecommendations.map((vault, index) => (
              <div
                key={vault.name}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div className="mb-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${vault.color} text-white mb-2`}>
                    {vault.match} Match
                  </div>
                  <h3 className="text-xl font-bold">{vault.name}</h3>
                  <p className="text-gray-400 text-sm italic">"{vault.description}"</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level:</span>
                    <span className="font-semibold">{vault.risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">APY:</span>
                    <span className="font-semibold text-green-400">{vault.apy}</span>
                  </div>
                </div>
                <button className={`w-full mt-4 py-2 rounded-lg font-semibold bg-gradient-to-r ${vault.color} hover:opacity-90 transition-opacity`}>
                  Select Vault
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Accountability Buddy Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">🤝 Accountability Buddy System</h2>
          
          {userStats.accountabilityBuddy ? (
            <div className="text-center">
              <p className="text-lg mb-4">Your buddy: <span className="font-bold text-purple-400">@{userStats.accountabilityBuddy}</span></p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg transition-colors">
                  Send Encouragement
                </button>
                <button className="bg-orange-600 hover:bg-orange-700 py-2 px-4 rounded-lg transition-colors">
                  Send Gentle Roast
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg transition-colors">
                  Check Status
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg mb-6 text-gray-400">No accountability buddy assigned</p>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-2">Why Get a Buddy?</h3>
                <ul className="text-left space-y-2">
                  <li>• Real-time spending alerts</li>
                  <li>• Automated intervention protocols</li>
                  <li>• Shared degeneracy metrics</li>
                  <li>• Emergency support system</li>
                  <li>• AI-powered roast generation</li>
                </ul>
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 py-3 px-8 rounded-lg font-semibold transition-opacity">
                Find Accountability Buddy
              </button>
            </div>
          )}
        </div>

        {/* Command Reference */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">⚡ Discord Commands</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Core Commands</h3>
              <div className="space-y-2 font-mono text-sm">
                <div><span className="text-green-400">!jtt</span> - Show main menu</div>
                <div><span className="text-green-400">!jtt metrics</span> - View your analytics</div>
                <div><span className="text-green-400">!jtt vault 100</span> - Get vault suggestions</div>
                <div><span className="text-green-400">!jtt status</span> - Check integration status</div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Advanced Features</h3>
              <div className="space-y-2 font-mono text-sm">
                <div><span className="text-green-400">!jtt tip 0.01 @user</span> - Smart crypto tipping</div>
                <div><span className="text-green-400">!jtt buddy pair @friend</span> - Set up buddy</div>
                <div><span className="text-green-400">!jtt yolo 0.1</span> - YOLO mode (careful!)</div>
                <div><span className="text-green-400">!jtt leaderboard</span> - Community rankings</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
