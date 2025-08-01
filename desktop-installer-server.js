/**
 * TrapHouse Desktop Installer Server
 * Handles desktop-only installation and overlay setup
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { PORT_CONFIG, desktopOnlyMiddleware, validateDesktopAgreements, getLocalIP } = require('./port-forwarding-config');

class DesktopInstallerServer {
    constructor() {
        this.app = express();
        this.port = PORT_CONFIG.DESKTOP_INSTALLER;
        this.localIP = getLocalIP();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(desktopOnlyMiddleware);
        
        // CORS for local development
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-TrapHouse-Agreements');
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                service: 'TrapHouse Desktop Installer',
                platform: process.platform,
                time: new Date().toISOString()
            });
        });

        // Desktop installer page
        this.app.get('/install', (req, res) => {
            res.send(this.generateInstallerHTML());
        });

        // Agreements page
        this.app.get('/agreements', (req, res) => {
            res.send(this.generateAgreementsHTML());
        });

        // Download desktop app (placeholder)
        this.app.get('/download/:platform', validateDesktopAgreements, (req, res) => {
            const platform = req.params.platform;
            const supportedPlatforms = ['windows', 'macos', 'linux'];
            
            if (!supportedPlatforms.includes(platform)) {
                return res.status(400).json({
                    error: 'Unsupported Platform',
                    supported: supportedPlatforms
                });
            }

            // For now, redirect to beta server
            res.redirect(`http://${this.localIP}:${PORT_CONFIG.BETA_SERVER}/beta`);
        });

        // Setup overlay
        this.app.post('/setup-overlay', validateDesktopAgreements, (req, res) => {
            const { overlayConfig, userPreferences } = req.body;
            
            console.log('🖥️ Setting up AIM overlay for desktop user');
            console.log('Config:', overlayConfig);
            
            res.json({
                success: true,
                message: 'Overlay configured successfully',
                overlayUrl: `http://${this.localIP}:${PORT_CONFIG.AIM_OVERLAY}/aim-overlay`,
                config: {
                    enabled: true,
                    position: overlayConfig?.position || 'top-right',
                    opacity: overlayConfig?.opacity || 0.9,
                    hotkey: overlayConfig?.hotkey || 'F12'
                }
            });
        });

        // Port forwarding instructions
        this.app.get('/port-forwarding', (req, res) => {
            const { generatePortForwardingInstructions } = require('./port-forwarding-config');
            const instructions = generatePortForwardingInstructions(this.localIP);
            
            res.json({
                localIP: this.localIP,
                instructions: instructions,
                currentPorts: PORT_CONFIG
            });
        });
    }

    generateAgreementsHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrapHouse Beta - Agreements</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 15px;
            padding: 30px;
            border: 1px solid #00ff00;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #00ff00;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .agreement-section {
            margin-bottom: 20px;
            padding: 20px;
            background: rgba(0, 255, 0, 0.1);
            border-radius: 10px;
            border-left: 4px solid #00ff00;
        }
        .agreement-section h3 {
            color: #00ff00;
            margin-bottom: 10px;
        }
        .checkbox-container {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        input[type="checkbox"] {
            margin-right: 10px;
            transform: scale(1.2);
        }
        .btn {
            background: linear-gradient(45deg, #00ff00, #32cd32);
            color: #000;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            margin-top: 20px;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
        }
        .btn:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 TrapHouse Beta Agreements</h1>
            <p>Please review and accept all agreements to continue</p>
        </div>

        <div class="agreement-section">
            <h3>📋 Terms of Service</h3>
            <p>I agree to the TrapHouse Terms of Service and understand this is beta software.</p>
            <div class="checkbox-container">
                <input type="checkbox" id="tos" required>
                <label for="tos">I accept the Terms of Service</label>
            </div>
        </div>

        <div class="agreement-section">
            <h3>🧪 Beta Testing Terms</h3>
            <p>I understand this is beta software and may contain bugs. I agree to provide feedback.</p>
            <div class="checkbox-container">
                <input type="checkbox" id="beta-terms" required>
                <label for="beta-terms">I accept the Beta Testing Terms</label>
            </div>
        </div>

        <div class="agreement-section">
            <h3>🖥️ Desktop Only Access</h3>
            <p>I understand beta testing is only supported on desktop platforms at this time.</p>
            <div class="checkbox-container">
                <input type="checkbox" id="desktop-only" required>
                <label for="desktop-only">I understand desktop-only requirements</label>
            </div>
        </div>

        <div class="agreement-section">
            <h3>📊 Overlay Permissions</h3>
            <p>I consent to the AIM overlay dashboard functionality and screen overlay features.</p>
            <div class="checkbox-container">
                <input type="checkbox" id="overlay-permissions" required>
                <label for="overlay-permissions">I consent to overlay permissions</label>
            </div>
        </div>

        <button class="btn" id="proceedBtn" disabled onclick="proceedToBeta()">
            Proceed to Beta Testing 🚀
        </button>
    </div>

    <script>
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const proceedBtn = document.getElementById('proceedBtn');

        function checkAllAgreements() {
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            proceedBtn.disabled = !allChecked;
        }

        checkboxes.forEach(cb => {
            cb.addEventListener('change', checkAllAgreements);
        });

        function proceedToBeta() {
            const agreements = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.id)
                .join(',');
            
            // Store agreements
            sessionStorage.setItem('traphouse-agreements', agreements);
            
            // Redirect to beta server
            window.location.href = \`http://${this.localIP}:${PORT_CONFIG.BETA_SERVER}/beta\`;
        }
    </script>
</body>
</html>`;
    }

    generateInstallerHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrapHouse Desktop Beta Installer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
            color: #ffffff;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 15px;
            padding: 30px;
            border: 1px solid #00ff00;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #00ff00;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .platform-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .platform-card {
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid #00ff00;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .platform-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 255, 0, 0.2);
        }
        .platform-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        .btn {
            background: linear-gradient(45deg, #00ff00, #32cd32);
            color: #000;
            border: none;
            padding: 12px 25px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 15px;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
        }
        .info-section {
            background: rgba(0, 255, 0, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 TrapHouse Desktop Beta</h1>
            <p>Desktop-only beta testing with overlay dashboard functionality</p>
        </div>

        <div class="info-section">
            <h3>📱 ⚠️ Desktop Only</h3>
            <p>Beta testing is currently only supported on desktop platforms. Mobile support coming soon!</p>
        </div>

        <div class="platform-grid">
            <div class="platform-card" onclick="downloadPlatform('windows')">
                <div class="platform-icon">🪟</div>
                <h3>Windows</h3>
                <p>Windows 10/11 Desktop</p>
                <button class="btn">Download for Windows</button>
            </div>

            <div class="platform-card" onclick="downloadPlatform('macos')">
                <div class="platform-icon">🍎</div>
                <h3>macOS</h3>
                <p>macOS 10.15+ Desktop</p>
                <button class="btn">Download for macOS</button>
            </div>

            <div class="platform-card" onclick="downloadPlatform('linux')">
                <div class="platform-icon">🐧</div>
                <h3>Linux</h3>
                <p>Linux Desktop (Ubuntu/Debian)</p>
                <button class="btn">Download for Linux</button>
            </div>
        </div>

        <div class="info-section">
            <h3>🔧 Port Forwarding Setup</h3>
            <p>Local IP: <strong>${this.localIP}</strong></p>
            <p>Required ports: 3335, 3336, 3337, 3338, 3339</p>
            <button class="btn" onclick="showPortForwarding()">View Port Forwarding Instructions</button>
        </div>

        <div class="info-section">
            <h3>✅ Beta Testers</h3>
            <p>Verified beta tester Discord IDs: 997337840734187621, 1271253905115975773, and others</p>
            <button class="btn" onclick="goToAgreements()">Review Agreements</button>
        </div>
    </div>

    <script>
        function downloadPlatform(platform) {
            // Check if agreements are accepted
            const agreements = sessionStorage.getItem('traphouse-agreements');
            if (!agreements) {
                window.location.href = '/agreements';
                return;
            }
            
            window.location.href = \`/download/\${platform}\`;
        }

        function goToAgreements() {
            window.location.href = '/agreements';
        }

        function showPortForwarding() {
            window.open('/port-forwarding', '_blank');
        }
    </script>
</body>
</html>`;
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 TrapHouse Desktop Installer Server running on port ${this.port}`);
            console.log(`🖥️ Desktop installer: http://${this.localIP}:${this.port}/install`);
            console.log(`📋 Agreements: http://${this.localIP}:${this.port}/agreements`);
            console.log(`🔧 Port forwarding help: http://${this.localIP}:${this.port}/port-forwarding`);
        });
    }
}

// Start the installer server if this file is run directly
if (require.main === module) {
    const installer = new DesktopInstallerServer();
    installer.start();
}

module.exports = DesktopInstallerServer;
