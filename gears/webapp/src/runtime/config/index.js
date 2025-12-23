const fs = require("fs");
const path = require("path");

const fp = require("fastify-plugin");
const YAML = require("yaml");

// TODO: .env file
// const FastifySecrets = require('fastify-secrets-env')

let config = {};

module.exports = {
	init: (opts) => {
		if (opts.config) {
			// A custom config has been passed in. This means we're running
			// programmatically rather than manually. At this stage, that
			// means its our test framework.
			process.env.NODE_ENV = "development";
			process.env.FLOWFORGE_HOME = process.cwd();
		} else if (!process.env.FLOWFORGE_HOME) {
			process.env.FLOWFORGE_HOME = process.cwd();
		}

		let ffVersion;
		if (process.env.npm_package_version) {
			ffVersion = process.env.npm_package_version;
		} else {
			const { version } = require(path.join(module.parent.path, "..", "package.json"));
			ffVersion = version;
		}

		if (opts.config !== undefined) {
			// Programmatically provided config - eg tests
			config = { ...opts.config };
		} else {
			// Load from file
			// https://unix.stackexchange.com/questions/5665/what-does-etc-stand-for
			let configFile = path.join(process.env.FLOWFORGE_HOME, "/etc/transcendence.yml");
			try {
				const configFileContent = fs.readFileSync(configFile, "utf-8");
				config = YAML.parse(configFileContent);
				config.configFile = configFile;
			} catch (err) {
				throw new Error(`Failed to read config file ${configFile}: ${err}`);
			}
		}

		// Ensure sensible defaults
		config.version = ffVersion;
		config.home = process.env.FLOWFORGE_HOME;
		config.port = process.env.PORT || config.port || 3000;
		config.host = config.host || "localhost";
		config.base_url = config.base_url || `http://${config.host}:${config.port}`;

		process.env.FLOWFORGE_BASE_URL = config.base_url;

		if (!config.email) {
			config.email = { enabled: false };
		}

		// need to check that maxIdleDuration is less than maxDuration
		if (config.sessions) {
			if (config.sessions.maxIdleDuration && config.sessions.maxDuration) {
				if (config.sessions.maxIdleDuration > config.sessions.maxDuration) {
					throw new Error("Session maxIdleDuration longer than maxDuration");
					// config.sessions.maxIdleDuration = config.sessions.maxDuration
				}
			} else if (config.sessions.maxIdleDuration) {
				if (config.sessions.maxIdleDuration > 60 * 60 * 24 * 7) {
					throw new Error("Session maxIdleDuration longer than maxDuration");
				}
			}
		}

		const defaultLogging = {
			level: "debug",
			http: "debug",
			pretty: true, //TODO: process.env.NODE_ENV === 'development'
		};
		config.logging = { ...defaultLogging, ...config.logging };

		return config;
	},

	attach: fp(
		async function (app, opts) {
			// Freeze the config object
			Object.freeze(config);

			app.decorate("config", config);

			if (process.env.NODE_ENV === "development") {
				app.log.info("Development mode");
			}

			app.log.info(`Transcendence v${config.version}`);
			app.log.info(`Transcendence running with NodeJS ${process.version}`);
			app.log.info(`Transcendence Data Directory: ${process.env.FLOWFORGE_HOME}`);

			if (config.configFile) {
				app.log.info(`Config File: ${config.configFile}`);
			}
		},
		{ name: "app.config" }
	),
};
