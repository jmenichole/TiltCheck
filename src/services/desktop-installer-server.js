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
    INSTALLER: process.env.INSTALLER_PORT || 4002
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
        
        // Save the contract immediately so it can be found during signing
        await betaContract.saveContract(contract);
        console.log(`📋 Generated and saved new contract: ${contract.contractId} for Discord ID: ${discordId}`);
        
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

// Contract signing endpoint with NFT minting
app.post('/sign-contract', async (req, res) => {
    try {
        const { contractId, discordId, userSignature } = req.body;
        
        if (!contractId || !discordId || !userSignature) {
            return res.json({ success: false, message: 'Missing required fields' });
        }
        
        const result = await betaContract.signContract(contractId, userSignature);
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Contract signed and NFT minted successfully',
                nft: {
                    tokenId: result.nft.tokenId,
                    verificationUrl: result.nft.verificationUrl
                }
            });
        } else {
            res.json({ success: false, message: result.error || 'Contract signing failed' });
        }
    } catch (error) {
        console.error('Contract signing error:', error);
        res.json({ success: false, message: 'Internal server error' });
    }
});

// NFT verification endpoint
app.get('/verify-nft/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const nftDetails = await betaContract.getNFTDetails(tokenId);
        
        if (!nftDetails.isValid) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>NFT Verification Failed</title>
                    <style>
                        body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 50px; text-align: center; }
                        .container { max-width: 600px; margin: auto; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; border: 1px solid #ff6b00; }
                        h1 { color: #ff6b00; font-size: 2.5rem; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ NFT Verification Failed</h1>
                        <p>The requested NFT could not be verified or does not exist.</p>
                        <a href="/portfolio" style="color:#00ff00;">Return to Portfolio</a>
                    </div>
                </body>
                </html>
            `);
        }

        const metadata = nftDetails.metadata;
        const discordId = metadata.attributes.find(attr => attr.trait_type === 'Discord ID')?.value;
        const contractId = metadata.attributes.find(attr => attr.trait_type === 'Contract ID')?.value;
        const mintDate = metadata.attributes.find(attr => attr.trait_type === 'Mint Date')?.value;
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>TiltCheck Beta NFT Verification</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 30px; }
                    .container { max-width: 800px; margin: auto; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; border: 1px solid #00ff00; }
                    h1 { color: #00ff00; text-align: center; margin-bottom: 30px; }
                    .nft-display { display: flex; gap: 30px; margin: 30px 0; }
                    .nft-image { flex: 1; }
                    .nft-details { flex: 2; }
                    .nft-image img { width: 100%; max-width: 300px; border-radius: 15px; border: 2px solid #00ff00; }
                    .attribute { background: rgba(0,255,0,0.1); padding: 10px; border-radius: 5px; margin: 10px 0; border: 1px solid rgba(0,255,0,0.3); }
                    .verification-badge { background: rgba(0,255,0,0.2); padding: 15px; border-radius: 10px; text-align: center; border: 2px solid #00ff00; margin: 20px 0; }
                    .contract-link { color: #00ff00; text-decoration: none; font-weight: bold; }
                    .contract-link:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎮 TiltCheck Beta NFT Verification</h1>
                    
                    <div class="verification-badge">
                        <h2>✅ NFT VERIFIED</h2>
                        <p>This NFT represents a valid, legally binding beta testing contract</p>
                    </div>
                    
                    <div class="nft-display">
                        <div class="nft-image">
                            <img src="${metadata.image}" alt="${metadata.name}" />
                            ${metadata.animation_url ? `<p><a href="${metadata.animation_url}" target="_blank" class="contract-link">View Animated Version</a></p>` : ''}
                        </div>
                        
                        <div class="nft-details">
                            <h3>NFT Details</h3>
                            <div class="attribute">
                                <strong>Name:</strong> ${metadata.name}
                            </div>
                            <div class="attribute">
                                <strong>Token ID:</strong> ${tokenId}
                            </div>
                            <div class="attribute">
                                <strong>Owner (Discord ID):</strong> ${discordId}
                            </div>
                            <div class="attribute">
                                <strong>Contract ID:</strong> ${contractId}
                            </div>
                            <div class="attribute">
                                <strong>Minted:</strong> ${mintDate}
                            </div>
                            <div class="attribute">
                                <strong>Status:</strong> <span style="color: #00ff00;">Active & Verified</span>
                            </div>
                        </div>
                    </div>
                    
                    <h3>Contract Attributes</h3>
                    ${metadata.attributes.map(attr => `
                        <div class="attribute">
                            <strong>${attr.trait_type}:</strong> ${attr.value}
                        </div>
                    `).join('')}
                    
                    <h3>NFT Properties</h3>
                    <div class="attribute">
                        <strong>Transferable:</strong> ${metadata.properties.transferable ? 'Yes' : 'No (Security Locked)'}
                    </div>
                    <div class="attribute">
                        <strong>Utility:</strong> ${metadata.properties.utility.join(', ')}
                    </div>
                    <div class="attribute">
                        <strong>Rarity:</strong> ${metadata.properties.rarity}
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="/beta-access?discord_id=${encodeURIComponent(discordId)}" class="contract-link">Verify Beta Access</a> |
                        <a href="/portfolio" class="contract-link">Return to Portfolio</a>
                    </div>
                </div>
            </body>
            </html>
        `);
        
    } catch (error) {
        console.error('NFT verification error:', error);
        res.status(500).send('NFT verification failed');
    }
});

// NFT metadata endpoint (OpenSea compatible)
app.get('/api/nft/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const metadata = await betaContract.nftContract.getNFTMetadata(tokenId);
        
        if (!metadata) {
            return res.status(404).json({ error: 'NFT not found' });
        }
        
        res.json(metadata);
    } catch (error) {
        console.error('NFT metadata error:', error);
        res.status(500).json({ error: 'Failed to get NFT metadata' });
    }
});

// User NFT dashboard
app.get('/my-nfts', async (req, res) => {
    const discordId = req.query.discord_id;
    
    if (!discordId) {
        return res.redirect('/beta-access');
    }
    
    try {
        const nftVerification = await betaContract.verifyNFTOwnership(discordId);
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>My TiltCheck Beta NFTs</title>
                <style>
                    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 30px; }
                    .container { max-width: 1000px; margin: auto; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; border: 1px solid #00ff00; }
                    h1 { color: #00ff00; text-align: center; margin-bottom: 30px; }
                    .nft-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
                    .nft-card { background: rgba(0,255,0,0.1); border: 1px solid #00ff00; border-radius: 15px; padding: 20px; text-align: center; }
                    .nft-id { font-family: monospace; color: #00ff00; font-size: 0.9rem; }
                    .verify-btn { background: linear-gradient(45deg, #00ff00, #0080ff); color: #000; padding: 10px 20px; border: none; border-radius: 25px; font-weight: bold; cursor: pointer; margin: 10px; text-decoration: none; display: inline-block; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎮 My TiltCheck Beta NFTs</h1>
                    
                    <div style="text-align: center; margin: 20px 0;">
                        <strong>Discord ID:</strong> ${discordId}<br>
                        <strong>Total NFTs:</strong> ${nftVerification.totalNFTs}<br>
                        <strong>Status:</strong> ${nftVerification.hasValidNFT ? '<span style="color: #00ff00;">✅ Verified Beta Access</span>' : '<span style="color: #ff6b00;">❌ No Valid NFTs</span>'}
                    </div>
                    
                    ${nftVerification.totalNFTs > 0 ? `
                        <div class="nft-grid">
                            ${nftVerification.nfts.map(nft => `
                                <div class="nft-card">
                                    <h3>${nft.name || 'TiltCheck Beta NFT'}</h3>
                                    <div class="nft-id">Token: ${nft.tokenId?.slice(-8) || 'Unknown'}</div>
                                    <p><strong>Contract:</strong> ${nft.contractId?.slice(-8) || 'Unknown'}</p>
                                    <p><strong>Minted:</strong> ${new Date(nft.mintedAt).toLocaleDateString()}</p>
                                    <a href="/verify-nft/${nft.tokenId}" class="verify-btn">View NFT</a>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 50px; color: #ff6b00;">
                            <h2>🔍 No NFTs Found</h2>
                            <p>You don't have any TiltCheck Beta NFTs yet.</p>
                            <a href="/beta-access?discord_id=${encodeURIComponent(discordId)}" class="verify-btn">Get Beta Access</a>
                        </div>
                    `}
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="/beta-access?discord_id=${encodeURIComponent(discordId)}" class="verify-btn">Check Beta Access</a>
                        <a href="/portfolio" class="verify-btn" style="background: #666;">Return to Portfolio</a>
                    </div>
                </div>
            </body>
            </html>
        `);
        
    } catch (error) {
        console.error('My NFTs error:', error);
        res.status(500).send('Failed to load NFT dashboard');
    }
});

// Terms of Service with contract verification and NFT display
app.get('/tos', async (req, res) => {
    const contractSigned = req.query.contract_signed === 'true';
    const contractVerified = req.query.contract_verified === 'true';
    const discordId = req.query.discord_id;
    
    if (!contractSigned && !contractVerified) {
        return res.redirect('/beta-access');
    }
    
    // Get user's NFT information
    let nftInfo = { hasValidNFT: false, nfts: [] };
    if (discordId) {
        try {
            nftInfo = await betaContract.verifyNFTOwnership(discordId);
        } catch (error) {
            console.error('Failed to get NFT info:', error);
        }
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>TiltCheck Terms of Service</title>
            <style>
                body { font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 30px; }
                .container { max-width: 900px; margin: auto; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px; border: 1px solid #00ff00; }
                h1 { color: #00ff00; text-align: center; margin-bottom: 30px; }
                .status { background: rgba(0,255,0,0.1); padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid rgba(0,255,0,0.3); text-align: center; }
                .nft-status { background: rgba(255,107,0,0.1); padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid rgba(255,107,0,0.3); text-align: center; }
                .tos-content { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 10px; margin: 20px 0; }
                button { background: linear-gradient(45deg, #00ff00, #0080ff); color: #000; padding: 15px 30px; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; margin: 10px; }
                .warning { background: rgba(255,107,0,0.1); border: 1px solid #ff6b00; padding: 15px; border-radius: 10px; margin: 20px 0; }
                .nft-link { color: #ff6b00; text-decoration: none; font-weight: bold; }
                .nft-link:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📜 TiltCheck Terms of Service</h1>
                
                <div class="status">
                    <strong>✅ Contract Status:</strong> ${contractSigned ? 'Newly Signed' : 'Previously Verified'}<br>
                    <strong>Discord ID:</strong> ${discordId || 'Not provided'}
                </div>
                
                ${nftInfo.hasValidNFT ? `
                    <div class="nft-status">
                        <strong>🎮 NFT Contract Verification:</strong> ✅ Valid Beta NFT Found<br>
                        <strong>Total NFTs:</strong> ${nftInfo.totalNFTs}<br>
                        <a href="/my-nfts?discord_id=${encodeURIComponent(discordId)}" class="nft-link">View My Beta NFTs</a>
                    </div>
                ` : `
                    <div class="nft-status">
                        <strong>🎮 NFT Contract Verification:</strong> ⏳ NFT Being Minted<br>
                        <em>Your Beta Access NFT is being created as proof of this signed contract</em>
                    </div>
                `}
                
                <div class="warning">
                    <strong>⚠️ Beta Testing Agreement</strong><br>
                    By proceeding, you acknowledge that you have signed a legally binding contract with crypto signature verification, device fingerprinting, and NFT-based proof of agreement for legal protection.
                </div>
                
                <div class="tos-content">
                    <h3>Terms and Conditions:</h3>
                    <ol>
                        <li><strong>Desktop-Only Access:</strong> Beta testing is restricted to desktop/laptop computers only</li>
                        <li><strong>Crypto Wallet Required:</strong> JustTheTip features require funded crypto wallet for betting</li>
                        <li><strong>Legal Protection:</strong> Device fingerprinting and crypto signatures provide legal tracking</li>
                        <li><strong>NFT Contract Verification:</strong> Your signed contract generates a unique NFT as proof of agreement</li>
                        <li><strong>Discord ID Linking:</strong> NFT ownership is permanently linked to your Discord account</li>
                        <li><strong>Session Limits:</strong> 7-day maximum session duration with re-verification required</li>
                        <li><strong>Feedback Required:</strong> Beta testers must provide feedback and report bugs</li>
                        <li><strong>No Guarantees:</strong> No guarantees on gambling outcomes or profits</li>
                        <li><strong>Personal Responsibility:</strong> Users are responsible for their gambling decisions</li>
                        <li><strong>Data Collection:</strong> Monitoring and data collection for testing purposes</li>
                        <li><strong>Risk Awareness:</strong> Gambling involves risk of financial loss</li>
                        <li><strong>Legal Compliance:</strong> Users must comply with local gambling laws</li>
                        <li><strong>NFT Ownership:</strong> Beta NFTs are non-transferable and tied to Discord verification</li>
                    </ol>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button onclick="proceedToBeta()">✅ Accept & Access Beta Dashboard</button>
                    ${nftInfo.hasValidNFT ? `<button onclick="window.location.href='/my-nfts?discord_id=${encodeURIComponent(discordId)}'" style="background: #ff6b00;">View My NFTs</button>` : ''}
                    <button onclick="window.location.href='/portfolio'" style="background: #666;">View Portfolio Instead</button>
                </div>
            </div>
            
            <script>
                function proceedToBeta() {
                    // Store acceptance and redirect to beta dashboard
                    localStorage.setItem('tos_accepted', 'true');
                    localStorage.setItem('discord_id', '${discordId || ''}');
                    localStorage.setItem('contract_verified', 'true');
                    localStorage.setItem('nft_verified', '${nftInfo.hasValidNFT}');
                    
                    // Redirect to beta access with dashboard overlay
                    window.location.href = '/dashboard';
                }
            </script>
        </body>
        </html>
    `);
});

// Dashboard with iframe overlay
app.get('/dashboard', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>TiltCheck Beta Dashboard</title>
            <style>
                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; }
                .dashboard-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 50px;
                    background: linear-gradient(45deg, #00ff00, #0080ff);
                    color: #000;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    font-weight: bold;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,255,0,0.3);
                }
                .dashboard-info { display: flex; gap: 20px; align-items: center; }
                .dashboard-controls { display: flex; gap: 10px; }
                .control-btn {
                    background: rgba(0,0,0,0.2);
                    border: 1px solid #000;
                    color: #000;
                    padding: 5px 15px;
                    border-radius: 15px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: bold;
                }
                .control-btn:hover { background: rgba(0,0,0,0.4); }
                .beta-frame {
                    position: fixed;
                    top: 50px;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    border: none;
                    background: #000;
                }
                .status-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #00ff00;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        </head>
        <body>
            <div class="dashboard-overlay">
                <div class="dashboard-info">
                    <div class="status-indicator"></div>
                    <span>TiltCheck Beta Dashboard - Contract Verified</span>
                    <span id="sessionTime">Session: 0:00</span>
                </div>
                <div class="dashboard-controls">
                    <button class="control-btn" onclick="window.location.href='/portfolio'">Portfolio</button>
                    <button class="control-btn" onclick="window.location.href='/justthetip'">JustTheTip</button>
                    <button class="control-btn" onclick="toggleAnalytics()">Analytics</button>
                    <button class="control-btn" onclick="endSession()">End Session</button>
                </div>
            </div>
            
            <iframe id="betaFrame" class="beta-frame" src="http://localhost:${PORTS.BETA}" onload="frameLoaded()"></iframe>
            
            <script>
                let sessionStartTime = Date.now();
                let analyticsOpen = false;
                
                // Update session timer
                setInterval(() => {
                    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
                    const minutes = Math.floor(elapsed / 60);
                    const seconds = elapsed % 60;
                    document.getElementById('sessionTime').textContent = 
                        'Session: ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
                }, 1000);
                
                function frameLoaded() {
                    console.log('Beta application loaded successfully');
                }
                
                function toggleAnalytics() {
                    if (!analyticsOpen) {
                        window.open('http://localhost:${PORTS.ANALYTICS}', 'analytics', 'width=1200,height=800');
                        analyticsOpen = true;
                    }
                }
                
                function endSession() {
                    if (confirm('Are you sure you want to end your beta session?')) {
                        localStorage.removeItem('tos_accepted');
                        localStorage.removeItem('contract_verified');
                        window.location.href = '/portfolio';
                    }
                }
                
                // Handle frame errors
                document.getElementById('betaFrame').onerror = function() {
                    this.src = 'data:text/html,<html><body style="background:#000;color:#fff;text-align:center;padding:50px;font-family:Arial;"><h1>🔧 Beta Application Loading...</h1><p>The TiltCheck beta application is starting up.</p><p>If this persists, the beta server may need to be started.</p><p><a href="/portfolio" style="color:#00ff00;">Return to Portfolio</a></p></body></html>';
                };
            </script>
        </body>
        </html>
    `);
});

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            installer: 'running',
            beta: `proxy to :${PORTS.BETA}`,
            analytics: `proxy to :${PORTS.ANALYTICS}`
        }
    });
});

app.get('/health/detailed', (req, res) => {
    res.json({
        status: 'healthy',
        version: '2.1.0',
        domain: DOMAIN,
        ports: PORTS,
        features: [
            'Portfolio integration',
            'Contract-based beta verification',
            'Crypto signature verification',
            'Device fingerprinting',
            'Waitlist system',
            'Social media integration',
            'NFT contract signatures',
            'Discord ID ownership verification',
            'Non-transferable beta access NFTs',
            'OpenSea-compatible metadata'
        ],
        nftContract: {
            name: 'TiltCheck Beta Access NFT',
            symbol: 'TCBETA',
            maxSupply: 1000,
            transferable: false,
            verificationRequired: true
        },
        timestamp: new Date().toISOString(),
        environment: IS_DEVELOPMENT ? 'development' : 'production'
    });
});

// Proxy beta application requests
app.use('/beta-app', (req, res) => {
    proxy.web(req, res, {
        target: `http://localhost:${PORTS.BETA}`,
        changeOrigin: true
    }, (err) => {
        console.error('Beta proxy error:', err);
        res.status(503).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Beta Unavailable</title></head>
            <body style="background:#000;color:#fff;text-align:center;padding:50px;font-family:Arial;">
                <h1>🔧 Beta Application Unavailable</h1>
                <p>The TiltCheck beta application is currently unavailable.</p>
                <p>Please try again later or contact support.</p>
                <a href="/portfolio" style="color:#00ff00;">Return to Portfolio</a>
            </body>
            </html>
        `);
    });
});

// Proxy analytics requests
app.use('/analytics', (req, res) => {
    proxy.web(req, res, {
        target: `http://localhost:${PORTS.ANALYTICS}`,
        changeOrigin: true
    }, (err) => {
        console.error('Analytics proxy error:', err);
        res.status(503).send('Analytics service unavailable');
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Server Error</title></head>
        <body style="background:#000;color:#fff;text-align:center;padding:50px;font-family:Arial;">
            <h1>⚠️ Server Error</h1>
            <p>An unexpected error occurred.</p>
            <a href="/portfolio" style="color:#00ff00;">Return to Portfolio</a>
        </body>
        </html>
    `);
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Page Not Found</title></head>
        <body style="background:#000;color:#fff;text-align:center;padding:50px;font-family:Arial;">
            <h1>🔍 Page Not Found</h1>
            <p>The requested page could not be found.</p>
            <div style="margin: 30px 0;">
                <a href="/" style="color:#00ff00;margin:0 15px;">Home</a>
                <a href="/portfolio" style="color:#00ff00;margin:0 15px;">Portfolio</a>
                <a href="/beta" style="color:#00ff00;margin:0 15px;">Beta Access</a>
            </div>
        </body>
        </html>
    `);
});

// Start server
const PORT = PORTS.INSTALLER;
app.listen(PORT, () => {
    console.log(`
🚀 TiltCheck Desktop Installer Server Started
📍 Server: http://localhost:${PORT}
🌐 Domain: ${DOMAIN}
📱 Mobile Access: Blocked (desktop-only)
🧪 Beta Access: Contract-verified users only
📊 Analytics: Port ${PORTS.ANALYTICS}
🎯 Beta App: Port ${PORTS.BETA}

✅ Features Active:
  - Portfolio integration with social links
  - Crypto signature contract verification
  - Device fingerprinting for legal protection
  - Approved Discord ID system
  - Waitlist integration for non-approved users
  - Landing pages ecosystem (TiltCheck, JustTheTip, Portfolio)
    `);
});

module.exports = app;
