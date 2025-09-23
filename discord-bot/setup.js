#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 TiltCheck Discord Bot Setup');
console.log('============================\n');

async function setupBot() {
  try {
    // Check if .env already exists
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      console.log('⚠️  .env file already exists. This will overwrite it.');
      const overwrite = await question('Continue? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    console.log('📝 Please provide the following information:\n');

    // Collect bot configuration
    const botToken = await question('Discord Bot Token: ');
    if (!botToken) {
      console.log('❌ Bot token is required!');
      process.exit(1);
    }

    const channelId = await question('Discord Channel ID (optional): ');
    const webhookUrl = await question('Discord Webhook URL (optional): ');

    // Create .env file
    const envContent = `# TiltCheck Discord Bot Configuration
DISCORD_BOT_TOKEN=${botToken}
DISCORD_CHANNEL_ID=${channelId}
DISCORD_WEBHOOK_URL=${webhookUrl}

# TiltCheck API Configuration
TILTCHECK_API_KEY=demo-api-key
TILTCHECK_BASE_URL=https://api.tiltcheck.io

# Bot Settings
BOT_PREFIX=!
BOT_NAME=TiltCheck Assistant

# Alert Configuration
ALERT_COOLDOWN=300000
MAX_ALERTS_PER_MINUTE=5
ENABLE_AUTO_MODERATION=true

# Monitoring Settings
MONITORING_INTERVAL=30000
WEBHOOK_RETRY_ATTEMPTS=3
LOG_LEVEL=info
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to .env');

    // Install Discord.js if not already installed
    console.log('\n📦 Checking dependencies...');
    
    const packageJson = require('../package.json');
    if (!packageJson.dependencies['discord.js']) {
      console.log('Installing discord.js...');
      const { exec } = require('child_process');
      await new Promise((resolve, reject) => {
        exec('npm install discord.js dotenv', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Failed to install dependencies:', error);
            reject(error);
          } else {
            console.log('✅ Dependencies installed');
            resolve();
          }
        });
      });
    }

    console.log('\n🎉 Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Invite your bot to your Discord server');
    console.log('2. Run: npm run discord-bot');
    console.log('3. Test with: /tilt-status in your Discord server\n');
    
    console.log('📚 Need help? Check the README.md for detailed instructions.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Run setup if called directly
if (require.main === module) {
  setupBot();
}

module.exports = { setupBot };