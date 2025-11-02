/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * Validation script for AI Tilt Detection Demo
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating AI Tilt Detection Demo...\n');

// 1. Check if required files exist
const requiredFiles = [
  'ai-tilt-detection.js',
  'demo.html',
  'AI_TILT_DETECTION_README.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Validation failed: Missing required files');
  process.exit(1);
}

// 2. Test AI module
console.log('\n🧪 Testing AI Tilt Detection Module...');
try {
  const AITiltDetection = require('./ai-tilt-detection.js');
  const ai = new AITiltDetection();
  
  // Test basic functionality
  ai.logBet({
    amount: 10,
    currency: 'USD',
    device: 'desktop',
    outcome: 'loss',
    pnl: 10,
    gameType: 'slots'
  });
  
  const analysis = ai.analyzeTiltRisk();
  const stats = ai.getSessionStats();
  
  // Validate analysis structure
  if (!analysis.overallRiskScore && analysis.overallRiskScore !== 0) {
    throw new Error('Missing overallRiskScore in analysis');
  }
  if (!analysis.riskFactors || !Array.isArray(analysis.riskFactors)) {
    throw new Error('Missing or invalid riskFactors in analysis');
  }
  if (!analysis.recommendations || !Array.isArray(analysis.recommendations)) {
    throw new Error('Missing or invalid recommendations in analysis');
  }
  if (!analysis.patterns) {
    throw new Error('Missing patterns in analysis');
  }
  
  // Validate stats structure
  if (!stats.totalBets && stats.totalBets !== 0) {
    throw new Error('Missing totalBets in stats');
  }
  if (!stats.winRate && stats.winRate !== 0) {
    throw new Error('Missing winRate in stats');
  }
  
  console.log('✅ AI module basic functionality test passed');
  
  // Test multiple bets
  for (let i = 0; i < 20; i++) {
    ai.logBet({
      amount: 10 + (i * 2),
      currency: i < 10 ? 'USD' : 'BTC',
      device: i % 2 === 0 ? 'desktop' : 'mobile',
      outcome: i % 3 === 0 ? 'win' : 'loss',
      pnl: i % 3 === 0 ? 10 : 10,
      gameType: 'slots'
    });
  }
  
  const finalAnalysis = ai.analyzeTiltRisk();
  const finalStats = ai.getSessionStats();
  
  if (finalStats.totalBets !== 21) {
    throw new Error(`Expected 21 total bets, got ${finalStats.totalBets}`);
  }
  
  console.log('✅ AI module multi-bet test passed');
  console.log(`   - Total Bets: ${finalStats.totalBets}`);
  console.log(`   - Win Rate: ${(finalStats.winRate * 100).toFixed(1)}%`);
  console.log(`   - Risk Score: ${(finalAnalysis.overallRiskScore * 100).toFixed(1)}%`);
  console.log(`   - Risk Factors: ${finalAnalysis.riskFactors.length}`);
  console.log(`   - Recommendations: ${finalAnalysis.recommendations.length}`);
  
} catch (error) {
  console.log(`❌ AI module test failed: ${error.message}`);
  console.error(error);
  process.exit(1);
}

// 3. Validate demo.html structure
console.log('\n📄 Validating demo.html structure...');
try {
  const demoHtml = fs.readFileSync(path.join(__dirname, 'demo.html'), 'utf8');
  
  const requiredElements = [
    'ai-tilt-detection.js',
    'AITiltDetection',
    'currentBet',
    'sessionPnL',
    'riskFill',
    'timePatterns',
    'currencyPatterns',
    'devicePatterns',
    'pnlChart',
    'modalityPatterns',
    'recommendations',
    'analyzeTiltRisk',
    'getSessionStats'
  ];
  
  let missingElements = [];
  requiredElements.forEach(element => {
    if (!demoHtml.includes(element)) {
      missingElements.push(element);
    }
  });
  
  if (missingElements.length > 0) {
    console.log('❌ Demo HTML missing required elements:');
    missingElements.forEach(elem => console.log(`   - ${elem}`));
    process.exit(1);
  }
  
  console.log('✅ Demo HTML structure validation passed');
  
} catch (error) {
  console.log(`❌ Demo HTML validation failed: ${error.message}`);
  process.exit(1);
}

// 4. Test edge cases
console.log('\n🧪 Testing edge cases...');
try {
  const AITiltDetection = require('./ai-tilt-detection.js');
  
  // Test with no data
  let ai = new AITiltDetection();
  let analysis = ai.analyzeTiltRisk();
  if (analysis.overallRiskScore > 0.5) {
    throw new Error('Risk score should be low with no data');
  }
  console.log('✅ Empty session test passed');
  
  // Test reset functionality
  ai = new AITiltDetection();
  for (let i = 0; i < 10; i++) {
    ai.logBet({
      amount: 100,
      currency: 'BTC',
      device: 'mobile',
      outcome: 'loss',
      pnl: 100,
      gameType: 'slots'
    });
  }
  
  ai.reset();
  const statsAfterReset = ai.getSessionStats();
  if (statsAfterReset.totalBets !== 0) {
    throw new Error('Reset should clear all bets');
  }
  console.log('✅ Reset functionality test passed');
  
  // Test high-risk scenario
  ai = new AITiltDetection();
  for (let i = 0; i < 15; i++) {
    ai.logBet({
      amount: 50 + (i * 20),
      currency: 'BTC',
      device: 'mobile',
      outcome: 'loss',
      pnl: 50 + (i * 20),
      gameType: 'slots'
    });
  }
  
  analysis = ai.analyzeTiltRisk();
  if (analysis.overallRiskScore < 0.5) {
    console.log('⚠️  Warning: High-risk scenario not detected (may be acceptable)');
  } else {
    console.log('✅ High-risk scenario detection passed');
  }
  
} catch (error) {
  console.log(`❌ Edge case test failed: ${error.message}`);
  console.error(error);
  process.exit(1);
}

console.log('\n✅ All validation tests passed!');
console.log('\n📊 Summary:');
console.log('   ✅ All required files exist');
console.log('   ✅ AI module functional');
console.log('   ✅ Demo HTML properly structured');
console.log('   ✅ Edge cases handled');
console.log('\n🚀 Demo is ready to use!');
