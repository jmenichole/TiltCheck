const express = require('express');
const cors = require('cors');

class TiltCheckEcosystemServer {
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

    setupRoutes() {
        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                title: "TiltCheck.it.com - Complete Ecosystem",
                status: "🟢 Live Production",
                ecosystem: "https://tiltcheckecosystem.created.app",
                version: "4.0.0",
                developer: "jmenichole - Mischief Manager",
                endpoints: 12,
                newFeature: "🎨 NFT Minting for Legal Agreements at /nftmint",
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
                    susLink: "https://tiltcheckecosystem.created.app/suslink"
                },
                discordCommunities: {
                    main: "https://discord.gg/K3Md6aZx",
                    betCollective: "https://discord.gg/betcollective"
                },
                developer: "jmenichole - Mischief Manager",
                footer: this.getFooter()
            });
        });

        // NFT Minting for Legal Agreements
        this.app.get('/nftmint', (req, res) => {
            res.json({
                title: "TiltCheck NFT Mint - Legal Agreement Verification",
                description: "Mint verifiable node NFTs when signing up and agreeing to legal terms via Discord linking",
                process: {
                    step1: "Discord OAuth verification",
                    step2: "Legal terms agreement",
                    step3: "NFT minting with cryptographic proof",
                    step4: "Permanent Discord ID binding"
                },
                benefits: [
                    "Legal protection through blockchain verification",
                    "Cryptographic proof of agreement",
                    "Non-transferable security binding",
                    "Ecosystem access verification"
                ],
                integration: {
                    ecosystem: "https://tiltcheckecosystem.created.app",
                    suslink: "https://tiltcheckecosystem.created.app/suslink",
                    mintingInterface: "Live NFT minting available"
                },
                technicalDetails: {
                    nftStandard: "TiltCheck Verification NFT",
                    binding: "Discord ID permanent linking",
                    transferability: "Non-transferable for security",
                    legalValue: "Cryptographic proof of agreement"
                },
                status: "🟢 Live NFT Minting Available",
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
                moderator: "jmenichole - Mischief Manager",
                footer: this.getFooter()
            });
        });

        // About
        this.app.get('/about', (req, res) => {
            res.json({
                title: "About TiltCheck",
                description: "Advanced gambling analytics and tilt detection platform",
                mission: "Promoting responsible gaming through data analytics",
                nftIntegration: "Legal verification through blockchain technology",
                footer: this.getFooter()
            });
        });

        // API Documentation
        this.app.get('/api', (req, res) => {
            res.json({
                title: "TiltCheck API Documentation",
                version: "v1.0",
                liveIntegration: "tiltcheckecosystem.created.app",
                endpoints: ["/ecosystem", "/nftmint", "/degens-live", "/justthetip-live", "/communities"],
                newFeatures: ["NFT minting for legal agreements", "Discord OAuth verification"],
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
                    nftMinting: "Legal verification NFT system",
                    susLink: "Ecosystem landing page"
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
                nftSupport: "NFT verification and legal agreement assistance",
                footer: this.getFooter()
            });
        });

        // Terms of Service
        this.app.get('/terms', (req, res) => {
            res.json({
                title: "Terms of Service",
                lastUpdated: "2024-08-01",
                compliance: ["GDPR", "CCPA"],
                nftIntegration: "Legal agreements verified through NFT minting",
                footer: this.getFooter()
            });
        });

        // Privacy Policy
        this.app.get('/privacy', (req, res) => {
            res.json({
                title: "Privacy Policy", 
                lastUpdated: "2024-08-01",
                dataProtection: "GDPR Compliant",
                nftPrivacy: "Discord ID linking for verification purposes only",
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
    <url><loc>https://tiltcheck.it.com/degens-live</loc><priority>0.9</priority></url>
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
            console.log(`🚀 TiltCheck Ecosystem Server running on port ${this.port}`);
            console.log(`📡 Live integration: tiltcheckecosystem.created.app`);
            console.log(`🎨 NEW: NFT Minting at /nftmint`);
            console.log(`🎯 Discord: discord.gg/K3Md6aZx`);
            console.log(`💎 Made 4 Degens by Degens ❤️`);
        });
    }
}

const server = new TiltCheckEcosystemServer();
server.start();
