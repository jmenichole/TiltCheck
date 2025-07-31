# TrapHouse Dashboard Overlay Installation Guide

## 🎮 Installable Desktop Application

The TrapHouse Dashboard Overlay is now a fully installable desktop application that provides an AIM-style always-on-top interface for real-time monitoring of TiltCheck, JustTheTip wallet, and verification status.

## ✨ Features

### 🔄 Always-On-Top Overlay
- **Transparent Design**: AIM-style interface with glassmorphism effects
- **Overlay Mode**: Stays above all other applications
- **Draggable Interface**: Move the overlay anywhere on screen
- **System Tray Integration**: Minimize to system tray for quick access

### 🛡️ Real-Time Monitoring
- **TiltCheck Integration**: Live risk assessment and session monitoring
- **JustTheTip Wallet**: Real-time balance and transaction history
- **Verification Status**: Trust level and compliance scores
- **Notifications**: Live alerts for tips, warnings, and system updates

### ⌨️ Global Shortcuts
- `Ctrl+Shift+T` (Cmd+Shift+T on Mac): Toggle overlay visibility
- `Ctrl+Shift+D` (Cmd+Shift+D on Mac): Show main dashboard
- `Ctrl+Shift+Q` (Cmd+Shift+Q on Mac): TiltCheck quick view
- `Ctrl+Shift+W` (Cmd+Shift+W on Mac): Wallet quick view

### 🎯 Quick Actions
- **Fast Tipping**: Send tips directly from overlay
- **Risk Monitoring**: Real-time gambling session tracking
- **Interactive Mode**: Toggle mouse interaction on/off
- **Quick Panel Access**: Instant access to specific tools

## 📦 Installation

### Prerequisites
```bash
# Install Node.js and npm
# Visit: https://nodejs.org/

# Install Electron globally (optional)
npm install -g electron
```

### 🚀 Quick Start
```bash
# Navigate to project directory
cd /Users/fullsail/Desktop/traphouse_discordbot

# Install dependencies
npm install electron electron-builder --save-dev
npm install axios ws --save

# Copy electron package configuration
cp electron-package.json package-electron.json

# Start the application
npm run start:overlay
```

### 📋 Development Mode
```bash
# Run with debug logging
electron dashboard/TrapHouseDashboardOverlay.js --enable-logging

# Or use the npm script
npm run dev:overlay
```

### 🏗️ Building Installers

#### macOS
```bash
# Build for macOS (creates .dmg)
npm run build-mac

# Output: dist/TrapHouse Dashboard Overlay-1.0.0.dmg
```

#### Windows
```bash
# Build for Windows (creates .exe installer)
npm run build-win

# Output: dist/TrapHouse Dashboard Overlay Setup 1.0.0.exe
```

#### Linux
```bash
# Build for Linux (creates AppImage)
npm run build-linux

# Output: dist/TrapHouse Dashboard Overlay-1.0.0.AppImage
```

## 🔧 Configuration

### Environment Setup
Create `.env` file in the dashboard directory:
```env
# TiltCheck API Configuration
TILTCHECK_API_URL=https://api.tiltcheck.com
TILTCHECK_API_KEY=your_api_key_here

# JustTheTip Wallet Configuration
JUSTTHETIP_API_URL=https://api.justthetip.com
JUSTTHETIP_WALLET_ID=your_wallet_id_here

# Dashboard Configuration
OVERLAY_POSITION_X=1260
OVERLAY_POSITION_Y=20
UPDATE_INTERVAL=5000
NOTIFICATION_TIMEOUT=10000
```

### Custom Styling
Edit `dashboard/overlay.html` to customize the AIM-style appearance:
- **Colors**: Modify CSS gradients and color schemes
- **Layout**: Adjust widget positions and sizes
- **Animations**: Add or modify transition effects
- **Branding**: Add custom logos and icons

## 🎛️ Usage

### Initial Setup
1. **Launch Application**: Run the overlay application
2. **System Tray**: Look for the TrapHouse icon in your system tray
3. **First Run**: The overlay will appear in the top-right corner
4. **Position**: Drag the overlay to your preferred location

### Daily Usage
1. **Background Operation**: App runs continuously in system tray
2. **Quick Access**: Click tray icon to toggle overlay
3. **Notifications**: Real-time alerts appear in the overlay
4. **Quick Actions**: Use overlay buttons for fast operations

### System Tray Menu
- ✅ **Show Overlay**: Toggle overlay visibility
- 🎮 **Show Dashboard**: Open main dashboard window
- 🛡️ **TiltCheck Quick View**: Highlight TiltCheck widget
- 💰 **Wallet Balance**: Show wallet information
- ⚙️ **Settings**: Configuration options
- ❌ **Exit**: Close application

## 🔐 Security Features

### Data Protection
- **Local Storage**: All sensitive data stored locally
- **Encrypted Communication**: API calls use HTTPS/WSS
- **No Data Collection**: No telemetry or tracking
- **Secure Wallet Integration**: Multi-signature transaction support

### Privacy Controls
- **Overlay Hiding**: Quick hide functionality
- **Interaction Lock**: Disable mouse events when needed
- **Minimal Footprint**: Low resource usage
- **Secure Auto-Lock**: Automatic security features

## 🛠️ Advanced Features

### Developer Mode
```bash
# Enable developer tools
electron dashboard/TrapHouseDashboardOverlay.js --enable-dev-tools

# Console logging
console.log('Overlay data:', dashboardData);
```

### Custom Integrations
The overlay supports custom integrations through the IPC system:
```javascript
// Send custom data to overlay
ipcRenderer.send('custom-data-update', {
    customWidget: {
        title: 'Custom Tool',
        value: 'Active',
        status: 'success'
    }
});
```

### Plugin System
Extend functionality with custom plugins:
```javascript
// dashboard/plugins/custom-plugin.js
class CustomPlugin {
    constructor(overlay) {
        this.overlay = overlay;
    }
    
    initialize() {
        // Custom plugin initialization
    }
}
```

## 📱 Mobile Companion (Future)
- **Remote Control**: Control overlay from mobile device
- **Push Notifications**: Receive alerts on phone
- **Quick Actions**: Send tips and commands remotely

## 🔄 Auto-Updates
- **Background Updates**: Automatic update checking
- **Seamless Installation**: Install updates without interruption
- **Version Control**: Rollback to previous versions if needed

## 🆘 Troubleshooting

### Common Issues

#### Overlay Not Appearing
```bash
# Check if Electron is installed
electron --version

# Verify file paths
ls dashboard/TrapHouseDashboardOverlay.js
ls dashboard/overlay.html
```

#### System Tray Icon Missing
- **macOS**: Check System Preferences → Dock & Menu Bar
- **Windows**: Check notification area settings
- **Linux**: Verify system tray support

#### Performance Issues
```bash
# Reduce update frequency
# Edit TrapHouseDashboardOverlay.js
setInterval(() => {
    this.updateDashboardData();
}, 60000); // Increase to 60 seconds
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* electron dashboard/TrapHouseDashboardOverlay.js
```

## 🚀 Getting Started Checklist

- [ ] Install Node.js and npm
- [ ] Install Electron dependencies
- [ ] Configure API keys in .env file
- [ ] Run the overlay application
- [ ] Position overlay on screen
- [ ] Test global shortcuts
- [ ] Verify system tray functionality
- [ ] Test tip sending functionality
- [ ] Configure notification preferences
- [ ] Set up auto-start (optional)

## 🎯 Next Steps

1. **Customize Interface**: Modify colors and layout to your preference
2. **Set Up Integrations**: Connect TiltCheck and JustTheTip APIs
3. **Configure Notifications**: Set up alert preferences
4. **Build Installer**: Create distributable packages
5. **Deploy to Team**: Share with other users

The TrapHouse Dashboard Overlay is now ready for installation and use as a fully-featured desktop application with AIM-style overlay capabilities!
