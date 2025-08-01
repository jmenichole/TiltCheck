# 🎯 AIM-Style Instant Messenger for TiltCheck Overlay

## Overview
A nostalgic AOL Instant Messenger (AIM) interface integrated into your TiltCheck overlay system, complete with classic .wav sound notifications and gambling-themed social features.

## 🎵 Sound System

### Primary Notification Sound
- **File**: `55817__sergenious__bloop2.wav` (your existing sound file)
- **Usage**: Main message notifications, tilt alerts
- **Volume**: Configurable (default: 70%)

### Generated Sounds
The system includes a Web Audio API sound generator that creates classic AIM sounds:
- **Buddy Online**: Higher pitch ding (800Hz)
- **Buddy Offline**: Lower pitch tone (400Hz) 
- **Type Sound**: Quick click for typing indicators
- **Door Slam**: White noise burst for offline events

### Sound Configuration
```javascript
// Adjust volume for all sounds
aimMessenger.settings.volume = 0.8; // 80% volume

// Enable/disable sounds
aimMessenger.settings.soundEnabled = true;
```

## 🎮 Features

### Classic AIM Interface
- **Buddy List**: Organized by "Gambling Buddies" and "Online" groups
- **Status System**: Online, Away, Idle, Invisible
- **Message Windows**: Draggable conversation windows
- **Toolbar**: Setup, Find Buddy, Preferences, Help buttons

### TiltCheck Integration
- **Tilt Alerts**: Automated messages when tilt risk increases
- **Betting Events**: Notifications for big wins/losses, streaks
- **Social Events**: Tips, challenges, loan approvals
- **System Messages**: Account notifications, security alerts

### Gambling-Themed Buddies
- **TiltMaster**: Provides tilt protection advice
- **PokerPro2024**: Shares poker insights and bad beats
- **SlotQueen**: Slot machine strategies and wins
- **ResponsibleGamer**: Responsible gambling reminders
- **BettingBuddy**: General betting discussion

## 🚀 Getting Started

### 1. File Structure
```
dashboard/
├── overlay.html              # Updated with AIM integration
├── aim-messenger.js          # Core AIM messenger system
├── tiltcheck-aim-notifications.js  # TiltCheck event handlers
├── sounds/
│   ├── aim-sound-generator.js     # Web Audio API sound creation
│   └── [additional .wav files]   # Optional sound assets
└── 55817__sergenious__bloop2.wav  # Primary notification sound
```

### 2. Initialization
The AIM system auto-initializes when the overlay loads:

```javascript
// Automatic setup on page load
document.addEventListener('DOMContentLoaded', () => {
    // AIM Messenger initializes
    // TiltCheck notifications connect
    // Sample buddies are added
});
```

### 3. Manual Controls
```javascript
// Add new buddy
aimMessenger.addBuddy('NewPlayer', 'gambling');

// Set buddy status
aimMessenger.setBuddyStatus('NewPlayer', 'online');

// Send message to buddy
aimMessenger.sendMessageToBuddy('NewPlayer', 'Welcome to TiltCheck!');

// Open conversation
aimMessenger.openConversation('TiltMaster');
```

## 🔔 Notification Types

### Tilt Alerts
```javascript
// Low risk
"Hey, just checking in. How's your session going?"

// Medium risk  
"I noticed some pattern changes in your betting. Take a breather?"

// High risk
"🚨 TILT ALERT! Time to step away, buddy. You've got this under control."

// Critical
"INTERVENTION NEEDED! Your account has been temporarily restricted."
```

### Betting Events
```javascript
// Big win
"🎉 Huge win! $150! Remember to set some aside for tomorrow."

// Big loss
"💔 Tough loss of $75. Remember, it's just variance. Stay strong!"

// Win streak
"🔥 5 wins in a row! You're on fire! Consider banking some profits."

// Session milestone
"⏰ You've been playing for 4 hours. How about a stretch?"
```

### Social Events
```javascript
// Tip received
"💰 You received a $25 tip from PokerPro2024! Message: 'Nice session!'"

// Challenge received
"⚔️ TiltMaster challenged you to a Quick Duel! Stakes: 50 respect points."

// Loan approved
"✅ Your loan application for $200 was approved! Funds available now."
```

## 🎨 Customization

### UI Themes
```css
/* Classic Windows 98 AIM style (default) */
.aim-buddy-list {
    background: #c0c0c0;
    border: 2px outset #c0c0c0;
    font-family: 'MS Sans Serif', sans-serif;
}

/* Modern dark theme (optional) */
.aim-buddy-list.dark {
    background: #2d2d2d;
    border: 2px solid #00ff88;
    color: #ffffff;
}
```

### Message Styles
```css
/* System messages */
.system-message {
    color: #0000ff;
    font-style: italic;
}

/* Tilt alerts */
.tilt-alert {
    background: rgba(255, 68, 68, 0.1);
    border-left: 3px solid #ff4444;
}
```

### Sound Customization
```javascript
// Replace default sounds
aimMessenger.sounds.message = new Audio('custom-notification.wav');
aimMessenger.sounds.buddyOnline = new Audio('custom-online.wav');

// Generate custom Web Audio sounds
const customSound = aimSoundGenerator.createBloopSound();
aimMessenger.sounds.custom = customSound;
```

## 📱 Message Templates

### Contextual Responses
The system includes intelligent response generation based on gambling context:

```javascript
const responses = [
    "Yeah, I feel you on that bet",
    "Been there, that's rough", 
    "Maybe take a break? That sounds tilted",
    "What's your bankroll looking like?",
    "I'm on a heater right now, up 3 units",
    "That variance is brutal",
    "Remember, it's +EV in the long run",
    "Want to rail my session?",
    "Just lost a flip for $500, ugh",
    "This game is so rigged lol",
    "Tilt protection activated for me",
    "Going to cash out and call it a night"
];
```

### Buddy Greetings
When buddies come online, they send contextual greetings:

```javascript
const greetings = [
    "Ready for another session?",
    "How'd yesterday go?",
    "Feeling lucky today?", 
    "Remember to set limits!",
    "Let's chase some wins responsibly!"
];
```

## 🔧 Advanced Features

### Desktop Notifications
```javascript
// Enable browser notifications
if ('Notification' in window) {
    Notification.requestPermission();
}

// Notifications appear for:
// - High priority tilt alerts
// - Challenge requests
// - Important system messages
```

### Conversation History
```javascript
// Access message history
const conversation = aimMessenger.conversations.get('TiltMaster');
console.log(conversation.messages);

// Save conversation
const history = conversation.messages.map(msg => ({
    sender: msg.sender,
    message: msg.message,
    timestamp: msg.timestamp
}));
```

### Buddy Management
```javascript
// Remove buddy
aimMessenger.removeBuddy('OldPlayer');

// Update buddy group
const buddy = aimMessenger.buddyList.get('TiltMaster');
buddy.group = 'gambling';
aimMessenger.updateBuddyListDisplay();
```

## 🎯 Integration with TiltCheck

### Event Triggers
The AIM system responds to TiltCheck events:

```javascript
// Tilt protection triggered
ipcRenderer.send('tilt-alert', { level: 'high' });

// Big betting event
ipcRenderer.send('betting-event', { 
    type: 'big-win', 
    amount: 250 
});

// Social interaction
ipcRenderer.send('social-event', { 
    type: 'tip-received', 
    user: 'PokerPro2024',
    details: { amount: 50 }
});
```

### Real-time Data
```javascript
// Listen for live updates
ipcRenderer.on('overlay-data-update', (event, data) => {
    // Update buddy statuses based on who's active
    // Trigger notifications for threshold breaches
    // Send contextual messages
});
```

## 🐛 Troubleshooting

### Sound Issues
```javascript
// Check if sounds are loaded
console.log('Sound loaded:', aimMessenger.sounds.message.readyState);

// Test sound playback
aimMessenger.sounds.message.play()
    .then(() => console.log('Sound played'))
    .catch(e => console.error('Sound failed:', e));
```

### Browser Compatibility
```javascript
// Check Web Audio API support
if (!window.AudioContext && !window.webkitAudioContext) {
    console.warn('Web Audio API not supported');
    // Fall back to HTML5 audio only
}
```

### Memory Management
```javascript
// Clear old conversations
aimMessenger.conversations.forEach((conv, username) => {
    if (conv.messages.length > 100) {
        conv.messages = conv.messages.slice(-50); // Keep last 50
    }
});
```

## 🎨 Demo Mode

To see the AIM system in action with simulated events:

```html
<!-- Add ?demo=true to the overlay URL -->
http://localhost:3000/overlay.html?demo=true
```

This will trigger:
- Simulated tilt alerts
- Mock betting events  
- Fake social interactions
- Buddy status changes

## 🚀 Production Usage

### Real Environment Setup
1. Remove demo mode simulation
2. Connect to live TiltCheck events
3. Configure real buddy lists from Discord
4. Set up proper notification permissions

### Performance Optimization
```javascript
// Limit notification queue
if (notificationQueue.length > 20) {
    notificationQueue = notificationQueue.slice(-10);
}

// Throttle sound playback
const lastSoundTime = new Map();
function playThrottledSound(soundType) {
    const now = Date.now();
    const lastTime = lastSoundTime.get(soundType) || 0;
    
    if (now - lastTime > 1000) { // 1 second throttle
        aimMessenger.playNotificationSound(soundType);
        lastSoundTime.set(soundType, now);
    }
}
```

Your AIM-style instant messenger is now fully integrated with the TiltCheck overlay! 🎯🎵

The system provides a nostalgic yet functional communication layer that enhances the gambling protection experience with classic sounds and social features.
