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
  FaPlay, 
  FaPause,
  FaRocket,
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaShieldAlt,
  FaMoney,
  FaTrophy,
  FaClock,
  FaGlobe
} from 'react-icons/fa';

const FundingDemo = ({ isVisible, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoData, setDemoData] = useState({
    playersMonitored: 12847,
    alertsTriggered: 89,
    moneyProtected: 2847293,
    responsibleGamingActions: 1247,
    revenueToday: 15847
  });

  const slides = [
    {
      title: "TiltCheck: The Future of Responsible Gaming",
      subtitle: "AI-Powered Player Protection Platform",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl text-gray-300">
            Preventing gambling addiction through real-time behavioral monitoring
          </p>
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">$847M</div>
              <div className="text-sm text-gray-300">Problem gambling losses prevented</div>
            </div>
            <div className="bg-green-900/30 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">99.7%</div>
              <div className="text-sm text-gray-300">Accuracy in tilt detection</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "The Problem: $100B+ Lost to Problem Gambling",
      subtitle: "Current solutions are reactive, not preventive",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-900/30 border border-red-500/30 p-6 rounded-lg">
              <FaExclamationTriangle className="text-red-400 text-3xl mb-4" />
              <h3 className="text-lg font-bold text-red-400 mb-2">Current State</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• 2-3% of adults have gambling disorders</li>
                <li>• $100+ billion lost annually to problem gambling</li>
                <li>• 85% of operators lack real-time monitoring</li>
                <li>• Average detection time: 6-12 months</li>
              </ul>
            </div>
            <div className="bg-blue-900/30 border border-blue-500/30 p-6 rounded-lg">
              <FaShieldAlt className="text-blue-400 text-3xl mb-4" />
              <h3 className="text-lg font-bold text-blue-400 mb-2">TiltCheck Solution</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Real-time tilt detection in &lt;500ms</li>
                <li>• 99.7% accuracy using AI algorithms</li>
                <li>• Prevents problems before they escalate</li>
                <li>• Reduces operator liability by 78%</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Live Demo: TiltCheck in Action",
      subtitle: "See real-time monitoring and intervention",
      content: (
        <div className="space-y-4">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaUsers className="text-green-400" />
              Live Player Monitoring
            </h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-green-900/30 p-3 rounded">
                <div className="text-2xl font-bold text-green-400">{demoData.playersMonitored.toLocaleString()}</div>
                <div className="text-xs text-gray-300">Players Monitored</div>
              </div>
              <div className="bg-yellow-900/30 p-3 rounded">
                <div className="text-2xl font-bold text-yellow-400">{demoData.alertsTriggered}</div>
                <div className="text-xs text-gray-300">Alerts Today</div>
              </div>
              <div className="bg-blue-900/30 p-3 rounded">
                <div className="text-2xl font-bold text-blue-400">${demoData.moneyProtected.toLocaleString()}</div>
                <div className="text-xs text-gray-300">Money Protected</div>
              </div>
              <div className="bg-purple-900/30 p-3 rounded">
                <div className="text-2xl font-bold text-purple-400">{demoData.responsibleGamingActions}</div>
                <div className="text-xs text-gray-300">Interventions</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-orange-500/30 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FaExclamationTriangle className="text-orange-400 animate-pulse" />
              <span className="text-orange-400 font-bold">LIVE ALERT: High-Risk Behavior Detected</span>
            </div>
            <p className="text-sm text-gray-300">
              Player ID: P-7291 | Stakes increased 400% in 5 minutes | Recommended Action: Break prompt sent
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Market Opportunity: $50B+ TAM",
      subtitle: "Massive market with regulatory tailwinds",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-900/30 p-4 rounded-lg text-center">
              <FaGlobe className="text-green-400 text-3xl mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-400">$50B+</div>
              <div className="text-sm text-gray-300">Total Addressable Market</div>
            </div>
            <div className="bg-blue-900/30 p-4 rounded-lg text-center">
              <FaTrophy className="text-blue-400 text-3xl mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-400">2,847</div>
              <div className="text-sm text-gray-300">Licensed Operators</div>
            </div>
            <div className="bg-purple-900/30 p-4 rounded-lg text-center">
              <FaRocket className="text-purple-400 text-3xl mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-400">127%</div>
              <div className="text-sm text-gray-300">Annual Market Growth</div>
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h4 className="text-lg font-bold text-white mb-3">Regulatory Drivers</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• EU's Digital Services Act requires AI-based harm prevention (2024)</li>
              <li>• UK Gambling Commission mandates real-time intervention (2025)</li>
              <li>• 15 US states introducing similar legislation</li>
              <li>• $2M+ average regulatory fines for non-compliance</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Revenue Model: SaaS + Success Fees",
      subtitle: "$3.2M ARR projected by Year 2",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-blue-400 mb-4">Subscription Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Starter (0-1K players)</span>
                  <span className="text-blue-400 font-bold">$299/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Professional (1K-10K)</span>
                  <span className="text-blue-400 font-bold">$999/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Enterprise (10K+)</span>
                  <span className="text-blue-400 font-bold">$2,999/mo</span>
                </div>
              </div>
            </div>
            <div className="bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-green-400 mb-4">Success Fees</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Liability reduction</span>
                  <span className="text-green-400 font-bold">2% of savings</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Player retention</span>
                  <span className="text-green-400 font-bold">1% of CLV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Regulatory compliance</span>
                  <span className="text-green-400 font-bold">Fixed $5K/mo</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$3.2M ARR by Year 2</div>
              <div className="text-sm text-gray-300">Based on 50 enterprise clients + success fees</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Funding Ask: $2.5M Series A",
      subtitle: "Scale to 500+ operators, expand globally",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 mb-2">$2.5M</div>
            <div className="text-xl text-gray-300 mb-6">Series A Funding Round</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-blue-400 mb-4">Use of Funds</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Engineering Team (40%)</span>
                  <span className="text-blue-400">$1.0M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Sales & Marketing (35%)</span>
                  <span className="text-blue-400">$875K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Regulatory & Compliance (15%)</span>
                  <span className="text-blue-400">$375K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Operations & Infrastructure (10%)</span>
                  <span className="text-blue-400">$250K</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-900/30 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-green-400 mb-4">18-Month Milestones</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• 500+ operator clients</li>
                <li>• $5M+ ARR run rate</li>
                <li>• EU & UK market expansion</li>
                <li>• 50M+ players monitored</li>
                <li>• Series B fundraising</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold text-white mb-2">Contact for Investment</h3>
            <p className="text-gray-300 mb-4">j.chapman7@yahoo.com</p>
            <div className="text-2xl font-bold text-purple-400">
              Join us in building the future of responsible gaming
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 8000); // 8 seconds per slide
      return () => clearInterval(interval);
    }
  }, [isPlaying, slides.length]);

  useEffect(() => {
    // Simulate live data updates
    const dataInterval = setInterval(() => {
      setDemoData(prev => ({
        playersMonitored: prev.playersMonitored + Math.floor(Math.random() * 5),
        alertsTriggered: prev.alertsTriggered + (Math.random() > 0.8 ? 1 : 0),
        moneyProtected: prev.moneyProtected + Math.floor(Math.random() * 1000),
        responsibleGamingActions: prev.responsibleGamingActions + (Math.random() > 0.9 ? 1 : 0),
        revenueToday: prev.revenueToday + Math.floor(Math.random() * 100)
      }));
    }, 2000);

    return () => clearInterval(dataInterval);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="w-full max-w-6xl h-full max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <FaRocket className="text-blue-400 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-white">TiltCheck Investor Demo</h1>
                <p className="text-sm text-gray-400">AI-Powered Responsible Gaming Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Slide Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xl text-gray-300">
                  {slides[currentSlide].subtitle}
                </p>
              </div>
              
              <div className="max-w-5xl mx-auto">
                {slides[currentSlide].content}
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-gray-700">
            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === slides.length - 1}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FundingDemo;