/**
 * The database connection.
 *
 * This handles the connection to the database and the data models, views and
 * controllers.
 *
 *  - {@link forge.db.models models} - The underlying data models
 *  - {@link forge.db.views views} - Utilities for generating presentable views of models
 *  - {@link forge.db.controllers controllers} - Utilities for operating on the models
 *
 * @namespace db
 * @memberof forge
 */

const path = require("path");

const fp = require("fastify-plugin");
const { Sequelize } = require("sequelize");

const controllers = require("./controllers");
const models = require("./models");
const utils = require("./utils");
const views = require("./views");

module.exports = fp(
	async function (app, _opts) {
		utils.init(app);
		const dbOptions = {
			dialect: app.config.db.type || "sqlite",
		};
		app.log.info(`Database driver: ${dbOptions.dialect}`);
		if (dbOptions.dialect === "sqlite") {
			let filename = app.config.db.storage || "forge.db";
			if (filename !== ":memory:") {
				if (!path.isAbsolute(filename)) {
					filename = path.join(app.config.home, "var", filename);
				}
			}
			dbOptions.storage = filename;
			app.log.info(`Database file: ${filename}`);
		}

		dbOptions.logging = !!app.config.db.logging;

		const sequelize = new Sequelize(dbOptions);

		const db = {
			sequelize,
			models,
			views,
			controllers,
			utils,
		};

		app.decorate("db", db);

		app.addHook("onClose", async (_) => {
			await sequelize.close();
		});

		await sequelize.authenticate();

		await models.init(app);
		await views.init(app);
		await controllers.init(app);
	},
	{ name: "app.db" }
);
