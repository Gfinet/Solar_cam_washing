module.exports = {
	name: "lobby:join",
	/** @type { (socket: import('socket.io-client').Socket, data: object) => Promise<void> } */
	execute: async (socket, data) => {
		const userId = socket.User.hashid;
		/** @type {import('..').GameLobby|null} */
		const lobby = socket.app.game.lobbies.get(data.id);

		// Not found or lobby not open
		if (!lobby || lobby.status !== "open") return;

		const player = lobby.players.find((player) => player.id === userId);

		// Already joined
		if (player) return;

		// Lobby is full
		if (lobby.players.length >= lobby.playerCount) return;

		const user = socket.User.profile;
		lobby.players.push({ ...user, ready: false });

		socket.app.game.userToLobby.set(userId, lobby.id);

		socket.join(lobby.id);
		socket.emit('lobby:joined', lobby);
		socket.app.game.broadcastLobby(lobby);
	},
};
