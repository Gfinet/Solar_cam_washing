const crypto = require("crypto");

/**
 * Completes the SSO sign-in process for a user
 *
 * Returns an object with the following properties:
 * - `cookie' : { value, options }: The session cookie to set in the response.
 * @param {*} app forge app
 * @param {*} user The email address of the user to complete SSO sign-in for.
 * @returns {Promise<void>}
 */
async function completeSSOSignIn(app, user) {
	// We know who this is
	const userInfo = app.auditLog.formatters.userObject(user);
	// They have completed authentication and we know who they are.
	const sessionInfo = await app.createSessionCookie(user.email);
	const result = { cookie: null };
	if (sessionInfo) {
		user.sso_enabled = true;
		user.email_verified = true;
		if (user.mfa_enabled) {
			// They are mfa_enabled - but have authenticated via SSO
			// so we will let them in without further challenge
			sessionInfo.session.mfa_verified = true;
			await sessionInfo.session.save();
		}
		await user.save();
		userInfo.id = sessionInfo.session.UserId;
		result.cookie = {
			value: sessionInfo.session.sid,
			options: sessionInfo.cookieOptions,
		};
		// reply.setCookie('sid', sessionInfo.session.sid, sessionInfo.cookieOptions)
		await app.auditLog.User.account.login(userInfo, null);
	} else {
		const resp = { code: "user_suspended", error: "User Suspended" };
		await app.auditLog.User.account.login(userInfo, resp, userInfo);
	}
	return result;
}

const generatePassword = () => {
	const charList = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$";
	return Array.from(crypto.randomFillSync(new Uint32Array(16)))
		.map((x) => charList[x % charList.length])
		.join("");
};

const generateUsernameFromEmail = async (app, email) => {
	const baseUsername = email
		.split("@")[0]
		.replaceAll(/\+.*$/g, "")
		.replaceAll(/[^0-9a-zA-Z-]/g, "");
	let username;
	// Check if username is available
	let count = 0;
	do {
		username = `${baseUsername}-${crypto.randomBytes(2).toString("hex")}`;
		count = await app.db.models.User.count({
			where: {
				username,
			},
		});
	} while (count > 0);
	return username.toLowerCase();
};
module.exports = {
	generateUsernameFromEmail,
	generatePassword,
	completeSSOSignIn,
};
