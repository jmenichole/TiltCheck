# ☕ Ko-fi Integration Guide

## Overview
The TrapHouse Discord Bot now supports Ko-fi webhook integration to automatically notify your Discord server when someone supports you on Ko-fi!

## Features
- ✅ Real-time Discord notifications for donations
- ✅ Support for all Ko-fi payment types (donations, subscriptions, commissions, shop orders)
- ✅ Secure webhook verification
- ✅ Donation history storage
- ✅ Beautiful Discord embeds with Ko-fi branding

## Setup Instructions

### 1. Environment Configuration
Add the Ko-fi verification token to your environment variables:

```bash
# Ko-fi verification token (already configured)
KOFI_VERIFICATION_TOKEN=02740ccf-8e39-4dce-b095-995f8d94bdbb

# Discord webhook URL for notifications (optional but recommended)
WEBHOOK_URL=your_discord_webhook_url_here
```

### 2. Ko-fi Dashboard Configuration
1. Log into your [Ko-fi Dashboard](https://ko-fi.com/manage)
2. Go to **Settings** → **API**
3. Enable **Webhooks**
4. Set your webhook URL to: `https://yourdomain.com/webhook/kofi`
   - Replace `yourdomain.com` with your actual domain
   - If running locally: `http://localhost:3002/webhook/kofi`
5. Set the verification token to: `02740ccf-8e39-4dce-b095-995f8d94bdbb`
6. Save the settings

### 3. Discord Channel Setup (Optional)
If you want notifications in a specific Discord channel:
1. Go to your Discord server
2. Right-click on the channel you want notifications in
3. Select **Integrations** → **Webhooks** → **New Webhook**
4. Copy the webhook URL
5. Add it to your environment as `WEBHOOK_URL`

## Webhook Endpoint
```
POST /webhook/kofi
```

## Supported Ko-fi Events
- 🎁 **Donations** - One-time support payments
- 🔄 **Subscriptions** - Monthly recurring support
- 🎨 **Commissions** - Custom work requests
- 🛒 **Shop Orders** - Digital/physical product purchases

## Discord Notification Format
When someone supports you on Ko-fi, the bot will send a beautiful Discord embed with:
- 💰 Amount and currency
- 👤 Supporter name (or "Anonymous")
- 📝 Support type (donation, subscription, etc.)
- 💬 Personal message (if included)
- 🔄 Subscription status (first payment vs renewal)
- ⏰ Timestamp

## Example Discord Notification
```
☕ Ko-fi Support Received!
🎉 **John Doe** bought you a coffee!

💰 Amount: USD 5.00
👤 From: John Doe
📝 Type: Donation
💬 Message: Thanks for the amazing bot! Keep up the great work! ☕

Thank you for supporting TrapHouse Bot! ☕
```

## Data Storage
The bot automatically stores all Ko-fi donations with:
- Transaction ID
- Timestamp
- Amount and currency
- Supporter information
- Message content
- Subscription details
- Raw webhook data

## Security Features
- ✅ Webhook signature verification using your Ko-fi verification token
- ✅ Request validation and sanitization
- ✅ Secure data storage
- ✅ Rate limiting and error handling

## Testing the Integration

### Local Testing
1. Start your webhook server: `npm start`
2. Use ngrok to expose your local server: `ngrok http 3002`
3. Update Ko-fi webhook URL to your ngrok URL: `https://abcd1234.ngrok.io/webhook/kofi`
4. Make a test donation to yourself on Ko-fi

### Production Testing
1. Deploy your bot with the Ko-fi integration
2. Update Ko-fi webhook URL to your production domain
3. Make a test donation

## Troubleshooting

### Common Issues

**Webhook not received:**
- Check that your Ko-fi webhook URL is correct
- Verify your server is running and accessible
- Check the Ko-fi dashboard for webhook delivery logs

**Invalid verification token:**
- Ensure `KOFI_VERIFICATION_TOKEN` is set correctly
- Check that the token in Ko-fi dashboard matches your environment variable

**Discord notifications not appearing:**
- Verify `WEBHOOK_URL` is set and points to a valid Discord webhook
- Check Discord channel permissions
- Review server logs for errors

### Debug Information
Check webhook status: `GET /webhook/status`
Health check: `GET /webhook/health`
Test webhook: `GET /webhook/test`

## API Reference

### Ko-fi Webhook Data Structure
```json
{
  "verification_token": "02740ccf-8e39-4dce-b095-995f8d94bdbb",
  "message_id": "unique-message-id",
  "timestamp": "2025-01-31T12:00:00Z",
  "type": "Donation",
  "is_public": true,
  "from_name": "John Doe",
  "message": "Thanks for the amazing bot!",
  "amount": "5.00",
  "url": "https://ko-fi.com/jmenichole",
  "email": "john@example.com",
  "currency": "USD",
  "is_subscription_payment": false,
  "is_first_subscription_payment": false,
  "kofi_transaction_id": "transaction-id",
  "shop_items": null,
  "tier_name": null,
  "shipping": null
}
```

## Links
- 🔗 **Ko-fi Page**: [https://ko-fi.com/jmenichole](https://ko-fi.com/jmenichole)
- 📚 **Ko-fi API Docs**: [https://ko-fi.com/manage/webhooks](https://ko-fi.com/manage/webhooks)
- 🤖 **Discord Webhooks**: [https://discord.com/developers/docs/resources/webhook](https://discord.com/developers/docs/resources/webhook)

## Support
If you need help with the Ko-fi integration:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test the webhook endpoint manually
4. Join our Discord for community support

---
*Made with ☕ and ❤️ for the TrapHouse community*
