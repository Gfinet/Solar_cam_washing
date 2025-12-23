const { OAuth2Client } = require("google-auth-library");

const { generatePassword, completeSSOSignIn, generateUsernameFromEmail } = require("../../../lib/userTeam");

module.exports = async function (app) {
	app.post(
		"/login/callback/google",
		{
			config: { allowAnonymous: true },
		},
		async (request, reply) => {
			const enabled = app.settings.get("platform:sso:google");
			if (!enabled) {
				reply.code(404).send({ code: "not_found", error: "Not Found" });
				return;
			}
			if (!request.query.code) {
				reply.code(400).send({ code: "invalid_request", error: "Missing code" });
				return;
			}
			const clientId = app.settings.get("platform:sso:google:clientId");
			if (!clientId) {
				reply.code(500).send({ code: "invalid_request", error: "Google SSO not configured" });
				return;
			}
			// request.user is the JWT provided by the Google SSO plugin
			// We need to decode and verify it.
			const googleOAuth2Client = new OAuth2Client(clientId);
			try {
				googleOAuth2Client.setCredentials({ access_token: request.query.code });
				const userinfo = await googleOAuth2Client.request({
					url: "https://www.googleapis.com/oauth2/v3/userinfo",
				});
				const googleUserInfo = userinfo.data;
				const user = await app.db.models.User.byUsernameOrEmail(googleUserInfo.email);
				if (user) {
					const result = await completeSSOSignIn(app, user);
					if (result.cookie) {
						reply.setCookie("sid", result.cookie.value, result.cookie.options);
					}
					reply.send({
						url: "/",
					});
				} else {
					// Create a new user for this email address
					const userProperties = {
						username: googleUserInfo["given_name"],
						name: googleUserInfo.name || googleUserInfo.email.split("@")[0],
						email: googleUserInfo.email,
						// Verified email from Google
						email_verified: true,
						// Generate a random password
						password: generatePassword(),
						// Explicitly don't create an admin user
						admin: false,
						sso_enabled: true,
					};

					if (!userProperties.username) {
						userProperties.username = await generateUsernameFromEmail(app, googleUserInfo.email);
					}

					try {
						// - Create user in DB
						const newUser = await app.db.models.User.create(userProperties);
						// - Common sign-in completion - sets up session
						const result = await completeSSOSignIn(app, newUser);
						if (result.cookie) {
							reply.setCookie("sid", result.cookie.value, result.cookie.options);
						}
						reply.send({
							url: "/",
						});
						return;
					} catch (err) {
						app.log.error(`Failed to create user via Google SSO: ${err}`);
						reply.send({
							error: `Failed to create user via Google SSO: ${err}`,
						});
					}
					reply.send({
						url: "/",
					});
				}
			} catch (err) {
				app.log.error(`Google SSO failed: ${err}`);
				reply.code(500).send({ code: "invalid_request", error: "Invalid Request" });
			}
		}
	);
};
