<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="actions-bar">
    <span v-if="title" class="actions-bar-title">{{ title }}</span>
    <div v-else class="actions-bar-spacer" />
    <div class="actions-bar-buttons">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.actions-bar {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  height: 2rem;
}
.actions-bar-title {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex: 1;
}
.actions-bar-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions-bar-spacer {
  flex: 1;
}
</style>
