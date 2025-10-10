const fs = require('fs');
const path = require('path');

const loansFilePath = path.join(__dirname, 'loans.json');

// Load loans from JSON file
function loadLoans() {
    if (!fs.existsSync(loansFilePath)) {
        fs.writeFileSync(loansFilePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(loansFilePath));
}

// Save loans to JSON file
function saveLoans(loans) {
    fs.writeFileSync(loansFilePath, JSON.stringify(loans, null, 2));
}

// Handle loan request
async function handleLoanRequest(message) {
    const loans = loadLoans();
    const [amount] = message.content.split(' ').slice(1);

    if (!amount || isNaN(amount)) {
        return message.reply('Please specify a valid loan amount.');
    }

    loans.push({
        userId: message.author.id,
        amount: parseFloat(amount),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        interest: 0.1, // 10% interest
        repaid: false,
    });

    saveLoans(loans);
    message.reply(`Loan of $${amount} granted. Repay within 7 days with 10% interest.`);
}

// Handle loan repayment
async function handleRepayment(message) {
    const loans = loadLoans();
    const [amount] = message.content.split(' ').slice(1);

    if (!amount || isNaN(amount)) {
        return message.reply('Please specify a valid repayment amount.');
    }

    const loan = loans.find(loan => loan.userId === message.author.id && !loan.repaid);

    if (!loan) {
        return message.reply('You have no outstanding loans.');
    }

    const repaymentAmount = parseFloat(amount);
    const totalDue = loan.amount * (1 + loan.interest);

    if (repaymentAmount >= totalDue) {
        loan.repaid = true;
        saveLoans(loans);
        message.reply('Loan fully repaid. Thank you!');
    } else {
        loan.amount = totalDue - repaymentAmount;
        saveLoans(loans);
        message.reply(`Partial repayment accepted. Remaining balance: $${loan.amount.toFixed(2)}`);
    }
}

module.exports = {
    handleLoanRequest,
    handleRepayment,
};
