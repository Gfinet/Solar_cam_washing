import {
	BookOpenIcon,
	ChartBarIcon,
	ChatIcon,
	ChevronLeftIcon,
	ChipIcon,
	CogIcon,
	CollectionIcon,
	ColorSwatchIcon,
	CurrencyDollarIcon,
	DatabaseIcon,
	DesktopComputerIcon,
	HomeIcon,
	LockClosedIcon,
	RssIcon,
	TableIcon,
	TemplateIcon,
	UserGroupIcon,
	UsersIcon,
} from "@heroicons/vue/outline";

//import tours from './tours/index.js'

const initialState = () => ({
	leftDrawer: {
		state: false,
		component: null,
	},
	rightDrawer: {
		state: false,
		component: null,
	},
	mainNav: {
		context: "team",
		backToButton: null,
	},
	userActions: {
		hasOpenedDeviceEditor: false,
	},
	isNewlyCreatedUser: false,
});

const meta = {
	persistence: {
		isNewlyCreatedUser: {
			storage: "localStorage",
		},
		userActions: {
			storage: "localStorage",
		},
	},
};

const state = initialState;

const getters = {
	hiddenLeftDrawer: (state, getters) => {
		return state.leftDrawer.component?.name === "MainNav" && getters.mainNavContext.length === 0;
	},
	mainNavContexts: function (state, getters, rootState, rootGetters) {
		const team = rootState.account.team;

		const userContext = [
			{
				entries: [
					{
						label: "Back to Dashboard",
						to: { name: "Home" },
						tag: "back",
						icon: ChevronLeftIcon,
					},
				],
			},
			{
				title: "User Settings",
				entries: [
					{
						label: "Settings",
						to: { name: "user-settings-overview" },
						tag: "account-settings",
						icon: CogIcon,
					},
					{
						label: "Security",
						to: { name: "user-settings-security" },
						tag: "account-security",
						icon: LockClosedIcon,
					},
				],
			},
		];

		const backContext = team
			? [
					{
						entries: [state.mainNav.backToButton],
					},
				]
			: [];

		return {
			user: userContext,
			back: backContext,
			none: [],
		};
	},
	mainNavContext: (state, getters, rootState) => {
		const team = rootState.account.team;

		if (!team && !["admin", "user"].includes(state.mainNav.context)) {
			// todo this compensates for a brief moment after logging in where we don't have a team loaded and can't properly
			//  generate menu links. This should be addressed by implementing an application service that bootstrap's the
			//  app and hydrates vuex stores before attempting to render any data
			return [];
		}

		return getters.mainNavContexts[state.mainNav.context]
			.map((category) => {
				// filter hidden entries
				category.entries = category.entries.filter((entry) => (!!entry && entry?.hidden) ?? true);

				return category;
			})
			.filter((category) => (Object.prototype.hasOwnProperty.call(category, "hidden") ? !category.hidden : true)) // filter hidden categories
			.filter((category) => category.entries.length > 0); // filter categories without entries
	},
};

const mutations = {
	openRightDrawer(state, { component }) {
		state.rightDrawer.state = true;
		state.rightDrawer.component = component;
	},
	closeRightDrawer(state) {
		state.rightDrawer.state = false;
		state.rightDrawer.component = null;
	},
	openLeftDrawer(state) {
		state.leftDrawer.state = true;
	},
	closeLeftDrawer(state) {
		state.leftDrawer.state = false;
	},
	toggleLeftDrawer(state) {
		state.leftDrawer.state = !state.leftDrawer.state;
	},
	setLeftDrawer(state, component) {
		state.leftDrawer.component = component;
	},
	setMainNavContext(state, context) {
		state.mainNav.context = context;
	},
	setMainNavBackButton(state, button) {
		state.mainNav.backToButton = button;
	},
	setNewlyCreatedUser(state, payload) {
		state.isNewlyCreatedUser = payload;
	},
	setUserAction(state, { action, payload }) {
		if (Object.prototype.hasOwnProperty.call(state.userActions, action)) {
			state.userActions[action] = payload;
		}
	},
};

const actions = {
	openRightDrawer({ commit }, { component }) {
		commit("openRightDrawer", { component });
	},
	closeRightDrawer({ commit }) {
		commit("closeRightDrawer");
	},
	openLeftDrawer({ commit }) {
		commit("openLeftDrawer");
	},
	closeLeftDrawer({ commit }) {
		commit("closeLeftDrawer");
	},
	toggleLeftDrawer({ commit }) {
		commit("toggleLeftDrawer");
	},
	setLeftDrawer({ commit }, component) {
		commit("setLeftDrawer", component);
	},
	setMainNavContext({ commit }, context) {
		commit("setMainNavContext", context);
	},
	setMainNavBackButton({ commit }, button) {
		commit("setMainNavBackButton", button);
	},
	setNewlyCreatedUser({ commit }) {
		commit("setNewlyCreatedUser", true);
	},
	validateUserAction({ commit }, action) {
		commit("setUserAction", { action, payload: true });
	},
	checkIfIsNewlyCreatedUser({ commit }, user) {
		const userCreatedDate = new Date(user.createdAt).getTime();
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		commit("setNewlyCreatedUser", userCreatedDate >= oneWeekAgo.getTime());
	},
};

export default {
	namespaced: true,
	modules: {
		/*tours*/
	},
	state,
	initialState: initialState(),
	getters,
	mutations,
	actions,
	meta,
};
