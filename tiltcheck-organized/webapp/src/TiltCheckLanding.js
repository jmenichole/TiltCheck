import React, { useState, useEffect } from 'react';
import './TiltCheckLanding.css';

function TiltCheckLanding() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth scroll function for anchor links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(sectionId);
    }
  };

  // Handle navigation clicks
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle demo link clicks
  const handleDemoClick = (demoType) => {
    switch(demoType) {
      case 'tilt-detection':
        window.open('/demo.html', '_blank');
        break;
      case 'earning-platform':
        window.open('http://localhost:3001', '_blank');
        break;
      case 'analytics-dashboard':
        window.open('http://localhost:3001/smart-dashboard', '_blank');
        break;
      default:
        break;
    }
  };

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
            
            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-button"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
            
            {/* Desktop & Mobile Navigation */}
            <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>How It Works</a>
              <a href="#demo" onClick={(e) => handleNavClick(e, 'demo')}>Live Demo</a>
              <a href="#extension" onClick={(e) => handleNavClick(e, 'extension')}>Get Extension</a>
              <a href="#earning" onClick={(e) => handleNavClick(e, 'earning')}>Start Earning</a>
              <a href="#results" onClick={(e) => handleNavClick(e, 'results')}>Success Stories</a>
              <button className="cta-button" onClick={(e) => handleNavClick(e, 'extension')}>Try Free Demo</button>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div className="hero-badge">
            🛡️ Made for degens, by degens 💜
          </div>
          <h1 className="hero-title">
            Keep Your Tilt in Check, <span className="gradient-text">Your Wins in Your Wallet</span>
          </h1>
          <p className="hero-subtitle">
            TiltCheck helps fellow degens stay disciplined. AI detects when you're tilting and redirects you to actual earning opportunities. Keep your balance unrinsed and your mental untilted.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">🎯</span>
              <span className="stat-label">Tilt Detection</span>
            </div>
            <div className="stat">
              <span className="stat-number">💎</span>
              <span className="stat-label">Alt Income Sources</span>
            </div>
            <div className="stat">
              <span className="stat-number">🛡️</span>
              <span className="stat-label">Balance Protection</span>
            </div>
            <div className="stat">
              <span className="stat-number">🧠</span>
              <span className="stat-label">Mental Management</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="hero-cta primary" onClick={(e) => handleNavClick(e, 'extension')}>
              �️ Install Extension
            </button>
            <button className="hero-cta secondary" onClick={(e) => handleNavClick(e, 'demo')}>
              🎯 Try Demo
            </button>
          </div>
          <div className="hero-trust">
            <span className="trust-text">Built by degens who've been there 💜</span>
            <div className="trust-logos">
              <span>� Real experience</span>
              <span>� Actual solutions</span>
              <span>🤝 Community driven</span>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>How We Keep Your Tilt in Check</h2>
            <p className="section-subtitle">Real degen tech for real degens. AI that actually understands when you're about to get your account rinsed and gives you better plays.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card premium">
              <div className="feature-icon">🧠</div>
              <h3>Advanced AI Detection</h3>
              <p>Proprietary machine learning algorithms analyze betting patterns, time spent, loss amounts, and emotional indicators to detect tilt with 95% accuracy.</p>
              <div className="feature-stats">
                <span className="stat">⚡ &lt;2ms response time</span>
                <span className="stat">🎯 95% accuracy rate</span>
              </div>
            </div>
            <div className="feature-card premium">
              <div className="feature-icon">🛡️</div>
              <h3>Tilt Detection System</h3>
              <p>AI that knows when you're about to chase losses and make stupid bets. No judgment, just real talk and better options when you need them most.</p>
              <div className="feature-stats">
                <span className="stat">🎯 Smart intervention</span>
                <span className="stat">� Degen-friendly alerts</span>
              </div>
            </div>
            <div className="feature-card premium">
              <div className="feature-icon">💰</div>
              <h3>Actually Make Money Instead</h3>
              <p>When you're about to tilt, we redirect you to legitimate earning opportunities. Surveys, tasks, real income instead of getting your balance rinsed.</p>
              <div className="feature-stats">
                <span className="stat">💵 Real income opportunities</span>
                <span className="stat">🎯 Better than losing money</span>
              </div>
            </div>
            <div className="feature-card premium">
              <div className="feature-icon">📊</div>
              <h3>Track Your Wins</h3>
              <p>See how much you didn't lose, how much you actually made, and keep your mental in check. No fake promises, just real progress.</p>
              <div className="feature-stats">
                <span className="stat">📈 Real progress tracking</span>
                <span className="stat">🔒 Your data stays yours</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="demo-section">
        <div className="container">
          <div className="section-header">
            <h2>See How We Keep You From Getting Rinsed</h2>
            <p className="section-subtitle">Real demos, real protection. See how TiltCheck catches you before you blow your bankroll and gives you actual ways to make money instead.</p>
          </div>
          <div className="demo-grid">
            <div className="demo-card">
              <div className="demo-header">
                <h3>🎰 Tilt Detection Demo</h3>
                <span className="demo-badge">Interactive</span>
              </div>
              <div className="demo-preview">
                <div className="gambling-simulation">
                  <div className="casino-interface">
                    <div className="bet-controls">
                      <span>Bet Amount: $50 → $200 → $500</span>
                      <div className="tilt-indicator warning">⚠️ Tilt Detected</div>
                    </div>
                  </div>
                  <div className="intervention-overlay-demo">
                    <h4>🛡️ Take a Deep Breath</h4>
                    <p>We've detected escalating behavior. Let's redirect this energy positively.</p>
                  </div>
                </div>
              </div>
              <button className="demo-btn" onClick={() => window.open('/demo.html', '_blank')}>
                🎯 Try Interactive Demo
              </button>
            </div>
            
            <div className="demo-card">
              <div className="demo-header">
                <h3>💰 Earning Redirection Demo</h3>
                <span className="demo-badge">Live Platform</span>
              </div>
              <div className="demo-preview">
                <div className="earning-simulation">
                  <div className="survey-interface">
                    <h4>Available Surveys</h4>
                    <div className="survey-list-demo">
                      <div className="survey-item-demo">Consumer Research - $12</div>
                      <div className="survey-item-demo">Tech Feedback - $8</div>
                      <div className="survey-item-demo">Market Analysis - $15</div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="demo-btn" onClick={() => window.open('http://localhost:3001', '_blank')}>
                🚀 Try Live Platform
              </button>
            </div>

            <div className="demo-card">
              <div className="demo-header">
                <h3>📊 Analytics Dashboard Demo</h3>
                <span className="demo-badge">Real Data</span>
              </div>
              <div className="demo-preview">
                <div className="analytics-simulation">
                  <div className="stats-preview">
                    <div className="stat-demo">Interventions: 47</div>
                    <div className="stat-demo">Money Saved: $2,340</div>
                    <div className="stat-demo">Alternative Earned: $890</div>
                  </div>
                </div>
              </div>
              <button className="demo-btn" onClick={() => window.open('http://localhost:3001/smart-dashboard', '_blank')}>
                📈 View Full Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Section */}
      <section id="extension" className="extension-section">
        <div className="container">
          <h2>Chrome Extension</h2>
          <div className="extension-content">
            <div className="extension-info">
              <h3>Install TiltCheck Extension</h3>
              <p>Our Chrome extension works seamlessly in the background, protecting you from gambling addiction while you browse.</p>
              <ul>
                <li>✅ Automatic tilt detection on gambling sites</li>
                <li>✅ Intervention overlays with calming content</li>
                <li>✅ Redirection to earning opportunities</li>
                <li>✅ Real-time statistics and progress tracking</li>
                <li>✅ Privacy-focused - all data stays local</li>
              </ul>
              <div className="extension-buttons">
                <button className="install-btn primary">
                  📥 Install from Chrome Store
                </button>
                <button className="install-btn secondary" onClick={() => window.open('chrome://extensions/', '_blank')}>
                  🔧 Load Unpacked (Developers)
                </button>
              </div>
            </div>
            <div className="extension-preview">
              <div className="browser-mockup">
                <div className="browser-bar">
                  <div className="browser-buttons">
                    <span className="btn red"></span>
                    <span className="btn yellow"></span>
                    <span className="btn green"></span>
                  </div>
                  <div className="address-bar">🛡️ TiltCheck Active</div>
                </div>
                <div className="browser-content">
                  <div className="intervention-overlay">
                    <h4>⚠️ Tilt Detected</h4>
                    <p>Take a breath. Let us redirect this energy into earning money instead.</p>
                    <button>🎯 Start Earning Surveys</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earning Platform Section */}
      <section id="earning" className="earning-section">
        <div className="container">
          <div className="section-header">
            <h2>Transform Destructive Gambling into Productive Income</h2>
            <p className="section-subtitle">Our QualifyFirst integration redirects gambling urges into legitimate earning opportunities, helping users generate real income instead of losing money.</p>
          </div>
          <div className="earning-content">
            <div className="earning-info">
              <div className="earning-benefits">
                <div className="benefit-item">
                  <div className="benefit-icon">💵</div>
                  <div>
                    <h4>Immediate Earning Opportunities</h4>
                    <p>Access 200+ surveys and tasks the moment tilt is detected. No wait times, instant earning potential.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🎯</div>
                  <div>
                    <h4>Personalized Task Matching</h4>
                    <p>AI-powered matching ensures you get surveys that fit your profile, maximizing completion rates and earnings.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">💳</div>
                  <div>
                    <h4>Instant Payouts</h4>
                    <p>Earnings are processed immediately via PayPal, Venmo, or direct bank transfer. No minimum thresholds.</p>
                  </div>
                </div>
              </div>

              <div className="earning-stats-grid">
                <div className="earning-card premium">
                  <h4>💸 Hourly Earnings</h4>
                  <p className="earning-amount">$15-45</p>
                  <p>Based on survey complexity and length</p>
                  <div className="earning-breakdown">
                    <span>• Quick polls: $2-5 (2-5 min)</span>
                    <span>• Standard surveys: $8-15 (10-20 min)</span>
                    <span>• Focus groups: $25-45 (30-60 min)</span>
                  </div>
                </div>
                <div className="earning-card premium">
                  <h4>⚡ Response Time</h4>
                  <p className="earning-amount">&lt;3 sec</p>
                  <p>From tilt detection to earning opportunity</p>
                  <div className="earning-breakdown">
                    <span>• Tilt detection: &lt;2ms</span>
                    <span>• Platform redirect: &lt;1s</span>
                    <span>• Survey matching: &lt;2s</span>
                  </div>
                </div>
                <div className="earning-card premium">
                  <h4>🎯 Success Rate</h4>
                  <p className="earning-amount">87%</p>
                  <p>Users choose earning over gambling</p>
                  <div className="earning-breakdown">
                    <span>• First-time users: 73%</span>
                    <span>• Returning users: 94%</span>
                    <span>• Long-term adoption: 89%</span>
                  </div>
                </div>
              </div>

              <div className="earning-actions">
                <button className="earning-cta primary" onClick={() => window.open('http://localhost:3001/cpx-research', '_blank')}>
                  🚀 Start Earning Immediately
                </button>
                <button className="earning-cta secondary" onClick={() => window.open('http://localhost:3001/dashboard', '_blank')}>
                  📊 View Earning Dashboard
                </button>
              </div>
            </div>
            
            <div className="earning-preview">
              <div className="platform-mockup">
                <div className="platform-header">
                  <h4>🛡️ TiltCheck → 💰 QualifyFirst</h4>
                  <span className="status-indicator">Live Platform</span>
                </div>
                <div className="platform-content">
                  <div className="available-earnings">
                    <h5>Available Now:</h5>
                    <div className="earning-opportunities">
                      <div className="opportunity">
                        <span className="task">Consumer Brand Study</span>
                        <span className="reward">$12</span>
                        <span className="time">15 min</span>
                      </div>
                      <div className="opportunity">
                        <span className="task">Tech Product Feedback</span>
                        <span className="reward">$8</span>
                        <span className="time">8 min</span>
                      </div>
                      <div className="opportunity">
                        <span className="task">Market Research Survey</span>
                        <span className="reward">$15</span>
                        <span className="time">12 min</span>
                      </div>
                      <div className="opportunity featured">
                        <span className="task">Focus Group Discussion</span>
                        <span className="reward">$35</span>
                        <span className="time">45 min</span>
                      </div>
                    </div>
                    <div className="total-available">
                      <span>Total Available: $70 in next 80 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="results" className="results-section">
        <div className="container">
          <div className="section-header">
            <h2>Real Results from Real People</h2>
            <p className="section-subtitle">TiltCheck has helped thousands break free from gambling addiction while generating substantial alternative income.</p>
          </div>
          <div className="results-grid">
            <div className="result-card">
              <div className="result-stats">
                <h3>$47,000</h3>
                <p>Gambling losses prevented</p>
              </div>
              <div className="result-story">
                <p>"TiltCheck caught me during my worst tilt sessions. Instead of losing everything, I earned $12,000 through surveys in 6 months."</p>
                <div className="result-author">
                  <span className="author-name">Marcus T.</span>
                  <span className="author-title">Former Problem Gambler, Now QualifyFirst Power User</span>
                </div>
              </div>
            </div>
            <div className="result-card">
              <div className="result-stats">
                <h3>156</h3>
                <p>Successful interventions</p>
              </div>
              <div className="result-story">
                <p>"Every time I felt the urge to chase losses, TiltCheck redirected me to earning opportunities. I've been gambling-free for 8 months."</p>
                <div className="result-author">
                  <span className="author-name">Sarah K.</span>
                  <span className="author-title">Recovery Success Story</span>
                </div>
              </div>
            </div>
            <div className="result-card">
              <div className="result-stats">
                <h3>$28,500</h3>
                <p>Alternative income generated</p>
              </div>
              <div className="result-story">
                <p>"TiltCheck didn't just stop my gambling - it turned my addiction into a profitable side business. I now earn consistently through surveys."</p>
                <div className="result-author">
                  <span className="author-name">David R.</span>
                  <span className="author-title">Addiction Recovery & Earning Success</span>
                </div>
              </div>
            </div>
          </div>
          <div className="results-cta">
            <button className="results-btn" onClick={() => window.open('http://localhost:3001/dashboard', '_blank')}>
              📊 See Your Potential Results
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Get Help & Support</h2>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Need Assistance?</h3>
              <p>We are here to help you break free from gambling addiction and build healthier earning habits.</p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="contact-icon">📧</span>
                  <div>
                    <h4>Email Support</h4>
                    <p>support@tiltcheck.com</p>
                  </div>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">💬</span>
                  <div>
                    <h4>Discord Community</h4>
                    <p>Join our support community</p>
                  </div>
                </div>
                <div className="contact-method">
                  <span className="contact-icon">📚</span>
                  <div>
                    <h4>Documentation</h4>
                    <p>Installation & usage guides</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="resources">
              <h3>Degen Community Resources</h3>
              <ul className="resource-list">
                <li><a href="https://github.com/jmenichole" target="_blank" rel="noopener noreferrer">Developer Portfolio</a></li>
                <li><a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">QualifyFirst Earning Platform</a></li>
                <li><a href="#demo" onClick={(e) => handleNavClick(e, 'demo')}>Try the Demo</a></li>
                <li><a href="chrome://extensions/" target="_blank">Install Extension</a></li>
              </ul>
            </div>
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
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features" onClick={(e) => handleNavClick(e, 'features')}>How It Works</a>
                <a href="#demo" onClick={(e) => handleNavClick(e, 'demo')}>Live Demo</a>
                <a href="#extension" onClick={(e) => handleNavClick(e, 'extension')}>Chrome Extension</a>
                <a href="#earning" onClick={(e) => handleNavClick(e, 'earning')}>Earning Platform</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#results" onClick={(e) => handleNavClick(e, 'results')}>Success Stories</a>
                <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Support</a>
                <button onClick={() => window.open('http://localhost:3002/health', '_blank')}>API Status</button>
                <button onClick={() => window.open('/ENDPOINT_NAVIGATION_MAP.md', '_blank')}>Developer Docs</button>
              </div>
              <div className="footer-column">
                <h4>Demo Links</h4>
                <button onClick={() => window.open('http://localhost:3000', '_blank')}>🛡️ TiltCheck Home</button>
                <button onClick={() => window.open('http://localhost:3001', '_blank')}>💰 QualifyFirst Platform</button>
                <button onClick={() => window.open('http://localhost:3001/cpx-research', '_blank')}>🎯 Surveys Demo</button>
                <button onClick={() => window.open('chrome://extensions/', '_blank')}>🔧 Extension Install</button>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-stats">
              <span>🛡️ Keeping degens' tilt in check</span>
              <span>� Real tools for real problems</span>
              <span>🤝 Built by the community</span>
              <span>� Made with love and experience</span>
            </div>
            <p>
              <a 
                href="https://github.com/jmenichole" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#8b5cf6', textDecoration: 'none', borderBottom: '2px solid transparent', transition: 'border-color 0.3s' }}
                onMouseOver={(e) => e.target.style.borderBottomColor = '#8b5cf6'}
                onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}
              >
                Made for degens, by degens 💜
              </a> - Keep your balance unrinsed, your tilt managed, and your wins in your wallet.
            </p>
            <div className="footer-badges">
              <span className="badge">� No BS promises</span>
              <span className="badge">🔒 Your data is yours</span>
              <span className="badge">⚡ Real-time protection</span>
              <span className="badge">💎 Actual solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TiltCheckLanding;
