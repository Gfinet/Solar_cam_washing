import { nextTick } from "vue";
import { io } from "socket.io-client";

import chatAPI from "../../../api/chat.js";

// initial state
const initialState = () => ({
	channels: [],
	currentChannel: null,
	members: [],
	messages: null,
	loading: false,
	rightSidebar: {
		state: false,
	},
});

const meta = {};

const state = initialState;

// getters
const getters = {
	channels(state) {
		return state.channels;
	},
	currentChannel(state) {
		return state.currentChannel;
	},
	loading(state) {
		return state.loading;
	},
	members(state) {
		return state.members;
	},
	messages(state) {
		return state.messages;
	},
};

// mutations
const mutations = {
	clearLoading(state) {
		state.loading = false;
	},
	setLoading(state) {
		state.loading = true;
	},
	setChannelMessages(state, value) {
		const { channelId, messages } = value;
		state.messages = state.messages || {};
		state.messages[channelId] = messages;
	},
	setChannels(state, channels) {
		state.channels = channels;
	},
	setCurrentChannel(state, channel) {
		state.currentChannel = channel;
	},
	setMembers(state, members) {
		state.members = members;
	},
	openRightSidebar(state) {
		state.rightSidebar.state = true;
	},
	closeRightSidebar(state) {
		state.rightSidebar.state = false;
	},
	toggleRightSidebar(state) {
		state.rightSidebar.state = !state.rightSidebar.state;
	},
};

// actions
const actions = {
	async loadChannels({ commit }) {
		const channels = await chatAPI.getChannels();
		commit("setChannels", channels);
	},
	async loadChannelMessages({ commit }, channelId) {
		commit("setLoading");
		const messages = await chatAPI.getChannelMessages(channelId);
		commit("clearLoading");
		commit("setChannelMessages", { channelId, messages });
	},
	async loadMembers({ commit }) {
		const members = await chatAPI.getMembers();
		commit("setMembers", members.members);
	},
	setCurrentChannel({ commit }, channel) {
		commit("setCurrentChannel", channel);
	},
	openRightSidebar({ commit }) {
		commit("openRightSidebar");
	},
	closeRightSidebar({ commit }) {
		commit("closeRightSidebar");
	},
	toggleRightSidebar({ commit }) {
		commit("toggleRightSidebar");
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
