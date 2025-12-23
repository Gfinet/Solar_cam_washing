const fp = require("fastify-plugin");

module.exports = fp(
	async function (app, opts) {
		app.decorate("getPaginationOptions", (request, defaults) => {
			const result = { ...defaults, ...request.query };
			if (result.query) {
				result.query = result.query.trim();
			}
			return result;
		});

		//await app.register(require("@fastify/websocket"));
		await app.register(require("./auth"), { logLevel: app.config.logging.http });
		await app.register(require("./api"), { prefix: "/api/v1", logLevel: app.config.logging.http });
		await app.register(require("./ui"), { logLevel: app.config.logging.http });
		await app.register(require("./mfa"), { prefix: "/api/v1", logLevel: app.config.logging.http });
		await app.register(require("./sso"), { prefix: "/sso", logLevel: app.config.logging.http });

		app.addSchema({
			$id: "APIStatus",
			type: "object",
			properties: {
				status: { type: "string" },
			},
		});
		(app.addSchema({
			$id: "APIError",
			type: "object",
			properties: {
				code: { type: "string" },
				error: { type: "string" },
				message: { type: "string" },
				errors: { type: "array", items: { type: "object", additionalProperties: true } },
			},
		}),
			app.addSchema({
				$id: "PaginationMeta",
				type: "object",
				properties: {
					next_cursor: { type: "string" },
					previous_cursor: { type: "string" },
				},
			}));
	},
	{ name: "app.routes" }
);
