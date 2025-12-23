const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const Avatar = require("./avatar");

module.exports = async function (app) {
	const frontendAssetsDir = path.join(__dirname, "../../../frontend/dist/");

	async function getIndexFile(request, reply, app) {
		const filepath = path.join(frontendAssetsDir, "index.html");
		let data = await fsp.readFile(filepath, "utf8");
		data = updateSEOTags(request, data);

		return reply.type("text/html").send(data);
	}

	function updateSEOTags(request, data) {
		switch (true) {
			case !request.sid && request.raw.url === "/":
				// We can safely assume that unauthenticated users reaching the root endpoint are on the login page
				// so we can safely replace tags used by crawlers to serve them statically for ease of indexing
				data = data.replace("<title>Transcendence</title>", "<title>Log in - Transcendence</title>");
				/*data = data.replace(
					'<meta name="description" content="Build applications, integrate data and manage your Node-RED instances with enterprise-grade security.">',
					'<meta name="description" content="Log in to Transcendence to access your industrial data, manage Node-RED instances, and continue building powerful integrations with enterprise-grade security.">'
				)*/
				return data;
			case !request.sid && request.raw.url.includes("/account/create"):
				// We can safely assume that unauthenticated users reaching the root endpoint are on the account creation page
				// so we can safely replace tags used by crawlers to serve them statically for ease of indexing
				data = data.replace("<title>Transcendence</title>", "<title>Sign up - Transcendence</title>");
				/*data = data.replace(
					'<meta name="description" content="Build applications, integrate data and manage your Node-RED instances with enterprise-grade security.">',
					'<meta name="description" content="Sign up for Transcendence and start building applications, integrating data, and managing your Node-RED instances with enterprise-grade security.">'
				)*/
				return data;
			default:
				return data;
		}
	}

	let cachedIndex = null;

	// Check the frontend has been built
	if (!fs.existsSync(path.join(frontendAssetsDir, "index.html"))) {
		throw new Error("'/frontend/dist/index.html' not found. Have you run `npm run build`?");
	}

	app.register(Avatar, { prefix: "/avatar" });

	// Setup static file serving for the UI assets.
	app.register(require("@fastify/static"), {
		index: false,
		root: frontendAssetsDir,
	});

	app.get("/", async (request, reply) => {
		return await getIndexFile(request, reply, app);
	});

	// Any requests not handled by this time get served `index.html`.
	// This allows the frontend vue router to change the browser URL and we cope
	// if the user then hits reload
	app.setNotFoundHandler(async (request, reply) => {
		if (request.method === "GET" && !request.url.startsWith("/api")) {
			return await getIndexFile(request, reply, app);
		} else {
			return reply.status(404).send();
		}
	});
};
