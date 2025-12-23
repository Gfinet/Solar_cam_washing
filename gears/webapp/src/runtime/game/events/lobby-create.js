const { randomUUID } = require('crypto');

/**
 * @param {import('socket.io-client').Socket} socket
 * @param {Record<string, unknown>} opts
 * @return {import('..').GameLobby}
 */
function createLobby(socket, opts) {
	const id = randomUUID();
	const lobby = {
		id,
		ownerId: socket.User.hashid,
		botCount: opts.botCount || 0,
		playerCount: opts.playerCount || 2,
		players: [],
		status: 'open', // open | close | started | finished
		createdAt: Date.now(),
		scheduledAt: opts.scheduledAt || null,
		inviteLink: null,
	};

	if (opts.inviteWithLink) {
		// TODO: séparer la route vers /game/<uid>/invite ?
		lobby.inviteLink = socket.app.config.base_url + "/game/" + id;
	}

	return lobby;
}

module.exports = {
	name: "lobby:create",
	/** @type { (socket: import('socket.io-client').Socket, data: object) => Promise<void> } */
	execute: async (socket, data) => {
		const lobby = createLobby(socket, data)

		const creator = socket.User.profile;
		const player = { ...creator, ready: false };

		lobby.players.push(player);
		socket.app.game.lobbies.set(lobby.id, lobby);

		if (lobby.scheduledAt === null) {
			// TODO
			socket.app.game.userToLobby.set(creator.id, lobby);
		}

		// TODO: Scheduled

		socket.join(lobby.id);
		socket.emit('lobby:joined', lobby);
		socket.app.game.broadcastLobby(lobby);
	},
};
