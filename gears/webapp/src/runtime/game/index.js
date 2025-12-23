const fp = require("fastify-plugin");
const { readdirSync } = require("fs");
const { join } = require("path");

/**
 * @typedef {object} GamePlayer
 * @property {string} id - Unique identifier for the player
 * @property {string} username - Username of the player
 * @property {string} avatar - Avatar URL or identifier for the player
 * @property {number} createdAt - Timestamp when the player account was created
 * @property {boolean} ready - Whether the player is ready to do game
 */

/**
 * @typedef {object} GameLobby
 * @property {string} id - Unique identifier for the game lobby
 * @property {string} ownerId - Unique identifier of the lobby owner
 * @property {string|null} inviteLink - Invitation link for the lobby, or null if not available
 * @property {'open'|'close'|'starting'|'started'|'finished'} status - Current status of the lobby
 * @property {number} createdAt - Timestamp when the lobby was created
 * @property {number|null} scheduledAt - Scheduled start time timestamp, or null if not scheduled
 * @property {number} botCount - Number of bots wanted in the lobby
 * @property {number} playerCount - Number of players wanted in the lobby (with bot count)
 * @property {GamePlayer[]} players - Array of players in the lobby
 */

function userProfile(user) {
	const result = {
		id: user.hashid,
	};

	["username", "avatar", "createdAt"].forEach((p) => {
		result[p] = user[p];
	});

	return result;
}

module.exports = fp(
	async function (app, _opts) {
		// Events
		const eventsPath = join(__dirname, 'events');
		const eventFilenames = readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
		const eventFiles = eventFilenames.map((filename) => require(join(eventsPath, filename)));

		// TODO: move to db
		const lobbies = new Map();
		const userToLobby = new Map();
		const userToSocket = new Map();

		const broadcastLobby = function (lobby) {
			app.io.to(lobby.id).emit('lobby:update', lobby);
		};

		app.decorate("game", {
			lobbies: lobbies,
			userToLobby: userToLobby,
			userToSocket: userToSocket,
			broadcastLobby
		});

		app.addHook("onReady", () => {
			app.io.on('connection', (socket) => {
				const userId = socket.User.hashid;
				const oldSocket = userToSocket.get(userId);

				if (oldSocket) {
					// TODO: Fermer l'ancien socket (ne pas autoriser le multi-sessions)
					//oldSocket.disconnect();//disconnectSockets();
				}

				userToSocket.set(userId, socket);

				socket.on('disconnect', () => {
					userToSocket.delete(userId);
				});

				// Add app to socket
				Object.assign(socket, { app: app });

				// Add the profile to the user
				// TODO: do it at top level
				socket.User.profile = userProfile(socket.User);

				// Listen to socket events
				for (const event of eventFiles) {
					if (event.once) {
						socket.once(event.name, (...args) => event.execute(socket, ...args));
					} else {
						socket.on(event.name, (...args) => event.execute(socket, ...args));
					}
				}
			})
		});
	},
	{ name: "app.game" }
);
