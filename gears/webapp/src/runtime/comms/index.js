const fp = require("fastify-plugin");
const { parse } = require("cookie");

module.exports = fp(
	async function (app, _opts) {
		// TODO: Move to fastify-socket.io when supported
		// TODO: valider le choix socket.io vs standard websocket
		app.register(require("fastify-socket"));

		app.addHook("onClose", async (_) => {
			app.log.info("Comms shutdown");
			// make all Socket instances disconnect
			await app.io.disconnectSockets();
		});

		async function verifySession(socket, next) {
			const cookies = parse(socket.handshake.headers.cookie);
			const sid = cookies.sid;

			if (sid) {
				const session = await app.db.controllers.Session.getOrExpire(sid.split(".")[0]);
				if (session && session.User) {
					const emailVerified = !app.postoffice.enabled() || session.User.email_verified;
					const passwordNotExpired = !session.User.password_expired;
					const suspended = session.User.suspended;
					// If the user has mfa_enabled, but the session isn't marked as mfa_verified then
					// the user has not completed logging in so the session isn't valid
					const mfaMissing = session.User.mfa_enabled && !session.mfa_verified;

					socket.User = session.User;

					if (emailVerified && passwordNotExpired && !suspended && !mfaMissing) {
						next();
						return;
					}
				}
			}
			next(new Error("unauthorized"));
		}

		app.addHook("onReady", () => {
			app.io.on("connection", async (socket) => {
				// TODO: valider le concept
				const channels = await app.db.views.ChatChannel.getChannels(socket.User);
				channels.forEach((c) => socket.join(c.id));
			});

			app.io.use(verifySession);
		});
	},
	{ name: "app.comms" }
);
