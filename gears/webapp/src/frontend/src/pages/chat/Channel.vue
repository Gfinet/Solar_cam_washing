<template>
  <div class="ff-chat-header">
    <div class="ff-chat-channel-header">
      <h2># {{ currentChannel.name }}</h2>
      <span class="ff-chat-channel-header description">{{ currentChannel.description }}</span>
    </div>
    <div class="ff-chat-channel-header settings-button">
      <UserAddIcon @click="openMemberModal"/>
      <UsersIcon @click="toggleRightSidebar"></UsersIcon>
    </div>
  </div>

  <!-- Members Modal -->
  <ChatModal v-if="showMemberModal" :title="'Inviter des membres à rejoindre le canal'">
    <template #content>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un membre..."
      />
      <ul>
        <li v-for="(m, i) in membersToInvite" :key="i" class="member-item" @click="inviteMember(m)">
          <div class="member-meta">
            <img :src="m.avatar" class="avatar"/>
            <span class="username">{{ m.username }}</span>
          </div>
          <button @click="inviteMember(m)">Invite</button>
        </li>
      </ul>
    </template>
    <template #actions>
      <button @click="closeModal">Close</button>
    </template>
  </ChatModal>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { UserAddIcon, UsersIcon, TrashIcon } from '@heroicons/vue/solid'

import ChatModal from './Modal.vue'

import ChatAPI from '../../api/chat.js'

export default {
	name: 'ChatChannel',
	components: {
    ChatModal,
    TrashIcon,
		UserAddIcon,
    UsersIcon,
	},
  computed: {
		...mapState('chat', ['currentChannel', 'members']),
	},
  data() {
    return {
      editedChannel: null,
      membersToInvite: [],
      showEditModal: false,
      showMemberModal: false,
    }
  },
  methods: {
    ...mapActions('chat', ['toggleRightSidebar', 'loadMembers']),
    openEditModal() {
      this.showEditModal = true;
      this.editedChannel = this.currentChannel;
    },
    async openMemberModal() {
      this.showMemberModal = true;

      if (this.members.length === 0) {
        await this.loadMembers();
      }

      const channelMembers = {};
      this.currentChannel.members.forEach((m) => {
        channelMembers[m.id] = true;
      })

      this.membersToInvite = this.members.filter((m) => !channelMembers[m.id])
      // TODO: filter with input
    },
    async saveChannelSettings() {
      await ChatAPI.updateChannel(this.currentChannel.id, this.editedChannel);
      this.currentChannel.name = this.editedChannel.name;
      this.currentChannel.description = this.editedChannel.description;
      this.showEditModal = false;
    },
    closeModal() {
      this.showEditModal = false;
      this.showMemberModal = false;
    },
    async inviteMember(member) {
      await ChatAPI.inviteMember(this.currentChannel.id, member.id);
      this.membersToInvite.splice(this.membersToInvite.findIndex((m) => m.id === member.id), 1)
    },
  },
}
</script>

<style scoped lang="scss">
.ff-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #202225;
  background-color: #2f3136;

  svg {
    width: 26px;
    height: 26px;
  }
}

.ff-chat-channel-header {
  display: flex;
  flex-direction: column;

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  &.description {
    font-size: 0.9rem;
    color: #aaa;
  }

  &.settings-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;

    svg {
      width: 30px;
      height: 30px;
      transition: color 0.2s ease;
      padding: 2px;
      border-radius: 6px;

      &:hover {
        background: #3a3c43;
        color: #fff;
      }
    }
  }
}
</style>
