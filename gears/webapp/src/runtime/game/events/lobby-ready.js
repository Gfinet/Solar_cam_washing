module.exports = {
	name: "lobby:ready",
	/** @type { (socket: import('socket.io-client').Socket, data: object) => Promise<void> } */
	execute: async (socket, data) => {
		const userId = socket.User.hashid;
		/** @type {import('..').GameLobby|null} */
		const lobby = socket.app.game.userToLobby.get(userId);

		if (!lobby) return;

		const player = lobby.players.find((player) => player.id === userId);

		if (player) {
			player.ready = !!data.ready;
			socket.app.game.broadcastLobby(lobby);
		}


		// if all ready and lobby is full => auto-start
		/*if (lobby.players.length === lobby.maxPlayers && lobby.players.every(x => x.ready)) {
			startRoom(lobby.id)
		}*/
	},
};
