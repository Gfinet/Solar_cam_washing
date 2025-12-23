<template>
    <div class="flex flex-col sm:flex-row">
        <SectionSideMenu :options="sideNavigation" />
        <div class="flex-grow">
            <router-view />
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import SectionSideMenu from '../../components/SectionSideMenu.vue'

export default {
    name: 'AccountSecurity',
    components: {
        SectionSideMenu
    },
    computed: {
        //...mapState('account', ['user']),
        sideNavigation () {
            const navigation = [
                { name: 'Password', path: '/account/security/password' },
                { name: 'Two-Factor Authentication', path: '/account/security/mfa' },
                { name: 'Tokens', path: '/account/security/tokens' },
                { name: "Sessions", path: "/account/security/sessions" }
            ]

            return navigation
        }
    }
}
</script>
