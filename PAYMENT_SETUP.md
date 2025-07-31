# 💰 TrapHouse Payment System Setup

## 🎯 **Payment Options Overview**

### **Option A: Per-Transaction Fees (tip.cc)**
- **$3 fee per loan issuance**
- **$3 fee per late repayment**
- **Automatic processing via tip.cc API**
- **Real-time admin notifications**

### **Option B: Premium Subscription (Stripe)**
- **$2000 total cost**
- **4 payments of $500 (quarterly)**
- **No per-transaction fees**
- **Premium features unlocked**

### **Option C: Discord Boost Alternative**
- **$9.99/month Discord Nitro**
- **Server boost benefits**
- **Community recognition**

## 🔧 **Setup Instructions**

### **1. tip.cc Configuration**

#### **Get tip.cc API Credentials:**
1. Visit https://tip.cc/developers
2. Create developer account
3. Get API key and webhook secret
4. Add to `.env` file:

```env
TIPCC_API_KEY=your_tipcc_api_key_here
TIPCC_WEBHOOK_SECRET=your_tipcc_webhook_secret_here
```

#### **Setup Webhook Endpoint:**
- **URL**: `https://yourdomain.com/webhooks/tipcc`
- **Events**: `payment.completed`, `payment.failed`

### **2. Stripe Configuration**

#### **Get Stripe Credentials:**
1. Visit https://dashboard.stripe.com
2. Get publishable and secret keys
3. Create product for subscription
4. Add to `.env` file:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
STRIPE_PRODUCT_ID=prod_traphouse_subscription
```

#### **Setup Stripe Webhook:**
- **URL**: `https://yourdomain.com/webhooks/stripe`
- **Events**: 
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.deleted`

### **3. Admin Configuration**

```env
PAYMENT_ADMIN_ID=your_discord_user_id
PAYMENT_CHANNEL_ID=payment_notifications_channel_id
PAYMENT_WEBHOOK_URL=discord_webhook_url_for_notifications
```

## 💳 **Fee Structure**

### **Per-Transaction Model:**
```
Loan Issuance: $3 fee (automatic)
Late Payment: $3 fee (automatic)
Payment Method: tip.cc
Notification: Instant DM to admin
```

### **Subscription Model:**
```
Total Cost: $2000
Payment Plan: 4x $500 (quarterly)
Payment Method: Stripe
Features: Premium access, no transaction fees
```

### **Discord Boost Model:**
```
Cost: $9.99/month
Payment Method: Discord Nitro
Benefits: Server boost perks, community status
```

## 🔗 **Integration Points**

### **Loan Issuance Flow:**
1. User requests loan with `!front me [amount]`
2. System processes loan approval
3. **$3 fee automatically charged via tip.cc**
4. Admin receives notification with payment link
5. User receives payment instructions
6. Loan funds distributed after fee payment

### **Late Payment Flow:**
1. System detects overdue loan
2. **$3 late fee automatically charged via tip.cc**
3. Admin receives notification
4. User receives late fee notification
5. Total amount due updated with late fees

### **Admin Notifications:**
- **DM to admin user** with payment details
- **Channel notification** in designated payment channel
- **Webhook notification** to external systems (optional)

## 📊 **Payment Tracking**

### **Data Storage:**
- `data/payments.json` - All payment records
- `data/subscriptions.json` - Subscription data
- **Automatic backups** included in VPS backup script

### **Payment Status Tracking:**
- `pending` - Payment initiated
- `completed` - Payment successful
- `failed` - Payment failed
- `manual_pending` - Requires manual processing

## 🎛️ **User Commands**

### **Payment Commands:**
```
/payment status     - Check payment status
/payment history    - View payment history
/payment subscribe  - Subscribe to premium
/payment plans      - View payment options
```

### **Admin Commands:**
```
/admin payment-status @user  - Check user payments
/admin mark-paid [payment-id] - Mark manual payment complete
/admin refund [payment-id]    - Process refund
```

## 🔒 **Security Features**

- ✅ **Webhook signature verification**
- ✅ **Encrypted payment data**
- ✅ **Audit trail logging**
- ✅ **Fraud detection**
- ✅ **PCI compliance** (Stripe)

## 🚀 **Deployment Steps**

### **1. Install Dependencies:**
```bash
npm install express axios stripe
```

### **2. Configure Environment:**
```bash
cp .env.docker .env
# Edit .env with your payment credentials
```

### **3. Setup Webhooks:**
- **tip.cc**: Point to `https://yourdomain.com/webhooks/tipcc`
- **Stripe**: Point to `https://yourdomain.com/webhooks/stripe`

### **4. Test Payment Flow:**
```bash
# Test loan with fee
!front me 50

# Check payment status
/payment status

# View admin notifications in payment channel
```

## 💡 **Cost-Effective Alternatives**

### **1. Manual Payment Processing:**
- **No API fees**
- **Manual admin verification**
- **Discord-based tracking**
- **$0/month cost**

### **2. PayPal Integration:**
- **Lower fees than Stripe**
- **Instant transfers**
- **Familiar to users**
- **~2.9% + $0.30 per transaction**

### **3. Cryptocurrency Payments:**
- **Very low fees**
- **Instant settlement**
- **Tech-savvy audience**
- **Requires crypto wallet setup**

## 📈 **Revenue Projections**

### **Per-Transaction Model:**
```
50 loans/month × $3 = $150/month
20 late payments/month × $3 = $60/month
Total: ~$210/month revenue
```

### **Subscription Model:**
```
10 premium users × $500/quarter = $5000/quarter
Annual revenue: ~$20,000/year
```

### **Discord Boost Model:**
```
20 boosters × $9.99/month = $199.80/month
Annual revenue: ~$2,400/year
```

## 🎯 **Recommended Setup**

**For Maximum Revenue:**
1. **Start with per-transaction fees** (immediate revenue)
2. **Add subscription option** (higher-value customers)
3. **Include Discord boost** (community engagement)
4. **Monitor and optimize** based on user preferences

Your payment system is ready for professional deployment! 💰🚀
