module.exports = {
	// Instance ID:
	instanceId: null,

	// Secret used to sign cookies:
	cookieSecret: null,

	// Whether the initial setup has been run
	"setup:initialised": false,

	// Can users signup via the login page
	"user:signup": true,

	// Can users reset their password via the login page
	"user:reset-password": true,

	// Users are required to acknowledge they have accepted TCs on signup
	"user:tcs-required": true,

	// URL to link to Terms & Conditions on signup
	"user:tcs-url":
		"https://tenor.com/fr/view/do-you-accept-my-challenge-sam-corlett-caliban-chilling-adventures-of-sabrina-do-you-accept-the-challenge-gif-16487677",

	// flag for Terms & Conditions date
	"user:tcs-date": null,

	// flag for required offboarding
	"user:offboarding-required": true,

	// URL to link to offboarding form
	"user:offboarding-url": "https://tenor.com/fr/view/ted-running-run-run-off-bye-gif-3604510528858035188",

	// Google SSO
	"platform:sso:google": true,
	"platform:sso:google:clientId": "919461560234-dnhn2a8gcn47767891265rue4tcfpste.apps.googleusercontent.com",

	// 42 SSO
	"platform:sso:42": true,
	"platform:sso:42:clientId": "u-s4t2ud-615ce4790d1f67f5d14ac90b0bd9b487a64ee2971a1ba561cfcec87c052dbd4d",
	"platform:sso:42:clientSecret": "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",
};
