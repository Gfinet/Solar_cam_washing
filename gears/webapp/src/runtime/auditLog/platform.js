const { generateBody, triggerObject } = require("./formatters");
// Audit Logging of platform scoped events

module.exports = {
	getLoggers(app) {
		const platform = {
			settings: {
				/**
				 * Log settings update
				 * @param {number|object} actionedBy A user object or a user id. NOTE: 0 will denote the "system", >0 denotes a user
				 * @param {import('./formatters').UpdatesCollection} updates An `UpdatesCollection` or array of `{key: string, old: any, new: any}`
				 */
				async updated(actionedBy, error, updates) {
					await log("platform.settings.updated", actionedBy, generateBody({ error, updates }));
				},
			},
		};

		const log = async (event, actionedBy, body) => {
			try {
				const trigger = triggerObject(actionedBy);
				let whoDidIt = trigger?.id;
				if (typeof whoDidIt !== "number" || whoDidIt <= 0) {
					whoDidIt = null;
					body.trigger = trigger;
				}
				await app.db.controllers.AuditLog.platformLog(whoDidIt, event, body);
			} catch (error) {
				console.warn("Failed to log platform scope audit event", event, error);
			}
		};
		return {
			platform,
		};
	},
};
