const fs = require('fs');
const { getUserData } = require('./storage');
const { getRankFromRespect, getLoanCapFromRespect } = require('./respectManager');
const PaymentManager = require('./paymentManager');

const path = './loans.json';

function loadLoans() {
    if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');
    return JSON.parse(fs.readFileSync(path));
}

function saveLoans(loans) {
    fs.writeFileSync(path, JSON.stringify(loans, null, 2));
}

function loadUserTrust() {
    const trustPath = './user_trust.json';
    if (!fs.existsSync(trustPath)) fs.writeFileSync(trustPath, '{}');
    return JSON.parse(fs.readFileSync(trustPath));
}

function saveUserTrust(trust) {
    const trustPath = './user_trust.json';
    fs.writeFileSync(trustPath, JSON.stringify(trust, null, 2));
}

function isMonday() {
    // Check for admin override first
    const overridePath = './monday_override.json';
    if (fs.existsSync(overridePath)) {
        const override = JSON.parse(fs.readFileSync(overridePath));
        if (override.enabled) return true;
    }
    
    const today = new Date();
    return today.getDay() === 1; // Monday is 1
}

function getTrustLevel(userId, trustData) {
    const userTrust = trustData[userId] || { successfulPayments: 0, totalBorrowed: 0 };
    if (userTrust.successfulPayments >= 5) return 'high';
    if (userTrust.successfulPayments >= 2) return 'medium';
    return 'low';
}

async function getMaxLoanAmount(userId, trustLevel) {
    // Get user's respect-based loan cap
    const userData = await getUserData(userId);
    const respectLoanCap = getLoanCapFromRespect(userData.respect || 0);
    
    // Get trust multiplier
    const trustMultiplier = {
        'high': 1.0,    // Full respect-based limit
        'medium': 0.75, // 75% of respect limit
        'low': 0.5      // 50% of respect limit
    };
    
    const maxAmount = Math.floor(respectLoanCap * (trustMultiplier[trustLevel] || 0.5));
    return Math.max(maxAmount, 10); // Minimum $10 loan
}

async function handleFrontCommand(message, args) {
    const userId = message.author.id;
    const loans = loadLoans();
    const trust = loadUserTrust();
    const subCommand = args[0];
    const now = Date.now();

    if (subCommand === 'me') {
        // Check if it's Monday
        if (!isMonday()) {
            return message.reply('Yo, fronts only go down on Mondays! Come back when the week starts fresh. 📅');
        }

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Whatchu need? A chicken? A bird? Maybe a nickel? Dimebag? Drop a real number. 💰');
        }

        // Check for existing unpaid loans
        if (loans[userId] && !loans[userId].repaid) {
            return message.reply("You already owe the block. Pay up before askin' for more. No games! 💸");
        }

        // Check trust level and max amount (now includes respect)
        const trustLevel = getTrustLevel(userId, trust);
        const maxAmount = await getMaxLoanAmount(userId, trustLevel);
        const userData = await getUserData(userId);
        const userRank = getRankFromRespect(userData.respect || 0);
        
        if (amount > maxAmount) {
            return message.reply(`Hold up! Your rank (${userRank.rank}) and trust level (${trustLevel}) caps you at $${maxAmount}. Earn more respect and build trust to unlock bigger amounts! 🏆\n\nRespect-based cap: $${getLoanCapFromRespect(userData.respect || 0)} | Trust modifier: ${trustLevel === 'high' ? '100%' : trustLevel === 'medium' ? '75%' : '50%'}`);
        }

        loans[userId] = {
            amount,
            timestamp: now,
            dueDate: now + (5 * 24 * 60 * 60 * 1000), // 5 days from now
            repaid: false,
            trustLevel,
            userRank: userRank.rank
        };
        saveLoans(loans);
        
        const repayAmount = Math.floor(amount * 1.5); // 150% (50% interest)
        
        // Process loan issuance fee
        try {
            const paymentManager = new PaymentManager(message.client);
            await paymentManager.processLoanIssuanceFee(userId, amount, `loan_${now}`);
        } catch (error) {
            console.error('Error processing loan issuance fee:', error);
        }
        
        // Generate tip.cc command for the user
        const tipCommand = `$tip <@${userId}> ${amount}`;
        
        return message.reply(`You been fronted 💸 $${amount}! You got 5 days to bring me back $${repayAmount} (150%).

**💳 PROCESSING FEE:** $3 loan issuance fee will be charged via tip.cc
**PAYMENT METHOD:** Use tip.cc to send payment
**Admin will send you:** \`${tipCommand}\`
**You repay with:** \`$tip <@ADMIN_ID> ${repayAmount}\`

Don't make me come lookin' for you... 🔫

*Rank: ${userRank.rank} | Trust: ${trustLevel} | Due: ${new Date(loans[userId].dueDate).toLocaleDateString()}*`);
    }

    if (subCommand === 'repay') {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply("How much you payin'? Type a real number. 💵\n\n**Remember:** Use tip.cc to pay: `$tip <@ADMIN_ID> [amount]`");
        }
        if (!loans[userId] || loans[userId].repaid) {
            return message.reply("You don't owe nothin'… yet. 😏");
        }

        const loan = loans[userId];
        const originalAmount = loan.amount;
        const totalDue = Math.floor(originalAmount * 1.5); // 150% repayment
        const isOverdue = now > loan.dueDate;
        
        if (isOverdue) {
            // Process late repayment fee
            try {
                const daysLate = Math.ceil((now - loan.dueDate) / (24 * 60 * 60 * 1000));
                const paymentManager = new PaymentManager(message.client);
                await paymentManager.processLateRepaymentFee(userId, `loan_${loan.timestamp}`, daysLate);
            } catch (error) {
                console.error('Error processing late repayment fee:', error);
            }
            
            // Add late fees - extra 25% if overdue
            const lateFee = Math.floor(originalAmount * 0.25);
            const totalWithLateFee = totalDue + lateFee;
            
            if (amount >= totalWithLateFee) {
                // Full payment with late fee
                loans[userId].repaid = true;
                loans[userId].paidDate = now;
                
                // Update trust - late payment doesn't build as much trust
                if (!trust[userId]) trust[userId] = { successfulPayments: 0, totalBorrowed: 0 };
                trust[userId].successfulPayments += 0.5; // Half credit for late payment
                trust[userId].totalBorrowed += originalAmount;
                
                saveLoans(loans);
                saveUserTrust(trust);
                return message.reply(`Bout time! You paid the full $${totalWithLateFee} (with late fees). **💳 Additional $3 late payment fee charged via tip.cc.** Don't be late next time! ⏰💸\n\n**CONFIRM PAYMENT:** Send via tip.cc: \`$tip <@ADMIN_ID> ${totalWithLateFee}\``);
            } else {
                return message.reply(`You're late! You owe $${totalWithLateFee} now (original $${totalDue} + $${lateFee} late fee). **💳 Additional $3 late payment fee will be charged via tip.cc.** Pay up! 🚨\n\n**PAY NOW:** \`$tip <@ADMIN_ID> ${totalWithLateFee}\``);
            }
        }

        if (amount >= totalDue) {
            // Full payment on time
            loans[userId].repaid = true;
            loans[userId].paidDate = now;
            
            // Update trust - good payment builds trust
            if (!trust[userId]) trust[userId] = { successfulPayments: 0, totalBorrowed: 0 };
            trust[userId].successfulPayments += 1;
            trust[userId].totalBorrowed += originalAmount;
            
            saveLoans(loans);
            saveUserTrust(trust);
            
            const newTrustLevel = getTrustLevel(userId, trust);
            const newMaxAmount = await getMaxLoanAmount(userId, newTrustLevel);
            const userData = await getUserData(userId);
            const userRank = getRankFromRespect(userData.respect || 0);
            
            return message.reply(`Respect! 💯 You paid your dues in full ($${totalDue}). 

**New Status:**
🏆 Trust level: ${newTrustLevel} 
👑 Rank: ${userRank.rank}
💰 Max loan: $${newMaxAmount}

You got some fo me? That's okkk, I got more for you when you need it! 🤝

**CONFIRM PAYMENT:** Send via tip.cc: \`$tip <@ADMIN_ID> ${totalDue}\``);
        } else {
            return message.reply(`Partial payments ain't how we do business here. You owe $${totalDue} total. Bring the full amount! 💸\n\n**PAY FULL:** \`$tip <@ADMIN_ID> ${totalDue}\``);
        }
    }

    if (subCommand === 'check') {
        if (!loans[userId] || loans[userId].repaid) {
            const userTrust = trust[userId] || { successfulPayments: 0, totalBorrowed: 0 };
            const trustLevel = getTrustLevel(userId, userTrust);
            const maxAmount = await getMaxLoanAmount(userId, trustLevel);
            const userData = await getUserData(userId);
            const userRank = getRankFromRespect(userData.respect || 0);
            
            return message.reply(`You ain't got no fronts active.

**Your Status:**
👑 Rank: ${userRank.rank} (${userData.respect || 0} respect)
🏆 Trust: ${trustLevel} (${userTrust.successfulPayments} payments)
💰 Max loan: $${maxAmount}
📅 ${isMonday() ? 'It\'s Monday - ready for business! 🏪' : 'Come back Monday for fronts! 📅'}`);
        }

        const loan = loans[userId];
        const originalAmount = loan.amount;
        const totalDue = Math.floor(originalAmount * 1.5);
        const dueDate = new Date(loan.dueDate);
        const isOverdue = now > loan.dueDate;
        const timeLeft = Math.ceil((loan.dueDate - now) / (24 * 60 * 60 * 1000));

        if (isOverdue) {
            const daysLate = Math.ceil((now - loan.dueDate) / (24 * 60 * 60 * 1000));
            const lateFee = Math.floor(originalAmount * 0.25);
            const totalWithLateFee = totalDue + lateFee;
            return message.reply(`⚠️ YOU'RE LATE! You owe $${totalWithLateFee} (original $${totalDue} + $${lateFee} late fee). ${daysLate} day(s) overdue. 

**PAY NOW:** \`$tip <@ADMIN_ID> ${totalWithLateFee}\` 🚨`);
        }

        return message.reply(`You owe $${totalDue} for your $${originalAmount} front. ${timeLeft} day(s) left to pay.

**Due:** ${dueDate.toLocaleDateString()}
**Pay with:** \`$tip <@ADMIN_ID> ${totalDue}\`
⏰💸`);
    }

    if (subCommand === 'trust') {
        const userTrust = trust[userId] || { successfulPayments: 0, totalBorrowed: 0 };
        const trustLevel = getTrustLevel(userId, userTrust);
        const maxAmount = await getMaxLoanAmount(userId, trustLevel);
        const userData = await getUserData(userId);
        const userRank = getRankFromRespect(userData.respect || 0);
        const respectLoanCap = getLoanCapFromRespect(userData.respect || 0);
        
        return message.reply(`**Your Street Status** 🏆

👑 **Rank:** ${userRank.rank} (${userData.respect || 0} respect)
🏆 **Trust Level:** ${trustLevel} (${userTrust.successfulPayments} successful payments)
💰 **Max Loan:** $${maxAmount}

**Breakdown:**
• Respect-based cap: $${respectLoanCap}
• Trust modifier: ${trustLevel === 'high' ? '100%' : trustLevel === 'medium' ? '75%' : '50%'}
• Total borrowed: $${userTrust.totalBorrowed}

**Next Goals:**
${userRank.rank === 'Street Soldier' ? '• Earn 500+ respect to become Corner Boy' : ''}
${userRank.rank === 'Corner Boy' ? '• Earn 1000+ respect to become Hustler' : ''}
${userRank.rank === 'Hustler' ? '• Earn 2000+ respect to become Shot Caller' : ''}
${userRank.rank === 'Shot Caller' ? '• Earn 5000+ respect to become Boss' : ''}
${trustLevel === 'low' ? '• Make 2+ payments to reach medium trust' : ''}
${trustLevel === 'medium' ? '• Make 5+ payments to reach high trust' : ''}
${trustLevel === 'high' ? '• You got the keys to the kingdom! 👑' : ''}`);
    }

    if (subCommand === 'help' || subCommand === 'rules') {
        const helpMessage = `📋 **TONY MONTANA'S FRONTS - THE RULES** 📋

**What you need to know:**
🗓️ **Fronts only available on MONDAYS**
⏰ **5 days to repay**  
💰 **150% repayment** (borrow $20, repay $30)
🏆 **Respect + Trust system** - climb ranks for bigger amounts
💳 **tip.cc payments** - all money via Discord tip bot

**Commands:**
• \`!front me <amount>\` - Request a front (Mondays only)
• \`!front repay <amount>\` - Pay back your debt
• \`!front check\` - Check your current debt status
• \`!front trust\` - View your rank and limits

**Respect-Based Loan Caps:**
🥉 **Street Soldier** (0-499 respect): Max $20 (with trust)
🥈 **Corner Boy** (500-999 respect): Max $35 (with trust)
🥇 **Hustler** (1000-1999 respect): Max $50 (with trust)
💎 **Shot Caller** (2000-4999 respect): Max $75 (with trust)
👑 **Boss** (5000+ respect): Max $100 (with trust)

**Trust Multipliers:**
• Low trust (0-1 payments): 50% of respect cap
• Medium trust (2-4 payments): 75% of respect cap
• High trust (5+ payments): 100% of respect cap

**Payment Example:**
\`!front me 20\` → Admin sends: \`$tip @you 20\`
You repay: \`$tip @admin 30\` (within 5 days)

*Once you build trust with me, I will open the doors to bigger amounts!* 🚪`;
        return message.reply(helpMessage);
    }

    return message.reply('Invalid front command. Use `!front help` for all commands or `!front me <amount>`, `!front repay <amount>`, `!front check`, or `!front trust`');
}

module.exports = { handleFrontCommand };
