/*
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

'use client'

import { useState } from 'react'

export default function Home() {
  const [sessionData, setSessionData] = useState({
    betFrequency: 30,
    balanceVolatility: 0.2,
    duration: 45,
    lossStreak: 2
  })
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const analyzeSession = async () => {
    setLoading(true)
    // Simulate API call to Nosana agent
    setTimeout(() => {
      const tiltScore = calculateTiltScore(sessionData)
      setAnalysis({
        tiltScore,
        riskLevel: getRiskLevel(tiltScore),
        recommendations: getRecommendations(tiltScore)
      })
      setLoading(false)
    }, 1000)
  }

  const calculateTiltScore = (data: typeof sessionData) => {
    let score = 0
    if (data.betFrequency > 50) score += 30
    else if (data.betFrequency > 30) score += 15
    if (data.balanceVolatility > 0.5) score += 25
    else if (data.balanceVolatility > 0.3) score += 15
    if (data.duration > 120) score += 20
    else if (data.duration > 60) score += 10
    if (data.lossStreak > 5) score += 25
    else if (data.lossStreak > 3) score += 15
    return Math.min(score, 100)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 70) return 'HIGH'
    if (score >= 40) return 'MEDIUM'
    return 'LOW'
  }

  const getRecommendations = (score: number) => {
    if (score >= 70) {
      return [
        '🛑 STOP: Take a mandatory break for at least 30 minutes',
        '💰 Vault your remaining balance',
        '🧘 Practice deep breathing'
      ]
    } else if (score >= 40) {
      return [
        '⚠️ WARNING: Consider taking a 10-minute break',
        '📊 Review your session stats',
        '🎯 Switch to lower stakes'
      ]
    }
    return [
      '✅ You\'re playing well - stay focused',
      '📈 Keep tracking your sessions'
    ]
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            TiltCheck <span className="text-green-400">Nosana Agent</span>
          </h1>
          <p className="text-xl text-gray-400">
            Decentralized AI-Powered Tilt Detection on Solana
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm font-medium">
              ⚡ Powered by Nosana
            </span>
            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm font-medium">
              🔗 Solana Blockchain
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-black/30 backdrop-blur-lg border border-green-500/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Session Data</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Bet Frequency (bets/hour)</label>
                <input
                  type="number"
                  value={sessionData.betFrequency}
                  onChange={(e) => setSessionData({...sessionData, betFrequency: Number(e.target.value)})}
                  className="w-full bg-black/50 border border-green-500/30 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Balance Volatility (0-1)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sessionData.balanceVolatility}
                  onChange={(e) => setSessionData({...sessionData, balanceVolatility: Number(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Session Duration (minutes)</label>
                <input
                  type="number"
                  value={sessionData.duration}
                  onChange={(e) => setSessionData({...sessionData, duration: Number(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Loss Streak</label>
                <input
                  type="number"
                  value={sessionData.lossStreak}
                  onChange={(e) => setSessionData({...sessionData, lossStreak: Number(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                onClick={analyzeSession}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold py-4 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Analyzing on Nosana...' : '🤖 Analyze with AI Agent'}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-black/30 backdrop-blur-lg border border-green-500/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Analysis Results</h2>
            
            {!analysis ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-6xl mb-4">🎯</div>
                <p>Enter session data and click analyze to get AI-powered tilt detection results</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tilt Score */}
                <div className="bg-black/50 border border-green-500/20 rounded-xl p-6">
                  <h3 className="text-lg text-gray-300 mb-2">Tilt Score</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-white">{analysis.tiltScore}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            analysis.riskLevel === 'HIGH' ? 'bg-red-500' :
                            analysis.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${analysis.tiltScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Level */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg text-gray-300 mb-2">Risk Level</h3>
                  <span className={`inline-block px-6 py-3 rounded-lg text-xl font-bold ${
                    analysis.riskLevel === 'HIGH' ? 'bg-red-600 text-white' :
                    analysis.riskLevel === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {analysis.riskLevel}
                  </span>
                </div>

                {/* Recommendations */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg text-gray-300 mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-gray-200">
                        <span className="text-purple-400 mt-1">→</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blockchain Info */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4">
                  <p className="text-sm text-gray-300">
                    ✅ Analysis computed on Nosana decentralized network
                    <br />
                    🔗 Results verifiable on Solana blockchain
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-black/30 backdrop-blur-lg border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-colors">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Decentralized AI</h3>
            <p className="text-gray-400">Models run on Nosana compute network for transparency and reliability</p>
          </div>

          <div className="bg-black/30 backdrop-blur-lg border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-colors">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="text-xl font-bold text-white mb-2">Solana Integration</h3>
            <p className="text-gray-400">All behavioral data and results stored on-chain for verifiability</p>
          </div>

          <div className="bg-black/30 backdrop-blur-lg border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-colors">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Analysis</h3>
            <p className="text-gray-400">Low-latency tilt detection with instant alerts and recommendations</p>
          </div>
        </div>
      </div>
    </main>
  )
}
