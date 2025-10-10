# Solscan API Query Parameters Guide

## 🌐 **Base API URL**
```
https://pro-api.solscan.io/v2.0
```

## 🔑 **Authentication**
```bash
# Header required for Pro API access
Authorization: Bearer YOUR_API_KEY

# Content-Type for all requests
Content-Type: application/json
```

## 📋 **Available Endpoints & Parameters**

### 1. **Transaction Detail** - `/transaction/detail`
Get detailed information about a specific transaction.

**Method:** `GET`

**Required Parameters:**
- `signature` (string) - Transaction signature hash

**Optional Parameters:**
- `commitment` (string) - Commitment level: `finalized`, `confirmed`, `processed`
- `maxSupportedTransactionVersion` (number) - Max transaction version (0 or legacy)

**Example:**
```bash
curl --request GET \
     --url 'https://pro-api.solscan.io/v2.0/transaction/detail?signature=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&commitment=finalized' \
     --header 'Content-Type: application/json' \
     --header 'Authorization: Bearer YOUR_API_KEY'
```

### 2. **Account Transactions** - `/account/transactions`
Get transactions for a specific account/address.

**Method:** `GET`

**Required Parameters:**
- `address` (string) - Account address

**Optional Parameters:**
- `limit` (number) - Number of transactions to return (default: 50, max: 100)
- `before` (string) - Transaction signature to paginate before
- `after` (string) - Transaction signature to paginate after
- `commitment` (string) - Commitment level: `finalized`, `confirmed`
- `exclude_vote` (boolean) - Exclude vote transactions (default: true)
- `exclude_failed` (boolean) - Exclude failed transactions (default: false)

**Example:**
```bash
curl --request GET \
     --url 'https://pro-api.solscan.io/v2.0/account/transactions?address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E&limit=20&commitment=finalized&exclude_vote=true' \
     --header 'Content-Type: application/json' \
     --header 'Authorization: Bearer YOUR_API_KEY'
```

### 3. **Account Balance** - `/account/balance`
Get SOL balance for an account.

**Method:** `GET`

**Required Parameters:**
- `address` (string) - Account address

**Optional Parameters:**
- `commitment` (string) - Commitment level

**Example:**
```bash
curl --request GET \
     --url 'https://pro-api.solscan.io/v2.0/account/balance?address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E' \
     --header 'Content-Type: application/json' \
     --header 'Authorization: Bearer YOUR_API_KEY'
```

### 4. **Token Holdings** - `/account/token-holdings`
Get token balances for an account.

**Method:** `GET`

**Required Parameters:**
- `address` (string) - Account address

**Optional Parameters:**
- `token` (string) - Specific token mint address to filter
- `commitment` (string) - Commitment level

**Example:**
```bash
curl --request GET \
     --url 'https://pro-api.solscan.io/v2.0/account/token-holdings?address=TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E' \
     --header 'Content-Type: application/json' \
     --header 'Authorization: Bearer YOUR_API_KEY'
```

### 5. **Token Transfer History** - `/account/token-transfers`
Get token transfer history for an account.

**Method:** `GET`

**Required Parameters:**
- `address` (string) - Account address

**Optional Parameters:**
- `token` (string) - Token mint address to filter
- `limit` (number) - Number of transfers to return
- `before` (string) - Pagination cursor
- `after` (string) - Pagination cursor
- `commitment` (string) - Commitment level

## 🔍 **JustTheTip Bot Integration Parameters**

### Current Implementation:
```javascript
// Transaction Detail
params: {
    signature: "TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E",
    commitment: "finalized"
}

// Account Transactions
params: {
    address: "TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E",
    limit: 50,
    exclude_vote: true,
    exclude_failed: false,
    commitment: "finalized"
}
```

## 📊 **Response Formats**

### Transaction Detail Response:
```json
{
  "success": true,
  "data": {
    "blockTime": 1645123456,
    "slot": 123456789,
    "transaction": {
      "message": {
        "accountKeys": ["address1", "address2"],
        "instructions": [...],
        "recentBlockhash": "hash"
      },
      "signatures": ["signature1"]
    },
    "meta": {
      "err": null,
      "fee": 5000,
      "preBalances": [1000000000],
      "postBalances": [999995000],
      "innerInstructions": [...],
      "logMessages": [...]
    }
  }
}
```

### Account Transactions Response:
```json
{
  "success": true,
  "data": [
    {
      "signature": "transaction_signature",
      "blockTime": 1645123456,
      "slot": 123456789,
      "status": "Success",
      "fee": 5000,
      "signer": ["signer_address"]
    }
  ]
}
```

## 🚀 **Best Practices**

1. **Use Commitment Levels:**
   - `finalized` - Most secure, confirmed by supermajority
   - `confirmed` - Confirmed by cluster
   - `processed` - Processed but not confirmed

2. **Pagination:**
   - Use `before` and `after` for efficient pagination
   - Limit results to avoid timeout (max 100)

3. **Error Handling:**
   - Check for 401 (authentication issues)
   - Handle rate limiting (429)
   - Parse error messages for debugging

4. **Rate Limits:**
   - Pro API: Higher limits than free tier
   - Implement exponential backoff for retries

## 🔧 **Testing Your Setup**

```bash
# Test with your payment signer
./test_solscan_api.sh TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E

# Test in Discord
!solscan-status
!verify-payment TyZFfCtcU6ytrHZ2dQcJy2VyMfB3Pm9W2i9X33FAwRduHEqhFSMtYKhWBghUU34FC47M6DFeZyverJkm14BCe8E
```
