# Login & Profile Setup Implementation Guide

## 🎯 Overview

This document describes the complete implementation of the login, profile setup, and AI-powered onboarding system for TiltCheck.

## ✨ Features Implemented

### 1. Authentication System
- **JWT-based Authentication**: Secure token-based auth with 7-day expiration
- **User Registration**: Email validation, password hashing with bcrypt
- **User Login**: Secure credential verification
- **Token Refresh**: Automatic token renewal
- **Protected Routes**: Middleware for API endpoint protection
- **Discord OAuth**: Social login integration (ready)

### 2. Profile Management
- **Profile CRUD Operations**: Create, read, update user profiles
- **Profile Completeness Tracking**: 10-point checklist with percentage
- **Permission Management**: Granular app permissions (notifications, storage, location)
- **Connected Accounts**: Discord and Solana wallet linking
- **NFT Status Tracking**: Record NFT minting for verification

### 3. AI-Powered Onboarding
- **8-Step Wizard**: Guided profile setup process
- **4 Personality Types**: Personalized guidance based on user experience level
  - Beginner: Friendly and educational
  - Casual: Relaxed and encouraging
  - Experienced: Professional and direct
  - Professional: Technical and comprehensive
- **Contextual AI Messages**: Step-specific guidance
- **Progress Tracking**: Visual progress indicators
- **Skip Functionality**: Optional steps can be skipped

### 4. Wallet Integration
- **Phantom Wallet Support**: Solana wallet connection
- **Wallet Verification**: Address validation
- **Connection Persistence**: Save wallet details to profile
- **Visual Feedback**: Connection status indicators

### 5. Discord Integration
- **OAuth Flow**: Redirect-based authentication
- **Profile Linking**: Associate Discord account with TiltCheck profile
- **Community Features**: Ready for bot integration

### 6. NFT Verification
- **Minting Integration**: Connect to existing NFT system
- **Verification Badge**: DegenTrust NFT for trusted users
- **Premium Features**: NFT unlocks advanced capabilities

## 📁 File Structure

```
/TiltCheck
├── api/
│   ├── auth.js              # Authentication API endpoints
│   ├── profile.js           # Profile management endpoints
│   └── onboarding.js        # AI onboarding guidance
├── api-server.js            # Main Express server
├── login.html               # Login page
├── register.html            # Registration page
├── onboarding.html          # AI-powered onboarding wizard
├── profile-setup.html       # Quick profile completion page
└── data/
    └── users.json           # User data storage (JSON-based)
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   node api-server.js
   # Server runs on http://localhost:3000
   ```

3. **Access the Application**
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register
   - Onboarding: http://localhost:3000/onboarding (after registration)
   - Profile Setup: http://localhost:3000/profile-setup

## 🔌 API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepass123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /api/auth/login
Login existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### GET /api/auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

### Profile Management

#### GET /api/profile
Get user profile with completeness calculation.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": { /* user profile */ },
    "completeness": {
      "percentage": 40,
      "completed": 4,
      "total": 10,
      "checks": {
        "basicInfo": true,
        "avatar": true,
        "bio": true,
        "interests": true,
        "experienceLevel": false,
        "discordLinked": false,
        "walletLinked": false,
        "nftMinted": false,
        "emailVerified": false,
        "permissions": false
      }
    }
  }
}
```

#### PUT /api/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "displayName": "New Display Name",
  "bio": "Updated bio text",
  "avatar": "🎮",
  "interests": ["Gaming", "Technology"],
  "experienceLevel": "experienced"
}
```

#### POST /api/profile/permissions
Update user permissions.

**Request Body:**
```json
{
  "permissions": {
    "notifications": true,
    "storage": true,
    "location": false
  }
}
```

#### POST /api/profile/connect/discord
Connect Discord account.

**Request Body:**
```json
{
  "discordId": "123456789",
  "discordUsername": "johndoe#1234",
  "discordAvatar": "avatar_hash",
  "accessToken": "optional_token"
}
```

#### POST /api/profile/connect/wallet
Connect Solana wallet.

**Request Body:**
```json
{
  "walletAddress": "8x9...",
  "walletType": "phantom",
  "signature": "optional_signature"
}
```

#### POST /api/profile/nft/mint
Record NFT minting.

**Request Body:**
```json
{
  "nftAddress": "NFT_ADDRESS",
  "transactionHash": "TRANSACTION_HASH",
  "metadata": { /* optional metadata */ }
}
```

### Onboarding

#### GET /api/onboarding/steps
Get all onboarding steps and progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "steps": [ /* array of 8 steps */ ],
    "completedSteps": ["welcome", "basic_info"],
    "currentStep": "interests",
    "progress": {
      "percentage": 25,
      "completed": 2,
      "total": 8
    }
  }
}
```

#### GET /api/onboarding/guidance?step=basic_info
Get AI-powered guidance for a specific step.

**Response:**
```json
{
  "success": true,
  "data": {
    "step": "basic_info",
    "title": "Basic Information",
    "tone": "casual and encouraging",
    "message": "Pick a username and avatar. The usual stuff.",
    "tips": ["Take your time", "You can change these later"],
    "recommendations": ["Fill out what matters"],
    "nextSteps": [ /* upcoming steps */ ]
  }
}
```

## 🎨 UI/UX Features

### Design System
- **Color Palette**:
  - Primary Blue: `#60A5FA`
  - Secondary Cyan: `#4DD0E1`
  - Deep Purple: `#8B5CF6`
  - Success Green: `#10B981`
  - Cloud Grey: `#B7C3D3`
  - Dark Slate: `#1E293B`

- **Typography**: Inter font family
- **Effects**: Glassmorphism with backdrop blur
- **Animations**: Smooth transitions on hover and state changes

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - Desktop: > 968px
  - Tablet: 768px - 968px
  - Mobile: < 768px

### Interactive Elements
- Avatar selection grid with visual feedback
- Interest tags with toggle selection
- Toggle switches for permissions
- Progress bars with percentage indicators
- Connection cards with status indicators

## 🔒 Security Features

### Password Security
- Minimum 8 characters required
- Bcrypt hashing with 10 salt rounds
- Password strength indicator on registration

### Token Security
- JWT tokens with 7-day expiration
- Secure token storage in localStorage
- Token validation on protected routes
- Automatic token refresh mechanism

### API Security
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- Protected endpoints with authentication middleware

### Data Privacy
- Password never returned in API responses
- Sensitive data encrypted (in production)
- Optional permissions - user controlled
- GDPR-ready data structure

## 📊 Profile Completeness Calculation

The system tracks 10 checkpoints:

1. **Basic Info**: Display name, email, username
2. **Avatar**: Avatar emoji selected
3. **Bio**: User biography filled
4. **Interests**: At least one interest selected
5. **Experience Level**: Gaming experience set
6. **Discord Linked**: Discord account connected
7. **Wallet Linked**: Solana wallet connected
8. **NFT Minted**: Verification NFT created
9. **Email Verified**: Email verification completed
10. **Permissions**: At least one permission granted

**Calculation**: `(completed_items / 10) * 100%`

Users with >= 70% completion have `profileComplete: true`

## 🤖 AI Personality System

### User Types

1. **Beginner**
   - Tone: Friendly and educational
   - Focus: Learning and guidance
   - Recommendations: Start simple, explore gradually

2. **Casual**
   - Tone: Casual and encouraging
   - Focus: Quick setup, optional features
   - Recommendations: Pick what you like

3. **Experienced**
   - Tone: Professional and direct
   - Focus: Advanced features, efficiency
   - Recommendations: Full integration

4. **Professional**
   - Tone: Technical and comprehensive
   - Focus: Enterprise features, full access
   - Recommendations: Complete everything

### Message Generation
AI messages are generated based on:
- Current onboarding step
- User's experience level
- Profile completeness status
- Previous interactions

## 🧪 Testing

### Manual Testing Steps

1. **Registration Flow**
   ```bash
   # Navigate to /register
   # Fill in email, username, password
   # Verify registration success
   # Check automatic redirect to onboarding
   ```

2. **Login Flow**
   ```bash
   # Navigate to /login
   # Enter credentials
   # Verify login success
   # Check redirect based on onboarding status
   ```

3. **Onboarding Flow**
   ```bash
   # Complete each step
   # Verify progress bar updates
   # Check AI messages change per step
   # Test skip functionality on optional steps
   ```

4. **Wallet Connection**
   ```bash
   # Have Phantom wallet installed
   # Click "Connect Wallet"
   # Approve connection in Phantom
   # Verify wallet address saved
   ```

### API Testing

```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"testpass123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"testpass123"}'

# Test profile (with token from login)
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🚀 Deployment

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Secret (generate a strong random string)
JWT_SECRET=your-secret-key-here

# Discord OAuth (optional)
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up proper database (replace JSON file)
- [ ] Configure email service for verification
- [ ] Set up Discord OAuth app
- [ ] Test wallet connection on production
- [ ] Enable error logging
- [ ] Set up monitoring
- [ ] Configure backups

## 📝 Future Enhancements

### Planned Features
1. Email verification flow
2. Password reset functionality
3. Social login (GitHub, Google)
4. Profile photo upload
5. 2FA authentication
6. Email notifications
7. Activity logging
8. Admin dashboard
9. User search and discovery
10. Profile privacy settings

### Technical Improvements
1. Database migration (PostgreSQL/MongoDB)
2. Redis for session management
3. Rate limiting
4. API versioning
5. GraphQL endpoint
6. WebSocket for real-time updates
7. Automated testing suite
8. CI/CD pipeline
9. Docker containerization
10. Kubernetes deployment

## 🤝 Contributing

When contributing to this system:

1. Follow existing code style
2. Add JSDoc comments to functions
3. Test authentication flows thoroughly
4. Update this documentation
5. Ensure backward compatibility
6. Add migration scripts if needed

## 📞 Support

For issues or questions:
- Check API documentation: http://localhost:3000/api-docs
- Review error logs in console
- Test with curl commands
- Verify JWT token validity

## 📜 License

Copyright (c) 2024-2025 JME (jmenichole). All Rights Reserved.

This is proprietary software. See LICENSE file for details.

---

**Built with ❤️ for the TiltCheck Community**
