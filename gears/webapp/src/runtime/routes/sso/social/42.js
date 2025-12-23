const { Authenticator } = require("@fastify/passport");
const { get } = require("axios");
const { Strategy: OAuth2Strategy } = require("passport-oauth2");

const { completeSSOSignIn, generatePassword } = require("../../../lib/userTeam");

module.exports = async function (app) {
	app.addHook("onRequest", async (request, reply) => {
		if (!request.session) {
			// passport expects request.session to exist and to be able to store
			// state. We don't need to use that, but we need to ensure we have
			// the api in place otherwise passport will complain.
			request.session = {
				get: (key) => {
					return null;
				},
				set: (key, value) => {
					return null;
				},
			};
		}
	});

	const fastifyPassport = new Authenticator();

	// We don't use @fastify/session, but this is needed to let passport think
	// we are using it
	fastifyPassport.registerUserSerializer(async (user, request) => user);

	// TODO: app.register(fastifySession, { secret: 'secret with minimum length of 32 characters' })
	app.register(fastifyPassport.initialize());
	app.register(fastifyPassport.secureSession());

	app.setErrorHandler(function (error, request, reply) {
		// TODO: how to surface errors properly
		app.log.error(`SAML Login error: ${error.toString()} ${error.stack}`);
		reply.redirect("/");
	});

	fastifyPassport.use(
		"42",
		new OAuth2Strategy(
			{
				authorizationURL: "https://api.intra.42.fr/oauth/authorize",
				tokenURL: "https://api.intra.42.fr/oauth/token",
				clientID: app.settings.get("platform:sso:42:clientId"),
				clientSecret: app.settings.get("platform:sso:42:clientSecret"),
				callbackURL: app.config.base_url + "/sso/login/callback/42",
				passReqToCallback: true,
			},
			async (request, accessToken, refreshToken, profile, done) => {
				try {
					// Fetch user info
					console.log(request);
					const response = await get("https://api.intra.42.fr/v2/me", {
						headers: { Authorization: `Bearer ${accessToken}` },
					});

					const userinfo = response.data;
					const user = await app.db.models.User.byUsernameOrEmail(userinfo.email);
					if (user) {
						done(null, user);
					} else {
						// Create a new user for this email address
						const userProperties = {
							username: userinfo.login,
							name: userinfo.displayname || userinfo["usual_full_name"] || userinfo["first_name"],
							email: userinfo.email,
							// Verified email from 42
							email_verified: true,
							// Generate a random password
							password: generatePassword(),
							// Explicitly don't create an admin user
							admin: false,
							sso_enabled: true,
						};

						try {
							// - Create user in DB
							const newUser = await app.db.models.User.create(userProperties);
							request.session.newSSOUser = true;
							done(null, newUser);
						} catch (err) {
							//console.error(err)
							done(err);
						}
					}
				} catch (error) {
					app.log.error(`42 SSO failed: ${error}`);
					done(error);
				}
			}
		)
	);

	app.get(
		"/login/42",
		{
			config: { allowAnonymous: true },
			preValidation: fastifyPassport.authenticate("42", { session: false }),
		},
		async (request, reply, err, user, info, status) => {
			// Should never get here as passport will trigger the saml flow
			// and either result in the error handler, or a POST to /sso/login/callback below
			reply.redirect("/");
		}
	);

	app.get(
		"/login/callback/42",
		{
			config: { allowAnonymous: true },
			preValidation: fastifyPassport.authenticate("42", { session: false }),
		},
		async (request, reply, err, user, info, status) => {
			if (request.user) {
				const result = await completeSSOSignIn(app, request.user);
				if (result.cookie) {
					// Valid session
					reply.setCookie("sid", result.cookie.value, result.cookie.options);
					let redirectTo = "/";
					if (request.session.newSSOUser) {
						delete request.session.newSSOUser;
						redirectTo = "/account/settings";
					}
					reply.redirect(redirectTo);
					return;
				} else {
					// Invalid session - user is suspended or similar
					reply.redirect("/");
					return;
				}
			}
			throw new Error("Invalid SAML response");
		}
	);
};
