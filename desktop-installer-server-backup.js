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

// Desktop Installer Server for TrapHouse Beta
// Portfolio integration, contract-based beta verification, and waitlist system

const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');
const BetaVerificationContract = require('./beta-verification-contract');

const app = express();
const proxy = httpProxy.createProxyServer({});
const betaContract = new BetaVerificationContract();

// Domain configuration
const DOMAIN = process.env.DOMAIN || 'tiltcheck.it.com';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BASE_URL = IS_DEVELOPMENT ? 'http://localhost' : `https://${DOMAIN}`;

// Port configuration
const PORTS = {
    BETA: process.env.BETA_PORT || 3335,
    ANALYTICS: process.env.ANALYTICS_PORT || 3336,
    INSTALLER: process.env.INSTALLER_PORT || 4001  // Changed to 4001 as per deployment status
};

// Enhanced mobile detection middleware
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
                    p { font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px; }
                    .portfolio-links { display: flex; flex-direction: column; gap: 15px; margin: 20px 0; }
                    .portfolio-link {
                        background: linear-gradient(45deg, #ff6b00, #ff4444);
                        color: #fff;
                        padding: 12px 20px;
                        border-radius: 25px;
                        text-decoration: none;
                        font-weight: bold;
                        transition: transform 0.3s;
                    }
                    .portfolio-link:hover { transform: translateY(-2px); }
                    .note { 
                        background: rgba(255, 107, 0, 0.1); 
                        padding: 15px; 
                        border-radius: 10px; 
                        margin: 20px 0; 
                        border: 1px solid rgba(255, 107, 0, 0.3);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🖥️ Desktop Access Required</h1>
                    <p>TiltCheck beta testing requires desktop/laptop access for optimal performance and proper testing.</p>
                    
                    <div class="note">
                        <strong>📱 Mobile Portfolio Access:</strong><br>
                        While beta testing is desktop-only, you can still explore my portfolio projects on mobile:
                    </div>
                    
                    <div class="portfolio-links">
                        <a href="https://linkedin.com/in/jmenichole0" class="portfolio-link">💼 LinkedIn Profile</a>
                        <a href="https://ko-fi.com/jmenichole" class="portfolio-link">☕ Support on Ko-fi</a>
                        <a href="https://github.com/jmenichole" class="portfolio-link">🐙 GitHub Projects</a>
                        <a href="https://jmenichole.github.io/CollectClock/" class="portfolio-link">⏰ CollectClock App</a>
                        <a href="https://traphousediscordbot.created.app" class="portfolio-link">🎮 TrapHouse Demo</a>
                    </div>
                    
                    <p><strong>For beta testing:</strong> Please visit from a desktop browser</p>
                </div>
            </body>
            </html>
        `);
    }
    next();
});

// JSON parsing middleware
app.use(express.json());

// Serve static landing pages
app.use('/static', express.static(path.join(__dirname, 'landing-pages')));

// Portfolio and main landing page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'index.html'));
});

app.get('/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'portfolio.html'));
});

app.get('/justthetip', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'justthetip.html'));
});

app.get('/beta', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'beta.html'));
});

// Enhanced beta access with contract verification
app.get('/beta-access', async (req, res) => {
    const discordId = req.query.discord_id;
    const deviceFingerprint = betaContract.generateDeviceFingerprint(req);
    
    if (!discordId) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>TiltCheck Beta Access</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 50px; text-align: center; }
                    .container { max-width: 600px; margin: auto; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; border: 1px solid #00ff00; }
                    h1 { color: #00ff00; font-size: 2.5rem; margin-bottom: 30px; }
                    input { background: rgba(255,255,255,0.1); border: 1px solid #00ff00; color: #fff; padding: 15px; border-radius: 5px; width: 100%; margin: 10px 0; }
                    button { background: linear-gradient(45deg, #00ff00, #0080ff); color: #000; padding: 15px 30px; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; margin: 20px 0; }
                    .warning { background: rgba(255,107,0,0.1); border: 1px solid #ff6b00; padding: 15px; border-radius: 10px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🧪 TiltCheck Beta Access</h1>
                    <div class="warning">
                        <strong>⚠️ Legal Agreement Required</strong><br>
                        Beta access requires crypto signature verification and device fingerprinting for legal protection.
                    </div>
                    <p>Enter your Discord ID to check beta eligibility:</p>
                    <form onsubmit="checkAccess(event)">
                        <input type="text" id="discordId" placeholder="Your Discord ID (e.g., 1155164907680043059)" required />
                        <button type="submit">Check Beta Access</button>
                    </form>
                    <div id="result"></div>
                </div>
                <script>
                    async function checkAccess(event) {
                        event.preventDefault();
                        const discordId = document.getElementById('discordId').value;
                        window.location.href = '/beta-access?discord_id=' + encodeURIComponent(discordId);
                    }
                </script>
            </body>
            </html>
        `);
    }

    // Check if user is approved for beta
    const isApproved = betaContract.isApprovedBetaUser(discordId);
    
    if (isApproved) {
        // Check for existing valid contract
        const existingContract = await betaContract.hasValidContract(discordId);
        
        if (existingContract) {
            return res.redirect('/tos?contract_verified=true&discord_id=' + encodeURIComponent(discordId));
        }

        // Generate new contract for approved user
        const contract = betaContract.generateBetaContract(discordId, deviceFingerprint);
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Beta Contract Signing</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 30px; }
                    .container { max-width: 800px; margin: auto; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; border: 1px solid #00ff00; }
                    h1 { color: #00ff00; text-align: center; margin-bottom: 30px; }
                    .contract-details { background: rgba(0,255,0,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid rgba(0,255,0,0.3); }
                    .fingerprint { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9rem; margin: 15px 0; }
                    button { background: linear-gradient(45deg, #00ff00, #0080ff); color: #000; padding: 15px 30px; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; margin: 10px; }
                    .signature-input { background: rgba(255,255,255,0.1); border: 1px solid #00ff00; color: #fff; padding: 15px; border-radius: 5px; width: 100%; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🔒 Beta Testing Contract</h1>
                    <div class="contract-details">
                        <h3>Contract Details:</h3>
                        <p><strong>Contract ID:</strong> ${contract.contractId}</p>
                        <p><strong>Discord ID:</strong> ${contract.discordId}</p>
                        <p><strong>Timestamp:</strong> ${contract.timestamp}</p>
                        <p><strong>Device Fingerprint:</strong></p>
                        <div class="fingerprint">
                            Fingerprint: ${contract.deviceFingerprint.fingerprint}<br>
                            Session ID: ${contract.deviceFingerprint.sessionId}<br>
                            User Agent: ${contract.deviceFingerprint.userAgent.substring(0, 50)}...<br>
                            Timestamp: ${contract.deviceFingerprint.timestamp}
                        </div>
                    </div>
                    
                    <h3>Legal Agreement:</h3>
                    <ul style="text-align: left; max-width: 600px; margin: 20px auto;">
                        <li>Desktop-only beta testing access</li>
                        <li>Crypto wallet funding required for JustTheTip features</li>
                        <li>Device fingerprinting for legal tracking</li>
                        <li>7-day session duration limits</li>
                        <li>Feedback and bug reporting required</li>
                        <li>No guarantees on gambling outcomes</li>
                        <li>Personal responsibility for gambling decisions</li>
                        <li>Data collection and monitoring consent</li>
                    </ul>
                    
                    <p><strong>Digital Signature Required:</strong></p>
                    <input type="text" id="userSignature" class="signature-input" placeholder="Type your full name as digital signature" required />
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="signContract()">Sign Contract & Access Beta</button>
                        <button onclick="window.location.href='/'" style="background: #666;">Cancel</button>
                    </div>
                </div>
                
                <script>
                    async function signContract() {
                        const signature = document.getElementById('userSignature').value;
                        if (!signature.trim()) {
                            alert('Please provide your digital signature');
                            return;
                        }
                        
                        const response = await fetch('/sign-contract', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contractId: '${contract.contractId}',
                                discordId: '${contract.discordId}',
                                userSignature: signature
                            })
                        });
                        
                        const result = await response.json();
                        if (result.success) {
                            window.location.href = '/tos?contract_signed=true&discord_id=${encodeURIComponent(discordId)}';
                        } else {
                            alert('Contract signing failed: ' + result.message);
                        }
                    }
                </script>
            </body>
            </html>
        `);
    } else {
        // Generate waitlist ticket for non-approved users
        const waitlistTicket = betaContract.generateWaitlistTicket(discordId, deviceFingerprint);
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Beta Waitlist</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 50px; text-align: center; }
                    .container { max-width: 600px; margin: auto; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; border: 1px solid #ff6b00; }
                    h1 { color: #ff6b00; font-size: 2.5rem; margin-bottom: 30px; }
                    .waitlist-info { background: rgba(255,107,0,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid rgba(255,107,0,0.3); }
                    .ticket-details { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 5px; font-family: monospace; margin: 15px 0; }
                    button { background: linear-gradient(45deg, #ff6b00, #ff4444); color: #fff; padding: 15px 30px; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; margin: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📋 Beta Waitlist</h1>
                    <div class="waitlist-info">
                        <h3>⏳ Added to Waitlist</h3>
                        <p>Your Discord ID <strong>${discordId}</strong> is not currently approved for beta testing.</p>
                        <p>You have been added to the waitlist and a ticket has been created in the Bet Collective Discord.</p>
                    </div>
                    
                    <div class="ticket-details">
                        <strong>Waitlist Ticket:</strong><br>
                        Ticket ID: ${waitlistTicket.ticketId}<br>
                        Discord ID: ${waitlistTicket.discordId}<br>
                        Status: ${waitlistTicket.status}<br>
                        Requested: ${waitlistTicket.requestedAt}<br>
                        Channel: ${waitlistTicket.waitlistChannel}
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ol style="text-align: left; max-width: 400px; margin: 20px auto;">
                        <li>Join the Bet Collective Discord</li>
                        <li>Check tickets channel for updates</li>
                        <li>Wait for manual approval</li>
                        <li>You'll be notified when approved</li>
                    </ol>
                    
                    <button onclick="window.open('https://discord.gg/betcollective', '_blank')">Join Bet Collective Discord</button>
                    <button onclick="window.location.href='/portfolio'" style="background: #666;">View Portfolio</button>
                </div>
            </body>
            </html>
        `);
    }
});
// Author: jmenichole - LinkedIn: linkedin.com/in/jmenichole0 - GitHub: github.com/jmenichole

const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');

const app = express();
const proxy = httpProxy.createProxyServer({});

// Configuration
const PORT = 4001;
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const DESKTOP_DETECTION_ENABLED = true;
const MOBILE_DETECTION_ENABLED = true;

// Portfolio and Social Links
const PORTFOLIO_LINKS = {
    linkedin: 'https://linkedin.com/in/jmenichole0',
    kofi: 'https://ko-fi.com/jmenichole',
    github: 'https://github.com/jmenichole',
    githubSponsors: 'https://github.com/sponsors/jmenichole',
    collectClock: 'https://jmenichole.github.io/CollectClock/',
    portfolioSite: 'https://traphousediscordbot.created.app'
};

// Approved Beta Users (Discord IDs)
const APPROVED_BETA_USERS = [
    '1155164907680043059',
    '297854966591127552', 
    '4927969932326994201217998526663888916'
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

app.get('/collectclock', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'collectclock-landing.html'));
});

app.get('/developer', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-pages', 'developer-portfolio.html'));
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
