// TiltCheck NFT Minting System for Legal Agreement Verification
// Integrates with existing beta-nft-contract.js and beta-verification-contract.js

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');

class TiltCheckNFTMinter {
    constructor() {
        this.app = express();
        this.port = 4002;
        this.setupMiddleware();
        this.setupRoutes();
        
        // Import existing NFT contracts
        this.BetaNFTContract = require('./beta-nft-contract');
        this.BetaVerificationContract = require('./beta-verification-contract');
        
        this.nftContract = new this.BetaNFTContract();
        this.verificationContract = new this.BetaVerificationContract();
        
        this.init();
    }

    async init() {
        await this.nftContract.init();
        await this.verificationContract.init();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    getFooter() {
        return {
            madeBy: "Made 4 Degens by Degens ❤️",
            organization: "Mischief Manager: @jmenichole",
            github: "https://github.com/jmenichole",
            kofi: "https://ko-fi.com/traphouse",
            sponsor: "Powered by GoMining",
            ecosystem: "https://tiltcheckecosystem.created.app"
        };
    }

    setupRoutes() {
        // Main NFT Mint Landing Page
        this.app.get('/nftmint', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>TiltCheck NFT Mint - Legal Agreement Verification</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
                            color: #ffffff;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                        }
                        
                        .container {
                            max-width: 1200px;
                            margin: 0 auto;
                            padding: 20px;
                            flex: 1;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 50px;
                            padding: 40px 0;
                        }
                        
                        .logo {
                            font-size: 3rem;
                            font-weight: bold;
                            background: linear-gradient(45deg, #00ff00, #ffff00, #ff00ff);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            margin-bottom: 10px;
                        }
                        
                        .subtitle {
                            font-size: 1.5rem;
                            color: #888;
                            margin-bottom: 30px;
                        }
                        
                        .mint-card {
                            background: rgba(0, 0, 0, 0.8);
                            border-radius: 20px;
                            padding: 40px;
                            border: 2px solid #00ff00;
                            box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
                            margin-bottom: 30px;
                        }
                        
                        .nft-preview {
                            width: 300px;
                            height: 300px;
                            background: linear-gradient(45deg, #1a1a2e, #16213e);
                            border-radius: 15px;
                            margin: 0 auto 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 2px solid #00ff00;
                        }
                        
                        .nft-text {
                            text-align: center;
                            color: #00ff00;
                            font-weight: bold;
                        }
                        
                        .agreement-section {
                            background: rgba(255, 255, 0, 0.1);
                            border: 2px solid #ffff00;
                            border-radius: 15px;
                            padding: 30px;
                            margin: 30px 0;
                        }
                        
                        .agreement-title {
                            color: #ffff00;
                            font-size: 1.5rem;
                            margin-bottom: 20px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        
                        .terms-list {
                            list-style: none;
                            margin: 20px 0;
                        }
                        
                        .terms-list li {
                            margin: 10px 0;
                            padding: 10px;
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 8px;
                            border-left: 4px solid #00ff00;
                        }
                        
                        .discord-auth {
                            background: #5865f2;
                            color: white;
                            padding: 15px 30px;
                            border: none;
                            border-radius: 10px;
                            font-size: 1.2rem;
                            cursor: pointer;
                            width: 100%;
                            margin: 20px 0;
                            transition: all 0.3s ease;
                        }
                        
                        .discord-auth:hover {
                            background: #4752c4;
                            transform: translateY(-2px);
                        }
                        
                        .mint-button {
                            background: linear-gradient(45deg, #00ff00, #ffff00);
                            color: #000;
                            padding: 20px 40px;
                            border: none;
                            border-radius: 15px;
                            font-size: 1.3rem;
                            font-weight: bold;
                            cursor: pointer;
                            width: 100%;
                            margin: 20px 0;
                            transition: all 0.3s ease;
                            text-transform: uppercase;
                        }
                        
                        .mint-button:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 10px 30px rgba(0, 255, 0, 0.5);
                        }
                        
                        .mint-button:disabled {
                            background: #666;
                            cursor: not-allowed;
                            transform: none;
                        }
                        
                        .footer {
                            text-align: center;
                            padding: 40px 0;
                            border-top: 1px solid #333;
                            margin-top: 50px;
                        }
                        
                        .ecosystem-links {
                            display: flex;
                            justify-content: center;
                            gap: 30px;
                            margin: 20px 0;
                            flex-wrap: wrap;
                        }
                        
                        .ecosystem-link {
                            color: #00ff00;
                            text-decoration: none;
                            padding: 10px 20px;
                            border: 1px solid #00ff00;
                            border-radius: 8px;
                            transition: all 0.3s ease;
                        }
                        
                        .ecosystem-link:hover {
                            background: #00ff00;
                            color: #000;
                        }
                        
                        .warning-box {
                            background: rgba(255, 0, 0, 0.1);
                            border: 2px solid #ff0000;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 20px 0;
                            color: #ff6666;
                        }
                        
                        .checkbox-container {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            margin: 15px 0;
                            padding: 15px;
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 8px;
                        }
                        
                        .checkbox {
                            width: 20px;
                            height: 20px;
                            accent-color: #00ff00;
                        }
                        
                        @media (max-width: 768px) {
                            .container {
                                padding: 10px;
                            }
                            
                            .logo {
                                font-size: 2rem;
                            }
                            
                            .mint-card {
                                padding: 20px;
                            }
                            
                            .nft-preview {
                                width: 250px;
                                height: 250px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">TiltCheck NFT Mint</div>
                            <div class="subtitle">Legal Agreement Verification System</div>
                            <p>Mint a verifiable NFT node when you agree to our terms via Discord linking</p>
                        </div>
                        
                        <div class="mint-card">
                            <div class="nft-preview">
                                <div class="nft-text">
                                    <div style="font-size: 2rem;">🎯</div>
                                    <div>TiltCheck</div>
                                    <div>Verification NFT</div>
                                </div>
                            </div>
                            
                            <div class="agreement-section">
                                <div class="agreement-title">
                                    📋 Legal Agreement Terms
                                </div>
                                <ul class="terms-list">
                                    <li><strong>✅ Discord Account Verification:</strong> Link your Discord account for identity verification</li>
                                    <li><strong>🔐 Legal Protection:</strong> NFT serves as cryptographic proof of agreement</li>
                                    <li><strong>🎮 Ecosystem Access:</strong> Verified access to TiltCheck ecosystem applications</li>
                                    <li><strong>💎 Non-Transferable:</strong> NFT is bound to your Discord ID for security</li>
                                    <li><strong>📊 Data Collection:</strong> Usage analytics for platform improvement</li>
                                    <li><strong>🚫 No Guarantees:</strong> Platform provided as-is, use at your own risk</li>
                                    <li><strong>🔄 Terms Updates:</strong> Agreement may be updated with notice</li>
                                </ul>
                            </div>
                            
                            <div class="warning-box">
                                <strong>⚠️ Important:</strong> By minting this NFT, you create a legally binding agreement. The NFT contains cryptographic proof of your consent and is permanently linked to your Discord account. This cannot be undone.
                            </div>
                            
                            <div class="checkbox-container">
                                <input type="checkbox" id="terms-agree" class="checkbox">
                                <label for="terms-agree">I have read and agree to the legal terms above</label>
                            </div>
                            
                            <div class="checkbox-container">
                                <input type="checkbox" id="data-consent" class="checkbox">
                                <label for="data-consent">I consent to data collection and Discord account linking</label>
                            </div>
                            
                            <div class="checkbox-container">
                                <input type="checkbox" id="legal-binding" class="checkbox">
                                <label for="legal-binding">I understand this creates a legally binding agreement</label>
                            </div>
                            
                            <button class="discord-auth" onclick="initiateDiscordAuth()">
                                🔗 Verify with Discord OAuth
                            </button>
                            
                            <button class="mint-button" id="mint-btn" disabled onclick="mintNFT()">
                                🎨 Mint Legal Verification NFT
                            </button>
                        </div>
                        
                        <div class="footer">
                            <div class="ecosystem-links">
                                <a href="https://tiltcheckecosystem.created.app" class="ecosystem-link">🌐 Main Ecosystem</a>
                                <a href="https://tiltcheckecosystem.created.app/degens-bot" class="ecosystem-link">🎮 Degens Bot</a>
                                <a href="https://tiltcheckecosystem.created.app/justthetip" class="ecosystem-link">💰 JustTheTip</a>
                                <a href="https://discord.gg/K3Md6aZx" class="ecosystem-link">💬 Discord</a>
                            </div>
                            <p style="margin-top: 20px;">Made 4 Degens by Degens ❤️</p>
                            <p>Mischief Manager: @jmenichole</p>
                        </div>
                    </div>
                    
                    <script>
                        let discordVerified = false;
                        let userDiscordId = null;
                        
                        // Check agreement checkboxes
                        const checkboxes = document.querySelectorAll('.checkbox');
                        const mintBtn = document.getElementById('mint-btn');
                        
                        checkboxes.forEach(checkbox => {
                            checkbox.addEventListener('change', updateMintButton);
                        });
                        
                        function updateMintButton() {
                            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                            mintBtn.disabled = !(allChecked && discordVerified);
                        }
                        
                        function initiateDiscordAuth() {
                            // Generate verification challenge
                            const challenge = Math.random().toString(36).substring(2, 15);
                            const authUrl = \`/discord-auth?challenge=\${challenge}\`;
                            
                            // Open Discord OAuth in popup
                            const popup = window.open(authUrl, 'discord-auth', 'width=500,height=600');
                            
                            // Listen for auth completion
                            const checkClosed = setInterval(() => {
                                if (popup.closed) {
                                    clearInterval(checkClosed);
                                    checkDiscordAuth(challenge);
                                }
                            }, 1000);
                        }
                        
                        async function checkDiscordAuth(challenge) {
                            try {
                                const response = await fetch(\`/verify-discord-auth?challenge=\${challenge}\`);
                                const result = await response.json();
                                
                                if (result.success) {
                                    discordVerified = true;
                                    userDiscordId = result.discordId;
                                    
                                    const authBtn = document.querySelector('.discord-auth');
                                    authBtn.innerHTML = '✅ Discord Verified: ' + result.username;
                                    authBtn.style.background = '#00ff00';
                                    authBtn.style.color = '#000';
                                    authBtn.disabled = true;
                                    
                                    updateMintButton();
                                    
                                    alert('Discord verification successful! You can now mint your NFT.');
                                } else {
                                    alert('Discord verification failed. Please try again.');
                                }
                            } catch (error) {
                                console.error('Auth check failed:', error);
                                alert('Verification check failed. Please try again.');
                            }
                        }
                        
                        async function mintNFT() {
                            if (!discordVerified || !userDiscordId) {
                                alert('Please complete Discord verification first.');
                                return;
                            }
                            
                            const mintBtn = document.getElementById('mint-btn');
                            mintBtn.disabled = true;
                            mintBtn.innerHTML = '🔄 Minting NFT...';
                            
                            try {
                                const response = await fetch('/mint-legal-nft', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        discordId: userDiscordId,
                                        agreementType: 'legal-terms',
                                        termsAccepted: true,
                                        dataConsent: true,
                                        legalBinding: true,
                                        timestamp: Date.now()
                                    })
                                });
                                
                                const result = await response.json();
                                
                                if (result.success) {
                                    mintBtn.innerHTML = '✅ NFT Minted Successfully!';
                                    mintBtn.style.background = '#00ff00';
                                    
                                    // Show success modal with NFT details
                                    showSuccessModal(result.nft);
                                } else {
                                    throw new Error(result.message || 'Minting failed');
                                }
                            } catch (error) {
                                console.error('Minting failed:', error);
                                mintBtn.innerHTML = '❌ Minting Failed';
                                mintBtn.style.background = '#ff0000';
                                alert('NFT minting failed: ' + error.message);
                            }
                        }
                        
                        function showSuccessModal(nft) {
                            const modal = document.createElement('div');
                            modal.style.cssText = \`
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: rgba(0,0,0,0.9);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                z-index: 1000;
                            \`;
                            
                            modal.innerHTML = \`
                                <div style="background: #1a1a2e; padding: 40px; border-radius: 20px; border: 2px solid #00ff00; text-align: center; max-width: 500px;">
                                    <h2 style="color: #00ff00; margin-bottom: 20px;">🎉 NFT Minted Successfully!</h2>
                                    <p style="margin-bottom: 20px;">Your legal verification NFT has been created and linked to your Discord account.</p>
                                    <div style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 10px; margin: 20px 0;">
                                        <strong>Token ID:</strong> \${nft.tokenId}<br>
                                        <strong>Discord ID:</strong> \${userDiscordId}<br>
                                        <strong>Verification URL:</strong> <a href="\${nft.verificationUrl}" style="color: #00ff00;">\${nft.verificationUrl}</a>
                                    </div>
                                    <button onclick="this.parentElement.parentElement.remove()" style="background: #00ff00; color: #000; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
                                </div>
                            \`;
                            
                            document.body.appendChild(modal);
                        }
                    </script>
                </body>
                </html>
            `);
        });

        // Discord OAuth Authentication
        this.app.get('/discord-auth', (req, res) => {
            const { challenge } = req.query;
            const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
                `client_id=${process.env.DISCORD_CLIENT_ID || 'your_discord_client_id'}&` +
                `redirect_uri=${encodeURIComponent(process.env.BASE_URL || 'http://localhost:4002')}/discord-callback&` +
                `response_type=code&` +
                `scope=identify&` +
                `state=${challenge}`;
            
            res.redirect(discordAuthUrl);
        });

        // Discord OAuth Callback
        this.app.get('/discord-callback', async (req, res) => {
            const { code, state } = req.query;
            
            try {
                // Exchange code for access token
                const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: process.env.DISCORD_CLIENT_ID || 'your_discord_client_id',
                        client_secret: process.env.DISCORD_CLIENT_SECRET || 'your_discord_client_secret',
                        grant_type: 'authorization_code',
                        code: code,
                        redirect_uri: `${process.env.BASE_URL || 'http://localhost:4002'}/discord-callback`
                    })
                });
                
                const tokenData = await tokenResponse.json();
                
                // Get user info
                const userResponse = await fetch('https://discord.com/api/users/@me', {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`
                    }
                });
                
                const userData = await userResponse.json();
                
                // Store verification temporarily (in production, use Redis or database)
                if (!global.discordVerifications) global.discordVerifications = new Map();
                global.discordVerifications.set(state, {
                    discordId: userData.id,
                    username: userData.username,
                    verified: true,
                    timestamp: Date.now()
                });
                
                res.send(`
                    <html>
                        <body style="font-family: Arial; background: #0a0a0a; color: #fff; text-align: center; padding: 50px;">
                            <h2 style="color: #00ff00;">✅ Discord Verification Successful!</h2>
                            <p>Welcome, ${userData.username}!</p>
                            <p>You can now close this window and return to the minting page.</p>
                            <script>window.close();</script>
                        </body>
                    </html>
                `);
            } catch (error) {
                console.error('Discord auth error:', error);
                res.send(`
                    <html>
                        <body style="font-family: Arial; background: #0a0a0a; color: #fff; text-align: center; padding: 50px;">
                            <h2 style="color: #ff0000;">❌ Discord Verification Failed</h2>
                            <p>Please try again.</p>
                            <script>window.close();</script>
                        </body>
                    </html>
                `);
            }
        });

        // Verify Discord Authentication
        this.app.get('/verify-discord-auth', (req, res) => {
            const { challenge } = req.query;
            
            if (!global.discordVerifications) {
                return res.json({ success: false, message: 'No verifications found' });
            }
            
            const verification = global.discordVerifications.get(challenge);
            
            if (verification && verification.verified) {
                res.json({
                    success: true,
                    discordId: verification.discordId,
                    username: verification.username
                });
                
                // Clean up verification after use
                global.discordVerifications.delete(challenge);
            } else {
                res.json({ success: false, message: 'Verification not found or incomplete' });
            }
        });

        // Mint Legal NFT
        this.app.post('/mint-legal-nft', async (req, res) => {
            try {
                const { discordId, agreementType, termsAccepted, dataConsent, legalBinding, timestamp } = req.body;
                
                if (!discordId || !termsAccepted || !dataConsent || !legalBinding) {
                    return res.json({ 
                        success: false, 
                        message: 'Missing required agreement fields' 
                    });
                }
                
                // Generate device fingerprint (simplified for web)
                const deviceFingerprint = {
                    fingerprint: crypto.createHash('sha256')
                        .update(`${discordId}${timestamp}${req.ip}${req.get('User-Agent')}`)
                        .digest('hex'),
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    timestamp: timestamp
                };
                
                // Create legal agreement contract
                const contract = this.verificationContract.generateBetaContract(discordId, deviceFingerprint);
                
                // Add legal agreement specifics
                contract.agreementType = 'tiltcheck-legal-terms';
                contract.terms.legalAgreement = {
                    termsAccepted,
                    dataConsent,
                    legalBinding,
                    agreementType,
                    mintingRequested: true,
                    nftVerification: true
                };
                
                // Save contract
                await this.verificationContract.saveContract(contract);
                
                // Create user signature for contract
                const userSignature = crypto.createHash('sha256')
                    .update(`${discordId}${timestamp}${agreementType}`)
                    .digest('hex');
                
                // Sign contract and mint NFT
                const result = await this.verificationContract.signContract(contract.contractId, userSignature);
                
                if (result.success) {
                    res.json({
                        success: true,
                        message: 'Legal verification NFT minted successfully',
                        nft: {
                            tokenId: result.nft.tokenId,
                            contractId: contract.contractId,
                            verificationUrl: result.nft.verificationUrl,
                            discordId: discordId,
                            agreementType: agreementType,
                            mintedAt: timestamp
                        },
                        contract: {
                            contractId: contract.contractId,
                            status: 'signed',
                            signedAt: new Date().toISOString()
                        }
                    });
                } else {
                    throw new Error(result.error || 'Contract signing failed');
                }
            } catch (error) {
                console.error('NFT minting error:', error);
                res.json({ 
                    success: false, 
                    message: 'NFT minting failed: ' + error.message 
                });
            }
        });

        // NFT Verification Endpoint
        this.app.get('/verify-nft/:tokenId', async (req, res) => {
            try {
                const { tokenId } = req.params;
                const nftDetails = await this.verificationContract.getNFTDetails(tokenId);
                
                if (!nftDetails.isValid) {
                    return res.send(`
                        <html>
                            <body style="font-family: Arial; background: #0a0a0a; color: #fff; text-align: center; padding: 50px;">
                                <h2 style="color: #ff0000;">❌ Invalid NFT</h2>
                                <p>NFT verification failed or token does not exist.</p>
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
                    <html>
                        <head>
                            <title>TiltCheck Legal Verification NFT</title>
                            <style>
                                body { 
                                    font-family: Arial; 
                                    background: linear-gradient(135deg, #0a0a0a, #1a1a2e); 
                                    color: #fff; 
                                    margin: 0; 
                                    padding: 20px; 
                                }
                                .container { 
                                    max-width: 800px; 
                                    margin: 0 auto; 
                                    background: rgba(0,0,0,0.8); 
                                    padding: 40px; 
                                    border-radius: 20px; 
                                    border: 2px solid #00ff00; 
                                }
                                .nft-image { 
                                    width: 300px; 
                                    height: 300px; 
                                    margin: 20px auto; 
                                    display: block; 
                                    border: 2px solid #00ff00; 
                                    border-radius: 15px; 
                                }
                                .verified { color: #00ff00; }
                                .details { 
                                    background: rgba(0,0,0,0.5); 
                                    padding: 20px; 
                                    border-radius: 10px; 
                                    margin: 20px 0; 
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1 style="text-align: center; color: #00ff00;">✅ TiltCheck Legal Verification NFT</h1>
                                
                                <img src="data:image/svg+xml;base64,${Buffer.from(metadata.image).toString('base64')}" 
                                     alt="TiltCheck NFT" class="nft-image">
                                
                                <div class="details">
                                    <h3>NFT Details</h3>
                                    <p><strong>Token ID:</strong> ${tokenId}</p>
                                    <p><strong>Name:</strong> ${metadata.name}</p>
                                    <p><strong>Description:</strong> ${metadata.description}</p>
                                </div>
                                
                                <div class="details">
                                    <h3>Legal Verification</h3>
                                    <p><strong>Discord ID:</strong> ${discordId}</p>
                                    <p><strong>Contract ID:</strong> ${contractId}</p>
                                    <p><strong>Mint Date:</strong> ${mintDate}</p>
                                    <p><strong>Status:</strong> <span class="verified">✅ Legally Verified</span></p>
                                </div>
                                
                                <div class="details">
                                    <h3>Agreement Verification</h3>
                                    <p>✅ Legal terms accepted via Discord authentication</p>
                                    <p>✅ Data collection consent provided</p>
                                    <p>✅ Legally binding agreement established</p>
                                    <p>✅ NFT serves as cryptographic proof</p>
                                </div>
                                
                                <div style="text-align: center; margin-top: 30px;">
                                    <p>Made 4 Degens by Degens ❤️</p>
                                    <p>Mischief Manager: @jmenichole</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `);
            } catch (error) {
                console.error('NFT verification error:', error);
                res.status(500).send('Verification failed');
            }
        });

        // API endpoint for ecosystem integration
        this.app.get('/api/nft-status/:discordId', async (req, res) => {
            try {
                const { discordId } = req.params;
                const hasContract = await this.verificationContract.hasValidContract(discordId);
                const nftInfo = await this.verificationContract.verifyNFTOwnership(discordId);
                
                res.json({
                    discordId,
                    hasValidContract: !!hasContract,
                    hasValidNFT: nftInfo.hasValidNFT,
                    totalNFTs: nftInfo.totalNFTs,
                    status: hasContract && nftInfo.hasValidNFT ? 'verified' : 'unverified',
                    footer: this.getFooter()
                });
            } catch (error) {
                res.json({
                    discordId: req.params.discordId,
                    hasValidContract: false,
                    hasValidNFT: false,
                    status: 'error',
                    error: error.message
                });
            }
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🎨 TiltCheck NFT Minting Server running on port ${this.port}`);
            console.log(`📡 Access: http://localhost:${this.port}/nftmint`);
            console.log(`🔗 Ecosystem: https://tiltcheckecosystem.created.app`);
            console.log(`💎 Made 4 Degens by Degens ❤️`);
        });
    }
}

// Initialize and start server
const nftMinter = new TiltCheckNFTMinter();
nftMinter.start();

module.exports = TiltCheckNFTMinter;
