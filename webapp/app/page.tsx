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

"use client";
import React from "react";

export default function MainComponent() {
  const [activeTab, setActiveTab] = React.useState("features");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [activeDoc, setActiveDoc] = React.useState("setup");

  const features = [
    {
      icon: "💰",
      title: "Real Money Lending",
      description:
        "Secure lending system with tip.cc integration for real money transactions",
    },
    {
      icon: "👑",
      title: "5-Tier Ranking System",
      description:
        "Street Soldier → Boss progression with automatic role management",
    },
    {
      icon: "🛡️",
      title: "Trust-Based Limits",
      description:
        "Dynamic loan caps based on user trust levels and respect scores",
    },
    {
      icon: "📅",
      title: "Monday-Only Lending",
      description: "Structured lending schedule with 150% repayment rates",
    },
    {
      icon: "🚀",
      title: "Auto-Start System",
      description:
        "Complete macOS deployment with crash recovery and monitoring",
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Comprehensive tracking, leaderboards, and statistics",
    },
  ];

  const pricingTiers = [
    {
      name: "Basic",
      price: "$5",
      period: "/month",
      features: [
        "Standard fronts system",
        "Basic respect tracking",
        "5 loan limit per week",
        "Community support",
      ],
      popular: false,
    },
    {
      name: "VIP",
      price: "$15",
      period: "/month",
      features: [
        "Higher loan caps (+50%)",
        "Exclusive VIP channels",
        "Custom street names",
        "Priority loan processing",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Boss",
      price: "$30",
      period: "/month",
      features: [
        "Maximum loan limits",
        "Private dealer channels",
        "Custom commands",
        "Admin privileges",
        "24/7 dedicated support",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-white">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                🏠 TrapHouse Bot
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {["features", "pricing", "docs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-gray-700 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-600"
              >
                <span className={`block w-6 h-0.5 bg-current transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-current mt-1 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-current mt-1 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {["features", "pricing", "docs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsMenuOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors ${
                    activeTab === tab
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
            TrapHouse Discord Bot
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            The ultimate Discord lending bot with real money integration, 5-tier
            ranking system, and comprehensive automation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://github.com/jmenichole/trap-house-discord-bot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-block"
            >
              Add to Discord
            </a>
            <button
              onClick={() => setActiveTab("docs")}
              className="border-2 border-purple-400 hover:bg-purple-400/20 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-white mb-6">
            Discord Lending Bot
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              With Real Money
            </span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Complete Discord lending system with tip.cc integration, respect-based ranking, 
            and automatic deployment. Turn your Discord server into a financial ecosystem.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
              🚀 Deploy Bot
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-white/20 transition-all">
              📂 View Source
            </button>
          </div>

          {/* Demo Video/Image Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white/60">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-xl">Bot Demo Video</p>
                  <p className="text-sm">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mt-32">
          <h3 className="text-3xl font-bold text-white text-center mb-16">
            Powerful Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "💰",
                title: "Real Money Lending",
                description: "Integrated with tip.cc for actual Discord money transactions with 150% repayment system"
              },
              {
                icon: "👑", 
                title: "5-Tier Respect System",
                description: "Street Soldier → Boss progression with automatic role assignment and respect tracking"
              },
              {
                icon: "🚀",
                title: "Auto-Start Deployment",
                description: "Complete macOS Launch Agent with monitoring, crash recovery, and log management"
              },
              {
                icon: "🛡️",
                title: "Trust-Based Limits",
                description: "Dynamic loan caps based on user behavior, payment history, and respect levels"
              },
              {
                icon: "📊",
                title: "Advanced Analytics",
                description: "Comprehensive logging, user statistics, and lending performance metrics"
              },
              {
                icon: "⚡",
                title: "Production Ready",
                description: "Battle-tested code with error handling, validation, and security best practices"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/20 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-white mb-3">{feature.title}</h4>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mt-32">
          <h3 className="text-3xl font-bold text-white text-center mb-16">
            Monetization Ready
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                tier: "Basic",
                price: "$5",
                features: ["Standard lending", "Basic respect tracking", "5 loans/week", "Community support"]
              },
              {
                tier: "VIP", 
                price: "$15",
                features: ["Higher loan caps (+50%)", "Exclusive VIP channels", "Custom street names", "Priority processing"],
                popular: true
              },
              {
                tier: "Boss",
                price: "$30", 
                features: ["Maximum loan limits", "Private dealer channels", "Custom commands", "Admin privileges"]
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white/10 backdrop-blur-md rounded-xl p-8 border ${plan.popular ? 'border-yellow-400' : 'border-white/10'} relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h4 className="text-2xl font-bold text-white mb-2">{plan.tier}</h4>
                <div className="text-4xl font-bold text-white mb-6">
                  {plan.price}<span className="text-lg text-white/60">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-white/80">
                      <span className="text-green-400 mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Integration */}
        <section className="mt-32">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Open Source & Ready to Deploy
            </h3>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Complete source code available on GitHub. Fork, customize, and deploy your own instance 
              or contribute to the project.
            </p>
            
            {/* GitHub Stats */}
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">55</div>
                <div className="text-white/60">Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">JavaScript</div>
                <div className="text-white/60">Language</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">MIT</div>
                <div className="text-white/60">License</div>
              </div>
            </div>

            {/* GitHub Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://github.com/jmenichole/trap-house-discord-bot" 
                target="_blank"
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>📂</span>
                <span>View Repository</span>
              </a>
              <a 
                href="https://github.com/jmenichole/trap-house-discord-bot/archive/refs/heads/main.zip"
                target="_blank" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>⬇️</span>
                <span>Download ZIP</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2025 TrapHouse Discord Bot. Built with ❤️ for the community.</p>
            <div className="mt-4 space-x-6">
              <a href="https://github.com/jmenichole/trap-house-discord-bot" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
