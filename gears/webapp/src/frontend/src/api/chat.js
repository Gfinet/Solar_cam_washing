import client from "./client.js";
import paginateUrl from "../utils/paginateUrl.js";

const getChannels = async () => {
	return client.get("/api/v1/chat/channels").then((res) => {
		return res.data;
	});
};

const getChannelMessages = async (channelId) => {
	return client.get("/api/v1/chat/channels/" + channelId + "/messages").then((res) => {
		return res.data;
	});
};

const editMessage = async (channelId, message) => {
	return client
		.patch("/api/v1/chat/channels/" + channelId + "/messages/" + message.id, { content: message.content })
		.then((res) => {
			return res.data;
		});
};

const deleteMessage = async (channelId, messageId) => {
	return client.delete("/api/v1/chat/channels/" + channelId + "/messages/" + messageId).then((res) => {
		return res.data;
	});
};

const postMessage = async (content, channelId) => {
	return client.post("/api/v1/chat/channels/" + channelId + "/messages", { content: content }).then((res) => {
		return res.data;
	});
};

const startTyping = async (channelId) => {
	return client.post("/api/v1/chat/channels/" + channelId + "/typing").then((res) => {
		return res.data;
	});
};

const getMembers = (cursor, limit, query) => {
	const url = paginateUrl("/api/v1/chat/members", cursor, limit, query);
	return client.get(url).then((res) => res.data);
};

const inviteMember = (channelId, memberId) => {
	return client.put("/api/v1/chat/channels/" + channelId + "/thread-members/" + memberId).then((res) => {
		return res.data;
	});
};

const deleteMember = (channelId, memberId) => {
	return client.delete("/api/v1/chat/channels/" + channelId + "/thread-members/" + memberId).then((res) => {
		return res.data;
	});
};

export default {
	getChannels,
	getChannelMessages,
	getMembers,
	deleteMessage,
	deleteMember,
	editMessage,
	inviteMember,
	postMessage,
	startTyping,
};
