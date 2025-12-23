import { CogIcon } from "@heroicons/vue/outline";

import store from "../../store/index.js";

import AccountCreate from "./Create.vue";

import Account from "./index.vue";
import ForgotPassword from "./ForgotPassword.vue";
import PasswordReset from "./PasswordReset.vue";
import AccountSecurityChangePassword from "./Security/ChangePassword.vue";
import AccountSecurityMFA from "./Security/MultiFactorAuth.vue";
import PersonalAccessTokens from "./Security/Tokens.vue";
import AccountSecuritySessions from "./Security/Sessions.vue";
import AccountSecurity from "./Security.vue";
import AccountSettings from "./Settings.vue";
import VerifyPendingEmailChange from "./VerifyPendingEmailChange.vue";

export default [
	{
		path: "/account/create",
		name: "Sign up",
		meta: {
			requiresLogin: false,
			title: "Sign Up",
		},
		component: AccountCreate,
	},
	{
		profileLink: true,
		profileMenuIndex: 999,
		path: "/account/logout",
		name: "Sign out",
		redirect: function () {
			store.dispatch("account/logout");
			return { path: "/" };
		},
	},

	{
		profileLink: true,
		profileMenuIndex: 0,
		path: "/account",
		redirect: "/account/settings",
		name: "User Settings",
		meta: {
			title: "Account - Settings",
			menu: "user",
		},
		icon: CogIcon,
		component: Account,
		children: [
			{
				name: "user-settings-overview",
				path: "settings",
				component: AccountSettings,
			},
			{
				name: "user-settings-security",
				path: "security",
				component: AccountSecurity,
				meta: {
					title: "Account - Security",
				},
				redirect: "/account/security/password",
				children: [
					{ path: "password", component: AccountSecurityChangePassword },
					{ path: "mfa", component: AccountSecurityMFA },
					{ path: "tokens", component: PersonalAccessTokens },
					{ path: "sessions", component: AccountSecuritySessions },
				],
			},
		],
	},

	{
		name: "VerifyPendingEmailChange",
		path: "/account/email_change/:token",
		props: true,
		meta: {
			layout: "modal",
			requiresLogin: true,
		},
		component: VerifyPendingEmailChange,
	},
	{
		path: "/account/forgot-password",
		name: "ForgotPassword",
		component: ForgotPassword,
		meta: {
			title: "Forgot Password",
			requiresLogin: false,
		},
	},
	{
		path: "/account/change-password/:token",
		name: "PasswordReset",
		component: PasswordReset,
		meta: {
			requiresLogin: false,
		},
	},
];
