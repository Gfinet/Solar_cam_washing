<template>
  <ChatSidebar ref="rightSidebar" class="right" :title="'Members'">
    <li
      v-for="(m, i) in currentChannel?.members || []"
      :key="i"
      class="member-item"
      :class="{ active: m === selectedMember }"
      @contextmenu.prevent="openMenu($event, m)"
      @click="showProfile(m)"
    >
      <img :src="m.avatar" class="avatar"/>
      {{ m.username }}
    </li>
  </ChatSidebar>

  <ChatModal v-if="showMemberProfile && selectedMember" :title="selectedMember.username">
    <template #content>
      <!-- TODO -->
        <p>TODO Bitches</p>
    </template>
    <template #actions>
      <button @click="closeProfile">Fermer</button>
    </template>
  </ChatModal>

  <ChatContextMenu ref="contextMenu" @close="close" @selected="close">
    <div class="context-item" @click="showProfile(selectedMember)">
      Profil
    </div>

    <div class="context-item" @click="dm">
      Envoyer un message
    </div>

    <div class="context-item" @click="friend">
      Ajouter
    </div>

    <div class="context-item" @click="unfriend">
      Retirer
    </div>

    <div class="context-item danger" @click="block">
      Bloquer {{ selectedMember?.username }}
    </div>

    <div class="context-item danger" @click="kick">
      Expulser {{ selectedMember?.username }}
    </div>
  </ChatContextMenu>
</template>

<script>
import { mapState, mapActions } from 'vuex'

import ChatContextMenu from './ContextMenu.vue'
import ChatModal from './Modal.vue'
import ChatSidebar from './Sidebar.vue'

export default {
	name: 'ChatMembers',
	components: {
    ChatContextMenu,
    ChatModal,
    ChatSidebar,
	},
	computed: {
    ...mapState('chat', ['channels', 'currentChannel', 'rightSidebar']),
	},
  data() {
    return {
      selectedMember: null,
      showMemberProfile: false,
    }
  },
  methods: {
    ...mapActions('chat', ['closeRightSidebar', 'openRightSidebar']),
    close() {
      // To avoid clear selectedMember while open the profile
      // TODO: can be avoid
      if (this.showMemberProfile) return;
      this.selectedMember = null;
    },
    closeProfile() {
      this.showMemberProfile = false;
      this.selectedMember = null;
    },
    openMenu(event, member) {
      this.selectedMember = member;
      this.$refs.contextMenu.open(event);
    },
    showProfile(member) {
      this.selectedMember = member;
      this.showMemberProfile = true;
    },
    dm() {
    },
    friend() {
    },
    unfriend() {
    },
    block() {
    },
    kick() {
    },
  },
  watch: {
    currentChannel: {
      handler(channel) {
        if (channel) {
          this.openRightSidebar();
        } else {
          this.closeRightSidebar();
        }
      }
    },
    "rightSidebar.state": {
      handler(state) {
        if (state) {
          this.$refs.rightSidebar.open();
        } else {
          this.$refs.rightSidebar.close();
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ff-chat-sidebar {
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 0.5rem;
  }
}
</style>
