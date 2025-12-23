const Chat = require("./chat.js");
const Settings = require("./settings.js");
const User = require("./user.js");

module.exports = async function (app) {
	app.addHook("preHandler", app.verifySession);

	app.register(Chat, { prefix: "/chat" });
	app.register(Settings, { prefix: "/settings" });
	app.register(User, { prefix: "/user" });

	app.get("*", function (request, reply) {
		reply.code(404).send({ code: "not_found", error: "Not Found" });
	});
};
