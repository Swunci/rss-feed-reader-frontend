<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineProps<{
  align?: 'left' | 'right'
}>()

const menuOpen = ref(false)
const menuRef = ref(null)

onClickOutside(menuRef, () => (menuOpen.value = false))

defineExpose({
  close: () => (menuOpen.value = false),
})
</script>

<template>
  <div class="dropdown-wrapper" ref="menuRef">
    <div @click="menuOpen = !menuOpen">
      <slot name="trigger" />
    </div>
    <div v-if="menuOpen" class="dropdown" :style="align === 'left' ? { left: 0 } : { right: 0 }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dropdown-wrapper {
  position: relative;
}

.dropdown {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: calc(100% + 4px);
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 100;
  overflow: hidden;
}
</style>
