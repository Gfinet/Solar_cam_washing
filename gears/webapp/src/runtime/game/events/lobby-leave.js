module.exports = {
	name: "lobby:leave",
	/** @type { (socket: import('socket.io-client').Socket) => Promise<void> } */
	execute: async (socket) => {
		const userId = socket.User.hashid;
		/** @type {import('..').GameLobby|null} */
		const lobby = socket.app.game.userToLobby.get(userId);

		// Not found
		if (!lobby) return;

		if (lobby.ownerId === userId) {
			// Close the game
			lobby.status = 'close';
			lobby.players.forEach((player) => socket.app.game.userToLobby.delete(player.id));
		} else {
			const playerIndex = lobby.players.findIndex((player) => player.id === userId);

			if (playerIndex !== -1) {
				lobby.players.splice(playerIndex, 1);
			}

			socket.app.game.userToLobby.delete(userId);
		}

		socket.app.game.broadcastLobby(lobby);
		socket.app.io.socketsLeave(lobby.id);
	},
};
