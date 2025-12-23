<template>
  <aside v-if="visible" class="ff-chat-sidebar">
    <div class="header-row">
      <h3>{{ title }}</h3>
      <div 
        v-if="hasAppend" 
        :class="appendClass ? appendClass : 'append-wrapper'"
      >
        <slot name="append"></slot>
      </div>
    </div>

    <ul>
      <slot></slot>
    </ul>
  </aside>
</template>

<script>
export default {
	name: 'ChatSidebar',
  emits: ['close', 'open'],
  props: ['title', 'appendClass'],
  data() {
    return {
      visible: false,
    }
  },
  setup (props, { slots }) {
    const hasAppend = !!(slots.append && slots.append().length)

    return {
      hasAppend,
    }
  },
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
.ff-chat-sidebar {
  width: 200px;
  background-color: #23272a;
  padding: 1rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.15s ease;

  &.left {
    border-right: 1px solid #111;
  }
  
  &.right {
    border-left: 1px solid #111;
  }

  .header-row {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 1rem;

    h3 {
      margin: 0;
      flex: 1;
      font-size: 1.2rem;
      color: #99aab5;
    }

    .append-wrapper {
      margin-left: auto;
      display: flex;
      align-items: center;

      svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        display: block;
        cursor: pointer;
      }
    }
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    margin-bottom: 8px;
    border-radius: 6px;
    cursor: pointer;
    color: #ccc;
    user-select: none;
		-webkit-user-select: none;

    &:hover,
    &.active {
      background-color: #5865f2;
      color: white;
    }

    &:hover:not(.active) {
      background-color: #40444b;
    }
  }
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: scale(0.98); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}
</style>
