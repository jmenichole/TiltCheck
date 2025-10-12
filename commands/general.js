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

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('general')
		.setDescription('TrapHouse Bot General Commands')
		.addSubcommand(subcommand =>
			subcommand
				.setName('street')
				.setDescription('Get your street name'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('job')
				.setDescription('Get a new hustle'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('respect')
				.setDescription('Give respect to someone')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('The user to respect')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('leaderboard')
				.setDescription('See who\'s running the streets'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('flex')
				.setDescription('Show off your success'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('crew')
				.setDescription('Check your crew\'s stats')
				.addUserOption(option =>
					option.setName('users')
						.setDescription('Users in your crew')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('rep')
				.setDescription('Check respect stats')
				.addUserOption(option =>
					option.setName('user')
						.setDescription('The user to check respect stats for')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('hood')
				.setDescription('View trap house stats'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('lend')
				.setDescription('Lend street cred to another user')
				.addUserOption(option =>
					option.setName('borrower')
						.setDescription('The user you want to lend to')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('amount')
						.setDescription('Amount of street cred to lend')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('interest')
						.setDescription('Interest rate (optional)')
						.setRequired(false))
				.addStringOption(option =>
					option.setName('due_date')
						.setDescription('Due date for repayment (e.g., YYYY-MM-DD)')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('repay')
				.setDescription('Repay a loan')
				.addUserOption(option =>
					option.setName('lender')
						.setDescription('The user you are repaying')
						.setRequired(true))
				.addIntegerOption(option =>
					option.setName('amount')
						.setDescription('Amount to repay')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('loans')
				.setDescription('View active loans')),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		if (subcommand === 'street') {
			interaction.reply('Your street name is Hustler!');
		} else if (subcommand === 'job') {
			interaction.reply('You got a new job: Deliver some packages!');
		} else if (subcommand === 'respect') {
			const user = interaction.options.getUser('user');
			if (user) {
				interaction.reply(`You gave respect to ${user.username}. (+100 Respect)`);
			} else {
				interaction.reply('Please mention a user to give respect.');
			}
		} else if (subcommand === 'leaderboard') {
			interaction.reply('Here is the leaderboard: [Top Players]');
		} else if (subcommand === 'flex') {
			interaction.reply('You flexed your success: $10,000 in the bank!');
		} else if (subcommand === 'hood') {
			interaction.reply('Trap House Stats: 50 members, $500,000 total earnings.');
		} else if (subcommand === 'lend') {
			// Handle lending logic
			// ...refer to lending.js for implementation...
		} else if (subcommand === 'repay') {
			// Handle repayment logic
			// ...refer to repay.js for implementation...
		} else if (subcommand === 'loans') {
			// Handle viewing loans logic
			// ...refer to loans.js for implementation...
		} else {
			interaction.reply('Unknown general command.');
		}
	},
};
