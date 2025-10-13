#!/bin/bash
#
# Copyright (c) 2024-2025 JME (jmenichole)
# All Rights Reserved
# 
# PROPRIETARY AND CONFIDENTIAL
# Unauthorized copying of this file, via any medium, is strictly prohibited.
# 
# This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
# For licensing information, see LICENSE file in the root directory.
#


# TiltCheck NPM Error Fix Script
# This script fixes npm issues and ensures proper project setup

echo "🔧 TiltCheck NPM Error Fix"
echo "=========================="

# Navigate to the correct directory
WEBAPP_DIR="/Users/fullsail/tiltcheck/tiltcheck-organized/webapp"
cd "$WEBAPP_DIR" || exit 1

echo "📍 Current Directory: $(pwd)"

# Check if we have the right files
echo ""
echo "📋 File Check:"
if [ -f "package.json" ]; then
    echo "   ✅ package.json found"
else
    echo "   ❌ package.json missing - creating..."
    
    # Create package.json
    cat > package.json << 'EOF'
{
  "name": "tiltcheck-webapp",
  "version": "2.0.0",
  "private": true,
  "description": "TiltCheck React Web Application - Responsible gambling prevention dashboard",
  "homepage": "https://tiltcheck.com",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "styled-components": "^5.3.0",
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0",
    "chart.js": "^4.2.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.29.0",
    "web-vitals": "^3.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "react-scripts start",
    "serve": "serve -s build"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.0",
    "serve": "^14.2.0"
  },
  "proxy": "http://localhost:3001"
}
EOF
    echo "   ✅ package.json created"
fi

# Check src directory
if [ -d "src" ]; then
    echo "   ✅ src directory found"
else
    echo "   ❌ src directory missing - creating..."
    mkdir -p src
    echo "   ✅ src directory created"
fi

# Check public directory
if [ -d "public" ]; then
    echo "   ✅ public directory found"
else
    echo "   ❌ public directory missing - creating..."
    mkdir -p public
    echo "   ✅ public directory created"
fi

# Create index.html if missing
if [ ! -f "public/index.html" ]; then
    echo "   Creating public/index.html..."
    cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="TiltCheck - AI-powered responsible gambling prevention platform" />
    <title>TiltCheck - Responsible Gaming Dashboard</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF
    echo "   ✅ public/index.html created"
fi

# Create basic index.js if missing
if [ ! -f "src/index.js" ]; then
    echo "   Creating src/index.js..."
    cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
    echo "   ✅ src/index.js created"
fi

# Create basic App.js if missing or problematic
if [ ! -f "src/App.js" ] || ! grep -q "function App" src/App.js; then
    echo "   Creating/fixing src/App.js..."
    cat > src/App.js << 'EOF'
import React from 'react';
import './index.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🛡️ TiltCheck</h1>
        <h2>Responsible Gaming Dashboard</h2>
        <p>AI-powered gambling addiction prevention platform</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🎯 Real-time Monitoring</h3>
            <p>AI-powered tilt detection and behavioral analysis</p>
          </div>
          
          <div className="feature-card">
            <h3>🚨 Instant Interventions</h3>
            <p>Immediate support when risky behavior is detected</p>
          </div>
          
          <div className="feature-card">
            <h3>💰 Alternative Earning</h3>
            <p>QualifyFirst survey integration for healthy income</p>
          </div>
          
          <div className="feature-card">
            <h3>🤝 Community Support</h3>
            <p>Social accountability and peer support system</p>
          </div>
        </div>
        
        <div className="cta-section">
          <button className="cta-button">Get Chrome Extension</button>
          <button className="cta-button secondary">Join Community</button>
        </div>
      </header>
    </div>
  );
}

export default App;
EOF
    echo "   ✅ src/App.js created"
fi

# Create basic CSS if missing
if [ ! -f "src/index.css" ]; then
    echo "   Creating src/index.css..."
    cat > src/index.css << 'EOF'
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.App {
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 20px;
}

.App-header {
  max-width: 1200px;
  width: 100%;
}

.App-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.App-header h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 400;
  opacity: 0.9;
}

.App-header p {
  font-size: 1.1rem;
  margin-bottom: 3rem;
  opacity: 0.8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  width: 100%;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.feature-card p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

.cta-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.cta-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.cta-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.cta-button.secondary {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .App-header h1 {
    font-size: 2rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .cta-section {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-button {
    width: 200px;
  }
}
EOF
    echo "   ✅ src/index.css created"
fi

# Clean npm cache and install
echo ""
echo "🧹 Cleaning npm cache..."
npm cache clean --force

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Starting development server..."
echo "   - React app will open at http://localhost:3000"
echo "   - Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm start