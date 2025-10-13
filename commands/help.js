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

module.exports = {
  name: 'help',
  description: 'Lists all available commands.',
  async execute(message) {
    const commands = message.client.commands.map(cmd => `**${cmd.name}**: ${cmd.description}`).join('\n');
    message.channel.send(`Available commands:\n${commands}`);
  },
};
