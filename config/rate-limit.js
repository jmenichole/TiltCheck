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
 * 🛡️ Rate Limiting Configuration
 * 
 * Production-ready rate limiting rules to prevent abuse
 * and ensure API availability
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/register attempts per windowMs
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many authentication attempts',
            message: 'Account security triggered. Please wait 15 minutes before trying again.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Payment endpoint rate limiter
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 payment attempts per hour
    message: {
        error: 'Too many payment attempts, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many payment attempts',
            message: 'You have exceeded the payment rate limit. Please try again in 1 hour.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Speed limiter to slow down repeated requests (gradual delay)
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per windowMs without delay
    delayMs: (hits) => hits * 100, // Add 100ms delay per request after 50th
    maxDelayMs: 5000, // Maximum delay of 5 seconds
});

// Strict limiter for NFT minting (expensive operation)
const nftMintLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // Limit each IP to 3 NFT mints per day
    message: {
        error: 'NFT minting limit reached',
        retryAfter: '24 hours'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'NFT minting limit reached',
            message: 'You can only mint 3 NFTs per 24 hours. Please try again tomorrow.',
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
        });
    }
});

// Moderate limiter for profile updates
const profileUpdateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 updates per minute
    message: {
        error: 'Too many profile updates',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Generous limiter for read operations
const readLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: {
        error: 'Too many requests',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Admin endpoints - stricter limits
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per 15 minutes
    message: {
        error: 'Admin rate limit exceeded',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Tip sending rate limiter
const tipLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 tips per minute
    message: {
        error: 'Slow down there, degen! 🐌',
        message: 'You can send up to 5 tips per minute. Take a breath.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Vault creation rate limiter
const vaultLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 vaults per hour
    message: {
        error: 'Too many vault creations',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    paymentLimiter,
    speedLimiter,
    nftMintLimiter,
    profileUpdateLimiter,
    readLimiter,
    adminLimiter,
    tipLimiter,
    vaultLimiter
};
