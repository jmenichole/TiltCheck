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

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGamepad, FaDice, FaTable, FaArrowRight, FaDesktop } from 'react-icons/fa';

import KenoDemo from './KenoDemo';
import PlinkoDemo from './PlinkoDemo';
import BlackjackDemo from './BlackjackDemo';
import ScreenMonitorDemo from './ScreenMonitorDemo';

const gameLibrary = [
  {
    id: 'screen-monitor',
    name: 'Screen Monitor Try Me',
    icon: FaDesktop,
    blurb: 'Requests desktop screen access so TiltCheck can overlay live tilt interventions in a safe sandbox.',
    component: ScreenMonitorDemo
  },
  {
    id: 'keno',
    name: 'Keno Risk Monitor',
    icon: FaTable,
    blurb: 'Tracks scatter-shot volatility and rapid fire betting patterns common in keno lobbies.',
    component: KenoDemo
  },
  {
    id: 'plinko',
    name: 'Plinko Impact Model',
    icon: FaDice,
    blurb: 'Demonstrates provably fair peg drops with instant tilt scoring across volatility profiles.',
    component: PlinkoDemo
  },
  {
    id: 'blackjack',
    name: 'Blackjack Session Review',
    icon: FaGamepad,
    blurb: 'Shows how TiltCheck follows standard table play, multi-hand streaks, and bankroll swings.',
    component: BlackjackDemo
  }
];

const GameDemoHub = () => {
  const [activeGame, setActiveGame] = useState('screen-monitor');

  const ActiveComponent = useMemo(() => {
    const entry = gameLibrary.find((item) => item.id === activeGame);
    return entry ? entry.component : KenoDemo;
  }, [activeGame]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-dark-light rounded-xl p-6 border border-primary/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Provably Fair Game Demos</h2>
            <p className="text-gray-300 text-sm mt-2 max-w-3xl">
              Tap any game below to spin up a live sandbox. Every round streams simulated telemetry into TiltCheck so
              investors can see tilt scores, risk escalations, and provably fair audit trails without touching production
              wallets.
            </p>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm text-primary flex items-start gap-3 max-w-sm">
            <FaArrowRight className="mt-1" />
            <div>
              Tilt triggers are calculated in real-time using our demo heuristics. Push the games hard to see the alert
              pipeline escalate from informational to critical.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gameLibrary.map(({ id, name, icon: Icon, blurb }) => (
          <button
            key={id}
            onClick={() => setActiveGame(id)}
            className={`text-left p-4 rounded-xl transition-all border ${
              activeGame === id
                ? 'bg-primary text-white border-primary'
                : 'bg-dark border-gray-700 text-gray-300 hover:border-primary/50 hover:-translate-y-1'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="text-xl" />
              <div>
                <div className="font-semibold">{name}</div>
                <div className="text-xs opacity-80 mt-1 leading-relaxed">{blurb}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <ActiveComponent />
    </motion.div>
  );
};

export default GameDemoHub;

