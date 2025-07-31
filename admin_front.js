const fs = require('fs');

// Admin override for testing fronts on any day
function handleAdminFrontCommand(message, args) {
    // Check if user has admin permissions
    if (!message.member || !message.member.permissions.has('Administrator')) {
        return message.reply('You need admin permissions to use this command.');
    }

    const subCommand = args[0];
    
    if (subCommand === 'override') {
        // Temporarily override Monday restriction
        const originalIsMonday = require('../front').isMonday;
        
        // Create a temporary override file
        const overridePath = './monday_override.json';
        const overrideData = { enabled: true, timestamp: Date.now() };
        fs.writeFileSync(overridePath, JSON.stringify(overrideData));
        
        return message.reply('Monday restriction temporarily disabled for testing! Use `!admin_front restore` to re-enable.');
    }
    
    if (subCommand === 'restore') {
        const overridePath = './monday_override.json';
        if (fs.existsSync(overridePath)) {
            fs.unlinkSync(overridePath);
        }
        return message.reply('Monday restriction restored!');
    }
    
    if (subCommand === 'stats') {
        // Show front system stats
        const loans = JSON.parse(fs.readFileSync('./loans.json', 'utf8') || '{}');
        const trust = JSON.parse(fs.readFileSync('./user_trust.json', 'utf8') || '{}');
        
        const activeLoans = Object.values(loans).filter(loan => !loan.repaid).length;
        const totalUsers = Object.keys(trust).length;
        const totalBorrowed = Object.values(trust).reduce((sum, user) => sum + (user.totalBorrowed || 0), 0);
        
        return message.reply(`📊 **Front System Stats**\n🏦 Active loans: ${activeLoans}\n👥 Total users: ${totalUsers}\n💰 Total borrowed: $${totalBorrowed}\n📅 Next front day: ${getNextMonday()}`);
    }

    if (subCommand === 'clear') {
        const userId = args[1];
        if (!userId) {
            return message.reply('Provide a user ID to clear their debt. Usage: `!admin_front clear <user_id>`');
        }
        
        const loans = JSON.parse(fs.readFileSync('./loans.json', 'utf8') || '{}');
        if (loans[userId]) {
            loans[userId].repaid = true;
            fs.writeFileSync('./loans.json', JSON.stringify(loans, null, 2));
            return message.reply(`Cleared debt for user ${userId} 💸`);
        } else {
            return message.reply('User has no active debt.');
        }
    }

    if (subCommand === 'confirm') {
        const mentionedUser = message.mentions.users.first();
        const userId = mentionedUser ? mentionedUser.id : args[1];
        
        if (!userId) {
            return message.reply('Tag a user or provide user ID to confirm payment. Usage: `!admin_front confirm @user`');
        }
        
        const loans = JSON.parse(fs.readFileSync('./loans.json', 'utf8') || '{}');
        const trust = JSON.parse(fs.readFileSync('./user_trust.json', 'utf8') || '{}');
        
        if (loans[userId] && !loans[userId].repaid) {
            const loan = loans[userId];
            const originalAmount = loan.amount;
            const isOnTime = Date.now() <= loan.dueDate;
            
            // Mark as paid
            loans[userId].repaid = true;
            loans[userId].paidDate = Date.now();
            
            // Update trust
            if (!trust[userId]) trust[userId] = { successfulPayments: 0, totalBorrowed: 0 };
            trust[userId].successfulPayments += isOnTime ? 1 : 0.5; // Full credit for on-time, half for late
            trust[userId].totalBorrowed += originalAmount;
            
            fs.writeFileSync('./loans.json', JSON.stringify(loans, null, 2));
            fs.writeFileSync('./user_trust.json', JSON.stringify(trust, null, 2));
            
            const username = mentionedUser ? mentionedUser.username : `User ${userId}`;
            return message.reply(`✅ Payment confirmed for ${username}! ${isOnTime ? 'On time' : 'Late'} payment processed. Trust updated. 💰`);
        } else {
            return message.reply('User has no active debt to confirm.');
        }
    }

    if (subCommand === 'debts') {
        const loans = JSON.parse(fs.readFileSync('./loans.json', 'utf8') || '{}');
        const activeDebts = Object.entries(loans).filter(([userId, loan]) => !loan.repaid);
        
        if (activeDebts.length === 0) {
            return message.reply('No active debts! Everyone paid up! 💯');
        }
        
        let debtList = '💸 **OUTSTANDING DEBTS** 💸\n\n';
        for (const [userId, loan] of activeDebts) {
            const totalDue = Math.floor(loan.amount * 1.5);
            const isOverdue = Date.now() > loan.dueDate;
            const daysLeft = Math.ceil((loan.dueDate - Date.now()) / (24 * 60 * 60 * 1000));
            
            debtList += `<@${userId}>: $${totalDue} (borrowed $${loan.amount})`;
            debtList += isOverdue ? ` ⚠️ OVERDUE` : ` - ${daysLeft} days left`;
            debtList += `\n`;
        }
        
        debtList += `\nUse \`!admin_front confirm @user\` when payment received via crypto`;
        return message.reply(debtList);
    }

    return message.reply('Admin front commands: `override`, `restore`, `stats`, `clear <user_id>`, `confirm @user`, `debts`');
}

function getNextMonday() {
    const today = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(today.getDate() + (7 - today.getDay() + 1) % 7);
    return nextMonday.toDateString();
}

module.exports = { handleAdminFrontCommand };
