<template>
  <div class="ff-chat-message">
		<div class="ff-chat-message-meta">
			<img :src="message.author.avatar" class="ff-chat-message-avatar"/>
			<span class="ff-chat-message-author">{{ message.author.username }}</span>
			<span class="ff-chat-message-timestamp">{{ formatDate(message.editedAt || message.createdAt) }}</span>
			<ExclamationCircleIcon v-if="message.error" v-ff-tooltip="message.error"/>
			<span class="ff-chat-message-edited" v-if="message.editedAt"> (edited)</span>
		</div>

		<div class="ff-chat-message-text">
			<template v-if="editing">
				<input
					ref="editInput"
					v-model="editing"
					@keyup.enter="saveEdit"
					@keyup.esc="cancelEdit"
					@blur="cancelEdit"
					class="edit-input"
					type="text"
				/>
			</template>
			<template v-else>
				{{ message.content }}
			</template>
		</div>

		<div class="ff-chat-message-actions">
			<span v-if="user.id === message.author.id" class="action-icon edit" @click="editMessage"><PencilIcon/></span>
			<span v-if="user.id === message.author.id" class="action-icon delete" @click="deleteMessage"><TrashIcon/></span>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { ExclamationCircleIcon, PencilIcon, TrashIcon } from '@heroicons/vue/solid'

import ChatAPI from '../../api/chat.js'

export default {
	name: 'ChatMessage',
	props: ['message'],
	components: {
		ExclamationCircleIcon,
		PencilIcon,
		TrashIcon,
	},
	computed: {
		...mapState('account', ['user']),
		...mapState('chat', ['messages', 'currentChannel']),
	},
	data() {
    return {
			editing: ""
		}
	},
	methods: {
		cancelEdit() {
      this.editing = null;
    },
		async deleteMessage() {
      try {
        await ChatAPI.deleteMessage(this.currentChannel.id, this.message.id);
        const message = this.messages[this.currentChannel.id].find((m) => m.id === this.message.id);
        this.messages[this.currentChannel.id].splice(this.messages[this.currentChannel.id].indexOf(message), 1);
      } catch (error) {
        this.message.error = error.toString();
      }
    },
		async editMessage() {
      this.editing = this.message.content;
      await this.$nextTick();
      this.$refs["editInput"].focus();
    },
    async saveEdit() {
      const newContent = this.editing.trim();
      if (this.message.content === newContent) return;

			this.message.editedAt = Date.now();
      this.message.content = newContent;
      this.editing = "";

      try {
        await ChatAPI.editMessage(this.currentChannel.id, this.message);
      } catch (error) {
        this.message.error = error.toString();
      }
    },
		formatDate(date) {
      const d = new Date(date);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    },
	}
}
</script>

<style scoped>
.ff-chat-message {
	position: relative;
	margin-bottom: 1rem;
	padding: 8px;
	border-radius: 6px;
	transition: background-color 0.2s ease;
}
.ff-chat-message:hover {
	background-color: #3a3d42;
}
.ff-chat-message .ff-chat-message-avatar {
	width: 16px;
	height: 16px;
	border-radius: 50%;
  object-fit: cover;
  margin-right: 0.5rem;
}

.ff-chat-message-actions {
	position: absolute;
	top: 4px;
	right: 4px;
	display: flex;
	gap: 6px;
	opacity: 0;
	transition: opacity 0.2s ease;
}

.ff-chat-message:hover .ff-chat-message-actions {
	opacity: 1;
}

.ff-chat-message:has(.edit-input) .ff-chat-message-actions {
	opacity: 0;
}

.ff-chat-message-actions .action-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	background-color: #2f3136;
	border-radius: 4px;
	color: #ccc;
	font-size: 1rem;
	cursor: pointer;
	transition: background-color 0.2s ease, color 0.2s ease;
}

.ff-chat-message-actions .action-icon:hover {
	background-color: #4f545c;
	color: white;
}

.ff-chat-message-actions .action-icon.delete:hover {
	color: red;
}

.ff-chat-message-actions .action-icon svg {
	width: 16px;
	height: 16px;
}

.ff-chat-message-meta {
	display: flex;
	align-items: center;
	font-size: 0.8rem;
	color: #b9bbbe;
	margin-bottom: 2px;
}
.ff-chat-message-meta svg {
	width: 16px;
	height: 16px;
	color: red;
}

.ff-chat-message-author {
	font-weight: bold;
	margin-right: 8px;
	color: #fff;
}

.ff-chat-message-timestamp {
	font-style: italic;
	color: #999;
	margin-right: 8px;
}

.ff-chat-message-edited {
	font-style: italic;
	color: #999;
	margin-right: 8px;
}

.ff-chat-message-text {
	font-size: 0.95rem;
}

.ff-chat-message-text .edit-input {
	width: 100%;
	padding: 6px 8px;
	border-radius: 4px;
	background-color: #40444b;
	border: 1px solid #666;
	color: white;
	font-size: 0.95rem;
}
</style>
