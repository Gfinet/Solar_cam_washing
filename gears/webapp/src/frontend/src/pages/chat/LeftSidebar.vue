<template>
  <ChatSidebar ref="leftSidebar" class="left" :title="'Channels'">
    <template #append>
      <PlusSmIcon @click="addChannel"></PlusSmIcon>
    </template>
    <li
      v-for="(ch, index) in channels"
      :key="index"
      :class="{ active: ch === currentChannel }"
      @contextmenu.prevent="openMenu($event, ch)"
      @click="selectChannel(ch)"
    >
      <ChatChannelItem :channel="ch"></ChatChannelItem>
    </li>
  </ChatSidebar>

  <ChatContextMenu ref="contextMenu">
    <div class="context-item" @click="editChannel">
      Modifier le canal
    </div>

    <div class="context-item danger" @click="deleteChannel">
      Supprimer le canal
    </div>
  </ChatContextMenu>

  <ChatModal v-if="editedChannel" :title="'Edit the channel'">
    <template #content>
      <label>Nom</label>
      <input v-model="editedChannel.name" />

      <label>Description</label>
      <textarea v-model="editedChannel.description" ></textarea>

      <ff-checkbox :modelValue="editedChannel.type === 'privateThread'" @change="editedChannel.type = $event.target.checked ? 'privateThread' : 'publicThread'">
        Salon privé
      </ff-checkbox>

      <ul>
        <li v-for="(m, i) in editedChannel.members" :key="i" class="member-item">
          <div class="member-meta">
            <img :src="m.avatar" class="avatar"/>
            <span class="username">{{ m.username }}</span>
          </div>
          <button @click="deleteMember(m)">Delete</button>
        </li>
      </ul>
    </template>
    <template #actions>
      <button @click="saveSettings">💾 Enregistrer</button>
      <button @click="closeModal">❌ Annuler</button>
    </template>
  </ChatModal>

  <ChatModal v-if="newChannel" :title="'Add a channel'">
    <template #content>
      <label>Nom</label>
      <input v-model="newChannel.name" />

      <label>Description</label>
      <textarea v-model="newChannel.description" ></textarea>

      <ff-checkbox :modelValue="newChannel.type === 'privateThread'" @change="newChannel.type = $event.target.checked ? 'privateThread' : 'publicThread'">
        Salon privé
      </ff-checkbox>
    </template>
    <template #actions>
      <button @click="closeModal">❌ Annuler</button>
      <button @click="createChannel">💾 Créer</button>
    </template>
  </ChatModal>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import { PlusSmIcon } from '@heroicons/vue/solid'

import ChatChannelItem from './ChannelItem.vue'
import ChatContextMenu from './ContextMenu.vue'
import ChatModal from './Modal.vue'
import ChatSidebar from './Sidebar.vue'

import ChatAPI from '../../api/chat.js'

export default {
	name: 'ChatChannels',
	components: {
    ChatChannelItem,
    ChatContextMenu,
    ChatModal,
    ChatSidebar,
    PlusSmIcon
	},
	computed: {
    ...mapState('chat', ['channels', 'currentChannel', 'messages', 'rightSidebar']),
	},
  data() {
    return {
      editedChannel: null,
      newChannel: null,
    }
  },
  mounted() {
    if (this.channels.length === 0) {
      this.loadChannels();
    }

    this.$refs.leftSidebar.open();
  },
  methods: {
    ...mapActions('chat', ['loadChannels', 'loadChannelMessages', 'setCurrentChannel']),
    async selectChannel(channel) {
      this.setCurrentChannel(channel);
      if (!this.messages || !this.messages[channel.id]) {
        await this.loadChannelMessages(channel.id);
      }
    },
    addChannel() {
      this.newChannel = {};
    },
    createChannel() {
      // TODO
      console.log(this.newChannel)
    },
    deleteChannel() {
      const channel = this.$refs.contextMenu.data;
      if (channel) {
        console.log(channel)
      }
    },
    editChannel() {
      const channel = this.$refs.contextMenu.data;
      if (channel) {
        this.editedChannel = channel;
      }
    },
    saveSettings() {
      console.log(this.editedChannel)
    },
    async deleteMember(member) {
      await ChatAPI.deleteMember(this.currentChannel.id, member.id);
    },
    closeModal() {
      this.editedChannel = null;
      this.newChannel = null;
    },
    openMenu(event, channel) {
      this.$refs.contextMenu.open(event, channel);
    },
  },
}
</script>
