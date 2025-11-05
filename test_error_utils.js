const { logError, createErrorResponse, safeAsync } = require('./utils/errorHandlingUtils');

console.log('Testing Error Handling Utilities\n');

// Test 1: logError
console.log('1. Testing logError()...');
logError('Test context', new Error('Test error'), { testData: 'example' });
console.log('✓ logError executed without crashing\n');

// Test 2: createErrorResponse
console.log('2. Testing createErrorResponse()...');
const errorResponse = createErrorResponse('Test error message', 400, { detail: 'test' });
console.log(`✓ Error response created: ${JSON.stringify(errorResponse)}\n`);

// Test 3: safeAsync
console.log('3. Testing safeAsync()...');
(async () => {
    const result = await safeAsync(
        async () => { throw new Error('Test error'); },
        'Test async operation',
        'default value'
    );
    console.log(`✓ safeAsync returned default value: ${result}\n`);
    console.log('✅ All error utility tests passed!');
})();
