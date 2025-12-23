module.exports = async function (app) {
	app.addHook("preHandler", app.verifySession);

	await app.register(require("./social/google"));

	if (
		app.settings.get("platform:sso:42") &&
		app.settings.get("platform:sso:42:clientId") &&
		app.settings.get("platform:sso:42:clientSecret")
	) {
		await app.register(require("./social/42"));
	}
};
