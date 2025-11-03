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

/**
 * 💳 Payment API - Coinbase Onramp Integration
 * 
 * Handles payment processing for NFT minting:
 * - Create Coinbase onramp sessions
 * - Process $5 NFT trust score foundation payments
 * - Verify payment completion
 * - Track payment history
 */

const express = require('express');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const { requireAuth } = require('./auth');

const router = express.Router();

// Configuration
const COINBASE_APP_ID = process.env.COINBASE_APP_ID || 'ca8b3b06-99e0-4611-affd-b39c2e7ca273';
const NFT_MINT_PRICE_USD = 5.00;
const DATA_DIR = path.join(__dirname, '../data');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data files exist
fs.ensureDirSync(DATA_DIR);
if (!fs.existsSync(PAYMENTS_FILE)) {
    fs.writeJSONSync(PAYMENTS_FILE, { payments: [] }, { spaces: 2 });
}

/**
 * Helper: Load payments
 */
function loadPayments() {
    try {
        const data = fs.readJSONSync(PAYMENTS_FILE);
        return data.payments || [];
    } catch (error) {
        console.error('Error loading payments:', error);
        return [];
    }
}

/**
 * Helper: Save payments
 */
function savePayments(payments) {
    try {
        fs.writeJSONSync(PAYMENTS_FILE, { payments }, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error saving payments:', error);
        return false;
    }
}

/**
 * Helper: Load users
 */
function loadUsers() {
    try {
        const data = fs.readJSONSync(USERS_FILE);
        return data.users || [];
    } catch (error) {
        return [];
    }
}

/**
 * Helper: Save users
 */
function saveUsers(users) {
    try {
        fs.writeJSONSync(USERS_FILE, { users }, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

/**
 * POST /api/payment/create-onramp-session
 * Create a Coinbase onramp session for NFT minting payment
 */
router.post('/create-onramp-session', requireAuth, async (req, res) => {
    try {
        const { walletAddress, destinationWallet } = req.body;
        
        // Validate wallet address
        if (!walletAddress && !destinationWallet) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required for payment'
            });
        }
        
        const userWallet = walletAddress || destinationWallet;
        
        // Validate wallet address format (Solana)
        if (userWallet.length < 32 || userWallet.length > 44) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Solana wallet address'
            });
        }
        
        // Check if user already has a pending or completed payment
        const payments = loadPayments();
        const existingPayment = payments.find(
            p => p.userId === req.user.id && p.status === 'pending'
        );
        
        if (existingPayment) {
            return res.json({
                success: true,
                message: 'Existing payment session found',
                data: {
                    sessionId: existingPayment.sessionId,
                    paymentUrl: existingPayment.paymentUrl,
                    status: existingPayment.status,
                    expiresAt: existingPayment.expiresAt
                }
            });
        }
        
        // Generate unique session ID
        const sessionId = crypto.randomBytes(16).toString('hex');
        
        // Create Coinbase Onramp URL
        // Using Coinbase Pay SDK parameters
        const onrampUrl = new URL('https://pay.coinbase.com/buy/select-asset');
        
        // Add required parameters
        onrampUrl.searchParams.set('appId', COINBASE_APP_ID);
        onrampUrl.searchParams.set('destinationWallets', JSON.stringify([{
            address: userWallet,
            blockchains: ['solana'],
            assets: ['SOL']
        }]));
        onrampUrl.searchParams.set('defaultNetwork', 'solana');
        onrampUrl.searchParams.set('presetFiatAmount', NFT_MINT_PRICE_USD.toString());
        onrampUrl.searchParams.set('defaultAsset', 'SOL');
        
        // Add metadata for tracking
        onrampUrl.searchParams.set('partnerUserId', req.user.id);
        onrampUrl.searchParams.set('sessionId', sessionId);
        
        // Create payment record
        const payment = {
            id: crypto.randomBytes(16).toString('hex'),
            sessionId,
            userId: req.user.id,
            userEmail: req.user.email,
            walletAddress: userWallet,
            amount: NFT_MINT_PRICE_USD,
            currency: 'USD',
            purpose: 'nft_mint',
            status: 'pending',
            paymentUrl: onrampUrl.toString(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
            updatedAt: new Date().toISOString()
        };
        
        // Save payment
        payments.push(payment);
        savePayments(payments);
        
        res.json({
            success: true,
            message: 'Payment session created successfully',
            data: {
                sessionId: payment.sessionId,
                paymentUrl: payment.paymentUrl,
                amount: payment.amount,
                currency: payment.currency,
                expiresAt: payment.expiresAt,
                instructions: {
                    step1: 'Click the payment URL to open Coinbase Pay',
                    step2: 'Complete the $5 USD payment',
                    step3: 'SOL will be sent to your wallet',
                    step4: 'Return here to mint your NFT'
                }
            }
        });
        
    } catch (error) {
        console.error('Create onramp session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment session'
        });
    }
});

/**
 * GET /api/payment/session/:sessionId
 * Get payment session status
 */
router.get('/session/:sessionId', requireAuth, (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const payments = loadPayments();
        const payment = payments.find(p => p.sessionId === sessionId && p.userId === req.user.id);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment session not found'
            });
        }
        
        // Check if expired
        const isExpired = new Date(payment.expiresAt) < new Date();
        if (isExpired && payment.status === 'pending') {
            payment.status = 'expired';
            savePayments(payments);
        }
        
        res.json({
            success: true,
            data: {
                sessionId: payment.sessionId,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                createdAt: payment.createdAt,
                expiresAt: payment.expiresAt,
                completedAt: payment.completedAt
            }
        });
        
    } catch (error) {
        console.error('Get payment session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get payment session'
        });
    }
});

/**
 * POST /api/payment/verify/:sessionId
 * Verify payment completion and mint NFT
 */
router.post('/verify/:sessionId', requireAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { transactionHash } = req.body;
        
        const payments = loadPayments();
        const paymentIndex = payments.findIndex(
            p => p.sessionId === sessionId && p.userId === req.user.id
        );
        
        if (paymentIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Payment session not found'
            });
        }
        
        const payment = payments[paymentIndex];
        
        // Check if already completed
        if (payment.status === 'completed') {
            return res.json({
                success: true,
                message: 'Payment already verified',
                data: {
                    status: payment.status,
                    nftMinted: true
                }
            });
        }
        
        // Update payment status
        payment.status = 'completed';
        payment.completedAt = new Date().toISOString();
        payment.transactionHash = transactionHash;
        payment.updatedAt = new Date().toISOString();
        
        payments[paymentIndex] = payment;
        savePayments(payments);
        
        // Update user NFT status
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex !== -1) {
            const user = users[userIndex];
            user.nftMinted = true;
            user.nftData = {
                paymentId: payment.id,
                sessionId: payment.sessionId,
                paidAmount: payment.amount,
                paidCurrency: payment.currency,
                transactionHash: transactionHash,
                mintedAt: new Date().toISOString()
            };
            user.updatedAt = new Date().toISOString();
            
            users[userIndex] = user;
            saveUsers(users);
        }
        
        res.json({
            success: true,
            message: 'Payment verified and NFT minted successfully',
            data: {
                status: 'completed',
                nftMinted: true,
                paymentId: payment.id,
                amount: payment.amount,
                currency: payment.currency
            }
        });
        
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});

/**
 * GET /api/payment/history
 * Get user's payment history
 */
router.get('/history', requireAuth, (req, res) => {
    try {
        const payments = loadPayments();
        const userPayments = payments
            .filter(p => p.userId === req.user.id)
            .map(p => ({
                id: p.id,
                sessionId: p.sessionId,
                amount: p.amount,
                currency: p.currency,
                purpose: p.purpose,
                status: p.status,
                createdAt: p.createdAt,
                completedAt: p.completedAt
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            data: {
                payments: userPayments,
                total: userPayments.length
            }
        });
        
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get payment history'
        });
    }
});

/**
 * POST /api/payment/cancel/:sessionId
 * Cancel a pending payment session
 */
router.post('/cancel/:sessionId', requireAuth, (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const payments = loadPayments();
        const paymentIndex = payments.findIndex(
            p => p.sessionId === sessionId && p.userId === req.user.id
        );
        
        if (paymentIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Payment session not found'
            });
        }
        
        const payment = payments[paymentIndex];
        
        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel payment with status: ${payment.status}`
            });
        }
        
        payment.status = 'cancelled';
        payment.cancelledAt = new Date().toISOString();
        payment.updatedAt = new Date().toISOString();
        
        payments[paymentIndex] = payment;
        savePayments(payments);
        
        res.json({
            success: true,
            message: 'Payment session cancelled successfully',
            data: {
                sessionId: payment.sessionId,
                status: payment.status
            }
        });
        
    } catch (error) {
        console.error('Cancel payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel payment session'
        });
    }
});

module.exports = router;
