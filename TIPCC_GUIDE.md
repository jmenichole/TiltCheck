# 💰 TipCC Integration Guide for TrapHouse Bot

## Overview
The TrapHouse bot integrates with tip.cc for all front payments. This ensures real money transactions while maintaining the roleplay experience.

## How It Works

### 1. User Requests Front
```
User: !front me 25
Bot: You been fronted 💸 $25! You got 5 days to bring me back $38 (150%).

PAYMENT METHOD: Use tip.cc to send payment
Admin will send you: `$tip <@123456789> 25`
You repay with: `$tip <@ADMIN_ID> 38`

Don't make me come lookin' for you... 🔫
```

### 2. Admin Sends Front
Admin manually uses tip.cc:
```
$tip @username 25
```

### 3. User Repays
User uses tip.cc to repay:
```
$tip @admin 38
```

### 4. Admin Confirms Payment
Admin can mark as paid using:
```
!admin_front confirm @user
```

## Admin Commands for TipCC Integration

### Mark Payment as Received
```
!admin_front confirm @user
```
Marks a user's loan as paid when you receive their tip.cc payment.

### Check All Outstanding Debts
```
!admin_front debts
```
Shows all users with unpaid fronts for easy tracking.

### Override Monday Restriction (Testing)
```
!admin_front override
```
Allows fronts on any day for testing purposes.

## Setting Up TipCC

1. Invite tip.cc bot to your server: https://tip.cc/
2. Set up your tip.cc wallet
3. Make sure tip.cc has permissions in your front channels
4. Test with small amounts first

## Security Features

- Bot tracks all loans automatically
- Trust system prevents abuse
- Respect-based limits ensure gradual building
- Late fee system encourages on-time payment
- Admin override system for disputes

## Example Workflow

```
1. Monday: User types `!front me 20`
2. Bot approves based on rank/trust
3. Admin sends: `$tip @user 20`
4. User has 5 days to: `$tip @admin 30`
5. Admin confirms: `!admin_front confirm @user`
6. User's trust increases for next time
```

## Troubleshooting

**User can't get front:**
- Check if it's Monday
- Verify their rank/trust level with `!front trust`
- Check for existing unpaid loans

**Payment disputes:**
- Use `!admin_front clear @user` to manually clear debt
- Check tip.cc transaction history
- Use admin override if needed

**Bot not responding:**
- Check bot permissions
- Restart bot if needed
- Check error logs

## Best Practices

1. **Always verify tip.cc payments** before confirming in bot
2. **Start with small amounts** to build trust
3. **Use Monday restriction** to create urgency
4. **Monitor respect levels** to prevent gaming the system
5. **Keep transaction records** outside the bot as backup

---

*Remember: The bot handles the tracking, tip.cc handles the money! 💰*
