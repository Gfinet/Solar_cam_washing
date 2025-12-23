<template>
	<form class="ff-chat-input" @submit.prevent="sendMessage">
		<div class="input-row">
			<input v-model="newMessage" type="text" placeholder="Envoyer un message..." @input="handleTyping" />
			<button type="submit">Envoyer</button>
		</div>
		<div class="ff-chat-typing-indicator" :style="{ opacity: Object.keys(typingUsers).length > 0 ? 1 : 0 }">
			<span v-for="(user, i) in Object.values(typingUsers)" :key="i">
				{{ user.username }}
				<span v-if="i === Object.keys(typingUsers).length - 1">
					is typing<span class="ff-chat-typing-dots"><span>.</span><span>.</span><span>.</span></span>
				</span>
				<span v-else>, </span>
			</span>
		</div>
	</form>
</template>


<script>
import { mapState } from 'vuex'

import ChatAPI from '../../api/chat.js'

export default {
	name: 'ChatInput',
	components: {},
	computed: {
		...mapState('account', ['socket', 'user']),
		...mapState('chat', ['messages', 'currentChannel']),
	},
	data() {
		return {
			newMessage: '',
			timers: {},
			typingUsers: []
		}
	},
	mounted() {
		this.socket.on('typing', (o) => {
      if (this.currentChannel.id !== o.channelId) return;
      if (this.user?.id === o.member.id) return;

			const member = o.member

			if (this.timers[member.id]) return;

      this.typingUsers[member.id] = member;

      this.timers[member.id] = setTimeout(() => {
        delete this.typingUsers[member.id];
				delete this.timers[member.id];
      }, 10000);
    })
	},
	methods: {
		async sendMessage() {
      const text = this.newMessage.trim();
      if (!text) return;

      if (!this.messages[this.currentChannel.id]) {
        this.messages[this.currentChannel.id] = []
      }

      try {
        const message = await ChatAPI.postMessage(text, this.currentChannel.id);
        this.messages[this.currentChannel.id].push(message);
      } catch (error) {
        this.messages[this.currentChannel.id].push({
          author: this.user,
          content: text,
          createdAt: new Date(),
          error: error.toString()
        });
      }

      this.newMessage = '';
    },
		async handleTyping() {
      if (!this.timers.me) {
        await ChatAPI.startTyping(this.currentChannel.id);
				this.timers.me = setTimeout(() => {
					delete this.timers.me;
				}, 10000);
      }
    },
	},
}
</script>

<style scoped>
.ff-chat-input {
  display: flex;
  padding: 1rem 1rem 0rem 1rem;
  border-top: 1px solid #202225;
  background-color: #2f3136;
  flex-direction: column;
}
.ff-chat-input .input-row {
  display: flex;
  align-items: flex-start;
}
.ff-chat-input input {
	height: 100%;
	width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: #40444b;
  color: white;
}
.ff-chat-input input::placeholder {
  color: #aaa;
}
.ff-chat-input button {
  margin-left: 10px;
  padding: 10px 16px;
  background-color: #5865f2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.ff-chat-input button:hover {
  background-color: #4752c4;
}

.ff-chat-typing-indicator {
  height: 1.5rem;
  font-size: 0.85rem;
  color: #aaa;
  font-style: italic;
  padding-left: 4px;
  transition: opacity 0.2s ease;
  overflow: hidden;
}
.ff-chat-typing-dots {
  display: inline-block;
  margin-left: 2px;
}
.ff-chat-typing-dots span {
  animation: blink 1.5s infinite;
  opacity: 0;
}
.ff-chat-typing-dots span:nth-child(1) { animation-delay: 0s; }
.ff-chat-typing-dots span:nth-child(2) { animation-delay: 0.3s; }
.ff-chat-typing-dots span:nth-child(3) { animation-delay: 0.6s; }

@keyframes blink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
</style>
