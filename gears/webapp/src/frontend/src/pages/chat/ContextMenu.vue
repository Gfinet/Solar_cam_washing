<template>
  <div 
    v-if="visible"
    class="context-menu"
    :style="{ top: posY + 'px', left: posX + 'px' }"
		@click.stop="$emit('selected'); close()"
  >
    <slot :close="close"></slot>
  </div>
</template>

<script>
export default {
	name: 'ChatContextMenu',
  data() {
    return {
      visible: false,
      posX: 0,
      posY: 0,
      data: null
    }
  },
	emits: ['close', 'open', 'selected'],
  methods: {
    open(event, data) {
			if (this.visible) return;
      this.visible = true;

      const menuWidth = 200;
      const menuHeight = 160; /* approx — peut être dynamique */

      let x = event.clientX;
      let y = event.clientY;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Ajustement intelligent : éviter les débordements
      if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth - 4;
      }
      if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight - 4;
      }

      this.posX = x;
      this.posY = y;

      this.data = data;

      document.addEventListener("click", this.close);
			this.$emit('open');
    },
    close() {
      this.data = null;
      this.visible = false;
      document.removeEventListener("click", this.close);
			this.$emit('close');
    },
  }
}
</script>

<style>
.context-menu {
  position: fixed;
  background: #2f3136;
  border: 1px solid #1e1f22;
  border-radius: 6px;
  padding: 6px 0;
  width: 200px;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  animation: fadeIn 0.15s ease;
}
.context-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #ddd;
}
.context-item:hover {
  background: #40444b;
}
.context-item.danger {
  color: #ff5b5b;
}
.context-item.danger:hover {
  background: #4a2c2c;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
