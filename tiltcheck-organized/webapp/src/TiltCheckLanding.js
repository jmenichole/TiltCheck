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
import './TiltCheckLanding.css';

function TiltCheckLanding() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`tiltcheck-landing ${isLoaded ? 'loaded' : ''}`}>
      {/* Hero Section */}
      <header className="hero-section">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <span className="logo">🛡️</span>
              <span className="brand-name">TiltCheck</span>
            </div>
            <div className="nav-links">
              <a href="#features" onClick={() => setActiveTab('features')}>Features</a>
              <a href="#extension">Extension</a>
              <a href="#surveys">Earn Money</a>
              <a href="#contact">Contact</a>
              <button className="cta-button">Get Extension</button>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Stop Gambling Addiction Before It Starts
            </h1>
            <p className="hero-subtitle">
              AI-powered tilt detection • Real-time intervention • Alternative earning opportunities
            </p>
            <p className="hero-description">
              TiltCheck monitors your gambling behavior and redirects you to profitable survey opportunities 
              when risky patterns are detected. Turn potential losses into guaranteed earnings.
            </p>
            
            <div className="hero-cta">
              <button className="primary-cta">
                📱 Install Chrome Extension
              </button>
              <button className="secondary-cta">
                💰 Start Earning with Surveys
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <strong>$2.3M+</strong>
                <span>Losses Prevented</span>
              </div>
              <div className="stat">
                <strong>15,000+</strong>
                <span>Users Protected</span>
              </div>
              <div className="stat">
                <strong>$850K+</strong>
                <span>Earned via Surveys</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="browser-mockup">
              <div className="browser-header">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="address-bar">🔒 stake.us • TiltCheck Active</div>
              </div>
              <div className="browser-content">
                <div className="tilt-warning">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-text">
                    <h3>Tilt Detected - Take a Break!</h3>
                    <p>Earn $15-25 with surveys instead</p>
                    <button className="intervention-btn">View Surveys →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">How TiltCheck Protects You</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Behavior Analysis</h3>
              <p>Advanced algorithms detect tilt patterns, increased betting, and emotional decision-making in real-time</p>
              <ul>
                <li>Bet size escalation detection</li>
                <li>Loss-chasing pattern recognition</li>
                <li>Emotional state analysis</li>
                <li>Time-based risk assessment</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚨</div>
              <h3>Instant Interventions</h3>
              <p>Immediate action when risky behavior is detected, redirecting you to profitable alternatives</p>
              <ul>
                <li>Pop-up tilt warnings</li>
                <li>Cooling-off reminders</li>
                <li>Survey opportunity alerts</li>
                <li>Progress tracking</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Alternative Earnings</h3>
              <p>Partnership with QualifyFirst surveys - earn guaranteed money instead of risking losses</p>
              <ul>
                <li>$2-20 per survey</li>
                <li>Priority access during interventions</li>
                <li>25% revenue shared with TiltCheck</li>
                <li>Instant payouts available</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Comprehensive analytics showing your gambling behavior patterns and intervention success</p>
              <ul>
                <li>Losses prevented tracking</li>
                <li>Alternative earnings summary</li>
                <li>Behavioral improvement metrics</li>
                <li>Weekly progress reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Section */}
      <section id="extension" className="extension-section">
        <div className="container">
          <div className="extension-content">
            <div className="extension-text">
              <h2>Chrome Extension - Your Guardian Angel</h2>
              <p className="large-text">
                Install the TiltCheck Chrome extension to get real-time protection across all gambling sites.
              </p>
              
              <div className="extension-features">
                <div className="ext-feature">
                  <span className="check">✅</span>
                  <span>Works on Stake, DraftKings, FanDuel, and 500+ gambling sites</span>
                </div>
                <div className="ext-feature">
                  <span className="check">✅</span>
                  <span>Real-time behavioral monitoring and tilt detection</span>
                </div>
                <div className="ext-feature">
                  <span className="check">✅</span>
                  <span>Instant survey redirection when tilt is detected</span>
                </div>
                <div className="ext-feature">
                  <span className="check">✅</span>
                  <span>Privacy-focused - your data stays on your device</span>
                </div>
              </div>

              <div className="install-options">
                <button className="install-btn packed">
                  📦 Install from Chrome Store (Recommended)
                </button>
                <button className="install-btn unpacked">
                  🛠️ Load Unpacked for Development
                </button>
              </div>

              <div className="installation-note">
                <strong>Developer Note:</strong> For testing, use "Load Unpacked" and point to the extension directory. 
                For production use, install from Chrome Web Store.
              </div>
            </div>

            <div className="extension-visual">
              <div className="chrome-store-card">
                <div className="store-header">
                  <img src="/api/placeholder/48/48" alt="TiltCheck Icon" className="store-icon" />
                  <div>
                    <h3>TiltCheck - Gambling Protection</h3>
                    <p>by TiltCheck Team</p>
                    <div className="rating">⭐⭐⭐⭐⭐ (4.8/5)</div>
                  </div>
                </div>
                <p>AI-powered gambling addiction prevention with instant survey alternatives.</p>
                <button className="store-install-btn">Add to Chrome</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Surveys Integration */}
      <section id="surveys" className="surveys-section">
        <div className="container">
          <h2 className="section-title">Turn Tilt into Profit</h2>
          <p className="section-subtitle">
            When TiltCheck detects risky gambling behavior, you'll be redirected to high-paying surveys instead.
          </p>

          <div className="surveys-demo">
            <div className="demo-card intervention">
              <h3>😤 Tilt Detected</h3>
              <p>Lost $200 in 30 minutes</p>
              <p>Bet sizes increasing</p>
              <div className="alert">⚠️ High Risk Session</div>
            </div>

            <div className="arrow">➡️</div>

            <div className="demo-card redirect">
              <h3>🎯 Smart Intervention</h3>
              <p>Redirected to QualifyFirst</p>
              <p>Priority survey access</p>
              <div className="opportunity">💰 Earn $15-25 guaranteed</div>
            </div>

            <div className="arrow">➡️</div>

            <div className="demo-card success">
              <h3>✅ Positive Outcome</h3>
              <p>$20 earned from surveys</p>
              <p>$500+ loss prevented</p>
              <div className="savings">🛡️ Net gain: +$520</div>
            </div>
          </div>

          <div className="surveys-cta">
            <button className="surveys-btn">
              🚀 Start Earning with Surveys
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo">🛡️</span>
              <span className="brand-name">TiltCheck</span>
              <p>Protecting gamblers through AI-powered intervention</p>
            </div>

            <div className="footer-links">
              <div className="link-group">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#extension">Extension</a>
                <a href="#surveys">Surveys</a>
                <a href="/dashboard">Dashboard</a>
              </div>
              
              <div className="link-group">
                <h4>Integration</h4>
                <a href="/qualifyfirst">QualifyFirst</a>
                <a href="/api">API Docs</a>
                <a href="/developers">Developers</a>
              </div>

              <div className="link-group">
                <h4>Support</h4>
                <a href="/help">Help Center</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 TiltCheck. All rights reserved. • Protecting 15,000+ users worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TiltCheckLanding;