const { Op } = require("sequelize");

const { generateToken, generateNumericToken, sha256, randomPhrase } = require("../utils");

const DEFAULT_TOKEN_SESSION_EXPIRY = 1000 * 60 * 30; // 30 mins session - with refresh token support

const DEFAULT_DEVICE_OTC_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

/*
 * fft - project
 * ffpr - password reset
 * ffd - device
 * ffu - user
 * ffadp - auto device provisioning
 * ffpat - personal access token
 * ffhttp - httpNode access token
 * fftpb - third party broker
 * ffnpm - Team npm registry
 */

module.exports = {
	/**
	 * Create an AccessToken for the given project.
	 * The token is hashed in the database. The only time the
	 * true value is available is when it is returned from this function.
	 */
	createTokenForProject: async function (app, project, expiresAt, scope = []) {
		const existingProjectToken = await project.getAccessToken();
		if (existingProjectToken) {
			await existingProjectToken.destroy();
		}
		const token = generateToken(32, "fft");
		await app.db.models.AccessToken.create({
			token,
			expiresAt,
			scope,
			ownerId: project.id,
			ownerType: "project",
		});
		return { token };
	},
	/**
	 * Create an AccessToken for a user's password reset request
	 */
	createTokenForPasswordReset: async function (app, user) {
		// Ensure any existing tokens are removed first
		await app.db.controllers.AccessToken.deleteAllUserPasswordResetTokens(user);

		const token = generateToken(32, "ffpr");
		const expiresAt = new Date(Date.now() + 1800 * 1000); // 30 minutes
		await app.db.models.AccessToken.create({
			token,
			expiresAt,
			scope: "password:reset",
			ownerId: user.hashid,
			ownerType: "user",
		});
		return { token };
	},

	/**
	 * Deletes any pending password-change tokens for a user.
	 */
	deleteAllUserPasswordResetTokens: async function (app, user) {
		await app.db.models.AccessToken.destroy({
			where: {
				ownerType: "user",
				scope: "password:reset",
				ownerId: user.hashid,
			},
		});
	},
	/**
	 * Create an AccessToken for a user's email verification
	 */
	createTokenForEmailVerification: async function (app, user) {
		// Ensure any existing tokens are removed first
		await app.db.controllers.AccessToken.deleteAllUserEmailVerificationTokens(user);

		const token = generateNumericToken();
		const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
		await app.db.models.AccessToken.create({
			token,
			expiresAt,
			scope: "email:verify",
			ownerId: "" + user.id,
			ownerType: "user",
		});
		return { token };
	},

	/**
	 * Deletes any pending email-verification tokens for a user.
	 */
	deleteAllUserEmailVerificationTokens: async function (app, user) {
		await app.db.models.AccessToken.destroy({
			where: {
				ownerType: "user",
				scope: "email:verify",
				ownerId: "" + user.id,
			},
		});
	},

	/**
	 * Create an AccessToken for the editor.
	 */
	createTokenForUser: async function (app, user, expiresAt, scope = [], includeRefresh) {
		const userId = typeof user === "number" ? user : user.id;
		const token = generateToken(32, "ffu");
		const refreshToken = includeRefresh ? generateToken(32, "ffu") : null;
		if (refreshToken && !expiresAt) {
			expiresAt = Date.now() + DEFAULT_TOKEN_SESSION_EXPIRY;
		}
		await app.db.models.AccessToken.create({
			token,
			refreshToken,
			expiresAt,
			scope,
			ownerId: "" + userId,
			ownerType: "user",
		});
		return { token, expiresAt, refreshToken };
	},
	createPersonalAccessToken: async function (app, user, scope, expiresAt, name) {
		const userId = typeof user === "number" ? user : user.id;
		const token = generateToken(32, "ffpat");
		const tok = await app.db.models.AccessToken.create({
			name,
			token,
			scope,
			expiresAt,
			ownerId: "" + userId,
			ownerType: "user",
		});
		// Overwrite the hashed token with the plain value
		const result = app.db.views.AccessToken.personalAccessTokenSummary(tok);
		result.token = token;
		return result;
	},
	updatePersonalAccessToken: async function (app, user, tokenId, scope, expiresAt) {
		const userId = typeof user === "number" ? user : user.id;
		const token = await app.db.models.AccessToken.byId(tokenId, "user", userId);
		if (token) {
			token.scope = scope;
			if (expiresAt === undefined) {
				token.expiresAt = null;
			} else {
				token.expiresAt = expiresAt;
			}
			await token.save();
		} else {
			// should throw unknown token error
			throw new Error("Not Found");
		}
		return token;
	},

	refreshToken: async function (app, refreshToken) {
		const existingToken = await app.db.models.AccessToken.byRefreshToken(refreshToken);
		if (existingToken) {
			const [prefix] = refreshToken.split("_");
			const tokenUpdates = {
				token: generateToken(32, prefix),
				refreshToken: generateToken(32, prefix),
				expiresAt: Date.now() + DEFAULT_TOKEN_SESSION_EXPIRY,
			};
			await app.db.models.AccessToken.update(tokenUpdates, { where: { refreshToken: existingToken.refreshToken } });
			return tokenUpdates;
		}
		return null;
	},

	/**
	 * Get a token by its id. If the session has expired, it is deleted
	 * and nothing returned.
	 */
	getOrExpire: async function (app, token) {
		let accessToken = await app.db.models.AccessToken.findOne({
			where: {
				token: sha256(token),
				scope: {
					[Op.notIn]: ["password:reset", "email:verify"],
				},
			},
		});
		if (accessToken) {
			if (accessToken.expiresAt && accessToken.expiresAt.getTime() < Date.now()) {
				await accessToken.destroy();
				accessToken = null;
			}
		}
		return accessToken;
	},

	getOrExpirePasswordResetToken: async function (app, token) {
		let accessToken = await app.db.models.AccessToken.findOne({
			where: {
				token: sha256(token),
				scope: "password:reset",
			},
		});
		if (accessToken) {
			if (accessToken.expiresAt && accessToken.expiresAt.getTime() < Date.now()) {
				await accessToken.destroy();
				accessToken = null;
			}
		}
		return accessToken;
	},

	getOrExpireEmailVerificationToken: async function (app, user, token) {
		let accessToken = await app.db.models.AccessToken.findOne({
			where: {
				token: sha256(token),
				ownerId: "" + user.id,
				ownerType: "user",
				scope: "email:verify",
			},
		});
		if (accessToken) {
			if (accessToken.expiresAt && accessToken.expiresAt.getTime() < Date.now()) {
				await accessToken.destroy();
				accessToken = null;
			}
		}
		return accessToken;
	},

	destroyToken: async function (app, token) {
		const accessToken = await app.db.models.AccessToken.findOne({
			where: {
				token: sha256(token),
			},
		});
		if (accessToken) {
			await accessToken.destroy();
		}
	},
};
