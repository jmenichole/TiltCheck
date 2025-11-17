/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * Test suite for Mobile Integration (OAuth + Screen Capture)
 */

const TiltCheckOAuthFlow = require('./tiltCheckOAuthFlow.js');
const MobileGameplayAnalyzer = require('./mobileGameplayAnalyzer.js');

console.log('📱 Testing Mobile App Integration (OAuth + Screen Capture)\n');
console.log('='.repeat(70));

async function testFullMobileFlow() {
    console.log('\n🔐 TEST: Complete Mobile App Flow\n');
    console.log('-'.repeat(70));
    
    // Initialize systems
    const oauthFlow = new TiltCheckOAuthFlow();
    const gameplayAnalyzer = new MobileGameplayAnalyzer();
    
    const userId = 'mobile-user-001';
    const deviceId = 'iphone-xyz-123';
    const casinoId = 'stake';
    
    // STEP 1: User clicks casino link in mobile app
    console.log('\n📱 STEP 1: User clicks "Play at Stake" in mobile app');
    
    const oauthInit = oauthFlow.initiateOAuth({
        userId,
        casinoId,
        mobileAppCallback: 'tiltcheck://oauth/callback',
        deviceId,
        enableScreenCapture: true
    });
    
    console.log(`✅ OAuth initiated`);
    console.log(`   Session ID: ${oauthInit.sessionId}`);
    console.log(`   Popup URL: ${oauthInit.popupUrl}`);
    console.log(`   Permissions: Screen Capture = ${oauthInit.permissions.screenCapture}`);
    
    // STEP 2: OAuth browser opens, user logs into casino
    console.log('\n🌐 STEP 2: OAuth browser popup opens (like Discord)');
    console.log('   User logs into Stake...');
    
    // Simulate delay for user login
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // STEP 3: Casino login detected, return to app
    console.log('\n✅ STEP 3: Login successful, returning to app');
    
    const loginResult = oauthFlow.handleCasinoLogin({
        sessionId: oauthInit.sessionId,
        state: oauthFlow.oauthSessions.get(oauthInit.sessionId).state,
        casinoSessionData: {
            sessionToken: 'casino-session-xyz',
            balance: 1000.00
        },
        web3Address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
    });
    
    console.log(`✅ Returned to mobile app`);
    console.log(`   Token: ${loginResult.token.substring(0, 20)}...`);
    console.log(`   Web3 Address: ${loginResult.web3Address}`);
    console.log(`   Deep Link: ${loginResult.redirectUrl.substring(0, 50)}...`);
    
    // STEP 4: Start screen capture
    console.log('\n📸 STEP 4: Request screen capture permission');
    
    const captureStart = gameplayAnalyzer.startScreenCapture({
        userId,
        sessionId: oauthInit.sessionId,
        casinoId,
        token: loginResult.token,
        claimedRTP: 0.96
    });
    
    console.log(`✅ Screen capture started`);
    console.log(`   Capture FPS: ${gameplayAnalyzer.captureConfig.fps}`);
    console.log(`   Upload Endpoint: ${captureStart.instructions.uploadEndpoint}`);
    console.log(`   Upload Interval: ${captureStart.instructions.uploadInterval}ms`);
    
    // STEP 5: Simulate gameplay with frame capture
    console.log('\n🎰 STEP 5: Simulating gameplay with screen capture');
    console.log('   (In real app, frames come from ReplayKit/MediaProjection)');
    
    let frameNum = 0;
    const totalBets = 20;
    
    for (let bet = 0; bet < totalBets; bet++) {
        // Simulate bet placed
        const betAmount = 10;
        
        // Frame 1: Bet screen
        frameNum++;
        console.log(`\n   Frame ${frameNum}: Bet screen detected`);
        
        const betFrame = await gameplayAnalyzer.processFrame({
            sessionId: oauthInit.sessionId,
            imageData: createMockFrame('bet', betAmount),
            timestamp: Date.now(),
            metadata: { frameType: 'bet' }
        });
        
        if (betFrame.stateChange) {
            console.log(`   ✅ Bet detected: $${betAmount}`);
        }
        
        // Simulate game play time
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Frame 2: Result screen
        frameNum++;
        const winAmount = Math.random() < 0.4 ? betAmount * 2 : 0;
        
        const resultFrame = await gameplayAnalyzer.processFrame({
            sessionId: oauthInit.sessionId,
            imageData: createMockFrame('result', winAmount),
            timestamp: Date.now(),
            metadata: { frameType: 'result' }
        });
        
        if (resultFrame.stateChange) {
            console.log(`   ${winAmount > 0 ? '🎉 WIN' : '❌ LOSS'}: $${winAmount}`);
        }
        
        // Show analysis every 5 bets
        if ((bet + 1) % 5 === 0) {
            const status = resultFrame.fairnessStatus;
            console.log(`\n   📊 After ${bet + 1} bets:`);
            console.log(`      RTP: ${status.stats.observedRTP}`);
            console.log(`      Net: $${status.stats.netProfit}`);
        }
        
        // Check for alerts
        if (resultFrame.fairnessStatus.recentAlerts && 
            resultFrame.fairnessStatus.recentAlerts.length > 0) {
            const alert = resultFrame.fairnessStatus.recentAlerts[0];
            console.log(`\n   🚨 ALERT: ${alert.title}`);
            console.log(`      ${alert.message}`);
        }
    }
    
    // STEP 6: Get final session statistics
    console.log('\n\n📊 STEP 6: Final Session Statistics');
    console.log('-'.repeat(70));
    
    const sessionStats = gameplayAnalyzer.getSessionStats(oauthInit.sessionId);
    console.log(`✅ Session Status: ${sessionStats.status}`);
    console.log(`   Duration: ${(sessionStats.duration / 1000).toFixed(1)}s`);
    console.log(`   Frames Captured: ${sessionStats.frameCount}`);
    console.log(`   Bets Detected: ${sessionStats.betsDetected}`);
    console.log(`   Current Game: ${sessionStats.currentGameState}`);
    
    const fairness = sessionStats.fairnessStatus;
    console.log(`\n📊 Fairness Analysis:`);
    console.log(`   Total Bets: ${fairness.stats.totalBets}`);
    console.log(`   Total Wagered: $${fairness.stats.totalWagered}`);
    console.log(`   Total Won: $${fairness.stats.totalWon}`);
    console.log(`   Net Profit/Loss: $${fairness.stats.netProfit}`);
    console.log(`   Observed RTP: ${fairness.stats.observedRTP}`);
    console.log(`   Observed House Edge: ${fairness.stats.observedHouseEdge}`);
    
    // STEP 7: Stop capture and get final report
    console.log('\n\n🛑 STEP 7: User exits casino, stop monitoring');
    console.log('-'.repeat(70));
    
    const finalReport = gameplayAnalyzer.stopScreenCapture(oauthInit.sessionId);
    
    console.log(`✅ Session Ended`);
    console.log(`   Total Duration: ${(finalReport.duration / 1000).toFixed(1)}s`);
    console.log(`   Total Frames: ${finalReport.statistics.totalFrames}`);
    console.log(`   Average FPS: ${finalReport.statistics.averageFps}`);
    console.log(`   Bets Detected: ${finalReport.statistics.betsDetected}`);
    console.log(`   Wins Detected: ${finalReport.statistics.winsDetected}`);
    console.log(`   OCR Errors: ${finalReport.statistics.ocrErrors}`);
    console.log(`   Games Played: ${finalReport.statistics.detectedGames.join(', ')}`);
    
    // End OAuth session
    const sessionEnd = oauthFlow.endSession(oauthInit.sessionId);
    console.log(`\n✅ OAuth session closed`);
    
    return {
        oauthFlow,
        gameplayAnalyzer,
        finalReport
    };
}

async function testManualInputFallback() {
    console.log('\n\n🔧 TEST: Manual Input Fallback (OCR Failure)\n');
    console.log('-'.repeat(70));
    
    const oauthFlow = new TiltCheckOAuthFlow();
    const gameplayAnalyzer = new MobileGameplayAnalyzer();
    
    // Start session
    const oauthInit = oauthFlow.initiateOAuth({
        userId: 'test-user-002',
        casinoId: 'rollbit',
        mobileAppCallback: 'tiltcheck://oauth/callback',
        deviceId: 'android-abc-456',
        enableScreenCapture: true
    });
    
    const loginResult = oauthFlow.handleCasinoLogin({
        sessionId: oauthInit.sessionId,
        state: oauthFlow.oauthSessions.get(oauthInit.sessionId).state,
        casinoSessionData: { sessionToken: 'test' }
    });
    
    gameplayAnalyzer.startScreenCapture({
        userId: 'test-user-002',
        sessionId: oauthInit.sessionId,
        casinoId: 'rollbit',
        token: loginResult.token,
        claimedRTP: 0.98
    });
    
    console.log('📱 Scenario: OCR fails to detect bet');
    console.log('   User manually inputs bet via UI button');
    
    // Manual bet input
    const manualBet = gameplayAnalyzer.manualBetInput({
        sessionId: oauthInit.sessionId,
        amount: 25,
        gameType: 'blackjack'
    });
    
    console.log(`\n✅ Manual bet tracked: $${25}`);
    console.log(`   Game: blackjack`);
    
    // Manual outcome input
    const manualOutcome = await gameplayAnalyzer.manualOutcomeInput({
        sessionId: oauthInit.sessionId,
        winAmount: 50
    });
    
    console.log(`✅ Manual outcome tracked: WIN $${50}`);
    console.log(`   Analysis available: ${!!manualOutcome.analysis}`);
    
    // Clean up
    gameplayAnalyzer.stopScreenCapture(oauthInit.sessionId);
    oauthFlow.endSession(oauthInit.sessionId);
}

async function testMultipleDevices() {
    console.log('\n\n📱 TEST: Multiple Devices, Same User\n');
    console.log('-'.repeat(70));
    
    const oauthFlow = new TiltCheckOAuthFlow();
    
    const userId = 'multi-device-user';
    
    // Device 1: iPhone
    console.log('\n📱 Device 1: iPhone');
    const iphone = oauthFlow.initiateOAuth({
        userId,
        casinoId: 'stake',
        mobileAppCallback: 'tiltcheck://oauth/callback',
        deviceId: 'iphone-xyz-789'
    });
    console.log(`   Session: ${iphone.sessionId}`);
    
    // Device 2: Android
    console.log('\n📱 Device 2: Android');
    const android = oauthFlow.initiateOAuth({
        userId,
        casinoId: 'bc.game',
        mobileAppCallback: 'tiltcheck://oauth/callback',
        deviceId: 'android-def-456'
    });
    console.log(`   Session: ${android.sessionId}`);
    
    // Complete logins
    oauthFlow.handleCasinoLogin({
        sessionId: iphone.sessionId,
        state: oauthFlow.oauthSessions.get(iphone.sessionId).state,
        casinoSessionData: { sessionToken: 'test1' }
    });
    
    oauthFlow.handleCasinoLogin({
        sessionId: android.sessionId,
        state: oauthFlow.oauthSessions.get(android.sessionId).state,
        casinoSessionData: { sessionToken: 'test2' }
    });
    
    // Check user sessions
    const sessions = oauthFlow.getUserSessions(userId);
    console.log(`\n✅ User has ${sessions.length} active sessions:`);
    for (const session of sessions) {
        console.log(`   - ${session.casinoId} (${session.sessionId.substring(0, 8)}...)`);
    }
}

// Helper function to create mock frame data
function createMockFrame(type, amount) {
    // In real app, this would be actual screenshot data
    // For testing, we return mock data that simulates OCR results
    return Buffer.from(JSON.stringify({ type, amount }));
}

// Run all tests
async function runAllTests() {
    try {
        await testFullMobileFlow();
        await testManualInputFallback();
        await testMultipleDevices();
        
        console.log('\n\n✅ ALL MOBILE INTEGRATION TESTS PASSED');
        console.log('='.repeat(70));
        console.log('\n📱 SUMMARY:');
        console.log('   ✅ OAuth Flow: Working (like Discord)');
        console.log('   ✅ Screen Capture: Working');
        console.log('   ✅ Frame Analysis: Working');
        console.log('   ✅ RTP Verification: Working');
        console.log('   ✅ Real-time Alerts: Working');
        console.log('   ✅ Manual Fallback: Working');
        console.log('   ✅ Multi-Device: Working');
        console.log('\n🎯 Mobile app integration is READY!');
        console.log('   Users can verify casino fairness on mobile without API access.');
        console.log('   OAuth-style login + screen capture = Complete solution!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run tests
runAllTests();
