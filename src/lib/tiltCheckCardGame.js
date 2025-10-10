const { EmbedBuilder } = require('discord.js');

class TiltCheckCardGame {
    constructor() {
        this.games = new Map(); // channelId -> game data
        this.blackCards = [
            "When you lose a pot with pocket aces, you immediately _____.",
            "The best way to handle a bad beat is to _____.",
            "After losing 10 buy-ins in a row, most players _____.",
            "When someone calls your all-in with 7-2 offsuit and wins, you _____.",
            "The poker room was shocked when I _____ after a river suckout.",
            "My biggest tilt moment was when I _____ at the casino.",
            "When the fish hits a one-outer on the river, I usually _____.",
            "After my 5th bad beat of the night, I decided to _____.",
            "The dealer couldn't believe I _____ after losing with quads.",
            "When someone slow-rolls pocket aces, the appropriate response is _____.",
            "My bankroll management went out the window when I _____.",
            "The chat went wild when I _____ after a brutal cooler.",
            "When variance hits hard, smart players _____.",
            "After losing to runner-runner, I immediately _____.",
            "The tilted player at table 3 was caught _____ in the bathroom.",
            "When you're stuck 20 buy-ins, it's time to _____.",
            "My girlfriend left me because I _____ after a poker session.",
            "The security cameras caught me _____ after a bad beat.",
            "When someone 3-bets your AA with 72o and wins, you _____.",
            "The ultimate tilt move is to _____ and rage quit."
        ];

        this.whiteCards = [
            "Throwing your cards at the dealer",
            "Screaming about variance for 20 minutes",
            "Blaming the deck shuffle algorithm",
            "Going all-in with 7-2 offsuit",
            "Crying into your chip stack",
            "Calling the floor manager a fish",
            "Posting bad beat stories on Twitter",
            "Drinking until the cards look good",
            "Switching to slots for 'better odds'",
            "Rage-folding pocket kings preflop",
            "Throwing chairs across the room",
            "Demanding a new deck every hand",
            "Counting cards like a degenerate",
            "Betting your car title",
            "Moving up stakes to 'get even'",
            "Blaming the position of the moon",
            "Lecture everyone about 'real poker'",
            "Eating the community cards",
            "Flipping tables like a maniac",
            "Accusing everyone of cheating",
            "Meditation and deep breathing",
            "Taking a responsible break",
            "Accepting variance as part of poker",
            "Studying hand ranges calmly",
            "Maintaining proper bankroll management",
            "Laughing off the bad beat",
            "Congratulating the winner graciously",
            "Focusing on long-term EV",
            "Taking notes on opponent tendencies",
            "Staying hydrated and alert",
            "Playing within your limits",
            "Understanding it's just math",
            "Keeping emotions in check",
            "Making rational decisions only",
            "Enjoying the social aspect",
            "Learning from every session",
            "Maintaining a healthy perspective",
            "Practicing good poker discipline",
            "Setting stop-loss limits",
            "Taking regular mental breaks"
        ];
    }

    async startGame(message, maxPlayers = 6) {
        const channelId = message.channel.id;
        
        if (this.games.has(channelId)) {
            return message.reply('❌ A Tilt Check game is already running in this channel! Use `!tiltcards end` to stop it.');
        }

        const game = {
            channelId,
            host: message.author.id,
            players: [{
                id: message.author.id,
                username: message.author.username,
                hand: [],
                score: 0,
                tiltLevel: 0
            }],
            maxPlayers,
            currentBlackCard: null,
            currentCzar: 0,
            submissions: new Map(),
            gamePhase: 'waiting', // waiting, submitting, judging, ended
            roundNumber: 0,
            winningScore: 5
        };

        this.games.set(channelId, game);
        
        const embed = new EmbedBuilder()
            .setColor(0x9932cc)
            .setTitle('🎰 Tilt Check Card Game Started!')
            .setDescription('A poker-themed Cards Against Humanity style game!')
            .addFields(
                {
                    name: '🎮 Game Info',
                    value: `Host: ${message.author.username}\nMax Players: ${maxPlayers}\nWin Condition: ${game.winningScore} points`,
                    inline: true
                },
                {
                    name: '👥 Players (1/' + maxPlayers + ')',
                    value: `1. ${message.author.username} 🎯`,
                    inline: true
                },
                {
                    name: '🃏 How to Play',
                    value: '• Players submit funny white cards to complete prompts\n• The Card Czar picks the funniest combo\n• First to 5 points wins!\n• Poker/tilt themed cards for maximum laughs',
                    inline: false
                },
                {
                    name: '🚀 Join Now!',
                    value: 'Type `!tiltcards join` to join this game',
                    inline: false
                }
            )
            .setFooter({ text: 'Game starts when 3+ players join' });

        await message.reply({ embeds: [embed] });
    }

    async joinGame(message) {
        const channelId = message.channel.id;
        const game = this.games.get(channelId);

        if (!game) {
            return message.reply('❌ No Tilt Check game running in this channel! Use `!tiltcards start` to begin.');
        }

        if (game.gamePhase !== 'waiting') {
            return message.reply('❌ Game already in progress! Wait for the next round.');
        }

        if (game.players.find(p => p.id === message.author.id)) {
            return message.reply('❌ You\'re already in this game!');
        }

        if (game.players.length >= game.maxPlayers) {
            return message.reply('❌ Game is full!');
        }

        game.players.push({
            id: message.author.id,
            username: message.author.username,
            hand: [],
            score: 0,
            tiltLevel: 0
        });

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🎉 Player Joined!')
            .setDescription(`${message.author.username} joined the Tilt Check game!`)
            .addFields({
                name: `👥 Players (${game.players.length}/${game.maxPlayers})`,
                value: game.players.map((p, i) => `${i + 1}. ${p.username} ${i === game.currentCzar ? '👑' : '🎯'}`).join('\n'),
                inline: false
            });

        if (game.players.length >= 3) {
            embed.addFields({
                name: '🚀 Ready to Start!',
                value: 'The host can type `!tiltcards begin` to start the game',
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });
    }

    async beginGame(message) {
        const channelId = message.channel.id;
        const game = this.games.get(channelId);

        if (!game) {
            return message.reply('❌ No game found!');
        }

        if (message.author.id !== game.host) {
            return message.reply('❌ Only the host can start the game!');
        }

        if (game.players.length < 3) {
            return message.reply('❌ Need at least 3 players to start!');
        }

        // Deal initial hands
        for (const player of game.players) {
            player.hand = this.dealWhiteCards(7);
            await this.sendHandToPlayer(player);
        }

        await this.startNewRound(message, game);
    }

    async startNewRound(message, game) {
        game.roundNumber++;
        game.gamePhase = 'submitting';
        game.submissions.clear();
        
        // Pick a random black card
        game.currentBlackCard = this.blackCards[Math.floor(Math.random() * this.blackCards.length)];
        
        const czar = game.players[game.currentCzar];
        
        const embed = new EmbedBuilder()
            .setColor(0xff1493)
            .setTitle(`🎰 Round ${game.roundNumber} - Tilt Check!`)
            .setDescription(`**Card Czar:** ${czar.username} 👑`)
            .addFields(
                {
                    name: '🖤 Black Card',
                    value: `"${game.currentBlackCard}"`,
                    inline: false
                },
                {
                    name: '📝 Submission Phase',
                    value: 'All players (except the Czar) submit your funniest white card!\nUse `!tiltcards play <card number>` to submit',
                    inline: false
                },
                {
                    name: '🏆 Current Scores',
                    value: game.players.map(p => `${p.username}: ${p.score} points ${p.score >= game.winningScore ? '👑' : ''}`).join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: 'Check your DMs for your hand!' });

        await message.reply({ embeds: [embed] });

        // Send hands to all non-czar players
        for (const player of game.players) {
            if (player.id !== czar.id) {
                await this.sendHandToPlayer(player);
            }
        }
    }

    async playCard(message, args) {
        const channelId = message.channel.id;
        const game = this.games.get(channelId);

        if (!game || game.gamePhase !== 'submitting') {
            return message.reply('❌ No active submission phase!');
        }

        const player = game.players.find(p => p.id === message.author.id);
        const czar = game.players[game.currentCzar];

        if (!player) {
            return message.reply('❌ You\'re not in this game!');
        }

        if (player.id === czar.id) {
            return message.reply('❌ The Card Czar doesn\'t submit cards!');
        }

        if (game.submissions.has(player.id)) {
            return message.reply('❌ You already submitted a card!');
        }

        const cardIndex = parseInt(args[0]) - 1;
        if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= player.hand.length) {
            return message.reply('❌ Invalid card number! Check your DM for your hand.');
        }

        const submittedCard = player.hand[cardIndex];
        game.submissions.set(player.id, {
            player: player,
            card: submittedCard
        });

        // Replace the played card
        player.hand.splice(cardIndex, 1);
        player.hand.push(this.dealWhiteCards(1)[0]);

        await message.reply('✅ Card submitted! Wait for other players...');

        // Check if all players have submitted
        const expectedSubmissions = game.players.length - 1; // Excluding czar
        if (game.submissions.size === expectedSubmissions) {
            await this.startJudgingPhase(message, game);
        }
    }

    async startJudgingPhase(message, game) {
        game.gamePhase = 'judging';
        const czar = game.players[game.currentCzar];
        
        const submissions = Array.from(game.submissions.values());
        const shuffledSubmissions = submissions.sort(() => Math.random() - 0.5);

        const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('🎭 Judging Phase - Pick the Funniest!')
            .setDescription(`**Card Czar ${czar.username}**, choose the funniest combination!`)
            .addFields(
                {
                    name: '🖤 The Prompt',
                    value: `"${game.currentBlackCard}"`,
                    inline: false
                },
                {
                    name: '🤍 Submissions',
                    value: shuffledSubmissions.map((sub, index) => 
                        `**${index + 1}.** ${sub.card}`
                    ).join('\n\n'),
                    inline: false
                },
                {
                    name: '👑 Czar Action',
                    value: `${czar.username}, use \`!tiltcards pick <number>\` to choose the winner!`,
                    inline: false
                }
            )
            .setFooter({ text: 'May the funniest card win!' });

        await message.reply({ embeds: [embed] });

        // Store shuffled order for picking
        game.shuffledSubmissions = shuffledSubmissions;
    }

    async pickWinner(message, args) {
        const channelId = message.channel.id;
        const game = this.games.get(channelId);

        if (!game || game.gamePhase !== 'judging') {
            return message.reply('❌ No active judging phase!');
        }

        const czar = game.players[game.currentCzar];
        if (message.author.id !== czar.id) {
            return message.reply('❌ Only the Card Czar can pick the winner!');
        }

        const choiceIndex = parseInt(args[0]) - 1;
        if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= game.shuffledSubmissions.length) {
            return message.reply('❌ Invalid choice number!');
        }

        const winningSubmission = game.shuffledSubmissions[choiceIndex];
        winningSubmission.player.score++;

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('🏆 Round Winner!')
            .setDescription(`**${winningSubmission.player.username}** wins this round!`)
            .addFields(
                {
                    name: '🎉 Winning Combination',
                    value: `"${game.currentBlackCard}"\n\n**${winningSubmission.card}**`,
                    inline: false
                },
                {
                    name: '📊 Updated Scores',
                    value: game.players
                        .sort((a, b) => b.score - a.score)
                        .map(p => `${p.username}: ${p.score} points ${p.score >= game.winningScore ? '👑' : ''}`)
                        .join('\n'),
                    inline: false
                }
            );

        // Check for game winner
        if (winningSubmission.player.score >= game.winningScore) {
            embed.setTitle('🎊 GAME WINNER!')
                .setDescription(`**${winningSubmission.player.username}** wins the entire game!`)
                .addFields({
                    name: '🎰 Tilt Check Champion!',
                    value: `Congratulations! You've proven you can handle the variance and tilt like a pro!`,
                    inline: false
                });
            
            this.games.delete(channelId);
            await message.reply({ embeds: [embed] });
            return;
        }

        await message.reply({ embeds: [embed] });

        // Move to next round
        game.currentCzar = (game.currentCzar + 1) % game.players.length;
        
        setTimeout(async () => {
            await this.startNewRound(message, game);
        }, 3000);
    }

    async showStatus(message) {
        const channelId = message.channel.id;
        const game = this.games.get(channelId);

        if (!game) {
            return message.reply('❌ No Tilt Check game running in this channel!');
        }

        const czar = game.players[game.currentCzar];
        
        const embed = new EmbedBuilder()
            .setColor(0x9932cc)
            .setTitle('🎰 Tilt Check Game Status')
            .addFields(
                {
                    name: '🎮 Game Info',
                    value: `Round: ${game.roundNumber}\nPhase: ${game.gamePhase}\nCzar: ${czar?.username || 'None'} 👑`,
                    inline: true
                },
                {
                    name: '👥 Players',
                    value: game.players.map(p => `${p.username}: ${p.score}/${game.winningScore} points`).join('\n'),
                    inline: true
                },
                {
                    name: '🖤 Current Prompt',
                    value: game.currentBlackCard || 'No active round',
                    inline: false
                }
            );

        if (game.gamePhase === 'submitting') {
            const submitted = game.submissions.size;
            const total = game.players.length - 1;
            embed.addFields({
                name: '📝 Submissions',
                value: `${submitted}/${total} players have submitted cards`,
                inline: false
            });
        }

        await message.reply({ embeds: [embed] });
    }

    async endGame(message, game) {
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('🎰 Tilt Check Game Ended')
            .setDescription('The game has been ended by the host or admin.')
            .addFields({
                name: '📊 Final Scores',
                value: game.players
                    .sort((a, b) => b.score - a.score)
                    .map((p, i) => `${i + 1}. ${p.username}: ${p.score} points`)
                    .join('\n'),
                inline: false
            })
            .setFooter({ text: 'Thanks for playing Tilt Check!' });

        this.games.delete(game.channelId);
        await message.reply({ embeds: [embed] });
    }

    getGameByChannel(channelId) {
        return this.games.get(channelId);
    }

    dealWhiteCards(count) {
        const cards = [];
        for (let i = 0; i < count; i++) {
            cards.push(this.whiteCards[Math.floor(Math.random() * this.whiteCards.length)]);
        }
        return cards;
    }

    async sendHandToPlayer(player) {
        try {
            // Get client from the module that requires this
            const { Client } = require('discord.js');
            const client = new Client({ intents: [] }); // This will use the same instance
            
            // Alternative: pass client as parameter or use a global reference
            if (global.discordClient) {
                const user = await global.discordClient.users.fetch(player.id);
                
                const embed = new EmbedBuilder()
                    .setColor(0xffffff)
                    .setTitle('🤍 Your Hand - Tilt Check Cards')
                    .setDescription('Here are your white cards for this round:')
                    .addFields({
                        name: '🎯 Your Cards',
                        value: player.hand.map((card, index) => `**${index + 1}.** ${card}`).join('\n'),
                        inline: false
                    })
                    .setFooter({ text: 'Use !tiltcards play <number> in the game channel to submit' });

                await user.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Could not send DM to player:', error);
        }
    }
}

module.exports = TiltCheckCardGame;
