<template>
    <ff-loading v-if="loading" message="Loading Active Sessions" />
    <SectionTopMenu hero="Active Sessions" help-header="Active Sessions" info="A list of active login sessions." />
    <ff-data-table
        data-el="sessions-table"
        :rows="tokens" :columns="columns" :show-search="true" search-placeholder="Search Sessions..."
        :show-load-more="false"
    >
        <template #actions>
            <ff-button data-action="delete-all" @click="deleteAllSessions()">
                <template #icon-left>
                    <TrashIcon />
                </template>
                Delete All Sessions
            </ff-button>
        </template>
        <template #context-menu="{row}">
            <ff-list-item data-action="delete-session" label="Delete" @click="deleteSession(row)" />
        </template>
        <template v-if="sessions.length === 0" #table>
            <div class="ff-no-data ff-no-data-large">
                You don't have any sessions yet
            </div>
        </template>
    </ff-data-table>
</template>

<script>
import { TrashIcon } from '@heroicons/vue/outline'
import { markRaw } from 'vue'

import userApi from '../../../api/user.js'

import SectionTopMenu from '../../../components/SectionTopMenu.vue'
import ExpiryCell from '../components/ExpiryCell.vue'

export default {
    name: 'AccountSecuritySessions',
    components: {
        SectionTopMenu,
        TrashIcon
    },
    data () {
        return {
            loading: false,
            sessions: [],
            columns: [
                { label: 'Name', key: 'name', sortable: true },
                // { label: 'Scope', key: 'scope' },
                {
                    label: 'Expires',
                    key: 'expiresAt',
                    component: {
                        is: markRaw(ExpiryCell)
                    }
                }
            ]
        }
    },
    mounted () {
        //this.fetchData()
    },
    methods: {
        fetchData: async function () {
            this.loading = true
            const response = await userApi.getSessions()
            this.tokens = response.sessions
            this.loading = false
        },
        deleteSession: async function (row) {
            await userApi.deleteSession(row.id)
            this.fetchData()
        },
        deleteAllSessions: async function () {
            await userApi.deleteAllSessions()
            this.fetchData()
        }
    }
}
</script>
