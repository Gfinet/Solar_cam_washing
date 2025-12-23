module.exports = async function (app) {
	app.addHook("preHandler", app.verifySession);

	// CHANNEL

	app.get(
		"/channels",
		{
			schema: {
				summary: "Get a list of channels for the given user",
				tags: ["ChatChannel"],
				response: {
					200: {
						$ref: "ChatChannelList",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const response = await app.db.views.ChatChannel.getChannels(user);

			reply.send(response);
		}
	);

	app.get(
		"/channels/:id",
		{
			schema: {
				summary: "Get the channel info",
				tags: ["ChatChannel"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				response: {
					200: {
						$ref: "ChatChannel",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.id;
			const response = await app.db.views.ChatChannel.getChannel(user, channelId);

			if (response) {
				reply.send(response);
				return;
			}

			reply.code(404).send({ code: "not_found", error: "Not Found" });
		}
	);

	app.patch(
		"/channels/:id",
		{
			schema: {
				summary: "Update a channel's settings",
				tags: ["ChatChannel"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				body: {
					type: "object",
					properties: {
						name: { type: "string" },
						type: { type: "string" },
						description: { type: "string" },
					},
					// TODO: Optionnal props
					required: ["name", "type", "description"],
				},
				response: {
					200: {
						$ref: "ChatChannel",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.id;

			try {
				const response = await app.db.views.ChatChannel.modifyChannel(user, channelId);
				if (response) {
					reply.send(response);
					return;
				}

				reply.code(404).send({ code: "not_found", error: "Not Found" });
			} catch (error) {
				reply.code(400).send({ code: "invalid_request", error: error.toString() });
			}
		}
	);

	app.delete(
		"/channels/:id",
		{
			schema: {
				summary: "Delete a channel",
				tags: ["ChatChannel"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				response: {
					204: {},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.id;

			try {
				await app.db.views.ChatChannel.deleteChannel(user, channelId);
				reply.code(204).send();
			} catch (_error) {
				reply.code(404).send({ code: "not_found", error: "Not Found" });
			}
		}
	);

	// MESSAGE

	app.get(
		"/channels/:id/messages",
		{
			schema: {
				summary: "Get the channel messages",
				tags: ["ChatMessage"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				response: {
					200: {
						$ref: "ChatMessageList",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.id;
			const channel = await app.db.views.ChatChannel.getChannel(user, channelId);

			if (channel) {
				const messages = await app.db.models.ChatMessage.byChannelId(channelId);
				const response = messages.map((m) => ({
					id: m.id,
					author: {
						id: m.author.hashid || m.author.id,
						username: m.author.username,
						avatar: m.author.avatar,
					},
					content: m.content,
					createdAt: m.createdAt,
					editedAt: m.editedAt,
					deleted: m.deleted,
				}));
				reply.send(response);
				return;
			}

			reply.code(404).send({ code: "not_found", error: "Not Found" });
		}
	);

	app.get(
		"/channels/:channelId/messages/:id",
		{
			schema: {
				summary: "Retrieves a specific message in the channel",
				tags: ["ChatMessage"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
						channelId: { type: "string" },
					},
					required: ["channelId", "id"],
				},
				response: {
					200: {
						$ref: "ChatMessage",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.channelId;
			const messageId = request.params.id;
			const message = await app.db.views.ChatMessage.get(user, channelId, messageId);

			if (message) {
				reply.send(message);
				return;
			}

			reply.code(404).send({ code: "not_found", error: "Not Found" });
		}
	);

	app.patch(
		"/channels/:channelId/messages/:id",
		{
			schema: {
				summary: "Edit a previously sent message",
				tags: ["ChatMessage"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
						channelId: { type: "string" },
					},
					required: ["channelId", "id"],
				},
				body: {
					type: "object",
					properties: {
						content: { type: "string" },
					},
					required: ["content"],
				},
				response: {
					200: {
						$ref: "ChatMessage",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.channelId;
			const messageId = request.params.id;

			try {
				const message = await app.db.views.ChatMessage.edit(user, channelId, {
					id: messageId,
					content: request.body.content,
				});
				if (message) {
					reply.send(message);
					return;
				}

				reply.code(404).send({ code: "not_found", error: "Not Found" });
			} catch (error) {
				reply.code(400).send({ code: "invalid_request", error: error.toString() });
			}
		}
	);

	app.delete(
		"/channels/:channelId/messages/:id",
		{
			schema: {
				summary: "Delete a message in the channel",
				tags: ["ChatMessage"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
						channelId: { type: "string" },
					},
					required: ["channelId", "id"],
				},
				response: {
					204: {},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.channelId;
			const messageId = request.params.id;

			try {
				await app.db.views.ChatMessage.delete(user, channelId, messageId);
				reply.code(204).send();
			} catch (_error) {
				reply.code(404).send({ code: "not_found", error: "Not Found" });
			}
		}
	);

	app.post(
		"/channels/:id/messages",
		{
			schema: {
				summary: "Post a message to a channel",
				tags: ["ChatMessage"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				body: {
					type: "object",
					properties: {
						content: { type: "string" },
					},
					required: ["content"],
				},
				response: {
					200: {
						$ref: "ChatMessage",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.id;
			try {
				const message = await app.db.models.ChatMessage.create({
					content: request.body.content,
					userId: user.id,
					channelId: channelId,
				});

				const response = {
					id: message.id,
					author: app.db.views.ChatMember.memberProfile(user),
					content: message.content,
					channelId: message.channelId,
					createdAt: message.createdAt,
					editedAt: null,
					deleted: false,
				};

				reply.send(response);
			} catch (error) {
				reply.code(400).send({ code: "invalid_request", error: error.toString() });
			}
		}
	);

	// TYPING

	app.post(
		"/channels/:id/typing",
		{
			schema: {
				summary: "Post a typing indicator for the specified channel, which expires after 10 seconds",
				tags: ["ChatMessage"],
				params: {
					type: "object",
					properties: {
						id: { type: "string" },
					},
					required: ["id"],
				},
				response: {
					204: {},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.id;

			// TODO: valider la room
			app.io.to(channelId).emit("typing", {
				channelId: channelId,
				member: app.db.views.ChatMember.memberProfile(user),
				timestamp: Date.now(),
			});
		}
	);

	// MEMBER

	app.get(
		"/members",
		{
			schema: {
				summary: "Get a list of members",
				tags: ["ChatMember"],
				query: { $ref: "PaginationParams" },
				response: {
					200: {
						type: "object",
						properties: {
							meta: { $ref: "PaginationMeta" },
							count: { type: "number" },
							members: { $ref: "ChatMemberList" },
						},
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const paginationOptions = app.getPaginationOptions(request);
			const users = await app.db.models.User.getAll(paginationOptions);
			users.members = users.users.map((user) => app.db.views.ChatMember.memberProfile(user));
			reply.send(users);
		}
	);

	app.get(
		"/channels/:channelId/thread-members",
		{
			schema: {
				summary: "Get a list of members for the given channel",
				tags: ["ChatMember"],
				params: {
					type: "object",
					properties: {
						channelId: { type: "string" },
					},
					required: ["channelId"],
				},
				response: {
					200: {
						$ref: "ChatMemberList",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.channelId;
			const response = await app.db.views.ChatChannel.getMembers(user, channelId);

			reply.send(response);
		}
	);

	app.put(
		"/channels/:channelId/thread-members/:memberId",
		{
			schema: {
				summary: "Add a channel member",
				tags: ["ChatMember"],
				params: {
					type: "object",
					properties: {
						channelId: { type: "string" },
						memberId: { type: "string" },
					},
					required: ["channelId", "memberId"],
				},
				response: {
					204: {},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.channelId;
			const memberId = request.params.memberId;
			const channels = await app.db.models.ChatChannel.byOwner(user);
			const channel = channels.find((c) => c.id === channelId);

			if (!channel) {
				reply.code(404).send({ code: "not_found", error: "Not Found" });
				return;
			}

			try {
				const userToAdd = await app.db.models.User.byId(memberId);
				await channel.addMember(userToAdd.id);
				reply.code(204).send();
			} catch (_error) {
				reply.code(404).send({ code: "not_found", error: "Not Found" });
			}
		}
	);

	app.delete(
		"/channels/:channelId/thread-members/:memberId",
		{
			schema: {
				summary: "Delete a channel member",
				tags: ["ChatMember"],
				params: {
					type: "object",
					properties: {
						channelId: { type: "string" },
						memberId: { type: "string" },
					},
					required: ["channelId", "memberId"],
				},
				response: {
					204: {},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			const user = request.session.User;
			const channelId = request.params.channelId;
			const memberId = request.params.memberId;
			const channels = await app.db.models.ChatChannel.byOwner(user);
			const channel = channels.find((c) => c.id === channelId);

			if (!channel) {
				reply.code(404).send({ code: "not_found", error: "Not Found" });
				return;
			}

			try {
				const userToRemove = await app.db.models.User.byId(memberId);
				await channel.removeMember(userToRemove.id);
				reply.code(204).send();
			} catch (_error) {
				reply.code(404).send({ code: "not_found", error: "Not Found" });
			}
		}
	);
	///channels/{channel.id}/thread-members/@me
	//POST /channels/{channel.id}/typing
	//PUT /bans/{user.id}
	// join game
	// create DM: POST /users/@me/channels
};
