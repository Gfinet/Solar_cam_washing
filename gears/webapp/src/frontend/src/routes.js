import { createRouter, createWebHistory } from "vue-router";
import { useStore } from "vuex";

import AccountRoutes from "./pages/account/routes.js";

import Chat from "./pages/chat/index.vue";
import Home from "./pages/Home.vue";
//import Game from './pages/game/Game.vue'
import Lobby from './pages/game/Lobby.vue'

const routes = [
	{
		navigationLink: true,
		path: "/",
		name: "Home",
		component: Home,
		icon: "HomeIcon",
		meta: {
			title: "Home",
		},
	},
	{
		path: "/chat",
		name: "LiveChat",
		component: Chat,
		meta: {
			title: "Live Chat",
		},
	},
	{
		path: "/game",
		name: "GameLobby",
		component: Lobby,
		meta: {
			title: "Game Lobby",
		},
	},
	/*{
		path: "/game/:id",
		props: true,
		name: "Game",
		component: Game,
		meta: {
			title: "Game",
		},
	},*/
	...AccountRoutes,
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

function clearRedirectUrl(to, from) {
	const store = useStore();

	if (
		store.state?.account?.user &&
		store.state?.account?.redirectUrlAfterLogin &&
		store.state?.account?.redirectUrlAfterLogin.includes(from.fullPath)
	) {
		store.dispatch("account/setRedirectUrl", null);
	}
}

/**
 * Set Page Title when switching views
 * This callback runs before every route change, including on page load.
 */
router.beforeEach((to, from, next) => {
	// This goes through the matched routes from last to first, finding the closest route with a title.
	// e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
	// `/nested`'s will be chosen.
	const nearestWithTitle = to.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.title);

	// Find the nearest route element with meta tags.
	const nearestWithMeta = to.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.metaTags);

	const previousNearestWithMeta = from.matched
		.slice()
		.reverse()
		.find((r) => r.meta && r.meta.metaTags);

	// If a route with a title was found, set the document (page) title to that value.
	if (nearestWithTitle) {
		document.title = nearestWithTitle.meta.title + " - Transcendence";
	} else if (previousNearestWithMeta) {
		document.title = previousNearestWithMeta.meta.title + " - Transcendence";
	}

	// Remove any stale meta tags from the document using the key attribute we set below.
	Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map((el) => el.parentNode.removeChild(el));

	// Skip rendering meta tags if there are none.
	if (!nearestWithMeta) {
		next();
		clearRedirectUrl(to, from);
		return;
	}
	// Turn the meta tag definitions into actual elements in the head.
	nearestWithMeta.meta.metaTags
		.map((tagDef) => {
			const tag = document.createElement("meta");

			Object.keys(tagDef).forEach((key) => {
				tag.setAttribute(key, tagDef[key]);
			});

			// We use this to track which meta tags we create so we don't interfere with other ones.
			tag.setAttribute("data-vue-router-controlled", "");

			return tag;
		})
		// Add the meta tags to the document head.
		.forEach((tag) => document.head.appendChild(tag));

	next();
	clearRedirectUrl(to, from);
});

export default router;
