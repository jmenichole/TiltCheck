/**
 * TrapHouse Beta Testing - Port Forwarding Configuration
 * Desktop-only beta testing with overlay dashboard functionality
 */

const os = require('os');

// Required ports for TrapHouse beta testing
const PORT_CONFIG = {
    BETA_SERVER: 3335,        // Main beta testing server
    ANALYTICS: 3336,          // Analytics dashboard (admin/dev)
    AIM_OVERLAY: 3337,        // Desktop overlay dashboard
    FEEDBACK_API: 3338,       // Feedback system API
    DESKTOP_INSTALLER: 3339   // Desktop installer server
};

// Verified beta testers (updated with new Discord IDs)
const VERIFIED_BETA_TESTERS = [
    '115681066538237953',   // Original tester
    '228742205018210304',   // New tester 1
    '1077399941951012864',  // New tester 2
    '261235347038535682',   // New tester 3
    '898170764447072336',   // New tester 4
    '997337840734187621',   // New tester 5
    '1271253905115975773'   // New tester 6
];

// Desktop detection middleware
function desktopOnlyMiddleware(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /Mobile|Android|iPhone|iPad|BlackBerry|Opera Mini/i.test(userAgent);
    
    if (isMobile) {
        return res.status(403).json({
            error: 'Desktop Only',
            message: 'Beta testing is only supported on desktop platforms at this time.',
            details: 'Please access from a desktop computer to use TrapHouse beta features.',
            redirect: 'https://tiltcheck.com/desktop-required',
            supportedPlatforms: ['Windows', 'macOS', 'Linux']
        });
    }
    
    // Log desktop access
    console.log(`🖥️ Desktop access from: ${req.ip} - ${userAgent.substring(0, 100)}`);
    next();
}

// Network interface detection
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    
    return '127.0.0.1'; // Fallback to localhost
}

// Port availability checker
async function checkPortAvailability(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, (err) => {
            if (err) {
                resolve(false);
            } else {
                server.once('close', () => resolve(true));
                server.close();
            }
        });
        
        server.on('error', () => resolve(false));
    });
}

// Port forwarding setup instructions
function generatePortForwardingInstructions(localIP) {
    return {
        routerConfig: {
            description: "Add these rules to your router's port forwarding section:",
            rules: [
                { external: PORT_CONFIG.BETA_SERVER, internal: PORT_CONFIG.BETA_SERVER, ip: localIP, protocol: 'TCP', description: 'Beta Testing Server' },
                { external: PORT_CONFIG.ANALYTICS, internal: PORT_CONFIG.ANALYTICS, ip: localIP, protocol: 'TCP', description: 'Analytics Dashboard' },
                { external: PORT_CONFIG.AIM_OVERLAY, internal: PORT_CONFIG.AIM_OVERLAY, ip: localIP, protocol: 'TCP', description: 'AIM Overlay Dashboard' },
                { external: PORT_CONFIG.FEEDBACK_API, internal: PORT_CONFIG.FEEDBACK_API, ip: localIP, protocol: 'TCP', description: 'Feedback System API' },
                { external: PORT_CONFIG.DESKTOP_INSTALLER, internal: PORT_CONFIG.DESKTOP_INSTALLER, ip: localIP, protocol: 'TCP', description: 'Desktop Installer' }
            ]
        },
        firewallRules: {
            linux: [
                `sudo ufw allow ${PORT_CONFIG.BETA_SERVER}/tcp`,
                `sudo ufw allow ${PORT_CONFIG.ANALYTICS}/tcp`,
                `sudo ufw allow ${PORT_CONFIG.AIM_OVERLAY}/tcp`,
                `sudo ufw allow ${PORT_CONFIG.FEEDBACK_API}/tcp`,
                `sudo ufw allow ${PORT_CONFIG.DESKTOP_INSTALLER}/tcp`
            ],
            windows: [
                `New-NetFirewallRule -DisplayName "TrapHouse Beta ${PORT_CONFIG.BETA_SERVER}" -Direction Inbound -Protocol TCP -LocalPort ${PORT_CONFIG.BETA_SERVER}`,
                `New-NetFirewallRule -DisplayName "TrapHouse Analytics ${PORT_CONFIG.ANALYTICS}" -Direction Inbound -Protocol TCP -LocalPort ${PORT_CONFIG.ANALYTICS}`,
                `New-NetFirewallRule -DisplayName "TrapHouse Overlay ${PORT_CONFIG.AIM_OVERLAY}" -Direction Inbound -Protocol TCP -LocalPort ${PORT_CONFIG.AIM_OVERLAY}`,
                `New-NetFirewallRule -DisplayName "TrapHouse Feedback ${PORT_CONFIG.FEEDBACK_API}" -Direction Inbound -Protocol TCP -LocalPort ${PORT_CONFIG.FEEDBACK_API}`,
                `New-NetFirewallRule -DisplayName "TrapHouse Installer ${PORT_CONFIG.DESKTOP_INSTALLER}" -Direction Inbound -Protocol TCP -LocalPort ${PORT_CONFIG.DESKTOP_INSTALLER}`
            ],
            macos: "No additional firewall rules typically needed on macOS"
        },
        accessUrls: {
            local: {
                beta: `http://${localIP}:${PORT_CONFIG.BETA_SERVER}/beta`,
                analytics: `http://${localIP}:${PORT_CONFIG.ANALYTICS}/analytics`,
                overlay: `http://${localIP}:${PORT_CONFIG.AIM_OVERLAY}/aim-overlay`,
                feedback: `http://${localIP}:${PORT_CONFIG.FEEDBACK_API}/feedback`,
                installer: `http://${localIP}:${PORT_CONFIG.DESKTOP_INSTALLER}/install`
            },
            external: {
                note: "Replace YOUR_EXTERNAL_IP with your actual external IP address",
                beta: `http://YOUR_EXTERNAL_IP:${PORT_CONFIG.BETA_SERVER}/beta`,
                analytics: `http://YOUR_EXTERNAL_IP:${PORT_CONFIG.ANALYTICS}/analytics`,
                overlay: `http://YOUR_EXTERNAL_IP:${PORT_CONFIG.AIM_OVERLAY}/aim-overlay`,
                feedback: `http://YOUR_EXTERNAL_IP:${PORT_CONFIG.FEEDBACK_API}/feedback`,
                installer: `http://YOUR_EXTERNAL_IP:${PORT_CONFIG.DESKTOP_INSTALLER}/install`
            }
        }
    };
}

// TOS and Agreement validation
function validateDesktopAgreements(req, res, next) {
    const agreements = req.headers['x-traphouse-agreements'] || '';
    const requiredAgreements = ['tos', 'beta-terms', 'desktop-only', 'overlay-permissions'];
    
    const acceptedAgreements = agreements.split(',').map(a => a.trim());
    const missingAgreements = requiredAgreements.filter(req => !acceptedAgreements.includes(req));
    
    if (missingAgreements.length > 0) {
        return res.status(428).json({
            error: 'Agreements Required',
            message: 'Please accept all required agreements before accessing beta features.',
            missingAgreements: missingAgreements,
            redirectTo: '/agreements'
        });
    }
    
    next();
}

module.exports = {
    PORT_CONFIG,
    VERIFIED_BETA_TESTERS,
    desktopOnlyMiddleware,
    validateDesktopAgreements,
    getLocalIP,
    checkPortAvailability,
    generatePortForwardingInstructions
};
