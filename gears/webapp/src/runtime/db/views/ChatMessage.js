module.exports = function (app) {
	app.addSchema({
		$id: "ChatMessage",
		type: "object",
		properties: {
			id: { type: "string" },
			author: { $ref: "ChatMember" },
			content: { type: "string" },
			createdAt: { type: "number" },
			editedAt: { type: "number", allowNull: true },
			deleted: { type: "boolean" },
		},
	});

	app.addSchema({
		$id: "ChatMessageList",
		type: "array",
		items: {
			$ref: "ChatMessage",
		},
	});

	async function deleteMessage(user, channelId, messageId) {
		const message = await app.db.models.ChatMessage.byId(messageId);
		if (message.userId === user.id && message.channelId === channelId) {
			await message.update({ deleted: true });
			//await message.destroy()
		}
	}

	async function edit(user, channelId, msg) {
		const message = await app.db.models.ChatMessage.byId(msg.id);
		if (message.userId === user.id && message.channelId === channelId) {
			await message.update({ content: msg.content, editedAt: Date.now() });
		}
		return message;
	}

	return {
		delete: deleteMessage,
		edit,
	};
};
