module.exports = {
	createChannel: async function (app, channel) {
		return await app.db.models.ChatChannel.create(channel);
	},
};
