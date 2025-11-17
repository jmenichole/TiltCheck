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
 * Mobile Screen Capture & Gameplay Analysis System
 * 
 * Enables real-time gameplay monitoring on mobile devices through:
 * 1. Screen capture API (with user permission)
 * 2. OCR (Optical Character Recognition) for bet/win detection
 * 3. Pattern recognition for game state detection
 * 4. Integration with RTP verification system
 * 
 * This enables the mobile app to analyze gameplay WITHOUT casino API access.
 * 
 * Technical Approaches:
 * - iOS: ReplayKit framework for screen recording
 * - Android: MediaProjection API for screen capture
 * - Web: Screen Capture API (Chrome/Edge)
 * - OCR: Tesseract.js or cloud OCR services
 * - Image Analysis: TensorFlow.js for pattern recognition
 */

const AIFairnessMonitor = require('./aiFairnessMonitor.js');

class MobileGameplayAnalyzer {
    constructor(options = {}) {
        this.fairnessMonitor = new AIFairnessMonitor(options);
        
        // Screen capture settings
        this.captureConfig = {
            fps: options.fps || 2, // Capture 2 frames per second (enough for analysis)
            quality: options.quality || 0.7, // JPEG quality
            maxWidth: options.maxWidth || 720, // Resize for efficiency
            ocrLanguage: options.ocrLanguage || 'eng'
        };
        
        // Active capture sessions
        this.captureSessions = new Map(); // sessionId -> capture data
        
        // OCR and pattern detection
        this.betPatterns = {
            // Regex patterns to detect bets from screen text
            betAmount: /(?:Bet|Wager|Amount)[:\s]*\$?(\d+(?:\.\d{2})?)/i,
            winAmount: /(?:Win|Won|Payout)[:\s]*\$?(\d+(?:\.\d{2})?)/i,
            balance: /(?:Balance|Credits)[:\s]*\$?(\d+(?:\.\d{2})?)/i,
            gameType: /(?:Playing|Game)[:\s]*(Slots?|Blackjack|Roulette|Dice|Crash|Plinko|Mines)/i
        };
        
        // Game state detection
        this.gameStates = {
            IDLE: 'idle',
            BETTING: 'betting',
            PLAYING: 'playing',
            RESULT: 'result',
            WIN: 'win',
            LOSS: 'loss'
        };
        
        console.log('📱 Mobile Gameplay Analyzer initialized');
    }

    /**
     * Start screen capture session for a user
     * Called after successful OAuth login
     * 
     * @param {Object} params - Capture parameters
     * @param {string} params.userId - TiltCheck user ID
     * @param {string} params.sessionId - OAuth session ID
     * @param {string} params.casinoId - Casino identifier
     * @param {string} params.token - Authentication token
     * @param {number} params.claimedRTP - Casino's claimed RTP
     * @returns {Object} Capture session info
     */
    startScreenCapture(params) {
        const { userId, sessionId, casinoId, token, claimedRTP } = params;
        
        // Start fairness monitoring
        const monitoring = this.fairnessMonitor.startMonitoring(userId, {
            casinoId,
            claimedRTP
        });
        
        // Initialize capture session
        const captureSession = {
            sessionId,
            userId,
            casinoId,
            token,
            startTime: Date.now(),
            frameCount: 0,
            lastFrame: null,
            currentGameState: this.gameStates.IDLE,
            currentBet: null,
            pendingBets: [],
            detectedGames: new Set(),
            // Statistics
            totalFramesAnalyzed: 0,
            betsDetected: 0,
            winsDetected: 0,
            ocrErrors: 0
        };
        
        this.captureSessions.set(sessionId, captureSession);
        
        console.log(`📱 Screen capture started for user ${userId}`);
        
        return {
            status: 'capture_started',
            sessionId,
            captureConfig: this.captureConfig,
            instructions: {
                ios: 'Use ReplayKit framework to capture screen',
                android: 'Use MediaProjection API to capture screen',
                web: 'Use Screen Capture API with getDisplayMedia()',
                uploadEndpoint: `/api/gameplay/frame/${sessionId}`,
                uploadInterval: 1000 / this.captureConfig.fps // ms between frames
            }
        };
    }

    /**
     * Process a captured frame from mobile app
     * 
     * @param {Object} frameData - Frame information
     * @param {string} frameData.sessionId - Capture session ID
     * @param {Buffer|string} frameData.imageData - Image as Buffer or base64
     * @param {number} frameData.timestamp - Frame timestamp
     * @param {Object} frameData.metadata - Optional metadata from device
     * @returns {Object} Analysis result
     */
    async processFrame(frameData) {
        const { sessionId, imageData, timestamp, metadata } = frameData;
        
        const session = this.captureSessions.get(sessionId);
        if (!session) {
            throw new Error('Capture session not found');
        }
        
        session.frameCount++;
        session.lastFrame = timestamp;
        session.totalFramesAnalyzed++;
        
        try {
            // 1. Perform OCR on the frame
            const ocrText = await this._performOCR(imageData);
            
            // 2. Extract gameplay data from text
            const gameplayData = this._extractGameplayData(ocrText, session);
            
            // 3. Detect game state changes
            const stateChange = this._detectStateChange(gameplayData, session);
            
            // 4. If bet detected, track it
            if (stateChange.betDetected) {
                await this._trackDetectedBet(session, stateChange.betData);
            }
            
            // 5. If win/loss detected, track outcome
            if (stateChange.outcomeDetected) {
                await this._trackDetectedOutcome(session, stateChange.outcomeData);
            }
            
            // 6. Get current analysis status
            const status = this.fairnessMonitor.getStatus(session.userId);
            
            return {
                frameProcessed: true,
                frameNumber: session.frameCount,
                timestamp,
                gameState: session.currentGameState,
                dataExtracted: gameplayData,
                stateChange: stateChange.detected,
                fairnessStatus: status,
                ocrQuality: ocrText.length > 0 ? 'good' : 'poor'
            };
            
        } catch (error) {
            session.ocrErrors++;
            console.error(`Error processing frame for session ${sessionId}:`, error);
            
            return {
                frameProcessed: false,
                frameNumber: session.frameCount,
                error: error.message
            };
        }
    }

    /**
     * Perform OCR on frame image
     * @private
     */
    async _performOCR(imageData) {
        // In production, this would use:
        // - Tesseract.js for client-side OCR
        // - Google Cloud Vision API
        // - AWS Textract
        // - Azure Computer Vision
        
        // For now, simulate OCR extraction
        // In real implementation, we'd process the actual image
        
        // Mock OCR result that would come from actual OCR
        const mockOcrResults = [
            "Balance: $1,245.50\nBet: $10.00\nGame: Slots\nSpin",
            "Balance: $1,235.50\nWin: $0.00\nLoss",
            "Balance: $1,235.50\nBet: $10.00\nGame: Slots",
            "Balance: $1,305.50\nWin: $80.00\nWinner!"
        ];
        
        // Simulate OCR delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Return simulated OCR text
        return mockOcrResults[Math.floor(Math.random() * mockOcrResults.length)];
    }

    /**
     * Extract gameplay data from OCR text
     * @private
     */
    _extractGameplayData(ocrText, session) {
        const data = {
            betAmount: null,
            winAmount: null,
            balance: null,
            gameType: null,
            raw: ocrText
        };
        
        // Extract bet amount
        const betMatch = ocrText.match(this.betPatterns.betAmount);
        if (betMatch) {
            data.betAmount = parseFloat(betMatch[1]);
        }
        
        // Extract win amount
        const winMatch = ocrText.match(this.betPatterns.winAmount);
        if (winMatch) {
            data.winAmount = parseFloat(winMatch[1]);
        }
        
        // Extract balance
        const balanceMatch = ocrText.match(this.betPatterns.balance);
        if (balanceMatch) {
            data.balance = parseFloat(balanceMatch[1]);
        }
        
        // Extract game type
        const gameMatch = ocrText.match(this.betPatterns.gameType);
        if (gameMatch) {
            data.gameType = gameMatch[1].toLowerCase();
            session.detectedGames.add(data.gameType);
        }
        
        return data;
    }

    /**
     * Detect game state changes
     * @private
     */
    _detectStateChange(gameplayData, session) {
        const change = {
            detected: false,
            betDetected: false,
            outcomeDetected: false,
            betData: null,
            outcomeData: null
        };
        
        const { betAmount, winAmount, gameType } = gameplayData;
        
        // Detect new bet
        if (betAmount && betAmount > 0 && !session.currentBet) {
            change.detected = true;
            change.betDetected = true;
            change.betData = {
                amount: betAmount,
                gameType: gameType || 'unknown',
                timestamp: Date.now()
            };
            
            session.currentGameState = this.gameStates.BETTING;
            session.betsDetected++;
        }
        
        // Detect outcome
        if (session.currentBet && winAmount !== null) {
            change.detected = true;
            change.outcomeDetected = true;
            change.outcomeData = {
                winAmount: winAmount,
                timestamp: Date.now()
            };
            
            session.currentGameState = winAmount > 0 ? this.gameStates.WIN : this.gameStates.LOSS;
            session.winsDetected += winAmount > 0 ? 1 : 0;
        }
        
        return change;
    }

    /**
     * Track detected bet
     * @private
     */
    async _trackDetectedBet(session, betData) {
        const tracking = this.fairnessMonitor.trackBet({
            userId: session.userId,
            casinoId: session.casinoId,
            gameType: betData.gameType,
            amount: betData.amount,
            timestamp: betData.timestamp
        });
        
        session.currentBet = {
            ...betData,
            sessionId: tracking.sessionId,
            betIndex: tracking.betIndex
        };
        
        console.log(`🎰 Bet detected: $${betData.amount} on ${betData.gameType}`);
    }

    /**
     * Track detected outcome
     * @private
     */
    async _trackDetectedOutcome(session, outcomeData) {
        if (!session.currentBet) {
            console.warn('Outcome detected but no current bet');
            return;
        }
        
        const analysis = await this.fairnessMonitor.trackOutcome({
            userId: session.userId,
            sessionId: session.currentBet.sessionId,
            betIndex: session.currentBet.betIndex,
            winAmount: outcomeData.winAmount,
            timestamp: outcomeData.timestamp
        });
        
        console.log(`📊 Outcome tracked: ${outcomeData.winAmount > 0 ? 'WIN' : 'LOSS'} $${outcomeData.winAmount}`);
        
        // Clear current bet
        session.currentBet = null;
        
        // Check for alerts
        if (analysis.alerts && analysis.alerts.length > 0) {
            console.log(`🚨 ${analysis.alerts.length} alert(s) triggered`);
        }
        
        return analysis;
    }

    /**
     * Stop screen capture session
     * @param {string} sessionId - Session identifier
     * @returns {Object} Final session report
     */
    stopScreenCapture(sessionId) {
        const session = this.captureSessions.get(sessionId);
        if (!session) {
            throw new Error('Capture session not found');
        }
        
        // Stop fairness monitoring
        const finalReport = this.fairnessMonitor.stopMonitoring(session.userId);
        
        // Session statistics
        const duration = Date.now() - session.startTime;
        const avgFps = session.totalFramesAnalyzed / (duration / 1000);
        
        const report = {
            sessionId,
            userId: session.userId,
            casinoId: session.casinoId,
            duration,
            statistics: {
                totalFrames: session.totalFramesAnalyzed,
                averageFps: avgFps.toFixed(2),
                betsDetected: session.betsDetected,
                winsDetected: session.winsDetected,
                ocrErrors: session.ocrErrors,
                detectedGames: Array.from(session.detectedGames)
            },
            finalReport
        };
        
        this.captureSessions.delete(sessionId);
        
        console.log(`📱 Screen capture stopped for session ${sessionId}`);
        
        return report;
    }

    /**
     * Get session statistics
     * @param {string} sessionId - Session identifier
     * @returns {Object} Current session stats
     */
    getSessionStats(sessionId) {
        const session = this.captureSessions.get(sessionId);
        if (!session) {
            throw new Error('Capture session not found');
        }
        
        const fairnessStatus = this.fairnessMonitor.getStatus(session.userId);
        
        return {
            sessionId,
            status: 'active',
            duration: Date.now() - session.startTime,
            frameCount: session.frameCount,
            betsDetected: session.betsDetected,
            currentGameState: session.currentGameState,
            fairnessStatus
        };
    }

    /**
     * Manual bet input (fallback if OCR fails)
     * @param {Object} betData - Manual bet input
     * @returns {Object} Tracking result
     */
    manualBetInput(betData) {
        const { sessionId, amount, gameType } = betData;
        
        const session = this.captureSessions.get(sessionId);
        if (!session) {
            throw new Error('Capture session not found');
        }
        
        const tracking = this.fairnessMonitor.trackBet({
            userId: session.userId,
            casinoId: session.casinoId,
            gameType,
            amount,
            timestamp: Date.now()
        });
        
        session.currentBet = {
            amount,
            gameType,
            sessionId: tracking.sessionId,
            betIndex: tracking.betIndex,
            manual: true
        };
        
        return {
            tracked: true,
            message: 'Manual bet tracked successfully',
            ...tracking
        };
    }

    /**
     * Manual outcome input (fallback if OCR fails)
     * @param {Object} outcomeData - Manual outcome input
     * @returns {Object} Analysis result
     */
    async manualOutcomeInput(outcomeData) {
        const { sessionId, winAmount } = outcomeData;
        
        const session = this.captureSessions.get(sessionId);
        if (!session) {
            throw new Error('Capture session not found');
        }
        
        if (!session.currentBet) {
            throw new Error('No active bet to record outcome for');
        }
        
        const analysis = await this.fairnessMonitor.trackOutcome({
            userId: session.userId,
            sessionId: session.currentBet.sessionId,
            betIndex: session.currentBet.betIndex,
            winAmount,
            timestamp: Date.now()
        });
        
        session.currentBet = null;
        
        return {
            tracked: true,
            message: 'Manual outcome tracked successfully',
            analysis
        };
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileGameplayAnalyzer;
}
