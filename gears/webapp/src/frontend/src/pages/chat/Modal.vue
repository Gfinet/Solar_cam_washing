<template>
  <div v-if="visible" class="ff-chat-modal-overlay">
    <div class="ff-chat-modal">
      <h3>{{ title }}</h3>
      <slot name="content"></slot>
      <div class="ff-chat-modal-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatModal',
  data() {
    return {
      visible: true,
    }
  },
  emits: ['close', 'open'],
  props: ['title'],
  methods: {
    open() {
			if (this.visible) return;
      this.visible = true;
			this.$emit('open');
    },
    close() {
      this.visible = false;
			this.$emit('close');
    },
  }
}
</script>

<style lang="scss">
.ff-chat-modal-overlay {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(3px);
}

.ff-chat-modal {
  background: #2b2d31;
  padding: 1.5rem 1.8rem;
  border-radius: 12px;
  width: 420px;
  color: #fff;
  box-shadow: 0 4px 30px rgba(0,0,0,0.5);
  animation: fadeIn 0.25s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    text-align: center;
    color: #fff;
    letter-spacing: 0.3px;
  }

  input,
  textarea {
    width: 100%;
    background: #1e1f22;
    border: 1px solid #1a1b1e;
    border-radius: 6px;
    padding: 0.6rem 0.8rem;
    color: #ddd;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &::placeholder {
      color: #777;
    }

    &:focus {
      border-color: #5865f2;
      background: #25272b;
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 280px;
    overflow-y: auto;
    background: #2a2c30;
    border: 1px solid #1e2024;
    border-radius: 8px;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
  }

  li {
    user-select: none;
		-webkit-user-select: none;
  }

  .member-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    cursor: pointer;

    &:hover {
      background-color: #3a3d42;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 10px;
    }

    .username {
      flex: 1;
      color: #dcddde;
      font-size: 0.95rem;
      font-weight: 500;
    }

    button {
      background-color: #5865f2;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 7px 14px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.1s ease;

      &:hover {
        background-color: #4752c4;
        transform: translateY(-1px);
      }
    }
  }

  .member-meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex: 1;
  }
}

.ff-chat-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 0.5rem;

  button {
    background: #4f545c;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;

    &:hover {
      background: #5e636b;
      transform: translateY(-1px);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
