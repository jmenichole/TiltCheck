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

import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaHandPaper, FaHandPointRight, FaPlay, FaRedo, FaShieldAlt } from 'react-icons/fa';

import { useTiltTracker } from '../utils/useTiltTracker';
import { useTiltAlerts } from '../context/TiltAlertContext';
import { generateServerSeed, shuffleWithSeeds } from '../utils/provablyFair';

const suits = ['S', 'H', 'D', 'C'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const buildDeck = () => {
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({
        rank,
        suit,
        label: `${rank}${suit}`
      });
    });
  });
  return deck;
};

const cardValue = (card) => {
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card.rank)) return 10;
  return Number(card.rank);
};

const calculateTotal = (hand) => {
  let total = 0;
  let aces = 0;
  hand.forEach((card) => {
    total += cardValue(card);
    if (card.rank === 'A') aces += 1;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
};

const formatHand = (hand) => (hand.length ? hand.map((card) => card.label).join(' ') : '--');

const BlackjackDemo = () => {
  const baseDeck = useMemo(() => buildDeck(), []);
  const [clientSeed, setClientSeed] = useState(() => generateServerSeed());
  const [serverSeed, setServerSeed] = useState(() => generateServerSeed());
  const [nonce, setNonce] = useState(1);
  const [betSize, setBetSize] = useState(25);
  const [balance, setBalance] = useState(1000);

  const [deck, setDeck] = useState(baseDeck);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [roundState, setRoundState] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Press deal to start a monitored blackjack session.');
  const [roundSeed, setRoundSeed] = useState(null);

  const { metrics, registerRound, resetTracker } = useTiltTracker('Blackjack');
  const { pushAlert } = useTiltAlerts();
  const previousRiskRef = useRef('Low');
  const riskRank = { Low: 0, Medium: 1, High: 2, Critical: 3 };

  const announceTiltEscalation = (snapshot, context) => {
    if (!snapshot) return;
    const level = snapshot.riskLevel || 'Low';
    const prev = previousRiskRef.current || 'Low';
    const severityMap = { Medium: 'info', High: 'warning', Critical: 'critical' };
    if (riskRank[level] > riskRank[prev] && severityMap[level]) {
      pushAlert({
        level: severityMap[level],
        title: `${snapshot.gameName} ${level} Tilt`,
        message: `${context} • Combined score ${snapshot.tiltScore.toFixed(1)}/10 (AI ${snapshot.aiTiltScore.toFixed(1)}/10, ${(snapshot.aiConfidence * 100).toFixed(0)}% confidence).`,
        source: snapshot.gameName,
        meta: {
          tiltScore: snapshot.tiltScore,
          aiLabel: snapshot.aiLabel,
          aiConfidence: snapshot.aiConfidence,
          riskLevel: snapshot.riskLevel,
          gameName: snapshot.gameName,
          primarySignal: snapshot.primarySignalLabel
        }
      });
    }
    previousRiskRef.current = level;
  };

  const resolveRound = (outcome, payoutMultiplier, message, context = {}) => {
    const seedSource = context.seed ?? roundSeed;
    const playerCards = context.playerHand ?? playerHand;
    const dealerCards = context.dealerHand ?? dealerHand;
    const deckSnapshot = context.deck ?? deck;

    if (!seedSource) return;

    const profit = betSize * payoutMultiplier;
    const volatility = payoutMultiplier >= 1.5 ? 3 : payoutMultiplier === 0 ? 2 : 2.5;

    const snapshot = registerRound({
      bet: betSize,
      profit,
      outcome,
      volatility,
      provablyFair: {
        ...seedSource,
        shoeDepth: 52 - deckSnapshot.length,
        playerHand: playerCards.map((card) => card.label),
        dealerHand: dealerCards.map((card) => card.label),
        outcome,
        message
      }
    });

    const contextLabel = snapshot ? `Hand #${snapshot.roundsPlayed}` : 'Hand';
    announceTiltEscalation(snapshot, `${contextLabel} ${outcome.toUpperCase()} — ${message}`);

    setBalance((prev) => Number((prev + profit).toFixed(2)));
    setStatusMessage(message);
    setRoundState('complete');
  };

  const dealHand = () => {
    const newServerSeed = generateServerSeed();
    const newNonce = nonce + 1;
    const shuffled = shuffleWithSeeds(baseDeck, newServerSeed, clientSeed, newNonce);
    const newDeck = shuffled.slice(4);
    const player = [shuffled[0], shuffled[2]];
    const dealer = [shuffled[1], shuffled[3]];

    const playerTotal = calculateTotal(player);
    const dealerTotal = calculateTotal([dealer[0]]);

    setDeck(newDeck);
    setPlayerHand(player);
    setDealerHand(dealer);
    setServerSeed(newServerSeed);
    setNonce(newNonce);
    setRoundSeed({ serverSeed: newServerSeed, clientSeed, nonce: newNonce });
    setRoundState('player');

    if (playerTotal === 21) {
      const dealerPeek = calculateTotal(dealer);
      if (dealerPeek === 21) {
        resolveRound('push', 0, 'Both hands open with blackjack. Push.', {
          seed: { serverSeed: newServerSeed, clientSeed, nonce: newNonce },
          playerHand: player,
          dealerHand: dealer,
          deck: newDeck
        });
      } else {
        resolveRound('win', 1.5, 'Natural blackjack pays 3:2.', {
          seed: { serverSeed: newServerSeed, clientSeed, nonce: newNonce },
          playerHand: player,
          dealerHand: dealer,
          deck: newDeck
        });
      }
    } else {
      setStatusMessage(`Player total ${playerTotal}. Dealer showing ${dealerTotal}.`);
    }
  };

  const hit = () => {
    if (roundState !== 'player') return;
    const [nextCard, ...restDeck] = deck;
    const newHand = [...playerHand, nextCard];
    const total = calculateTotal(newHand);

    setDeck(restDeck);
    setPlayerHand(newHand);

    if (total > 21) {
      resolveRound('loss', -1, `Player busts at ${total}.`, {
        playerHand: newHand,
        deck: restDeck
      });
    } else {
      setStatusMessage(`Player total ${total}. Choose to hit or stand.`);
    }
  };

  const stand = () => {
    if (roundState !== 'player') return;
    setRoundState('dealer');
    let workingHand = [...dealerHand];
    let workingDeck = [...deck];

    while (calculateTotal(workingHand) < 17 && workingDeck.length > 0) {
      const [card, ...rest] = workingDeck;
      workingHand = [...workingHand, card];
      workingDeck = rest;
    }

    const playerTotal = calculateTotal(playerHand);
    const dealerTotal = calculateTotal(workingHand);

    setDealerHand(workingHand);
    setDeck(workingDeck);

    if (dealerTotal > 21) {
      resolveRound('win', 1, `Dealer busts at ${dealerTotal}.`, {
        dealerHand: workingHand,
        deck: workingDeck
      });
      return;
    }
    if (dealerTotal === playerTotal) {
      resolveRound('push', 0, 'Totals match. Push.', {
        dealerHand: workingHand,
        deck: workingDeck
      });
      return;
    }
    if (playerTotal > dealerTotal) {
      resolveRound('win', 1, `Player wins ${playerTotal} over ${dealerTotal}.`, {
        dealerHand: workingHand,
        deck: workingDeck
      });
    } else {
      resolveRound('loss', -1, `Dealer wins ${dealerTotal} over ${playerTotal}.`, {
        dealerHand: workingHand,
        deck: workingDeck
      });
    }
  };

  const resetSession = () => {
    setClientSeed(generateServerSeed());
    setServerSeed(generateServerSeed());
    setNonce(1);
    setDeck(baseDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setRoundState('idle');
    setStatusMessage('Session cleared. Deal to start again.');
    setRoundSeed(null);
    setBalance(1000);
    previousRiskRef.current = 'Low';
    resetTracker();
  };

  return (
    <motion.div initial={{ opacity: 0.1 }} animate={{ opacity: 1 }} className="bg-dark-light rounded-xl border border-gray-700 p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="space-y-4 lg:w-2/3">
          <h3 className="text-xl font-semibold text-white">Blackjack Session Review</h3>
          <p className="text-sm text-gray-300">
            Demonstrate deck proven fairness, live tilt scoring, and escalation logic during aggressive blackjack sessions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dark border border-gray-700 rounded-xl p-4">
              <div className="text-gray-400 text-xs uppercase mb-1">Player Hand</div>
              <div className="text-white text-lg font-semibold">{formatHand(playerHand)}</div>
              <div className="text-sm text-gray-300 mt-1">Total: {calculateTotal(playerHand)}</div>
            </div>
            <div className="bg-dark border border-gray-700 rounded-xl p-4">
              <div className="text-gray-400 text-xs uppercase mb-1">Dealer Hand</div>
              <div className="text-white text-lg font-semibold">{formatHand(dealerHand)}</div>
              <div className="text-sm text-gray-300 mt-1">Total: {calculateTotal(dealerHand)}</div>
            </div>
          </div>

          <div className="bg-dark border border-gray-700 rounded-xl p-4 text-sm text-gray-300">
            <div>{statusMessage}</div>
            {roundSeed && (
              <div className="mt-2 text-xs text-gray-500">
                Seeds {roundSeed.serverSeed.slice(0, 10)}... / {roundSeed.clientSeed.slice(0, 10)}... • Nonce {roundSeed.nonce}
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Bet Size</label>
              <input
                type="number"
                min="5"
                value={betSize}
                onChange={(event) => setBetSize(Number(event.target.value) || 5)}
                className="bg-dark border border-gray-600 rounded px-3 py-2 text-white w-32"
              />
              <div className="text-xs text-gray-400 mt-1">Balance: {balance.toFixed(2)}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={resetSession}
                className="px-4 py-2 border border-gray-600 rounded-lg bg-dark text-gray-300 hover:border-primary/60 transition-colors"
              >
                <FaRedo /> Reset Session
              </button>
              <button
                onClick={dealHand}
                disabled={roundState === 'player'}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  roundState === 'player'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark text-white'
                }`}
              >
                <FaPlay /> Deal Hand
              </button>
              <button
                onClick={hit}
                disabled={roundState !== 'player'}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  roundState === 'player'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaHandPointRight /> Hit
              </button>
              <button
                onClick={stand}
                disabled={roundState !== 'player'}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  roundState === 'player'
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaHandPaper /> Stand
              </button>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 space-y-4">
          <motion.div className="bg-primary/10 border border-primary/40 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <FaShieldAlt /> TiltCheck Risk Snapshot
            </div>
            <div className="text-white text-3xl font-bold">{metrics.riskLevel}</div>
            <div className="text-sm text-gray-300 mt-2">Tilt Score: {metrics.tiltScore}</div>
            <div className="text-xs text-gray-400 mt-1">AI Model: {metrics.aiLabel} ({(metrics.aiConfidence * 100).toFixed(0)}% confidence)</div>
            <div className="text-xs text-gray-500 mt-1">Top Factor: {metrics.primarySignalLabel}</div>
            <div className="text-sm text-gray-300">Loss streak: {metrics.lossStreak} • Bet pressure: {metrics.betIncreaseStreak}</div>
            <div className="text-sm text-gray-300">Pace: {metrics.pace} rounds/min</div>
            <div className="text-sm text-primary mt-3">{metrics.recommendation}</div>
          </motion.div>

          <div className="bg-dark rounded-xl border border-gray-700 p-4">
            <h4 className="text-white font-semibold mb-3">Recent Hands</h4>
            <div className="space-y-3 text-sm text-gray-300">
              {metrics.history.length === 0 && <div>No hands recorded yet.</div>}
              {metrics.history.map((entry) => (
                <div key={entry.id} className="border border-gray-700 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span>Hand #{entry.round}</span>
                    <span className={entry.outcome === 'win' ? 'text-green-400' : entry.outcome === 'loss' ? 'text-red-400' : 'text-gray-300'}>
                      {entry.outcome.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Bet {entry.bet} • Net {entry.profit.toFixed(2)} • Risk {entry.riskLevel} • AI {entry.aiTiltScore?.toFixed(1) ?? '0.0'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Player {entry.provablyFair.playerHand.join(' ')} vs Dealer {entry.provablyFair.dealerHand.join(' ')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{entry.primarySignalLabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlackjackDemo;

