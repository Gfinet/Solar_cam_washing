<template>
	<div id="ff-app" class="flex flex-col" :class="{ 'hidden-left-drawer': hiddenLeftDrawer }">
		<template v-if="offline">
			<main class="ff-bg-dark flex-grow flex flex-col">
				<div class="w-full max-w-screen-2xl mx-auto my-2 sm:my-8 flex-grow flex flex-col">
					<Offline />
				</div>
			</main>
		</template>
		<template v-else-if="pending">
			<main class="ff-bg-dark flex-grow flex flex-col">
				<div class="w-full mx-auto flex-grow flex flex-col">
					<Loading color="white" />
				</div>
			</main>
		</template>
		<!-- Platform Entry Point -->
		<template v-else-if="isLoggedIn">
			<template v-if="pageLayout === 'platform'">
				<!-- Layout -->
				<ff-layout-platform>
					<!-- Layout View -->
					<router-view />
				</ff-layout-platform>
			</template>
			<template v-else-if="pageLayout === 'modal'">
					<ff-layout-box>
							<router-view />
					</ff-layout-box>
			</template>
			<template v-else-if="pageLayout === 'docs'">
					<ff-layout-docs>
							<router-view />
					</ff-layout-docs>
			</template>
			<template v-else-if="pageLayout === 'plain'">
					<ff-layout-plain>
							<router-view />
					</ff-layout-plain>
			</template>
			<template v-else>
				<router-view />
			</template>
		</template>
		<!-- Password Reset Required -->
		<template v-else-if="user && user.password_expired">
			<PasswordExpired />
		</template>
		<!-- Email Verification Required (Show "Resend") -->
		<template v-else-if="user && user.email_verified === false && !isEmailVerificationPage">
			<UnverifiedEmail />
		</template>
		<!-- Sign up Screen -->
		<template v-else-if="!loginRequired">
			<router-view />
		</template>
		<!-- Log in Screen -->
		<template v-else>
			<Login />
		</template>
	</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Login from "./pages/Login.vue";
import Loading from './components/Loading.vue'
import Offline from './components/Offline.vue'
import PasswordExpired from './pages/PasswordExpired.vue'
import TermsAndConditions from './pages/TermsAndConditions.vue'
import UnverifiedEmail from './pages/UnverifiedEmail.vue'
import FFLayoutPlatform from './layouts/Platform.vue'

export default {
	name: "App",
	components: {
		Login,
		Loading,
    Offline,
		PasswordExpired,
		TermsAndConditions,
    UnverifiedEmail,
		'ff-layout-platform': FFLayoutPlatform,
	},
	computed: {
    ...mapState('account', ['pending', 'user', 'offline', 'settings']),
		...mapState('ux', ['leftDrawer']),
    ...mapGetters('ux', ['hiddenLeftDrawer']),
		loginRequired () {
			return this.$route.meta.requiresLogin !== false
		},
		isLoggedIn () {
			return this.user && !this.user.password_expired && !this.termsAndConditionsRequired && this.user.email_verified !== false
		},
		isEmailVerificationPage () {
			// This is the one page a user with email_verified === false is allowed
			// to access (so that they can get verified)
			return this.$route.name === 'VerifyEmail'
		},
		termsAndConditionsRequired () {
			if (!this.user || !this.settings || !this.settings['user:tcs-required']) {
				return false
			}
			const platformTcsDate = this.settings['user:tcs-date']
			const userTcsDate = this.user.tcs_accepted
			if (!userTcsDate && !platformTcsDate) {
				// assume existing installation, don't ask existing user unless platformTcsDate has been updated
				return false
			}
			if (!userTcsDate && platformTcsDate) {
				// platform has T&C date, user has not - needs to (re) accept
				return true
			}
			return platformTcsDate > userTcsDate
		},
		pageLayout () {
			const layout = this.$route.meta?.layout
			return ['platform', 'modal', 'plain', 'docs'].includes(layout) ? layout : 'platform'
		}
	},
	mounted () {
		this.$store.dispatch('account/checkState')
	}
};
</script>

<style lang="scss">
@import "./stylesheets/common.scss";
</style>
