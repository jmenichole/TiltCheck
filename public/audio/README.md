# TiltCheck Audio Files

This directory contains audio files for the TiltCheck platform.

## 🎉 Special Thanks

**redeem-alert.wav** - Created by Discord user **blackjackson** as a degen contribution to the TiltCheck project! This plays when alerts are resolved with that satisfying "HECK YEAH!" moment.

## Audio Files

### Required Files:
- `redeem-alert.wav` - The legendary sound by blackjackson for successful alert resolution
- `tilt-warning.wav` - Warning sound for tilt detection
- `intervention-success.wav` - Success sound for interventions
- `notification.wav` - General notification sound

### Usage:
The sounds are automatically loaded by the SoundManager utility and played during:
- **Alert Resolution**: `redeem-alert.wav` by blackjackson 🎉
- **Tilt Detection**: `tilt-warning.wav` ⚠️
- **Successful Intervention**: `intervention-success.wav` ✅
- **General Notifications**: `notification.wav` 🔔

### Adding the redeem-alert.wav File:
1. Place `redeem-alert.wav` by blackjackson in this directory
2. The file will be automatically detected and loaded by the SoundManager
3. Test with the sound toggle button in the Alert Panel
4. Use browser console: `TiltCheckSounds.testAllSounds()` to test all sounds

### Browser Compatibility:
- Uses Web Audio API for best performance
- Falls back to HTML5 Audio if needed
- Requires user interaction before first sound (browser security)

## Credits
- **blackjackson** - Discord user who contributed the epic redeem-alert.wav
- Made with ❤️ for the degen community