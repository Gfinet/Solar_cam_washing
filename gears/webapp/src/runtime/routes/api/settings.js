module.exports = async function (app) {
	app.get(
		"/",
		{
			config: { allowAnonymous: true, allowUnverifiedEmail: true },
			schema: {
				summary: "Get platform settings",
				tags: ["Platform"],
				response: {
					200: {
						type: "object",
						additionalProperties: true,
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			// This isn't as clean as I'd like, but it works for now.
			//
			// We return different things depending on the user session.
			// - For a non-logged in user, the settings are those needed to present
			//   the login/signup screens
			// - For a logged in (non-admin) user, they are the settings needed to
			//   ensure the app provides suitable options to the user. For example,
			//   policy information on creating teams, inviting users
			// - For an admin user, this includes more detailed settings they are able
			//   to change via the UI

			// Logged in session user (not using an access token)
			if (request.session && request.session.User && !request.session.scope) {
				const response = {
					"user:tcs-required": app.settings.get("user:tcs-required"),
					"user:tcs-url": app.settings.get("user:tcs-url"),
					"user:tcs-date": app.settings.get("user:tcs-date"),
					email: app.postoffice.enabled(),
					base_url: app.config.base_url,
				};

				/*if (request.session.User.admin) {
                response['user:signup'] = app.settings.get('user:signup')
                response['user:reset-password'] = app.settings.get('user:reset-password')
                response.email = app.postoffice.exportSettings(true)
                response['version:forge'] = app.settings.get('version:forge')
                response['version:node'] = app.settings.get('version:node')
            }*/
				reply.send(response);
			} else {
				// This is for an unauthenticated request. Return settings related
				// to branding and the login/signup pages
				const publicSettings = {
					"user:signup": app.settings.get("user:signup") && app.postoffice.enabled(),
					"user:reset-password": app.settings.get("user:reset-password") && app.postoffice.enabled(),
					"user:tcs-required": app.settings.get("user:tcs-required") && app.postoffice.enabled(),
					"user:tcs-url": app.settings.get("user:tcs-url"),
					"user:offboarding-required": app.settings.get("user:offboarding-required"),
					"user:offboarding-url": app.settings.get("user:offboarding-url"),
				};

				if (app.settings.get("platform:sso:google") && app.settings.get("platform:sso:google:clientId")) {
					publicSettings["platform:sso:google"] = true;
					publicSettings["platform:sso:google:clientId"] = app.settings.get("platform:sso:google:clientId");
				}

				if (app.settings.get("platform:sso:42") && app.settings.get("platform:sso:42:clientId")) {
					publicSettings["platform:sso:42"] = true;
					publicSettings["platform:sso:42:clientId"] = app.settings.get("platform:sso:42:clientId");
				}

				reply.send(publicSettings);
			}
		}
	);

	app.put(
		"/",
		{
			//preHandler: app.needsPermission('settings:edit'),
			schema: {
				summary: "Update platform settings",
				tags: ["Platform"],
				body: { type: "object" },
				response: {
					200: {
						$ref: "APIStatus",
					},
					"4xx": {
						$ref: "APIError",
					},
				},
			},
		},
		async (request, reply) => {
			if (request.body) {
				const updates = new app.auditLog.formatters.UpdatesCollection();
				for (let [key, value] of Object.entries(request.body)) {
					if (key === "user:tcs-updated") {
						key = "user:tcs-date";
						value = new Date();
					}
					const original = app.settings.get(key);
					if (original !== value) {
						updates.push(key, original, value);
					}
					await app.settings.set(key, value);
				}
				if (updates.length > 0) {
					await app.auditLog.Platform.platform.settings.updated(request.session.User, null, updates);
				}
				reply.send({ status: "okay" });
			} else {
				reply.code(400).send("invalid request");
			}
		}
	);
};
