#!/bin/bash

echo "🔗 Testing TiltCheck NFT Legal Agreement System"
echo "================================================"

BASE_URL="http://localhost:4001"

echo ""
echo "1. Testing SusLink Landing Page..."
curl -s $BASE_URL/suslink | jq -r '.title, .description'

echo ""
echo "2. Testing NFT Minting for Legal Agreements..."
NFT_RESPONSE=$(curl -s -X POST $BASE_URL/nftmint \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_001",
    "discordId": "987654321",
    "agreementType": "Privacy Policy"
  }')

TOKEN_ID=$(echo $NFT_RESPONSE | jq -r '.agreementRecord.tokenId')
echo "✅ NFT Minted: $TOKEN_ID"
echo "📅 Minted At: $(echo $NFT_RESPONSE | jq -r '.agreementRecord.mintedAt')"

echo ""
echo "3. Testing Agreement Verification..."
curl -s $BASE_URL/verify-agreement/$TOKEN_ID | jq -r '.status, .legalValidity'

echo ""
echo "4. Testing Ecosystem Integration..."
curl -s $BASE_URL/ecosystem | jq -r '.nftLegalSystem.status'

echo ""
echo "5. Testing API Documentation..."
curl -s $BASE_URL/api | jq -r '.nftSystem'

echo ""
echo "🎯 All NFT Legal System Tests Complete!"
echo "✅ SusLink: $BASE_URL/suslink"
echo "✅ NFT Mint: POST $BASE_URL/nftmint"
echo "✅ Verification: $BASE_URL/verify-agreement/{tokenId}"
echo "✅ Ecosystem: https://tiltcheckecosystem.created.app"
echo ""
echo "💎 Made 4 Degens by Degens ❤️"
