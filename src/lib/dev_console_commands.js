testYourTransaction(); testYourTransaction(); // 🔍 Solscan Pro API - Browser Dev Console Commands
// Copy and paste these into your browser console at pro-api.solscan.io

console.log('🚀 Solscan Pro API Dev Console Commands');
console.log('=====================================');

// Your current configuration
const API_KEY = 'jeFxyc-kikdiw-8rekne';
const PAYMENT_SIGNER = 'TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E';

// 1. Test API Key validity
console.log('\n📋 Test 1: Check API Key');
fetch('https://pro-api.solscan.io/v2.0/transaction/last?limit=3', {
    headers: {
        'token': API_KEY
    }
})
.then(response => response.json())
.then(data => console.log('✅ API Key Test:', data))
.catch(error => console.error('❌ API Key Error:', error));

// 2. Test with Bearer token format
console.log('\n📋 Test 2: Bearer Token Format');
fetch('https://pro-api.solscan.io/v2.0/transaction/last?limit=3', {
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log('✅ Bearer Token Test:', data))
.catch(error => console.error('❌ Bearer Token Error:', error));

// 3. Test account balance with query parameters
console.log('\n📋 Test 3: Account Balance with Query Parameters');
const balanceUrl = new URL('https://pro-api.solscan.io/v2.0/account/balance');
balanceUrl.searchParams.append('address', PAYMENT_SIGNER);
balanceUrl.searchParams.append('commitment', 'finalized');

fetch(balanceUrl, {
    headers: { 'token': API_KEY }
})
.then(response => response.json())
.then(data => console.log('✅ Balance Test:', data))
.catch(error => console.error('❌ Balance Error:', error));

// 4. Test account transactions with full query parameters
console.log('\n📋 Test 4: Account Transactions with All Parameters');
const txUrl = new URL('https://pro-api.solscan.io/v2.0/account/transactions');
txUrl.searchParams.append('address', PAYMENT_SIGNER);
txUrl.searchParams.append('limit', '10');
txUrl.searchParams.append('commitment', 'finalized');
txUrl.searchParams.append('exclude_vote', 'true');
txUrl.searchParams.append('exclude_failed', 'false');

fetch(txUrl, {
    headers: { 'token': API_KEY }
})
.then(response => response.json())
.then(data => console.log('✅ Transactions Test:', data))
.catch(error => console.error('❌ Transactions Error:', error));

// 5. Test token holdings
console.log('\n📋 Test 5: Token Holdings');
const tokenUrl = new URL('https://pro-api.solscan.io/v2.0/account/token-holdings');
tokenUrl.searchParams.append('address', PAYMENT_SIGNER);
tokenUrl.searchParams.append('commitment', 'finalized');

fetch(tokenUrl, {
    headers: { 'token': API_KEY }
})
.then(response => response.json())
.then(data => console.log('✅ Token Holdings Test:', data))
.catch(error => console.error('❌ Token Holdings Error:', error));

// 6. Interactive function to test any transaction signature (async version)
window.testTransaction = async function(signature) {
    console.log(`\n🔍 Testing Transaction: ${signature}`);
    const txDetailUrl = new URL('https://pro-api.solscan.io/v2.0/transaction/detail');
    txDetailUrl.searchParams.append('signature', signature);
    txDetailUrl.searchParams.append('commitment', 'finalized');
    txDetailUrl.searchParams.append('maxSupportedTransactionVersion', '0');
    
    try {
        const response = await fetch(txDetailUrl, {
            headers: { 'token': API_KEY }
        });
        const data = await response.json();
        console.log('✅ Transaction Detail Status:', response.status);
        console.log('📊 Transaction Detail Data:', data);
        return data;
    } catch (error) {
        console.error('❌ Transaction Error:', error);
        return error;
    }
};

// 7. Helper function to build query strings
window.buildQuery = function(endpoint, params) {
    const url = new URL(`https://pro-api.solscan.io/v2.0/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    console.log('🔗 Built URL:', url.toString());
    return url.toString();
};

// 8. Quick test function with better Promise handling
window.quickTest = async function() {
    console.log('\n🚀 Running Quick API Tests...');
    
    // Test different header formats
    const tests = [
        { name: 'token header', headers: { 'token': API_KEY } },
        { name: 'Bearer token', headers: { 'Authorization': `Bearer ${API_KEY}` } },
        { name: 'X-API-KEY', headers: { 'X-API-KEY': API_KEY } }
    ];
    
    for (const test of tests) {
        try {
            console.log(`\n🔍 Testing ${test.name}...`);
            const response = await fetch('https://pro-api.solscan.io/v2.0/transaction/last?limit=1', {
                headers: test.headers
            });
            const data = await response.json();
            console.log(`✅ ${test.name} Status:`, response.status);
            console.log(`📊 ${test.name} Data:`, data);
        } catch (error) {
            console.error(`❌ ${test.name} Error:`, error);
        }
    }
    return 'All tests completed!';
};

console.log('\n💡 Available Functions:');
console.log('testTransaction("your_signature_here") - Test specific transaction (async)');
console.log('buildQuery("endpoint", {param: "value"}) - Build API URLs');
console.log('quickTest() - Run all header format tests (async)');
console.log('simpleTest() - Run a simple API test (returns Promise)');
console.log('testBalance() - Test account balance');
console.log('testYourTransaction() - Test your specific Solana transaction');
console.log('\n🎯 Your API Key:', API_KEY);
console.log('🎯 Your Payment Signer:', PAYMENT_SIGNER);

// 9. Simple test that works well in console
window.simpleTest = function() {
    console.log('\n🔍 Simple API Test...');
    return fetch('https://pro-api.solscan.io/v2.0/transaction/last?limit=1', {
        headers: { 'token': API_KEY }
    })
    .then(response => {
        console.log('📊 Response Status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📊 Response Data:', data);
        return data;
    })
    .catch(error => {
        console.error('❌ Error:', error);
        return error;
    });
};

// 10. Test account balance easily
window.testBalance = function() {
    console.log('\n💰 Testing Account Balance...');
    const url = `https://pro-api.solscan.io/v2.0/account/balance?address=${PAYMENT_SIGNER}&commitment=finalized`;
    return fetch(url, {
        headers: { 'token': API_KEY }
    })
    .then(response => {
        console.log('📊 Balance Status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📊 Balance Data:', data);
        return data;
    });
};

// 11. Test your specific transaction
window.testYourTransaction = function() {
    const signature = '47ZFxqUYYeiWSn6EtFW7swgnJ4Ksa3gXPBJJLBwH8rTF43aHytMs8q7Xs2e3y9XKsXfSQipoMDMVnG6Ag9pdGD9J';
    console.log('\n🔍 Testing Your Specific Transaction...');
    console.log('📝 Signature:', signature);
    
    const url = `https://pro-api.solscan.io/v2.0/transaction/detail?signature=${signature}&commitment=finalized&maxSupportedTransactionVersion=0`;
    console.log('🔗 URL:', url);
    
    return fetch(url, {
        headers: { 'token': API_KEY }
    })
    .then(response => {
        console.log('📊 Transaction Status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('📊 Transaction Data:', data);
        if (data.result) {
            console.log('✅ Transaction Found!');
            console.log('💰 Amount:', data.result.meta?.postBalances || 'N/A');
            console.log('📍 From/To addresses:', data.result.transaction?.message?.accountKeys?.slice(0, 2) || 'N/A');
        }
        return data;
    })
    .catch(error => {
        console.error('❌ Transaction Error:', error);
        return error;
    });
};
