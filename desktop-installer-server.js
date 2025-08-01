// Desktop Installer Server for TrapHouse Beta with Portfolio Integration
// Only allows desktop clients, forwards ports, and launches dashboard overlay after TOS/agreements
// Author: jmenichole - LinkedIn: linkedin.com/in/jmenichole0 - GitHub: github.com/jmenichole

const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({});

// Portfolio and Social Links
const PORTFOLIO_LINKS = {
    linkedin: 'https://linkedin.com/in/jmenichole0',
    kofi: 'https://ko-fi.com/jmenichole',
    github: 'https://github.com/jmenichole',
    githubSponsors: 'https://github.com/sponsors/jmenichole',
    collectClock: 'https://jmenichole.github.io/CollectClock/',
    portfolioSite: 'https://traphousediscordbot.created.app'
};

// Approved Beta Test Discord IDs
const APPROVED_BETA_USERS = [
    '1155164907680043059',
    '297854966591127552', 
    '997337840734187621',
    '1271253905115975773'
];

// Configuration
const DOMAIN = 'tiltcheck.it.com';
const PORTS = {
  INSTALLER: process.env.PORT || 4001,
  BETA: 3335,
  ANALYTICS: 3336
};

// Middleware: Block mobile clients
app.use((req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    if (isMobile) {
        return res.status(403).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Desktop Only - TiltCheck Portfolio</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background: linear-gradient(135deg, #2c1810 0%, #8b4513 50%, #654321 100%);
                        color: #ffffff;
                        text-align: center;
                        padding: 50px 20px;
                        margin: 0;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background: rgba(0, 0, 0, 0.8);
                        padding: 40px;
                        border-radius: 15px;
                        border: 1px solid #ff6b00;
                    }
                    h1 { color: #ff6b00; font-size: 2rem; margin-bottom: 20px; }
                    .portfolio-links { margin: 20px 0; }
                    .portfolio-links a {
                        color: #4CAF50;
                        text-decoration: none;
                        margin: 0 10px;
                        padding: 8px 16px;
                        border: 1px solid #4CAF50;
                        border-radius: 5px;
                        display: inline-block;
                        margin-bottom: 10px;
                    }
                    .cta {
                        background: linear-gradient(45deg, #ff6b00, #ff4444);
                        color: #fff;
                        padding: 15px 30px;
                        border-radius: 30px;
                        text-decoration: none;
                        display: inline-block;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🖥️ Desktop Only Access</h1>
                    <p>TiltCheck beta testing is currently only supported on desktop and laptop computers.</p>
                    <div class="portfolio-links">
                        <p><strong>Developer Portfolio:</strong></p>
                        <a href="${PORTFOLIO_LINKS.portfolioSite}">Portfolio Site</a>
                        <a href="${PORTFOLIO_LINKS.collectClock}">CollectClock</a>
                        <a href="${PORTFOLIO_LINKS.linkedin}">LinkedIn</a>
                        <a href="${PORTFOLIO_LINKS.github}">GitHub</a>
                    </div>
                    <p>Please visit from a desktop browser to access the full TiltCheck ecosystem.</p>
                    <a href="https://${DOMAIN}" class="cta">Visit on Desktop</a>
                </div>
            </body>
            </html>
        `);
    }
    next();
});

// Serve static landing pages
app.use('/static', express.static(path.join(__dirname, 'landing-pages')));

// Portfolio integration routes
app.get('/portfolio', (req, res) => {
    res.redirect(PORTFOLIO_LINKS.portfolioSite);
});

app.get('/collectclock', (req, res) => {
    res.redirect(PORTFOLIO_LINKS.collectClock);
});

app.get('/developer', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>jmenichole - Developer Portfolio</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    color: #ffffff;
                    text-align: center;
                    padding: 50px 20px;
                    margin: 0;
                }
                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    background: rgba(0, 0, 0, 0.8);
                    padding: 50px;
                    border-radius: 15px;
                    border: 1px solid #4CAF50;
                }
                h1 {
                    font-size: 3rem;
                    background: linear-gradient(45deg, #4CAF50, #2196F3);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 30px;
                }
                .social-links {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 30px 0;
                }
                .social-link {
                    background: rgba(76, 175, 80, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid rgba(76, 175, 80, 0.3);
                    text-decoration: none;
                    color: #4CAF50;
                    transition: transform 0.3s;
                }
                .social-link:hover {
                    transform: translateY(-5px);
                    background: rgba(76, 175, 80, 0.2);
                }
                .projects {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                    margin: 40px 0;
                }
                .project {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 25px;
                    border-radius: 10px;
                    border-left: 4px solid #4CAF50;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>jmenichole</h1>
                <p style="font-size: 1.3rem;">Full-Stack Developer & Discord Bot Specialist</p>
                <p>Creator of TiltCheck, JustTheTip, and CollectClock</p>
                
                <div class="social-links">
                    <a href="${PORTFOLIO_LINKS.linkedin}" class="social-link">
                        <h3>💼 LinkedIn</h3>
                        <p>Professional Network</p>
                    </a>
                    <a href="${PORTFOLIO_LINKS.github}" class="social-link">
                        <h3>💻 GitHub</h3>
                        <p>Code Repositories</p>
                    </a>
                    <a href="${PORTFOLIO_LINKS.githubSponsors}" class="social-link">
                        <h3>💖 GitHub Sponsors</h3>
                        <p>Support Development</p>
                    </a>
                    <a href="${PORTFOLIO_LINKS.kofi}" class="social-link">
                        <h3>☕ Ko-fi</h3>
                        <p>Buy Me a Coffee</p>
                    </a>
                </div>
                
                <div class="projects">
                    <div class="project">
                        <h3>🎰 TiltCheck</h3>
                        <p>Advanced gambling accountability system with real-time monitoring and addiction prevention.</p>
                        <a href="/beta" style="color: #4CAF50;">Try Beta →</a>
                    </div>
                    <div class="project">
                        <h3>💰 JustTheTip</h3>
                        <p>Multi-chain crypto payment and tipping system for Discord communities.</p>
                        <a href="/justthetip" style="color: #4CAF50;">Learn More →</a>
                    </div>
                    <div class="project">
                        <h3>⏰ CollectClock</h3>
                        <p>Time tracking and productivity tool with beautiful visualizations.</p>
                        <a href="${PORTFOLIO_LINKS.collectClock}" style="color: #4CAF50;">View Project →</a>
                    </div>
                </div>
                
                <p style="margin-top: 40px;">
                    <a href="${PORTFOLIO_LINKS.portfolioSite}" style="color: #4CAF50; font-size: 1.2rem;">View Full Portfolio →</a>
                </p>
            </div>
        </body>
        </html>
    `);
});

// Landing page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'tiltcheck.html'));
});

app.get('/justthetip', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'justthetip.html'));
});

app.get('/beta', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'tiltcheck-beta.html'));
});

// Beta access validation
app.get('/beta-access', (req, res) => {
    const discordId = req.query.discord_id;
    const isApproved = APPROVED_BETA_USERS.includes(discordId);
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>TiltCheck Beta Access Validation</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
                    color: #ffffff;
                    text-align: center;
                    padding: 50px 20px;
                    margin: 0;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: rgba(0, 0, 0, 0.8);
                    padding: 50px;
                    border-radius: 15px;
                    border: 1px solid ${isApproved ? '#00ff00' : '#ff4444'};
                }
                .status {
                    font-size: 2rem;
                    margin-bottom: 20px;
                    color: ${isApproved ? '#00ff00' : '#ff4444'};
                }
                .developer-info {
                    background: rgba(76, 175, 80, 0.1);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 30px 0;
                }
                .portfolio-links {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    flex-wrap: wrap;
                    margin: 20px 0;
                }
                .portfolio-links a {
                    color: #4CAF50;
                    text-decoration: none;
                    padding: 10px 20px;
                    border: 1px solid #4CAF50;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status">
                    ${isApproved ? '✅ Beta Access Approved' : '❌ Beta Access Required'}
                </div>
                
                ${isApproved ? 
                    '<p>Welcome to TiltCheck Beta! You have been approved for testing.</p><a href="/tos" style="background: #00ff00; color: #000; padding: 15px 30px; border-radius: 30px; text-decoration: none; font-weight: bold;">Continue to Beta →</a>' :
                    '<p>Beta access is currently limited to approved Discord users. Please contact the developer for access.</p>'
                }
                
                <div class="developer-info">
                    <h3>🛠️ Developed by jmenichole</h3>
                    <p>Full-stack developer specializing in Discord bots, crypto integration, and gambling accountability systems.</p>
                    <div class="portfolio-links">
                        <a href="${PORTFOLIO_LINKS.linkedin}">LinkedIn</a>
                        <a href="${PORTFOLIO_LINKS.github}">GitHub</a>
                        <a href="${PORTFOLIO_LINKS.githubSponsors}">Sponsor</a>
                        <a href="${PORTFOLIO_LINKS.kofi}">Ko-fi</a>
                        <a href="${PORTFOLIO_LINKS.portfolioSite}">Portfolio</a>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>Other Projects:</h3>
                    <a href="${PORTFOLIO_LINKS.collectClock}" style="color: #4CAF50;">CollectClock - Time Tracking Tool</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Serve TOS and agreements page
app.get('/tos', (req, res) => {
  res.sendFile(path.join(__dirname, 'tos.html'));
});

// Accept agreements endpoint
app.post('/accept-tos', express.json(), (req, res) => {
  console.log(`📋 TOS accepted at ${req.body.timestamp || new Date().toISOString()}`);
  res.json({ 
    success: true, 
    message: 'Terms accepted. Redirecting to dashboard...',
    redirect: '/dashboard'
  });
});

// Proxy/forward beta dashboard requests to the analytics server (dashboard overlay)
app.use('/dashboard', (req, res) => {
  proxy.web(req, res, { 
    target: `http://localhost:${PORTS.ANALYTICS}`,
    changeOrigin: true
  });
});

// Proxy/forward API requests to beta server
app.use('/api', (req, res) => {
  proxy.web(req, res, { 
    target: `http://localhost:${PORTS.BETA}`,
    changeOrigin: true
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    domain: DOMAIN,
    environment: IS_DEVELOPMENT ? 'development' : 'production',
    developer: {
      name: 'jmenichole',
      portfolio: PORTFOLIO_LINKS.portfolioSite,
      github: PORTFOLIO_LINKS.github,
      linkedin: PORTFOLIO_LINKS.linkedin
    },
    approvedBetaUsers: APPROVED_BETA_USERS.length,
    services: {
      beta: `http://localhost:${PORTS.BETA}`,
      analytics: `http://localhost:${PORTS.ANALYTICS}`,
      installer: `http://localhost:${PORTS.INSTALLER}`,
      collectclock: `http://localhost:${PORTS.COLLECTCLOCK}`,
      portfolio: `http://localhost:${PORTS.PORTFOLIO}`
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling for proxy
proxy.on('error', (err, req, res) => {
  console.error('❌ Proxy error:', err.message);
  if (!res.headersSent) {
    res.status(502).json({ 
      error: 'Service unavailable', 
      message: 'Backend service is not responding',
      service: req.url.includes('/dashboard') ? 'analytics' : 'beta',
      developer: {
        contact: PORTFOLIO_LINKS.linkedin,
        github: PORTFOLIO_LINKS.github
      }
    });
  }
});

// Start the installer server
app.listen(PORTS.INSTALLER, () => {
  console.log(`🖥️ Desktop Installer Server for ${DOMAIN}`);
  console.log(`👨‍💻 Developer: jmenichole`);
  console.log(`🔗 Portfolio: ${PORTFOLIO_LINKS.portfolioSite}`);
  console.log(`🌐 Running on http://localhost:${PORTS.INSTALLER}`);
  console.log('📄 Landing pages available:');
  console.log(`   • TiltCheck: http://localhost:${PORTS.INSTALLER}/`);
  console.log(`   • JustTheTip: http://localhost:${PORTS.INSTALLER}/justthetip`);
  console.log(`   • Beta: http://localhost:${PORTS.INSTALLER}/beta`);
  console.log(`   • Developer: http://localhost:${PORTS.INSTALLER}/developer`);
  console.log(`   • Portfolio: http://localhost:${PORTS.INSTALLER}/portfolio`);
  console.log(`   • CollectClock: http://localhost:${PORTS.INSTALLER}/collectclock`);
  console.log(`   • Dashboard: http://localhost:${PORTS.INSTALLER}/dashboard`);
  console.log(`   • Terms: http://localhost:${PORTS.INSTALLER}/tos`);
  console.log(`👥 Approved Beta Users: ${APPROVED_BETA_USERS.length}`);
  console.log('🚫 Mobile clients blocked - Desktop only access');
  console.log(`⚙️ Environment: ${IS_DEVELOPMENT ? 'Development' : 'Production'}`);
  console.log(`🔗 Proxying to Beta: ${PORTS.BETA}, Analytics: ${PORTS.ANALYTICS}`);
});
