import { AxiosError } from "axios";
import { createApp } from "vue";
import { LottieAnimation } from "lottie-web-vue";

import "./ui-components/index.scss";

import App from "./App.vue";
import router from "./routes.js";
import Alerts from "./services/alerts.js";
import store from "./store/index.js";

import Loading from "./components/Loading.vue";
import PageLayout from "./layouts/Page.vue";

import "./index.css";

import ForgeUIComponents from "./ui-components/index.js";

// TODO: get storageDriver
//store.commit('initializeStore')

const app = createApp(App).use(ForgeUIComponents).use(store).use(router);

// Globally available FF Components
app.component("lottie-animation", LottieAnimation);
app.component("ff-page", PageLayout);
//app.component('ff-page-header', SectionNavigationHeader)
app.component("ff-loading", Loading);

app.config.errorHandler = function (err, vm, info) {
	// Uncaught XHR errors bubble to here
	if (err instanceof AxiosError) {
		// API has returned error details
		const errorMessage =
			err.response?.data?.message ?? // deprecated format
			err.response?.data?.error; // new format
		if (errorMessage) {
			return Alerts.emit(`Request Failed: ${errorMessage}`, "warning");
		}

		// HTTP error only
		return Alerts.emit(`${err.message ?? "Request Failed: Unknown error"}`, "warning");
	} else {
		// TODO: debug only
		console.error(err);
	}
};

app.mount("#app");
