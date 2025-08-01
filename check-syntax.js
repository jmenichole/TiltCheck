const fs = require('fs');

console.log('🔍 Checking for syntax errors in main files...');

const filesToCheck = [
    'index.js',
    'package.json',
    '.env',
    'railway.json'
];

filesToCheck.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            if (file.endsWith('.js')) {
                // Check JavaScript syntax
                require(`./${file}`);
                console.log(`✅ ${file} - Syntax OK`);
            } else if (file.endsWith('.json')) {
                // Check JSON syntax
                JSON.parse(fs.readFileSync(file, 'utf8'));
                console.log(`✅ ${file} - Valid JSON`);
            } else {
                console.log(`✅ ${file} - File exists`);
            }
        } else {
            console.log(`❌ ${file} - File not found`);
        }
    } catch (error) {
        console.log(`❌ ${file} - Error: ${error.message}`);
    }
});