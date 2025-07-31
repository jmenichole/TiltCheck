/**
 * 🎮 Game Manager for Degens Against Decency
 * 
 * Handles all game logic, state management, and card operations
 */

const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

class GameManager {
    constructor() {
        this.games = new Map(); // guildId -> game state
        this.loadCardSets();
    }

    // Load card sets from JSON files
    loadCardSets() {
        try {
            this.blackCards = require('./cardSets/black_cards.json');
            this.whiteCards = require('./cardSets/white_cards.json');
            
            // Try to load custom cards
            try {
                this.customCards = require('./cardSets/custom_cards.json');
            } catch (e) {
                this.customCards = { black: [], white: [] };
            }
            
            console.log(`📚 Loaded ${this.blackCards.length} black cards and ${this.whiteCards.length} white cards`);
        } catch (error) {
            console.error('❌ Error loading card sets:', error);
            this.blackCards = ["Something went wrong loading the cards. _"];
            this.whiteCards = ["Error loading cards"];
        }
    }

    // Start a new game
    async startGame(message, guildId) {
        if (this.games.has(guildId)) {
            return message.reply('🎮 A game is already running! Use `!dad join` to join or `!dad stop` to end it.');
        }

        const game = {
            players: [message.author.id],
            playerNames: { [message.author.id]: message.author.username },
            hands: { [message.author.id]: this.dealHand() },
            scores: { [message.author.id]: 0 },
            judge: null,
            currentBlackCard: null,
            submissions: new Map(),
            phase: 'joining', // joining, playing, judging, finished
            round: 0,
            channelId: message.channel.id
        };

        this.games.set(guildId, game);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🃏 New Degens Against Decency Game Started!')
            .setDescription(`**Host**: ${message.author.username}\n\n🎯 **Waiting for players to join...**\n\n*Use \`!dad join\` to join the degeneracy!*`)
            .addFields({
                name: '📋 Game Info',
                value: '• **Players needed**: 3-10\n• **Win condition**: 5 points\n• **Current players**: 1',
                inline: false
            })
            .setFooter({ text: 'Use !dad start when ready (min 3 players)' });

        await message.reply({ embeds: [embed] });
    }

    // Join existing game
    async joinGame(message, guildId) {
        const game = this.games.get(guildId);
        
        if (!game) {
            return message.reply('🚫 No game is currently running. Use `!dad start` to begin a new game.');
        }

        if (game.phase !== 'joining') {
            return message.reply('🚫 Game is already in progress. Wait for the next game!');
        }

        if (game.players.includes(message.author.id)) {
            return message.reply('👍 You\'re already in the game, degenerate!');
        }

        if (game.players.length >= 10) {
            return message.reply('🚫 Game is full! Maximum 10 players allowed.');
        }

        // Add player to game
        game.players.push(message.author.id);
        game.playerNames[message.author.id] = message.author.username;
        game.hands[message.author.id] = this.dealHand();
        game.scores[message.author.id] = 0;

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('🎮 Player Joined!')
            .setDescription(`**${message.author.username}** joined the game!\n\n**Players**: ${game.players.length}/10`)
            .addFields({
                name: '👥 Current Players',
                value: game.players.map(id => game.playerNames[id]).join('\n'),
                inline: false
            });

        if (game.players.length >= 3) {
            embed.addFields({
                name: '✅ Ready to Start!',
                value: 'Host can use `!dad start` to begin the game.',
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });

        // Auto-start if enough players
        if (game.players.length >= 3 && Math.random() > 0.7) {
            setTimeout(() => this.beginRound(message, guildId), 2000);
        }
    }

    // Begin a new round
    async beginRound(message, guildId) {
        const game = this.games.get(guildId);
        if (!game) return;

        game.round++;
        game.phase = 'playing';
        game.submissions.clear();

        // Set judge (rotate through players)
        const judgeIndex = (game.round - 1) % game.players.length;
        game.judge = game.players[judgeIndex];

        // Pick random black card
        const allBlackCards = [...this.blackCards, ...this.customCards.black];
        game.currentBlackCard = allBlackCards[Math.floor(Math.random() * allBlackCards.length)];

        // Count blanks in the card
        const blanks = (game.currentBlackCard.match(/_/g) || ['']).length;
        const cardsNeeded = Math.max(1, blanks);

        const embed = new EmbedBuilder()
            .setColor(0x000000)
            .setTitle(`🃏 Round ${game.round} - Degens Against Decency`)
            .setDescription(`**Judge**: ${game.playerNames[game.judge]}\n\n**Black Card**:\n*${game.currentBlackCard}*`)
            .addFields({
                name: '📝 Instructions',
                value: `Players submit **${cardsNeeded}** white card${cardsNeeded > 1 ? 's' : ''}\nUse \`!dad play [numbers]\` (e.g., \`!dad play 1 3\`)`,
                inline: false
            })
            .setFooter({ text: `Need ${cardsNeeded} card${cardsNeeded > 1 ? 's' : ''} | Use !dad hand to see your cards` });

        const channel = message.client.channels.cache.get(game.channelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
        }

        // Send hands to players
        for (const playerId of game.players) {
            if (playerId !== game.judge) {
                await this.sendHandToPlayer(message.client, playerId, game);
            }
        }
    }

    // Show player's hand via DM
    async showHand(message, guildId) {
        const game = this.games.get(guildId);
        if (!game) {
            return message.reply('🚫 No game is currently running.');
        }

        const playerId = message.author.id;
        if (!game.players.includes(playerId)) {
            return message.reply('🚫 You\'re not in the current game.');
        }

        await this.sendHandToPlayer(message.client, playerId, game);
        
        if (message.guild) {
            await message.reply('📬 Check your DMs for your cards!');
        }
    }

    // Send hand to player via DM
    async sendHandToPlayer(client, playerId, game) {
        try {
            const user = await client.users.fetch(playerId);
            const hand = game.hands[playerId];

            const handText = hand.map((card, index) => `**${index + 1}.** ${card}`).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0xffffff)
                .setTitle('🃏 Your Hand - Degens Against Decency')
                .setDescription(handText)
                .addFields({
                    name: '💡 How to Play',
                    value: 'Go back to the server and use `!dad play [numbers]`\nExample: `!dad play 1 3` to play cards 1 and 3',
                    inline: false
                });

            if (game.currentBlackCard) {
                embed.addFields({
                    name: '⚫ Current Black Card',
                    value: game.currentBlackCard,
                    inline: false
                });
            }

            await user.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error sending hand to player:', error);
        }
    }

    // Play cards
    async playCards(message, args, guildId) {
        const game = this.games.get(guildId);
        if (!game) {
            return message.reply('🚫 No game is currently running.');
        }

        const playerId = message.author.id;
        
        if (!game.players.includes(playerId)) {
            return message.reply('🚫 You\'re not in the current game.');
        }

        if (playerId === game.judge) {
            return message.reply('👨‍⚖️ You\'re the judge this round! You don\'t play cards.');
        }

        if (game.phase !== 'playing') {
            return message.reply('🚫 Not accepting card submissions right now.');
        }

        if (game.submissions.has(playerId)) {
            return message.reply('✅ You\'ve already submitted cards for this round.');
        }

        // Parse card numbers
        const cardNumbers = args.map(arg => parseInt(arg)).filter(num => !isNaN(num) && num >= 1 && num <= 7);
        
        if (cardNumbers.length === 0) {
            return message.reply('❌ Please specify card numbers (1-7). Example: `!dad play 1 3`');
        }

        const blanks = (game.currentBlackCard.match(/_/g) || ['']).length;
        const cardsNeeded = Math.max(1, blanks);

        if (cardNumbers.length !== cardsNeeded) {
            return message.reply(`❌ You need to play exactly **${cardsNeeded}** card${cardsNeeded > 1 ? 's' : ''} for this black card.`);
        }

        const hand = game.hands[playerId];
        const playedCards = cardNumbers.map(num => hand[num - 1]).filter(card => card);

        if (playedCards.length !== cardNumbers.length) {
            return message.reply('❌ Invalid card numbers. Use `!dad hand` to see your cards.');
        }

        // Submit cards
        game.submissions.set(playerId, {
            cards: playedCards,
            playerName: game.playerNames[playerId]
        });

        // Remove played cards and deal new ones
        for (const num of cardNumbers.sort((a, b) => b - a)) {
            hand.splice(num - 1, 1);
        }
        
        // Deal new cards
        while (hand.length < 7) {
            hand.push(this.drawWhiteCard());
        }

        await message.reply(`✅ Submitted ${playedCards.length} card${playedCards.length > 1 ? 's' : ''}! 🤐`);

        // Check if all players have submitted
        const nonJudgePlayers = game.players.filter(id => id !== game.judge);
        if (game.submissions.size === nonJudgePlayers.length) {
            await this.startJudging(message, guildId);
        }
    }

    // Start judging phase
    async startJudging(message, guildId) {
        const game = this.games.get(guildId);
        if (!game) return;

        game.phase = 'judging';

        // Create combinations
        const combinations = Array.from(game.submissions.entries()).map(([playerId, submission], index) => {
            const combinedText = this.combineCards(game.currentBlackCard, submission.cards);
            return {
                number: index + 1,
                text: combinedText,
                playerId: playerId,
                playerName: submission.playerName
            };
        });

        // Shuffle combinations to hide player identities
        for (let i = combinations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combinations[i], combinations[j]] = [combinations[j], combinations[i]];
            // Update numbers
            combinations[i].number = i + 1;
            combinations[j].number = j + 1;
        }

        const combinationsText = combinations.map(combo => 
            `**${combo.number}.** ${combo.text}`
        ).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle('👨‍⚖️ Time to Judge!')
            .setDescription(`**Judge**: ${game.playerNames[game.judge]}\n\n**Combinations**:\n\n${combinationsText}`)
            .addFields({
                name: '⚖️ Judge Instructions',
                value: `${game.playerNames[game.judge]}, pick the funniest combination!\nUse \`!dad judge [number]\` (e.g., \`!dad judge 2\`)`,
                inline: false
            })
            .setFooter({ text: 'Judge picks the winner!' });

        const channel = message.client.channels.cache.get(game.channelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
        }

        // Store combinations for judging
        game.currentCombinations = combinations;
    }

    // Judge picks winner
    async judgeRound(message, args, guildId) {
        const game = this.games.get(guildId);
        if (!game) {
            return message.reply('🚫 No game is currently running.');
        }

        if (message.author.id !== game.judge) {
            return message.reply('🚫 Only the judge can pick the winner!');
        }

        if (game.phase !== 'judging') {
            return message.reply('🚫 Not in judging phase.');
        }

        const choice = parseInt(args[0]);
        if (isNaN(choice) || choice < 1 || choice > game.currentCombinations.length) {
            return message.reply(`❌ Invalid choice. Pick a number between 1 and ${game.currentCombinations.length}.`);
        }

        const winner = game.currentCombinations[choice - 1];
        game.scores[winner.playerId]++;

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🏆 Round Winner!')
            .setDescription(`**Winner**: ${winner.playerName}\n\n**Winning Combination**:\n*${winner.text}*`)
            .addFields({
                name: '📊 Current Scores',
                value: Object.entries(game.scores)
                    .map(([id, score]) => `${game.playerNames[id]}: ${score}`)
                    .join('\n'),
                inline: false
            });

        // Check for game winner
        if (game.scores[winner.playerId] >= 5) {
            embed.setColor(0xffd700)
                .setTitle('🎉 GAME OVER!')
                .setDescription(`🏆 **${winner.playerName}** wins the game!\n\n*Congratulations, you magnificent degenerate!*`);
            
            this.games.delete(guildId);
        } else {
            embed.setFooter({ text: 'Next round starting soon...' });
            
            // Start next round
            setTimeout(() => {
                this.beginRound(message, guildId);
            }, 3000);
        }

        const channel = message.client.channels.cache.get(game.channelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
        }
    }

    // Show current scores
    async showScores(message, guildId) {
        const game = this.games.get(guildId);
        if (!game) {
            return message.reply('🚫 No game is currently running.');
        }

        const scoresText = Object.entries(game.scores)
            .sort(([,a], [,b]) => b - a)
            .map(([id, score]) => `${game.playerNames[id]}: **${score}** points`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('📊 Current Scores')
            .setDescription(scoresText)
            .addFields({
                name: '🎯 Game Info',
                value: `Round: ${game.round}\nPhase: ${game.phase}\nPlayers: ${game.players.length}`,
                inline: false
            });

        await message.reply({ embeds: [embed] });
    }

    // Show game status
    async showGameStatus(message, guildId) {
        const game = this.games.get(guildId);
        if (!game) {
            return message.reply('🚫 No game is currently running.');
        }

        const embed = new EmbedBuilder()
            .setColor(0x800080)
            .setTitle('🎮 Game Status')
            .addFields(
                { name: '👥 Players', value: game.players.map(id => game.playerNames[id]).join('\n'), inline: true },
                { name: '📊 Info', value: `Round: ${game.round}\nPhase: ${game.phase}\nJudge: ${game.judge ? game.playerNames[game.judge] : 'None'}`, inline: true }
            );

        if (game.currentBlackCard) {
            embed.addFields({ name: '⚫ Current Black Card', value: game.currentBlackCard, inline: false });
        }

        await message.reply({ embeds: [embed] });
    }

    // End game
    async endGame(message, guildId) {
        const game = this.games.get(guildId);
        if (!game) {
            return message.reply('🚫 No game is currently running.');
        }

        this.games.delete(guildId);
        
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🛑 Game Ended')
            .setDescription('The game has been ended by a player.\n\nThanks for playing Degens Against Decency!');

        await message.reply({ embeds: [embed] });
    }

    // Add custom black card
    async addCustomBlackCard(message, text) {
        if (!text || text.length < 10) {
            return message.reply('❌ Black card text must be at least 10 characters and contain at least one blank (_).');
        }

        if (!text.includes('_')) {
            return message.reply('❌ Black cards must contain at least one blank (_) for players to fill in.');
        }

        this.customCards.black.push(text);
        this.saveCustomCards();

        await message.reply(`✅ Added custom black card: "${text}"`);
    }

    // Add custom white card
    async addCustomWhiteCard(message, text) {
        if (!text || text.length < 3) {
            return message.reply('❌ White card text must be at least 3 characters.');
        }

        this.customCards.white.push(text);
        this.saveCustomCards();

        await message.reply(`✅ Added custom white card: "${text}"`);
    }

    // Helper methods
    dealHand() {
        const hand = [];
        for (let i = 0; i < 7; i++) {
            hand.push(this.drawWhiteCard());
        }
        return hand;
    }

    drawWhiteCard() {
        const allWhiteCards = [...this.whiteCards, ...this.customCards.white];
        return allWhiteCards[Math.floor(Math.random() * allWhiteCards.length)];
    }

    combineCards(blackCard, whiteCards) {
        let result = blackCard;
        for (const whiteCard of whiteCards) {
            result = result.replace('_', `**${whiteCard}**`);
        }
        return result;
    }

    saveCustomCards() {
        try {
            const filePath = path.join(__dirname, 'cardSets', 'custom_cards.json');
            fs.writeFileSync(filePath, JSON.stringify(this.customCards, null, 2));
        } catch (error) {
            console.error('Error saving custom cards:', error);
        }
    }
}

module.exports = GameManager;
