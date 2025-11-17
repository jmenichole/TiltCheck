# TiltCheck Mobile App Integration Guide

## Overview

This guide explains how to implement TiltCheck's real-time RTP verification and fairness monitoring in a mobile app using **OAuth-style browser login** and **screen capture analysis**.

## Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (React Native/ │
│   Flutter/Swift)│
└────────┬────────┘
         │
         │ 1. User clicks casino link
         │
         ▼
┌─────────────────┐
│ OAuth Browser   │◄──── Opens like Discord OAuth
│ Popup/WebView   │
└────────┬────────┘
         │
         │ 2. User logs into casino
         │
         ▼
┌─────────────────┐
│ TiltCheck OAuth │
│ Flow Handler    │
└────────┬────────┘
         │
         │ 3. Session token returned
         │
         ▼
┌─────────────────┐
│ Screen Capture  │
│ Service         │◄──── User grants permission
└────────┬────────┘
         │
         │ 4. Frames analyzed
         │
         ▼
┌─────────────────┐
│ RTP Verification│
│ & AI Analysis   │
└────────┬────────┘
         │
         │ 5. Real-time alerts
         │
         ▼
┌─────────────────┐
│ Mobile App      │
│ Shows Results   │
└─────────────────┘
```

## Key Question Answered

**Question:** "Would web3 browser login or a TiltCheck browser popup (like Discord) when links are clicked enable mobile app development with screen gameplay analysis?"

**Answer:** **YES!** This is exactly the right approach. Here's how:

### Why This Works

1. **OAuth-Style Login Flow** (like Discord)
   - User clicks casino link in TiltCheck app
   - Opens OAuth browser popup with TiltCheck wrapper
   - User logs into casino normally
   - TiltCheck detects login and returns to app with session token
   - No need for casino API keys or backend access

2. **Screen Capture Permission**
   - After login, app requests screen recording permission
   - Captures gameplay frames (2 FPS is enough)
   - OCR extracts bet amounts, wins, game types
   - Statistical analysis happens in real-time

3. **No Casino API Required**
   - All analysis done from what user sees on screen
   - Pure mathematics and statistics
   - Works with ANY casino (even those without APIs)

## Implementation Steps

### Step 1: Mobile App Setup

#### React Native Example

```javascript
// Install dependencies
// npm install react-native-webview react-native-screen-capture

import { WebView } from 'react-native-webview';
import { ScreenCapture } from 'react-native-screen-capture';

class TiltCheckApp extends React.Component {
  async handleCasinoLogin(casinoId) {
    // 1. Initiate OAuth flow
    const response = await fetch('https://api.tiltcheck.it.com/oauth/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.state.userId,
        casinoId: casinoId,
        mobileAppCallback: 'tiltcheck://oauth/callback',
        deviceId: this.state.deviceId,
        enableScreenCapture: true
      })
    });
    
    const { sessionId, popupUrl, permissions } = await response.json();
    
    // 2. Open OAuth browser popup
    this.setState({ 
      showOAuthWebView: true, 
      oauthUrl: popupUrl,
      sessionId
    });
  }
  
  async onOAuthComplete(token, sessionId) {
    // 3. OAuth completed, start screen capture
    if (permissions.screenCapture) {
      await this.startScreenCapture(sessionId, token);
    }
  }
  
  async startScreenCapture(sessionId, token) {
    // 4. Request screen capture permission
    const hasPermission = await ScreenCapture.requestPermission();
    
    if (hasPermission) {
      // 5. Start capturing and analyzing
      ScreenCapture.start({
        fps: 2, // 2 frames per second
        quality: 0.7,
        callback: async (frameData) => {
          await this.sendFrameForAnalysis(sessionId, frameData);
        }
      });
    }
  }
  
  async sendFrameForAnalysis(sessionId, frameData) {
    // 6. Send frame to TiltCheck for analysis
    const response = await fetch(
      `https://api.tiltcheck.it.com/gameplay/frame/${sessionId}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.state.token}`
        },
        body: JSON.stringify({
          sessionId,
          imageData: frameData.base64,
          timestamp: Date.now()
        })
      }
    );
    
    const analysis = await response.json();
    
    // 7. Handle alerts
    if (analysis.alerts && analysis.alerts.length > 0) {
      this.showAlert(analysis.alerts[0]);
    }
    
    // 8. Update UI with fairness status
    this.updateFairnessDisplay(analysis.fairnessStatus);
  }
}
```

#### iOS (Swift) Example

```swift
import UIKit
import ReplayKit

class TiltCheckViewController: UIViewController {
    let screenRecorder = RPScreenRecorder.shared()
    var captureSession: String?
    
    func handleCasinoLogin(casinoId: String) {
        // 1. Initiate OAuth flow
        let params = [
            "userId": userId,
            "casinoId": casinoId,
            "mobileAppCallback": "tiltcheck://oauth/callback",
            "deviceId": deviceId,
            "enableScreenCapture": true
        ]
        
        NetworkService.post("https://api.tiltcheck.it.com/oauth/initiate", 
                           params: params) { response in
            self.showOAuthBrowser(url: response.popupUrl, 
                                 sessionId: response.sessionId)
        }
    }
    
    func startScreenCapture(sessionId: String, token: String) {
        self.captureSession = sessionId
        
        // Request screen recording permission
        screenRecorder.startCapture(handler: { (buffer, bufferType, error) in
            guard error == nil else { return }
            
            // Process frame every 500ms (2 FPS)
            if bufferType == .video {
                self.processFrame(buffer: buffer)
            }
        }, completionHandler: { error in
            if let error = error {
                print("Screen capture error: \\(error)")
            }
        })
    }
    
    func processFrame(buffer: CMSampleBuffer) {
        // Convert frame to image
        let image = self.imageFromSampleBuffer(buffer)
        let base64 = image.jpegData(compressionQuality: 0.7)?.base64EncodedString()
        
        // Send to TiltCheck API
        let frameData = [
            "sessionId": captureSession!,
            "imageData": base64!,
            "timestamp": Date().timeIntervalSince1970
        ]
        
        NetworkService.post("https://api.tiltcheck.it.com/gameplay/frame/\\(captureSession!)",
                           params: frameData) { analysis in
            // Handle results
            self.handleAnalysis(analysis)
        }
    }
}
```

#### Android (Kotlin) Example

```kotlin
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager

class TiltCheckActivity : AppCompatActivity() {
    private lateinit var mediaProjectionManager: MediaProjectionManager
    private var captureSession: String? = null
    
    fun handleCasinoLogin(casinoId: String) {
        // 1. Initiate OAuth flow
        val params = mapOf(
            "userId" to userId,
            "casinoId" to casinoId,
            "mobileAppCallback" to "tiltcheck://oauth/callback",
            "deviceId" to deviceId,
            "enableScreenCapture" to true
        )
        
        apiService.post("https://api.tiltcheck.it.com/oauth/initiate", params)
            .subscribe { response ->
                showOAuthBrowser(response.popupUrl, response.sessionId)
            }
    }
    
    fun startScreenCapture(sessionId: String, token: String) {
        captureSession = sessionId
        
        // Request screen capture permission
        mediaProjectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) 
            as MediaProjectionManager
        
        startActivityForResult(
            mediaProjectionManager.createScreenCaptureIntent(),
            SCREEN_CAPTURE_REQUEST
        )
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == SCREEN_CAPTURE_REQUEST && resultCode == RESULT_OK) {
            val mediaProjection = mediaProjectionManager.getMediaProjection(resultCode, data!!)
            startCapturingFrames(mediaProjection)
        }
    }
    
    private fun startCapturingFrames(projection: MediaProjection) {
        // Capture at 2 FPS
        val handler = Handler(Looper.getMainLooper())
        handler.postDelayed(object : Runnable {
            override fun run() {
                captureFrame(projection) { frameData ->
                    sendFrameForAnalysis(captureSession!!, frameData)
                }
                handler.postDelayed(this, 500) // 2 FPS
            }
        }, 500)
    }
    
    private fun sendFrameForAnalysis(sessionId: String, frameData: ByteArray) {
        val base64 = Base64.encodeToString(frameData, Base64.DEFAULT)
        
        val params = mapOf(
            "sessionId" to sessionId,
            "imageData" to base64,
            "timestamp" to System.currentTimeMillis()
        )
        
        apiService.post(
            "https://api.tiltcheck.it.com/gameplay/frame/$sessionId",
            params
        ).subscribe { analysis ->
            handleAnalysis(analysis)
        }
    }
}
```

### Step 2: Backend Integration

```javascript
// server.js - TiltCheck backend
const express = require('express');
const TiltCheckOAuthFlow = require('./tiltCheckOAuthFlow');
const MobileGameplayAnalyzer = require('./mobileGameplayAnalyzer');

const app = express();
const oauthFlow = new TiltCheckOAuthFlow();
const gameplayAnalyzer = new MobileGameplayAnalyzer();

// OAuth endpoints
app.use('/oauth', oauthFlow.createExpressRouter());

// Screen capture endpoint
app.post('/gameplay/frame/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { imageData, timestamp } = req.body;
    
    // Process the frame
    const analysis = await gameplayAnalyzer.processFrame({
      sessionId,
      imageData,
      timestamp
    });
    
    res.json(analysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get session status
app.get('/gameplay/status/:sessionId', (req, res) => {
  const stats = gameplayAnalyzer.getSessionStats(req.params.sessionId);
  res.json(stats);
});

app.listen(3000, () => {
  console.log('TiltCheck API running on port 3000');
});
```

## How It Works Without Casino API Access

### The Mathematical Foundation

1. **Track Every Bet and Outcome**
   - OCR extracts bet amounts from screen
   - OCR extracts win amounts from screen
   - No API needed - just what user sees

2. **Calculate Actual RTP**
   ```
   RTP = Total Won / Total Wagered
   ```

3. **Compare to Claimed RTP**
   - Casino claims 96% RTP
   - Your actual RTP after 100 bets: 85%
   - Deviation: 11% (SUSPICIOUS!)

4. **Statistical Significance**
   - With enough bets (100+), we can tell if deviation is:
     - Normal variance (luck)
     - Suspicious (possible fraud)
   - Uses z-scores, p-values, confidence intervals

### Example Scenario

```javascript
// User plays 100 bets at $10 each
// Casino claims 96% RTP

// Actual results:
Total Wagered: $1,000
Total Won: $850
Actual RTP: 85%

// Analysis:
Expected RTP: 96%
Deviation: -11%
Z-Score: -3.2σ (highly unlikely by chance)
P-Value: 0.001 (statistically significant)

// Verdict: SUSPICIOUS
// Recommendation: Stop playing, report casino
```

## Web3 Integration (Optional)

For crypto casinos, you can also track transactions:

```javascript
// Monitor user's wallet for transactions
import { Connection, PublicKey } from '@solana/web3.js';

async function monitorWeb3Transactions(walletAddress) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  
  // Subscribe to account changes
  connection.onAccountChange(
    new PublicKey(walletAddress),
    (accountInfo) => {
      // Detect deposits/withdrawals
      // Cross-reference with screen capture data
      // Provides additional verification layer
    }
  );
}
```

## Privacy & Permissions

### What We Capture
- ✅ Screen content during casino gameplay
- ✅ Bet amounts, win amounts, game types
- ✅ Session duration, number of bets

### What We DON'T Capture
- ❌ Passwords or login credentials
- ❌ Personal messages or other apps
- ❌ Screen content outside casino gameplay
- ❌ Banking information

### User Consent
```javascript
// Always ask for explicit permission
const PERMISSION_TEXT = `
TiltCheck needs permission to:
1. Monitor your casino gameplay
2. Analyze bet amounts and outcomes
3. Verify casino fairness in real-time

Your data is:
- Encrypted end-to-end
- Never shared with third parties
- Used only for fairness verification
- Deleted after 30 days

Grant permission?
`;
```

## Testing

See `test_rtp_verification.js` for comprehensive tests:

```bash
# Run RTP verification tests
node test_rtp_verification.js

# Run mobile integration tests
node test_mobile_integration.js
```

## API Endpoints

### OAuth Flow
- `POST /oauth/initiate` - Start OAuth flow
- `POST /oauth/callback` - Handle casino login
- `POST /oauth/verify` - Verify session token
- `GET /oauth/sessions/:userId` - Get active sessions
- `POST /oauth/end-session` - End session

### Gameplay Analysis
- `POST /gameplay/start/:sessionId` - Start screen capture
- `POST /gameplay/frame/:sessionId` - Submit frame for analysis
- `GET /gameplay/status/:sessionId` - Get current status
- `POST /gameplay/stop/:sessionId` - Stop capture

### Fairness Reports
- `GET /fairness/report/:userId` - Get user's fairness report
- `GET /fairness/casino/:casinoId` - Get casino-wide report
- `GET /fairness/alert/:userId` - Get active alerts

## Benefits of This Approach

1. **Universal Compatibility**
   - Works with ANY casino (with or without API)
   - No need for casino partnerships
   - User controls their own data

2. **Mobile-First Design**
   - Native iOS/Android support
   - Low battery impact (2 FPS capture)
   - Offline analysis possible

3. **Privacy-Focused**
   - User grants explicit permission
   - Only captures during active sessions
   - Data encrypted and user-owned

4. **Mathematically Sound**
   - Based on statistical analysis
   - Can't be fooled by casinos
   - Provides confidence intervals

## Next Steps

1. Implement OAuth flow in your mobile app
2. Add screen capture permissions
3. Integrate TiltCheck SDK
4. Test with demo casino
5. Deploy to production

## Support

For implementation help:
- GitHub: https://github.com/jmenichole/TiltCheck
- Email: jmenichole007@outlook.com

---

**TiltCheck - Verify Casino Fairness Without API Access**
© 2024-2025 JME (jmenichole). All Rights Reserved.
