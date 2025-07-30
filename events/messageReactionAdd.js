// ...existing code...
if (reaction.emoji.name === '🔥') {
	const user = await getUserData(reaction.message.author.id);
	user.respect += 5; // Add 5 respect points
	await user.save();
}
