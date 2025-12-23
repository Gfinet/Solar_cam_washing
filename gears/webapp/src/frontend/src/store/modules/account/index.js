import { nextTick } from "vue";
import { io } from "socket.io-client";

import settingsApi from "../../../api/settings.js";
import userApi from "../../../api/user.js";
import router from "../../../routes.js";

import Alerts from "../../../services/alerts.js";

// initial state
const initialState = () => ({
	// Runtime settings
	settings: null,
	// We do not know if there is a valid session yet
	pending: true,
	// A login attempt is inflight
	loginInflight: false,
	// redirect url,
	redirectUrlAfterLogin: null,
	// The active user
	user: null,
	// stores active notifications that require user attention, key'd by notification type (e.g. invites) alongside a payload bucket to store all notifications
	notifications: {
		payload: [],
	},
	// An error during login
	loginError: null,
	// As an SPA, if we get a network error we should present
	// a suitable 'offline' message.
	offline: null,
	socket: null,
});

const meta = {
	persistence: {
		redirectUrlAfterLogin: {
			storage: "localStorage",
			// clearOnLogout: true (cleared by default)
		},
		settings: {
			storage: "localStorage",
			clearOnLogout: false,
		},
	},
};

const state = initialState;

// getters
const getters = {
	settings(state) {
		return state.settings;
	},
	user(state) {
		return state.user;
	},
	redirectUrlAfterLogin(state) {
		return state.redirectUrlAfterLogin;
	},
	pending(state) {
		return state.pending;
	},
	offline(state) {
		return state.offline;
	},
	isAdminUser: (state) => !!state.user.admin,
	notifications: (state) => state.notifications,
	notificationsCount: (state) => state.notifications?.length || 0,
	unreadNotificationsCount: (state) => {
		const unread = state.notifications?.filter((n) => !n.read) || [];
		let count = unread.length || 0;
		// check data.meta.counter for any notifications that have been grouped
		unread.forEach((n) => {
			if (n.data.meta?.counter && typeof n.data.meta.counter === "number" && n.data.meta.counter > 1) {
				count += n.data.meta.counter - 1; // decrement by 1 as the first notification is already counted
			}
		});
		return count;
	},
	hasNotifications: (state, getters) => getters.notificationsCount > 0,
	socket(state) {
		return state.socket;
	},
};

// mutations
const mutations = {
	setSettings(state, settings) {
		state.settings = settings;
		state.features = settings.features || {};
	},
	clearPending(state) {
		state.pending = false;
	},
	setPending(state, pending) {
		state.pending = pending;
	},
	setLoginInflight(state) {
		state.loginInflight = true;
	},
	login(state, user) {
		state.loginInflight = false;
		state.user = user;
	},
	logout(state) {
		state.loginInflight = false;
		state.pending = true;
		state.user = null;
		state.teams = [];
		state.team = null;
		state.redirectUrlAfterLogin = null;
	},
	setUser(state, user) {
		state.user = user;
	},
	setNotifications(state, notifications) {
		state.notifications = notifications;
	},
	sessionExpired(state) {
		state.user = null;
	},
	loginFailed(state, error) {
		state.loginInflight = false;
		state.loginError = error;
	},
	setRedirectUrl(state, url) {
		state.redirectUrlAfterLogin = url;
	},
	setOffline(state, value) {
		state.offline = value;
	},
	setWS(state, socket) {
		state.socket = socket;
	},
};

// actions
const actions = {
	async checkState({ commit, dispatch }, redirectUrlAfterLogin) {
		try {
			const settings = await settingsApi.getSettings();
			commit("setSettings", settings);

			commit("setOffline", false);

			const user = await userApi.getUser();
			commit("login", user);
			dispatch("ux/checkIfIsNewlyCreatedUser", user, { root: true });

			// User is logged in
			if (router.currentRoute.value.meta.requiresLogin === false) {
				// This is only for logged-out users
				window.location = "/";
				return;
			} else if (user.email_verified === false || user.password_expired) {
				commit("clearPending");
				router.push({ name: "Home" });
				return;
			}

			// check notifications count
			await dispatch("getNotifications");

			commit("clearPending");

			// Connect the WebSocket
			dispatch("connectWS");

			if (redirectUrlAfterLogin) {
				// If this is a user-driven login, take them to the profile page
				router.push(redirectUrlAfterLogin);
				// Clear the redirectUrl on nextTick
				nextTick(() => {
					commit("setRedirectUrl", null);
				});
			}
		} catch (err) {
			// Not logged in
			commit("clearPending");

			if (router.currentRoute.value.meta.requiresLogin !== false) {
				if (router.currentRoute.value.path !== "/") {
					// Only remember the url if it isn't the default / path
					commit("setRedirectUrl", router.currentRoute.value.fullPath);
				}
				router.push({ name: "Home" });
			}
		}
	},
	async login(state, credentials) {
		try {
			state.commit("setLoginInflight");
			if (credentials.username) {
				await userApi.login(credentials.username, credentials.password);
			} else if (credentials.token) {
				await userApi.verifyMFAToken(credentials.token);
			}
			state.commit("setPending", true);
			state.dispatch("checkState", state.getters.redirectUrlAfterLogin);
		} catch (err) {
			if (err.response?.status >= 401) {
				state.commit("loginFailed", err.response.data);
			} else {
				console.error(err);
			}
		}
	},
	async logout({ rootState, dispatch, commit }) {
		return userApi
			.logout()
			.then(() => dispatch("$resetState", null, { root: true }))
			.catch((_) => {})
			.finally(() => {
				if (window._hsq) {
					window._hsq.push(["revokeCookieConsent"]);
				}
				window.location = "/";
			});
	},
	async setUser(state, user) {
		state.commit("setUser", user);
	},
	async refreshSettings(state) {
		const settings = await settingsApi.getSettings();
		state.commit("setSettings", settings);
	},
	setOffline(state, value) {
		state.commit("setOffline", value);
	},
	setRedirectUrl(state, url) {
		state.commit("setRedirectUrl", url);
	},
	async getNotifications(state) {
		await userApi
			.getNotifications()
			.then((notifications) => {
				state.commit("setNotifications", notifications.notifications);
			})
			.catch((_) => {});
	},
	setNotifications(state, notifications) {
		state.commit("setNotifications", notifications);
	},
	connectWS(state) {
		if (state.socket) return;

		const socket = io();

		socket.on("connect", () => {
			console.log(socket.connected);
		});

		socket.on("disconnect", () => {
			Alerts.emit(`Connection with the server lost. Reconnecting...`, "warning");
		});

		socket.on("connect_error", (err) => {
			console.error(err);
		});

		socket.on("error", (err) => {
			console.error("❌ Erreur générale du socket :", err);
		});

		state.commit("setWS", socket);
	},
};

export default {
	namespaced: true,
	state,
	initialState: initialState(),
	getters,
	actions,
	mutations,
	meta,
};
