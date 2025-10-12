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

// ...existing code...
if (reaction.emoji.name === '🔥') {
	const user = await getUserData(reaction.message.author.id);
	user.respect += 5; // Add 5 respect points
	await user.save();
}
