// Solscan API Test Script
// This demonstrates how to use axios with query parameters for Solscan API

import axios from 'axios';

const SOLSCAN_API_KEY = '3Xz9f28vCVyh3BLc7W9DtqaXUoVpSqtztNwwRdBuRus1';
const PAYMENT_SIGNER = 'TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E';

// Test 1: Get last transactions (general endpoint)
const testLastTransactions = async () => {
    console.log('🔍 Testing: Get Last Transactions');
    const requestOptions = {
        method: "get",
        url: "https://pro-api.solscan.io/v2.0/transaction/last",
        headers: {
            'Authorization': `Bearer ${SOLSCAN_API_KEY}`,
            'Content-Type': 'application/json'
        },
        params: {
            limit: "10",
            filter: "all",
        },
    };

    try {
        const response = await axios.request(requestOptions);
        console.log('✅ Success:', response.data);
    } catch (err) {
        console.error('❌ Error:', err.response?.data || err.message);
    }
    console.log('');
};

// Test 2: Get account balance with query parameters
const testAccountBalance = async () => {
    console.log('💰 Testing: Account Balance with Query Parameters');
    const requestOptions = {
        method: "get",
        url: "https://pro-api.solscan.io/v2.0/account/balance",
        headers: {
            'Authorization': `Bearer ${SOLSCAN_API_KEY}`,
            'Content-Type': 'application/json'
        },
        params: {
            address: PAYMENT_SIGNER,
            commitment: "finalized"
        },
    };

    try {
        const response = await axios.request(requestOptions);
        console.log('✅ Success:', response.data);
    } catch (err) {
        console.error('❌ Error:', err.response?.data || err.message);
    }
    console.log('');
};

// Test 3: Get account transactions with all query parameters
const testAccountTransactions = async () => {
    console.log('📊 Testing: Account Transactions with Full Query Parameters');
    const requestOptions = {
        method: "get",
        url: "https://pro-api.solscan.io/v2.0/account/transactions",
        headers: {
            'Authorization': `Bearer ${SOLSCAN_API_KEY}`,
            'Content-Type': 'application/json'
        },
        params: {
            address: PAYMENT_SIGNER,
            limit: 50,
            commitment: "finalized",
            exclude_vote: true,
            exclude_failed: false
        },
    };

    try {
        const response = await axios.request(requestOptions);
        console.log('✅ Success:', response.data);
    } catch (err) {
        console.error('❌ Error:', err.response?.data || err.message);
    }
    console.log('');
};

// Test 4: Get transaction detail with parameters
const testTransactionDetail = async (signature) => {
    console.log('🔍 Testing: Transaction Detail with Query Parameters');
    const requestOptions = {
        method: "get",
        url: "https://pro-api.solscan.io/v2.0/transaction/detail",
        headers: {
            'Authorization': `Bearer ${SOLSCAN_API_KEY}`,
            'Content-Type': 'application/json'
        },
        params: {
            signature: signature,
            commitment: "finalized",
            maxSupportedTransactionVersion: 0
        },
    };

    try {
        const response = await axios.request(requestOptions);
        console.log('✅ Success:', response.data);
    } catch (err) {
        console.error('❌ Error:', err.response?.data || err.message);
    }
    console.log('');
};

// Run all tests
const runAllTests = async () => {
    console.log('🚀 Starting Solscan API Query Parameter Tests\n');
    
    await testLastTransactions();
    await testAccountBalance();
    await testAccountTransactions();
    await testTransactionDetail(PAYMENT_SIGNER); // Using signer as signature for demo
    
    console.log('✅ All tests completed!');
};

// Export for use in other files
export {
    testLastTransactions,
    testAccountBalance,
    testAccountTransactions,
    testTransactionDetail,
    runAllTests
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests();
}
