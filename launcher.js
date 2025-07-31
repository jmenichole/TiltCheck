require('dotenv').config();

// Theme Selection Script
// Choose which version of your bot to run

const themes = {
    traphouse: {
        name: 'TrapHouse Discord Bot',
        description: 'Street-themed marketplace with respect system and Degens Against Decency card game',
        file: './index.js',
        emoji: '🏠'
    },
    tiltcheck: {
        name: 'Tilt Check Casino Bot',
        description: 'Poker/gambling-themed with tilt management and emotional control features',
        file: './tiltCheckBot.js',
        emoji: '🎰'
    },
    justthetip: {
        name: 'JustTheTip Smart Crypto Assistant',
        description: 'Enhanced TrapHouse with smart crypto tipping, vault suggestions, and accountability buddy system',
        file: './index.js',
        emoji: '💡'
    }
};

function showThemeSelection() {
    console.log('\n🎮 ═══════════════════════════════════════════════════════════════');
    console.log('   BOT THEME SELECTOR - Choose Your Discord Bot Experience');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    Object.entries(themes).forEach(([key, theme], index) => {
        console.log(`${index + 1}. ${theme.emoji} ${theme.name}`);
        console.log(`   ${theme.description}\n`);
    });
    
    console.log('Available Commands:');
    console.log('• node launcher.js traphouse   - Run TrapHouse theme');
    console.log('• node launcher.js tiltcheck   - Run Tilt Check theme');
    console.log('• node launcher.js justthetip  - Run JustTheTip integration (recommended!)');
    console.log('• node launcher.js             - Show this menu\n');
}

function launchTheme(themeName) {
    const theme = themes[themeName];
    
    if (!theme) {
        console.log('❌ Invalid theme! Available themes: traphouse, tiltcheck, justthetip');
        showThemeSelection();
        return;
    }
    
    console.log(`\n🚀 Launching ${theme.emoji} ${theme.name}...`);
    console.log(`📝 ${theme.description}\n`);
    
    try {
        require(theme.file);
    } catch (error) {
        console.error(`❌ Failed to launch ${theme.name}:`, error.message);
    }
}

// Main execution
const selectedTheme = process.argv[2];

if (selectedTheme) {
    launchTheme(selectedTheme);
} else {
    showThemeSelection();
}

module.exports = { themes, launchTheme };
