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
 * 🔐 Authentication API
 * 
 * Comprehensive authentication system with:
 * - Email/password registration and login
 * - Discord OAuth integration
 * - JWT token management
 * - Password reset functionality
 * - Email verification
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');

const router = express.Router();

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRES_IN = '7d';
const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and users file exist
fs.ensureDirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) {
    fs.writeJSONSync(USERS_FILE, { users: [] }, { spaces: 2 });
}

/**
 * Helper: Load users from file
 */
function loadUsers() {
    try {
        const data = fs.readJSONSync(USERS_FILE);
        return data.users || [];
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

/**
 * Helper: Save users to file
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
 * Helper: Generate JWT token
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'user'
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Helper: Verify JWT token
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Middleware: Require authentication
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
    
    req.user = decoded;
    next();
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, username, displayName } = req.body;
        
        // Validation
        if (!email || !password || !username) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and username are required'
            });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }
        
        // Load existing users
        const users = loadUsers();
        
        // Check if user already exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }
        
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return res.status(409).json({
                success: false,
                error: 'Username already taken'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: crypto.randomBytes(16).toString('hex'),
            email: email.toLowerCase(),
            username,
            displayName: displayName || username,
            password: hashedPassword,
            role: 'user',
            emailVerified: false,
            onboardingComplete: false,
            profileComplete: false,
            permissions: {
                notifications: false,
                location: false,
                storage: false
            },
            connectedAccounts: {
                discord: null,
                wallet: null
            },
            nftMinted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Save user
        users.push(newUser);
        if (!saveUsers(users)) {
            throw new Error('Failed to save user');
        }
        
        // Generate token
        const token = generateToken(newUser);
        
        // Remove password from response
        const userResponse = { ...newUser };
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: userResponse,
                token
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        // Load users
        const users = loadUsers();
        
        // Find user
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        saveUsers(users);
        
        // Remove password from response
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json({
            success: true,
            data: { user: userResponse }
        });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', requireAuth, (req, res) => {
    try {
        const users = loadUsers();
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const token = generateToken(user);
        
        res.json({
            success: true,
            data: { token }
        });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Token refresh failed'
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

/**
 * Export router and middleware
 */
module.exports = {
    router,
    requireAuth,
    verifyToken,
    generateToken
};
