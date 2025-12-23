import client from "./client.js";

const googleSSOCallback = async (code) => {
	return client.post(`/sso/login/callback/google?code=${code}`).then((res) => {
		return res.data;
	});
};
export default {
	googleSSOCallback,
};
