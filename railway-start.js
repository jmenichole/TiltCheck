require('dotenv').config();

console.log('🚂 Railway Startup Script');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT || 3000);
console.log('Bot Type:', process.env.CURRENT_BOT || 'TRAPHOUSE');

// Start the main application
try {
    require('./index.js');
} catch (error) {
    console.error('❌ Failed to start main application:', error);
    process.exit(1);
}