/**
 * Solscan Payment Tracker for JustTheTip Bot
 * Tracks payments using Solscan Pro API with specific transaction signer
 */

const axios = require('axios');
require('dotenv').config();

class SolscanPaymentTracker {
    constructor() {
        this.apiUrl = process.env.SOLSCAN_API_URL || 'https://api.solscan.io';
        this.paymentSigner = process.env.JUSTTHETIP_PAYMENT_SIGNER;
        this.apiKey = process.env.SOLSCAN_API_KEY;
        this.webhookUrl = process.env.JUSTTHETIP_WEBHOOK_URL;
        this.loanChannelId = process.env.JUSTTHETIP_LOAN_CHANNEL_ID;
        
        if (!this.paymentSigner) {
            console.error('❌ JUSTTHETIP_PAYMENT_SIGNER not configured');
        } else {
            console.log('💡 SolscanPaymentTracker initialized (Free API)');
            console.log(`🔑 Payment Signer: ${this.paymentSigner.substring(0, 10)}...`);
        }
    }

    /**
     * Get transaction details by signature
     * @param {string} signature - Transaction signature
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Transaction details
     */
    async getTransactionDetail(signature, options = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Using free API - no authentication required
            // Note: Free API has rate limits but works without API key

            const params = {
                signature,
                commitment: options.commitment || 'finalized',
                maxSupportedTransactionVersion: options.maxSupportedTransactionVersion || 0
            };

            const response = await axios.get(
                `${this.apiUrl}/transaction/detail`,
                {
                    params,
                    headers
                }
            );

            return response.data;
        } catch (error) {
            console.error('❌ Error fetching transaction details:', error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}, Data:`, error.response.data);
            }
            return null;
        }
    }

    /**
     * Get transactions for the payment signer
     * @param {number} limit - Number of transactions to fetch (max 100)
     * @param {string} before - Cursor for pagination
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Array of transactions
     */
    async getSignerTransactions(limit = 50, before = null, options = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Using free API - no authentication required
            // Note: Free API has rate limits but works without API key

            const params = {
                address: this.paymentSigner,
                limit: Math.min(limit, 100), // Ensure we don't exceed API limits
                commitment: options.commitment || 'finalized',
                exclude_vote: options.exclude_vote !== false, // Default to true
                exclude_failed: options.exclude_failed || false
            };

            if (before) {
                params.before = before;
            }

            if (options.after) {
                params.after = options.after;
            }

            const response = await axios.get(
                `${this.apiUrl}/account/transactions`,
                {
                    params,
                    headers
                }
            );

            return response.data.data || [];
        } catch (error) {
            console.error('❌ Error fetching signer transactions:', error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}, Data:`, error.response.data);
            }
            return [];
        }
    }

    /**
     * Get account balance for the payment signer
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Account balance information
     */
    async getAccountBalance(options = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (this.apiKey && this.apiKey !== 'your_solscan_api_key_here') {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const params = {
                address: this.paymentSigner,
                commitment: options.commitment || 'finalized'
            };

            const response = await axios.get(
                `${this.apiUrl}/account/balance`,
                {
                    params,
                    headers
                }
            );

            return response.data;
        } catch (error) {
            console.error('❌ Error fetching account balance:', error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}, Data:`, error.response.data);
            }
            return null;
        }
    }

    /**
     * Get token holdings for the payment signer
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Token holdings information
     */
    async getTokenHoldings(options = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (this.apiKey && this.apiKey !== 'your_solscan_api_key_here') {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const params = {
                address: this.paymentSigner,
                commitment: options.commitment || 'finalized'
            };

            if (options.token) {
                params.token = options.token;
            }

            const response = await axios.get(
                `${this.apiUrl}/account/token-holdings`,
                {
                    params,
                    headers
                }
            );

            return response.data.data || [];
        } catch (error) {
            console.error('❌ Error fetching token holdings:', error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}, Data:`, error.response.data);
            }
            return [];
        }
    }

    /**
     * Get token transfer history for the payment signer
     * @param {number} limit - Number of transfers to fetch
     * @param {Object} options - Additional options
     * @returns {Promise<Array>} Token transfer history
     */
    async getTokenTransfers(limit = 50, options = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (this.apiKey && this.apiKey !== 'your_solscan_api_key_here') {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            const params = {
                address: this.paymentSigner,
                limit: Math.min(limit, 100),
                commitment: options.commitment || 'finalized'
            };

            if (options.token) {
                params.token = options.token;
            }

            if (options.before) {
                params.before = options.before;
            }

            if (options.after) {
                params.after = options.after;
            }

            const response = await axios.get(
                `${this.apiUrl}/account/token-transfers`,
                {
                    params,
                    headers
                }
            );

            return response.data.data || [];
        } catch (error) {
            console.error('❌ Error fetching token transfers:', error.message);
            if (error.response) {
                console.error(`Status: ${error.response.status}, Data:`, error.response.data);
            }
            return [];
        }
    }

    /**
     * Verify if a transaction was signed by the JustTheTip payment signer
     * @param {string} signature - Transaction signature to verify
     * @returns {Promise<boolean>} True if signed by our signer
     */
    async verifyPaymentTransaction(signature) {
        try {
            const transaction = await this.getTransactionDetail(signature);
            
            if (!transaction || !transaction.transaction) {
                return false;
            }

            // Check if our payment signer is in the signers array
            const signers = transaction.transaction.message?.accountKeys || [];
            return signers.some(key => key === this.paymentSigner);
        } catch (error) {
            console.error('❌ Error verifying payment transaction:', error.message);
            return false;
        }
    }

    /**
     * Process a payment transaction for loan purposes
     * @param {string} signature - Transaction signature
     * @param {Object} loanData - Loan information
     * @returns {Promise<Object>} Processing result
     */
    async processLoanPayment(signature, loanData = {}) {
        try {
            console.log(`💡 Processing loan payment: ${signature}`);
            
            // Verify the transaction was signed by our signer
            const isValidPayment = await this.verifyPaymentTransaction(signature);
            
            if (!isValidPayment) {
                console.log('❌ Transaction not signed by JustTheTip payment signer');
                return {
                    success: false,
                    error: 'Invalid payment signer'
                };
            }

            // Get full transaction details
            const transaction = await this.getTransactionDetail(signature);
            
            if (!transaction) {
                return {
                    success: false,
                    error: 'Transaction not found'
                };
            }

            // Extract payment information
            const amount = this.extractPaymentAmount(transaction);
            const token = this.extractTokenInfo(transaction);
            const timestamp = transaction.blockTime || Date.now();

            console.log(`✅ Valid payment detected: ${amount} ${token}`);
            
            return {
                success: true,
                transaction: {
                    signature,
                    amount,
                    token,
                    timestamp,
                    signer: this.paymentSigner,
                    blockTime: transaction.blockTime,
                    slot: transaction.slot
                },
                loanData
            };
        } catch (error) {
            console.error('❌ Error processing loan payment:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract payment amount from transaction
     * @param {Object} transaction - Solscan transaction object
     * @returns {string} Payment amount
     */
    extractPaymentAmount(transaction) {
        try {
            // Look for SOL transfers
            if (transaction.transaction?.meta?.preBalances && transaction.transaction?.meta?.postBalances) {
                const preBalances = transaction.transaction.meta.preBalances;
                const postBalances = transaction.transaction.meta.postBalances;
                
                for (let i = 0; i < preBalances.length; i++) {
                    const diff = postBalances[i] - preBalances[i];
                    if (diff !== 0) {
                        return Math.abs(diff / 1000000000).toString(); // Convert lamports to SOL
                    }
                }
            }

            // Look for token transfers
            if (transaction.transaction?.meta?.innerInstructions) {
                // Parse token transfer instructions
                // This would need more specific parsing based on your token types
                return "0";
            }

            return "0";
        } catch (error) {
            console.error('❌ Error extracting payment amount:', error.message);
            return "0";
        }
    }

    /**
     * Extract token information from transaction
     * @param {Object} transaction - Solscan transaction object
     * @returns {string} Token symbol
     */
    extractTokenInfo(transaction) {
        try {
            // Check for token transfers in the transaction
            if (transaction.transaction?.meta?.innerInstructions) {
                // This would parse for specific tokens like USDC, USDT, etc.
                return "USDC"; // Default for now
            }
            
            return "SOL"; // Default to SOL for native transfers
        } catch (error) {
            console.error('❌ Error extracting token info:', error.message);
            return "SOL";
        }
    }

    /**
     * Send payment notification to Discord webhook
     * @param {Object} paymentData - Payment information
     * @returns {Promise<boolean>} Success status
     */
    async notifyPaymentReceived(paymentData) {
        try {
            if (!this.webhookUrl || this.webhookUrl.includes('your_webhook_url_here')) {
                console.log('⚠️ Webhook URL not configured');
                return false;
            }

            const embed = {
                title: "💡 JustTheTip Payment Received",
                color: 0x00ff00,
                fields: [
                    {
                        name: "Transaction",
                        value: `\`${paymentData.signature}\``,
                        inline: false
                    },
                    {
                        name: "Amount",
                        value: `${paymentData.amount} ${paymentData.token}`,
                        inline: true
                    },
                    {
                        name: "Signer",
                        value: `\`${paymentData.signer.substring(0, 20)}...\``,
                        inline: true
                    }
                ],
                timestamp: new Date(paymentData.timestamp * 1000).toISOString(),
                footer: {
                    text: "Solscan Payment Tracker"
                }
            };

            const webhookPayload = {
                embeds: [embed],
                username: "JustTheTip Bot",
                avatar_url: "https://i.imgur.com/4M34hi2.png"
            };

            await axios.post(this.webhookUrl, webhookPayload);
            console.log('✅ Payment notification sent to Discord');
            return true;
        } catch (error) {
            console.error('❌ Error sending payment notification:', error.message);
            return false;
        }
    }

    /**
     * Monitor for new payments continuously
     * @param {Function} callback - Callback function for new payments
     */
    async startPaymentMonitoring(callback) {
        if (!this.paymentSigner) {
            console.error('❌ Cannot start monitoring without payment signer');
            return;
        }

        console.log('🔄 Starting payment monitoring...');
        let lastSignature = null;

        const checkForNewPayments = async () => {
            try {
                const transactions = await this.getSignerTransactions(10);
                
                for (const tx of transactions) {
                    if (lastSignature && tx.signature === lastSignature) {
                        break; // We've reached previously processed transactions
                    }
                    
                    const paymentResult = await this.processLoanPayment(tx.signature);
                    
                    if (paymentResult.success) {
                        await this.notifyPaymentReceived(paymentResult.transaction);
                        
                        if (callback) {
                            callback(paymentResult);
                        }
                    }
                }
                
                if (transactions.length > 0) {
                    lastSignature = transactions[0].signature;
                }
            } catch (error) {
                console.error('❌ Error in payment monitoring:', error.message);
            }
        };

        // Check for new payments every 30 seconds
        setInterval(checkForNewPayments, 30000);
        
        // Initial check
        await checkForNewPayments();
    }
}

module.exports = SolscanPaymentTracker;
