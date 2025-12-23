const fastify = require("fastify");
const cookie = require("@fastify/cookie");
const csrf = require("@fastify/csrf-protection");
const helmet = require("@fastify/helmet");
const auditLog = require("./auditLog");
const comms = require("./comms");
const config = require("./config");
const db = require("./db");
const notifications = require("./notifications");
const postoffice = require("./postoffice");
const routes = require("./routes");
const settings = require("./settings");
const game = require("./game");

// TODO: credentials dans .env
// require('dotenv').config()

module.exports = async (options = {}) => {
	const runtimeConfig = config.init(options);
	const loggerConfig = {
		level: "info",
		timestamp: require("pino").stdTimeFunctions.isoTime,
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
				ignore: "pid,hostname",
				singleLine: true,
			},
		},
		serializers: {
			res(reply) {
				return {
					statusCode: reply.statusCode,
					request: {
						user: reply.request?.session?.User?.username,
						url: reply.request?.raw?.url,
						method: reply.request?.method,
						remoteAddress: reply.request?.ip,
						remotePort: reply.request?.socket.remotePort,
					},
				};
			},
		},
	};

	const server = fastify({
		forceCloseConnections: true,
		bodyLimit: 5242880,
		maxParamLength: 500,
		trustProxy: true,
		logger: loggerConfig,
		// Increase the default timeout
		//pluginTimeout: 20000
	});

	server.addHook("onError", async (request, reply, error) => {
		// Useful for debugging when a route goes wrong
		// TODO: comment me
		console.error(error.stack);
	});

	try {
		server.log.info("Starting Transcendence server...");

		// Config : loads environment configuration
		await server.register(config.attach, options);
		// DB : the database connection/models/views/controllers
		await server.register(db);
		// Settings
		// TODO: définir SSO creds depuis .env
		await server.register(settings);
		// Audit Logging
		await server.register(auditLog);

		// HTTP Server configuration
		if (!server.settings.get("cookieSecret")) {
			await server.settings.set("cookieSecret", server.db.utils.generateToken(12));
		}

		await server.register(cookie, { secret: server.settings.get("cookieSecret") });
		await server.register(csrf, { cookieOpts: { _signed: true, _httpOnly: true } });

		let strictTransportSecurity = false;
		let contentSecurityPolicy = {
			directives: {
				"base-uri": ["'self'"],
				"default-src": ["'self'"],
				"frame-src": ["'self'"],
				"script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
				"worker-src": ["'self'", "blob:"],
				"connect-src": ["'self'"],
				"img-src": ["'self'", "data:", "*"],
				"font-src": ["'self'", "data:"],
				"style-src": ["'self'", "https:", "'unsafe-inline'"],
				"upgrade-insecure-requests": null,
				"frame-ancestors": ["'self'"],
			},
		};
		const googleDomains = ["www.google.com", "google.com", "accounts.google.com"];
		contentSecurityPolicy.directives["script-src"].push(...googleDomains);

		if (runtimeConfig.base_url.startsWith("https://")) {
			strictTransportSecurity = {
				includeSubDomains: false,
				preload: true,
				maxAge: 2592000,
			};
		}

		await server.register(helmet, {
			global: true,
			contentSecurityPolicy,
			crossOriginEmbedderPolicy: false,
			crossOriginOpenerPolicy: false,
			crossOriginResourcePolicy: false,
			hidePoweredBy: true,
			strictTransportSecurity,
			frameguard: {
				action: "sameorigin",
			},
			referrerPolicy: {
				policy: "origin-when-cross-origin",
			},
		});

		// Routes : the HTTP routes
		await server.register(routes, { logLevel: server.config.logging.http });
		// Post Office : handles email
		await server.register(postoffice);
		await server.register(notifications);
		// Comms : real-time communication socket
		await server.register(comms);

		await server.register(game);

		// TODO: utilisation de SAML?
		server.decorate("sso", await require("./lib/sso.js").init(server));

		await server.ready();

		// TODO: utilisé pour créer un channel dans la db - à retirer
		//const channel = await server.db.models.ChatChannel.create({ type: 'privateThread', name: "Private", ownerId: "1" })
		//await channel.addMember("1")

		return server;
	} catch (error) {
		server.log.error(`Failed to start: ${error.toString()}`);
		server.log.error(error.stack);
		try {
			await server.close();
		} catch (error) {
			server.log.error(`Failed to shutdown: ${error.toString()}`);
			server.log.error(error.stack);
		}
		throw error;
	}
};
