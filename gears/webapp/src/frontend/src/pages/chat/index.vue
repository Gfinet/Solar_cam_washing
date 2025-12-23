<template>
	<div class="ff-chat-wrapper">
    <!-- Left Sidebar: channels -->
    <ChatSidebarChannels />

		<!-- Workspace -->
		<div v-if="currentChannel" class="ff-chat-container">
      <ChatHeader />

      <div v-if="messages" class="ff-chat-messages" ref="messagesContainer">
        <ff-loading v-if="loading" message="Loading messages..." color="white" />
        <div v-else v-for="(msg, index) in messages[currentChannel.id]" :key="index">
          <ChatMessage :message="msg"/>
        </div>
      </div>

      <div class="ff-chat-input-wrapper">
				<ChatInput />
			</div>
    </div>

    <!-- Right Sidebar: members -->
    <ChatSidebarMembers/>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import ChatSidebarChannels from './LeftSidebar.vue'
import ChatSidebarMembers from './RightSidebar.vue'
import ChatHeader from './Channel.vue'
import ChatMessage from './Message.vue'
import ChatInput from './TextInput.vue'

export default {
	name: 'Chat',
	components: {
    ChatSidebarChannels,
    ChatSidebarMembers,
		ChatHeader,
		ChatMessage,
		ChatInput,
	},
	computed: {
    ...mapState('chat', ['messages', 'currentChannel', 'loading']),
	},
  methods: {
    scrollToLastMessage() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  },
  watch: {
    currentChannel: 'scrollToLastMessage',
    messages: {
      handler: 'scrollToLastMessage',
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.ff-chat-wrapper {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  background-color: #2c2f33;
  color: white;
  overflow: hidden;

  .ff-chat-container {
    flex: 1;
    display: flex;
    background-color: #36393f;
    flex-direction: column;

    .ff-chat-messages {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      flex-direction: column;
    }

    .ff-chat-input-wrapper {
      position: sticky;
      bottom: 0;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
