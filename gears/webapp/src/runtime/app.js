#!/usr/bin/env node

"use strict";

const transcendence = require("./transcendence");

(async function () {
	/** @type {import("fastify").FastifyInstance & {config: { port: number; host: string; }}} */
	let server = null;

	try {
		server = await transcendence();

		// Setup shutdown event handling
		let stopping = false;
		async function exitWhenStopped() {
			if (!stopping) {
				stopping = true;
				server.log.info("Stopping Transcendence platform");
				await server.close();
				server.log.info("Transcendence platform stopped");
				process.exit(0);
			}
		}

		process.on("SIGINT", exitWhenStopped);
		process.on("SIGTERM", exitWhenStopped);
		process.on("SIGHUP", exitWhenStopped);
		process.on("SIGUSR2", exitWhenStopped); // for nodemon restart
		process.on("SIGBREAK", exitWhenStopped);
		process.on("message", function (m) {
			// for PM2 under window with --shutdown-with-message
			if (m === "shutdown") {
				exitWhenStopped();
			}
		});

		// Start the server
		// server.listen({ port: server.config.port, host: server.config.host }, function (err, address) {
		server.listen({ port: server.config.port, host: "0.0.0.0" }, function (err, address) {
			if (err) {
				console.error(err);
				process.exit(1);
			}
		});
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
		try {
			if (server) {
				await server.close();
			}
		} catch (error) {
			console.error("Error shutting down: ", error.toString());
		}
	}
})();
