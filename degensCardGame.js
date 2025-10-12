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

// Degens Against Decency Card Game Integration
// A Cards Against Humanity style game for TrapHouse Discord

class DegensCardGame {
    constructor() {
        this.activeGames = new Map(); // gameId -> gameState
        this.playerQueues = new Map(); // channelId -> players waiting
        this.gameChannels = new Set(); // channels with active games
        
        // TrapHouse themed cards
        this.whiteCards = [
            "getting fronted by the plug",
            "counting dirty money",
            "street credibility",
            "a sketchy deal in the alley",
            "respect points from the hood",
            "that one friend who always asks for fronts",
            "hiding your stash from your mom",
            "explaining cryptocurrency to boomers",
            "NFTs that nobody wants",
            "diamond hands turning to paper",
            "when the plug says 'pull up'",
            "late night Discord raids",
            "flexing fake Rolexes",
            "arguing about which coin will moon",
            "TrapHouse marketplace drama",
            "getting rugged by your favorite token",
            "explaining why you need more USDC",
            "DeFi yield farming gone wrong",
            "meme coins with dog names",
            "gas fees higher than your rent"
        ];

        this.blackCards = [
            "In the TrapHouse, nothing beats ___.",
            "The streets taught me about ___.",
            "My biggest flex is ___.",
            "I'd never trade my ___ for anything.",
            "The plug always says '___' before the deal.",
            "Discord mods be like: '___'",
            "When crypto pumps, I celebrate with ___.",
            "The secret to street success? ___.",
            "My portfolio consists entirely of ___.",
            "Late at night, I think about ___.",
            "The TrapHouse marketplace needs more ___.",
            "Respect comes from ___.",
            "Real ones know about ___.",
            "Diamond hands means holding ___.",
            "The degen lifestyle includes ___.",
            "___ is the reason I can't sleep at night.",
            "My mom found my ___ and now she's concerned.",
            "Web3 changed everything when it introduced ___.",
            "The feds are watching my ___.",
            "True degens always have ___ in their wallet."
        ];
    }

    // Start a new game
    async startGame(message, maxPlayers = 6) {
        const channelId = message.channel.id;
        
        if (this.gameChannels.has(channelId)) {
            return message.reply("❌ There's already a game running in this channel! Use `!cards join` to join or `!cards end` to end it.");
        }

        const gameId = `${channelId}-${Date.now()}`;
        const gameState = {
            id: gameId,
            channelId: channelId,
            host: message.author.id,
            players: new Map(), // userId -> playerData
            maxPlayers: maxPlayers,
            currentRound: 0,
            czar: null,
            blackCard: null,
            submissions: new Map(), // userId -> whiteCard
            phase: 'joining', // joining, playing, judging, ended
            scores: new Map(), // userId -> score
            usedBlackCards: new Set(),
            usedWhiteCards: new Set(),
            startedAt: Date.now()
        };

        // Add host as first player
        gameState.players.set(message.author.id, {
            id: message.author.id,
            username: message.author.username,
            hand: [],
            isReady: true
        });

        this.activeGames.set(gameId, gameState);
        this.gameChannels.add(channelId);

        const embed = {
            color: 0xFF1493,
            title: '🃏 Degens Against Decency - New Game!',
            description: `${message.author.username} started a TrapHouse card game!`,
            fields: [
                {
                    name: '🎮 How to Play',
                    value: '• Use `!cards join` to join the game\n• Each player gets white cards to complete black card prompts\n• The Card Czar picks the funniest combo\n• First to 5 points wins!'
                },
                {
                    name: '👥 Players',
                    value: `1️⃣ ${message.author.username} (Host)\n\n*Waiting for more players... (1/${maxPlayers})*`
                },
                {
                    name: '⚡ Quick Start',
                    value: '`!cards join` - Join the game\n`!cards start` - Start when ready\n`!cards end` - End the game'
                }
            ],
            footer: {
                text: `Game ID: ${gameId.slice(-8)} | Need ${Math.max(3, maxPlayers)} players minimum`
            }
        };

        await message.reply({ embeds: [embed] });
        return gameState;
    }

    // Join an existing game
    async joinGame(message) {
        const channelId = message.channel.id;
        const userId = message.author.id;
        
        const game = this.getGameByChannel(channelId);
        if (!game) {
            return message.reply("❌ No active game in this channel! Use `!cards start` to begin a new game.");
        }

        if (game.phase !== 'joining') {
            return message.reply("❌ This game is already in progress! Wait for the next round.");
        }

        if (game.players.has(userId)) {
            return message.reply("✅ You're already in this game!");
        }

        if (game.players.size >= game.maxPlayers) {
            return message.reply("❌ This game is full! Wait for the next one.");
        }

        // Add player
        game.players.set(userId, {
            id: userId,
            username: message.author.username,
            hand: [],
            isReady: false
        });

        game.scores.set(userId, 0);

        const playersList = Array.from(game.players.values())
            .map((p, i) => `${i + 1}️⃣ ${p.username}${p.id === game.host ? ' (Host)' : ''}`)
            .join('\n');

        const embed = {
            color: 0x32CD32,
            title: '🎯 Player Joined!',
            description: `${message.author.username} joined the Degens Against Decency game!`,
            fields: [
                {
                    name: '👥 Current Players',
                    value: `${playersList}\n\n*${game.players.size}/${game.maxPlayers} players*`
                }
            ],
            footer: {
                text: game.players.size >= 3 ? 'Ready to start! Host can use !cards start' : `Need ${3 - game.players.size} more players to start`
            }
        };

        await message.reply({ embeds: [embed] });

        // Auto-start if we have enough players and host is ready
        if (game.players.size >= 3 && game.players.size >= game.maxPlayers) {
            setTimeout(() => this.beginGame(message, game), 2000);
        }
    }

    // Begin the actual game
    async beginGame(message, game = null) {
        if (!game) {
            game = this.getGameByChannel(message.channel.id);
        }

        if (!game) {
            return message.reply("❌ No game found!");
        }

        if (message.author.id !== game.host && !message.member?.permissions.has('Administrator')) {
            return message.reply("❌ Only the host can start the game!");
        }

        if (game.players.size < 3) {
            return message.reply("❌ Need at least 3 players to start!");
        }

        if (game.phase !== 'joining') {
            return message.reply("❌ Game is already started!");
        }

        // Deal initial hands
        for (const [userId, player] of game.players) {
            player.hand = this.dealWhiteCards(7, game);
        }

        game.phase = 'playing';
        game.currentRound = 1;
        
        await this.startRound(message, game);
    }

    // Start a new round
    async startRound(message, game) {
        // Select Card Czar (rotate through players)
        const playerIds = Array.from(game.players.keys());
        const czarIndex = (game.currentRound - 1) % playerIds.length;
        game.czar = playerIds[czarIndex];
        
        // Draw black card
        game.blackCard = this.drawBlackCard(game);
        game.submissions.clear();

        const czarName = game.players.get(game.czar).username;

        const embed = {
            color: 0x000000,
            title: `🎭 Round ${game.currentRound} - Card Czar: ${czarName}`,
            description: `**Black Card:**\n"${game.blackCard}"`,
            fields: [
                {
                    name: '📋 Instructions',
                    value: `• Everyone except ${czarName} must submit a white card\n• Use \`!cards play <card number>\` to submit\n• ${czarName} will pick the funniest combination!`
                },
                {
                    name: '⏰ Status',
                    value: `Waiting for ${game.players.size - 1} submissions...`
                }
            ],
            footer: {
                text: `Round ${game.currentRound} | First to 5 points wins!`
            }
        };

        await message.channel.send({ embeds: [embed] });

        // Send hands to players (except czar)
        for (const [userId, player] of game.players) {
            if (userId !== game.czar) {
                await this.sendHand(userId, player, game, message.client);
            }
        }
    }

    // Send player's hand via DM
    async sendHand(userId, player, game, client) {
        try {
            const user = await client.users.fetch(userId);
            
            const handText = player.hand
                .map((card, i) => `**${i + 1}.** ${card}`)
                .join('\n');

            const embed = {
                color: 0xFFFFFF,
                title: '🃏 Your Hand - Degens Against Decency',
                description: `**Black Card:** "${game.blackCard}"`,
                fields: [
                    {
                        name: '🎴 Your White Cards',
                        value: handText
                    },
                    {
                        name: '📤 How to Play',
                        value: `Go to the game channel and use:\n\`!cards play <number>\`\n\nExample: \`!cards play 3\``
                    }
                ],
                footer: {
                    text: `Round ${game.currentRound} | Choose wisely!`
                }
            };

            await user.send({ embeds: [embed] });
        } catch (error) {
            console.log(`Could not DM user ${userId}:`, error.message);
        }
    }

    // Helper methods
    getGameByChannel(channelId) {
        for (const [gameId, game] of this.activeGames) {
            if (game.channelId === channelId) {
                return game;
            }
        }
        return null;
    }

    drawBlackCard(game) {
        const available = this.blackCards.filter(card => !game.usedBlackCards.has(card));
        if (available.length === 0) {
            game.usedBlackCards.clear(); // Reset if we've used all cards
            return this.blackCards[Math.floor(Math.random() * this.blackCards.length)];
        }
        const card = available[Math.floor(Math.random() * available.length)];
        game.usedBlackCards.add(card);
        return card;
    }

    dealWhiteCards(count, game) {
        const cards = [];
        for (let i = 0; i < count; i++) {
            const available = this.whiteCards.filter(card => !game.usedWhiteCards.has(card));
            if (available.length === 0) {
                game.usedWhiteCards.clear(); // Reset if we've used all cards
            }
            const card = available.length > 0 
                ? available[Math.floor(Math.random() * available.length)]
                : this.whiteCards[Math.floor(Math.random() * this.whiteCards.length)];
            cards.push(card);
            game.usedWhiteCards.add(card);
        }
        return cards;
    }

    // Play a card
    async playCard(message, args) {
        const game = this.getGameByChannel(message.channel.id);
        if (!game || game.phase !== 'playing') {
            return message.reply("❌ No active game or wrong phase!");
        }

        const userId = message.author.id;
        if (userId === game.czar) {
            return message.reply("❌ Card Czar can't play cards!");
        }

        if (!game.players.has(userId)) {
            return message.reply("❌ You're not in this game!");
        }

        if (game.submissions.has(userId)) {
            return message.reply("❌ You already submitted a card this round!");
        }

        const cardIndex = parseInt(args[0]) - 1;
        const player = game.players.get(userId);

        if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= player.hand.length) {
            return message.reply("❌ Invalid card number! Check your hand in DMs.");
        }

        const selectedCard = player.hand[cardIndex];
        game.submissions.set(userId, selectedCard);

        // Remove card from hand and deal a new one
        player.hand.splice(cardIndex, 1);
        player.hand.push(...this.dealWhiteCards(1, game));

        await message.reply(`✅ Card submitted! You played: "${selectedCard}"`);

        // Check if all players have submitted
        if (game.submissions.size === game.players.size - 1) {
            await this.startJudging(message, game);
        } else {
            const remaining = game.players.size - 1 - game.submissions.size;
            await message.channel.send(`⏳ Waiting for ${remaining} more submissions...`);
        }
    }

    // Start judging phase
    async startJudging(message, game) {
        game.phase = 'judging';
        
        const submissions = Array.from(game.submissions.entries())
            .map(([userId, card], i) => `**${i + 1}.** ${card}`)
            .join('\n\n');

        const czarName = game.players.get(game.czar).username;

        const embed = {
            color: 0xFFD700,
            title: `🏆 Judging Time! - ${czarName}'s Turn`,
            description: `**Black Card:** "${game.blackCard}"`,
            fields: [
                {
                    name: '🎴 Submissions',
                    value: submissions
                },
                {
                    name: '⚖️ Instructions',
                    value: `${czarName}, use \`!cards pick <number>\` to choose the winner!`
                }
            ],
            footer: {
                text: `Round ${game.currentRound} | Judging Phase`
            }
        };

        await message.channel.send({ embeds: [embed] });
    }

    // Pick winner
    async pickWinner(message, args) {
        const game = this.getGameByChannel(message.channel.id);
        if (!game || game.phase !== 'judging') {
            return message.reply("❌ Not in judging phase!");
        }

        if (message.author.id !== game.czar) {
            return message.reply("❌ Only the Card Czar can pick the winner!");
        }

        const choice = parseInt(args[0]) - 1;
        const submissions = Array.from(game.submissions.entries());

        if (isNaN(choice) || choice < 0 || choice >= submissions.length) {
            return message.reply("❌ Invalid choice! Pick a number from the submissions.");
        }

        const [winnerId, winningCard] = submissions[choice];
        const winner = game.players.get(winnerId);
        
        // Award point
        game.scores.set(winnerId, (game.scores.get(winnerId) || 0) + 1);
        const newScore = game.scores.get(winnerId);

        const embed = {
            color: 0x00FF00,
            title: '🎉 Round Winner!',
            description: `**${winner.username}** wins Round ${game.currentRound}!`,
            fields: [
                {
                    name: '🏆 Winning Combo',
                    value: `"${game.blackCard}"\n\n**"${winningCard}"**`
                },
                {
                    name: '📊 Scores',
                    value: this.getScoreBoard(game)
                }
            ],
            footer: {
                text: newScore >= 5 ? 'GAME WINNER!' : `${winner.username} now has ${newScore} points!`
            }
        };

        await message.channel.send({ embeds: [embed] });

        // Check for game winner
        if (newScore >= 5) {
            await this.endGame(message, game, winnerId);
        } else {
            // Start next round
            game.currentRound++;
            game.phase = 'playing';
            setTimeout(() => this.startRound(message, game), 3000);
        }
    }

    // Get scoreboard
    getScoreBoard(game) {
        return Array.from(game.scores.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([userId, score]) => {
                const player = game.players.get(userId);
                return `${player.username}: ${score} points`;
            })
            .join('\n');
    }

    // End game
    async endGame(message, game, winnerId = null) {
        this.gameChannels.delete(game.channelId);
        this.activeGames.delete(game.id);

        const embed = {
            color: 0xFF1493,
            title: '🎮 Game Over - Degens Against Decency',
            description: winnerId 
                ? `🏆 **${game.players.get(winnerId).username}** wins the game!`
                : 'Game ended by host.',
            fields: [
                {
                    name: '📊 Final Scores',
                    value: this.getScoreBoard(game)
                },
                {
                    name: '📈 Game Stats',
                    value: `• Rounds played: ${game.currentRound}\n• Players: ${game.players.size}\n• Duration: ${Math.round((Date.now() - game.startedAt) / 1000 / 60)} minutes`
                }
            ],
            footer: {
                text: 'Thanks for playing! Use !cards start to play again.'
            }
        };

        await message.channel.send({ embeds: [embed] });
    }

    // Game status
    async showStatus(message) {
        const game = this.getGameByChannel(message.channel.id);
        if (!game) {
            return message.reply("❌ No active game in this channel!");
        }

        const embed = {
            color: 0x9932CC,
            title: '📊 Game Status - Degens Against Decency',
            fields: [
                {
                    name: '🎮 Game Info',
                    value: `Phase: ${game.phase}\nRound: ${game.currentRound}\nCard Czar: ${game.czar ? game.players.get(game.czar).username : 'None'}`
                },
                {
                    name: '👥 Players',
                    value: Array.from(game.players.values()).map(p => p.username).join(', ')
                },
                {
                    name: '📊 Scores',
                    value: this.getScoreBoard(game)
                }
            ]
        };

        if (game.blackCard) {
            embed.fields.push({
                name: '🃏 Current Black Card',
                value: `"${game.blackCard}"`
            });
        }

        await message.reply({ embeds: [embed] });
    }
}

module.exports = DegensCardGame;
