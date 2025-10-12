/**
 * Copyright (c) 2024-2025 JME (jmenichole)
 * All Rights Reserved
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * 
 * This file is part of TiltCheck/TrapHouse Discord Bot ecosystem.
 * For licensing information, see LICENSE file in the root directory.
 */

const axios = require('axios');

const requestOptions = {
  method: "get",
  url: "https://pro-api.solscan.io/v2.0/transaction/last",
  params: {
    limit: "10",
    filter: "all",
  },
  headers: {
    token: "jeFxyc-kikdiw-8rekne"
  },
}

console.log('🔍 Testing Solscan API with new token...');
console.log('Token:', requestOptions.headers.token);
console.log('URL:', requestOptions.url);
console.log('');

axios
  .request(requestOptions)
  .then(response => {
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(err => {
    console.error('❌ Error:');
    console.error('Status:', err.response?.status);
    console.error('Data:', err.response?.data);
    console.error('Message:', err.message);
  });
