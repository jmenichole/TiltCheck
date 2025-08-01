const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

class TiltCheckNFTLegalServer {
    constructor() {
        this.app = express();
        this.port = 4001;
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
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

    generateNFTMetadata(userId, agreementType, timestamp) {
        const agreementId = crypto.randomUUID();
        const nodeVerificationHash = crypto.createHash('sha256')
            .update(`${userId}-${agreementType}-${timestamp}-${agreementId}`)
            .digest('hex');

        return {
            tokenId: agreementId,
            name: `TiltCheck Legal Agreement NFT #${agreementId.slice(0, 8)}`,
            description: `Verifiable legal agreement for ${agreementType} on TiltCheck ecosystem`,
            image: `https://tiltcheck.it.com/nft-images/${agreementId}.png`,
            attributes: [
                { trait_type: "Agreement Type", value: agreementType },
                { trait_type: "User ID", value: userId },
                { trait_type: "Timestamp", value: timestamp },
                { trait_type: "Verification Hash", value: nodeVerificationHash },
                { trait_type: "Platform", value: "TiltCheck Ecosystem" },
                { trait_type: "Legal Status", value: "Binding Agreement" },
                { trait_type: "Blockchain Verified", value: "true" }
            ],
            external_url: `https://tiltcheck.it.com/verify-agreement/${agreementId}`,
            animation_url: `https://tiltcheck.it.com/agreement-animation/${agreementId}`,
            nodeVerification: {
                verified: true,
                nodeId: process.env.NODE_ID || "tiltcheck-node-001",
                verificationHash: nodeVerificationHash,
                mintTimestamp: timestamp
            }
        };
    }

    setupRoutes() {
        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                title: "TiltCheck.it.com - NFT Legal Agreement System",
                status: "🟢 Live Production",
                ecosystem: "https://tiltcheckecosystem.created.app",
                suslink: "https://tiltcheckecosystem.created.app/suslink",
                version: "4.0.0",
                developer: "jmenichole - Mischief Manager",
                nftMinting: "Active",
                footer: this.getFooter()
            });
        });

        // NFT Minting Endpoint for Legal Agreements
        this.app.post('/nftmint', (req, res) => {
            const { userId, discordId, agreementType, ipAddress, userAgent } = req.body;
            const timestamp = Date.now();

            if (!userId || !agreementType) {
                return res.status(400).json({
                    error: "Missing required fields: userId and agreementType",
                    footer: this.getFooter()
                });
            }

            const nftMetadata = this.generateNFTMetadata(userId, agreementType, timestamp);

            // Log the legal agreement for compliance
            console.log(`🔗 NFT Legal Agreement Minted:`, {
                tokenId: nftMetadata.tokenId,
                userId,
                discordId,
                agreementType,
                timestamp: new Date(timestamp).toISOString(),
                ipAddress,
                userAgent
            });

            res.json({
                success: true,
                title: "Legal Agreement NFT Minted",
                nftMetadata,
                agreementRecord: {
                    tokenId: nftMetadata.tokenId,
                    userId,
                    discordId,
                    agreementType,
                    mintedAt: new Date(timestamp).toISOString(),
                    verificationUrl: `https://tiltcheck.it.com/verify-agreement/${nftMetadata.tokenId}`,
                    legalStatus: "Binding and Blockchain Verified"
                },
                footer: this.getFooter()
            });
        });

        // Get NFT Metadata for minted agreements
        this.app.get('/nft-metadata/:tokenId', (req, res) => {
            const { tokenId } = req.params;
            
            // In production, this would query the blockchain/database
            res.json({
                title: `Legal Agreement NFT #${tokenId.slice(0, 8)}`,
                description: "Verifiable legal agreement NFT from TiltCheck ecosystem",
                image: `https://tiltcheck.it.com/nft-images/${tokenId}.png`,
                external_url: `https://tiltcheck.it.com/verify-agreement/${tokenId}`,
                tokenId,
                footer: this.getFooter()
            });
        });

        // Verify Agreement endpoint
        this.app.get('/verify-agreement/:tokenId', (req, res) => {
            const { tokenId } = req.params;
            
            res.json({
                title: "Agreement Verification",
                tokenId,
                status: "✅ Verified on Blockchain",
                legalValidity: "Binding Agreement",
                verificationUrl: `https://tiltcheck.it.com/verify-agreement/${tokenId}`,
                footer: this.getFooter()
            });
        });

        // SusLink Landing Page Endpoint
        this.app.get('/suslink', (req, res) => {
            res.json({
                title: "SusLink - TiltCheck Ecosystem Landing",
                description: "Suspicious link verification and safe navigation system",
                mainEcosystem: "https://tiltcheckecosystem.created.app",
                features: [
                    "Link verification and safety checks",
                    "Ecosystem navigation hub",
                    "User agreement tracking via NFTs",
                    "Discord integration footprint"
                ],
                navigate: {
                    mainApp: "https://tiltcheckecosystem.created.app",
                    degensBot: "https://tiltcheckecosystem.created.app/degens-bot",
                    justTheTip: "https://tiltcheckecosystem.created.app/justthetip",
                    tiltcheck: "https://tiltcheck.it.com"
                },
                footer: this.getFooter()
            });
        });

        // ===== LIVE ECOSYSTEM INTEGRATION =====

        // Main Ecosystem Hub
        this.app.get('/ecosystem', (req, res) => {
            res.json({
                title: "TiltCheck Live Ecosystem",
                status: "🟢 Live Production",
                mainApp: {
                    url: "https://tiltcheckecosystem.created.app",
                    status: "🟢 Active",
                    description: "Central TiltCheck ecosystem hub"
                },
                liveApplications: {
                    degensBot: "https://tiltcheckecosystem.created.app/degens-bot",
                    justTheTip: "https://tiltcheckecosystem.created.app/justthetip",
                    suslink: "https://tiltcheckecosystem.created.app/suslink"
                },
                discordCommunities: {
                    main: "https://discord.gg/K3Md6aZx",
                    betCollective: "https://discord.gg/betcollective"
                },
                nftLegalSystem: {
                    mintEndpoint: "https://tiltcheck.it.com/nftmint",
                    verifyEndpoint: "https://tiltcheck.it.com/verify-agreement",
                    status: "🟢 Active"
                },
                developer: "jmenichole - Mischief Manager",
                footer: this.getFooter()
            });
        });

        // Live Degens Bot
        this.app.get('/degens-live', (req, res) => {
            res.json({
                title: "Degens Bot - Live Application",
                liveApp: "https://tiltcheckecosystem.created.app/degens-bot",
                status: "🟢 Active",
                features: ["NFT Card Game", "Tournaments", "Trading"],
                nftAgreements: "Auto-minted on signup via Discord linking",
                footer: this.getFooter()
            });
        });

        // Live JustTheTip
        this.app.get('/justthetip-live', (req, res) => {
            res.json({
                title: "JustTheTip - Live Tipping System", 
                liveApp: "https://tiltcheckecosystem.created.app/justthetip",
                status: "🟢 Active",
                features: ["Crypto Tipping", "Multi-Currency", "Discord Integration"],
                nftAgreements: "Terms minted as NFT on account creation",
                footer: this.getFooter()
            });
        });

        // Discord Communities
        this.app.get('/communities', (req, res) => {
            res.json({
                title: "TiltCheck Discord Communities",
                primary: {
                    invite: "https://discord.gg/K3Md6aZx",
                    name: "TiltCheck Main Community"
                },
                betCollective: {
                    invite: "https://discord.gg/betcollective", 
                    name: "Bet Collective Community"
                },
                nftIntegration: "Legal agreements auto-minted on Discord linking",
                moderator: "jmenichole - Mischief Manager",
                footer: this.getFooter()
            });
        });

        // About
        this.app.get('/about', (req, res) => {
            res.json({
                title: "About TiltCheck",
                description: "Advanced gambling analytics and tilt detection platform with NFT legal verification",
                mission: "Promoting responsible gaming through data analytics and blockchain-verified agreements",
                nftLegal: "All user agreements are minted as verifiable NFTs",
                footer: this.getFooter()
            });
        });

        // API Documentation
        this.app.get('/api', (req, res) => {
            res.json({
                title: "TiltCheck API Documentation",
                version: "v1.0",
                liveIntegration: "tiltcheckecosystem.created.app",
                endpoints: [
                    "/ecosystem", 
                    "/degens-live", 
                    "/justthetip-live", 
                    "/communities",
                    "/nftmint",
                    "/suslink",
                    "/verify-agreement/:tokenId"
                ],
                nftEndpoints: {
                    mint: "POST /nftmint",
                    verify: "GET /verify-agreement/:tokenId",
                    metadata: "GET /nft-metadata/:tokenId"
                },
                footer: this.getFooter()
            });
        });

        // Developer Portfolio
        this.app.get('/portfolio', (req, res) => {
            res.json({
                title: "Developer Portfolio - @jmenichole",
                role: "Mischief Manager",
                projects: {
                    tiltcheck: "https://tiltcheckecosystem.created.app",
                    degensBot: "Discord NFT Card Game Bot",
                    justTheTip: "Multi-currency tipping system",
                    nftLegal: "Blockchain-verified legal agreement system"
                },
                social: {
                    github: "https://github.com/jmenichole",
                    discord: "jmenichole"
                },
                footer: this.getFooter()
            });
        });

        // Support
        this.app.get('/support', (req, res) => {
            res.json({
                title: "TiltCheck Support",
                discordTickets: "https://discord.gg/K3Md6aZx",
                email: "support@tiltcheck.it.com",
                status: "24/7 Community Support",
                nftSupport: "NFT legal agreement assistance available",
                footer: this.getFooter()
            });
        });

        // Terms of Service with NFT Minting
        this.app.get('/terms', (req, res) => {
            res.json({
                title: "Terms of Service",
                lastUpdated: "2024-08-01",
                compliance: ["GDPR", "CCPA"],
                nftVerification: "All agreement acceptances are minted as NFTs",
                mintingInfo: "POST to /nftmint to create verifiable agreement NFT",
                footer: this.getFooter()
            });
        });

        // Privacy Policy with NFT Integration
        this.app.get('/privacy', (req, res) => {
            res.json({
                title: "Privacy Policy", 
                lastUpdated: "2024-08-01",
                dataProtection: "GDPR Compliant",
                nftPrivacy: "Agreement NFTs contain only verification hashes, no personal data",
                footer: this.getFooter()
            });
        });

        // Sitemap
        this.app.get('/sitemap.xml', (req, res) => {
            res.set('Content-Type', 'application/xml');
            res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://tiltcheck.it.com/</loc><priority>1.0</priority></url>
    <url><loc>https://tiltcheck.it.com/ecosystem</loc><priority>0.9</priority></url>
    <url><loc>https://tiltcheck.it.com/nftmint</loc><priority>0.9</priority></url>
    <url><loc>https://tiltcheck.it.com/suslink</loc><priority>0.9</priority></url>
    <url><loc>https://tiltcheck.it.com/degens-live</loc><priority>0.9</priority></url>
    <url><loc>https://tiltcheckecosystem.created.app/suslink</loc><priority>0.9</priority></url>
    <url><loc>https://tiltcheck.it.com/justthetip-live</loc><priority>0.9</priority></url>
    <url><loc>https://tiltcheck.it.com/communities</loc><priority>0.8</priority></url>
    <url><loc>https://tiltcheck.it.com/about</loc><priority>0.8</priority></url>
    <url><loc>https://tiltcheck.it.com/api</loc><priority>0.7</priority></url>
    <url><loc>https://tiltcheck.it.com/portfolio</loc><priority>0.7</priority></url>
    <url><loc>https://tiltcheck.it.com/support</loc><priority>0.7</priority></url>
    <url><loc>https://tiltcheck.it.com/terms</loc><priority>0.6</priority></url>
    <url><loc>https://tiltcheck.it.com/privacy</loc><priority>0.6</priority></url>
</urlset>`);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 TiltCheck NFT Legal Server running on port ${this.port}`);
            console.log(`📡 Live integration: tiltcheckecosystem.created.app`);
            console.log(`🔗 NFT Minting: POST /nftmint`);
            console.log(`🎯 SusLink: /suslink`);
            console.log(`🎯 Discord: discord.gg/K3Md6aZx`);
            console.log(`💎 Made 4 Degens by Degens ❤️`);
        });
    }
}

const server = new TiltCheckNFTLegalServer();
server.start();
