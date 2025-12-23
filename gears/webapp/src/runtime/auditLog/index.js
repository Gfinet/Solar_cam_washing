const fp = require("fastify-plugin");

const formatters = require("./formatters");
const platform = require("./platform");
const user = require("./user");

module.exports = fp(
	async function (app, _opts) {
		const loggers = {
			User: user.getLoggers(app),
			Platform: platform.getLoggers(app),
			formatters,
		};
		app.decorate("auditLog", loggers);
	},
	{ name: "app.auditLog" }
);
