module.exports = function (app) {
	app.addSchema({
		$id: "ChatChannel",
		type: "object",
		properties: {
			id: { type: "string" },
			type: { type: "string" },
			ownerId: { type: "string" },
			members: { type: "array", items: { $ref: "ChatMember" } },
			name: { type: "string" },
			description: { type: "string" },
			createdAt: { type: "number" },
			updatedAt: { type: "number", allowNull: true },
		},
	});

	app.addSchema({
		$id: "ChatChannelList",
		type: "array",
		items: {
			$ref: "ChatChannel",
		},
	});

	async function getChannel(user, id) {
		const channels = await app.db.models.ChatChannel.forMember(user);
		const channel = channels.find((c) => c.id === id);

		if (!channel) {
			return null;
		}

		return {
			id: channel.id,
			type: channel.type,
			ownerId: channel.owner.id,
			members: channel.members.map((m) => ({ id: m.hashid, username: m.username, avatar: m.avatar })),
			name: channel.name,
			description: channel.description,
			createdAt: channel.createdAt,
			updatedAt: channel.updatedAt,
		};
	}

	async function getChannels(user) {
		const channels = await app.db.models.ChatChannel.forMember(user);

		return channels.map((channel) => ({
			id: channel.id,
			type: channel.type,
			ownerId: channel.owner.hashid,
			members: channel.members.map((m) => ({ id: m.hashid, username: m.username, avatar: m.avatar })),
			name: channel.name,
			description: channel.description,
			createdAt: channel.createdAt,
			updatedAt: channel.updatedAt,
		}));
	}

	app.addSchema({
		$id: "PaginationParams",
		type: "object",
		properties: {
			query: { type: "string" },
			cursor: { type: "string" },
			limit: { type: "number" },
		},
	});

	async function getMembers(user, channelId) {
		const channel = await getChannel(user, channelId);

		if (channel) {
			return channel.members;
		}
		return [];
	}

	return {
		getChannel,
		getChannels,
		getMembers,
	};
};
