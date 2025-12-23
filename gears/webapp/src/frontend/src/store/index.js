import { createStore } from "vuex";

import account from "./modules/account/index.js";
import chat from "./modules/chat/index.js";
import ux from "./modules/ux/index.js";

export default createStore({
	modules: {
		account,
		chat,
		ux,
	},
});
